
import axios from "axios"
const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
 withCredentials: true, // 👈 Needed for sending cookies
});

export default API;