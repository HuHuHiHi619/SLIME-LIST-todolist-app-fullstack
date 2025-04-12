const API_URL = import.meta.env.MODE === 'development' 
  ? import.meta.env.VITE_LOCAL_API_URL
  : import.meta.env.VITE_API_URL;

  console.log("ENV MODE:", import.meta.env.MODE);
  console.log("VITE_LOCAL_API_URL:", import.meta.env.VITE_LOCAL_API_URL);
  console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
  console.log("FINAL API_URL:", API_URL);

export default API_URL