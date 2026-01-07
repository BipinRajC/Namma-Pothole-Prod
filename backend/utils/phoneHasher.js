import crypto from "crypto";

export const hashPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    throw new Error("Phone number must be a non-empty string");
  }
  // Normalize phone number by removing any whitespace and ensuring it starts with +
  const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");
  // Create SHA-1 hash
  const hash = crypto.createHash("sha1");
  hash.update(normalizedPhone);

  return hash.digest("hex");
};

export const getHashedPhoneNumber = (phoneNumber) => {
  try {
    return hashPhoneNumber(phoneNumber);
  } catch (error) {
    console.error("Error hashing phone number:", error);
    throw new Error("Failed to hash phone number");
  }
};
