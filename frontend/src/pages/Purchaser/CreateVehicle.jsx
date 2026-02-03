



// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Select from "react-select";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   CheckCircle,
//   XCircle,
//   Pencil,
//   Sparkles,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   MapPin,
//   Car,
//   Percent,
//   Image as ImageIcon,
//   User,
// } from "lucide-react";
// import API from "../../api";
// import { toast } from "react-toastify";
// import uploadImageToCloudinary from "../../utils/uploadCloudinary";

// const categories = ["2 Wheeler", "4 Seater", "6 Seater", "7 Seater"];

// const CreateVehicle = () => {
//   const THEME = "#8570EE";

//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [vehicles, setVehicles] = useState([]);

//   // IDs kept as strings (API contracts unchanged)
//   const [selectedCountry, setSelectedCountry] = useState("");
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDestination, setSelectedDestination] = useState("");
//   const [selectedVendor, setSelectedVendor] = useState("");

//   // React-Select option objects (for UI only)
//   const [countryOpt, setCountryOpt] = useState(null);
//   const [stateOpt, setStateOpt] = useState(null);
//   const [destinationOpt, setDestinationOpt] = useState(null);
//   const [vendorOpt, setVendorOpt] = useState(null);
//   const [categoryOpt, setCategoryOpt] = useState(null);

//   const [formData, setFormData] = useState({
//     category: "",
//     vehicle: "",
//     percentage: "",
//   });

//   // ✅ 3 images (keep 1st as imageUrl, add second/third)
//   const [image1, setImage1] = useState(null);
//   const [image2, setImage2] = useState(null);
//   const [image3, setImage3] = useState(null);

//   const [imageUrl, setImageUrl] = useState("");
//   const [secondImageUrl, setSecondImageUrl] = useState("");
//   const [thirdImageUrl, setThirdImageUrl] = useState("");

//   const [searchTerm, setSearchTerm] = useState("");

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedVehicleRow, setSelectedVehicleRow] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);

//   const [editingVehicleId, setEditingVehicleId] = useState(null);

//   // ✅ separate refs for each input (so clear works per-image)
//   const fileInputRef1 = useRef(null);
//   const fileInputRef2 = useRef(null);
//   const fileInputRef3 = useRef(null);

//   // ✅ UI-only pagination animation direction
//   const [pageDir, setPageDir] = useState(1);

//   /* --------------------------------------------
//     ✅ FIX: react-select dropdown + value overflow
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

//       input: (b) => ({
//         ...b,
//         margin: 0,
//         padding: 0,
//         color: "#111827",
//         minWidth: 2,
//       }),

//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
//       dropdownIndicator: (b) => ({
//         ...b,
//         color: "#6b7280",
//         ":hover": { color: "#4b5563" },
//       }),

//       menuPortal: (b) => ({ ...b, zIndex: 99999 }),
//       menu: (b) => ({ ...b, borderRadius: 14, overflow: "hidden", zIndex: 99999 }),

//       menuList: (b) => ({
//         ...b,
//         maxHeight: 260,
//         overflowY: "auto",
//       }),

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

//   // Map arrays -> options
//   const countryOptions = countries.map((c) => ({ _id: c._id, value: c._id, label: c.name }));
//   const stateOptions = states.map((s) => ({ _id: s._id, value: s._id, label: s.name }));

//   const destinationOptions = destinations.map((d) => ({
//     _id: d._id,
//     value: d._id,
//     label: d.activeStatus ? d.name : `${d.name} (inactive)`,
//   }));

//   const vendorOptions = vendors.map((v) => ({
//     _id: v._id,
//     value: v._id,
//     label: v.activeStatus ? v.name : `${v.name} (inactive)`,
//   }));

//   const categoryOptions = categories.map((c) => ({ value: c, label: c }));

//   // Fetch countries on mount
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await API.get("/purchaser/countries");
//         setCountries(res.data || []);
//       } catch (err) {
//         console.error("Error fetching countries:", err);
//       }
//     })();
//   }, []);

//   // Fetch states when country changes (skip if editing prefill in progress)
//   useEffect(() => {
//     if (!selectedCountry || editingVehicleId) return;
//     (async () => {
//       try {
//         const res = await API.get(`/purchaser/states/${selectedCountry}`);
//         setStates(res.data || []);
//       } catch (err) {
//         console.error("Error fetching states:", err);
//       }
//     })();
//     // reset chain
//     setSelectedState("");
//     setStateOpt(null);
//     setDestinations([]);
//     setSelectedDestination("");
//     setDestinationOpt(null);
//     setVendors([]);
//     setSelectedVendor("");
//     setVendorOpt(null);
//   }, [selectedCountry, editingVehicleId]);

//   // Fetch destinations when state changes
//   useEffect(() => {
//     if (!selectedCountry || !selectedState || editingVehicleId) return;
//     (async () => {
//       try {
//         const res = await API.get(
//           `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
//         );
//         setDestinations(res.data || []);
//       } catch (err) {
//         console.error("Error fetching destinations:", err);
//       }
//     })();
//     setSelectedDestination("");
//     setDestinationOpt(null);
//     setVendors([]);
//     setSelectedVendor("");
//     setVendorOpt(null);
//   }, [selectedState, selectedCountry, editingVehicleId]);

//   // Fetch vendors when destination changes
//   useEffect(() => {
//     if (!selectedCountry || !selectedState || !selectedDestination || editingVehicleId) return;
//     (async () => {
//       try {
//         const res = await API.get(
//           `/purchaser/vendorsOfVehicles/${selectedCountry}/${selectedState}/${selectedDestination}`
//         );
//         setVendors(res.data || []);
//       } catch (err) {
//         console.error("Error fetching vendors:", err);
//       }
//     })();
//     setSelectedVendor("");
//     setVendorOpt(null);
//   }, [selectedDestination, selectedCountry, selectedState, editingVehicleId]);

//   // Fetch vehicles when page/search changes
//   const fetchVehicles = async () => {
//     try {
//       const res = await API.get(
//         `/purchaser/vehicles?page=${page}&limit=3&search=${encodeURIComponent(searchTerm)}`
//       );
//       setVehicles(res.data?.vehicles || []);
//       setTotalPages(res.data?.totalPages || 1);
//     } catch (err) {
//       console.error("Error fetching vehicles:", err);
//     }
//   };
//   useEffect(() => {
//     fetchVehicles();
//   }, [page, searchTerm]);

//   const handleEdit = async (vehicle) => {
//     try {
//       setEditingVehicleId(vehicle._id);

//       // Set IDs for chain
//       const cId = vehicle.country?._id || "";
//       const sId = vehicle.state?._id || "";
//       const dId = vehicle.destination?._id || "";
//       const vId = vehicle.vendor?._id || "";

