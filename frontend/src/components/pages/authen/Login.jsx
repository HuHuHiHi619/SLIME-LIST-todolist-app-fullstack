import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserData, loginUser } from "../../../redux/userSlice";
import InputField from "../ui/inputField";

function Login() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

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
    <div className="flex justify-center items-center h-screen bg-purpleSidebar">
      <div className="  bg-purpleGradient p-1 rounded-2xl shadow-lg w-full max-w-lg">
        <div className="bg-purpleSidebar p-8 rounded-xl">
          <h1 className="text-3xl  text-white mb-6 text-center">LOGIN</h1>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
                className=" w-full px-4 py-2 rounded-md text-2xl"
              />
            </div>
            <div>
              <button
                type="submit"
                className="done-button w-full hover:bg-violet-500 transition-all duration-150"
              >
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
