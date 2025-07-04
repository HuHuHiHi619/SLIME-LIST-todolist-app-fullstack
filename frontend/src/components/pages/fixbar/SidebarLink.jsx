import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

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
  const isCategoryActive = activeMenu.startsWith("/category/");

  return (
    <div
      className="relative mx-2"
      onMouseEnter={() => label === "CATEGORY" && handleHover(true)}
      onMouseLeave={() => {
        if (!isCategoryActive && label === "CATEGORY") handleHover(false);
      }}
    >
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
        className={`relative z-10 flex items-center h-12 px-4 text-white ${
          isActive
            ? "text-white font-semibold"
            : "text-white opacity-50 hover:opacity-100 hover:bg-purpleNormal transition-all duration-300 rounded-md"
        }`}
        onClick={handleActiveMenu}
      >
        <div className="w-8 flex justify-center">
          <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>

        {isSidebarPinned && (
          <div className="flex justify-between  items-center w-full mx-3">
            <p
              className={`text-xl  tracking-wider ${
                isActive ? "text-white font-extrabold" : ""
              }`}
            >
              {label}
            </p>
            {addIcon && (
              <FontAwesomeIcon
                icon="plus"
                className="w-5 h-5 cursor-pointer hover:scale-125 transition-all duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePopup(e);
                }}
              />
            )}
          </div>
        )}
      </Link>

      {/* Category dropdown list */}
      <AnimatePresence>
        {isSidebarPinned &&
          categories &&
          categories.length > 0 &&
          label === "CATEGORY" &&
          isHover && (
            <motion.div
              key="category-dropdown"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="space-y-2 pt-4">
                {categories.map((category) => (
                  <motion.li
                    key={category._id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    <Link
                      to={`/category/${category._id}`}
                      className={`flex items-center justify-between ml-4 py-2 px-4  rounded  ${
                        activeMenu === `/category/${category._id}`
                          ? "text-white bg-purpleActive bg-opacity-50"
                          : "text-white opacity-85 hover:bg-purpleNormal hover:bg-opacity-30"
                      }`}
                    >
                      <span
                        className={`${isCategoryActive ? "text-white " : ""} `}
                      >
                        {category.categoryName}
                      </span>
                      <button
                        className="flex items-center p-1  opacity-50 hover:opacity-100 hover:text-red-400 transition-opacity duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemovedItem(category._id);
                        }}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

export default SidebarLink;
