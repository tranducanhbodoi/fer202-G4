import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const AdminLayout = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="d-flex">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-grow-1">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center bg-white shadow-sm px-4 py-3">
          <h4 className="mb-0">Admin Dashboard</h4>

          <div>
            <span className="me-3 fw-bold">
              {currentUser.fullName}
            </span>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-4 bg-light" style={{ minHeight: "90vh" }}>
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
