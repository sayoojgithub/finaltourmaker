import React, { useEffect, useState } from "react";

import API from "../../api"
import Swal from "sweetalert2"; // ✅ Import SweetAlert2

const RegisteredCompaniesAdminSide = () => {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchCompanies = async (pageNumber = 1) => {
    try {
      const res = await API.get(`/admin/registeredCompanies?page=${pageNumber}`, {
        withCredentials: true,
      });
      setCompanies(res.data.companies);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      Swal.fire({
      title: "Error",
      text: err.response?.data?.message || "Failed to load companies",
      icon: "error",
      background: "linear-gradient(to right, white, #a855f7, white)",
      color: "#1e1b4b",
      iconColor: "#7c3aed",
      confirmButtonColor: "#7c3aed",
    });
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/approveCompany/${id}`, {}, { withCredentials: true });
      Swal.fire({
      title: "Success",
      text: "Company approved successfully",
      icon: "success",
      background: "linear-gradient(to right, white, #a855f7, white)",
      color: "#1e1b4b",
      iconColor: "#7c3aed",
      confirmButtonColor: "#7c3aed",
    });
      setSelectedCompany(null);
      fetchCompanies(page);
    } catch (err) {
      Swal.fire({
      title: "Failed",
      text: "Approval failed",
      icon: "error",
      background: "linear-gradient(to right, white, #a855f7, white)",
      color: "#1e1b4b",
      iconColor: "#7c3aed",
      confirmButtonColor: "#7c3aed",
    });
    }
  };

  useEffect(() => {
    fetchCompanies(page);
  }, [page]);

  return (
    <div className="relative">
      {/* Main Content */}
      <div className={`${selectedCompany ? "blur-sm" : ""} transition`}>
        <div className="max-w-6xl mx-auto mt-4 sm:mt-6 bg-purple-50 p-4 sm:p-6 rounded-2xl shadow-md">
          <h2 className="text-lg sm:text-xl font-bold text-purple-700 mb-4 text-center">
            🏢 Registered Companies
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden text-sm sm:text-base">
              <thead className="bg-purple-200 text-purple-800 text-left">
                <tr>
                  {["Company Name", "Email", "Contact", "City", "State", "Executive", "Verified", "Action"].map((head, i) => (
                    <th key={i} className="py-2 px-4 whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-purple-50 border-t">
                    <td className="py-2 px-4">{c.companyName}</td>
                    <td className="py-2 px-4">{c.email}</td>
                    <td className="py-2 px-4">{c.contactNumber}</td>
                    <td className="py-2 px-4">{c.city}</td>
                    <td className="py-2 px-4">{c.state}</td>
                    <td className="py-2 px-4">{c.salesExecutive?.name || "N/A"}</td>
                    <td className="py-2 px-4">
                      {c.verificationStatus ? (
                        <span className="text-green-600 font-semibold">✔</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✘</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-purple-600 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-purple-700"
                        onClick={() => setSelectedCompany(c)}
                      >
                        Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-purple-700"
            >
              Previous
            </button>
            <span className="text-purple-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-purple-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"></div>
          <div className="relative bg-white rounded-xl p-4 sm:p-6 shadow-xl max-w-md w-full z-10">
            <h3 className="text-lg sm:text-xl font-bold text-purple-700 mb-4">Approve Company</h3>
            <p className="mb-2"><strong>Name:</strong> {selectedCompany.companyName}</p>
            <p className="mb-2"><strong>Email:</strong> {selectedCompany.email}</p>
            <p className="mb-4"><strong>Executive:</strong> {selectedCompany.salesExecutive?.name || "N/A"}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedCompany._id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredCompaniesAdminSide;