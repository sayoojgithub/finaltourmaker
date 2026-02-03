


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
//   Layers,
// } from "lucide-react";

// import API from "../../api";
// import { toast } from "react-toastify";
// import uploadImageToCloudinary from "../../utils/uploadCloudinary";

// const CreateAddOnTrip = () => {
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
//   const [addontrips, setAddOnTrips] = useState([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [page, setPage] = useState(1);

//   const [editingTripId, setEditingTripId] = useState(null);
//   const [search, setSearch] = useState("");

//   // ✅ 3 images (same as CreateTrip)
//   const [image1, setImage1] = useState(null);
//   const [image2, setImage2] = useState(null);
//   const [image3, setImage3] = useState(null);

//   const [imageUrl, setImageUrl] = useState("");
//   const [secondImageUrl, setSecondImageUrl] = useState("");
//   const [thirdImageUrl, setThirdImageUrl] = useState("");

//   const fileInputRef1 = useRef(null);
//   const fileInputRef2 = useRef(null);
//   const fileInputRef3 = useRef(null);

//   const [selectedAddOnTrip, setSelectedAddOnTrip] = useState(null);
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
//     trip: "",
//     addontripName: "",
//     description: "",
//   });

//   // ✅ Premium react-select (same standard as CreateTrip)
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

//   // ---------- Helpers to map options ----------
//   const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
//   const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
//   const destinationOptions = destinations.map((d) => ({
//     value: d._id,
//     label: d.activeStatus === false ? `${d.name} (inactive)` : d.name,
//   }));
//   const tripOptions = trips.map((t) => ({
//     value: t._id,
//     label: t.activeStatus === false ? `${t.tripName} (inactive)` : t.tripName,
//   }));

//   // ✅ Premium table animation variants (UI-only)
//   const tableVariants = {
//     enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
//     center: { x: 0, opacity: 1, filter: "blur(0px)" },
//     exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
//   };

//   const fetchAddOnTrips = async () => {
//     try {
//       const res = await API.get(`/purchaser/addontrips?page=${page}&search=${search}`);
//       setAddOnTrips(res.data.trips);
//       setTotalPages(res.data.totalPages);
//     } catch {
//       toast.error("Failed to load trips");
//     }
//   };

//   useEffect(() => {
//     fetchAddOnTrips();
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

//     // ❗ in edit mode, vendors are handled inside handleEditTrip
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
//   }, [selectedDestination, selectedCountry, selectedState, editingTripId]);

//   useEffect(() => {
//     if (!selectedCountry || !selectedState || !selectedDestination) return;

//     // ❗ in edit mode, trips are loaded inside handleEditTrip (with currentTripId)
//     if (editingTripId) return;

//     setTrips([]);
//     setFormData((prev) => ({ ...prev, trip: "" }));

//     const fetchTrips = async () => {
//       try {
//         const res = await API.get(
//           `/purchaser/tripsByLocation/${selectedCountry}/${selectedState}/${selectedDestination}`
//         );
//         setTrips(res.data);
//       } catch (err) {
//         toast.error("Error fetching Trips:", err);
//       }
//     };

//     fetchTrips();
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
//     const updatedRows = [...rows];
//     updatedRows[rowIndex].prices[priceIndex][field] = value;
//     setRows(updatedRows);
//   };

//   // ✅ helper: upload and set URL without changing your UX (same as CreateTrip)
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

//   // ✅ reusable image tile (same as CreateTrip)
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

//   const handleEditTrip = async (addon) => {
//     setEditingTripId(addon._id);

//     // basic form fields
//     setFormData({
//       addontripName: addon.addontripName,
//       country: addon.country._id,
//       state: addon.state._id,
//       destination: addon.destination._id,
//       trip: addon.trip._id,
//       description: addon.description,
//       approxKm: addon.approxKm,
//     });

//     // ✅ prefill 3 images
//     setImageUrl(addon.imageUrl || "");
//     setSecondImageUrl(addon.secondImageUrl || "");
//     setThirdImageUrl(addon.thirdImageUrl || "");
//     setImage1(null);
//     setImage2(null);
//     setImage3(null);

//     setSelectedCountry(addon.country._id);

//     // 1) States
//     try {
//       const statesRes = await API.get(`/purchaser/states/${addon.country._id}`);
//       setStates(statesRes.data);
//     } catch {
//       toast.error("Error fetching states");
//       return;
//     }
//     setSelectedState(addon.state._id);

//     // 2) Destinations (include current even if inactive)
//     try {
//       const destRes = await API.get(
//         `/purchaser/destinationsByCountryAndState/${addon.country._id}/${addon.state._id}?currentDestinationId=${addon.destination._id}`
//       );
//       setDestinations(destRes.data);
//     } catch {
//       toast.error("Error fetching destinations");
//       return;
//     }
//     setSelectedDestination(addon.destination._id);

