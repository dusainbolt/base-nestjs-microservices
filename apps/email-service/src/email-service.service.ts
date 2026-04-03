import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  EnvironmentVariables,
  SendPasswordResetEmailDto,
  SendVerificationEmailDto,
  SendWelcomeEmailDto,
} from '@app/common';

@Injectable()
export class EmailServiceService {
  private readonly logger = new Logger(EmailServiceService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST'),
      port: Number(config.get('MAIL_PORT')),
      secure: Number(config.get('MAIL_PORT')) === 465,
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASS'),
      },
    });
  }

  // ─── Public send methods ──────────────────────────────────────────────────

  async sendVerification(payload: SendVerificationEmailDto): Promise<void> {
    await this.send({
      to: payload.to,
      subject: 'Verify your email address',
      html: this.verificationTemplate(payload.username, payload.code),
    });
    this.logger.log(`[VERIFICATION] Sent to ${payload.to}`);
  }

  async sendPasswordReset(
    payload: SendPasswordResetEmailDto,
  ): Promise<void> {
    const appUrl = this.config.get('APP_URL');
    const link = `${appUrl}/auth/reset-password?token=${payload.resetToken}`;
    await this.send({
      to: payload.to,
      subject: 'Reset your password',
      html: this.passwordResetTemplate(payload.username, link),
    });
    this.logger.log(`[PASSWORD_RESET] Sent to ${payload.to}`);
  }

  async sendWelcome(payload: SendWelcomeEmailDto): Promise<void> {
    await this.send({
      to: payload.to,
      subject: `Welcome to ${this.config.get('MAIL_FROM_NAME')}!`,
      html: this.welcomeTemplate(
        payload.username,
        payload.firstName ?? payload.username,
      ),
    });
    this.logger.log(`[WELCOME] Sent to ${payload.to}`);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async send(opts: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = `"${this.config.get('MAIL_FROM_NAME')}" <${this.config.get('MAIL_FROM')}>`;
    await this.transporter.sendMail({ from, ...opts });
  }

  // ─── HTML Templates ───────────────────────────────────────────────────────

  private verificationTemplate(username: string, code: string): string {
    return this.layout(
      'Email Verification',
      `
      <p>Hi <strong>${username}</strong>,</p>
      <p>Use the code below to verify your email address. It expires in <strong>15 minutes</strong>.</p>
      <div style="font-size:42px;font-weight:bold;letter-spacing:8px;color:#4f46e5;margin:24px 0;text-align:center">
        ${code}
      </div>
      <p style="color:#888;font-size:13px">If you did not create an account, please ignore this email.</p>
    `,
    );
  }

  private passwordResetTemplate(username: string, link: string): string {
    return this.layout(
      'Reset Your Password',
      `
      <p>Hi <strong>${username}</strong>,</p>
      <p>You requested a password reset. Click the button below — the link expires in <strong>1 hour</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${link}"
           style="background:#4f46e5;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px">
          Reset Password
        </a>
      </div>
      <p style="font-size:12px;color:#888">Or copy this link:<br/><a href="${link}">${link}</a></p>
      <p style="color:#888;font-size:13px">If you did not request this, please ignore this email.</p>
    `,
    );
  }

  private welcomeTemplate(username: string, firstName: string): string {
    return this.layout(
      'Welcome! 🎉',
      `
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>Your account <strong>@${username}</strong> is ready. Welcome aboard!</p>
      <p>You can now log in and start using the platform.</p>
    `,
    );
  }

  private layout(title: string, body: string): string {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>
        body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
        .wrap{max-width:520px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
        .header{background:#4f46e5;padding:24px;text-align:center}
        .header h1{color:#fff;margin:0;font-size:20px}
        .body{padding:32px;color:#333;line-height:1.6}
        .footer{background:#f9f9f9;padding:14px;text-align:center;font-size:12px;color:#999}
      </style></head><body>
      <div class="wrap">
        <div class="header"><h1>${title}</h1></div>
        <div class="body">${body}</div>
        <div class="footer">© ${year} ${this.config.get('MAIL_FROM_NAME')}. All rights reserved.</div>
      </div></body></html>`;
  }
}
