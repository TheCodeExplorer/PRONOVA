import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { name, email, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, and role are required." },
        { status: 400 }
      );
    }

    // Dynamically resolve base URL for the invitation link so it works on both localhost and deployed domains
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;

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
          You have been invited to join the <strong>PRONOVA</strong> project management workspace as a <strong>${role}</strong>.
        </p>
        
        <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 32px;">
          Collaborate on projects, track checklists, plan task priorities, and set customized personal reminders with your team.
        </p>
        
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${origin}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; transition: background-color 0.2s;">
            Accept Workspace Invite
          </a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5; margin: 0;">
          If you did not expect this invitation, you can safely ignore this email.<br />
          &copy; 2026 PRONOVA Workspace. All rights reserved.
        </p>
      </div>
    `;

    // Gmail SMTP / Nodemailer Email Provider
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

    // Safely remove any whitespace from Google App Password (e.g. "xxxx xxxx xxxx xxxx" -> "xxxxxxxxxxxxxxxx")
    const cleanPassword = rawPassword.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // SSL for port 465
      auth: {
        user: smtpUser,
        pass: cleanPassword,
      },
    });

    const mailOptions = {
      from: `"PRONOVA Workspace" <${smtpUser}>`,
      to: email,
      subject: `You've been invited to join PRONOVA!`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[SMTP Success] Invitation email sent successfully to", email, "MessageId:", info.messageId);

    return NextResponse.json({ 
      success: true, 
      data: { messageId: info.messageId }, 
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
