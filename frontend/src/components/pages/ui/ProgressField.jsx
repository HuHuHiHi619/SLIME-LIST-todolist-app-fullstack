import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark , faCheck} from "@fortawesome/free-solid-svg-icons";

function ProgressField({
  steps,
  handleRemoveStep,
  handleStepComplete,
  showCompletion = true,
}) {
  return (
    <div>
    {steps.length > 0 ? (
      <div>
        <p className="text-2xl text-white mb-2">Progress steps</p>
        <ul className="flex flex-col max-h-[100px] md:max-h-[140px] gap-2 overflow-y-scroll scrollbar-custom overflow-x-hidden ">
          {steps.map((step, index) => (
            <li
              key={index}
              className={` pl-6 rounded-lg  hover:bg-purpleNormal
              }`}
            >
              <div className="flex items-center gap-3 py-2 ">
                {showCompletion && (
                  step.completed ? (
                    <FontAwesomeIcon 
                    icon={faCheck} className="text-white text-base p-1 bg-purpleBorder rounded-full" 
                    style={{
                      transition: 'transform 0.3s ease-in-out',
                      transform: step.completed ? 'scale(1)' : 'scale(0)',
                    }}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => handleStepComplete(index)}
                    />
                  )
                )}
  
                <span
                  className={`  truncate max-w-[calc(80%-60px)] ${
                    step.completed ? "line-through text-purpleBorder" : ""
                  }`}
                >
                  {step.label}
                </span>
                <button
                  type="button"
                  className="flex items-center text-white"
                  onClick={() => handleRemoveStep(index)}
                >
                  <FontAwesomeIcon icon={faXmark} className="delete-step" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ) : (
     null
    )}
  </div>
  )}

export default ProgressField;
