import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { InvitationStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, reason: "MISSING_TOKEN", error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { valid: false, reason: "NOT_FOUND", error: "Invitation not found or link is invalid." },
        { status: 404 }
      );
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      return NextResponse.json(
        {
          valid: false,
          reason: "ALREADY_ACCEPTED",
          error: "This invitation has already been accepted.",
          workspaceName: invitation.workspace.name,
        },
        { status: 410 }
      );
    }

    if (invitation.status === InvitationStatus.REVOKED) {
      return NextResponse.json(
        {
          valid: false,
          reason: "REVOKED",
          error: "This invitation was revoked by the workspace administrator.",
          workspaceName: invitation.workspace.name,
        },
        { status: 410 }
      );
    }

    const isExpired =
      invitation.status === InvitationStatus.EXPIRED ||
      invitation.expiresAt < new Date();

    if (isExpired) {
      // Mark as expired in DB if still pending
      if (invitation.status === InvitationStatus.PENDING) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });
      }

      return NextResponse.json(
        {
          valid: false,
          reason: "EXPIRED",
          error: "This invitation has expired. Please ask the team admin to invite you again.",
          workspaceName: invitation.workspace.name,
        },
        { status: 410 }
      );
    }

    // Invitation is valid and pending
    return NextResponse.json({
      valid: true,
      data: {
        id: invitation.id,
        workspaceId: invitation.workspace.id,
        workspaceName: invitation.workspace.name,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { valid: false, reason: "SERVER_ERROR", error: errorMsg },
      { status: 500 }
    );
  }
}
