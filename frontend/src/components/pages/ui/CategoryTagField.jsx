import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function CategoryTagField({
  handleInputChange,
  name,
  value,
  entities,
  placeholder,
  icon,
  selectedTags = [],
  showTag = true,
  handleRemoveTag
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={handleInputChange}
        className="w-[150px] cursor-pointer appearance-none shadow border-[2px] border-categoryTheme bg-transparent rounded-lg p-4 pl-11 font-bold text-categoryTheme leading-tight focus:outline-none focus:shadow-outline block"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        <option value="">{`No ${placeholder.toLowerCase()}`}</option>
        {entities.map((entity) => (
          <option placeholder={placeholder} key={entity._id} value={entity[`${name}Name`]}>
            {entity[`${name}Name`]}
          </option>
        ))}
      </select>
      <FontAwesomeIcon
        className="text-categoryTheme pr-2 text-2xl left-3 bottom-4 absolute "
        icon={icon}
      />
      
         {/* Display selected tags */}
      {showTag &&  selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTags.map((tag, index) => (
            <div
              key={index}
              className="bg-white text-xl p-2 rounded-lg flex items-center gap-2"
            >
              <span>{tag}</span> 
              <button
                className="text-red-500 text-[20px] hover:text-red-700"
                onClick={(e) => handleRemoveTag(e, tag)}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryTagField;
