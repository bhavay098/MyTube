import axiosInstance from "../api/axios.js";

export const updateAccountDetails = async (payload) => {
  const response = await axiosInstance.patch("/users/update-account", payload);
  return response.data.data;
};

export const changePassword = async (payload) => {
  const response = await axiosInstance.post("/users/change-password", payload);
  return response.data;
};

export const updateAvatar = async (formData) => {
  const response = await axiosInstance.patch("/users/avatar", formData);
  return response.data.data;
};

export const updateCoverImage = async (formData) => {
  const response = await axiosInstance.patch("/users/cover-image", formData);
  return response.data.data;
};

export const getChannelProfileByUsername = async (username) => {
  const response = await axiosInstance.get(`/users/channel/${username}`);
  return response.data.data;
};

export const getWatchHistory = async () => {
  const response = await axiosInstance.get("/users/watch-history");
  return response.data.data;
};
