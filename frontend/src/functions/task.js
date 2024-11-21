import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const createTask = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/task`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // ทำให้ cookie ถูกส่ง
    });

    console.log("Task created successfully:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
};

export const getData = async (filter) => {
  try {
    const response = await axios.get(`${API_URL}/task`, {
      params: filter,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // ทำให้ cookie ถูกส่ง
    });

    console.log("Task got successfully :", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
};

export const searchedTask = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_URL}/task/searchTask?q=${searchTerm}`, {
      headers:{
        "Content-Type": "application/json"
      },
      withCredentials:true
    })
    console.log("Task searched successfully :", response.data);
    return response.data.tasks
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
};

export const completeTask = async (taskId) => {
  console.log("taskID FOR COMPLETED", taskId);
  try {
    const response = await axios.patch(
      `${API_URL}/task/${taskId}/completed`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return { _id: taskId, ...response.data };
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
};

export const updateTask = async (id, data) => {
  console.log("DATA", id, data);
  try {
    const response = await axios.put(`${API_URL}/task/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error(
        "No response recieved from server:",
        error.response.request
      );
    } else {
      console.error("Axios error:", error.message);
    }
  }
};

export const removeTask = async (taskId) => {
  try {
    const response = await axios.delete(`${API_URL}/task/${taskId}/`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return { _id: taskId, ...response.data };
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
};

export const updateTaskAttempt = async (taskId) => {
  try {
    const response = await axios.put(
      `${API_URL}/user/${taskId}/attempt`,
      {},
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    return { _id: taskId, ...response.data }; // ใช้ response.data
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error; // โยน error เพื่อจัดการเพิ่มเติมใน thunk
  }
};
