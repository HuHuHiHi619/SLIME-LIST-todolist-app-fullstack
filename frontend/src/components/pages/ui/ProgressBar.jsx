import React from "react";

const ProgressBar = ({ value }) => {
  return (
    <div
      className="bg-darkBackground rounded-full"
      style={{ height: "7px", width: "100%", backgroundColor: "#171717",  }}
    >
      {value > 0 && (
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: "20px",
            transition: "width 0.5s ease-in-out",
          }}
          className="bg-[#1ef996]"
        />
      )}
    </div>
  );
};

export default ProgressBar;
