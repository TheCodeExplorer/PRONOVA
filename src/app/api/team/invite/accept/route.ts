import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { InvitationStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHENTICATED",
          message: "You must be signed in to accept this invitation.",
        },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: "UNAUTHENTICATED", message: "User profile not found." },
        { status: 401 }
      );
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "MISSING_TOKEN", message: "Invitation token is required." },
        { status: 400 }
      );
    }

    // 2. Fetch invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: "Invitation not found or invalid." },
        { status: 404 }
      );
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_ACCEPTED",
          message: "This invitation has already been accepted.",
          workspaceId: invitation.workspaceId,
        },
        { status: 400 }
      );
    }

    if (invitation.status === InvitationStatus.REVOKED) {
      return NextResponse.json(
        {
          success: false,
          error: "REVOKED",
          message: "This invitation was revoked by the workspace administrator.",
        },
        { status: 403 }
      );
    }

    if (invitation.status === InvitationStatus.EXPIRED || invitation.expiresAt < new Date()) {
      if (invitation.status === InvitationStatus.PENDING) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });
      }
      return NextResponse.json(
        { success: false, error: "EXPIRED", message: "This invitation has expired." },
        { status: 410 }
      );
    }

    // 3. Email validation / Account mismatch check
    const userEmails = clerkUser.emailAddresses.map((e) => e.emailAddress.trim().toLowerCase());
    const invitedEmail = invitation.email.trim().toLowerCase();
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || userEmails[0] || "";

    if (!userEmails.includes(invitedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "ACCOUNT_MISMATCH",
          invitedEmail: invitation.email,
          signedInEmail: primaryEmail,
          message: `This invitation was sent to ${invitation.email}, but you are signed in as ${primaryEmail}. Please switch accounts to accept.`,
        },
        { status: 403 }
      );
    }

    // 4. Atomic database transaction: Join workspace + Mark accepted
    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      invitedEmail.split("@")[0];
    const avatar = clerkUser.imageUrl || null;

    const result = await prisma.$transaction(async (tx) => {
      // Check if user is already a member of this workspace
      let existingMember = await tx.member.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: invitation.workspaceId,
          },
        },
      });

      if (!existingMember) {
        existingMember = await tx.member.create({
          data: {
            userId,
            workspaceId: invitation.workspaceId,
            role: invitation.role,
            name: fullName,
            email: invitedEmail,
            avatar,
          },
        });
      } else {
        // Upgrade role if invitation has higher or specified role
        existingMember = await tx.member.update({
          where: { id: existingMember.id },
          data: {
            role: invitation.role,
            name: fullName,
            email: invitedEmail,
            avatar: avatar || existingMember.avatar,
          },
        });
      }

      // Mark invitation as ACCEPTED
      const updatedInvitation = await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      return {
        member: existingMember,
        invitation: updatedInvitation,
        workspaceName: invitation.workspace.name,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        workspaceId: invitation.workspaceId,
        workspaceName: result.workspaceName,
        memberId: result.member.id,
        role: result.member.role,
      },
      message: `Successfully joined ${result.workspaceName}!`,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Invite Accept Error]:", errorMsg);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: errorMsg },
      { status: 500 }
    );
  }
}
