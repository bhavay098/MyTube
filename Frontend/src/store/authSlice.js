import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      try {
        localStorage.setItem("lastActiveAt", Date.now().toString());
      } catch (err) {
        console.debug("Failed to set lastActiveAt", err);
      }
    },

    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem("lastActiveAt");
      } catch (err) {
        console.debug("Failed to remove lastActiveAt", err);
      }
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;
