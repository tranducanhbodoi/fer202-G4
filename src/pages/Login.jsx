import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../css/Auth.css";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(
                `http://localhost:9999/users?email=${email}&password=${password}`
            );
            const users = await response.json();

            if (users.length > 0) {
                const currentUser = users[0];
                localStorage.setItem("user", JSON.stringify(currentUser));

                if (currentUser.role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/home");
                }
            } else {
                setError("Email hoặc mật khẩu không chính xác!");
            }
        } catch (err) {
            setError("Không thể kết nối đến server.");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box">
                <h3 className="text-center mb-4">Đăng Nhập</h3>

                {error && <div className="alert alert-danger rounded-3">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Nhập email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Mật khẩu</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Nhập mật khẩu..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    <button type="submit" className="btn btn-primary btn-auth w-100 mb-3">
                        Đăng Nhập
                    </button>
                    
                    <div className="text-center mt-2">
                        <span className="text-muted">Chưa có tài khoản? </span>
                        <Link to="/register" className="text-decoration-none fw-bold">
                            Đăng ký ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;