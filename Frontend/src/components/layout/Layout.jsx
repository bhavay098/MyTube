import Navbar from "./Navbar.jsx";

import Sidebar from "./Sidebar.jsx";

const Layout = ({ children, onSearch }) => {
  return (
    <div className="min-h-screen bg-(--bg)">
      <Navbar onSearch={onSearch} />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
