import { NextResponse } from "next/server";
import { Resend } from "resend";

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

    // Resend Email Provider
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[Invite Email Error]: RESEND_API_KEY is missing from environment variables.");
      return NextResponse.json(
        { 
          success: false, 
          error: "RESEND_API_KEY is not configured in your environment variables (.env.local or Vercel)." 
        }, 
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: "PRONOVA Workspace <onboarding@resend.dev>",
      to: email,
      subject: `You've been invited to join PRONOVA!`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      const errorMsg = typeof error === "string" ? error : (error as any).message || JSON.stringify(error);
      return NextResponse.json(
        { 
          success: false, 
          error: errorMsg,
          provider: "resend" 
        }, 
        { status: 400 }
      );
    }

    console.log("[Resend Success] Email sent successfully:", data?.id);
    return NextResponse.json({ 
      success: true, 
      data, 
      provider: "resend",
      message: "Invitation email dispatched successfully via Resend." 
    });

  } catch (error: any) {
    console.error("[Invite Email API Error]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "An unexpected server error occurred while sending the email." 
      }, 
      { status: 500 }
    );
  }
}
