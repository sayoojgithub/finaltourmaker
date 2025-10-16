import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // for mobile toggle icons
import Swal from "sweetalert2";
import API from "../../api";
import Graph from "./Graph";
import CreateExecutive from "./CreateExecutive";
import RegisteredCompaniesAdminSide from "./RegisteredCompaniesAdminSide";



// import RegisteredCompaniesAdminSide from "./Admin/RegisteredCompaniesAdminSide";


export default function Dashboard() {
  const [view, setView] = useState("graph");
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile
  const navigate = useNavigate();

  

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile Navbar */}
      <div className="md:hidden bg-purple-600 text-white flex justify-between items-center px-4 py-3">
        <h2 className="text-lg font-bold">Admin Dashboard</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-white p-6 shadow md:h-screen sticky top-0 overflow-y-auto z-20`}
      >
        <h2 className="text-xl font-bold text-purple-700 mb-6 hidden md:block">
          Admin Dashboard
        </h2>
        <div className="flex flex-col space-y-4">
          <button
            className={`px-4 py-2 rounded ${
              view === "graph"
                ? "bg-purple-600 text-white"
                : "bg-white border border-purple-600 text-purple-600"
            }`}
            onClick={() => {
              setView("graph");
              setSidebarOpen(false);
            }}
          >
            📈 View Graphs
          </button>
          <button
            className={`px-4 py-2 rounded ${
              view === "create"
                ? "bg-purple-600 text-white"
                : "bg-white border border-purple-600 text-purple-600"
            }`}
            onClick={() => {
              setView("create");
              setSidebarOpen(false);
            }}
          >
            ➕ Create Executive
          </button>
          <button
            className={`px-4 py-2 rounded ${
              view === "registered"
                ? "bg-purple-600 text-white"
                : "bg-white border border-purple-600 text-purple-600"
            }`}
            onClick={() => {
              setView("registered");
              setSidebarOpen(false);
            }}
          >
            🏢 View Companies
          </button>
         
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gradient-to-tr from-purple-100 via-white to-purple-200 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          {view === "graph" && <Graph />}
          {view === "create" && <CreateExecutive />}
          {view === "registered" && <RegisteredCompaniesAdminSide />}
        </div>
      </main>
    </div>
  );
}
