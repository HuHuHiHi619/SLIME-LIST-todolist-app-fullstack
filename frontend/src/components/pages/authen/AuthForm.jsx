import React, { useState } from "react";
import { register } from "../../../functions/authen";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData, loginUser } from "../../../redux/userSlice";
import InputField from "../ui/inputField";
import usePopup from "../hooks/usePopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import SlimePortal from "../animation/SlimePortal";

function AuthForm({ isRegister, setActiveTab }) {
  const [user, setUser] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { handleToggleRegister } = usePopup();
  const { loading } = useSelector((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isSubmitting) return;
    setError("");
    if (!user.username || !user.password) {
      setError("Username and password are required.");
      console.error("Username and password are required");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(user);
        setActiveTab("login");
      } else {
        const response = await dispatch(loginUser(user)).unwrap();
        console.log("authForm login response", response);
        await dispatch(fetchUserData()).unwrap();
        console.log("login completed");
      }
    } catch (err) {
      setError(
        isRegister ? "Registration failed." : "Login failed. Please try again."
      );
      console.error("ERROR", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`relative border   ${
        isRegister
          ? "bg-purpleSidebar border-purpleNormal"
          : "bg-purpleMain border-purpleNormal "
      } p-10 rounded-2xl shadow-lg w-full max-w-lg `}
    >
      {loading && (
        <div className="popup-overlay">
          <SlimePortal />
        </div>
      )}

      <h1 className="text-xl md:text-3xl text-white my-4 text-center">
        {isRegister ? "SIGN UP" : "SIGN IN"}
      </h1>
      <FontAwesomeIcon
        icon={faXmark}
        onClick={handleToggleRegister}
        className="absolute delete-step text-xl text-gray-400 top-3 right-3"
      />
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
          className="text-white text-xl bg-purpleNormal p-2 rounded-xl w-full tracking-widest hover:font-bold hover:bg-violet-500 transition-all duration-300"
        >
          {isRegister ? "CREATE ACCOUNT" : "LOGIN"}
        </button>
      </form>

      <button
        onClick={() => setActiveTab(isRegister ? "login" : "register")}
        className="w-full text-center mt-4  text-gray-400 hover:text-white "
      >
        {isRegister ? (
          <p>
            Already have an account ?
            <br />
            Sign in
          </p>
        ) : (
          <p>
            Don't have an account? <br />
            Sign up
          </p>
        )}
      </button>
    </div>
  );
}

export default AuthForm;
