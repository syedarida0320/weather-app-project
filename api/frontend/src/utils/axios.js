import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Axios client with default headers and interceptors to add auth token to requests.
 * @returns {AxiosInstance} Axios client instance.
 */
const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Replace "token" with your storage key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default client;

// Usage
// import axios from "@/utils/axios";
// const response = await axios.get("/users");

