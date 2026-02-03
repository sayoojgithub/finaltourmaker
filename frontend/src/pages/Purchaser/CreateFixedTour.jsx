
// import React, { useEffect, useMemo, useState } from "react";
// import API from "../../api";
// import Select from "react-select";
// import { Plus, X, Eye, Sparkles, MapPin, ListChecks, Users, BadgePercent, CalendarClock } from "lucide-react";
// import { toast } from "react-toastify";

// const PURPLE = "#8570EE";

// // ------------------- OPTIONS -------------------
// const tripVehicleOptions = [
//   { value: "Premium", label: "Premium" },
//   { value: "Luxury", label: "Luxury" },
//   { value: "Executive", label: "Executive" },
//   { value: "Luxury Plus", label: "Luxury Plus" },
//   { value: "Ultra Luxury", label: "Ultra Luxury" },
// ];

// const addonTripVehicleOptions = [
//   { value: "Premium", label: "Premium" },
//   { value: "Luxury", label: "Luxury" },
//   { value: "Executive", label: "Executive" },
//   { value: "Luxury Plus", label: "Luxury Plus" },
//   { value: "Ultra Luxury", label: "Ultra Luxury" },
// ];

// const hotelOptions = [
//   { value: "Standard", label: "Standard" },
//   { value: "Deluxe", label: "Deluxe" },
// ];

// const roomOptions = [
//   { value: "Standard", label: "Standard" },
//   { value: "Deluxe", label: "Deluxe" },
// ];

// const mealCategoryOptions = [
//   { value: "budget", label: "Budget" },
//   { value: "premium", label: "Premium" },
//   { value: "luxury", label: "Luxury" },
//   { value: "3star", label: "3 Star" },
//   { value: "4star", label: "4 Star" },
//   { value: "5star", label: "5 Star" },
// ];

// const mealTypeOptions = [
//   { value: "Breakfast", label: "Breakfast" },
//   { value: "Lunch", label: "Lunch" },
//   { value: "Dinner", label: "Dinner" },
// ];

// // ✅ Premium react-select styles (standard)
// const useSelectStyles = () =>
//   useMemo(
//     () => ({
//       container: (b) => ({ ...b, width: "100%" }),
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 14,
//         borderColor: state.isFocused ? PURPLE : "#e5e7eb",
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         maxHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? PURPLE : "#d1d5db" },
//         overflow: "hidden",
//         opacity: 1,
//         cursor: state.isDisabled ? "not-allowed" : "default",
//       }),
//       valueContainer: (b) => ({
//         ...b,
//         padding: "0 12px",
//         overflowX: "auto",
//         overflowY: "hidden",
//         whiteSpace: "nowrap",
//         display: "flex",
//         alignItems: "center",
//         gap: 6,
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
//       input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
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
//     []
//   );

// // ---------- builders ----------
// const emptyMeal = () => ({
//   mealCategory: "",
//   mealType: "",
//   mealName: "",
// });

// const emptySegment = () => ({
//   country: "",
//   state: "",
//   destination: "",
//   trip: "",
//   selectedAddon: "",
//   selectedActivities: [],

//   tripVehicleCategory: "",
//   addonTripVehicleCategory: "",
//   hotelCategory: "",
//   roomCategory: "",
//   meals: [emptyMeal()],

//   states: [],
//   destinations: [],
//   trips: [],
//   addonTrips: [],
//   activities: [],
// });

// const emptyDay = () => ({
//   expanded: false,
//   segments: [emptySegment()],
// });

// const CreateFixedTour = () => {
//   const selectStyles = useSelectStyles();

//   // Top-level dropdown data
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);

//   // Vendors for fixed tour
//   const [vendors, setVendors] = useState([]);

//   // Top-level form
//   const [formData, setFormData] = useState({
//     country: "",
//     state: "",
//     destination: "",
//     tourName: "",
//     articleNumber: "",
//     category: "",
//     pickupPoint: "",
//     dropOffPoint: "",
//     totalDays: "",
//     totalNights: "",
//     validFrom: "",
//     validTill: "",
//     paxPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),

//     vendorId: "",
//     vendorName: "",
//     commissionPercentage: "",
//     itineraryPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),
//   });

//   // Tags
//   const [includes, setIncludes] = useState([]);
//   const [excludes, setExcludes] = useState([]);

//   // Days
//   const [days, setDays] = useState([]);

//   // List view
//   const [fixedTours, setFixedTours] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // view-only modal
//   const [viewTour, setViewTour] = useState(null);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [viewLoading, setViewLoading] = useState(false);

//   // ---------- options helpers ----------
//   const toOptions = (arr = [], labelKey = "name") => arr.map((i) => ({ value: i._id, label: i[labelKey] }));

//   const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
//   const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
//   const destinationOptions = destinations.map((d) => ({ value: d._id, label: d.name }));

//   const vendorOptions = vendors.map((v) => ({
//     value: v._id,
//     label: `${v.name}`,
//     vendorName: v.name,
//     vendorCode: v.vendorCode,
//   }));

//   // ---------- fetch list ----------
//   const fetchFixedTours = async () => {
//     try {
//       const res = await API.get("/purchaser/fixedTours", { params: { page, limit: 3, search } });
//       setFixedTours(res.data.tours || []);
//       setTotalPages(res.data.totalPages || 1);
//     } catch (err) {
//       console.error("Error fetching fixed tours:", err);
//       toast.error("Failed to fetch fixed tours.");
//     }
//   };
//   useEffect(() => {
//     fetchFixedTours();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [search, page]);

//   // ---------- view modal loader ----------
//   const openViewModal = async (tourId) => {
//     try {
//       setViewLoading(true);
//       setViewModalOpen(true);
//       setViewTour(null);

//       const res = await API.get(`/purchaser/fixedTours/${tourId}`);
//       setViewTour(res.data?.tour || res.data || null);
//     } catch (err) {
//       console.error("Failed to load fixed tour details", err);
//       toast.error("Failed to load fixed tour details.");
//       setViewModalOpen(false);
//     } finally {
//       setViewLoading(false);
//     }
//   };

//   // ---------- bootstrap countries ----------
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await API.get("/purchaser/countries");
//         setCountries(res.data || []);
//       } catch {
//         toast.error("Error fetching countries");
//       }
//     })();
//   }, []);

//   // ---------- dependent: states ----------
//   useEffect(() => {
//     if (!formData.country) return;
//     setStates([]);
//     setDestinations([]);
//     setVendors([]);
//     setFormData((p) => ({
//       ...p,
//       state: "",
//       destination: "",
//       vendorId: "",
//       vendorName: "",
//     }));

//     (async () => {
//       try {
//         const res = await API.get(`/purchaser/states/${formData.country}`);
//         setStates(res.data || []);
//       } catch {
//         toast.error("Error fetching states");
//       }
//     })();
//   }, [formData.country]);

//   // ---------- dependent: destinations ----------
//   useEffect(() => {
//     if (!formData.country || !formData.state) return;
//     setDestinations([]);
//     setVendors([]);
//     setFormData((p) => ({
//       ...p,
//       destination: "",
//       vendorId: "",
//       vendorName: "",
//     }));

//     (async () => {
//       try {
//         const res = await API.get(
//           `/purchaser/destinationsByCountryAndState/${formData.country}/${formData.state}`
//         );
//         setDestinations(res.data || []);
//       } catch {
//         toast.error("Error fetching destinations");
//       }
//     })();
//   }, [formData.state, formData.country]);

//   // fetch vendors by destination
//   const fetchVendorsForDestination = async (destinationId) => {
//     try {
//       if (!destinationId) {
//         setVendors([]);
//         setFormData((p) => ({ ...p, vendorId: "", vendorName: "" }));
//         return;
//       }
//       const res = await API.get(`/purchaser/vendorsByDestinationForFixedTour/${destinationId}`);
//       setVendors(res.data?.vendors || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch vendors for this destination");
//     }
//   };

//   useEffect(() => {
//     fetchVendorsForDestination(formData.destination);
//     setFormData((p) => ({ ...p, vendorId: "", vendorName: "" }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.destination]);

//   // ---------- keep days count in sync ----------
//   useEffect(() => {
//     const total = parseInt(formData.totalDays, 10);
//     if (!formData.totalDays || isNaN(total) || total <= 0) return;
//     setDays((prev) => {
//       const out = [...prev];
//       while (out.length < total) out.push(emptyDay());
//       if (out.length > total) out.splice(total);
//       return out;
//     });
//   }, [formData.totalDays]);

//   // auto calculate itineraryPrices = paxPrice + commission%
//   useEffect(() => {
//     const commission = Number(formData.commissionPercentage || 0);
//     const out = {};
//     for (let i = 1; i <= 18; i++) {
//       const base = Number(formData.paxPrices?.[i] || 0);
//       if (!base || base <= 0 || Number.isNaN(base) || commission < 0 || commission > 100) {
//         out[i] = "";
//       } else {
//         const net = base + (base * commission) / 100;
//         out[i] = Math.round(net);
//       }
//     }
//     setFormData((p) => ({ ...p, itineraryPrices: out }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.commissionPercentage, formData.paxPrices]);

//   // ---------- tag helpers ----------
//   const handleAddItem = (val, setList, list, inputId) => {
//     if (val && !list.includes(val)) {
//       setList([...list, val]);
//       const el = document.getElementById(inputId);
//       if (el) el.value = "";
//     }
//   };
//   const handleRemoveItem = (idx, setList, list) => {
//     const copy = [...list];
//     copy.splice(idx, 1);
//     setList(copy);
//   };

//   // ---------- day ops ----------
//   const toggleDayExpand = (i) => {
//     setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, expanded: !d.expanded } : d)));
//   };
//   const handleRemoveDay = (i) => {
//     setDays((prev) => {
//       const copy = [...prev];
//       copy.splice(i, 1);
//       return copy;
//     });
//     setFormData((p) => ({
//       ...p,
//       totalDays: String(Math.max(1, parseInt(p.totalDays || "1", 10) - 1)),
//     }));
//   };

//   // ---------- segment ops ----------
//   const addSegment = (dayIndex) => {
//     setDays((prev) => {
//       const copy = [...prev];
//       copy[dayIndex] = { ...copy[dayIndex], segments: [...copy[dayIndex].segments, emptySegment()] };
//       return copy;
//     });
//   };

//   const removeSegment = (dayIndex, segIndex) => {
//     setDays((prev) => {
//       const copy = [...prev];
//       const segs = [...copy[dayIndex].segments];
//       segs.splice(segIndex, 1);
//       if (segs.length === 0) segs.push(emptySegment());
//       copy[dayIndex] = { ...copy[dayIndex], segments: segs };
//       return copy;
//     });
//   };

//   // ---------- meals ops ----------
//   const addMeal = (dayIndex, segIndex) => {
//     setDays((prev) => {
//       const d = [...prev];
//       const seg = { ...d[dayIndex].segments[segIndex] };
//       const meals = Array.isArray(seg.meals) ? [...seg.meals] : [];
//       meals.push(emptyMeal());
//       seg.meals = meals;
//       d[dayIndex].segments[segIndex] = seg;
//       return d;
//     });
//   };

//   const removeMeal = (dayIndex, segIndex, mealIndex) => {
//     setDays((prev) => {
//       const d = [...prev];
//       const seg = { ...d[dayIndex].segments[segIndex] };
//       const meals = Array.isArray(seg.meals) ? [...seg.meals] : [];
//       meals.splice(mealIndex, 1);
//       if (meals.length === 0) meals.push(emptyMeal());
//       seg.meals = meals;
//       d[dayIndex].segments[segIndex] = seg;
//       return d;
//     });
//   };

//   const updateMealField = (dayIndex, segIndex, mealIndex, field, value) => {
//     setDays((prev) => {
//       const d = [...prev];
//       const seg = { ...d[dayIndex].segments[segIndex] };
//       const meals = Array.isArray(seg.meals) ? [...seg.meals] : [emptyMeal()];
//       const m = { ...(meals[mealIndex] || emptyMeal()) };
//       m[field] = value;
//       meals[mealIndex] = m;
//       seg.meals = meals;
//       d[dayIndex].segments[segIndex] = seg;
//       return d;
//     });
//   };

//   // ---------- update a segment field + dependent fetch ----------
//   const updateSegmentField = async (dayIndex, segIndex, field, value) => {
//     const currentSeg = days?.[dayIndex]?.segments?.[segIndex] || {};
//     const nextCountry = field === "country" ? value : currentSeg.country || "";
//     const nextState = field === "state" ? value : currentSeg.state || "";
//     const nextDestination = field === "destination" ? value : currentSeg.destination || "";
//     const nextTrip = field === "trip" ? value : currentSeg.trip || "";

//     setDays((prev) => {
//       const d = [...prev];
//       const seg = { ...d[dayIndex].segments[segIndex] };
//       seg[field] = value;

//       if (field === "country") {
//         seg.state = "";
//         seg.destination = "";
//         seg.trip = "";
//         seg.selectedAddon = "";
//         seg.selectedActivities = [];
//         seg.states = [];
//         seg.destinations = [];
//         seg.trips = [];
//         seg.addonTrips = [];
//         seg.activities = [];
//       }
//       if (field === "state") {
//         seg.destination = "";
//         seg.trip = "";
//         seg.selectedAddon = "";
//         seg.selectedActivities = [];
//         seg.destinations = [];
//         seg.trips = [];
//         seg.addonTrips = [];
//         seg.activities = [];
//       }
//       if (field === "destination") {
//         seg.trip = "";
//         seg.selectedAddon = "";
//         seg.selectedActivities = [];
//         seg.trips = [];
//         seg.addonTrips = [];
//         seg.activities = [];
//       }
//       if (field === "trip") {
//         seg.selectedAddon = "";
//         seg.selectedActivities = [];
//         seg.addonTrips = [];
//         seg.activities = [];

//         seg.tripVehicleCategory = "";
//         seg.addonTripVehicleCategory = "";
//         seg.hotelCategory = "";
//         seg.roomCategory = "";
//         seg.meals = [emptyMeal()];
//       }

//       const newSegments = [...d[dayIndex].segments];
//       newSegments[segIndex] = seg;
//       d[dayIndex] = { ...d[dayIndex], segments: newSegments };
//       return d;
//     });

//     try {
//       if (field === "country" && nextCountry) {
//         const res = await API.get(`/purchaser/states/${nextCountry}`);
//         setDays((prev) => {
//           const d = [...prev];
//           d[dayIndex].segments[segIndex].states = res.data || [];
//           return d;
//         });
//       }
//       if (field === "state" && nextCountry && nextState) {
//         const res = await API.get(
//           `/purchaser/destinationsByCountryAndState/${nextCountry}/${nextState}`
//         );
//         setDays((prev) => {
//           const d = [...prev];
//           d[dayIndex].segments[segIndex].destinations = res.data || [];
//           return d;
//         });
//       }
//       if (field === "destination" && nextCountry && nextState && nextDestination) {
//         const res = await API.get(
//           `/purchaser/tripsByLocation/${nextCountry}/${nextState}/${nextDestination}`
//         );
//         setDays((prev) => {
//           const d = [...prev];
//           d[dayIndex].segments[segIndex].trips = res.data || [];
//           return d;
//         });
//       }
//       if (field === "trip" && nextTrip) {
//         const res = await API.get(`/purchaser/tripDetails/${nextTrip}`);
//         setDays((prev) => {
//           const d = [...prev];
//           d[dayIndex].segments[segIndex].addonTrips = res.data.addonTrips || [];
//           d[dayIndex].segments[segIndex].activities = res.data.activities || [];
//           return d;
//         });
//       }
//     } catch (err) {
//       console.error("Dropdown fetch failed", err);
//       toast.error("Dropdown fetch failed");
//     }
//   };