//       setSelectedCountry(cId);
//       setSelectedState(sId);
//       setSelectedDestination(dId);

//       const [statesRes, destinationsRes, vendorsRes] = await Promise.all([
//         API.get(`/purchaser/states/${cId}`),
//         API.get(`/purchaser/destinationsByCountryAndState/${cId}/${sId}`, {
//           params: { currentDestinationId: dId || undefined },
//         }),
//         API.get(`/purchaser/vendorsOfVehicles/${cId}/${sId}/${dId}`, {
//           params: { currentVendorId: vId || undefined },
//         }),
//       ]);

//       setStates(statesRes.data || []);
//       setDestinations(destinationsRes.data || []);
//       setVendors(vendorsRes.data || []);

//       // Sync option objects (for selects)
//       const ensureCountries = async () => {
//         if (countries.length) return countries;
//         const res = await API.get("/purchaser/countries");
//         setCountries(res.data || []);
//         return res.data || [];
//       };
//       const cList = await ensureCountries();
//       const cOpt =
//         cList.map((c) => ({ _id: c._id, value: c._id, label: c.name })).find((o) => o.value === cId) ||
//         null;
//       setCountryOpt(cOpt);

//       const sOpt =
//         (statesRes.data || [])
//           .map((s) => ({ _id: s._id, value: s._id, label: s.name }))
//           .find((o) => o.value === sId) || null;
//       setStateOpt(sOpt);

//       const dOpt =
//         (destinationsRes.data || [])
//           .map((d) => ({
//             _id: d._id,
//             value: d._id,
//             label: d.activeStatus ? d.name : `${d.name} (inactive)`,
//           }))
//           .find((o) => o.value === dId) || null;
//       setDestinationOpt(dOpt);

//       setSelectedVendor(vId);
//       const vOpt =
//         (vendorsRes.data || [])
//           .map((v) => ({
//             _id: v._id,
//             value: v._id,
//             label: v.activeStatus ? v.name : `${v.name} (inactive)`,
//           }))
//           .find((o) => o.value === vId) || null;
//       setVendorOpt(vOpt);

//       // Prefill form
//       setFormData({
//         category: vehicle.category || "",
//         vehicle: vehicle.vehicle || "",
//         percentage: vehicle.percentage?.toString() || "",
//       });
//       setCategoryOpt(vehicle.category ? { value: vehicle.category, label: vehicle.category } : null);

//       // ✅ prefill images
//       setImageUrl(vehicle.imageUrl || "");
//       setSecondImageUrl(vehicle.secondImageUrl || "");
//       setThirdImageUrl(vehicle.thirdImageUrl || "");
//       setImage1(null);
//       setImage2(null);
//       setImage3(null);

//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (error) {
//       console.error("Error loading vehicle data:", error);
//       toast.error("Failed to load vehicle details");
//       setEditingVehicleId(null);
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       const { vehicle, category, percentage } = formData;
//       const required = {
//         selectedCountry: "Country",
//         selectedState: "State",
//         selectedDestination: "Destination",
//         selectedVendor: "Vendor",
//         category: "Category",
//         vehicle: "Vehicle Name",
//         percentage: "percentage",
//       };
//       for (const [key, label] of Object.entries(required)) {
//         // eslint-disable-next-line no-eval
//         if (!eval(key)) {
//           toast.error(`${label} is mandatory`);
//           return;
//         }
//       }

//       const payload = {
//         countryId: selectedCountry,
//         stateId: selectedState,
//         destinationId: selectedDestination,
//         vendorId: selectedVendor,
//         category,
//         vehicle,
//         imageUrl,
//         secondImageUrl,
//         thirdImageUrl,
//         percentage: Number(percentage),
//       };

//       if (editingVehicleId) {
//         await API.put(`/purchaser/updateVehicle/${editingVehicleId}`, payload);
//         toast.success("Vehicle updated successfully");
//         setEditingVehicleId(null);
//       } else {
//         await API.post("/purchaser/createVehicles", payload);
//         toast.success("Vehicle created successfully");
//       }

//       clearForm();
//       await fetchVehicles();
//     } catch (err) {
//       console.error("Error saving vehicle:", err);
//     }
//   };

//   const clearForm = () => {
//     setSelectedVendor("");
//     setSelectedCountry("");
//     setSelectedState("");
//     setSelectedDestination("");
//     setCountryOpt(null);
//     setStateOpt(null);
//     setDestinationOpt(null);
//     setVendorOpt(null);
//     setStates([]);
//     setDestinations([]);
//     setVendors([]);
//     setFormData({ category: "", vehicle: "", percentage: "" });
//     setCategoryOpt(null);

//     // ✅ clear all images
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

//   const clearEditAndReset = () => {
//     clearForm();
//     setEditingVehicleId(null);
//   };

//   const handleStatusClick = (vehicle) => {
//     setSelectedVehicleRow(vehicle);
//     setShowPopup(true);
//   };

//   const handleToggleStatus = async () => {
//     if (!selectedVehicleRow) return;
//     try {
//       const updatedStatus = !selectedVehicleRow.activeStatus;
//       const res = await API.patch(
//         `/purchaser/updateVehicleStatus/${selectedVehicleRow._id}/status`,
//         { activeStatus: updatedStatus }
//       );
//       if (res.data.success) {
//         toast.success(`Vehicle ${updatedStatus ? "activated" : "deactivated"} successfully`);
//         await fetchVehicles();
//       } else {
//         toast.error("Update failed");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Server error");
//     } finally {
//       setShowPopup(false);
//       setSelectedVehicleRow(null);
//     }
//   };

//   // ✅ Premium table page transition (UI-only)
//   const tableVariants = {
//     enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
//     center: { x: 0, opacity: 1, filter: "blur(0px)" },
//     exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
//   };

//   // ✅ helper: upload and set URL without changing your existing UX
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

//   // ✅ reusable image tile (keeps your exact design language)
//   const ImageSlot = ({ title, url, onPick, onClear, inputRef, inputId }) => (
//     // <div className="flex items-center gap-3 flex-wrap">
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
//           <img src={url} alt={title} className="w-full h-full object-cover rounded-2xl " />
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
//           h-9 w-full  rounded-2xl
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

//   return (
//     <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
//       <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
//         <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }} />

//         <div className="p-6 md:p-8 space-y-7">
//           <div className="flex items-start justify-between gap-3 flex-wrap">
//             <div className="min-w-0">
//               <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
//                 <Sparkles size={14} style={{ color: THEME }} />
//                 Purchaser
//               </div>
//               <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
//                 Create Vehicle
//               </div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Add / update vehicles, upload image, and manage status.
//               </div>
//             </div>

//             <div
//               className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
//               style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
//             >
//               <Car size={20} />
//             </div>
//           </div>

//           {/* ✅ FORM PANEL (TOP) */}
//           <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//             <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//               <div>
//                 <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
//                 <div className="mt-1 text-lg font-extrabold text-slate-900">
//                   {editingVehicleId ? "Edit vehicle" : "Add new vehicle"}
//                 </div>
//                 <div className="mt-1 text-sm text-slate-500">
//                   Choose location → vendor → category, then fill details.
//                 </div>
//               </div>

//               {editingVehicleId && (
//                 <button
//                   type="button"
//                   onClick={clearEditAndReset}
//                   aria-label="Clear edit and reset form"
//                   title="Discard changes"
//                   className="
//                     inline-flex items-center justify-center
//                     w-9 h-9 rounded-2xl
//                     bg-white/70 backdrop-blur-md
//                     border border-slate-200
//                     shadow hover:bg-white transition
//                     text-slate-700
//                   "
//                 >
//                   ×
//                 </button>
//               )}
//             </div>

//             <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/40">
//               {/* Location selects */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <MapPin size={12} style={{ color: THEME }} />
//                     Country
//                   </div>
//                   <Select
//                     options={countryOptions}
//                     value={countryOpt}
//                     onChange={(opt) => {
//                       setCountryOpt(opt || null);
//                       const id = opt?.value || "";
//                       setSelectedCountry(id);
//                     }}
//                     placeholder="Select Country"
//                     styles={selectStyles}
//                     menuPortalTarget={document.body}
//                     classNamePrefix="veh-country"
//                     getOptionValue={(o) => String(o._id || o.value)}
//                     isClearable
//                     isDisabled={!!editingVehicleId}
//                   />
//                 </div>

//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <MapPin size={12} style={{ color: THEME }} />
//                     State
//                   </div>
//                   <Select
//                     options={stateOptions}
//                     value={stateOpt}
//                     onChange={(opt) => {
//                       setStateOpt(opt || null);
//                       const id = opt?.value || "";
//                       setSelectedState(id);
//                     }}
//                     placeholder="Select State"
//                     styles={selectStyles}
//                     menuPortalTarget={document.body}
//                     classNamePrefix="veh-state"
//                     getOptionValue={(o) => String(o._id || o.value)}
//                     isClearable
//                     isDisabled={!!editingVehicleId || !selectedCountry}
//                   />
//                   {!selectedCountry && (
//                     <div className="mt-1 text-xs text-slate-400">Select country first to enable states.</div>
//                   )}
//                 </div>

//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <MapPin size={12} style={{ color: THEME }} />
//                     Destination
//                   </div>
//                   <Select
//                     options={destinationOptions}
//                     value={destinationOpt}
//                     onChange={(opt) => {
//                       setDestinationOpt(opt || null);
//                       const id = opt?.value || "";
//                       setSelectedDestination(id);
//                     }}
//                     placeholder="Select Destination"
//                     styles={selectStyles}
//                     menuPortalTarget={document.body}
//                     classNamePrefix="veh-destination"
//                     getOptionValue={(o) => String(o._id || o.value)}
//                     isClearable
//                     isDisabled={!!editingVehicleId || !selectedState}
//                   />
//                   {!selectedState && (
//                     <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
//                   )}
//                 </div>
//               </div>

//               {/* Main row */}
//               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
//                 <div className="lg:col-span-4">
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <User size={12} style={{ color: THEME }} />
//                     Vendor
//                   </div>
//                   <Select
//                     options={vendorOptions}
//                     value={vendorOpt}
//                     onChange={(opt) => {
//                       setVendorOpt(opt || null);
//                       const id = opt?.value || "";
//                       setSelectedVendor(id);
//                     }}
//                     placeholder="Select Vendor"
//                     styles={selectStyles}
//                     menuPortalTarget={document.body}
//                     classNamePrefix="veh-vendor"
//                     getOptionValue={(o) => String(o._id || o.value)}
//                     isClearable
//                     isDisabled={!!editingVehicleId || !selectedDestination}
//                   />
//                   {!selectedDestination && (
//                     <div className="mt-1 text-xs text-slate-400">Select destination first to enable vendors.</div>
//                   )}
//                 </div>

//                 <div className="lg:col-span-3">
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <Car size={12} style={{ color: THEME }} />
//                     Category
//                   </div>
//                   <Select
//                     options={categoryOptions}
//                     value={categoryOpt}
//                     onChange={(opt) => {
//                       setCategoryOpt(opt || null);
//                       setFormData((p) => ({ ...p, category: opt?.value || "" }));
//                     }}
//                     placeholder="Select vehicle category"
//                     styles={selectStyles}
//                     menuPortalTarget={document.body}
//                     classNamePrefix="veh-category"
//                     getOptionValue={(o) => String(o.value)}
//                     isClearable
//                     isDisabled={!!editingVehicleId}
//                   />
//                 </div>

//                 <div className="lg:col-span-3">
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <Car size={12} style={{ color: THEME }} />
//                     Vehicle name
//                   </div>
//                   <input
//                     type="text"
//                     value={formData.vehicle}
//                     onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
//                     disabled={!!editingVehicleId}
//                     placeholder="Enter vehicle name"
//                     className="
//                       w-full rounded-2xl
//                       border border-slate-300 bg-white/90
//                       px-4 py-3 text-sm outline-none
//                       shadow-sm focus:ring-2 transition
//                       disabled:bg-white disabled:cursor-not-allowed
//                     "
//                     style={{ "--tw-ring-color": THEME }}
//                   />
//                 </div>

//                 <div className="lg:col-span-2">
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <Percent size={12} style={{ color: THEME }} />
//                     Percentage
//                   </div>
//                   <input
//                     type="number"
//                     placeholder="%"
//                     value={formData.percentage || ""}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, percentage: e.target.value }))}
//                     className="
//                       w-full rounded-2xl
//                       border border-slate-300 bg-white/90
//                       px-4 py-3 text-sm outline-none
//                       shadow-inner focus:ring-2 transition
//                     "
//                     style={{ "--tw-ring-color": THEME }}
//                     min={0}
//                     max={100}
//                   />
//                 </div>
//               </div>

//               {/* ✅ Images row (3 uploads + clear each) */}
//               <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
//                 <div className="flex flex-col gap-4">
//                   <div className="flex items-center gap-3">
//                     <div
//                       className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner"
//                       style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
//                     >
//                       <ImageIcon size={18} />
//                     </div>
//                     <div>
//                       <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
//                         Vehicle images
//                       </div>
//                       <div className="text-sm font-semibold text-slate-800">
//                         Upload optional (3 images supported, each has clear)
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between flex-wrap">
//                     <ImageSlot
//                       title="Image 1"
//                       url={imageUrl}
//                       inputId="image-upload-1"
//                       inputRef={fileInputRef1}
//                       onPick={async (e) => {
//                         const file = e.target.files?.[0];
//                         if (!file) return;
//                         await uploadAndSet({ file, setFile: setImage1, setUrl: setImageUrl });
//                       }}
//                       onClear={() => {
//                         setImage1(null);
//                         setImageUrl("");
//                         if (fileInputRef1.current) fileInputRef1.current.value = "";
//                       }}
//                     />

