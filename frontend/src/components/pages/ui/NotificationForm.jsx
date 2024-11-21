import React, { useState, useEffect, useRef } from "react";
import SearchField from "../ui/SearchField";
import NotificationField from "./NotificationField";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch, faSquare } from "@fortawesome/free-solid-svg-icons";

const NotificationForm = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const notiRef = useRef(null)
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
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
  

  return (
    <div className="p-4 mr-8 z-50  ">
      <div className="relative flex items-center" ref={menuRef}>
        {/* Main Menu Icon and Click Area */}
        <div className="relative flex items-center">
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

          {/* Sliding Icons Container */}
          {isMenuOpen && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2  w-auto">
              <FadeUpContainer direction="left">
                <div className="flex gap-2">
                  {isSearchOpen ? (
                    <div ref={searchRef} className="animate-fadeIn">
                      <SearchField />
                    </div>
                  ) : (
                    <button
                      className="p-2 text-gray-400 hover:text-purpleBorder transition-colors duration-200"
                      onClick={() => setIsSearchOpen(true)}
                    >
                      <FontAwesomeIcon icon={faSearch} className="h-8 w-8" />
                    </button>
                  )}
                   {isNotiOpen && (
                    <div ref={notiRef} className="animation-fadeIn">
                      <NotificationField />
                    </div>
                  ) }
                    <button
                      onClick={() => setIsNotiOpen((prev) => !prev)}
                      className="p-2 text-gray-400 hover:text-purpleBorder transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faBell} className="h-8 w-8" />
                    </button>
                  
                </div>
              </FadeUpContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationForm;