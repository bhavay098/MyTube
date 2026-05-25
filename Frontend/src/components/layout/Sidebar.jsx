import {
  Home,
  Heart,
  History,
  Folder,
  Users,
  Upload,
  MessageSquareText,
  Settings,
  CircleHelp,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Home",
    icon: Home,
    to: "/",
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
  `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 hover:bg-(--surface-2) hover:text-(--text) ${
    isActive ? "bg-(--surface-2) text-(--text)" : ""
  }`;

const mobileMenuLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl border border-(--border) px-4 py-3 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "border-(--accent) bg-(--surface-2) text-(--text)"
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
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close navigation menu"
      />

      <div
        className={`relative h-full w-72 max-w-[85vw] border-r border-(--border) bg-(--bg) text-(--text) shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-4">
          <div>
            <div className="text-base font-extrabold tracking-[0.18em]">MyTube</div>
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

        <div className="space-y-2 px-4 py-4">
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

        <div className="space-y-2 border-t border-(--border) px-4 py-4">
          <NavLink to="/dashboard" onClick={onClose} className={mobileMenuLinkClass}>
            <CircleHelp size={18} />
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
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r border-(--border) bg-(--bg) text-(--text) backdrop-blur lg:flex">
      <div className="space-y-2 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink to={item.to} key={item.title} className={menuLinkClass}>
              <Icon size={18} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-(--border) px-4 py-4">
        <NavLink to="/dashboard" className={menuLinkClass}>
          <CircleHelp size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/settings" className={menuLinkClass}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
export { MobileSidebarDrawer };
