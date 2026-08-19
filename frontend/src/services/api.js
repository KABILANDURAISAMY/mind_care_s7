import axios from "axios";

/**
 * Central Axios instance. The JWT is attached automatically to every
 * request, and a 401 response (expired/invalid token) triggers an
 * automatic logout + redirect so the app never gets stuck showing
 * stale authenticated UI with a dead token.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mindcare_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mindcare_token");
      localStorage.removeItem("mindcare_user");
      if (!window.location.pathname.includes("login")) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
