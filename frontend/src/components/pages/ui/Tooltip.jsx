import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

function Tooltip({ children, description, position = "left", disableTip }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);

  useEffect(() => {
    if (disableTip) {
      setIsVisible(false);
    }
  }, [disableTip]);

  useEffect(() => {
    if (isVisible && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      
      // คำนวณตำแหน่งพื้นฐาน
      let top = rect.top + window.scrollY;
      let left = rect.left + window.scrollX;
      
      // ปรับตำแหน่งตาม position
      switch (position) {
        case "top":
          top = top - 10;
          left = left + rect.width / 2;
          break;
        case "right":
          top = top + rect.height / 2;
          left = left + rect.width + 10;
          break;
        case "bottom":
          top = top + rect.height + 10;
          left = left + rect.width / 2;
          break;
        case "left":
          top = top + rect.height / 2;
          left = left - 10;
          break;
        default:
          top = top + rect.height / 2;
          left = left - 10;
      }
      
      setTooltipPos({ top, left });
    }
  }, [isVisible, position]);

  // ใช้ Tailwind classes ตามตำแหน่งที่ต้องการ
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "-translate-x-1/2 -translate-y-full transition-all duration-300";
      case "right":
        return "translate-x-0 -translate-y-1/2 transition-all duration-300";
      case "bottom":
        return "-translate-x-1/2 translate-y-0 transition-all duration-300";
      case "left":
        return "-translate-x-full -translate-y-1/2 transition-all duration-300";
      default:
        return "-translate-x-full -translate-y-1/2 transition-all duration-300";
    }
  };

  const getAnimationClasses = () => {
    const baseAnimation = "transition-all duration-300";
    
    if (!isVisible) {
      return `${baseAnimation} opacity-0 scale-75`;
    }
    
    switch (position) {
      case "top":
        return `${baseAnimation} opacity-100 scale-100`;
      case "right":
        return `${baseAnimation} opacity-100 scale-100`;
      case "bottom":
        return `${baseAnimation} opacity-100 scale-100`;
      case "left":
        return `${baseAnimation} opacity-100 scale-100`;
      default:
        return `${baseAnimation} opacity-100 scale-100`;
    }
  };

  return (
    <>
      <div 
        ref={targetRef}
        className="inline-block"
        onMouseEnter={() => !disableTip && setIsVisible(true)}
        onMouseLeave={() => !disableTip && setIsVisible(false)}
      >
        {children}
      </div>
      
      {ReactDOM.createPortal(
        <div 
          className={`fixed transition-all duration-300 transform  ${getPositionClasses()} ${getAnimationClasses()}`}
          style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px`, zIndex:9999 }}
        >
          <div className="bg-purpleNormal  text-gray-400 text-lg  rounded-xl shadow-2xl">
            <div className=" p-2 rounded-xl">{description}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Tooltip;