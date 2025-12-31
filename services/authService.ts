import { api } from "./api";

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/login", { email, password });

    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);
  },

  async me() {
    const response = await api.get("/me");
    return response.data;
  },

  logout() {
    localStorage.clear();
  },
};
