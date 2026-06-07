import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedTask,
  toggleCreatePopup,
  completedTask,
  removedTask,
  togglePopup,
  setHover,
  toggleSidebarPinned,
  removedCategory,
  removedAllTask,
} from "../redux/taskSlice";
import { toggleInstructPopup } from "../redux/summarySlice";
import {
  fetchSummary,
  fetchSummaryByCategory,
} from "../redux/summarySlice";
import { fetchUserData, toggleRegisterPopup } from "../redux/userSlice";

function usePopup() {
  const dispatch = useDispatch();
  const popupRef = useRef(null);
  const popupEnRef = useRef(null);
  const popupInstructRef = useRef(null);
  const sidebarRef = useRef(null);
  const popupRegisterRef = useRef(null);
  const { isPopup } = useSelector((state) => state.tasks);
  

  const handleIsCreate = async () => {
    dispatch(toggleCreatePopup());
    await dispatch(fetchSummary()).unwrap();
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

  const handleCompletedTask = async (task) => {
    try {
      await dispatch(completedTask(task._id)).unwrap();
      await dispatch(fetchSummary()).unwrap();
      await dispatch(fetchUserData()).unwrap();
    } catch {
      // failure surfaced via TaskErrorToast (rejected matcher)
    }
  };

  const handleRemovedTask = async (task) => {
    try {
      await dispatch(removedTask(task._id)).unwrap();
      await dispatch(fetchSummary()).unwrap();
    } catch {
      // failure surfaced via TaskErrorToast (rejected matcher)
    }
  };

  const handleRemovedAllTask = async () => {
    try {
      await dispatch(removedAllTask()).unwrap();
      await dispatch(fetchSummary()).unwrap();
    } catch {
      // failure surfaced via TaskErrorToast (rejected matcher)
    }
  };

  const handleRemovedItem = async (id, type) => {
    try {
      if (type === "category") {
        // Pessimistic: removedCategory.fulfilled removes it from the list only
        // after the server confirms (no optimistic remove → no rollback needed).
        await dispatch(removedCategory(id)).unwrap();
        await dispatch(fetchSummaryByCategory()).unwrap();
      }
    } catch {
      // failure surfaced via TaskErrorToast (rejected matcher)
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

