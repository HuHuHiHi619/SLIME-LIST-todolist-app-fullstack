import { useQuery } from "@tanstack/react-query";
import { getSummaryTask, getSummaryTaskByCategory } from "../../functions/summary";

export function useSummaryQuery() {
  return useQuery({
    queryKey: ["summary"],
    queryFn: getSummaryTask,
  });
}

export function useSummaryByCategoryQuery() {
  return useQuery({
    queryKey: ["summaryByCategory"],
    queryFn: getSummaryTaskByCategory,
  });
}
