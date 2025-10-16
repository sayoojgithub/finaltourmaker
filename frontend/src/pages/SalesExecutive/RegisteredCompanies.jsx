// import React from 'react';


// const RegisteredCompanies = () => {
//   return (
//     <>
//       <div className="w-full max-w-7xl bg-white rounded-3xl shadow-lg p-4 md:p-8 mx-auto mb-10">
//         {/* Top Section */}
//         <div className="flex flex-col md:flex-row justify-between gap-6">
//           {/* Left Text */}
//           <div className="w-full md:w-1/2 flex flex-col p-4">
//             <h5 className="text-2xl md:text-3xl font-Abril text-[#321F6A] mb-2">
//               Registered companies
//             </h5>
//             <h5 className="text-xs md:text-sm font-Inter text-[#8570EE]">
//               View registered company details
//             </h5>
//           </div>
//           {/* Right Controls */}
//           <div className="w-full md:w-1/2 flex flex-wrap md:justify-end items-center gap-2 p-4">
//             {/* Search */}
//             <label className="input flex items-center gap-2 border rounded-lg px-3 py-2 w-full md:w-auto shadow-sm focus-within:ring-2 ring-[#8570EE]">
//               <svg
//                 className="h-4 w-4 opacity-50"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//               >
//                 <g
//                   strokeLinejoin="round"
//                   strokeLinecap="round"
//                   strokeWidth="2.5"
//                   fill="none"
//                   stroke="currentColor"
//                 >
//                   <circle cx="11" cy="11" r="8"></circle>
//                   <path d="m21 21-4.3-4.3"></path>
//                 </g>
//               </svg>
//               <input
//                 type="search"
//                 required
//                 placeholder="Search"
//                 className="outline-none w-full"
//               />
//             </label>

//             {/* Filter Button */}
//             <button className="flex items-center gap-2 bg-gradient-to-r from-[#6C5DD3] to-[#8570EE] text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300">
//               <svg
//                 className="w-4 h-4"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707L15 13.586V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-3.414L3.293 7.293A1 1 0 013 6.586V4z"
//                 />
//               </svg>
//               Filter
//             </button>

//             {/* Kebab Menu */}
//             <button className="p-2 rounded-full hover:bg-gray-100 transition">
//               <svg
//                 className="w-5 h-5 text-gray-600"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="12" cy="5" r="2" />
//                 <circle cx="12" cy="12" r="2" />
//                 <circle cx="12" cy="19" r="2" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Table Section */}
//         <div className="overflow-x-auto mt-4">
//           <table className="w-full text-sm text-left text-gray-500">
//             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//               <tr>
//                 <th scope="col" className="p-4">
//                   <input
//                     id="checkbox-all-search"
//                     type="checkbox"
//                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
//                   />
//                 </th>
//                 <th className="px-6 py-3">Name</th>
//                 <th className="px-6 py-3">Company ID</th>
//                 <th className="px-6 py-3">Date</th>
//                 <th className="px-6 py-3">Address</th>
//                 <th className="px-6 py-3">Status</th>
//                 <th className="px-6 py-3">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//   <tr className="bg-white border-b hover:bg-gray-50">
//     <td className="p-4">
//       <input
//         type="checkbox"
//         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
//       />
//     </td>
//     <td className="px-6 py-4">
//       <div className="text-base font-semibold">Neil Sims</div>
//       <div className="text-sm text-gray-500">neil.sims@flowbite.com</div>
//     </td>
//     <td className="px-6 py-4">React Developer</td>
//     <td className="px-6 py-4">3 years</td>
//     <td className="px-6 py-4">New York</td>
//     <td className="px-6 py-4">
//       <div className="flex items-center">
//         <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div>
//         Online
//       </div>
//     </td>
//     <td className="px-6 py-4">
//       <a
//         href="#"
//         className="font-medium text-blue-600 hover:underline"
//       >
//         Edit user
//       </a>
//     </td>
//   </tr>
// </tbody>

//           </table>
//         </div>
//       </div>
//     </>
//   );
// };

// export default RegisteredCompanies;
// import React, { useEffect, useState } from "react";
// import API from "../../api";

// const RegisteredCompanies = () => {
//   const [companies, setCompanies] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     fetchCompanies(currentPage);
//   }, [currentPage]);

//   const fetchCompanies = async (page) => {
//     try {
//       const res = await API.get(`/salesExecutive/companies?page=${page}`);
//       setCompanies(res.data.companies);
//       setTotalPages(res.data.totalPages);
//       setCurrentPage(res.data.currentPage);
//     } catch (err) {
//       console.error("Failed to fetch companies:", err);
//     }
//   };

