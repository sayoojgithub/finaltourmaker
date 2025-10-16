import React, { useState, useEffect } from "react";
//import API1 from "../api1";
import API from "../../api";
import Swal from "sweetalert2";


export default function CreateExecutive() {
  const [executives, setExecutives] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [modal, setModal] = useState({ open: false, execId: null });
  const [assignData, setAssignData] = useState({ start: "", end: "", target: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchExecutives(page);
  }, [page]);

  const fetchExecutives = async (pageNum = 1) => {
    try {
      const res = await API.get(`/admin/salesExecutives?page=${pageNum}&limit=4`);
      setExecutives(res.data.executives);
      setTotalPages(res.data.totalPages);
    } catch (err) {
       Swal.fire({
      icon: "error",
      title: "Failed to Fetch Executives",
      text: err.response?.data?.message || "Something went wrong while fetching executives!",
      background: "linear-gradient(to right, white, #a855f7, white)",
      color: "#1e1b4b", // dark indigo
      iconColor: "#7c3aed", // Tailwind purple-600
      toast: true,
      position: "top-end",
    });
    }
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
      };

      const res = await API.post("/admin/registerSalesExecutive", payload);
          Swal.fire({
      icon: "success",
      title: "Sales Executive Created",
      text: res.data.message || "Executive successfully registered!",
      background: "linear-gradient(to right, white, #a855f7, white)", // matches via-purple-500
        color: "#1e1b4b", // text color
        iconColor: "#7c3aed", // icon color (Tailwind purple-600)
    });
      setFormData({ name: "", email: "", phone: "", password: "" });
      setPage(1);
      fetchExecutives(1);
    } catch (err) {
        Swal.fire({
      icon: "error",
      title: "Creation Failed",
      text: err.response?.data?.message || "Error creating executive",
     background: "linear-gradient(to right, white, #a855f7, white)", // matches via-purple-500
        color: "#1e1b4b", // text color
        iconColor: "#7c3aed", // icon color (Tailwind purple-600)
    });
    }
  };

  const openAssign = execId => {
    setModal({ open: true, execId });
    setAssignData({ start: "", end: "", target: "" });
  };

  const handleAssign = async () => {
    try {
      await API.post(`/admin/assignTarget/${modal.execId}`, assignData);
         // ✅ Success alert
    Swal.fire({
      icon: "success",
      title: "Target Assigned",
      text: "Target assigned successfully!",
       background: "linear-gradient(to right, white, #a855f7, white)", // matches via-purple-500
        color: "#1e1b4b", // text color
        iconColor: "#7c3aed", // icon color (Tailwind purple-600)
    });
      fetchExecutives(page); // refresh current page
      setModal({ open: false, execId: null });
    } catch (err) {
       Swal.fire({
      icon: "error",
      title: "Assignment Failed",
      text: err.response?.data?.message || "Failed to assign target",
    background: "linear-gradient(to right, white, #a855f7, white)", // matches via-purple-500
        color: "#1e1b4b", // text color
        iconColor: "#7c3aed", // icon color (Tailwind purple-600)
    });
    }
  };

  return (


<div className="space-y-8">
  {/* Create Form */}
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
    <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Create Sales Executive</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {["name", "email", "phone", "password"].map((field, i) => (
        <input
          key={i}
          name={field}
          type={
            field === "email" ? "email" :
            field === "password" ? "password" :
            field === "phone" ? "tel" : "text"
          }
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="w-full p-3 border border-gray-300 rounded text-sm sm:text-base"
          value={formData[field]}
          onChange={handleChange}
        />
      ))}
    </div>
    <button
      onClick={handleCreate}
      className="mt-4 sm:mt-6 w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 transition text-sm sm:text-base"
    >
      Create Executive
    </button>
  </div>

  {/* Executives Table */}
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
    <h2 className="text-xl sm:text-2xl font-semibold mb-4">Sales Executives List</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm sm:text-base table-auto border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {["Name", "Email", "Phone", "Created At", "Latest Target", "Actions"].map((hdr, i) => (
              <th key={i} className="border px-4 py-2 text-left whitespace-nowrap">{hdr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {executives.length > 0 ? (
            executives.map(exec => {
              const latestTarget = exec.targets?.[exec.targets.length - 1];
              return (
                <tr key={exec._id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{exec.name}</td>
                  <td className="border px-4 py-2">{exec.email}</td>
                  <td className="border px-4 py-2">{exec.phoneNumber}</td>
                  <td className="border px-4 py-2 whitespace-nowrap">{new Date(exec.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="border px-4 py-2 text-sm">
                    {latestTarget ? (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                        <span><strong>🎯</strong> {latestTarget.target}</span>
                        <span><strong>📅</strong> {new Date(latestTarget.start).toLocaleDateString("en-GB")} - {new Date(latestTarget.end).toLocaleDateString("en-GB")}</span>
                      </div>
                    ) : "—"}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openAssign(exec._id)}
                      className="text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan="6" className="text-center text-gray-500 py-4">No executives yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <button
        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm">Page {page} of {totalPages}</span>
      <button
        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>

  {/* Modal */}
  {modal.open && (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-semibold text-purple-700 mb-4">Assign Target</h3>
        <div className="space-y-4">
          <input
            type="date"
            name="start"
            value={assignData.start}
            onChange={e => setAssignData(prev => ({ ...prev, start: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="date"
            name="end"
            value={assignData.end}
            onChange={e => setAssignData(prev => ({ ...prev, end: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            name="target"
            placeholder="Target Count"
            value={assignData.target}
            onChange={e => setAssignData(prev => ({ ...prev, target: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setModal({ open: false, execId: null })}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Assign Target
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
}
