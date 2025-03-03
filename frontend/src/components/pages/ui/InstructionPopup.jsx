import React, { useState } from "react";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
function InstructionPopup({ onClose }) {
  const images = ["./images/instructions-1.png", "./images/instructions-2.png", "./images/instructions-3.png"];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };
  const handlePrevious = () => {
    setCurrentIndex( currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };
  return (
    <>
      <FadeUpContainer direction="down" delay={0.2}>
        <div className="flex justify-center items-center relative">
          <div
            onClick={onClose}
            className=" w-[300px] rounded-[20px] md:w-[500px] md:rounded-[50px] h-auto p-1  bg-gradient-to-r from-[#6D6DFD] via-[#CE88FA] to-[#6D6DFD]"
          >
            <div className=" bg-transparent ">
              <img src={images[currentIndex]} alt="instructions" loading="lazy" />
            </div>
            <button
              onClick={handleNext}
              className="z-50 text-[50px] md:text-[100px] transition-all duration-200 ease-out  text-white absolute top-40  -right-3 md:top-60 md:-right-20 hover:scale-125 hover:text-purpleBorder"
            >
              <FontAwesomeIcon icon={faCaretRight} />
            </button>
            <button
              onClick={handlePrevious}
              className="z-50 text-[50px] md:text-[100px] transition-all duration-200 ease-out text-white absolute top-40 -left-3   md:top-60  md:-left-20 hover:scale-125 hover:text-purpleBorder"
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
