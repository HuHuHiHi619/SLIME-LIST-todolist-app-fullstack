import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";

function CategoryTagField({
  handleInputChange,
  name,
  value,
  entities = [],
  placeholder,
}) {
  const filterIcon = faFolder;

  const filterClass =
    "md:w-[230px] w-full cursor-pointer leading-7 appearance-none text-[20px] shadow border-[2px] border-categoryTheme bg-transparent rounded-lg p-2 pl-11 text-categoryTheme leading-tight focus:outline-none focus:shadow-outline block";

  const filterIconClass =
    "text-categoryTheme pr-2 text-2xl left-3 bottom-3 absolute pointer-events-none";

  return (
    
      <div className=" relative">
        <FontAwesomeIcon className={filterIconClass} icon={filterIcon} />

        {/* Select input */}
        <select
          name={name}
          value={value}
          onChange={handleInputChange}
          className={filterClass}
        >
          <option value="No category" className="text-black">
            {`No ${placeholder.toLowerCase()}`}
          </option>

          {Array.isArray(entities) && entities.length > 0 ? (
            entities.map((entity) => (
              <option
                key={entity._id}
                value={entity[`${name}Name`]}
                className="py-2 px-4 text-gray-800"
              >
                {entity[`${name}Name`]}
              </option>
            ))
          ) : (
           null
          )}
        </select>
      </div>
   
  );
}

export default CategoryTagField;
