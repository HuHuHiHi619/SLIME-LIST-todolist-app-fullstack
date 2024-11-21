import React, { useState  } from "react";
import InputField from "../ui/inputField";
import FadeUpContainer from "../animation/FadeUpContainer";
import { createCategory } from "../../../functions/category";
import { createTag } from "../../../functions/tag";
import { useSelector } from "react-redux";

function CreateEntity({ onAddItem, entityType }) {
  const [formEntity, setFormEntity] = useState({
    name: "",
  });
  const [error, setError] = useState("");
  const { categories , tags } = useSelector((state) => state.tasks)
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
    
    if (entityType === "tag" && tags.length >= 3) {
        setError("Tag has maxed at 3 !!!");
        return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setFormEntity({ name: value });
  };

  const handleSubmit = async (e) => {
    if (e.key === "Enter" && formEntity.name.trim() !== "") {
      e.preventDefault();
      if (!validator()) {
        return;
      }
      try {
        let response;
        if (entityType === "category") {
          response = await createCategory({ categoryName: formEntity.name });
        } else if (entityType === "tag") {
          response = await createTag({ tagName: formEntity.name });
        }

        if (response) {
          console.log("Successfully created:", response);
          onAddItem(response);
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
    <div className="bg-purpleMain px-6 py-4 rounded-xl w-[600px]">
      <h3>Create {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</h3>
      {error && <p className="text-xl text-rose-500">{error}</p>}
      <InputField
        type="text"
        placeholder={`Enter ${entityType}`}
        value={formEntity.name}
        onChange={handleChange}
        onKeyDown={handleSubmit}
        className="w-full placeholder:text-xl px-4 py-3 rounded-xl mt-2"
      />
    </div>
    </FadeUpContainer>
   
    </>
    
  );
}

export default CreateEntity;
