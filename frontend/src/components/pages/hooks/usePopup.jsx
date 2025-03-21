import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedTask,
  toggleCreatePopup,
  completedTask,
  removedTask,
  setActiveMenu,
  togglePopup,
  setHover,
  toggleSidebarPinned,
  toggleRegisterPopup,
  removedCategory,
  removeCategories,
  removedAllTask,
} from "../../../redux/taskSlice";
import { toggleInstructPopup } from "../../../redux/summarySlice";
import {
  fetchSummary,
  fetchSummaryByCategory,
} from "../../../redux/summarySlice";
import { fetchUserData } from "../../../redux/userSlice";

function usePopup() {
  const dispatch = useDispatch();
  const popupRef = useRef(null);
  const popupEnRef = useRef(null);
  const popupInstructRef = useRef(null);
  const sidebarRef = useRef(null);
  const popupRegisterRef = useRef(null);
  const { isPopup, isRegisterPopup, activeMenu } = useSelector(
    (state) => state.tasks
  );
  const { tokens } = useSelector((state) => state.user);
  const { instruction } = useSelector((state) => state.summary);

  const handleIsCreate = async () => {
    dispatch(toggleCreatePopup());
    await dispatch(fetchSummary()).unwrap();
  };
  const handleIsInstruct = () => {
    dispatch(toggleInstructPopup());
  };

  const handleTaskClick = (task) => {
    console.log("Task clicked:", task);
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

  const handleActiveMenu = (menuName) => {
    if (activeMenu === menuName) {
      dispatch(setActiveMenu(menuName));
      navigate(menuName);
    }
  };

  const handleCompletedTask = async (task) => {
    try {
      await dispatch(completedTask(task._id)).unwrap();

      setTimeout(async () => {
        await dispatch(fetchSummary()).unwrap();
        if (tokens.accessToken) {
          await dispatch(fetchUserData()).unwrap();
        }
      }, 100);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleRemovedTask = async (task) => {
    try {
      await dispatch(removedTask(task._id)).unwrap();
      await dispatch(fetchSummary()).unwrap();
      console.log("removed task");
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };

  const handleRemovedAllTask = async () => {
    try {
      await dispatch(removedAllTask()).unwrap();
      await dispatch(fetchSummary()).unwrap();
    } catch (error) {
      console.error("Error removing all task:", error);
    }
  };

  const handleRemovedItem = async (id, type) => {
    try {
      if (type === "category") {
        dispatch(removeCategories(id)); // optimistic update
        await dispatch(removedCategory(id)).unwrap();
        await dispatch(fetchSummaryByCategory()).unwrap();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleClose = () => {
    if (isPopup) {
      dispatch(togglePopup(""));
    } else if (popupRef) {
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
  }, [isPopup,  dispatch]);

  return {
    handleIsCreate,
    handleTaskClick,
    handleCloseDetail,
    handleCompletedTask,
    handleRemovedTask,
    handleRemovedAllTask,
    handleRemovedItem,
    handleActiveMenu,
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
