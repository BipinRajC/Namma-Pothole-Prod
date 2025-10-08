import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Supabase credentials not found in environment variables"
  );
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Create a new admin user
 * @param {Object} userData - { email, password, name, role, zone, zoneId }
 * @returns {Object} - Created user or error
 */
export async function createAdminUser(userData) {
  try {
    const { email, password, name, role, zone, zoneId } = userData;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert into admin_users table
    const { data, error } = await supabase
      .from("admin_users")
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
          role,
          zone: zone || null,
          zone_id: zoneId !== undefined ? zoneId : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating admin user:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get admin user by email
 * @param {string} email
 * @returns {Object|null} - User object or null
 */
export async function getAdminUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      console.error("Error fetching admin user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return null;
  }
}

/**
 * Verify admin user password
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {boolean}
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Get all admin users (for management purposes)
 * @returns {Array} - Array of admin users
 */
export async function getAllAdminUsers() {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, name, role, zone, zone_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}

/**
 * Create audit log entry
 * @param {Object} logData - { complaint_id, admin_user_id, admin_email, action, old_status, new_status, evidence_url }
 * @returns {Object} - Success status
 */
export async function createAuditLog(logData) {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .insert([logData])
      .select()
      .single();

    if (error) {
      console.error("Error creating audit log:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating audit log:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get audit logs for a complaint
 * @param {string} complaintId
 * @returns {Array} - Array of audit logs
 */
export async function getAuditLogsByComplaint(complaintId) {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("complaint_id", complaintId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}

/**
 * Create password reset token
 * @param {string} email - Admin user email
 * @returns {Object} - { success, token, expiresAt } or { success: false, error }
 */
export async function createPasswordResetToken(email) {
  try {
    const user = await getAdminUserByEmail(email);
    
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Generate a random token
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in password_reset_tokens table
    const { data, error } = await supabase
      .from("password_reset_tokens")
      .insert([
        {
          admin_user_id: user.id,
          email: user.email,
          token,
          expires_at: expiresAt.toISOString(),
          used: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating reset token:", error);
      return { success: false, error: error.message };
    }

    return { success: true, token, expiresAt, userId: user.id };
  } catch (error) {
    console.error("Error creating reset token:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify password reset token
 * @param {string} token - Reset token
 * @returns {Object} - { success, email, userId } or { success: false, error }
 */
export async function verifyPasswordResetToken(token) {
  try {
    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (error || !data) {
      return { success: false, error: "Invalid or expired token" };
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      return { success: false, error: "Token has expired" };
    }

    return { 
      success: true, 
      email: data.email, 
      userId: data.admin_user_id,
      tokenId: data.id 
    };
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update admin user password
 * @param {number} userId - Admin user ID
 * @param {string} newPassword - New password
 * @param {number} tokenId - Reset token ID to mark as used
 * @returns {Object} - { success } or { success: false, error }
 */
export async function updateAdminPassword(userId, newPassword, tokenId) {
  try {
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: passwordHash })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return { success: false, error: updateError.message };
    }

    // Mark token as used
    if (tokenId) {
      await supabase
        .from("password_reset_tokens")
        .update({ used: true })
        .eq("id", tokenId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up expired password reset tokens (utility function)
 * Should be run periodically
 */
export async function cleanupExpiredTokens() {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("password_reset_tokens")
      .delete()
      .lt("expires_at", now);

    if (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
}

export default supabase;

