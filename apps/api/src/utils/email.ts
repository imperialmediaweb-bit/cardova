import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Resend uses a simple HTTP API
let resendClient: { send: (opts: { from: string; to: string; subject: string; html: string }) => Promise<void> } | null = null;

if (env.RESEND_API_KEY) {
  resendClient = {
    async send(opts: { from: string; to: string; subject: string; html: string }) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify(opts),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Resend error: ${res.status} ${body}`);
      }
    },
  };
  console.log('✅ Email: Using Resend');
}

const smtpTransporter =
  !resendClient && env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    : null;

if (smtpTransporter) {
  console.log('✅ Email: Using SMTP');
}

if (!resendClient && !smtpTransporter) {
  console.warn('⚠️  Email not configured — emails will be logged to console');
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (resendClient) {
    await resendClient.send({ from: env.EMAIL_FROM, to, subject, html });
  } else if (smtpTransporter) {
    await smtpTransporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  } else {
    console.log(`📧 [EMAIL] To: ${to} | Subject: ${subject}`);
  }
}

function emailTemplate(title: string, body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 12px; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">C</div>
        </div>
        <h1 style="font-size: 22px; color: #111; margin: 0 0 8px; text-align: center;">${title}</h1>
        ${body}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">Cardova — Your digital business card</p>
      </div>
    </body>
    </html>
  `;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    'Verify your Cardova email',
    emailTemplate(
      'Welcome to Cardova',
      `
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">Click below to verify your email and start creating your digital business card.</p>
        <div style="text-align: center;">
          <a href="${verifyUrl}" style="display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email</a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0; text-align: center;">If you didn't create a Cardova account, you can ignore this email.</p>
      `,
    ),
  );
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    'Reset your Cardova password',
    emailTemplate(
      'Reset your password',
      `
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">Click below to set a new password. This link expires in 1 hour.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0; text-align: center;">If you didn't request this, you can ignore this email.</p>
      `,
    ),
  );
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  await sendEmail(
    email,
    'Welcome to Cardova!',
    emailTemplate(
      `Welcome, ${name}!`,
      `
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 16px; text-align: center;">Your account is verified and ready to go. Here's what you can do:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px;">✨ Create your personal or business card</p>
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px;">🤖 Use AI to generate your bio and services</p>
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px;">📱 Share your card with a simple link</p>
          <p style="color: #374151; font-size: 14px; margin: 0;">📊 Track who views your card</p>
        </div>
        <div style="text-align: center;">
          <a href="${env.CLIENT_URL}/dashboard" style="display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
        </div>
      `,
    ),
  );
}

export async function sendProUpgradeEmail(email: string, name: string): Promise<void> {
  await sendEmail(
    email,
    "You're now Pro! 🎉",
    emailTemplate(
      `You're Pro now, ${name}!`,
      `
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 16px; text-align: center;">Thank you for upgrading! Here's what's unlocked:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px;">🎨 All premium themes (Neon, Sunset, Ocean)</p>
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px;">🤖 Unlimited AI generations</p>
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px;">✨ AI bio improvement</p>
          <p style="color: #374151; font-size: 14px; margin: 0;">🚫 No "Powered by Cardova" badge</p>
        </div>
        <div style="text-align: center;">
          <a href="${env.CLIENT_URL}/dashboard" style="display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
        </div>
      `,
    ),
  );
}
