import axiosInstance from "../api/axios.js";

/**
 * Sends a background health check request to wake up the server (e.g., Render free tier spin-up)
 * Safe and non-blocking.
 */
export const checkHealth = async () => {
  try {
    const response = await axiosInstance.get("/healthcheck", {
      skipAuthRefresh: true,
      suppressAuthRedirect: true,
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    // Non-blocking ping; server is either waking up or network unavailable
    console.debug("Healthcheck ping:", error?.message);
    return null;
  }
};
