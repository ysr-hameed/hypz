import nodemailer from 'nodemailer';
import config from '../config/config.js';

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
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
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
