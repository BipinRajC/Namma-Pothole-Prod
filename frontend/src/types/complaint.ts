/**
 * Complaint data structure from MongoDB database
 */
export interface Complaint {
  complaintId: string; // MongoDB ObjectId
  latitude: number;
  longitude: number;
  imageUrl: string;
  timestamp: string; // Epoch timestamp in seconds (as string)
  status: "reported" | "in_progress" | "resolved";
  evidenceUrl?: string; // URL of repair/fixed image
  zone?: string; // Zone name (e.g., "South-Zone1")
  zoneId?: number; // Zone ID (0-9)
}

/**
 * API response structure for complaints list from backend
 */
export interface ComplaintsResponse {
  success: boolean;
  count: number;
  data: Complaint[];
  error?: string; // Present when success is false
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  total: number;
  reported: number;
  inProgress: number;
  resolved: number;
}

/**
 * Admin user structure
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "chief_engineer" | "superintendent_engineer";
  zone: string | null;
  zoneId: number | null;
}

/**
 * Admin login response
 */
export interface AdminLoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: AdminUser;
  };
  error?: string;
}

/**
 * Admin complaints response (with zone info)
 */
export interface AdminComplaintsResponse {
  success: boolean;
  data: Complaint[];
  stats: DashboardStats;
  zone: string;
  error?: string;
}

/**
 * Zone information
 */
export interface Zone {
  zoneName: string;
  zoneId: number;
  geoJSONId: number;
}
