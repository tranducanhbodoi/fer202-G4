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
  ListGroup
} from "react-bootstrap";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { useEffect, useState } from "react";

export default function ProductList() {
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

  return (
    <>
      <Header></Header>
      <Container>
        <Row>
          <Col sm={3}>
            <ListGroup>
              <ListGroup.Item>Cras justo odio</ListGroup.Item>
              <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
              <ListGroup.Item>Morbi leo risus</ListGroup.Item>
              <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
              <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col sm={9}></Col>
        </Row>
      </Container>
      <Footer></Footer>
    </>
  );
}
