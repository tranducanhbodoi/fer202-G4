import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const AdminLayout = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // if (!currentUser || currentUser.role !== "admin") {
  //   return <Navigate to="/" />;
  // }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light" style={{ minHeight: "100vh" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;