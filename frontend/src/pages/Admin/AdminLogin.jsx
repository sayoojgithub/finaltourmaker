// src/pages/AdminLogin.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
import { AuthContext } from "../../context/AuthContext";
const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/admin/loginAdmin", { username, password });
      await fetchUser();
      // ✅ Show success alert
      Swal.fire({
        icon: "success",
        title: "Success",
        text: res.data.message || "Login successful",
        timer: 2000,
        showConfirmButton: false,
        // Custom styling
        background: "linear-gradient(to right, white, #a855f7, white)", // matches via-purple-500
        color: "#1e1b4b", // text color
        iconColor: "#7c3aed", // icon color (Tailwind purple-600)
      });

      // Navigate after a small delay
      setTimeout(() => {
        navigate("/adminDashboard");
      }, 2000);
    } catch (err) {
      // ❌ Show error alert
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.message || "Something went wrong!",
        // Custom styling
        background: "linear-gradient(to right, white, #a855f7, white)", // matches via-purple-500
        color: "#1e1b4b", // text color
        iconColor: "#7c3aed", // icon color (Tailwind purple-600)
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-purple-100 via-white to-purple-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Admin Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
