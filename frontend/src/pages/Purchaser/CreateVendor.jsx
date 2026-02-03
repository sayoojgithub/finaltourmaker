// import { Pencil, CheckCircle, XCircle } from "lucide-react";
// import React, { useEffect, useMemo, useState } from "react";
// import Select from "react-select";
// import API from "../../api";
// import { toast } from "react-toastify";

// const initialForm = {
//   name: "",
//   email: "",
//   companyName: "",
//   gstNumber: "",
//   mobileNumber: "",
//   whatsappNumber: "",
//   address: "",
//   country: "",      // ID
//   state: "",        // ID
//   destination: "",  // ID
//   services: [],
// };

// const CreateVendor = () => {
//   const [vendors, setVendors] = useState([]);
//   const [formData, setFormData] = useState(initialForm);

//   const [search, setSearch] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);

//   // React-Select selected options (objects)
//   const [selectedCountry, setSelectedCountry] = useState(null);
//   const [selectedState, setSelectedState] = useState(null);
//   const [selectedDestination, setSelectedDestination] = useState(null);

//   const [isManuallyEditing, setIsManuallyEditing] = useState(false);
//   const [confirmVendor, setConfirmVendor] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);

//   // ---------- shared react-select styles (same as your CreateClient) ----------
//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 12,
//         borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         maxHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
//       }),
//       valueContainer: (b) => ({
//         ...b,
//         padding: "0 12px",
//         overflowX: "auto",
//         overflowY: "hidden",
//         whiteSpace: "nowrap",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "flex-end",
//         gap: 6,
//       }),
//       input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
//       dropdownIndicator: (b) => ({
//         ...b,
//         color: "#6b7280",
//         ":hover": { color: "#4b5563" },
//       }),
//       menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 50 }),
//       option: (b, s) => ({
//         ...b,
//         backgroundColor: s.isFocused
//           ? "rgba(133,112,238,0.08)"
//           : s.isSelected
//           ? "rgba(133,112,238,0.16)"
//           : "white",
//         color: "#222",
//       }),
//       placeholder: (b) => ({ ...b, color: "#6b7280" }),
//       singleValue: (b) => ({ ...b, color: "#111827" }),
//     }),
//     []
//   );

//   // Helpers to map API data -> Select options
//   const toCountryOption = (c) => ({ _id: c._id, value: c._id, label: c.name });
//   const toStateOption = (s) => ({ _id: s._id, value: s._id, label: s.name });
//   // const toDestinationOption = (d) => ({ _id: d._id, value: d._id, label: d.name });
// const toDestinationOption = (d) => ({
//   _id: d._id,
//   value: d._id,
//   label: d.activeStatus ? d.name : `${d.name} (inactive)`, // 👈 NEW
// });

//   const countryOptions = countries.map(toCountryOption);
//   const stateOptions = states.map(toStateOption);
//   const destinationOptions = destinations.map(toDestinationOption);

//   const fetchCountries = async () => {
//     try {
//       const res = await API.get("/purchaser/countries");
//       setCountries(res.data || []);
//     } catch (err) {
//       console.error("Error fetching countries:", err);
//     }
//   };

//   const fetchStates = async (countryId) => {
//     try {
//       if (!countryId) {
//         setStates([]);
//         return;
//       }
//       const res = await API.get(`/purchaser/states/${countryId}`);
//       setStates(res.data || []);
//     } catch (err) {
//       console.error("Error fetching states:", err);
//     }
//   };

//   const fetchDestinations = async (countryId, stateId) => {
//     try {
//       if (!countryId || !stateId) {
//         setDestinations([]);
//         return;
//       }
//       const res = await API.get(
//         `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`
//       );
//       setDestinations(res.data || []);
//     } catch (err) {
//       console.error("Error fetching destinations:", err);
//     }
//   };

//   const fetchVendors = async () => {
//     try {
//       const res = await API.get(
//         `/purchaser/vendors?page=${page}&search=${encodeURIComponent(search)}`
//       );
//       setVendors(res.data?.data || []);
//       setTotalPages(res.data?.totalPages || 1);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     fetchCountries();
//   }, []);

//   // When selectedCountry (option) changes, fetch states (unless manually editing lock)
//   useEffect(() => {
//     if (!isManuallyEditing) {
//       const countryId = selectedCountry?.value || "";
//       fetchStates(countryId);
//       // reset state & destination in form + UI
//       setSelectedState(null);
//       setSelectedDestination(null);
//       setFormData((prev) => ({ ...prev, state: "", destination: "", country: countryId }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCountry?.value]);

//   // When selectedState (option) changes, fetch destinations (unless manually editing lock)
//   useEffect(() => {
//     if (!isManuallyEditing) {
//       const countryId = selectedCountry?.value || "";
//       const stateId = selectedState?.value || "";
//       fetchDestinations(countryId, stateId);
//       // reset destination in form + UI
//       setSelectedDestination(null);
//       setFormData((prev) => ({ ...prev, state: stateId, destination: "" }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedState?.value]);

//   // Keep vendors list updated
//   useEffect(() => {
//     fetchVendors();
//   }, [page, search]);

//   // Sync selected options from IDs whenever lists load (useful after edit preload)
//   useEffect(() => {
//     if (formData.country && countries.length) {
//       const opt = countryOptions.find((o) => o.value === formData.country) || null;
//       setSelectedCountry(opt);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [countries, formData.country]);

//   useEffect(() => {
//     if (formData.state && states.length) {
//       const opt = stateOptions.find((o) => o.value === formData.state) || null;
//       setSelectedState(opt);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [states, formData.state]);

//   useEffect(() => {
//     if (formData.destination && destinations.length) {
//       const opt = destinationOptions.find((o) => o.value === formData.destination) || null;
//       setSelectedDestination(opt);
//     }
//     // eslint-disable-next-line react-hooks-exhaustive-deps
//   }, [destinations, formData.destination]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const handleCheckboxChange = (service) => {
//     setFormData((p) => {
//       const exists = p.services.includes(service);
//       return {
//         ...p,
//         services: exists ? p.services.filter((s) => s !== service) : [...p.services, service],
//       };
//     });
//   };

//   const handleSubmit = async () => {
//     const requiredFields = [
//       { key: "country", label: "Country" },
//       { key: "state", label: "State" },
//       { key: "destination", label: "Destination" },
//       { key: "name", label: "Name" },
//       { key: "email", label: "Email" },
//       { key: "companyName", label: "Company Name" },
//       { key: "mobileNumber", label: "Mobile Number" },
//       { key: "whatsappNumber", label: "WhatsApp Number" },
//       { key: "address", label: "Address" },
//     ];

//     for (let field of requiredFields) {
//       const value = formData[field.key];
//       if (!value || String(value).trim() === "") {
//         toast.error(`${field.label} is required`);
//         return;
//       }
//     }

//     if (!formData.services || formData.services.length === 0) {
//       toast.error("At least one service must be selected");
//       return;
//     }

//     try {
//       if (editingId) {
//         await API.put(`/purchaser/vendor/${editingId}`, formData);
//         toast.success("Vendor updated successfully");
//       } else {
//         await API.post("/purchaser/vendor", formData);
//         toast.success("Vendor created successfully");
//       }

//       // reset completely
//       clearEditAndReset();
//       fetchVendors();
//     } catch (err) {
//       console.error(err);
//       const errorMessage =
//         err.response?.data?.message || err.response?.data || "Operation failed";
//       toast.error(errorMessage);
//     }
//   };

//   const handleEdit = async (vendor) => {
//     try {
//       setIsManuallyEditing(true); // stop auto-resets while we hydrate

//       setEditingId(vendor._id);
//       // form fields (IDs only)
//       setFormData({
//         name: vendor.name || "",
//         email: vendor.email || "",
//         companyName: vendor.companyName || "",
//         gstNumber: vendor.gstNumber || "",
//         mobileNumber: vendor.mobileNumber || "",
//         whatsappNumber: vendor.whatsappNumber || "",
//         address: vendor.address || "",
//         country: vendor.country || "",
//         state: vendor.state || "",
//         destination: vendor.destination?._id || vendor.destination || "",
//         services: Array.isArray(vendor.services) ? vendor.services : [],
//       });

//       // Country select
//       const countryRes = countries.length ? countries : (await API.get("/purchaser/countries")).data || [];
//       if (!countries.length) setCountries(countryRes);
//       const countryOptionsLocal = countryRes.map(toCountryOption);
//       const countryOpt =
//         countryOptionsLocal.find((o) => o.value === vendor.country) ||
//         null;
//       setSelectedCountry(countryOpt);

//       // Fetch states for that country, then select
//       const stateRes = await API.get(`/purchaser/states/${vendor.country}`);
//       setStates(stateRes.data || []);
//       const stateOptionsLocal = (stateRes.data || []).map(toStateOption);
//       const stateOpt = stateOptionsLocal.find((o) => o.value === vendor.state) || null;
//       setSelectedState(stateOpt);

//       // Fetch destinations for country+state, then select
//       // const destinationRes = await API.get(
//       //   `/purchaser/destinationsByCountryAndState/${vendor.country}/${vendor.state}`
//       // );
//       const destinationRes = await API.get(
//   `/purchaser/destinationsByCountryAndState/${vendor.country}/${vendor.state}`,
//   {
//     params: {
//       currentDestinationId: vendor.destination?._id || vendor.destination, // 👈 NEW
//     },
//   }
// );
//       setDestinations(destinationRes.data || []);
//       const destinationOptionsLocal = (destinationRes.data || []).map(toDestinationOption);
//       const destOpt = destinationOptionsLocal.find(
//         (o) => o.value === (vendor.destination?._id || vendor.destination)
//       ) || null;
//       setSelectedDestination(destOpt);

//       // release the manual lock after everything is set
//       setTimeout(() => setIsManuallyEditing(false), 100);
//     } catch (err) {
//       console.error("handleEdit error:", err);
//       const errorMessage =
//         err.response?.data?.message ||
//         err.response?.data ||
//         "Failed to populate vendor details";
//       toast.error(errorMessage);
//       setIsManuallyEditing(false);
//     }
//   };

