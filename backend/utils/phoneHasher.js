import crypto from 'crypto';

/**
 * Phone number hashing utility using SHA-1 algorithm
 * Provides consistent hashing for phone numbers across MongoDB and Redis operations
 */

/**
 * Hash a phone number using SHA-1 algorithm
 * @param {string} phoneNumber - The phone number to hash (should be in E.164 format)
 * @returns {string} - SHA-1 hash of the phone number in hexadecimal format
 */
export const hashPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error('Phone number must be a non-empty string');
  }
  
  // Normalize phone number by removing any whitespace and ensuring it starts with +
  const normalizedPhone = phoneNumber.trim().replace(/\s+/g, '');
  
  // Create SHA-1 hash
  const hash = crypto.createHash('sha1');
  hash.update(normalizedPhone);
  
  return hash.digest('hex');
};

/**
 * Wrapper function for phone number operations
 * Always use this function whenever working with phone numbers in MongoDB or Redis
 * @param {string} phoneNumber - Raw phone number from Twilio webhook
 * @returns {string} - Hashed phone number for storage/lookup
 */
export const getHashedPhoneNumber = (phoneNumber) => {
  try {
    return hashPhoneNumber(phoneNumber);
  } catch (error) {
    console.error('Error hashing phone number:', error);
    throw new Error('Failed to hash phone number');
  }
};


