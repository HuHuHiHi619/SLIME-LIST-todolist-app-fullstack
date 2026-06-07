import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faChevronDown } from "@fortawesome/free-solid-svg-icons";

// Fixed enum — values must match the backend PRIORITIES (low|medium|high).
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Native <select> (not the CategoryTagField custom dropdown): priority is a fixed
// 3-value enum, so a native control is accessible by default and emits a real
// { target: { name, value } } event that the parents' handleInputChange already consumes.
function PriorityField({ name = "priority", value = "low", handleInputChange }) {
  return (
    <div className="relative md:w-[230px] w-full">
      <select
        name={name}
        value={value || "low"}
        onChange={handleInputChange}
        className="md:w-[230px] w-full h-[44px] cursor-pointer appearance-none text-xl shadow border-[2px] border-purpleNormal bg-transparent rounded-xl p-2 pl-14 pr-10 text-purpleNormal leading-tight focus:outline-none focus:ring-2 focus:ring-purpleNormal focus:ring-opacity-50"
        aria-label="Priority"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-black">
            {opt.label}
          </option>
        ))}
      </select>

      <FontAwesomeIcon
        icon={faFlag}
        className="text-purpleNormal text-xl left-5 bottom-3 absolute pointer-events-none"
        aria-hidden="true"
      />
      <FontAwesomeIcon
        icon={faChevronDown}
        className="text-purpleNormal text-base right-4 bottom-4 absolute pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

export default PriorityField;
