import axios from "axios";


export const register = async (data) => {
  try {
    const response = await axios.post(`/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error(
      "Error during registration:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const userLogin = async (data) => {
  try {
   
    const response = await axios.post(`/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    if(response){
        console.log('Login success')
    }
    return response.data;
  } catch (error) {
    console.error("Error during login:", error.response?.data || error.message);
    throw error;
  }
};

export const userLogout = async () => {
  try {
    const response = await axios.post(
      `/logout`,
      {},
      {
        headers: {
          "Content-type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during logout", error.response?.data || error.message);
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const response = await axios.get(`/user/profile`, {
      headers: {
        "Content-type": "application/json",
      },
      withCredentials: true,
    });
    if (!response.data) {
      throw new Error("No user data found");
    }
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching userData",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getRefreshToken = async () => {
  try {
    const response = await axios.post(
      `/refreshToken`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("get refresh", response.data);
    return response.data.accessToken;
  } catch (error) {
    console.error(
      "Error getting refresh token",
      error.response?.data || error.message
    );
    throw error;
  }
};
