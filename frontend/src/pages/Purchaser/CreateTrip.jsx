// import React, { useState, useEffect, useRef, useMemo } from "react";
// import Select from "react-select";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   X,
//   ChevronDown,
//   ChevronRight,
//   CheckCircle,
//   XCircle,
//   Pencil,
//   Sparkles,
//   Search,
//   MapPin,
//   Route,
//   Image as ImageIcon,
//   ListChecks,
//   ChevronLeft,
//   ChevronRight as ChevronRightIcon,
// } from "lucide-react";
// import API from "../../api";
// import { toast } from "react-toastify";
// import uploadImageToCloudinary from "../../utils/uploadCloudinary";

// const CreateTrip = () => {
//   const THEME = "#8570EE";

//   const [countries, setCountries] = useState([]);
//   const [selectedCountry, setSelectedCountry] = useState("");
//   const [states, setStates] = useState([]);
//   const [selectedState, setSelectedState] = useState("");
//   const [destinations, setDestinations] = useState([]);
//   const [selectedDestination, setSelectedDestination] = useState("");
//   const [vendors, setVendors] = useState([]);
//   const [selectedVendor, setSelectedVendor] = useState("");
//   const [vehiclesCache, setVehiclesCache] = useState({});
//   const [trips, setTrips] = useState([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [page, setPage] = useState(1);

//   const [editingTripId, setEditingTripId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [selectedTrip, setSelectedTrip] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);

//   // ✅ UI-only: pagination animation direction
//   const [pageDir, setPageDir] = useState(1);

//   const [rows, setRows] = useState([
//     {
//       vendor: "",
//       category: "",
//       vehicle: "",
//       prices: [{ validFrom: "", validTo: "", price: "" }],
//       expanded: true,
//     },
//   ]);

//   const [formData, setFormData] = useState({
//     country: "",
//     state: "",
//     destination: "",
//     approxKm: "",
//     tripName: "",
//     description: "",
//   });

//   // ✅ 3 images (Vehicle-style)
//   const [image1, setImage1] = useState(null);
//   const [image2, setImage2] = useState(null);
//   const [image3, setImage3] = useState(null);

//   const [imageUrl, setImageUrl] = useState("");
//   const [secondImageUrl, setSecondImageUrl] = useState("");
//   const [thirdImageUrl, setThirdImageUrl] = useState("");

//   const fileInputRef1 = useRef(null);
//   const fileInputRef2 = useRef(null);
//   const fileInputRef3 = useRef(null);

//   const fetchTrips = async () => {
//     try {
//       const res = await API.get(`/purchaser/trips?page=${page}&search=${search}`);
//       setTrips(res.data.trips);
//       setTotalPages(res.data.totalPages);
//     } catch {
//       toast.error("Failed to load trips");
//     }
//   };
//   useEffect(() => {
//     fetchTrips();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, search]);

//   useEffect(() => {
//     const fetchCountries = async () => {
//       try {
//         const res = await API.get("/purchaser/countries");
//         setCountries(res.data);
//       } catch (err) {
//         toast.error(`Error fetching countries: ${err.message}`);
//       }
//     };
//     fetchCountries();
//   }, []);

//   useEffect(() => {
//     if (selectedCountry) {
//       if (editingTripId) return;
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
//       setSelectedDestination("");
//     }
//   }, [selectedCountry, editingTripId]);

//   useEffect(() => {
//     if (selectedCountry && selectedState) {
//       if (editingTripId) return;
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
//     }
//   }, [selectedState, selectedCountry, editingTripId]);

//   useEffect(() => {
//     if (!selectedCountry || !selectedState || !selectedDestination) return;

//     // 🔐 IMPORTANT: don't auto-reset when editing prefilled data
//     if (editingTripId) return;

//     const fetchVendors = async () => {
//       try {
//         const res = await API.get(
//           `/purchaser/vendorsOfVehicles/${selectedCountry}/${selectedState}/${selectedDestination}`
//         );
//         setVendors(res.data);
//       } catch (err) {
//         toast.error("Error fetching vendors:", err);
//       }
//     };

//     fetchVendors();

//     setSelectedVendor("");
//     setVehiclesCache({});
//     setRows([
//       {
//         vendor: "",
//         category: "",
//         vehicle: "",
//         prices: [{ validFrom: "", validTo: "", price: "" }],
//         expanded: true,
//       },
//     ]);
//   }, [selectedCountry, selectedState, selectedDestination, editingTripId]);

//   const addRow = () => {
//     setRows([
//       ...rows,
//       {
//         vendor: "",
//         category: "",
//         vehicle: "",
//         prices: [{ validFrom: "", validTo: "", price: "" }],
//         expanded: true,
//       },
//     ]);
//   };
//   const removeRow = (index) => {
//     const updated = [...rows];
//     updated.splice(index, 1);
//     setRows(updated);
//   };
//   const addPriceRow = (rowIndex) => {
//     const updated = [...rows];
//     updated[rowIndex].prices.push({ validFrom: "", validTo: "", price: "" });
//     setRows(updated);
//   };
//   const removePriceRow = (rowIndex, priceIndex) => {
//     const updated = [...rows];
//     updated[rowIndex].prices.splice(priceIndex, 1);
//     setRows(updated);
//   };
//   const toggleExpand = (index) => {
//     const updated = [...rows];
//     updated[index].expanded = !updated[index].expanded;
//     setRows(updated);
//   };
//   const handlePriceChange = (rowIndex, priceIndex, field, value) => {
//     const updated = [...rows];
//     updated[rowIndex].prices[priceIndex][field] = value;
//     setRows(updated);
//   };

//   const handleEditTrip = async (trip) => {
//     setEditingTripId(trip._id);

//     // basic form fields
//     setFormData({
//       tripName: trip.tripName,
//       country: trip.country._id,
//       state: trip.state._id,
//       destination: trip.destination._id,
//       description: trip.description,
//       approxKm: trip.approxKm,
//     });

//     // ✅ prefill 3 images
//     setImageUrl(trip.imageUrl || "");
//     setSecondImageUrl(trip.secondImageUrl || "");
//     setThirdImageUrl(trip.thirdImageUrl || "");
//     setImage1(null);
//     setImage2(null);
//     setImage3(null);

//     setSelectedCountry(trip.country._id);

//     // 1) States
//     try {
//       const statesRes = await API.get(`/purchaser/states/${trip.country._id}`);
//       setStates(statesRes.data);
//     } catch {
//       toast.error("Error fetching states");
//       return;
//     }
//     setSelectedState(trip.state._id);

//     // 2) Destinations (include current even if inactive)
//     try {
//       const destRes = await API.get(
//         `/purchaser/destinationsByCountryAndState/${trip.country._id}/${trip.state._id}?currentDestinationId=${trip.destination._id}`
//       );
//       setDestinations(destRes.data);
//     } catch {
//       toast.error("Error fetching destinations");
//       return;
//     }
//     setSelectedDestination(trip.destination._id);

//     // 3) Vendors (include all vendors used in this trip, even if inactive)
//     const vendorIdSet = new Set((trip.vehicles || []).map((v) => v.vendor?._id).filter(Boolean));
//     const vendorIdCsv = Array.from(vendorIdSet).join(",");

//     try {
//       const vendorsRes = await API.get(
//         `/purchaser/vendorsOfVehicles/${trip.country._id}/${trip.state._id}/${trip.destination._id}?currentVendorId=${encodeURIComponent(
//           vendorIdCsv
//         )}`
//       );
//       setVendors(vendorsRes.data);
//     } catch {
//       toast.error("Error fetching vendors");
//       return;
//     }

//     // 4) Vehicles (per vendor – include any inactive ones used in this trip)
//     const vendorToVehicleIds = {};
//     (trip.vehicles || []).forEach((vg) => {
//       const vId = vg.vendor?._id;
//       const vehId = vg.vehicle?._id;
//       if (!vId || !vehId) return;
//       if (!vendorToVehicleIds[vId]) vendorToVehicleIds[vId] = new Set();
//       vendorToVehicleIds[vId].add(vehId);
//     });

