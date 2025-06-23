import React from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import FadeUpContainer from "../animation/FadeUpContainer";
import { AnimatePresence } from "framer-motion";

export default function SuccessPopup({ show, onRef, message }) {
  return ReactDOM.createPortal(
    <div className="fixed z-[9999] bottom-16 right-1/2 translate-x-1/2">
      <AnimatePresence mode="wait"> {/* ✅ เพิ่ม mode="wait" เพื่อให้ exit เสร็จก่อน unmount */}
        {show && (
          <FadeUpContainer key="success-popup" direction="down">
            <div
              className="flex items-center border-4 p-4 rounded-xl bg-darkBackground"
              ref={onRef}
            >
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="border-4 p-2 rounded-lg text-green-400 text-xl"
              />
              <div className="pl-4 text-white text-base lg:text-xl">
                {typeof message === "string" ? <p>{message}</p> : message}
              </div>
            </div>
          </FadeUpContainer>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
