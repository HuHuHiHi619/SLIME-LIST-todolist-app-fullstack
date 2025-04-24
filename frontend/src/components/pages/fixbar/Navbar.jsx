import { React, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSpinner } from "@fortawesome/free-solid-svg-icons";
import ReactDOM from "react-dom";
import NotificationForm from "../ui/NotificationForm";
import usePopup from "../hooks/usePopup";
import AuthTabs from "../authen/AuthTabs";
import FadeUpContainer from "../animation/FadeUpContainer";

function Navbar() {
  const { isAuthenticated, loading, isRegisterPopup } = useSelector(
    (state) => state.user
  );
  const { handleToggleRegister, handleToggleSidebar, popupRegisterRef } =
    usePopup();

  return (
    <>
      <div id="nav-bar">
        <div className="flex items-center ">
          <FontAwesomeIcon
            icon={faBars}
            onClick={() => handleToggleSidebar()}
            className="pl-4 text-white text-xl cursor-pointer hover:scale-105 md:hidden"
          />
          <Link to="/" className=" flex items-center gap-3 pl-4 ">
            <img src="./images/Logo-slime.png" className="w-8 " alt="" />
            <p className="text-sm md:text-3xl font-bold bg-purpleGradient bg-clip-text text-transparent">
              SLIME LIST
            </p>
          </Link>
        </div>
        {!isAuthenticated && (
          <div className="flex mx-4 gap-4 items-center">
            <button
              className="register"
              onClick={() => !loading && handleToggleRegister()}
              disabled={loading}
            >
              Sign up
            </button>
          </div>
        )}

        {/* แสดงป๊อปอัพเสมอถ้า isRegisterPopup เป็น true โดยไม่สนใจ loading */}
        {!isAuthenticated &&
          isRegisterPopup &&
          ReactDOM.createPortal(
            <div className="popup-overlay ">
              <div className="popup-content">
                <FadeUpContainer direction="top">
                  <AuthTabs ref={popupRegisterRef} />
                </FadeUpContainer>
              </div>
            </div>,
            document.body
          )}

        {isAuthenticated && <NotificationForm />}
      </div>
    </>
  );
}

export default Navbar;
