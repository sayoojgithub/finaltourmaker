



// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Plus,
//   X,
//   ChevronDown,
//   ChevronRight,
//   CheckCircle,
//   XCircle,
//   Search,
//   Sparkles,
//   UtensilsCrossed,
//   MapPin,
//   ListChecks,
// } from "lucide-react";
// import { Pencil } from "lucide-react";
// import { toast } from "react-toastify";
// import Select from "react-select";
// import { motion, AnimatePresence } from "framer-motion";
// import API from "../../api";

// const CreateFood = () => {
//   const THEME = "#8570EE";

//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);
//   const [trips, setTrips] = useState([]);
//   const [vendors, setVendors] = useState([]);

//   const [formData, setFormData] = useState({
//     country: "",
//     state: "",
//     destination: "",
//     trip: "",
//   });

//   const [rows, setRows] = useState([
//     {
//       vendor: "",
//       mealType: "",
//       mealCategory: "",
//       foodName: "",
//       description: "",
//       prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
//       expanded: true,
//     },
//   ]);

//   const [tripsWithFood, setTripsWithFood] = useState([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);

//   // ✅ pagination feel (same style as CreateTrip)
//   const [pageDir, setPageDir] = useState(1);

//   const [editingTripFoodId, setEditingTripFoodId] = useState(null);
//   const [selectedTripFood, setSelectedTripFood] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);

//   const tableVariants = {
//     enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
//     center: { x: 0, opacity: 1, filter: "blur(0px)" },
//     exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
//   };

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
//         opacity: 1,
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
//         cursor: "pointer",
//       }),
//       placeholder: (b) => ({ ...b, color: "#6b7280" }),
//     }),
//     [THEME]
//   );

//   // -------- options helpers --------
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
//   const vendorOptions = vendors.map((v) => ({
//     value: v._id,
//     label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
//   }));

//   const mealTypeOptions = [
//     { value: "Breakfast", label: "Breakfast" },
//     { value: "Lunch", label: "Lunch" },
//     { value: "Dinner", label: "Dinner" },
//   ];

//   const mealCategoryOptions = [
//     { value: "budget", label: "Budget" },
//     { value: "premium", label: "Premium" },
//     { value: "luxury", label: "Luxury" },
//     { value: "3star", label: "3 Star" },
//     { value: "4star", label: "4 Star" },
//     { value: "5star", label: "5 Star" },
//   ];

//   // -------- list fetchers --------
//   const fetchTripsWithFood = async () => {
//     try {
//       const res = await API.get("/purchaser/food-trips", {
//         params: { search, page, limit: 3 },
//       });
//       setTripsWithFood(res.data.trips);
//       setTotalPages(res.data.totalPages);
//     } catch (err) {
//       toast.error("Failed to fetch trips with food");
//     }
//   };

//   useEffect(() => {
//     fetchTripsWithFood();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [search, page]);

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
//     const run = async () => {
//       if (!formData.country) {
//         setStates([]);
//         return;
//       }
//       try {
//         const res = await API.get(`/purchaser/states/${formData.country}`);
//         setStates(res.data);
//       } catch (err) {
//         toast.error(`Error fetching states: ${err.message}`);
//       }
//     };
//     run();
//   }, [formData.country]);

//   const fetchDestinations = async (countryId, stateId, currentDestinationId) => {
//     try {
//       if (!countryId || !stateId) {
//         setDestinations([]);
//         return;
//       }

//       let url = `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`;
//       if (currentDestinationId) {
//         url += `?currentDestinationId=${encodeURIComponent(currentDestinationId)}`;
//       }

//       const res = await API.get(url);
//       setDestinations(res.data);
//     } catch (err) {
//       toast.error(`Error fetching destinations: ${err.message}`);
//     }
//   };

//   useEffect(() => {
//     if (!formData.country || !formData.state) {
//       setDestinations([]);
//       return;
//     }
//     if (editingTripFoodId) return;
//     fetchDestinations(formData.country, formData.state);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.country, formData.state, editingTripFoodId]);

//   const fetchData = async (countryId, stateId, destinationId, currentVendorId, currentTripId) => {
//     try {
//       if (!countryId || !stateId || !destinationId) {
//         setVendors([]);
//         setTrips([]);
//         return;
//       }

//       let vendorsUrl = `/purchaser/vendorsOfFoods/${countryId}/${stateId}/${destinationId}`;
//       if (currentVendorId) {
//         vendorsUrl += `?currentVendorId=${encodeURIComponent(currentVendorId)}`;
//       }

//       let tripsUrl = `/purchaser/tripsByLocation/${countryId}/${stateId}/${destinationId}`;
//       if (currentTripId) {
//         tripsUrl += `?currentTripId=${encodeURIComponent(currentTripId)}`;
//       }

//       const [vendorsRes, tripsRes] = await Promise.all([API.get(vendorsUrl), API.get(tripsUrl)]);
//       setVendors(vendorsRes.data);
//       setTrips(tripsRes.data);
//     } catch (err) {
//       toast.error(`Error fetching vendors/trips: ${err.message}`);
//     }
//   };

//   useEffect(() => {
//     if (!formData.country || !formData.state || !formData.destination) {
//       setVendors([]);
//       setTrips([]);
//       return;
//     }
//     if (editingTripFoodId) return;
//     fetchData(formData.country, formData.state, formData.destination);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.country, formData.state, formData.destination, editingTripFoodId]);

//   // -------- row handlers --------
//   const handleChange = (rowIndex, field, value) => {
//     const updated = [...rows];
//     updated[rowIndex][field] = value;
//     setRows(updated);
//   };

//   const handlePriceChange = (rowIndex, priceIndex, field, value) => {
//     const updated = [...rows];
//     const priceObj = updated[rowIndex].prices[priceIndex];
//     priceObj[field] = value;

//     const price = parseFloat(priceObj.price) || 0;
//     const percent = parseFloat(priceObj.percent) || 0;
//     const itineraryPrice = price + (price * percent) / 100;
//     priceObj.itineraryPrice = itineraryPrice.toFixed(2);

//     setRows(updated);
//   };

//   const addRow = () => {
//     setRows((prev) => [
//       ...prev,
//       {
//         vendor: "",
//         mealType: "",
//         mealCategory: "",
//         foodName: "",
//         description: "",
//         prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
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
//     updated[rowIndex].prices.push({
//       validFrom: "",
//       validTo: "",
//       price: "",
//       percent: "",
//       itineraryPrice: "",
//     });
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

//   // -------- validation --------
//   const validateForm = () => {
//     const requiredFields = {
//       country: "Country",
//       state: "State",
//       destination: "Destination",
//       trip: "Trip",
//     };

//     for (const [key, label] of Object.entries(requiredFields)) {
//       if (!formData[key]) {
//         toast.error(`${label} is required.`);
//         return false;
//       }
//     }

//     if (!rows.length) {
//       toast.error("At least one food item is required.");
//       return false;
//     }

//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];
//       const rowPrefix = `Row ${i + 1}`;

//       const requiredRowFields = {
//         vendor: "Vendor",
//         mealType: "Meal Type",
//         mealCategory: "Meal Category",
//         foodName: "Food Name",
//         description: "Description",
//       };

//       for (const [key, label] of Object.entries(requiredRowFields)) {
//         if (!row[key]) {
//           toast.error(`${rowPrefix}: ${label} is required.`);
//           return false;
//         }
//       }

//       if (!row.prices?.length) {
//         toast.error(`${rowPrefix}: At least one price entry is required.`);
//         return false;
//       }

//       const dateRanges = [];
//       for (let j = 0; j < row.prices.length; j++) {
//         const price = row.prices[j];
//         const pricePrefix = `${rowPrefix}, Price ${j + 1}`;

//         if (!price.validFrom || !price.validTo) {
//           toast.error(`${pricePrefix}: Valid From and To dates are required.`);
//           return false;
//         }

//         const from = new Date(price.validFrom);
//         const to = new Date(price.validTo);
//         if (from >= to) {
//           toast.error(`${pricePrefix}: Valid From must be earlier than Valid To.`);
//           return false;
//         }

//         for (let k = 0; k < dateRanges.length; k++) {
//           const { start, end } = dateRanges[k];
//           if (!(to < start || from > end)) {
//             toast.error(`${rowPrefix}: Price ${j + 1} conflicts with Price ${k + 1}.`);
//             return false;
//           }
//         }
//         dateRanges.push({ start: from, end: to });

//         const numericPrice = parseFloat(price.price);
//         const numericPercent = parseFloat(price.percent);
//         if (isNaN(numericPrice) || numericPrice <= 0) {
//           toast.error(`${pricePrefix}: Price must be greater than 0.`);
//           return false;
//         }
//         if (isNaN(numericPercent) || numericPercent <= 0) {
//           toast.error(`${pricePrefix}: Percent must be greater than 0.`);
//           return false;
//         }
//       }
//     }

//     return true;
//   };

//   // -------- editing / submit --------
//   const handleEdit = async (foodId) => {
//     try {
//       const res = await API.get(`/purchaser/food/${foodId}`);
//       const food = res.data;

//       setEditingTripFoodId(foodId);

//       const countryId = food.country?._id;
//       const stateId = food.state?._id;
//       const destinationId = food.destination?._id;
//       const tripId = food.trip?._id;

//       setFormData({
//         country: countryId || "",
//         state: stateId || "",
//         destination: destinationId || "",
//         trip: tripId || "",
//       });

//       const uniqueVendorIds = Array.from(
//         new Set((food.rows || []).map((row) => row.vendor?._id).filter(Boolean))
//       );
//       const vendorIdCsv = uniqueVendorIds.join(",");

//       await fetchDestinations(countryId, stateId, destinationId);
//       await fetchData(countryId, stateId, destinationId, vendorIdCsv, tripId);

//       const formattedRows = (food.rows || []).map((row) => ({
//         vendor: row.vendor?._id || "",
//         mealType: row.mealType || "",
//         mealCategory: row.mealCategory || "",
//         foodName: row.foodName || "",
//         description: row.description || "",
//         prices: (row.prices || []).map((p) => ({
//           validFrom: p.validFrom ? p.validFrom.slice(0, 10) : "",
//           validTo: p.validTo ? p.validTo.slice(0, 10) : "",
//           price: p.price || "",
//           percent: p.percent || "",
//           itineraryPrice: p.itineraryPrice || "",
//         })),
//         expanded: true,
//       }));

//       setRows(formattedRows);

//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (err) {
//       toast.error("Failed to load food for editing.");
//     }
//   };

//   const handleCreateFood = async () => {
//     try {
//       if (!validateForm()) return;

//       const payload = { ...formData, rows };

//       if (editingTripFoodId) {
//         const res = await API.put(`/purchaser/food/${editingTripFoodId}`, payload);
//         if (res.data.success) toast.success("Food updated successfully!");
//         else {
//           toast.error(res?.data?.message || "Failed to update food.");
//           return;
//         }
//       } else {
//         const res = await API.post("/purchaser/createFood", payload);
//         if (res.data.success) toast.success("Food created successfully!");
//         else {
//           toast.error(res?.data?.message || "Failed to create food.");
//           return;
//         }
//       }

//       clearAllPrefill();
//       fetchTripsWithFood();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "An error occurred while submitting food.");
//     }
//   };

//   const handleStatusClick = (tripfood) => {
//     setSelectedTripFood(tripfood);
//     setShowPopup(true);
//   };

//   const handleToggleStatus = async () => {
//     if (!selectedTripFood) return;
//     try {
//       const updatedStatus = !selectedTripFood.activeStatus;
//       const res = await API.patch(
//         `/purchaser/updateTripFoodStatus/${selectedTripFood._id}/status`,
//         { activeStatus: updatedStatus }
//       );
//       if (res.data.success) {
//         toast.success(
//           `Food in the trip ${updatedStatus ? "activated" : "deactivated"} successfully`
//         );
//         await fetchTripsWithFood();
//       } else {
//         toast.error("Update failed");
//       }
//     } catch {
//       toast.error("Server error");
//     } finally {
//       setShowPopup(false);
//       setSelectedTripFood(null);
//     }
//   };

//   const clearAllPrefill = () => {
//     setEditingTripFoodId(null);
//     setFormData({ country: "", state: "", destination: "", trip: "" });
//     setRows([
//       {
//         vendor: "",
//         mealType: "",
//         mealCategory: "",
//         foodName: "",
//         description: "",
//         prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
//         expanded: true,
//       },
//     ]);
//     setStates([]);
//     setDestinations([]);
//     setTrips([]);
//     setVendors([]);
//   };

