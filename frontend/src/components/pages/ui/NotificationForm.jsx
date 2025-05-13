import React, { useState, useEffect, useRef } from "react";
import SearchField from "../ui/SearchField";
import FadeUpContainer from "../animation/FadeUpContainer";
import Logout from "../authen/Logout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestion,
  faSearch,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";
import InstructionPopup from "./InstructionPopup";
import usePopup from "../hooks/usePopup";
import { useSelector } from "react-redux";
import ReactDOM from "react-dom";
import Tooltip from "../ui/Tooltip";
import { AnimatePresence } from "framer-motion";

const NotificationForm = () => {
  const { instruction } = useSelector((state) => state.summary);
  const { handleIsInstruct, popupInstructRef } = usePopup();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current && menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
  };

  return (
    <div className=" p-2 mr-4 md:mr-8 z-50 ">
      <div className=" flex relative  items-center" ref={menuRef}>
        {/* Main Menu Icon and Click Area */}
        <div className="relative flex items-center">
          <Tooltip description={"Menu"} position="bottom">
            <button
              ref={buttonRef}
              className={`text-gray-400 pt-2 hover:text-purpleBorder`} // คลาสที่ไม่เกี่ยวกับการ transform สามารถอยู่ที่ button ได้
              onClick={() => {
                if (isMenuOpen) {
                  setIsSearchOpen(false);
                }
                setIsMenuOpen((prev) => !prev);
              }}
            >
              <FontAwesomeIcon
                icon={faSquare}
                className={`h-6 w-6  transition-transform duration-500 ease-in-out transform origin-center ${
                  isMenuOpen ? "-rotate-[135deg]" : ""
                } ${isMenuOpen ? "text-purpleBorder" : "text-gray-400"}`}
              />
            </button>
          </Tooltip>
          {/* Sliding Icons Container */}
          <AnimatePresence>
            {isMenuOpen && (
              <div className="absolute flex right-12 top-6 -translate-y-1/2 items-center gap-2 w-auto">
                <FadeUpContainer direction="left">
                  <div className="flex gap-2">
                    <div ref={searchRef} className="relative hidden sm:block">
                      {" "}
                      <Tooltip description={"Search"} position="bottom">
                        <SearchField
                          handleSearchToggle={handleSearchToggle}
                          isSearchOpen={isSearchOpen}
                        />
                      </Tooltip>
                    </div>

                    <Tooltip description={"Instructions"} position="bottom">
                      <button
                        className="p-2 text-gray-400 hover:text-purpleBorder transition-colors duration-200"
                        onClick={() => handleIsInstruct()}
                      >
                        <FontAwesomeIcon
                          icon={faQuestion}
                          className="h-6 w-6"
                        />
                      </button>
                    </Tooltip>
                    <Tooltip description={"Logout"} position="bottom">
                      <Logout />
                    </Tooltip>
                  </div>

                  {instruction &&
                    ReactDOM.createPortal(
                      <div className="popup-overlay">
                        <div
                          className="popup-content"
                          ref={popupInstructRef}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <InstructionPopup onClose={handleIsInstruct} />
                        </div>
                      </div>,
                      document.body
                    )}
                </FadeUpContainer>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NotificationForm;
