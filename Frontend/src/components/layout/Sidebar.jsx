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

const Sidebar = () => {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r border-(--border) bg-(--bg) text-(--text) backdrop-blur lg:flex">
      <div className="space-y-2 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              to={item.to}
              key={item.title}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 hover:bg-(--surface-2) hover:text-(--text) ${
                  isActive ? "bg-(--surface-2) text-(--text)" : ""
                }`
              }
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-(--border) px-4 py-4">
        <NavLink
          to="/dashboard"
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 hover:bg-(--surface-2) hover:text-(--text)"
        >
          <CircleHelp size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/settings"
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 hover:bg-(--surface-2) hover:text-(--text)"
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
