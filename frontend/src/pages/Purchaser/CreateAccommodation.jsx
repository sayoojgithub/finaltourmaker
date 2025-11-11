// import React, { useState, useEffect } from "react";
// import { Trash2 } from "lucide-react";
// import { Pencil } from "lucide-react";
// import API from "../../api";
// import { toast } from "react-toastify";

// const CreateAccomadation = () => {
//   const defaultSection = {
//     validFrom: "",
//     validTo: "",
//     "2BEDEP": "",
//     "2BEDCP": "",
//     "2BEDMAP": "",
//     "3BEDEP": "",
//     "3BEDCP": "",
//     "3BEDMAP": "",
//     "4BEDEP": "",
//     "4BEDCP": "",
//     "4BEDMAP": "",
//     EXTRABEDEP: "",
//     EXTRABEDCP: "",
//     EXTRABEDMAP: "",
//     FRESHUP: "",
//     EARLYCHECKIN: "",
//     LATECHECKOUT: "",
//   };

//   // const [formSections, setFormSections] = useState([defaultSection]);
//   const [formSections, setFormSections] = useState([]);
//   const [isActive, setIsActive] = useState(true);
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [selectedCountry, setSelectedCountry] = useState("");
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDestination, setSelectedDestination] = useState("");
//   const [selectedVendor, setSelectedVendor] = useState("");
//   const [formData, setFormData] = useState({
//     propertyName: "",
//     hotelCategory: "",
//     ownerName: "",
//     email: "",
//     mobileNumber: "",
//     whatsappNumber: "",
//     roomCategory: "",
//     address: "",
//   });
//   const [accommodations, setAccommodations] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const handlePriceChange = (index, field, value) => {
//     const updatedSections = [...formSections];
//     updatedSections[index][field] = value;
//     setFormSections(updatedSections);
//   };
//   const fetchAccommodations = async () => {
//     try {
//       const res = await API.get(
//         `/purchaser/accommodations?page=${page}&search=${search}`
//       );
//       setAccommodations(res.data.data);
//       setTotalPages(res.data.totalPages);
//     } catch (err) {
//       toast.error("Error fetching accommodations:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAccommodations();
//   }, [page, search]);
//   console.log(accommodations, "accommodations");

//   // const handleAddSection = () => setFormSections([...formSections, {}]);
//   const handleAddSection = () => {
//     setFormSections((prev) => [...prev, { ...defaultSection }]);
//   };
//   const handleRemoveSection = (index) => {
//     const updated = [...formSections];
//     updated.splice(index, 1);
//     setFormSections(updated);
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   useEffect(() => {
//     const fetchCountries = async () => {
//       try {
//         const res = await API.get("/purchaser/countries");
//         setCountries(res.data);
//       } catch (err) {
//         toast.error("Error fetching countries:", err);
//       }
//     };
//     fetchCountries();
//   }, []);

//   useEffect(() => {
//     if (selectedCountry) {
//       if (isEditing) return;
//       const fetchStates = async () => {
//         try {
//           const res = await API.get(`/purchaser/states/${selectedCountry}`);
//           setStates(res.data);
//         } catch (err) {
//           toast.error("Error fetching states:", err);
//         }
//       };
//       fetchStates();
//       setSelectedState("");
//       setDestinations([]);
//       setVendors([]);
//       setSelectedVendor("");
//     }
//   }, [selectedCountry]);

//   useEffect(() => {
//     if (selectedCountry && selectedState) {
//       if (isEditing) return;
//       const fetchDestinations = async () => {
//         try {
//           const res = await API.get(
//             `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
//           );
//           setDestinations(res.data);
//         } catch (err) {
//           toast.error("Error fetching destinations:", err);
//         }
//       };
//       fetchDestinations();
//       setSelectedDestination("");
//       setVendors([]);
//       setSelectedVendor("");
//     }
//   }, [selectedState]);

//   useEffect(() => {
//     if (selectedCountry && selectedState && selectedDestination) {
//       if (isEditing) return;
//       const fetchVendors = async () => {
//         try {
//           const res = await API.get(
//             `/purchaser/vendorsOfHotels/${selectedCountry}/${selectedState}/${selectedDestination}`
//           );
//           setVendors(res.data);
//         } catch (err) {
//           toast.error("Error fetching vendors:", err);
//         }
//       };
//       fetchVendors();
//       setSelectedVendor("");
//     }
//   }, [selectedDestination]);
//   const handleEdit = async (entry) => {
//     setIsEditing(true);
//     setEditId(entry._id);
//     setIsActive(entry.status === "Active");

//     const countryId = entry.country?._id || entry.country || "";
//     const stateId = entry.state?._id || entry.state || "";
//     const destinationId = entry.destination?._id || entry.destination || "";
//     const vendorId = entry.vendor?._id || entry.vendor || "";

//     setSelectedCountry(countryId);

//     if (countryId) {
//       try {
//         const stateRes = await API.get(`/purchaser/states/${countryId}`);
//         setStates(stateRes.data);
//       } catch (error) {
//         console.error("Error fetching states:", error);
//       }
//     }

//     setSelectedState(stateId);

//     if (countryId && stateId) {
//       try {
//         const destinationRes = await API.get(
//           `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`
//         );
//         setDestinations(destinationRes.data);
//       } catch (error) {
//         console.error("Error fetching destinations:", error);
//       }
//     }

//     setSelectedDestination(destinationId);

//     if (countryId && stateId && destinationId) {
//       try {
//         const vendorRes = await API.get(
//           `/purchaser/vendorsOfHotels/${countryId}/${stateId}/${destinationId}`
//         );
//         setVendors(vendorRes.data);

//         // ✅ Only set selected vendor after list is fetched
//         const vendorExists = vendorRes.data.find((v) => v._id === vendorId);
//         setSelectedVendor(vendorExists ? vendorId : "");
//       } catch (error) {
//         console.error("Error fetching vendors:", error);
//       }
//     } else {
//       setSelectedVendor("");
//     }
//     const formatDateForInput = (dateStr) => {
//       const date = new Date(dateStr);
//       const yyyy = date.getFullYear();
//       const mm = String(date.getMonth() + 1).padStart(2, "0");
//       const dd = String(date.getDate()).padStart(2, "0");
//       return `${yyyy}-${mm}-${dd}`;
//     };

//     setFormData({
//       propertyName: entry.propertyName || "",
//       hotelCategory: entry.hotelCategory || "",
//       email: entry.email || "",
//       ownerName: entry.ownerName || "",
//       mobileNumber: entry.mobileNumber || "",
//       whatsappNumber: entry.whatsappNumber || "",
//       address: entry.address || "",
//       roomCategory: entry.roomCategory || "",
//     });

//     setFormSections(
//       entry.formSections?.map((section) => ({
//         ...section,
//         validFrom: formatDateForInput(section.validFrom),
//         validTo: formatDateForInput(section.validTo),
//       })) || []
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedCountry) {
//       toast.error("Country is required");
//       return;
//     }
//     if (!selectedState) {
//       toast.error("State is required");
//       return;
//     }
//     if (!selectedDestination) {
//       toast.error("Destination is required");
//       return;
//     }
//     if (!selectedVendor) {
//       toast.error("Vendor is required");
//       return;
//     }
//     for (const field in formData) {
//       if (!formData[field].trim()) {
//         toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
//         return;
//       }
//     }

//     for (let i = 0; i < formSections.length; i++) {
//       const section = formSections[i];
//       const from = new Date(section.validFrom);
//       const to = new Date(section.validTo);

//       if (!section.validFrom || !section.validTo) {
//         toast.error(
//           `Both validFrom and validTo are required in section ${i + 1}`
//         );
//         return;
//       }

//       if (to <= from) {
//         toast.error(`validTo must be after validFrom in section ${i + 1}`);
//         return;
//       }
//     }
//     const ranges = formSections
//       .map((section, index) => ({
//         index,
//         validFrom: new Date(section.validFrom),
//         validTo: new Date(section.validTo),
//       }))
//       .sort((a, b) => a.validFrom - b.validFrom);

//     // Step 2: Check for overlap
//     for (let i = 1; i < ranges.length; i++) {
//       const prev = ranges[i - 1];
//       const current = ranges[i];

//       if (current.validFrom <= prev.validTo) {
//         toast.error(
//           `Dates in section ${current.index + 1} overlaps with section ${
//             prev.index + 1
//           }.`
//         );
//         return;
//       }
//     }
//     const numericFields = [
//       "2BEDEP",
//       "2BEDCP",
//       "2BEDMAP",
//       "3BEDEP",
//       "3BEDCP",
//       "3BEDMAP",
//       "4BEDEP",
//       "4BEDCP",
//       "4BEDMAP",
//       "EXTRABEDEP",
//       "EXTRABEDCP",
//       "EXTRABEDMAP",
//       "FRESHUP",
//       "EARLYCHECKIN",
//       "LATECHECKOUT",
//     ];

//     for (let i = 0; i < formSections.length; i++) {
//       const section = formSections[i];

//       for (const field of numericFields) {
//         const value = section[field];

//         if (value !== undefined && value !== "") {
//           const num = Number(value);

//           if (isNaN(num) || num < 0) {
//             toast.error(
//               `Field "${field}" in section ${i + 1} must be a positive number`
//             );
//             return;
//           }
//         }
//       }
//     }

//     const payload = {
//       ...formData,
//       status: isActive ? "Active" : "Inactive",
//       country: selectedCountry,
//       state: selectedState,
//       destination: selectedDestination,
//       vendor: selectedVendor,
//       formSections: formSections.map((section) => ({
//         ...section,
//         validFrom: new Date(section.validFrom),
//         validTo: new Date(section.validTo),
//         "2BEDEP": Number(section["2BEDEP"]),
//         "2BEDCP": Number(section["2BEDCP"]),
//         "2BEDMAP": Number(section["2BEDMAP"]),
//         "3BEDEP": Number(section["3BEDEP"]),
//         "3BEDCP": Number(section["3BEDCP"]),
//         "3BEDMAP": Number(section["3BEDMAP"]),
//         "4BEDEP": Number(section["4BEDEP"]),
//         "4BEDCP": Number(section["4BEDCP"]),
//         "4BEDMAP": Number(section["4BEDMAP"]),
//         EXTRABEDEP: Number(section.EXTRABEDEP),
//         EXTRABEDCP: Number(section.EXTRABEDCP),
//         EXTRABEDMAP: Number(section.EXTRABEDMAP),
//         FRESHUP: Number(section.FRESHUP),
//         EARLYCHECKIN: Number(section.EARLYCHECKIN),
//         LATECHECKOUT: Number(section.LATECHECKOUT),
//       })),
//     };

//     try {
//       const response = isEditing
//         ? await API.put(`/purchaser/updateAccommodation/${editId}`, payload)
//         : await API.post("/purchaser/createAccommodation", payload);

//       toast.success(
//         isEditing ? "Accommodation Updated!" : "Accommodation Created!"
//       );

//       setFormData({
//         propertyName: "",
//         hotelCategory: "",
//         email: "",
//         ownerName: "",
//         mobileNumber: "",
//         whatsappNumber: "",
//         address: "",
//         roomCategory: "",
//       });

//       setFormSections([]);
//       setStates([]);
//       setDestinations([]);
//       setVendors([]);
//       setSelectedCountry("");
//       setSelectedState("");
//       setSelectedDestination("");
//       setSelectedVendor("");
//       setIsActive(true);
//       setIsEditing(false);
//       setEditId(null);
//       setPage(1);
//       fetchAccommodations();
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message ||
//           error.response?.data?.error ||
//           `Error ${isEditing ? "updating" : "creating"} accommodation`
//       );
//     }
//   };

//   return (
//     <div className="w-full max-w-[100rem] mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-xl space-y-12 mb-6">
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <h5 className="text-3xl font-Abril text-[#321F6A] mb-1">
//           Create Accomodation
//         </h5>
//         <p className="block mb-6 text-sm font-light text-gray-400">
//           Create Accomodaation
//         </p>

//         {/* Dropdowns */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Country
//             </label>
//             <select
//               className="p-2 border border-gray-300 rounded shadow-sm w-full  disabled:cursor-not-allowed"
//               value={selectedCountry}
//               disabled={!!isEditing}
//               onChange={(e) => setSelectedCountry(e.target.value)}
//             >
//               <option value="">Select Country</option>
//               {countries.map((country) => (
//                 <option key={country._id} value={country._id}>
//                   {country.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               State
//             </label>
//             <select
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               value={selectedState}
//               disabled={!!isEditing}
//               onChange={(e) => setSelectedState(e.target.value)}
//             >
//               <option value="">Select State</option>
//               {states.map((state) => (
//                 <option key={state._id} value={state._id}>
//                   {state.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Destination
//             </label>
//             <select
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               value={selectedDestination}
//               disabled={!!isEditing}
//               onChange={(e) => setSelectedDestination(e.target.value)}
//             >
//               <option value="">Select Destination</option>
//               {destinations.map((dest) => (
//                 <option key={dest._id} value={dest._id}>
//                   {dest.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Vendor
//             </label>
//             <select
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               value={selectedVendor}
//               disabled={!!isEditing}
//               onChange={(e) => setSelectedVendor(e.target.value)}
//             >
//               <option value="">Select Vendor</option>
//               {vendors.map((v) => (
//                 <option key={v._id} value={v._id}>
//                   {v.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Property Details */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Property Name
//             </label>
//             <input
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               placeholder="Property Name"
//               name="propertyName"
//               value={formData.propertyName}
//               onChange={handleChange}
//               disabled={!!isEditing}
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Hotel category
//             </label>
//             <select
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               name="hotelCategory"
//               value={formData.hotelCategory}
//               onChange={handleChange}
//               disabled={!!isEditing}
//             >
//               <option>Hotel category</option>
//               <option>Standard</option>
//               <option>Deluxe</option>
//             </select>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Owner / Manager name
//             </label>
//             <input
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               placeholder="Owner / Manager name"
//               name="ownerName"
//               value={formData.ownerName}
//               onChange={handleChange}
//               disabled={!!isEditing}
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Email
//             </label>
//             <input
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               placeholder="Email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               disabled={!!isEditing}
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Mobile Number
//             </label>
//             <input
//               className="p-2 border border-gray-300 rounded shadow-sm w-full"
//               placeholder="Mobile Number"
//               name="mobileNumber"
//               value={formData.mobileNumber}
//               onChange={handleChange}
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               WhatsApp Number
//             </label>
//             <input
//               className="p-2 border border-gray-300 rounded shadow-sm w-full"
//               placeholder="WhatsApp Number"
//               name="whatsappNumber"
//               value={formData.whatsappNumber}
//               onChange={handleChange}
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Room category
//             </label>
//             <select
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               name="roomCategory"
//               value={formData.roomCategory}
//               onChange={handleChange}
//               disabled={!!isEditing}
//             >
//               <option>Room category</option>
//               <option>Standard</option>
//               <option>Deluxe</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Address
//             </label>
//             <input
//               className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
//               placeholder="Address"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               disabled={!!isEditing}
//             />
//           </div>
//         </div>

//         {formSections.map((_, index) => (
//           <div
//             key={index}
//             className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 p-4 mb-4 rounded-md shadow-md bg-white"
//           >
//             <div className="grid grid-cols-3 gap-2">
//               {/* Row for two date fields */}
//               <div className="col-span-3 grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1 block">
//                     Valid From
//                   </label>
//                   <input
//                     type="date"
//                     value={formSections[index]["validFrom"]}
//                     onChange={(e) =>
//                       handlePriceChange(index, "validFrom", e.target.value)
//                     }
//                     className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1 block">
//                     Valid To
//                   </label>
//                   <input
//                     type="date"
//                     value={formSections[index]["validTo"]}
//                     onChange={(e) =>
//                       handlePriceChange(index, "validTo", e.target.value)
//                     }
//                     className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   />
//                 </div>
//               </div>

//               {/* Remaining 6 fields in 3-column layout */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   3 Bed EP
//                 </label>
//                 <input
//                   value={formSections[index]["3BEDEP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "3BEDEP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="3 Bed EP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   3 Bed CP
//                 </label>
//                 <input
//                   value={formSections[index]["3BEDCP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "3BEDCP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="3 Bed CP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   3 Bed MAP
//                 </label>
//                 <input
//                   value={formSections[index]["3BEDMAP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "3BEDMAP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="3 Bed MAP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   Extra Bed EP
//                 </label>
//                 <input
//                   value={formSections[index]["EXTRABEDEP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "EXTRABEDEP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="Extra Bed EP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   Extra Bed CP
//                 </label>
//                 <input
//                   value={formSections[index]["EXTRABEDCP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "EXTRABEDCP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="Extra Bed CP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   Extra Bed MAP
//                 </label>
//                 <input
//                   value={formSections[index]["EXTRABEDMAP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "EXTRABEDMAP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="Extra Bed MAP"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-2">
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   2 Bed EP
//                 </label>
//                 <input
//                   value={formSections[index]["2BEDEP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "2BEDEP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="2 Bed EP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   2 Bed CP
//                 </label>
//                 <input
//                   value={formSections[index]["2BEDCP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "2BEDCP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="2 Bed CP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   2 Bed MAP
//                 </label>
//                 <input
//                   value={formSections[index]["2BEDMAP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "2BEDMAP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="2 Bed MAP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   4 Bed EP
//                 </label>
//                 <input
//                   value={formSections[index]["4BEDEP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "4BEDEP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="4 Bed EP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   4 Bed CP
//                 </label>
//                 <input
//                   value={formSections[index]["4BEDCP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "4BEDCP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="4 Bed CP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   4 Bed MAP
//                 </label>
//                 <input
//                   value={formSections[index]["4BEDMAP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "4BEDMAP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="4 Bed MAP"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   Fresh up
//                 </label>
//                 <input
//                   value={formSections[index]["FRESHUP"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "FRESHUP", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="Fresh up"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   Early Check in
//                 </label>
//                 <input
//                   value={formSections[index]["EARLYCHECKIN"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "EARLYCHECKIN", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="Early Check in"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                   Late Check out
//                 </label>
//                 <input
//                   value={formSections[index]["LATECHECKOUT"]}
//                   onChange={(e) =>
//                     handlePriceChange(index, "LATECHECKOUT", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-full"
//                   placeholder="Late Check out"
//                 />
//               </div>
//             </div>
//             {/* <button
//               type="button"
//               onClick={() => handleRemoveSection(index)}
//               className="text-white bg-[#8570EE] hover:bg-[#7360d1] rounded-full w-8 h-8 flex items-center justify-center"
//             >
//               <Trash2 size={16} />
//             </button> */}
//             <div className="flex items-center gap-2 mt-2 md:mt-0">
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Commission %
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   max="100"
//                   value={formSections[index]["commission"] || ""}
//                   onChange={(e) =>
//                     handlePriceChange(index, "commission", e.target.value)
//                   }
//                   className="p-2 border border-gray-300 rounded shadow-sm w-24"
//                   placeholder="%"
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={() => handleRemoveSection(index)}
//                 className="text-white bg-[#8570EE] hover:bg-[#7360d1] rounded-full w-8 h-8 flex items-center justify-center mt-6"
//               >
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           </div>
//         ))}

//         <button
//           type="button"
//           onClick={handleAddSection}
//           className="text-white bg-[#8570EE] hover:bg-[#7360d1] rounded-full w-10 h-10 mb-4 flex items-center justify-center mx-auto shadow-md"
//         >
//           +
//         </button>

//         {/* Radio Buttons */}
//         <div className="flex justify-center items-center gap-4 mb-4">
//           <label>
//             <input
//               type="radio"
//               checked={isActive}
//               onChange={() => setIsActive(true)}
//             />{" "}
//             Active
//           </label>
//           <label>
//             <input
//               type="radio"
//               checked={!isActive}
//               onChange={() => setIsActive(false)}
//             />{" "}
//             Inactive
//           </label>
//         </div>

//         <button
//           type="submit"
//           className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
//         >
//           {isEditing ? "Update Accommodation" : "Create Accommodation"}
//         </button>
//       </form>

//       {/* Table Section */}
//       <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
//         <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
//           View Accommodation
//         </h5>
//         <p className="block mb-6 text-sm font-light text-gray-400">
//           View and Edit Accommodation
//         </p>

//         {/* Search Input */}
//         <div className="mb-4">
//           <input
//             type="text"
//             placeholder="Search by property name"
//             value={search}
//             onChange={(e) => {
//               setPage(1); // reset to first page on new search
//               setSearch(e.target.value);
//             }}
//             className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//           />
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
//             <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//               <tr>
//                 <th className="px-6 py-4">Sl No</th>
//                 <th className="px-6 py-4">Property Code</th>
//                 <th className="px-6 py-4">Property Name</th>
//                 <th className="px-6 py-4">EMAIL</th>
//                 <th className="px-6 py-4">DESTINATION</th>
//                 <th className="px-6 py-4">HOTEL CATEGORY</th>
//                 <th className="px-6 py-4">ROOM CATEGORY</th>
//                 <th className="px-6 py-4 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {accommodations.map((entry, index) => (
//                 <tr key={entry._id || index} className="border-b">
//                   <td className="px-6 py-4 font-semibold">
//                     {(page - 1) * 3 + index + 1}
//                   </td>
//                   <td className="px-6 py-4 font-semibold">
//                     {entry.accommodationCode}
//                   </td>
//                   <td className="px-6 py-4 font-semibold">
//                     {entry.propertyName}
//                   </td>
//                   <td className="px-6 py-4 font-semibold">{entry.email}</td>
//                   <td className="px-6 py-4 font-semibold">
//                     {entry.destination?.name || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 font-semibold">
//                     {entry.hotelCategory}
//                   </td>
//                   <td className="px-6 py-4 font-semibold">
//                     {entry.roomCategory}
//                   </td>
//                   <td className="px-6 py-4 text-center font-semibold">
//                     <button
//                       onClick={() => handleEdit(entry)}
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

//         {/* Pagination */}
//         <div className="flex justify-center mt-6 space-x-2">
//           <button
//             onClick={() => setPage((prev) => Math.max(1, prev - 1))}
//             disabled={page === 1}
//             className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
//           >
//             Previous
//           </button>
//           <span className="px-3 py-1">{page}</span>

//           <button
//             onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
//             disabled={page === totalPages}
//             className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAccomadation;
import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { Trash2, Pencil, X } from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

const CreateAccomadation = () => {
  const defaultSection = {
    validFrom: "",
    validTo: "",
    "2BEDEP": "",
    "2BEDCP": "",
    "2BEDMAP": "",
    "3BEDEP": "",
    "3BEDCP": "",
    "3BEDMAP": "",
    "4BEDEP": "",
    "4BEDCP": "",
    "4BEDMAP": "",
    EXTRABEDEP: "",
    EXTRABEDCP: "",
    EXTRABEDMAP: "",
    FRESHUP: "",
    EARLYCHECKIN: "",
    LATECHECKOUT: "",
  };

  const [formSections, setFormSections] = useState([]);
  const [isActive, setIsActive] = useState(true);

  // location + vendor lists
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vendors, setVendors] = useState([]);

  // selected IDs
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");

  // form fields
  const [formData, setFormData] = useState({
    propertyName: "",
    hotelCategory: "",
    ownerName: "",
    email: "",
    mobileNumber: "",
    whatsappNumber: "",
    roomCategory: "",
    address: "",
  });

  // table & edit
  const [accommodations, setAccommodations] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // ---- EXACT react-select styles ----
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        maxHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
      }),
      valueContainer: (b) => ({
        ...b,
        padding: "0 12px",
        overflowX: "auto",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
      }),
      input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
      dropdownIndicator: (b) => ({
        ...b,
        color: "#6b7280",
        ":hover": { color: "#4b5563" },
      }),
      menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 50 }),
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
      singleValue: (b) => ({ ...b, color: "#111827" }),
    }),
    []
  );

  // helpers to keep JSX tiny for react-selects
  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  const destinationOptions = destinations.map((d) => ({ value: d._id, label: d.name }));
  const vendorOptions = vendors.map((v) => ({ value: v._id, label: v.name }));
  const hotelOptions = [
    { value: "Standard", label: "Standard" },
    { value: "Deluxe", label: "Deluxe" },
  ];
  const roomOptions = [
    { value: "Standard", label: "Standard" },
    { value: "Deluxe", label: "Deluxe" },
  ];

  const fetchAccommodations = async () => {
    try {
      const res = await API.get(`/purchaser/accommodations?page=${page}&search=${search}`);
      setAccommodations(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Error fetching accommodations");
    }
  };
  useEffect(() => { fetchAccommodations(); }, [page, search]);

  const handleAddSection = () => setFormSections((prev) => [...prev, { ...defaultSection }]);
  const handleRemoveSection = (index) => {
    const updated = [...formSections];
    updated.splice(index, 1);
    setFormSections(updated);
  };
  const handlePriceChange = (index, field, value) => {
    const updatedSections = [...formSections];
    updatedSections[index][field] = value;
    setFormSections(updatedSections);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // load lists
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data);
      } catch (err) {
        toast.error("Error fetching countries");
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      if (isEditing) return;
      const run = async () => {
        try {
          const res = await API.get(`/purchaser/states/${selectedCountry}`);
          setStates(res.data);
        } catch (err) {
          toast.error("Error fetching states");
        }
      };
      run();
      setSelectedState("");
      setDestinations([]);
      setVendors([]);
      setSelectedVendor("");
    }
  }, [selectedCountry, isEditing]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      if (isEditing) return;
      const run = async () => {
        try {
          const res = await API.get(
            `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
          );
          setDestinations(res.data);
        } catch (err) {
          toast.error("Error fetching destinations");
        }
      };
      run();
      setSelectedDestination("");
      setVendors([]);
      setSelectedVendor("");
    }
  }, [selectedState, selectedCountry, isEditing]);

  useEffect(() => {
    if (selectedCountry && selectedState && selectedDestination) {
      if (isEditing) return;
      const run = async () => {
        try {
          const res = await API.get(
            `/purchaser/vendorsOfHotels/${selectedCountry}/${selectedState}/${selectedDestination}`
          );
          setVendors(res.data);
        } catch (err) {
          toast.error("Error fetching vendors");
        }
      };
      run();
      setSelectedVendor("");
    }
  }, [selectedDestination, selectedCountry, selectedState, isEditing]);

  const handleEdit = async (entry) => {
    setIsEditing(true);
    setEditId(entry._id);
    setIsActive(entry.status === "Active");

    const countryId = entry.country?._id || entry.country || "";
    const stateId = entry.state?._id || entry.state || "";
    const destinationId = entry.destination?._id || entry.destination || "";
    const vendorId = entry.vendor?._id || entry.vendor || "";

    setSelectedCountry(countryId);

    if (countryId) {
      try {
        const stateRes = await API.get(`/purchaser/states/${countryId}`);
        setStates(stateRes.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    }

    setSelectedState(stateId);

    if (countryId && stateId) {
      try {
        const destinationRes = await API.get(
          `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`
        );
        setDestinations(destinationRes.data);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    }

    setSelectedDestination(destinationId);

    if (countryId && stateId && destinationId) {
      try {
        const vendorRes = await API.get(
          `/purchaser/vendorsOfHotels/${countryId}/${stateId}/${destinationId}`
        );
        setVendors(vendorRes.data);
        const vendorExists = vendorRes.data.find((v) => v._id === vendorId);
        setSelectedVendor(vendorExists ? vendorId : "");
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    } else {
      setSelectedVendor("");
    }

    const formatDateForInput = (dateStr) => {
      const date = new Date(dateStr);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    setFormData({
      propertyName: entry.propertyName || "",
      hotelCategory: entry.hotelCategory || "",
      email: entry.email || "",
      ownerName: entry.ownerName || "",
      mobileNumber: entry.mobileNumber || "",
      whatsappNumber: entry.whatsappNumber || "",
      address: entry.address || "",
      roomCategory: entry.roomCategory || "",
    });

    setFormSections(
      entry.formSections?.map((section) => ({
        ...section,
        validFrom: formatDateForInput(section.validFrom),
        validTo: formatDateForInput(section.validTo),
      })) || []
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCountry) { toast.error("Country is required"); return; }
    if (!selectedState) { toast.error("State is required"); return; }
    if (!selectedDestination) { toast.error("Destination is required"); return; }
    if (!selectedVendor) { toast.error("Vendor is required"); return; }

    for (const field in formData) {
      if (!String(formData[field] || "").trim()) {
        toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
        return;
      }
    }

    for (let i = 0; i < formSections.length; i++) {
      const section = formSections[i];
      const from = new Date(section.validFrom);
      const to = new Date(section.validTo);
      if (!section.validFrom || !section.validTo) {
        toast.error(`Both validFrom and validTo are required in section ${i + 1}`);
        return;
      }
      if (to <= from) {
        toast.error(`validTo must be after validFrom in section ${i + 1}`);
        return;
      }
    }

    const ranges = formSections
      .map((section, index) => ({
        index,
        validFrom: new Date(section.validFrom),
        validTo: new Date(section.validTo),
      }))
      .sort((a, b) => a.validFrom - b.validFrom);

    for (let i = 1; i < ranges.length; i++) {
      const prev = ranges[i - 1];
      const current = ranges[i];
      if (current.validFrom <= prev.validTo) {
        toast.error(
          `Dates in section ${current.index + 1} overlaps with section ${prev.index + 1}.`
        );
        return;
      }
    }

    const numericFields = [
      "2BEDEP","2BEDCP","2BEDMAP","3BEDEP","3BEDCP","3BEDMAP","4BEDEP","4BEDCP","4BEDMAP",
      "EXTRABEDEP","EXTRABEDCP","EXTRABEDMAP","FRESHUP","EARLYCHECKIN","LATECHECKOUT",
    ];

    for (let i = 0; i < formSections.length; i++) {
      const section = formSections[i];
      for (const field of numericFields) {
        const value = section[field];
        if (value !== undefined && value !== "") {
          const num = Number(value);
          if (isNaN(num) || num < 0) {
            toast.error(`Field "${field}" in section ${i + 1} must be a positive number`);
            return;
          }
        }
      }
    }

    const payload = {
      ...formData,
      status: isActive ? "Active" : "Inactive",
      country: selectedCountry,
      state: selectedState,
      destination: selectedDestination,
      vendor: selectedVendor,
      formSections: formSections.map((section) => ({
        ...section,
        validFrom: new Date(section.validFrom),
        validTo: new Date(section.validTo),
        "2BEDEP": Number(section["2BEDEP"]),
        "2BEDCP": Number(section["2BEDCP"]),
        "2BEDMAP": Number(section["2BEDMAP"]),
        "3BEDEP": Number(section["3BEDEP"]),
        "3BEDCP": Number(section["3BEDCP"]),
        "3BEDMAP": Number(section["3BEDMAP"]),
        "4BEDEP": Number(section["4BEDEP"]),
        "4BEDCP": Number(section["4BEDCP"]),
        "4BEDMAP": Number(section["4BEDMAP"]),
        EXTRABEDEP: Number(section.EXTRABEDEP),
        EXTRABEDCP: Number(section.EXTRABEDCP),
        EXTRABEDMAP: Number(section.EXTRABEDMAP),
        FRESHUP: Number(section.FRESHUP),
        EARLYCHECKIN: Number(section.EARLYCHECKIN),
        LATECHECKOUT: Number(section.LATECHECKOUT),
      })),
    };

    try {
      const response = isEditing
        ? await API.put(`/purchaser/updateAccommodation/${editId}`, payload)
        : await API.post("/purchaser/createAccommodation", payload);

      toast.success(isEditing ? "Accommodation Updated!" : "Accommodation Created!");

      // reset to fresh create mode
      clearAllPrefill();
      setPage(1);
      fetchAccommodations();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          `Error ${isEditing ? "updating" : "creating"} accommodation`
      );
    }
  };

  // ---------- Clear prefill setup (like Trip/AddOnTrip) ----------
  const clearAllPrefill = () => {
    setIsEditing(false);
    setEditId(null);
    setIsActive(true);

    setFormData({
      propertyName: "",
      hotelCategory: "",
      ownerName: "",
      email: "",
      mobileNumber: "",
      whatsappNumber: "",
      roomCategory: "",
      address: "",
    });

    setFormSections([]);
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDestination("");
    setSelectedVendor("");
    setStates([]);
    setDestinations([]);
    setVendors([]);
  };
  // ---------------------------------------------------------------

  return (
    <div className="w-full max-w-[100rem] mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-xl space-y-12 mb-6">
      {/* Clear prefill button (only while editing) */}
      {isEditing && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={clearAllPrefill}
            title="Clear prefilled edit data"
            className="w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-50"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdowns — react-select with EXACT styles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
            <Select
              styles={selectStyles}
              options={countryOptions}
              placeholder="Select Country"
              value={countryOptions.find((o) => o.value === selectedCountry) || null}
              onChange={(opt) => setSelectedCountry(opt?.value || "")}
              isClearable
              isDisabled={!!isEditing}
              classNamePrefix="acc-country"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
            <Select
              styles={selectStyles}
              options={stateOptions}
              placeholder="Select State"
              value={stateOptions.find((o) => o.value === selectedState) || null}
              onChange={(opt) => setSelectedState(opt?.value || "")}
              isClearable
              isDisabled={!!isEditing || !selectedCountry}
              classNamePrefix="acc-state"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Destination</label>
            <Select
              styles={selectStyles}
              options={destinationOptions}
              placeholder="Select Destination"
              value={destinationOptions.find((o) => o.value === selectedDestination) || null}
              onChange={(opt) => setSelectedDestination(opt?.value || "")}
              isClearable
              isDisabled={!!isEditing || !selectedState}
              classNamePrefix="acc-destination"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Vendor</label>
            <Select
              styles={selectStyles}
              options={vendorOptions}
              placeholder="Select Vendor"
              value={vendorOptions.find((o) => o.value === selectedVendor) || null}
              onChange={(opt) => setSelectedVendor(opt?.value || "")}
              isClearable
              isDisabled={!!isEditing || !selectedDestination}
              classNamePrefix="acc-vendor"
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Property Name</label>
            <input
              className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
              placeholder="Property Name"
              name="propertyName"
              value={formData.propertyName}
              onChange={handleChange}
              disabled={!!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Hotel category</label>
            <Select
              styles={selectStyles}
              options={hotelOptions}
              placeholder="Hotel category"
              value={hotelOptions.find((o) => o.value === formData.hotelCategory) || null}
              onChange={(opt) =>
                setFormData((p) => ({ ...p, hotelCategory: opt?.value || "" }))
              }
              isClearable
              isDisabled={!!isEditing}
              classNamePrefix="acc-hotelcat"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Owner / Manager name</label>
            <input
              className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
              placeholder="Owner / Manager name"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              disabled={!!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Mobile Number</label>
            <input
              className="p-2 border border-gray-300 rounded shadow-sm w-full"
              placeholder="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp Number</label>
            <input
              className="p-2 border border-gray-300 rounded shadow-sm w-full"
              placeholder="WhatsApp Number"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Room category</label>
            <Select
              styles={selectStyles}
              options={roomOptions}
              placeholder="Room category"
              value={roomOptions.find((o) => o.value === formData.roomCategory) || null}
              onChange={(opt) =>
                setFormData((p) => ({ ...p, roomCategory: opt?.value || "" }))
              }
              isClearable
              isDisabled={!!isEditing}
              classNamePrefix="acc-roomcat"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
            <input
              className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
              placeholder="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!!isEditing}
            />
          </div>
        </div>

        {/* Sections */}
        {formSections.map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 p-4 mb-4 rounded-md shadow-md bg-white"
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Valid From</label>
                  <input
                    type="date"
                    value={formSections[index]["validFrom"]}
                    onChange={(e) => handlePriceChange(index, "validFrom", e.target.value)}
                    className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Valid To</label>
                  <input
                    type="date"
                    value={formSections[index]["validTo"]}
                    onChange={(e) => handlePriceChange(index, "validTo", e.target.value)}
                    className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">3 Bed EP</label>
                <input
                  value={formSections[index]["3BEDEP"]}
                  onChange={(e) => handlePriceChange(index, "3BEDEP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="3 Bed EP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">3 Bed CP</label>
                <input
                  value={formSections[index]["3BEDCP"]}
                  onChange={(e) => handlePriceChange(index, "3BEDCP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="3 Bed CP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">3 Bed MAP</label>
                <input
                  value={formSections[index]["3BEDMAP"]}
                  onChange={(e) => handlePriceChange(index, "3BEDMAP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="3 Bed MAP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Bed EP</label>
                <input
                  value={formSections[index]["EXTRABEDEP"]}
                  onChange={(e) => handlePriceChange(index, "EXTRABEDEP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="Extra Bed EP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Bed CP</label>
                <input
                  value={formSections[index]["EXTRABEDCP"]}
                  onChange={(e) => handlePriceChange(index, "EXTRABEDCP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="Extra Bed CP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Bed MAP</label>
                <input
                  value={formSections[index]["EXTRABEDMAP"]}
                  onChange={(e) => handlePriceChange(index, "EXTRABEDMAP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="Extra Bed MAP"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">2 Bed EP</label>
                <input
                  value={formSections[index]["2BEDEP"]}
                  onChange={(e) => handlePriceChange(index, "2BEDEP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="2 Bed EP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">2 Bed CP</label>
                <input
                  value={formSections[index]["2BEDCP"]}
                  onChange={(e) => handlePriceChange(index, "2BEDCP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="2 Bed CP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">2 Bed MAP</label>
                <input
                  value={formSections[index]["2BEDMAP"]}
                  onChange={(e) => handlePriceChange(index, "2BEDMAP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="2 Bed MAP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">4 Bed EP</label>
                <input
                  value={formSections[index]["4BEDEP"]}
                  onChange={(e) => handlePriceChange(index, "4BEDEP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="4 Bed EP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">4 Bed CP</label>
                <input
                  value={formSections[index]["4BEDCP"]}
                  onChange={(e) => handlePriceChange(index, "4BEDCP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="4 Bed CP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">4 Bed MAP</label>
                <input
                  value={formSections[index]["4BEDMAP"]}
                  onChange={(e) => handlePriceChange(index, "4BEDMAP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="4 Bed MAP"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Fresh up</label>
                <input
                  value={formSections[index]["FRESHUP"]}
                  onChange={(e) => handlePriceChange(index, "FRESHUP", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="Fresh up"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Early Check in</label>
                <input
                  value={formSections[index]["EARLYCHECKIN"]}
                  onChange={(e) => handlePriceChange(index, "EARLYCHECKIN", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="Early Check in"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Late Check out</label>
                <input
                  value={formSections[index]["LATECHECKOUT"]}
                  onChange={(e) => handlePriceChange(index, "LATECHECKOUT", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-full"
                  placeholder="Late Check out"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Commission %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formSections[index]["commission"] || ""}
                  onChange={(e) => handlePriceChange(index, "commission", e.target.value)}
                  className="p-2 border border-gray-300 rounded shadow-sm w-24"
                  placeholder="%"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSection(index)}
                className="text-white bg-[#8570EE] hover:bg-[#7360d1] rounded-full w-8 h-8 flex items-center justify-center mt-6"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddSection}
          className="text-white bg-[#8570EE] hover:bg-[#7360d1] rounded-full w-10 h-10 mb-4 flex items-center justify-center mx-auto shadow-md"
        >
          +
        </button>

        {/* Radio Buttons */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <label>
            <input type="radio" checked={isActive} onChange={() => setIsActive(true)} /> Active
          </label>
          <label>
            <input type="radio" checked={!isActive} onChange={() => setIsActive(false)} /> Inactive
          </label>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
        >
          {isEditing ? "Update Accommodation" : "Create Accommodation"}
        </button>
      </form>

      {/* Table Section */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">View Accommodation</h5>
        <p className="block mb-6 text-sm font-light text-gray-400">
          View and Edit Accommodation
        </p>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by property name"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Sl No</th>
                <th className="px-6 py-4">Property Code</th>
                <th className="px-6 py-4">Property Name</th>
                <th className="px-6 py-4">EMAIL</th>
                <th className="px-6 py-4">DESTINATION</th>
                <th className="px-6 py-4">HOTEL CATEGORY</th>
                <th className="px-6 py-4">ROOM CATEGORY</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {accommodations.map((entry, index) => (
                <tr key={entry._id || index} className="border-b">
                  <td className="px-6 py-4 font-semibold">{(page - 1) * 3 + index + 1}</td>
                  <td className="px-6 py-4 font-semibold">{entry.accommodationCode}</td>
                  <td className="px-6 py-4 font-semibold">{entry.propertyName}</td>
                  <td className="px-6 py-4 font-semibold">{entry.email}</td>
                  <td className="px-6 py-4 font-semibold">{entry.destination?.name || "N/A"}</td>
                  <td className="px-6 py-4 font-semibold">{entry.hotelCategory}</td>
                  <td className="px-6 py-4 font-semibold">{entry.roomCategory}</td>
                  <td className="px-6 py-4 text-center font-semibold">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-gray-700 hover:text-gray-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Previous
          </button>
          <span className="px-3 py-1">{page}</span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccomadation;

