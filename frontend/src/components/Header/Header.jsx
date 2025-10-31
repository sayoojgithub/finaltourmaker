import React, { useState, useContext } from 'react';
import { Link,useNavigate } from 'react-router-dom'; // ✅ Add this
import Logo from '../../assets/Logo.png'
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api';
const Header =() => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { role, userId, setRole, setUserId,} = useContext(AuthContext);
  const navigate = useNavigate();
  const navItems = [
    { name: "Home", path: "/home" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];
 const handleLogout = async () => {
    try {
      const currentRole = role;
      const res = await API.post("/auth/logout");

      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: res.data.message || "Logout successful",
        timer: 2000,
        showConfirmButton: false,
        background: "linear-gradient(to right, white, #a855f7, white)",
        color: "#1e1b4b",
        iconColor: "#7c3aed",
      });
         setRole(null);
         setUserId(null);
       setTimeout(() => {
      // Navigate based on previously captured role
      if (currentRole === "admin") {
        navigate("/adminLogin");
      } else {
        navigate("/login");
      }
    }, 2000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.response?.data?.message || "Something went wrong!",
        background: "linear-gradient(to right, white, #a855f7, white)",
        color: "#1e1b4b",
        iconColor: "#7c3aed",
      });
    }
  };

  return (
    <> 
      <div className="w-full flex justify-center px-2 pt-3 pb-1">
        <div className="w-full  bg-[#321F6A] rounded-3xl shadow-lg p-2 md:p-4">
          <nav className="mb-3 mt-2">
            <div className="flex items-center justify-between flex-wrap">
              <Link to="/" className="flex items-center space-x-3">
                <img src={Logo} className="h-8" alt="Logo" />
                <span className="text-2xl font-light text-white font-worksans">
                  {/* Logo Text */}
                </span>
              </Link>

              <div className="flex items-center md:hidden">
                <button
                  type="button"
                  className="text-white"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-white hover:text-[#8570EE] font-light"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* <div className="hidden md:block">
              <Link to="/login">
                <button className="text-white bg-[#8570EE] hover:bg-purple-800 font-worksans font-light rounded-lg text-sm px-3 py-1.5">
                  LOGIN
                </button>
                </Link>
              </div> */}
                   <div className="hidden md:block">
                {role && userId ? (
                  <button
                    onClick={handleLogout}
                    className="text-white bg-red-500 hover:bg-red-700 font-worksans font-light rounded-lg text-sm px-3 py-1.5"
                  >
                    LOGOUT
                  </button>
                ) : (
                  <Link to="/login">
                    <button className="text-white bg-[#8570EE] hover:bg-purple-800 font-worksans font-light rounded-lg text-sm px-3 py-1.5">
                      LOGIN
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {menuOpen && (
              <div className="flex flex-col mt-3 space-y-2 md:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-white hover:text-blue-300 font-light"
                  >
                    {item.name}
                  </Link>
                ))}
                 {/* <Link to="/login">

                <button className="text-white bg-[#8570EE] hover:bg-purple-800 font-light rounded-lg text-sm px-3 py-1.5 mt-1">
                  LOGIN
                </button>
                </Link> */}
                {role && userId ? (
                  <button
                    onClick={handleLogout}
                    className="text-white bg-red-500 hover:bg-red-700 font-light rounded-lg text-sm px-3 py-1.5 mt-1 w-fit"
                  >
                    LOGOUT
                  </button>
                ) : (
                  <Link to="/login">
                    <button className="text-white bg-[#8570EE] hover:bg-purple-800 font-light rounded-lg text-sm px-3 py-1.5 mt-1">
                      LOGIN
                    </button>
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Header;
