import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quantity, setQuantity] = useState(1);

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
            <p>{product.description}</p>
            <hr></hr>
            <p>
              <span className="fw-bold fs-5">Danh mục:</span>{" "}
              {
                categories.find(
                  (category) => product.categoryId === category.id,
                )?.name
              }
            </p>
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
              <Button variant="dark" className="me-3 px-4 py-2">
                Add to Cart
              </Button>

              <Button variant="outline-dark" className="px-4 py-2">
                Buy Now
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
