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
  removedCategory,
  removeCategories,
 
  removedAllTask,
} from "../../../redux/taskSlice";
import { toggleInstructPopup } from "../../../redux/summarySlice";
import { fetchSummary, fetchSummaryByCategory } from "../../../redux/summarySlice";
import { fetchUserData } from "../../../redux/userSlice";

function usePopup() {
  const dispatch = useDispatch();
  const popupRef = useRef(null);
  const popupEnRef = useRef(null);
  const popupInstructRef = useRef(null);
  const sidebarRef = useRef(null)
  const { isPopup , activeMenu } = useSelector((state) => state.tasks)
  const { tokens } = useSelector((state) => state.user)
  const { instruction } = useSelector((state) => state.summary)

  const handleIsCreate = () => {
    dispatch(toggleCreatePopup());
    dispatch(fetchSummary());
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

  const handleHover = (id) => {
    dispatch(setHover(id));
  };

  const handlePopup = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(togglePopup(mode));
  };

  const handleActiveMenu = (menuName) => {
    if(activeMenu === menuName){
      dispatch(setActiveMenu(menuName));
      navigate(menuName);
    }
  };

  const handleCompletedTask = async (task) => {
    dispatch(completedTask(task._id));
   
    setTimeout(() => {
      dispatch(fetchSummary());
      if(tokens.accessToken){
        dispatch(fetchUserData())
      }
    }, 100)
  };

  const handleRemovedTask = async (task) => {
    dispatch(removedTask(task._id));
    dispatch(fetchSummary());
  };

  const handleRemovedAllTask = async () => {
    dispatch(removedAllTask());
    dispatch(fetchSummary());
  };

  const handleRemovedItem = async (id,type) => {
    if(type === "category"){
      dispatch(removeCategories(id)); // optimistic update
      await dispatch(removedCategory(id)).unwrap()
      dispatch(fetchSummaryByCategory());
    }
  };
  
  const handleClose = () => {
    if(isPopup){
      dispatch(togglePopup(""))
    } else if(popupRef) {
      dispatch(toggleCreatePopup())
      dispatch(setSelectedTask(null));
        return;
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        dispatch(toggleCreatePopup());
        dispatch(setSelectedTask(null));
        return;
      } else if(isPopup && popupEnRef.current && !popupEnRef.current.contains(e.target)){
        dispatch(togglePopup(""));
      } else if(instruction && popupInstructRef.current && !popupInstructRef.current.contains(e.target)){
        dispatch(toggleInstructPopup());
      } else if(sidebarRef.current && !sidebarRef.current.contain(e.tartget)){
        dispatch(toggleSidebarPinned())
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopup,instruction,dispatch]);

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
    handleHover,
    handlePopup,
    handleIsInstruct,
    handleClose,
    popupRef,
    popupEnRef,
    popupInstructRef
  };
}

export default usePopup;