//     // 3) Trips (include current trip even if inactive)
//     try {
//       const tripsRes = await API.get(
//         `/purchaser/tripsByLocation/${addon.country._id}/${addon.state._id}/${addon.destination._id}?currentTripId=${addon.trip._id}`
//       );
//       setTrips(tripsRes.data);
//     } catch {
//       toast.error("Error fetching trips");
//       return;
//     }

//     // 4) Vendors (include all vendors used in this addon trip, even if inactive)
//     const vendorIdSet = new Set((addon.vehicles || []).map((v) => v.vendor?._id).filter(Boolean));
//     const vendorIdCsv = Array.from(vendorIdSet).join(",");

//     try {
//       const vendorsRes = await API.get(
//         `/purchaser/vendorsOfVehicles/${addon.country._id}/${addon.state._id}/${addon.destination._id}?currentVendorId=${encodeURIComponent(
//           vendorIdCsv
//         )}`
//       );
//       setVendors(vendorsRes.data);
//     } catch {
//       toast.error("Error fetching vendors");
//       return;
//     }

//     // 5) Vehicles (per vendor – include any inactive ones used in this addon trip)
//     const vendorToVehicleIds = {};
//     (addon.vehicles || []).forEach((vg) => {
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
//           `/purchaser/vehiclesForTrip/${addon.country._id}/${addon.state._id}/${addon.destination._id}/${vendorId}?currentVehicleIds=${encodeURIComponent(
//             csv
//           )}`
//         );
//         newVehiclesCache[vendorId] = res.data;
//       } catch {
//         toast.error("Error loading vehicles for vendor");
//       }
//     }
//     setVehiclesCache(newVehiclesCache);

//     // 6) Rows prefill
//     setRows(
//       (addon.vehicles || []).map((v) => ({
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

//     for (let rowIndex = 0; rowIndex < rowsArg.length; rowIndex++) {
//       const row = rowsArg[rowIndex];
//       const vehicleId = row.vehicle;

//       if (!vehicleId) continue;

//       if (!vehicleDateMap.has(vehicleId)) {
//         vehicleDateMap.set(vehicleId, []);
//       }

//       for (let priceIndex = 0; priceIndex < row.prices.length; priceIndex++) {
//         const p = row.prices[priceIndex];
//         const from = new Date(p.validFrom);
//         const to = new Date(p.validTo);

//         if (from > to) {
//           toast.error(
//             `Row ${rowIndex + 1}, Entry ${priceIndex + 1}: 'Valid From' must be before 'Valid To'`
//           );
//           return false;
//         }

//         const existingRanges = vehicleDateMap.get(vehicleId);

//         for (const range of existingRanges) {
//           const isOverlap = from <= range.to && to >= range.from;
//           if (isOverlap) {
//             toast.error(
//               `Overlap for vehicle in:\n- Row ${rowIndex + 1}, Entry ${priceIndex + 1} \nand\n- Row ${
//                 range.rowIndex + 1
//               }, Entry ${range.entryIndex + 1}`
//             );
//             return false;
//           }
//         }

//         existingRanges.push({ from, to, rowIndex, entryIndex: priceIndex });
//       }
//     }

//     return true;
//   };

//   const handleCreateTrip = async () => {
//     const requiredFields = [
//       { key: "country", label: "Country" },
//       { key: "state", label: "State" },
//       { key: "destination", label: "Destination" },
//       { key: "trip", label: "Trip" },
//       { key: "addontripName", label: "AddOnTrip" },
//       { key: "description", label: "AddOnTrip Description" },
//     ];

//     for (const field of requiredFields) {
//       const value = formData[field.key];
//       if (!value || (typeof value === "string" && value.trim() === "")) {
//         toast.error(`${field.label} is mandatory`);
//         return;
//       }
//     }

//     const hasValidRow = rows.some((row) => row.vendor && row.category && row.vehicle);
//     if (!hasValidRow) {
//       toast.error("Please add atleast one vehicle.");
//       return;
//     }

//     const isValid = validateVehiclePriceRanges(rows);
//     if (!isValid) return;

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
//         await API.put(`/purchaser/updateAddOnTrip/${editingTripId}`, payload);
//         toast.success("Trip updated successfully!");
//       } else {
//         await API.post("/purchaser/createAddOnTrip", payload);
//         toast.success("Trip created successfully!");
//       }

//       setFormData({
//         country: "",
//         state: "",
//         destination: "",
//         approxKm: "",
//         trip: "",
//         addontripName: "",
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
//       setTrips([]);
//       setVehiclesCache({});
//       setStates([]);
//       setDestinations([]);
//       setEditingTripId(null);
//       fetchAddOnTrips();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save trip");
//     }
//   };

//   const handleStatusClick = (addontrip) => {
//     setSelectedAddOnTrip(addontrip);
//     setShowPopup(true);
//   };

//   const handleToggleStatus = async () => {
//     if (!selectedAddOnTrip) return;

//     try {
//       const updatedStatus = !selectedAddOnTrip.activeStatus;

//       const res = await API.patch(
//         `/purchaser/updateAddOnTripStatus/${selectedAddOnTrip._id}/status`,
//         { activeStatus: updatedStatus }
//       );

//       if (res.data.success) {
//         toast.success(`Addontrip ${updatedStatus ? "activated" : "deactivated"} successfully`);
//         await fetchAddOnTrips();
//       } else {
//         toast.error("Update failed");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Server error");
//     } finally {
//       setShowPopup(false);
//       setSelectedAddOnTrip(null);
//     }
//   };

//   // ---------- Clear all prefilled edit data ----------
//   const clearAllPrefill = () => {
//     setEditingTripId(null);
//     setSelectedCountry("");
//     setSelectedState("");
//     setSelectedDestination("");
//     setSelectedVendor("");
//     setStates([]);
//     setDestinations([]);
//     setVendors([]);
//     setTrips([]);
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
//       trip: "",
//       addontripName: "",
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
//       {/* Premium Shell */}
//       <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
//         {/* Ribbon */}
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
//                 Create AddOnTrip
//               </div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Create / update addon trips, add vehicle pricing ranges, and manage status.
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
//                 <Layers size={20} />
//               </div>
//             </div>
//           </div>

//           {/* Layout: Form card on top, Table below */}
//           <div className="space-y-6">
//             {/* TOP: FORM CARD */}
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">
//                     {editingTripId ? "Edit addon trip" : "Add new addon trip"}
//                   </div>
//                   <div className="mt-1 text-sm text-slate-500">
//                     Pick location, select base trip, fill details, then add at least one vehicle with valid date ranges.
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
//                       classNamePrefix="addon-country"
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
//                       classNamePrefix="addon-state"
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
//                       classNamePrefix="addon-destination"
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

//                 {/* Select Trip */}
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <ListChecks size={12} style={{ color: THEME }} />
//                     Select Base Trip
//                   </div>

//                   <Select
//                     styles={selectStyles}
//                     options={tripOptions}
//                     placeholder="Select Trip"
//                     value={tripOptions.find((o) => o.value === formData.trip) || null}
//                     onChange={(opt) => setFormData({ ...formData, trip: opt?.value || "" })}
//                     isDisabled={!!editingTripId || !selectedDestination}
//                     isClearable
//                     classNamePrefix="addon-trip"
//                     menuPortalTarget={document.body}
//                   />
//                   {!selectedDestination && (
//                     <div className="mt-1 text-xs text-slate-400">Select destination to load trips.</div>
//                   )}
//                 </div>

//                 {/* AddOnTrip Name */}
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <ListChecks size={12} style={{ color: THEME }} />
//                     AddOnTrip Name
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="AddOnTrip Name"
//                     className="
//                       w-full rounded-2xl border border-slate-300 bg-white/90
//                       px-4 py-3 text-sm outline-none shadow-sm
//                       focus:ring-2 transition
//                     "
//                     style={{ "--tw-ring-color": THEME }}
//                     value={formData.addontripName}
//                     onChange={(e) => setFormData({ ...formData, addontripName: e.target.value })}
//                   />
//                 </div>

//                 {/* Description (unchanged behavior) */}
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <ListChecks size={12} style={{ color: THEME }} />
//                     AddOnTrip Description
//                   </div>
//                   <textarea
//                     placeholder="Enter addon trip description..."
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

//                 {/* ✅ AddOnTrip Images (EXACT CreateTrip style 3 slots) */}
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
//                           AddOnTrip images
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
//                         inputId="addon-image-upload-1"
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
//                         inputId="addon-image-upload-2"
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
//                         inputId="addon-image-upload-3"
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
//                     const vendorOptions = vendors.map((v) => ({
//                       value: v._id,
//                       label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
//                     }));

//                     const vendorValue = vendorOptions.find((o) => o.value === row.vendor) || null;

//                     const categoryOptions = [
//                       ...new Set((vehiclesCache[row.vendor] || []).map((v) => v.category)),
//                     ].map((c) => ({ value: c, label: c }));

//                     const categoryValue = categoryOptions.find((o) => o.value === row.category) || null;

//                     const vehicleOptions = (vehiclesCache[row.vendor] || [])
//                       .filter((v) => v.category === row.category)
//                       .map((v) => ({
//                         value: v._id,
//                         label: v.activeStatus === false ? `${v.vehicle} (inactive)` : v.vehicle,
//                       }));

