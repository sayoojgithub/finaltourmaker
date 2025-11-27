import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      await fetchUser();
      // ✅ SweetAlert Success
      await Swal.fire({
        title: "Success!",
        text: res.data.message,
        icon: "success",
        background: "linear-gradient(to right, white, #a855f7, white)",
        color: "#1e1b4b",
        iconColor: "#7c3aed",
        confirmButtonColor: "#7c3aed",
      });

      const role = res.data.role;

      // ✅ Role-based Navigation
      if (role === "salesExecutive") {
        navigate("/salesProfile");
      } else if (role === "admin") {
        navigate("/adminDashboard");
      } else if (role === "company") {
        navigate("/companyProfile");
      } else if (role === "purchaser") {
       navigate("/purchaserProfile");
      } else if (role === "digitalmarketer"){
       navigate("/digitalMarketerProfile")
      } else if (role === "salesmanager"){
       navigate("/salesManagerProfile")
      } else if(role === "marketingmanager"){
       navigate("/marketingManagerProfile")
      } else if(role === "creativestaff"){
       navigate("/creativeStaffProfile")
      } else if(role === "entry"){
        navigate("/entryProfile")
      } else if(role ==="frontofficer"){
        navigate("/frontOfficerProfile")
      } else if(role ==="frontofficermanager"){
        navigate("/frontOfficerManagerProfile")
      } else if(role ==="executive"){
        navigate("/executiveProfile")
      }else {
        Swal.fire({
          title: "Error",
          text: "Unknown role. Contact support.",
          icon: "warning",
          background: "linear-gradient(to right, white, #a855f7, white)",
          color: "#1e1b4b",
          iconColor: "#7c3aed",
          confirmButtonColor: "#7c3aed",
        });
      }
    } catch (err) {
      // ❌ SweetAlert Error
      Swal.fire({
        title: "Login Failed",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
        background: "linear-gradient(to right, white, #a855f7, white)",
        color: "#1e1b4b",
        iconColor: "#7c3aed",
        confirmButtonColor: "#7c3aed",
      });
    }
  };

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl bg-[#321F6A] rounded-3xl shadow-lg p-4 md:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 px-2">
          {/* Image */}
          <img
            src="src/assets/Home.png"
            className="w-full max-w-md lg:max-w-xl"
            alt="Home"
          />

          {/* Login Form */}
          <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <form className="space-y-6" onSubmit={handleLogin}>
              <h5 className="text-3xl font-Abril text-[#321F6A] mb-1">
                Log In
              </h5>
              <p className="block mb-6 text-sm font-light text-gray-400">
                Please enter your email & password
              </p>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#8570EE] focus:border-[#8570EE] block w-full p-2.5"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#8570EE] focus:border-[#8570EE] block w-full p-2.5"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-[#8570EE]"
                  />
                  <label
                    htmlFor="remember"
                    className="ms-2 text-sm font-medium text-gray-900"
                  >
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-[#8570EE] hover:underline">
                  Lost Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full text-white bg-[#8570EE] hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-[#8570EE] font-bold rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Login
              </button>

              <div className="text-sm font-medium text-gray-500">
                Not registered?{" "}
                <a href="#" className="text-[#8570EE] hover:underline">
                  Create account
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
