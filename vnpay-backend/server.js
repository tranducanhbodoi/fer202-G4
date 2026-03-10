import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createPayment, verifyReturn } from "./vnpay.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API tạo URL thanh toán
app.post("/api/vnpay/create", createPayment);

// API xác thực thanh toán trả về từ VNPay
app.get("/api/vnpay/return", verifyReturn);

app.listen(1234, () => {
  console.log("VNPay backend running on port 1234");
});