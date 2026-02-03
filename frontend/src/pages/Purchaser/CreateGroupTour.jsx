
// import React, { useEffect, useMemo, useState } from "react";
// import API from "../../api";
// import Select from "react-select";
// import { Pencil, Plus, X } from "lucide-react";
// import { ReceiptText } from "lucide-react";
// import { toast } from "react-toastify";

// const PURPLE = "#8570EE";

// // ---- builders ----
// const emptySegment = () => ({
//   country: "",
//   state: "",
//   destination: "",
//   trip: "",
//   selectedAddon: "",
//   // CHANGED: multiple activities
//   selectedActivities: [],
//   // per-segment dependent options
//   states: [],
//   destinations: [],
//   trips: [],
//   addonTrips: [],
//   activities: [],
// });

// const emptyDay = () => ({
//   // CHANGED: start collapsed
//   expanded: false,
//   date: "",
//   segments: [emptySegment()],
// });

// const CreateGroupTour = ({ onOpenBO }) => {
//   // ---------- react-select styles ----------
//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 12,
//         borderColor: state.isFocused ? PURPLE : "#e5e7eb",
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         maxHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? PURPLE : "#d1d5db" },
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

//   // ---------- top-level lists ----------
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]); // for top-level state select
//   const [destinations, setDestinations] = useState([]); // top-level

//   // ---------- lists for table view ----------
//   const [groupTours, setGroupTours] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // ---------- editing ----------
//   const [currentlyEditingTourId, setCurrentlyEditingTourId] = useState(null);

//   // ---------- main form ----------
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
//     startDate: "",
//     netCost: "",
//     pricePerPax: "",
//     totalPax: "",
//     riskAmount: "",
//   });

//   // ---------- tags ----------
//   const [includes, setIncludes] = useState([]);
//   const [excludes, setExcludes] = useState([]);

//   // ---------- days with multiple segments ----------
//   const [days, setDays] = useState([]);
//     // ---------- view-only modal for ACTIVE tours ----------
//   const [viewTour, setViewTour] = useState(null);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [viewLoading, setViewLoading] = useState(false);

//   // ---------- fetch list + search ----------
//   const fetchGroupTours = async () => {
//     try {
//       const res = await API.get("/purchaser/groupTours", {
//         params: { page, limit: 3, search },
//       });
//       setGroupTours(res.data.tours || []);
//       setTotalPages(res.data.totalPages || 1);
//     } catch {
//       toast.error("Failed to fetch group tours.");
//     }
//   };
//   useEffect(() => {
//     fetchGroupTours();
//   }, [search, page]);
//     // fetch full tour details for view-only modal
//   const openViewModal = async (tourId) => {
//     try {
//       setViewLoading(true);
//       setViewModalOpen(true);
//       setViewTour(null);
//       const res = await API.get(`/purchaser/groupTours/${tourId}`);
//       setViewTour(res.data?.tour || null);
//     } catch (err) {
//       console.error("Failed to load group tour details", err);
//       toast.error("Failed to load group tour details.");
//       setViewModalOpen(false);
//     } finally {
//       setViewLoading(false);
//     }
//   };

//   // when clicking BO icon in table
//   const handleBoClick = (tour) => {
//     // if tour is already ACTIVE -> show read-only modal
//     if (tour.activeStatus) {
//       openViewModal(tour._id);
//     } else {
//       // otherwise, go to BO component to create/edit BO
//       if (onOpenBO) onOpenBO(tour._id);
//     }
//   };


//   // ---------- countries (once) ----------
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

//   // ---------- top-level dependent: states ----------
//   useEffect(() => {
//     if (!formData.country || currentlyEditingTourId) return;
//     setStates([]);
//     setDestinations([]);
//     setFormData((p) => ({ ...p, state: "", destination: "" }));
//     (async () => {
//       try {
//         const res = await API.get(`/purchaser/states/${formData.country}`);
//         setStates(res.data || []);
//       } catch {
//         toast.error("Error fetching states");
//       }
//     })();
//   }, [formData.country, currentlyEditingTourId]);

//   // ---------- top-level dependent: destinations ----------
//   useEffect(() => {
//     if (!formData.country || !formData.state || currentlyEditingTourId) return;
//     setDestinations([]);
//     setFormData((p) => ({ ...p, destination: "" }));
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
//   }, [formData.state, formData.country, currentlyEditingTourId]);

//   // ---------- keep days length in sync with totalDays ----------
//   useEffect(() => {
//     const total = parseInt(formData.totalDays, 10);
//     if (!formData.totalDays || isNaN(total) || total <= 0) return;

//     setDays((prev) => {
//       const out = [...prev];
//       while (out.length < total) out.push(emptyDay());
//       if (out.length > total) out.splice(total);

//       // compute date per day when startDate is available
//       if (formData.startDate) {
//         const base = new Date(formData.startDate);
//         for (let i = 0; i < out.length; i++) {
//           const d = new Date(base);
//           d.setDate(base.getDate() + i);
//           out[i].date = d.toISOString().slice(0, 10);
//         }
//       }
//       return out;
//     });
//   }, [formData.totalDays, formData.startDate]);

//   // ---------- helpers for react-select options ----------
//   const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
//   const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
//   const destinationOptions = destinations.map((d) => ({
//     value: d._id,
//     label: d.name,
//   }));

//   const toOptions = (arr = [], labelKey = "name") =>
//     arr.map((i) => ({ value: i._id, label: i[labelKey] }));

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

//   // ---------- day expand/remove ----------
//   const toggleDayExpand = (i) => {
//     setDays((prev) =>
//       prev.map((d, idx) => (idx === i ? { ...d, expanded: !d.expanded } : d))
//     );
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
//       copy[dayIndex] = {
//         ...copy[dayIndex],
//         segments: [...copy[dayIndex].segments, emptySegment()],
//       };
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

//   // ---------- update a segment field (safe, non-stale dependent fetches) ----------
//   const updateSegmentField = async (dayIndex, segIndex, field, value) => {
//     const currentSeg = days?.[dayIndex]?.segments?.[segIndex] || {};
//     const nextCountry = field === "country" ? value : currentSeg.country || "";
//     const nextState = field === "state" ? value : currentSeg.state || "";
//     const nextDestination = field === "destination" ? value : currentSeg.destination || "";
//     const nextTrip = field === "trip" ? value : currentSeg.trip || "";

//     // 1) update local state immediately (immutably), clearing deeper deps
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
//       }

//       const newSegments = [...d[dayIndex].segments];
//       newSegments[segIndex] = seg;
//       d[dayIndex] = { ...d[dayIndex], segments: newSegments };
//       return d;
//     });

//     // 2) run dependent fetch based on "next" IDs computed above
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

//   // ---------- clear a selection inside a segment ----------
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
//       } else if (key === "selectedAddon") {
//         seg.selectedAddon = "";
//       } else if (key === "selectedActivities") {
//         seg.selectedActivities = [];
//       }
//       d[dayIndex].segments[segIndex] = seg;
//       return d;
//     });
//   };

//   // ---------- EDIT ----------
//   const handleEditTour = async (tour) => {
//     try {
//       setCurrentlyEditingTourId(tour._id);

//       // top-level
//       setFormData({
//         country: tour.country || "",
//         state: "", // fill after fetch
//         destination: "", // fill after fetch
//         tourName: tour.tourName || "",
//         articleNumber: tour.articleNumber || "",
//         category: tour.category || "",
//         pickupPoint: tour.pickupPoint || "",
//         dropOffPoint: tour.dropOffPoint || "",
//         totalDays: String(tour.totalDays || 1),
//         totalNights: String(tour.totalNights || 0),
//         startDate: tour.startDate ? tour.startDate.slice(0, 10) : "",
//         netCost: String(tour.netCost || ""),
//         pricePerPax: String(tour.pricePerPax || ""),
//         totalPax: String(tour.totalPax || ""),
//         riskAmount: String(tour.riskAmount || ""),
//       });
//       setIncludes(tour.includes || []);
//       setExcludes(tour.excludes || []);

//       // fetch states for top-level
//       if (tour.country) {
//         const resStates = await API.get(`/purchaser/states/${tour.country}`);
//         setStates(resStates.data || []);
//       }
//       setFormData((p) => ({ ...p, state: tour.state || "" }));

//       // fetch destinations for top-level
//       if (tour.country && tour.state) {
//         const resDest = await API.get(
//           `/purchaser/destinationsByCountryAndState/${tour.country}/${tour.state}`
//         );
//         setDestinations(resDest.data || []);
//       }
//       setFormData((p) => ({ ...p, destination: tour.destination || "" }));

//       // days/segments
//       const builtDays = await Promise.all(
//         (tour.days || []).map(async (day) => {
//           const dateValue = day.date ? day.date.slice(0, 10) : "";

//           // Backward compatibility (old shape without segments)
//           const rawSegments =
//             Array.isArray(day.segments) && day.segments.length
//               ? day.segments
//               : [
//                   {
//                     country: day.country,
//                     state: day.state,
//                     destination: day.destination,
//                     trip: day.trip,
//                     selectedAddon: day.selectedAddon,
//                     // if an old record stored single selectedActivity
//                     selectedActivities: day.selectedActivity ? [day.selectedActivity] : [],
//                   },
//                 ];

//           const segments = await Promise.all(
//             rawSegments.map(async (seg) => {
//               const segment = {
//                 country: seg.country || "",
//                 state: seg.state || "",
//                 destination: seg.destination || "",
//                 trip: seg.trip || "",
//                 selectedAddon: seg.selectedAddon || "",
//                 // CHANGED: array of activities in state
//                 selectedActivities: Array.isArray(seg.selectedActivities)
//                   ? seg.selectedActivities
//                   : [],
//                 states: [],
//                 destinations: [],
//                 trips: [],
//                 addonTrips: [],
//                 activities: [],
//               };
//               try {
//                 if (segment.country) {
//                   const rs = await API.get(`/purchaser/states/${segment.country}`);
//                   segment.states = rs.data || [];
//                 }
//                 if (segment.country && segment.state) {
//                   const rd = await API.get(
//                     `/purchaser/destinationsByCountryAndState/${segment.country}/${segment.state}`
//                   );
//                   segment.destinations = rd.data || [];
//                 }
//                 if (segment.country && segment.state && segment.destination) {
//                   const rt = await API.get(
//                     `/purchaser/tripsByLocation/${segment.country}/${segment.state}/${segment.destination}`
//                   );
//                   segment.trips = rt.data || [];
//                 }
//                 if (segment.trip) {
//                   const rdet = await API.get(`/purchaser/tripDetails/${segment.trip}`);
//                   segment.addonTrips = rdet.data.addonTrips || [];
//                   segment.activities = rdet.data.activities || [];
//                 }
//               } catch (e) {
//                 console.error("Segment prefill failed", e);
//               }
//               return segment;
//             })
//           );
//           return {
//             // CHANGED: start collapsed in edit too
//             expanded: false,
//             date: dateValue,
//             segments: segments.length ? segments : [emptySegment()],
//           };
//         })
//       );

//       setDays(builtDays);
//     } catch (err) {
//       console.error("Failed to prepare edit form.", err);
//       toast.error("Failed to prepare edit form.");
//     }
//   };

//   // ---------- SUBMIT ----------
//   const handleCreateGroupTour = async () => {
//     try {
//       const required = {
//         country: "Country is required",
//         state: "State is required",
//         destination: "Destination is required",
//         tourName: "Tour Name is required",
//         // articleNumber: "Article Number is required",
//         category: "Category is required",
//         pickupPoint: "Pickup Point is required",
//         dropOffPoint: "Drop-off Point is required",
//         totalDays: "Total Days is required",
//         totalNights: "Total Nights is required",
//         startDate: "Start Date is required",
//         // pricePerPax: "Price per Pax is required",
//         totalPax: "Total Pax is required",
//       };

