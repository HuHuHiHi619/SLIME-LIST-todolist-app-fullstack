import React, { useEffect, useState } from "react";
import { register } from "../../../functions/authen";
import { useDispatch } from "react-redux";
import { fetchUserData, loginUser } from "../../../redux/userSlice";
import InputField from "../ui/inputField";
import usePopup from "../hooks/usePopup";

function AuthForm({ isRegister, setActiveTab }) {
  const [user, setUser] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { handleToggleRegister } = usePopup();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.username || !user.password) {
      setError("Username and password are required.");
      return;
    }
    setError("");

    try {
      if (isRegister) {
        await register(user);
        setActiveTab("login"); 
      } else {
        const response = await dispatch(loginUser(user)).unwrap();
        if (response.tokens?.accessToken) {
        await  dispatch(fetchUserData(response.user.id)).unwrap();
        } else {
          throw new Error("No access token found.");
        }
      }
    } catch (err) {
      setError(
        isRegister ? "Registration failed." : "Login failed. Please try again."
      );
    }
  };

 console.log('isregister',isRegister)

  return (
    <div className="relative border border-purpleNormal bg-purpleSidebar p-10 rounded-2xl shadow-lg w-full max-w-lg ">
      <h1 className="text-xl md:text-3xl text-white my-4 text-center">
        {isRegister ? "SIGN UP" : "SIGN IN"}
      </h1>
      <button
        onClick={handleToggleRegister}
        className="absolute top-3 right-5 text-gray-400 hover:text-deadlineTheme text-xl transition-all duration-300"
      >
        X
      </button>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 grid">
        <InputField
          className="py-2 rounded-xl text-xl"
          type="text"
          name="username"
          value={user.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <InputField
          className="py-2 rounded-xl text-xl"
          type="password"
          name="password"
          value={user.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button
          type="submit"
          className="text-white text-xl bg-purpleNormal p-2 rounded-xl w-full tracking-widest hover:bg-violet-500 transition-all duration-300"
        >
          {isRegister ? "CREATE ACCOUNT" : "LOGIN"}
        </button>
      </form>

      <button
        onClick={() => setActiveTab(isRegister ? "login" : "register")}
        className="text-center mt-4  text-gray-400 hover:text-white"
      >
        {isRegister
          ? "Already have an account ? Sign in"
          : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}

export default AuthForm;
