import axios from "axios";

const API_URL = "http://localhost:9999/users";

export const getUsers = () => axios.get(API_URL);

export const deleteUser = (id) =>
  axios.delete(`${API_URL}/${id}`);

export const updateUser = (id, user) => 
  axios.put(`${API_URL}/${id}`, user);
export const deleteUserWithOrders = async (userId) => {
  // lấy tất cả orders
  const orders = await axios.get(`${API_URL}/orders`);

  // lọc order của user đó
  const relatedOrders = orders.data.filter(
    (o) => o.userId === userId
  );

  // xóa từng order
  await Promise.all(
    relatedOrders.map((o) =>
      axios.delete(`${API_URL}/orders/${o.id}`)
    )
  );

  // xóa user
  await axios.delete(`${API_URL}/users/${userId}`);
};