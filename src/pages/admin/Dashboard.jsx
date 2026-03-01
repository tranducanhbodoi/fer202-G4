import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getUsers } from "../../services/userService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();
      const categories = await getCategories();
      const users = await getUsers();

      setStats({
        products: products.data.length,
        categories: categories.data.length,
        users: users.data.length,
      });
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="mb-4">Dashboard Overview</h2>

      <div className="row">
        <div className="col-md-4">
          <div className="card text-center bg-primary text-white">
            <div className="card-body">
              <h4>{stats.products}</h4>
              <p>Products</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <h4>{stats.categories}</h4>
              <p>Categories</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center bg-warning text-dark">
            <div className="card-body">
              <h4>{stats.users}</h4>
              <p>Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;