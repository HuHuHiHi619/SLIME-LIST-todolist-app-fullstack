import React, { useState, useEffect, useRef } from "react";
import SearchField from "../ui/SearchField";
import NotificationField from "./NotificationField";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faQuestion,
  faSearch,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";
import InstructionPopup from "./InstructionPopup";
import usePopup from "../hooks/usePopup";
import { useSelector } from "react-redux";
import ReactDOM from "react-dom";
import Tooltip from "../ui/Tooltip";

const NotificationForm = () => {
  const { instruction } = useSelector((state) => state.summary);
  const { handleIsInstruct, popupInstructRef } = usePopup();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const notiRef = useRef(null);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !(menuRef.current && menuRef.current.contains(event.target)) &&
        !(buttonRef.current && buttonRef.current.contains(event.target)) &&
        !(searchRef.current && searchRef.current.contains(event.target)) &&
        !(notiRef.current && notiRef.current.contains(event.target))
      ) {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
        setIsNotiOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchToggle = () => {
    setIsSearchOpen(true);
    setIsNotiOpen(false);
  };

  const handleNotificationClick = () => {
    setIsNotiOpen((prev) => !prev);
    setIsSearchOpen(false);
  };

  return (
    <div className=" p-2 m-0 md:mr-8 z-50">
      <button
        className="md:hidden pl-12 text-gray-400 hover:text-purpleBorder transition-colors duration-200"
        onClick={() => handleIsInstruct()}
      >
        <FontAwesomeIcon icon={faQuestion} className="h-6 w-6" />
      </button>
      <div className=" hidden md:flex relative  items-center" ref={menuRef}>
        {/* Main Menu Icon and Click Area */}
        <div className="relative flex items-center">
          <Tooltip description={"Menu"} position="bottom">
            <button
              ref={buttonRef}
              className={`text-gray-400 hover:text-purpleBorder transition-transform duration-300 ease-out transform ${
                isMenuOpen
                  ? "-rotate-[135deg] -translate-y-1 text-purpleBorder "
                  : ""
              }`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <FontAwesomeIcon
                icon={faSquare}
                className="h-8 w-8 transform origin-center"
              />
            </button>
          </Tooltip>
          {/* Sliding Icons Container */}
          {isMenuOpen && (
            <div className="absolute right-12 top-5 flex -translate-y-1/2  items-center gap-2 w-auto">
              <FadeUpContainer direction="left">
                <div className=" flex gap-2 relative">
                  {isSearchOpen ? (
                    <div
                      ref={searchRef}
                      className="animate-fadeIn absolute  top-0 right-12"
                    >
                      <SearchField />
                    </div>
                  ) : (
                    <Tooltip description={"Search"} position="bottom">
                      <button
                        className="p-2 text-gray-400 hover:text-purpleBorder transition-colors duration-200"
                        onClick={handleSearchToggle}
                      >
                        <FontAwesomeIcon icon={faSearch} className="h-6 w-6" />
                      </button>
                    </Tooltip>
                  )}
                  {/* <div className="relative">
                    <button
                      onClick={handleNotificationClick}
                      className="p-2 text-gray-400 hover:text-purpleBorder transition-colors duration-200"
                    >
                      <FontAwesomeIcon
                        icon={faBell}
                        className={`h-8 w-8 ${
                          isNotiOpen ? "text-purpleBorder" : ""
                        }`}
                      />
                    </button>
                    
                 NOTIFICATION FIELD IS PROCESSING   

                   {isNotiOpen && (
                      <div
                        ref={notiRef}
                        className="absolute top-0 right-0 shadow-md p-4 transition-all duration-300"
                      >
                        <NotificationField />
                      </div>
                    )} 
                  </div>
                     */}
                  <Tooltip description={"Instructions"} position="bottom">
                    <button
                      className="p-2 text-gray-400 hover:text-purpleBorder transition-colors duration-200"
                      onClick={() => handleIsInstruct()}
                    >
                      <FontAwesomeIcon icon={faQuestion} className="h-6 w-6" />
                    </button>
                  </Tooltip>
                </div>

                {instruction &&
                  ReactDOM.createPortal(
                    <div className="popup-overlay">
                      <div className="popup-content" ref={popupInstructRef}>
                        <InstructionPopup onClose={handleIsInstruct} />
                      </div>
                    </div>,
                    document.body
                  )}
              </FadeUpContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationForm;
