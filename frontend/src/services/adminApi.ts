import axios, { AxiosResponse } from "axios";
import {
  AdminLoginResponse,
  AdminComplaintsResponse,
  Complaint,
  AdminUser,
} from "@/types/complaint";

/**
 * Admin API service for authentication and admin operations
 */

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return "http://localhost:3000";
};

// Create axios instance with base configuration
const adminApi = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Admin login
 */
export const adminLogin = async (
  email: string,
  password: string
): Promise<AdminLoginResponse> => {
  try {
    const response: AxiosResponse<AdminLoginResponse> = await adminApi.post(
      "/admin/login",
      { email, password }
    );

    if (response.data.success && response.data.data) {
      // Store token and user info in localStorage
      localStorage.setItem("adminToken", response.data.data.token);
      localStorage.setItem(
        "adminUser",
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error: any) {
    console.error("Admin login error:", error);
    throw new Error(
      error.response?.data?.error || "Login failed. Please try again."
    );
  }
};

/**
 * Admin logout
 */
export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.href = "/admin/login";
};

/**
 * Get current admin user from localStorage
 */
export const getCurrentAdmin = (): AdminUser | null => {
  const userStr = localStorage.getItem("adminUser");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Check if admin is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("adminToken");
};

/**
 * Get admin profile
 */
export const getAdminProfile = async (): Promise<AdminUser> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: AdminUser }> =
      await adminApi.get("/admin/profile");
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching admin profile:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch profile"
    );
  }
};

/**
 * Get complaints (filtered by zone for Chief Engineers)
 */
export const getAdminComplaints = async (): Promise<AdminComplaintsResponse> => {
  try {
    const response: AxiosResponse<AdminComplaintsResponse> = await adminApi.get(
      "/admin/complaints"
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching admin complaints:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch complaints"
    );
  }
};

/**
 * Get single complaint by ID
 */
export const getComplaintById = async (
  complaintId: string
): Promise<Complaint> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: Complaint }> =
      await adminApi.get(`/admin/complaints/${complaintId}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching complaint:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch complaint"
    );
  }
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = async (
  complaintId: string,
  status: "reported" | "in_progress" | "resolved"
): Promise<Complaint> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: Complaint }> =
      await adminApi.patch(`/admin/complaints/${complaintId}/status`, {
        status,
      });
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating complaint status:", error);
    throw new Error(
      error.response?.data?.error || "Failed to update complaint status"
    );
  }
};

/**
 * Upload evidence image and mark complaint as resolved
 */
export const uploadEvidence = async (
  complaintId: string,
  file: File
): Promise<Complaint> => {
  try {
    const formData = new FormData();
    formData.append("evidence", file);

    const response: AxiosResponse<{
      success: boolean;
      data: Complaint;
      message: string;
    }> = await adminApi.post(
      `/admin/complaints/${complaintId}/evidence`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error("Error uploading evidence:", error);
    throw new Error(
      error.response?.data?.error || "Failed to upload evidence"
    );
  }
};

/**
 * Get admin statistics
 */
export const getAdminStats = async (): Promise<{
  stats: {
    total: number;
    reported: number;
    inProgress: number;
    resolved: number;
  };
  zoneBreakdown?: Array<{
    zone: string;
    zoneId: number;
    total: number;
    reported: number;
    inProgress: number;
    resolved: number;
  }>;
}> => {
  try {
    const response = await adminApi.get("/admin/stats");
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch statistics"
    );
  }
};

