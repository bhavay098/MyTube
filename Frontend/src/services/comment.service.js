import axiosInstance from "../api/axios.js";

export const getVideoComments = async (videoId, { page = 1, limit = 10 } = {}) => {
  const response = await axiosInstance.get(`/comments/${videoId}`, {
    params: { page, limit },
  });
  return response.data.data;
};

export const addComment = async (videoId, content) => {
  const response = await axiosInstance.post(`/comments/${videoId}`, { content });
  return response.data.data;
};

export const deleteComment = async (commentId) => {
  const response = await axiosInstance.delete(`/comments/${commentId}`);
  return response.data;
};