//   const clearSegmentTarget = (dayIndex, segIndex, key) => {
//     setDays((prev) => {
//       const d = [...prev];
//       const seg = { ...d[dayIndex].segments[segIndex] };

//       if (key === "trip") {
//         seg.trip = "";
//         seg.selectedAddon = "";
//         seg.selectedActivities = [];
//         seg.addonTrips = [];
//         seg.activities = [];

//         seg.tripVehicleCategory = "";
//         seg.addonTripVehicleCategory = "";
//         seg.hotelCategory = "";
//         seg.roomCategory = "";
//         seg.meals = [emptyMeal()];
//       } else if (key === "selectedAddon") {
//         seg.selectedAddon = "";
//       } else if (key === "selectedActivities") {
//         seg.selectedActivities = [];
//       } else if (key === "tripVehicleCategory") {
//         seg.tripVehicleCategory = "";
//       } else if (key === "addonTripVehicleCategory") {
//         seg.addonTripVehicleCategory = "";
//       } else if (key === "hotelCategory") {
//         seg.hotelCategory = "";
//       } else if (key === "roomCategory") {
//         seg.roomCategory = "";
//       } else if (key === "meals") {
//         seg.meals = [emptyMeal()];
//       }

//       d[dayIndex].segments[segIndex] = seg;
//       return d;
//     });
//   };

//   // ---------- submit ----------
//   const handleCreateFixedTour = async () => {
//     try {
//       const required = {
//         country: "Country is required",
//         state: "State is required",
//         destination: "Destination is required",
//         tourName: "Tour Name is required",
//         category: "Category is required",
//         pickupPoint: "Pickup Point is required",
//         dropOffPoint: "Drop-off Point is required",
//         totalDays: "Total Days is required",
//         totalNights: "Total Nights is required",
//         validFrom: "Valid From is required",
//         validTill: "Valid Till is required",
//       };
//       for (const [k, msg] of Object.entries(required)) {
//         if (!String(formData[k] || "").trim()) {
//           toast.error(msg);
//           return;
//         }
//       }

//       if (!formData.vendorId) return toast.error("Vendor is required");
//       const commission = Number(formData.commissionPercentage || 0);
//       if (Number.isNaN(commission) || commission < 0 || commission > 100) {
//         return toast.error("Commission must be between 0 and 100");
//       }

//       const from = new Date(formData.validFrom);
//       const till = new Date(formData.validTill);
//       if (!(from < till)) {
//         toast.error("Valid From must be earlier than Valid Till.");
//         return;
//       }

//       if (!includes.length) return toast.error("At least one Include is required.");
//       if (!excludes.length) return toast.error("At least one Exclude is required.");

//       for (let i = 1; i <= 18; i++) {
//         const v = formData.paxPrices[i];
//         if (!v || Number(v) <= 0) {
//           toast.error(`PAX price for ${i} must be > 0`);
//           return;
//         }
//       }

//       if (!days.length) return toast.error("At least one day is required.");
//       if (days.length !== Number(formData.totalDays)) {
//         return toast.error(`You must provide exactly ${formData.totalDays} day(s) of details.`);
//       }
//       if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
//         return toast.error("Total Nights should be exactly one less than Total Days.");
//       }

//       for (let i = 0; i < days.length; i++) {
//         const segs = days[i].segments;
//         if (!Array.isArray(segs) || segs.length === 0) {
//           return toast.error(`Day ${i + 1}: add at least one segment`);
//         }
//         for (let j = 0; j < segs.length; j++) {
//           const s = segs[j];
//           if (!s.country || !s.state || !s.destination || !s.trip) {
//             return toast.error(
//               `Day ${i + 1}, Segment ${j + 1}: Country, State, Destination and Trip are required`
//             );
//           }

//           const meals = Array.isArray(s.meals) ? s.meals : [];
//           for (let k = 0; k < meals.length; k++) {
//             const m = meals[k];
//             const touched = Boolean(m?.mealCategory || m?.mealType || String(m?.mealName || "").trim());
//             if (touched) {
//               if (!m.mealCategory || !m.mealType || !String(m.mealName || "").trim()) {
//                 return toast.error(
//                   `Day ${i + 1}, Segment ${j + 1}, Meal ${k + 1}: Meal Category, Meal Type and Meal Name are required`
//                 );
//               }
//             }
//           }
//         }
//       }

//       const payload = {
//         ...formData,
//         includes,
//         excludes,

//         vendorId: formData.vendorId,
//         vendorName: formData.vendorName,
//         commissionPercentage: Number(formData.commissionPercentage || 0),

//         days: days.map((d) => ({
//           segments: d.segments.map((s) => ({
//             country: s.country || undefined,
//             state: s.state || undefined,
//             destination: s.destination || undefined,
//             trip: s.trip || undefined,
//             selectedAddon: s.selectedAddon || undefined,
//             selectedActivities: Array.isArray(s.selectedActivities) ? s.selectedActivities.filter(Boolean) : [],

//             tripVehicleCategory: s.tripVehicleCategory || undefined,
//             addonTripVehicleCategory: s.addonTripVehicleCategory || undefined,
//             hotelCategory: s.hotelCategory || undefined,
//             roomCategory: s.roomCategory || undefined,

//             meals: Array.isArray(s.meals)
//               ? s.meals
//                   .filter((m) => m && (m.mealCategory || m.mealType || String(m.mealName || "").trim()))
//                   .map((m) => ({
//                     mealCategory: m.mealCategory || undefined,
//                     mealType: m.mealType || undefined,
//                     mealName: String(m.mealName || "").trim() || undefined,
//                   }))
//               : [],
//           })),
//         })),
//       };

//       await API.post("/purchaser/createFixedTour", payload);
//       toast.success("Fixed tour created successfully!");

//       setFormData({
//         country: "",
//         state: "",
//         destination: "",
//         tourName: "",
//         articleNumber: "",
//         category: "",
//         pickupPoint: "",
//         dropOffPoint: "",
//         totalDays: "",
//         totalNights: "",
//         validFrom: "",
//         validTill: "",
//         paxPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),

//         vendorId: "",
//         vendorName: "",
//         commissionPercentage: "",
//         itineraryPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),
//       });

//       setIncludes([]);
//       setExcludes([]);
//       setDays([]);
//       setStates([]);
//       setDestinations([]);
//       setVendors([]);
//       await fetchFixedTours();
//     } catch (err) {
//       console.error("Error creating fixed tour:", err);
//       toast.error("Failed to save fixed tour.");
//     }
//   };

//   // ---------- helpers for view modal ----------
//   const nameOr = (v, key = "name") => {
//     if (!v) return "-";
//     if (typeof v === "object") return v?.[key] || v?.name || v?.tripName || v?.activityName || "-";
//     return v;
//   };

//   // ---------- premium ui helpers ----------
//   const pillBtnBase = "inline-flex items-center justify-center rounded-2xl transition shadow-sm hover:shadow-md";
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
//         <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${PURPLE}, #c7bef9)` }} />

//         <div className="p-6 md:p-8 space-y-7">
//           {/* Header */}
//           <div className="flex items-start justify-between gap-3 flex-wrap">
//             <div className="min-w-0">
//               <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
//                 <Sparkles size={14} style={{ color: PURPLE }} />
//                 Purchaser
//               </div>
//               <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">Create Fixed Tour</div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Create fixed tours with vendor-based commission pricing and day-wise segments.
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <div
//                 className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
//                 style={{ background: `${PURPLE}12`, color: PURPLE, borderColor: `${PURPLE}30` }}
//               >
//                 <Users size={20} />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-6">
//             {/* FORM CARD */}
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">Create fixed tour</div>
//                   <div className="mt-1 text-sm text-slate-500">
//                     Select location + tour meta, add vendor + commission, then build day segments & optional meals.
//                   </div>
//                 </div>

//                 <div
//                   className="h-11 w-11 rounded-2xl flex items-center justify-center border shadow-sm"
//                   style={{ background: `${PURPLE}10`, borderColor: `${PURPLE}25`, color: PURPLE }}
//                   title="Pricing & Segments"
//                 >
//                   <BadgePercent size={18} />
//                 </div>
//               </div>

//               <div className="p-5 space-y-6 bg-gradient-to-b from-white to-purple-50/40">
//                 {/* Top-level filters */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <MapPin size={12} style={{ color: PURPLE }} />
//                       Country
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={countryOptions}
//                       placeholder="Select Country"
//                       value={countryOptions.find((o) => o.value === formData.country) || null}
//                       onChange={(opt) => setFormData((p) => ({ ...p, country: opt?.value || "" }))}
//                       isClearable
//                       menuPortalTarget={document.body}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <MapPin size={12} style={{ color: PURPLE }} />
//                       State
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={stateOptions}
//                       placeholder="Select State"
//                       value={stateOptions.find((o) => o.value === formData.state) || null}
//                       onChange={(opt) => setFormData((p) => ({ ...p, state: opt?.value || "" }))}
//                       isClearable
//                       isDisabled={!formData.country}
//                       menuPortalTarget={document.body}
//                     />
//                     {!formData.country && (
//                       <div className="mt-1 text-xs text-slate-400">Select country first to enable states.</div>
//                     )}
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <MapPin size={12} style={{ color: PURPLE }} />
//                       Destination
//                     </div>
//                     <Select
//                       styles={selectStyles}
//                       options={destinationOptions}
//                       placeholder="Select Destination"
//                       value={destinationOptions.find((o) => o.value === formData.destination) || null}
//                       onChange={(opt) => setFormData((p) => ({ ...p, destination: opt?.value || "" }))}
//                       isClearable
//                       isDisabled={!formData.state}
//                       menuPortalTarget={document.body}
//                     />
//                     {!formData.state && (
//                       <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Tour meta */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <ListChecks size={12} style={{ color: PURPLE }} />
//                       Tour Name
//                     </div>
//                     <input
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       placeholder="Tour Name"
//                       value={formData.tourName}
//                       onChange={(e) => setFormData((p) => ({ ...p, tourName: e.target.value.toUpperCase() }))}
//                     />
//                   </div>

//                   <div>
//   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//     Article Number
//   </div>
//   <input
//     className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//     style={{ "--tw-ring-color": PURPLE }}
//     placeholder="Auto-generated after create"
//     value={formData.articleNumber}
//     readOnly
//   />
// </div>


//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Category</div>
//                     <Select
//                       styles={selectStyles}
//                       isClearable
//                       placeholder="Select Category"
//                       options={[
//                         { value: "Standard", label: "Standard" },
//                         { value: "Delux", label: "Delux" },
//                         { value: "Premium", label: "Premium" },
//                       ]}
//                       value={formData.category ? { value: formData.category, label: formData.category } : null}
//                       onChange={(opt) => setFormData((p) => ({ ...p, category: opt?.value || "" }))}
//                       menuPortalTarget={document.body}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Pickup Point</div>
//                     <input
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       placeholder="Enter Pickup Point"
//                       value={formData.pickupPoint}
//                       onChange={(e) => setFormData((p) => ({ ...p, pickupPoint: e.target.value }))}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Drop Off Point</div>
//                     <input
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       placeholder="Enter Drop Off Point"
//                       value={formData.dropOffPoint}
//                       onChange={(e) => setFormData((p) => ({ ...p, dropOffPoint: e.target.value }))}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <CalendarClock size={12} style={{ color: PURPLE }} />
//                       Total Days
//                     </div>
//                     <input
//                       type="number"
//                       min={1}
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       value={formData.totalDays}
//                       onChange={(e) => {
//                         const val = Math.max(1, parseInt(e.target.value || "1", 10));
//                         setFormData((p) => ({ ...p, totalDays: String(val) }));
//                       }}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
//                       <CalendarClock size={12} style={{ color: PURPLE }} />
//                       Total Nights
//                     </div>
//                     <input
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       placeholder="Enter Total Nights"
//                       value={formData.totalNights}
//                       onChange={(e) => setFormData((p) => ({ ...p, totalNights: e.target.value }))}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Valid From</div>
//                     <input
//                       type="date"
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       value={formData.validFrom}
//                       onChange={(e) => setFormData((p) => ({ ...p, validFrom: e.target.value }))}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Valid Till</div>
//                     <input
//                       type="date"
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       value={formData.validTill}
//                       onChange={(e) => setFormData((p) => ({ ...p, validTill: e.target.value }))}
//                     />
//                   </div>
//                 </div>

//                 {/* Includes / Excludes input */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-center gap-3">
//                     <input
//                       id="includeInput"
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       placeholder="Add to Includes"
//                     />
//                     <button type="button" className={iconBtnPurple} style={{ background: PURPLE }} onClick={() =>
//                       handleAddItem(
//                         document.getElementById("includeInput").value,
//                         setIncludes,
//                         includes,
//                         "includeInput"
//                       )
//                     }>
//                       <Plus size={18} />
//                     </button>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <input
//                       id="excludeInput"
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       placeholder="Add to Excludes"
//                     />
//                     <button type="button" className={iconBtnPurple} style={{ background: PURPLE }} onClick={() =>
//                       handleAddItem(
//                         document.getElementById("excludeInput").value,
//                         setExcludes,
//                         excludes,
//                         "excludeInput"
//                       )
//                     }>
//                       <Plus size={18} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Includes / Excludes display */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
//                     <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Includes</div>
//                     <div className="flex flex-wrap gap-3">
//                       {includes.map((tag, i) => (
//                         <span
//                           key={i}
//                           className="relative group bg-white/60 backdrop-blur-md text-slate-800
//                             px-4 py-2 rounded-2xl flex items-center gap-3
//                             border border-slate-200 shadow-sm
//                             hover:shadow-[0_10px_30px_rgba(133,112,238,0.18)]
//                             transition-all duration-300"
//                         >
//                           <span className="font-semibold text-sm">{tag}</span>
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveItem(i, setIncludes, includes)}
//                             className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center
//                               rounded-full text-white font-bold shadow-md transition"
//                             style={{ background: PURPLE }}
//                           >
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                       {includes.length === 0 && <p className="text-slate-400 italic text-sm">No includes added yet</p>}
//                     </div>
//                   </div>

//                   <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
//                     <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Excludes</div>
//                     <div className="flex flex-wrap gap-3">
//                       {excludes.map((tag, i) => (
//                         <span
//                           key={i}
//                           className="relative group bg-white/60 backdrop-blur-md text-slate-800
//                             px-4 py-2 rounded-2xl flex items-center gap-3
//                             border border-slate-200 shadow-sm
//                             hover:shadow-[0_10px_30px_rgba(133,112,238,0.18)]
//                             transition-all duration-300"
//                         >
//                           <span className="font-semibold text-sm">{tag}</span>
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveItem(i, setExcludes, excludes)}
//                             className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center
//                               rounded-full text-white font-bold shadow-md transition"
//                             style={{ background: PURPLE }}
//                           >
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                       {excludes.length === 0 && <p className="text-slate-400 italic text-sm">No excludes added yet</p>}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Vendor + Commission */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Vendor (Fixed Tour)</div>
//                     <Select
//                       styles={selectStyles}
//                       options={vendorOptions}
//                       isClearable
//                       isDisabled={!formData.destination}
//                       placeholder={!formData.destination ? "Select destination first" : "Select Vendor"}
//                       value={vendorOptions.find((o) => o.value === formData.vendorId) || null}
//                       onChange={(opt) =>
//                         setFormData((p) => ({
//                           ...p,
//                           vendorId: opt?.value || "",
//                           vendorName: opt?.vendorName || "",
//                         }))
//                       }
//                       menuPortalTarget={document.body}
//                     />
//                   </div>

