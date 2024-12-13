import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function Tooltip({ children, description, position = "left", disableTip }) {
  const [isVisible, setIsVisible] = useState(false);
  const {isAuthenticated} = useSelector((state) => state.user);
  const tooltipPositions = {
    left: "top-1/2 right-full transform -translate-y-1/2 ",
    top:"top-0 -left-40 "
  };

  useEffect(() => {
    if (disableTip) {
      setIsVisible(false);
    }
  }, [disableTip]);

  return (
      <div
        className="relative "
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        
        {children}
        
        <div
          className={`w-[20rem] absolute z-99  transform  bg-purpleGradient text-white text-2xl p-0.5 rounded-3xl shadow-2xl transition-all duration-400 ${
            isVisible
              ? "opacity-100 scale-100  translate-x-0"
              : "opacity-0 scale-75 translate-x-20"
          } ${tooltipPositions[position]}`}
          style={{
            display: "flex",
            maxWidth: "20rem",
            wordWrap: "break-word",
            whiteSpace: "normal",
          }}
        >
          <div className="bg-purpleMain p-4 rounded-3xl">{description}</div>
        </div>
      </div>
    
  );
}

export default Tooltip;
