import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

function DeadlinePicker({ id, name, selected, onChange, placeholder }) {
  const selectedDate = selected ? new Date(selected) : null;
  return (
    <div className="relative w-full">
      <DatePicker
        id={id}
        name={name}
        selected={selectedDate}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        minDate={new Date()}
        filterDate={date => date >= new Date()}
        placeholderText={placeholder}
        popperPlacement="bottom-start"
        className="w-full cursor-pointer p-2 pl-14 shadow placeholder:text-deadlineTheme text-deadlineTheme text-xl border-[2px] border-deadlineTheme bg-transparent rounded-xl focus:outline-none focus:shadow-outline"
        calendarClassName="elegant-datepicker"
        showPopperArrow={false}
     />
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className="absolute left-5 bottom-[14px] text-xl text-red-500" // ฟิกสีแดง
      />
    </div>
  );
}

export default DeadlinePicker;
