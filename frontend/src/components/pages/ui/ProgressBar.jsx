import React from "react";

const ProgressBar = ({ value, color }) => {
  return (
    <div
      className="bg-darkBackground rounded-full"
      style={{ height: "7px", width: "100%", backgroundColor: "#171717",  }}
    >
      {value > 0 && (
        <div
          style={{
            width: `${value}%`,
            background: `linear-gradient(to right, ${color.start}, ${color.end})`,
            height: "100%",
            borderRadius: "20px",
            transition: "width 0.5s ease-in-out",
          }}
        />
      )}
    </div>
  );
};

export default ProgressBar;
