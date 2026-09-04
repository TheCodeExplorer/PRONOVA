import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getOrCreateActiveWorkspace } from "@/lib/workspace-helper";
import { Role, InvitationStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to invite team members." },
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

    // 2. Resolve active workspace and verify membership
    const { workspace, membership } = await getOrCreateActiveWorkspace(userId, {
      email: primaryEmail,
      name: fullName,
      avatar,
    });

    // 3. Permission check: Only ADMIN can invite members
    if (membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden. Only workspace admins can invite new members." },
        { status: 403 }
      );
    }

    // 4. Parse and validate request body
    const { name, email, role } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, and role are required." },
        { status: 400 }
      );
    }

    const targetRole = role === "ADMIN" ? Role.ADMIN : Role.MEMBER;

    // 5. Check if user is already an active member of this workspace
    const existingMember = await prisma.member.findFirst({
      where: {
        workspaceId: workspace.id,
        email: normalizedEmail,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          error: `A member with email "${normalizedEmail}" is already an active member of this workspace.`,
        },
        { status: 400 }
      );
    }

    // 6. Generate secure invitation token and 7-day expiration
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 7. Resolve dynamic base URL for the invitation acceptance link
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;
    const inviteUrl = `${origin}/invite/accept?token=${token}`;

    // 8. Email HTML Template
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px; font-weight: 800; color: #4f46e5; letter-spacing: -0.05em;">PRONOVA</span>
        </div>
        
        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px; text-align: center;">Workspace Invitation</h2>
        
        <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
          Hello <strong>${name}</strong>,
        </p>
        
        <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
          <strong>${fullName}</strong> has invited you to join the <strong>${workspace.name}</strong> workspace as a <strong>${targetRole}</strong>.
        </p>
        
        <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 32px;">
          Collaborate on projects, track checklists, plan task priorities, and set customized personal reminders with your team.
        </p>
        
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${inviteUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; transition: background-color 0.2s;">
            Accept Workspace Invite
          </a>
        </div>
        
        <p style="font-size: 12px; color: #6b7280; text-align: center; line-height: 1.5; margin-bottom: 24px;">
          Or copy and paste this link in your browser:<br />
          <a href="${inviteUrl}" style="color: #4f46e5; word-break: break-all;">${inviteUrl}</a>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5; margin: 0;">
          This invitation will expire in 7 days.<br />
          If you did not expect this invitation, you can safely ignore this email.<br />
          &copy; 2026 PRONOVA Workspace. All rights reserved.
        </p>
      </div>
    `;

    // 9. Gmail SMTP / Nodemailer Email Provider configuration
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER;
    const rawPassword = process.env.SMTP_PASSWORD;

    if (!smtpUser || !rawPassword) {
      console.error("[Invite Email Error]: SMTP_USER or SMTP_PASSWORD is not configured.");
      return NextResponse.json(
        { 
          success: false, 
          error: "Gmail SMTP credentials (SMTP_USER or SMTP_PASSWORD) are not configured." 
        }, 
        { status: 500 }
      );
    }

    const cleanPassword = rawPassword.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: cleanPassword,
      },
    });

    const mailOptions = {
      from: `"${workspace.name} via PRONOVA" <${smtpUser}>`,
      to: normalizedEmail,
      subject: `You've been invited to join ${workspace.name} on PRONOVA!`,
      html: emailHtml,
    };

    // 10. Attempt sending email FIRST
    // If SMTP fails, do NOT record an invitation in the database
    const info = await transporter.sendMail(mailOptions);
    console.log("[SMTP Success] Invitation email sent to", normalizedEmail, "MessageId:", info.messageId);

    // 11. Now persist the Invitation in Neon
    // Check if there was an existing PENDING invitation for this email in this workspace
    const existingPending = await prisma.invitation.findFirst({
      where: {
        workspaceId: workspace.id,
        email: normalizedEmail,
        status: InvitationStatus.PENDING,
      },
    });

    let invitationRecord;
    if (existingPending) {
      invitationRecord = await prisma.invitation.update({
        where: { id: existingPending.id },
        data: {
          token,
          role: targetRole,
          expiresAt,
          invitedById: userId,
          status: InvitationStatus.PENDING,
        },
      });
    } else {
      invitationRecord = await prisma.invitation.create({
        data: {
          workspaceId: workspace.id,
          email: normalizedEmail,
          role: targetRole,
          token,
          status: InvitationStatus.PENDING,
          invitedById: userId,
          expiresAt,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        messageId: info.messageId,
        invitationId: invitationRecord.id,
        token: invitationRecord.token,
      }, 
      provider: "smtp",
      message: "Invitation email dispatched successfully via Gmail SMTP." 
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Invite Email API Error]:", errorMsg);
    return NextResponse.json(
      { 
        success: false, 
        error: errorMsg || "An unexpected error occurred while sending the email via Gmail SMTP." 
      }, 
      { status: 400 }
    );
  }
}
