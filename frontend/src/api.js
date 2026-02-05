
import axios from "axios"
const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
 withCredentials: true, // 👈 Needed for sending cookies
});
export default API;


// import axios from "axios"
// const API = axios.create({
//   baseURL: "http://192.168.31.89:5000/api/v1",
//  withCredentials: true, // 👈 Needed for sending cookies
// });
// export default API;





