import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
function SidebarLink({ to, icon, label, activeMenu, handleActiveMenu ,handlePopup,addIcon}) {
  return (
    <Link to={to}>
      <div
        className={`flex justify-between py-2 pl-6 gap-4 ${
          activeMenu === to
            ? " bg-purpleActive border-r-4 border-purple-200"
            : "bg-transparent"
        }`}
        onClick={() => handleActiveMenu(to)}
      >
        <div
          className={`flex items-center gap-4 text-2xl ${
            activeMenu === to ? "text-white" : "text-slate-400"
          }`}
        >
          { icon && ( <FontAwesomeIcon icon={icon} />)}
          <h1>{label}</h1>
        </div>
        <button onClick={handlePopup}>
          {addIcon && ( <FontAwesomeIcon
            icon={addIcon}
            className="bg-white text-2xl text-grey-500 mr-4 my-1 p-1 rounded-sm"
          />)}
         
        </button>
      </div>
    </Link>
  );
}

export default SidebarLink;
