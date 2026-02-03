// import React, { useState, useEffect, useRef, useMemo } from "react";
// import Select from "react-select";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   X,
//   Pencil,
//   CheckCircle,
//   XCircle,
//   Sparkles,
//   Search,
//   MapPin,
//   Image as ImageIcon,
//   ListChecks,
//   Tags,
//   BadgePercent,
//   ChevronLeft,
//   ChevronRight as ChevronRightIcon,
// } from "lucide-react";
// import { toast } from "react-toastify";

// import API from "../../api";
// import uploadImageToCloudinary from "../../utils/uploadCloudinary";

// const CreateActivity = () => {
//   const THEME = "#8570EE";

//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [trips, setTrips] = useState([]);
//   const [activities, setActivities] = useState([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [editingActivityId, setEditingActivityId] = useState(null);

//   // ✅ UI-only: pagination animation direction
//   const [pageDir, setPageDir] = useState(1);

//   const [priceFields, setPriceFields] = useState([
//     { from: "", to: "", price: "", percentage: "", itineraryPrice: "" },
//   ]);

//   const [formData, setFormData] = useState({
//     country: "",
//     state: "",
//     destination: "",
//     vendor: "",
//     trip: "",
//     activityName: "",
//     description: "",
//   });

//   // ✅ 3 images (Trip-style)
//   const [image1, setImage1] = useState(null);
//   const [image2, setImage2] = useState(null);
//   const [image3, setImage3] = useState(null);

//   const [imageUrl, setImageUrl] = useState("");
//   const [secondImageUrl, setSecondImageUrl] = useState("");
//   const [thirdImageUrl, setThirdImageUrl] = useState("");

//   const fileInputRef1 = useRef(null);
//   const fileInputRef2 = useRef(null);
//   const fileInputRef3 = useRef(null);

//   const [selectedActivity, setSelectedActivity] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);

//   // ---------- Premium table animation variants (UI-only) ----------
//   const tableVariants = {
//     enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
//     center: { x: 0, opacity: 1, filter: "blur(0px)" },
//     exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
//   };

//   // ---------- Premium react-select styles (match CreateTrip standard) ----------
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
//         opacity: state.isDisabled ? 0.75 : 1,
//         cursor: state.isDisabled ? "not-allowed" : "default",
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

//   // ---------- options ----------
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
//   const tripOptions = trips.map((t) => ({
//     value: t._id,
//     label: t.activeStatus === false ? `${t.tripName} (inactive)` : t.tripName,
//   }));

//   const fetchActivities = async () => {
//     try {
//       const res = await API.get("/purchaser/activities", {
//         params: { page, limit: 3, search },
//       });
//       setActivities(res.data.activities);
//       setTotalPages(res.data.totalPages);
//     } catch (err) {
//       toast.error("Failed to fetch activities");
//     }
//   };

//   useEffect(() => {
//     fetchActivities();
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

//   const fetchStates = async (countryId) => {
//     try {
//       const res = await API.get(`/purchaser/states/${countryId}`);
//       setStates(res.data);
//     } catch (err) {
//       toast.error(`Error fetching states: ${err.message}`);
//     }
//   };

//   const fetchDestinations = async (countryId, stateId, currentDestinationId) => {
//     try {
//       if (countryId && stateId) {
//         let url = `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`;
//         if (currentDestinationId) {
//           url += `?currentDestinationId=${encodeURIComponent(currentDestinationId)}`;
//         }
//         const res = await API.get(url);
//         setDestinations(res.data);
//       } else {
//         setDestinations([]);
//       }
//     } catch (err) {
//       toast.error(`Error fetching destinations: ${err.message}`);
//     }
//   };

//   useEffect(() => {
//     if (!formData.country || !formData.state) return;
//     if (editingActivityId) return; // 👈 don't override while editing
//     fetchDestinations(formData.country, formData.state);
//   }, [formData.country, formData.state, editingActivityId]);

//   const fetchData = async (countryId, stateId, destinationId, currentVendorId, currentTripId) => {
//     try {
//       if (countryId && stateId && destinationId) {
//         let vendorsUrl = `/purchaser/vendorsOfActivities/${countryId}/${stateId}/${destinationId}`;
//         if (currentVendorId) {
//           vendorsUrl += `?currentVendorId=${encodeURIComponent(currentVendorId)}`;
//         }

//         let tripsUrl = `/purchaser/tripsByLocation/${countryId}/${stateId}/${destinationId}`;
//         if (currentTripId) {
//           tripsUrl += `?currentTripId=${encodeURIComponent(currentTripId)}`;
//         }

//         const [vendorsRes, tripsRes] = await Promise.all([API.get(vendorsUrl), API.get(tripsUrl)]);
//         setVendors(vendorsRes.data);
//         setTrips(tripsRes.data);
//       } else {
//         setVendors([]);
//         setTrips([]);
//       }
//     } catch (err) {
//       toast.error(`Error fetching vendors/trips: ${err.message}`);
//     }
//   };

//   useEffect(() => {
//     if (!formData.country || !formData.state || !formData.destination) return;
//     if (editingActivityId) return; // 👈 don't override while editing
//     fetchData(formData.country, formData.state, formData.destination);
//   }, [formData.country, formData.state, formData.destination, editingActivityId]);

//   const handleFieldChange = (index, field, value) => {
//     const updated = [...priceFields];
//     updated[index][field] = value;

//     const basePrice = parseFloat(updated[index].price || 0);
//     const percentage = parseFloat(updated[index].percentage || 0);
//     const itineraryPrice = basePrice + (basePrice * percentage) / 100;

//     updated[index].itineraryPrice = isNaN(itineraryPrice) ? "" : itineraryPrice.toFixed(2);
//     setPriceFields(updated);
//   };

//   const addField = () => {
//     setPriceFields((prev) => [...prev, { from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]);
//   };

