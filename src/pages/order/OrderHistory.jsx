import React, { useState, useEffect } from "react";
import {
  Container,
  Accordion,
  Card,
  Row,
  Col,
  Image,
  Badge,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getOrdersByUserId } from "../../services/orderService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const OrderHistory = () => {
  const [user, setUser] = useState(() => {
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

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "delivered":
        return "success";
      case "processing":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Container className="text-center my-5" style={{ flex: 1 }}>
          <Spinner animation="border" />
          <h2 className="mt-3">Đang tải lịch sử đơn hàng...</h2>
        </Container>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Container className="my-5" style={{ flex: 1 }}>
          <Alert variant="danger">{error}</Alert>
        </Container>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Container className="text-center my-5" style={{ flex: 1 }}>
          <h2>Vui lòng đăng nhập để xem lịch sử mua hàng</h2>
          <Button as={Link} to="/login" variant="primary" className="mt-3">
            Đi đến trang đăng nhập
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Container className="text-center my-5" style={{ flex: 1 }}>
          <h2>Bạn chưa có đơn hàng nào</h2>
          <p>Hãy bắt đầu mua sắm để lấp đầy giỏ hàng của bạn!</p>
          <Button as={Link} to="/" variant="primary">
            Bắt đầu mua sắm
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container className="my-5" style={{ flex: 1 }}>
        <h1 className="mb-4">Lịch sử mua hàng</h1>
        <Accordion defaultActiveKey="0">
          {orders.map((order, index) => (
            <Accordion.Item eventKey={String(index)} key={order.id}>
              <Accordion.Header>
                <div className="d-flex w-100 justify-content-between align-items-center pe-3">
                  <div>
                    <strong>Đơn hàng #{order.id}</strong>
                    <span className="ms-3 text-muted">
                      Ngày đặt: {new Date(order.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <Badge bg={getStatusBadgeVariant(order.status)} pill>
                    {order.status}
                  </Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <p><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress}</p>
                <p><strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString("vi-VN")} VNĐ</p>
                <hr />
                <h6>Các sản phẩm trong đơn:</h6>
                {order.items.map((item) => (
                  <Card key={item.productId} className="mb-2 border-0">
                    <Row className="g-0">
                      <Col xs={2} md={1}>
                        <Image src={item.product?.image} thumbnail />
                      </Col>
                      <Col xs={10} md={11} className="ps-3">
                        <div>{item.product?.name || "Sản phẩm không tồn tại"}</div>
                        <small className="text-muted">
                          Số lượng: {item.quantity} &times; {item.price.toLocaleString("vi-VN")} VNĐ
                        </small>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
      <Footer />
    </div>
  );
};

export default OrderHistory;