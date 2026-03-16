import { useEffect, useState } from "react";
import { getOrders, updateOrder } from "../../services/orderService";

const OrderManager = () => {

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const res = await getOrders();
    setOrders(res.data.reverse());
  };

  const handleStatusChange = async (order, status) => {
    await updateOrder(order.id, { ...order, status });
    loadOrders();
  };

  const filteredOrders = orders.filter((o) =>
    o.customerInfo?.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div>

      <h2 className="mb-4">Order Manager</h2>

      {/* SEARCH */}
      <input
        className="form-control mb-3"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="table table-bordered table-striped">

        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Change Status</th>
          </tr>
        </thead>

        <tbody>
          {currentOrders.map((o) => (

            <tr key={o.id}>
              <td>#{o.id}</td>

              <td>
                {new Date(o.date).toLocaleString("vi-VN")}
              </td>

              <td>
                {o.customerInfo?.fullName || "Guest"}
              </td>

              <td className="fw-bold text-danger">
                {formatCurrency(o.totalAmount)}
              </td>

              <td>
                <span className={`badge 
                ${o.status === "delivered"
                    ? "bg-success"
                    : o.status === "processing"
                    ? "bg-primary"
                    : "bg-warning text-dark"}`}>

                  {o.status === "delivered"
                    ? "Delivered"
                    : o.status === "processing"
                    ? "Processing"
                    : "Pending"}

                </span>
              </td>

              <td>

                <select
                  className="form-select"
                  value={o.status}
                  onChange={(e) =>
                    handleStatusChange(o, e.target.value)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                </select>

              </td>
            </tr>

          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center">

        {[...Array(totalPages)].map((_, index) => (

          <button
            key={index}
            className={`btn me-2 
            ${currentPage === index + 1
                ? "btn-primary"
                : "btn-outline-primary"}`}

            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>

        ))}

      </div>

    </div>
  );
};

export default OrderManager;