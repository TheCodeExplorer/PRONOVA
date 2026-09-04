import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateActiveWorkspace } from "@/lib/workspace-helper";
import { Role, InvitationStatus } from "@prisma/client";

/**
 * GET: Fetches all active members and pending invitations for the user's active workspace.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress;
    const fullName =
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
      clerkUser?.username ||
      "Admin";
    const avatar = clerkUser?.imageUrl;

    const { workspace, membership } = await getOrCreateActiveWorkspace(userId, {
      email: primaryEmail,
      name: fullName,
      avatar,
    });

    // Fetch active members
    const dbMembers = await prisma.member.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "asc" },
    });

    // Fetch valid pending invitations
    const dbInvitations = await prisma.invitation.findMany({
      where: {
        workspaceId: workspace.id,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format active members
    const activeMembers = dbMembers.map((m) => {
      const displayName = m.name || m.email?.split("@")[0] || "Team Member";
      const initials = displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        id: m.id,
        name: displayName,
        email: m.email || "",
        role: m.role,
        status: "Active" as const,
        joinedDate: m.createdAt.toISOString().split("T")[0],
        avatar: initials || "U",
        userId: m.userId,
        isCurrentUser: m.userId === userId,
      };
    });

    // Format pending invitations
    const pendingMembers = dbInvitations.map((inv) => {
      const prefix = inv.email.split("@")[0];
      const initials = prefix.charAt(0).toUpperCase();

      return {
        id: `inv-${inv.id}`,
        name: prefix,
        email: inv.email,
        role: inv.role,
        status: "Pending" as const,
        joinedDate: inv.createdAt.toISOString().split("T")[0],
        avatar: initials || "I",
        invitationId: inv.id,
        isCurrentUser: false,
      };
    });

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      currentUserRole: membership.role,
      members: [...activeMembers, ...pendingMembers],
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[GET /api/team/members error]:", errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Updates a member's role or a pending invitation's role.
 */
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { workspace, membership } = await getOrCreateActiveWorkspace(userId);
    if (membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Only admins can change roles." },
        { status: 403 }
      );
    }

    const { id, role } = await request.json();
    if (!id || !role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid parameters." }, { status: 400 });
    }

    const targetRole = role === "ADMIN" ? Role.ADMIN : Role.MEMBER;

    if (id.startsWith("inv-")) {
      const invId = id.replace("inv-", "");
      await prisma.invitation.update({
        where: { id: invId, workspaceId: workspace.id },
        data: { role: targetRole },
      });
    } else {
      await prisma.member.update({
        where: { id, workspaceId: workspace.id },
        data: { role: targetRole },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * DELETE: Removes a member or revokes a pending invitation.
 */
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { workspace, membership } = await getOrCreateActiveWorkspace(userId);
    if (membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Only admins can remove members or revoke invites." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Member ID is required." }, { status: 400 });
    }

    if (id.startsWith("inv-")) {
      const invId = id.replace("inv-", "");
      await prisma.invitation.update({
        where: { id: invId, workspaceId: workspace.id },
        data: { status: InvitationStatus.REVOKED },
      });
    } else {
      // Check if target is last admin
      const targetMember = await prisma.member.findUnique({
        where: { id, workspaceId: workspace.id },
      });

      if (targetMember?.role === Role.ADMIN) {
        const adminCount = await prisma.member.count({
          where: { workspaceId: workspace.id, role: Role.ADMIN },
        });
        if (adminCount <= 1) {
          return NextResponse.json(
            { success: false, error: "Cannot remove the only admin of the workspace." },
            { status: 400 }
          );
        }
      }

      await prisma.member.delete({
        where: { id, workspaceId: workspace.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
