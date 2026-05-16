import { api } from "./client";
import type { AuthResponse, User } from "@/types/api";

export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
      auth: false,
    }),
  login: (data: { email: string; password: string }) =>
    api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      auth: false,
    }),
  me: async () => {
    const response = await api<{ user: User }>("/api/auth/me");
    return response.user;
  },
};
