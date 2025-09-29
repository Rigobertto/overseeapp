import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";

console.log("🌎 API_URL atual:", API_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para anexar o token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");

  if (token) {
    // garante que headers existe e usa o set
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