//     const newVehiclesCache = {};
//     for (const [vendorId, idSet] of Object.entries(vendorToVehicleIds)) {
//       const csv = Array.from(idSet).join(",");
//       try {
//         const res = await API.get(
//           `/purchaser/vehiclesForTrip/${trip.country._id}/${trip.state._id}/${trip.destination._id}/${vendorId}?currentVehicleIds=${encodeURIComponent(
//             csv
//           )}`
//         );
//         newVehiclesCache[vendorId] = res.data;
//       } catch {
//         toast.error("Error loading vehicles for vendor");
//       }
//     }
//     setVehiclesCache(newVehiclesCache);

//     // 5) Rows prefill
//     setRows(
//       (trip.vehicles || []).map((v) => ({
//         vendor: v.vendor?._id || "",
//         category: v.category || "",
//         vehicle: v.vehicle?._id || "",
//         prices: (v.prices || []).map((p) => ({
//           validFrom: p.validFrom?.slice(0, 10) || "",
//           validTo: p.validTo?.slice(0, 10) || "",
//           price: p.price ?? "",
//         })),
//         expanded: true,
//       }))
//     );

//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const validateVehiclePriceRanges = (rowsArg) => {
//     const vehicleDateMap = new Map();

//     for (let r = 0; r < rowsArg.length; r++) {
//       const row = rowsArg[r];
//       const vehicleId = row.vehicle;
//       if (!vehicleId) continue;

//       if (!vehicleDateMap.has(vehicleId)) vehicleDateMap.set(vehicleId, []);

//       for (let i = 0; i < row.prices.length; i++) {
//         const p = row.prices[i];
//         const from = new Date(p.validFrom);
//         const to = new Date(p.validTo);

//         if (from > to) {
//           toast.error(`Row ${r + 1}, Entry ${i + 1}: 'Valid From' must be before 'Valid To'`);
//           return false;
//         }

//         const existing = vehicleDateMap.get(vehicleId);
//         for (const range of existing) {
//           const overlap = from <= range.to && to >= range.from;
//           if (overlap) {
//             toast.error(
//               `Overlap for vehicle in:\n- Row ${r + 1}, Entry ${i + 1} \n- Row ${range.rowIndex + 1}, Entry ${
//                 range.entryIndex + 1
//               }`
//             );
//             return false;
//           }
//         }
//         existing.push({ from, to, rowIndex: r, entryIndex: i });
//       }
//     }
//     return true;
//   };

//   const handleCreateTrip = async () => {
//     const required = [
//       { key: "country", label: "Country" },
//       { key: "state", label: "State" },
//       { key: "destination", label: "Destination" },
//       { key: "tripName", label: "Trip Name" },
//       { key: "description", label: "Trip Description" },
//     ];

//     for (const f of required) {
//       const v = formData[f.key];
//       if (!v || (typeof v === "string" && v.trim() === "")) {
//         toast.error(`${f.label} is mandatory`);
//         return;
//       }
//     }

//     const hasRow = rows.some((row) => row.vendor && row.category && row.vehicle);
//     if (!hasRow) {
//       toast.error("Please add atleast one vehicle.");
//       return;
//     }

//     if (!validateVehiclePriceRanges(rows)) return;

//     try {
//       const payload = {
//         formData: {
//           ...formData,
//           imageUrl,
//           secondImageUrl,
//           thirdImageUrl,
//         },
//         rows,
//       };

//       if (editingTripId) {
//         await API.put(`/purchaser/updateTrip/${editingTripId}`, payload);
//         toast.success("Trip updated successfully!");
//       } else {
//         await API.post("/purchaser/createTrip", payload);
//         toast.success("Trip created successfully!");
//       }

//       setFormData({
//         country: "",
//         state: "",
//         destination: "",
//         approxKm: "",
//         tripName: "",
//         description: "",
//       });

//       // ✅ clear images
//       setImageUrl("");
//       setSecondImageUrl("");
//       setThirdImageUrl("");
//       setImage1(null);
//       setImage2(null);
//       setImage3(null);
//       if (fileInputRef1.current) fileInputRef1.current.value = "";
//       if (fileInputRef2.current) fileInputRef2.current.value = "";
//       if (fileInputRef3.current) fileInputRef3.current.value = "";

//       setRows([
//         {
//           vendor: "",
//           category: "",
//           vehicle: "",
//           prices: [{ validFrom: "", validTo: "", price: "" }],
//           expanded: true,
//         },
//       ]);
//       setSelectedCountry("");
//       setSelectedState("");
//       setSelectedDestination("");
//       setSelectedVendor("");
//       setVendors([]);
//       setVehiclesCache({});
//       setStates([]);
//       setDestinations([]);
//       setEditingTripId(null);
//       fetchTrips();
//     } catch {
//       toast.error("Failed to save trip");
//     }
//   };

//   const handleStatusClick = (trip) => {
//     setSelectedTrip(trip);
//     setShowPopup(true);
//   };

//   const handleToggleStatus = async () => {
//     if (!selectedTrip) return;

//     try {
//       const updatedStatus = !selectedTrip.activeStatus;
//       const res = await API.patch(`/purchaser/updateTripStatus/${selectedTrip._id}/status`, {
//         activeStatus: updatedStatus,
//       });

//       if (res.data.success) {
//         toast.success(`Trip ${updatedStatus ? "activated" : "deactivated"} successfully`);
//         await fetchTrips();
//       } else {
//         toast.error("Update failed");
//       }
//     } catch {
//       toast.error("Server error");
//     } finally {
//       setShowPopup(false);
//       setSelectedTrip(null);
//     }
//   };

//   // ✅ Premium table animation variants (UI-only)
//   const tableVariants = {
//     enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
//     center: { x: 0, opacity: 1, filter: "blur(0px)" },
//     exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
//   };

//   // ✅ Premium react-select (same standard as others)
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

//   const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
//   const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
//   const destinationOptions = destinations.map((d) => ({
//     value: d._id,
//     label: d.activeStatus === false ? `${d.name} (inactive)` : d.name,
//   }));
//   const vendorOptions = vendors.map((v) => ({
//     value: v._id,
//     label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
//   }));

//   // ✅ helper: upload and set URL without changing your UX
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

//   // ✅ reusable image tile (Vehicle-style + "no white gaps" fix)
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
//             className="block w-full h-full object-cover object-center rounded-2xl"
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

//   const clearAllPrefill = () => {
//     setEditingTripId(null);
//     setSelectedCountry("");
//     setSelectedState("");
//     setSelectedDestination("");
//     setSelectedVendor("");
//     setStates([]);
//     setDestinations([]);
//     setVendors([]);
//     setVehiclesCache({});
//     setRows([
//       {
//         vendor: "",
//         category: "",
//         vehicle: "",
//         prices: [{ validFrom: "", validTo: "", price: "" }],
//         expanded: true,
//       },
//     ]);
//     setFormData({
//       country: "",
//       state: "",
//       destination: "",
//       approxKm: "",
//       tripName: "",
//       description: "",
//     });

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
//                 Create Day Trip
//               </div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Create / update day trips, add vehicle pricing ranges, and manage status.
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {editingTripId && (
//                 <button
//                   type="button"
//                   onClick={clearAllPrefill}
//                   title="Discard edit / reset"
//                   className="
//                     inline-flex items-center justify-center
//                     w-10 h-10 rounded-2xl
//                     bg-white/70 backdrop-blur-md
//                     border border-slate-200
//                     shadow hover:bg-white transition
//                     text-slate-700
//                   "
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               )}

//               <div
//                 className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
//                 style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
//               >
//                 <Route size={20} />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-6">
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">
//                     {editingTripId ? "Edit day trip" : "Add new day trip"}
//                   </div>
//                   <div className="mt-1 text-sm text-slate-500">
//                     Pick location, fill trip details, then add at least one vehicle with valid date ranges.
//                   </div>
//                 </div>

