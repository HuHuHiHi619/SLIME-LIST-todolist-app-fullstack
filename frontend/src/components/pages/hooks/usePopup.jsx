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
  removedTag,
  removedCategory,
  removeCategories,
  removeTags,
  updatedTaskAttempt,
} from "../../../redux/taskSlice";
import { fetchSummary } from "../../../redux/summarySlice";

function usePopup() {
  const dispatch = useDispatch();
  const popupRef = useRef(null);
  const popupEnRef = useRef(null);
  const { isPopup } = useSelector((state) => state.tasks)

  const handleIsCreate = () => {
    dispatch(toggleCreatePopup());
    dispatch(fetchSummary());
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

  const handleHover = (id) => {
    dispatch(setHover(id));
  };

  const handlePopup = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(togglePopup(mode));
  };

  const handleActiveMenu = (menuName) => {
    dispatch(setActiveMenu(menuName));
    navigate(menuName);
  };

  const handleCompletedTask = async (task) => {
    console.log("Task com:", task);
    dispatch(completedTask(task._id));
    dispatch(fetchSummary());
  };

  const handleRemovedTask = async (task) => {
    console.log("Task removed:", task);
    dispatch(removedTask(task._id));
    dispatch(fetchSummary());
  };

  const handleRemovedItem = async (id,type) => {
    if(type === "category"){
      dispatch(removeCategories(id)); // optimistic update
      await dispatch(removedCategory(id)).unwrap()
    } else if (type === "tag"){
      dispatch(removeTags(id));
      dispatch(removedTag(id)).unwrap()
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        dispatch(toggleCreatePopup());
        dispatch(setSelectedTask(null));
        return;
      } else if(isPopup && popupEnRef.current && !popupEnRef.current.contains(e.target)){
        dispatch(togglePopup(""));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopup,dispatch]);

  return {
    handleIsCreate,
    handleTaskClick,
    handleCloseDetail,
    handleCompletedTask,
    handleRemovedTask,
    handleRemovedItem,
    handleActiveMenu,
    handleToggleSidebar,
    handleHover,
    handlePopup,
    popupRef,
    popupEnRef,
  };
}

export default usePopup;