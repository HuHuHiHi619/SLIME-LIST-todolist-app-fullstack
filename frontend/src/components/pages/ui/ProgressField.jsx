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
        <h3 className="text-white mb-2">Progress steps :</h3>
        <ul className="flex flex-col max-h-[140px] gap-3 overflow-y-scroll scrollbar-custom overflow-x-hidden ">
          {steps.map((step, index) => (
            <li
              key={index}
              className={`p-2 pl-4 rounded-lg  hover:bg-purpleNormal
              }`}
            >
              <div className="flex items-center gap-3 py-1 ">
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
                  className={` text-2xl truncate max-w-[calc(80%-60px)] ${
                    step.completed ? "line-through text-purpleBorder" : ""
                  }`}
                >
                  {step.label}
                </span>
                <button
                  type="button"
                  className="flex items-center"
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
      <h3 className="text-slate-400 pl-4">No progress</h3>
    )}
  </div>
  )}

export default ProgressField;