//                 {editingTripId && (
//                   <button
//                     type="button"
//                     onClick={clearAllPrefill}
//                     aria-label="Clear edit and reset form"
//                     title="Discard changes"
//                     className="
//                       inline-flex items-center justify-center
//                       w-9 h-9 rounded-2xl
//                       bg-white/70 backdrop-blur-md
//                       border border-slate-200
//                       shadow hover:bg-white transition
//                       text-slate-700
//                     "
//                   >
//                     ×
//                   </button>
//                 )}
//               </div>

//               <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/40">
//                 {/* Location + Approx KM */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <MapPin size={12} style={{ color: THEME }} />
//                       Country
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={countryOptions}
//                       placeholder="Select Country"
//                       value={countryOptions.find((o) => o.value === selectedCountry) || null}
//                       onChange={(opt) => {
//                         const value = opt?.value || "";
//                         setSelectedCountry(value);
//                         setFormData({ ...formData, country: value });
//                       }}
//                       isDisabled={!!editingTripId}
//                       isClearable
//                       classNamePrefix="trip-country"
//                       menuPortalTarget={document.body}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <MapPin size={12} style={{ color: THEME }} />
//                       State
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={stateOptions}
//                       placeholder="Select State"
//                       value={stateOptions.find((o) => o.value === selectedState) || null}
//                       onChange={(opt) => {
//                         const value = opt?.value || "";
//                         setSelectedState(value);
//                         setFormData((prev) => ({ ...prev, state: value }));
//                       }}
//                       isDisabled={!!editingTripId || !selectedCountry}
//                       isClearable
//                       classNamePrefix="trip-state"
//                       menuPortalTarget={document.body}
//                     />
//                     {!selectedCountry && (
//                       <div className="mt-1 text-xs text-slate-400">Select country first to enable states.</div>
//                     )}
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <MapPin size={12} style={{ color: THEME }} />
//                       Destination
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={destinationOptions}
//                       placeholder="Select Destination"
//                       value={destinationOptions.find((o) => o.value === selectedDestination) || null}
//                       onChange={(opt) => {
//                         const value = opt?.value || "";
//                         setSelectedDestination(value);
//                         setFormData((prev) => ({ ...prev, destination: value }));
//                       }}
//                       isDisabled={!!editingTripId || !selectedState}
//                       isClearable
//                       classNamePrefix="trip-destination"
//                       menuPortalTarget={document.body}
//                     />
//                     {!selectedState && (
//                       <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
//                     )}
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <Route size={12} style={{ color: THEME }} />
//                       Approx KM
//                     </div>
//                     <input
//                       type="text"
//                       placeholder="Approx KM"
//                       className="
//                         w-full rounded-2xl border border-slate-300 bg-white/90
//                         px-4 py-3 text-sm outline-none shadow-sm
//                         focus:ring-2 transition
//                       "
//                       style={{ "--tw-ring-color": THEME }}
//                       value={formData.approxKm}
//                       onChange={(e) => setFormData({ ...formData, approxKm: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 {/* Trip Name */}
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <ListChecks size={12} style={{ color: THEME }} />
//                     Day Trip Name
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Day Trip Name"
//                     className="
//                       w-full rounded-2xl border border-slate-300 bg-white/90
//                       px-4 py-3 text-sm outline-none shadow-sm
//                       focus:ring-2 transition
//                     "
//                     style={{ "--tw-ring-color": THEME }}
//                     value={formData.tripName}
//                     onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
//                   />
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <ListChecks size={12} style={{ color: THEME }} />
//                     Day Trip Description
//                   </div>
//                   <textarea
//                     placeholder="Enter trip description..."
//                     className="
//                       w-full h-28 resize-none
//                       rounded-2xl border border-slate-300 bg-white/90
//                       px-4 py-3 text-sm outline-none shadow-sm
//                       focus:ring-2 transition
//                     "
//                     style={{ "--tw-ring-color": THEME }}
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   />
//                 </div>

//                 {/* ✅ Trip Images (Vehicle-style 3 slots) */}
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
//                           Trip images
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
//                         inputId="trip-image-upload-1"
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
//                         inputId="trip-image-upload-2"
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
//                         inputId="trip-image-upload-3"
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

//                 {/* Vehicle Rows (UNCHANGED) */}
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between gap-2 flex-wrap">
//                     <div>
//                       <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Vehicles</div>
//                       <div className="mt-1 text-sm text-slate-500">
//                         Add vendor → category → vehicle, then define non-overlapping date ranges.
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={addRow}
//                       className="
//                         inline-flex items-center gap-2
//                         px-4 py-2 rounded-2xl
//                         border border-slate-200
//                         bg-white hover:bg-slate-50
//                         shadow-sm hover:shadow-md transition
//                         text-slate-700 font-semibold
//                       "
//                     >
//                       <Plus size={16} style={{ color: THEME }} />
//                       Add vehicle row
//                     </button>
//                   </div>

//                   {rows.map((row, rowIndex) => {
//                     const vendorVehicleList = vehiclesCache[row.vendor] || [];

//                     const categoryOptions = Array.from(new Set(vendorVehicleList.map((v) => v.category))).map(
//                       (c) => ({ value: c, label: c })
//                     );

//                     const vehicleOptions = vendorVehicleList
//                       .filter((v) => v.category === row.category)
//                       .map((v) => ({
//                         value: v._id,
//                         label: v.activeStatus === false ? `${v.vehicle} (inactive)` : v.vehicle,
//                       }));

//                     return (
//                       <div
//                         key={rowIndex}
//                         className="
//                           rounded-[22px]
//                           border border-slate-200
//                           bg-white
//                           shadow-[0_10px_30px_rgba(15,23,42,0.08)]
//                           overflow-hidden
//                         "
//                       >
//                         <div className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50/60">
//                           <div className="grid grid-cols-1 lg:grid-cols-[44px_1fr_1fr_1fr_auto] gap-3 items-center">
//                             <button
//                               type="button"
//                               onClick={() => toggleExpand(rowIndex)}
//                               className="
//                                 w-11 h-11
//                                 flex items-center justify-center
//                                 rounded-2xl
//                                 border border-slate-200
//                                 bg-white hover:bg-slate-50
//                                 shadow-sm hover:shadow-md
//                                 transition
//                               "
//                               title={row.expanded ? "Collapse" : "Expand"}
//                             >
//                               {row.expanded ? (
//                                 <ChevronDown size={18} className="text-slate-700" />
//                               ) : (
//                                 <ChevronRight size={18} className="text-slate-700" />
//                               )}
//                             </button>

//                             <Select
//                               styles={selectStyles}
//                               options={vendorOptions}
//                               placeholder="Select Vendor"
//                               value={vendorOptions.find((o) => o.value === row.vendor) || null}
//                               onChange={async (opt) => {
//                                 const selected = opt?.value || "";
//                                 const updated = [...rows];
//                                 updated[rowIndex].vendor = selected;
//                                 updated[rowIndex].category = "";
//                                 updated[rowIndex].vehicle = "";
//                                 setRows(updated);

//                                 if (vehiclesCache[selected]) return;

//                                 if (selectedCountry && selectedState && selectedDestination && selected) {
//                                   try {
//                                     const res = await API.get(
//                                       `/purchaser/vehiclesForTrip/${selectedCountry}/${selectedState}/${selectedDestination}/${selected}`
//                                     );
//                                     setVehiclesCache((prev) => ({ ...prev, [selected]: res.data }));
//                                   } catch (err) {
//                                     toast.error("Error fetching vehicles:", err);
//                                   }
//                                 }
//                               }}
//                               isClearable
//                               classNamePrefix="trip-vendor"
//                               menuPortalTarget={document.body}
//                             />

//                             <Select
//                               styles={selectStyles}
//                               options={categoryOptions}
//                               placeholder="Select vehicle category"
//                               value={row.category ? { value: row.category, label: row.category } : null}
//                               onChange={(opt) => {
//                                 const updated = [...rows];
//                                 updated[rowIndex].category = opt?.value || "";
//                                 updated[rowIndex].vehicle = "";
//                                 setRows(updated);
//                               }}
//                               isClearable
//                               classNamePrefix="trip-category"
//                               menuPortalTarget={document.body}
//                             />

//                             <Select
//                               styles={selectStyles}
//                               options={vehicleOptions}
//                               placeholder="Select vehicle"
//                               value={vehicleOptions.find((o) => o.value === row.vehicle) || null}
//                               onChange={(opt) => {
//                                 const updated = [...rows];
//                                 updated[rowIndex].vehicle = opt?.value || "";
//                                 setRows(updated);
//                               }}
//                               isClearable
//                               classNamePrefix="trip-vehicle"
//                               menuPortalTarget={document.body}
//                             />

//                             <div className="flex justify-end">
//                               {rowIndex === 0 ? (
//                                 <button
//                                   type="button"
//                                   onClick={addRow}
//                                   className="
//                                     inline-flex items-center justify-center
//                                     w-11 h-11 rounded-2xl
//                                     text-white font-bold
//                                     shadow-[0_12px_28px_rgba(133,112,238,0.35)]
//                                     hover:opacity-95 active:scale-[0.99] transition
//                                   "
//                                   style={{ background: THEME }}
//                                   title="Add Vehicle"
//                                 >
//                                   <Plus size={18} />
//                                 </button>
//                               ) : (
//                                 <button
//                                   type="button"
//                                   onClick={() => removeRow(rowIndex)}
//                                   className="
//                                     inline-flex items-center justify-center
//                                     w-11 h-11 rounded-2xl
//                                     border border-red-200
//                                     bg-red-50 hover:bg-red-100
//                                     text-red-600
//                                     shadow-sm
//                                     transition
//                                   "
//                                   title="Remove Vehicle"
//                                 >
//                                   <X size={18} />
//                                 </button>
//                               )}
//                             </div>
//                           </div>

//                           {row.expanded && (
//                             <div className="mt-4 space-y-3">
//                               {row.prices.map((priceRow, priceIndex) => (
//                                 <div
//                                   key={priceIndex}
//                                   className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center"
//                                 >
//                                   <input
//                                     type="date"
//                                     className="
//                                       w-full rounded-2xl border border-slate-300 bg-white/90
//                                       px-4 py-3 text-sm outline-none shadow-sm
//                                       focus:ring-2 transition
//                                     "
//                                     style={{ "--tw-ring-color": THEME }}
//                                     placeholder="Valid From"
//                                     value={priceRow.validFrom}
//                                     onChange={(e) =>
//                                       handlePriceChange(rowIndex, priceIndex, "validFrom", e.target.value)
//                                     }
//                                   />

//                                   <input
//                                     type="date"
//                                     className="
//                                       w-full rounded-2xl border border-slate-300 bg-white/90
//                                       px-4 py-3 text-sm outline-none shadow-sm
//                                       focus:ring-2 transition
//                                     "
//                                     style={{ "--tw-ring-color": THEME }}
//                                     placeholder="Valid To"
//                                     value={priceRow.validTo}
//                                     onChange={(e) =>
//                                       handlePriceChange(rowIndex, priceIndex, "validTo", e.target.value)
//                                     }
//                                   />

//                                   <input
//                                     type="text"
//                                     placeholder="Price"
//                                     className="
//                                       w-full rounded-2xl border border-slate-300 bg-white/90
//                                       px-4 py-3 text-sm outline-none shadow-sm
//                                       focus:ring-2 transition
//                                     "
//                                     style={{ "--tw-ring-color": THEME }}
//                                     value={priceRow.price}
//                                     onChange={(e) =>
//                                       handlePriceChange(rowIndex, priceIndex, "price", e.target.value)
//                                     }
//                                   />

//                                   <div className="flex justify-end">
//                                     {priceIndex === 0 ? (
//                                       <button
//                                         type="button"
//                                         onClick={() => addPriceRow(rowIndex)}
//                                         className="
//                                           inline-flex items-center justify-center
//                                           w-11 h-11 rounded-2xl
//                                           text-white font-bold
//                                           shadow-[0_12px_28px_rgba(133,112,238,0.35)]
//                                           hover:opacity-95 active:scale-[0.99] transition
//                                         "
//                                         style={{ background: THEME }}
//                                         title="Add Price Row"
//                                       >
//                                         <Plus size={18} />
//                                       </button>
//                                     ) : (
//                                       <button
//                                         type="button"
//                                         onClick={() => removePriceRow(rowIndex, priceIndex)}
//                                         className="
//                                           inline-flex items-center justify-center
//                                           w-11 h-11 rounded-2xl
//                                           border border-red-200
//                                           bg-red-50 hover:bg-red-100
//                                           text-red-600
//                                           shadow-sm
//                                           transition
//                                         "
//                                         title="Remove Price Row"
//                                       >
//                                         <X size={18} />
//                                       </button>
//                                     )}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleCreateTrip}
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
//                   {editingTripId ? "Update Trip" : "Create Trip"}
//                 </button>
//               </div>
//             </div>

//             {/* TABLE (unchanged) */}
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">Trips</div>
//                   <div className="mt-1 text-sm text-slate-500">Search and edit trips</div>
//                 </div>

//                 <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
//                   <Search className="h-4 w-4 text-slate-500" />
//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => {
//                       setSearch(e.target.value);
//                       setPageDir(1);
//                       setPage(1);
//                     }}
//                     placeholder="Search by trip name..."
//                     className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
//                   />
//                 </div>
//               </div>

//               <div className="relative overflow-hidden">
//                 <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                   <AnimatePresence mode="wait" custom={pageDir}>
//                     <motion.div
//                       key={`trip-page-${page}-${search}`}
//                       custom={pageDir}
//                       variants={tableVariants}
//                       initial="enter"
//                       animate="center"
//                       exit="exit"
//                       transition={{ duration: 0.22, ease: "easeOut" }}
//                       className="w-full"
//                       style={{ overflow: "visible" }}
//                     >
//                       <table className="w-full text-sm text-left text-slate-700 min-w-[980px]">
//                         <thead>
//                           <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
//                             <th className="px-5 py-3">Sl No</th>
//                             <th className="px-5 py-3">Trip Name</th>
//                             <th className="px-5 py-3">Country</th>
//                             <th className="px-5 py-3">State</th>
//                             <th className="px-5 py-3">Destination</th>
//                             <th className="px-5 py-3">Approx KM</th>
//                             <th className="px-5 py-3">Status</th>
//                             <th className="px-5 py-3 text-center">Action</th>
//                           </tr>
//                         </thead>

//                         <tbody>
//                           {trips.map((entry, index) => (
//                             <tr
//                               key={entry._id || index}
//                               className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
//                             >
//                               <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
//                               <td className="px-5 py-3 font-semibold">{entry.tripName}</td>
//                               <td className="px-5 py-3 font-semibold">{entry.country?.name}</td>
//                               <td className="px-5 py-3 font-semibold">{entry.state?.name}</td>
//                               <td className="px-5 py-3 font-semibold">{entry.destination?.name}</td>
//                               <td className="px-5 py-3 font-semibold">{entry.approxKm}</td>

