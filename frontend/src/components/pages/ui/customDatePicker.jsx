import React from "react";
import { format } from "date-fns";
import { Calendar } from "react-day-picker";
import "react-day-picker/dist/style.css";
import * as Popover from "@radix-ui/react-popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

// คอมโพเนนต์หลักสำหรับ DatePicker
function CustomDatePicker({
  id,
  name,
  setDate,
  date,
  variant,
  placeholder,
 
}) {
  const getThemeStyle = () => {
    switch (variant) {
      case "startDate":
        return {
          buttonClass: "border-2 border-deadlineTheme text-deadlineTheme",
          iconClass: "text-deadlineTheme",
          calendarClass: "text-deadlineTheme",
        };
      case "deadline":
        return {
          buttonClass: "border-2 border-startDateTheme text-startDateTheme",
          iconClass: "text-startDateTheme",
          calendarClass: "text-startDateTheme",
        };
    }
  };

  const themeStyles = getThemeStyle();

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const combineClassNames = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          className={combineClassNames(
            "w-full justify-start text-left font-normal p-2 pl-14 shadow text-xl rounded-lg bg-transparent relative",
            !date && "text-gray-500",
            themeStyles.buttonClass
          )}
        >
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className={combineClassNames(
              "absolute left-5 bottom-[14px] text-xl",
              themeStyles.iconClass
            )}
          />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white p-2 rounded-md shadow-md z-10"
          align="start"
        >
          <Calendar
            id={name}
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(day) => day < minDate}
            className={themeStyles.calendarClass}
          />
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
export default CustomDatePicker;
