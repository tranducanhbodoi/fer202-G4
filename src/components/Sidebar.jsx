import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="bg-dark text-white p-3" style={{ width: "250px", minHeight: "100vh" }}>
      <h4 className="text-center mb-4">ADMIN PANEL</h4>

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/dashboard">
            Dashboard
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/products">
            Products
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/categories">
            Categories
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/users">
            Users
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;