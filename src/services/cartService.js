import axios from "axios";

const API_URL = "http://localhost:9999/carts";
const PRODUCT_API_URL = "http://localhost:9999/products";

/**
 * Lấy giỏ hàng theo ID của người dùng.
 * Hàm này sẽ tự động lấy chi tiết sản phẩm và gộp vào kết quả trả về.
 * @param {number | string} userId
 * @returns {Promise<object|null>} Giỏ hàng với chi tiết sản phẩm, hoặc null nếu không có.
 */
export const getCartByUserId = async (userId) => {
  // 1. Lấy giỏ hàng của user
  const cartResponse = await axios.get(`${API_URL}?userId=${userId}`);

  // json-server trả về một mảng, thường chỉ có 1 giỏ hàng cho mỗi user
  if (!cartResponse.data || cartResponse.data.length === 0) {
    return null; // Không tìm thấy giỏ hàng
  }

  const cart = cartResponse.data[0];

  if (!cart.items || cart.items.length === 0) {
    return cart; // Giỏ hàng rỗng, trả về luôn
  }

  // 2. Lấy ra tất cả productId từ các item trong giỏ hàng
  const productIds = cart.items.map((item) => item.productId);

  // 3. Tạo query string để lấy tất cả sản phẩm trong 1 lần gọi API
  // Ví dụ: /products?id=1&id=21
  const productQuery = productIds.map((id) => `id=${id}`).join("&");
  const productsResponse = await axios.get(`${PRODUCT_API_URL}?${productQuery}`);
  const products = productsResponse.data;

  // Tạo một map để tra cứu sản phẩm theo ID cho nhanh
  const productsMap = new Map(products.map((product) => [product.id, product]));

  // 4. Kết hợp thông tin sản phẩm vào các item trong giỏ hàng
  const detailedItems = cart.items.map((item) => ({
    ...item,
    product: productsMap.get(item.productId),
  }));

  // 5. Trả về giỏ hàng với thông tin sản phẩm đã được thêm vào
  return { ...cart, items: detailedItems };
};

/**
 * Tạo một giỏ hàng mới.
 * @param {object} data Dữ liệu giỏ hàng, ví dụ: { userId: 2, items: [] }
 */
export const createCart = (data) => axios.post(API_URL, data);

/**
 * Cập nhật giỏ hàng theo ID của giỏ hàng.
 * Dùng để thêm/sửa/xóa sản phẩm trong giỏ.
 * @param {number | string} id ID của giỏ hàng
 * @param {object} data Dữ liệu giỏ hàng được cập nhật
 */
export const updateCart = (id, data) => axios.put(`${API_URL}/${id}`, data);

/**
 * Xóa một giỏ hàng theo ID.
 * @param {number | string} id ID của giỏ hàng
 */
export const deleteCart = (id) => axios.delete(`${API_URL}/${id}`);

/**
 * Thêm một sản phẩm vào giỏ hàng.
 * - Nếu người dùng chưa có giỏ hàng, tạo giỏ hàng mới.
 * - Nếu sản phẩm đã có trong giỏ, tăng số lượng.
 * - Nếu sản phẩm chưa có, thêm vào giỏ.
 * @param {number | string} userId ID của người dùng
 * @param {object} product Đối tượng sản phẩm cần thêm
 * @param {number} quantity Số lượng cần thêm
 */
export const addProductToCart = async (userId, product, quantity = 1) => {
  const cartResponse = await axios.get(`${API_URL}?userId=${userId}`);
  let cart = cartResponse.data[0];

  // Nếu chưa có giỏ hàng, tạo mới
  if (!cart) {
    const newCartData = {
      userId,
      items: [
        {
          productId: product.id,
          quantity,
          price: product.price, // Lưu lại giá tại thời điểm thêm
        },
      ],
    };
    return createCart(newCartData);
  }

  // Nếu có giỏ hàng, cập nhật
  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId === product.id
  );

  if (existingItemIndex > -1) {
    // Sản phẩm đã có, cập nhật số lượng
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Sản phẩm chưa có, thêm mới
    cart.items.push({
      productId: product.id,
      quantity,
      price: product.price,
    });
  }

  return updateCart(cart.id, cart);
};

/**
 * Cập nhật số lượng của một sản phẩm trong giỏ hàng.
 * Nếu số lượng <= 0, sản phẩm sẽ bị xóa khỏi giỏ.
 * @param {number | string} userId ID của người dùng
 * @param {number | string} productId ID của sản phẩm
 * @param {number} quantity Số lượng mới
 */
export const updateItemQuantity = async (userId, productId, quantity) => {
  if (quantity <= 0) {
    return removeItemFromCart(userId, productId);
  }

  const cartResponse = await axios.get(`${API_URL}?userId=${userId}`);
  const cart = cartResponse.data[0];

  if (!cart) {
    throw new Error(`Cart not found for user with ID ${userId}`);
  }

  const itemIndex = cart.items.findIndex((item) => item.productId === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    return updateCart(cart.id, cart);
  }

  return cart; // Không làm gì nếu sản phẩm không có trong giỏ
};

/**
 * Xóa một sản phẩm khỏi giỏ hàng.
 * @param {number | string} userId ID của người dùng
 * @param {number | string} productId ID của sản phẩm cần xóa
 */
export const removeItemFromCart = async (userId, productId) => {
  const cartResponse = await axios.get(`${API_URL}?userId=${userId}`);
  const cart = cartResponse.data[0];

  if (!cart) {
    throw new Error(`Cart not found for user with ID ${userId}`);
  }

  const updatedItems = cart.items.filter((item) => item.productId !== productId);

  const updatedCart = { ...cart, items: updatedItems };
  return updateCart(cart.id, updatedCart);
};

/**
 * Xóa tất cả sản phẩm khỏi giỏ hàng của người dùng (thường sau khi đặt hàng thành công).
 * @param {number | string} userId ID của người dùng
 */
export const clearCart = async (userId) => {
  const cartResponse = await axios.get(`${API_URL}?userId=${userId}`);
  const cart = cartResponse.data[0];

  if (cart && cart.items.length > 0) {
    return updateCart(cart.id, { ...cart, items: [] });
  }

  return cart; // Trả về giỏ hàng không thay đổi nếu nó rỗng hoặc không tồn tại
};