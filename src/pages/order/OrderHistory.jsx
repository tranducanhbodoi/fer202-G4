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

const OrderHistory = () => {
  // Giả sử userId được lấy từ context hoặc state quản lý đăng nhập.
  // Ở đây ta dùng tạm userId = 2 để demo.
  const userId = 2;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
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
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <h2 className="mt-3">Đang tải lịch sử đơn hàng...</h2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="text-center my-5">
        <h2>Bạn chưa có đơn hàng nào</h2>
        <p>Hãy bắt đầu mua sắm để lấp đầy giỏ hàng của bạn!</p>
        <Button as={Link} to="/" variant="primary">
          Bắt đầu mua sắm
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
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
  );
};

export default OrderHistory;