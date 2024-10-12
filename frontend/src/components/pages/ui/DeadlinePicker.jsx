import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

function DeadlinePicker({ id, name, selected, onChange, placeholder }) {
  return (
    <div className="relative">
      <DatePicker
        id={id}
        name={name}
        selected={selected}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        minDate={new Date()}
        filterDate={date => date >= new Date()}
        placeholderText={placeholder}
        className="w-[150px] cursor-pointer shadow placeholder:text-deadlineTheme text-deadlineTheme border-[2px] border-deadlineTheme bg-transparent rounded-lg p-4 pl-11 font-bold leading-tight focus:outline-none focus:shadow-outline block"
      />
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className="absolute left-3 bottom-4 text-2xl text-red-500" // ฟิกสีแดง
      />
    </div>
  );
}

export default DeadlinePicker;
