import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  createTask,
  completeTask,
  getData,
  removeAllCompletedTask,
  removeTask,
  searchedTask,
  updateTask,
} from "../../functions/task";
import { getCategoryData } from "../../functions/category";
import { removeCategory } from "../../functions/category";
import { setStreakStatus, writeStreakStatus } from "../../redux/taskSlice";
import { setSelectedTask, setTaskError } from "../../redux/uiSlice";
import { resetFormTask } from "../../redux/formSlice";

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useTasksQuery(filter) {
  return useQuery({
    queryKey: ["tasks", filter],
    queryFn: () => getData(filter),
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategoryData,
  });
}

export function useSearchTasksQuery(searchTerm) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: () => searchedTask(searchTerm),
    enabled: searchTerm.length >= 1 && searchTerm.length <= 50,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["summaryByCategory"] });
      dispatch(resetFormTask());
    },
    onError: (error) => {
      dispatch(setTaskError(error?.message ?? "Failed to create task"));
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const selectedTask = useSelector((state) => state.ui.selectedTask);
  return useMutation({
    mutationFn: ({ taskId, taskData }) => {
      const payload = {
        ...taskData,
        category: taskData.category?.categoryName || taskData.category,
      };
      return updateTask(taskId, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["summaryByCategory"] });
      if (selectedTask && selectedTask._id === data._id) {
        dispatch(setSelectedTask({ ...selectedTask, ...data }));
      }
    },
    onError: (error) => {
      dispatch(setTaskError(error?.message ?? "Failed to update task"));
    },
  });
}

export function useCompleteTaskMutation() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const selectedTask = useSelector((state) => state.ui.selectedTask);
  return useMutation({
    mutationFn: completeTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      if (data.user) {
        writeStreakStatus(data.user);
        dispatch(setStreakStatus(data.user));
      }
      const completedId = data._id;
      const updatedStatus = (data.updatedTask || data).status;
      if (selectedTask && selectedTask._id === completedId) {
        dispatch(setSelectedTask({ ...selectedTask, status: updatedStatus }));
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      dispatch(setTaskError(error?.message ?? "Failed to complete task"));
    },
  });
}

export function useRemoveTaskMutation() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: removeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error) => {
      dispatch(setTaskError(error?.message ?? "Failed to remove task"));
    },
  });
}

export function useRemoveAllTaskMutation() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: removeAllCompletedTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error) => {
      dispatch(setTaskError(error?.message ?? "Failed to remove completed tasks"));
    },
  });
}

export function useRemoveCategoryMutation() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: removeCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["summaryByCategory"] });
    },
    onError: (error) => {
      dispatch(setTaskError(error?.message ?? "Failed to remove category"));
    },
  });
}
