import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from "react-bootstrap";
import { FaUserCircle, FaLock, FaShieldAlt } from "react-icons/fa";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { FaFacebook } from "react-icons/fa";
export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ fullName: "", phone: "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setFormData({ 
        fullName: storedUser.fullName || "", 
        phone: storedUser.phone || "" 
      });
    }
  }, []);

  // Kiểm tra xem đây có phải tài khoản MXH không
  const isSocialUser = user?.password === "social_login_user";

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:9999/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Không thể kết nối server!" });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "danger", text: "Mật khẩu mới và xác nhận không khớp!" });
      return;
    }
    
    if (user.password !== passwordData.oldPassword) {
      setMessage({ type: "danger", text: "Mật khẩu cũ không chính xác!" });
      return;
    }

    try {
      const response = await fetch(`http://localhost:9999/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      if (response.ok) {
        const updatedUser = { ...user, password: passwordData.newPassword };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi cập nhật mật khẩu!" });
    }
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <Container className="py-5" style={{ minHeight: "80vh" }}>
        <div className="text-center mb-5">
          <FaUserCircle size={80} className="text-secondary mb-3" />
          <h2 className="fw-bold">Thiết Lập Tài Khoản</h2>
          <p className="text-muted">Quản lý thông tin cá nhân và bảo mật</p>
        </div>

        {message.text && (
          <Row className="justify-content-center">
            <Col md={8}>
              <Alert variant={message.type} onClose={() => setMessage({type: "", text: ""})} dismissible>
                {message.text}
              </Alert>
            </Col>
          </Row>
        )}
        
        <Row className="g-4">
          {/* CỘT 1: THÔNG TIN CƠ BẢN */}
          <Col lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center">
                  <FaUserCircle className="me-2 text-primary" /> Thông tin cá nhân
                </h5>
                <Form onSubmit={handleUpdateInfo}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Email</Form.Label>
                    <Form.Control type="text" value={user.email} disabled className="bg-light" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Họ và tên</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Nhập họ tên..."
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Số điện thoại</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Nhập số điện thoại..."
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100 mt-2 py-2 fw-bold">
                    Lưu thay đổi
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* CỘT 2: BẢO MẬT / ĐỔI MẬT KHẨU */}
          <Col lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center">
                  <FaShieldAlt className="me-2 text-danger" /> Bảo mật hệ thống
                </h5>

                {isSocialUser ? (
                  /* Hiển thị thông báo cho người dùng FB/Google */
                  <div className="text-center py-4">
                    <div className="mb-3">
                      <FaFacebook size={40} className="text-primary" />
                    </div>
                    <h6>Bạn đang đăng nhập bằng Facebook/Google</h6>
                    <p className="text-muted small">
                      Mật khẩu của bạn được quản lý bởi tài khoản mạng xã hội. 
                      Bạn không cần phải thiết lập mật khẩu trên hệ thống này.
                    </p>
                    <Badge bg="info" className="px-3 py-2">Tài khoản liên kết</Badge>
                  </div>
                ) : (
                  /* Form đổi mật khẩu cho tài khoản thường */
                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Mật khẩu cũ</Form.Label>
                      <Form.Control 
                        type="password" 
                        placeholder="••••••••"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Mật khẩu mới</Form.Label>
                      <Form.Control 
                        type="password" 
                        placeholder="••••••••"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Xác nhận mật khẩu mới</Form.Label>
                      <Form.Control 
                        type="password" 
                        placeholder="••••••••"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        required
                      />
                    </Form.Group>
                    <Button variant="dark" type="submit" className="w-100 mt-2 py-2 fw-bold">
                      Cập nhật mật khẩu
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}


