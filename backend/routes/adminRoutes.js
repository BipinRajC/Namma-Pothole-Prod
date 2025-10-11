import express from "express";
import multer from "multer";
import {
  getAdminUserByEmail,
  verifyPassword,
  createAuditLog,
  createPasswordResetToken,
  verifyPasswordResetToken,
  updateAdminPassword,
} from "../utils/supabaseUtils.js";
import {
  generateToken,
  verifyAdminToken,
  requireAdmin,
} from "../middleware/authMiddleware.js";
import {
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintStatusAndEvidence,
} from "../utils/mongoUtils.js";
import { getZoneFromCoordinates, getAllZones } from "../utils/zoneUtils.js";
import { uploadMediaFromBuffer } from "../utils/s3Utils.js";
import { v4 as uuidv4 } from "uuid";
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../utils/emailUtils.js";

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only jpeg, jpg, png
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPEG, JPG and PNG are allowed."),
        false
      );
    }
  },
});

/**
 * POST /admin/login
 * Admin login endpoint
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Get user from Supabase
    const user = await getAdminUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          zone: user.zone,
          zoneId: user.zone_id,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
});

/**
 * POST /admin/forgot-password
 * Request password reset - sends email with reset token
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Create reset token
    const result = await createPasswordResetToken(email);

    if (!result.success) {
      // Return error if email doesn't exist in database
      return res.status(404).json({
        success: false,
        error: "Invalid email. Please contact the administrator if you need access.",
      });
    }

    // Get user details for email
    const user = await getAdminUserByEmail(email);

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      email,
      result.token,
      user?.name
    );

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      return res.status(500).json({
        success: false,
        error: "Failed to send reset email. Please try again later.",
      });
    }

    // Return success
    res.json({
      success: true,
      message: `You will receive a password reset link shortly on ${email}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process password reset request",
    });
  }
});

/**
 * POST /admin/reset-password
 * Reset password using token
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Token and new password are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
    }

    // Verify token
    const tokenVerification = await verifyPasswordResetToken(token);

    if (!tokenVerification.success) {
      return res.status(400).json({
        success: false,
        error: tokenVerification.error || "Invalid or expired reset token",
      });
    }

    // Update password
    const updateResult = await updateAdminPassword(
      tokenVerification.userId,
      newPassword,
      tokenVerification.tokenId
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to update password",
      });
    }

    // Get user details for confirmation email
    const user = await getAdminUserByEmail(tokenVerification.email);

    // Send confirmation email
    await sendPasswordChangedEmail(tokenVerification.email, user?.name);

    res.json({
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
});

/**
 * POST /admin/verify-reset-token
 * Verify if a reset token is valid (used by frontend to check before showing reset form)
 */
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token is required",
      });
    }

    const verification = await verifyPasswordResetToken(token);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: verification.error || "Invalid or expired token",
      });
    }

    res.json({
      success: true,
      email: verification.email,
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify token",
    });
  }
});

/**
 * GET /admin/profile
 * Get current admin user profile
 */
router.get("/profile", verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.admin,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
});

/**
 * GET /admin/zones
 * Get all available zones
 */
router.get("/zones", verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    const zones = getAllZones();
    res.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    console.error("Error fetching zones:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch zones",
    });
  }
});

/**
 * GET /admin/complaints
 * Get complaints filtered by zone (for Chief Engineers) or all (for Superintendent)
 */
router.get("/complaints", verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    const { role, zone, zoneId } = req.admin;

    // Get all complaints from MongoDB
    const allComplaints = await getAllComplaints();

    // Add zone information to each complaint in real-time
    const complaintsWithZones = allComplaints.map((complaint) => {
      const zoneInfo = getZoneFromCoordinates(
        complaint.latitude,
        complaint.longitude
      );
      return {
        ...complaint.toObject(),
        zone: zoneInfo?.zoneName || null,
        zoneId: zoneInfo?.zoneId !== undefined ? zoneInfo.zoneId : null,
      };
    });

    // Filter by zone for Chief Engineers
    let filteredComplaints = complaintsWithZones;
    if (role === "chief_engineer") {
      filteredComplaints = complaintsWithZones.filter(
        (complaint) => complaint.zoneId === zoneId
      );
    }

    // Calculate statistics
    const stats = filteredComplaints.reduce(
      (acc, complaint) => {
        acc.total++;
        if (complaint.status === "reported") acc.reported++;
        else if (complaint.status === "in_progress") acc.inProgress++;
        else if (complaint.status === "resolved") acc.resolved++;
        return acc;
      },
      { total: 0, reported: 0, inProgress: 0, resolved: 0 }
    );

    res.json({
      success: true,
      data: filteredComplaints,
      stats,
      zone: role === "chief_engineer" ? zone : "all",
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch complaints",
    });
  }
});

/**
 * GET /admin/complaints/:complaintId
 * Get single complaint by ID
 */
router.get(
  "/complaints/:complaintId",
  verifyAdminToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { role, zoneId } = req.admin;

      const complaint = await getComplaintById(complaintId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          error: "Complaint not found",
        });
      }

      // Add zone information
      const zoneInfo = getZoneFromCoordinates(
        complaint.latitude,
        complaint.longitude
      );

      // Check if Chief Engineer has access to this complaint
      if (role === "chief_engineer" && zoneInfo?.zoneId !== zoneId) {
        return res.status(403).json({
          success: false,
          error: "Access denied. This complaint is not in your zone.",
        });
      }

      const complaintWithZone = {
        ...complaint.toObject(),
        zone: zoneInfo?.zoneName || null,
        zoneId: zoneInfo?.zoneId !== undefined ? zoneInfo.zoneId : null,
      };

      res.json({
        success: true,
        data: complaintWithZone,
      });
    } catch (error) {
      console.error("Error fetching complaint:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch complaint",
      });
    }
  }
);

