import React, { useEffect, useState } from "react";

function AutoTyping({ text = "", speed = 100, pause = 1000 }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!deleting && index < text.length) {
        // start typing
        setDisplayed((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      } else if (!deleting && index === text.length) {
        // pause then enter delete mode
        setTimeout(() => setDeleting(true), pause);
      } else if (deleting && index > 0) {
        // start deleting
        setDisplayed((prev) => prev.slice(0, -1));
        setIndex((prev) => prev - 1);
      } else if (deleting && index === 0) {
        setDeleting(false);
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [text, speed, index, deleting, pause]);

  return (
    <div className="relative">
      <span className="absolute top-14 md:top-16 lg:top-24 -left-36 md:-left-44 lg:-left-60 text-white text-[60px] md:text-[80px] lg:text-[100px]">
        {displayed}
      </span>
    </div>
  );
}

export default AutoTyping;
