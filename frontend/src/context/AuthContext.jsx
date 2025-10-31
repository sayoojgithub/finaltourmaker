// import { createContext, useState, useEffect } from "react";
// import API from "../api";
// export const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [role, setRole] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [loading, setLoading] = useState(true);


//   const fetchUser = async () => {
//     try {
//       const res = await API.get("/auth/me"); // 👈 automatically includes cookie
//       setRole(res.data.role);
//       setUserId(res.data.userId);
//     } catch (err) {
//       setRole(null);
//       setUserId(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUser();
//   }, []);
// console.log(role,userId)
 


//   return (
//     <AuthContext.Provider value={{ role, userId, loading, fetchUser, setRole, setUserId, }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;

// src/context/AuthContext.jsx






import { createContext, useState, useEffect } from "react";
import API from "../api";
import { initSocket } from "../socket";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const attachSocketListener = async () => {
    console.log("haiii")
    try {
      const { data } = await API.get("/auth/socket-token");
      const s = initSocket(data.socketToken);
      s.off("force-logout"); // avoid dupes
      s.on("force-logout", async (payload) => {
        // Immediately nuke local state and go to /login
        setRole(null);
        setUserId(null);
        // optional: show toast
        Swal.fire({
          icon: "warning",
          title: "You were logged out",
          text: "No activity for 30 minutes.",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/login", { replace: true });
      });
    } catch {
      // ignore socket init errors
    }
  };

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setRole(res.data.role);
      setUserId(res.data.userId);

      // only FO needs socket for force logout
      if (res.data.role === "frontofficer") {
        await attachSocketListener();
      }
    } catch (err) {
      setRole(null);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={{ role, userId, loading, fetchUser, setRole, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;




