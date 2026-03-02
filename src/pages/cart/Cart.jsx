import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Image,
  CloseButton,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getCartByUserId,
  updateItemQuantity,
  removeItemFromCart,
} from "../../services/cartService";

const Cart = () => {
  // Giả sử userId được lấy từ context hoặc state quản lý đăng nhập.
  // Ở đây ta dùng tạm userId = 2 để demo.
  const userId = 2;

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCartByUserId(userId);
      setCart(cartData);
      setError(null);
    } catch (err) {
      setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const handleUpdateQuantity = async (productId, quantity) => {
    const newQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    const originalCart = cart; // Lưu lại state gốc để có thể rollback

    // Cập nhật giao diện ngay lập tức (Optimistic Update)
    const updatedCart = {
      ...cart,
      items: cart.items.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ),
    };
    setCart(updatedCart);

    try {
      await updateItemQuantity(userId, productId, newQuantity);
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
      alert("Đã xảy ra lỗi khi cập nhật số lượng sản phẩm.");
      setCart(originalCart); // Hoàn tác lại thay đổi trên UI nếu có lỗi
    }
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      const originalCart = cart; // Lưu lại state gốc
      // Cập nhật UI trước
      const updatedCart = {
        ...cart,
        items: cart.items.filter((item) => item.productId !== productId),
      };
      setCart(updatedCart);
      try {
        await removeItemFromCart(userId, productId);
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", err);
        alert("Đã xảy ra lỗi khi xóa sản phẩm.");
        setCart(originalCart); // Hoàn tác nếu có lỗi
      }
    }
  };

  const totalAmount = useMemo(() => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [cart]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h2 className="mt-3">Đang tải giỏ hàng...</h2>
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container className="text-center my-5">
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
        <Button as={Link} to="/" variant="primary">
          Tiếp tục mua sắm
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Giỏ hàng của bạn</h1>
      <Row>
        <Col lg={8}>
          {cart.items.map((item) => (
            <Card key={item.productId} className="mb-3">
              <Row className="g-0">
                <Col md={3} className="d-flex align-items-center justify-content-center p-2">
                  <Image src={item.product.image} alt={item.product.name} fluid rounded />
                </Col>
                <Col md={9}>
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <Card.Title as="h5">{item.product.name}</Card.Title>
                      <CloseButton onClick={() => handleRemoveItem(item.productId)} />
                    </div>
                    <Card.Text as="div"><small className="text-muted">Đơn giá: {item.product.price.toLocaleString("vi-VN")} VNĐ</small></Card.Text>
                    <Form.Group as={Row} className="align-items-center my-2"><Form.Label column sm="auto">Số lượng:</Form.Label><Col sm="auto"><Form.Control type="number" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.productId, e.target.value)} min="1" style={{ width: "80px" }} /></Col></Form.Group>
                    <Card.Text as="div" className="mt-2"><b>Thành tiền: {(item.product.price * item.quantity).toLocaleString("vi-VN")} VNĐ</b></Card.Text>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          ))}
        </Col>
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Body><Card.Title as="h5">Tóm tắt đơn hàng</Card.Title><hr /><div className="d-flex justify-content-between fw-bold fs-5"><span>Tổng cộng</span><span>{totalAmount.toLocaleString("vi-VN")} VNĐ</span></div><div className="d-grid mt-4"><Button as={Link} to="/checkout" variant="primary" size="lg">Tiến hành thanh toán</Button></div></Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
