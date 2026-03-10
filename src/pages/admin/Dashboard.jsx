import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getUsers } from "../../services/userService";
import Visualized from "./Visualized";

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, categories, users] = await Promise.all([
          getProducts(),
          getCategories(),
          getUsers(),
        ]);

        setStats({
          products: products.data.length,
          categories: categories.data.length,
          users: users.data.length,
        });

      } catch (error) {
        console.error("Error loading dashboard:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <h4>Loading dashboard...</h4>;
  }

  return (
    <div>
      <h2 className="mb-4">Dashboard Overview</h2>

      <div className="row g-4">

        {/* PRODUCTS */}
        <div className="col-md-4">
          <div className="card text-center shadow border-0 bg-primary text-white h-100">
            <div className="card-body">
              <h1>📦</h1>
              <h3>{stats.products}</h3>
              <p className="mb-0">Products</p>
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="col-md-4">
          <div className="card text-center shadow border-0 bg-success text-white h-100">
            <div className="card-body">
              <h1>📂</h1>
              <h3>{stats.categories}</h3>
              <p className="mb-0">Categories</p>
            </div>
          </div>
        </div>

        {/* USERS */}
        <div className="col-md-4">
          <div className="card text-center shadow border-0 bg-warning text-dark h-100">
            <div className="card-body">
              <h1>👤</h1>
              <h3>{stats.users}</h3>
              <p className="mb-0">Users</p>
            </div>
          </div>
        </div>

      </div>

      {/* CHART + STATISTICS */}
      <div className="mt-5">
        <Visualized />
      </div>

    </div>
  );
};

export default Dashboard;
