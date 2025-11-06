import nodemailer from 'nodemailer';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD
    }
  });
};

// Send email
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent', { messageId: info.messageId, to });
    return info;
  } catch (error) {
    logger.error('Email sending error', { err: error, to });
    throw new Error('Failed to send email');
  }
};

// Email verification email
export const sendVerificationEmail = async (email, token, firstName) => {
  const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Welcome to Hypz!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName || 'there'}! 👋</h2>
          <p>Thanks for signing up for Hypz Storage. We're excited to have you on board!</p>
          <p>Please verify your email address to get started:</p>
          <center>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </center>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <p>This link will expire in 24 hours for security reasons.</p>
          <p>If you didn't create an account with Hypz, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Verify your Hypz account', html);
};

// Password reset email
export const sendPasswordResetEmail = async (email, token, firstName) => {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Your Password</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName || 'there'}!</h2>
          <p>We received a request to reset your Hypz account password.</p>
          <p>Click the button below to reset it:</p>
          <center>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </center>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p><strong>If you didn't request a password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Reset your Hypz password', html);
};

// Welcome email after verification
export const sendWelcomeEmail = async (email, firstName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Hypz!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName}! 🚀</h2>
          <p>Your email has been verified! You're all set to start using Hypz Storage.</p>
          <p><strong>What's included in your Free plan:</strong></p>
          <ul>
            <li>1 GB secure cloud storage</li>
            <li>3 GB bandwidth per month</li>
            <li>50K API requests monthly</li>
            <li>Unlimited file uploads</li>
            <li>Global CDN delivery</li>
            <li>Free SSL certificates</li>
          </ul>
          <center>
            <a href="${config.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
          </center>
          <p>Need help getting started? Check out our <a href="${config.FRONTEND_URL}/docs">documentation</a>.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Welcome to Hypz! 🎉', html);
};

// Send OTP verification email
export const sendOTPEmail = async (email, otp, firstName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #667eea; font-family: 'Courier New', monospace; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Your Verification Code</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName || 'there'}!</h2>
          <p>Use the following One-Time Password (OTP) to verify your email address:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p style="text-align: center; color: #666; font-size: 14px;">This code will expire in <strong>10 minutes</strong></p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Hypz staff will never ask for your OTP.
          </div>
          <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Your Hypz verification code: ${otp}`, html);
};

// Send 2FA code email
export const send2FAEmail = async (email, otp, firstName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #667eea; font-family: 'Courier New', monospace; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Login Verification</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName}!</h2>
          <p>Someone is trying to log in to your Hypz account. Enter this code to continue:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p style="text-align: center; color: #666; font-size: 14px;">This code will expire in <strong>5 minutes</strong></p>
          <div class="warning">
            <strong>⚠️ Security Alert:</strong> If you didn't try to log in, please secure your account immediately by changing your password.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Your Hypz 2FA code: ${otp}`, html);
};

// Send invoice email
export const sendInvoiceEmail = async (email, firstName, amount, billingPeriod, invoiceId) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .invoice-box { background: white; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Your Hypz Invoice</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName}! 💳</h2>
          <p>Your payment for ${billingPeriod} has been processed successfully.</p>
          <div class="invoice-box">
            <p><strong>Invoice ID:</strong> ${invoiceId}</p>
            <p><strong>Billing Period:</strong> ${billingPeriod}</p>
            <div class="amount">$${amount}</div>
            <p style="text-align: center; color: #28a745;"><strong>✅ PAID</strong></p>
          </div>
          <p>Thank you for using Hypz Storage!</p>
          <center>
            <a href="${config.FRONTEND_URL}/dashboard/billing" class="button">View Billing History</a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Hypz Invoice - $${amount} Paid`, html);
};

// Send payment failed email with grace period notice
export const sendPaymentFailedEmail = async (email, firstName, amount, reason, gracePeriodEnd) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Payment Failed</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>We were unable to process your payment of <strong>$${amount}</strong>.</p>
          <div class="warning-box">
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Grace Period Until:</strong> ${gracePeriodEnd}</p>
          </div>
          <p>Don't worry! Your services will remain active until <strong>${gracePeriodEnd}</strong>.</p>
          <p>Please update your payment method to avoid service interruption.</p>
          <center>
            <a href="${config.FRONTEND_URL}/dashboard/billing" class="button">Update Payment Method</a>
          </center>
          <p>If you need assistance, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, '⚠️ Payment Failed - Action Required', html);
};

// Send manual invoice email
export const sendManualInvoiceEmail = async (email, firstName, amount, billingPeriod, dueDate) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .invoice-box { background: white; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Manual Invoice</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName}! 💳</h2>
          <p>Your Hypz invoice for ${billingPeriod} is ready.</p>
          <div class="invoice-box">
            <p><strong>Billing Period:</strong> ${billingPeriod}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <div class="amount">$${amount}</div>
            <p style="text-align: center; color: #ffc107;"><strong>⏳ PENDING</strong></p>
          </div>
          <p>Please submit payment before the due date to continue enjoying uninterrupted service.</p>
          <center>
            <a href="${config.FRONTEND_URL}/dashboard/billing" class="button">Pay Now</a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Hypz Invoice - $${amount} Due`, html);
};

// Send service suspension email
export const sendServiceSuspensionEmail = async (email, firstName, reason, billingAmount) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; color: #721c24; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚫 Service Suspended</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <div class="alert-box">
            <p><strong>Your Hypz services have been suspended.</strong></p>
            <p><strong>Reason:</strong> ${reason}</p>
            ${billingAmount ? `<p><strong>Outstanding Amount:</strong> $${billingAmount}</p>` : ''}
          </div>
          <p>Your files are safe, but you cannot access them until your account is reactivated.</p>
          <p><strong>To reactivate your services:</strong></p>
          <ul>
            <li>Update your payment method</li>
            <li>Pay any outstanding balance</li>
            <li>Contact support if you need assistance</li>
          </ul>
          <center>
            <a href="${config.FRONTEND_URL}/dashboard/billing" class="button">Reactivate Account</a>
          </center>
          <p>If you believe this is a mistake, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, '🚫 Hypz Service Suspended - Action Required', html);
};

// Send webhook notification email
export const sendWebhookNotificationEmail = async (email, eventName, eventDetails, timestamp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-box { background: white; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Webhook Event</h1>
        </div>
        <div class="content">
          <h2>New Event: ${eventName}</h2>
          <div class="event-box">
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>Details:</strong></p>
            <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(eventDetails, null, 2)}</pre>
          </div>
          <center>
            <a href="${config.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypz Storage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Webhook Event: ${eventName}`, html);
};
