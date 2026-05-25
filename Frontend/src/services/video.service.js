import axiosInstance from "../api/axios.js";

export const getAllVideos = async ({
  page = 1,
  limit = 12,
  query = "",
  sortBy = "createdAt",
  sortType = "desc",
} = {}) => {
  const response = await axiosInstance.get("/videos", {
    params: {
      page,
      limit,
      query,
      sortBy,
      sortType,
    },
  });

  return response.data.data;
};

export const getVideoById = async (videoId) => {
  const response = await axiosInstance.get(`/videos/${videoId}`);
  return response.data.data;
};

export const publishVideo = async (formData) => {
  const response = await axiosInstance.post("/videos", formData);
  return response.data.data;
};

export const updateVideo = async (videoId, formData) => {
  const response = await axiosInstance.patch(`/videos/${videoId}`, formData);
  return response.data.data;
};

export const deleteVideo = async (videoId) => {
  const response = await axiosInstance.delete(`/videos/${videoId}`);
  return response.data;
};

export const toggleVideoPublishStatus = async (videoId) => {
  const response = await axiosInstance.patch(`/videos/toggle/publish/${videoId}`);
  return response.data.data;
};
