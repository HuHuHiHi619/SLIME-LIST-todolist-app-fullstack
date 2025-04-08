import React, { useState, useRef, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faFolder, faChevronDown } from "@fortawesome/free-solid-svg-icons";

function CategoryTagField({
  handleInputChange,
  name,
  value,
  entities = [],
  placeholder,
  showTag = false // รองรับ prop นี้เพื่อความเข้ากันได้กับโค้ดเดิม
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue,setLocalValue] = useState(value || "No category") 
  const dropdownRef = useRef(null);

  useEffect(() => {
    if(value !== undefined && value !== null){
      setLocalValue(value)
    }
  },[value])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  

 
  const handleSelectOption = (optionValue) => {
    // update value in local state
    setLocalValue(optionValue)
    // สร้าง synthetic event ที่เหมือนกับ event จาก native select
    const syntheticEvent = {
      target: {
        name: name,
        value: optionValue,
        type: 'select-one', // เพิ่ม type เพื่อความเข้ากันได้
        tagName: 'SELECT'   // เพิ่ม tagName เพื่อความเข้ากันได้
      },
      currentTarget: {
        name: name,
        value: optionValue
      },
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    
    // เรียกใช้ handler เดิม
    handleInputChange(syntheticEvent);
    setIsOpen(false);
  };

  // ฟังก์ชันหาข้อความที่แสดง
  const getDisplayText = () => {
    if (!localValue || localValue === "No category") {
      return `No ${placeholder ? placeholder.toLowerCase() : 'category'}`;
    }
    
    const selectedEntity = entities.find(entity => entity[`${name}Name`] === localValue);
    return selectedEntity ? selectedEntity[`${name}Name`] : `No ${placeholder ? placeholder.toLowerCase() : 'category'}`;
  };

  

  return (
    <div className="relative md:w-[230px] w-full" ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:w-[230px] w-full h-[48px] cursor-pointer appearance-none text-xl shadow border-[2px] border-categoryTheme bg-transparent rounded-lg p-2 pl-12 text-categoryTheme leading-tight focus:outline-none focus:ring-2 focus:ring-categoryTheme focus:ring-opacity-50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-value={localValue}
      >
        <div className="flex justify-between items-center">
          <span className="truncate text-categoryTheme text-xl">{getDisplayText()}</span>
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className={`ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Folder Icon */}
      <FontAwesomeIcon 
        className="text-categoryTheme pr-2 text-xl left-5 bottom-4 absolute pointer-events-none" 
        icon={faFolder}
        aria-hidden="true"
      />

      {/* Dropdown options */}
      {isOpen && (
        <div 
          className="absolute z-20 w-full mt-2 bg-darkBackground border border-purpleNormal rounded-lg shadow-lg overflow-auto" 
          role="listbox"
        >
          <div
            className={`py-2 px-4 text-gray-300 hover:bg-purpleNormal  cursor-pointer ${value === "No category" ? "bg-categoryTheme bg-opacity-10 font-medium" : ""}`}
            onClick={() => handleSelectOption("No category")}
            role="option"
            aria-selected={value === "No category"}
          >
            {`No ${placeholder ? placeholder.toLowerCase() : 'category'}`}
          </div>

          {Array.isArray(entities) && entities.length > 0 ? (
            entities.map((entity) => (
              <div
                key={entity._id}
                className={`py-2 px-4 text-gray-300 hover:bg-purpleNormal cursor-pointer ${value === entity[`${name}Name`] ? "bg-categoryTheme bg-opacity-10 font-medium" : ""}`}
                onClick={() => handleSelectOption(entity[`${name}Name`])}
                role="option"
                aria-selected={value === entity[`${name}Name`]}
              >
                {entity[`${name}Name`]}
              </div>
            ))
          ) : (
            <div className="py-2 px-4 text-gray-500 italic">No options available</div>
          )}
        </div>
      )}

      {/* Hidden select for form compatibility */}
      <select 
        name={name}
        value={value || "No category"}
        onChange={() => {}} // ไม่จำเป็นต้องทำอะไรเพราะเราจัดการผ่าน custom dropdown
        className="hidden" // ซ่อนไว้ไม่ให้แสดงผล
        aria-hidden="true"
      >
        <option  value="No category">{`No ${placeholder ? placeholder.toLowerCase() : 'category'}`}</option>
        {Array.isArray(entities) && entities.length > 0 && 
          entities.map((entity) => (
            <option key={entity._id} value={entity[`${name}Name`]}>
              {entity[`${name}Name`]}
            </option>
          ))
        }
      </select>
    </div>
  );
}

export default CategoryTagField;