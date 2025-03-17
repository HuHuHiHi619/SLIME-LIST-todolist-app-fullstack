import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

function StartDatePicker({ id, name, selected, onChange, placeholder }) {
  const minDate = new Date().setHours(0, 0, 0, 0);
  const selectedDate = selected ? new Date(selected) : new Date();

  return (
    <div className="relative w-full">
      <DatePicker
        id={id}
        name={name}
        selected={selectedDate}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        minDate={minDate}
        filterDate={(date) => date >= minDate}
        placeholderText={placeholder}
        popperPlacement="bottom-start"
        className="w-full cursor-pointer p-2 pl-14 shadow placeholder:text-startDateTheme text-startDateTheme text-xl border-[2px] border-startDateTheme bg-transparent rounded-lg focus:outline-none focus:shadow-outline"
        calendarClassName="elegant-datepicker"
        showPopperArrow={false}
      />
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className="absolute left-5 bottom-[14px] text-xl text-startDateTheme"
      />
    </div>
  );
}

export default StartDatePicker;
