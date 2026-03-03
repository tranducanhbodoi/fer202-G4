import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Container, Alert, Spinner, Card, Button } from "react-bootstrap";
import { createOrder } from "../../services/orderService";
import { clearCart } from "../../services/cartService";

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      // Lấy các tham số từ URL mà VNPay trả về
      const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

      if (vnp_ResponseCode === "00") {
        // Thanh toán thành công
        // Lấy thông tin đơn hàng đã lưu tạm thời
        const pendingOrderJSON = sessionStorage.getItem('pendingOrder');
        if (pendingOrderJSON) {
          const pendingOrder = JSON.parse(pendingOrderJSON);
          
          try {
            // Cập nhật trạng thái đơn hàng và tạo đơn hàng trong DB
            const finalOrder = { ...pendingOrder, status: 'processing' };
            await createOrder(finalOrder);
            
            // Xóa giỏ hàng
            await clearCart(pendingOrder.userId);

            // Xóa đơn hàng tạm
            sessionStorage.removeItem('pendingOrder');

            setStatus("success");
            setMessage("Thanh toán và đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
          } catch (error) {
            console.error("Lỗi khi tạo đơn hàng sau khi thanh toán:", error);
            setStatus("error");
            setMessage("Thanh toán thành công nhưng đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.");
          }
        } else {
          setStatus("error");
          setMessage("Không tìm thấy thông tin đơn hàng chờ xử lý. Giao dịch không hợp lệ.");
        }
      } else {
        // Thanh toán thất bại
        setStatus("error");
        setMessage(
          "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
        );
        // Xóa đơn hàng tạm nếu có
        sessionStorage.removeItem('pendingOrder');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
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
  );
};

export default VnpayReturn;