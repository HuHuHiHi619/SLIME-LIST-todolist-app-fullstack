import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

function StartDatePicker({ id, name, selected, onChange, placeholder }) {
  return (
    <div className="relative ">
      <DatePicker
        id={id}
        name={name}
        selected={selected}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        minDate={new Date()}
        filterDate={date => date >= new Date()}
        placeholderText={placeholder}
        className="w-full  cursor-pointer p-2 pl-14 shadow placeholder:text-startDateTheme text-startDateTheme text-xl border-[2px] border-startDateTheme bg-transparent rounded-lg   focus:outline-none  focus:shadow-outline "
      />
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className="absolute left-5 bottom-[14px] text-xl text-startDateTheme"
      />
    </div>
  );
}

export default StartDatePicker;
