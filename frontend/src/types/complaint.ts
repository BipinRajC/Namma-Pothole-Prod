/**
 * Complaint data structure from MongoDB database
 */
export interface Complaint {
  _id: string; // MongoDB ObjectId
  latitude: number;
  longitude: number;
  imageUrl: string;
  timestamp: string; // Epoch timestamp in seconds (as string)
  status: "reported" | "acknowledged" | "resolved";
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
  acknowledged: number;
  resolved: number;
}
