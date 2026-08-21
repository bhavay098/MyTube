import { useEffect, useState } from "react";

import Navbar from "./Navbar.jsx";

import Sidebar, { MobileSidebarDrawer } from "./Sidebar.jsx";

const Layout = ({ children, onSearch }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-(--bg)">
      <Navbar
        onSearch={onSearch}
        onMenuToggle={() => setIsMobileMenuOpen((current) => !current)}
        isMenuOpen={isMobileMenuOpen}
      />

      <MobileSidebarDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
