import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedTask,
  toggleCreatePopup,
  togglePopup,
  setHover,
  toggleSidebarPinned,
  toggleInstructPopup,
} from "../redux/uiSlice";
import { toggleRegisterPopup } from "../redux/userSlice";
import {
  useCompleteTaskMutation,
  useRemoveTaskMutation,
  useRemoveAllTaskMutation,
  useRemoveCategoryMutation,
} from "./queries/useTasks";

function usePopup() {
  const dispatch = useDispatch();
  const popupRef = useRef(null);
  const popupEnRef = useRef(null);
  const popupInstructRef = useRef(null);
  const sidebarRef = useRef(null);
  const popupRegisterRef = useRef(null);
  const { isPopup } = useSelector((state) => state.ui);

  const completeTaskMutation = useCompleteTaskMutation();
  const removeTaskMutation = useRemoveTaskMutation();
  const removeAllTaskMutation = useRemoveAllTaskMutation();
  const removeCategoryMutation = useRemoveCategoryMutation();

  const handleIsCreate = () => {
    dispatch(toggleCreatePopup());
  };

  const handleIsInstruct = () => {
    dispatch(toggleInstructPopup());
  };

  const handleTaskClick = (task) => {
    dispatch(setSelectedTask(task));
  };

  const handleCloseDetail = () => {
    dispatch(setSelectedTask(null));
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebarPinned());
  };

  const handleToggleRegister = () => {
    dispatch(toggleRegisterPopup());
  };

  const handleHover = (id) => {
    dispatch(setHover(id));
  };

  const handlePopup = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(togglePopup(mode));
  };

  const handleCompletedTask = (task) => {
    completeTaskMutation.mutate(task._id);
  };

  const handleRemovedTask = (task) => {
    removeTaskMutation.mutate(task._id);
  };

  const handleRemovedAllTask = () => {
    removeAllTaskMutation.mutate();
  };

  const handleRemovedItem = (id, type) => {
    if (type === "category") {
      removeCategoryMutation.mutate(id);
    }
  };

  const handleClose = () => {
    if (isPopup) {
      dispatch(togglePopup(""));
    } else if (popupRef.current) {
      dispatch(toggleCreatePopup());
      dispatch(setSelectedTask(null));
      return;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        dispatch(toggleCreatePopup());
        dispatch(setSelectedTask(null));
        return;
      } else if (
        isPopup &&
        popupEnRef.current &&
        !popupEnRef.current.contains(e.target)
      ) {
        dispatch(togglePopup(""));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopup, dispatch]);

  return {
    handleIsCreate,
    handleTaskClick,
    handleCloseDetail,
    handleCompletedTask,
    handleRemovedTask,
    handleRemovedAllTask,
    handleRemovedItem,
    handleToggleSidebar,
    handleToggleRegister,
    handleHover,
    handlePopup,
    handleIsInstruct,
    handleClose,
    popupRef,
    popupEnRef,
    popupInstructRef,
    popupRegisterRef,
    sidebarRef,
  };
}

export default usePopup;
