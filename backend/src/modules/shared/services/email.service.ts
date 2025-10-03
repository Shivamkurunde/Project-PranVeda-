/**
 * Email Service
 * Handles sending emails for authentication and notifications
 */

import nodemailer from 'nodemailer';
import { env } from '../../../config/env.js';
import { logger } from '../../../middleware/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter if SMTP is configured
   */
  private initializeTransporter(): void {
    try {
      if (!env.SMTP_HOST || !env.SMTP_USERNAME || !env.SMTP_PASSWORD) {
        logger.warn('⚠️  Email service not configured. Password reset and verification disabled.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USERNAME,
          pass: env.SMTP_PASSWORD,
        },
      });

      this.isConfigured = true;
      logger.info('✉️  Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Check if email service is available
   */
  isAvailable(): boolean {
    return this.isConfigured && this.transporter !== null;
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Email service not configured');
    }

    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    
    await this.transporter!.sendMail({
      from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your PranVeda Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🧘‍♀️ PranVeda Zen Flow</h1>
              </div>
              <div class="content">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the button below to create a new password:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                <p><strong>This link expires in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} PranVeda Zen Flow. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Password Reset Request

You requested to reset your password. Visit this link to create a new password:
${resetUrl}

This link expires in 1 hour.

If you didn't request this password reset, please ignore this email.

- PranVeda Zen Flow Team
      `,
    });
    
    logger.info(`Password reset email sent to ${email}`);
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(email: string, verificationToken: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Email service not configured');
    }

    const verifyUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    
    await this.transporter!.sendMail({
      from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
      to: email,
      subject: 'Verify Your PranVeda Email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🧘‍♀️ Welcome to PranVeda!</h1>
              </div>
              <div class="content">
                <h2>Email Verification</h2>
                <p>Thank you for joining PranVeda Zen Flow! Please verify your email address to get started:</p>
                <a href="${verifyUrl}" class="button">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verifyUrl}</p>
                <p><strong>This link expires in 24 hours.</strong></p>
                <p>After verification, you'll have full access to all features including meditation sessions, workouts, and AI coaching.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} PranVeda Zen Flow. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Welcome to PranVeda Zen Flow!

Please verify your email address by visiting this link:
${verifyUrl}

This link expires in 24 hours.

After verification, you'll have full access to all features.

- PranVeda Zen Flow Team
      `,
    });
    
    logger.info(`Verification email sent to ${email}`);
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, displayName?: string): Promise<void> {
    if (!this.isAvailable()) {
      return; // Welcome emails are optional
    }

    const name = displayName || 'there';

    try {
      await this.transporter!.sendMail({
        from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
        to: email,
        subject: 'Welcome to PranVeda Zen Flow! 🧘‍♀️',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Welcome ${name}!</h1>
                </div>
                <div class="content">
                  <p>We're thrilled to have you join the PranVeda Zen Flow community!</p>
                  <h3>What's waiting for you:</h3>
                  <div class="feature">
                    <strong>🧘‍♀️ Guided Meditation</strong>
                    <p>10 meditation types with soothing audio and multi-language support</p>
                  </div>
                  <div class="feature">
                    <strong>💪 Workout Sessions</strong>
                    <p>Track your fitness journey with timers and celebrations</p>
                  </div>
                  <div class="feature">
                    <strong>🤖 AI Coach</strong>
                    <p>Get personalized wellness guidance powered by advanced AI</p>
                  </div>
                  <div class="feature">
                    <strong>🏆 Gamification</strong>
                    <p>Earn badges, maintain streaks, and level up your wellness journey</p>
                  </div>
                  <p>Start your journey today at <a href="${env.FRONTEND_URL}">${env.FRONTEND_URL}</a></p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} PranVeda Zen Flow. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw - welcome emails are non-critical
    }
  }
}

export const emailService = new EmailService();

