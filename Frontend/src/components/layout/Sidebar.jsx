import {
  Home,
  Compass,
  Heart,
  History,
  Folder,
  Users,
  Upload,
  MessageSquareText,
  Settings,
  LayoutDashboard,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const menuItems = [
  {
    title: "Home",
    icon: Home,
    to: "/",
  },
  {
    title: "Explore",
    icon: Compass,
    to: "/explore",
  },
  {
    title: "Liked Videos",
    icon: Heart,
    to: "/likes",
  },
  {
    title: "History",
    icon: History,
    to: "/history",
  },
  {
    title: "My Content",
    icon: Folder,
    to: "/playlists",
  },
  {
    title: "Subscribers",
    icon: Users,
    to: "/subscriptions",
  },
  {
    title: "Upload",
    icon: Upload,
    to: "/upload",
  },
  {
    title: "Tweets",
    icon: MessageSquareText,
    to: "/tweets",
  },
];

const menuLinkClass = ({ isActive }) =>
  `group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 hover:bg-(--surface-2) hover:text-(--text) ${
    isActive
      ? "bg-(--surface-2) text-(--text)"
      : "text-(--muted)"
  }`;

const ActiveIndicator = ({ isActive }) =>
  isActive ? (
    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-(--accent)" />
  ) : null;

const mobileMenuLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl border border-(--border) px-4 py-3 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "border-(--accent) bg-(--accent-soft) text-(--text)"
      : "bg-(--surface) text-(--muted) hover:bg-(--surface-2) hover:text-(--text)"
  }`;

const MobileSidebarDrawer = ({ open, onClose }) => {
  return (
    <div
      id="mobile-navigation-drawer"
      className={`fixed inset-0 z-[60] lg:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close navigation menu"
      />

      <div
        className={`relative flex h-full w-72 max-w-[85vw] flex-col border-r border-(--border) bg-(--bg) text-(--text) shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-4">
          <div>
            <div className="text-base font-extrabold tracking-[0.12em]">
              <span className="text-(--accent)">My</span>
              <span>Tube</span>
            </div>
            <div className="text-xs text-(--muted)">Navigation</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--text) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--surface-2)"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                to={item.to}
                key={item.title}
                onClick={onClose}
                className={mobileMenuLinkClass}
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="space-y-1.5 border-t border-(--border) px-4 py-4">
          <NavLink to="/dashboard" onClick={onClose} className={mobileMenuLinkClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/settings" onClick={onClose} className={mobileMenuLinkClass}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-(--border) bg-(--bg) text-(--text) lg:flex">
      <div className="space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink to={item.to} key={item.title} className={menuLinkClass}>
              {({ isActive }) => (
                <>
                  <ActiveIndicator isActive={isActive} />
                  <Icon
                    size={18}
                    className={`transition-colors duration-200 ${
                      isActive ? "text-(--accent)" : "text-(--muted) group-hover:text-(--text)"
                    }`}
                  />
                  <span>{item.title}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="border-t border-(--border) px-3 py-4">
        <div className="space-y-1">
          <NavLink to="/dashboard" className={menuLinkClass}>
            {({ isActive }) => (
              <>
                <ActiveIndicator isActive={isActive} />
                <LayoutDashboard
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-(--accent)" : "text-(--muted) group-hover:text-(--text)"
                  }`}
                />
                <span>Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink to="/settings" className={menuLinkClass}>
            {({ isActive }) => (
              <>
                <ActiveIndicator isActive={isActive} />
                <Settings
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-(--accent)" : "text-(--muted) group-hover:text-(--text)"
                  }`}
                />
                <span>Settings</span>
              </>
            )}
          </NavLink>
        </div>

        {user && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-3">
            <img
              src={user.avatar}
              alt={user.username}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-(--text)">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-(--muted)">
                @{user.username}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
export { MobileSidebarDrawer };
