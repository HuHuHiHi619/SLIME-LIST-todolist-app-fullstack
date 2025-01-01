import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";


function SidebarLink({
  to,
  icon,
  label,
  activeMenu,
  handleActiveMenu,
  handlePopup,
  handleHover,
  addIcon,
  categories = [],
  tags = [],
  isSidebarPinned,
  isHover,
  handleRemovedItem,
}) {
  return (
    <div className="flex flex-col show-entity">
      <Link to={to} onClick={() => handleActiveMenu(to)}>
        <div
          className={`flex justify-between py-2 pl-6 gap-4 easy-slide ${
            activeMenu === to
              ? "bg-purpleActive border-r-4 border-purple-200"
              : "bg-transparent hoverMenu"
          }`}
        >
          <div
            className={`flex items-center gap-4 text-2xl ${
              activeMenu === to ? "text-white" : "text-slate-400"
            }`}
          >
            {icon && <FontAwesomeIcon icon={icon} />}
            {isSidebarPinned && <h1>{label}</h1>}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePopup(e);
            }}
          >
            {isSidebarPinned && addIcon && (
              <FontAwesomeIcon
                icon={addIcon}
                className="bg-purpleNormal border-2 border-purpleBorder text-xl
                 text-white mr-4 my-1 p-2 rounded-md
                 hover:bg-purpleBorder hover:scale-110 transition-all duration-100 ease-in-out
                 "
              />
            )}
          </button>
        </div>
      </Link>

      {/* Dropdown for Categories */}
      {isSidebarPinned && categories.length > 0 && (
        <ul className="dropdown ">
          {categories.map((cate) => (
            <li
              onMouseEnter={() => handleHover(cate._id)}
              onMouseLeave={() => handleHover(null)}
              className={`hoverMenu  mb-2  text-gray-400  easy-slide`}
              key={cate._id}
            >
              <Link
                to={`/category/${cate._id}`}
                className="flex justify-center gap-4 items-center dropdown-item  "
              >
                <h3 className="text-gray-400">{cate.categoryName}</h3>
                {isHover === cate._id && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemovedItem(cate._id, "category");
                    }}
                    className="flex items-center"
                  >
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="delete-step text-lg "
                    />
                  </button>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

    
              
            
        
       
    
    </div>
  );
}

export default SidebarLink;
