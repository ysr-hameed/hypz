/**
 * Frontend Validation Utilities
 * Comprehensive validation for all forms
 */

// Email validation
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
    return errors;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (email.length > 255) {
    errors.push('Email is too long');
  }
  
  return errors;
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return errors;
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password is too long (max 128 characters)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^\da-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword) {
    errors.push('Please confirm your password');
    return errors;
  }
  
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return errors;
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push(`${fieldName} is required`);
    return errors;
  }
  
  if (name.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  }
  
  if (name.length > 50) {
    errors.push(`${fieldName} is too long (max 50 characters)`);
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }
  
  return errors;
};

// OTP validation
export const validateOTP = (otp) => {
  const errors = [];
  
  if (!otp) {
    errors.push('OTP is required');
    return errors;
  }
  
  if (typeof otp === 'string') {
    if (otp.length !== 6) {
      errors.push('OTP must be 6 digits');
    }
    
    if (!/^\d{6}$/.test(otp)) {
      errors.push('OTP must contain only numbers');
    }
  }
  
  return errors;
};

// 2FA token validation
export const validate2FAToken = (token) => {
  const errors = [];
  
  if (!token) {
    errors.push('Verification code is required');
    return errors;
  }
  
  if (token.length !== 6) {
    errors.push('Verification code must be 6 digits');
  }
  
  if (!/^\d{6}$/.test(token)) {
    errors.push('Verification code must contain only numbers');
  }
  
  return errors;
};

// Backup code validation
export const validateBackupCode = (code) => {
  const errors = [];
  
  if (!code) {
    errors.push('Backup code is required');
    return errors;
  }
  
  if (code.length !== 8) {
    errors.push('Backup code must be 8 characters');
  }
  
  if (!/^[A-F0-9]{8}$/i.test(code)) {
    errors.push('Invalid backup code format');
  }
  
  return errors;
};

// Bucket name validation
export const validateBucketName = (name) => {
  const errors = [];
  
  if (!name) {
    errors.push('Bucket name is required');
    return errors;
  }
  
  if (name.length < 3) {
    errors.push('Bucket name must be at least 3 characters');
  }
  
  if (name.length > 63) {
    errors.push('Bucket name is too long (max 63 characters)');
  }
  
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
    errors.push('Bucket name can only contain lowercase letters, numbers, and hyphens');
  }
  
  if (name.includes('--')) {
    errors.push('Bucket name cannot contain consecutive hyphens');
  }
  
  return errors;
};

// File validation
export const validateFile = (file, maxSize = 100 * 1024 * 1024) => { // Default 100MB
  const errors = [];
  
  if (!file) {
    errors.push('Please select a file');
    return errors;
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  if (file.size === 0) {
    errors.push('File is empty');
  }
  
  // Check for potentially dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (dangerousExtensions.includes(fileExtension)) {
    errors.push('This file type is not allowed');
  }
  
  return errors;
};

// Credit card validation (basic)
export const validateCreditCard = (cardNumber) => {
  const errors = [];
  
  if (!cardNumber) {
    errors.push('Card number is required');
    return errors;
  }
  
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    errors.push('Invalid card number');
    return errors;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    errors.push('Invalid card number');
  }
  
  return errors;
};

// CVV validation
export const validateCVV = (cvv) => {
  const errors = [];
  
  if (!cvv) {
    errors.push('CVV is required');
    return errors;
  }
  
  if (!/^\d{3,4}$/.test(cvv)) {
    errors.push('CVV must be 3 or 4 digits');
  }
  
  return errors;
};

// Expiry date validation
export const validateExpiryDate = (month, year) => {
  const errors = [];
  
  if (!month || !year) {
    errors.push('Expiry date is required');
    return errors;
  }
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    errors.push('Card has expired');
  }
  
  return errors;
};

// URL validation
export const validateURL = (url) => {
  const errors = [];
  
  if (!url) {
    errors.push('URL is required');
    return errors;
  }
  
  try {
    new URL(url);
  } catch {
    errors.push('Invalid URL format');
  }
  
  return errors;
};

// Phone number validation (basic international)
export const validatePhone = (phone) => {
  const errors = [];
  
  if (!phone) {
    errors.push('Phone number is required');
    return errors;
  }
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    errors.push('Invalid phone number');
  }
  
  return errors;
};

// Generic required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  const errors = [];
  
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    errors.push(`${fieldName} is required`);
  }
  
  return errors;
};

// Multiple validators helper
export const validateForm = (validations) => {
  const allErrors = {};
  let hasErrors = false;
  
  Object.keys(validations).forEach(field => {
    const errors = validations[field];
    if (errors && errors.length > 0) {
      allErrors[field] = errors;
      hasErrors = true;
    }
  });
  
  return {
    isValid: !hasErrors,
    errors: allErrors
  };
};

export default {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateOTP,
  validate2FAToken,
  validateBackupCode,
  validateBucketName,
  validateFile,
  validateCreditCard,
  validateCVV,
  validateExpiryDate,
  validateURL,
  validatePhone,
  validateRequired,
  validateForm
};
