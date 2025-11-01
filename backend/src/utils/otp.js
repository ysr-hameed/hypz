import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate a 6-digit OTP code
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate a secret for TOTP-based 2FA
 */
export const generate2FASecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `Hypz Storage (${email})`,
    issuer: 'Hypz Storage'
  });
  
  return secret;
};

/**
 * Generate QR code for 2FA setup
 */
export const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCode = await QRCode.toDataURL(otpauthUrl);
    return qrCode;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify TOTP token
 */
export const verify2FAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps before/after (60 seconds total window)
  });
};

/**
 * Generate backup codes for 2FA
 */
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
};

/**
 * Hash backup code for storage
 */
export const hashBackupCode = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * Verify backup code
 */
export const verifyBackupCode = (code, hashedCodes) => {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.includes(hashedInput);
};
