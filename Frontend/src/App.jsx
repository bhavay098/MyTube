import { useEffect, useState } from "react";

import { Routes, Route } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import Home from "./pages/Home.jsx";
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
import { setUser } from "./store/authSlice.js";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

const App = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const [authHydrated, setAuthHydrated] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async () => {
      try {
        const response = await getCurrentUser();
        dispatch(setUser(response?.data));
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.error("Failed to hydrate auth state", error);
        }
      } finally {
        if (isMounted) {
          setAuthHydrated(true);
        }
      }
    };

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (!authHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg) text-(--muted)">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

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

      <Route
        path="/channel/:username"
        element={
          <ProtectedRoute>
            <ChannelProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
