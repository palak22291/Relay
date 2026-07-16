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

// Expired/invalid token → clear it and send the user to /login.
// Without this, a stale token looks "logged in" but every action silently 401s.
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("authToken");
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