//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                       Commission Percentage (%)
//                     </div>
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                       style={{ "--tw-ring-color": PURPLE }}
//                       placeholder="Enter commission %"
//                       value={formData.commissionPercentage}
//                       onChange={(e) => setFormData((p) => ({ ...p, commissionPercentage: e.target.value }))}
//                     />
//                     <div className="mt-1 text-xs text-slate-400">Itinerary pricing auto-calculates from PAX + commission.</div>
//                   </div>
//                 </div>

//                 {/* PAX Pricing */}
//                 <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
//                   <div className="flex items-center justify-between gap-2 flex-wrap">
//                     <div>
//                       <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Pricing</div>
//                       <div className="mt-1 text-lg font-extrabold text-slate-900">PAX Pricing</div>
//                       <div className="mt-1 text-sm text-slate-500">Enter base prices for 1–18 pax.</div>
//                     </div>
//                   </div>

//                   <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
//                     {Array.from({ length: 18 }, (_, idx) => {
//                       const pax = idx + 1;
//                       return (
//                         <div key={pax}>
//                           <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">{pax} PAX</div>
//                           <input
//                             type="number"
//                             min="0"
//                             placeholder={`Enter price for ${pax} PAX`}
//                             value={formData.paxPrices[pax]}
//                             onChange={(e) =>
//                               setFormData((p) => ({
//                                 ...p,
//                                 paxPrices: { ...p.paxPrices, [pax]: e.target.value },
//                               }))
//                             }
//                             className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                             style={{ "--tw-ring-color": PURPLE }}
//                           />
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 {/* Itinerary Pricing */}
//                 <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
//                   <div className="flex items-center justify-between gap-2 flex-wrap">
//                     <div>
//                       <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Pricing</div>
//                       <div className="mt-1 text-lg font-extrabold text-slate-900">
//                         Itinerary Pricing <span className="text-sm font-semibold text-slate-500">(after commission)</span>
//                       </div>
//                       {!formData.vendorId ? (
//                         <div className="mt-1 text-sm text-slate-400 italic">Select a vendor to finalize pricing.</div>
//                       ) : (
//                         <div className="mt-1 text-sm text-slate-500">Auto-calculated and read-only.</div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
//                     {Array.from({ length: 18 }, (_, idx) => {
//                       const n = idx + 1;
//                       return (
//                         <div key={n}>
//                           <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">{n} PAX</div>
//                           <input
//                             readOnly
//                             className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm outline-none shadow-sm cursor-not-allowed"
//                             value={formData.itineraryPrices?.[n] ?? ""}
//                             placeholder="-"
//                           />
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 {/* Days header */}
//                 <div className="flex items-center justify-between gap-2 flex-wrap">
//                   <div>
//                     <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Itinerary</div>
//                     <div className="mt-1 text-lg font-extrabold text-slate-900">Day-wise Segments</div>
//                     <div className="mt-1 text-sm text-slate-500">
//                       Expand a day to add segments, activities, vehicles, accommodation and optional meals.
//                     </div>
//                   </div>
//                 </div>

//                 {/* DAYS with multiple SEGMENTS */}
//                 {days.map((day, i) => (
//                   <div
//                     key={i}
//                     className="rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden"
//                   >
//                     <div className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50/60">
//                       <div className="flex items-center justify-between gap-3">
//                         <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDayExpand(i)}>
//                           <span className="text-lg font-extrabold text-slate-500">{day.expanded ? "▾" : "▸"}</span>
//                           <div className="text-lg font-extrabold text-slate-900">Day {i + 1}</div>
//                         </div>

//                         <button type="button" onClick={() => handleRemoveDay(i)} className={iconBtnRed} title="Remove day">
//                           <X size={18} />
//                         </button>
//                       </div>

//                       {day.expanded && (
//                         <div className="mt-4 space-y-4">
//                           {day.segments.map((seg, j) => {
//                             const countryOpts = countryOptions;
//                             const stateOpts = toOptions(seg.states);
//                             const destOpts = toOptions(seg.destinations);
//                             const tripOpts = toOptions(seg.trips, "tripName");
//                             const addonOpts = toOptions(seg.addonTrips, "tripName");
//                             const actOpts = toOptions(seg.activities, "tripName");

//                             return (
//                               <div key={j} className="rounded-[20px] border border-slate-200 bg-white shadow-sm p-4 space-y-4">
//                                 <div className="flex items-center justify-between">
//                                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
//                                     Segment {j + 1}
//                                   </div>
//                                   <div className="flex items-center gap-2">
//                                     {j === 0 ? (
//                                       <button
//                                         type="button"
//                                         onClick={() => addSegment(i)}
//                                         className={iconBtnPurple}
//                                         style={{ background: PURPLE }}
//                                         title="Add segment"
//                                       >
//                                         <Plus size={18} />
//                                       </button>
//                                     ) : (
//                                       <button
//                                         type="button"
//                                         onClick={() => removeSegment(i, j)}
//                                         className={iconBtnRed}
//                                         title="Remove segment"
//                                       >
//                                         <X size={18} />
//                                       </button>
//                                     )}
//                                   </div>
//                                 </div>

//                                 {/* Country / State / Destination */}
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                                   <div>
//                                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Country</div>
//                                     <Select
//                                       styles={selectStyles}
//                                       options={countryOpts}
//                                       isClearable
//                                       placeholder="Country"
//                                       value={countryOpts.find((o) => o.value === seg.country) || null}
//                                       onChange={(opt) => updateSegmentField(i, j, "country", opt?.value || "")}
//                                       menuPortalTarget={document.body}
//                                     />
//                                   </div>

//                                   <div>
//                                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">State</div>
//                                     <Select
//                                       styles={selectStyles}
//                                       options={stateOpts}
//                                       isClearable
//                                       isDisabled={!seg.country}
//                                       placeholder="State"
//                                       value={stateOpts.find((o) => o.value === seg.state) || null}
//                                       onChange={(opt) => updateSegmentField(i, j, "state", opt?.value || "")}
//                                       menuPortalTarget={document.body}
//                                     />
//                                   </div>

//                                   <div>
//                                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Destination</div>
//                                     <Select
//                                       styles={selectStyles}
//                                       options={destOpts}
//                                       isClearable
//                                       isDisabled={!seg.state}
//                                       placeholder="Destination"
//                                       value={destOpts.find((o) => o.value === seg.destination) || null}
//                                       onChange={(opt) => updateSegmentField(i, j, "destination", opt?.value || "")}
//                                       menuPortalTarget={document.body}
//                                     />
//                                   </div>
//                                 </div>

//                                 {/* Trip */}
//                                 <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                                   <div>
//                                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Trip</div>
//                                     <Select
//                                       styles={selectStyles}
//                                       options={tripOpts}
//                                       isClearable
//                                       isDisabled={!seg.destination}
//                                       placeholder="Trip"
//                                       value={tripOpts.find((o) => o.value === seg.trip) || null}
//                                       onChange={(opt) => updateSegmentField(i, j, "trip", opt?.value || "")}
//                                       menuPortalTarget={document.body}
//                                     />
//                                   </div>
//                                   <button
//                                     type="button"
//                                     onClick={() => clearSegmentTarget(i, j, "trip")}
//                                     className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
//                                   >
//                                     Clear
//                                   </button>
//                                 </div>

//                                 {/* Add-on */}
//                                 <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                                   <div>
//                                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Add-on Trip</div>
//                                     <Select
//                                       styles={selectStyles}
//                                       options={addonOpts}
//                                       isClearable
//                                       isDisabled={!seg.trip}
//                                       placeholder="Add-on Trip"
//                                       value={addonOpts.find((o) => o.value === seg.selectedAddon) || null}
//                                       onChange={(opt) => updateSegmentField(i, j, "selectedAddon", opt?.value || "")}
//                                       menuPortalTarget={document.body}
//                                     />
//                                   </div>
//                                   <button
//                                     type="button"
//                                     onClick={() => clearSegmentTarget(i, j, "selectedAddon")}
//                                     className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
//                                   >
//                                     Clear
//                                   </button>
//                                 </div>

//                                 {/* Activities */}
//                                 <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                                   <div>
//                                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Activities</div>
//                                     <Select
//                                       styles={selectStyles}
//                                       options={actOpts}
//                                       isClearable
//                                       isMulti
//                                       isDisabled={!seg.trip}
//                                       placeholder="Activities"
//                                       value={actOpts.filter((o) => (seg.selectedActivities || []).includes(o.value))}
//                                       onChange={(opts) =>
//                                         updateSegmentField(
//                                           i,
//                                           j,
//                                           "selectedActivities",
//                                           Array.isArray(opts) ? opts.map((o) => o.value) : []
//                                         )
//                                       }
//                                       menuPortalTarget={document.body}
//                                     />
//                                   </div>
//                                   <button
//                                     type="button"
//                                     onClick={() => clearSegmentTarget(i, j, "selectedActivities")}
//                                     className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
//                                   >
//                                     Clear
//                                   </button>
//                                 </div>

//                                 {/* Vehicle categories */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                   <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                                     <div>
//                                       <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Trip Vehicle Category</div>
//                                       <Select
//                                         styles={selectStyles}
//                                         options={tripVehicleOptions}
//                                         isClearable
//                                         isDisabled={!seg.trip}
//                                         placeholder="Trip Vehicle Category"
//                                         value={
//                                           seg.tripVehicleCategory
//                                             ? { value: seg.tripVehicleCategory, label: seg.tripVehicleCategory }
//                                             : null
//                                         }
//                                         onChange={(opt) => updateSegmentField(i, j, "tripVehicleCategory", opt?.value || "")}
//                                         menuPortalTarget={document.body}
//                                       />
//                                     </div>
//                                     <button
//                                       type="button"
//                                       onClick={() => clearSegmentTarget(i, j, "tripVehicleCategory")}
//                                       className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
//                                     >
//                                       Clear
//                                     </button>
//                                   </div>

//                                   <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                                     <div>
//                                       <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Addon Trip Vehicle Category</div>
//                                       <Select
//                                         styles={selectStyles}
//                                         options={addonTripVehicleOptions}
//                                         isClearable
//                                         isDisabled={!seg.trip}
//                                         placeholder="Addon Trip Vehicle Category"
//                                         value={
//                                           seg.addonTripVehicleCategory
//                                             ? { value: seg.addonTripVehicleCategory, label: seg.addonTripVehicleCategory }
//                                             : null
//                                         }
//                                         onChange={(opt) =>
//                                           updateSegmentField(i, j, "addonTripVehicleCategory", opt?.value || "")
//                                         }
//                                         menuPortalTarget={document.body}
//                                       />
//                                     </div>
//                                     <button
//                                       type="button"
//                                       onClick={() => clearSegmentTarget(i, j, "addonTripVehicleCategory")}
//                                       className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
//                                     >
//                                       Clear
//                                     </button>
//                                   </div>
//                                 </div>

//                                 {/* Hotel + Room */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                   <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                                     <div>
//                                       <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Hotel Category</div>
//                                       <Select
//                                         styles={selectStyles}
//                                         options={hotelOptions}
//                                         isClearable
//                                         isDisabled={!seg.trip}
//                                         placeholder="Hotel Category"
//                                         value={hotelOptions.find((o) => o.value === seg.hotelCategory) || null}
//                                         onChange={(opt) => updateSegmentField(i, j, "hotelCategory", opt?.value || "")}
//                                         menuPortalTarget={document.body}
//                                       />
//                                     </div>
//                                     <button
//                                       type="button"
//                                       onClick={() => clearSegmentTarget(i, j, "hotelCategory")}
//                                       className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
//                                     >
//                                       Clear
//                                     </button>
//                                   </div>

//                                   <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                                     <div>
//                                       <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Room Category</div>
//                                       <Select
//                                         styles={selectStyles}
//                                         options={roomOptions}
//                                         isClearable
//                                         isDisabled={!seg.trip}
//                                         placeholder="Room Category"
//                                         value={roomOptions.find((o) => o.value === seg.roomCategory) || null}
//                                         onChange={(opt) => updateSegmentField(i, j, "roomCategory", opt?.value || "")}
//                                         menuPortalTarget={document.body}
//                                       />
//                                     </div>
//                                     <button
//                                       type="button"
//                                       onClick={() => clearSegmentTarget(i, j, "roomCategory")}
//                                       className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
//                                     >
//                                       Clear
//                                     </button>
//                                   </div>
//                                 </div>

//                                 {/* Meals */}
//                                 <div className="rounded-[20px] border border-slate-200 bg-slate-50/60 p-4 space-y-3">
//                                   <div className="flex items-center justify-between gap-2 flex-wrap">
//                                     <div>
//                                       <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Meals</div>
//                                       <div className="mt-1 text-sm text-slate-600">
//                                         Optional: fill fully (category + type + name) if you touch a meal row.
//                                       </div>
//                                     </div>

//                                     <div className="flex items-center gap-2">
//                                       <button
//                                         type="button"
//                                         onClick={() => addMeal(i, j)}
//                                         className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition font-semibold text-slate-700"
//                                       >
//                                         <Plus size={16} style={{ color: PURPLE }} />
//                                         Add meal
//                                       </button>
//                                       <button
//                                         type="button"
//                                         onClick={() => clearSegmentTarget(i, j, "meals")}
//                                         className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 border border-red-200 shadow-sm hover:bg-red-100 transition font-semibold text-red-700"
//                                       >
//                                         <X size={16} />
//                                         Clear meals
//                                       </button>
//                                     </div>
//                                   </div>

//                                   {(Array.isArray(seg.meals) ? seg.meals : [emptyMeal()]).map((meal, mi) => (
//                                     <div key={mi} className="rounded-[18px] border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
//                                       <div className="flex items-center justify-between">
//                                         <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Meal {mi + 1}</div>
//                                         {mi > 0 && (
//                                           <button type="button" onClick={() => removeMeal(i, j, mi)} className={iconBtnRed} title="Remove meal">
//                                             <X size={18} />
//                                           </button>
//                                         )}
//                                       </div>

//                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                                         <div>
//                                           <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Meal Category</div>
//                                           <Select
//                                             styles={selectStyles}
//                                             options={mealCategoryOptions}
//                                             isClearable
//                                             isDisabled={!seg.trip}
//                                             placeholder="Meal Category"
//                                             value={mealCategoryOptions.find((o) => o.value === meal.mealCategory) || null}
//                                             onChange={(opt) => updateMealField(i, j, mi, "mealCategory", opt?.value || "")}
//                                             menuPortalTarget={document.body}
//                                           />
//                                         </div>

//                                         <div>
//                                           <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Meal Type</div>
//                                           <Select
//                                             styles={selectStyles}
//                                             options={mealTypeOptions}
//                                             isClearable
//                                             isDisabled={!seg.trip}
//                                             placeholder="Meal Type"
//                                             value={mealTypeOptions.find((o) => o.value === meal.mealType) || null}
//                                             onChange={(opt) => updateMealField(i, j, mi, "mealType", opt?.value || "")}
//                                             menuPortalTarget={document.body}
//                                           />
//                                         </div>

//                                         <div>
//                                           <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Meal Name</div>
//                                           <input
//                                             className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
//                                             style={{ "--tw-ring-color": PURPLE }}
//                                             disabled={!seg.trip}
//                                             placeholder="Meal Name (Type here)"
//                                             value={meal.mealName || ""}
//                                             onChange={(e) => updateMealField(i, j, mi, "mealName", e.target.value)}
//                                           />
//                                         </div>
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}

//                 {/* Submit */}
//                 <button
//                   type="button"
//                   onClick={handleCreateFixedTour}
//                   className="w-full rounded-2xl px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_16px_40px_rgba(133,112,238,0.35)] hover:opacity-95 active:scale-[0.99] transition"
//                   style={{ background: PURPLE }}
//                 >
//                   Create Fixed Tour
//                 </button>
//               </div>
//             </div>

//             {/* TABLE CARD */}
//             <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
//               <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
//                   <div className="mt-1 text-lg font-extrabold text-slate-900">Fixed Tours</div>
//                   <div className="mt-1 text-sm text-slate-500">Search and view fixed tours</div>
//                 </div>

//                 <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
//                   <span className="text-slate-400 text-sm">Search</span>
//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => {
//                       setSearch(e.target.value);
//                       setPage(1);
//                     }}
//                     placeholder="Search by Fixed Tour Name..."
//                     className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
//                   />
//                 </div>
//               </div>

//               <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                 <table className="w-full text-sm text-left text-slate-700 min-w-[720px]">
//                   <thead>
//                     <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
//                       <th className="px-5 py-3">Sl No</th>
//                       <th className="px-5 py-3">Tour Name</th>
//                       <th className="px-5 py-3">Article Number</th>
//                       <th className="px-5 py-3">Category</th>
//                       <th className="px-5 py-3 text-center">View</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {fixedTours.length > 0 ? (
//                       fixedTours.map((tour, idx) => (
//                         <tr key={tour._id} className="border-b border-slate-100 transition hover:bg-[#8570EE]/10">
//                           <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + idx + 1}</td>
//                           <td className="px-5 py-3 font-semibold">{tour.tourName || "—"}</td>
//                           <td className="px-5 py-3 font-semibold">{tour.articleNumber || "—"}</td>
//                           <td className="px-5 py-3 font-semibold">{tour.category || "—"}</td>
//                           <td className="px-5 py-3 text-center">
//                             <button
//                               type="button"
//                               title="View Fixed Tour Details"
//                               className="inline-flex items-center justify-center h-9 w-9 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition text-slate-700"
//                               onClick={() => openViewModal(tour._id)}
//                             >
//                               <Eye className="w-4 h-4" />
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
//                           No tours found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination (premium feel) */}
//               <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
//                 <button
//                   type="button"
//                   onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                   disabled={page === 1}
//                   className={`
//                     inline-flex items-center gap-2
//                     px-3 py-2 rounded-xl border text-sm font-semibold
//                     ${
//                       page === 1
//                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                         : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                     }
//                   `}
//                 >
//                   Previous
//                 </button>

//                 <span className="px-4 py-2 rounded-xl bg-[#8570EE]/10 text-[#8570EE] font-extrabold border border-[#8570EE]/25">
//                   {page} / {totalPages}
//                 </span>

//                 <button
//                   type="button"
//                   onClick={() => setPage((p) => p + 1)}
//                   disabled={page >= totalPages}
//                   className={`
//                     inline-flex items-center gap-2
//                     px-3 py-2 rounded-xl border text-sm font-semibold
//                     ${
//                       page >= totalPages
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

//         {/* VIEW-ONLY MODAL (Fixed Tour) */}
//         {viewModalOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               onClick={() => {
//                 setViewModalOpen(false);
//                 setViewTour(null);
//               }}
//             />

//             <div
//               className="relative bg-white/92 backdrop-blur-2xl max-w-6xl w-[95%] max-h-[90vh] rounded-[28px] border border-white/25 shadow-[0_30px_90px_rgba(15,23,42,0.55)] overflow-hidden flex flex-col"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${PURPLE}, #c7bef9)` }} />

//               {/* header */}
//               <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-white/70">
//                 <div>
//                   <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Fixed Tour Overview</div>
//                   <div className="mt-1 text-2xl font-extrabold text-slate-900">{viewTour?.tourName || "Fixed Tour"}</div>
//                   <div className="text-xs mt-1 space-x-3 text-slate-500">
//                     <span>
//                       Article: <span className="font-semibold text-slate-800">{viewTour?.articleNumber || "-"}</span>
//                     </span>
//                     <span>•</span>
//                     <span>
//                       Category: <span className="font-semibold text-slate-800">{viewTour?.category || "-"}</span>
//                     </span>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setViewModalOpen(false);
//                     setViewTour(null);
//                   }}
//                   className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md flex items-center justify-center text-slate-700 text-xl font-bold"
//                 >
//                   ×
//                 </button>
//               </div>

//               {/* body */}
//               <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-slate-50">
//                 {viewLoading || !viewTour ? (
//                   <div className="w-full flex items-center justify-center py-10 text-slate-500">Loading tour details…</div>
//                 ) : (
//                   <>
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                       <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                         <div className="text-[11px] uppercase tracking-wide text-slate-500">Location</div>
//                         <div className="mt-1 text-sm text-slate-700 space-y-0.5">
//                           <div>
//                             <span className="font-semibold">Country: </span>
//                             {nameOr(viewTour.country)}
//                           </div>
//                           <div>
//                             <span className="font-semibold">State: </span>
//                             {nameOr(viewTour.state)}
//                           </div>
//                           <div>
//                             <span className="font-semibold">Destination: </span>
//                             {nameOr(viewTour.destination)}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                         <div className="text-[11px] uppercase tracking-wide text-slate-500">Duration</div>
//                         <div className="mt-1 text-sm text-slate-700 space-y-0.5">
//                           <div>
//                             <span className="font-semibold">Days / Nights: </span>
//                             {(viewTour.totalDays ?? "-") + " / " + (viewTour.totalNights ?? "-")}
//                           </div>
//                           <div>
//                             <span className="font-semibold">Pickup: </span>
//                             {viewTour.pickupPoint || "-"}
//                           </div>
//                           <div>
//                             <span className="font-semibold">Drop: </span>
//                             {viewTour.dropOffPoint || "-"}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                         <div className="text-[11px] uppercase tracking-wide text-slate-500">Validity</div>
//                         <div className="mt-1 text-sm text-slate-700 space-y-0.5">
//                           <div>
//                             <span className="font-semibold">Valid From: </span>
//                             {viewTour.validFrom ? new Date(viewTour.validFrom).toLocaleDateString("en-GB") : "-"}
//                           </div>
//                           <div>
//                             <span className="font-semibold">Valid Till: </span>
//                             {viewTour.validTill ? new Date(viewTour.validTill).toLocaleDateString("en-GB") : "-"}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                         <div className="text-[11px] uppercase tracking-wide text-slate-500">Vendor & Commission</div>
//                         <div className="mt-1 text-sm text-slate-700 space-y-0.5">
//                           <div>
//                             <span className="font-semibold">Vendor: </span>
//                             {viewTour?.vendor?.vendorName || "-"}
//                           </div>
//                           <div>
//                             <span className="font-semibold">Commission %: </span>
//                             {viewTour?.commissionPercentage ?? "-"}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Includes / Excludes */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                         <h4 className="text-sm font-extrabold text-slate-900 mb-2">Includes</h4>
//                         {Array.isArray(viewTour.includes) && viewTour.includes.length ? (
//                           <div className="flex flex-wrap gap-2">
//                             {viewTour.includes.map((item, idx) => (
//                               <span
//                                 key={idx}
//                                 className="px-3 py-1 rounded-full bg-[rgba(133,112,238,0.08)] text-slate-900 border border-[rgba(133,112,238,0.2)] text-xs font-semibold"
//                               >
//                                 {item}
//                               </span>
//                             ))}
//                           </div>
//                         ) : (
//                           <p className="text-xs text-slate-400">None</p>
//                         )}
//                       </div>

//                       <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                         <h4 className="text-sm font-extrabold text-slate-900 mb-2">Excludes</h4>
//                         {Array.isArray(viewTour.excludes) && viewTour.excludes.length ? (
//                           <div className="flex flex-wrap gap-2">
//                             {viewTour.excludes.map((item, idx) => (
//                               <span key={idx} className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold">
//                                 {item}
//                               </span>
//                             ))}
//                           </div>
//                         ) : (
//                           <p className="text-xs text-slate-400">None</p>
//                         )}
//                       </div>
//                     </div>

//                     {/* PAX PRICES */}
//                     <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                       <h4 className="text-sm font-extrabold text-slate-900 mb-3">PAX Pricing</h4>
//                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
//                         {Array.from({ length: 18 }, (_, idx) => {
//                           const n = idx + 1;
//                           const val = viewTour?.paxPrices?.[n] ?? viewTour?.paxPrices?.[String(n)];
//                           return (
//                             <div key={n} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
//                               <div className="text-[11px] text-slate-500 font-extrabold">{n} PAX</div>
//                               <div className="text-sm text-slate-900 font-extrabold">{val != null ? val : "-"}</div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>

//                     {/* Itinerary prices */}
//                     <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                       <h4 className="text-sm font-extrabold text-slate-900 mb-3">Itinerary Pricing (after commission)</h4>
//                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
//                         {Array.from({ length: 18 }, (_, idx) => {
//                           const n = idx + 1;
//                           const val = viewTour?.itineraryPrices?.[n] ?? viewTour?.itineraryPrices?.[String(n)];
//                           return (
//                             <div key={n} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
//                               <div className="text-[11px] text-slate-500 font-extrabold">{n} PAX</div>
//                               <div className="text-sm text-slate-900 font-extrabold">{val != null ? val : "-"}</div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>

//                     {/* Itinerary */}
//                     <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
//                       <h4 className="text-sm font-extrabold text-slate-900 mb-3">Day-wise Itinerary</h4>

//                       {Array.isArray(viewTour.days) && viewTour.days.length ? (
//                         <div className="space-y-4">
//                           {viewTour.days.map((day, dIdx) => (
//                             <div key={dIdx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
//                               <div className="flex items-center justify-between">
//                                 <div className="text-sm font-extrabold text-slate-900">{day.dayLabel || `Day ${dIdx + 1}`}</div>
//                                 <div className="text-[11px] text-slate-500 font-semibold">
//                                   {Array.isArray(day.segments) ? `${day.segments.length} segment(s)` : "0 segment"}
//                                 </div>
//                               </div>

//                               {Array.isArray(day.segments) &&
//                                 day.segments.map((seg, sIdx) => {
//                                   const segActs = Array.isArray(seg.selectedActivities)
//                                     ? seg.selectedActivities
//                                         .map((a) => (typeof a === "object" ? a.activityName || a.tripName || a.name : a))
//                                         .join(", ")
//                                     : "";

//                                   return (
//                                     <div key={sIdx} className="mt-2 rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
//                                       <div className="text-xs font-extrabold text-slate-600">Segment {sIdx + 1}</div>

//                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-700">
//                                         <div>
//                                           <div className="font-semibold">Country</div>
//                                           <div>{nameOr(seg.country)}</div>
//                                         </div>
//                                         <div>
//                                           <div className="font-semibold">State</div>
//                                           <div>{nameOr(seg.state)}</div>
//                                         </div>
//                                         <div>
//                                           <div className="font-semibold">Destination</div>
//                                           <div>{nameOr(seg.destination)}</div>
//                                         </div>
//                                         <div>
//                                           <div className="font-semibold">Trip</div>
//                                           <div>{nameOr(seg.trip, "tripName")}</div>
//                                         </div>
//                                         <div>
//                                           <div className="font-semibold">Add-on Trip</div>
//                                           <div>{nameOr(seg.selectedAddon, "addontripName")}</div>
//                                         </div>
//                                         <div>
//                                           <div className="font-semibold">Activities</div>
//                                           <div>{segActs || "-"}</div>
//                                         </div>
//                                       </div>

//                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
//                                         <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
//                                           <div className="font-extrabold text-slate-700 mb-1">Vehicles</div>
//                                           <div className="space-y-1 text-slate-700">
//                                             <div>
//                                               <span className="font-semibold">Trip Vehicle: </span>
//                                               {seg.tripVehicleCategory || "-"}
//                                             </div>
//                                             <div>
//                                               <span className="font-semibold">Addon Vehicle: </span>
//                                               {seg.addonTripVehicleCategory || "-"}
//                                             </div>
//                                           </div>
//                                         </div>

//                                         <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
//                                           <div className="font-extrabold text-slate-700 mb-1">Accommodation</div>
//                                           <div className="space-y-1 text-slate-700">
//                                             <div>
//                                               <span className="font-semibold">Hotel: </span>
//                                               {seg.hotelCategory || "-"}
//                                             </div>
//                                             <div>
//                                               <span className="font-semibold">Room: </span>
//                                               {seg.roomCategory || "-"}
//                                             </div>
//                                           </div>
//                                         </div>
//                                       </div>

//                                       <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
//                                         <div className="font-extrabold text-slate-700 mb-2">Meals</div>
//                                         {Array.isArray(seg.meals) && seg.meals.length ? (
//                                           <div className="space-y-2">
//                                             {seg.meals.map((m, mi) => (
//                                               <div key={mi} className="border border-slate-200 bg-white rounded-2xl p-3">
//                                                 <div className="text-[11px] text-slate-500 font-extrabold mb-1">Meal {mi + 1}</div>
//                                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//                                                   <div>
//                                                     <div className="font-semibold">Category</div>
//                                                     <div>{m.mealCategory || "-"}</div>
//                                                   </div>
//                                                   <div>
//                                                     <div className="font-semibold">Type</div>
//                                                     <div>{m.mealType || "-"}</div>
//                                                   </div>
//                                                   <div>
//                                                     <div className="font-semibold">Name</div>
//                                                     <div>{m.mealName || "-"}</div>
//                                                   </div>
//                                                 </div>
//                                               </div>
//                                             ))}
//                                           </div>
//                                         ) : (
//                                           <div className="text-slate-500">No meals</div>
//                                         )}
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-xs text-slate-500">No day-wise details found.</p>
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* footer */}
//               <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-end">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setViewModalOpen(false);
//                     setViewTour(null);
//                   }}
//                   className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm hover:shadow-md transition"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateFixedTour;


import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import {
  Plus,
  X,
  Eye,
  Sparkles,
  MapPin,
  ListChecks,
  Users,
  BadgePercent,
  CalendarClock,
  Car,
  FileText,
  Tag,
  Navigation,
  Calendar,
  Handshake,
  Percent,
  BedDouble,
  Hotel,
  Utensils,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

const PURPLE = "#8570EE";

/* ------------------- OPTIONS ------------------- */
const tripVehicleOptions = [
  { value: "Premium", label: "Premium" },
  { value: "Luxury", label: "Luxury" },
  { value: "Executive", label: "Executive" },
  { value: "Luxury Plus", label: "Luxury Plus" },
  { value: "Ultra Luxury", label: "Ultra Luxury" },
];

const addonTripVehicleOptions = [...tripVehicleOptions];

const hotelOptions = [
  { value: "Standard", label: "Standard" },
  { value: "Deluxe", label: "Deluxe" },
];

const roomOptions = [
  { value: "Standard", label: "Standard" },
  { value: "Deluxe", label: "Deluxe" },
];

const roomTypeOptions = [
  { value: "EP", label: "EP" },
  { value: "CP", label: "CP" },
  { value: "MAP", label: "MAP" },
];

const mealCategoryOptions = [
  { value: "budget", label: "Budget" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
  { value: "3star", label: "3 Star" },
  { value: "4star", label: "4 Star" },
  { value: "5star", label: "5 Star" },
];

const mealTypeOptions = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
];

/* ✅ Premium react-select styles (unchanged) */
const useSelectStyles = () =>
  useMemo(
    () => ({
      container: (b) => ({ ...b, width: "100%" }),
      control: (base, state) => ({
        ...base,
        borderRadius: 14,
        borderColor: state.isFocused ? PURPLE : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        maxHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? PURPLE : "#d1d5db" },
        overflow: "hidden",
        opacity: 1,
        cursor: state.isDisabled ? "not-allowed" : "default",
      }),
      valueContainer: (b) => ({
        ...b,
        padding: "0 12px",
        overflowX: "auto",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: 6,
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
      input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
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
    []
  );

/* ---------- builders ---------- */
const emptyMeal = () => ({
  mealCategory: "",
  mealType: "",
  mealName: "",
});

const emptySegment = () => ({
  country: "",
  state: "",
  destination: "",
  trip: "",
  selectedAddon: "",
  selectedActivities: [],

  tripVehicleCategory: "",
  addonTripVehicleCategory: "",
  hotelCategory: "",
  roomCategory: "",

  // ✅ NEW: accommodation & roomType
  accommodation: "",
  roomType: "",

  meals: [emptyMeal()],

  states: [],
  destinations: [],
  trips: [],
  addonTrips: [],
  activities: [],

  // ✅ NEW: accommodation options for this segment
  accommodations: [],
});

const emptyDay = () => ({
  expanded: false,
  segments: [emptySegment()],
});

const CreateFixedTour = () => {
  const selectStyles = useSelectStyles();

  // Top-level dropdown data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Vendors for fixed tour
  const [vendors, setVendors] = useState([]);

  // Top-level form
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    tourName: "",
    articleNumber: "",
    category: "",
    pickupPoint: "",
    dropOffPoint: "",
    totalDays: "",
    totalNights: "",
    validFrom: "",
    validTill: "",
    paxPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),

    vendorId: "",
    vendorName: "",
    commissionPercentage: "",
    itineraryPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),

    // ✅ NEW
    advancePercentage: "",
    advancePrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),
  });

  // Tags
  const [includes, setIncludes] = useState([]);
  const [excludes, setExcludes] = useState([]);

  // Days
  const [days, setDays] = useState([]);

  // List view
  const [fixedTours, setFixedTours] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // view-only modal
  const [viewTour, setViewTour] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // ✅ Collapsible sections (default closed)
  const [showPaxPricing, setShowPaxPricing] = useState(false);
  const [showItineraryPricing, setShowItineraryPricing] = useState(false);
  const [showAdvancePricing, setShowAdvancePricing] = useState(false);

  // ---------- options helpers ----------
  const toOptions = (arr = [], labelKey = "name") =>
    arr.map((i) => ({ value: i._id, label: i[labelKey] }));

  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  const destinationOptions = destinations.map((d) => ({ value: d._id, label: d.name }));

  const vendorOptions = vendors.map((v) => ({
    value: v._id,
    label: `${v.name}`,
    vendorName: v.name,
    vendorCode: v.vendorCode,
  }));

  // ---------- fetch list ----------
  const fetchFixedTours = async () => {
    try {
      const res = await API.get("/purchaser/fixedTours", { params: { page, limit: 3, search } });
      setFixedTours(res.data.tours || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching fixed tours:", err);
      toast.error("Failed to fetch fixed tours.");
    }
  };

  useEffect(() => {
    fetchFixedTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  // ---------- view modal loader ----------
  const openViewModal = async (tourId) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);
      setViewTour(null);

      const res = await API.get(`/purchaser/fixedTours/${tourId}`);
      setViewTour(res.data?.tour || res.data || null);
    } catch (err) {
      console.error("Failed to load fixed tour details", err);
      toast.error("Failed to load fixed tour details.");
      setViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- bootstrap countries ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data || []);
      } catch {
        toast.error("Error fetching countries");
      }
    })();
  }, []);

  // ---------- dependent: states ----------
  useEffect(() => {
    if (!formData.country) return;
    setStates([]);
    setDestinations([]);
    setVendors([]);
    setFormData((p) => ({
      ...p,
      state: "",
      destination: "",
      vendorId: "",
      vendorName: "",
    }));

    (async () => {
      try {
        const res = await API.get(`/purchaser/states/${formData.country}`);
        setStates(res.data || []);
      } catch {
        toast.error("Error fetching states");
      }
    })();
  }, [formData.country]);

  // ---------- dependent: destinations ----------
  useEffect(() => {
    if (!formData.country || !formData.state) return;
    setDestinations([]);
    setVendors([]);
    setFormData((p) => ({
      ...p,
      destination: "",
      vendorId: "",
      vendorName: "",
    }));

    (async () => {
      try {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${formData.country}/${formData.state}`
        );
        setDestinations(res.data || []);
      } catch {
        toast.error("Error fetching destinations");
      }
    })();
  }, [formData.state, formData.country]);

  // fetch vendors by destination
  const fetchVendorsForDestination = async (destinationId) => {
    try {
      if (!destinationId) {
        setVendors([]);
        setFormData((p) => ({ ...p, vendorId: "", vendorName: "" }));
        return;
      }
      const res = await API.get(`/purchaser/vendorsByDestinationForFixedTour/${destinationId}`);
      setVendors(res.data?.vendors || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch vendors for this destination");
    }
  };

  useEffect(() => {
    fetchVendorsForDestination(formData.destination);
    setFormData((p) => ({ ...p, vendorId: "", vendorName: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.destination]);

  // ---------- keep days count in sync ----------
  useEffect(() => {
    const total = parseInt(formData.totalDays, 10);
    if (!formData.totalDays || isNaN(total) || total <= 0) return;
    setDays((prev) => {
      const out = [...prev];
      while (out.length < total) out.push(emptyDay());
      if (out.length > total) out.splice(total);
      return out;
    });
  }, [formData.totalDays]);

  // auto calculate itineraryPrices = paxPrice + commission%
  useEffect(() => {
    const commission = Number(formData.commissionPercentage || 0);
    const out = {};
    for (let i = 1; i <= 18; i++) {
      const base = Number(formData.paxPrices?.[i] || 0);
      if (!base || base <= 0 || Number.isNaN(base) || commission < 0 || commission > 100) {
        out[i] = "";
      } else {
        const net = base + (base * commission) / 100;
        out[i] = Math.round(net);
      }
    }
    setFormData((p) => ({ ...p, itineraryPrices: out }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.commissionPercentage, formData.paxPrices]);

  // ✅ NEW: auto calculate advancePrices = paxPrice * advance%
  useEffect(() => {
    const adv = Number(formData.advancePercentage || 0);
    const out = {};
    for (let i = 1; i <= 18; i++) {
      const base = Number(formData.paxPrices?.[i] || 0);
      if (!base || base <= 0 || Number.isNaN(base) || adv < 0 || adv > 100) {
        out[i] = "";
      } else {
        const advAmt = (base * adv) / 100;
        out[i] = Math.round(advAmt);
      }
    }
    setFormData((p) => ({ ...p, advancePrices: out }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.advancePercentage, formData.paxPrices]);

  // ---------- tag helpers ----------
  const handleAddItem = (val, setList, list, inputId) => {
    if (val && !list.includes(val)) {
      setList([...list, val]);
      const el = document.getElementById(inputId);
      if (el) el.value = "";
    }
  };

  const handleRemoveItem = (idx, setList, list) => {
    const copy = [...list];
    copy.splice(idx, 1);
    setList(copy);
  };

  // ---------- day ops ----------
  const toggleDayExpand = (i) => {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, expanded: !d.expanded } : d)));
  };

  const handleRemoveDay = (i) => {
    setDays((prev) => {
      const copy = [...prev];
      copy.splice(i, 1);
      return copy;
    });
    setFormData((p) => ({
      ...p,
      totalDays: String(Math.max(1, parseInt(p.totalDays || "1", 10) - 1)),
    }));
  };

  // ---------- segment ops ----------
  const addSegment = (dayIndex) => {
    setDays((prev) => {
      const copy = [...prev];
      copy[dayIndex] = { ...copy[dayIndex], segments: [...copy[dayIndex].segments, emptySegment()] };
      return copy;
    });
  };

  const removeSegment = (dayIndex, segIndex) => {
    setDays((prev) => {
      const copy = [...prev];
      const segs = [...copy[dayIndex].segments];
      segs.splice(segIndex, 1);
      if (segs.length === 0) segs.push(emptySegment());
      copy[dayIndex] = { ...copy[dayIndex], segments: segs };
      return copy;
    });
  };

  // ---------- meals ops (unchanged) ----------
  const addMeal = (dayIndex, segIndex) => {
    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };
      const meals = Array.isArray(seg.meals) ? [...seg.meals] : [];
      meals.push(emptyMeal());
      seg.meals = meals;
      d[dayIndex].segments[segIndex] = seg;
      return d;
    });
  };

  const removeMeal = (dayIndex, segIndex, mealIndex) => {
    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };
      const meals = Array.isArray(seg.meals) ? [...seg.meals] : [];
      meals.splice(mealIndex, 1);
      if (meals.length === 0) meals.push(emptyMeal());
      seg.meals = meals;
      d[dayIndex].segments[segIndex] = seg;
      return d;
    });
  };

  const updateMealField = (dayIndex, segIndex, mealIndex, field, value) => {
    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };
      const meals = Array.isArray(seg.meals) ? [...seg.meals] : [emptyMeal()];
      const m = { ...(meals[mealIndex] || emptyMeal()) };
      m[field] = value;
      meals[mealIndex] = m;
      seg.meals = meals;
      d[dayIndex].segments[segIndex] = seg;
      return d;
    });
  };

  // ✅ NEW: fetch accommodations for a segment (destination + hotelCategory + roomCategory)
//   const fetchAccommodationsForSegment = async (dayIndex, segIndex) => {
//     try {
//       const seg = days?.[dayIndex]?.segments?.[segIndex];
//       // if (!seg?.destination || !seg?.hotelCategory || !seg?.roomCategory) {
//       //   setDays((prev) => {
//       //     const d = [...prev];
//       //     const s = { ...d[dayIndex].segments[segIndex] };
//       //     s.accommodations = [];
//       //     s.accommodation = "";
//       //     return d;
//       //   });
//       //   return;
//       // }
//       if (!seg?.destination || !seg?.hotelCategory || !seg?.roomCategory) {
//   setDays((prev) => {
//     const d = [...prev];
//     const s = { ...d[dayIndex].segments[segIndex] };
//     s.accommodations = [];
//     s.accommodation = "";
//     d[dayIndex].segments[segIndex] = s; // ✅ ADD THIS
//     return d;
//   });
//   return;
// }
//       const res = await API.get(
//         `/purchaser/accommodationsByFilter/${seg.destination}`,
//         { params: { hotelCategory: seg.hotelCategory, roomCategory: seg.roomCategory } }
//       );

//       const list = res.data?.accommodations || [];

//       setDays((prev) => {
//         const d = [...prev];
//         const s = { ...d[dayIndex].segments[segIndex] };
//         s.accommodations = list;
//         // keep current accommodation only if still exists
//         if (s.accommodation && !list.some((a) => a._id === s.accommodation)) {
//           s.accommodation = "";
//         }
//         d[dayIndex].segments[segIndex] = s;
//         return d;
//       });
//     } catch (err) {
//       console.error("Accommodation fetch failed", err);
//       toast.error("Failed to fetch accommodations");
//     }
//   };
const fetchAccommodationsForSegment = async (dayIndex, segIndex, override = {}) => {
  try {
    const seg = days?.[dayIndex]?.segments?.[segIndex];

    const destinationId = override.destination ?? seg?.destination;
    const hotelCategory = override.hotelCategory ?? seg?.hotelCategory;
    const roomCategory = override.roomCategory ?? seg?.roomCategory;

    if (!destinationId || !hotelCategory || !roomCategory) {
      setDays((prev) => {
        const d = [...prev];
        const s = { ...d[dayIndex].segments[segIndex] };
        s.accommodations = [];
        s.accommodation = "";
        d[dayIndex].segments[segIndex] = s;
        return d;
      });
      return;
    }

    const res = await API.get(`/purchaser/accommodationsByFilter/${destinationId}`, {
      params: { hotelCategory, roomCategory },
    });

    const list = res.data?.accommodations || [];

    setDays((prev) => {
      const d = [...prev];
      const s = { ...d[dayIndex].segments[segIndex] };
      s.accommodations = list;

      if (s.accommodation && !list.some((a) => a._id === s.accommodation)) {
        s.accommodation = "";
      }

      d[dayIndex].segments[segIndex] = s;
      return d;
    });
  } catch (err) {
    console.error("Accommodation fetch failed", err);
    toast.error("Failed to fetch accommodations");
  }
};

  // ---------- update a segment field + dependent fetch ----------
  const updateSegmentField = async (dayIndex, segIndex, field, value) => {
    const currentSeg = days?.[dayIndex]?.segments?.[segIndex] || {};
    const nextCountry = field === "country" ? value : currentSeg.country || "";
    const nextState = field === "state" ? value : currentSeg.state || "";
    const nextDestination = field === "destination" ? value : currentSeg.destination || "";
    const nextTrip = field === "trip" ? value : currentSeg.trip || "";

    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };
      seg[field] = value;

      if (field === "country") {
        seg.state = "";
        seg.destination = "";
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.states = [];
        seg.destinations = [];
        seg.trips = [];
        seg.addonTrips = [];
        seg.activities = [];

        // accommodation resets
        seg.hotelCategory = "";
        seg.roomCategory = "";
        seg.accommodation = "";
        seg.roomType = "";
        seg.accommodations = [];
      }

      if (field === "state") {
        seg.destination = "";
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.destinations = [];
        seg.trips = [];
        seg.addonTrips = [];
        seg.activities = [];

        seg.hotelCategory = "";
        seg.roomCategory = "";
        seg.accommodation = "";
        seg.roomType = "";
        seg.accommodations = [];
      }

      if (field === "destination") {
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.trips = [];
        seg.addonTrips = [];
        seg.activities = [];

        seg.hotelCategory = "";
        seg.roomCategory = "";
        seg.accommodation = "";
        seg.roomType = "";
        seg.accommodations = [];
      }

      if (field === "trip") {
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.addonTrips = [];
        seg.activities = [];

        seg.tripVehicleCategory = "";
        seg.addonTripVehicleCategory = "";
        seg.hotelCategory = "";
        seg.roomCategory = "";
        seg.accommodation = "";
        seg.roomType = "";
        seg.accommodations = [];
        seg.meals = [emptyMeal()];
      }

      // if changing hotelCategory / roomCategory -> reset accommodation and refetch
      if (field === "hotelCategory" || field === "roomCategory") {
        seg.accommodation = "";
        seg.accommodations = [];
      }

      const newSegments = [...d[dayIndex].segments];
      newSegments[segIndex] = seg;
      d[dayIndex] = { ...d[dayIndex], segments: newSegments };
      return d;
    });

    try {
      if (field === "country" && nextCountry) {
        const res = await API.get(`/purchaser/states/${nextCountry}`);
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].states = res.data || [];
          return d;
        });
      }
      if (field === "state" && nextCountry && nextState) {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${nextCountry}/${nextState}`
        );
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].destinations = res.data || [];
          return d;
        });
      }
      if (field === "destination" && nextCountry && nextState && nextDestination) {
        const res = await API.get(
          `/purchaser/tripsByLocation/${nextCountry}/${nextState}/${nextDestination}`
        );
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].trips = res.data || [];
          return d;
        });

        // ✅ also try fetching accommodations if hotel/room already selected
        // setTimeout(() => fetchAccommodationsForSegment(dayIndex, segIndex), 0);
      }
      if (field === "trip" && nextTrip) {
        const res = await API.get(`/purchaser/tripDetails/${nextTrip}`);
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].addonTrips = res.data.addonTrips || [];
          d[dayIndex].segments[segIndex].activities = res.data.activities || [];
          return d;
        });
      }

     if (field === "hotelCategory") {
  fetchAccommodationsForSegment(dayIndex, segIndex, {
    destination: nextDestination,
    hotelCategory: value,          // ✅ new hotel
    roomCategory: currentSeg.roomCategory,
  });
}
if (field === "roomCategory") {
  fetchAccommodationsForSegment(dayIndex, segIndex, {
    destination: nextDestination,
    hotelCategory: currentSeg.hotelCategory,
    roomCategory: value,           // ✅ new room
  });
}
if (field === "destination") {
  fetchAccommodationsForSegment(dayIndex, segIndex, {
    destination: value,            // ✅ new destination
    hotelCategory: currentSeg.hotelCategory,
    roomCategory: currentSeg.roomCategory,
  });
}


      // ✅ if hotelCategory/roomCategory changed, refetch accommodations
      // if (field === "hotelCategory" || field === "roomCategory") {
      //   setTimeout(() => fetchAccommodationsForSegment(dayIndex, segIndex), 0);
      // }
    } catch (err) {
      console.error("Dropdown fetch failed", err);
      toast.error("Dropdown fetch failed");
    }
  };

  const clearSegmentTarget = (dayIndex, segIndex, key) => {
    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };

      if (key === "trip") {
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.addonTrips = [];
        seg.activities = [];

        seg.tripVehicleCategory = "";
        seg.addonTripVehicleCategory = "";
        seg.hotelCategory = "";
        seg.roomCategory = "";
        seg.accommodation = "";
        seg.roomType = "";
        seg.accommodations = [];
        seg.meals = [emptyMeal()];
      } else if (key === "selectedAddon") {
        seg.selectedAddon = "";
      } else if (key === "selectedActivities") {
        seg.selectedActivities = [];
      } else if (key === "tripVehicleCategory") {
        seg.tripVehicleCategory = "";
      } else if (key === "addonTripVehicleCategory") {
        seg.addonTripVehicleCategory = "";
      } else if (key === "hotelCategory") {
        seg.hotelCategory = "";
        seg.accommodation = "";
        seg.accommodations = [];
      } else if (key === "roomCategory") {
        seg.roomCategory = "";
        seg.accommodation = "";
        seg.accommodations = [];
      } else if (key === "accommodation") {
        seg.accommodation = "";
      } else if (key === "roomType") {
        seg.roomType = "";
      } else if (key === "meals") {
        seg.meals = [emptyMeal()];
      }

      d[dayIndex].segments[segIndex] = seg;
      return d;
    });
  };

  // ---------- submit (payload updates only) ----------
  const handleCreateFixedTour = async () => {
    try {
      const required = {
        country: "Country is required",
        state: "State is required",
        destination: "Destination is required",
        tourName: "Tour Name is required",
        category: "Category is required",
        pickupPoint: "Pickup Point is required",
        dropOffPoint: "Drop-off Point is required",
        totalDays: "Total Days is required",
        totalNights: "Total Nights is required",
        validFrom: "Valid From is required",
        validTill: "Valid Till is required",
      };
      for (const [k, msg] of Object.entries(required)) {
        if (!String(formData[k] || "").trim()) {
          toast.error(msg);
          return;
        }
      }

      if (!formData.vendorId) return toast.error("Vendor is required");

      const commission = Number(formData.commissionPercentage || 0);
      if (Number.isNaN(commission) || commission < 0 || commission > 100) {
        return toast.error("Commission must be between 0 and 100");
      }

      // ✅ NEW: advance % validation
      const adv = Number(formData.advancePercentage || 0);
      if (Number.isNaN(adv) || adv < 0 || adv > 100) {
        return toast.error("Advance Percentage must be between 0 and 100");
      }

      const from = new Date(formData.validFrom);
      const till = new Date(formData.validTill);
      if (!(from < till)) {
        toast.error("Valid From must be earlier than Valid Till.");
        return;
      }

      if (!includes.length) return toast.error("At least one Include is required.");
      if (!excludes.length) return toast.error("At least one Exclude is required.");

      for (let i = 1; i <= 18; i++) {
        const v = formData.paxPrices[i];
        if (!v || Number(v) <= 0) {
          toast.error(`PAX price for ${i} must be > 0`);
          return;
        }
      }

      if (!days.length) return toast.error("At least one day is required.");
      if (days.length !== Number(formData.totalDays)) {
        return toast.error(`You must provide exactly ${formData.totalDays} day(s) of details.`);
      }
      if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
        return toast.error("Total Nights should be exactly one less than Total Days.");
      }

      for (let i = 0; i < days.length; i++) {
        const segs = days[i].segments;
        if (!Array.isArray(segs) || segs.length === 0) {
          return toast.error(`Day ${i + 1}: add at least one segment`);
        }
        for (let j = 0; j < segs.length; j++) {
          const s = segs[j];
          if (!s.country || !s.state || !s.destination || !s.trip) {
            return toast.error(
              `Day ${i + 1}, Segment ${j + 1}: Country, State, Destination and Trip are required`
            );
          }

          const meals = Array.isArray(s.meals) ? s.meals : [];
          for (let k = 0; k < meals.length; k++) {
            const m = meals[k];
            const touched = Boolean(m?.mealCategory || m?.mealType || String(m?.mealName || "").trim());
            if (touched) {
              if (!m.mealCategory || !m.mealType || !String(m.mealName || "").trim()) {
                return toast.error(
                  `Day ${i + 1}, Segment ${j + 1}, Meal ${k + 1}: Meal Category, Meal Type and Meal Name are required`
                );
              }
            }
          }
        }
      }

      const payload = {
        ...formData,
        includes,
        excludes,

        vendorId: formData.vendorId,
        vendorName: formData.vendorName,
        commissionPercentage: Number(formData.commissionPercentage || 0),

        // ✅ NEW
        advancePercentage: Number(formData.advancePercentage || 0),

        days: days.map((d) => ({
          segments: d.segments.map((s) => ({
            country: s.country || undefined,
            state: s.state || undefined,
            destination: s.destination || undefined,
            trip: s.trip || undefined,
            selectedAddon: s.selectedAddon || undefined,
            selectedActivities: Array.isArray(s.selectedActivities) ? s.selectedActivities.filter(Boolean) : [],

            tripVehicleCategory: s.tripVehicleCategory || undefined,
            addonTripVehicleCategory: s.addonTripVehicleCategory || undefined,
            hotelCategory: s.hotelCategory || undefined,
            roomCategory: s.roomCategory || undefined,

            // ✅ NEW
            accommodation: s.accommodation || undefined,
            roomType: s.roomType || undefined,

            meals: Array.isArray(s.meals)
              ? s.meals
                  .filter((m) => m && (m.mealCategory || m.mealType || String(m.mealName || "").trim()))
                  .map((m) => ({
                    mealCategory: m.mealCategory || undefined,
                    mealType: m.mealType || undefined,
                    mealName: String(m.mealName || "").trim() || undefined,
                  }))
              : [],
          })),
        })),
      };

      await API.post("/purchaser/createFixedTour", payload);
      toast.success("Fixed tour created successfully!");

      setFormData({
        country: "",
        state: "",
        destination: "",
        tourName: "",
        articleNumber: "",
        category: "",
        pickupPoint: "",
        dropOffPoint: "",
        totalDays: "",
        totalNights: "",
        validFrom: "",
        validTill: "",
        paxPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),

        vendorId: "",
        vendorName: "",
        commissionPercentage: "",
        itineraryPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),

        advancePercentage: "",
        advancePrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),
      });

      setIncludes([]);
      setExcludes([]);
      setDays([]);
      setStates([]);
      setDestinations([]);
      setVendors([]);
      await fetchFixedTours();
    } catch (err) {
      console.error("Error creating fixed tour:", err);
      toast.error("Failed to save fixed tour.");
    }
  };

  // ---------- helpers for view modal ----------
  const nameOr = (v, key = "name") => {
    if (!v) return "-";
    if (typeof v === "object") return v?.[key] || v?.name || v?.tripName || v?.activityName || v?.propertyName || "-";
    return v;
  };

  // ---------- premium ui helpers ----------
  const iconBtnPurple =
    "inline-flex items-center justify-center w-11 h-11 rounded-2xl text-white font-bold " +
    "shadow-[0_12px_28px_rgba(133,112,238,0.35)] hover:opacity-95 active:scale-[0.99] transition";
  const iconBtnRed =
    "inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 shadow-sm transition";

  // ✅ premium collapsible header helper
  const CollapsibleHeader = ({ title, subtitle, icon: Icon, open, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 p-4 rounded-[22px] border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start gap-3 text-left">
        <div
          className="h-11 w-11 rounded-2xl flex items-center justify-center border shadow-sm"
          style={{ background: `${PURPLE}10`, borderColor: `${PURPLE}25`, color: PURPLE }}
        >
          <Icon size={18} />
        </div>
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div> : null}
        </div>
      </div>
      <div className="text-slate-500">
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </div>
    </button>
  );