//   const handleStatusClick = (vendor) => {
//     setConfirmVendor(vendor);
//     setShowPopup(true);
//   };

//   const handleToggleStatus = async () => {
//     if (!confirmVendor) return;

//     try {
//       const updatedStatus = !confirmVendor.activeStatus;
//       const res = await API.patch(
//         `/purchaser/updateVendorStatus/${confirmVendor._id}/status`,
//         { activeStatus: updatedStatus }
//       );

//       if (res.data.success) {
//         toast.success(
//           `Vendor ${updatedStatus ? "activated" : "deactivated"} successfully`
//         );
//         await fetchVendors();
//       } else {
//         toast.error("Update failed");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Server error");
//     } finally {
//       setShowPopup(false);
//       setConfirmVendor(null);
//     }
//   };

//   // === NEW: clear prefill / exit edit mode ===
//   const clearEditAndReset = () => {
//     setFormData(initialForm);
//     setSelectedCountry(null);
//     setSelectedState(null);
//     setSelectedDestination(null);
//     setStates([]);
//     setDestinations([]);
//     setEditingId(null);
//     setIsManuallyEditing(false);
//   };

//   return (
//     <div className="w-full max-w-[100rem] mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-xl space-y-12 mb-6">
//       <div className="space-y-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//           {/* Country (React Select) */}
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
//             <Select
//               options={countryOptions}
//               value={selectedCountry}
//               onChange={(opt) => {
//                 setSelectedCountry(opt);
//                 setFormData((p) => ({ ...p, country: opt?.value || "" }));
//               }}
//               placeholder="Select Country"
//               styles={selectStyles}
//               classNamePrefix="vendor-country"
//               getOptionValue={(o) => String(o._id || o.value)}
//               isClearable
//               isDisabled={!!editingId}
//             />
//           </div>

//           {/* State (React Select) */}
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
//             <Select
//               options={stateOptions}
//               value={selectedState}
//               onChange={(opt) => {
//                 setSelectedState(opt);
//                 setFormData((p) => ({ ...p, state: opt?.value || "" }));
//               }}
//               placeholder="Select State"
//               styles={selectStyles}
//               classNamePrefix="vendor-state"
//               getOptionValue={(o) => String(o._id || o.value)}
//               isClearable
//               isDisabled={!!editingId || !selectedCountry?.value}
//             />
//           </div>

//           {/* Destination (React Select) */}
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">Destination</label>
//             <Select
//               options={destinationOptions}
//               value={selectedDestination}
//               onChange={(opt) => {
//                 setSelectedDestination(opt);
//                 setFormData((p) => ({ ...p, destination: opt?.value || "" }));
//               }}
//               placeholder="Select Destination"
//               styles={selectStyles}
//               classNamePrefix="vendor-destination"
//               getOptionValue={(o) => String(o._id || o.value)}
//               isClearable
//               isDisabled={!!editingId || !selectedState?.value}
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Name"
//               disabled={!!editingId}
//               className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:bg-white disabled:cursor-not-allowed"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Email"
//               disabled={!!editingId}
//               className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:bg-white disabled:cursor-not-allowed"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">Company Name</label>
//             <input
//               type="text"
//               name="companyName"
//               value={formData.companyName || ""}
//               onChange={handleChange}
//               placeholder="Company Name"
//               disabled={!!editingId}
//               className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:bg-white disabled:cursor-not-allowed"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">GST Number</label>
//             <input
//               type="text"
//               name="gstNumber"
//               value={formData.gstNumber || ""}
//               onChange={handleChange}
//               placeholder="GST Number"
//               className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition "
//             />
//           </div>

//           {["mobileNumber", "whatsappNumber"].map((field) => (
//             <div key={field}>
//               <label className="text-sm font-medium text-gray-700 mb-1 block">
//                 {field === "mobileNumber" ? "Mobile Number" : "WhatsApp Number"}
//               </label>
//               <input
//                 type="text"
//                 name={field}
//                 value={formData[field]}
//                 onChange={handleChange}
//                 placeholder={field === "mobileNumber" ? "Mobile Number" : "WhatsApp Number"}
//                 className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition"
//               />
//             </div>
//           ))}

//           <div className="md:col-span-2">
//             <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
//             <textarea
//               name="address"
//               rows="2"
//               value={formData.address}
//               onChange={handleChange}
//               placeholder="Address"
//               className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition"
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium text-gray-700">Services</label>
//           <div className="flex flex-wrap gap-6 pt-1">
//             {["Vehicle", "Hotels", "Activities", "Guide", "Rental", "Food", "Fixed Tour"].map(
//               (service, i) => (
//                 <label
//                   key={i}
//                   className="inline-flex items-center space-x-2 text-sm font-medium text-gray-800"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={formData.services.includes(service)}
//                     onChange={() => handleCheckboxChange(service)}
//                     className="w-4 h-4 text-[#8570EE] rounded focus:ring-[#8570EE]"
//                   />
//                   <span>{service}</span>
//                 </label>
//               )
//             )}
//           </div>
//         </div>

//         {/* Actions + NEW clear (cross) when editing */}
//         <div className="flex flex-col items-center gap-2">
//           {editingId && (
//             <button
//               type="button"
//               onClick={clearEditAndReset}
//               aria-label="Clear edit and reset form"
//               className="inline-flex items-center justify-center w-8 h-8 rounded-full
//                          bg-white/70 backdrop-blur-md border border-gray-200 shadow
//                          text-gray-700 hover:bg-white transition"
//               title="Discard changes"
//             >
//               ×
//             </button>
//           )}

//           <button
//             onClick={handleSubmit}
//             className="bg-[#8570EE] text-white text-sm font-semibold px-10 py-3 rounded-xl shadow-lg hover:bg-[#6e5bd9] active:scale-95 transition-all w-full"
//           >
//             {editingId ? "Update Vendor" : "Create Vendor"}
//           </button>
//         </div>
//       </div>

//       {/* Vendors table */}
//       <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
//         <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">View Vendors</h5>
//         <p className="block mb-6 text-sm font-light text-gray-400">
//           Search and Edit Vendors
//         </p>
//         <div className="mb-4">
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//             placeholder="Search by name..."
//             className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//           />
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
//             <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//               <tr>
//                 <th className="px-6 py-4">Sl No</th>
//                 <th className="px-6 py-4">vendor code</th>
//                 <th className="px-6 py-4">Vendor Name</th>
//                 <th className="px-6 py-4">Email</th>
//                 <th className="px-6 py-4">destination</th>
//                 <th className="px-6 py-4">Status</th>
//                 <th className="px-6 py-4 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {vendors.map((v, idx) => (
//                 <tr key={v._id} className="border-b hover:bg-gray-50">
//                   <td className="px-6 py-4 font-semibold">{(page - 1) * 3 + idx + 1}</td>
//                   <td className="px-6 py-4 font-semibold">{v.vendorCode}</td>
//                   <td className="px-6 py-4 font-semibold">{v.name}</td>
//                   <td className="px-6 py-4 font-semibold">{v.email}</td>
//                   <td className="px-6 py-4 font-semibold">{v.destination?.name || "-"}</td>
//                   <td className="px-6 py-4  font-semibold">
//                     {v.activeStatus ? (
//                       <span
//                         className="inline-flex items-center gap-1 text-green-600 cursor-pointer"
//                         onClick={() => handleStatusClick(v)}
//                       >
//                         <CheckCircle className="w-5 h-5" />
//                         Active
//                       </span>
//                     ) : (
//                       <span
//                         className="inline-flex items-center gap-1 text-red-500 cursor-pointer"
//                         onClick={() => handleStatusClick(v)}
//                       >
//                         <XCircle className="w-5 h-5" />
//                         Inactive
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 text-center font-semibold">
//                     <button
//                       onClick={() => handleEdit(v)}
//                       className="text-gray-700 hover:text-gray-700"
//                     >
//                       <Pencil className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="flex justify-center mt-6 space-x-2">
//           <button
//             onClick={() => setPage((p) => Math.max(p - 1, 1))}
//             disabled={page === 1}
//             className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
//           >
//             Previous
//           </button>
//           <span className="px-3 py-1">{page}</span>
//           <button
//             onClick={() => setPage((p) => p + 1)}
//             disabled={page >= totalPages}
//             className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* Activate/Deactivate Popup */}
//       {showPopup && confirmVendor && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
//           <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">
//               {confirmVendor.activeStatus ? "Deactivate" : "Activate"} Vendor
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to{" "}
//               <span className="font-bold">
//                 {confirmVendor.activeStatus ? "deactivate" : "activate"}
//               </span>{" "}
//               the vendor: <span className="font-semibold">{confirmVendor.name}</span>?
//             </p>

//             <div className="flex justify-end space-x-3">
//               <button
//                 className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
//                 onClick={() => {
//                   setShowPopup(false);
//                   setConfirmVendor(null);
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 className={`px-4 py-2 text-white rounded ${
//                   confirmVendor.activeStatus
//                     ? "bg-red-500 hover:bg-red-600"
//                     : "bg-green-500 hover:bg-green-600"
//                 }`}
//                 onClick={handleToggleStatus}
//               >
//                 {confirmVendor.activeStatus ? "Deactivate" : "Activate"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateVendor;



import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  CheckCircle,
  XCircle,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User2,
  Mail,
  Building2,
  Phone,
  MessageCircle,
  BadgePercent,
  Home,
  Briefcase,
} from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

const initialForm = {
  name: "",
  email: "",
  companyName: "",
  gstNumber: "",
  mobileNumber: "",
  whatsappNumber: "",
  address: "",
  country: "", // ID
  state: "", // ID
  destination: "", // ID
  services: [],
};

