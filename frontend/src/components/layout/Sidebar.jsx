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
import { fetchCategories, setCategories } from "../../redux/taskSlice";
import {
  setActiveMenu,
  toggleSidebarPinned,
  togglePopup,
} from "../../redux/uiSlice";
import SidebarLink from "./SidebarLink";
import CreateEntity from "../task/CreateEntity";
import usePopup from "../../hooks/usePopup";
import Tooltip from "../feedback/Tooltip";

function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { activeMenu, isHover, isPopup, isSidebarPinned, popupMode } =
    useSelector((state) => state.ui);
  const { categories } = useSelector((state) => state.tasks);
 

  const {
    handleRemovedItem,
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

  const closeDrawerOnMobile = () => {
    if (window.innerWidth < 1024 && isSidebarPinned) handlePinSidebar();
  };

  return (
    <div
      id="side-bar"
      className={`md:translate-x-0 flex flex-col gap-4 ${
        isSidebarPinned ? "" : "sidebar-collapsed"
      }`}
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
          className={`h-2 w-full  lg:bg-purpleActive rounded-full ${
            isSidebarPinned ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        ></div>
          <Tooltip description={"Side bar"} position="right">
        <FontAwesomeIcon
          icon={faBars}
          className={`  hidden lg:block transform origin-center text-2xl ${
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
          handleActiveMenu={closeDrawerOnMobile}
          isSidebarPinned={isSidebarPinned}
        />
      </Tooltip>
      <Tooltip description={"Upcoming"} position="right">
        <SidebarLink
          to="/upcoming"
          icon={faCalendar}
          label="UPCOMING"
          activeMenu={activeMenu}
          handleActiveMenu={closeDrawerOnMobile}
          isSidebarPinned={isSidebarPinned}
        />
      </Tooltip>
      <Tooltip description={"All Tasks"} position="right">
        <SidebarLink
          to="/all-tasks"
          icon={faList}
          label="ALL TASKS"
          activeMenu={activeMenu}
          handleActiveMenu={closeDrawerOnMobile}
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
          handleActiveMenu={closeDrawerOnMobile}
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
          handleActiveMenu={closeDrawerOnMobile}
          isSidebarPinned={isSidebarPinned}
        />
      </Tooltip>

      {isSidebarPinned && ReactDOM.createPortal(
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={handlePinSidebar}
          aria-hidden="true"
        />,
        document.body
      )}

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


