import React, { useState } from "react";
import { register } from "../../../functions/authen";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

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
      console.log("User Data:", user); // Log user data before submitting
      const response = await register(user); // Send the actual user state data
      console.log("Response:", response);
      navigate("/login");
    } catch (err) {
      console.error("Cannot sign up", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-darkBackground">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Register
      </h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}

export default Register;