//   const removeField = (index) => {
//     const updated = [...priceFields];
//     updated.splice(index, 1);
//     setPriceFields(updated);
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

//   // ✅ reusable image tile (Trip-style)
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

//       <input id={inputId} type="file" accept="image/*" ref={inputRef} className="hidden" onChange={onPick} />

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

//   const handleEdit = async (activity) => {
//     try {
//       setEditingActivityId(activity._id);

//       const countryId = activity.country?._id;
//       const stateId = activity.state?._id;
//       const destinationId = activity.destination?._id;
//       const vendorId = activity.vendor?._id;
//       const tripId = activity.trip?._id;

//       await fetchStates(countryId);
//       await fetchDestinations(countryId, stateId, destinationId); // include currentDestinationId
//       await fetchData(countryId, stateId, destinationId, vendorId, tripId); // include currentVendorId & currentTripId

//       setFormData({
//         country: countryId || "",
//         state: stateId || "",
//         destination: destinationId || "",
//         vendor: vendorId || "",
//         trip: tripId || "",
//         activityName: activity.activityName || "",
//         description: activity.description || "",
//       });

//       // ✅ prefill 3 images (safe if backend hasn't added 2nd/3rd yet)
//       setImageUrl(activity.imageUrl || "");
//       setSecondImageUrl(activity.secondImageUrl || "");
//       setThirdImageUrl(activity.thirdImageUrl || "");
//       setImage1(null);
//       setImage2(null);
//       setImage3(null);

//       // clear file inputs (optional but clean)
//       if (fileInputRef1.current) fileInputRef1.current.value = "";
//       if (fileInputRef2.current) fileInputRef2.current.value = "";
//       if (fileInputRef3.current) fileInputRef3.current.value = "";

//       setPriceFields(
//         activity.prices?.length
//           ? activity.prices.map((p) => ({
//               from: p.validFrom?.slice(0, 10) || "",
//               to: p.validTo?.slice(0, 10) || "",
//               price: p.price || "",
//               percentage: p.percentage || "",
//               itineraryPrice: p.itineraryPrice || "",
//             }))
//           : [{ from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]
//       );

//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (err) {
//       toast.error(`Error during editing: ${err.message}`);
//     }
//   };

//   const handleCreateActivity = async () => {
//     const requiredFields = {
//       country: "Country",
//       state: "State",
//       destination: "Destination",
//       vendor: "Vendor",
//       trip: "Trip",
//       activityName: "Activity Name",
//       description: "Activity Description",
//     };

//     for (let key in requiredFields) {
//       if (!formData[key]) {
//         toast.error(`${requiredFields[key]} is required.`);
//         return;
//       }
//     }

//     if (!priceFields.length) {
//       toast.error("At least one price field is required.");
//       return;
//     }

//     for (let i = 0; i < priceFields.length; i++) {
//       const { from, to, price } = priceFields[i];
//       if (!from || !to || !price) {
//         toast.error(`Price row ${i + 1} is incomplete. Please fill From, To, and Price.`);
//         return;
//       }
//       if (new Date(from) >= new Date(to)) {
//         toast.error(`Price row ${i + 1}: 'From' date must be before 'To' date.`);
//         return;
//       }
//       if (isNaN(price) || Number(price) <= 0) {
//         toast.error(`Price row ${i + 1}: Price must be a positive number.`);
//         return;
//       }
//     }

//     // Overlap check
//     const parsedRanges = priceFields.map((p) => ({ from: new Date(p.from), to: new Date(p.to) }));
//     for (let i = 0; i < parsedRanges.length; i++) {
//       for (let j = i + 1; j < parsedRanges.length; j++) {
//         const a = parsedRanges[i],
//           b = parsedRanges[j];
//         if (a.from <= b.to && a.to >= b.from) {
//           toast.error(`Date ranges in price row ${i + 1} and ${j + 1} are overlapping.`);
//           return;
//         }
//       }
//     }

//     try {
//       const payload = {
//         ...formData,
//         prices: priceFields.map((p) => ({
//           validFrom: new Date(p.from),
//           validTo: new Date(p.to),
//           price: Number(p.price),
//           percentage: Number(p.percentage || 0),
//           itineraryPrice: Number(p.itineraryPrice || 0),
//         })),

//         // ✅ send 3 urls (backend must support to store all 3)
//         imageUrl,
//         secondImageUrl,
//         thirdImageUrl,
//       };

//       if (editingActivityId) {
//         await API.put(`/purchaser/updateActivity/${editingActivityId}`, payload);
//         toast.success("Activity updated successfully!");
//       } else {
//         await API.post("/purchaser/createActivity", payload);
//         toast.success("Activity created successfully!");
//       }

//       clearAllPrefill();
//       fetchActivities();
//     } catch (err) {
//       toast.error(`Error creating activity: ${err.response?.data?.error || err.message}`);
//     }
//   };

//   const handleStatusClick = (activity) => {
//     setSelectedActivity(activity);
//     setShowPopup(true);
//   };

//   const handleToggleStatus = async () => {
//     if (!selectedActivity) return;
//     try {
//       const updatedStatus = !selectedActivity.activeStatus;
//       const res = await API.patch(`/purchaser/updateActivityStatus/${selectedActivity._id}/status`, {
//         activeStatus: updatedStatus,
//       });
//       if (res.data.success) {
//         toast.success(`Activity ${updatedStatus ? "activated" : "deactivated"} successfully`);
//         await fetchActivities();
//       } else {
//         toast.error("Update failed");
//       }
//     } catch (err) {
//       toast.error("Server error");
//     } finally {
//       setShowPopup(false);
//       setSelectedActivity(null);
//     }
//   };

//   // ---------- Clear prefill (same pattern as Trip/AddOnTrip) ----------
//   const clearAllPrefill = () => {
//     setEditingActivityId(null);
//     setFormData({
//       country: "",
//       state: "",
//       destination: "",
//       vendor: "",
//       trip: "",
//       activityName: "",
//       description: "",
//     });
//     setPriceFields([{ from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]);
//     setStates([]);
//     setDestinations([]);
//     setVendors([]);
//     setTrips([]);

