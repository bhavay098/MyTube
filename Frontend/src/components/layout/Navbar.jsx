import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Moon, Search, Sun } from "lucide-react";
import { toggleTheme } from "../../store/themeSlice.js";
import toast from "react-hot-toast";

import { logoutUser as logoutRequest } from "../../services/auth.service.js";
import { logoutUser as clearAuthUser } from "../../store/authSlice.js";

const Navbar = ({ onSearch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const theme = useSelector((state) => state.theme.mode);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleSearch = () => {
    if (typeof onSearch === "function") {
      onSearch(searchInput);
    }
    setSearchInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutRequest();
      dispatch(clearAuthUser());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      dispatch(clearAuthUser());
      toast.error(error?.response?.data?.message || "Logout failed");
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-(--border) bg-(--bg) backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-400 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xl font-extrabold tracking-[0.18em] text-(--text) sm:text-2xl"
          >
            MyTube
          </Link>
        </div>

        <div className="relative hidden w-full max-w-180 md:flex items-center">
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-l-full border border-(--border) bg-(--surface-2) py-2.5 pl-5 pr-4 text-sm text-(--text) placeholder:text-(--muted-strong) outline-none transition-colors duration-200 focus:border-(--accent)"
          />

          <button
            onClick={handleSearch}
            className="flex h-10.5 w-14 items-center justify-center rounded-r-full border border-l-0 border-(--border) bg-(--surface) transition-all duration-200 hover:bg-(--surface-2)"
          >
            <Search className="text-(--muted)" size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--text) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--surface-2)"
            aria-label={`Switch to ${
              theme === "dark" ? "light" : "dark"
            } theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hidden rounded-full border border-(--border) px-3 py-2 text-sm font-medium text-(--text) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--surface-2) sm:inline-flex sm:px-5"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-(--accent) px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--accent-strong) sm:px-5"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="h-10 w-10 rounded-full object-cover"
              />

              <span className="hidden text-sm font-medium text-(--text) sm:block">
                {user?.fullName}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full border border-(--border) px-3 py-2 text-sm font-medium text-(--text) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--surface-2) disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
