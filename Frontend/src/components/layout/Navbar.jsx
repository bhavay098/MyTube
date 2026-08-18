import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  Moon,
  Search,
  Sun,
  X,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { toggleTheme } from "../../store/themeSlice.js";
import toast from "react-hot-toast";

import { logoutUser as logoutRequest } from "../../services/auth.service.js";
import { logoutUser as clearAuthUser } from "../../store/authSlice.js";

const Navbar = ({ onMenuToggle, isMenuOpen, onSearch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const theme = useSelector((state) => state.theme.mode);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setDropdownOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-(--border) bg-(--bg)/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-400 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--text) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--surface-2) md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-0.5 text-xl font-bold tracking-tight sm:text-2xl"
          >
            <span className="text-(--accent)">My</span>
            <span className="text-(--text)">Tube</span>
          </Link>
        </div>

        {/* Desktop search */}
        <div className="relative hidden w-full max-w-180 items-center md:flex">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-l-full border border-(--border) bg-(--surface-2) py-2.5 pl-5 pr-4 text-sm text-(--text) placeholder:text-(--muted-strong) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />

          <button
            onClick={handleSearch}
            className="flex h-10.5 w-16 items-center justify-center rounded-r-full border border-l-0 border-(--border) bg-(--surface) transition-all duration-200 hover:bg-(--surface-2)"
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
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-(--border) py-1 pl-1 pr-3 transition-all duration-200 hover:border-(--accent) hover:bg-(--surface-2)"
              >
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden text-sm font-medium text-(--text) sm:block">
                  {user?.fullName?.split(" ")[0]}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-(--muted) transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="animate-fade-in-scale absolute right-0 top-full mt-2 w-56 rounded-2xl border border-(--border) bg-(--surface) p-2 shadow-2xl">
                  <div className="border-b border-(--border) px-3 py-3">
                    <p className="text-sm font-semibold text-(--text)">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-(--muted)">@{user?.username}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={`/channel/${user?.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--text) transition-colors hover:bg-(--surface-2)"
                    >
                      <User size={16} className="text-(--muted)" />
                      Your Channel
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--text) transition-colors hover:bg-(--surface-2)"
                    >
                      <LayoutDashboard size={16} className="text-(--muted)" />
                      Dashboard
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--text) transition-colors hover:bg-(--surface-2)"
                    >
                      <Settings size={16} className="text-(--muted)" />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-(--border) pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--error) transition-colors hover:bg-(--error-soft) disabled:opacity-50"
                    >
                      <LogOut size={16} />
                      {loggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-(--border) px-4 py-3 sm:px-6 md:hidden">
        <div className="relative flex w-full items-center">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-l-full border border-(--border) bg-(--surface-2) py-2.5 pl-5 pr-4 text-sm text-(--text) placeholder:text-(--muted-strong) outline-none transition-all duration-200 focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />

          <button
            onClick={handleSearch}
            className="flex h-10.5 w-14 items-center justify-center rounded-r-full border border-l-0 border-(--border) bg-(--surface) transition-all duration-200 hover:bg-(--surface-2)"
          >
            <Search className="text-(--muted)" size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
