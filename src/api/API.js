import axios from "axios";

export async function login(email, password) {
  const response = await axios.post(
    "http://localhost:3000/api/v1/auth/login",
    { email, password },
    { withCredentials: true },
  );
  return response.data;
}

export async function getUsers() {
  const response = await axios.get("http://localhost:3000/api/v1/users", {
    withCredentials: true,
  });
  return response.data;
}
