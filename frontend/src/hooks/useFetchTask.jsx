import { useTasksQuery } from "./queries/useTasks";

function useFetchTask(filter) {
  const { data: tasks = [] } = useTasksQuery(filter);
  return { tasks };
}

export default useFetchTask;
