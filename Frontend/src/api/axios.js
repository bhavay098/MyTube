import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://mytube-wo5b.onrender.com/api/v1",
  withCredentials: true,
});

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     throw error;
//   },
// );

axiosInstance.interceptors.response.use(
  // Runs when request succeeds (status 2xx)
  // We simply return the response as it is
  (response) => response,

  // Runs when request fails
  async (error) => {
    // error.config contains the original failed request
    // Example:
    // {
    //   url: "/videos",
    //   method: "get",
    //   headers: {}
    // }
    const originalRequest = error.config;

    // Check if:
    // 1. Request failed because token expired (401)
    // 2. We have NOT already retried this request
    //
    // Optional chaining (?.) prevents crashes if
    // error.response does not exist
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      // Add custom flag to prevent infinite refresh loops
      // Axios does NOT create this automatically
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        //
        // Browser automatically sends refreshToken cookie
        // because withCredentials is true
        //
        // Backend responsibilities:
        // - verify refresh token
        // - generate new access token
        // - set new accessToken cookie
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`,

          // Empty body because cookies already contain tokens
          {},

          {
            // Important:
            // Allows browser to send cookies
            withCredentials: true,
          },
        );

        // After refresh succeeds:
        //
        // Retry the ORIGINAL failed request automatically
        //
        // Example:
        // GET /videos failed originally
        // It will now run again automatically
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token is also invalid/expired
        // User session is completely finished
        console.log("Refresh token expired");

        // Optional:
        // Redirect user to login page
        if (!originalRequest.suppressAuthRedirect) {
          window.location.href = "/login";
        }

        // Pass error forward
        throw refreshError;
      }
    }

    // If error is NOT a 401
    // OR request already retried once
    //
    // Pass original error forward
    throw error;
  },
);

export default axiosInstance;