//                     const vehicleValue = vehicleOptions.find((o) => o.value === row.vehicle) || null;

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

//                             {/* Vendor */}
//                             <Select
//                               styles={selectStyles}
//                               options={vendorOptions}
//                               placeholder="Select Vendor"
//                               value={vendorValue}
//                               onChange={async (opt) => {
//                                 const selected = opt?.value || "";
//                                 const updatedRows = [...rows];

//                                 updatedRows[rowIndex].vendor = selected;
//                                 updatedRows[rowIndex].category = "";
//                                 updatedRows[rowIndex].vehicle = "";

//                                 setRows(updatedRows);

//                                 if (!selected) return;

//                                 if (!vehiclesCache[selected]) {
//                                   if (selectedCountry && selectedState && selectedDestination) {
//                                     try {
//                                       const res = await API.get(
//                                         `/purchaser/vehiclesForTrip/${selectedCountry}/${selectedState}/${selectedDestination}/${selected}`
//                                       );
//                                       setVehiclesCache((prev) => ({
//                                         ...prev,
//                                         [selected]: res.data,
//                                       }));
//                                     } catch (err) {
//                                       toast.error("Error fetching vehicles:", err);
//                                     }
//                                   }
//                                 }
//                               }}
//                               isClearable
//                               classNamePrefix="addon-vendor"
//                               menuPortalTarget={document.body}
//                             />

//                             {/* Category */}
//                             <Select
//                               styles={selectStyles}
//                               options={categoryOptions}
//                               placeholder="Select vehicle category"
//                               value={categoryValue}
//                               onChange={(opt) => {
//                                 const updatedRows = [...rows];
//                                 updatedRows[rowIndex].category = opt?.value || "";
//                                 updatedRows[rowIndex].vehicle = "";
//                                 setRows(updatedRows);
//                               }}
//                               isDisabled={!row.vendor}
//                               isClearable
//                               classNamePrefix="addon-category"
//                               menuPortalTarget={document.body}
//                             />

//                             {/* Vehicle */}
//                             <Select
//                               styles={selectStyles}
//                               options={vehicleOptions}
//                               placeholder="Select vehicle"
//                               value={vehicleValue}
//                               onChange={(opt) => {
//                                 const updatedRows = [...rows];
//                                 updatedRows[rowIndex].vehicle = opt?.value || "";
//                                 setRows(updatedRows);
//                               }}
//                               isDisabled={!row.vendor || !row.category}
//                               isClearable
//                               classNamePrefix="addon-vehicle"
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

//                           {/* Price Rows */}
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

//                 {/* Submit */}
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
//                   {editingTripId ? "Update AddOnTrip" : "Create AddOnTrip"}
//                 </button>
//               </div>
//             </div>

//             {/* BELOW: TABLE CARD (UNCHANGED) */}
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">AddOnTrips</div>
//                   <div className="mt-1 text-sm text-slate-500">Search and edit addon trips</div>
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
//                     placeholder="Search by addon trip name..."
//                     className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
//                   />
//                 </div>
//               </div>

//               {/* ✅ Animated table */}
//               <div className="relative overflow-hidden">
//                 <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                   <AnimatePresence mode="wait" custom={pageDir}>
//                     <motion.div
//                       key={`addontrip-page-${page}-${search}`}
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
//                             <th className="px-5 py-3">AddOnTrip Name</th>
//                             <th className="px-5 py-3">Country</th>
//                             <th className="px-5 py-3">State</th>
//                             <th className="px-5 py-3">Destination</th>
//                             <th className="px-5 py-3">Approx KM</th>
//                             <th className="px-5 py-3">Status</th>
//                             <th className="px-5 py-3 text-center">Action</th>
//                           </tr>
//                         </thead>

//                         <tbody>
//                           {addontrips.map((entry, index) => (
//                             <tr
//                               key={entry._id || index}
//                               className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
//                             >
//                               <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
//                               <td className="px-5 py-3 font-semibold">{entry.addontripName}</td>
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
//                                   title="Edit addon trip"
//                                 >
//                                   <Pencil className="w-4 h-4" />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}

//                           {addontrips.length === 0 && (
//                             <tr>
//                               <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
//                                 No addon trips found.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </motion.div>
//                   </AnimatePresence>
//                 </div>
//               </div>

//               {/* Pagination */}
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

//         {/* Popup (same logic, premium UI) */}
//         {showPopup && selectedAddOnTrip && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               onClick={() => {
//                 setShowPopup(false);
//                 setSelectedAddOnTrip(null);
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
//                   {selectedAddOnTrip.activeStatus ? "Deactivate" : "Activate"} AddOnTrip
//                 </h2>

