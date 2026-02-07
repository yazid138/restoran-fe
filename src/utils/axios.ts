import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const axiosServices = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token from NextAuth session
axiosServices.interceptors.request.use(
  async (config) => {
    // Get session from NextAuth
    const session = await getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Handle other errors
    return Promise.reject(error);
  },
);

export default axiosServices;
