import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";

const Visualized = () => {
  // 1. Các State lưu dữ liệu gốc (Chỉ gọi API 1 lần)
  const [categoryStats, setCategoryStats] = useState([]);
  const [allOrders, setAllOrders] = useState([]); 
  
  // 2. Các State phục vụ việc chọn Năm
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 3. Các State hiển thị lên giao diện (Sẽ thay đổi khi đổi Năm)
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]); // Cho biểu đồ đường
  const [displayOrders, setDisplayOrders] = useState([]); // Cho bảng đơn hàng

  // Hiệu ứng 1: Gọi API lấy dữ liệu ngay khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducts, resCategories, resOrders] = await Promise.all([
          fetch("http://localhost:9999/products"),
          fetch("http://localhost:9999/categories"),
          fetch("http://localhost:9999/orders")
        ]);

        const products = await resProducts.json();
        const categories = await resCategories.json();
        const orders = await resOrders.json();

        // Xử lý Biểu đồ cột (Sản phẩm theo danh mục - không phụ thuộc vào năm)
        const catData = categories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          return { name: cat.name, "Số lượng SP": count };
        });
        setCategoryStats(catData);

        // Lấy ra danh sách các năm CÓ DATA từ đơn hàng (Dùng Set để loại bỏ trùng lặp)
        const years = [...new Set(orders.map(o => new Date(o.date).getFullYear()))];
        // Sắp xếp năm mới nhất lên đầu (VD: 2026, 2025...)
        years.sort((a, b) => b - a); 
        
        setAvailableYears(years);
        setAllOrders(orders); // Lưu toàn bộ đơn hàng vào kho gốc

        // Nếu năm hiện tại không có data, tự động chọn cái năm gần nhất có data
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(years[0]);
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, []); // Mảng rỗng = Chỉ chạy 1 lần duy nhất

  // Hiệu ứng 2: Tự động LỌC LẠI dữ liệu mỗi khi biến 'selectedYear' hoặc 'allOrders' thay đổi
  useEffect(() => {
    if (allOrders.length === 0) return;

    // 1. Lọc ra các đơn hàng CHỈ THUỘC VỀ NĂM ĐÃ CHỌN
    const ordersThisYear = allOrders.filter(order => new Date(order.date).getFullYear() === selectedYear);

    let total = 0;
    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      month: `Tháng ${i + 1}`, revenue: 0, orderCount: 0
    }));
    const revMap = {};

    // 2. Tính toán lại số liệu dựa trên các đơn hàng đã lọc
    ordersThisYear.forEach(order => {
      // Cộng tổng năm
      total += order.totalAmount;

      // Cộng dồn vào bảng 12 tháng
      const orderDate = new Date(order.date);
      const monthIndex = orderDate.getMonth();
      monthsData[monthIndex].revenue += order.totalAmount;
      monthsData[monthIndex].orderCount += 1;

      // Gom nhóm cho biểu đồ đường (Theo ngày)
      const dateStr = orderDate.toLocaleDateString('vi-VN');
      if (!revMap[dateStr]) revMap[dateStr] = 0;
      revMap[dateStr] += order.totalAmount;
    });

    // Cập nhật lên màn hình
    setTotalRevenue(total);
    setMonthlyRevenue(monthsData);
    
    // Ép kiểu dữ liệu cho biểu đồ đường
    const revData = Object.keys(revMap).map(date => ({
      date: date,
      "Doanh thu": revMap[date]
    }));
    setRevenueStats(revData);

    // Cập nhật bảng đơn hàng (chỉ hiện của năm đó, đảo ngược để đơn mới nhất lên đầu)
    setDisplayOrders([...ordersThisYear].reverse());

  }, [selectedYear, allOrders]); // Chìa khóa ở đây: Chạy lại hàm này khi selectedYear thay đổi

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="container-fluid mt-4">
      {/* Tiêu đề & Nút chọn Năm */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Báo Cáo Thống Kê</h2>
        <div className="d-flex align-items-center">
          <label className="fw-bold me-2 mb-0">Chọn Năm:</label>
          <select 
            className="form-select form-select-lg shadow-sm border-primary" 
            style={{ width: '150px' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>Năm {year}</option>
            ))}
            {availableYears.length === 0 && <option value={selectedYear}>{selectedYear}</option>}
          </select>
        </div>
      </div>

      {/* Ô Tổng doanh thu năm (Dynamic) */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0 bg-info text-white">
            <div className="card-body text-center py-4">
              <h4 className="text-uppercase mb-2">Tổng Doanh Thu Năm {selectedYear}</h4>
              <h1 className="display-4 fw-bold">{formatCurrency(totalRevenue)}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Sản Phẩm Theo Danh Mục (Tất cả)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Số lượng SP" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Biến Động Doanh Thu (Trong năm {selectedYear})</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="Doanh thu" stroke="#198754" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-5 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">Biến Động Doanh Thu 12 Tháng ({selectedYear})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 text-center">
                  <thead className="table-dark">
                    <tr>
                      <th>Tháng</th>
                      <th>Số Đơn Hàng</th>
                      <th>Doanh Thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRevenue.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{item.month}</td>
                        <td>{item.orderCount} đơn</td>
                        <td className={`fw-bold ${item.revenue > 0 ? 'text-success' : 'text-muted'}`}>
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Đơn Hàng Giao Dịch ({selectedYear})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Ngày Đặt</th>
                      <th>Khách Hàng</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{new Date(order.date).toLocaleString('vi-VN')}</td>
                        <td>{order.customerInfo?.fullName || "Khách ẩn danh"}</td>
                        <td className="fw-bold text-danger">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td>
                          <span className={`badge ${order.status === 'delivered' ? 'bg-success' : order.status === 'processing' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                            {order.status === 'delivered' ? 'Đã giao' : order.status === 'processing' ? 'Đang xử lý' : 'Chờ xác nhận'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {displayOrders.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-3 text-muted">Không có dữ liệu giao dịch trong năm {selectedYear}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualized;