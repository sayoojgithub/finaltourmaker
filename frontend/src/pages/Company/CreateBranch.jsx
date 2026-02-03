// import React, { useState, useEffect } from "react";
// import { Eye, Pencil } from "lucide-react";
// import API from "../../api";
// import { toast } from "react-toastify";



// const CreateBranch = () => {
//   const [branches, setBranches] = useState([]);
//   const [formData, setFormData] = useState({
//     branchName: "",
//     buildingName: "",
//     contactNumber: "",
//     roadAreaStreet: "",
//     email: "",
//     otp: "",
//     city: "",
//     state: "",
//     country: "",
//     pincode: "",
//     gstin: "",
//     status: "Active",
//   });

//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingBranchId, setEditingBranchId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchBranches = async () => {
//     try {
//       const res = await API.get(
//         `/company/listBranch?page=${page}&search=${searchTerm}`
//       );
//       setBranches(res.data.branches);
//       setTotalPages(res.data.totalPages);
//     } catch (err) {
//       console.error("Error fetching branches:", err);
//     }
//   };

//   useEffect(() => {
//     fetchBranches();
//     // window.scrollTo({ top: 0, behavior: "smooth" });
//   }, [page, searchTerm]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (isEditMode) {
//     // ✅ Required fields for update (excluding otp and gstin)
//     const requiredFields = {
//       branchName: "Branch Name",
//       buildingName: "Building Name",
//       contactNumber: "Contact Number",
//       roadAreaStreet: "Road/Area/Street",
//       email: "Email",
//       city: "City",
//       state: "State",
//       country: "Country",
//       pincode: "Pincode",
//       status: "Status",
//     };

//     for (const field in requiredFields) {
//       if (!formData[field] || formData[field].trim() === "") {
//         toast.error(`${requiredFields[field]} is mandatory.`);
//         return;
//       }
//     }

//     try {
//       await API.put(`/company/updateBranch/${editingBranchId}`, formData);
//       toast.success("Branch updated successfully!");
//       resetForm();
//       fetchBranches();
//       setPage(1);
//     } catch (err) {
//       console.error("Branch update failed:", err);
//       toast.error("Failed to update branch.");
//     }

//   } else {
//     // ✅ Required fields for create (excluding gstin but including otp)
//     const requiredFields = {
//       branchName: "Branch Name",
//       buildingName: "Building Name",
//       contactNumber: "Contact Number",
//       roadAreaStreet: "Road/Area/Street",
//       email: "Email",
//       otp: "OTP",
//       city: "City",
//       state: "State",
//       country: "Country",
//       pincode: "Pincode",
//       status: "Status",
//     };

//     for (const field in requiredFields) {
//       if (!formData[field] || formData[field].trim() === "") {
//         toast.error(`${requiredFields[field]} is mandatory.`);
//         return;
//       }
//     }

//     // 🔐 OTP Match Check
//     const storedOtp = localStorage.getItem("BranchOtp");
//     if (formData.otp !== storedOtp) {
//       toast.error("OTP is incorrect or expired.");
//       return;
//     }

//     try {
//       await API.post("/company/createBranch", formData);
//       toast.success("Branch created successfully!");
//       resetForm();
//       fetchBranches();
//       setPage(1);
//     } catch (err) {
//       console.error("Branch creation failed:", err);
//       toast.error("Failed to create branch.");
//     }
//   }
// };


//   const handleEditBranch = (branch) => {
//     setIsEditMode(true);
//     setEditingBranchId(branch._id);

//     setFormData({
//       branchName: branch.branchName || "",
//       buildingName: branch.buildingName || "",
//       contactNumber: branch.contactNumber || "",
//       roadAreaStreet: branch.roadAreaStreet || "",
//       email: branch.email || "",
//       otp: "",
//       city: branch.city || "",
//       state: branch.state || "",
//       country: branch.country || "",
//       pincode: branch.pincode || "",
//       gstin: branch.gstin || "",
//       status: branch.status || "Active",
//     });

//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const resetForm = () => {
//     setIsEditMode(false);
//     setEditingBranchId(null);
//     setFormData({
//       branchName: "",
//       buildingName: "",
//       contactNumber: "",
//       roadAreaStreet: "",
//       email: "",
//       otp: "",
//       city: "",
//       state: "",
//       country: "",
//       pincode: "",
//       gstin: "",
//       status: "Active",
//     });
//   };
//   const handleSendOtp = async () => {
//   try {
//     const res = await API.post("/company/sendOtp", {
//       email: formData.email,
//     });
//     const generatedOtp = res.data.otp;
//     localStorage.setItem("BranchOtp", generatedOtp);
//     toast.success("OTP sent to email!");
//   } catch (err) {
//     console.error("Failed to send OTP", err);
//     toast.error("Failed to send OTP");
//   }
// };
// useEffect(() => {
//   const controller = new AbortController(); // For fetch cancellation
//   const signal = controller.signal;

//   const fetchPincodeDetails = async () => {
//     const isValidPincode = formData.pincode.length === 6 && /^\d{6}$/.test(formData.pincode);

//     if (isValidPincode) {
//       try {
//         const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`, { signal });
//         const data = await response.json();

//         if (data[0].Status === "Success") {
//           const postOffice = data[0].PostOffice?.[0];
//           if (postOffice && formData.pincode.length === 6) {
//             setFormData((prev) => ({
//               ...prev,
//               city: postOffice.District || '',
//               state: postOffice.State || '',
//               country: postOffice.Country || '',
//             }));
//           }
//         } else {
//           toast.error("Invalid Pincode. Please check the pincode.");
//           setFormData((prev) => ({
//             ...prev,
//             city: '',
//             state: '',
//             country: '',
//           }));
//         }
//       } catch (err) {
//         if (err.name !== "AbortError") {
//           toast.error("Failed to fetch pincode details.");
//         }
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           country: '',
//         }));
//       }
//     } else {
//       // Clear if pincode is not valid
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         country: '',
//       }));
//     }
//   };

//   fetchPincodeDetails();

//   return () => {
//     controller.abort(); // Cancel previous fetch when pincode changes
//   };
// }, [formData.pincode]);


//   return (
//     <div className="min-h-screen px-4 pt-1 pb-10 flex flex-col items-center gap-10 ">
//       {/* Form Section */}
//       <form
//         className="w-full max-w-[100rem] bg-white rounded-3xl p-6 md:p-10 shadow-lg space-y-6"
//         onSubmit={handleSubmit}
//       >
//         <div className="grid md:grid-cols-2 gap-4">
//           <input
//             name="branchName"
//             value={formData.branchName}
//             onChange={handleChange}
//             type="text"
//             placeholder="Branch Name"
//             className="border border-gray-300 rounded-md p-3 w-full"
//             disabled={isEditMode}
//           />
//           <input
//             name="buildingName"
//             value={formData.buildingName}
//             onChange={handleChange}
//             type="text"
//             placeholder="Building name"
//             className="border border-gray-300 rounded-md p-3 w-full"
//           />

//           <input
//             name="contactNumber"
//             value={formData.contactNumber}
//             onChange={handleChange}
//             type="text"
//             placeholder="Contact Number"
//             className="border border-gray-300 rounded-md p-3 w-full"
//             disabled={isEditMode}
//           />
//           <input
//             name="roadAreaStreet"
//             value={formData.roadAreaStreet}
//             onChange={handleChange}
//             type="text"
//             placeholder="Road name, Area, Street"
//             className="border border-gray-300 rounded-md p-3 w-full"
//           />

//           {/* Email + City & State */}
//           <div className="relative w-full col-span-1">
//             <input
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               type="email"
//               placeholder="Email"
//               className="border border-gray-300 rounded-md p-3 w-full pr-28"
//               disabled={isEditMode}
//             />
//             <button
//               type="button"
//               onClick={handleSendOtp}
//               disabled={isEditMode}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-500 hover:underline"
//             >
//               Verify email
//             </button>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//           <input
//               name="pincode"
//               value={formData.pincode}
//               onChange={handleChange}
//               type="text"
//               placeholder="Pincode"
//               className="border border-gray-300 rounded-md p-3 w-full"
//               disabled={isEditMode}
//             />
//             <input
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               type="text"
//               placeholder="City"
//               className="border border-gray-300 rounded-md p-3 w-full"
//               disabled={isEditMode}
//             />
           
//           </div>

//           {/* OTP + Country & Pincode */}
//           <input
//             name="otp"
//             value={formData.otp}
//             onChange={handleChange}
//             type="text"
//             placeholder="Enter OTP received in your mail"
//             className="border border-gray-300 rounded-md p-3 w-full"
//             disabled={isEditMode}
//           />
//           <div className="grid grid-cols-2 gap-4">
//             <input
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               type="text"
//               placeholder="State"
//               className="border border-gray-300 rounded-md p-3 w-full"
//               disabled={isEditMode}
//             />
//             <input
//               name="country"
//               value={formData.country}
//               onChange={handleChange}
//               type="text"
//               placeholder="Country"
//               className="border border-gray-300 rounded-md p-3 w-full"
//               disabled={isEditMode}
//             />
           
//           </div>
//         </div>

//         <div className="w-full flex justify-center">
//           <input
//             name="gstin"
//             value={formData.gstin}
//             onChange={handleChange}
//             type="text"
//             placeholder="GST No (Optional)"
//             className="border border-gray-300 rounded-md p-3 w-full max-w-md"
//           />
//         </div>
//         <div className="w-full flex justify-center mt-4">
//           <div className="flex gap-10">
//             <label className="flex items-center gap-2 text-black font-medium">
//               <input
//                 type="radio"
//                 name="status"
//                 value="Active"
//                 checked={formData.status === "Active"}
//                 onChange={handleChange}
//                 className="accent-purple-500"
//               />
//               <span>Active</span>
//             </label>
//             <label className="flex items-center gap-2 text-black font-medium">
//               <input
//                 type="radio"
//                 name="status"
//                 value="Inactive"
//                 checked={formData.status === "Inactive"}
//                 onChange={handleChange}
//                 className="accent-purple-500"
//               />
//               <span>Inactive</span>
//             </label>
//           </div>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-purple-500 text-white py-3 rounded-md hover:bg-purple-600 transition"
//         >
//           {isEditMode ? "Update Branch" : "Register Branch"}
//         </button>

//         {isEditMode && (
//           <button
//             type="button"
//             onClick={resetForm}
//             className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition mt-2"
//           >
//             Cancel Edit
//           </button>
//         )}
//       </form>

//       {/* Table Display Section */}
//       <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
//         {/* Search Input */}
//         <div className="mb-4">
//           <input
//             type="text"
//             placeholder="Search by Branch Name"
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setPage(1); // reset to first page on new search
//             }}
//             className="w-full max-w-sm border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>
//         <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
//           <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//             <tr>
//               <th className="px-6 py-4">Sl No</th>
//               <th className="px-6 py-4">Branch Name</th>
//               <th className="px-6 py-4">Email</th>
//               <th className="px-6 py-4">Contact Number</th>
//               <th className="px-6 py-4">Status</th>
//               <th className="px-6 py-4 text-center">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {branches.map((branch, idx) => (
//               <tr key={branch._id} className="border-b hover:bg-gray-50">
//                 <td className="px-6 py-4">{(page - 1) * 2 + idx + 1}</td>
//                 <td className="px-6 py-4 font-semibold">{branch.branchName}</td>
//                 <td className="px-6 py-4">{branch.email}</td>
//                 <td className="px-6 py-4 font-semibold">
//                   {branch.contactNumber}
//                 </td>
//                 <td className="px-6 py-4">
//                   {branch.status === "Active" ? (
//                     <span className="inline-flex items-center text-green-600 text-xs font-medium bg-green-100 rounded-full px-3 py-1">
//                       ● Active
//                     </span>
//                   ) : (
//                     <span className="inline-flex items-center text-gray-600 text-xs font-medium bg-gray-200 rounded-full px-3 py-1">
//                       ● Inactive
//                     </span>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 text-center">
//                   <button
//                     className="text-gray-500 hover:text-gray-700"
//                     onClick={() => handleEditBranch(branch)}
//                   >
//                     <Pencil className="w-4 h-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Numbered Pagination */}
//         {totalPages > 1 && (
//           <div className="flex justify-end items-center gap-1 mt-6 pr-2 text-sm text-gray-500">
//             {Array.from({ length: totalPages }, (_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setPage(i + 1)}
//                 className={`px-3 py-1 rounded-full ${
//                   page === i + 1
//                     ? "bg-gray-900 text-white"
//                     : "hover:bg-gray-200"
//                 }`}
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateBranch;

import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