/* ===========================
   CreateFixedTour.jsx
   ✅ PART 2/3 — RETURN JSX (Main Form + Pricing + Day Segment UI)
   Paste from:  return (...)  START
   Until:       before VIEW MODAL section starts
=========================== */

  return (
    <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
      {/* Premium Shell */}
      <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
        {/* Ribbon */}
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${PURPLE}, #c7bef9)` }} />

        <div className="p-6 md:p-8 space-y-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                <Sparkles size={14} style={{ color: PURPLE }} />
                Purchaser
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">Create Fixed Tour</div>
              <div className="mt-1 text-sm text-slate-500">
                Create fixed tours with vendor-based commission pricing and day-wise segments.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
                style={{ background: `${PURPLE}12`, color: PURPLE, borderColor: `${PURPLE}30` }}
              >
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* FORM CARD */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">Create fixed tour</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Select location + tour meta, add vendor + commission + advance, then build day segments.
                  </div>
                </div>

                <div
                  className="h-11 w-11 rounded-2xl flex items-center justify-center border shadow-sm"
                  style={{ background: `${PURPLE}10`, borderColor: `${PURPLE}25`, color: PURPLE }}
                  title="Pricing & Segments"
                >
                  <BadgePercent size={18} />
                </div>
              </div>

              <div className="p-5 space-y-6 bg-gradient-to-b from-white to-purple-50/40">
                {/* Top-level filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <MapPin size={12} style={{ color: PURPLE }} />
                      Country
                    </div>
                    <Select
                      styles={selectStyles}
                      options={countryOptions}
                      placeholder="Select Country"
                      value={countryOptions.find((o) => o.value === formData.country) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, country: opt?.value || "" }))}
                      isClearable
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <MapPin size={12} style={{ color: PURPLE }} />
                      State
                    </div>
                    <Select
                      styles={selectStyles}
                      options={stateOptions}
                      placeholder="Select State"
                      value={stateOptions.find((o) => o.value === formData.state) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, state: opt?.value || "" }))}
                      isClearable
                      isDisabled={!formData.country}
                      menuPortalTarget={document.body}
                    />
                    {!formData.country && (
                      <div className="mt-1 text-xs text-slate-400">Select country first to enable states.</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <MapPin size={12} style={{ color: PURPLE }} />
                      Destination
                    </div>
                    <Select
                      styles={selectStyles}
                      options={destinationOptions}
                      placeholder="Select Destination"
                      value={destinationOptions.find((o) => o.value === formData.destination) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, destination: opt?.value || "" }))}
                      isClearable
                      isDisabled={!formData.state}
                      menuPortalTarget={document.body}
                    />
                    {!formData.state && (
                      <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
                    )}
                  </div>
                </div>

                {/* Tour meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <ListChecks size={12} style={{ color: PURPLE }} />
                      Tour Name
                    </div>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      placeholder="Tour Name"
                      value={formData.tourName}
                      onChange={(e) => setFormData((p) => ({ ...p, tourName: e.target.value.toUpperCase() }))}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <FileText size={12} style={{ color: PURPLE }} />
                      Article Number
                    </div>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      placeholder="Auto-generated after create"
                      value={formData.articleNumber}
                      readOnly
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <Tag size={12} style={{ color: PURPLE }} />
                      Category
                    </div>
                    <Select
                      styles={selectStyles}
                      isClearable
                      placeholder="Select Category"
                      options={[
                        { value: "Standard", label: "Standard" },
                        { value: "Delux", label: "Delux" },
                        { value: "Premium", label: "Premium" },
                      ]}
                      value={formData.category ? { value: formData.category, label: formData.category } : null}
                      onChange={(opt) => setFormData((p) => ({ ...p, category: opt?.value || "" }))}
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <Navigation size={12} style={{ color: PURPLE }} />
                      Pickup Point
                    </div>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      placeholder="Enter Pickup Point"
                      value={formData.pickupPoint}
                      onChange={(e) => setFormData((p) => ({ ...p, pickupPoint: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <Navigation size={12} style={{ color: PURPLE }} />
                      Drop Off Point
                    </div>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      placeholder="Enter Drop Off Point"
                      value={formData.dropOffPoint}
                      onChange={(e) => setFormData((p) => ({ ...p, dropOffPoint: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <CalendarClock size={12} style={{ color: PURPLE }} />
                      Total Days
                    </div>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      value={formData.totalDays}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value || "1", 10));
                        setFormData((p) => ({ ...p, totalDays: String(val) }));
                      }}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <CalendarClock size={12} style={{ color: PURPLE }} />
                      Total Nights
                    </div>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      placeholder="Enter Total Nights"
                      value={formData.totalNights}
                      onChange={(e) => setFormData((p) => ({ ...p, totalNights: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <Calendar size={12} style={{ color: PURPLE }} />
                      Valid From
                    </div>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      value={formData.validFrom}
                      onChange={(e) => setFormData((p) => ({ ...p, validFrom: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                      <Calendar size={12} style={{ color: PURPLE }} />
                      Valid Till
                    </div>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      value={formData.validTill}
                      onChange={(e) => setFormData((p) => ({ ...p, validTill: e.target.value }))}
                    />
                  </div>
                </div>

                {/* ✅ Vendor + Commission + Advance (Moved ABOVE Includes/Excludes) */}
                <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3 flex items-center gap-2">
                    <Handshake size={14} style={{ color: PURPLE }} />
                    Vendor & Charges
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                        <Handshake size={12} style={{ color: PURPLE }} />
                        Vendor (Fixed Tour)
                      </div>
                      <Select
                        styles={selectStyles}
                        options={vendorOptions}
                        isClearable
                        isDisabled={!formData.destination}
                        placeholder={!formData.destination ? "Select destination first" : "Select Vendor"}
                        value={vendorOptions.find((o) => o.value === formData.vendorId) || null}
                        onChange={(opt) =>
                          setFormData((p) => ({
                            ...p,
                            vendorId: opt?.value || "",
                            vendorName: opt?.vendorName || "",
                          }))
                        }
                        menuPortalTarget={document.body}
                      />
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                        <Percent size={12} style={{ color: PURPLE }} />
                        Commission Percentage (%)
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                        style={{ "--tw-ring-color": PURPLE }}
                        placeholder="Enter commission %"
                        value={formData.commissionPercentage}
                        onChange={(e) => setFormData((p) => ({ ...p, commissionPercentage: e.target.value }))}
                      />
                      <div className="mt-1 text-xs text-slate-400">
                        Itinerary pricing auto-calculates from PAX + commission.
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                        <BadgePercent size={12} style={{ color: PURPLE }} />
                        Advance Percentage (%)
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                        style={{ "--tw-ring-color": PURPLE }}
                        placeholder="Enter advance %"
                        value={formData.advancePercentage}
                        onChange={(e) => setFormData((p) => ({ ...p, advancePercentage: e.target.value }))}
                      />
                      <div className="mt-1 text-xs text-slate-400">
                        Advance pricing auto-calculates from PAX + advance percentage.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Includes / Excludes input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      id="includeInput"
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      placeholder="Add to Includes"
                    />
                    <button
                      type="button"
                      className={iconBtnPurple}
                      style={{ background: PURPLE }}
                      onClick={() =>
                        handleAddItem(
                          document.getElementById("includeInput").value,
                          setIncludes,
                          includes,
                          "includeInput"
                        )
                      }
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="excludeInput"
                      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                      style={{ "--tw-ring-color": PURPLE }}
                      placeholder="Add to Excludes"
                    />
                    <button
                      type="button"
                      className={iconBtnPurple}
                      style={{ background: PURPLE }}
                      onClick={() =>
                        handleAddItem(
                          document.getElementById("excludeInput").value,
                          setExcludes,
                          excludes,
                          "excludeInput"
                        )
                      }
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Includes / Excludes display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 flex items-center gap-2">
                      <Tag size={14} style={{ color: PURPLE }} />
                      Includes
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {includes.map((tag, i) => (
                        <span
                          key={i}
                          className="relative group bg-white/60 backdrop-blur-md text-slate-800
                            px-4 py-2 rounded-2xl flex items-center gap-3
                            border border-slate-200 shadow-sm
                            hover:shadow-[0_10px_30px_rgba(133,112,238,0.18)]
                            transition-all duration-300"
                        >
                          <span className="font-semibold text-sm">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(i, setIncludes, includes)}
                            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center
                              rounded-full text-white font-bold shadow-md transition"
                            style={{ background: PURPLE }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {includes.length === 0 && <p className="text-slate-400 italic text-sm">No includes added yet</p>}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 flex items-center gap-2">
                      <Tag size={14} style={{ color: PURPLE }} />
                      Excludes
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {excludes.map((tag, i) => (
                        <span
                          key={i}
                          className="relative group bg-white/60 backdrop-blur-md text-slate-800
                            px-4 py-2 rounded-2xl flex items-center gap-3
                            border border-slate-200 shadow-sm
                            hover:shadow-[0_10px_30px_rgba(133,112,238,0.18)]
                            transition-all duration-300"
                        >
                          <span className="font-semibold text-sm">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(i, setExcludes, excludes)}
                            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center
                              rounded-full text-white font-bold shadow-md transition"
                            style={{ background: PURPLE }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {excludes.length === 0 && <p className="text-slate-400 italic text-sm">No excludes added yet</p>}
                    </div>
                  </div>
                </div>

                {/* ✅ Collapsible Pricing Sections (default closed) */}
                <div className="space-y-3">
                  <CollapsibleHeader
                    title="PAX Pricing"
                    subtitle="Enter base prices for 1–18 pax."
                    icon={Users}
                    open={showPaxPricing}
                    onToggle={() => setShowPaxPricing((v) => !v)}
                  />
                  {showPaxPricing && (
                    <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
                      <div className="mt-1 text-sm text-slate-500">Enter base prices for 1–18 pax.</div>
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {Array.from({ length: 18 }, (_, idx) => {
                          const pax = idx + 1;
                          return (
                            <div key={pax}>
                              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                {pax} PAX
                              </div>
                              <input
                                type="number"
                                min="0"
                                placeholder={`Enter price for ${pax} PAX`}
                                value={formData.paxPrices[pax]}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    paxPrices: { ...p.paxPrices, [pax]: e.target.value },
                                  }))
                                }
                                className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                                style={{ "--tw-ring-color": PURPLE }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <CollapsibleHeader
                    title="Itinerary Pricing"
                    subtitle="Auto-calculated after commission (read-only)."
                    icon={BadgePercent}
                    open={showItineraryPricing}
                    onToggle={() => setShowItineraryPricing((v) => !v)}
                  />
                  {showItineraryPricing && (
                    <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
                      {!formData.vendorId ? (
                        <div className="text-sm text-slate-400 italic">Select a vendor to finalize pricing.</div>
                      ) : (
                        <div className="text-sm text-slate-500">Auto-calculated and read-only.</div>
                      )}

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {Array.from({ length: 18 }, (_, idx) => {
                          const n = idx + 1;
                          return (
                            <div key={n}>
                              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                {n} PAX
                              </div>
                              <input
                                readOnly
                                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm outline-none shadow-sm cursor-not-allowed"
                                value={formData.itineraryPrices?.[n] ?? ""}
                                placeholder="-"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <CollapsibleHeader
                    title="Advance Pricing"
                    subtitle="Auto-calculated from PAX and advance % (read-only)."
                    icon={BadgePercent}
                    open={showAdvancePricing}
                    onToggle={() => setShowAdvancePricing((v) => !v)}
                  />
                  {showAdvancePricing && (
                    <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-4">
                      <div className="text-sm text-slate-500">Auto-calculated and read-only.</div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {Array.from({ length: 18 }, (_, idx) => {
                          const n = idx + 1;
                          return (
                            <div key={n}>
                              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                {n} PAX
                              </div>
                              <input
                                readOnly
                                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm outline-none shadow-sm cursor-not-allowed"
                                value={formData.advancePrices?.[n] ?? ""}
                                placeholder="-"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Days header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                      <ListChecks size={14} style={{ color: PURPLE }} />
                      Itinerary
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">Day-wise Segments</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Expand a day to add segments, activities, vehicles, accommodation and optional meals.
                    </div>
                  </div>
                </div>

                {/* DAYS with multiple SEGMENTS */}
                {days.map((day, i) => (
                  <div
                    key={i}
                    className="rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden"
                  >
                    <div className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50/60">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDayExpand(i)}>
                          <span className="text-lg font-extrabold text-slate-500">{day.expanded ? "▾" : "▸"}</span>
                          <div className="text-lg font-extrabold text-slate-900">Day {i + 1}</div>
                        </div>

                        <button type="button" onClick={() => handleRemoveDay(i)} className={iconBtnRed} title="Remove day">
                          <X size={18} />
                        </button>
                      </div>

                      {day.expanded && (
                        <div className="mt-4 space-y-4">
                          {day.segments.map((seg, j) => {
                            const countryOpts = countryOptions;
                            const stateOpts = toOptions(seg.states);
                            const destOpts = toOptions(seg.destinations);
                            const tripOpts = toOptions(seg.trips, "tripName");
                            const addonOpts = toOptions(seg.addonTrips, "tripName");
                            const actOpts = toOptions(seg.activities, "tripName");

                            // ✅ accommodation options
                            const accOpts = toOptions(seg.accommodations || [], "propertyName");

                            return (
                              <div key={j} className="rounded-[20px] border border-slate-200 bg-white shadow-sm p-4 space-y-4">
                                {/* Segment header */}
                                <div className="flex items-center justify-between">
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Segment {j + 1}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {j === 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => addSegment(i)}
                                        className={iconBtnPurple}
                                        style={{ background: PURPLE }}
                                        title="Add segment"
                                      >
                                        <Plus size={18} />
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => removeSegment(i, j)}
                                        className={iconBtnRed}
                                        title="Remove segment"
                                      >
                                        <X size={18} />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* ✅ Cleaner grouped layout: Location */}
                                <div className="rounded-[18px] border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                                    <MapPin size={14} style={{ color: PURPLE }} />
                                    Location
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                                        <MapPin size={12} style={{ color: PURPLE }} />
                                        Country
                                      </div>
                                      <Select
                                        styles={selectStyles}
                                        options={countryOpts}
                                        isClearable
                                        placeholder="Country"
                                        value={countryOpts.find((o) => o.value === seg.country) || null}
                                        onChange={(opt) => updateSegmentField(i, j, "country", opt?.value || "")}
                                        menuPortalTarget={document.body}
                                      />
                                    </div>

                                    <div>
                                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                                        <MapPin size={12} style={{ color: PURPLE }} />
                                        State
                                      </div>
                                      <Select
                                        styles={selectStyles}
                                        options={stateOpts}
                                        isClearable
                                        isDisabled={!seg.country}
                                        placeholder="State"
                                        value={stateOpts.find((o) => o.value === seg.state) || null}
                                        onChange={(opt) => updateSegmentField(i, j, "state", opt?.value || "")}
                                        menuPortalTarget={document.body}
                                      />
                                    </div>

                                    <div>
                                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                                        <MapPin size={12} style={{ color: PURPLE }} />
                                        Destination
                                      </div>
                                      <Select
                                        styles={selectStyles}
                                        options={destOpts}
                                        isClearable
                                        isDisabled={!seg.state}
                                        placeholder="Destination"
                                        value={destOpts.find((o) => o.value === seg.destination) || null}
                                        onChange={(opt) => updateSegmentField(i, j, "destination", opt?.value || "")}
                                        menuPortalTarget={document.body}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* ✅ Cleaner grouped layout: Trip */}
                                <div className="rounded-[18px] border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                                    <ListChecks size={14} style={{ color: PURPLE }} />
                                    Trip & Add-ons
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                    <div>
                                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                                        <ListChecks size={12} style={{ color: PURPLE }} />
                                        Trip
                                      </div>
                                      <Select
                                        styles={selectStyles}
                                        options={tripOpts}
                                        isClearable
                                        isDisabled={!seg.destination}
                                        placeholder="Trip"
                                        value={tripOpts.find((o) => o.value === seg.trip) || null}
                                        onChange={(opt) => updateSegmentField(i, j, "trip", opt?.value || "")}
                                        menuPortalTarget={document.body}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => clearSegmentTarget(i, j, "trip")}
                                      className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                    >
                                      Clear
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                    <div>
                                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                                        <Plus size={12} style={{ color: PURPLE }} />
                                        Add-on Trip
                                      </div>
                                      <Select
                                        styles={selectStyles}
                                        options={addonOpts}
                                        isClearable
                                        isDisabled={!seg.trip}
                                        placeholder="Add-on Trip"
                                        value={addonOpts.find((o) => o.value === seg.selectedAddon) || null}
                                        onChange={(opt) => updateSegmentField(i, j, "selectedAddon", opt?.value || "")}
                                        menuPortalTarget={document.body}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => clearSegmentTarget(i, j, "selectedAddon")}
                                      className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                    >
                                      Clear
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                    <div>
                                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1 flex items-center gap-2">
                                        <Sparkles size={12} style={{ color: PURPLE }} />
                                        Activities
                                      </div>
                                      <Select
                                        styles={selectStyles}
                                        options={actOpts}
                                        isClearable
                                        isMulti
                                        isDisabled={!seg.trip}
                                        placeholder="Activities"
                                        value={actOpts.filter((o) => (seg.selectedActivities || []).includes(o.value))}
                                        onChange={(opts) =>
                                          updateSegmentField(
                                            i,
                                            j,
                                            "selectedActivities",
                                            Array.isArray(opts) ? opts.map((o) => o.value) : []
                                          )
                                        }
                                        menuPortalTarget={document.body}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => clearSegmentTarget(i, j, "selectedActivities")}
                                      className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>

                                {/* ✅ Cleaner grouped layout: Transport */}
                                <div className="rounded-[18px] border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                                    <BedDouble size={14} style={{ color: PURPLE }} />
                                    Vehicles
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                      <div>
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                          Trip Vehicle Category
                                        </div>
                                        <Select
                                          styles={selectStyles}
                                          options={tripVehicleOptions}
                                          isClearable
                                          isDisabled={!seg.trip}
                                          placeholder="Trip Vehicle Category"
                                          value={
                                            seg.tripVehicleCategory
                                              ? { value: seg.tripVehicleCategory, label: seg.tripVehicleCategory }
                                              : null
                                          }
                                          onChange={(opt) =>
                                            updateSegmentField(i, j, "tripVehicleCategory", opt?.value || "")
                                          }
                                          menuPortalTarget={document.body}
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => clearSegmentTarget(i, j, "tripVehicleCategory")}
                                        className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                      >
                                        Clear
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                      <div>
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                          Addon Trip Vehicle Category
                                        </div>
                                        <Select
                                          styles={selectStyles}
                                          options={addonTripVehicleOptions}
                                          isClearable
                                          isDisabled={!seg.trip}
                                          placeholder="Addon Trip Vehicle Category"
                                          value={
                                            seg.addonTripVehicleCategory
                                              ? {
                                                  value: seg.addonTripVehicleCategory,
                                                  label: seg.addonTripVehicleCategory,
                                                }
                                              : null
                                          }
                                          onChange={(opt) =>
                                            updateSegmentField(i, j, "addonTripVehicleCategory", opt?.value || "")
                                          }
                                          menuPortalTarget={document.body}
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => clearSegmentTarget(i, j, "addonTripVehicleCategory")}
                                        className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* ✅ Cleaner grouped layout: Accommodation (NEW hotel list + room type) */}
                                <div className="rounded-[18px] border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                                    <Hotel size={14} style={{ color: PURPLE }} />
                                    Accommodation
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                      <div>
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                          Hotel Category
                                        </div>
                                        <Select
                                          styles={selectStyles}
                                          options={hotelOptions}
                                          isClearable
                                          isDisabled={!seg.trip}
                                          placeholder="Hotel Category"
                                          value={hotelOptions.find((o) => o.value === seg.hotelCategory) || null}
                                          onChange={(opt) => updateSegmentField(i, j, "hotelCategory", opt?.value || "")}
                                          menuPortalTarget={document.body}
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => clearSegmentTarget(i, j, "hotelCategory")}
                                        className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                      >
                                        Clear
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                      <div>
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                          Room Category
                                        </div>
                                        <Select
                                          styles={selectStyles}
                                          options={roomOptions}
                                          isClearable
                                          isDisabled={!seg.trip}
                                          placeholder="Room Category"
                                          value={roomOptions.find((o) => o.value === seg.roomCategory) || null}
                                          onChange={(opt) => updateSegmentField(i, j, "roomCategory", opt?.value || "")}
                                          menuPortalTarget={document.body}
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => clearSegmentTarget(i, j, "roomCategory")}
                                        className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                      <div>
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                          Hotel (Based on Destination + Category)
                                        </div>
                                        <Select
                                          styles={selectStyles}
                                          options={accOpts}
                                          isClearable
                                          isDisabled={!seg.destination || !seg.hotelCategory || !seg.roomCategory}
                                          placeholder={
                                            !seg.destination
                                              ? "Select destination first"
                                              : !seg.hotelCategory || !seg.roomCategory
                                              ? "Select hotel & room category first"
                                              : "Select Hotel"
                                          }
                                          value={accOpts.find((o) => o.value === seg.accommodation) || null}
                                          onChange={(opt) => updateSegmentField(i, j, "accommodation", opt?.value || "")}
                                          menuPortalTarget={document.body}
                                        />
                                        {seg.destination && seg.hotelCategory && seg.roomCategory && accOpts.length === 0 && (
                                          <div className="mt-1 text-xs text-slate-400">
                                            No accommodations found for this filter.
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => clearSegmentTarget(i, j, "accommodation")}
                                        className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                      >
                                        Clear
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                                      <div>
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                                          Room Type (EP / CP / MAP)
                                        </div>
                                        <Select
                                          styles={selectStyles}
                                          options={roomTypeOptions}
                                          isClearable
                                          isDisabled={!seg.trip}
                                          placeholder="Select Room Type"
                                          value={roomTypeOptions.find((o) => o.value === seg.roomType) || null}
                                          onChange={(opt) => updateSegmentField(i, j, "roomType", opt?.value || "")}
                                          menuPortalTarget={document.body}
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => clearSegmentTarget(i, j, "roomType")}
                                        className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold shadow-sm self-end transition"
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Meals (unchanged, already premium) */}
                                <div className="rounded-[20px] border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                                        <Utensils size={14} style={{ color: PURPLE }} />
                                        Meals
                                      </div>
                                      <div className="mt-1 text-sm text-slate-600">
                                        Optional: fill fully (category + type + name) if you touch a meal row.
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => addMeal(i, j)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition font-semibold text-slate-700"
                                      >
                                        <Plus size={16} style={{ color: PURPLE }} />
                                        Add meal
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => clearSegmentTarget(i, j, "meals")}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 border border-red-200 shadow-sm hover:bg-red-100 transition font-semibold text-red-700"
                                      >
                                        <X size={16} />
                                        Clear meals
                                      </button>
                                    </div>
                                  </div>

                                  {(Array.isArray(seg.meals) ? seg.meals : [emptyMeal()]).map((meal, mi) => (
                                    <div key={mi} className="rounded-[18px] border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Meal {mi + 1}</div>
                                        {mi > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => removeMeal(i, j, mi)}
                                            className={iconBtnRed}
                                            title="Remove meal"
                                          >
                                            <X size={18} />
                                          </button>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Meal Category</div>
                                          <Select
                                            styles={selectStyles}
                                            options={mealCategoryOptions}
                                            isClearable
                                            isDisabled={!seg.trip}
                                            placeholder="Meal Category"
                                            value={mealCategoryOptions.find((o) => o.value === meal.mealCategory) || null}
                                            onChange={(opt) => updateMealField(i, j, mi, "mealCategory", opt?.value || "")}
                                            menuPortalTarget={document.body}
                                          />
                                        </div>

                                        <div>
                                          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Meal Type</div>
                                          <Select
                                            styles={selectStyles}
                                            options={mealTypeOptions}
                                            isClearable
                                            isDisabled={!seg.trip}
                                            placeholder="Meal Type"
                                            value={mealTypeOptions.find((o) => o.value === meal.mealType) || null}
                                            onChange={(opt) => updateMealField(i, j, mi, "mealType", opt?.value || "")}
                                            menuPortalTarget={document.body}
                                          />
                                        </div>

                                        <div>
                                          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Meal Name</div>
                                          <input
                                            className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition"
                                            style={{ "--tw-ring-color": PURPLE }}
                                            disabled={!seg.trip}
                                            placeholder="Meal Name (Type here)"
                                            value={meal.mealName || ""}
                                            onChange={(e) => updateMealField(i, j, mi, "mealName", e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleCreateFixedTour}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_16px_40px_rgba(133,112,238,0.35)] hover:opacity-95 active:scale-[0.99] transition"
                  style={{ background: PURPLE }}
                >
                  Create Fixed Tour
                </button>
              </div>
            </div>

            {/* TABLE CARD (unchanged) */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">Fixed Tours</div>
                  <div className="mt-1 text-sm text-slate-500">Search and view fixed tours</div>
                </div>

                <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
                  <span className="text-slate-400 text-sm">Search</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by Fixed Tour Name..."
                    className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                  />
                </div>
              </div>

              <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-sm text-left text-slate-700 min-w-[720px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <th className="px-5 py-3">Sl No</th>
                      <th className="px-5 py-3">Tour Name</th>
                      <th className="px-5 py-3">Article Number</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-center">View</th>
                    </tr>
                  </thead>

                  <tbody>
                    {fixedTours.length > 0 ? (
                      fixedTours.map((tour, idx) => (
                        <tr key={tour._id} className="border-b border-slate-100 transition hover:bg-[#8570EE]/10">
                          <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + idx + 1}</td>
                          <td className="px-5 py-3 font-semibold">{tour.tourName || "—"}</td>
                          <td className="px-5 py-3 font-semibold">{tour.articleNumber || "—"}</td>
                          <td className="px-5 py-3 font-semibold">{tour.category || "—"}</td>
                          <td className="px-5 py-3 text-center">
                            <button
                              type="button"
                              title="View Fixed Tour Details"
                              className="inline-flex items-center justify-center h-9 w-9 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition text-slate-700"
                              onClick={() => openViewModal(tour._id)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                          No tours found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination (unchanged) */}
              <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`
                    inline-flex items-center gap-2
                    px-3 py-2 rounded-xl border text-sm font-semibold
                    ${
                      page === 1
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }
                  `}
                >
                  Previous
                </button>

                <span className="px-4 py-2 rounded-xl bg-[#8570EE]/10 text-[#8570EE] font-extrabold border border-[#8570EE]/25">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className={`
                    inline-flex items-center gap-2
                    px-3 py-2 rounded-xl border text-sm font-semibold
                    ${
                      page >= totalPages
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

  

        {/* VIEW-ONLY MODAL (Fixed Tour) */}
        {viewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setViewModalOpen(false);
                setViewTour(null);
              }}
            />

            <div
              className="relative bg-white/92 backdrop-blur-2xl max-w-6xl w-[95%] max-h-[90vh] rounded-[28px] border border-white/25 shadow-[0_30px_90px_rgba(15,23,42,0.55)] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${PURPLE}, #c7bef9)` }} />

              {/* header */}
              <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-white/70">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                    <Eye size={14} style={{ color: PURPLE }} />
                    Fixed Tour Overview
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900">
                    {viewTour?.tourName || "Fixed Tour"}
                  </div>
                  <div className="text-xs mt-1 space-x-3 text-slate-500">
                    <span>
                      Article:{" "}
                      <span className="font-semibold text-slate-800">{viewTour?.articleNumber || "-"}</span>
                    </span>
                    <span>•</span>
                    <span>
                      Category:{" "}
                      <span className="font-semibold text-slate-800">{viewTour?.category || "-"}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setViewModalOpen(false);
                    setViewTour(null);
                  }}
                  className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md flex items-center justify-center text-slate-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-slate-50">
                {viewLoading || !viewTour ? (
                  <div className="w-full flex items-center justify-center py-10 text-slate-500">Loading tour details…</div>
                ) : (
                  <>
                    {/* top stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
                          <MapPin size={12} style={{ color: PURPLE }} />
                          Location
                        </div>
                        <div className="mt-1 text-sm text-slate-700 space-y-0.5">
                          <div>
                            <span className="font-semibold">Country: </span>
                            {nameOr(viewTour.country)}
                          </div>
                          <div>
                            <span className="font-semibold">State: </span>
                            {nameOr(viewTour.state)}
                          </div>
                          <div>
                            <span className="font-semibold">Destination: </span>
                            {nameOr(viewTour.destination)}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
                          <CalendarClock size={12} style={{ color: PURPLE }} />
                          Duration
                        </div>
                        <div className="mt-1 text-sm text-slate-700 space-y-0.5">
                          <div>
                            <span className="font-semibold">Days / Nights: </span>
                            {(viewTour.totalDays ?? "-") + " / " + (viewTour.totalNights ?? "-")}
                          </div>
                          <div>
                            <span className="font-semibold">Pickup: </span>
                            {viewTour.pickupPoint || "-"}
                          </div>
                          <div>
                            <span className="font-semibold">Drop: </span>
                            {viewTour.dropOffPoint || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
                          <CalendarClock size={12} style={{ color: PURPLE }} />
                          Validity
                        </div>
                        <div className="mt-1 text-sm text-slate-700 space-y-0.5">
                          <div>
                            <span className="font-semibold">Valid From: </span>
                            {viewTour.validFrom ? new Date(viewTour.validFrom).toLocaleDateString("en-GB") : "-"}
                          </div>
                          <div>
                            <span className="font-semibold">Valid Till: </span>
                            {viewTour.validTill ? new Date(viewTour.validTill).toLocaleDateString("en-GB") : "-"}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
                          <BadgePercent size={12} style={{ color: PURPLE }} />
                          Vendor & Charges
                        </div>
                        <div className="mt-1 text-sm text-slate-700 space-y-0.5">
                          <div>
                            <span className="font-semibold">Vendor: </span>
                            {viewTour?.vendor?.vendorName || "-"}
                          </div>
                          <div>
                            <span className="font-semibold">Commission %: </span>
                            {viewTour?.commissionPercentage ?? "-"}
                          </div>
                          <div>
                            <span className="font-semibold">Advance %: </span>
                            {viewTour?.advancePercentage ?? "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Includes / Excludes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                          <Tag size={14} style={{ color: PURPLE }} />
                          Includes
                        </h4>
                        {Array.isArray(viewTour.includes) && viewTour.includes.length ? (
                          <div className="flex flex-wrap gap-2">
                            {viewTour.includes.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-[rgba(133,112,238,0.08)] text-slate-900 border border-[rgba(133,112,238,0.2)] text-xs font-semibold"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">None</p>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                          <Tag size={14} style={{ color: PURPLE }} />
                          Excludes
                        </h4>
                        {Array.isArray(viewTour.excludes) && viewTour.excludes.length ? (
                          <div className="flex flex-wrap gap-2">
                            {viewTour.excludes.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">None</p>
                        )}
                      </div>
                    </div>

                    {/* PAX PRICES */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                        <Users size={16} style={{ color: PURPLE }} />
                        PAX Pricing
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {Array.from({ length: 18 }, (_, idx) => {
                          const n = idx + 1;
                          const val = viewTour?.paxPrices?.[n] ?? viewTour?.paxPrices?.[String(n)];
                          return (
                            <div key={n} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-500 font-extrabold">{n} PAX</div>
                              <div className="text-sm text-slate-900 font-extrabold">{val != null ? val : "-"}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Itinerary prices */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                        <BadgePercent size={16} style={{ color: PURPLE }} />
                        Itinerary Pricing (after commission)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {Array.from({ length: 18 }, (_, idx) => {
                          const n = idx + 1;
                          const val = viewTour?.itineraryPrices?.[n] ?? viewTour?.itineraryPrices?.[String(n)];
                          return (
                            <div key={n} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-500 font-extrabold">{n} PAX</div>
                              <div className="text-sm text-slate-900 font-extrabold">{val != null ? val : "-"}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ✅ Advance prices */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                        <BadgePercent size={16} style={{ color: PURPLE }} />
                        Advance Pricing (based on advance %)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {Array.from({ length: 18 }, (_, idx) => {
                          const n = idx + 1;
                          const val = viewTour?.advancePrices?.[n] ?? viewTour?.advancePrices?.[String(n)];
                          return (
                            <div key={n} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-500 font-extrabold">{n} PAX</div>
                              <div className="text-sm text-slate-900 font-extrabold">{val != null ? val : "-"}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Itinerary */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                        <ListChecks size={16} style={{ color: PURPLE }} />
                        Day-wise Itinerary
                      </h4>

                      {Array.isArray(viewTour.days) && viewTour.days.length ? (
                        <div className="space-y-4">
                          {viewTour.days.map((day, dIdx) => (
                            <div key={dIdx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-extrabold text-slate-900">
                                  {day.dayLabel || `Day ${dIdx + 1}`}
                                </div>
                                <div className="text-[11px] text-slate-500 font-semibold">
                                  {Array.isArray(day.segments) ? `${day.segments.length} segment(s)` : "0 segment"}
                                </div>
                              </div>

                              {Array.isArray(day.segments) &&
                                day.segments.map((seg, sIdx) => {
                                  const segActs = Array.isArray(seg.selectedActivities)
                                    ? seg.selectedActivities
                                        .map((a) => (typeof a === "object" ? a.activityName || a.tripName || a.name : a))
                                        .join(", ")
                                    : "";

                                  return (
                                    <div key={sIdx} className="mt-2 rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs font-extrabold text-slate-600">Segment {sIdx + 1}</div>
                                      </div>

                                      {/* Location + Trip summary */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-700">
                                        <div>
                                          <div className="font-semibold">Country</div>
                                          <div>{nameOr(seg.country)}</div>
                                        </div>
                                        <div>
                                          <div className="font-semibold">State</div>
                                          <div>{nameOr(seg.state)}</div>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Destination</div>
                                          <div>{nameOr(seg.destination)}</div>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Trip</div>
                                          <div>{nameOr(seg.trip, "tripName")}</div>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Add-on Trip</div>
                                          <div>{nameOr(seg.selectedAddon, "addontripName")}</div>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Activities</div>
                                          <div>{segActs || "-"}</div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                          <div className="font-extrabold text-slate-700 mb-1 flex items-center gap-2">
                                            <Car size={14} style={{ color: PURPLE }} />
                                            Vehicles
                                          </div>
                                          <div className="space-y-1 text-slate-700">
                                            <div>
                                              <span className="font-semibold">Trip Vehicle: </span>
                                              {seg.tripVehicleCategory || "-"}
                                            </div>
                                            <div>
                                              <span className="font-semibold">Addon Vehicle: </span>
                                              {seg.addonTripVehicleCategory || "-"}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                          <div className="font-extrabold text-slate-700 mb-1 flex items-center gap-2">
                                            <Hotel size={14} style={{ color: PURPLE }} />
                                            Accommodation
                                          </div>
                                          <div className="space-y-1 text-slate-700">
                                            <div>
                                              <span className="font-semibold">Hotel Category: </span>
                                              {seg.hotelCategory || "-"}
                                            </div>
                                            <div>
                                              <span className="font-semibold">Room Category: </span>
                                              {seg.roomCategory || "-"}
                                            </div>
                                            <div>
                                              <span className="font-semibold">Hotel: </span>
                                              {nameOr(seg.accommodation, "propertyName")}
                                            </div>
                                            <div>
                                              <span className="font-semibold">Room Type: </span>
                                              {seg.roomType || "-"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Meals */}
                                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
                                        <div className="font-extrabold text-slate-700 mb-2 flex items-center gap-2">
                                          <Utensils size={14} style={{ color: PURPLE }} />
                                          Meals
                                        </div>
                                        {Array.isArray(seg.meals) && seg.meals.length ? (
                                          <div className="space-y-2">
                                            {seg.meals.map((m, mi) => (
                                              <div key={mi} className="border border-slate-200 bg-white rounded-2xl p-3">
                                                <div className="text-[11px] text-slate-500 font-extrabold mb-1">
                                                  Meal {mi + 1}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                  <div>
                                                    <div className="font-semibold">Category</div>
                                                    <div>{m.mealCategory || "-"}</div>
                                                  </div>
                                                  <div>
                                                    <div className="font-semibold">Type</div>
                                                    <div>{m.mealType || "-"}</div>
                                                  </div>
                                                  <div>
                                                    <div className="font-semibold">Name</div>
                                                    <div>{m.mealName || "-"}</div>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-slate-500">No meals</div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No day-wise details found.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* footer */}
              <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setViewModalOpen(false);
                    setViewTour(null);
                  }}
                  className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm hover:shadow-md transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFixedTour;
