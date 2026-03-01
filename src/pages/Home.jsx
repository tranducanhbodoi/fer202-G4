import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  Container,
  Row,
  Carousel,
  Button,
  Col,
  Card,
  Badge,
} from "react-bootstrap";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { useEffect, useState } from "react";
import { Link, Links } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProducts = await getProducts();
        setProducts(responseProducts.data);
        const responseCategories = await getCategories();
        setCategories(responseCategories.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const highestRatingProduct = products.reduce((max, product) => {
    return product.rating > max.rating ? product : max;
  }, products[0]);

  const top6HighestRatingProducts = [...products]
    .sort((product, nexProduct) => product.rating - nexProduct.rating)
    .slice(0, 6);

  return (
    <>
      <Header></Header>
      <div className="Body">
        <div className="mb-5">
          <Carousel>
            <Carousel.Item>
              <img
                src={products[0]?.image}
                className="d-block w-100"
                style={{ height: "30rem", objectFit: "cover" }}
                alt=""
              />
              <Carousel.Caption>
                <div className="text-start">
                  <h3>First slide label</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Assumenda quos dignissimos minima praesentium iste quisquam
                    quibusdam, temporibus et enim totam vitae? Error pariatur
                    temporibus corporis qui tempore dignissimos obcaecati
                    veritatis.
                  </p>
                  <Button>Shop Now</Button>
                </div>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                src={products[1]?.image}
                className="d-block w-100"
                style={{ height: "30rem", objectFit: "cover" }}
                alt=""
              />
              <Carousel.Caption>
                <div className="text-start">
                  <h3>First slide label</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Assumenda quos dignissimos minima praesentium iste quisquam
                    quibusdam, temporibus et enim totam vitae? Error pariatur
                    temporibus corporis qui tempore dignissimos obcaecati
                    veritatis.
                  </p>
                  <Button>Shop Now</Button>
                </div>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                src={products[2]?.image}
                className="d-block w-100"
                style={{ height: "30rem", objectFit: "cover" }}
                alt=""
              />
              <Carousel.Caption>
                <div className="text-start">
                  <h3>First slide label</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Assumenda quos dignissimos minima praesentium iste quisquam
                    quibusdam, temporibus et enim totam vitae? Error pariatur
                    temporibus corporis qui tempore dignissimos obcaecati
                    veritatis.
                  </p>
                  <Button>Shop Now</Button>
                </div>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </div>

        <Container>
          <div className="mb-5">
            <div className="text-center mb-4">
              <p className="text-muted text-uppercase mb-2">New Products</p>
              <h3 className="fw-bold text-uppercase">Shop the New Arrivals</h3>
            </div>

            <div>
              <Row>
                {products.slice(0, 4).map((product, index) => (
                  <Col key={index}>
                    <Card
                      style={{ width: "18rem", height: "28rem" }}
                      className="mb-4"
                    >
                      <Card.Img variant="top" src={product.image}></Card.Img>
                      <Card.Body className="text-center">
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>{product.description}</Card.Text>
                        <Card.Subtitle>
                          <p>
                            <span className="fs-4 fw-bold text-danger me-3">
                              {product.price.toLocaleString()}₫
                            </span>
                            {"  "}
                            <del className="text-muted me-2">
                              {highestRatingProduct.originalPrice.toLocaleString()}
                              ₫
                            </del>
                          </p>
                        </Card.Subtitle>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <div className="text-center">
              <Button>Show More</Button>
            </div>
          </div>

          <div className="mb-5">
            <div className="text-center">
              <p className="text-muted text-uppercase mb-2">Best Products</p>
              <h3 className="fw-bold text-uppercase">Deal of today</h3>
            </div>
            <div>
              <Row className="align-items-center py-5">
                {highestRatingProduct && (
                  <>
                    <Col md={6} className="text-center mb-4 mb-md-0">
                      <div className="position-relative">
                        <img
                          src={highestRatingProduct.image}
                          alt={highestRatingProduct.name}
                          className="img-fluid rounded shadow"
                          style={{ maxHeight: "500px", objectFit: "cover" }}
                        />
                        <Badge
                          bg="danger"
                          className="position-absolute top-0 start-0 m-3 fs-6"
                        >
                          HOT
                        </Badge>
                      </div>
                    </Col>

                    <Col md={6}>
                      <p className="text-muted text-uppercase small mb-2">
                        Best Rated Product
                      </p>

                      <h2 className="fw-bold mb-3">
                        {highestRatingProduct.name}
                      </h2>

                      <div className="d-flex align-items-center mb-3">
                        <span className="fs-3 fw-bold text-danger me-3">
                          {highestRatingProduct.price.toLocaleString()}₫
                        </span>

                        <span className="text-muted text-decoration-line-through me-2">
                          {highestRatingProduct.originalPrice.toLocaleString()}₫
                        </span>

                        <Badge bg="dark" className="px-2 py-1">
                          {Math.round(
                            ((highestRatingProduct.originalPrice -
                              highestRatingProduct.price) /
                              highestRatingProduct.originalPrice) *
                              100,
                          )}
                          % OFF
                        </Badge>
                      </div>

                      <div className="mb-3 text-warning fs-5">
                        {"⭐".repeat(Math.round(highestRatingProduct.rating))}
                        <span className="text-dark ms-2">
                          ({highestRatingProduct.rating})
                        </span>
                      </div>

                      <p className="text-muted lh-lg">
                        {highestRatingProduct.description}
                      </p>

                      <div className="mt-4">
                        <button className="btn btn-dark me-3 px-4 py-2">
                          Add to Cart
                        </button>
                        <button className="btn btn-outline-dark px-4 py-2">
                          View Details
                        </button>
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-muted text-uppercase mb-2">Hot Products</p>
            <h3 className="fw-bold text-uppercase">
              Shop The Featured products
            </h3>
          </div>

          <div>
            <Row className="g-4">
              {top6HighestRatingProducts.map((product) => (
                <Col md={6} lg={4} key={product.id}>
                  <Card className="h-100 border-0 shadow-sm product-card">
                    <div className="overflow-hidden">
                      <Card.Img
                        variant="top"
                        src={product.image}
                        style={{
                          height: "250px",
                          objectFit: "cover",
                        }}
                        className="product-image"
                      />
                    </div>

                    <Card.Body className="text-center d-flex flex-column">
                      <Card.Title className="fw-semibold">
                        {product.name}
                      </Card.Title>

                      <div className="text-warning mb-2">
                        {"⭐".repeat(Math.round(product.rating))}
                        <span className="text-dark ms-2">
                          ({product.rating})
                        </span>
                      </div>

                      <Card.Text className="text-muted small flex-grow-1">
                        {product.description}
                      </Card.Text>

                      <div className="mt-3">
                        <span className="fs-5 fw-bold text-danger me-2">
                          {product.price.toLocaleString()}₫
                        </span>

                        <span className="text-muted text-decoration-line-through small">
                          {product.originalPrice.toLocaleString()}₫
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </div>
      <Footer></Footer>
    </>
  );
}
