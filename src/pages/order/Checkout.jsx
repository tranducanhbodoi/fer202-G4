import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCartByUserId, clearCart } from "../../services/cartService";
import { createOrder } from "../../services/orderService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const Checkout = () => {
  const userId = 2;

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    shippingAddress: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const cartData = await getCartByUserId(userId);

        if (!cartData || cartData.items.length === 0) {
          navigate("/cart");
          return;
        }
        setCart(cartData);
      } catch (err) {
        setError("Không thể tải thông tin giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [userId, navigate]);

  const totalAmount = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  }, [cart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.shippingAddress) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === "cod") {
      // Thanh toán COD
      try {
        const orderData = {
          userId,
          items: cart.items.map(({ productId, quantity, price }) => ({
            productId,
            quantity,
            price,
          })),
          totalAmount,
          shippingAddress: formData.shippingAddress,
          customerInfo: {
            fullName: formData.fullName,
            phone: formData.phone,
          },
          paymentMethod: "cod",
          status: "processing",
          date: new Date().toISOString(),
        };

        await createOrder(orderData);
        await clearCart(userId);

        alert("Đặt hàng thành công!");
        navigate("/orders");
      } catch (err) {
        setError("Lỗi tạo đơn hàng.");
        setIsSubmitting(false);
      }
    }

    // =======================
    // 🔥 THANH TOÁN VNPay
    // =======================
    if (paymentMethod === "vnpay") {
      try {
        // Lưu đơn hàng tạm vào session để xử lý sau khi return
        const orderPayload = {
          userId,
          items: cart.items.map(({ productId, quantity, price }) => ({
            productId,
            quantity,
            price,
          })),
          totalAmount,
          shippingAddress: formData.shippingAddress,
          customerInfo: {
            fullName: formData.fullName,
            phone: formData.phone,
          },
          paymentMethod: "vnpay",
          status: "pending_payment",
          date: new Date().toISOString(),
        };

        sessionStorage.setItem("pendingOrder", JSON.stringify(orderPayload));

        // Xử lý VNPay yêu cầu chuỗi không dấu
        const sanitizedFullName = formData.fullName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D");

        const orderInfo = `Thanh toan don hang ${sanitizedFullName}`.replace(
          /[^a-zA-Z0-9 ]/g,
          "",
        );

        const orderId = `${Date.now()}${userId}`;

        // Gọi backend tạo URL thanh toán
        const response = await axios.post(
          "http://localhost:1234/api/vnpay/create",
          {
            amount: totalAmount,
            orderInfo,
            orderId,
            ipAddr: "127.0.0.1",
          },
        );

        if (response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          throw new Error("Không nhận được paymentUrl");
        }
      } catch (err) {
        console.error(err);
        setError("Không tạo được yêu cầu thanh toán VNPay.");
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <h2>Đang tải...</h2>
      </Container>
    );
  }
  return (
    <>
      <Header />
      <Container className="my-5">
        <h1 className="mb-4">Thanh toán</h1>
        <Row>
          <Col md={7}>
            <Card>
              <Card.Header as="h5">Thông tin giao hàng</Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="fullName">
                    <Form.Label>Họ và tên</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="phone">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="shippingAddress">
                    <Form.Label>Địa chỉ giao hàng</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <hr />
                  <h5 className="mb-3">Phương thức thanh toán</h5>
                  <Form.Check
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    label="Thanh toán khi nhận hàng (COD)"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <Form.Check
                    type="radio"
                    id="vnpay"
                    name="paymentMethod"
                    label="Thanh toán qua VNPay"
                    checked={paymentMethod === "vnpay"}
                    onChange={() => setPaymentMethod("vnpay")}
                  />
                  <hr />
                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Hoàn tất đơn hàng"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={5}>
            <Card>
              <Card.Header as="h5">Tóm tắt đơn hàng</Card.Header>
              <ListGroup variant="flush">
                {cart?.items.map((item) => (
                  <ListGroup.Item
                    key={item.productId}
                    className="d-flex justify-content-between"
                  >
                    <span>
                      {item.product.name}{" "}
                      <small className="text-muted">
                        &times;{item.quantity}
                      </small>
                    </span>
                    <span>
                      {(item.product.price * item.quantity).toLocaleString(
                        "vi-VN",
                      )}
                    </span>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className="d-flex justify-content-between fw-bold fs-5">
                  <span>Tổng cộng</span>
                  <span>{totalAmount.toLocaleString("vi-VN")} VNĐ</span>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default Checkout;
