import axiosInstance from "../api/axios.js";

export const getChannelStats = async () => {
  const response = await axiosInstance.get("/dashboard/stats");
  return response.data.data;
};

export const getChannelVideos = async ({
  page = 1,
  limit = 10,
  sortType = "desc",
} = {}) => {
  const response = await axiosInstance.get("/dashboard/videos", {
    params: { page, limit, sortType },
  });
  return response.data.data;
};
