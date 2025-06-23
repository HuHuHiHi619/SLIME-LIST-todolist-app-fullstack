import React, { useState } from "react";
import InputField from "../ui/inputField";
import FadeUpContainer from "../animation/FadeUpContainer";
import SuccessPopup from "../ui/SuccessPopup";
import { createCategory } from "../../../functions/category";
import { useSelector } from "react-redux";
import Tooltip from "../ui/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function CreateEntity({ onAddItem, entityType, onClose }) {
  const [formEntity, setFormEntity] = useState({
    name: "",
  });
  const [showPopup , setShowPopup] = useState(false)
  const [error, setError] = useState("");
  const { categories } = useSelector((state) => state.tasks);
  const validator = () => {
    setError("");
    if (formEntity.name.length > 10) {
      setError("Category and tag cannot be more than 10 characters");
      return false;
    }
    if (entityType === "category" && categories.length >= 3) {
      setError("Category has maxed at 3 !!!");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setFormEntity({ name: value });
  };

  const handleSubmit = async (e) => {
    if (
      (e.key === "Enter" || e.type === "click") &&
      formEntity.name.trim() !== ""
    ) {
      e.preventDefault();
      if (!validator()) {
        return;
      }
      try {
        let response;
        if (entityType === "category") {
          response = await createCategory({ categoryName: formEntity.name });
        }

        if (response) {
          console.log("Successfully created:", response);
          setShowPopup(true);
          await new Promise((res) => setTimeout(res, 700));
          setShowPopup(false);
          await new Promise((res) => setTimeout(res, 300));
          onAddItem(response)
        } else {
          console.error("No response received:", error);
        }
      } catch (error) {
        console.error(`Cannot create ${entityType}:`, error.message);
        setError(`Cannot create ${entityType}`);
      }
    }
  };

  return (
    <>
      <FadeUpContainer>
        <div className="bg-purpleGradient p-0.5 rounded-xl md:w-[450px] relative">
          <div className="bg-purpleSidebar p-8 rounded-xl">
            <p className="text-2xl md:text-3xl text-white">
              CREATE {entityType.toUpperCase()}
            </p>
            {error && <p className="text-xl text-rose-500">{error}</p>}
            <InputField
              type="text"
              placeholder={`Enter ${entityType} name`}
              value={formEntity.name}
              onChange={handleChange}
              onKeyDown={handleSubmit}
              className="w-full placeholder:text-xl px-4 py-3 rounded-xl my-6"
            />
            <button
              onClick={handleSubmit}
              className="done-button mx-auto active:scale-105"
            >
              Create
            </button>
            <button
              className="text-gray-500 text-xl  absolute top-3 right-5"
              onClick={onClose}
            >
              <Tooltip description={"close"} position="top">
                <FontAwesomeIcon
                  icon={faXmark}
                  className="hover:text-red-500"
                />
              </Tooltip>
            </button>
          </div>
        </div>
      </FadeUpContainer>
      <SuccessPopup
        show={showPopup}
        message={
          <>
            <p>SUCCESS!</p>
            <p>YOUR ACCOUNT HAS BEEN CREATED</p>
          </>
        }
      />
    </>
  );
}

export default CreateEntity;
