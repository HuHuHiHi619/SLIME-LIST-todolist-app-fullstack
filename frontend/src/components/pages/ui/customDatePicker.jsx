import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

// คอมโพเนนต์หลักสำหรับ DatePicker
function CustomDatePicker({ id, name, selected, onChange, placeholder, className, iconColor }) {
  return (
    <div className="relative">
      <DatePicker
        id={id}
        name={name}
        selected={selected}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        className={`w-[150px] cursor-pointer shadow  placeholder:text-${iconColor} text-${iconColor} border-[2px] border- bg-transparent rounded-lg p-4 pl-11 font-bold leading-tight focus:outline-none focus:shadow-outline block ${className}`}
      />
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className={`absolute left-3 bottom-4 text-2xl text-${iconColor}`}
      />
    </div>
  );
}

// คอมโพเนนต์สำหรับ StartDatePicker
export function StartDatePicker(props) {
  return <CustomDatePicker {...props} iconColor="startDateTheme" />;
}

// คอมโพเนนต์สำหรับ DeadlinePicker
export function DeadlinePicker(props) {
  return <CustomDatePicker {...props} iconColor="deadlineTheme"  />;
}
