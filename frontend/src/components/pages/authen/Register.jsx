import React, { useState } from "react";
import { register } from "../../../functions/authen";
import { useNavigate } from "react-router-dom";
import InputField from "../ui/inputField";
import usePopup from "../hooks/usePopup";

function Register(onClose) {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { handleToggleRegister } = usePopup();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const validator = () => {
    setError("");
    if (!user.username || !user.password) {
      setError("Username and passwsord are required.");
      return false;
    }

    if (user.username > 10) {
      setError("Username cannot more than 10 characters.");
      return false;
    }
    if (user.password > 20) {
      setError("Password cannot more than 20 characters.");
      return false;
    }
    if (user.password < 6) {
      setError("Password cannot less than 6 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validator()) {
        return;
      }
      setError("");
      console.log("User Data:", user);
      const response = await register(user);
      console.log("Response:", response);
      navigate("/login");
    } catch (err) {
      console.error("Cannot sign up", err);
    }
  };

  return (
    <div className="relative border border-purpleNormal bg-purpleSidebar p-10 rounded-2xl shadow-lg w-full max-w-lg mx-4">
      <div className="grid justify-center">
        <img src="./images/Logo-slime.png" className="w-20  " alt="" />
      </div>
      <h1 className=" text-xl  md:text-3xl  text-white my-4 text-center">
        SIGN UP
      </h1>
      
        <button
          onClick={() => handleToggleRegister()}
          className="absolute top-2 right-2 text-xl text-gray-500 p-2 hover:text-red-600 transition-all rounded-full duration-100 ease-in "
        >
          X
        </button>
     

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <InputField
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-4 py-2 rounded-md text-2xl"
          />
        </div>
        <div>
          <InputField
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md text-2xl"
          />
        </div>
        <div>
          <button
            type="submit"
            className="done-button w-full tracking-widest hover:bg-violet-500 transition-all duration-300"
          >
            CREATE{""} ACCOUNT
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
