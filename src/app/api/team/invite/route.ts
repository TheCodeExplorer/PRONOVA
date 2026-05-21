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

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Elegant, silent simulation fallback for development without API keys
      console.log(`\n======================================================`);
      console.log(`[MOCK EMAIL SENT BY KAMOZ]`);
      console.log(`To: ${name} (${email})`);
      console.log(`Role: ${role}`);
      console.log(`Subject: You've been invited to join Kamoz!`);
      console.log(`Status: Success (No RESEND_API_KEY provided)`);
      console.log(`======================================================\n`);
      
      return NextResponse.json({
        success: true,
        message: "Mock email sent successfully (development fallback). Set RESEND_API_KEY in your .env.local to send real emails!",
        isMock: true,
      });
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "Kamoz Workspace <onboarding@resend.dev>",
      to: email,
      subject: `You've been invited to join Kamoz!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 28px; font-weight: 800; color: #4f46e5; letter-spacing: -0.05em;">Kamoz</span>
          </div>
          
          <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px; text-align: center;">Workspace Invitation</h2>
          
          <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
            Hello <strong>${name}</strong>,
          </p>
          
          <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
            You have been invited to join the <strong>Kamoz</strong> project management workspace as a <strong>${role}</strong>.
          </p>
          
          <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 32px;">
            Collaborate on projects, track checklists, plan task priorities, and set customized personal reminders with your team.
          </p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="http://localhost:3000" style="background-color: #4f46e5; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; transition: background-color 0.2s;">
              Accept Workspace Invite
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5; margin: 0;">
            If you did not expect this invitation, you can safely ignore this email.<br />
            &copy; 2026 Kamoz Workspace. All rights reserved.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return NextResponse.json({ success: false, error: error.message || error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[Invite Email API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
