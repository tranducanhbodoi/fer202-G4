import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from "react-icons/fa";
import "../css/Auth.css";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase";

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
                handleSuccessLogin(users[0]);
            } else {
                setError("Email hoặc mật khẩu không chính xác!");
            }
        } catch (err) {
            setError("Không thể kết nối đến json-server.");
        }
    };


    const handleSocialLogin = async (provider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const userFirebase = result.user; 

         
            const safeEmail = userFirebase.email || `${userFirebase.uid}@facebook.com`;

            
            const response = await fetch(`http://localhost:9999/users?email=${safeEmail}`);
            const existingUsers = await response.json();

            if (existingUsers.length > 0) {
                handleSuccessLogin(existingUsers[0]);
            } else {
                const newUser = {
                    email: safeEmail,
                    password: "social_login_user",
                    fullName: userFirebase.displayName || "Người dùng Facebook", 
                    phone: "",
                    role: "user"
                };

                const createRes = await fetch("http://localhost:9999/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser)
                });

                const createdUser = await createRes.json();
                handleSuccessLogin(createdUser);
            }
        } catch (err) {
            console.error("Lỗi đăng nhập MXH: ", err);
            setError("Đăng nhập bằng mạng xã hội thất bại. Vui lòng thử lại.");
        }
    };
    const handleSuccessLogin = (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role === "admin") {
            navigate("/admin/dashboard");
        } else {
            navigate("/home");
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

                    {/* Dòng chữ HOẶC */}
                    <div className="d-flex align-items-center my-3">
                        <hr className="flex-grow-1" />
                        <span className="mx-2 text-muted" style={{fontSize: "14px"}}>Hoặc đăng nhập với</span>
                        <hr className="flex-grow-1" />
                    </div>

                    {/* Nút Login MXH */}
                    <div className="d-flex gap-2">
                        <button 
                            type="button" 
                            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleSocialLogin(googleProvider)}
                        >
                            <FaGoogle /> Google
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleSocialLogin(facebookProvider)}
                        >
                            <FaFacebook /> Facebook
                        </button>
                    </div>
                    
                    <div className="text-center mt-4">
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