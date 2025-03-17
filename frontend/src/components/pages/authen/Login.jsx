import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserData, loginUser } from "../../../redux/userSlice";
import InputField from "../ui/inputField";
import usePopup from "../hooks/usePopup";

 
function Login() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const { handleToggleRegister } = usePopup();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.username || !user.password) {
      setError("Username and password are required.");
      return;
    }
    setError("");

    try {
      const response = await dispatch(loginUser(user)).unwrap();

      if (response.tokens?.accessToken) {
        setTimeout(() => {
          dispatch(fetchUserData(response.user.id)).unwrap();
        }, 1000);

        navigate("/", { replace: true });
      } else {
        throw new Error("No access token found.");
      }
    } catch (err) {
      console.error("Cannot log in", err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    
      <div className="relative border border-purpleNormal  p-10 rounded-2xl shadow-lg  w-full max-w-lg mx-4">
        <div className="grid justify-center">
          <img src="./images/Logo-slime.png" className="w-20  " alt="" />
        </div>
        <h1 className="text-3xl  text-white my-4 text-center ">
          SIGN IN
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
              LOGIN
            </button>
          </div>
        </form>
      </div>
   
  );
}

export default Login;
