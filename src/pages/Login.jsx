import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icon ở đây

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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="text-center mb-4">Đăng Nhập</h3>

                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
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
                                    <label className="form-label">Mật khẩu</label>
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

                                <button type="submit" className="btn btn-primary w-100 mb-3">
                                    Đăng nhập
                                </button>

                                <div className="text-center">
                                    <span>Chưa có tài khoản? </span>
                                    <Link to="/register" className="text-decoration-none">
                                        Đăng ký ngay
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;