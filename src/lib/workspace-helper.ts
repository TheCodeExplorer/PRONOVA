import prisma from "@/lib/prisma";
import { Role, InvitationStatus } from "@prisma/client";

export interface UserDetails {
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
}

/**
 * Ensures a user is mapped to an active workspace idempotently.
 * 1. Checks if the user is already an active member of any workspace.
 * 2. If not, checks if there is any pending invitation for their email address.
 *    If an invitation is found, creates the Member record and marks the invitation ACCEPTED.
 * 3. If neither, creates a new default workspace and assigns the user as ADMIN.
 */
export async function getOrCreateActiveWorkspace(
  userId: string,
  userDetails?: UserDetails
) {
  if (!userId) {
    throw new Error("userId is required to resolve active workspace.");
  }

  const email = userDetails?.email?.trim().toLowerCase();
  const name = userDetails?.name?.trim() || "My";
  const avatar = userDetails?.avatar || null;

  // 1. Check if user already belongs to a workspace
  const existingMembership = await prisma.member.findFirst({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingMembership) {
    // Optionally update cached profile details if available
    if (
      (email && existingMembership.email !== email) ||
      (name && existingMembership.name !== name) ||
      (avatar && existingMembership.avatar !== avatar)
    ) {
      await prisma.member.update({
        where: { id: existingMembership.id },
        data: {
          email: email || existingMembership.email,
          name: name || existingMembership.name,
          avatar: avatar || existingMembership.avatar,
        },
      });
    }

    return {
      workspace: existingMembership.workspace,
      membership: existingMembership,
      isNew: false,
    };
  }

  // 2. Check if user has a pending invitation matching their email
  if (email) {
    const pendingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: InvitationStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        workspace: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (pendingInvitation) {
      // Create Member record and mark invitation ACCEPTED in a transaction
      const [newMember] = await prisma.$transaction([
        prisma.member.create({
          data: {
            userId,
            workspaceId: pendingInvitation.workspaceId,
            role: pendingInvitation.role,
            email,
            name: name || email.split("@")[0],
            avatar,
          },
        }),
        prisma.invitation.update({
          where: { id: pendingInvitation.id },
          data: {
            status: InvitationStatus.ACCEPTED,
            acceptedAt: new Date(),
          },
        }),
      ]);

      return {
        workspace: pendingInvitation.workspace,
        membership: newMember,
        isNew: false,
      };
    }
  }

  // 3. First time user without invitation: Create default personal workspace
  const uniqueSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const workspaceSlug = `ws-${uniqueSuffix}`;
  const workspaceName = name !== "My" ? `${name}'s Workspace` : "My Workspace";

  const newWorkspace = await prisma.workspace.create({
    data: {
      name: workspaceName,
      slug: workspaceSlug,
      members: {
        create: {
          userId,
          role: Role.ADMIN,
          name: name !== "My" ? name : "Admin",
          email: email || null,
          avatar,
        },
      },
    },
    include: {
      members: true,
    },
  });

  return {
    workspace: newWorkspace,
    membership: newWorkspace.members[0],
    isNew: true,
  };
}

/**
 * Retrieves all workspaces the given user is a member of.
 */
export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Retrieves member info for a user in a specific workspace.
 */
export async function getWorkspaceMember(userId: string, workspaceId: string) {
  return prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });
}