//                     <ImageSlot
//                       title="Image 2"
//                       url={secondImageUrl}
//                       inputId="image-upload-2"
//                       inputRef={fileInputRef2}
//                       onPick={async (e) => {
//                         const file = e.target.files?.[0];
//                         if (!file) return;
//                         await uploadAndSet({ file, setFile: setImage2, setUrl: setSecondImageUrl });
//                       }}
//                       onClear={() => {
//                         setImage2(null);
//                         setSecondImageUrl("");
//                         if (fileInputRef2.current) fileInputRef2.current.value = "";
//                       }}
//                     />

//                     <ImageSlot
//                       title="Image 3"
//                       url={thirdImageUrl}
//                       inputId="image-upload-3"
//                       inputRef={fileInputRef3}
//                       onPick={async (e) => {
//                         const file = e.target.files?.[0];
//                         if (!file) return;
//                         await uploadAndSet({ file, setFile: setImage3, setUrl: setThirdImageUrl });
//                       }}
//                       onClear={() => {
//                         setImage3(null);
//                         setThirdImageUrl("");
//                         if (fileInputRef3.current) fileInputRef3.current.value = "";
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex flex-col items-center gap-2">
//                 {editingVehicleId && (
//                   <button
//                     type="button"
//                     onClick={clearEditAndReset}
//                     aria-label="Clear edit and reset form"
//                     className="
//                       inline-flex items-center justify-center
//                       w-8 h-8 rounded-full
//                       bg-white/70 backdrop-blur-md
//                       border border-slate-200 shadow
//                       text-slate-700 hover:bg-white transition
//                     "
//                     title="Discard changes"
//                   >
//                     ×
//                   </button>
//                 )}

//                 <div className="flex gap-3 w-full flex-col sm:flex-row">
//                   <button
//                     type="button"
//                     onClick={handleSubmit}
//                     className="
//                       flex-1
//                       rounded-2xl px-5 py-3.5
//                       text-sm font-extrabold text-white
//                       shadow-[0_16px_40px_rgba(133,112,238,0.35)]
//                       hover:opacity-95 active:scale-[0.99]
//                       transition
//                       inline-flex items-center justify-center gap-2
//                     "
//                     style={{ background: THEME }}
//                   >
//                     <Plus className="w-5 h-5" />
//                     {editingVehicleId ? "Update Vehicle" : "Add Vehicle"}
//                   </button>

//                   <button
//                     type="button"
//                     onClick={clearForm}
//                     className="
//                       flex-1
//                       rounded-2xl px-5 py-3.5
//                       text-sm font-extrabold text-white
//                       bg-red-500 hover:bg-red-600
//                       shadow-md
//                       active:scale-[0.99]
//                       transition
//                     "
//                   >
//                     Clear
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ✅ TABLE PANEL (BOTTOM) */}
//           <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//             <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//               <div>
//                 <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
//                 <div className="mt-1 text-lg font-extrabold text-slate-900">Vehicles</div>
//                 <div className="mt-1 text-sm text-slate-500">View vehicles and manage status</div>
//               </div>

//               <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
//                 <Search className="h-4 w-4 text-slate-500" />
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setPageDir(1);
//                     setPage(1);
//                   }}
//                   placeholder="Search by Destination"
//                   className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
//                 />
//               </div>
//             </div>

//             <div className="relative overflow-hidden">
//               <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                 <AnimatePresence mode="wait" custom={pageDir}>
//                   <motion.div
//                     key={`vehicles-page-${page}-${searchTerm}`}
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
//                           <th className="px-5 py-3">Vehicle Name</th>
//                           <th className="px-5 py-3">Category</th>
//                           <th className="px-5 py-3">Vendor Name</th>
//                           <th className="px-5 py-3">Destination</th>
//                           <th className="px-5 py-3">Percentage</th>
//                           <th className="px-5 py-3 text-center">Status</th>
//                           <th className="px-5 py-3 text-center">Edit</th>
//                         </tr>
//                       </thead>

//                       <tbody>
//                         {vehicles.map((vehicle, idx) => (
//                           <tr
//                             key={vehicle._id}
//                             className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
//                           >
//                             <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + idx + 1}</td>
//                             <td className="px-5 py-3 font-semibold">{vehicle.vehicle}</td>
//                             <td className="px-5 py-3 font-semibold">{vehicle.category}</td>
//                             <td className="px-5 py-3 font-semibold">{vehicle.vendor?.name || "-"}</td>
//                             <td className="px-5 py-3 font-semibold">{vehicle.destination?.name || "-"}</td>
//                             <td className="px-5 py-3 font-semibold">{vehicle.percentage || "-"}</td>

//                             <td className="px-5 py-3 text-center font-semibold">
//                               {vehicle.activeStatus ? (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleStatusClick(vehicle)}
//                                   className="
//                                     inline-flex items-center gap-2
//                                     px-3 py-1.5 rounded-full
//                                     text-xs font-semibold
//                                     border
//                                     bg-emerald-50 text-emerald-700 border-emerald-200
//                                     hover:bg-emerald-100 transition
//                                   "
//                                 >
//                                   <CheckCircle className="w-4 h-4" />
//                                   Active
//                                 </button>
//                               ) : (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleStatusClick(vehicle)}
//                                   className="
//                                     inline-flex items-center gap-2
//                                     px-3 py-1.5 rounded-full
//                                     text-xs font-semibold
//                                     border
//                                     bg-red-50 text-red-700 border-red-200
//                                     hover:bg-red-100 transition
//                                   "
//                                 >
//                                   <XCircle className="w-4 h-4" />
//                                   Inactive
//                                 </button>
//                               )}
//                             </td>

//                             <td className="px-5 py-3 text-center">
//                               <button
//                                 type="button"
//                                 onClick={() => handleEdit(vehicle)}
//                                 className="
//                                   inline-flex items-center justify-center
//                                   h-9 w-9 rounded-2xl
//                                   border border-slate-200
//                                   bg-white/80 hover:bg-white
//                                   shadow-sm hover:shadow-md transition
//                                   text-slate-700
//                                 "
//                                 title="Edit vehicle"
//                               >
//                                 <Pencil className="w-4 h-4" />
//                               </button>
//                             </td>
//                           </tr>
//                         ))}

