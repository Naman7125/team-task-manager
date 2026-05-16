import { api } from "./client";
import type { User } from "@/types/api";

export const usersApi = {
  search: (q: string) => api<User[]>(`/api/users?search=${encodeURIComponent(q)}`),
};
