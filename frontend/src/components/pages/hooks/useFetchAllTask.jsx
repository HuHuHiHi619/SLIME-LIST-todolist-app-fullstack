import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTasks } from "../../../redux/taskSlice";

function useFetchAllTask(filter) {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchAllTasks(filter));
  }, [dispatch,filter]);
 
  return { tasks };
}

export default useFetchAllTask;