//                               <td className="px-5 py-3 font-semibold">
//                                 {entry.activeStatus ? (
//                                   <button
//                                     type="button"
//                                     onClick={() => handleStatusClick(entry)}
//                                     className="
//                                       inline-flex items-center gap-2
//                                       px-3 py-1.5 rounded-full
//                                       text-xs font-semibold
//                                       border
//                                       bg-emerald-50 text-emerald-700 border-emerald-200
//                                       hover:bg-emerald-100 transition
//                                     "
//                                   >
//                                     <CheckCircle className="w-4 h-4" />
//                                     Active
//                                   </button>
//                                 ) : (
//                                   <button
//                                     type="button"
//                                     onClick={() => handleStatusClick(entry)}
//                                     className="
//                                       inline-flex items-center gap-2
//                                       px-3 py-1.5 rounded-full
//                                       text-xs font-semibold
//                                       border
//                                       bg-red-50 text-red-700 border-red-200
//                                       hover:bg-red-100 transition
//                                     "
//                                   >
//                                     <XCircle className="w-4 h-4" />
//                                     Inactive
//                                   </button>
//                                 )}
//                               </td>

//                               <td className="px-5 py-3 text-center">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleEditTrip(entry)}
//                                   className="
//                                     inline-flex items-center justify-center
//                                     h-9 w-9 rounded-2xl
//                                     border border-slate-200
//                                     bg-white/80 hover:bg-white
//                                     shadow-sm hover:shadow-md transition
//                                     text-slate-700
//                                   "
//                                   title="Edit trip"
//                                 >
//                                   <Pencil className="w-4 h-4" />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}

//                           {trips.length === 0 && (
//                             <tr>
//                               <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
//                                 No trips found.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </motion.div>
//                   </AnimatePresence>
//                 </div>
//               </div>

//               <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
//                 <button
//                   onClick={() => {
//                     setPageDir(-1);
//                     setPage((prev) => Math.max(1, prev - 1));
//                   }}
//                   disabled={page === 1}
//                   className={`
//                     inline-flex items-center gap-2
//                     px-3 py-2 rounded-xl border text-sm
//                     ${
//                       page === 1
//                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                         : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                     }
//                   `}
//                 >
//                   <ChevronLeft size={16} />
//                   Previous
//                 </button>

//                 <span className="px-4 py-2 rounded-xl bg-[#8570EE]/10 text-[#8570EE] font-bold border border-[#8570EE]/25">
//                   {page} / {totalPages}
//                 </span>

//                 <button
//                   onClick={() => {
//                     setPageDir(1);
//                     setPage((prev) => Math.min(totalPages, prev + 1));
//                   }}
//                   disabled={page === totalPages}
//                   className={`
//                     inline-flex items-center gap-2
//                     px-3 py-2 rounded-xl border text-sm
//                     ${
//                       page === totalPages
//                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                         : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                     }
//                   `}
//                 >
//                   Next
//                   <ChevronRightIcon size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {showPopup && selectedTrip && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               onClick={() => {
//                 setShowPopup(false);
//                 setSelectedTrip(null);
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
//                   {selectedTrip.activeStatus ? "Deactivate" : "Activate"} Trip
//                 </h2>

//                 <p className="mt-3 text-slate-600 text-sm leading-relaxed">
//                   Are you sure you want to{" "}
//                   <span className="font-bold">{selectedTrip.activeStatus ? "deactivate" : "activate"}</span>{" "}
//                   the trip: <span className="font-semibold">{selectedTrip.tripName}</span>?
//                 </p>

//                 <div className="mt-6 flex justify-end gap-2">
//                   <button
//                     className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
//                     onClick={() => {
//                       setShowPopup(false);
//                       setSelectedTrip(null);
//                     }}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
//                     style={{ background: selectedTrip.activeStatus ? "#ef4444" : "#22c55e" }}
//                     onClick={handleToggleStatus}
//                   >
//                     {selectedTrip.activeStatus ? "Deactivate" : "Activate"}
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

// export default CreateTrip;

