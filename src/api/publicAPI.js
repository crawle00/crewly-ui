import axios from "axios";
import { API_URL, requestConfig } from "./config";

export async function register(user) {
  const response = await axios.post(`${API_URL}/auth/register`, user, requestConfig);
  return response.data;
}

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password }, requestConfig);
  return response.data;
}

export async function ping() {
  const response = await axios.get("/ping", requestConfig);
  return response.data;
}