import axios from "axios";

const API = "http://localhost:9999";

export const getCategories = () => axios.get(`${API}/categories`);

export const createCategory = (data) =>
  axios.post(`${API}/categories`, data);

export const updateCategory = (id, data) =>
  axios.put(`${API}/categories/${id}`, data);

export const deleteCategoryWithRelations = async (categoryId) => {
  try {
    // 1. Lấy products
    const productsRes = await axios.get(`${API}/products`);
    const products = productsRes.data;

    // lọc product thuộc category
    const relatedProducts = products.filter(
      (p) => p.categoryId === categoryId
    );

    // 2. Lấy orders
    const ordersRes = await axios.get(`${API}/orders`);
    const orders = ordersRes.data;

    // 3. Xóa orders có chứa product thuộc category
    await Promise.all(
      orders.map(async (order) => {
        const hasProduct = order.items?.some((item) =>
          relatedProducts.find((p) => p.id === item.productId)
        );

        if (hasProduct) {
          await axios.delete(`${API}/orders/${order.id}`);
        }
      })
    );

    // 4. Xóa products
    await Promise.all(
      relatedProducts.map((p) =>
        axios.delete(`${API}/products/${p.id}`)
      )
    );

    // 5. Xóa category
    await axios.delete(`${API}/categories/${categoryId}`);

  } catch (error) {
    console.error("Delete category error:", error);
  }
};