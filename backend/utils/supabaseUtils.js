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

export default supabase;