/**
 * PATCH /admin/complaints/:complaintId/status
 * Update complaint status
 */
router.patch(
  "/complaints/:complaintId/status",
  verifyAdminToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { status } = req.body;
      const { role, zoneId, email, id: adminUserId } = req.admin;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: "Status is required",
        });
      }

      // Get complaint to check zone
      const complaint = await getComplaintById(complaintId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          error: "Complaint not found",
        });
      }

      // Check zone access for Chief Engineer
      const zoneInfo = getZoneFromCoordinates(
        complaint.latitude,
        complaint.longitude
      );

      if (role === "chief_engineer" && zoneInfo?.zoneId !== zoneId) {
        return res.status(403).json({
          success: false,
          error: "Access denied. This complaint is not in your zone.",
        });
      }

      // Update status
      const result = await updateComplaintStatus(complaintId, status);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Create audit log
      await createAuditLog({
        complaint_id: complaintId,
        admin_user_id: adminUserId,
        admin_email: email,
        action: "status_change",
        old_status: complaint.status,
        new_status: status,
      });

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error updating complaint status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update complaint status",
      });
    }
  }
);

/**
 * POST /admin/complaints/:complaintId/evidence
 * Upload evidence image and mark as resolved
 */
router.post(
  "/complaints/:complaintId/evidence",
  verifyAdminToken,
  requireAdmin,
  upload.single("evidence"),
  async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { role, zoneId, email, id: adminUserId } = req.admin;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Evidence image is required",
        });
      }

      // Get complaint to check zone
      const complaint = await getComplaintById(complaintId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          error: "Complaint not found",
        });
      }

      // Check zone access for Chief Engineer
      const zoneInfo = getZoneFromCoordinates(
        complaint.latitude,
        complaint.longitude
      );

      if (role === "chief_engineer" && zoneInfo?.zoneId !== zoneId) {
        return res.status(403).json({
          success: false,
          error: "Access denied. This complaint is not in your zone.",
        });
      }

      // Upload evidence image to S3
      const evidenceId = `evidence-${uuidv4()}`;
      const evidenceUrl = await uploadMediaFromBuffer(
        req.file.buffer,
        evidenceId,
        req.file.mimetype
      );

      if (!evidenceUrl) {
        return res.status(500).json({
          success: false,
          error: "Failed to upload evidence image",
        });
      }

      // Update complaint with evidence and mark as resolved
      const result = await updateComplaintStatusAndEvidence(
        complaintId,
        "resolved",
        evidenceUrl
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Create audit log
      await createAuditLog({
        complaint_id: complaintId,
        admin_user_id: adminUserId,
        admin_email: email,
        action: "evidence_upload",
        old_status: complaint.status,
        new_status: "resolved",
        evidence_url: evidenceUrl,
      });

      res.json({
        success: true,
        data: result.data,
        message: "Evidence uploaded and complaint marked as resolved",
      });
    } catch (error) {
      console.error("Error uploading evidence:", error);
      res.status(500).json({
        success: false,
        error: "Failed to upload evidence",
      });
    }
  }
);

/**
 * GET /admin/stats
 * Get statistics filtered by zone
 */
router.get("/stats", verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    const { role, zoneId } = req.admin;

    // Get all complaints
    const allComplaints = await getAllComplaints();

    // Add zone information
    const complaintsWithZones = allComplaints.map((complaint) => {
      const zoneInfo = getZoneFromCoordinates(
        complaint.latitude,
        complaint.longitude
      );
      return {
        ...complaint.toObject(),
        zone: zoneInfo?.zoneName || null,
        zoneId: zoneInfo?.zoneId !== undefined ? zoneInfo.zoneId : null,
      };
    });

    // Filter by zone for Chief Engineers
    let filteredComplaints = complaintsWithZones;
    if (role === "chief_engineer") {
      filteredComplaints = complaintsWithZones.filter(
        (complaint) => complaint.zoneId === zoneId
      );
    }

    // Calculate detailed statistics
    const stats = {
      total: filteredComplaints.length,
      reported: filteredComplaints.filter((c) => c.status === "reported")
        .length,
      inProgress: filteredComplaints.filter((c) => c.status === "in_progress")
        .length,
      resolved: filteredComplaints.filter((c) => c.status === "resolved")
        .length,
    };

    // For Superintendent, also provide zone-wise breakdown
    let zoneBreakdown = null;
    if (role === "superintendent_engineer") {
      const zones = getAllZones();
      zoneBreakdown = zones.map((zone) => {
        const zoneComplaints = complaintsWithZones.filter(
          (c) => c.zoneId === zone.zoneId
        );
        return {
          zone: zone.zoneName,
          zoneId: zone.zoneId,
          total: zoneComplaints.length,
          reported: zoneComplaints.filter((c) => c.status === "reported")
            .length,
          inProgress: zoneComplaints.filter((c) => c.status === "in_progress")
            .length,
          resolved: zoneComplaints.filter((c) => c.status === "resolved")
            .length,
        };
      });
    }

    res.json({
      success: true,
      data: {
        stats,
        zoneBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

export default router;