//       for (const [k, msg] of Object.entries(required)) {
//         if (!String(formData[k] || "").trim()) {
//           toast.error(msg);
//           return;
//         }
//       }
//         const pax = Number(formData.totalPax);
//     if (!Number.isFinite(pax) || pax <= 0) {
//       toast.error("Total Pax must be greater than 0");
//       return;
//     }
//       if (!includes.length) return toast.error("At least one Include is required.");
//       if (!excludes.length) return toast.error("At least one Exclude is required.");
//       if (!days.length) return toast.error("At least one day is required.");
//       if (days.length !== Number(formData.totalDays)) {
//         return toast.error(`You must provide exactly ${formData.totalDays} day(s) of details.`);
//       }
//       if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
//         return toast.error("Total Nights should be exactly one less than Total Days.");
//       }

//       // validate segments
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
//         }
//       }

//       const payload = {
//         ...formData,
//         includes,
//         excludes,
//         days: days.map((d) => ({
//           segments: d.segments.map((s) => ({
//             country: s.country || undefined,
//             state: s.state || undefined,
//             destination: s.destination || undefined,
//             trip: s.trip || undefined,
//             selectedAddon: s.selectedAddon || undefined,
//             // CHANGED: send array of activity ids
//             selectedActivities: Array.isArray(s.selectedActivities)
//               ? s.selectedActivities.filter(Boolean)
//               : [],
//           })),
//         })),
//       };

//       if (currentlyEditingTourId) {
//         await API.put(`/purchaser/updateGroupTour/${currentlyEditingTourId}`, payload);
//         toast.success("Group tour updated successfully!");
//         setCurrentlyEditingTourId(null);
//       } else {
//         await API.post("/purchaser/createGroupTour", payload);
//         toast.success("Group tour created successfully!");
//       }

//       // Reset after success
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
//         startDate: "",
//         netCost: "",
//         pricePerPax: "",
//         totalPax: "",
//         riskAmount: "",
//       });
//       setIncludes([]);
//       setExcludes([]);
//       setDays([]);
//       setStates([]);
//       setDestinations([]);
//       await fetchGroupTours();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save group tour.");
//     }
//   };

//   return (
//     <div className="p-8 space-y-8 max-w-[100rem] mx-auto text-base font-sans bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-2xl">
//       {/* Top-level filters with react-select */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {/* Country */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Country
//           </label>
//           <Select
//             styles={selectStyles}
//             options={countryOptions}
//             isClearable
//             isDisabled={!!currentlyEditingTourId}
//             placeholder="Select Country"
//             value={countryOptions.find((o) => o.value === formData.country) || null}
//             onChange={(opt) =>
//               setFormData((p) => ({ ...p, country: opt?.value || "" }))
//             }
//           />
//         </div>

//         {/* State */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             State
//           </label>
//           <Select
//             styles={selectStyles}
//             options={stateOptions}
//             isClearable
//             isDisabled={!!currentlyEditingTourId || !formData.country}
//             placeholder="Select State"
//             value={stateOptions.find((o) => o.value === formData.state) || null}
//             onChange={(opt) =>
//               setFormData((p) => ({ ...p, state: opt?.value || "" }))
//             }
//           />
//         </div>

//         {/* Destination */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Destination
//           </label>
//           <Select
//             styles={selectStyles}
//             options={destinationOptions}
//             isClearable
//             isDisabled={!!currentlyEditingTourId || !formData.state}
//             placeholder="Select Destination"
//             value={
//               destinationOptions.find((o) => o.value === formData.destination) ||
//               null
//             }
//             onChange={(opt) =>
//               setFormData((p) => ({ ...p, destination: opt?.value || "" }))
//             }
//           />
//         </div>

//         {/* Tour Name */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Tour Name
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             disabled={!!currentlyEditingTourId}
//             placeholder="Tour Name"
//             value={formData.tourName}
//             onChange={(e) =>
//               setFormData((p) => ({
//                 ...p,
//                 tourName: e.target.value.toUpperCase(),
//               }))
//             }
//           />
//         </div>

//         {/* Article Number */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Article Number
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Auto-generated after create"
//             value={formData.articleNumber}
//             readOnly
//           />
//         </div>

//         {/* Category */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Category
//           </label>
//           <Select
//             styles={selectStyles}
//             isClearable
//             isDisabled={!!currentlyEditingTourId}
//             placeholder="Select Category"
//             options={[
//               { value: "Standard", label: "Standard" },
//               { value: "Delux", label: "Delux" },
//               { value: "Premium", label: "Premium" },
//             ]}
//             value={
//               formData.category
//                 ? { value: formData.category, label: formData.category }
//                 : null
//             }
//             onChange={(opt) =>
//               setFormData((p) => ({ ...p, category: opt?.value || "" }))
//             }
//           />
//         </div>

//         {/* Pickup / Drop */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Pickup Point
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Enter Pickup Point"
//             value={formData.pickupPoint}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, pickupPoint: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Drop Off Point
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Enter Drop Off Point"
//             value={formData.dropOffPoint}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, dropOffPoint: e.target.value }))
//             }
//           />
//         </div>

//         {/* Days / Nights / Start */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Days
//           </label>
//           <input
//             type="number"
//             min={1}
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             value={formData.totalDays}
//             onChange={(e) => {
//               const val = Math.max(1, parseInt(e.target.value || "1", 10));
//               setFormData((p) => ({ ...p, totalDays: String(val) }));
//             }}
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Nights
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Enter Total Nights"
//             value={formData.totalNights}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, totalNights: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Start Date
//           </label>
//           <input
//             type="date"
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             value={formData.startDate}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, startDate: e.target.value }))
//             }
//           />
//         </div>

//         {/* Pricing meta */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Net Cost
//           </label>
//           <input
//             readOnly
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Net Cost"
//             value={formData.netCost}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, netCost: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Price Per Pax
//           </label>
//           <input
//             readOnly
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Price per Pax"
//             value={formData.pricePerPax}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, pricePerPax: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Pax
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Total Pax"
//             value={formData.totalPax}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, totalPax: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Risk Amount
//           </label>
//           <input
//             readOnly
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Risk Amount"
//             value={formData.riskAmount}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, riskAmount: e.target.value }))
//             }
//           />
//         </div>
//       </div>

//       {/* Includes / Excludes */}
//       <div className="flex w-full gap-3">
//         <div className="w-1/2 flex items-center gap-3">
//           <input
//             id="includeInput"
//             className="border border-gray-300 p-3 w-full rounded-xl"
//             placeholder="Add to Includes"
//           />
//           <button
//             onClick={() =>
//               handleAddItem(
//                 document.getElementById("includeInput").value,
//                 setIncludes,
//                 includes,
//                 "includeInput"
//               )
//             }
//             className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
//           >
//             +
//           </button>
//         </div>
//         <div className="w-1/2 flex items-center gap-3">
//           <input
//             id="excludeInput"
//             className="border border-gray-300 p-3 w-full rounded-xl"
//             placeholder="Add to Excludes"
//           />
//           <button
//             onClick={() =>
//               handleAddItem(
//                 document.getElementById("excludeInput").value,
//                 setExcludes,
//                 excludes,
//                 "excludeInput"
//               )
//             }
//             className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
//           >
//             +
//           </button>
//         </div>
//       </div>

//       <div className="space-y-6">
//   {/* Includes */}
//   <div>
//     <h2 className="font-semibold text-gray-700 mb-3 text-lg">Includes</h2>
//     <div className="flex flex-wrap gap-4">
//       {includes.map((tag, i) => (
//         <span
//           key={i}
//           className="relative group bg-white/30 backdrop-blur-md text-gray-800 
//                      px-4 py-2 rounded-2xl flex items-center gap-3 
//                      border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
//                      hover:shadow-[0_6px_18px_rgba(133,112,238,0.3)] 
//                      transition-all duration-300 transform hover:-translate-y-1"
//         >
//           <span className="font-medium tracking-wide">{tag}</span>
//           <button
//             onClick={() => handleRemoveItem(i, setIncludes, includes)}
//             className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center 
//                        rounded-full bg-[#8570EE] text-white font-bold 
//                        shadow-md hover:bg-[#6f59da] transition-all duration-300"
//           >
//             ×
//           </button>
//         </span>
//       ))}

//       {includes.length === 0 && (
//         <p className="text-gray-400 italic">No includes added yet</p>
//       )}
//     </div>
//   </div>

//   {/* Excludes */}
//   <div>
//     <h2 className="font-semibold text-gray-700 mb-3 text-lg">Excludes</h2>
//     <div className="flex flex-wrap gap-4">
//       {excludes.map((tag, i) => (
//         <span
//           key={i}
//           className="relative group bg-white/30 backdrop-blur-md text-gray-800 
//                      px-4 py-2 rounded-2xl flex items-center gap-3 
//                      border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
//                      hover:shadow-[0_6px_18px_rgba(133,112,238,0.3)] 
//                      transition-all duration-300 transform hover:-translate-y-1"
//         >
//           <span className="font-medium tracking-wide">{tag}</span>
//           <button
//             onClick={() => handleRemoveItem(i, setExcludes, excludes)}
//             className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center 
//                        rounded-full bg-[#8570EE] text-white font-bold 
//                        shadow-md hover:bg-[#6f59da] transition-all duration-300"
//           >
//             ×
//           </button>
//         </span>
//       ))}

//       {excludes.length === 0 && (
//         <p className="text-gray-400 italic">No excludes added yet</p>
//       )}
//     </div>
//   </div>
// </div>

//       {/* DAYS with multiple SEGMENTS */}
//       {days.map((day, i) => (
//         <div
//           key={i}
//           className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between mb-3">
//             <div
//               className="flex items-center gap-2 cursor-pointer"
//               onClick={() => toggleDayExpand(i)}
//             >
//               <span className="text-lg font-bold text-gray-500">
//                 {day.expanded ? "▾" : "▸"}
//               </span>
//               <h3 className="text-xl font-semibold text-gray-800">
//                 Day {i + 1}
//               </h3>
//               {day.date && (
//                 <span className="ml-2 text-gray-500 text-sm">({day.date})</span>
//               )}
//             </div>
//             <button
//               onClick={() => handleRemoveDay(i)}
//               className="text-gray-300 hover:text-red-400 font-bold text-xl"
//             >
//               ×
//             </button>
//           </div>

//           {day.expanded && (
//             <div className="space-y-4">
//               {day.segments.map((seg, j) => {
//                 const countryOpts = countryOptions;
//                 const stateOpts = toOptions(seg.states);
//                 const destOpts = toOptions(seg.destinations);
//                 const tripOpts = toOptions(seg.trips, "tripName");
//                 const addonOpts = toOptions(seg.addonTrips, "tripName");
//                 const actOpts = toOptions(seg.activities, "tripName");

//                 return (
//                   <div
//                     key={j}
//                     className="border border-gray-200 rounded-xl p-4 space-y-3"
//                   >
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-semibold text-gray-600">
//                         Segment {j + 1}
//                       </span>
//                       <div className="flex items-center gap-2">
//                         {j === 0 ? (
//                           <button
//                             onClick={() => addSegment(i)}
//                             className="w-8 h-8 rounded-full bg-[#8570EE] text-white flex items-center justify-center"
//                           >
//                             <Plus size={16} />
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => removeSegment(i, j)}
//                             className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"
//                           >
//                             <X size={16} />
//                           </button>
//                         )}
//                       </div>
//                     </div>

//                     {/* Country / State / Destination */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                       <Select
//                         styles={selectStyles}
//                         options={countryOpts}
//                         isClearable
//                         placeholder="Country"
//                         value={
//                           countryOpts.find((o) => o.value === seg.country) || null
//                         }
//                         onChange={(opt) =>
//                           updateSegmentField(i, j, "country", opt?.value || "")
//                         }
//                       />
//                       <Select
//                         styles={selectStyles}
//                         options={stateOpts}
//                         isClearable
//                         isDisabled={!seg.country}
//                         placeholder="State"
//                         value={stateOpts.find((o) => o.value === seg.state) || null}
//                         onChange={(opt) =>
//                           updateSegmentField(i, j, "state", opt?.value || "")
//                         }
//                       />
//                       <Select
//                         styles={selectStyles}
//                         options={destOpts}
//                         isClearable
//                         isDisabled={!seg.state}
//                         placeholder="Destination"
//                         value={
//                           destOpts.find((o) => o.value === seg.destination) || null
//                         }
//                         onChange={(opt) =>
//                           updateSegmentField(i, j, "destination", opt?.value || "")
//                         }
//                       />
//                     </div>

//                     {/* Trip + clear */}
//                     <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                       <Select
//                         styles={selectStyles}
//                         options={tripOpts}
//                         isClearable
//                         isDisabled={!seg.destination}
//                         placeholder="Trip"
//                         value={tripOpts.find((o) => o.value === seg.trip) || null}
//                         onChange={(opt) =>
//                           updateSegmentField(i, j, "trip", opt?.value || "")
//                         }
//                       />
//                       <button
//                         onClick={() => clearSegmentTarget(i, j, "trip")}
//                         className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
//                       >
//                         Clear
//                       </button>
//                     </div>

//                     {/* Addon Trip + clear */}
//                     <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                       <Select
//                         styles={selectStyles}
//                         options={addonOpts}
//                         isClearable
//                         isDisabled={!seg.trip}
//                         placeholder="Add-on Trip"
//                         value={
//                           addonOpts.find((o) => o.value === seg.selectedAddon) ||
//                           null
//                         }
//                         onChange={(opt) =>
//                           updateSegmentField(
//                             i,
//                             j,
//                             "selectedAddon",
//                             opt?.value || ""
//                           )
//                         }
//                       />
//                       <button
//                         onClick={() => clearSegmentTarget(i, j, "selectedAddon")}
//                         className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
//                       >
//                         Clear
//                       </button>
//                     </div>

//                     {/* Activities (MULTI) + clear */}
//                     <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                       <Select
//                         styles={selectStyles}
//                         options={actOpts}
//                         isClearable
//                         isMulti
//                         isDisabled={!seg.trip}
//                         placeholder="Activities"
//                         value={actOpts.filter((o) =>
//                           (seg.selectedActivities || []).includes(o.value)
//                         )}
//                         onChange={(opts) =>
//                           updateSegmentField(
//                             i,
//                             j,
//                             "selectedActivities",
//                             Array.isArray(opts) ? opts.map((o) => o.value) : []
//                           )
//                         }
//                       />
//                       <button
//                         onClick={() =>
//                           clearSegmentTarget(i, j, "selectedActivities")
//                         }
//                         className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
//                       >
//                         Clear
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       ))}

//       <button
//         onClick={handleCreateGroupTour}
//         className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
//       >
//         {currentlyEditingTourId ? "Update Group Tour" : "Create Group Tour"}
//       </button>

//       {/* Table */}
//       <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
//         <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
//           View Group Tour
//         </h5>
//         <p className="block mb-6 text-sm font-light text-gray-400">
//           Search and Edit Group Tour
//         </p>
//         <div className="mb-4">
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//             placeholder="Search by Group Tour Name..."
//             className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//           />
//         </div>
//         <div className="overflow-x-auto ">
//           <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
//             <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//               <tr>
//                 <th className="px-6 py-4">Sl No</th>
//                 <th className="px-6 py-4">TOUR NAME</th>
//                 <th className="px-6 py-4">ARTICLE NUMBER</th>
//                 <th className="px-6 py-4">CATEGORY</th>
//                 <th className="px-6 py-4">START DATE</th>
//                 {/* <th className="px-6 py-4 text-center">EDIT</th> */}
//                 <th className="px-6 py-4 text-center">Bo</th>
//               </tr>
//             </thead>
//             <tbody>
//               {groupTours.length > 0 ? (
//                 groupTours.map((tour, idx) => (
//                   <tr
//                     key={tour._id}
//                     className="bg-white border-b hover:bg-gray-50"
//                   >
//                     <td className="px-6 py-4 font-semibold">
//                       {(page - 1) * 3 + idx + 1}
//                     </td>
//                     <td className="px-6 py-4 font-semibold">{tour.tourName}</td>
//                     <td className="px-6 py-4 font-semibold">
//                       {tour.articleNumber}
//                     </td>
//                     <td className="px-6 py-4 font-semibold">{tour.category}</td>
//                     <td className="px-6 py-4 font-semibold">
//                       {tour.startDate
//                         ? new Date(tour.startDate).toLocaleDateString("en-GB")
//                         : "-"}
//                     </td>
//                     {/* <td className="px-6 py-4 text-center font-semibold">
//                       <button
//                         onClick={() => handleEditTour(tour)}
//                         className="text-gray-700 hover:text-gray-700"
//                       >
//                         <Pencil className="w-4 h-4" />
//                       </button>
//                     </td> */}
//                     <td className="px-6 py-4 text-center font-semibold">
//                       {/* <button
//                         title="Booking Order"
//                         className="text-purple-600 hover:text-purple-800"
//                         onClick={() => onOpenBO && onOpenBO(tour._id)}
//                       >
//                         <ReceiptText className="w-4 h-4" />
//                       </button> */}
//                       <button
//   title={tour.activeStatus ? "View Group Tour Details" : "Booking Order"}
//   className="text-purple-600 hover:text-purple-800"
//   onClick={() => handleBoClick(tour)}
// >
//   <ReceiptText className="w-4 h-4" />
// </button>

//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center py-4 text-gray-400">
//                     No tours found.
//                   </td>
//                 </tr>
//               )}
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
//             {/* VIEW-ONLY MODAL FOR ACTIVE GROUP TOUR */}
//       {/* VIEW-ONLY MODAL FOR ACTIVE GROUP TOUR */}
// {viewModalOpen && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//     <div className="bg-white max-w-6xl w-[95%] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
//       {/* Modal header */}
//       <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#321F6A] to-[#8570EE] text-white">
//         <div>
//           <div className="text-xs uppercase tracking-wide opacity-80">
//             Group Tour Overview
//           </div>
//           <div className="text-2xl font-semibold">
//             {viewTour?.tourName || "Group Tour"}
//           </div>
//           <div className="text-xs mt-1 space-x-3 opacity-90">
//             <span>
//               Article:{" "}
//               <span className="font-semibold">
//                 {viewTour?.articleNumber || "-"}
//               </span>
//             </span>
//             <span>•</span>
//             <span>
//               Category:{" "}
//               <span className="font-semibold">
//                 {viewTour?.category || "-"}
//               </span>
//             </span>
//           </div>
//         </div>

//         <div className="flex items-start gap-3">
//           {viewTour?.activeStatus && (
//             <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold shadow-sm">
//               ACTIVE
//             </span>
//           )}
//           <button
//             onClick={() => {
//               setViewModalOpen(false);
//               setViewTour(null);
//             }}
//             className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold"
//           >
//             ×
//           </button>
//         </div>
//       </div>

//       {/* Modal body */}
//       <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-gray-50">
//         {viewLoading || !viewTour ? (
//           <div className="w-full flex items-center justify-center py-10 text-gray-500">
//             Loading tour details…
//           </div>
//         ) : (
//           <>
//             {/* Helper to get names or ids */}
//             {(() => {
//               const t = viewTour;
//               const topCountry =
//                 typeof t.country === "object" ? t.country?.name : t.country;
//               const topState =
//                 typeof t.state === "object" ? t.state?.name : t.state;
//               const topDest =
//                 typeof t.destination === "object"
//                   ? t.destination?.name
//                   : t.destination;

//               return (
//                 <>
//                   {/* TOP SUMMARY */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
//                       <div className="text-[11px] uppercase tracking-wide text-gray-500">
//                         Location
//                       </div>
//                       <div className="mt-1 text-sm text-gray-700 space-y-0.5">
//                         <div>
//                           <span className="font-semibold">Country: </span>
//                           {topCountry || "-"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">State: </span>
//                           {topState || "-"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Destination: </span>
//                           {topDest || "-"}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
//                       <div className="text-[11px] uppercase tracking-wide text-gray-500">
//                         Duration & Pax
//                       </div>
//                       <div className="mt-1 text-sm text-gray-700 space-y-0.5">
//                         <div>
//                           <span className="font-semibold">Days / Nights: </span>
//                           {(t.totalDays ?? "-") + " / " + (t.totalNights ?? "-")}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Start Date: </span>
//                           {t.startDate
//                             ? new Date(t.startDate).toLocaleDateString("en-GB")
//                             : "-"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Total Pax: </span>
//                           {t.totalPax ?? "-"}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
//                       <div className="text-[11px] uppercase tracking-wide text-gray-500">
//                         Pricing
//                       </div>
//                       <div className="mt-1 text-sm text-gray-700 space-y-0.5">
//                         <div>
//                           <span className="font-semibold">Net Cost (BO): </span>
//                           {t.netCost != null ? t.netCost : "-"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Price / Pax: </span>
//                           {t.pricePerPax != null ? t.pricePerPax : "-"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Risk Amount: </span>
//                           {t.riskAmount != null ? t.riskAmount : "-"}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Includes / Excludes */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
//                       <h4 className="text-sm font-semibold text-[#321F6A] mb-2">
//                         Includes
//                       </h4>
//                       {Array.isArray(t.includes) && t.includes.length ? (
//                         <div className="flex flex-wrap gap-2">
//                           {t.includes.map((item, idx) => (
//                             <span
//                               key={idx}
//                               className="px-3 py-1 rounded-full bg-[rgba(133,112,238,0.08)] text-[#321F6A] border border-[rgba(133,112,238,0.2)] text-xs"
//                             >
//                               {item}
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-xs text-gray-400">None</p>
//                       )}
//                     </div>

//                     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
//                       <h4 className="text-sm font-semibold text-[#321F6A] mb-2">
//                         Excludes
//                       </h4>
//                       {Array.isArray(t.excludes) && t.excludes.length ? (
//                         <div className="flex flex-wrap gap-2">
//                           {t.excludes.map((item, idx) => (
//                             <span
//                               key={idx}
//                               className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs"
//                             >
//                               {item}
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-xs text-gray-400">None</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Itinerary + BO details */}
//                   <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
//                     <h4 className="text-sm font-semibold text-[#321F6A] mb-3">
//                       Day-wise Itinerary & Booking Order
//                     </h4>

//                     {Array.isArray(t.days) && t.days.length ? (
//                       <div className="space-y-4">
//                         {t.days.map((day, dIdx) => (
//                           <div
//                             key={dIdx}
//                             className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-2"
//                           >
//                             <div className="flex items-center justify-between">
//                               <div>
//                                 <div className="text-sm font-semibold text-gray-800">
//                                   {day.dayLabel || `Day ${dIdx + 1}`}
//                                 </div>
//                                 <div className="text-xs text-gray-500">
//                                   {day.date
//                                     ? new Date(day.date).toLocaleDateString(
//                                         "en-GB"
//                                       )
//                                     : "-"}
//                                 </div>
//                               </div>
//                               <div className="text-[11px] text-gray-500">
//                                 {Array.isArray(day.segments)
//                                   ? `${day.segments.length} segment(s)`
//                                   : "0 segment"}
//                               </div>
//                             </div>

//                             {/* segments */}
//                             {Array.isArray(day.segments) &&
//                               day.segments.map((seg, sIdx) => {
//                                 const segCountry =
//                                   typeof seg.country === "object"
//                                     ? seg.country?.name
//                                     : seg.country;
//                                 const segState =
//                                   typeof seg.state === "object"
//                                     ? seg.state?.name
//                                     : seg.state;
//                                 const segDest =
//                                   typeof seg.destination === "object"
//                                     ? seg.destination?.name
//                                     : seg.destination;
//                                 const segTrip =
//                                   typeof seg.trip === "object"
//                                     ? seg.trip?.tripName
//                                     : seg.trip;
//                                 const segAddon =
//                                   typeof seg.selectedAddon === "object"
//                                     ? seg.selectedAddon?.addontripName
//                                     : seg.selectedAddon;

//                                 const segActs = Array.isArray(seg.selectedActivities)
//                                   ? seg.selectedActivities
//                                       .map((a) =>
//                                         typeof a === "object"
//                                           ? a.activityName
//                                           : a
//                                       )
//                                       .join(", ")
//                                   : "";

//                                 return (
//                                   <div
//                                     key={sIdx}
//                                     className="mt-2 rounded-xl bg-white border border-gray-200 p-3 space-y-3"
//                                   >
//                                     {/* segment header */}
//                                     <div className="flex items-center justify-between">
//                                       <div className="text-xs font-semibold text-gray-600">
//                                         Segment {sIdx + 1}
//                                       </div>
//                                     </div>

//                                     {/* basic info */}
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-700">
//                                       <div>
//                                         <div className="font-semibold">Country</div>
//                                         <div>{segCountry || "-"}</div>
//                                       </div>
//                                       <div>
//                                         <div className="font-semibold">State</div>
//                                         <div>{segState || "-"}</div>
//                                       </div>
//                                       <div>
//                                         <div className="font-semibold">Destination</div>
//                                         <div>{segDest || "-"}</div>
//                                       </div>
//                                       <div>
//                                         <div className="font-semibold">Trip</div>
//                                         <div>{segTrip || "-"}</div>
//                                       </div>
//                                       <div>
//                                         <div className="font-semibold">Add-on Trip</div>
//                                         <div>{segAddon || "-"}</div>
//                                       </div>
//                                       <div>
//                                         <div className="font-semibold">Activities</div>
//                                         <div>{segActs || "-"}</div>
//                                       </div>
//                                     </div>

//                                     {/* BO blocks */}
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
//                                       {/* Trip Vehicles */}
//                                       {Array.isArray(seg.boTripVehicles) &&
//                                         seg.boTripVehicles.length > 0 && (
//                                           <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
//                                             <div className="font-semibold text-gray-700 mb-1">
//                                               Trip Vehicles
//                                             </div>
//                                             <div className="space-y-1">
//                                               {seg.boTripVehicles.map((v) => {
//                                                 const boUnit = Number(v.basePrice || 0) || 0;
//                                                 const perc = Number(v.percentage || 0) || 0;
//                                                 const itinUnit = Math.round(boUnit * (1 + perc / 100));
//                                                 const qty = Number(v.qty || 0);

//                                                 const vehicleName = v.vehicleName || v.vehicle || "-";
//                                                 const vendorName = v.vendorName || "-";

//                                                 return (
//                                                   <div
//                                                     key={v._id}
//                                                     className="flex justify-between border-b border-dashed border-gray-200 pb-1 last:border-none last:pb-0"
//                                                   >
//                                                     <div>
//                                                       <div className="font-medium">
//                                                         {v.category || "-"}
//                                                       </div>

//                                                       {/* ✅ NEW: vehicle + vendor */}
//                                                       <div className="text-[11px] text-gray-500">
//                                                         Vehicle: <b>{vehicleName}</b> • Vendor:{" "}
//                                                         <b>{vendorName}</b>
//                                                       </div>

//                                                       <div className="text-[11px] text-gray-500">
//                                                         BO: {boUnit} • %{perc} • Itin Unit: {itinUnit}
//                                                       </div>
//                                                     </div>

//                                                     <div className="text-right">
//                                                       <div>
//                                                         Qty: <b>{qty}</b>
//                                                       </div>
//                                                       <div className="text-[11px] text-gray-500">
//                                                         BO Total: <b>{boUnit * qty}</b>
//                                                         <br />
//                                                         Itin Total: <b>{itinUnit * qty}</b>
//                                                       </div>
//                                                     </div>
//                                                   </div>
//                                                 );
//                                               })}
//                                             </div>
//                                           </div>
//                                         )}

//                                       {/* Addon Vehicles */}
//                                       {Array.isArray(seg.boAddonVehicles) &&
//                                         seg.boAddonVehicles.length > 0 && (
//                                           <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
//                                             <div className="font-semibold text-gray-700 mb-1">
//                                               Add-on Vehicles
//                                             </div>
//                                             <div className="space-y-1">
//                                               {seg.boAddonVehicles.map((v) => {
//                                                 const boUnit = Number(v.basePrice || 0) || 0;
//                                                 const perc = Number(v.percentage || 0) || 0;
//                                                 const itinUnit = Math.round(boUnit * (1 + perc / 100));
//                                                 const qty = Number(v.qty || 0);

//                                                 const vehicleName = v.vehicleName || v.vehicle || "-";
//                                                 const vendorName = v.vendorName || "-";

//                                                 return (
//                                                   <div
//                                                     key={v._id}
//                                                     className="flex justify-between border-b border-dashed border-gray-200 pb-1 last:border-none last:pb-0"
//                                                   >
//                                                     <div>
//                                                       <div className="font-medium">
//                                                         {v.category || "-"}
//                                                       </div>

//                                                       {/* ✅ NEW: vehicle + vendor */}
//                                                       <div className="text-[11px] text-gray-500">
//                                                         Vehicle: <b>{vehicleName}</b> • Vendor:{" "}
//                                                         <b>{vendorName}</b>
//                                                       </div>

//                                                       <div className="text-[11px] text-gray-500">
//                                                         BO: {boUnit} • %{perc} • Itin Unit: {itinUnit}
//                                                       </div>
//                                                     </div>

//                                                     <div className="text-right">
//                                                       <div>
//                                                         Qty: <b>{qty}</b>
//                                                       </div>
//                                                       <div className="text-[11px] text-gray-500">
//                                                         BO Total: <b>{boUnit * qty}</b>
//                                                         <br />
//                                                         Itin Total: <b>{itinUnit * qty}</b>
//                                                       </div>
//                                                     </div>
//                                                   </div>
//                                                 );
//                                               })}
//                                             </div>
//                                           </div>
//                                         )}

//                                       {/* Foods */}
//                                       {Array.isArray(seg.boFoods) &&
//                                         seg.boFoods.length > 0 && (
//                                           <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
//                                             <div className="font-semibold text-gray-700 mb-1">
//                                               Foods
//                                             </div>
//                                             <div className="space-y-1">
//                                               {seg.boFoods.map((f) => {
//                                                 const boUnit = Number(f.price || 0) || 0;
//                                                 const perc = Number(f.percent || 0) || 0;
//                                                 const itinUnit =
//                                                   f.itineraryUnit != null &&
//                                                   !isNaN(f.itineraryUnit)
//                                                     ? Number(f.itineraryUnit)
//                                                     : Math.round(boUnit * (1 + perc / 100));
//                                                 const qty = Number(f.qty || 0);

//                                                 const vendorName = f.vendorName || "-";

//                                                 return (
//                                                   <div
//                                                     key={f._id}
//                                                     className="flex justify-between border-b border-dashed border-gray-200 pb-1 last:border-none last:pb-0"
//                                                   >
//                                                     <div>
//                                                       <div className="font-medium">
//                                                         {f.foodName || "-"}
//                                                       </div>

//                                                       {/* ✅ NEW: vendor */}
//                                                       <div className="text-[11px] text-gray-500">
//                                                         Vendor: <b>{vendorName}</b>
//                                                       </div>

//                                                       <div className="text-[11px] text-gray-500">
//                                                         {f.mealCategory} • {f.mealType}
//                                                         <br />
//                                                         BO: {boUnit} • % {perc} • Itin Unit: {itinUnit}
//                                                       </div>
//                                                     </div>
//                                                     <div className="text-right">
//                                                       <div>
//                                                         Qty: <b>{qty}</b>
//                                                       </div>
//                                                       <div className="text-[11px] text-gray-500">
//                                                         BO Total: <b>{boUnit * qty}</b>
//                                                         <br />
//                                                         Itin Total: <b>{itinUnit * qty}</b>
//                                                       </div>
//                                                     </div>
//                                                   </div>
//                                                 );
//                                               })}
//                                             </div>
//                                           </div>
//                                         )}

//                                       {/* Activities */}
//                                       {Array.isArray(seg.boActivities) &&
//                                         seg.boActivities.length > 0 && (
//                                           <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
//                                             <div className="font-semibold text-gray-700 mb-1">
//                                               Activities
//                                             </div>
//                                             <div className="space-y-1">
//                                               {seg.boActivities.map((a) => {
//                                                 const boUnit = Number(a.price || 0) || 0;
//                                                 const perc = Number(a.percentage || 0) || 0;
//                                                 const itinUnit =
//                                                   a.itineraryUnit != null &&
//                                                   !isNaN(a.itineraryUnit)
//                                                     ? Number(a.itineraryUnit)
//                                                     : Math.round(boUnit * (1 + perc / 100));
//                                                 const qty = Number(a.qty || 0);

//                                                 const vendorName = a.vendorName || "-";

//                                                 return (
//                                                   <div
//                                                     key={a._id}
//                                                     className="flex justify-between border-b border-dashed border-gray-200 pb-1 last:border-none last:pb-0"
//                                                   >
//                                                     <div>
//                                                       <div className="font-medium">
//                                                         {a.name || "-"}
//                                                       </div>

//                                                       {/* ✅ NEW: vendor */}
//                                                       <div className="text-[11px] text-gray-500">
//                                                         Vendor: <b>{vendorName}</b>
//                                                       </div>

//                                                       <div className="text-[11px] text-gray-500">
//                                                         BO: {boUnit} • % {perc} • Itin Unit: {itinUnit}
//                                                       </div>
//                                                     </div>
//                                                     <div className="text-right">
//                                                       <div>
//                                                         Qty: <b>{qty}</b>
//                                                       </div>
//                                                       <div className="text-[11px] text-gray-500">
//                                                         BO Total: <b>{boUnit * qty}</b>
//                                                         <br />
//                                                         Itin Total: <b>{itinUnit * qty}</b>
//                                                       </div>
//                                                     </div>
//                                                   </div>
//                                                 );
//                                               })}
//                                             </div>
//                                           </div>
//                                         )}

//                                       {/* Accommodations */}
//                                       {Array.isArray(seg.boAccommodations) &&
//                                         seg.boAccommodations.length > 0 && (
//                                           <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 md:col-span-2">
//                                             <div className="font-semibold text-gray-700 mb-1">
//                                               Accommodations
//                                             </div>
//                                             <div className="space-y-1">
//                                               {seg.boAccommodations.map((ac) => {
//                                                 const boUnit = Number(ac.bo || 0) || 0;
//                                                 const itinUnit = Number(ac.itinerary || 0) || 0;
//                                                 const qty = Number(ac.qty || 0);

//                                                 const vendorName = ac.vendorName || "-";

//                                                 return (
//                                                   <div
//                                                     key={ac._id}
//                                                     className="flex justify-between border-b border-dashed border-gray-200 pb-1 last:border-none last:pb-0"
//                                                   >
//                                                     <div>
//                                                       <div className="font-medium">
//                                                         {ac.propertyName || "-"}
//                                                       </div>

//                                                       {/* ✅ NEW: vendor */}
//                                                       <div className="text-[11px] text-gray-500">
//                                                         Vendor: <b>{vendorName}</b>
//                                                       </div>

//                                                       <div className="text-[11px] text-gray-500">
//                                                         {ac.hotelCategory} • {ac.roomCategory} • Room:{" "}
//                                                         {ac.roomTypeCode}
//                                                         <br />
//                                                         Commission: {ac.commission || 0}% • BO: {boUnit} • Itin:{" "}
//                                                         {itinUnit}
//                                                       </div>
//                                                     </div>
//                                                     <div className="text-right">
//                                                       <div>
//                                                         Qty: <b>{qty}</b>
//                                                       </div>
//                                                       <div className="text-[11px] text-gray-500">
//                                                         BO Total: <b>{boUnit * qty}</b>
//                                                         <br />
//                                                         Itin Total: <b>{itinUnit * qty}</b>
//                                                       </div>
//                                                     </div>
//                                                   </div>
//                                                 );
//                                               })}
//                                             </div>
//                                           </div>
//                                         )}
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-xs text-gray-500">
//                         No day-wise details found.
//                       </p>
//                     )}
//                   </div>
//                 </>
//               );
//             })()}
//           </>
//         )}
//       </div>

//       {/* Modal footer */}
//       <div className="px-6 py-3 border-t border-gray-200 bg-white flex justify-end">
//         <button
//           onClick={() => {
//             setViewModalOpen(false);
//             setViewTour(null);
//           }}
//           className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}


//     </div>
//   );
// };

// export default CreateGroupTour;



import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import {
  Pencil,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  ReceiptText,
  MapPin,
  ListChecks,
  CalendarClock,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

const PURPLE = "#8570EE";

// ---- builders ----
const emptySegment = () => ({
  country: "",
  state: "",
  destination: "",
  trip: "",
  selectedAddon: "",
  // multiple activities
  selectedActivities: [],
  // per-segment dependent options
  states: [],
  destinations: [],
  trips: [],
  addonTrips: [],
  activities: [],
});

const emptyDay = () => ({
  // start collapsed
  expanded: false,
  date: "",
  segments: [emptySegment()],
});

const CreateGroupTour = ({ onOpenBO }) => {
  const THEME = PURPLE;

  // ---------- premium react-select styles (same family as CreateFood premium) ----------
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

  // ---------- top-level lists ----------
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]); // top-level state select
  const [destinations, setDestinations] = useState([]); // top-level

  // ---------- lists for table view ----------
  const [groupTours, setGroupTours] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ---------- editing ----------
  const [currentlyEditingTourId, setCurrentlyEditingTourId] = useState(null);

  // ---------- main form ----------
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
    startDate: "",
    netCost: "",
    pricePerPax: "",
    totalPax: "",
    riskAmount: "",
  });

  // ---------- tags ----------
  const [includes, setIncludes] = useState([]);
  const [excludes, setExcludes] = useState([]);

  // ---------- days with multiple segments ----------
  const [days, setDays] = useState([]);

  // ---------- view-only modal for ACTIVE tours ----------
  const [viewTour, setViewTour] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // ---------- fetch list + search ----------
  const fetchGroupTours = async () => {
    try {
      const res = await API.get("/purchaser/groupTours", {
        params: { page, limit: 3, search },
      });
      setGroupTours(res.data.tours || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to fetch group tours.");
    }
  };

  useEffect(() => {
    fetchGroupTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  // fetch full tour details for view-only modal
  const openViewModal = async (tourId) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);
      setViewTour(null);
      const res = await API.get(`/purchaser/groupTours/${tourId}`);
      setViewTour(res.data?.tour || null);
    } catch (err) {
      console.error("Failed to load group tour details", err);
      toast.error("Failed to load group tour details.");
      setViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };
  const toggleActiveStatus = async () => {
  if (!viewTour?._id) return;

  try {
    setStatusUpdating(true);

    const next = !viewTour.activeStatus;

    const res = await API.put(`/purchaser/groupTours/${viewTour._id}/activeStatus`, {
      activeStatus: next,
    });

    const updatedTour = res.data?.tour;
    if (updatedTour) {
      setViewTour(updatedTour);
    } else {
      const ref = await API.get(`/purchaser/groupTours/${viewTour._id}`);
      setViewTour(ref.data?.tour || null);
    }

    // refresh table list too
    fetchGroupTours();

    // toast.success(`Tour marked as ${next ? "ACTIVE" : "INACTIVE"}`);
  } catch (e) {
    console.error(e);
    toast.error("Failed to update active status");
  } finally {
    setStatusUpdating(false);
  }
};


  // when clicking BO icon in table
  const handleBoClick = (tour) => {
    // if tour is already ACTIVE -> show read-only modal
    if (tour.boCreatedStatus) {
      openViewModal(tour._id);
    } else {
      // otherwise, go to BO component to create/edit BO
      if (onOpenBO) onOpenBO(tour._id);
    }
  };

  // ---------- countries (once) ----------
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

  // ---------- top-level dependent: states ----------
  useEffect(() => {
    if (!formData.country || currentlyEditingTourId) return;

    setStates([]);
    setDestinations([]);
    setFormData((p) => ({ ...p, state: "", destination: "" }));

    (async () => {
      try {
        const res = await API.get(`/purchaser/states/${formData.country}`);
        setStates(res.data || []);
      } catch {
        toast.error("Error fetching states");
      }
    })();
  }, [formData.country, currentlyEditingTourId]);

  // ---------- top-level dependent: destinations ----------
  useEffect(() => {
    if (!formData.country || !formData.state || currentlyEditingTourId) return;

    setDestinations([]);
    setFormData((p) => ({ ...p, destination: "" }));

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
  }, [formData.state, formData.country, currentlyEditingTourId]);

  // ---------- keep days length in sync with totalDays ----------
  useEffect(() => {
    const total = parseInt(formData.totalDays, 10);
    if (!formData.totalDays || Number.isNaN(total) || total <= 0) return;

    setDays((prev) => {
      const out = [...prev];
      while (out.length < total) out.push(emptyDay());
      if (out.length > total) out.splice(total);

      // compute date per day when startDate is available
      if (formData.startDate) {
        const base = new Date(formData.startDate);
        for (let i = 0; i < out.length; i++) {
          const d = new Date(base);
          d.setDate(base.getDate() + i);
          out[i].date = d.toISOString().slice(0, 10);
        }
      }
      return out;
    });
  }, [formData.totalDays, formData.startDate]);

  // ---------- helpers for react-select options ----------
  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  const destinationOptions = destinations.map((d) => ({ value: d._id, label: d.name }));

  const toOptions = (arr = [], labelKey = "name") =>
    arr.map((i) => ({ value: i._id, label: i[labelKey] }));

  // ---------- tag helpers ----------
  const handleAddItem = (val, setList, list, inputId) => {
    const v = String(val || "").trim();
    if (!v) return;
    if (!list.includes(v)) {
      setList([...list, v]);
      const el = document.getElementById(inputId);
      if (el) el.value = "";
    }
  };

  const handleRemoveItem = (idx, setList, list) => {
    const copy = [...list];
    copy.splice(idx, 1);
    setList(copy);
  };

  // ---------- day expand/remove ----------
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

  // ---------- update a segment field (safe, non-stale dependent fetches) ----------
  const updateSegmentField = async (dayIndex, segIndex, field, value) => {
    const currentSeg = days?.[dayIndex]?.segments?.[segIndex] || {};
    const nextCountry = field === "country" ? value : currentSeg.country || "";
    const nextState = field === "state" ? value : currentSeg.state || "";
    const nextDestination = field === "destination" ? value : currentSeg.destination || "";
    const nextTrip = field === "trip" ? value : currentSeg.trip || "";

    // 1) update local state immediately (immutably), clearing deeper deps
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
      }
      if (field === "destination") {
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.trips = [];
        seg.addonTrips = [];
        seg.activities = [];
      }
      if (field === "trip") {
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.addonTrips = [];
        seg.activities = [];
      }

      const newSegments = [...d[dayIndex].segments];
      newSegments[segIndex] = seg;
      d[dayIndex] = { ...d[dayIndex], segments: newSegments };
      return d;
    });

    // 2) run dependent fetch based on "next" IDs computed above
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
    } catch (err) {
      console.error("Dropdown fetch failed", err);
      toast.error("Dropdown fetch failed");
    }
  };

  // ---------- clear a selection inside a segment ----------
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
      } else if (key === "selectedAddon") {
        seg.selectedAddon = "";
      } else if (key === "selectedActivities") {
        seg.selectedActivities = [];
      }
      d[dayIndex].segments[segIndex] = seg;
      return d;
    });
  };

  // ---------- EDIT ----------
  const handleEditTour = async (tour) => {
    try {
      setCurrentlyEditingTourId(tour._id);

      // top-level
      setFormData({
        country: tour.country || "",
        state: "",
        destination: "",
        tourName: tour.tourName || "",
        articleNumber: tour.articleNumber || "",
        category: tour.category || "",
        pickupPoint: tour.pickupPoint || "",
        dropOffPoint: tour.dropOffPoint || "",
        totalDays: String(tour.totalDays || 1),
        totalNights: String(tour.totalNights || 0),
        startDate: tour.startDate ? tour.startDate.slice(0, 10) : "",
        netCost: String(tour.netCost || ""),
        pricePerPax: String(tour.pricePerPax || ""),
        totalPax: String(tour.totalPax || ""),
        riskAmount: String(tour.riskAmount || ""),
      });
      setIncludes(tour.includes || []);
      setExcludes(tour.excludes || []);

      // fetch states for top-level
      if (tour.country) {
        const resStates = await API.get(`/purchaser/states/${tour.country}`);
        setStates(resStates.data || []);
      }
      setFormData((p) => ({ ...p, state: tour.state || "" }));

      // fetch destinations for top-level
      if (tour.country && tour.state) {
        const resDest = await API.get(
          `/purchaser/destinationsByCountryAndState/${tour.country}/${tour.state}`
        );
        setDestinations(resDest.data || []);
      }
      setFormData((p) => ({ ...p, destination: tour.destination || "" }));

      // days/segments
      const builtDays = await Promise.all(
        (tour.days || []).map(async (day) => {
          const dateValue = day.date ? day.date.slice(0, 10) : "";

          // Backward compatibility (old shape without segments)
          const rawSegments =
            Array.isArray(day.segments) && day.segments.length
              ? day.segments
              : [
                  {
                    country: day.country,
                    state: day.state,
                    destination: day.destination,
                    trip: day.trip,
                    selectedAddon: day.selectedAddon,
                    selectedActivities: day.selectedActivity ? [day.selectedActivity] : [],
                  },
                ];

          const segments = await Promise.all(
            rawSegments.map(async (seg) => {
              const segment = {
                country: seg.country || "",
                state: seg.state || "",
                destination: seg.destination || "",
                trip: seg.trip || "",
                selectedAddon: seg.selectedAddon || "",
                selectedActivities: Array.isArray(seg.selectedActivities) ? seg.selectedActivities : [],
                states: [],
                destinations: [],
                trips: [],
                addonTrips: [],
                activities: [],
              };

              try {
                if (segment.country) {
                  const rs = await API.get(`/purchaser/states/${segment.country}`);
                  segment.states = rs.data || [];
                }
                if (segment.country && segment.state) {
                  const rd = await API.get(
                    `/purchaser/destinationsByCountryAndState/${segment.country}/${segment.state}`
                  );
                  segment.destinations = rd.data || [];
                }
                if (segment.country && segment.state && segment.destination) {
                  const rt = await API.get(
                    `/purchaser/tripsByLocation/${segment.country}/${segment.state}/${segment.destination}`
                  );
                  segment.trips = rt.data || [];
                }
                if (segment.trip) {
                  const rdet = await API.get(`/purchaser/tripDetails/${segment.trip}`);
                  segment.addonTrips = rdet.data.addonTrips || [];
                  segment.activities = rdet.data.activities || [];
                }
              } catch (e) {
                console.error("Segment prefill failed", e);
              }

              return segment;
            })
          );

          return {
            expanded: false,
            date: dateValue,
            segments: segments.length ? segments : [emptySegment()],
          };
        })
      );

      setDays(builtDays);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to prepare edit form.", err);
      toast.error("Failed to prepare edit form.");
    }
  };

  // ---------- SUBMIT ----------
  const handleCreateGroupTour = async () => {
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
        startDate: "Start Date is required",
        totalPax: "Total Pax is required",
      };

      for (const [k, msg] of Object.entries(required)) {
        if (!String(formData[k] || "").trim()) {
          toast.error(msg);
          return;
        }
      }

      const pax = Number(formData.totalPax);
      if (!Number.isFinite(pax) || pax <= 0) {
        toast.error("Total Pax must be greater than 0");
        return;
      }

      if (!includes.length) return toast.error("At least one Include is required.");
      if (!excludes.length) return toast.error("At least one Exclude is required.");
      if (!days.length) return toast.error("At least one day is required.");
      if (days.length !== Number(formData.totalDays)) {
        return toast.error(`You must provide exactly ${formData.totalDays} day(s) of details.`);
      }
      if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
        return toast.error("Total Nights should be exactly one less than Total Days.");
      }

      // validate segments
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
        }
      }

      const payload = {
        ...formData,
        includes,
        excludes,
        days: days.map((d) => ({
          segments: d.segments.map((s) => ({
            country: s.country || undefined,
            state: s.state || undefined,
            destination: s.destination || undefined,
            trip: s.trip || undefined,
            selectedAddon: s.selectedAddon || undefined,
            selectedActivities: Array.isArray(s.selectedActivities) ? s.selectedActivities.filter(Boolean) : [],
          })),
        })),
      };

      if (currentlyEditingTourId) {
        await API.put(`/purchaser/updateGroupTour/${currentlyEditingTourId}`, payload);
        toast.success("Group tour updated successfully!");
        setCurrentlyEditingTourId(null);
      } else {
        await API.post("/purchaser/createGroupTour", payload);
        toast.success("Group tour created successfully!");
      }

      // Reset after success
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
        startDate: "",
        netCost: "",
        pricePerPax: "",
        totalPax: "",
        riskAmount: "",
      });
      setIncludes([]);
      setExcludes([]);
      setDays([]);
      setStates([]);
      setDestinations([]);
      await fetchGroupTours();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save group tour.");
    }
  };

  // -------- Clear prefill (edit → create reset) --------
  const clearAllPrefill = () => {
    setCurrentlyEditingTourId(null);
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
      startDate: "",
      netCost: "",
      pricePerPax: "",
      totalPax: "",
      riskAmount: "",
    });
    setIncludes([]);
    setExcludes([]);
    setDays([]);
    setStates([]);
    setDestinations([]);
  };

  // -------- UI helpers (same premium style family) --------
  const pillBtnBase =
    "inline-flex items-center justify-center rounded-2xl transition shadow-sm hover:shadow-md";
  const iconBtnPurple =
    "inline-flex items-center justify-center w-11 h-11 rounded-2xl text-white font-bold " +
    "shadow-[0_12px_28px_rgba(133,112,238,0.35)] hover:opacity-95 active:scale-[0.99] transition";
  const iconBtnRed =
    "inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 shadow-sm transition";

  const inputBase =
    "w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm focus:ring-2 transition";
  const labelMini = "text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1";

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
                Create Group Tour
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Build multi-day group tours with multi-segment itinerary, add-ons, activities, and BO access.
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentlyEditingTourId && (
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
                style={{
                  background: `${THEME}12`,
                  color: THEME,
                  borderColor: `${THEME}30`,
                }}
              >
                <ReceiptText size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* FORM CARD */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    {currentlyEditingTourId ? "Edit group tour" : "Create group tour"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Fill tour meta, includes/excludes, then add day-wise itinerary segments.
                  </div>
                </div>

                {currentlyEditingTourId && (
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

              <div className="p-5 space-y-6 bg-gradient-to-b from-white to-purple-50/40">
                {/* Top-level filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className={`${labelMini} flex items-center gap-2`}>
                      <MapPin size={12} style={{ color: THEME }} />
                      Country
                    </div>
                    <Select
                      styles={selectStyles}
                      options={countryOptions}
                      isClearable
                      isDisabled={!!currentlyEditingTourId}
                      placeholder="Select Country"
                      value={countryOptions.find((o) => o.value === formData.country) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, country: opt?.value || "" }))}
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <div className={`${labelMini} flex items-center gap-2`}>
                      <MapPin size={12} style={{ color: THEME }} />
                      State
                    </div>
                    <Select
                      styles={selectStyles}
                      options={stateOptions}
                      isClearable
                      isDisabled={!!currentlyEditingTourId || !formData.country}
                      placeholder="Select State"
                      value={stateOptions.find((o) => o.value === formData.state) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, state: opt?.value || "" }))}
                      menuPortalTarget={document.body}
                    />
                    {!formData.country && (
                      <div className="mt-1 text-xs text-slate-400">Select country first to enable states.</div>
                    )}
                  </div>

                  <div>
                    <div className={`${labelMini} flex items-center gap-2`}>
                      <MapPin size={12} style={{ color: THEME }} />
                      Destination
                    </div>
                    <Select
                      styles={selectStyles}
                      options={destinationOptions}
                      isClearable
                      isDisabled={!!currentlyEditingTourId || !formData.state}
                      placeholder="Select Destination"
                      value={destinationOptions.find((o) => o.value === formData.destination) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, destination: opt?.value || "" }))}
                      menuPortalTarget={document.body}
                    />
                    {!formData.state && (
                      <div className="mt-1 text-xs text-slate-400">Select state first to enable destinations.</div>
                    )}
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className={`${labelMini} flex items-center gap-2`}>
                      <ListChecks size={12} style={{ color: THEME }} />
                      Tour name
                    </div>
                    <input
                      className={inputBase}
                      style={{ "--tw-ring-color": THEME }}
                      disabled={!!currentlyEditingTourId}
                      placeholder="Tour Name"
                      value={formData.tourName}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          tourName: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <div className={labelMini}>Article number</div>
                    <input
                      className={`${inputBase} bg-slate-100 border-slate-200 cursor-not-allowed`}
                      readOnly
                      placeholder="Auto-generated after create"
                      value={formData.articleNumber}
                    />
                  </div>

                  <div>
                    <div className={labelMini}>Category</div>
                    <Select
                      styles={selectStyles}
                      isClearable
                      isDisabled={!!currentlyEditingTourId}
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
                    <div className={labelMini}>Start date</div>
                    <input
                      type="date"
                      className={inputBase}
                      style={{ "--tw-ring-color": THEME }}
                      value={formData.startDate}
                      onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className={labelMini}>Pickup point</div>
                    <input
                      className={inputBase}
                      style={{ "--tw-ring-color": THEME }}
                      placeholder="Enter Pickup Point"
                      value={formData.pickupPoint}
                      onChange={(e) => setFormData((p) => ({ ...p, pickupPoint: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className={labelMini}>Drop-off point</div>
                    <input
                      className={inputBase}
                      style={{ "--tw-ring-color": THEME }}
                      placeholder="Enter Drop Off Point"
                      value={formData.dropOffPoint}
                      onChange={(e) => setFormData((p) => ({ ...p, dropOffPoint: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className={`${labelMini} flex items-center gap-2`}>
                      <CalendarClock size={12} style={{ color: THEME }} />
                      Total days
                    </div>
                    <input
                      type="number"
                      min={1}
                      className={inputBase}
                      style={{ "--tw-ring-color": THEME }}
                      value={formData.totalDays}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value || "1", 10));
                        setFormData((p) => ({ ...p, totalDays: String(val) }));
                      }}
                    />
                  </div>

                  <div>
                    <div className={labelMini}>Total nights</div>
                    <input
                      className={inputBase}
                      style={{ "--tw-ring-color": THEME }}
                      placeholder="Enter Total Nights"
                      value={formData.totalNights}
                      onChange={(e) => setFormData((p) => ({ ...p, totalNights: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className={labelMini}>Net cost (BO)</div>
                    <input
                      readOnly
                      className={`${inputBase} bg-slate-100 border-slate-200 cursor-not-allowed`}
                      placeholder="Net Cost"
                      value={formData.netCost}
                      onChange={(e) => setFormData((p) => ({ ...p, netCost: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className={labelMini}>Price per pax</div>
                    <input
                      readOnly
                      className={`${inputBase} bg-slate-100 border-slate-200 cursor-not-allowed`}
                      placeholder="Price per Pax"
                      value={formData.pricePerPax}
                      onChange={(e) => setFormData((p) => ({ ...p, pricePerPax: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className={`${labelMini} flex items-center gap-2`}>
                      <Users size={12} style={{ color: THEME }} />
                      Total pax
                    </div>
                    <input
                      className={inputBase}
                      style={{ "--tw-ring-color": THEME }}
                      placeholder="Total Pax"
                      value={formData.totalPax}
                      onChange={(e) => setFormData((p) => ({ ...p, totalPax: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className={labelMini}>Risk amount</div>
                    <input
                      readOnly
                      className={`${inputBase} bg-slate-100 border-slate-200 cursor-not-allowed`}
                      placeholder="Risk Amount"
                      value={formData.riskAmount}
                      onChange={(e) => setFormData((p) => ({ ...p, riskAmount: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Includes / Excludes adders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Includes</div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        id="includeInput"
                        className={`${inputBase} h-11`}
                        style={{ "--tw-ring-color": THEME }}
                        placeholder="Add to Includes"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleAddItem(
                            document.getElementById("includeInput").value,
                            setIncludes,
                            includes,
                            "includeInput"
                          )
                        }
                        className={iconBtnPurple}
                        style={{ background: THEME }}
                        title="Add include"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {includes.map((tag, i) => (
                        <span
                          key={i}
                          className="relative group bg-white/70 backdrop-blur-md text-slate-800
                            px-4 py-2 rounded-2xl flex items-center gap-3
                            border border-slate-200 shadow-sm hover:shadow-md
                            transition-all"
                        >
                          <span className="font-semibold text-sm">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(i, setIncludes, includes)}
                            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center
                              rounded-full bg-[#8570EE] text-white font-bold
                              shadow-md hover:opacity-95 transition"
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {includes.length === 0 && <p className="text-xs text-slate-400 italic">No includes added yet</p>}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Excludes</div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        id="excludeInput"
                        className={`${inputBase} h-11`}
                        style={{ "--tw-ring-color": THEME }}
                        placeholder="Add to Excludes"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleAddItem(
                            document.getElementById("excludeInput").value,
                            setExcludes,
                            excludes,
                            "excludeInput"
                          )
                        }
                        className={iconBtnPurple}
                        style={{ background: THEME }}
                        title="Add exclude"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {excludes.map((tag, i) => (
                        <span
                          key={i}
                          className="relative group bg-white/70 backdrop-blur-md text-slate-800
                            px-4 py-2 rounded-2xl flex items-center gap-3
                            border border-slate-200 shadow-sm hover:shadow-md
                            transition-all"
                        >
                          <span className="font-semibold text-sm">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(i, setExcludes, excludes)}
                            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center
                              rounded-full bg-[#8570EE] text-white font-bold
                              shadow-md hover:opacity-95 transition"
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {excludes.length === 0 && <p className="text-xs text-slate-400 italic">No excludes added yet</p>}
                    </div>
                  </div>
                </div>

                {/* Days + segments */}
                <div className="rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-4 md:p-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Itinerary</div>
                      <div className="mt-1 text-sm text-slate-500">
                        Expand a day to add one or more segments (location → trip → addon → activities).
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Days: <b className="text-slate-800">{days.length || 0}</b>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {days.map((day, i) => (
                      <div
                        key={i}
                        className="rounded-[22px] border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 shadow-sm overflow-hidden"
                      >
                        {/* Day header */}
                        <div className="px-4 py-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleDayExpand(i)}
                            className="flex items-center gap-3 min-w-0"
                            title={day.expanded ? "Collapse" : "Expand"}
                          >
                            <span
                              className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                              {day.expanded ? (
                                <ChevronDown className="w-5 h-5 text-slate-700" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-700" />
                              )}
                            </span>

                            <div className="min-w-0 text-left">
                              <div className="text-sm font-extrabold text-slate-900 truncate">
                                Day {i + 1}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {day.date ? `Date: ${day.date}` : "Date auto-fills from Start Date"}
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveDay(i)}
                            className="
                              inline-flex items-center justify-center
                              w-10 h-10 rounded-2xl
                              border border-slate-200
                              bg-white hover:bg-red-50
                              text-slate-600 hover:text-red-600
                              shadow-sm transition
                            "
                            title="Remove day"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Day content */}
                        {day.expanded && (
                          <div className="px-4 pb-4 space-y-4">
                            {day.segments.map((seg, j) => {
                              const countryOpts = countryOptions;
                              const stateOpts = toOptions(seg.states);
                              const destOpts = toOptions(seg.destinations);
                              const tripOpts = toOptions(seg.trips, "tripName");
                              const addonOpts = toOptions(seg.addonTrips, "tripName");
                              const actOpts = toOptions(seg.activities, "tripName");

                              return (
                                <div
                                  key={j}
                                  className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-4"
                                >
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                      Segment {j + 1}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {j === 0 ? (
                                        <button
                                          type="button"
                                          onClick={() => addSegment(i)}
                                          className={iconBtnPurple}
                                          style={{ background: THEME }}
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

                                  {/* Country / State / Destination */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <div className={labelMini}>Country</div>
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
                                      <div className={labelMini}>State</div>
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
                                      <div className={labelMini}>Destination</div>
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

                                  {/* Trip + clear */}
                                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                                    <div>
                                      <div className={labelMini}>Trip</div>
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
                                      className="
                                        inline-flex items-center justify-center
                                        h-11 px-4 rounded-2xl
                                        border border-red-200
                                        bg-red-50 hover:bg-red-100
                                        text-red-700 font-extrabold
                                        shadow-sm transition
                                      "
                                    >
                                      Clear
                                    </button>
                                  </div>

                                  {/* Addon Trip + clear */}
                                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                                    <div>
                                      <div className={labelMini}>Add-on trip</div>
                                      <Select
                                        styles={selectStyles}
                                        options={addonOpts}
                                        isClearable
                                        isDisabled={!seg.trip}
                                        placeholder="Add-on Trip"
                                        value={addonOpts.find((o) => o.value === seg.selectedAddon) || null}
                                        onChange={(opt) =>
                                          updateSegmentField(i, j, "selectedAddon", opt?.value || "")
                                        }
                                        menuPortalTarget={document.body}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => clearSegmentTarget(i, j, "selectedAddon")}
                                      className="
                                        inline-flex items-center justify-center
                                        h-11 px-4 rounded-2xl
                                        border border-red-200
                                        bg-red-50 hover:bg-red-100
                                        text-red-700 font-extrabold
                                        shadow-sm transition
                                      "
                                    >
                                      Clear
                                    </button>
                                  </div>

                                  {/* Activities (MULTI) + clear */}
                                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                                    <div>
                                      <div className={labelMini}>Activities</div>
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
                                      className="
                                        inline-flex items-center justify-center
                                        h-11 px-4 rounded-2xl
                                        border border-red-200
                                        bg-red-50 hover:bg-red-100
                                        text-red-700 font-extrabold
                                        shadow-sm transition
                                      "
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleCreateGroupTour}
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
                  {currentlyEditingTourId ? "Update Group Tour" : "Create Group Tour"}
                </button>
              </div>
            </div>

            {/* TABLE CARD */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">Group Tours</div>
                  <div className="mt-1 text-sm text-slate-500">Search and manage booking order</div>
                </div>

                <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[360px]">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by Group Tour Name..."
                    className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                  />
                </div>
              </div>

              <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-sm text-left text-slate-700 min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <th className="px-5 py-3">Sl No</th>
                      <th className="px-5 py-3">Tour Name</th>
                      <th className="px-5 py-3">Article Number</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Start Date</th>
                      <th className="px-5 py-3 text-center">BO</th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupTours.length > 0 ? (
                      groupTours.map((tour, idx) => (
                        <tr
                          key={tour._id}
                          className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                        >
                          <td className="px-5 py-3 font-semibold">{(page - 1) * 3 + idx + 1}</td>
                          <td className="px-5 py-3 font-semibold">{tour.tourName || "—"}</td>
                          <td className="px-5 py-3 font-semibold">{tour.articleNumber || "—"}</td>
                          <td className="px-5 py-3 font-semibold">{tour.category || "—"}</td>
                          <td className="px-5 py-3 font-semibold">
                            {tour.startDate ? new Date(tour.startDate).toLocaleDateString("en-GB") : "—"}
                          </td>

                          <td className="px-5 py-3 text-center">
                            <button
                              type="button"
                              title={tour.boCreatedStatus ? "View Group Tour Details" : "Booking Order"}
                              className="
                                inline-flex items-center justify-center
                                h-9 w-9 rounded-2xl
                                border border-slate-200
                                bg-white/80 hover:bg-white
                                shadow-sm hover:shadow-md transition
                                text-slate-700
                              "
                              onClick={() => handleBoClick(tour)}
                            >
                              <ReceiptText className="w-4 h-4" style={{ color: THEME }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                          No tours found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination (premium feel) */}
              <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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

        {/* VIEW-ONLY MODAL FOR ACTIVE GROUP TOUR (same logic, premium shell) */}
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
      className="
        relative
        w-full max-w-6xl mx-3
        rounded-[28px]
        border border-white/25
        shadow-[0_30px_90px_rgba(15,23,42,0.55)]
        bg-white/92 backdrop-blur-2xl
        overflow-hidden
        max-h-[90vh]
        flex flex-col
      "
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
      />

      {/* Modal header */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-white/70">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Group Tour Overview
          </div>
          <div className="mt-1 text-xl font-extrabold text-slate-900 truncate">
            {viewTour?.tourName || "Group Tour"}
          </div>
          <div className="text-xs mt-1 text-slate-600 space-x-2">
            <span>
              Article: <b>{viewTour?.articleNumber || "-"}</b>
            </span>
            <span>•</span>
            <span>
              Category: <b>{viewTour?.category || "-"}</b>
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          {/* ✅ clickable ACTIVE/INACTIVE */}
          <button
            type="button"
            disabled={statusUpdating}
            onClick={toggleActiveStatus}
            className={[
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm transition",
              viewTour?.activeStatus
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
              statusUpdating ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
            title="Click to toggle Active/Inactive"
          >
            {statusUpdating
              ? "Updating..."
              : viewTour?.activeStatus
              ? "ACTIVE"
              : "INACTIVE"}
          </button>

          <button
            onClick={() => {
              setViewModalOpen(false);
              setViewTour(null);
            }}
            className="
              w-10 h-10 rounded-2xl
              bg-white border border-slate-200
              shadow-sm hover:shadow-md hover:bg-slate-50
              flex items-center justify-center
              text-slate-700 text-xl font-bold
            "
          >
            ×
          </button>
        </div>
      </div>

      {/* Modal body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-slate-50/60">
        {viewLoading || !viewTour ? (
          <div className="w-full flex items-center justify-center py-10 text-slate-500">
            Loading tour details…
          </div>
        ) : (
          <>
            {(() => {
              const t = viewTour;

              const topCountry =
                typeof t.country === "object" ? t.country?.name : t.country;
              const topState =
                typeof t.state === "object" ? t.state?.name : t.state;
              const topDest =
                typeof t.destination === "object"
                  ? t.destination?.name
                  : t.destination;

              const netCost = Number(t?.netCost || 0);
              const margin = Number(t?.margin || 0);
              const netItinerary = netCost + margin;

              const totalAdvance = Number(t?.totalAdvance || 0);
              const advancePerPax = Number(t?.advancePerPax || 0);

              const seatsBooked = Number(t?.seatsBooked || 0);
              const seatsAvailable = Number(t?.seatsAvailable || 0);

              return (
                <>
                  {/* TOP SUMMARY */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">
                        Location
                      </div>
                      <div className="mt-1 text-sm text-slate-700 space-y-0.5">
                        <div>
                          <span className="font-semibold">Country: </span>
                          {topCountry || "-"}
                        </div>
                        <div>
                          <span className="font-semibold">State: </span>
                          {topState || "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Destination: </span>
                          {topDest || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">
                        Duration & Pax
                      </div>
                      <div className="mt-1 text-sm text-slate-700 space-y-0.5">
                        <div>
                          <span className="font-semibold">Days / Nights: </span>
                          {(t.totalDays ?? "-") +
                            " / " +
                            (t.totalNights ?? "-")}
                        </div>
                        <div>
                          <span className="font-semibold">Start Date: </span>
                          {t.startDate
                            ? new Date(t.startDate).toLocaleDateString("en-GB")
                            : "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Total Pax: </span>
                          {t.totalPax ?? "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Seats Booked: </span>
                          {seatsBooked} / {seatsAvailable}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">
                        Pricing
                      </div>
                      <div className="mt-1 text-sm text-slate-700 space-y-0.5">
                        <div>
                          <span className="font-semibold">Net Cost (BO): </span>
                          {t.netCost != null ? t.netCost : "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Margin: </span>
                          {t.margin != null ? t.margin : "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Net Itinerary: </span>
                          {netItinerary || 0}
                        </div>
                        {/* <div>
                          <span className="font-semibold">Price / Pax: </span>
                          {t.pricePerPax != null ? t.pricePerPax : "-"}
                        </div> */}
                        <div>
                          <span className="font-semibold">Net Advance: </span>
                          {totalAdvance || 0}
                        </div>
                        {/* <div>
                          <span className="font-semibold">Advance / Pax: </span>
                          {advancePerPax || 0}
                        </div> */}
                        {/* <div>
                          <span className="font-semibold">Risk Amount: </span>
                          {t.riskAmount != null ? t.riskAmount : "-"}
                        </div> */}
                      </div>
                    </div>
                  </div>

                  {/* Includes / Excludes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-extrabold text-slate-900 mb-2">
                        Includes
                      </h4>
                      {Array.isArray(t.includes) && t.includes.length ? (
                        <div className="flex flex-wrap gap-2">
                          {t.includes.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-[rgba(133,112,238,0.08)] text-slate-800 border border-[rgba(133,112,238,0.2)] text-xs"
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
                      <h4 className="text-sm font-extrabold text-slate-900 mb-2">
                        Excludes
                      </h4>
                      {Array.isArray(t.excludes) && t.excludes.length ? (
                        <div className="flex flex-wrap gap-2">
                          {t.excludes.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs"
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

                  {/* Itinerary + BO details */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-extrabold text-slate-900 mb-3">
                      Day-wise Itinerary & Booking Order
                    </h4>

                    {Array.isArray(t.days) && t.days.length ? (
                      <div className="space-y-4">
                        {t.days.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-extrabold text-slate-900">
                                  {day.dayLabel || `Day ${dIdx + 1}`}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {day.date
                                    ? new Date(day.date).toLocaleDateString(
                                        "en-GB"
                                      )
                                    : "-"}
                                </div>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {Array.isArray(day.segments)
                                  ? `${day.segments.length} segment(s)`
                                  : "0 segment"}
                              </div>
                            </div>

                            {/* segments */}
                            {Array.isArray(day.segments) &&
                              day.segments.map((seg, sIdx) => {
                                const segCountry =
                                  typeof seg.country === "object"
                                    ? seg.country?.name
                                    : seg.country;
                                const segState =
                                  typeof seg.state === "object"
                                    ? seg.state?.name
                                    : seg.state;
                                const segDest =
                                  typeof seg.destination === "object"
                                    ? seg.destination?.name
                                    : seg.destination;
                                const segTrip =
                                  typeof seg.trip === "object"
                                    ? seg.trip?.tripName
                                    : seg.trip;
                                const segAddon =
                                  typeof seg.selectedAddon === "object"
                                    ? seg.selectedAddon?.addontripName
                                    : seg.selectedAddon;

                                const segActs = Array.isArray(
                                  seg.selectedActivities
                                )
                                  ? seg.selectedActivities
                                      .map((a) =>
                                        typeof a === "object"
                                          ? a.activityName
                                          : a
                                      )
                                      .join(", ")
                                  : "";

                                return (
                                  <div
                                    key={sIdx}
                                    className="mt-2 rounded-xl bg-white border border-slate-200 p-3 space-y-3"
                                  >
                                    <div className="text-xs font-extrabold text-slate-600">
                                      Segment {sIdx + 1}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-700">
                                      <div>
                                        <div className="font-semibold">
                                          Country
                                        </div>
                                        <div>{segCountry || "-"}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold">
                                          State
                                        </div>
                                        <div>{segState || "-"}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold">
                                          Destination
                                        </div>
                                        <div>{segDest || "-"}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold">Trip</div>
                                        <div>{segTrip || "-"}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold">
                                          Add-on Trip
                                        </div>
                                        <div>{segAddon || "-"}</div>
                                      </div>
                                      <div>
                                        <div className="font-semibold">
                                          Activities
                                        </div>
                                        <div>{segActs || "-"}</div>
                                      </div>
                                    </div>

                                    {/* BO blocks */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                      {Array.isArray(seg.boTripVehicles) &&
                                        seg.boTripVehicles.length > 0 && (
                                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                                            <div className="font-semibold text-slate-700 mb-1">
                                              Trip Vehicles
                                            </div>
                                            <div className="space-y-1">
                                              {seg.boTripVehicles.map((v) => {
                                                const boUnit =
                                                  Number(v.basePrice || 0) ||
                                                  0;
                                                const perc =
                                                  Number(v.percentage || 0) ||
                                                  0;
                                                const itinUnit = Math.round(
                                                  boUnit * (1 + perc / 100)
                                                );
                                                const qty = Number(v.qty || 0);

                                                const advUnit = Number(
                                                  v.advanceUnit || 0
                                                );
                                                const advTotal =
                                                  Number(v.advanceTotal || 0) ||
                                                  advUnit * qty;

                                                const vehicleName =
                                                  v.vehicleName ||
                                                  v.vehicle ||
                                                  "-";
                                                const vendorName =
                                                  v.vendorName || "-";

                                                return (
                                                  <div
                                                    key={v._id}
                                                    className="flex justify-between border-b border-dashed border-slate-200 pb-1 last:border-none last:pb-0"
                                                  >
                                                    <div>
                                                      <div className="font-medium">
                                                        {v.category || "-"}
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        Vehicle:{" "}
                                                        <b>{vehicleName}</b> •
                                                        Vendor:{" "}
                                                        <b>{vendorName}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        BO: {boUnit} • %{perc} •
                                                        Itin Unit: {itinUnit} •
                                                        Adv Unit: {advUnit}
                                                      </div>
                                                    </div>

                                                    <div className="text-right">
                                                      <div>
                                                        Qty: <b>{qty}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        BO Total:{" "}
                                                        <b>{boUnit * qty}</b>
                                                        <br />
                                                        Itin Total:{" "}
                                                        <b>{itinUnit * qty}</b>
                                                        <br />
                                                        Adv Total:{" "}
                                                        <b>{advTotal}</b>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                      {Array.isArray(seg.boAddonVehicles) &&
                                        seg.boAddonVehicles.length > 0 && (
                                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                                            <div className="font-semibold text-slate-700 mb-1">
                                              Add-on Vehicles
                                            </div>
                                            <div className="space-y-1">
                                              {seg.boAddonVehicles.map((v) => {
                                                const boUnit =
                                                  Number(v.basePrice || 0) ||
                                                  0;
                                                const perc =
                                                  Number(v.percentage || 0) ||
                                                  0;
                                                const itinUnit = Math.round(
                                                  boUnit * (1 + perc / 100)
                                                );
                                                const qty = Number(v.qty || 0);

                                                const advUnit = Number(
                                                  v.advanceUnit || 0
                                                );
                                                const advTotal =
                                                  Number(v.advanceTotal || 0) ||
                                                  advUnit * qty;

                                                const vehicleName =
                                                  v.vehicleName ||
                                                  v.vehicle ||
                                                  "-";
                                                const vendorName =
                                                  v.vendorName || "-";

                                                return (
                                                  <div
                                                    key={v._id}
                                                    className="flex justify-between border-b border-dashed border-slate-200 pb-1 last:border-none last:pb-0"
                                                  >
                                                    <div>
                                                      <div className="font-medium">
                                                        {v.category || "-"}
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        Vehicle:{" "}
                                                        <b>{vehicleName}</b> •
                                                        Vendor:{" "}
                                                        <b>{vendorName}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        BO: {boUnit} • %{perc} •
                                                        Itin Unit: {itinUnit} •
                                                        Adv Unit: {advUnit}
                                                      </div>
                                                    </div>

                                                    <div className="text-right">
                                                      <div>
                                                        Qty: <b>{qty}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        BO Total:{" "}
                                                        <b>{boUnit * qty}</b>
                                                        <br />
                                                        Itin Total:{" "}
                                                        <b>{itinUnit * qty}</b>
                                                        <br />
                                                        Adv Total:{" "}
                                                        <b>{advTotal}</b>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                      {Array.isArray(seg.boFoods) &&
                                        seg.boFoods.length > 0 && (
                                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                                            <div className="font-semibold text-slate-700 mb-1">
                                              Foods
                                            </div>
                                            <div className="space-y-1">
                                              {seg.boFoods.map((f) => {
                                                const boUnit =
                                                  Number(f.price || 0) || 0;
                                                const perc =
                                                  Number(f.percent || 0) || 0;
                                                const itinUnit =
                                                  f.itineraryUnit != null &&
                                                  !Number.isNaN(f.itineraryUnit)
                                                    ? Number(f.itineraryUnit)
                                                    : Math.round(
                                                        boUnit *
                                                          (1 + perc / 100)
                                                      );
                                                const qty = Number(
                                                  f.qty || 0
                                                );

                                                const advUnit = Number(
                                                  f.advanceUnit || 0
                                                );
                                                const advTotal =
                                                  Number(f.advanceTotal || 0) ||
                                                  advUnit * qty;

                                                const vendorName =
                                                  f.vendorName || "-";

                                                return (
                                                  <div
                                                    key={f._id}
                                                    className="flex justify-between border-b border-dashed border-slate-200 pb-1 last:border-none last:pb-0"
                                                  >
                                                    <div>
                                                      <div className="font-medium">
                                                        {f.foodName || "-"}
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        Vendor:{" "}
                                                        <b>{vendorName}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        {f.mealCategory} •{" "}
                                                        {f.mealType}
                                                        <br />
                                                        BO: {boUnit} • % {perc} •
                                                        Itin Unit: {itinUnit} •
                                                        Adv Unit: {advUnit}
                                                      </div>
                                                    </div>
                                                    <div className="text-right">
                                                      <div>
                                                        Qty: <b>{qty}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        BO Total:{" "}
                                                        <b>{boUnit * qty}</b>
                                                        <br />
                                                        Itin Total:{" "}
                                                        <b>{itinUnit * qty}</b>
                                                        <br />
                                                        Adv Total:{" "}
                                                        <b>{advTotal}</b>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                      {Array.isArray(seg.boActivities) &&
                                        seg.boActivities.length > 0 && (
                                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                                            <div className="font-semibold text-slate-700 mb-1">
                                              Activities
                                            </div>
                                            <div className="space-y-1">
                                              {seg.boActivities.map((a) => {
                                                const boUnit =
                                                  Number(a.price || 0) || 0;
                                                const perc =
                                                  Number(a.percentage || 0) ||
                                                  0;
                                                const itinUnit =
                                                  a.itineraryUnit != null &&
                                                  !Number.isNaN(a.itineraryUnit)
                                                    ? Number(a.itineraryUnit)
                                                    : Math.round(
                                                        boUnit *
                                                          (1 + perc / 100)
                                                      );
                                                const qty = Number(a.qty || 0);

                                                const advUnit = Number(
                                                  a.advanceUnit || 0
                                                );
                                                const advTotal =
                                                  Number(a.advanceTotal || 0) ||
                                                  advUnit * qty;

                                                const vendorName =
                                                  a.vendorName || "-";

                                                return (
                                                  <div
                                                    key={a._id}
                                                    className="flex justify-between border-b border-dashed border-slate-200 pb-1 last:border-none last:pb-0"
                                                  >
                                                    <div>
                                                      <div className="font-medium">
                                                        {a.name || "-"}
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        Vendor:{" "}
                                                        <b>{vendorName}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        BO: {boUnit} • % {perc} •
                                                        Itin Unit: {itinUnit} •
                                                        Adv Unit: {advUnit}
                                                      </div>
                                                    </div>
                                                    <div className="text-right">
                                                      <div>
                                                        Qty: <b>{qty}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        BO Total:{" "}
                                                        <b>{boUnit * qty}</b>
                                                        <br />
                                                        Itin Total:{" "}
                                                        <b>{itinUnit * qty}</b>
                                                        <br />
                                                        Adv Total:{" "}
                                                        <b>{advTotal}</b>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                      {Array.isArray(seg.boAccommodations) &&
                                        seg.boAccommodations.length > 0 && (
                                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 md:col-span-2">
                                            <div className="font-semibold text-slate-700 mb-1">
                                              Accommodations
                                            </div>
                                            <div className="space-y-1">
                                              {seg.boAccommodations.map((ac) => {
                                                const boUnit =
                                                  Number(ac.bo || 0) || 0;
                                                const itinUnit =
                                                  Number(ac.itinerary || 0) ||
                                                  0;
                                                const qty = Number(
                                                  ac.qty || 0
                                                );

                                                const advUnit = Number(
                                                  ac.advanceUnit || 0
                                                );
                                                const advTotal =
                                                  Number(ac.advanceTotal || 0) ||
                                                  advUnit * qty;

                                                const vendorName =
                                                  ac.vendorName || "-";

                                                return (
                                                  <div
                                                    key={ac._id}
                                                    className="flex justify-between border-b border-dashed border-slate-200 pb-1 last:border-none last:pb-0"
                                                  >
                                                    <div>
                                                      <div className="font-medium">
                                                        {ac.propertyName || "-"}
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        Vendor:{" "}
                                                        <b>{vendorName}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        {ac.hotelCategory} •{" "}
                                                        {ac.roomCategory} • Room:{" "}
                                                        {ac.roomTypeCode}
                                                        <br />
                                                        Commission:{" "}
                                                        {ac.commission || 0}% •
                                                        BO: {boUnit} • Itin:{" "}
                                                        {itinUnit} • Adv Unit:{" "}
                                                        {advUnit}
                                                      </div>
                                                    </div>
                                                    <div className="text-right">
                                                      <div>
                                                        Qty: <b>{qty}</b>
                                                      </div>
                                                      <div className="text-[11px] text-slate-500">
                                                        BO Total:{" "}
                                                        <b>{boUnit * qty}</b>
                                                        <br />
                                                        Itin Total:{" "}
                                                        <b>{itinUnit * qty}</b>
                                                        <br />
                                                        Adv Total:{" "}
                                                        <b>{advTotal}</b>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No day-wise details found.
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>

      {/* Modal footer */}
      <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-end">
        <button
          onClick={() => {
            setViewModalOpen(false);
            setViewTour(null);
          }}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
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

export default CreateGroupTour;
