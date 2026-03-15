import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Carousel,
  Button,
  Col,
  Card,
  Badge,
  Form,
} from "react-bootstrap";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { addProductToCart } from "../services/cartService";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProducts = await getProducts();
        const foundProducts = responseProducts.data;
        setProducts(foundProducts);

        const foundProduct = responseProducts.data.find(
          (p) => p.id.toString() === id,
        );
        setProduct(foundProduct);

        const responseCategories = await getCategories();
        const foundCategories = responseCategories.data;
        setCategories(foundCategories);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [id]);

  // Kiểm tra trạng thái yêu thích khi sản phẩm được tải
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (product && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const favoritesKey = `favorites_${user.id}`;
        const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
        setIsFavorite(favorites.some((fav) => fav.id === product.id));
      } catch (e) {
        console.error("Lỗi khi kiểm tra sản phẩm yêu thích:", e);
        setIsFavorite(false);
      }
    } else {
      // Nếu không có sản phẩm hoặc người dùng, không phải là yêu thích
      setIsFavorite(false);
    }
  }, [product]);

  if (!product) {
    return (
      <>
        <Header />
        <Container className="text-center py-5">
          <h3>Không tìm thấy sản phẩm</h3>
        </Container>
        <Footer />
      </>
    );
  }

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleToggleFavorite = () => {
    // Lấy thông tin người dùng trực tiếp từ localStorage
    const storedUser = localStorage.getItem("user");
    let user = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", e);
    }

    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng chức năng yêu thích.");
      navigate("/login");
      return;
    }

    if (!product) return;

    const favoritesKey = `favorites_${user.id}`;
    const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    const productIndex = favorites.findIndex((fav) => fav.id === product.id);

    let updatedFavorites;

    if (productIndex > -1) {
      updatedFavorites = favorites.filter((fav) => fav.id !== product.id);
      setIsFavorite(false);
    } else {
      updatedFavorites = [...favorites, product];
      setIsFavorite(true);
    }

    localStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
  };

  const handleBuyNow = async () => {
    // Lấy thông tin người dùng trực tiếp từ localStorage
    const storedUser = localStorage.getItem("user");
    let user = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", e);
    }

    if (!user) {
      alert("Vui lòng đăng nhập để mua hàng.");
      navigate("/login");
      return;
    }

    if (!product) return;

    setIsBuying(true);
    try {
      // Thêm sản phẩm vào giỏ hàng
      await addProductToCart(user.id, product, quantity);
      // Chuyển hướng ngay đến trang thanh toán
      navigate("/checkout");
    } catch (error) {
      console.error("Lỗi khi thực hiện Mua ngay:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsBuying(false);
    }
  };

  const handleAddToCart = async () => {
    // Lấy thông tin người dùng trực tiếp từ localStorage
    const storedUser = localStorage.getItem("user");
    let user = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", e);
    }

    if (!user) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/login");
      return;
    }

    if (!product) return;

    setIsAdding(true);
    try {
      await addProductToCart(user.id, product, quantity);
      alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsAdding(false);
    }
  };

  const matchingProducts = products.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id,
  );

  const similarProductSize = 4;
  const groupProducts = [];
  for (
    let index = 0;
    index < matchingProducts.length;
    index += similarProductSize
  ) {
    groupProducts.push(
      matchingProducts.slice(index, index + similarProductSize),
    );
  }
  return (
    <>
      <Header />
      <Container className="my-5">
        <Row className="pb-5">
          <Col sm={1}>
            {discountPercent > 0 && (
              <Badge bg="danger" className=" fs-6">
                {discountPercent}% OFF
              </Badge>
            )}
          </Col>
          <Col sm={5}>
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="img-fluid rounded shadow"
                style={{ maxHeight: "500px", objectFit: "cover" }}
              />
            </div>
          </Col>
          <Col sm={6}>
            <h2 className="fw-bold">{product.name}</h2>
            <hr></hr>
            <div className="pb-3">
              <span className="fw-bold fs-5">Đánh Giá:</span>{" "}
              {"⭐".repeat(Math.round(product.rating))}
              <span className="text-dark ms-2">({product.rating})</span>{" "}
            </div>

            <div className="pb-3">
              <span className="fs-3 fw-bold text-danger">
                {product.price.toLocaleString()}₫
              </span>
            </div>

            <div className="pb-3">
              {" "}
              {product.originalPrice ? (
                <span
                  className="text-muted"
                  style={{ textDecoration: "line-through" }}
                >
                  {product.originalPrice.toLocaleString()}₫
                </span>
              ) : null}
            </div>
            <div>
              <p>{product.description}</p>
              <hr></hr>
              <p>
                <span className="fw-bold fs-5 me-3">Danh mục:</span>{" "}
                {
                  categories.find(
                    (category) => product.categoryId === category.id,
                  )?.name
                }
              </p>
            </div>

            <div className="pb-3">
              <span className="fw-bold fs-5 me-3">Kích thước:</span>
              {product.availableSizes.map((size, index) => (
                <Button
                  key={index}
                  variant={selectedSize === size ? "dark" : "outline-dark"}
                  className="me-2"
                  onClick={() => setSelectedSize(size)}
                  style={{ width: "50px" }}
                >
                  {size}
                </Button>
              ))}
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-5 me-3">Số Lượng:</span>
              <Button
                variant="outline-dark"
                onClick={decreaseQuantity}
                style={{ width: "40px" }}
              >
                -
              </Button>
              <Form className="d-inline">
                <Form.Control
                  type="number"
                  style={{ width: "70px" }}
                  value={quantity}
                  readOnly
                ></Form.Control>
              </Form>
              <Button
                variant="outline-dark"
                onClick={increaseQuantity}
                style={{ width: "40px" }}
              >
                +
              </Button>
            </div>
            <div className="pt-4">
              <Button
                variant="dark"
                className="me-3 px-4 py-2"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
              </Button>

              <Button
                variant="outline-dark"
                className="px-4 py-2"
                onClick={handleBuyNow}
                disabled={isBuying}
              >
                {isBuying ? "Đang xử lý..." : "Mua ngay"}
              </Button>

              <Button
                variant="outline-danger"
                className="ms-2 px-3 py-2 d-inline-flex align-items-center gap-2"
                onClick={handleToggleFavorite}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
                <span>{isFavorite ? "Đã yêu thích" : "Yêu thích"}</span>
              </Button>
            </div>
          </Col>
        </Row>
        <Row className="">
          <h2 className="fw-bold text-center pb-5">Sản phẩm tương tự</h2>

          {groupProducts.length > 0 ? (
            <>
              <Carousel interval={null}>
                {groupProducts.map((groupProduct, index) => (
                  <Carousel.Item key={index}>
                    <Row>
                      {groupProduct.map((item, index) => (
                        <Col sm={3} key={index}>
                          <Card
                            style={{
                              width: "18rem",
                              height: "25rem",
                              cursor: "pointer",
                              textDecoration: "none",
                            }}
                            className="mb-4 shadow-sm"
                            as={Link}
                            to={`/products/${item.id}`}
                          >
                            <Card.Img variant="top" src={item.image}></Card.Img>
                            <Card.Body className="text-center">
                              <Card.Title>{item.name}</Card.Title>
                              <Card.Text>{item.description}</Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Carousel.Item>
                ))}
              </Carousel>
            </>
          ) : null}
        </Row>
      </Container>

      <Footer />
    </>
  );
}
