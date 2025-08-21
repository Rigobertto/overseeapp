import { API_URL } from "@env";
import axios, { AxiosInstance } from "axios";
console.log("🌎 API_URL atual:", API_URL);
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default api;
