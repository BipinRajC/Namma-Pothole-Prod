import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET not found in environment variables");
}

/**
 * Middleware to verify JWT token for admin routes
 * Adds user data to req.admin
 */
export function verifyAdminToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided. Please login.",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add admin data to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      zone: decoded.zone,
      zoneId: decoded.zoneId,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token. Please login again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }

    console.error("Error verifying token:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication error",
    });
  }
}

/**
 * Middleware to verify if user is Chief Engineer
 */
export function requireChiefEngineer(req, res, next) {
  if (req.admin.role !== "chief_engineer") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Chief Engineer role required.",
    });
  }
  next();
}

/**
 * Middleware to verify if user is Superintendent Engineer
 */
export function requireSuperintendent(req, res, next) {
  if (req.admin.role !== "superintendent_engineer") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Superintendent Engineer role required.",
    });
  }
  next();
}

/**
 * Middleware to verify if user is either Chief or Superintendent
 */
export function requireAdmin(req, res, next) {
  const validRoles = ["chief_engineer", "superintendent_engineer"];
  if (!validRoles.includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin role required.",
    });
  }
  next();
}

/**
 * Generate JWT token for admin user
 * @param {Object} user - User object from database
 * @returns {string} - JWT token
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    zone: user.zone,
    zoneId: user.zone_id,
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

