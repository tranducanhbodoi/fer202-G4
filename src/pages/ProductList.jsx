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
  ListGroup,
  Form,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortProducts, setSortProducts] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsNameSearch, setProductsNameSearch] = useState("");
  const productPerPage = 9;
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

  const searchProducts = products.filter((product) => {
    const matchProductsName = product.name
      .toLowerCase()
      .startsWith(productsNameSearch.toLocaleLowerCase());
    return matchProductsName;
  });

  const sortProductList = [...searchProducts].sort((product, nextProduct) => {
    if (sortProducts === "fromHighRating") {
      return nextProduct.rating - product.rating;
    }
    if (sortProducts === "fromLowRating") {
      return product.rating - nextProduct.rating;
    }
    if (sortProducts === "fromHighestPrice") {
      return nextProduct.price - product.price;
    }
    if (sortProducts === "fromLowestPrice") {
      return product.price - nextProduct.price;
    }
    if (sortProducts === "fromNewProduct") {
      return nextProduct.id - product.id;
    }
    if (sortProducts === "fromOldProduct") {
      return product.id - nextProduct.id;
    }
    if (sortProducts === "fromAtoZ") {
      return product.name.localeCompare(nextProduct.name, "vi");
    }
    if (sortProducts === "fromZtoA") {
      return nextProduct.name.localeCompare(product.name, "vi");
    }
  });

  const indexOfLastProduct = currentPage * productPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productPerPage;

  const currentProducts = sortProductList.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );

  return (
    <>
      <Header></Header>
      <Container>
        <Row className="p-5">
          <Col sm={3}>
            <ListGroup>
              {categories.map((category, index) => (
                <ListGroup.Item key={index} as={Link}>
                  {category.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col sm={9}>
            <div>
              <h3 className="fw-bold">Danh sách sản phẩm</h3>
              <hr />
              <div className="d-flex justify-content-end align-items-center gap-2 m-3">
                <Col md={6}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm tên sản phẩm..."
                      value={productsNameSearch}
                      onChange={(event) =>
                        setProductsNameSearch(event.target.value)
                      }
                    />
                    <Button variant="outline-secondary">Search</Button>
                  </InputGroup>
                </Col>
                <Col md={3} className="text-md-end">
                  <Form.Label className="mb-0">Phân loại theo:</Form.Label>
                </Col>

                <Col md={3}>
                  <Form.Select
                    value={sortProducts}
                    onChange={(event) => setSortProducts(event.target.value)}
                  >
                    <option value="">Sắp xếp</option>
                    <option value="fromAtoZ">Tên từ A đến Z</option>
                    <option value="fromZtoA">Tên từ Z đến A</option>
                    <option value="fromHighestPrice">
                      Giá từ cao đến thấp
                    </option>
                    <option value="fromLowestPrice">Giá từ thấp đến cao</option>
                    <option value="fromNewProduct">Sản phẩm mới nhất</option>
                    <option value="fromOldProduct">Sản phẩm cũ nhất</option>
                    <option value="fromHighRating">
                      Đánh giá cao đến thấp
                    </option>
                    <option value="fromLowRating">Đánh giá thấp đến cao</option>
                  </Form.Select>
                </Col>
              </div>
            </div>

            <Row>
              {currentProducts.map((product, index) => (
                <Col sm={4} key={index}>
                  <Card
                    style={{
                      width: "18rem",
                      height: "28rem",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                    className="mb-4 shadow-sm"
                    as={Link}
                    to={`/products/${product.id}`}
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
                          <span
                            className="text-muted me-2"
                            style={{ textDecoration: "line-through" }}
                          >
                            {product.price.toLocaleString()}₫
                          </span>
                        </p>
                      </Card.Subtitle>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {[
                  ...Array(Math.ceil(sortProductList.length / productPerPage)),
                ].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </Col>
        </Row>
      </Container>
      <Footer></Footer>
    </>
  );
}
