import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFolder,
  faCalendar,
  faGear,
  faList,
  faPlus,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  setCategories,
  setActiveMenu,
  toggleSidebarPinned,
  togglePopup,
} from "../../../redux/taskSlice";
import SidebarLink from "../fixbar/SidebarLink";
import CreateEntity from "../create/CreateEntity";
import Logout from "../authen/Logout";
import usePopup from "../hooks/usePopup";
import Tooltip from "../ui/Tooltip";

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
  } = useSelector((state) => state.tasks);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const {
    handleRemovedItem,
    handleActiveMenu,
    handlePopup,
    handleHover,
    handleClose,
    popupEnRef,
    sidebarRef,
  } = usePopup();

  const handleAddItem = async (newItem) => {
    if (popupMode === "category") {
      dispatch(setCategories([...categories, newItem]));
      await dispatch(fetchCategories()).unwrap();
    }
    dispatch(togglePopup(""));
  };

  useEffect(() => {
    dispatch(fetchCategories());
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
      className={` md:translate-x-0 md:mt-12 lg:mt-0 flex m flex-col gap-4 ${
        isSidebarPinned ? "" : "-translate-x-20 sidebar-collapsed"
      } transition-width duration-300`}
    >
      <div
        className={`items-center gap-4 ${
          isSidebarPinned
            ? "pin-button text-white"
            : "pin-button text-white opacity-50 hover:opacity-100 "
        }`}
        ref={sidebarRef}
        onClick={handlePinSidebar}
      >
        <div
          className={`h-2 w-full  md:bg-purpleActive rounded-full ${
            isSidebarPinned ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        ></div>
          <Tooltip description={"Side bar"} position="right">
        <FontAwesomeIcon
          icon={faBars}
          className={`  hidden md:block transform origin-center text-2xl ${
            isSidebarPinned ? "rotate-180" : "pr-3"
          } `}
        />
        </Tooltip>
      </div>

      {/* Sidebar Links */}
      <Tooltip description={"Overview"} position="right">
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
      </Tooltip>
      <Tooltip description={"Upcoming"} position="right">
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
      </Tooltip>
      <Tooltip description={"All Tasks"} position="right">
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
      </Tooltip>
      <Tooltip description={"Category"} position="right">
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
      </Tooltip>
      <Tooltip description={"Settings"} position="right">
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
      </Tooltip>
      {isAuthenticated && isSidebarPinned && <Logout />}
      {isPopup &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup-content" ref={popupEnRef}>
              <CreateEntity
                onAddItem={handleAddItem}
                entityType={popupMode}
                onClose={handleClose}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default Sidebar;
