import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


function CalendarField() {
  const [value, setValue] = useState(new Date());

  return (
    <div className="custom-calendar-container rounded-3xl bg-mainGradient">
      <Calendar
        onChange={setValue}
        value={value}
      />
    </div>
  );
}

export default CalendarField;