//   const pillBtnBase =
//     "inline-flex items-center justify-center rounded-2xl transition shadow-sm hover:shadow-md";
//   const iconBtnPurple =
//     "inline-flex items-center justify-center w-11 h-11 rounded-2xl text-white font-bold " +
//     "shadow-[0_12px_28px_rgba(133,112,238,0.35)] hover:opacity-95 active:scale-[0.99] transition";
//   const iconBtnRed =
//     "inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 shadow-sm transition";

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
//                 Create Trip Food
//               </div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Assign foods to trips with date-wise pricing and status management.
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {editingTripFoodId && (
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
//                 style={{
//                   background: `${THEME}12`,
//                   color: THEME,
//                   borderColor: `${THEME}30`,
//                 }}
//               >
//                 <UtensilsCrossed size={20} />
//               </div>
//             </div>
//           </div>

//           {/* Layout: Form card on top, Table below */}
//           <div className="space-y-6">
//             {/* FORM CARD */}
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">
//                     {editingTripFoodId ? "Edit trip food" : "Assign food to trip"}
//                   </div>
//                   <div className="mt-1 text-sm text-slate-500">
//                     Select location + trip, then add at least one food item with non-overlapping date
//                     ranges.
//                   </div>
//                 </div>

//                 {editingTripFoodId && (
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
//                 {/* Filters */}
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
//                           trip: "",
//                         }));
//                         setRows([
//                           {
//                             vendor: "",
//                             mealType: "",
//                             mealCategory: "",
//                             foodName: "",
//                             description: "",
//                             prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
//                             expanded: true,
//                           },
//                         ]);
//                       }}
//                       isDisabled={!!editingTripFoodId}
//                       isClearable={false}
//                       classNamePrefix="food-country"
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
//                           trip: "",
//                         }));
//                         setRows([
//                           {
//                             vendor: "",
//                             mealType: "",
//                             mealCategory: "",
//                             foodName: "",
//                             description: "",
//                             prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
//                             expanded: true,
//                           },
//                         ]);
//                       }}
//                       isDisabled={!!editingTripFoodId || !formData.country}
//                       isClearable={false}
//                       classNamePrefix="food-state"
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
//                         setFormData((prev) => ({ ...prev, destination: value, trip: "" }));
//                         setRows([
//                           {
//                             vendor: "",
//                             mealType: "",
//                             mealCategory: "",
//                             foodName: "",
//                             description: "",
//                             prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
//                             expanded: true,
//                           },
//                         ]);
//                       }}
//                       isDisabled={!!editingTripFoodId || !formData.state}
//                       isClearable={false}
//                       classNamePrefix="food-destination"
//                       menuPortalTarget={document.body}
//                     />
//                     {!formData.state && (
//                       <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
//                     )}
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <ListChecks size={12} style={{ color: THEME }} />
//                       Trip
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={tripOptions}
//                       placeholder="Select Trip"
//                       value={tripOptions.find((o) => o.value === formData.trip) || null}
//                       onChange={(opt) => {
//                         const tripId = opt?.value || "";
//                         setFormData((prev) => ({ ...prev, trip: tripId }));
//                         setRows([
//                           {
//                             vendor: "",
//                             mealType: "",
//                             mealCategory: "",
//                             foodName: "",
//                             description: "",
//                             prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
//                             expanded: true,
//                           },
//                         ]);
//                       }}
//                       isDisabled={!!editingTripFoodId || !formData.destination}
//                       isClearable={false}
//                       classNamePrefix="food-trip"
//                       menuPortalTarget={document.body}
//                     />
//                     {!formData.destination && (
//                       <div className="mt-1 text-xs text-slate-400">Select destination first to enable trips.</div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Food Rows header */}
//                 <div className="flex items-center justify-between gap-2 flex-wrap">
//                   <div>
//                     <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Food rows</div>
//                     <div className="mt-1 text-sm text-slate-500">
//                       Add vendor + meal details + food, then set valid date ranges and pricing.
//                     </div>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={addRow}
//                     className="
//                       inline-flex items-center gap-2
//                       px-4 py-2 rounded-2xl
//                       border border-slate-200
//                       bg-white hover:bg-slate-50
//                       shadow-sm hover:shadow-md transition
//                       text-slate-700 font-semibold
//                     "
//                   >
//                     <Plus size={16} style={{ color: THEME }} />
//                     Add food row
//                   </button>
//                 </div>

//                 {/* Food Rows */}
//                 {rows.map((row, rowIndex) => (
//                   <div
//                     key={rowIndex}
//                     className="
//                       rounded-[22px]
//                       border border-slate-200
//                       bg-white
//                       shadow-[0_10px_30px_rgba(15,23,42,0.08)]
//                       overflow-hidden
//                     "
//                   >
//                     <div className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50/60">
//                       <div className="grid grid-cols-1 lg:grid-cols-[44px_1fr_1fr_1fr_auto] gap-3 items-center">
//                         <button
//                           type="button"
//                           onClick={() => toggleExpand(rowIndex)}
//                           className="
//                             w-11 h-11
//                             flex items-center justify-center
//                             rounded-2xl
//                             border border-slate-200
//                             bg-white hover:bg-slate-50
//                             shadow-sm hover:shadow-md
//                             transition
//                           "
//                           title={row.expanded ? "Collapse" : "Expand"}
//                         >
//                           {row.expanded ? (
//                             <ChevronDown size={18} className="text-slate-700" />
//                           ) : (
//                             <ChevronRight size={18} className="text-slate-700" />
//                           )}
//                         </button>

//                         <Select
//                           styles={selectStyles}
//                           options={vendorOptions}
//                           placeholder="Select Vendor"
//                           value={vendorOptions.find((o) => o.value === row.vendor) || null}
//                           onChange={(opt) => handleChange(rowIndex, "vendor", opt?.value || "")}
//                           isDisabled={!formData.destination}
//                           isClearable
//                           classNamePrefix="food-vendor"
//                           menuPortalTarget={document.body}
//                         />

//                         <Select
//                           styles={selectStyles}
//                           options={mealTypeOptions}
//                           placeholder="Select Meal Type"
//                           value={mealTypeOptions.find((o) => o.value === row.mealType) || null}
//                           onChange={(opt) => handleChange(rowIndex, "mealType", opt?.value || "")}
//                           isClearable
//                           classNamePrefix="food-mealtype"
//                           menuPortalTarget={document.body}
//                         />

//                         <Select
//                           styles={selectStyles}
//                           options={mealCategoryOptions}
//                           placeholder="Select Meal Category"
//                           value={mealCategoryOptions.find((o) => o.value === row.mealCategory) || null}
//                           onChange={(opt) => handleChange(rowIndex, "mealCategory", opt?.value || "")}
//                           isClearable
//                           classNamePrefix="food-mealcat"
//                           menuPortalTarget={document.body}
//                         />

//                         <div className="flex justify-end">
//                           {rowIndex === 0 ? (
//                             <button
//                               type="button"
//                               onClick={addRow}
//                               className={iconBtnPurple}
//                               style={{ background: THEME }}
//                               title="Add Row"
//                             >
//                               <Plus size={18} />
//                             </button>
//                           ) : (
//                             <button
//                               type="button"
//                               onClick={() => removeRow(rowIndex)}
//                               className={iconBtnRed}
//                               title="Remove Row"
//                             >
//                               <X size={18} />
//                             </button>
//                           )}
//                         </div>
//                       </div>

//                       {/* Food text inputs */}
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                             Food name
//                           </div>
//                           <textarea
//                             rows={3}
//                             placeholder="Food Name"
//                             value={row.foodName}
//                             onChange={(e) => handleChange(rowIndex, "foodName", e.target.value)}
//                             className="
//                               w-full resize-none
//                               rounded-2xl border border-slate-300 bg-white/90
//                               px-4 py-3 text-sm outline-none shadow-sm
//                               focus:ring-2 transition
//                             "
//                             style={{ "--tw-ring-color": THEME }}
//                           />
//                         </div>

//                         <div>
//                           <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                             Description
//                           </div>
//                           <textarea
//                             rows={3}
//                             placeholder="Description"
//                             value={row.description}
//                             onChange={(e) => handleChange(rowIndex, "description", e.target.value)}
//                             className="
//                               w-full resize-none
//                               rounded-2xl border border-slate-300 bg-white/90
//                               px-4 py-3 text-sm outline-none shadow-sm
//                               focus:ring-2 transition
//                             "
//                             style={{ "--tw-ring-color": THEME }}
//                           />
//                         </div>
//                       </div>

//                       {/* Price rows */}
//                       {row.expanded && (
//                         <div className="mt-4 space-y-3">
//                           {row.prices.map((priceRow, priceIndex) => (
//                             <div
//                               key={priceIndex}
//                               className="
//                                 grid gap-3 items-center
//                                 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_210px_auto]
//                               "
//                             >
//                               <input
//                                 type="date"
//                                 value={priceRow.validFrom}
//                                 onChange={(e) =>
//                                   handlePriceChange(rowIndex, priceIndex, "validFrom", e.target.value)
//                                 }
//                                 className="
//                                   w-full rounded-2xl border border-slate-300 bg-white/90
//                                   px-4 py-3 text-sm outline-none shadow-sm
//                                   focus:ring-2 transition
//                                 "
//                                 style={{ "--tw-ring-color": THEME }}
//                               />

//                               <input
//                                 type="date"
//                                 value={priceRow.validTo}
//                                 onChange={(e) =>
//                                   handlePriceChange(rowIndex, priceIndex, "validTo", e.target.value)
//                                 }
//                                 className="
//                                   w-full rounded-2xl border border-slate-300 bg-white/90
//                                   px-4 py-3 text-sm outline-none shadow-sm
//                                   focus:ring-2 transition
//                                 "
//                                 style={{ "--tw-ring-color": THEME }}
//                               />

//                               <input
//                                 type="text"
//                                 placeholder="Price"
//                                 value={priceRow.price}
//                                 onChange={(e) =>
//                                   handlePriceChange(rowIndex, priceIndex, "price", e.target.value)
//                                 }
//                                 className="
//                                   w-full rounded-2xl border border-slate-300 bg-white/90
//                                   px-4 py-3 text-sm outline-none shadow-sm
//                                   focus:ring-2 transition
//                                 "
//                                 style={{ "--tw-ring-color": THEME }}
//                               />

//                               <input
//                                 type="text"
//                                 placeholder="%"
//                                 value={priceRow.percent}
//                                 onChange={(e) =>
//                                   handlePriceChange(rowIndex, priceIndex, "percent", e.target.value)
//                                 }
//                                 className="
//                                   w-full rounded-2xl border border-slate-300 bg-white/90
//                                   px-4 py-3 text-sm outline-none shadow-sm
//                                   focus:ring-2 transition
//                                 "
//                                 style={{ "--tw-ring-color": THEME }}
//                               />

//                               <input
//                                 type="text"
//                                 readOnly
//                                 value={`₹${priceRow.itineraryPrice || "0.00"}`}
//                                 className="
//                                   w-full rounded-2xl border border-slate-200 bg-slate-100
//                                   px-4 py-3 text-sm outline-none shadow-sm cursor-not-allowed
//                                 "
//                               />

//                               <div className="flex justify-end">
//                                 {priceIndex === 0 ? (
//                                   <button
//                                     type="button"
//                                     onClick={() => addPriceRow(rowIndex)}
//                                     className={iconBtnPurple}
//                                     style={{ background: THEME }}
//                                     title="Add Price Row"
//                                   >
//                                     <Plus size={18} />
//                                   </button>
//                                 ) : (
//                                   <button
//                                     type="button"
//                                     onClick={() => removePriceRow(rowIndex, priceIndex)}
//                                     className={iconBtnRed}
//                                     title="Remove Price Row"
//                                   >
//                                     <X size={18} />
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}

//                 {/* Submit */}
//                 <button
//                   type="button"
//                   onClick={handleCreateFood}
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
//                   {editingTripFoodId ? "Update Food" : "Create Food"}
//                 </button>
//               </div>
//             </div>

//             {/* TABLE CARD */}
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">Trips With Food</div>
//                   <div className="mt-1 text-sm text-slate-500">Search and edit food assigned to trips</div>
//                 </div>

//                 <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
//                   <Search className="h-4 w-4 text-slate-500" />
//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => {
//                       setPageDir(1);
//                       setPage(1);
//                       setSearch(e.target.value);
//                     }}
//                     placeholder="Search by trip name..."
//                     className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
//                   />
//                 </div>
//               </div>

//               {/* ✅ Animated table wrapper (pagination feel) */}
//               <div className="relative overflow-hidden">
//                 <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                   <AnimatePresence mode="wait" custom={pageDir}>
//                     <motion.div
//                       key={`food-table-${page}-${search}`}
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
//                             <th className="px-5 py-3">Status</th>
//                             <th className="px-5 py-3 text-center">Action</th>
//                           </tr>
//                         </thead>

//                         <tbody>
//                           {tripsWithFood.length === 0 ? (
//                             <tr>
//                               <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
//                                 No trips with food found.
//                               </td>
//                             </tr>
//                           ) : (
//                             tripsWithFood.map((trip, index) => (
//                               <tr
//                                 key={trip._id}
//                                 className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
//                               >
//                                 <td className="px-5 py-3 font-semibold">
//                                   {(page - 1) * 3 + index + 1}
//                                 </td>
//                                 <td className="px-5 py-3 font-semibold">{trip.tripName || "—"}</td>
//                                 <td className="px-5 py-3 font-semibold">{trip.country || "—"}</td>
//                                 <td className="px-5 py-3 font-semibold">{trip.state || "—"}</td>
//                                 <td className="px-5 py-3 font-semibold">{trip.destination || "—"}</td>

//                                 <td className="px-5 py-3 font-semibold">
//                                   {trip.activeStatus ? (
//                                     <button
//                                       type="button"
//                                       onClick={() => handleStatusClick(trip)}
//                                       className={`
//                                         ${pillBtnBase}
//                                         inline-flex items-center gap-2
//                                         px-3 py-1.5 rounded-full
//                                         text-xs font-semibold border
//                                         bg-emerald-50 text-emerald-700 border-emerald-200
//                                         hover:bg-emerald-100
//                                       `}
//                                     >
//                                       <CheckCircle className="w-4 h-4" />
//                                       Active
//                                     </button>
//                                   ) : (
//                                     <button
//                                       type="button"
//                                       onClick={() => handleStatusClick(trip)}
//                                       className={`
//                                         ${pillBtnBase}
//                                         inline-flex items-center gap-2
//                                         px-3 py-1.5 rounded-full
//                                         text-xs font-semibold border
//                                         bg-red-50 text-red-700 border-red-200
//                                         hover:bg-red-100
//                                       `}
//                                     >
//                                       <XCircle className="w-4 h-4" />
//                                       Inactive
//                                     </button>
//                                   )}
//                                 </td>

//                                 <td className="px-5 py-3 text-center">
//                                   <button
//                                     type="button"
//                                     onClick={() => handleEdit(trip._id)}
//                                     className="
//                                       inline-flex items-center justify-center
//                                       h-9 w-9 rounded-2xl
//                                       border border-slate-200
//                                       bg-white/80 hover:bg-white
//                                       shadow-sm hover:shadow-md transition
//                                       text-slate-700
//                                     "
//                                     title="Edit food"
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
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Popup (premium UI, same logic) */}
//         {showPopup && selectedTripFood && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               onClick={() => {
//                 setShowPopup(false);
//                 setSelectedTripFood(null);
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
//                   {selectedTripFood.activeStatus ? "Deactivate" : "Activate"} Food
//                 </h2>