import React, { useState, useEffect, useRef, useMemo } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Pencil,
  Sparkles,
  Search,
  MapPin,
  Route,
  Image as ImageIcon,
  ListChecks,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const CreateTrip = () => {
  const THEME = "#8570EE";

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vehiclesCache, setVehiclesCache] = useState({});
  const [trips, setTrips] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [editingTripId, setEditingTripId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ UI-only: pagination animation direction
  const [pageDir, setPageDir] = useState(1);

  const [rows, setRows] = useState([
    {
      vendor: "",
      category: "",
      vehicle: "",
      prices: [{ validFrom: "", validTo: "", price: "" }],
      expanded: true,
    },
  ]);

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    approxKm: "",
    tripName: "",
    description: "",
  });

  /* ============================
      ✅ 8 IMAGES (AddOnTrip-style)
     - files: UI only
     - urls: sent to backend
  ============================ */
  const [images, setImages] = useState(Array(8).fill(null)); // files (UI only)
  const [imageUrls, setImageUrls] = useState(Array(8).fill("")); // stored URLs
  const fileInputRefs = useRef(Array.from({ length: 8 }, () => React.createRef()));

  const fetchTrips = async () => {
    try {
      const res = await API.get(`/purchaser/trips?page=${page}&search=${search}`);
      setTrips(res.data.trips);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load trips");
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data);
      } catch (err) {
        toast.error(`Error fetching countries: ${err.message}`);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      if (editingTripId) return;
      const fetchStates = async () => {
        try {
          const res = await API.get(`/purchaser/states/${selectedCountry}`);
          setStates(res.data);
        } catch (err) {
          toast.error("Error fetching states:", err);
        }
      };
      fetchStates();
      setSelectedState("");
      setDestinations([]);
      setSelectedDestination("");
    }
  }, [selectedCountry, editingTripId]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      if (editingTripId) return;
      const fetchDestinations = async () => {
        try {
          const res = await API.get(
            `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
          );
          setDestinations(res.data);
        } catch (err) {
          toast.error("Error fetching destinations:", err);
        }
      };
      fetchDestinations();
      setSelectedDestination("");
    }
  }, [selectedState, selectedCountry, editingTripId]);

  useEffect(() => {
    if (!selectedCountry || !selectedState || !selectedDestination) return;
    if (editingTripId) return;

    const fetchVendors = async () => {
      try {
        const res = await API.get(
          `/purchaser/vendorsOfVehicles/${selectedCountry}/${selectedState}/${selectedDestination}`
        );
        setVendors(res.data);
      } catch (err) {
        toast.error("Error fetching vendors:", err);
      }
    };

    fetchVendors();

    setSelectedVendor("");
    setVehiclesCache({});
    setRows([
      {
        vendor: "",
        category: "",
        vehicle: "",
        prices: [{ validFrom: "", validTo: "", price: "" }],
        expanded: true,
      },
    ]);
  }, [selectedCountry, selectedState, selectedDestination, editingTripId]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        vendor: "",
        category: "",
        vehicle: "",
        prices: [{ validFrom: "", validTo: "", price: "" }],
        expanded: true,
      },
    ]);
  };
  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };
  const addPriceRow = (rowIndex) => {
    const updated = [...rows];
    updated[rowIndex].prices.push({ validFrom: "", validTo: "", price: "" });
    setRows(updated);
  };
  const removePriceRow = (rowIndex, priceIndex) => {
    const updated = [...rows];
    updated[rowIndex].prices.splice(priceIndex, 1);
    setRows(updated);
  };
  const toggleExpand = (index) => {
    const updated = [...rows];
    updated[index].expanded = !updated[index].expanded;
    setRows(updated);
  };
  const handlePriceChange = (rowIndex, priceIndex, field, value) => {
    const updated = [...rows];
    updated[rowIndex].prices[priceIndex][field] = value;
    setRows(updated);
  };

  // ✅ helper: upload and set URL without changing your UX (index-based)
  const uploadAndSetIndex = async (index, file) => {
    if (!file) return;
    try {
      const result = await uploadImageToCloudinary(file);

      setImages((prev) => {
        const copy = [...prev];
        copy[index] = file;
        return copy;
      });

      setImageUrls((prev) => {
        const copy = [...prev];
        copy[index] = result.secure_url;
        return copy;
      });

      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed");
    }
  };

  const clearImageIndex = (index) => {
    setImages((prev) => {
      const copy = [...prev];
      copy[index] = null;
      return copy;
    });

    setImageUrls((prev) => {
      const copy = [...prev];
      copy[index] = "";
      return copy;
    });

    const ref = fileInputRefs.current[index]?.current;
    if (ref) ref.value = "";
  };

  const handleEditTrip = async (trip) => {
    setEditingTripId(trip._id);

    setFormData({
      tripName: trip.tripName,
      country: trip.country._id,
      state: trip.state._id,
      destination: trip.destination._id,
      description: trip.description,
      approxKm: trip.approxKm,
    });

    // ✅ prefill 8 images (backward compatible)
    const prefill = [
      trip.imageUrl || "",
      trip.secondImageUrl || "",
      trip.thirdImageUrl || "",
      trip.fourthImageUrl || "",
      trip.fifthImageUrl || "",
      trip.sixthImageUrl || "",
      trip.seventhImageUrl || "",
      trip.eightImageUrl || "",
    ];
    setImageUrls(prefill);
    setImages(Array(8).fill(null));

    // clear file inputs visually
    fileInputRefs.current.forEach((r) => {
      const el = r?.current;
      if (el) el.value = "";
    });

    setSelectedCountry(trip.country._id);

    try {
      const statesRes = await API.get(`/purchaser/states/${trip.country._id}`);
      setStates(statesRes.data);
    } catch {
      toast.error("Error fetching states");
      return;
    }
    setSelectedState(trip.state._id);

    try {
      const destRes = await API.get(
        `/purchaser/destinationsByCountryAndState/${trip.country._id}/${trip.state._id}?currentDestinationId=${trip.destination._id}`
      );
      setDestinations(destRes.data);
    } catch {
      toast.error("Error fetching destinations");
      return;
    }
    setSelectedDestination(trip.destination._id);

    const vendorIdSet = new Set((trip.vehicles || []).map((v) => v.vendor?._id).filter(Boolean));
    const vendorIdCsv = Array.from(vendorIdSet).join(",");

    try {
      const vendorsRes = await API.get(
        `/purchaser/vendorsOfVehicles/${trip.country._id}/${trip.state._id}/${trip.destination._id}?currentVendorId=${encodeURIComponent(
          vendorIdCsv
        )}`
      );
      setVendors(vendorsRes.data);
    } catch {
      toast.error("Error fetching vendors");
      return;
    }

    const vendorToVehicleIds = {};
    (trip.vehicles || []).forEach((vg) => {
      const vId = vg.vendor?._id;
      const vehId = vg.vehicle?._id;
      if (!vId || !vehId) return;
      if (!vendorToVehicleIds[vId]) vendorToVehicleIds[vId] = new Set();
      vendorToVehicleIds[vId].add(vehId);
    });

    const newVehiclesCache = {};
    for (const [vendorId, idSet] of Object.entries(vendorToVehicleIds)) {
      const csv = Array.from(idSet).join(",");
      try {
        const res = await API.get(
          `/purchaser/vehiclesForTrip/${trip.country._id}/${trip.state._id}/${trip.destination._id}/${vendorId}?currentVehicleIds=${encodeURIComponent(
            csv
          )}`
        );
        newVehiclesCache[vendorId] = res.data;
      } catch {
        toast.error("Error loading vehicles for vendor");
      }
    }
    setVehiclesCache(newVehiclesCache);

    setRows(
      (trip.vehicles || []).map((v) => ({
        vendor: v.vendor?._id || "",
        category: v.category || "",
        vehicle: v.vehicle?._id || "",
        prices: (v.prices || []).map((p) => ({
          validFrom: p.validFrom?.slice(0, 10) || "",
          validTo: p.validTo?.slice(0, 10) || "",
          price: p.price ?? "",
        })),
        expanded: true,
      }))
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateVehiclePriceRanges = (rowsArg) => {
    const vehicleDateMap = new Map();

    for (let r = 0; r < rowsArg.length; r++) {
      const row = rowsArg[r];
      const vehicleId = row.vehicle;
      if (!vehicleId) continue;

      if (!vehicleDateMap.has(vehicleId)) vehicleDateMap.set(vehicleId, []);

      for (let i = 0; i < row.prices.length; i++) {
        const p = row.prices[i];
        const from = new Date(p.validFrom);
        const to = new Date(p.validTo);

        if (from > to) {
          toast.error(`Row ${r + 1}, Entry ${i + 1}: 'Valid From' must be before 'Valid To'`);
          return false;
        }

        const existing = vehicleDateMap.get(vehicleId);
        for (const range of existing) {
          const overlap = from <= range.to && to >= range.from;
          if (overlap) {
            toast.error(
              `Overlap for vehicle in:\n- Row ${r + 1}, Entry ${i + 1} \n- Row ${range.rowIndex + 1}, Entry ${
                range.entryIndex + 1
              }`
            );
            return false;
          }
        }
        existing.push({ from, to, rowIndex: r, entryIndex: i });
      }
    }
    return true;
  };

  const handleCreateTrip = async () => {
    const required = [
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "destination", label: "Destination" },
      { key: "tripName", label: "Trip Name" },
      { key: "description", label: "Trip Description" },
    ];

    for (const f of required) {
      const v = formData[f.key];
      if (!v || (typeof v === "string" && v.trim() === "")) {
        toast.error(`${f.label} is mandatory`);
        return;
      }
    }

    const hasRow = rows.some((row) => row.vendor && row.category && row.vehicle);
    if (!hasRow) {
      toast.error("Please add atleast one vehicle.");
      return;
    }

    if (!validateVehiclePriceRanges(rows)) return;

    try {
      const payload = {
        formData: {
          ...formData,

          // ✅ 8 images (same naming as backend expects)
          imageUrl: imageUrls[0] || "",
          secondImageUrl: imageUrls[1] || "",
          thirdImageUrl: imageUrls[2] || "",
          fourthImageUrl: imageUrls[3] || "",
          fifthImageUrl: imageUrls[4] || "",
          sixthImageUrl: imageUrls[5] || "",
          seventhImageUrl: imageUrls[6] || "",
          eightImageUrl: imageUrls[7] || "",
        },
        rows,
      };

      if (editingTripId) {
        await API.put(`/purchaser/updateTrip/${editingTripId}`, payload);
        toast.success("Trip updated successfully!");
      } else {
        await API.post("/purchaser/createTrip", payload);
        toast.success("Trip created successfully!");
      }

      setFormData({
        country: "",
        state: "",
        destination: "",
        approxKm: "",
        tripName: "",
        description: "",
      });

      // ✅ clear images
      setImageUrls(Array(8).fill(""));
      setImages(Array(8).fill(null));
      fileInputRefs.current.forEach((r) => {
        const el = r?.current;
        if (el) el.value = "";
      });

      setRows([
        {
          vendor: "",
          category: "",
          vehicle: "",
          prices: [{ validFrom: "", validTo: "", price: "" }],
          expanded: true,
        },
      ]);
      setSelectedCountry("");
      setSelectedState("");
      setSelectedDestination("");
      setSelectedVendor("");
      setVendors([]);
      setVehiclesCache({});
      setStates([]);
      setDestinations([]);
      setEditingTripId(null);
      fetchTrips();
    } catch {
      toast.error("Failed to save trip");
    }
  };

  const handleStatusClick = (trip) => {
    setSelectedTrip(trip);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedTrip) return;

    try {
      const updatedStatus = !selectedTrip.activeStatus;
      const res = await API.patch(`/purchaser/updateTripStatus/${selectedTrip._id}/status`, {
        activeStatus: updatedStatus,
      });

      if (res.data.success) {
        toast.success(`Trip ${updatedStatus ? "activated" : "deactivated"} successfully`);
        await fetchTrips();
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedTrip(null);
    }
  };

  const tableVariants = {
    enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
  };

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
    label: d.activeStatus === false ? `${d.name} (inactive)` : d.name,
  }));
  const vendorOptions = vendors.map((v) => ({
    value: v._id,
    label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
  }));

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
          <img src={url} alt={title} className="block w-full h-full object-cover object-center rounded-2xl" />
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

  const clearAllPrefill = () => {
    setEditingTripId(null);
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDestination("");
    setSelectedVendor("");
    setStates([]);
    setDestinations([]);
    setVendors([]);
    setVehiclesCache({});
    setRows([
      {
        vendor: "",
        category: "",
        vehicle: "",
        prices: [{ validFrom: "", validTo: "", price: "" }],
        expanded: true,
      },
    ]);
    setFormData({
      country: "",
      state: "",
      destination: "",
      approxKm: "",
      tripName: "",
      description: "",
    });

    // ✅ clear images
    setImageUrls(Array(8).fill(""));
    setImages(Array(8).fill(null));
    fileInputRefs.current.forEach((r) => {
      const el = r?.current;
      if (el) el.value = "";
    });
  };

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
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">Create Day Trip</div>
              <div className="mt-1 text-sm text-slate-500">
                Create / update day trips, add vehicle pricing ranges, and manage status.
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingTripId && (
                <button
                  type="button"
                  onClick={clearAllPrefill}
                  title="Discard edit / reset"
                  className="
                    inline-flex items-center justify-center
                    w-10 h-10 rounded-2xl
                    bg-white/70 backdrop-blur-md
                    border border-slate-200
                    shadow hover:bg-white transition
                    text-slate-700
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
                style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
              >
                <Route size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    {editingTripId ? "Edit day trip" : "Add new day trip"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Pick location, fill trip details, then add at least one vehicle with valid date ranges.
                  </div>
                </div>

                {editingTripId && (
                  <button
                    type="button"
                    onClick={clearAllPrefill}
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
                {/* Location + Approx KM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <MapPin size={12} style={{ color: THEME }} />
                      Country
                    </div>
                    <Select
                      styles={selectStyles}
                      options={countryOptions}
                      placeholder="Select Country"
                      value={countryOptions.find((o) => o.value === selectedCountry) || null}
                      onChange={(opt) => {
                        const value = opt?.value || "";
                        setSelectedCountry(value);
                        setFormData({ ...formData, country: value });
                      }}
                      isDisabled={!!editingTripId}
                      isClearable
                      classNamePrefix="trip-country"
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <MapPin size={12} style={{ color: THEME }} />
                      State
                    </div>
                    <Select
                      styles={selectStyles}
                      options={stateOptions}
                      placeholder="Select State"
                      value={stateOptions.find((o) => o.value === selectedState) || null}
                      onChange={(opt) => {
                        const value = opt?.value || "";
                        setSelectedState(value);
                        setFormData((prev) => ({ ...prev, state: value }));
                      }}
                      isDisabled={!!editingTripId || !selectedCountry}
                      isClearable
                      classNamePrefix="trip-state"
                      menuPortalTarget={document.body}
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
                      styles={selectStyles}
                      options={destinationOptions}
                      placeholder="Select Destination"
                      value={destinationOptions.find((o) => o.value === selectedDestination) || null}
                      onChange={(opt) => {
                        const value = opt?.value || "";
                        setSelectedDestination(value);
                        setFormData((prev) => ({ ...prev, destination: value }));
                      }}
                      isDisabled={!!editingTripId || !selectedState}
                      isClearable
                      classNamePrefix="trip-destination"
                      menuPortalTarget={document.body}
                    />
                    {!selectedState && (
                      <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <Route size={12} style={{ color: THEME }} />
                      Approx KM
                    </div>
                    <input
                      type="text"
                      placeholder="Approx KM"
                      className="
                        w-full rounded-2xl border border-slate-300 bg-white/90
                        px-4 py-3 text-sm outline-none shadow-sm
                        focus:ring-2 transition
                      "
                      style={{ "--tw-ring-color": THEME }}
                      value={formData.approxKm}
                      onChange={(e) => setFormData({ ...formData, approxKm: e.target.value })}
                    />
                  </div>
                </div>

                {/* Trip Name */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <ListChecks size={12} style={{ color: THEME }} />
                    Day Trip Name
                  </div>
                  <input
                    type="text"
                    placeholder="Day Trip Name"
                    className="
                      w-full rounded-2xl border border-slate-300 bg-white/90
                      px-4 py-3 text-sm outline-none shadow-sm
                      focus:ring-2 transition
                    "
                    style={{ "--tw-ring-color": THEME }}
                    value={formData.tripName}
                    onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <ListChecks size={12} style={{ color: THEME }} />
                    Day Trip Description
                  </div>
                  <textarea
                    placeholder="Enter trip description..."
                    className="
                      w-full h-28 resize-none
                      rounded-2xl border border-slate-300 bg-white/90
                      px-4 py-3 text-sm outline-none shadow-sm
                      focus:ring-2 transition
                    "
                    style={{ "--tw-ring-color": THEME }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* ✅ Trip Images (UPDATED: 8 slots — all visible, AddOnTrip-style) */}
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
                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Trip images</div>
                        <div className="text-sm font-semibold text-slate-800">
                          Upload optional (8 images supported, each has clear)
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-between">
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <ImageSlot
                          key={idx}
                          title={`Image ${idx + 1}`}
                          url={imageUrls[idx]}
                          inputId={`trip-image-upload-${idx + 1}`}
                          inputRef={fileInputRefs.current[idx]}
                          onPick={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            await uploadAndSetIndex(idx, file);
                          }}
                          onClear={() => clearImageIndex(idx)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vehicle Rows (UNCHANGED) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Vehicles</div>
                      <div className="mt-1 text-sm text-slate-500">
                        Add vendor → category → vehicle, then define non-overlapping date ranges.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addRow}
                      className="
                        inline-flex items-center gap-2
                        px-4 py-2 rounded-2xl
                        border border-slate-200
                        bg-white hover:bg-slate-50
                        shadow-sm hover:shadow-md transition
                        text-slate-700 font-semibold
                      "
                    >
                      <Plus size={16} style={{ color: THEME }} />
                      Add vehicle row
                    </button>
                  </div>

                  {rows.map((row, rowIndex) => {
                    const vendorVehicleList = vehiclesCache[row.vendor] || [];

                    const categoryOptions = Array.from(new Set(vendorVehicleList.map((v) => v.category))).map(
                      (c) => ({ value: c, label: c })
                    );

                    const vehicleOptions = vendorVehicleList
                      .filter((v) => v.category === row.category)
                      .map((v) => ({
                        value: v._id,
                        label: v.activeStatus === false ? `${v.vehicle} (inactive)` : v.vehicle,
                      }));

                    return (
                      <div
                        key={rowIndex}
                        className="
                          rounded-[22px]
                          border border-slate-200
                          bg-white
                          shadow-[0_10px_30px_rgba(15,23,42,0.08)]
                          overflow-hidden
                        "
                      >
                        <div className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50/60">
                          <div className="grid grid-cols-1 lg:grid-cols-[44px_1fr_1fr_1fr_auto] gap-3 items-center">
                            <button
                              type="button"
                              onClick={() => toggleExpand(rowIndex)}
                              className="
                                w-11 h-11
                                flex items-center justify-center
                                rounded-2xl
                                border border-slate-200
                                bg-white hover:bg-slate-50
                                shadow-sm hover:shadow-md
                                transition
                              "
                              title={row.expanded ? "Collapse" : "Expand"}
                            >
                              {row.expanded ? (
                                <ChevronDown size={18} className="text-slate-700" />
                              ) : (
                                <ChevronRight size={18} className="text-slate-700" />
                              )}
                            </button>

                            <Select
                              styles={selectStyles}
                              options={vendorOptions}
                              placeholder="Select Vendor"
                              value={vendorOptions.find((o) => o.value === row.vendor) || null}
                              onChange={async (opt) => {
                                const selected = opt?.value || "";
                                const updated = [...rows];
                                updated[rowIndex].vendor = selected;
                                updated[rowIndex].category = "";
                                updated[rowIndex].vehicle = "";
                                setRows(updated);

                                if (vehiclesCache[selected]) return;

                                if (selectedCountry && selectedState && selectedDestination && selected) {
                                  try {
                                    const res = await API.get(
                                      `/purchaser/vehiclesForTrip/${selectedCountry}/${selectedState}/${selectedDestination}/${selected}`
                                    );
                                    setVehiclesCache((prev) => ({ ...prev, [selected]: res.data }));
                                  } catch (err) {
                                    toast.error("Error fetching vehicles:", err);
                                  }
                                }
                              }}
                              isClearable
                              classNamePrefix="trip-vendor"
                              menuPortalTarget={document.body}
                            />

                            <Select
                              styles={selectStyles}
                              options={categoryOptions}
                              placeholder="Select vehicle category"
                              value={row.category ? { value: row.category, label: row.category } : null}
                              onChange={(opt) => {
                                const updated = [...rows];
                                updated[rowIndex].category = opt?.value || "";
                                updated[rowIndex].vehicle = "";
                                setRows(updated);
                              }}
                              isClearable
                              classNamePrefix="trip-category"
                              menuPortalTarget={document.body}
                            />

                            <Select
                              styles={selectStyles}
                              options={vehicleOptions}
                              placeholder="Select vehicle"
                              value={vehicleOptions.find((o) => o.value === row.vehicle) || null}
                              onChange={(opt) => {
                                const updated = [...rows];
                                updated[rowIndex].vehicle = opt?.value || "";
                                setRows(updated);
                              }}
                              isClearable
                              classNamePrefix="trip-vehicle"
                              menuPortalTarget={document.body}
                            />

                            <div className="flex justify-end">
                              {rowIndex === 0 ? (
                                <button
                                  type="button"
                                  onClick={addRow}
                                  className="
                                    inline-flex items-center justify-center
                                    w-11 h-11 rounded-2xl
                                    text-white font-bold
                                    shadow-[0_12px_28px_rgba(133,112,238,0.35)]
                                    hover:opacity-95 active:scale-[0.99] transition
                                  "
                                  style={{ background: THEME }}
                                  title="Add Vehicle"
                                >
                                  <Plus size={18} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => removeRow(rowIndex)}
                                  className="
                                    inline-flex items-center justify-center
                                    w-11 h-11 rounded-2xl
                                    border border-red-200
                                    bg-red-50 hover:bg-red-100
                                    text-red-600
                                    shadow-sm
                                    transition
                                  "
                                  title="Remove Vehicle"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          </div>

                          {row.expanded && (
                            <div className="mt-4 space-y-3">
                              {row.prices.map((priceRow, priceIndex) => (
                                <div
                                  key={priceIndex}
                                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center"
                                >
                                  <input
                                    type="date"
                                    className="
                                      w-full rounded-2xl border border-slate-300 bg-white/90
                                      px-4 py-3 text-sm outline-none shadow-sm
                                      focus:ring-2 transition
                                    "
                                    style={{ "--tw-ring-color": THEME }}
                                    placeholder="Valid From"
                                    value={priceRow.validFrom}
                                    onChange={(e) =>
                                      handlePriceChange(rowIndex, priceIndex, "validFrom", e.target.value)
                                    }
                                  />

                                  <input
                                    type="date"
                                    className="
                                      w-full rounded-2xl border border-slate-300 bg-white/90
                                      px-4 py-3 text-sm outline-none shadow-sm
                                      focus:ring-2 transition
                                    "
                                    style={{ "--tw-ring-color": THEME }}
                                    placeholder="Valid To"
                                    value={priceRow.validTo}
                                    onChange={(e) =>
                                      handlePriceChange(rowIndex, priceIndex, "validTo", e.target.value)
                                    }
                                  />

                                  <input
                                    type="text"
                                    placeholder="Price"
                                    className="
                                      w-full rounded-2xl border border-slate-300 bg-white/90
                                      px-4 py-3 text-sm outline-none shadow-sm
                                      focus:ring-2 transition
                                    "
                                    style={{ "--tw-ring-color": THEME }}
                                    value={priceRow.price}
                                    onChange={(e) =>
                                      handlePriceChange(rowIndex, priceIndex, "price", e.target.value)
                                    }
                                  />

                                  <div className="flex justify-end">
                                    {priceIndex === 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => addPriceRow(rowIndex)}
                                        className="
                                          inline-flex items-center justify-center
                                          w-11 h-11 rounded-2xl
                                          text-white font-bold
                                          shadow-[0_12px_28px_rgba(133,112,238,0.35)]
                                          hover:opacity-95 active:scale-[0.99] transition
                                        "
                                        style={{ background: THEME }}
                                        title="Add Price Row"
                                      >
                                        <Plus size={18} />
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => removePriceRow(rowIndex, priceIndex)}
                                        className="
                                          inline-flex items-center justify-center
                                          w-11 h-11 rounded-2xl
                                          border border-red-200
                                          bg-red-50 hover:bg-red-100
                                          text-red-600
                                          shadow-sm
                                          transition
                                        "
                                        title="Remove Price Row"
                                      >
                                        <X size={18} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleCreateTrip}
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
                  {editingTripId ? "Update Trip" : "Create Trip"}
                </button>
              </div>
            </div>

            {/* TABLE (unchanged) */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">Trips</div>
                  <div className="mt-1 text-sm text-slate-500">Search and edit trips</div>
                </div>

                <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPageDir(1);
                      setPage(1);
                    }}
                    placeholder="Search by trip name..."
                    className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                  />
                </div>
              </div>

              <div className="relative overflow-hidden">
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <AnimatePresence mode="wait" custom={pageDir}>
                    <motion.div
                      key={`trip-page-${page}-${search}`}
                      custom={pageDir}
                      variants={tableVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="w-full"
                      style={{ overflow: "visible" }}
                    >
                      <table className="w-full text-sm text-left text-slate-700 min-w-[980px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                            <th className="px-5 py-3">Sl No</th>
                            <th className="px-5 py-3">Trip Name</th>
                            <th className="px-5 py-3">Country</th>
                            <th className="px-5 py-3">State</th>
                            <th className="px-5 py-3">Destination</th>
                            <th className="px-5 py-3">Approx KM</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {trips.map((entry, index) => (
                            <tr
                              key={entry._id || index}
                              className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                            >
                              <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
                              <td className="px-5 py-3 font-semibold">{entry.tripName}</td>
                              <td className="px-5 py-3 font-semibold">{entry.country?.name}</td>
                              <td className="px-5 py-3 font-semibold">{entry.state?.name}</td>
                              <td className="px-5 py-3 font-semibold">{entry.destination?.name}</td>
                              <td className="px-5 py-3 font-semibold">{entry.approxKm}</td>

                              <td className="px-5 py-3 font-semibold">
                                {entry.activeStatus ? (
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
                                  onClick={() => handleEditTrip(entry)}
                                  className="
                                    inline-flex items-center justify-center
                                    h-9 w-9 rounded-2xl
                                    border border-slate-200
                                    bg-white/80 hover:bg-white
                                    shadow-sm hover:shadow-md transition
                                    text-slate-700
                                  "
                                  title="Edit trip"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}

                          {trips.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                                No trips found.
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
                    setPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                  disabled={page === totalPages}
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
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status modal (unchanged) */}
        {showPopup && selectedTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                setSelectedTrip(null);
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
                  {selectedTrip.activeStatus ? "Deactivate" : "Activate"} Trip
                </h2>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold">{selectedTrip.activeStatus ? "deactivate" : "activate"}</span>{" "}
                  the trip: <span className="font-semibold">{selectedTrip.tripName}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                    onClick={() => {
                      setShowPopup(false);
                      setSelectedTrip(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
                    style={{ background: selectedTrip.activeStatus ? "#ef4444" : "#22c55e" }}
                    onClick={handleToggleStatus}
                  >
                    {selectedTrip.activeStatus ? "Deactivate" : "Activate"}
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

export default CreateTrip;
