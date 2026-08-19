import { useEffect } from "react";

import { Routes, Route } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import Home from "./pages/Home.jsx";
import Landing from "./pages/Landing.jsx";
import Explore from "./pages/Explore.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VideoDetail from "./pages/VideoDetail.jsx";
import LikedVideos from "./pages/LikedVideos.jsx";
import WatchHistory from "./pages/WatchHistory.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Playlists from "./pages/Playlists.jsx";
import Settings from "./pages/Settings.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UploadVideo from "./pages/UploadVideo.jsx";
import Tweets from "./pages/Tweets.jsx";
import ChannelProfile from "./pages/ChannelProfile.jsx";
import { getCurrentUser } from "./services/auth.service.js";
import { setUser, logoutUser } from "./store/authSlice.js";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

const App = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Non-blocking background session restoration with 1-day inactivity check
  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async () => {
      try {
        const lastActive = localStorage.getItem("lastActiveAt");
        if (lastActive && Date.now() - Number(lastActive) > ONE_DAY_MS) {
          // More than 1 day of inactivity straight - auto log out
          localStorage.removeItem("lastActiveAt");
          dispatch(logoutUser());
          return;
        }

        const response = await getCurrentUser();
        if (isMounted && response?.data) {
          dispatch(setUser(response.data));
        }
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.error("Failed to hydrate auth state", error);
        }
      }
    };

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Rolling activity tracker to refresh lastActive timestamp while active
  useEffect(() => {
    const updateActivity = () => {
      const lastActive = localStorage.getItem("lastActiveAt");
      if (lastActive) {
        localStorage.setItem("lastActiveAt", Date.now().toString());
      }
    };

    window.addEventListener("click", updateActivity);
    window.addEventListener("keydown", updateActivity);

    return () => {
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keydown", updateActivity);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />

      <Route path="/explore" element={<Explore />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/video/:videoId" element={<VideoDetail />} />

      <Route
        path="/likes"
        element={
          <ProtectedRoute>
            <LikedVideos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <WatchHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <Playlists />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadVideo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tweets"
        element={
          <ProtectedRoute>
            <Tweets />
          </ProtectedRoute>
        }
      />

      <Route path="/channel/:username" element={<ChannelProfile />} />
    </Routes>
  );
};

export default App;