//                 <p className="mt-3 text-slate-600 text-sm leading-relaxed">
//                   Are you sure you want to{" "}
//                   <span className="font-bold">
//                     {selectedTripFood.activeStatus ? "deactivate" : "activate"}
//                   </span>{" "}
//                   the food in: <span className="font-semibold">{selectedTripFood.tripName}</span>?
//                 </p>

//                 <div className="mt-6 flex justify-end gap-2">
//                   <button
//                     className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
//                     onClick={() => {
//                       setShowPopup(false);
//                       setSelectedTripFood(null);
//                     }}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
//                     style={{ background: selectedTripFood.activeStatus ? "#ef4444" : "#22c55e" }}
//                     onClick={handleToggleStatus}
//                   >
//                     {selectedTripFood.activeStatus ? "Deactivate" : "Activate"}
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

// export default CreateFood;


import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Search,
  Sparkles,
  UtensilsCrossed,
  MapPin,
  ListChecks,
} from "lucide-react";
import { Pencil } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../api";

const CreateFood = () => {
  const THEME = "#8570EE";

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    trip: "",
  });

  const [rows, setRows] = useState([
    {
      vendor: "",
      advancePercentage: "", // ✅ NEW
      mealType: "",
      mealCategory: "",
      foodName: "",
      description: "",
      prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
      expanded: true,
    },
  ]);

  const [tripsWithFood, setTripsWithFood] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // ✅ pagination feel (same style as CreateTrip)
  const [pageDir, setPageDir] = useState(1);

  const [editingTripFoodId, setEditingTripFoodId] = useState(null);
  const [selectedTripFood, setSelectedTripFood] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const tableVariants = {
    enter: (d) => ({ x: d > 0 ? 38 : -38, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -38 : 38, opacity: 0, filter: "blur(6px)" }),
  };

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
        opacity: 1,
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
        cursor: "pointer",
      }),
      placeholder: (b) => ({ ...b, color: "#6b7280" }),
    }),
    [THEME]
  );

  // -------- options helpers --------
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
  const vendorOptions = vendors.map((v) => ({
    value: v._id,
    label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
  }));

  const mealTypeOptions = [
    { value: "Breakfast", label: "Breakfast" },
    { value: "Lunch", label: "Lunch" },
    { value: "Dinner", label: "Dinner" },
  ];

  const mealCategoryOptions = [
    { value: "budget", label: "Budget" },
    { value: "premium", label: "Premium" },
    { value: "luxury", label: "Luxury" },
    { value: "3star", label: "3 Star" },
    { value: "4star", label: "4 Star" },
    { value: "5star", label: "5 Star" },
  ];

  // -------- list fetchers --------
  const fetchTripsWithFood = async () => {
    try {
      const res = await API.get("/purchaser/food-trips", {
        params: { search, page, limit: 3 },
      });
      setTripsWithFood(res.data.trips);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch trips with food");
    }
  };

  useEffect(() => {
    fetchTripsWithFood();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

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
    const run = async () => {
      if (!formData.country) {
        setStates([]);
        return;
      }
      try {
        const res = await API.get(`/purchaser/states/${formData.country}`);
        setStates(res.data);
      } catch (err) {
        toast.error(`Error fetching states: ${err.message}`);
      }
    };
    run();
  }, [formData.country]);

  const fetchDestinations = async (countryId, stateId, currentDestinationId) => {
    try {
      if (!countryId || !stateId) {
        setDestinations([]);
        return;
      }

      let url = `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`;
      if (currentDestinationId) {
        url += `?currentDestinationId=${encodeURIComponent(currentDestinationId)}`;
      }

      const res = await API.get(url);
      setDestinations(res.data);
    } catch (err) {
      toast.error(`Error fetching destinations: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!formData.country || !formData.state) {
      setDestinations([]);
      return;
    }
    if (editingTripFoodId) return;
    fetchDestinations(formData.country, formData.state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.country, formData.state, editingTripFoodId]);

  const fetchData = async (countryId, stateId, destinationId, currentVendorId, currentTripId) => {
    try {
      if (!countryId || !stateId || !destinationId) {
        setVendors([]);
        setTrips([]);
        return;
      }

      let vendorsUrl = `/purchaser/vendorsOfFoods/${countryId}/${stateId}/${destinationId}`;
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
    } catch (err) {
      toast.error(`Error fetching vendors/trips: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!formData.country || !formData.state || !formData.destination) {
      setVendors([]);
      setTrips([]);
      return;
    }
    if (editingTripFoodId) return;
    fetchData(formData.country, formData.state, formData.destination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.country, formData.state, formData.destination, editingTripFoodId]);

  // -------- row handlers --------
  const handleChange = (rowIndex, field, value) => {
    const updated = [...rows];
    updated[rowIndex][field] = value;
    setRows(updated);
  };

  const handlePriceChange = (rowIndex, priceIndex, field, value) => {
    const updated = [...rows];
    const priceObj = updated[rowIndex].prices[priceIndex];
    priceObj[field] = value;

    const price = parseFloat(priceObj.price) || 0;
    const percent = parseFloat(priceObj.percent) || 0;
    const itineraryPrice = price + (price * percent) / 100;
    priceObj.itineraryPrice = itineraryPrice.toFixed(2);

    setRows(updated);
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        vendor: "",
        advancePercentage: "", // ✅ NEW
        mealType: "",
        mealCategory: "",
        foodName: "",
        description: "",
        prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
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
    updated[rowIndex].prices.push({
      validFrom: "",
      validTo: "",
      price: "",
      percent: "",
      itineraryPrice: "",
    });
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

  // -------- validation --------
  const validateForm = () => {
    const requiredFields = {
      country: "Country",
      state: "State",
      destination: "Destination",
      trip: "Trip",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key]) {
        toast.error(`${label} is required.`);
        return false;
      }
    }

    if (!rows.length) {
      toast.error("At least one food item is required.");
      return false;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowPrefix = `Row ${i + 1}`;

      const requiredRowFields = {
        vendor: "Vendor",
        advancePercentage: "Advance Percentage", // ✅ NEW (mandatory)
        mealType: "Meal Type",
        mealCategory: "Meal Category",
        foodName: "Food Name",
        description: "Description",
      };

      for (const [key, label] of Object.entries(requiredRowFields)) {
        if (row[key] === "" || row[key] === null || typeof row[key] === "undefined") {
          toast.error(`${rowPrefix}: ${label} is required.`);
          return false;
        }
      }

      // ✅ Advance percentage validation (0-100)
      const adv = Number(row.advancePercentage);
      if (Number.isNaN(adv)) {
        toast.error(`${rowPrefix}: Advance Percentage must be a valid number.`);
        return false;
      }
      if (adv < 0) {
        toast.error(`${rowPrefix}: Advance Percentage cannot be negative.`);
        return false;
      }
      if (adv > 100) {
        toast.error(`${rowPrefix}: Advance Percentage cannot be more than 100.`);
        return false;
      }

      if (!row.prices?.length) {
        toast.error(`${rowPrefix}: At least one price entry is required.`);
        return false;
      }

      const dateRanges = [];
      for (let j = 0; j < row.prices.length; j++) {
        const price = row.prices[j];
        const pricePrefix = `${rowPrefix}, Price ${j + 1}`;

        if (!price.validFrom || !price.validTo) {
          toast.error(`${pricePrefix}: Valid From and To dates are required.`);
          return false;
        }

        const from = new Date(price.validFrom);
        const to = new Date(price.validTo);
        if (from >= to) {
          toast.error(`${pricePrefix}: Valid From must be earlier than Valid To.`);
          return false;
        }

        for (let k = 0; k < dateRanges.length; k++) {
          const { start, end } = dateRanges[k];
          if (!(to < start || from > end)) {
            toast.error(`${rowPrefix}: Price ${j + 1} conflicts with Price ${k + 1}.`);
            return false;
          }
        }
        dateRanges.push({ start: from, end: to });

        const numericPrice = parseFloat(price.price);
        const numericPercent = parseFloat(price.percent);
        if (isNaN(numericPrice) || numericPrice <= 0) {
          toast.error(`${pricePrefix}: Price must be greater than 0.`);
          return false;
        }
        if (isNaN(numericPercent) || numericPercent <= 0) {
          toast.error(`${pricePrefix}: Percent must be greater than 0.`);
          return false;
        }
      }
    }

    return true;
  };

  // -------- editing / submit --------
  const handleEdit = async (foodId) => {
    try {
      const res = await API.get(`/purchaser/food/${foodId}`);
      const food = res.data;

      setEditingTripFoodId(foodId);

      const countryId = food.country?._id;
      const stateId = food.state?._id;
      const destinationId = food.destination?._id;
      const tripId = food.trip?._id;

      setFormData({
        country: countryId || "",
        state: stateId || "",
        destination: destinationId || "",
        trip: tripId || "",
      });

      const uniqueVendorIds = Array.from(new Set((food.rows || []).map((row) => row.vendor?._id).filter(Boolean)));
      const vendorIdCsv = uniqueVendorIds.join(",");

      await fetchDestinations(countryId, stateId, destinationId);
      await fetchData(countryId, stateId, destinationId, vendorIdCsv, tripId);

      const formattedRows = (food.rows || []).map((row) => ({
        vendor: row.vendor?._id || "",
        advancePercentage:
          row.advancePercentage === 0 || row.advancePercentage ? String(row.advancePercentage) : "", // ✅ NEW
        mealType: row.mealType || "",
        mealCategory: row.mealCategory || "",
        foodName: row.foodName || "",
        description: row.description || "",
        prices: (row.prices || []).map((p) => ({
          validFrom: p.validFrom ? p.validFrom.slice(0, 10) : "",
          validTo: p.validTo ? p.validTo.slice(0, 10) : "",
          price: p.price || "",
          percent: p.percent || "",
          itineraryPrice: p.itineraryPrice || "",
        })),
        expanded: true,
      }));

      setRows(formattedRows);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error("Failed to load food for editing.");
    }
  };

  const handleCreateFood = async () => {
    try {
      if (!validateForm()) return;

      const payload = { ...formData, rows };

      if (editingTripFoodId) {
        const res = await API.put(`/purchaser/food/${editingTripFoodId}`, payload);
        if (res.data.success) toast.success("Food updated successfully!");
        else {
          toast.error(res?.data?.message || "Failed to update food.");
          return;
        }
      } else {
        const res = await API.post("/purchaser/createFood", payload);
        if (res.data.success) toast.success("Food created successfully!");
        else {
          toast.error(res?.data?.message || "Failed to create food.");
          return;
        }
      }

      clearAllPrefill();
      fetchTripsWithFood();
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred while submitting food.");
    }
  };

  const handleStatusClick = (tripfood) => {
    setSelectedTripFood(tripfood);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedTripFood) return;
    try {
      const updatedStatus = !selectedTripFood.activeStatus;
      const res = await API.patch(`/purchaser/updateTripFoodStatus/${selectedTripFood._id}/status`, {
        activeStatus: updatedStatus,
      });
      if (res.data.success) {
        toast.success(`Food in the trip ${updatedStatus ? "activated" : "deactivated"} successfully`);
        await fetchTripsWithFood();
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedTripFood(null);
    }
  };

  const clearAllPrefill = () => {
    setEditingTripFoodId(null);
    setFormData({ country: "", state: "", destination: "", trip: "" });
    setRows([
      {
        vendor: "",
        advancePercentage: "", // ✅ NEW
        mealType: "",
        mealCategory: "",
        foodName: "",
        description: "",
        prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
        expanded: true,
      },
    ]);
    setStates([]);
    setDestinations([]);
    setTrips([]);
    setVendors([]);
  };

  const pillBtnBase =
    "inline-flex items-center justify-center rounded-2xl transition shadow-sm hover:shadow-md";
  const iconBtnPurple =
    "inline-flex items-center justify-center w-11 h-11 rounded-2xl text-white font-bold " +
    "shadow-[0_12px_28px_rgba(133,112,238,0.35)] hover:opacity-95 active:scale-[0.99] transition";
  const iconBtnRed =
    "inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 shadow-sm transition";

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
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">Create Trip Food</div>
              <div className="mt-1 text-sm text-slate-500">
                Assign foods to trips with date-wise pricing and status management.
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingTripFoodId && (
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
                <UtensilsCrossed size={20} />
              </div>
            </div>
          </div>

          {/* Layout: Form card on top, Table below */}
          <div className="space-y-6">
            {/* FORM CARD */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    {editingTripFoodId ? "Edit trip food" : "Assign food to trip"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Select location + trip, then add at least one food item with non-overlapping date ranges.
                  </div>
                </div>

                {editingTripFoodId && (
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
                {/* Filters */}
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
                      value={countryOptions.find((o) => o.value === formData.country) || null}
                      onChange={(opt) => {
                        const value = opt?.value || "";
                        setFormData((prev) => ({
                          ...prev,
                          country: value,
                          state: "",
                          destination: "",
                          trip: "",
                        }));
                        setRows([
                          {
                            vendor: "",
                            advancePercentage: "",
                            mealType: "",
                            mealCategory: "",
                            foodName: "",
                            description: "",
                            prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
                            expanded: true,
                          },
                        ]);
                      }}
                      isDisabled={!!editingTripFoodId}
                      isClearable={false}
                      classNamePrefix="food-country"
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
                        }));
                        setRows([
                          {
                            vendor: "",
                            advancePercentage: "",
                            mealType: "",
                            mealCategory: "",
                            foodName: "",
                            description: "",
                            prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
                            expanded: true,
                          },
                        ]);
                      }}
                      isDisabled={!!editingTripFoodId || !formData.country}
                      isClearable={false}
                      classNamePrefix="food-state"
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
                        setFormData((prev) => ({ ...prev, destination: value, trip: "" }));
                        setRows([
                          {
                            vendor: "",
                            advancePercentage: "",
                            mealType: "",
                            mealCategory: "",
                            foodName: "",
                            description: "",
                            prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
                            expanded: true,
                          },
                        ]);
                      }}
                      isDisabled={!!editingTripFoodId || !formData.state}
                      isClearable={false}
                      classNamePrefix="food-destination"
                      menuPortalTarget={document.body}
                    />
                    {!formData.state && (
                      <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
                    )}
                  </div>

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
                      onChange={(opt) => {
                        const tripId = opt?.value || "";
                        setFormData((prev) => ({ ...prev, trip: tripId }));
                        setRows([
                          {
                            vendor: "",
                            advancePercentage: "",
                            mealType: "",
                            mealCategory: "",
                            foodName: "",
                            description: "",
                            prices: [{ validFrom: "", validTo: "", price: "", percent: "", itineraryPrice: "" }],
                            expanded: true,
                          },
                        ]);
                      }}
                      isDisabled={!!editingTripFoodId || !formData.destination}
                      isClearable={false}
                      classNamePrefix="food-trip"
                      menuPortalTarget={document.body}
                    />
                    {!formData.destination && (
                      <div className="mt-1 text-xs text-slate-400">Select destination first to enable trips.</div>
                    )}
                  </div>
                </div>

                {/* Food Rows header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Food rows</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Add vendor + advance percentage + meal details + food, then set valid date ranges and pricing.
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
                    Add food row
                  </button>
                </div>

                {/* Food Rows */}
                {rows.map((row, rowIndex) => (
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
                      {/* ✅ updated grid: vendor + advance% + mealType + mealCategory */}
                      <div className="grid grid-cols-1 lg:grid-cols-[44px_1fr_210px_1fr_1fr_auto] gap-3 items-center">
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
                          onChange={(opt) => handleChange(rowIndex, "vendor", opt?.value || "")}
                          isDisabled={!formData.destination}
                          isClearable
                          classNamePrefix="food-vendor"
                          menuPortalTarget={document.body}
                        />

                        {/* ✅ NEW: Advance Percentage (between vendor and meal type) */}
                        <input
                          type="number"
                          placeholder="Advance %"
                          value={row.advancePercentage}
                          onChange={(e) => handleChange(rowIndex, "advancePercentage", e.target.value)}
                          className="
                            w-full rounded-2xl border border-slate-300 bg-white/90
                            px-4 py-3 text-sm outline-none shadow-sm
                            focus:ring-2 transition
                          "
                          style={{ "--tw-ring-color": THEME }}
                          min={0}
                          max={100}
                          disabled={!row.vendor} // ✅ only after vendor picked
                        />

                        <Select
                          styles={selectStyles}
                          options={mealTypeOptions}
                          placeholder="Select Meal Type"
                          value={mealTypeOptions.find((o) => o.value === row.mealType) || null}
                          onChange={(opt) => handleChange(rowIndex, "mealType", opt?.value || "")}
                          isClearable
                          classNamePrefix="food-mealtype"
                          menuPortalTarget={document.body}
                        />

                        <Select
                          styles={selectStyles}
                          options={mealCategoryOptions}
                          placeholder="Select Meal Category"
                          value={mealCategoryOptions.find((o) => o.value === row.mealCategory) || null}
                          onChange={(opt) => handleChange(rowIndex, "mealCategory", opt?.value || "")}
                          isClearable
                          classNamePrefix="food-mealcat"
                          menuPortalTarget={document.body}
                        />

                        <div className="flex justify-end">
                          {rowIndex === 0 ? (
                            <button
                              type="button"
                              onClick={addRow}
                              className={iconBtnPurple}
                              style={{ background: THEME }}
                              title="Add Row"
                            >
                              <Plus size={18} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => removeRow(rowIndex)}
                              className={iconBtnRed}
                              title="Remove Row"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Food text inputs */}
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                            Food name
                          </div>
                          <textarea
                            rows={3}
                            placeholder="Food Name"
                            value={row.foodName}
                            onChange={(e) => handleChange(rowIndex, "foodName", e.target.value)}
                            className="
                              w-full resize-none
                              rounded-2xl border border-slate-300 bg-white/90
                              px-4 py-3 text-sm outline-none shadow-sm
                              focus:ring-2 transition
                            "
                            style={{ "--tw-ring-color": THEME }}
                          />
                        </div>

                        <div>
                          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                            Description
                          </div>
                          <textarea
                            rows={3}
                            placeholder="Description"
                            value={row.description}
                            onChange={(e) => handleChange(rowIndex, "description", e.target.value)}
                            className="
                              w-full resize-none
                              rounded-2xl border border-slate-300 bg-white/90
                              px-4 py-3 text-sm outline-none shadow-sm
                              focus:ring-2 transition
                            "
                            style={{ "--tw-ring-color": THEME }}
                          />
                        </div>
                      </div>

                      {/* Price rows */}
                      {row.expanded && (
                        <div className="mt-4 space-y-3">
                          {row.prices.map((priceRow, priceIndex) => (
                            <div
                              key={priceIndex}
                              className="
                                grid gap-3 items-center
                                grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_210px_auto]
                              "
                            >
                              <input
                                type="date"
                                value={priceRow.validFrom}
                                onChange={(e) => handlePriceChange(rowIndex, priceIndex, "validFrom", e.target.value)}
                                className="
                                  w-full rounded-2xl border border-slate-300 bg-white/90
                                  px-4 py-3 text-sm outline-none shadow-sm
                                  focus:ring-2 transition
                                "
                                style={{ "--tw-ring-color": THEME }}
                              />

                              <input
                                type="date"
                                value={priceRow.validTo}
                                onChange={(e) => handlePriceChange(rowIndex, priceIndex, "validTo", e.target.value)}
                                className="
                                  w-full rounded-2xl border border-slate-300 bg-white/90
                                  px-4 py-3 text-sm outline-none shadow-sm
                                  focus:ring-2 transition
                                "
                                style={{ "--tw-ring-color": THEME }}
                              />

                              <input
                                type="text"
                                placeholder="Price"
                                value={priceRow.price}
                                onChange={(e) => handlePriceChange(rowIndex, priceIndex, "price", e.target.value)}
                                className="
                                  w-full rounded-2xl border border-slate-300 bg-white/90
                                  px-4 py-3 text-sm outline-none shadow-sm
                                  focus:ring-2 transition
                                "
                                style={{ "--tw-ring-color": THEME }}
                              />

                              <input
                                type="text"
                                placeholder="%"
                                value={priceRow.percent}
                                onChange={(e) => handlePriceChange(rowIndex, priceIndex, "percent", e.target.value)}
                                className="
                                  w-full rounded-2xl border border-slate-300 bg-white/90
                                  px-4 py-3 text-sm outline-none shadow-sm
                                  focus:ring-2 transition
                                "
                                style={{ "--tw-ring-color": THEME }}
                              />

                              <input
                                type="text"
                                readOnly
                                value={`₹${priceRow.itineraryPrice || "0.00"}`}
                                className="
                                  w-full rounded-2xl border border-slate-200 bg-slate-100
                                  px-4 py-3 text-sm outline-none shadow-sm cursor-not-allowed
                                "
                              />

                              <div className="flex justify-end">
                                {priceIndex === 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => addPriceRow(rowIndex)}
                                    className={iconBtnPurple}
                                    style={{ background: THEME }}
                                    title="Add Price Row"
                                  >
                                    <Plus size={18} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => removePriceRow(rowIndex, priceIndex)}
                                    className={iconBtnRed}
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
                ))}

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleCreateFood}
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
                  {editingTripFoodId ? "Update Food" : "Create Food"}
                </button>
              </div>
            </div>

            {/* TABLE CARD */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">Trips With Food</div>
                  <div className="mt-1 text-sm text-slate-500">Search and edit food assigned to trips</div>
                </div>

                <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setPageDir(1);
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                    placeholder="Search by trip name..."
                    className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                  />
                </div>
              </div>

              {/* ✅ Animated table wrapper (pagination feel) */}
              <div className="relative overflow-hidden">
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <AnimatePresence mode="wait" custom={pageDir}>
                    <motion.div
                      key={`food-table-${page}-${search}`}
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
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {tripsWithFood.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                                No trips with food found.
                              </td>
                            </tr>
                          ) : (
                            tripsWithFood.map((trip, index) => (
                              <tr
                                key={trip._id}
                                className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                              >
                                <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
                                <td className="px-5 py-3 font-semibold">{trip.tripName || "—"}</td>
                                <td className="px-5 py-3 font-semibold">{trip.country || "—"}</td>
                                <td className="px-5 py-3 font-semibold">{trip.state || "—"}</td>
                                <td className="px-5 py-3 font-semibold">{trip.destination || "—"}</td>

                                <td className="px-5 py-3 font-semibold">
                                  {trip.activeStatus ? (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusClick(trip)}
                                      className={`
                                        ${pillBtnBase}
                                        inline-flex items-center gap-2
                                        px-3 py-1.5 rounded-full
                                        text-xs font-semibold border
                                        bg-emerald-50 text-emerald-700 border-emerald-200
                                        hover:bg-emerald-100
                                      `}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Active
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusClick(trip)}
                                      className={`
                                        ${pillBtnBase}
                                        inline-flex items-center gap-2
                                        px-3 py-1.5 rounded-full
                                        text-xs font-semibold border
                                        bg-red-50 text-red-700 border-red-200
                                        hover:bg-red-100
                                      `}
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Inactive
                                    </button>
                                  )}
                                </td>

                                <td className="px-5 py-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(trip._id)}
                                    className="
                                      inline-flex items-center justify-center
                                      h-9 w-9 rounded-2xl
                                      border border-slate-200
                                      bg-white/80 hover:bg-white
                                      shadow-sm hover:shadow-md transition
                                      text-slate-700
                                    "
                                    title="Edit food"
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
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popup (premium UI, same logic) */}
        {showPopup && selectedTripFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                setSelectedTripFood(null);
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
                  {selectedTripFood.activeStatus ? "Deactivate" : "Activate"} Food
                </h2>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold">
                    {selectedTripFood.activeStatus ? "deactivate" : "activate"}
                  </span>{" "}
                  the food in: <span className="font-semibold">{selectedTripFood.tripName}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                    onClick={() => {
                      setShowPopup(false);
                      setSelectedTripFood(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
                    style={{ background: selectedTripFood.activeStatus ? "#ef4444" : "#22c55e" }}
                    onClick={handleToggleStatus}
                  >
                    {selectedTripFood.activeStatus ? "Deactivate" : "Activate"}
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

export default CreateFood;
