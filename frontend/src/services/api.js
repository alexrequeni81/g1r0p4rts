// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const getParts = async () => {
  const response = await axios.get(`${API_URL}/parts`);
  return response.data;
};

export const purchasePart = async (partId, quantity) => {
  const response = await axios.post(`${API_URL}/parts/purchase`, { partId, quantity });
  return response.data;
};