const CreateVendor = () => {
  const THEME = "#8570EE";

  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState(initialForm);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // React-Select selected options (objects)
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [isManuallyEditing, setIsManuallyEditing] = useState(false);
  const [confirmVendor, setConfirmVendor] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ UI-only pagination animation direction
  const [pageDir, setPageDir] = useState(1);

  /* --------------------------------------------
    ✅ FIX: react-select dropdown + value overflow
    - menuPortalTarget to body (prevents clipping)
    - menuList maxHeight + scroll
    - singleValue ellipsis (no weird overflow)
    - valueContainer NO horizontal scroll
  --------------------------------------------- */
  const selectStyles = useMemo(
    () => ({
      container: (b) => ({ ...b, width: "100%" }),

      control: (base, state) => ({
        ...base,
        borderRadius: 14,
        borderColor: state.isFocused ? THEME : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        maxHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? THEME : "#d1d5db" },
        overflow: "hidden",
      }),

      valueContainer: (b) => ({
        ...b,
        padding: "0 12px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        minWidth: 0,
      }),

      singleValue: (b) => ({
        ...b,
        color: "#111827",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }),

      input: (b) => ({
        ...b,
        margin: 0,
        padding: 0,
        color: "#111827",
        minWidth: 2,
      }),

      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
      dropdownIndicator: (b) => ({
        ...b,
        color: "#6b7280",
        ":hover": { color: "#4b5563" },
      }),

      menuPortal: (b) => ({ ...b, zIndex: 99999 }),
      menu: (b) => ({ ...b, borderRadius: 14, overflow: "hidden", zIndex: 99999 }),

      // ✅ scroll inside dropdown
      menuList: (b) => ({
        ...b,
        maxHeight: 260,
        overflowY: "auto",
      }),

      option: (b, s) => ({
        ...b,
        backgroundColor: s.isFocused
          ? "rgba(133,112,238,0.08)"
          : s.isSelected
          ? "rgba(133,112,238,0.16)"
          : "white",
        color: "#222",
      }),

      placeholder: (b) => ({ ...b, color: "#6b7280" }),
    }),
    [THEME]
  );

  // Helpers to map API data -> Select options
  const toCountryOption = (c) => ({ _id: c._id, value: c._id, label: c.name });
  const toStateOption = (s) => ({ _id: s._id, value: s._id, label: s.name });
  const toDestinationOption = (d) => ({
    _id: d._id,
    value: d._id,
    label: d.activeStatus ? d.name : `${d.name} (inactive)`,
  });

  const countryOptions = countries.map(toCountryOption);
  const stateOptions = states.map(toStateOption);
  const destinationOptions = destinations.map(toDestinationOption);

  const fetchCountries = async () => {
    try {
      const res = await API.get("/purchaser/countries");
      setCountries(res.data || []);
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      if (!countryId) {
        setStates([]);
        return;
      }
      const res = await API.get(`/purchaser/states/${countryId}`);
      setStates(res.data || []);
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchDestinations = async (countryId, stateId) => {
    try {
      if (!countryId || !stateId) {
        setDestinations([]);
        return;
      }
      const res = await API.get(
        `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`
      );
      setDestinations(res.data || []);
    } catch (err) {
      console.error("Error fetching destinations:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await API.get(
        `/purchaser/vendors?page=${page}&search=${encodeURIComponent(search)}`
      );
      setVendors(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCountries();
  }, []);

  // When selectedCountry (option) changes, fetch states (unless manually editing lock)
  useEffect(() => {
    if (!isManuallyEditing) {
      const countryId = selectedCountry?.value || "";
      fetchStates(countryId);
      // reset state & destination in form + UI
      setSelectedState(null);
      setSelectedDestination(null);
      setFormData((prev) => ({ ...prev, state: "", destination: "", country: countryId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry?.value]);

  // When selectedState (option) changes, fetch destinations (unless manually editing lock)
  useEffect(() => {
    if (!isManuallyEditing) {
      const countryId = selectedCountry?.value || "";
      const stateId = selectedState?.value || "";
      fetchDestinations(countryId, stateId);
      // reset destination in form + UI
      setSelectedDestination(null);
      setFormData((prev) => ({ ...prev, state: stateId, destination: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState?.value]);

  // Keep vendors list updated
  useEffect(() => {
    fetchVendors();
  }, [page, search]);

  // Sync selected options from IDs whenever lists load (useful after edit preload)
  useEffect(() => {
    if (formData.country && countries.length) {
      const opt = countryOptions.find((o) => o.value === formData.country) || null;
      setSelectedCountry(opt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, formData.country]);

  useEffect(() => {
    if (formData.state && states.length) {
      const opt = stateOptions.find((o) => o.value === formData.state) || null;
      setSelectedState(opt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, formData.state]);

  useEffect(() => {
    if (formData.destination && destinations.length) {
      const opt = destinationOptions.find((o) => o.value === formData.destination) || null;
      setSelectedDestination(opt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinations, formData.destination]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCheckboxChange = (service) => {
    setFormData((p) => {
      const exists = p.services.includes(service);
      return {
        ...p,
        services: exists ? p.services.filter((s) => s !== service) : [...p.services, service],
      };
    });
  };

  const handleSubmit = async () => {
    const requiredFields = [
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "destination", label: "Destination" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "companyName", label: "Company Name" },
      { key: "mobileNumber", label: "Mobile Number" },
      { key: "whatsappNumber", label: "WhatsApp Number" },
      { key: "address", label: "Address" },
    ];

    for (let field of requiredFields) {
      const value = formData[field.key];
      if (!value || String(value).trim() === "") {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    if (!formData.services || formData.services.length === 0) {
      toast.error("At least one service must be selected");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/purchaser/vendor/${editingId}`, formData);
        toast.success("Vendor updated successfully");
      } else {
        await API.post("/purchaser/vendor", formData);
        toast.success("Vendor created successfully");
      }

      // reset completely
      clearEditAndReset();
      fetchVendors();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || err.response?.data || "Operation failed";
      toast.error(errorMessage);
    }
  };

  const handleEdit = async (vendor) => {
    try {
      setIsManuallyEditing(true); // stop auto-resets while we hydrate

      setEditingId(vendor._id);
      // form fields (IDs only)
      setFormData({
        name: vendor.name || "",
        email: vendor.email || "",
        companyName: vendor.companyName || "",
        gstNumber: vendor.gstNumber || "",
        mobileNumber: vendor.mobileNumber || "",
        whatsappNumber: vendor.whatsappNumber || "",
        address: vendor.address || "",
        country: vendor.country || "",
        state: vendor.state || "",
        destination: vendor.destination?._id || vendor.destination || "",
        services: Array.isArray(vendor.services) ? vendor.services : [],
      });

      // Country select
      const countryRes = countries.length
        ? countries
        : (await API.get("/purchaser/countries")).data || [];
      if (!countries.length) setCountries(countryRes);
      const countryOptionsLocal = countryRes.map(toCountryOption);
      const countryOpt = countryOptionsLocal.find((o) => o.value === vendor.country) || null;
      setSelectedCountry(countryOpt);

      // Fetch states for that country, then select
      const stateRes = await API.get(`/purchaser/states/${vendor.country}`);
      setStates(stateRes.data || []);
      const stateOptionsLocal = (stateRes.data || []).map(toStateOption);
      const stateOpt = stateOptionsLocal.find((o) => o.value === vendor.state) || null;
      setSelectedState(stateOpt);

      // Fetch destinations for country+state, then select
      const destinationRes = await API.get(
        `/purchaser/destinationsByCountryAndState/${vendor.country}/${vendor.state}`,
        {
          params: {
            currentDestinationId: vendor.destination?._id || vendor.destination,
          },
        }
      );
      setDestinations(destinationRes.data || []);
      const destinationOptionsLocal = (destinationRes.data || []).map(toDestinationOption);
      const destOpt =
        destinationOptionsLocal.find(
          (o) => o.value === (vendor.destination?._id || vendor.destination)
        ) || null;
      setSelectedDestination(destOpt);

      // release the manual lock after everything is set
      setTimeout(() => setIsManuallyEditing(false), 100);
    } catch (err) {
      console.error("handleEdit error:", err);
      const errorMessage =
        err.response?.data?.message || err.response?.data || "Failed to populate vendor details";
      toast.error(errorMessage);
      setIsManuallyEditing(false);
    }
  };

  const handleStatusClick = (vendor) => {
    setConfirmVendor(vendor);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!confirmVendor) return;

    try {
      const updatedStatus = !confirmVendor.activeStatus;
      const res = await API.patch(`/purchaser/updateVendorStatus/${confirmVendor._id}/status`, {
        activeStatus: updatedStatus,
      });

      if (res.data.success) {
        toast.success(`Vendor ${updatedStatus ? "activated" : "deactivated"} successfully`);
        await fetchVendors();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setConfirmVendor(null);
    }
  };

  // === NEW: clear prefill / exit edit mode ===
  const clearEditAndReset = () => {
    setFormData(initialForm);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedDestination(null);
    setStates([]);
    setDestinations([]);
    setEditingId(null);
    setIsManuallyEditing(false);
  };

  // ✅ Premium table page transition (UI-only)
  const tableVariants = {
    enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
      {/* Shell like Executive */}
      <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
        {/* Top ribbon */}
        <div
          className="h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
        />

        <div className="p-6 md:p-8 space-y-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                <Sparkles size={14} style={{ color: THEME }} />
                Purchaser
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
                Create Vendor
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Create / Update vendors, assign location & services, and manage status.
              </div>
            </div>

            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
              style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
            >
              <Briefcase size={20} />
            </div>
          </div>

          {/* ✅ LAYOUT CHANGE ONLY: Form card on TOP, Table below */}
          <div className="space-y-6">
            {/* TOP: FORM PANEL */}
            <div className="w-full">
              <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">
                      {editingId ? "Edit vendor" : "Add new vendor"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Fill all required fields and choose at least one service.
                    </div>
                  </div>

                  {editingId && (
                    <button
                      type="button"
                      onClick={clearEditAndReset}
                      aria-label="Clear edit and reset form"
                      title="Discard changes"
                      className="
                        inline-flex items-center justify-center
                        w-9 h-9 rounded-2xl
                        bg-white/70 backdrop-blur-md
                        border border-slate-200
                        shadow hover:bg-white transition
                        text-slate-700
                      "
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-4 bg-gradient-to-b from-white to-purple-50/40">
                  {/* Location selects */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                        <MapPin size={12} style={{ color: THEME }} />
                        Country
                      </div>
                      <Select
                        options={countryOptions}
                        value={selectedCountry}
                        onChange={(opt) => {
                          setSelectedCountry(opt);
                          setFormData((p) => ({ ...p, country: opt?.value || "" }));
                        }}
                        placeholder="Select Country"
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        classNamePrefix="vendor-country"
                        getOptionValue={(o) => String(o._id || o.value)}
                        isClearable
                        isDisabled={!!editingId}
                      />
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                        <MapPin size={12} style={{ color: THEME }} />
                        State
                      </div>
                      <Select
                        options={stateOptions}
                        value={selectedState}
                        onChange={(opt) => {
                          setSelectedState(opt);
                          setFormData((p) => ({ ...p, state: opt?.value || "" }));
                        }}
                        placeholder="Select State"
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        classNamePrefix="vendor-state"
                        getOptionValue={(o) => String(o._id || o.value)}
                        isClearable
                        isDisabled={!!editingId || !selectedCountry?.value}
                      />
                      {!selectedCountry?.value && (
                        <div className="mt-1 text-xs text-slate-400">
                          Select country first to enable states.
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                        <MapPin size={12} style={{ color: THEME }} />
                        Destination
                      </div>
                      <Select
                        options={destinationOptions}
                        value={selectedDestination}
                        onChange={(opt) => {
                          setSelectedDestination(opt);
                          setFormData((p) => ({ ...p, destination: opt?.value || "" }));
                        }}
                        placeholder="Select Destination"
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        classNamePrefix="vendor-destination"
                        getOptionValue={(o) => String(o._id || o.value)}
                        isClearable
                        isDisabled={!!editingId || !selectedState?.value}
                      />
                      {!selectedState?.value && (
                        <div className="mt-1 text-xs text-slate-400">
                          Select state first to enable destinations.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field
                      icon={User2}
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                      disabled={!!editingId}
                      theme={THEME}
                    />

                    <Field
                      icon={Mail}
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      disabled={!!editingId}
                      theme={THEME}
                    />

                    <Field
                      icon={Building2}
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName || ""}
                      onChange={handleChange}
                      placeholder="Company Name"
                      disabled={!!editingId}
                      theme={THEME}
                    />

                    <Field
                      icon={BadgePercent}
                      label="GST Number"
                      name="gstNumber"
                      value={formData.gstNumber || ""}
                      onChange={handleChange}
                      placeholder="GST Number"
                      theme={THEME}
                    />

                    <Field
                      icon={Phone}
                      label="Mobile Number"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="Mobile Number"
                      theme={THEME}
                    />

                    <Field
                      icon={MessageCircle}
                      label="WhatsApp Number"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      placeholder="WhatsApp Number"
                      theme={THEME}
                    />

                    <div className="sm:col-span-2 lg:col-span-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                        <Home size={12} style={{ color: THEME }} />
                        Address
                      </div>
                      <textarea
                        name="address"
                        rows="2"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Address"
                        className="
                          w-full
                          rounded-2xl
                          border border-slate-300
                          bg-white/90
                          px-4 py-3
                          text-sm
                          outline-none
                          resize-none
                          focus:ring-2
                        "
                        style={{ "--tw-ring-color": THEME }}
                      />
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-2">
                      Services
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {["Vehicle", "Hotels", "Activities", "Guide", "Rental", "Food", "Fixed Tour"].map(
                        (service, i) => {
                          const active = formData.services.includes(service);
                          return (
                            <label
                              key={i}
                              className={[
                                "cursor-pointer select-none",
                                "inline-flex items-center gap-2",
                                "rounded-full border px-3 py-2 text-xs font-semibold",
                                "transition",
                                active
                                  ? "bg-[#8570EE]/10 border-[#8570EE]/40 text-[#321F6A]"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => handleCheckboxChange(service)}
                                className="w-4 h-4 text-[#8570EE] rounded focus:ring-[#8570EE]"
                              />
                              {service}
                            </label>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    className="
                      w-full
                      rounded-2xl
                      px-5 py-3.5
                      text-sm font-extrabold
                      text-white
                      shadow-[0_16px_40px_rgba(133,112,238,0.35)]
                      hover:opacity-95
                      active:scale-[0.99]
                      transition
                    "
                    style={{ background: THEME }}
                  >
                    {editingId ? "Update Vendor" : "Create Vendor"}
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM: LIST PANEL */}
            <div className="w-full">
              <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">Vendors</div>
                    <div className="mt-1 text-sm text-slate-500">Search and edit vendors</div>
                  </div>

                  {/* Search */}
                  <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[320px]">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPageDir(1);
                        setPage(1);
                      }}
                      placeholder="Search by name..."
                      className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                    />
                  </div>
                </div>

                {/* ✅ Animated table (no scrollbar flash) */}
                <div className="relative overflow-hidden">
                  <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <AnimatePresence mode="wait" custom={pageDir}>
                      <motion.div
                        key={`vendors-page-${page}-${search}`}
                        custom={pageDir}
                        variants={tableVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="w-full"
                        style={{ overflow: "visible" }}
                      >
                        <table className="w-full text-sm text-left text-slate-700 min-w-[860px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                              <th className="px-5 py-3">Sl No</th>
                              <th className="px-5 py-3">Vendor code</th>
                              <th className="px-5 py-3">Vendor Name</th>
                              <th className="px-5 py-3">Email</th>
                              <th className="px-5 py-3">Destination</th>
                              <th className="px-5 py-3">Status</th>
                              <th className="px-5 py-3 text-center">Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {vendors.map((v, idx) => (
                              <tr
                                key={v._id}
                                className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                              >
                                <td className="px-5 py-3 font-semibold">
                                  {(page - 1) * 3 + idx + 1}
                                </td>
                                <td className="px-5 py-3 font-semibold">{v.vendorCode}</td>
                                <td className="px-5 py-3 font-semibold">{v.name}</td>
                                <td className="px-5 py-3 font-semibold">{v.email}</td>
                                <td className="px-5 py-3 font-semibold">
                                  {v.destination?.name || "-"}
                                </td>

                                <td className="px-5 py-3 font-semibold">
                                  {v.activeStatus ? (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusClick(v)}
                                      className="
                                        inline-flex items-center gap-2
                                        px-3 py-1.5 rounded-full
                                        text-xs font-semibold
                                        border
                                        bg-emerald-50 text-emerald-700 border-emerald-200
                                        hover:bg-emerald-100 transition
                                      "
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Active
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusClick(v)}
                                      className="
                                        inline-flex items-center gap-2
                                        px-3 py-1.5 rounded-full
                                        text-xs font-semibold
                                        border
                                        bg-red-50 text-red-700 border-red-200
                                        hover:bg-red-100 transition
                                      "
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Inactive
                                    </button>
                                  )}
                                </td>

                                <td className="px-5 py-3 text-center font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(v)}
                                    className="
                                      inline-flex items-center justify-center
                                      h-9 w-9 rounded-2xl
                                      border border-slate-200
                                      bg-white/80 hover:bg-white
                                      shadow-sm hover:shadow-md transition
                                      text-slate-700
                                    "
                                    title="Edit vendor"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}

                            {vendors.length === 0 && (
                              <tr>
                                <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                                  No vendors found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Pagination */}
                <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
                  <button
                    onClick={() => {
                      setPageDir(-1);
                      setPage((p) => Math.max(p - 1, 1));
                    }}
                    disabled={page === 1}
                    className={`
                      inline-flex items-center gap-2
                      px-3 py-2 rounded-xl border text-sm
                      ${
                        page === 1
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }
                    `}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <span className="px-4 py-2 rounded-xl bg-[#8570EE]/10 text-[#8570EE] font-bold border border-[#8570EE]/25">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => {
                      setPageDir(1);
                      setPage((p) => p + 1);
                    }}
                    disabled={page >= totalPages}
                    className={`
                      inline-flex items-center gap-2
                      px-3 py-2 rounded-xl border text-sm
                      ${
                        page >= totalPages
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }
                    `}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popup (same logic, upgraded UI) */}
        {showPopup && confirmVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                setConfirmVendor(null);
              }}
            />

            <div
              className="
                relative
                w-full max-w-md mx-3
                rounded-[28px]
                border border-white/25
                shadow-[0_30px_90px_rgba(15,23,42,0.55)]
                bg-white/92 backdrop-blur-2xl
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
              />

              <div className="p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Confirm action
                </div>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {confirmVendor.activeStatus ? "Deactivate" : "Activate"} Vendor
                </h2>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold">
                    {confirmVendor.activeStatus ? "deactivate" : "activate"}
                  </span>{" "}
                  the vendor: <span className="font-semibold">{confirmVendor.name}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                    onClick={() => {
                      setShowPopup(false);
                      setConfirmVendor(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
                    style={{ background: confirmVendor.activeStatus ? "#ef4444" : "#22c55e" }}
                    onClick={handleToggleStatus}
                  >
                    {confirmVendor.activeStatus ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateVendor;

/* -----------------------------
  UI Helpers (STYLE ONLY)
------------------------------ */
function Field({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  theme,
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
        {Icon ? <Icon size={12} style={{ color: theme }} /> : null}
        {label}
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="
          w-full
          rounded-2xl
          border border-slate-300
          bg-white/90
          px-4 py-3
          text-sm
          outline-none
          shadow-sm
          focus:ring-2
          transition
          disabled:bg-white
          disabled:cursor-not-allowed
        "
        style={{ "--tw-ring-color": theme }}
      />
    </div>
  );
}

















