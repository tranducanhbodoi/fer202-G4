import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import { getCategories } from "../../services/categoryService";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 7;

  const [form, setForm] = useState({
    name: "",
    price: "",
    categoryId: "",
    image: ""
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    const res = await getProducts();
    setProducts(res.data);
  };

  const loadCategories = async () => {
    const res = await getCategories();
    setCategories(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      alert("Please fill all required fields!");
      return;
    }

    if (editingId) {
      await updateProduct(editingId, form);
      setEditingId(null);
    } else {
      await createProduct(form);
    }

    setForm({
      name: "",
      price: "",
      categoryId: "",
      image: ""
    });

    loadProducts();
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  // SEARCH START WITH
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().startsWith(search.toLowerCase())
  );

  // PAGINATION
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div>
      <h2 className="mb-3">Product Manager</h2>

      {/* SEARCH */}
      <input
        className="form-control mb-3"
        placeholder="Search product..."
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* FORM */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
          >
            <option value="">Select Category</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) =>
              setForm({ ...form, image: e.target.value })
            }
          />
        </div>

        <div className="col-md-2">
          <button className="btn btn-primary w-100">
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th width="150">Action</th>
          </tr>
        </thead>

        <tbody>
          {currentProducts.map((p) => (
            <tr key={p.id}>
              <td>
                {p.image && (
                  <img src={p.image} width="50" alt="" />
                )}
              </td>

              <td>{p.name}</td>

              <td>{p.price}</td>

              <td>{p.categoryId}</td>

              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between mt-3">
        <span>
          Page {currentPage} / {totalPages || 1}
        </span>

        <div>
          <button
            className="btn btn-secondary btn-sm me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;