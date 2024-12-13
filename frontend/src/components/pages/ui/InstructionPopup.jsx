import React,{ useState } from "react";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight , faArrowLeft} from "@fortawesome/free-solid-svg-icons";
function InstructionPopup({ onClose }) {
  const images = [
    "./images/instructions-1.png",
    "./images/instructions-2.png", 
  ]

  const [currentIndex,setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }
  return (
    <>
      <FadeUpContainer direction="down" delay={0.2}>
        <div className="flex justify-center items-center relative">
          <div 
            onClick={onClose} 
            className=" w-[500px] h-auto p-1 rounded-[50px] bg-gradient-to-r from-[#6D6DFD] via-[#CE88FA] to-[#6D6DFD]"
          >
            <div className=" bg-transparent ">
              <img 
                src={images[currentIndex]} 
                alt="instructions" 
              />
             
            </div>
            <button onClick={handleNext} className="done-button absolute top-80 -right-14">
            <FontAwesomeIcon icon={faArrowRight} />
              </button>
          <button onClick={handlePrevious} className="done-button absolute top-80 -left-14">
          <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>
         
        </div>
      </FadeUpContainer>
    </>
  );
}

export default InstructionPopup;
