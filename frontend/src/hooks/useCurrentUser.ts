import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { qk } from "@/lib/queryKeys";

export function useCurrentUser() {
  return useQuery({
    queryKey: qk.me,
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
