import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  faHome,
  faCalendar,
  faList,
  faFolder,
  faTag,
  faGear,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreateEntity from "../create/CreateEntity";
import SidebarLink from "../fixbar/SidebarLink";
import { getCategoryData } from "../../../functions/category";
import { getTagData } from "../../../functions/tag";

function Sidebar() {
  const [activeMenu, setActiveMenu] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isPopup, setIsPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("");
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const handlePopup = (mode) => {
    setPopupMode(mode);
    setIsPopup(!isPopup);
  };

  const handleAddItem = (newItem) => {
    if (popupMode === "category") {
      setCategories((prevItems) => {
        const updatedCategories = [...prevItems, newItem];
        console.log("Updated categories:", updatedCategories);
        return updatedCategories;
      });
    } else if (popupMode === "tag") {
      setTags((prevItems) => {
        const updatedTags = [...prevItems, newItem];
        console.log("Updated categories:", updatedTags);
        return updatedTags;
      });
    }
    setIsPopup(false);
  };

  const handleActiveMenu = (menuName) => {
    console.log("Active Menu Changed:", menuName);
    setActiveMenu(menuName);
    navigate(menuName);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catagoriesData,tagsData] = await Promise.all([
          getCategoryData(),
          getTagData()
        ])

        if (catagoriesData && Array.isArray(catagoriesData)) {
          console.log("Fetched category:", catagoriesData);
          setCategories(catagoriesData);
        }

        if(tagsData && Array.isArray(tagsData)) {
          console.log('Fetch tag:',tagsData)
          setTags(tagsData);
        }


      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div id="side-bar">
      side
      <div className="flex flex-col gap-4 ">
        <SidebarLink
          to=""
          icon={faHome}
          label="OVERVIEW"
          activeMenu={activeMenu}
          handleActiveMenu={handleActiveMenu}
        />
        <SidebarLink
          to="/upcoming"
          icon={faCalendar}
          label="UPCOMING"
          activeMenu={activeMenu}
          handleActiveMenu={handleActiveMenu}
        />
        <SidebarLink
          to="/all-tasks"
          icon={faList}
          label="ALL TASKS"
          activeMenu={activeMenu}
          handleActiveMenu={handleActiveMenu}
        />
        <div className="flex flex-col category-container">
          <div>
            <SidebarLink
              to="/category"
              icon={faFolder}
              addIcon={faPlus}
              label="CATEGORY"
              activeMenu={activeMenu}
              handleActiveMenu={handleActiveMenu}
              handlePopup={() => handlePopup("category")}
            />
          </div>
        
          <ul className="dropdown">
            {categories.length > 0
              ? categories.map((cate) => (
                  <li className="dropdown-item" key={cate._id}>
                    <span>{cate.categoryName}</span>
                  </li>
                ))
              : null}
          </ul>
        </div>
        <div className="flex flex-col tag-container">
          <div >
            <SidebarLink
              to="/tag"
              icon={faTag}
              addIcon={faPlus}
              label="TAG"
              activeMenu={activeMenu}
              handleActiveMenu={handleActiveMenu}
              handlePopup={() => handlePopup("tag")}
            />
          </div>
          <ul className="dropdown">{tags.length > 0 ? tags.map((tag) => 
            <li className="dropdown-item" key={tag._id}>
              <span>{tag.tagName}</span>
            </li>
          ) : null}
          </ul>
        </div>

        <SidebarLink
          to="/settings"
          icon={faGear}
          label="SETTINGS"
          activeMenu={activeMenu}
          handleActiveMenu={handleActiveMenu}
        />
      </div>
      {/* Create entity popup*/}
      <CreateEntity
        isOpen={isPopup}
        onAddItem={handleAddItem}
        entityType={popupMode}
        popupRef={popupRef}
      />
    </div>
  );
}

export default Sidebar;