//     // ✅ clear images (3)
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
//               <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">Create Activity</div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Create / update activities, add non-overlapping price ranges, and manage status.
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {editingActivityId && (
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
//                 <Tags size={20} />
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
//                     {editingActivityId ? "Edit activity" : "Add new activity"}
//                   </div>
//                   <div className="mt-1 text-sm text-slate-500">
//                     Pick location, select vendor & trip, then add valid price ranges.
//                   </div>
//                 </div>

//                 {editingActivityId && (
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
//                 {/* Location + Vendor */}
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
//                       value={countryOptions.find((o) => o.value === formData.country) || null}
//                       onChange={(opt) => {
//                         const value = opt?.value || "";
//                         setFormData((prev) => ({
//                           ...prev,
//                           country: value,
//                           state: "",
//                           destination: "",
//                           vendor: "",
//                           trip: "",
//                         }));
//                         if (value) fetchStates(value);
//                       }}
//                       isDisabled={!!editingActivityId}
//                       isClearable={false}
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
//                       value={stateOptions.find((o) => o.value === formData.state) || null}
//                       onChange={(opt) => {
//                         const value = opt?.value || "";
//                         setFormData((prev) => ({
//                           ...prev,
//                           state: value,
//                           destination: "",
//                           vendor: "",
//                           trip: "",
//                         }));
//                       }}
//                       isDisabled={!!editingActivityId || !formData.country}
//                       isClearable={false}
//                       menuPortalTarget={document.body}
//                     />
//                     {!formData.country && (
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
//                       value={destinationOptions.find((o) => o.value === formData.destination) || null}
//                       onChange={(opt) => {
//                         const value = opt?.value || "";
//                         setFormData((prev) => ({
//                           ...prev,
//                           destination: value,
//                           vendor: "",
//                           trip: "",
//                         }));
//                       }}
//                       isDisabled={!!editingActivityId || !formData.state}
//                       isClearable={false}
//                       menuPortalTarget={document.body}
//                     />
//                     {!formData.state && (
//                       <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
//                     )}
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <ListChecks size={12} style={{ color: THEME }} />
//                       Vendor
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={vendorOptions}
//                       placeholder="Select Vendor"
//                       value={vendorOptions.find((o) => o.value === formData.vendor) || null}
//                       onChange={(opt) => {
//                         const value = opt?.value || "";
//                         setFormData((prev) => ({ ...prev, vendor: value }));
//                       }}
//                       isDisabled={!!editingActivityId || !formData.destination}
//                       isClearable={false}
//                       menuPortalTarget={document.body}
//                     />
//                     {!formData.destination && (
//                       <div className="mt-1 text-xs text-slate-400">Select destination first to enable vendors.</div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Trip */}
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <ListChecks size={12} style={{ color: THEME }} />
//                     Trip
//                   </div>
//                   <Select
//                     styles={selectStyles}
//                     options={tripOptions}
//                     placeholder="Select Trip"
//                     value={tripOptions.find((o) => o.value === formData.trip) || null}
//                     onChange={(opt) => setFormData((prev) => ({ ...prev, trip: opt?.value || "" }))}
//                     isDisabled={!!editingActivityId || !formData.destination}
//                     isClearable={false}
//                     menuPortalTarget={document.body}
//                   />
//                 </div>

//                 {/* Activity Name */}
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <ListChecks size={12} style={{ color: THEME }} />
//                     Activity Name
//                   </div>
//                   <input
//                     className="
//                       w-full rounded-2xl border border-slate-300 bg-white/90
//                       px-4 py-3 text-sm outline-none shadow-sm
//                       focus:ring-2 transition
//                     "
//                     style={{ "--tw-ring-color": THEME }}
//                     placeholder="Activity name"
//                     value={formData.activityName}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, activityName: e.target.value }))}
//                   />
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                     <ListChecks size={12} style={{ color: THEME }} />
//                     Activity Description
//                   </div>
//                   <textarea
//                     rows={4}
//                     className="
//                       w-full h-28 resize-none
//                       rounded-2xl border border-slate-300 bg-white/90
//                       px-4 py-3 text-sm outline-none shadow-sm
//                       focus:ring-2 transition
//                     "
//                     style={{ "--tw-ring-color": THEME }}
//                     placeholder="Activity Description"
//                     value={formData.description}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//                   />
//                 </div>

//                 {/* ✅ Activity Images (Trip-style 3 slots) */}
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
//                           Activity images
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
//                         inputId="activity-image-upload-1"
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
//                         inputId="activity-image-upload-2"
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
//                         inputId="activity-image-upload-3"
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

//                 {/* Pricing */}
//                 <div className="space-y-4">
//                   <div className="flex items-start justify-between gap-3 flex-wrap">
//                     <div>
//                       <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Pricing</div>
//                       <div className="mt-1 text-sm text-slate-500">
//                         Add non-overlapping date ranges. Itinerary price is auto-calculated.
//                       </div>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={addField}
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
//                       Add price row
//                     </button>
//                   </div>

//                   {priceFields.map((field, index) => (
//                     <div
//                       key={index}
//                       className="
//                         rounded-[22px]
//                         border border-slate-200
//                         bg-white
//                         shadow-[0_10px_30px_rgba(15,23,42,0.08)]
//                         overflow-hidden
//                       "
//                     >
//                       <div className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50/60">
//                         <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center">
//                           <input
//                             type="date"
//                             className="
//                               w-full rounded-2xl border border-slate-300 bg-white/90
//                               px-4 py-3 text-sm outline-none shadow-sm
//                               focus:ring-2 transition
//                             "
//                             style={{ "--tw-ring-color": THEME }}
//                             value={field.from}
//                             onChange={(e) => handleFieldChange(index, "from", e.target.value)}
//                           />

//                           <input
//                             type="date"
//                             className="
//                               w-full rounded-2xl border border-slate-300 bg-white/90
//                               px-4 py-3 text-sm outline-none shadow-sm
//                               focus:ring-2 transition
//                             "
//                             style={{ "--tw-ring-color": THEME }}
//                             value={field.to}
//                             onChange={(e) => handleFieldChange(index, "to", e.target.value)}
//                           />

//                           <input
//                             type="text"
//                             placeholder="Price"
//                             className="
//                               w-full rounded-2xl border border-slate-300 bg-white/90
//                               px-4 py-3 text-sm outline-none shadow-sm
//                               focus:ring-2 transition
//                             "
//                             style={{ "--tw-ring-color": THEME }}
//                             value={field.price}
//                             onChange={(e) => handleFieldChange(index, "price", e.target.value)}
//                           />

//                           <div className="relative">
//                             <BadgePercent
//                               size={16}
//                               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                             />
//                             <input
//                               type="number"
//                               placeholder="%"
//                               className="
//                                 w-full rounded-2xl border border-slate-300 bg-white/90
//                                 pl-9 pr-4 py-3 text-sm outline-none shadow-sm
//                                 focus:ring-2 transition
//                               "
//                               style={{ "--tw-ring-color": THEME }}
//                               value={field.percentage}
//                               onChange={(e) => handleFieldChange(index, "percentage", e.target.value)}
//                             />
//                           </div>

//                           <input
//                             type="text"
//                             placeholder="Itinerary Price"
//                             className="
//                               w-full rounded-2xl border border-slate-200 bg-slate-100
//                               px-4 py-3 text-sm outline-none shadow-sm
//                               text-slate-700
//                             "
//                             value={field.itineraryPrice}
//                             readOnly
//                           />

//                           <div className="flex justify-end">
//                             {index === 0 ? (
//                               <button
//                                 type="button"
//                                 onClick={addField}
//                                 className="
//                                   inline-flex items-center justify-center
//                                   w-11 h-11 rounded-2xl
//                                   text-white font-bold
//                                   shadow-[0_12px_28px_rgba(133,112,238,0.35)]
//                                   hover:opacity-95 active:scale-[0.99] transition
//                                 "
//                                 style={{ background: THEME }}
//                                 title="Add"
//                               >
//                                 <Plus size={18} />
//                               </button>
//                             ) : (
//                               <button
//                                 type="button"
//                                 onClick={() => removeField(index)}
//                                 className="
//                                   inline-flex items-center justify-center
//                                   w-11 h-11 rounded-2xl
//                                   border border-red-200
//                                   bg-red-50 hover:bg-red-100
//                                   text-red-600
//                                   shadow-sm
//                                   transition
//                                 "
//                                 title="Remove"
//                               >
//                                 <X size={18} />
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Submit */}
//                 <button
//                   type="button"
//                   onClick={handleCreateActivity}
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
//                   {editingActivityId ? "Update Activity" : "Create Activity"}
//                 </button>
//               </div>
//             </div>

//             {/* BELOW: TABLE CARD */}
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">Activities</div>
//                   <div className="mt-1 text-sm text-slate-500">Search and edit activities</div>
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
//                     placeholder="Search by activity name..."
//                     className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
//                   />
//                 </div>
//               </div>

//               {/* Animated table */}
//               <div className="relative overflow-hidden">
//                 <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                   <AnimatePresence mode="wait" custom={pageDir}>
//                     <motion.div
//                       key={`activity-page-${page}-${search}`}
//                       custom={pageDir}
//                       variants={tableVariants}
//                       initial="enter"
//                       animate="center"
//                       exit="exit"
//                       transition={{ duration: 0.22, ease: "easeOut" }}
//                       className="w-full"
//                       style={{ overflow: "visible" }}
//                     >
//                       <table className="w-full text-sm text-left text-slate-700 min-w-[1100px]">
//                         <thead>
//                           <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
//                             <th className="px-5 py-3">Sl No</th>
//                             <th className="px-5 py-3">Activity Name</th>
//                             <th className="px-5 py-3">Trip Name</th>
//                             <th className="px-5 py-3">Country</th>
//                             <th className="px-5 py-3">State</th>
//                             <th className="px-5 py-3">Destination</th>
//                             <th className="px-5 py-3">Status</th>
//                             <th className="px-5 py-3 text-center">Action</th>
//                           </tr>
//                         </thead>

//                         <tbody>
//                           {activities.length === 0 ? (
//                             <tr>
//                               <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
//                                 No activities found.
//                               </td>
//                             </tr>
//                           ) : (
//                             activities.map((activity, index) => (
//                               <tr
//                                 key={activity._id}
//                                 className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
//                               >
//                                 <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
//                                 <td className="px-5 py-3 font-semibold">{activity.activityName}</td>
//                                 <td className="px-5 py-3 font-semibold">{activity.trip?.tripName || "—"}</td>
//                                 <td className="px-5 py-3 font-semibold">{activity.country?.name || "—"}</td>
//                                 <td className="px-5 py-3 font-semibold">{activity.state?.name || "—"}</td>
//                                 <td className="px-5 py-3 font-semibold">{activity.destination?.name || "—"}</td>

//                                 <td className="px-5 py-3 font-semibold">
//                                   {activity.activeStatus ? (
//                                     <button
//                                       type="button"
//                                       onClick={() => handleStatusClick(activity)}
//                                       className="
//                                         inline-flex items-center gap-2
//                                         px-3 py-1.5 rounded-full
//                                         text-xs font-semibold
//                                         border
//                                         bg-emerald-50 text-emerald-700 border-emerald-200
//                                         hover:bg-emerald-100 transition
//                                       "
//                                     >
//                                       <CheckCircle className="w-4 h-4" />
//                                       Active
//                                     </button>
//                                   ) : (
//                                     <button
//                                       type="button"
//                                       onClick={() => handleStatusClick(activity)}
//                                       className="
//                                         inline-flex items-center gap-2
//                                         px-3 py-1.5 rounded-full
//                                         text-xs font-semibold
//                                         border
//                                         bg-red-50 text-red-700 border-red-200
//                                         hover:bg-red-100 transition
//                                       "
//                                     >
//                                       <XCircle className="w-4 h-4" />
//                                       Inactive
//                                     </button>
//                                   )}
//                                 </td>

//                                 <td className="px-5 py-3 text-center">
//                                   <button
//                                     type="button"
//                                     onClick={() => handleEdit(activity)}
//                                     className="
//                                       inline-flex items-center justify-center
//                                       h-9 w-9 rounded-2xl
//                                       border border-slate-200
//                                       bg-white/80 hover:bg-white
//                                       shadow-sm hover:shadow-md transition
//                                       text-slate-700
//                                     "
//                                     title="Edit activity"
//                                   >
//                                     <Pencil className="w-4 h-4" />
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))
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
//         {showPopup && selectedActivity && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               onClick={() => {
//                 setShowPopup(false);
//                 setSelectedActivity(null);
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
//                   {selectedActivity.activeStatus ? "Deactivate" : "Activate"} Activity
//                 </h2>

