import { useQuery } from "@tanstack/react-query";
import { getUserData } from "../../functions/authen";

export function useUserQuery() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUserData,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
