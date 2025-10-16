import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-white via-[#a855f7] to-white px-4">
      <div className="bg-white shadow-lg rounded-3xl p-10 max-w-lg w-full text-center border border-gray-200">
        <h2 className="text-4xl font-Abril text-[#321F6A] mb-4">
          🚫 Unauthorized
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          You do not have permission to access this page.
          <br />
          Please login with the correct credentials.
        </p>
        <button
          onClick={handleBackToLogin}
          className="px-6 py-2 bg-[#8570EE] text-white text-sm font-bold rounded-lg hover:bg-purple-800 transition-all"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