//                 <p className="mt-3 text-slate-600 text-sm leading-relaxed">
//                   Are you sure you want to{" "}
//                   <span className="font-bold">{selectedActivity.activeStatus ? "deactivate" : "activate"}</span>{" "}
//                   the activity: <span className="font-semibold">{selectedActivity.activityName}</span>?
//                 </p>

//                 <div className="mt-6 flex justify-end gap-2">
//                   <button
//                     className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
//                     onClick={() => {
//                       setShowPopup(false);
//                       setSelectedActivity(null);
//                     }}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
//                     style={{ background: selectedActivity.activeStatus ? "#ef4444" : "#22c55e" }}
//                     onClick={handleToggleStatus}
//                   >
//                     {selectedActivity.activeStatus ? "Deactivate" : "Activate"}
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

// export default CreateActivity;

import React, { useState, useEffect, useRef, useMemo } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Pencil,
  CheckCircle,
  XCircle,
  Sparkles,
  Search,
  MapPin,
  Image as ImageIcon,
  ListChecks,
  Tags,
  BadgePercent,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { toast } from "react-toastify";

import API from "../../api";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const CreateActivity = () => {
  const THEME = "#8570EE";

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [trips, setTrips] = useState([]);

  const [activities, setActivities] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingActivityId, setEditingActivityId] = useState(null);

  // ✅ UI-only: pagination animation direction
  const [pageDir, setPageDir] = useState(1);

  const [priceFields, setPriceFields] = useState([
    { from: "", to: "", price: "", percentage: "", itineraryPrice: "" },
  ]);

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    vendor: "",
    trip: "",
    activityName: "",
    description: "",
    advancePercentage: "", // ✅ NEW (mandatory)
  });

  /* ============================
      ✅ 8 IMAGES (Trip-style)
     - files: UI only
     - urls: sent to backend
  ============================ */
  const [images, setImages] = useState(Array(8).fill(null)); // UI only
  const [imageUrls, setImageUrls] = useState(Array(8).fill("")); // stored URLs
  const fileInputRefs = useRef(Array.from({ length: 8 }, () => React.createRef()));

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // ---------- Premium table animation variants (UI-only) ----------
  const tableVariants = {
    enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
  };

  // ---------- Premium react-select styles (match CreateTrip standard) ----------
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
        opacity: state.isDisabled ? 0.75 : 1,
        cursor: state.isDisabled ? "not-allowed" : "default",
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

  // ---------- options ----------
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
  const tripOptions = trips.map((t) => ({
    value: t._id,
    label: t.activeStatus === false ? `${t.tripName} (inactive)` : t.tripName,
  }));

  const fetchActivities = async () => {
    try {
      const res = await API.get("/purchaser/activities", {
        params: { page, limit: 3, search },
      });
      setActivities(res.data.activities);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch activities");
    }
  };

  useEffect(() => {
    fetchActivities();
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

  const fetchStates = async (countryId) => {
    try {
      const res = await API.get(`/purchaser/states/${countryId}`);
      setStates(res.data);
    } catch (err) {
      toast.error(`Error fetching states: ${err.message}`);
    }
  };

  const fetchDestinations = async (countryId, stateId, currentDestinationId) => {
    try {
      if (countryId && stateId) {
        let url = `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`;
        if (currentDestinationId) {
          url += `?currentDestinationId=${encodeURIComponent(currentDestinationId)}`;
        }
        const res = await API.get(url);
        setDestinations(res.data);
      } else {
        setDestinations([]);
      }
    } catch (err) {
      toast.error(`Error fetching destinations: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!formData.country || !formData.state) return;
    if (editingActivityId) return; // 👈 don't override while editing
    fetchDestinations(formData.country, formData.state);
  }, [formData.country, formData.state, editingActivityId]);

  const fetchData = async (countryId, stateId, destinationId, currentVendorId, currentTripId) => {
    try {
      if (countryId && stateId && destinationId) {
        let vendorsUrl = `/purchaser/vendorsOfActivities/${countryId}/${stateId}/${destinationId}`;
        if (currentVendorId) {
          vendorsUrl += `?currentVendorId=${encodeURIComponent(currentVendorId)}`;
        }

        let tripsUrl = `/purchaser/tripsByLocation/${countryId}/${stateId}/${destinationId}`;
        if (currentTripId) {
          tripsUrl += `?currentTripId=${encodeURIComponent(currentTripId)}`;
        }

        const [vendorsRes, tripsRes] = await Promise.all([API.get(vendorsUrl), API.get(tripsUrl)]);
        setVendors(vendorsRes.data);
        setTrips(tripsRes.data);
      } else {
        setVendors([]);
        setTrips([]);
      }
    } catch (err) {
      toast.error(`Error fetching vendors/trips: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!formData.country || !formData.state || !formData.destination) return;
    if (editingActivityId) return; // 👈 don't override while editing
    fetchData(formData.country, formData.state, formData.destination);
  }, [formData.country, formData.state, formData.destination, editingActivityId]);

  const handleFieldChange = (index, field, value) => {
    const updated = [...priceFields];
    updated[index][field] = value;

    const basePrice = parseFloat(updated[index].price || 0);
    const percentage = parseFloat(updated[index].percentage || 0);
    const itineraryPrice = basePrice + (basePrice * percentage) / 100;

    updated[index].itineraryPrice = isNaN(itineraryPrice) ? "" : itineraryPrice.toFixed(2);
    setPriceFields(updated);
  };

  const addField = () => {
    setPriceFields((prev) => [...prev, { from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]);
  };

  const removeField = (index) => {
    const updated = [...priceFields];
    updated.splice(index, 1);
    setPriceFields(updated);
  };

  // ✅ helper: upload and set URL (index-based, Trip-style)
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

  const handleEdit = async (activity) => {
    try {
      setEditingActivityId(activity._id);

      const countryId = activity.country?._id;
      const stateId = activity.state?._id;
      const destinationId = activity.destination?._id;
      const vendorId = activity.vendor?._id;
      const tripId = activity.trip?._id;

      await fetchStates(countryId);
      await fetchDestinations(countryId, stateId, destinationId);
      await fetchData(countryId, stateId, destinationId, vendorId, tripId);

      setFormData({
        country: countryId || "",
        state: stateId || "",
        destination: destinationId || "",
        vendor: vendorId || "",
        trip: tripId || "",
        activityName: activity.activityName || "",
        description: activity.description || "",
        advancePercentage:
          activity.advancePercentage === 0 || activity.advancePercentage
            ? String(activity.advancePercentage)
            : "",
      });

      // ✅ prefill 8 images (backward compatible)
      const prefill = [
        activity.imageUrl || "",
        activity.secondImageUrl || "",
        activity.thirdImageUrl || "",
        activity.fourthImageUrl || "",
        activity.fifthImageUrl || "",
        activity.sixthImageUrl || "",
        activity.seventhImageUrl || "",
        activity.eightImageUrl || "",
      ];
      setImageUrls(prefill);
      setImages(Array(8).fill(null));

      // clear file inputs visually
      fileInputRefs.current.forEach((r) => {
        const el = r?.current;
        if (el) el.value = "";
      });

      setPriceFields(
        activity.prices?.length
          ? activity.prices.map((p) => ({
              from: p.validFrom?.slice(0, 10) || "",
              to: p.validTo?.slice(0, 10) || "",
              price: p.price || "",
              percentage: p.percentage || "",
              itineraryPrice: p.itineraryPrice || "",
            }))
          : [{ from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(`Error during editing: ${err.message}`);
    }
  };

  const handleCreateActivity = async () => {
    const requiredFields = {
      country: "Country",
      state: "State",
      destination: "Destination",
      trip: "Trip",
      vendor: "Vendor",
      advancePercentage: "Advance percentage",
      activityName: "Activity Name",
      description: "Activity Description",
    };

    for (let key in requiredFields) {
      if (!formData[key] && formData[key] !== 0) {
        toast.error(`${requiredFields[key]} is required.`);
        return;
      }
    }

    // ✅ advancePercentage validation: mandatory + 0-100
    const adv = Number(formData.advancePercentage);
    if (Number.isNaN(adv)) {
      toast.error("Advance percentage must be a valid number.");
      return;
    }
    if (adv < 0) {
      toast.error("Advance percentage cannot be negative.");
      return;
    }
    if (adv > 100) {
      toast.error("Advance percentage cannot be more than 100.");
      return;
    }

    if (!priceFields.length) {
      toast.error("At least one price field is required.");
      return;
    }

    for (let i = 0; i < priceFields.length; i++) {
      const { from, to, price } = priceFields[i];
      if (!from || !to || !price) {
        toast.error(`Price row ${i + 1} is incomplete. Please fill From, To, and Price.`);
        return;
      }
      if (new Date(from) >= new Date(to)) {
        toast.error(`Price row ${i + 1}: 'From' date must be before 'To' date.`);
        return;
      }
      if (isNaN(price) || Number(price) <= 0) {
        toast.error(`Price row ${i + 1}: Price must be a positive number.`);
        return;
      }
    }

    // Overlap check
    const parsedRanges = priceFields.map((p) => ({ from: new Date(p.from), to: new Date(p.to) }));
    for (let i = 0; i < parsedRanges.length; i++) {
      for (let j = i + 1; j < parsedRanges.length; j++) {
        const a = parsedRanges[i],
          b = parsedRanges[j];
        if (a.from <= b.to && a.to >= b.from) {
          toast.error(`Date ranges in price row ${i + 1} and ${j + 1} are overlapping.`);
          return;
        }
      }
    }

    try {
      const payload = {
        ...formData,
        advancePercentage: Number(formData.advancePercentage),

        prices: priceFields.map((p) => ({
          validFrom: new Date(p.from),
          validTo: new Date(p.to),
          price: Number(p.price),
          percentage: Number(p.percentage || 0),
          itineraryPrice: Number(p.itineraryPrice || 0),
        })),

        // ✅ 8 images (same naming convention)
        imageUrl: imageUrls[0] || "",
        secondImageUrl: imageUrls[1] || "",
        thirdImageUrl: imageUrls[2] || "",
        fourthImageUrl: imageUrls[3] || "",
        fifthImageUrl: imageUrls[4] || "",
        sixthImageUrl: imageUrls[5] || "",
        seventhImageUrl: imageUrls[6] || "",
        eightImageUrl: imageUrls[7] || "",
      };

      if (editingActivityId) {
        await API.put(`/purchaser/updateActivity/${editingActivityId}`, payload);
        toast.success("Activity updated successfully!");
      } else {
        await API.post("/purchaser/createActivity", payload);
        toast.success("Activity created successfully!");
      }

      clearAllPrefill();
      fetchActivities();
    } catch (err) {
      toast.error(`Error creating activity: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleStatusClick = (activity) => {
    setSelectedActivity(activity);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedActivity) return;
    try {
      const updatedStatus = !selectedActivity.activeStatus;
      const res = await API.patch(`/purchaser/updateActivityStatus/${selectedActivity._id}/status`, {
        activeStatus: updatedStatus,
      });
      if (res.data.success) {
        toast.success(`Activity ${updatedStatus ? "activated" : "deactivated"} successfully`);
        await fetchActivities();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedActivity(null);
    }
  };

  // ---------- Clear prefill (same pattern as Trip/AddOnTrip) ----------
  const clearAllPrefill = () => {
    setEditingActivityId(null);
    setFormData({
      country: "",
      state: "",
      destination: "",
      vendor: "",
      trip: "",
      activityName: "",
      description: "",
      advancePercentage: "",
    });
    setPriceFields([{ from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]);
    setStates([]);
    setDestinations([]);
    setVendors([]);
    setTrips([]);

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
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">Create Activity</div>
              <div className="mt-1 text-sm text-slate-500">
                Create / update activities, add non-overlapping price ranges, and manage status.
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingActivityId && (
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
                <Tags size={20} />
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
                    {editingActivityId ? "Edit activity" : "Add new activity"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Pick location, select trip & vendor, set advance percentage, then add valid price ranges.
                  </div>
                </div>

                {editingActivityId && (
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
                {/* ✅ Row 1: Country | State | Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <MapPin size={12} style={{ color: THEME }} />
                      Country
                    </div>
                    <Select
                      styles={selectStyles}
                      options={countryOptions}
                      placeholder="Select Country"
                      value={countryOptions.find((o) => o.value === formData.country) || null}
                      onChange={(opt) => {
                        const value = opt?.value || "";
                        setFormData((prev) => ({
                          ...prev,
                          country: value,
                          state: "",
                          destination: "",
                          trip: "",
                          vendor: "",
                        }));
                        if (value) fetchStates(value);
                      }}
                      isDisabled={!!editingActivityId}
                      isClearable={false}
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
                      value={stateOptions.find((o) => o.value === formData.state) || null}
                      onChange={(opt) => {
                        const value = opt?.value || "";
                        setFormData((prev) => ({
                          ...prev,
                          state: value,
                          destination: "",
                          trip: "",
                          vendor: "",
                        }));
                      }}
                      isDisabled={!!editingActivityId || !formData.country}
                      isClearable={false}
                      menuPortalTarget={document.body}
                    />
                    {!formData.country && (
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
                      value={destinationOptions.find((o) => o.value === formData.destination) || null}
                      onChange={(opt) => {
                        const value = opt?.value || "";
                        setFormData((prev) => ({
                          ...prev,
                          destination: value,
                          trip: "",
                          vendor: "",
                        }));
                      }}
                      isDisabled={!!editingActivityId || !formData.state}
                      isClearable={false}
                      menuPortalTarget={document.body}
                    />
                    {!formData.state && (
                      <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
                    )}
                  </div>
                </div>

                {/* ✅ Row 2: Trip | Vendor | Advance Percentage (ORDER FIXED) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <ListChecks size={12} style={{ color: THEME }} />
                      Trip
                    </div>
                    <Select
                      styles={selectStyles}
                      options={tripOptions}
                      placeholder="Select Trip"
                      value={tripOptions.find((o) => o.value === formData.trip) || null}
                      onChange={(opt) => setFormData((prev) => ({ ...prev, trip: opt?.value || "" }))}
                      isDisabled={!!editingActivityId || !formData.destination}
                      isClearable={false}
                      menuPortalTarget={document.body}
                    />
                    {!formData.destination && (
                      <div className="mt-1 text-xs text-slate-400">Select destination first to enable trips.</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <ListChecks size={12} style={{ color: THEME }} />
                      Vendor
                    </div>
                    <Select
                      styles={selectStyles}
                      options={vendorOptions}
                      placeholder="Select Vendor"
                      value={vendorOptions.find((o) => o.value === formData.vendor) || null}
                      onChange={(opt) => {
                        const value = opt?.value || "";
                        setFormData((prev) => ({ ...prev, vendor: value }));
                      }}
                      isDisabled={!!editingActivityId || !formData.destination}
                      isClearable={false}
                      menuPortalTarget={document.body}
                    />
                    {!formData.destination && (
                      <div className="mt-1 text-xs text-slate-400">Select destination first to enable vendors.</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <BadgePercent size={12} style={{ color: THEME }} />
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
                        px-4 py-3 text-sm outline-none shadow-inner
                        focus:ring-2 transition
                      "
                      style={{ "--tw-ring-color": THEME }}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                {/* Activity Name */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <ListChecks size={12} style={{ color: THEME }} />
                    Activity Name
                  </div>
                  <input
                    className="
                      w-full rounded-2xl border border-slate-300 bg-white/90
                      px-4 py-3 text-sm outline-none shadow-sm
                      focus:ring-2 transition
                    "
                    style={{ "--tw-ring-color": THEME }}
                    placeholder="Activity name"
                    value={formData.activityName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, activityName: e.target.value }))}
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                    <ListChecks size={12} style={{ color: THEME }} />
                    Activity Description
                  </div>
                  <textarea
                    rows={4}
                    className="
                      w-full h-28 resize-none
                      rounded-2xl border border-slate-300 bg-white/90
                      px-4 py-3 text-sm outline-none shadow-sm
                      focus:ring-2 transition
                    "
                    style={{ "--tw-ring-color": THEME }}
                    placeholder="Activity Description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* ✅ Activity Images (Trip image UI style — 8 slots, all visible) */}
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
                          Activity images
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
                          inputId={`activity-image-upload-${idx + 1}`}
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

                {/* Pricing */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Pricing</div>
                      <div className="mt-1 text-sm text-slate-500">
                        Add non-overlapping date ranges. Itinerary price is auto-calculated.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addField}
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
                      Add price row
                    </button>
                  </div>

                  {priceFields.map((field, index) => (
                    <div
                      key={index}
                      className="
                        rounded-[22px]
                        border border-slate-200
                        bg-white
                        shadow-[0_10px_30px_rgba(15,23,42,0.08)]
                        overflow-hidden
                      "
                    >
                      <div className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50/60">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center">
                          <input
                            type="date"
                            className="
                              w-full rounded-2xl border border-slate-300 bg-white/90
                              px-4 py-3 text-sm outline-none shadow-sm
                              focus:ring-2 transition
                            "
                            style={{ "--tw-ring-color": THEME }}
                            value={field.from}
                            onChange={(e) => handleFieldChange(index, "from", e.target.value)}
                          />

                          <input
                            type="date"
                            className="
                              w-full rounded-2xl border border-slate-300 bg-white/90
                              px-4 py-3 text-sm outline-none shadow-sm
                              focus:ring-2 transition
                            "
                            style={{ "--tw-ring-color": THEME }}
                            value={field.to}
                            onChange={(e) => handleFieldChange(index, "to", e.target.value)}
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
                            value={field.price}
                            onChange={(e) => handleFieldChange(index, "price", e.target.value)}
                          />

                          <div className="relative">
                            <BadgePercent
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="number"
                              placeholder="%"
                              className="
                                w-full rounded-2xl border border-slate-300 bg-white/90
                                pl-9 pr-4 py-3 text-sm outline-none shadow-sm
                                focus:ring-2 transition
                              "
                              style={{ "--tw-ring-color": THEME }}
                              value={field.percentage}
                              onChange={(e) => handleFieldChange(index, "percentage", e.target.value)}
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Itinerary Price"
                            className="
                              w-full rounded-2xl border border-slate-200 bg-slate-100
                              px-4 py-3 text-sm outline-none shadow-sm
                              text-slate-700
                            "
                            value={field.itineraryPrice}
                            readOnly
                          />

                          <div className="flex justify-end">
                            {index === 0 ? (
                              <button
                                type="button"
                                onClick={addField}
                                className="
                                  inline-flex items-center justify-center
                                  w-11 h-11 rounded-2xl
                                  text-white font-bold
                                  shadow-[0_12px_28px_rgba(133,112,238,0.35)]
                                  hover:opacity-95 active:scale-[0.99] transition
                                "
                                style={{ background: THEME }}
                                title="Add"
                              >
                                <Plus size={18} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeField(index)}
                                className="
                                  inline-flex items-center justify-center
                                  w-11 h-11 rounded-2xl
                                  border border-red-200
                                  bg-red-50 hover:bg-red-100
                                  text-red-600
                                  shadow-sm
                                  transition
                                "
                                title="Remove"
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleCreateActivity}
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
                  {editingActivityId ? "Update Activity" : "Create Activity"}
                </button>
              </div>
            </div>

            {/* BELOW: TABLE CARD */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">Activities</div>
                  <div className="mt-1 text-sm text-slate-500">Search and edit activities</div>
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
                    placeholder="Search by activity name..."
                    className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                  />
                </div>
              </div>

              {/* Animated table */}
              <div className="relative overflow-hidden">
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <AnimatePresence mode="wait" custom={pageDir}>
                    <motion.div
                      key={`activity-page-${page}-${search}`}
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
                            <th className="px-5 py-3">Activity Name</th>
                            <th className="px-5 py-3">Trip Name</th>
                            <th className="px-5 py-3">Country</th>
                            <th className="px-5 py-3">State</th>
                            <th className="px-5 py-3">Destination</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {activities.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                                No activities found.
                              </td>
                            </tr>
                          ) : (
                            activities.map((activity, index) => (
                              <tr
                                key={activity._id}
                                className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                              >
                                <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
                                <td className="px-5 py-3 font-semibold">{activity.activityName}</td>
                                <td className="px-5 py-3 font-semibold">{activity.trip?.tripName || "—"}</td>
                                <td className="px-5 py-3 font-semibold">{activity.country?.name || "—"}</td>
                                <td className="px-5 py-3 font-semibold">{activity.state?.name || "—"}</td>
                                <td className="px-5 py-3 font-semibold">{activity.destination?.name || "—"}</td>

                                <td className="px-5 py-3 font-semibold">
                                  {activity.activeStatus ? (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusClick(activity)}
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
                                      onClick={() => handleStatusClick(activity)}
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
                                    onClick={() => handleEdit(activity)}
                                    className="
                                      inline-flex items-center justify-center
                                      h-9 w-9 rounded-2xl
                                      border border-slate-200
                                      bg-white/80 hover:bg-white
                                      shadow-sm hover:shadow-md transition
                                      text-slate-700
                                    "
                                    title="Edit activity"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
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
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popup (same logic, premium UI) */}
        {showPopup && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                setSelectedActivity(null);
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
                  {selectedActivity.activeStatus ? "Deactivate" : "Activate"} Activity
                </h2>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold">{selectedActivity.activeStatus ? "deactivate" : "activate"}</span>{" "}
                  the activity: <span className="font-semibold">{selectedActivity.activityName}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                    onClick={() => {
                      setShowPopup(false);
                      setSelectedActivity(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
                    style={{ background: selectedActivity.activeStatus ? "#ef4444" : "#22c55e" }}
                    onClick={handleToggleStatus}
                  >
                    {selectedActivity.activeStatus ? "Deactivate" : "Activate"}
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

export default CreateActivity;

