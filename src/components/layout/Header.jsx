import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";

export default function Header() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCategories = await getCategories();
        setCategories(responseCategories.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const storedUser = localStorage.getItem("user");
  const currentUser = JSON.parse(storedUser);

  return (
    <Navbar bg="dark" variant="dark" className="shadow-sm py-3" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/home" className="fw-bold">
          Clothing Shop
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/shop">
              Catelog
            </Nav.Link>

            <NavDropdown title="Categories">
              {categories.map((category, index) => (
                <NavDropdown.Item
                  key={index}
                  as={Link}
                  to={`/category/${category.id}`}
                >
                  {category.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
          <Nav className="flex-grow-1 ms-4">
            <InputGroup className="w-75">
              <Form.Control
                type="text"
                placeholder="Tìm Kiếm Tên Sản Phẩm ... "
              ></Form.Control>
              <Button variant="outline-secondary"> Search</Button>
            </InputGroup>
          </Nav>

          <Nav>
            <Nav.Link as={Link} to="/cart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-cart"
                viewBox="0 0 16 16"
              >
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
              </svg>{" "}
              Cart
            </Nav.Link>

            {currentUser ? (
              <>
                <Nav.Link disabled className="text-light">
                  Xin Chào {currentUser?.fullName || currentUser?.email}!
                </Nav.Link>
                <Nav.Link
                  onClick={() => {
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
                >
                  Đăng Xuất
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Sign in
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