//                         {vehicles.length === 0 && (
//                           <tr>
//                             <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
//                               No vehicles found.
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
//                 disabled={page === 1}
//                 onClick={() => {
//                   setPageDir(-1);
//                   setPage((p) => Math.max(p - 1, 1));
//                 }}
//                 className={`
//                   inline-flex items-center gap-2
//                   px-3 py-2 rounded-xl border text-sm
//                   ${
//                     page === 1
//                       ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                       : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                   }
//                 `}
//               >
//                 <ChevronLeft size={16} />
//                 Previous
//               </button>

//               <span className="px-4 py-2 rounded-xl bg-[#8570EE]/10 text-[#8570EE] font-bold border border-[#8570EE]/25">
//                 {page} / {totalPages}
//               </span>

//               <button
//                 disabled={page === totalPages}
//                 onClick={() => {
//                   setPageDir(1);
//                   setPage((p) => p + 1);
//                 }}
//                 className={`
//                   inline-flex items-center gap-2
//                   px-3 py-2 rounded-xl border text-sm
//                   ${
//                     page === totalPages
//                       ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                       : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                   }
//                 `}
//               >
//                 Next
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {showPopup && selectedVehicleRow && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               onClick={() => {
//                 setShowPopup(false);
//                 setSelectedVehicleRow(null);
//               }}
//             />

//             <div
//               className="
//                 relative
//                 w-full max-w-md mx-3
//                 rounded-[28px]
//                 border border-white/25
//                 shadow-[0_30px_90px_rgba(15,23,42,0.55)]
//                 bg-white/92 backdrop-blur-2xl
//                 overflow-hidden
//               "
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }} />

//               <div className="p-6">
//                 <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Confirm action</div>
//                 <h2 className="mt-1 text-xl font-extrabold text-slate-900">
//                   {selectedVehicleRow.activeStatus ? "Deactivate" : "Activate"} Vehicle
//                 </h2>

//                 <p className="mt-3 text-slate-600 text-sm leading-relaxed">
//                   Are you sure you want to{" "}
//                   <span className="font-bold">
//                     {selectedVehicleRow.activeStatus ? "deactivate" : "activate"}
//                   </span>{" "}
//                   the vehicle: <span className="font-semibold">{selectedVehicleRow.vehicle}</span>?
//                 </p>

//                 <div className="mt-6 flex justify-end gap-2">
//                   <button
//                     className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
//                     onClick={() => {
//                       setShowPopup(false);
//                       setSelectedVehicleRow(null);
//                     }}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
//                     style={{ background: selectedVehicleRow.activeStatus ? "#ef4444" : "#22c55e" }}
//                     onClick={handleToggleStatus}
//                   >
//                     {selectedVehicleRow.activeStatus ? "Deactivate" : "Activate"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateVehicle;
import React, { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle,
  XCircle,
  Pencil,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Car,
  Percent,
  Image as ImageIcon,
  User,
} from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const categories = ["2 Wheeler", "4 Seater", "6 Seater", "7 Seater"];

const CreateVehicle = () => {
  const THEME = "#8570EE";

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // IDs kept as strings (API contracts unchanged)
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");

  // React-Select option objects (for UI only)
  const [countryOpt, setCountryOpt] = useState(null);
  const [stateOpt, setStateOpt] = useState(null);
  const [destinationOpt, setDestinationOpt] = useState(null);
  const [vendorOpt, setVendorOpt] = useState(null);
  const [categoryOpt, setCategoryOpt] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    vehicle: "",
    percentage: "",
    advancePercentage: "", // ✅ NEW
  });

  // ✅ 8 image urls
  const [imageUrl, setImageUrl] = useState("");
  const [secondImageUrl, setSecondImageUrl] = useState("");
  const [thirdImageUrl, setThirdImageUrl] = useState("");
  const [fourthImageUrl, setFourthImageUrl] = useState("");
  const [fifthImageUrl, setFifthImageUrl] = useState("");
  const [sixthImageUrl, setSixthImageUrl] = useState("");
  const [seventhImageUrl, setSeventhImageUrl] = useState("");
  const [eightImageUrl, setEightImageUrl] = useState("");

  // keep file refs only to reset input value
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);
  const fileInputRef3 = useRef(null);
  const fileInputRef4 = useRef(null);
  const fileInputRef5 = useRef(null);
  const fileInputRef6 = useRef(null);
  const fileInputRef7 = useRef(null);
  const fileInputRef8 = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVehicleRow, setSelectedVehicleRow] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [editingVehicleId, setEditingVehicleId] = useState(null);

  // ✅ UI-only pagination animation direction
  const [pageDir, setPageDir] = useState(1);

  /* --------------------------------------------
    ✅ FIX: react-select dropdown + value overflow
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

  // Map arrays -> options
  const countryOptions = countries.map((c) => ({ _id: c._id, value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ _id: s._id, value: s._id, label: s.name }));

  const destinationOptions = destinations.map((d) => ({
    _id: d._id,
    value: d._id,
    label: d.activeStatus ? d.name : `${d.name} (inactive)`,
  }));

  const vendorOptions = vendors.map((v) => ({
    _id: v._id,
    value: v._id,
    label: v.activeStatus ? v.name : `${v.name} (inactive)`,
  }));

  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  // Fetch countries on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data || []);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    })();
  }, []);

  // Fetch states when country changes (skip if editing prefill in progress)
  useEffect(() => {
    if (!selectedCountry || editingVehicleId) return;
    (async () => {
      try {
        const res = await API.get(`/purchaser/states/${selectedCountry}`);
        setStates(res.data || []);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    })();

    // reset chain
    setSelectedState("");
    setStateOpt(null);
    setDestinations([]);
    setSelectedDestination("");
    setDestinationOpt(null);
    setVendors([]);
    setSelectedVendor("");
    setVendorOpt(null);
  }, [selectedCountry, editingVehicleId]);

  // Fetch destinations when state changes
  useEffect(() => {
    if (!selectedCountry || !selectedState || editingVehicleId) return;
    (async () => {
      try {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
        );
        setDestinations(res.data || []);
      } catch (err) {
        console.error("Error fetching destinations:", err);
      }
    })();
    setSelectedDestination("");
    setDestinationOpt(null);
    setVendors([]);
    setSelectedVendor("");
    setVendorOpt(null);
  }, [selectedState, selectedCountry, editingVehicleId]);

  // Fetch vendors when destination changes
  useEffect(() => {
    if (!selectedCountry || !selectedState || !selectedDestination || editingVehicleId) return;
    (async () => {
      try {
        const res = await API.get(
          `/purchaser/vendorsOfVehicles/${selectedCountry}/${selectedState}/${selectedDestination}`
        );
        setVendors(res.data || []);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    })();
    setSelectedVendor("");
    setVendorOpt(null);
  }, [selectedDestination, selectedCountry, selectedState, editingVehicleId]);

  // Fetch vehicles when page/search changes
  const fetchVehicles = async () => {
    try {
      const res = await API.get(
        `/purchaser/vehicles?page=${page}&limit=3&search=${encodeURIComponent(searchTerm)}`
      );
      setVehicles(res.data?.vehicles || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, searchTerm]);

  const handleEdit = async (vehicle) => {
    try {
      setEditingVehicleId(vehicle._id);

      const cId = vehicle.country?._id || "";
      const sId = vehicle.state?._id || "";
      const dId = vehicle.destination?._id || "";
      const vId = vehicle.vendor?._id || "";

      setSelectedCountry(cId);
      setSelectedState(sId);
      setSelectedDestination(dId);

      const [statesRes, destinationsRes, vendorsRes] = await Promise.all([
        API.get(`/purchaser/states/${cId}`),
        API.get(`/purchaser/destinationsByCountryAndState/${cId}/${sId}`, {
          params: { currentDestinationId: dId || undefined },
        }),
        API.get(`/purchaser/vendorsOfVehicles/${cId}/${sId}/${dId}`, {
          params: { currentVendorId: vId || undefined },
        }),
      ]);

      setStates(statesRes.data || []);
      setDestinations(destinationsRes.data || []);
      setVendors(vendorsRes.data || []);

      const ensureCountries = async () => {
        if (countries.length) return countries;
        const res = await API.get("/purchaser/countries");
        setCountries(res.data || []);
        return res.data || [];
      };

      const cList = await ensureCountries();
      const cOpt =
        cList.map((c) => ({ _id: c._id, value: c._id, label: c.name })).find((o) => o.value === cId) ||
        null;
      setCountryOpt(cOpt);

      const sOpt =
        (statesRes.data || [])
          .map((s) => ({ _id: s._id, value: s._id, label: s.name }))
          .find((o) => o.value === sId) || null;
      setStateOpt(sOpt);

      const dOpt =
        (destinationsRes.data || [])
          .map((d) => ({
            _id: d._id,
            value: d._id,
            label: d.activeStatus ? d.name : `${d.name} (inactive)`,
          }))
          .find((o) => o.value === dId) || null;
      setDestinationOpt(dOpt);

      setSelectedVendor(vId);
      const vOpt =
        (vendorsRes.data || [])
          .map((v) => ({
            _id: v._id,
            value: v._id,
            label: v.activeStatus ? v.name : `${v.name} (inactive)`,
          }))
          .find((o) => o.value === vId) || null;
      setVendorOpt(vOpt);

      // Prefill form
      setFormData({
        category: vehicle.category || "",
        vehicle: vehicle.vehicle || "",
        percentage: vehicle.percentage?.toString() || "",
        advancePercentage: vehicle.advancePercentage?.toString() || "", // ✅ NEW
      });
      setCategoryOpt(vehicle.category ? { value: vehicle.category, label: vehicle.category } : null);

      // ✅ prefill images (8)
      setImageUrl(vehicle.imageUrl || "");
      setSecondImageUrl(vehicle.secondImageUrl || "");
      setThirdImageUrl(vehicle.thirdImageUrl || "");
      setFourthImageUrl(vehicle.fourthImageUrl || "");
      setFifthImageUrl(vehicle.fifthImageUrl || "");
      setSixthImageUrl(vehicle.sixthImageUrl || "");
      setSeventhImageUrl(vehicle.seventhImageUrl || "");
      setEightImageUrl(vehicle.eightImageUrl || "");

      // reset file inputs
      if (fileInputRef1.current) fileInputRef1.current.value = "";
      if (fileInputRef2.current) fileInputRef2.current.value = "";
      if (fileInputRef3.current) fileInputRef3.current.value = "";
      if (fileInputRef4.current) fileInputRef4.current.value = "";
      if (fileInputRef5.current) fileInputRef5.current.value = "";
      if (fileInputRef6.current) fileInputRef6.current.value = "";
      if (fileInputRef7.current) fileInputRef7.current.value = "";
      if (fileInputRef8.current) fileInputRef8.current.value = "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading vehicle data:", error);
      toast.error("Failed to load vehicle details");
      setEditingVehicleId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const { vehicle, category, percentage, advancePercentage } = formData;

      const required = {
        selectedCountry: "Country",
        selectedState: "State",
        selectedDestination: "Destination",
        selectedVendor: "Vendor",
        category: "Category",
        vehicle: "Vehicle Name",
        percentage: "Commission percentage",
        advancePercentage: "Advance percentage", // ✅ NEW
      };

      for (const [key, label] of Object.entries(required)) {
        // eslint-disable-next-line no-eval
        if (!eval(key)) {
          toast.error(`${label} is mandatory`);
          return;
        }
      }
      const commission = Number(percentage);
      const advance = Number(advancePercentage);

      if (Number.isNaN(commission)) {
        toast.error("Commission percentage must be a valid number");
        return;
      }
      if (commission < 0) {
        toast.error("Commission percentage cannot be negative");
        return;
      }

      if (Number.isNaN(advance)) {
        toast.error("Advance percentage must be a valid number");
        return;
      }
      if (advance < 0) {
        toast.error("Advance percentage cannot be negative");
        return;
      }
      if (advance > 100) {
        toast.error("Advance percentage cannot be more than 100");
        return;
      }

      const payload = {
        countryId: selectedCountry,
        stateId: selectedState,
        destinationId: selectedDestination,
        vendorId: selectedVendor,
        category,
        vehicle,

        imageUrl,
        secondImageUrl,
        thirdImageUrl,
        fourthImageUrl,
        fifthImageUrl,
        sixthImageUrl,
        seventhImageUrl,
        eightImageUrl,

        percentage: Number(percentage),
        advancePercentage: Number(advancePercentage), // ✅ NEW
      };

      if (editingVehicleId) {
        await API.put(`/purchaser/updateVehicle/${editingVehicleId}`, payload);
        toast.success("Vehicle updated successfully");
        setEditingVehicleId(null);
      } else {
        await API.post("/purchaser/createVehicles", payload);
        toast.success("Vehicle created successfully");
      }

      clearForm();
      await fetchVehicles();
    } catch (err) {
      console.error("Error saving vehicle:", err);
    }
  };

  const clearForm = () => {
    setSelectedVendor("");
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDestination("");

    setCountryOpt(null);
    setStateOpt(null);
    setDestinationOpt(null);
    setVendorOpt(null);

    setStates([]);
    setDestinations([]);
    setVendors([]);

    setFormData({ category: "", vehicle: "", percentage: "", advancePercentage: "" });
    setCategoryOpt(null);

    // ✅ clear all images
    setImageUrl("");
    setSecondImageUrl("");
    setThirdImageUrl("");
    setFourthImageUrl("");
    setFifthImageUrl("");
    setSixthImageUrl("");
    setSeventhImageUrl("");
    setEightImageUrl("");

    if (fileInputRef1.current) fileInputRef1.current.value = "";
    if (fileInputRef2.current) fileInputRef2.current.value = "";
    if (fileInputRef3.current) fileInputRef3.current.value = "";
    if (fileInputRef4.current) fileInputRef4.current.value = "";
    if (fileInputRef5.current) fileInputRef5.current.value = "";
    if (fileInputRef6.current) fileInputRef6.current.value = "";
    if (fileInputRef7.current) fileInputRef7.current.value = "";
    if (fileInputRef8.current) fileInputRef8.current.value = "";

  };

  const clearEditAndReset = () => {
    clearForm();
    setEditingVehicleId(null);
  };

  const handleStatusClick = (vehicle) => {
    setSelectedVehicleRow(vehicle);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedVehicleRow) return;
    try {
      const updatedStatus = !selectedVehicleRow.activeStatus;
      const res = await API.patch(
        `/purchaser/updateVehicleStatus/${selectedVehicleRow._id}/status`,
        { activeStatus: updatedStatus }
      );
      if (res.data.success) {
        toast.success(`Vehicle ${updatedStatus ? "activated" : "deactivated"} successfully`);
        await fetchVehicles();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedVehicleRow(null);
    }
  };

  // ✅ Premium table page transition (UI-only)
  const tableVariants = {
    enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
  };

  // ✅ helper: upload and set URL without changing your existing UX
  const uploadAndSet = async ({ file, setUrl }) => {
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

  // ✅ reusable image tile (keeps your exact design language)
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
          <img src={url} alt={title} className="w-full h-full object-cover rounded-2xl" />
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

  const imageSlots = [
    { key: "imageUrl", title: "Image 1", url: imageUrl, setUrl: setImageUrl, ref: fileInputRef1, id: "veh-img-1" },
    { key: "secondImageUrl", title: "Image 2", url: secondImageUrl, setUrl: setSecondImageUrl, ref: fileInputRef2, id: "veh-img-2" },
    { key: "thirdImageUrl", title: "Image 3", url: thirdImageUrl, setUrl: setThirdImageUrl, ref: fileInputRef3, id: "veh-img-3" },
    { key: "fourthImageUrl", title: "Image 4", url: fourthImageUrl, setUrl: setFourthImageUrl, ref: fileInputRef4, id: "veh-img-4" },
    { key: "fifthImageUrl", title: "Image 5", url: fifthImageUrl, setUrl: setFifthImageUrl, ref: fileInputRef5, id: "veh-img-5" },
    { key: "sixthImageUrl", title: "Image 6", url: sixthImageUrl, setUrl: setSixthImageUrl, ref: fileInputRef6, id: "veh-img-6" },
    { key: "seventhImageUrl", title: "Image 7", url: seventhImageUrl, setUrl: setSeventhImageUrl, ref: fileInputRef7, id: "veh-img-7" },
    { key: "eightImageUrl", title: "Image 8", url: eightImageUrl, setUrl: setEightImageUrl, ref: fileInputRef8, id: "veh-img-8" },
  ];

  return (
    <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
      <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }} />

        <div className="p-6 md:p-8 space-y-7">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                <Sparkles size={14} style={{ color: THEME }} />
                Purchaser
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">Create Vehicle</div>
              <div className="mt-1 text-sm text-slate-500">Add / update vehicles, upload image, and manage status.</div>
            </div>

            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
              style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
            >
              <Car size={20} />
            </div>
          </div>

          {/* ✅ FORM PANEL (TOP) */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">
                  {editingVehicleId ? "Edit vehicle" : "Add new vehicle"}
                </div>
                <div className="mt-1 text-sm text-slate-500">Choose location → vendor → category, then fill details.</div>
              </div>

              {editingVehicleId && (
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

            <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/40">
              {/* ✅ FIRST ROW: Country/State/Destination/Vendor */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <MapPin size={12} style={{ color: THEME }} />
                    Country
                  </div>
                  <Select
                    options={countryOptions}
                    value={countryOpt}
                    onChange={(opt) => {
                      setCountryOpt(opt || null);
                      const id = opt?.value || "";
                      setSelectedCountry(id);
                    }}
                    placeholder="Select Country"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    classNamePrefix="veh-country"
                    getOptionValue={(o) => String(o._id || o.value)}
                    isClearable
                    isDisabled={!!editingVehicleId}
                  />
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <MapPin size={12} style={{ color: THEME }} />
                    State
                  </div>
                  <Select
                    options={stateOptions}
                    value={stateOpt}
                    onChange={(opt) => {
                      setStateOpt(opt || null);
                      const id = opt?.value || "";
                      setSelectedState(id);
                    }}
                    placeholder="Select State"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    classNamePrefix="veh-state"
                    getOptionValue={(o) => String(o._id || o.value)}
                    isClearable
                    isDisabled={!!editingVehicleId || !selectedCountry}
                  />
                  {!selectedCountry && (
                    <div className="mt-1 text-xs text-slate-400">Select country first to enable states.</div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <MapPin size={12} style={{ color: THEME }} />
                    Destination
                  </div>
                  <Select
                    options={destinationOptions}
                    value={destinationOpt}
                    onChange={(opt) => {
                      setDestinationOpt(opt || null);
                      const id = opt?.value || "";
                      setSelectedDestination(id);
                    }}
                    placeholder="Select Destination"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    classNamePrefix="veh-destination"
                    getOptionValue={(o) => String(o._id || o.value)}
                    isClearable
                    isDisabled={!!editingVehicleId || !selectedState}
                  />
                  {!selectedState && (
                    <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <User size={12} style={{ color: THEME }} />
                    Vendor
                  </div>
                  <Select
                    options={vendorOptions}
                    value={vendorOpt}
                    onChange={(opt) => {
                      setVendorOpt(opt || null);
                      const id = opt?.value || "";
                      setSelectedVendor(id);
                    }}
                    placeholder="Select Vendor"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    classNamePrefix="veh-vendor"
                    getOptionValue={(o) => String(o._id || o.value)}
                    isClearable
                    isDisabled={!!editingVehicleId || !selectedDestination}
                  />
                  {!selectedDestination && (
                    <div className="mt-1 text-xs text-slate-400">Select destination first to enable vendors.</div>
                  )}
                </div>
              </div>

              {/* ✅ SECOND ROW: Category/Vehicle/Percentage/Advance Percentage */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <Car size={12} style={{ color: THEME }} />
                    Category
                  </div>
                  <Select
                    options={categoryOptions}
                    value={categoryOpt}
                    onChange={(opt) => {
                      setCategoryOpt(opt || null);
                      setFormData((p) => ({ ...p, category: opt?.value || "" }));
                    }}
                    placeholder="Select vehicle category"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    classNamePrefix="veh-category"
                    getOptionValue={(o) => String(o.value)}
                    isClearable
                    isDisabled={!!editingVehicleId}
                  />
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <Car size={12} style={{ color: THEME }} />
                    Vehicle name
                  </div>
                  <input
                    type="text"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    disabled={!!editingVehicleId}
                    placeholder="Enter vehicle name"
                    className="
                      w-full rounded-2xl
                      border border-slate-300 bg-white/90
                      px-4 py-3 text-sm outline-none
                      shadow-sm focus:ring-2 transition
                      disabled:bg-white disabled:cursor-not-allowed
                    "
                    style={{ "--tw-ring-color": THEME }}
                  />
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <Percent size={12} style={{ color: THEME }} />
                    Commission percentage
                  </div>
                  <input
                    type="number"
                    placeholder="%"
                    value={formData.percentage || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, percentage: e.target.value }))}
                    className="
                      w-full rounded-2xl
                      border border-slate-300 bg-white/90
                      px-4 py-3 text-sm outline-none
                      shadow-inner focus:ring-2 transition
                    "
                    style={{ "--tw-ring-color": THEME }}
                    min={0}
                    max={100}
                  />
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <Percent size={12} style={{ color: THEME }} />
                    Advance percentage
                  </div>
                  <input
                    type="number"
                    placeholder="%"
                    value={formData.advancePercentage || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, advancePercentage: e.target.value }))}
                    className="
                      w-full rounded-2xl
                      border border-slate-300 bg-white/90
                      px-4 py-3 text-sm outline-none
                      shadow-inner focus:ring-2 transition
                    "
                    style={{ "--tw-ring-color": THEME }}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              {/* ✅ Images row (NOW show all 8 at once - no pager) */}
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
                        Vehicle images
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
                          await uploadAndSet({ file, setUrl: slot.setUrl });
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

              {/* Actions */}
              <div className="flex flex-col items-center gap-2">
                {editingVehicleId && (
                  <button
                    type="button"
                    onClick={clearEditAndReset}
                    aria-label="Clear edit and reset form"
                    className="
                      inline-flex items-center justify-center
                      w-8 h-8 rounded-full
                      bg-white/70 backdrop-blur-md
                      border border-slate-200 shadow
                      text-slate-700 hover:bg-white transition
                    "
                    title="Discard changes"
                  >
                    ×
                  </button>
                )}

                <div className="flex gap-3 w-full flex-col sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="
                      flex-1
                      rounded-2xl px-5 py-3.5
                      text-sm font-extrabold text-white
                      shadow-[0_16px_40px_rgba(133,112,238,0.35)]
                      hover:opacity-95 active:scale-[0.99]
                      transition
                      inline-flex items-center justify-center gap-2
                    "
                    style={{ background: THEME }}
                  >
                    {editingVehicleId ? "Update Vehicle" : "Create Vehicle"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ TABLE PANEL (BOTTOM) */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">Vehicles</div>
                <div className="mt-1 text-sm text-slate-500">View vehicles and manage status</div>
              </div>

              <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPageDir(1);
                    setPage(1);
                  }}
                  placeholder="Search by Destination"
                  className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                />
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait" custom={pageDir}>
                  <motion.div
                    key={`vehicles-page-${page}-${searchTerm}`}
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
                          <th className="px-5 py-3">Vehicle Name</th>
                          <th className="px-5 py-3">Category</th>
                          <th className="px-5 py-3">Vendor Name</th>
                          <th className="px-5 py-3">Destination</th>
                          <th className="px-5 py-3">Percentage</th>
                          <th className="px-5 py-3">Advance %</th>
                          <th className="px-5 py-3 text-center">Status</th>
                          <th className="px-5 py-3 text-center">Edit</th>
                        </tr>
                      </thead>

                      <tbody>
                        {vehicles.map((vehicle, idx) => (
                          <tr
                            key={vehicle._id}
                            className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                          >
                            <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + idx + 1}</td>
                            <td className="px-5 py-3 font-semibold">{vehicle.vehicle}</td>
                            <td className="px-5 py-3 font-semibold">{vehicle.category}</td>
                            <td className="px-5 py-3 font-semibold">{vehicle.vendor?.name || "-"}</td>
                            <td className="px-5 py-3 font-semibold">{vehicle.destination?.name || "-"}</td>
                            <td className="px-5 py-3 font-semibold">{vehicle.percentage ?? "-"}</td>
                            <td className="px-5 py-3 font-semibold">{vehicle.advancePercentage ?? "-"}</td>

                            <td className="px-5 py-3 text-center font-semibold">
                              {vehicle.activeStatus ? (
                                <button
                                  type="button"
                                  onClick={() => handleStatusClick(vehicle)}
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
                                  onClick={() => handleStatusClick(vehicle)}
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
                                onClick={() => handleEdit(vehicle)}
                                className="
                                  inline-flex items-center justify-center
                                  h-9 w-9 rounded-2xl
                                  border border-slate-200
                                  bg-white/80 hover:bg-white
                                  shadow-sm hover:shadow-md transition
                                  text-slate-700
                                "
                                title="Edit vehicle"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {vehicles.length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                              No vehicles found.
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
                disabled={page === 1}
                onClick={() => {
                  setPageDir(-1);
                  setPage((p) => Math.max(p - 1, 1));
                }}
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
                disabled={page === totalPages}
                onClick={() => {
                  setPageDir(1);
                  setPage((p) => p + 1);
                }}
                className={`
                  inline-flex items-center gap-2
                  px-3 py-2 rounded-xl border text-sm
                  ${
                    page === totalPages
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

        {showPopup && selectedVehicleRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                setSelectedVehicleRow(null);
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
                  {selectedVehicleRow.activeStatus ? "Deactivate" : "Activate"} Vehicle
                </h2>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold">{selectedVehicleRow.activeStatus ? "deactivate" : "activate"}</span>{" "}
                  the vehicle: <span className="font-semibold">{selectedVehicleRow.vehicle}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                    onClick={() => {
                      setShowPopup(false);
                      setSelectedVehicleRow(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
                    style={{ background: selectedVehicleRow.activeStatus ? "#ef4444" : "#22c55e" }}
                    onClick={handleToggleStatus}
                  >
                    {selectedVehicleRow.activeStatus ? "Deactivate" : "Activate"}
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

export default CreateVehicle;
