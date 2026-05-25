import axiosInstance from "../api/axios.js";

export const toggleSubscription = async (channelId) => {
  const response = await axiosInstance.post(`/subscriptions/c/${channelId}`);
  return response.data;
};

export const getUserChannelSubscribers = async (channelId) => {
  const response = await axiosInstance.get(`/subscriptions/u/${channelId}`);
  return response.data.data;
};

export const getSubscribedChannels = async (subscriberId) => {
  const response = await axiosInstance.get(`/subscriptions/c/${subscriberId}`);
  return response.data.data;
};
