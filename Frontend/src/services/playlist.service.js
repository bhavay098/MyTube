import axiosInstance from "../api/axios.js";

export const createPlaylist = async (payload) => {
  const response = await axiosInstance.post("/playlist", payload);
  return response.data.data;
};

export const getUserPlaylists = async (userId) => {
  const response = await axiosInstance.get(`/playlist/user/${userId}`);
  return response.data.data;
};

export const getPlaylistById = async (playlistId) => {
  const response = await axiosInstance.get(`/playlist/${playlistId}`);
  return response.data.data;
};

export const updatePlaylist = async (playlistId, payload) => {
  const response = await axiosInstance.patch(`/playlist/${playlistId}`, payload);
  return response.data.data;
};

export const deletePlaylist = async (playlistId) => {
  const response = await axiosInstance.delete(`/playlist/${playlistId}`);
  return response.data;
};

export const addVideoToPlaylist = async (videoId, playlistId) => {
  const response = await axiosInstance.patch(`/playlist/add/${videoId}/${playlistId}`);
  return response.data.data;
};

export const removeVideoFromPlaylist = async (videoId, playlistId) => {
  const response = await axiosInstance.patch(
    `/playlist/remove/${videoId}/${playlistId}`,
  );
  return response.data.data;
};
