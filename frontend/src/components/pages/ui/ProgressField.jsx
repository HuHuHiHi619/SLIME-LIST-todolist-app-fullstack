import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

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
          <h3 className="text-white mb-2">Progress steps</h3>
          <ul className="flex flex-col max-h-[140px] gap-4 overflow-y-scroll scrollbar-custom ">
            {steps.map((step, index) => (
              <li
                key={index}
                className={`flex justify-between items-center p-2 pl-4 rounded-lg ${
                  step.completed ? "bg-completedTask" : "bg-purpleNormal"
                }`}
              >
                <div className="flex items-center gap-4 py-1">
                  {showCompletion && (
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => handleStepComplete(index)}
                    />
                  )}

                  <span
                    className={`text-white text-2xl ${
                      step.completed ? "line-through" : ""
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                <button type="button" onClick={() => handleRemoveStep(index)}>
                  <FontAwesomeIcon icon={faTrash} className="delete-step" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <h3 className="text-slate-400">No progress</h3>
      )}
    </div>
  );
}

export default ProgressField;
