import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); 

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
