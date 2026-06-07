import React, { useState } from "react";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight ,  faXmark } from "@fortawesome/free-solid-svg-icons";

function InstructionPopup({ onClose }) {
  const images = [
    "./images/instructions-1.png",
    "./images/instructions-2.png",
    "./images/instructions-3.png",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((currentIndex + 1) % images.length);
  };
  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  return (
    <>
      <FadeUpContainer direction="down" delay={0.2}>
        <div
          className="flex justify-center items-center relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className=" w-[320px] rounded-[30px] sm:w-[500px] sm:rounded-[50px] h-auto p-1  bg-gradient-to-r from-[#6D6DFD] via-[#CE88FA] to-[#6D6DFD]">
            <div className=" bg-transparent ">
              <img
                src={images[currentIndex]}
                alt="instructions"
                loading="lazy"
              />
            </div>
            <button
              onClick={onClose}
              className="absolute top-6 right-8 text-xl text-center text-white shadow-md hover:text-deadlineTheme transition-colors z-50"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <button
              onClick={handleNext}
              className="z-50 text-[50px] sm:text-[100px] transition-all duration-200 ease-out  text-white absolute top-40  -right-3 sm:top-60 sm:-right-20 hover:scale-125 hover:text-purpleBorder"
            >
              <FontAwesomeIcon icon={faCaretRight} />
            </button>
            <button
              onClick={handlePrevious}
              className="z-50 text-[50px] sm:text-[100px] transition-all duration-200 ease-out text-white absolute top-40 -left-3   sm:top-60  sm:-left-20 hover:scale-125 hover:text-purpleBorder"
            >
              <FontAwesomeIcon icon={faCaretLeft} />
            </button>
          </div>
        </div>
      </FadeUpContainer>
    </>
  );
}

export default InstructionPopup;
