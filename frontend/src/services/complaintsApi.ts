import axios, { AxiosResponse } from "axios";
import {
  Complaint,
  ComplaintsResponse,
  DashboardStats,
} from "@/types/complaint";

/**
 * API service for complaint management using axios
 * Connects to backend using environment variable or falls back to localhost
 */

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // In production, use the environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback for development
  return "http://localhost:3000";
};

// Configure axios defaults
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch all complaints from backend
 */
export const fetchComplaints = async (): Promise<ComplaintsResponse> => {
  try {
    const response: AxiosResponse<ComplaintsResponse> = await api.get(
      "/complaints"
    );

    const data = response.data;

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch complaints from server");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error fetching complaints:", error);

    if (
      (error as { code?: string }).code === "ECONNREFUSED" ||
      (error as { code?: string }).code === "ERR_NETWORK"
    ) {
      throw new Error(
        `Cannot connect to backend server. Please ensure the server is running on ${getApiBaseUrl()}`
      );
    }

    if (
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      throw new Error(
        "Complaints endpoint not found. Please check the backend API"
      );
    }

    throw new Error((error as Error).message || "Failed to fetch complaints");
  }
};

/**
 * Calculate dashboard statistics from complaints data
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch all complaints to calculate stats
    const complaintsResponse = await fetchComplaints();

    if (!complaintsResponse.success) {
      throw new Error(
        complaintsResponse.error || "Failed to fetch complaints for stats"
      );
    }

    const complaints = complaintsResponse.data;

    // Calculate statistics from the complaints
    const stats = complaints.reduce(
      (acc, complaint) => {
        acc.total++;
        if (complaint.status === "reported") acc.reported++;
        else if (complaint.status === "acknowledged") acc.acknowledged++;
        else if (complaint.status === "resolved") acc.resolved++;
        return acc;
      },
      { total: 0, reported: 0, acknowledged: 0, resolved: 0 }
    );

    return stats;
  } catch (error: unknown) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error(
      (error as Error).message || "Failed to fetch dashboard statistics"
    );
  }
};
