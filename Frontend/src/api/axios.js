import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://mytube-wo5b.onrender.com/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.skipAuthRefresh
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          {},
          {
            withCredentials: true,
          },
        );

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid/expired
        const currentPath = window.location.pathname;
        const isPublicPage =
          ["/login", "/register", "/", "/explore"].includes(currentPath) ||
          currentPath.startsWith("/video/") ||
          currentPath.startsWith("/channel/");

        if (!originalRequest.suppressAuthRedirect && !isPublicPage) {
          window.location.href = "/login";
        }

        throw refreshError;
      }
    }

    throw error;
  },
);

export default axiosInstance;
