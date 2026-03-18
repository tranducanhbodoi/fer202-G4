import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hasPurchased, setHasPurchased] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const resRev = await fetch(`http://localhost:9999/reviews?productId=${productId}`);
        const dataRev = await resRev.json();
        setReviews(dataRev.reverse());

    
        if (currentUser) {
          const resOrders = await fetch(`http://localhost:9999/orders?userId=${currentUser.id}`);
          const orders = await resOrders.json();


          const bought = orders.some(order => 
            order.items.some(item => String(item.productId) === String(productId))
          );
          setHasPurchased(bought);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [productId, currentUser?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    const newReview = {
      productId: String(productId),
      userId: currentUser.id,
      userName: currentUser.fullName || currentUser.email,
      rating: Number(rating),
      comment: comment,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:9999/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        const savedReview = await response.json();
        setReviews([savedReview, ...reviews]);
        setComment("");
        setRating(5);
        setError("");
      }
    } catch (err) {
      setError("Lỗi hệ thống, thử lại sau.");
    }
  };

  if (loading) return <p className="text-center mt-3 text-muted">Đang tải đánh giá...</p>;

  return (
    <div className="mt-5 pt-5 border-top">
      <h3 className="fw-bold mb-4 text-center">Đánh giá sản phẩm</h3>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="mb-5">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <Card key={rev.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold text-primary">{rev.userName}</span>
                      <small className="text-muted">{new Date(rev.date).toLocaleDateString("vi-VN")}</small>
                    </div>
                    <div className="text-warning my-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < rev.rating ? <FaStar /> : <FaRegStar />}</span>
                      ))}
                    </div>
                    <Card.Text>{rev.comment}</Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted">Chưa có đánh giá nào.</p>
            )}
          </div>

          <Card className="p-4 border-0 shadow-sm bg-light">
            <h5 className="fw-bold mb-3">Viết phản hồi</h5>
            
            {!currentUser ? (
              <div className="text-center py-2">
                <p>Vui lòng đăng nhập để đánh giá.</p>
                <Button as={Link} to="/login" variant="outline-dark">Đăng nhập</Button>
              </div>
            ) : !hasPurchased ? (
              <Alert variant="warning" className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Bạn cần mua sản phẩm này để có thể gửi đánh giá.
              </Alert>
            ) : (
              <Form onSubmit={handleSubmit}>
                {error && <p className="text-danger small">{error}</p>}
                <div className="mb-3 fs-4 text-warning">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span key={num} style={{ cursor: "pointer" }} onClick={() => setRating(num)}>
                      {num <= rating ? <FaStar /> : <FaRegStar />}
                    </span>
                  ))}
                </div>
                <Form.Control
                  as="textarea"
                  rows={3}
                  className="mb-3"
                  placeholder="Chia sẻ trải nghiệm của bạn sau khi dùng sản phẩm..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button variant="dark" type="submit">Gửi đánh giá ngay</Button>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}