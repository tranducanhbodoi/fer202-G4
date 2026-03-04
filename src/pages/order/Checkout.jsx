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
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getCartByUserId, clearCart } from "../../services/cartService";
import { createOrder } from "../../services/orderService";
const Checkout = () => {
  // Giả sử userId được lấy từ context hoặc state quản lý đăng nhập.
  // Ở đây ta dùng tạm userId = 2 để demo.
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
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' or 'vnpay'

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const cartData = await getCartByUserId(userId);
        if (!cartData || cartData.items.length === 0) {
          // Nếu giỏ hàng trống, chuyển về trang giỏ hàng
          navigate("/cart");
          return;
        }
        setCart(cartData);
      } catch (err) {
        setError("Không thể tải thông tin giỏ hàng.");
        console.error(err);
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
      0
    );
  }, [cart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.shippingAddress) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === "cod") {
      // Xử lý thanh toán khi nhận hàng (COD)
      try {
        const orderData = {
          userId,
          items: cart.items.map(({ productId, quantity, price }) => ({ productId, quantity, price })),
          totalAmount,
          shippingAddress: formData.shippingAddress,
          customerInfo: { fullName: formData.fullName, phone: formData.phone },
          paymentMethod: "cod",
          status: "processing",
          date: new Date().toISOString(),
        };
        await createOrder(orderData);
        await clearCart(userId);
        alert("Đặt hàng thành công!");
        navigate("/orders");
      } catch (err) {
        setError("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.");
        console.error("Lỗi khi tạo đơn hàng COD:", err);
        setIsSubmitting(false);
      }
    } else if (paymentMethod === "vnpay") {
      // Xử lý thanh toán qua VNPay
      // 1. Chuẩn bị dữ liệu đơn hàng
      const orderPayload = {
        userId,
        items: cart.items.map(({ productId, quantity, price }) => ({ productId, quantity, price })),
        totalAmount,
        shippingAddress: formData.shippingAddress,
        customerInfo: { fullName: formData.fullName, phone: formData.phone },
        paymentMethod: "vnpay",
        status: "pending_payment", // Trạng thái chờ thanh toán, sẽ được cập nhật sau
        date: new Date().toISOString(),
      };

      try {
        // 2. Lưu thông tin đơn hàng vào sessionStorage để xử lý sau khi VNPay trả về
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderPayload));

        // 3. Mô phỏng việc gọi backend để tạo URL thanh toán
        const orderIdForVnpay = `${Date.now()}-${userId}`;
        const returnUrl = new URL('http://localhost:3000/payment/vnpay_return');
        returnUrl.searchParams.set('vnp_Amount', totalAmount);
        returnUrl.searchParams.set('vnp_TxnRef', orderIdForVnpay);
        returnUrl.searchParams.set('vnp_ResponseCode', '00'); // Mô phỏng thanh toán thành công
        const paymentUrl = returnUrl.toString();

        // 4. Chuyển hướng người dùng đến cổng thanh toán
        window.location.href = paymentUrl;
      } catch (err) {
        setError("Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
        console.error("Lỗi khi xử lý thanh toán VNPay:", err);
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <h2 className="mt-3">Đang tải trang thanh toán...</h2>
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

  return (
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
                  <Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="shippingAddress">
                  <Form.Label>Địa chỉ giao hàng</Form.Label>
                  <Form.Control as="textarea" rows={3} name="shippingAddress" value={formData.shippingAddress} onChange={handleInputChange} required />
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
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : "Hoàn tất đơn hàng"}
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
                <ListGroup.Item key={item.productId} className="d-flex justify-content-between">
                  <span>{item.product.name} <small className="text-muted">&times;{item.quantity}</small></span>
                  <span>{(item.product.price * item.quantity).toLocaleString("vi-VN")}</span>
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
  );
};

export default Checkout;