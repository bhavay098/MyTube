import axiosInstance from "../api/axios.js";

export const createTweet = async (content) => {
  const response = await axiosInstance.post("/tweets", { content });
  return response.data.data;
};

export const getUserTweets = async (userId) => {
  const response = await axiosInstance.get(`/tweets/user/${userId}`);
  return response.data.data;
};

export const updateTweet = async (tweetId, editedContent) => {
  const response = await axiosInstance.patch(`/tweets/${tweetId}`, {
    editedContent,
  });
  return response.data.data;
};

export const deleteTweet = async (tweetId) => {
  const response = await axiosInstance.delete(`/tweets/${tweetId}`);
  return response.data;
};
