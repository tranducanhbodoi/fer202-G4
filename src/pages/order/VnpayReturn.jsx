import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Container, Alert, Spinner, Card, Button } from "react-bootstrap";
import axios from "axios";
import { createOrder } from "../../services/orderService";
import { clearCart } from "../../services/cartService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryParams = Object.fromEntries(searchParams.entries());

        if (Object.keys(queryParams).length === 0) {
          setStatus("error");
          setMessage("Không có thông tin giao dịch để xác thực.");
          return;
        }

        const response = await axios.get(
          "http://localhost:1234/order/vnpay_return",
          {
            params: queryParams,
          },
        );

        const { code, message: rspMessage } = response.data;

        if (code === "00") {
          // Giao dịch thành công
          const pendingOrderJSON = sessionStorage.getItem("pendingOrder");
          if (pendingOrderJSON) {
            const pendingOrder = JSON.parse(pendingOrderJSON);

            try {
              const finalOrder = { ...pendingOrder, status: "processing" };
              // await createOrder(finalOrder);
              await clearCart(pendingOrder.userId);
              sessionStorage.removeItem("pendingOrder");

              setStatus("success");
              setMessage(
                "Thanh toán và đặt hàng thành công! Cảm ơn bạn đã mua hàng.",
              );
            } catch (error) {
              console.error("Lỗi khi tạo đơn hàng sau khi thanh toán:", error);
              setStatus("error");
              setMessage(
                "Thanh toán thành công nhưng đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.",
              );
            }
          } else {
            setStatus("error");
            setMessage(
              "Không tìm thấy thông tin đơn hàng chờ xử lý. Giao dịch có thể đã được xử lý.",
            );
          }
        } else {
          // Giao dịch thất bại hoặc chữ ký không hợp lệ
          setStatus("error");
          setMessage(`Giao dịch thất bại: ${rspMessage} (Mã: ${code})`);
          sessionStorage.removeItem("pendingOrder");
        }
      } catch (error) {
        console.error("Lỗi khi xác thực thanh toán:", error);
        setStatus("error");
        setMessage(
          "Đã xảy ra lỗi trong quá trình xác thực thanh toán. Vui lòng liên hệ hỗ trợ.",
        );
        sessionStorage.removeItem("pendingOrder");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <>
    <Header />
    <Container className="my-5 d-flex justify-content-center">
      <Card style={{ width: "40rem" }}>
        <Card.Body className="text-center">
          {status === "loading" && (
            <>
              <Spinner animation="border" />
              <h4 className="mt-3">Đang xác thực thanh toán...</h4>
            </>
          )}
          {status === "success" && (
            <>
              <Alert variant="success">{message}</Alert>
              <Button as={Link} to="/orders" variant="primary">
                Xem lịch sử đơn hàng
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <Alert variant="danger">{message}</Alert>
              <Button as={Link} to="/checkout" variant="secondary">
                Thử lại thanh toán
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
    <Footer />
    </>
  );
};

export default VnpayReturn;