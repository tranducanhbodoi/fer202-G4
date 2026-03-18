import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  Container,
  Row,
  Button,
  Col,
  Card,
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
  
  // ========== THÊM STATE CHO LỌC ==========
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // Lọc theo 1 danh mục
  const [selectedPrice, setSelectedPrice] = useState("all"); // Lọc theo khoảng giá
  
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

  // Mỗi khi thay đổi bộ lọc, reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [productsNameSearch, selectedCategoryId, selectedPrice, sortProducts]);

  // ========== LOGIC LỌC TỔNG HỢP ==========
  const filteredProducts = products.filter((product) => {
    // 1. Lọc theo tên (Search)
    const matchName = product.name
      .toLowerCase()
      .includes(productsNameSearch.toLowerCase());

    // 2. Lọc theo Danh mục
    const matchCategory = selectedCategoryId === "" || product.categoryId === selectedCategoryId;

    // 3. Lọc theo Giá
    let matchPrice = true;
    if (selectedPrice === "under_200") {
      matchPrice = product.price < 200000;
    } else if (selectedPrice === "200_500") {
      matchPrice = product.price >= 200000 && product.price <= 500000;
    } else if (selectedPrice === "over_500") {
      matchPrice = product.price > 500000;
    }

    return matchName && matchCategory && matchPrice;
  });

  // ========== LOGIC SẮP XẾP ==========
  const sortProductList = [...filteredProducts].sort((product, nextProduct) => {
    if (sortProducts === "fromHighRating") return nextProduct.rating - product.rating;
    if (sortProducts === "fromLowRating") return product.rating - nextProduct.rating;
    if (sortProducts === "fromHighestPrice") return nextProduct.price - product.price;
    if (sortProducts === "fromLowestPrice") return product.price - nextProduct.price;
    if (sortProducts === "fromNewProduct") return nextProduct.id - product.id;
    if (sortProducts === "fromOldProduct") return product.id - nextProduct.id;
    if (sortProducts === "fromAtoZ") return product.name.localeCompare(nextProduct.name, "vi");
    if (sortProducts === "fromZtoA") return nextProduct.name.localeCompare(product.name, "vi");
    return 0;
  });


  const indexOfLastProduct = currentPage * productPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productPerPage;
  const currentProducts = sortProductList.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <>
      <Header />
      <Container>
        <Row className="p-5">
  
          <Col sm={3}>
            <div className="sticky-top" style={{ top: "100px", zIndex: 1 }}>
              <h5 className="fw-bold mb-3">Danh Mục</h5>
              <ListGroup className="mb-4 shadow-sm">
                <ListGroup.Item 
                  action 
                  active={selectedCategoryId === ""}
                  onClick={() => setSelectedCategoryId("")}
                >
                  Tất cả sản phẩm
                </ListGroup.Item>
                {categories.map((category) => (
                  <ListGroup.Item 
                    key={category.id} 
                    action
                    active={selectedCategoryId === category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <h5 className="fw-bold mb-3">Khoảng Giá</h5>
              <div className="bg-white p-3 border rounded shadow-sm">
                <Form.Check
                  type="radio" label="Tất cả giá" name="price"
                  checked={selectedPrice === "all"}
                  onChange={() => setSelectedPrice("all")}
                  className="mb-2"
                />
                <Form.Check
                  type="radio" label="Dưới 200.000₫" name="price"
                  checked={selectedPrice === "under_200"}
                  onChange={() => setSelectedPrice("under_200")}
                  className="mb-2"
                />
                <Form.Check
                  type="radio" label="200.000₫ - 500.000₫" name="price"
                  checked={selectedPrice === "200_500"}
                  onChange={() => setSelectedPrice("200_500")}
                  className="mb-2"
                />
                <Form.Check
                  type="radio" label="Trên 500.000₫" name="price"
                  checked={selectedPrice === "over_500"}
                  onChange={() => setSelectedPrice("over_500")}
                />
              </div>
              
              <Button 
                variant="outline-danger" 
                className="w-100 mt-4"
                onClick={() => {
                  setProductsNameSearch("");
                  setSelectedCategoryId("");
                  setSelectedPrice("all");
                  setSortProducts("");
                }}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          </Col>

        
          <Col sm={9}>
            <div>
              <h3 className="fw-bold">Kết quả: {sortProductList.length} sản phẩm</h3>
              <hr />
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <Col md={7}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm theo tên..."
                      value={productsNameSearch}
                      onChange={(e) => setProductsNameSearch(e.target.value)}
                    />
                    <Button variant="dark">Tìm</Button>
                  </InputGroup>
                </Col>

                <Col md={4}>
                  <Form.Select
                    value={sortProducts}
                    onChange={(e) => setSortProducts(e.target.value)}
                  >
                    <option value="">Sắp xếp mặc định</option>
                    <option value="fromAtoZ">Tên từ A đến Z</option>
                    <option value="fromZtoA">Tên từ Z đến A</option>
                    <option value="fromHighestPrice">Giá: Cao đến Thấp</option>
                    <option value="fromLowestPrice">Giá: Thấp đến Cao</option>
                    <option value="fromNewProduct">Mới nhất</option>
                    <option value="fromHighRating">Đánh giá cao nhất</option>
                  </Form.Select>
                </Col>
              </div>
            </div>

            <Row>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <Col md={4} key={product.id} className="mb-4">
                    <Card
                      as={Link}
                      to={`/products/${product.id}`}
                      className="h-100 shadow-sm border-0 text-decoration-none"
                    >
                      <div className="overflow-hidden">
                        <Card.Img 
                          variant="top" 
                          src={product.image} 
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      </div>
                      <Card.Body className="text-center d-flex flex-column">
                        <Card.Title className="text-dark fs-6">{product.name}</Card.Title>
                        <div className="mt-auto">
                          <p className="mb-1">
                            <span className="fw-bold text-danger">
                              {product.price.toLocaleString()}₫
                            </span>
                          </p>
                          <div className="text-warning small">
                            {"⭐".repeat(Math.round(product.rating))}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col className="text-center py-5">
                  <h5 className="text-muted">Không tìm thấy sản phẩm phù hợp.</h5>
                </Col>
              )}
            </Row>

          
            {sortProductList.length > productPerPage && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  {[...Array(Math.ceil(sortProductList.length / productPerPage))].map((_, index) => (
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
            )}
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}