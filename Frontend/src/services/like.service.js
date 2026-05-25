import axiosInstance from "../api/axios.js";

export const toggleVideoLike = async (videoId) => {
  const response = await axiosInstance.post(`/likes/toggle/v/${videoId}`);
  return response.data;
};

export const toggleCommentLike = async (commentId) => {
  const response = await axiosInstance.post(`/likes/toggle/c/${commentId}`);
  return response.data;
};

export const toggleTweetLike = async (tweetId) => {
  const response = await axiosInstance.post(`/likes/toggle/t/${tweetId}`);
  return response.data;
};

export const getLikedVideos = async () => {
  const response = await axiosInstance.get("/likes/videos");
  return response.data.data;
};
