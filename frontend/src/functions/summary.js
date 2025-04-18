import axios from "axios";
import API_URL from "../Config/apiConfig";

export const getSummaryTask = async () => {
  try {
    console.log("===== FETCHING SUMMARY =====");
    console.log("URL:", `${API_URL}/summary/completed-rate`);
    console.log("withCredentials:", true);
    const response = await axios.get(`${API_URL}/summary/completed-rate`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    console.log("Raw summary  response:", response.data);
        
    // แก้ไขตรงนี้ - ตรวจสอบ message ให้ถูกต้อง
    if (response.data.message === 'No data found') {
        console.log("No tasks found for summary.");
        return [];
    }
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};

export const getSummaryTaskByCategory = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/summary/completed-rate-by-category`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
   

    console.log("Raw summary by category response:", response.data);
        
    // แก้ไขตรงนี้ - ตรวจสอบ message ให้ถูกต้อง
    if (response.data.message === 'No data found') {
        console.log("No tasks found for summary by category.");
        return [];
    }
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};
export const getSummaryProgressRate = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/summary/completed-progress-rate/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    if (response.data.message === "No tasks available") {
      console.log("No tasks found.");
      return [];
    }
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};

export const summaryNotification = async () => {
  try {
    const response = await axios.get(`${API_URL}/notification`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};
