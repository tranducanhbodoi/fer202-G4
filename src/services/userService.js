import axios from "axios";

const API_URL = "http://localhost:3000/users";

export const getUsers = () => axios.get(API_URL);

export const deleteUser = (id) =>
  axios.delete(`${API_URL}/${id}`);