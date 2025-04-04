import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";


function SidebarLink({
  to,
  icon,
  addIcon,
  label,
  activeMenu,
  handleActiveMenu,
  handlePopup,
  isSidebarPinned,
  categories,
  handleHover,
  isHover,
  handleRemovedItem,
}) {
  const isActive = activeMenu === to;

  return (
    <div className="relative">
      {isActive && (
        <motion.div
          className="absolute left-0 w-full h-12 bg-purpleActive rounded-md"
          layoutId="activeMenuBackground"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <Link
        to={to}
        className={`relative z-10 flex items-center gap-4 p-3 text-white ${
          isActive
            ? "text-white font-semibold"
            : "text-white opacity-50 hover:opacity-100 hover:bg-purpleNormal transition-all duration-300 rounded-md"
        }`}
        onClick={handleActiveMenu}
      >
        <FontAwesomeIcon icon={icon} className="text-xl pl-4" />
        {isSidebarPinned && (
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center">
              <span
                className={`text-xl ${
                  isActive ? "text-white font-normal" : ""
                }`}
              >
                {label}
              </span>
              {addIcon && (
                <FontAwesomeIcon
                  icon="plus"
                  className="w-5 h-5 cursor-pointer hover:scale-125 transition-all duration-200  pr-4"
                  onClick={handlePopup}
                />
              )}
            </div>
            {categories && categories.length > 0 && label === "CATEGORY" && (
              <ul
                className={`mt-2 space-y-1 ${isHover ? "block" : "hidden"}`}
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}
              >
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex justify-between items-center pl-2 text-xs hover:bg-gray-700 rounded py-1"
                  >
                    <Link
                      to={`/category/${category.id}`}
                      className={`${
                        activeMenu === `/category/${category.id}`
                          ? "text-white font-semibold"
                          : "text-white opacity-75"
                      }`}
                    >
                      {category.name}
                    </Link>
                    <button
                      className="hover:bg-red-500 hover:text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemovedItem(category.id)}
                    >
                      <FontAwesomeIcon icon="trash" className="text-xs" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}

export default SidebarLink;
