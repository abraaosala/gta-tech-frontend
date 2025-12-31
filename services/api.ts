import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem("access_token");
        // Call refresh endpoint - assuming it needs the old token in header or body
        // Using axios directly to avoid interceptor loop if refresh fails with 401
        const response = await axios.post("http://localhost:8000/api/refresh", {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const { token: newToken } = response.data; // Assuming backend returns { token: "..." } or similar

        // If backend returns 'authorisation' object structure (common in some laravel setups)
        // const newToken = response.data.authorisation.token; 

        // Let's assume standard structure based on typical JWT auth, usually access_token or token
        // If looking at previous AuthController usage (not shown deep but inferred), let's handle commonly used structure.
        // Or store whatever comes back.

        if (response.data.access_token || response.data.token) {
          const finalToken = response.data.access_token || response.data.token;

          localStorage.setItem("access_token", finalToken);
          api.defaults.headers["Authorization"] = `Bearer ${finalToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${finalToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - Logout
        localStorage.removeItem("access_token");
        localStorage.removeItem("gta_auth_user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
