import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../../../redux/taskSlice";

function useFetchTask(filter) {
  const dispatch = useDispatch();
  const  {tasks , lastStateUpdate}  = useSelector((state) => state.tasks);
  
  useEffect(() => {
    dispatch(fetchTasks(filter));
  }, [dispatch,filter,lastStateUpdate]);
 
  return {tasks}  ;
}

export default useFetchTask;
