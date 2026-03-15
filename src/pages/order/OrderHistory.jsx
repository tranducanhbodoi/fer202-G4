import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Pagination,
  Modal,
  Image,
  ListGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getOrdersByUserId, updateOrder } from "../../services/orderService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const OrderHistory = () => {
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", error);
      return null;
    }
  });
  const userId = user ? user.id : null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userOrders = await getOrdersByUserId(userId);
        setOrders(userOrders);
        setError(null);
      } catch (err) {
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại.");
        console.error("Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Reset to first page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "delivered":
        return "success";
      case "processing":
        return "warning";
      case "cancelled":
        return "danger";
      case "pending_payment":
        return "info";
      default:
        return "secondary";
    }
  };

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation(); // Ngăn không cho modal chi tiết mở ra khi bấm nút hủy
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      setCancellingId(orderId);
      try {
        // Gọi service để cập nhật trạng thái đơn hàng
        await updateOrder(orderId, { status: "cancelled" });

        // Cập nhật lại state của orders để giao diện thay đổi ngay lập tức
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "cancelled" } : order,
          ),
        );
        alert("Đã hủy đơn hàng thành công.");
      } catch (err) {
        console.error("Lỗi khi hủy đơn hàng:", err);
        alert("Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại.");
      } finally {
        setCancellingId(null);
      }
    }
  };

  const handleShowDetails = (order) => setSelectedOrder(order);
  const handleCloseDetails = () => setSelectedOrder(null);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (statusFilter === "all") return true;
        return order.status === statusFilter;
      })
      .filter((order) => {
        if (!searchTerm.trim()) return true;
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        // Search by order ID
        if (order.id.toLowerCase().includes(lowercasedSearchTerm)) {
          return true;
        }
        // Search by product name
        return order.items.some(
          (item) =>
            item.product?.name.toLowerCase().includes(lowercasedSearchTerm),
        );
      });
  }, [orders, statusFilter, searchTerm]);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>,
      );
    }
    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Container className="text-center my-5" style={{ flex: 1 }}>
          <Spinner animation="border" />
          <h2 className="mt-3">Đang tải lịch sử đơn hàng...</h2>
        </Container>
      );
    }

    if (error) {
      return (
        <Container className="my-5" style={{ flex: 1 }}>
          <Alert variant="danger">{error}</Alert>
        </Container>
      );
    }

    if (!user) {
      return (
        <Container className="text-center my-5" style={{ flex: 1 }}>
          <h2>Vui lòng đăng nhập để xem lịch sử mua hàng</h2>
          <Button as={Link} to="/login" variant="primary" className="mt-3">
            Đi đến trang đăng nhập
          </Button>
        </Container>
      );
    }

    if (orders.length === 0) {
      return (
        <Container className="text-center my-5" style={{ flex: 1 }}>
          <h2>Bạn chưa có đơn hàng nào</h2>
          <p>Hãy bắt đầu mua sắm để lấp đầy giỏ hàng của bạn!</p>
          <Button as={Link} to="/" variant="primary">
            Bắt đầu mua sắm
          </Button>
        </Container>
      );
    }

    return (
      <Container className="my-5" style={{ flex: 1 }}>
        <h1 className="mb-4">Lịch sử mua hàng</h1>

        <Row className="mb-4">
          <Col md={8}>
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="processing">Đang xử lý</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
              <option value="pending_payment">Chờ thanh toán</option>
            </Form.Select>
          </Col>
        </Row>

        {filteredOrders.length > 0 ? (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Ngày Đặt</th>
                  <th>Sản phẩm</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleShowDetails(order)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="fw-bold">#{order.id}</td>
                    <td>{new Date(order.date).toLocaleDateString("vi-VN")}</td>
                    <td>
                      {order.items.map((item) => (
                        <div
                          key={`${order.id}-${item.productId}-${
                            item.size || "default"
                          }`}
                          className="mb-1"
                        >
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-dark text-decoration-none"
                          >
                            {item.product?.name || "Sản phẩm không tồn tại"}
                          </Link>
                          <small className="text-muted d-block">
                            {item.size && `Size: ${item.size} | `}
                            SL: {item.quantity} &times;{" "}
                            {item.price.toLocaleString("vi-VN")} VNĐ
                          </small>
                        </div>
                      ))}
                    </td>
                    <td className="fw-bold text-danger">
                      {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      {order.status === "processing" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => handleCancelOrder(e, order.id)}
                          disabled={cancellingId === order.id}
                        >
                          {cancellingId === order.id
                            ? "Đang hủy..."
                            : "Hủy đơn"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {renderPagination()}

            {/* Modal Chi tiết đơn hàng */}
            {selectedOrder && (
              <Modal
                show={!!selectedOrder}
                onHide={handleCloseDetails}
                size="lg"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    Chi tiết đơn hàng #{selectedOrder.id}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col md={6}>
                      <strong>Khách hàng:</strong>{" "}
                      {selectedOrder.customerInfo.fullName}
                    </Col>
                    <Col md={6}>
                      <strong>SĐT:</strong> {selectedOrder.customerInfo.phone}
                    </Col>
                  </Row>
                  <p className="mt-2">
                    <strong>Địa chỉ giao hàng:</strong>{" "}
                    {selectedOrder.shippingAddress}
                  </p>
                  <p>
                    <strong>Ngày đặt:</strong>{" "}
                    {new Date(selectedOrder.date).toLocaleString("vi-VN")}
                  </p>
                  <p>
                    <strong>Phương thức thanh toán:</strong>{" "}
                    {selectedOrder.paymentMethod}
                  </p>
                  <hr />
                  <h5>Các sản phẩm</h5>
                  <ListGroup variant="flush">
                    {selectedOrder.items.map((item, index) => (
                      <ListGroup.Item
                        key={`${item.productId}-${item.size || index}`}
                        className="px-0"
                      >
                        <Row className="align-items-center">
                          <Col xs={2} md={1}>
                            <Image src={item.product?.image} fluid rounded />
                          </Col>
                          <Col xs={6} md={7}>
                            <div>{item.product?.name}</div>
                            <small className="text-muted">
                              {item.size && `Size: ${item.size} | `}
                              Đơn giá: {item.price.toLocaleString("vi-VN")} VNĐ
                            </small>
                          </Col>
                          <Col xs={4} md={4} className="text-end">
                            <div>x {item.quantity}</div>
                            <strong>
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN",
                              )}{" "}
                              VNĐ
                            </strong>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <hr />
                  <div className="text-end fs-4 fw-bold text-danger">
                    Tổng cộng:{" "}
                    {selectedOrder.totalAmount.toLocaleString("vi-VN")} VNĐ
                  </div>
                </Modal.Body>
              </Modal>
            )}
          </>
        ) : (
          <Alert variant="info">Không tìm thấy đơn hàng nào phù hợp.</Alert>
        )}
      </Container>
    );
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      {renderContent()}
      <Footer />
    </div>
  );
};

export default OrderHistory;