//   return (
//     <div className="w-full max-w-7xl bg-white rounded-3xl shadow-lg p-4 md:p-8 mx-auto mb-10">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between gap-6">
//         <div className="w-full md:w-1/2 flex flex-col p-4">
//           <h5 className="text-2xl md:text-3xl font-Abril text-[#321F6A] mb-2">
//             Registered companies
//           </h5>
//           <h5 className="text-xs md:text-sm font-Inter text-[#8570EE]">
//             View registered company details
//           </h5>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto mt-4">
//         <table className="w-full text-sm text-left text-gray-500">
//           <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//             <tr>
//               <th className="p-4"><input type="checkbox" className="w-4 h-4" /></th>
//               <th className="px-6 py-3">Company Name</th>
//               <th className="px-6 py-3">Email</th>
//               <th className="px-6 py-3">Contact</th>
//               <th className="px-6 py-3">City</th>
//               <th className="px-6 py-3">State</th>
//               <th className="px-6 py-3">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {companies.length === 0 ? (
//               <tr>
//                 <td colSpan="7" className="text-center py-6 text-gray-400">No companies found.</td>
//               </tr>
//             ) : (
//               companies.map((company) => (
//                 <tr key={company._id} className="bg-white border-b hover:bg-gray-50">
//                   <td className="p-4">
//                     <input type="checkbox" className="w-4 h-4" />
//                   </td>
//                   <td className="px-6 py-4">{company.companyName}</td>
//                   <td className="px-6 py-4">{company.email}</td>
//                   <td className="px-6 py-4">{company.contactNumber}</td>
//                   <td className="px-6 py-4">{company.city}</td>
//                   <td className="px-6 py-4">{company.state}</td>
//                   <td className="px-6 py-4">
//                     <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
//                       company.verificationStatus
//                         ? "bg-green-100 text-green-800"
//                         : "bg-yellow-100 text-yellow-800"
//                     }`}>
//                       {company.verificationStatus ? "Verified" : "Pending"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-center mt-6 gap-4">
//         <button
//           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//           disabled={currentPage === 1}
//           className="px-4 py-2 bg-[#8570EE] text-white rounded-lg disabled:opacity-50"
//         >
//           Previous
//         </button>
//         <span className="px-4 py-2 font-semibold text-gray-700">
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//           disabled={currentPage === totalPages}
//           className="px-4 py-2 bg-[#8570EE] text-white rounded-lg disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default RegisteredCompanies;
import React, { useEffect, useState } from "react";
import API from "../../api";

const RegisteredCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCompanies(currentPage, search);
  }, [currentPage]);
  // Reset search effect
useEffect(() => {
  if (search === "") {
    fetchCompanies(1); // Re-fetch full list from first page
  }
}, [search]);

  const fetchCompanies = async (page, query = "") => {
    try {
      const res = await API.get(`/salesExecutive/companies?page=${page}&search=${query}`);
      setCompanies(res.data.companies);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(1, search); // reset to page 1 on search
  };

  return (
    <div className="w-full max-w-7xl bg-white rounded-3xl shadow-lg p-4 md:p-8 mx-auto mb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="w-full md:w-1/2 flex flex-col p-4">
          <h5 className="text-2xl md:text-3xl font-Abril text-[#321F6A] mb-2">
            Registered companies
          </h5>
          <h5 className="text-xs md:text-sm font-Inter text-[#8570EE]">
            View registered company details
          </h5>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="w-full md:w-1/2 flex items-center gap-2 px-4"
        >
          <input
            type="text"
            placeholder="Search by company name"
            className="flex-grow border px-3 py-2 rounded-md focus:outline-none focus:ring-2 ring-[#8570EE]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#8570EE] text-white rounded-md hover:bg-[#6C5DD3] transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="p-4"><input type="checkbox" className="w-4 h-4" /></th>
              <th className="px-6 py-3">Company Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">City</th>
              <th className="px-6 py-3">State</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400">No companies found.</td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="p-4"><input type="checkbox" className="w-4 h-4" /></td>
                  <td className="px-6 py-4">{company.companyName}</td>
                  <td className="px-6 py-4">{company.email}</td>
                  <td className="px-6 py-4">{company.contactNumber}</td>
                  <td className="px-6 py-4">{company.city}</td>
                  <td className="px-6 py-4">{company.state}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                      company.verificationStatus
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {company.verificationStatus ? "Verified" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-[#8570EE] text-white rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 font-semibold text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-[#8570EE] text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RegisteredCompanies;

