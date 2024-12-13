import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFolder,
  faCalendar,
  faGear,
  faList,
  faPlus,
  faThumbTack,
  faSquareCaretRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchTags,
  setCategories,
  setTags,
  setActiveMenu,
  toggleSidebarPinned,
  togglePopup,
} from "../../../redux/taskSlice";
import SidebarLink from "../fixbar/SidebarLink";
import CreateEntity from "../create/CreateEntity";
import Tooltip from "../ui/Tooltip";
import Logout from "../authen/Logout";
import usePopup from "../hooks/usePopup";

function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const {
    activeMenu,
    isHover,
    isPopup,
    isSidebarPinned,
    popupMode,
    categories,
    tags,
  } = useSelector((state) => state.tasks);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const {
    handleRemovedItem,
    handleActiveMenu,
    handlePopup,
    handleHover,
    popupEnRef,
  } = usePopup();

  const handleAddItem = async (newItem) => {
    if (popupMode === "tag") {
      // Optionally update UI optimistically
      dispatch(setTags([...tags, newItem]));
      // Fetch the latest tags
      await dispatch(fetchTags()).unwrap();
    } else if (popupMode === "category") {
      dispatch(setCategories([...categories, newItem]));
      await dispatch(fetchCategories()).unwrap();
    }
    dispatch(togglePopup(""));
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setActiveMenu(location.pathname));
  }, [location.pathname, dispatch]);

  const handlePinSidebar = () => {
    dispatch(toggleSidebarPinned());
  };

  return (
    <div
      id="side-bar"
      className={`flex flex-col gap-4 ${
        isSidebarPinned ? "" : " sidebar-collapsed"
      } transition-width duration-300`}
    >
      <div
        className={`${isSidebarPinned ? "pin-button text-white" : "pin-button text-white opacity-50 hover:opacity-100"}`}
        onClick={handlePinSidebar}
      >
        <FontAwesomeIcon icon={faSquareCaretRight}
        className={` transform origin-center ${isSidebarPinned ? "rotate-180" : "" } `}
        />
      </div>

      {/* Sidebar Links */}
      <SidebarLink
        to="/"
        icon={faHome}
        label="OVERVIEW"
        activeMenu={activeMenu}
        handleActiveMenu={() => {
          if (isSidebarPinned) handleActiveMenu();
        }}
        isSidebarPinned={isSidebarPinned}
      />
      <SidebarLink
        to="/upcoming"
        icon={faCalendar}
        label="UPCOMING"
        activeMenu={activeMenu}
        handleActiveMenu={() => {
          if (isSidebarPinned) handleActiveMenu();
        }}
        isSidebarPinned={isSidebarPinned}
      />
      <SidebarLink
        to="/all-tasks"
        icon={faList}
        label="ALL TASKS"
        activeMenu={activeMenu}
        handleActiveMenu={() => {
          if (isSidebarPinned) handleActiveMenu();
        }}
        isSidebarPinned={isSidebarPinned}
      />
      <SidebarLink
        to="/category"
        icon={faFolder}
        addIcon={faPlus}
        label="CATEGORY"
        categories={categories}
        activeMenu={activeMenu}
        handleActiveMenu={() => {
          if (isSidebarPinned) handleActiveMenu();
        }}
        handlePopup={(e) => handlePopup(e, "category")}
        isSidebarPinned={isSidebarPinned}
        handleHover={handleHover}
        isHover={isHover}
        handleRemovedItem={(id) => handleRemovedItem(id, "category")}
      />

      <SidebarLink
        to="/settings"
        icon={faGear}
        label="SETTINGS"
        activeMenu={activeMenu}
        handleActiveMenu={() => {
          if (isSidebarPinned) handleActiveMenu();
        }}
        isSidebarPinned={isSidebarPinned}
      />
      {isAuthenticated && isSidebarPinned && <Logout />}
      {isPopup && (
        <div className="popup-overlay">
          <div className="popup-content" ref={popupEnRef}>
            <CreateEntity onAddItem={handleAddItem} entityType={popupMode} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
