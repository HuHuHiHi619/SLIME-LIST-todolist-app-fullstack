import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getPet = async () => {
  const res = await axios.get("/pet");
  return res.data;
};

export function usePetQuery() {
  return useQuery({
    queryKey: ["pet"],
    queryFn: getPet,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