/* ---------------- UI ONLY CONSTANTS (outside) ---------------- */
const THEME = "#8570EE";

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-end justify-between gap-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      {hint ? (
        <div className="text-[11px] text-slate-400 whitespace-nowrap">{hint}</div>
      ) : null}
    </div>
    {children}
  </div>
);

const baseInput =
  "w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 text-sm text-slate-900 outline-none " +
  "transition shadow-[0_1px_0_rgba(15,23,42,0.04)] " +
  "placeholder:text-slate-400 " +
  "hover:border-slate-300 " +
  "focus:border-[#8570EE]/45 focus:ring-4 focus:ring-[#8570EE]/15";

const disabledInput =
  "disabled:bg-slate-50/70 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed";

const pillBtn =
  "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold " +
  "transition active:scale-[0.99]";

const CreateBranch = () => {
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    branchName: "",
    buildingName: "",
    contactNumber: "",
    roadAreaStreet: "",
    email: "",
    otp: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    gstin: "",
    status: "Active",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBranches = async () => {
    try {
      const res = await API.get(
        `/company/listBranch?page=${page}&search=${searchTerm}`
      );
      setBranches(res.data.branches);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  useEffect(() => {
    fetchBranches();
    // window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      // ✅ Required fields for update (excluding otp and gstin)
      const requiredFields = {
        branchName: "Branch Name",
        buildingName: "Building Name",
        contactNumber: "Contact Number",
        roadAreaStreet: "Road/Area/Street",
        email: "Email",
        city: "City",
        state: "State",
        country: "Country",
        pincode: "Pincode",
        status: "Status",
      };

      for (const field in requiredFields) {
        if (!formData[field] || formData[field].trim() === "") {
          toast.error(`${requiredFields[field]} is mandatory.`);
          return;
        }
      }

      try {
        await API.put(`/company/updateBranch/${editingBranchId}`, formData);
        toast.success("Branch updated successfully!");
        resetForm();
        fetchBranches();
        setPage(1);
      } catch (err) {
        console.error("Branch update failed:", err);
        toast.error("Failed to update branch.");
      }
    } else {
      // ✅ Required fields for create (excluding gstin but including otp)
      const requiredFields = {
        branchName: "Branch Name",
        buildingName: "Building Name",
        contactNumber: "Contact Number",
        roadAreaStreet: "Road/Area/Street",
        email: "Email",
        otp: "OTP",
        city: "City",
        state: "State",
        country: "Country",
        pincode: "Pincode",
        status: "Status",
      };

      for (const field in requiredFields) {
        if (!formData[field] || formData[field].trim() === "") {
          toast.error(`${requiredFields[field]} is mandatory.`);
          return;
        }
      }

      // 🔐 OTP Match Check
      const storedOtp = localStorage.getItem("BranchOtp");
      if (formData.otp !== storedOtp) {
        toast.error("OTP is incorrect or expired.");
        return;
      }

      try {
        await API.post("/company/createBranch", formData);
        toast.success("Branch created successfully!");
        resetForm();
        fetchBranches();
        setPage(1);
      } catch (err) {
        console.error("Branch creation failed:", err);
        toast.error("Failed to create branch.");
      }
    }
  };

  const handleEditBranch = (branch) => {
    setIsEditMode(true);
    setEditingBranchId(branch._id);

    setFormData({
      branchName: branch.branchName || "",
      buildingName: branch.buildingName || "",
      contactNumber: branch.contactNumber || "",
      roadAreaStreet: branch.roadAreaStreet || "",
      email: branch.email || "",
      otp: "",
      city: branch.city || "",
      state: branch.state || "",
      country: branch.country || "",
      pincode: branch.pincode || "",
      gstin: branch.gstin || "",
      status: branch.status || "Active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingBranchId(null);
    setFormData({
      branchName: "",
      buildingName: "",
      contactNumber: "",
      roadAreaStreet: "",
      email: "",
      otp: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      gstin: "",
      status: "Active",
    });
  };

  const handleSendOtp = async () => {
    try {
      const res = await API.post("/company/sendOtp", {
        email: formData.email,
      });
      const generatedOtp = res.data.otp;
      localStorage.setItem("BranchOtp", generatedOtp);
      toast.success("OTP sent to email!");
    } catch (err) {
      console.error("Failed to send OTP", err);
      toast.error("Failed to send OTP");
    }
  };

  useEffect(() => {
    const controller = new AbortController(); // For fetch cancellation
    const signal = controller.signal;

    const fetchPincodeDetails = async () => {
      const isValidPincode =
        formData.pincode.length === 6 && /^\d{6}$/.test(formData.pincode);

      if (isValidPincode) {
        try {
          const response = await fetch(
            `https://api.postalpincode.in/pincode/${formData.pincode}`,
            { signal }
          );
          const data = await response.json();

          if (data[0].Status === "Success") {
            const postOffice = data[0].PostOffice?.[0];
            if (postOffice && formData.pincode.length === 6) {
              setFormData((prev) => ({
                ...prev,
                city: postOffice.District || "",
                state: postOffice.State || "",
                country: postOffice.Country || "",
              }));
            }
          } else {
            toast.error("Invalid Pincode. Please check the pincode.");
            setFormData((prev) => ({
              ...prev,
              city: "",
              state: "",
              country: "",
            }));
          }
        } catch (err) {
          if (err.name !== "AbortError") {
            toast.error("Failed to fetch pincode details.");
          }
          setFormData((prev) => ({
            ...prev,
            city: "",
            state: "",
            country: "",
          }));
        }
      } else {
        // Clear if pincode is not valid
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
          country: "",
        }));
      }
    };

    fetchPincodeDetails();

    return () => {
      controller.abort(); // Cancel previous fetch when pincode changes
    };
  }, [formData.pincode]);

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-1 pb-10 flex flex-col items-center gap-10">
      {/* FORM WRAPPER */}
      <div className="w-full max-w-[100rem]">
        <div
          className="
            relative
            w-full rounded-3xl overflow-hidden
            border border-slate-200/70
            bg-white
            shadow-[0_24px_70px_rgba(15,23,42,0.12)]
          "
        >
          {/* ✅ Blue glows (top-right + bottom-left) */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-[320px] w-[320px] rounded-full bg-[#8570EE]/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full bg-[#8570EE]/20 blur-[120px]" />

          <div
            className="h-2 w-full"
            style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
          />

          <div className="p-6 md:p-8 space-y-7">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Company
                </div>
                <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
                  Branch Management
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {isEditMode
                    ? "Update branch details."
                    : "Create a new branch and verify email with OTP."}
                </div>
              </div>

              <div
                className="
                  h-11 px-4 rounded-2xl flex items-center
                  border bg-white/70 backdrop-blur
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]
                  text-sm font-semibold
                "
                style={{ color: THEME, borderColor: `${THEME}26` }}
              >
                {isEditMode ? "Editing" : "Create"}
              </div>
            </div>

            {/* Form card */}
            <form
              className="rounded-[28px] border border-slate-200/70 bg-white overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)]"
              onSubmit={handleSubmit}
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Form
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">
                  {isEditMode ? "Update branch" : "Register branch"}
                </div>
              </div>

              <div className="p-5 md:p-6 bg-gradient-to-b from-white via-white to-purple-50/40 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Branch name">
                    <input
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleChange}
                      type="text"
                      placeholder="Branch Name"
                      className={`${baseInput} ${disabledInput}`}
                      disabled={isEditMode}
                    />
                  </Field>

                  <Field label="Building name">
                    <input
                      name="buildingName"
                      value={formData.buildingName}
                      onChange={handleChange}
                      type="text"
                      placeholder="Building name"
                      className={baseInput}
                    />
                  </Field>

                  <Field label="Contact number">
                    <input
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      type="text"
                      placeholder="Contact Number"
                      className={`${baseInput} ${disabledInput}`}
                      disabled={isEditMode}
                    />
                  </Field>

                  <Field label="Road / area / street">
                    <input
                      name="roadAreaStreet"
                      value={formData.roadAreaStreet}
                      onChange={handleChange}
                      type="text"
                      placeholder="Road name, Area, Street"
                      className={baseInput}
                    />
                  </Field>

                  {/* Email + verify button */}
                  <div className="md:col-span-1">
                    <Field
                      label="Email"
                      hint={isEditMode ? "Locked in edit mode" : ""}
                    >
                      <div className="relative">
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          type="email"
                          placeholder="Email"
                          className={`${baseInput} ${disabledInput} pr-[9.5rem]`}
                          disabled={isEditMode}
                        />
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isEditMode}
                          className="
                            absolute right-2 top-1/2 -translate-y-1/2
                            h-9 px-3 rounded-xl
                            text-sm font-semibold
                            border border-slate-200
                            bg-white
                            shadow-sm
                            hover:shadow-md hover:bg-slate-50
                            transition
                            disabled:opacity-60 disabled:cursor-not-allowed
                          "
                          style={{ color: THEME }}
                        >
                          Verify email
                        </button>
                      </div>
                    </Field>
                  </div>

                  {/* Pincode + City */}
                  <div className="md:col-span-1 grid grid-cols-2 gap-4">
                    <Field label="Pincode">
                      <input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        type="text"
                        placeholder="Pincode"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={isEditMode}
                      />
                    </Field>

                    <Field label="City">
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        type="text"
                        placeholder="City"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={isEditMode}
                      />
                    </Field>
                  </div>

                  <Field
                    label="OTP"
                    hint={isEditMode ? "Not required in edit mode" : "Required"}
                  >
                    <input
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter OTP received in your mail"
                      className={`${baseInput} ${disabledInput}`}
                      disabled={isEditMode}
                    />
                  </Field>

                  {/* State + Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="State">
                      <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        type="text"
                        placeholder="State"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={isEditMode}
                      />
                    </Field>

                    <Field label="Country">
                      <input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        type="text"
                        placeholder="Country"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={isEditMode}
                      />
                    </Field>
                  </div>
                </div>

                {/* GSTIN */}
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-md">
                    <Field label="GST No" hint="Optional">
                      <input
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        type="text"
                        placeholder="GST No (Optional)"
                        className={baseInput}
                      />
                    </Field>
                  </div>
                </div>

                {/* Status */}
                <div className="w-full flex justify-center">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-2 text-center">
                      Status
                    </div>
                    <div className="flex gap-8 justify-center">
                      <label className="flex items-center gap-2 text-slate-800 font-semibold">
                        <input
                          type="radio"
                          name="status"
                          value="Active"
                          checked={formData.status === "Active"}
                          onChange={handleChange}
                          className="accent-[#8570EE]"
                        />
                        <span>Active</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-800 font-semibold">
                        <input
                          type="radio"
                          name="status"
                          value="Inactive"
                          checked={formData.status === "Inactive"}
                          onChange={handleChange}
                          className="accent-[#8570EE]"
                        />
                        <span>Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className={`${pillBtn} text-white shadow-[0_18px_45px_rgba(133,112,238,0.35)] hover:opacity-95`}
                    style={{ backgroundColor: THEME }}
                  >
                    {isEditMode ? "Update Branch" : "Register Branch"}
                  </button>

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className={`${pillBtn} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="text-xs text-slate-500">
              Note: Pincode auto-fills city, state and country when valid.
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="w-full max-w-[100rem]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
          <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                View
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                Branch list
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Search and manage branches
              </div>
            </div>

            <div className="w-full sm:w-[340px]">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                Search
              </div>
              <input
                type="text"
                placeholder="Search by Branch Name"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className={baseInput}
              />
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-700 min-w-[760px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <th className="px-6 py-4">Sl No</th>
                  <th className="px-6 py-4">Branch Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Contact Number</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {branches.map((branch, idx) => (
                  <tr
                    key={branch._id}
                    className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {(page - 1) * 2 + idx + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {branch.branchName}
                    </td>
                    <td className="px-6 py-4">{branch.email}</td>
                    <td className="px-6 py-4 font-semibold">
                      {branch.contactNumber}
                    </td>
                    <td className="px-6 py-4">
                      {branch.status === "Active" ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-600 border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        className="
                          inline-flex items-center justify-center
                          h-10 w-10 rounded-2xl
                          border border-slate-200
                          bg-white
                          shadow-sm
                          hover:shadow-md
                          hover:bg-slate-50
                          transition
                        "
                        onClick={() => handleEditBranch(branch)}
                        aria-label="Edit branch"
                      >
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                ))}

                {branches.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No branches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-4 px-4 flex items-center justify-end gap-2 bg-white border-t border-slate-200">
              {Array.from({ length: totalPages }, (_, i) => {
                const isActive = page === i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={[
                      "h-9 min-w-[36px] px-3 rounded-2xl text-sm font-semibold border transition",
                      isActive
                        ? "text-white shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                    ].join(" ")}
                    style={
                      isActive
                        ? { backgroundColor: THEME, borderColor: THEME }
                        : undefined
                    }
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBranch;



