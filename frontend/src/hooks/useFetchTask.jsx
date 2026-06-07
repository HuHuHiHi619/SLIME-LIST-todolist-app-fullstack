import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../redux/taskSlice";

function useFetchTask(filter) {
  const dispatch = useDispatch();
  const { tasks, lastStateUpdate } = useSelector((state) => state.tasks);

  // Callers pass an inline object literal (`filter={{ status: "pending" }}`),
  // a fresh reference every render. Depend on its serialized value so a
  // re-rendering parent can't trigger a refetch storm; only an actual filter
  // change (or a post-mutation `lastStateUpdate` bump) refetches.
  const serializedFilter = JSON.stringify(filter);
  useEffect(() => {
    dispatch(fetchTasks(filter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, serializedFilter, lastStateUpdate]);

  return { tasks };
}

export default useFetchTask;
