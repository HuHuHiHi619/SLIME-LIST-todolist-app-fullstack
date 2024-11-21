import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faTag } from "@fortawesome/free-solid-svg-icons";

function CategoryTagField({
  handleInputChange,
  name,
  value,
  entities = [],
  placeholder,
  selectedTags = [],
  showTag = true,
  handleRemoveTag,
}) {
  const filterIcon = name === "category" ? faFolder : faTag;

  // Flexbox-based class for the select input and container
  const filterClass = showTag
    ? "flex-grow cursor-pointer appearance-none shadow bg-transparent text-gray-400 pl-11 pt-2 font-bold focus:outline-none focus:shadow-outline block"
    : "w-[230px] cursor-pointer leading-7 appearance-none text-[20px] shadow border-[2px] border-categoryTheme bg-transparent rounded-lg p-2 pl-11 text-categoryTheme leading-tight focus:outline-none focus:shadow-outline block";

  const filterIconClass = showTag
    ? "text-gray-400 pr-2 text-2xl left-3 top-1/3 transform   absolute pointer-events-none"
    : "text-categoryTheme pr-2 text-2xl left-3 bottom-3 absolute pointer-events-none";

  return (
    <div className="">
      <div className="flex flex-1 gap-2 items-center relative">
        <FontAwesomeIcon className={filterIconClass} icon={filterIcon} />

        {/* Select input */}
        <select
          name={name}
          value={value}
          onChange={handleInputChange}
          className={filterClass}
        >
          {name === "tag" ? (
            <option>Tag</option>
          ) : (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {name === "category" ? (
            <option value="">{`No ${placeholder.toLowerCase()}`}</option>
          ) : null}

          {Array.isArray(entities) && entities.length > 0 ? (
            entities.map((entity) => (
              <option
                key={entity._id}
                value={entity[`${name}Name`]}
                className="py-2 px-4 text-gray-400 hover:bg-purple-50"
              >
                {entity[`${name}Name`]}
              </option>
            ))
          ) : (
            <option disabled>{placeholder}</option> // แสดงข้อความ placeholder ถ้าไม่มีค่าใน entities
          )}
        </select>
      </div>

      {/* Display selected tags */}
      {showTag && selectedTags.length > 0 && (
        <div className="mt-2 ml-2 flex gap-2 flex-wrap">
          {selectedTags.map((tag, index) => (
            <div
              key={index}
              className="bg-purpleMain text-white text-xl p-2 rounded-lg flex items-center gap-2"
            >
              <span>{tag.tagName}</span>
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
