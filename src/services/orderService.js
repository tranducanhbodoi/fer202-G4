import axios from "axios";

const API_URL = "http://localhost:9999/orders";
const PRODUCT_API_URL = "http://localhost:9999/products";

/**
 * Lấy tất cả các đơn hàng (thường dùng cho trang admin).
 * Sắp xếp theo ngày mới nhất.
 */
export const getOrders = () => axios.get(`${API_URL}?_sort=date&_order=desc`);

/**
 * Lấy danh sách đơn hàng của một người dùng cụ thể, bao gồm chi tiết sản phẩm.
 * @param {number | string} userId ID của người dùng
 * @returns {Promise<Array<object>>} Mảng các đơn hàng với chi tiết sản phẩm.
 */
export const getOrdersByUserId = async (userId) => {
  // Lấy các đơn hàng của user, sắp xếp theo ngày mới nhất
  const ordersResponse = await axios.get(
    `${API_URL}?userId=${userId}&_sort=date&_order=desc`
  );
  const orders = ordersResponse.data;

  if (!orders || orders.length === 0) {
    return [];
  }

  // Lấy tất cả productId từ tất cả các đơn hàng để gọi API một lần duy nhất
  const allProductIds = orders.flatMap((order) =>
    order.items.map((item) => item.productId)
  );
  const uniqueProductIds = [...new Set(allProductIds)];

  if (uniqueProductIds.length === 0) {
    return orders; // Trả về đơn hàng nếu không có sản phẩm nào
  }

  // Lấy thông tin tất cả sản phẩm cần thiết
  const productQuery = uniqueProductIds.map((id) => `id=${id}`).join("&");
  const productsResponse = await axios.get(`${PRODUCT_API_URL}?${productQuery}`);
  const productsMap = new Map(productsResponse.data.map((p) => [p.id, p]));

  // Gắn thông tin sản phẩm vào từng item trong mỗi đơn hàng
  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      product: productsMap.get(item.productId),
    })),
  }));
};

/**
 * Tạo một đơn hàng mới.
 * @param {object} data Dữ liệu của đơn hàng mới.
 */
export const createOrder = (data) => axios.post(API_URL, data);

/**
 * Cập nhật một đơn hàng (ví dụ: thay đổi trạng thái).
 * @param {number | string} id ID của đơn hàng
 * @param {object} data Dữ liệu cần cập nhật (chỉ cần các trường thay đổi)
 */
export const updateOrder = (id, data) => axios.patch(`${API_URL}/${id}`, data);

/**
 * Xóa một đơn hàng (thường dùng cho admin).
 * @param {number | string} id ID của đơn hàng
 */
export const deleteOrder = (id) => axios.delete(`${API_URL}/${id}`);