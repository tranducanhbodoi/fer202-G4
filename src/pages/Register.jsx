import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../css/Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp. Vui lòng thử lại!");
      return;
    }

    try {
      const checkResponse = await fetch(
        `http://localhost:9999/users?email=${formData.email}`
      );
      const existingUsers = await checkResponse.json();

      if (existingUsers.length > 0) {
        setError("Email này đã được sử dụng. Vui lòng chọn email khác!");
        return;
      }

      const newUser = {
        email: formData.email,
        password: formData.password,
        fullName: "", 
        phone: "",
        role: "user",
      };

      const response = await fetch("http://localhost:9999/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setSuccess("Đăng ký thành công! Đang chuyển hướng...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Có lỗi xảy ra khi tạo tài khoản.");
      }
    } catch (err) {
      setError("Không thể kết nối đến server.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h3 className="text-center mb-4">Đăng Ký</h3>

        {error && <div className="alert alert-danger rounded-3">{error}</div>}
        {success && <div className="alert alert-success rounded-3">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Nhập email..."
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Mật khẩu</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                name="password"
                placeholder="Tạo mật khẩu..."
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                className="btn btn-outline-secondary d-flex align-items-center"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Xác nhận mật khẩu</label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu..."
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                className="btn btn-outline-secondary d-flex align-items-center"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-success btn-auth w-100 mb-3">
            Đăng Ký
          </button>
          
          <div className="text-center mt-2">
            <span className="text-muted">Đã có tài khoản? </span>
            <Link to="/login" className="text-decoration-none fw-bold">
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;