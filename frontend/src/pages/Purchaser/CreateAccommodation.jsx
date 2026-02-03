

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import Select from "react-select";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Trash2,
//   Pencil,
//   X,
//   Sparkles,
//   Search,
//   Hotel,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Image as ImageIcon,
// } from "lucide-react";
// import API from "../../api";
// import { toast } from "react-toastify";
// import uploadImageToCloudinary from "../../utils/uploadCloudinary";

// const CreateAccomadation = () => {
//   const THEME = "#8570EE";

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

//   const [formSections, setFormSections] = useState([]);
//   const [isActive, setIsActive] = useState(true);

//   // location + vendor lists
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);
//   const [vendors, setVendors] = useState([]);

//   // selected IDs
//   const [selectedCountry, setSelectedCountry] = useState("");
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDestination, setSelectedDestination] = useState("");
//   const [selectedVendor, setSelectedVendor] = useState("");

//   // form fields
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

//   // ✅ 3 images (same pattern as vehicle)
//   const [image1, setImage1] = useState(null);
//   const [image2, setImage2] = useState(null);
//   const [image3, setImage3] = useState(null);

//   const [imageUrl, setImageUrl] = useState("");
//   const [secondImageUrl, setSecondImageUrl] = useState("");
//   const [thirdImageUrl, setThirdImageUrl] = useState("");

//   const fileInputRef1 = useRef(null);
//   const fileInputRef2 = useRef(null);
//   const fileInputRef3 = useRef(null);

//   // table & edit
//   const [accommodations, setAccommodations] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);

//   // ✅ UI-only pagination animation direction (like other components)
//   const [pageDir, setPageDir] = useState(1);

//   /* --------------------------------------------
//     ✅ Premium react-select dropdown + no clipping
//   --------------------------------------------- */
//   const selectStyles = useMemo(
//     () => ({
//       container: (b) => ({ ...b, width: "100%" }),
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 14,
//         borderColor: state.isFocused ? THEME : "#e5e7eb",
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         maxHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? THEME : "#d1d5db" },
//         overflow: "hidden",
//       }),
//       valueContainer: (b) => ({
//         ...b,
//         padding: "0 12px",
//         overflow: "hidden",
//         whiteSpace: "nowrap",
//         minWidth: 0,
//       }),
//       singleValue: (b) => ({
//         ...b,
//         color: "#111827",
//         overflow: "hidden",
//         textOverflow: "ellipsis",
//         whiteSpace: "nowrap",
//         maxWidth: "100%",
//       }),
//       input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827", minWidth: 2 }),
//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
//       dropdownIndicator: (b) => ({
//         ...b,
//         color: "#6b7280",
//         ":hover": { color: "#4b5563" },
//       }),
//       menuPortal: (b) => ({ ...b, zIndex: 99999 }),
//       menu: (b) => ({ ...b, borderRadius: 14, overflow: "hidden", zIndex: 99999 }),
//       menuList: (b) => ({ ...b, maxHeight: 260, overflowY: "auto" }),
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
//     }),
//     [THEME]
//   );

//   // helpers to keep JSX tiny for react-selects
//   const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
//   const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
//   const destinationOptions = destinations.map((d) => ({
//     value: d._id,
//     label: d.activeStatus ? d.name : `${d.name} (inactive)`,
//   }));
//   const vendorOptions = vendors.map((v) => ({
//     value: v._id,
//     label: v.activeStatus ? v.name : `${v.name} (inactive)`,
//   }));

//   const hotelOptions = [
//     { value: "Standard", label: "Standard" },
//     { value: "Deluxe", label: "Deluxe" },
//   ];
//   const roomOptions = [
//     { value: "Standard", label: "Standard" },
//     { value: "Deluxe", label: "Deluxe" },
//   ];

//   const fetchAccommodations = async () => {
//     try {
//       const res = await API.get(`/purchaser/accommodations?page=${page}&search=${search}`);
//       setAccommodations(res.data.data);
//       setTotalPages(res.data.totalPages);
//     } catch (err) {
//       toast.error("Error fetching accommodations");
//     }
//   };
//   useEffect(() => {
//     fetchAccommodations();
//   }, [page, search]);

//   const handleAddSection = () => setFormSections((prev) => [...prev, { ...defaultSection }]);
//   const handleRemoveSection = (index) => {
//     const updated = [...formSections];
//     updated.splice(index, 1);
//     setFormSections(updated);
//   };
//   const handlePriceChange = (index, field, value) => {
//     const updatedSections = [...formSections];
//     updatedSections[index][field] = value;
//     setFormSections(updatedSections);
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   // ✅ helper: upload and set URL without changing UX
//   const uploadAndSet = async ({ file, setFile, setUrl }) => {
//     if (!file) return;
//     try {
//       const result = await uploadImageToCloudinary(file);
//       setFile(file);
//       setUrl(result.secure_url);
//       toast.success("Image uploaded");
//     } catch (err) {
//       console.error("Upload failed", err);
//       toast.error("Upload failed");
//     }
//   };

//   // ✅ reusable image tile (perfect cover)
//   const ImageSlot = ({ title, url, onPick, onClear, inputRef, inputId }) => (
//     <div className="flex flex-col items-center gap-2">
//       <label
//         htmlFor={inputId}
//         className="
//           relative group
//           h-24 w-32 sm:h-28 sm:w-36 rounded-2xl
//           border border-dashed border-slate-300
//           bg-white/90 hover:bg-white
//           shadow-sm hover:shadow-md transition
//           flex items-center justify-center
//           cursor-pointer overflow-hidden
//         "
//         title={url ? `Change ${title}` : `Upload ${title}`}
//       >
//         {url ? (
//           <img
//             src={url}
//             alt={title}
//             className="absolute inset-0 w-full h-full object-cover block"
//           />
//         ) : (
//           <Plus className="w-5 h-5 text-slate-500" />
//         )}

//         {!url && (
//           <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
//             Upload
//           </div>
//         )}
//       </label>

//       <input
//         id={inputId}
//         type="file"
//         accept="image/*"
//         ref={inputRef}
//         className="hidden"
//         onChange={onPick}
//       />

//       <button
//         type="button"
//         onClick={onClear}
//         className="
//           h-9 w-full rounded-2xl
//           border border-red-200
//           bg-red-50 text-red-700
//           hover:bg-red-100 transition
//           text-sm font-semibold
//         "
//       >
//         X
//       </button>
//     </div>
//   );

//   // load lists
//   useEffect(() => {
//     const fetchCountries = async () => {
//       try {
//         const res = await API.get("/purchaser/countries");
//         setCountries(res.data);
//       } catch (err) {
//         toast.error("Error fetching countries");
//       }
//     };
//     fetchCountries();
//   }, []);

//   useEffect(() => {
//     if (selectedCountry) {
//       if (isEditing) return;
//       const run = async () => {
//         try {
//           const res = await API.get(`/purchaser/states/${selectedCountry}`);
//           setStates(res.data);
//         } catch (err) {
//           toast.error("Error fetching states");
//         }
//       };
//       run();
//       setSelectedState("");
//       setDestinations([]);
//       setVendors([]);
//       setSelectedVendor("");
//     }
//   }, [selectedCountry, isEditing]);

//   useEffect(() => {
//     if (selectedCountry && selectedState) {
//       if (isEditing) return;
//       const run = async () => {
//         try {
//           const res = await API.get(
//             `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
//           );
//           setDestinations(res.data);
//         } catch (err) {
//           toast.error("Error fetching destinations");
//         }
//       };
//       run();
//       setSelectedDestination("");
//       setVendors([]);
//       setSelectedVendor("");
//     }
//   }, [selectedState, selectedCountry, isEditing]);

//   useEffect(() => {
//     if (selectedCountry && selectedState && selectedDestination) {
//       if (isEditing) return;
//       const run = async () => {
//         try {
//           const res = await API.get(
//             `/purchaser/vendorsOfHotels/${selectedCountry}/${selectedState}/${selectedDestination}`
//           );
//           setVendors(res.data);
//         } catch (err) {
//           toast.error("Error fetching vendors");
//         }
//       };
//       run();
//       setSelectedVendor("");
//     }
//   }, [selectedDestination, selectedCountry, selectedState, isEditing]);

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
//           `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`,
//           { params: { currentDestinationId: destinationId || undefined } }
//         );
//         setDestinations(destinationRes.data || []);
//       } catch (error) {
//         console.error("Error fetching destinations:", error);
//       }
//     }

//     setSelectedDestination(destinationId);

//     if (countryId && stateId && destinationId) {
//       try {
//         const vendorRes = await API.get(
//           `/purchaser/vendorsOfHotels/${countryId}/${stateId}/${destinationId}`,
//           { params: { currentVendorId: vendorId || undefined } }
//         );
//         setVendors(vendorRes.data || []);

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

//     // ✅ prefill images
//     setImageUrl(entry.imageUrl || "");
//     setSecondImageUrl(entry.secondImageUrl || "");
//     setThirdImageUrl(entry.thirdImageUrl || "");
//     setImage1(null);
//     setImage2(null);
//     setImage3(null);

//     if (fileInputRef1.current) fileInputRef1.current.value = "";
//     if (fileInputRef2.current) fileInputRef2.current.value = "";
//     if (fileInputRef3.current) fileInputRef3.current.value = "";

//     window.scrollTo({ top: 0, behavior: "smooth" });
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
//       if (!String(formData[field] || "").trim()) {
//         toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
//         return;
//       }
//     }

//     for (let i = 0; i < formSections.length; i++) {
//       const section = formSections[i];
//       const from = new Date(section.validFrom);
//       const to = new Date(section.validTo);
//       if (!section.validFrom || !section.validTo) {
//         toast.error(`Both validFrom and validTo are required in section ${i + 1}`);
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

//     for (let i = 1; i < ranges.length; i++) {
//       const prev = ranges[i - 1];
//       const current = ranges[i];
//       if (current.validFrom <= prev.validTo) {
//         toast.error(`Dates in section ${current.index + 1} overlaps with section ${prev.index + 1}.`);
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
//             toast.error(`Field "${field}" in section ${i + 1} must be a positive number`);
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

//       // ✅ images
//       imageUrl,
//       secondImageUrl,
//       thirdImageUrl,

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
//       await (isEditing
//         ? API.put(`/purchaser/updateAccommodation/${editId}`, payload)
//         : API.post("/purchaser/createAccommodation", payload));

//       toast.success(isEditing ? "Accommodation Updated!" : "Accommodation Created!");

//       clearAllPrefill();
//       setPageDir(1);
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

//   // ---------- Clear prefill setup ----------
//   const clearAllPrefill = () => {
//     setIsEditing(false);
//     setEditId(null);
//     setIsActive(true);

//     setFormData({
//       propertyName: "",
//       hotelCategory: "",
//       ownerName: "",
//       email: "",
//       mobileNumber: "",
//       whatsappNumber: "",
//       roomCategory: "",
//       address: "",
//     });

//     setFormSections([]);
//     setSelectedCountry("");
//     setSelectedState("");
//     setSelectedDestination("");
//     setSelectedVendor("");
//     setStates([]);
//     setDestinations([]);
//     setVendors([]);

//     // ✅ clear images
//     setImageUrl("");
//     setSecondImageUrl("");
//     setThirdImageUrl("");
//     setImage1(null);
//     setImage2(null);
//     setImage3(null);

//     if (fileInputRef1.current) fileInputRef1.current.value = "";
//     if (fileInputRef2.current) fileInputRef2.current.value = "";
//     if (fileInputRef3.current) fileInputRef3.current.value = "";
//   };
//   // ----------------------------------------

//   // ✅ Same premium transition as other JSXes (UI-only)
//   const tableVariants = {
//     enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
//     center: { x: 0, opacity: 1, filter: "blur(0px)" },
//     exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
//   };

//   return (
//     <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
//       <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
//         <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }} />

//         <div className="p-6 md:p-8 space-y-7">
//           {/* Header */}
//           <div className="flex items-start justify-between gap-3 flex-wrap">
//             <div className="min-w-0">
//               <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
//                 <Sparkles size={14} style={{ color: THEME }} />
//                 Purchaser
//               </div>
//               <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
//                 Create Accommodation
//               </div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Create / update accommodation, validity slabs & price matrix.
//               </div>
//             </div>

//             <div
//               className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
//               style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
//             >
//               <Hotel size={20} />
//             </div>
//           </div>

//           {/* FORM CARD */}
//           <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//             <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//               <div>
//                 <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
//                 <div className="mt-1 text-lg font-extrabold text-slate-900">
//                   {isEditing ? "Edit accommodation" : "Add new accommodation"}
//                 </div>
//                 <div className="mt-1 text-sm text-slate-500">
//                   Select location, vendor, fill details and add validity sections.
//                 </div>
//               </div>

//               {isEditing && (
//                 <button
//                   type="button"
//                   onClick={clearAllPrefill}
//                   title="Clear prefilled edit data"
//                   className="
//                     inline-flex items-center justify-center
//                     w-9 h-9 rounded-2xl
//                     bg-white/70 backdrop-blur-md
//                     border border-slate-200
//                     shadow hover:bg-white transition
//                     text-slate-700
//                   "
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               )}
//             </div>

//             <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/40">
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Dropdowns */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                       Country
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={countryOptions}
//                       placeholder="Select Country"
//                       value={countryOptions.find((o) => o.value === selectedCountry) || null}
//                       onChange={(opt) => setSelectedCountry(opt?.value || "")}
//                       menuPortalTarget={document.body}
//                       isClearable
//                       isDisabled={!!isEditing}
//                       classNamePrefix="acc-country"
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                       State
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={stateOptions}
//                       placeholder="Select State"
//                       value={stateOptions.find((o) => o.value === selectedState) || null}
//                       onChange={(opt) => setSelectedState(opt?.value || "")}
//                       menuPortalTarget={document.body}
//                       isClearable
//                       isDisabled={!!isEditing || !selectedCountry}
//                       classNamePrefix="acc-state"
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                       Destination
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={destinationOptions}
//                       placeholder="Select Destination"
//                       value={destinationOptions.find((o) => o.value === selectedDestination) || null}
//                       onChange={(opt) => setSelectedDestination(opt?.value || "")}
//                       menuPortalTarget={document.body}
//                       isClearable
//                       isDisabled={!!isEditing || !selectedState}
//                       classNamePrefix="acc-destination"
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                       Vendor
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={vendorOptions}
//                       placeholder="Select Vendor"
//                       value={vendorOptions.find((o) => o.value === selectedVendor) || null}
//                       onChange={(opt) => setSelectedVendor(opt?.value || "")}
//                       menuPortalTarget={document.body}
//                       isClearable
//                       isDisabled={!!isEditing || !selectedDestination}
//                       classNamePrefix="acc-vendor"
//                     />
//                   </div>
//                 </div>

//                 {/* Property details */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Field
//                     label="Property Name"
//                     name="propertyName"
//                     value={formData.propertyName}
//                     onChange={handleChange}
//                     placeholder="Property Name"
//                     disabled={!!isEditing}
//                     theme={THEME}
//                   />

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                       Hotel category
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={hotelOptions}
//                       placeholder="Hotel category"
//                       value={hotelOptions.find((o) => o.value === formData.hotelCategory) || null}
//                       onChange={(opt) => setFormData((p) => ({ ...p, hotelCategory: opt?.value || "" }))}
//                       menuPortalTarget={document.body}
//                       isClearable
//                       isDisabled={!!isEditing}
//                       classNamePrefix="acc-hotelcat"
//                     />
//                   </div>

//                   <Field
//                     label="Owner / Manager name"
//                     name="ownerName"
//                     value={formData.ownerName}
//                     onChange={handleChange}
//                     placeholder="Owner / Manager name"
//                     disabled={!!isEditing}
//                     theme={THEME}
//                   />

//                   <Field
//                     label="Email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Email"
//                     disabled={!!isEditing}
//                     theme={THEME}
//                   />

//                   <Field
//                     label="Mobile Number"
//                     name="mobileNumber"
//                     value={formData.mobileNumber}
//                     onChange={handleChange}
//                     placeholder="Mobile Number"
//                     disabled={false}
//                     theme={THEME}
//                   />

//                   <Field
//                     label="WhatsApp Number"
//                     name="whatsappNumber"
//                     value={formData.whatsappNumber}
//                     onChange={handleChange}
//                     placeholder="WhatsApp Number"
//                     disabled={false}
//                     theme={THEME}
//                   />

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                       Room category
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={roomOptions}
//                       placeholder="Room category"
//                       value={roomOptions.find((o) => o.value === formData.roomCategory) || null}
//                       onChange={(opt) => setFormData((p) => ({ ...p, roomCategory: opt?.value || "" }))}
//                       menuPortalTarget={document.body}
//                       isClearable
//                       isDisabled={!!isEditing}
//                       classNamePrefix="acc-roomcat"
//                     />
//                   </div>

//                   <Field
//                     label="Address"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     placeholder="Address"
//                     disabled={!!isEditing}
//                     theme={THEME}
//                   />
//                 </div>

//                 {/* ✅ Images row (3 uploads + clear each) */}
//                 <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
//                   <div className="flex flex-col gap-4">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner"
//                         style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
//                       >
//                         <ImageIcon size={18} />
//                       </div>
//                       <div>
//                         <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
//                           Accommodation images
//                         </div>
//                         <div className="text-sm font-semibold text-slate-800">
//                           Upload optional (3 images supported, each has clear)
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between flex-wrap">
//                       <ImageSlot
//                         title="Image 1"
//                         url={imageUrl}
//                         inputId="acc-image-upload-1"
//                         inputRef={fileInputRef1}
//                         onPick={async (e) => {
//                           const file = e.target.files?.[0];
//                           if (!file) return;
//                           await uploadAndSet({ file, setFile: setImage1, setUrl: setImageUrl });
//                         }}
//                         onClear={() => {
//                           setImage1(null);
//                           setImageUrl("");
//                           if (fileInputRef1.current) fileInputRef1.current.value = "";
//                         }}
//                       />

//                       <ImageSlot
//                         title="Image 2"
//                         url={secondImageUrl}
//                         inputId="acc-image-upload-2"
//                         inputRef={fileInputRef2}
//                         onPick={async (e) => {
//                           const file = e.target.files?.[0];
//                           if (!file) return;
//                           await uploadAndSet({ file, setFile: setImage2, setUrl: setSecondImageUrl });
//                         }}
//                         onClear={() => {
//                           setImage2(null);
//                           setSecondImageUrl("");
//                           if (fileInputRef2.current) fileInputRef2.current.value = "";
//                         }}
//                       />

//                       <ImageSlot
//                         title="Image 3"
//                         url={thirdImageUrl}
//                         inputId="acc-image-upload-3"
//                         inputRef={fileInputRef3}
//                         onPick={async (e) => {
//                           const file = e.target.files?.[0];
//                           if (!file) return;
//                           await uploadAndSet({ file, setFile: setImage3, setUrl: setThirdImageUrl });
//                         }}
//                         onClear={() => {
//                           setImage3(null);
//                           setThirdImageUrl("");
//                           if (fileInputRef3.current) fileInputRef3.current.value = "";
//                         }}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Sections */}
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between gap-3 flex-wrap">
//                     <div>
//                       <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Sections</div>
//                       <div className="mt-1 text-sm text-slate-600">
//                         Add validity slabs and prices. (No overlap allowed)
//                       </div>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={handleAddSection}
//                       className="
//                         inline-flex items-center gap-2
//                         rounded-2xl
//                         px-4 py-2
//                         text-sm font-extrabold
//                         text-white
//                         shadow-[0_16px_40px_rgba(133,112,238,0.25)]
//                         hover:opacity-95
//                         transition
//                       "
//                       style={{ background: THEME }}
//                     >
//                       + Add Section
//                     </button>
//                   </div>

//                   {formSections.length === 0 && (
//                     <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-slate-600 text-sm">
//                       No sections added yet. Click <span className="font-bold">Add Section</span> to begin.
//                     </div>
//                   )}

//                   {formSections.map((_, index) => (
//                     <div
//                       key={index}
//                       className="rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] overflow-hidden"
//                     >
//                       <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
//                         <div className="min-w-0">
//                           <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
//                             Section {index + 1}
//                           </div>
//                           <div className="mt-1 text-sm font-bold text-slate-900">
//                             Validity & Price Matrix
//                           </div>
//                         </div>

//                         <button
//                           type="button"
//                           onClick={() => handleRemoveSection(index)}
//                           className="
//                             inline-flex items-center justify-center
//                             h-10 w-10 rounded-2xl
//                             border border-slate-200
//                             bg-white hover:bg-slate-50
//                             shadow-sm hover:shadow-md transition
//                             text-slate-700
//                           "
//                           title="Remove section"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>

//                       <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/30">
//                         {/* Validity + Commission */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                           <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <MiniDate
//                               label="Valid From"
//                               value={formSections[index]["validFrom"]}
//                               onChange={(v) => handlePriceChange(index, "validFrom", v)}
//                               theme={THEME}
//                             />
//                             <MiniDate
//                               label="Valid To"
//                               value={formSections[index]["validTo"]}
//                               onChange={(v) => handlePriceChange(index, "validTo", v)}
//                               theme={THEME}
//                             />
//                           </div>

//                           <MiniField
//                             label="Commission %"
//                             value={formSections[index]["commission"] || ""}
//                             onChange={(v) => handlePriceChange(index, "commission", v)}
//                             theme={THEME}
//                             placeholder="%"
//                             type="number"
//                           />
//                         </div>

//                         {/* Prices grids */}
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//                           <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
//                             <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">
//                               3 Bed + Extra Bed
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                               <MiniField label="3 Bed EP" value={formSections[index]["3BEDEP"]} onChange={(v) => handlePriceChange(index, "3BEDEP", v)} theme={THEME} />
//                               <MiniField label="3 Bed CP" value={formSections[index]["3BEDCP"]} onChange={(v) => handlePriceChange(index, "3BEDCP", v)} theme={THEME} />
//                               <MiniField label="3 Bed MAP" value={formSections[index]["3BEDMAP"]} onChange={(v) => handlePriceChange(index, "3BEDMAP", v)} theme={THEME} />
//                               <MiniField label="Extra Bed EP" value={formSections[index]["EXTRABEDEP"]} onChange={(v) => handlePriceChange(index, "EXTRABEDEP", v)} theme={THEME} />
//                               <MiniField label="Extra Bed CP" value={formSections[index]["EXTRABEDCP"]} onChange={(v) => handlePriceChange(index, "EXTRABEDCP", v)} theme={THEME} />
//                               <MiniField label="Extra Bed MAP" value={formSections[index]["EXTRABEDMAP"]} onChange={(v) => handlePriceChange(index, "EXTRABEDMAP", v)} theme={THEME} />
//                             </div>
//                           </div>

//                           <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
//                             <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">
//                               2 Bed + 4 Bed + Others
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                               <MiniField label="2 Bed EP" value={formSections[index]["2BEDEP"]} onChange={(v) => handlePriceChange(index, "2BEDEP", v)} theme={THEME} />
//                               <MiniField label="2 Bed CP" value={formSections[index]["2BEDCP"]} onChange={(v) => handlePriceChange(index, "2BEDCP", v)} theme={THEME} />
//                               <MiniField label="2 Bed MAP" value={formSections[index]["2BEDMAP"]} onChange={(v) => handlePriceChange(index, "2BEDMAP", v)} theme={THEME} />
//                               <MiniField label="4 Bed EP" value={formSections[index]["4BEDEP"]} onChange={(v) => handlePriceChange(index, "4BEDEP", v)} theme={THEME} />
//                               <MiniField label="4 Bed CP" value={formSections[index]["4BEDCP"]} onChange={(v) => handlePriceChange(index, "4BEDCP", v)} theme={THEME} />
//                               <MiniField label="4 Bed MAP" value={formSections[index]["4BEDMAP"]} onChange={(v) => handlePriceChange(index, "4BEDMAP", v)} theme={THEME} />
//                               <MiniField label="Fresh up" value={formSections[index]["FRESHUP"]} onChange={(v) => handlePriceChange(index, "FRESHUP", v)} theme={THEME} />
//                               <MiniField label="Early Check in" value={formSections[index]["EARLYCHECKIN"]} onChange={(v) => handlePriceChange(index, "EARLYCHECKIN", v)} theme={THEME} />
//                               <MiniField label="Late Check out" value={formSections[index]["LATECHECKOUT"]} onChange={(v) => handlePriceChange(index, "LATECHECKOUT", v)} theme={THEME} />
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Status */}
//                 <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">Status</div>

//                   <div className="flex items-center justify-center gap-3 flex-wrap">
//                     <label
//                       className={[
//                         "cursor-pointer rounded-2xl border px-4 py-2.5",
//                         "inline-flex items-center gap-2 text-sm font-semibold",
//                         isActive
//                           ? "bg-[#8570EE]/10 border-[#8570EE]/40 text-slate-900"
//                           : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
//                       ].join(" ")}
//                     >
//                       <input
//                         type="radio"
//                         checked={isActive}
//                         onChange={() => setIsActive(true)}
//                         className="accent-[#8570EE]"
//                       />
//                       Active
//                     </label>

//                     <label
//                       className={[
//                         "cursor-pointer rounded-2xl border px-4 py-2.5",
//                         "inline-flex items-center gap-2 text-sm font-semibold",
//                         !isActive
//                           ? "bg-[#8570EE]/10 border-[#8570EE]/40 text-slate-900"
//                           : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
//                       ].join(" ")}
//                     >
//                       <input
//                         type="radio"
//                         checked={!isActive}
//                         onChange={() => setIsActive(false)}
//                         className="accent-[#8570EE]"
//                       />
//                       Inactive
//                     </label>
//                   </div>
//                 </div>

//                 {/* Submit */}
//                 <button
//                   type="submit"
//                   className="
//                     w-full
//                     rounded-2xl
//                     px-5 py-3.5
//                     text-sm font-extrabold
//                     text-white
//                     shadow-[0_16px_40px_rgba(133,112,238,0.35)]
//                     hover:opacity-95
//                     active:scale-[0.99]
//                     transition
//                   "
//                   style={{ background: THEME }}
//                 >
//                   {isEditing ? "Update Accommodation" : "Create Accommodation"}
//                 </button>
//               </form>
//             </div>
//           </div>

//           {/* TABLE CARD */}
//           <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//             <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//               <div>
//                 <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
//                 <div className="mt-1 text-lg font-extrabold text-slate-900">Accommodation</div>
//                 <div className="mt-1 text-sm text-slate-500">Search and edit accommodation</div>
//               </div>

//               <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[320px]">
//                 <Search className="h-4 w-4 text-slate-500" />
//                 <input
//                   type="text"
//                   placeholder="Search by property name"
//                   value={search}
//                   onChange={(e) => {
//                     setPageDir(1);
//                     setPage(1);
//                     setSearch(e.target.value);
//                   }}
//                   className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
//                 />
//               </div>
//             </div>

//             <div className="relative overflow-hidden">
//               <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                 <AnimatePresence mode="wait" custom={pageDir}>
//                   <motion.div
//                     key={`accommodation-page-${page}-${search}`}
//                     custom={pageDir}
//                     variants={tableVariants}
//                     initial="enter"
//                     animate="center"
//                     exit="exit"
//                     transition={{ duration: 0.22, ease: "easeOut" }}
//                     className="w-full"
//                     style={{ overflow: "visible" }}
//                   >
//                     <table className="w-full text-sm text-left text-slate-700 min-w-[980px]">
//                       <thead>
//                         <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
//                           <th className="px-5 py-3">Sl No</th>
//                           <th className="px-5 py-3">Property Code</th>
//                           <th className="px-5 py-3">Property Name</th>
//                           <th className="px-5 py-3">Email</th>
//                           <th className="px-5 py-3">Destination</th>
//                           <th className="px-5 py-3">Hotel Category</th>
//                           <th className="px-5 py-3">Room Category</th>
//                           <th className="px-5 py-3 text-center">Action</th>
//                         </tr>
//                       </thead>

//                       <tbody>
//                         {accommodations.map((entry, index) => (
//                           <tr
//                             key={entry._id || index}
//                             className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
//                           >
//                             <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
//                             <td className="px-5 py-3 font-semibold">{entry.accommodationCode}</td>
//                             <td className="px-5 py-3 font-semibold">{entry.propertyName}</td>
//                             <td className="px-5 py-3 font-semibold">{entry.email}</td>
//                             <td className="px-5 py-3 font-semibold">{entry.destination?.name || "N/A"}</td>
//                             <td className="px-5 py-3 font-semibold">{entry.hotelCategory}</td>
//                             <td className="px-5 py-3 font-semibold">{entry.roomCategory}</td>
//                             <td className="px-5 py-3 text-center">
//                               <button
//                                 type="button"
//                                 onClick={() => handleEdit(entry)}
//                                 className="
//                                   inline-flex items-center justify-center
//                                   h-9 w-9 rounded-2xl
//                                   border border-slate-200
//                                   bg-white/80 hover:bg-white
//                                   shadow-sm hover:shadow-md transition
//                                   text-slate-700
//                                 "
//                                 title="Edit accommodation"
//                               >
//                                 <Pencil className="w-4 h-4" />
//                               </button>
//                             </td>
//                           </tr>
//                         ))}

//                         {accommodations.length === 0 && (
//                           <tr>
//                             <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
//                               No accommodation found.
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </motion.div>
//                 </AnimatePresence>
//               </div>
//             </div>

//             <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
//               <button
//                 onClick={() => {
//                   setPageDir(-1);
//                   setPage((prev) => Math.max(1, prev - 1));
//                 }}
//                 disabled={page === 1}
//                 className="
//                   inline-flex items-center gap-2
//                   px-3 py-2 rounded-xl border text-sm
//                   bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200
//                   disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
//                 "
//               >
//                 <ChevronLeft size={16} />
//                 Previous
//               </button>

//               <span className="px-4 py-2 rounded-xl bg-[#8570EE]/10 text-[#8570EE] font-bold border border-[#8570EE]/25">
//                 {page} / {totalPages}
//               </span>

//               <button
//                 onClick={() => {
//                   setPageDir(1);
//                   setPage((prev) => Math.min(totalPages, prev + 1));
//                 }}
//                 disabled={page === totalPages}
//                 className="
//                   inline-flex items-center gap-2
//                   px-3 py-2 rounded-xl border text-sm
//                   bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200
//                   disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
//                 "
//               >
//                 Next
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAccomadation;

// /* -----------------------------
//   UI helpers (STYLE ONLY)
// ------------------------------ */
// function Field({ label, name, value, onChange, placeholder, disabled, theme, type = "text" }) {
//   return (
//     <div>
//       <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">{label}</div>
//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         disabled={disabled}
//         className="
//           w-full
//           rounded-2xl
//           border border-slate-300
//           bg-white/90
//           px-4 py-3
//           text-sm
//           outline-none
//           shadow-sm
//           focus:ring-2
//           transition
//           disabled:bg-white
//           disabled:cursor-not-allowed
//         "
//         style={{ "--tw-ring-color": theme }}
//       />
//     </div>
//   );
// }

// function MiniField({ label, value, onChange, placeholder, theme, type = "text" }) {
//   return (
//     <div>
//       <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">{label}</div>
//       <input
//         type={type}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="
//           w-full
//           rounded-2xl
//           border border-slate-300
//           bg-white/90
//           px-4 py-3
//           text-sm
//           outline-none
//           focus:ring-2
//         "
//         style={{ "--tw-ring-color": theme }}
//         placeholder={placeholder}
//       />
//     </div>
//   );
// }

// function MiniDate({ label, value, onChange, theme }) {
//   return (
//     <div>
//       <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">{label}</div>
//       <input
//         type="date"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2"
//         style={{ "--tw-ring-color": theme }}
//       />
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo, useRef } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Pencil,
  X,
  Sparkles,
  Search,
  Hotel,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  MapPin,
  Mail,
  User,
  Phone,
  MessageCircle,
  BedDouble,
  BadgePercent,
  CalendarClock,
  Building2,
  Globe2,
  Flag,
  Compass,
  Store,
  Hash,
} from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const CreateAccomadation = () => {
  const THEME = "#8570EE";

  const defaultSection = {
    validFrom: "",
    validTo: "",
    commission: "",
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
    advancePercentage: "",
  });

  // ✅ status NOT in form (kept internally)
  const [statusValue, setStatusValue] = useState("Active");

  // ✅ 8 images
  const [imageUrl, setImageUrl] = useState("");
  const [secondImageUrl, setSecondImageUrl] = useState("");
  const [thirdImageUrl, setThirdImageUrl] = useState("");
  const [fourthImageUrl, setFourthImageUrl] = useState("");
  const [fifthImageUrl, setFifthImageUrl] = useState("");
  const [sixthImageUrl, setSixthImageUrl] = useState("");
  const [seventhImageUrl, setSeventhImageUrl] = useState("");
  const [eightImageUrl, setEightImageUrl] = useState("");

  const refs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null),
    5: useRef(null),
    6: useRef(null),
    7: useRef(null),
    8: useRef(null),
  };

  // table & edit
  const [accommodations, setAccommodations] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // UI-only pagination direction
  const [pageDir, setPageDir] = useState(1);

  // status modal
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  /* --------------------------------------------
    ✅ Premium react-select dropdown + no clipping
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
      input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827", minWidth: 2 }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
      dropdownIndicator: (b) => ({
        ...b,
        color: "#6b7280",
        ":hover": { color: "#4b5563" },
      }),
      menuPortal: (b) => ({ ...b, zIndex: 99999 }),
      menu: (b) => ({ ...b, borderRadius: 14, overflow: "hidden", zIndex: 99999 }),
      menuList: (b) => ({ ...b, maxHeight: 260, overflowY: "auto" }),
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

  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  const destinationOptions = destinations.map((d) => ({
    value: d._id,
    label: d.activeStatus ? d.name : `${d.name} (inactive)`,
  }));
  const vendorOptions = vendors.map((v) => ({
    value: v._id,
    label: v.activeStatus ? v.name : `${v.name} (inactive)`,
  }));

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
  useEffect(() => {
    fetchAccommodations();
  }, [page, search]);

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

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const uploadAndSetUrl = async (file, setUrl) => {
    if (!file) return;
    try {
      const result = await uploadImageToCloudinary(file);
      setUrl(result.secure_url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed");
    }
  };

  // ✅ reusable image tile (same as AddOnTrip)
  const ImageSlot = ({ title, url, onPick, onClear, inputRef, inputId }) => (
    <div className="flex flex-col items-center gap-2">
      <label
        htmlFor={inputId}
        className="
          relative group
          h-24 w-32 sm:h-28 sm:w-36 rounded-2xl
          border border-dashed border-slate-300
          bg-white/90 hover:bg-white
          shadow-sm hover:shadow-md transition
          flex items-center justify-center
          cursor-pointer overflow-hidden
        "
        title={url ? `Change ${title}` : `Upload ${title}`}
      >
        {url ? (
          <img
            src={url}
            alt={title}
            className="block w-full h-full object-cover object-center rounded-2xl"
          />
        ) : (
          <Plus className="w-5 h-5 text-slate-500" />
        )}

        {!url && (
          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            Upload
          </div>
        )}
      </label>

      <input id={inputId} type="file" accept="image/*" ref={inputRef} className="hidden" onChange={onPick} />

      <button
        type="button"
        onClick={onClear}
        className="
          h-9 w-full rounded-2xl
          border border-red-200
          bg-red-50 text-red-700
          hover:bg-red-100 transition
          text-sm font-semibold
        "
      >
        X
      </button>
    </div>
  );

  // load countries
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

    setStatusValue(entry.status || "Active");

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
          `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`,
          { params: { currentDestinationId: destinationId || undefined } }
        );
        setDestinations(destinationRes.data || []);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    }

    setSelectedDestination(destinationId);

    if (countryId && stateId && destinationId) {
      try {
        const vendorRes = await API.get(
          `/purchaser/vendorsOfHotels/${countryId}/${stateId}/${destinationId}`,
          { params: { currentVendorId: vendorId || undefined } }
        );
        setVendors(vendorRes.data || []);

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
      advancePercentage:
        entry.advancePercentage === 0 || entry.advancePercentage ? String(entry.advancePercentage) : "",
    });

    setFormSections(
      entry.formSections?.map((section) => ({
        ...section,
        validFrom: formatDateForInput(section.validFrom),
        validTo: formatDateForInput(section.validTo),
        commission: section.commission ?? "",
      })) || []
    );

    setImageUrl(entry.imageUrl || "");
    setSecondImageUrl(entry.secondImageUrl || "");
    setThirdImageUrl(entry.thirdImageUrl || "");
    setFourthImageUrl(entry.fourthImageUrl || "");
    setFifthImageUrl(entry.fifthImageUrl || "");
    setSixthImageUrl(entry.sixthImageUrl || "");
    setSeventhImageUrl(entry.seventhImageUrl || "");
    setEightImageUrl(entry.eightImageUrl || "");

    Object.values(refs).forEach((r) => {
      if (r.current) r.current.value = "";
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCountry) return toast.error("Country is required");
    if (!selectedState) return toast.error("State is required");
    if (!selectedDestination) return toast.error("Destination is required");
    if (!selectedVendor) return toast.error("Vendor is required");

    for (const field in formData) {
      if (!String(formData[field] || "").trim()) {
        toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
        return;
      }
    }

    // ✅ advancePercentage validation
    const adv = Number(formData.advancePercentage);
    if (Number.isNaN(adv) || adv < 0) {
      toast.error("Advance percentage must be 0 or greater");
      return;
    }
    if (adv > 100) {
      toast.error("Advance percentage cannot be more than 100");
      return;
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
        toast.error(`Dates in section ${current.index + 1} overlaps with section ${prev.index + 1}.`);
        return;
      }
    }

    const numericFields = [
      "commission",
      "2BEDEP",
      "2BEDCP",
      "2BEDMAP",
      "3BEDEP",
      "3BEDCP",
      "3BEDMAP",
      "4BEDEP",
      "4BEDCP",
      "4BEDMAP",
      "EXTRABEDEP",
      "EXTRABEDCP",
      "EXTRABEDMAP",
      "FRESHUP",
      "EARLYCHECKIN",
      "LATECHECKOUT",
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
      status: statusValue,
      country: selectedCountry,
      state: selectedState,
      destination: selectedDestination,
      vendor: selectedVendor,

      imageUrl,
      secondImageUrl,
      thirdImageUrl,
      fourthImageUrl,
      fifthImageUrl,
      sixthImageUrl,
      seventhImageUrl,
      eightImageUrl,

      advancePercentage: Number(formData.advancePercentage),

      formSections: formSections.map((section) => ({
        ...section,
        validFrom: new Date(section.validFrom),
        validTo: new Date(section.validTo),
        commission: Number(section.commission),
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
      await (isEditing
        ? API.put(`/purchaser/updateAccommodation/${editId}`, payload)
        : API.post("/purchaser/createAccommodation", payload));

      toast.success(isEditing ? "Accommodation Updated!" : "Accommodation Created!");

      clearAllPrefill();
      setPageDir(1);
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

  const clearAllPrefill = () => {
    setIsEditing(false);
    setEditId(null);

    setStatusValue("Active");

    setFormData({
      propertyName: "",
      hotelCategory: "",
      ownerName: "",
      email: "",
      mobileNumber: "",
      whatsappNumber: "",
      roomCategory: "",
      address: "",
      advancePercentage: "",
    });

    setFormSections([]);
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDestination("");
    setSelectedVendor("");
    setStates([]);
    setDestinations([]);
    setVendors([]);

    setImageUrl("");
    setSecondImageUrl("");
    setThirdImageUrl("");
    setFourthImageUrl("");
    setFifthImageUrl("");
    setSixthImageUrl("");
    setSeventhImageUrl("");
    setEightImageUrl("");

    Object.values(refs).forEach((r) => {
      if (r.current) r.current.value = "";
    });
  };

  const tableVariants = {
    enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
  };

  const handleStatusClick = (row) => {
    setSelectedRow(row);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedRow?._id) return;

    const current = selectedRow.status === "Active";
    const nextStatus = current ? "Inactive" : "Active";

    try {
      const res = await API.patch(`/purchaser/updateAccommodationStatus/${selectedRow._id}/status`, {
        status: nextStatus,
      });

      if (res.data?.success) {
        toast.success(
          `Accommodation ${nextStatus === "Active" ? "activated" : "deactivated"} successfully`
        );
        if (isEditing && editId === selectedRow._id) setStatusValue(nextStatus);
        await fetchAccommodations();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedRow(null);
    }
  };

  const imageSlots = [
    { key: "imageUrl", title: "Image 1", url: imageUrl, setUrl: setImageUrl, ref: refs[1], id: "acc-img-1" },
    { key: "secondImageUrl", title: "Image 2", url: secondImageUrl, setUrl: setSecondImageUrl, ref: refs[2], id: "acc-img-2" },
    { key: "thirdImageUrl", title: "Image 3", url: thirdImageUrl, setUrl: setThirdImageUrl, ref: refs[3], id: "acc-img-3" },
    { key: "fourthImageUrl", title: "Image 4", url: fourthImageUrl, setUrl: setFourthImageUrl, ref: refs[4], id: "acc-img-4" },
    { key: "fifthImageUrl", title: "Image 5", url: fifthImageUrl, setUrl: setFifthImageUrl, ref: refs[5], id: "acc-img-5" },
    { key: "sixthImageUrl", title: "Image 6", url: sixthImageUrl, setUrl: setSixthImageUrl, ref: refs[6], id: "acc-img-6" },
    { key: "seventhImageUrl", title: "Image 7", url: seventhImageUrl, setUrl: setSeventhImageUrl, ref: refs[7], id: "acc-img-7" },
    { key: "eightImageUrl", title: "Image 8", url: eightImageUrl, setUrl: setEightImageUrl, ref: refs[8], id: "acc-img-8" },
  ];

  return (
    <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
      <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }} />

        <div className="p-6 md:p-8 space-y-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                <Sparkles size={14} style={{ color: THEME }} />
                Purchaser
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
                Create Accommodation
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Create / update accommodation, validity slabs & price matrix.
              </div>
            </div>

            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
              style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
            >
              <Hotel size={20} />
            </div>
          </div>

          {/* FORM CARD */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">
                  {isEditing ? "Edit accommodation" : "Add new accommodation"}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Select location, vendor, fill details and add validity sections.
                </div>
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={clearAllPrefill}
                  title="Clear prefilled edit data"
                  className="
                    inline-flex items-center justify-center
                    w-9 h-9 rounded-2xl
                    bg-white/70 backdrop-blur-md
                    border border-slate-200
                    shadow hover:bg-white transition
                    text-slate-700
                  "
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/40">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <LabelIcon label="Country" Icon={Globe2} theme={THEME} />
                    <Select
                      styles={selectStyles}
                      options={countryOptions}
                      placeholder="Select Country"
                      value={countryOptions.find((o) => o.value === selectedCountry) || null}
                      onChange={(opt) => setSelectedCountry(opt?.value || "")}
                      menuPortalTarget={document.body}
                      isClearable
                      isDisabled={!!isEditing}
                      classNamePrefix="acc-country"
                    />
                  </div>

                  <div>
                    <LabelIcon label="State" Icon={Flag} theme={THEME} />
                    <Select
                      styles={selectStyles}
                      options={stateOptions}
                      placeholder="Select State"
                      value={stateOptions.find((o) => o.value === selectedState) || null}
                      onChange={(opt) => setSelectedState(opt?.value || "")}
                      menuPortalTarget={document.body}
                      isClearable
                      isDisabled={!!isEditing || !selectedCountry}
                      classNamePrefix="acc-state"
                    />
                  </div>

                  <div>
                    <LabelIcon label="Destination" Icon={Compass} theme={THEME} />
                    <Select
                      styles={selectStyles}
                      options={destinationOptions}
                      placeholder="Select Destination"
                      value={destinationOptions.find((o) => o.value === selectedDestination) || null}
                      onChange={(opt) => setSelectedDestination(opt?.value || "")}
                      menuPortalTarget={document.body}
                      isClearable
                      isDisabled={!!isEditing || !selectedState}
                      classNamePrefix="acc-destination"
                    />
                  </div>

                  <div>
                    <LabelIcon label="Vendor" Icon={Store} theme={THEME} />
                    <Select
                      styles={selectStyles}
                      options={vendorOptions}
                      placeholder="Select Vendor"
                      value={vendorOptions.find((o) => o.value === selectedVendor) || null}
                      onChange={(opt) => setSelectedVendor(opt?.value || "")}
                      menuPortalTarget={document.body}
                      isClearable
                      isDisabled={!!isEditing || !selectedDestination}
                      classNamePrefix="acc-vendor"
                    />
                  </div>
                </div>

                {/* Property details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Property Name"
                    labelIcon={Building2}
                    name="propertyName"
                    value={formData.propertyName}
                    onChange={handleChange}
                    placeholder="Property Name"
                    disabled={!!isEditing}
                    theme={THEME}
                  />

                  <div>
                    <LabelIcon label="Hotel category" Icon={Hotel} theme={THEME} />
                    <Select
                      styles={selectStyles}
                      options={hotelOptions}
                      placeholder="Hotel category"
                      value={hotelOptions.find((o) => o.value === formData.hotelCategory) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, hotelCategory: opt?.value || "" }))}
                      menuPortalTarget={document.body}
                      isClearable
                      isDisabled={!!isEditing}
                      classNamePrefix="acc-hotelcat"
                    />
                  </div>

                  <Field
                    label="Owner / Manager name"
                    labelIcon={User}
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Owner / Manager name"
                    disabled={!!isEditing}
                    theme={THEME}
                  />

                  <Field
                    label="Email"
                    labelIcon={Mail}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    disabled={!!isEditing}
                    theme={THEME}
                  />

                  <Field
                    label="Mobile Number"
                    labelIcon={Phone}
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="Mobile Number"
                    disabled={false}
                    theme={THEME}
                  />

                  <Field
                    label="WhatsApp Number"
                    labelIcon={MessageCircle}
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="WhatsApp Number"
                    disabled={false}
                    theme={THEME}
                  />

                  <div>
                    <LabelIcon label="Room category" Icon={BedDouble} theme={THEME} />
                    <Select
                      styles={selectStyles}
                      options={roomOptions}
                      placeholder="Room category"
                      value={roomOptions.find((o) => o.value === formData.roomCategory) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, roomCategory: opt?.value || "" }))}
                      menuPortalTarget={document.body}
                      isClearable
                      isDisabled={!!isEditing}
                      classNamePrefix="acc-roomcat"
                    />
                  </div>

                  <Field
                    label="Advance Percentage"
                    labelIcon={BadgePercent}
                    name="advancePercentage"
                    value={formData.advancePercentage}
                    onChange={handleChange}
                    placeholder="%"
                    disabled={false}
                    theme={THEME}
                    type="number"
                    min={0}
                    max={100}
                  />
                </div>

                {/* Address full width + taller */}
                <div className="w-full">
                  <LabelIcon label="Address" Icon={MapPin} theme={THEME} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    disabled={!!isEditing}
                    rows={4}
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
                      resize-none
                    "
                    style={{ "--tw-ring-color": THEME }}
                  />
                </div>

                {/* ✅ Images (8 slots at once like AddOnTrip) */}
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner"
                        style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
                      >
                        <ImageIcon size={18} />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Accommodation images
                        </div>
                        <div className="text-sm font-semibold text-slate-800">
                          Upload optional (8 images supported, each has clear)
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-between">
                      {imageSlots.map((slot) => (
                        <ImageSlot
                          key={slot.key}
                          title={slot.title}
                          url={slot.url}
                          inputId={slot.id}
                          inputRef={slot.ref}
                          onPick={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            await uploadAndSetUrl(file, slot.setUrl);
                          }}
                          onClear={() => {
                            slot.setUrl("");
                            if (slot.ref.current) slot.ref.current.value = "";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                        <CalendarClock size={14} style={{ color: THEME }} />
                        Sections
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Add validity slabs and prices. (No overlap allowed)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="
                        inline-flex items-center gap-2
                        rounded-2xl
                        px-4 py-2
                        text-sm font-extrabold
                        text-white
                        shadow-[0_16px_40px_rgba(133,112,238,0.25)]
                        hover:opacity-95
                        transition
                      "
                      style={{ background: THEME }}
                    >
                      + Add Section
                    </button>
                  </div>

                  {formSections.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-slate-600 text-sm">
                      No sections added yet. Click <span className="font-bold">Add Section</span> to begin.
                    </div>
                  )}

                  {formSections.map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                            <Hash size={14} style={{ color: THEME }} />
                            Section {index + 1}
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-900">Validity & Price Matrix</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className="
                            inline-flex items-center justify-center
                            h-10 w-10 rounded-2xl
                            border border-slate-200
                            bg-white hover:bg-slate-50
                            shadow-sm hover:shadow-md transition
                            text-slate-700
                          "
                          title="Remove section"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <MiniDate
                              label="Valid From"
                              value={formSections[index]["validFrom"]}
                              onChange={(v) => handlePriceChange(index, "validFrom", v)}
                              theme={THEME}
                            />
                            <MiniDate
                              label="Valid To"
                              value={formSections[index]["validTo"]}
                              onChange={(v) => handlePriceChange(index, "validTo", v)}
                              theme={THEME}
                            />
                          </div>

                          <MiniField
                            label="Commission %"
                            labelIcon={BadgePercent}
                            value={formSections[index]["commission"] || ""}
                            onChange={(v) => handlePriceChange(index, "commission", v)}
                            theme={THEME}
                            placeholder="%"
                            type="number"
                          />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">
                              3 Bed + Extra Bed
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <MiniField label="3 Bed EP" value={formSections[index]["3BEDEP"]} onChange={(v) => handlePriceChange(index, "3BEDEP", v)} theme={THEME} />
                              <MiniField label="3 Bed CP" value={formSections[index]["3BEDCP"]} onChange={(v) => handlePriceChange(index, "3BEDCP", v)} theme={THEME} />
                              <MiniField label="3 Bed MAP" value={formSections[index]["3BEDMAP"]} onChange={(v) => handlePriceChange(index, "3BEDMAP", v)} theme={THEME} />
                              <MiniField label="Extra Bed EP" value={formSections[index]["EXTRABEDEP"]} onChange={(v) => handlePriceChange(index, "EXTRABEDEP", v)} theme={THEME} />
                              <MiniField label="Extra Bed CP" value={formSections[index]["EXTRABEDCP"]} onChange={(v) => handlePriceChange(index, "EXTRABEDCP", v)} theme={THEME} />
                              <MiniField label="Extra Bed MAP" value={formSections[index]["EXTRABEDMAP"]} onChange={(v) => handlePriceChange(index, "EXTRABEDMAP", v)} theme={THEME} />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">
                              2 Bed + 4 Bed + Others
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <MiniField label="2 Bed EP" value={formSections[index]["2BEDEP"]} onChange={(v) => handlePriceChange(index, "2BEDEP", v)} theme={THEME} />
                              <MiniField label="2 Bed CP" value={formSections[index]["2BEDCP"]} onChange={(v) => handlePriceChange(index, "2BEDCP", v)} theme={THEME} />
                              <MiniField label="2 Bed MAP" value={formSections[index]["2BEDMAP"]} onChange={(v) => handlePriceChange(index, "2BEDMAP", v)} theme={THEME} />
                              <MiniField label="4 Bed EP" value={formSections[index]["4BEDEP"]} onChange={(v) => handlePriceChange(index, "4BEDEP", v)} theme={THEME} />
                              <MiniField label="4 Bed CP" value={formSections[index]["4BEDCP"]} onChange={(v) => handlePriceChange(index, "4BEDCP", v)} theme={THEME} />
                              <MiniField label="4 Bed MAP" value={formSections[index]["4BEDMAP"]} onChange={(v) => handlePriceChange(index, "4BEDMAP", v)} theme={THEME} />
                              <MiniField label="Fresh up" value={formSections[index]["FRESHUP"]} onChange={(v) => handlePriceChange(index, "FRESHUP", v)} theme={THEME} />
                              <MiniField label="Early Check in" value={formSections[index]["EARLYCHECKIN"]} onChange={(v) => handlePriceChange(index, "EARLYCHECKIN", v)} theme={THEME} />
                              <MiniField label="Late Check out" value={formSections[index]["LATECHECKOUT"]} onChange={(v) => handlePriceChange(index, "LATECHECKOUT", v)} theme={THEME} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
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
                  {isEditing ? "Update Accommodation" : "Create Accommodation"}
                </button>
              </form>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">Accommodation</div>
                <div className="mt-1 text-sm text-slate-500">Search and edit accommodation</div>
              </div>

              <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[320px]">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by property name"
                  value={search}
                  onChange={(e) => {
                    setPageDir(1);
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                />
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait" custom={pageDir}>
                  <motion.div
                    key={`accommodation-page-${page}-${search}`}
                    custom={pageDir}
                    variants={tableVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="w-full"
                    style={{ overflow: "visible" }}
                  >
                    <table className="w-full text-sm text-left text-slate-700 min-w-[1100px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <th className="px-5 py-3">Sl No</th>
                          <th className="px-5 py-3">Property Code</th>
                          <th className="px-5 py-3">Property Name</th>
                          <th className="px-5 py-3">Email</th>
                          <th className="px-5 py-3">Destination</th>
                          <th className="px-5 py-3">Hotel Category</th>
                          <th className="px-5 py-3">Room Category</th>
                          <th className="px-5 py-3 text-center">Status</th>
                          <th className="px-5 py-3 text-center">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {accommodations.map((entry, index) => {
                          const isActive = entry.status === "Active";
                          return (
                            <tr
                              key={entry._id || index}
                              className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                            >
                              <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
                              <td className="px-5 py-3 font-semibold">{entry.accommodationCode}</td>
                              <td className="px-5 py-3 font-semibold">{entry.propertyName}</td>
                              <td className="px-5 py-3 font-semibold">{entry.email}</td>
                              <td className="px-5 py-3 font-semibold">{entry.destination?.name || "N/A"}</td>
                              <td className="px-5 py-3 font-semibold">{entry.hotelCategory}</td>
                              <td className="px-5 py-3 font-semibold">{entry.roomCategory}</td>

                              <td className="px-5 py-3 text-center font-semibold">
                                {isActive ? (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusClick(entry)}
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
                                    onClick={() => handleStatusClick(entry)}
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

                              <td className="px-5 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(entry)}
                                  className="
                                    inline-flex items-center justify-center
                                    h-9 w-9 rounded-2xl
                                    border border-slate-200
                                    bg-white/80 hover:bg-white
                                    shadow-sm hover:shadow-md transition
                                    text-slate-700
                                  "
                                  title="Edit accommodation"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {accommodations.length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                              No accommodation found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
              <button
                onClick={() => {
                  setPageDir(-1);
                  setPage((prev) => Math.max(1, prev - 1));
                }}
                disabled={page === 1}
                className="
                  inline-flex items-center gap-2
                  px-3 py-2 rounded-xl border text-sm
                  bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200
                  disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
                "
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
                  setPage((prev) => Math.min(totalPages, prev + 1));
                }}
                disabled={page === totalPages}
                className="
                  inline-flex items-center gap-2
                  px-3 py-2 rounded-xl border text-sm
                  bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200
                  disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
                "
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Modal */}
        {showPopup && selectedRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                setSelectedRow(null);
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
              <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }} />

              <div className="p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Confirm action</div>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {selectedRow.status === "Active" ? "Deactivate" : "Activate"} Accommodation
                </h2>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold">
                    {selectedRow.status === "Active" ? "deactivate" : "activate"}
                  </span>{" "}
                  the property: <span className="font-semibold">{selectedRow.propertyName}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                    onClick={() => {
                      setShowPopup(false);
                      setSelectedRow(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
                    style={{ background: selectedRow.status === "Active" ? "#ef4444" : "#22c55e" }}
                    onClick={handleToggleStatus}
                  >
                    {selectedRow.status === "Active" ? "Deactivate" : "Activate"}
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

export default CreateAccomadation;

/* -----------------------------
  UI helpers (STYLE ONLY)
------------------------------ */
function LabelIcon({ label, Icon, theme }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
      <Icon size={14} style={{ color: theme }} />
      <span>{label}</span>
    </div>
  );
}

function Field({
  label,
  labelIcon: LabelIconComp,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  theme,
  type = "text",
  min,
  max,
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
        {LabelIconComp ? <LabelIconComp size={14} style={{ color: theme }} /> : null}
        <span>{label}</span>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
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

function MiniField({ label, labelIcon: LabelIconComp, value, onChange, placeholder, theme, type = "text" }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
        {LabelIconComp ? <LabelIconComp size={14} style={{ color: theme }} /> : null}
        <span>{label}</span>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-2xl
          border border-slate-300
          bg-white/90
          px-4 py-3
          text-sm
          outline-none
          focus:ring-2
        "
        style={{ "--tw-ring-color": theme }}
        placeholder={placeholder}
      />
    </div>
  );
}

function MiniDate({ label, value, onChange, theme }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">{label}</div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2"
        style={{ "--tw-ring-color": theme }}
      />
    </div>
  );
}