//                 <p className="mt-3 text-slate-600 text-sm leading-relaxed">
//                   Are you sure you want to{" "}
//                   <span className="font-bold">
//                     {selectedAddOnTrip.activeStatus ? "deactivate" : "activate"}
//                   </span>{" "}
//                   the addontrip:{" "}
//                   <span className="font-semibold">{selectedAddOnTrip.addontripName}</span>?
//                 </p>

//                 <div className="mt-6 flex justify-end gap-2">
//                   <button
//                     className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
//                     onClick={() => {
//                       setShowPopup(false);
//                       setSelectedAddOnTrip(null);
//                     }}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
//                     style={{ background: selectedAddOnTrip.activeStatus ? "#ef4444" : "#22c55e" }}
//                     onClick={handleToggleStatus}
//                   >
//                     {selectedAddOnTrip.activeStatus ? "Deactivate" : "Activate"}
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

// export default CreateAddOnTrip;


// CreateAddOnTrip.jsx  ✅ UPDATED: 8 image slots (same premium tile UI)
// ❗ No other logic/styles/validations changed — ONLY image section upgraded to 8.

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
  Layers,
} from "lucide-react";

import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const CreateAddOnTrip = () => {
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
  const [addontrips, setAddOnTrips] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [editingTripId, setEditingTripId] = useState(null);
  const [search, setSearch] = useState("");

  // ✅ 8 images (Vehicle/Accommodation-style)
  const [images, setImages] = useState(Array(8).fill(null)); // files (UI only)
  const [imageUrls, setImageUrls] = useState(Array(8).fill("")); // stored URLs

  const fileInputRefs = useRef(Array.from({ length: 8 }, () => React.createRef()));

  const [selectedAddOnTrip, setSelectedAddOnTrip] = useState(null);
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
    trip: "",
    addontripName: "",
    description: "",
  });

  // ✅ Premium react-select (same standard as CreateTrip)
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

  // ---------- Helpers to map options ----------
  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  const destinationOptions = destinations.map((d) => ({
    value: d._id,
    label: d.activeStatus === false ? `${d.name} (inactive)` : d.name,
  }));
  const tripOptions = trips.map((t) => ({
    value: t._id,
    label: t.activeStatus === false ? `${t.tripName} (inactive)` : t.tripName,
  }));

  // ✅ Premium table animation variants (UI-only)
  const tableVariants = {
    enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
  };

  const fetchAddOnTrips = async () => {
    try {
      const res = await API.get(`/purchaser/addontrips?page=${page}&search=${search}`);
      setAddOnTrips(res.data.trips);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load trips");
    }
  };

  useEffect(() => {
    fetchAddOnTrips();
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

    // ❗ in edit mode, vendors are handled inside handleEditTrip
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
  }, [selectedDestination, selectedCountry, selectedState, editingTripId]);

  useEffect(() => {
    if (!selectedCountry || !selectedState || !selectedDestination) return;

    // ❗ in edit mode, trips are loaded inside handleEditTrip (with currentTripId)
    if (editingTripId) return;

    setTrips([]);
    setFormData((prev) => ({ ...prev, trip: "" }));

    const fetchTrips = async () => {
      try {
        const res = await API.get(
          `/purchaser/tripsByLocation/${selectedCountry}/${selectedState}/${selectedDestination}`
        );
        setTrips(res.data);
      } catch (err) {
        toast.error("Error fetching Trips:", err);
      }
    };

    fetchTrips();
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
    const updatedRows = [...rows];
    updatedRows[rowIndex].prices[priceIndex][field] = value;
    setRows(updatedRows);
  };

  // ✅ helper: upload and set URL without changing your UX
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

  // ✅ reusable image tile (Vehicle-style, exact same look)
  const ImageSlot = ({ title, url, inputRef, inputId, onPick, onClear }) => (
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

  const handleEditTrip = async (addon) => {
    setEditingTripId(addon._id);

    // basic form fields
    setFormData({
      addontripName: addon.addontripName,
      country: addon.country._id,
      state: addon.state._id,
      destination: addon.destination._id,
      trip: addon.trip._id,
      description: addon.description,
      approxKm: addon.approxKm,
    });

    // ✅ prefill 8 images (backward compatible: old docs may only have first 3)
    const prefill = [
      addon.imageUrl || "",
      addon.secondImageUrl || "",
      addon.thirdImageUrl || "",
      addon.fourthImageUrl || "",
      addon.fifthImageUrl || "",
      addon.sixthImageUrl || "",
      addon.seventhImageUrl || "",
      addon.eighthImageUrl || "",
    ];
    setImageUrls(prefill);
    setImages(Array(8).fill(null));
    // clear file inputs visually
    fileInputRefs.current.forEach((r) => {
      const el = r?.current;
      if (el) el.value = "";
    });

    setSelectedCountry(addon.country._id);

    // 1) States
    try {
      const statesRes = await API.get(`/purchaser/states/${addon.country._id}`);
      setStates(statesRes.data);
    } catch {
      toast.error("Error fetching states");
      return;
    }
    setSelectedState(addon.state._id);

    // 2) Destinations (include current even if inactive)
    try {
      const destRes = await API.get(
        `/purchaser/destinationsByCountryAndState/${addon.country._id}/${addon.state._id}?currentDestinationId=${addon.destination._id}`
      );
      setDestinations(destRes.data);
    } catch {
      toast.error("Error fetching destinations");
      return;
    }
    setSelectedDestination(addon.destination._id);

    // 3) Trips (include current trip even if inactive)
    try {
      const tripsRes = await API.get(
        `/purchaser/tripsByLocation/${addon.country._id}/${addon.state._id}/${addon.destination._id}?currentTripId=${addon.trip._id}`
      );
      setTrips(tripsRes.data);
    } catch {
      toast.error("Error fetching trips");
      return;
    }

    // 4) Vendors (include all vendors used in this addon trip, even if inactive)
    const vendorIdSet = new Set((addon.vehicles || []).map((v) => v.vendor?._id).filter(Boolean));
    const vendorIdCsv = Array.from(vendorIdSet).join(",");

    try {
      const vendorsRes = await API.get(
        `/purchaser/vendorsOfVehicles/${addon.country._id}/${addon.state._id}/${addon.destination._id}?currentVendorId=${encodeURIComponent(
          vendorIdCsv
        )}`
      );
      setVendors(vendorsRes.data);
    } catch {
      toast.error("Error fetching vendors");
      return;
    }

    // 5) Vehicles (per vendor – include any inactive ones used in this addon trip)
    const vendorToVehicleIds = {};
    (addon.vehicles || []).forEach((vg) => {
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
          `/purchaser/vehiclesForTrip/${addon.country._id}/${addon.state._id}/${addon.destination._id}/${vendorId}?currentVehicleIds=${encodeURIComponent(
            csv
          )}`
        );
        newVehiclesCache[vendorId] = res.data;
      } catch {
        toast.error("Error loading vehicles for vendor");
      }
    }
    setVehiclesCache(newVehiclesCache);

    // 6) Rows prefill
    setRows(
      (addon.vehicles || []).map((v) => ({
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

    for (let rowIndex = 0; rowIndex < rowsArg.length; rowIndex++) {
      const row = rowsArg[rowIndex];
      const vehicleId = row.vehicle;

      if (!vehicleId) continue;

      if (!vehicleDateMap.has(vehicleId)) {
        vehicleDateMap.set(vehicleId, []);
      }

      for (let priceIndex = 0; priceIndex < row.prices.length; priceIndex++) {
        const p = row.prices[priceIndex];
        const from = new Date(p.validFrom);
        const to = new Date(p.validTo);

        if (from > to) {
          toast.error(
            `Row ${rowIndex + 1}, Entry ${priceIndex + 1}: 'Valid From' must be before 'Valid To'`
          );
          return false;
        }

        const existingRanges = vehicleDateMap.get(vehicleId);

        for (const range of existingRanges) {
          const isOverlap = from <= range.to && to >= range.from;
          if (isOverlap) {
            toast.error(
              `Overlap for vehicle in:\n- Row ${rowIndex + 1}, Entry ${priceIndex + 1} \nand\n- Row ${
                range.rowIndex + 1
              }, Entry ${range.entryIndex + 1}`
            );
            return false;
          }
        }

        existingRanges.push({ from, to, rowIndex, entryIndex: priceIndex });
      }
    }

    return true;
  };

  const handleCreateTrip = async () => {
    const requiredFields = [
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "destination", label: "Destination" },
      { key: "trip", label: "Trip" },
      { key: "addontripName", label: "AddOnTrip" },
      { key: "description", label: "AddOnTrip Description" },
    ];

    for (const field of requiredFields) {
      const value = formData[field.key];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        toast.error(`${field.label} is mandatory`);
        return;
      }
    }

    const hasValidRow = rows.some((row) => row.vendor && row.category && row.vehicle);
    if (!hasValidRow) {
      toast.error("Please add atleast one vehicle.");
      return;
    }

    const isValid = validateVehiclePriceRanges(rows);
    if (!isValid) return;

    try {
      const payload = {
        formData: {
          ...formData,

          // ✅ 8 images (keep old names + extend)
          imageUrl: imageUrls[0] || "",
          secondImageUrl: imageUrls[1] || "",
          thirdImageUrl: imageUrls[2] || "",
          fourthImageUrl: imageUrls[3] || "",
          fifthImageUrl: imageUrls[4] || "",
          sixthImageUrl: imageUrls[5] || "",
          seventhImageUrl: imageUrls[6] || "",
          eighthImageUrl: imageUrls[7] || "",
        },
        rows,
      };

      if (editingTripId) {
        await API.put(`/purchaser/updateAddOnTrip/${editingTripId}`, payload);
        toast.success("Trip updated successfully!");
      } else {
        await API.post("/purchaser/createAddOnTrip", payload);
        toast.success("Trip created successfully!");
      }

      setFormData({
        country: "",
        state: "",
        destination: "",
        approxKm: "",
        trip: "",
        addontripName: "",
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
      setTrips([]);
      setVehiclesCache({});
      setStates([]);
      setDestinations([]);
      setEditingTripId(null);
      fetchAddOnTrips();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save trip");
    }
  };

  const handleStatusClick = (addontrip) => {
    setSelectedAddOnTrip(addontrip);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedAddOnTrip) return;

    try {
      const updatedStatus = !selectedAddOnTrip.activeStatus;

      const res = await API.patch(
        `/purchaser/updateAddOnTripStatus/${selectedAddOnTrip._id}/status`,
        { activeStatus: updatedStatus }
      );

      if (res.data.success) {
        toast.success(`Addontrip ${updatedStatus ? "activated" : "deactivated"} successfully`);
        await fetchAddOnTrips();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedAddOnTrip(null);
    }
  };

  // ---------- Clear all prefilled edit data ----------
  const clearAllPrefill = () => {
    setEditingTripId(null);
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDestination("");
    setSelectedVendor("");
    setStates([]);
    setDestinations([]);
    setVendors([]);
    setTrips([]);
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
      trip: "",
      addontripName: "",
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
      {/* Premium Shell */}
      <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
        {/* Ribbon */}
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
                Create AddOnTrip
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Create / update addon trips, add vehicle pricing ranges, and manage status.
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
                <Layers size={20} />
              </div>
            </div>
          </div>

          {/* Layout: Form card on top, Table below */}
          <div className="space-y-6">
            {/* TOP: FORM CARD */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    {editingTripId ? "Edit addon trip" : "Add new addon trip"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Pick location, select base trip, fill details, then add at least one vehicle with valid date ranges.
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
                      classNamePrefix="addon-country"
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
                      classNamePrefix="addon-state"
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
                      classNamePrefix="addon-destination"
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

                {/* Select Trip */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <ListChecks size={12} style={{ color: THEME }} />
                    Select Base Trip
                  </div>

                  <Select
                    styles={selectStyles}
                    options={tripOptions}
                    placeholder="Select Trip"
                    value={tripOptions.find((o) => o.value === formData.trip) || null}
                    onChange={(opt) => setFormData({ ...formData, trip: opt?.value || "" })}
                    isDisabled={!!editingTripId || !selectedDestination}
                    isClearable
                    classNamePrefix="addon-trip"
                    menuPortalTarget={document.body}
                  />
                  {!selectedDestination && (
                    <div className="mt-1 text-xs text-slate-400">Select destination to load trips.</div>
                  )}
                </div>

                {/* AddOnTrip Name */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <ListChecks size={12} style={{ color: THEME }} />
                    AddOnTrip Name
                  </div>
                  <input
                    type="text"
                    placeholder="AddOnTrip Name"
                    className="
                      w-full rounded-2xl border border-slate-300 bg-white/90
                      px-4 py-3 text-sm outline-none shadow-sm
                      focus:ring-2 transition
                    "
                    style={{ "--tw-ring-color": THEME }}
                    value={formData.addontripName}
                    onChange={(e) => setFormData({ ...formData, addontripName: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <ListChecks size={12} style={{ color: THEME }} />
                    AddOnTrip Description
                  </div>
                  <textarea
                    placeholder="Enter addon trip description..."
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

                {/* ✅ AddOnTrip Images (UPDATED to 8 slots) */}
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
                          AddOnTrip images
                        </div>
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
                          inputId={`addon-image-upload-${idx + 1}`}
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
                    const vendorOptions = vendors.map((v) => ({
                      value: v._id,
                      label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
                    }));

                    const vendorValue = vendorOptions.find((o) => o.value === row.vendor) || null;

                    const categoryOptions = [
                      ...new Set((vehiclesCache[row.vendor] || []).map((v) => v.category)),
                    ].map((c) => ({ value: c, label: c }));

                    const categoryValue = categoryOptions.find((o) => o.value === row.category) || null;

                    const vehicleOptions = (vehiclesCache[row.vendor] || [])
                      .filter((v) => v.category === row.category)
                      .map((v) => ({
                        value: v._id,
                        label: v.activeStatus === false ? `${v.vehicle} (inactive)` : v.vehicle,
                      }));

                    const vehicleValue = vehicleOptions.find((o) => o.value === row.vehicle) || null;

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

                            {/* Vendor */}
                            <Select
                              styles={selectStyles}
                              options={vendorOptions}
                              placeholder="Select Vendor"
                              value={vendorValue}
                              onChange={async (opt) => {
                                const selected = opt?.value || "";
                                const updatedRows = [...rows];

                                updatedRows[rowIndex].vendor = selected;
                                updatedRows[rowIndex].category = "";
                                updatedRows[rowIndex].vehicle = "";

                                setRows(updatedRows);

                                if (!selected) return;

                                if (!vehiclesCache[selected]) {
                                  if (selectedCountry && selectedState && selectedDestination) {
                                    try {
                                      const res = await API.get(
                                        `/purchaser/vehiclesForTrip/${selectedCountry}/${selectedState}/${selectedDestination}/${selected}`
                                      );
                                      setVehiclesCache((prev) => ({
                                        ...prev,
                                        [selected]: res.data,
                                      }));
                                    } catch (err) {
                                      toast.error("Error fetching vehicles:", err);
                                    }
                                  }
                                }
                              }}
                              isClearable
                              classNamePrefix="addon-vendor"
                              menuPortalTarget={document.body}
                            />

                            {/* Category */}
                            <Select
                              styles={selectStyles}
                              options={categoryOptions}
                              placeholder="Select vehicle category"
                              value={categoryValue}
                              onChange={(opt) => {
                                const updatedRows = [...rows];
                                updatedRows[rowIndex].category = opt?.value || "";
                                updatedRows[rowIndex].vehicle = "";
                                setRows(updatedRows);
                              }}
                              isDisabled={!row.vendor}
                              isClearable
                              classNamePrefix="addon-category"
                              menuPortalTarget={document.body}
                            />

                            {/* Vehicle */}
                            <Select
                              styles={selectStyles}
                              options={vehicleOptions}
                              placeholder="Select vehicle"
                              value={vehicleValue}
                              onChange={(opt) => {
                                const updatedRows = [...rows];
                                updatedRows[rowIndex].vehicle = opt?.value || "";
                                setRows(updatedRows);
                              }}
                              isDisabled={!row.vendor || !row.category}
                              isClearable
                              classNamePrefix="addon-vehicle"
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

                          {/* Price Rows */}
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

                {/* Submit */}
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
                  {editingTripId ? "Update AddOnTrip" : "Create AddOnTrip"}
                </button>
              </div>
            </div>

            {/* BELOW: TABLE CARD (UNCHANGED) */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">AddOnTrips</div>
                  <div className="mt-1 text-sm text-slate-500">Search and edit addon trips</div>
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
                    placeholder="Search by addon trip name..."
                    className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                  />
                </div>
              </div>

              {/* ✅ Animated table */}
              <div className="relative overflow-hidden">
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <AnimatePresence mode="wait" custom={pageDir}>
                    <motion.div
                      key={`addontrip-page-${page}-${search}`}
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
                            <th className="px-5 py-3">AddOnTrip Name</th>
                            <th className="px-5 py-3">Country</th>
                            <th className="px-5 py-3">State</th>
                            <th className="px-5 py-3">Destination</th>
                            <th className="px-5 py-3">Approx KM</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {addontrips.map((entry, index) => (
                            <tr
                              key={entry._id || index}
                              className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                            >
                              <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
                              <td className="px-5 py-3 font-semibold">{entry.addontripName}</td>
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
                                  title="Edit addon trip"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}

                          {addontrips.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                                No addon trips found.
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
                  <ChevronRight as={ChevronRightIcon} size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popup (UNCHANGED) */}
        {showPopup && selectedAddOnTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                setSelectedAddOnTrip(null);
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
                  {selectedAddOnTrip.activeStatus ? "Deactivate" : "Activate"} AddOnTrip
                </h2>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold">
                    {selectedAddOnTrip.activeStatus ? "deactivate" : "activate"}
                  </span>{" "}
                  the addontrip: <span className="font-semibold">{selectedAddOnTrip.addontripName}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                    onClick={() => {
                      setShowPopup(false);
                      setSelectedAddOnTrip(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
                    style={{ background: selectedAddOnTrip.activeStatus ? "#ef4444" : "#22c55e" }}
                    onClick={handleToggleStatus}
                  >
                    {selectedAddOnTrip.activeStatus ? "Deactivate" : "Activate"}
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

export default CreateAddOnTrip;
