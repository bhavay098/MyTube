import axiosInstance from "../api/axios.js";

export const loginUser = async (userData) => {
  const response = await axiosInstance.post("/users/login", userData);

  return response.data;
};

export const registerUser = async (formData) => {
  const response = await axiosInstance.post("/users/register", formData);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/users/current-user", {
    suppressAuthRedirect: true,
  });

  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post(
    "/users/logout",
    {},
    {
      skipAuthRefresh: true,
      suppressAuthRedirect: true,
    },
  );

  return response.data;
};
