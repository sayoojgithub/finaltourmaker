// // CustomTourItineraryModal.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   X,
//   CalendarClock,
//   MapPin,
//   CircleDot,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Minus,
//   Trash2,
//   Loader2,
//   Download,
//   Sparkles,
//   Gift,
//   BadgePercent,
// } from "lucide-react";
// import Select from "react-select";
// import API from "../../api";
// import { toast } from "react-toastify";

// /* ---------------- helpers ---------------- */
// const uid = () => Math.random().toString(36).slice(2, 10);
// const toYmd = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
// const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
// const asNum = (v) => {
//   const x = Number(v);
//   return Number.isFinite(x) ? x : 0;
// };
// const money = (n) => asNum(n).toLocaleString("en-IN");

// // ✅ stable key: day + segmentId (no index bugs)
// const keyFor = (dayIdx, segId) => `${dayIdx}-${segId}`;

// function formatDDMMYYYY(d) {
//   if (!d) return "-";
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return "-";
//   return dt.toLocaleDateString("en-GB"); // dd/mm/yyyy
// }

// /* ---------------- react-select helpers ---------------- */
// const toObjOptions = (arr, valueKey, labelKey) =>
//   (Array.isArray(arr) ? arr : []).map((x) => ({
//     value: x?.[valueKey],
//     label: x?.[labelKey] ?? "-",
//     raw: x,
//   }));

// const toStringOptions = (arr) =>
//   (Array.isArray(arr) ? arr : []).filter(Boolean).map((s) => ({
//     value: s,
//     label: s,
//   }));

// const findOption = (options, value) =>
//   (options || []).find((o) => String(o.value) === String(value)) || null;

// /* ---------------- qty component ---------------- */
// function Qty({ disabled, qty, onChange }) {
//   return (
//     <div className="flex items-center gap-2">
//       <button
//         type="button"
//         className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
//         disabled={disabled}
//         onClick={() => onChange(Math.max(0, (qty || 0) - 1))}
//         aria-label="decrement"
//       >
//         <Minus size={16} />
//       </button>
//       <div className="min-w-[3rem] text-center font-semibold">{qty || 0}</div>
//       <button
//         type="button"
//         className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
//         disabled={disabled}
//         onClick={() => onChange((qty || 0) + 1)}
//         aria-label="increment"
//       >
//         <Plus size={16} />
//       </button>
//     </div>
//   );
// }

// function IconButton({ children, onClick, danger, title }) {
//   return (
//     <button
//       type="button"
//       className={[
//         "w-9 h-9 rounded-lg flex items-center justify-center",
//         danger
//           ? "bg-red-100 hover:bg-red-200 text-red-600"
//           : "bg-gray-100 hover:bg-gray-200 text-gray-700",
//       ].join(" ")}
//       onClick={onClick}
//       title={title}
//     >
//       {children}
//     </button>
//   );
// }

// /* ---------------- small UI (same as your fixed tour style) ---------------- */
// function GlassChip({ children, theme }) {
//   return (
//     <span
//       className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border shadow-sm"
//       style={{
//         borderColor: `${theme}33`,
//         background: `${theme}10`,
//         color: theme,
//       }}
//     >
//       {children}
//     </span>
//   );
// }

// function MiniStat({ icon: Icon, label, value, theme }) {
//   return (
//     <div className="rounded-2xl p-4 bg-white/75 backdrop-blur-xl border border-white/55 shadow-[0_12px_40px_rgba(15,23,42,0.10)]">
//       <div className="flex items-center justify-between gap-3">
//         <div className="min-w-0">
//           <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
//             {label}
//           </div>
//           <div className="mt-1 text-sm font-extrabold text-slate-900 truncate">
//             {value}
//           </div>
//         </div>
//         <div
//           className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner shrink-0"
//           style={{
//             background: `${theme}10`,
//             color: theme,
//             borderColor: `${theme}25`,
//           }}
//         >
//           <Icon size={18} />
//         </div>
//       </div>
//     </div>
//   );
// }

// function SoftInput({
//   value,
//   onChange,
//   theme,
//   placeholder,
//   type = "text",
//   min = 0,
// }) {
//   return (
//     <input
//       type={type}
//       min={min}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2"
//       style={{ "--tw-ring-color": theme }}
//     />
//   );
// }

// /* ---------------- Point & Discount Modal ---------------- */
// function PointDiscountModal({
//   open,
//   theme,
//   loading,
//   onClose,
//   margin,
//   pointPercentage,
//   discountPercentage,
//   pax,
//   discountAmount,
//   setDiscountAmount,
// }) {
//   if (!open) return null;

//   const m = asNum(margin);
//   const pp = asNum(pointPercentage);
//   const dp = asNum(discountPercentage);
//   const p = asNum(pax);

//   const maxDiscount = useMemo(() => (m * dp) / 100, [m, dp]);
//   const disc = clamp(asNum(discountAmount), 0, maxDiscount || 0);

//   const points = useMemo(() => {
//     const effectiveMargin = Math.max(0, m - disc);
//     return ((effectiveMargin * pp) / 100 / 20) * p;
//   }, [m, disc, pp, p]);

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 z-[140] flex items-start sm:items-center justify-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <div className="absolute inset-0 bg-black/45" onClick={onClose} />
//         <motion.div
//           role="dialog"
//           aria-modal="true"
//           className="relative w-full max-w-xl mx-3 my-3 sm:my-8 rounded-[28px] border border-white/25 shadow-[0_30px_90px_rgba(15,23,42,0.55)] bg-white/92 backdrop-blur-2xl overflow-hidden max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-64px)] flex flex-col"
//           initial={{ y: 22, scale: 0.985, opacity: 0 }}
//           animate={{ y: 0, scale: 1, opacity: 1 }}
//           exit={{ y: 12, scale: 0.99, opacity: 0 }}
//           transition={{ type: "spring", stiffness: 175, damping: 18 }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div
//             className="h-2 w-full"
//             style={{ background: `linear-gradient(90deg, ${theme}, #c7bef9)` }}
//           />

//           <div className="px-4 sm:px-5 py-4 border-b border-white/40 bg-white/70">
//             <div className="flex items-start justify-between gap-3">
//               <div className="min-w-0">
//                 <div className="text-xs text-slate-500 flex items-center gap-2">
//                   <Sparkles size={14} style={{ color: theme }} />
//                   Point & Discount Options
//                 </div>
//                 <div className="mt-1 text-lg font-extrabold text-slate-900 truncate">
//                   Check benefit before discount
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="h-10 w-10 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white flex items-center justify-center shrink-0"
//                 aria-label="Close"
//               >
//                 <X size={18} className="text-slate-700" />
//               </button>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto overscroll-contain">
//             <div className="p-4 sm:p-5 bg-gradient-to-b from-white to-purple-50/60 space-y-4">
//               {loading ? (
//                 <div className="py-10 text-center text-sm text-slate-500">
//                   Loading options…
//                 </div>
//               ) : (
//                 <>
//                   <div className="grid grid-cols-1 gap-3">
//                     <MiniStat
//                       icon={Gift}
//                       theme={theme}
//                       label="You will get points"
//                       value={points ? points.toFixed(2) : "0.00"}
//                     />
//                     <MiniStat
//                       icon={BadgePercent}
//                       theme={theme}
//                       label="Maximum discount you can give"
//                       value={money(maxDiscount)}
//                     />
//                   </div>

//                   <div className="rounded-[24px] border border-white/55 bg-white/75 backdrop-blur-2xl shadow-[0_18px_55px_rgba(15,23,42,0.12)] p-4">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
//                           Discount amount
//                         </div>
//                         <div className="mt-1 text-sm font-extrabold text-slate-900">
//                           Enter discount to see updated points
//                         </div>
//                       </div>

//                       <GlassChip theme={theme}>
//                         Max:{" "}
//                         <span className="ml-1 font-mono">
//                           {money(maxDiscount)}
//                         </span>
//                       </GlassChip>
//                     </div>

//                     <div className="mt-3">
//                       <SoftInput
//                         type="number"
//                         min={0}
//                         theme={theme}
//                         value={discountAmount}
//                         onChange={(e) => {
//                           const v = e.target.value;
//                           if (v === "") return setDiscountAmount("");
//                           const num = asNum(v);
//                           setDiscountAmount(
//                             String(clamp(num, 0, maxDiscount || 0))
//                           );
//                         }}
//                         placeholder="0"
//                       />
//                       <div className="mt-2 text-[11px] text-slate-500">
//                         Points will be recalculated automatically.
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>

//           <div className="px-4 sm:px-5 py-4 border-t border-white/40 bg-white/70 flex items-center justify-end">
//             <button
//               type="button"
//               onClick={onClose}
//               className="h-10 px-4 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white text-sm font-extrabold text-slate-700"
//             >
//               Close
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// /* ===============================
//    MAIN
// ================================ */
// export default function CustomTourItineraryModal({
//   client,
//   brandColor,
//   onClose,
//   onCompleted,
// }) {
//   if (!client) return null;

//   const theme = brandColor || "#8570EE";

//   // react-select theme styles
//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 14,
//         borderColor: state.isFocused ? theme : "#e5e7eb",
//         boxShadow: state.isFocused ? `0 0 0 2px ${theme}22` : "none",
//         minHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? theme : "#d1d5db" },
//       }),
//       valueContainer: (b) => ({ ...b, padding: "0 12px" }),
//       input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
//       dropdownIndicator: (b) => ({
//         ...b,
//         color: "#6b7280",
//         ":hover": { color: "#4b5563" },
//       }),
//       menu: (b) => ({
//         ...b,
//         borderRadius: 14,
//         overflow: "hidden",
//         boxShadow: "0 18px 50px rgba(15,23,42,0.18)",
//         zIndex: 250,
//       }),
//       option: (b, s) => ({
//         ...b,
//         backgroundColor: s.isFocused
//           ? `${theme}14`
//           : s.isSelected
//           ? `${theme}22`
//           : "white",
//         color: "#222",
//       }),
//       placeholder: (b) => ({ ...b, color: "#6b7280" }),
//       singleValue: (b) => ({ ...b, color: "#111827" }),
//     }),
//     [theme]
//   );

//   // schedule follow-up
//   const [nextDate, setNextDate] = useState("");
//   const [nextTime, setNextTime] = useState("");
//   const [loadingReferral, setLoadingReferral] = useState(false);
//   const [loadingConfirm, setLoadingConfirm] = useState(false);

//   // day ui
//   const [dayIndex, setDayIndex] = useState(0);

//   // itinerary builder state
//   const [days, setDays] = useState([]);
//   const daysCount = Math.max(1, Number(client.numberOfDays || 1));
//   console.log(days, "dayssss buddyyy");
//   // catalogs
//   const [countries, setCountries] = useState([]);
//   const [statesByKey, setStatesByKey] = useState({});
//   const [destsByKey, setDestsByKey] = useState({});
//   const [tripsByKey, setTripsByKey] = useState({});
//   const [tripDetailsByKey, setTripDetailsByKey] = useState({}); // addons + activities

//   // pricing catalogs per segment
//   const [vehOptions, setVehOptions] = useState({});
//   const [addonVehOptions, setAddonVehOptions] = useState({});
//   const [foodOptions, setFoodOptions] = useState({});
//   const [actPricing, setActPricing] = useState({});
//   const [accOptions, setAccOptions] = useState({});

//   // editable lines per segment
//   const [vehLines, setVehLines] = useState({});
//   const [addonVehLines, setAddonVehLines] = useState({});
//   const [foodLines, setFoodLines] = useState({});
//   const [actLines, setActLines] = useState({});
//   const [accLines, setAccLines] = useState({});
//   console.log(vehLines, "vehicles");
//   console.log(addonVehLines, "addonvehicles");
//   console.log(foodLines, "food");
//   console.log(actLines, "activity");
//   console.log(accLines, "accommodation");
//   // ✅ Point/discount popup
//   const [pdOpen, setPdOpen] = useState(false);
//   const [pdLoading, setPdLoading] = useState(false);
//   const [pdData, setPdData] = useState({
//     pointPercentage: 0,
//     discountPercentage: 0,
//   });
//   const [discountAmount, setDiscountAmount] = useState("0");

//   // init days
//   useEffect(() => {
//     const start = client.startDate ? new Date(client.startDate) : new Date();
//     const init = Array.from({ length: daysCount }).map((_, i) => {
//       const d = new Date(start);
//       d.setDate(d.getDate() + i);
//       return {
//         dayLabel: `Day ${i + 1}`,
//         date: d.toISOString(),
//         segments: [
//           {
//             _id: uid(),
//             country: "",
//             state: "",
//             destination: "",
//             trip: "",
//             selectedAddon: "",
//             selectedActivities: [],
//           },
//         ],
//       };
//     });
//     setDays(init);
//     setDayIndex(0);

//     // reset discount when client changes
//     setDiscountAmount("0");
//     setPdOpen(false);
//   }, [client?._id]);

//   // load countries once
//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await API.get("/executive/countries");
//         setCountries(Array.isArray(data) ? data : []);
//       } catch (e) {
//         console.error(e);
//         toast.error("Failed to load countries");
//       }
//     })();
//   }, []);

//   const currentDay = days[dayIndex];

//   /* ---------------- ✅ FIX: Clear pricing ONLY (do NOT delete states/dests/trips) ---------------- */
//   const clearSegPricingOnly = (segKey) => {
//     const del = (setter) =>
//       setter((p) => {
//         const n = { ...p };
//         delete n[segKey];
//         return n;
//       });

//     // pricing catalogs
//     del(setVehOptions);
//     del(setAddonVehOptions);
//     del(setFoodOptions);
//     del(setActPricing);
//     del(setAccOptions);

//     // lines
//     del(setVehLines);
//     del(setAddonVehLines);
//     del(setFoodLines);
//     del(setActLines);
//     del(setAccLines);

//     // trip details (addons + activities)
//     del(setTripDetailsByKey);
//   };

//   /* ---------------- clear location chain (only when needed) ---------------- */
//   const clearSegLocationChain = (segKey) => {
//     const del = (setter) =>
//       setter((p) => {
//         const n = { ...p };
//         delete n[segKey];
//         return n;
//       });

//     del(setStatesByKey);
//     del(setDestsByKey);
//     del(setTripsByKey);
//   };

//   /* ---------------- segment helpers ---------------- */
//   const updateSegment = (dIdx, segId, next) => {
//     setDays((prev) =>
//       prev.map((d, i) => {
//         if (i !== dIdx) return d;
//         return {
//           ...d,
//           segments: (d.segments || []).map((s) =>
//             String(s._id) === String(segId) ? { ...s, ...next } : s
//           ),
//         };
//       })
//     );
//   };

//   const addSegment = (dIdx) => {
//     setDays((prev) =>
//       prev.map((d, i) => {
//         if (i !== dIdx) return d;
//         return {
//           ...d,
//           segments: [
//             ...(d.segments || []),
//             {
//               _id: uid(),
//               country: "",
//               state: "",
//               destination: "",
//               trip: "",
//               selectedAddon: "",
//               selectedActivities: [],
//             },
//           ],
//         };
//       })
//     );
//   };

//   const removeSegment = (dIdx, segId) => {
//     const segKey = keyFor(dIdx, segId);

//     // remove pricing & lines
//     clearSegPricingOnly(segKey);

//     // remove location lists for this segment
//     clearSegLocationChain(segKey);

//     // remove actual segment
//     setDays((prev) =>
//       prev.map((d, i) => {
//         if (i !== dIdx) return d;
//         const nextSegs = (d.segments || []).filter(
//           (s) => String(s._id) !== String(segId)
//         );
//         return { ...d, segments: nextSegs.length ? nextSegs : d.segments };
//       })
//     );
//   };

//   /* ---------------- location fetchers ---------------- */
//   const fetchStates = async (countryId, segKey) => {
//     if (!countryId) return;
//     try {
//       const { data } = await API.get(`/executive/states/${countryId}`);
//       setStatesByKey((p) => ({
//         ...p,
//         [segKey]: Array.isArray(data) ? data : [],
//       }));
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load states");
//     }
//   };

//   const fetchDestinations = async (countryId, stateId, segKey) => {
//     if (!countryId || !stateId) return;
//     try {
//       const { data } = await API.get(
//         `/executive/destinationsByCountryAndState/${countryId}/${stateId}`
//       );
//       setDestsByKey((p) => ({
//         ...p,
//         [segKey]: Array.isArray(data) ? data : [],
//       }));
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load destinations");
//     }
//   };

//   const fetchTrips = async (countryId, stateId, destinationId, segKey) => {
//     if (!countryId || !stateId || !destinationId) return;
//     try {
//       const { data } = await API.get(
//         `/executive/tripsByLocation/${countryId}/${stateId}/${destinationId}`
//       );
//       setTripsByKey((p) => ({
//         ...p,
//         [segKey]: Array.isArray(data) ? data : [],
//       }));
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load trips");
//     }
//   };

//   const fetchTripDetails = async (tripId, segKey) => {
//     if (!tripId) return;
//     try {
//       const { data } = await API.get(`/executive/tripDetails/${tripId}`);
//       setTripDetailsByKey((p) => ({
//         ...p,
//         [segKey]: data || { addonTrips: [], activities: [] },
//       }));
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load trip details");
//     }
//   };

//   /* ---------------- pricing fetchers ---------------- */
//   const fetchVehiclesForSeg = async (tripId, dateYmd, dIdx, segId) => {
//     const segKey = keyFor(dIdx, segId);
//     if (!tripId || !dateYmd) return;

//     try {
//       const { data } = await API.get(`/executive/tripVehicles/${tripId}`, {
//         params: { date: dateYmd },
//       });

//       setVehOptions((p) => ({ ...p, [segKey]: data }));

//       setVehLines((p) => {
//         const existing = p[segKey] || [];
//         if (!existing.length) return { ...p, [segKey]: [] };

//         const { options = {} } = data || {};
//         const updated = existing.map((line) => {
//           const vehicles = options[line.category] || [];
//           const match = vehicles.find(
//             (v) => String(v.vehicleId) === String(line.vehicleId)
//           );
//           if (!match) return line;
//           return {
//             ...line,
//             basePrice: match.basePrice ?? line.basePrice ?? 0,
//             percentage: match.percentage ?? line.percentage ?? 0,
//             vendorId: match.vendor ?? line.vendorId ?? null,
//           };
//         });
//         return { ...p, [segKey]: updated };
//       });
//     } catch (e) {
//       console.error("tripVehicles fetch failed", e);
//       toast.error("Failed to load vehicles for this segment.");
//     }
//   };

//   const fetchAddonVehiclesForSeg = async (
//     addonTripId,
//     dateYmd,
//     dIdx,
//     segId
//   ) => {
//     const segKey = keyFor(dIdx, segId);
//     if (!addonTripId || !dateYmd) return;

//     try {
//       const { data } = await API.get(
//         `/executive/addonTripVehicles/${addonTripId}`,
//         { params: { date: dateYmd } }
//       );

//       setAddonVehOptions((p) => ({ ...p, [segKey]: data }));

//       setAddonVehLines((p) => {
//         const existing = p[segKey] || [];
//         if (!existing.length) return { ...p, [segKey]: [] };

//         const { options = {} } = data || {};
//         const updated = existing.map((line) => {
//           const vehicles = options[line.category] || [];
//           const match = vehicles.find(
//             (v) => String(v.vehicleId) === String(line.vehicleId)
//           );
//           if (!match) return line;
//           return {
//             ...line,
//             percentage: match.percentage ?? line.percentage ?? 0,
//             basePrice: match.basePrice ?? line.basePrice ?? 0,
//             vendorId: match.vendor ?? line.vendorId ?? null,
//           };
//         });

//         return { ...p, [segKey]: updated };
//       });
//     } catch (e) {
//       console.error("addonTripVehicles fetch failed", e);
//       toast.error("Failed to load add-on vehicles for this segment.");
//     }
//   };

//   const fetchFoodsForSeg = async (tripId, dateYmd, dIdx, segId) => {
//     const segKey = keyFor(dIdx, segId);
//     if (!tripId || !dateYmd) return;

//     try {
//       const { data } = await API.get(`/executive/tripFoods/${tripId}`, {
//         params: { date: dateYmd },
//       });

//       setFoodOptions((p) => ({ ...p, [segKey]: data }));

//       setFoodLines((p) => {
//         const existing = p[segKey] || [];
//         if (!existing.length) return { ...p, [segKey]: [] };

//         const { options = {} } = data || {};
//         const updated = existing.map((line) => {
//           const cat = line.mealCategory || "";
//           const type = line.mealType || "";
//           const itemsForType = options[cat]?.[type] || [];
//           const match = itemsForType.find(
//             (it) => it.foodName === line.foodName
//           );

//           if (!match) return line;

//           return {
//             ...line,
//             price: match.price ?? line.price ?? 0,
//             percent: match.percent ?? line.percent ?? 0,
//             itineraryUnit:
//               match.itineraryPrice != null && !isNaN(match.itineraryPrice)
//                 ? Number(match.itineraryPrice)
//                 : Math.round(
//                     Number(match.price || 0) *
//                       (1 + Number(match.percent || 0) / 100)
//                   ),
//             vendorId: match.vendor ?? line.vendorId ?? null,
//           };
//         });

//         return { ...p, [segKey]: updated };
//       });
//     } catch (e) {
//       console.error("tripFoods fetch failed", e);
//       toast.error("Failed to load foods for this segment.");
//     }
//   };

//   const fetchActivitiesForSeg = async (activityIds, dateYmd, dIdx, segId) => {
//     const segKey = keyFor(dIdx, segId);
//     if (!Array.isArray(activityIds) || !activityIds.length || !dateYmd) {
//       toast.info("No activities to load for this segment.");
//       return;
//     }

//     try {
//       const ids = activityIds
//         .map((a) => (typeof a === "object" ? a._id : a))
//         .filter(Boolean)
//         .join(",");

//       const { data } = await API.get(`/executive/activitiesPricing`, {
//         params: { ids, date: dateYmd },
//       });

//       const map = {};
//       (data.items || []).forEach((it) => {
//         map[it.activityId] = {
//           name: it.activityName,
//           price: Number(it.price || 0),
//           percentage: Number(it.percentage || 0),
//           itineraryPrice: Number(it.itineraryPrice || 0),
//           vendorId: it.vendorId || null,
//         };
//       });
//       setActPricing((p) => ({ ...p, [segKey]: map }));

//       setActLines((p) => {
//         const existing = p[segKey] || [];
//         const items = data.items || [];

//         if (existing.length) {
//           const updated = existing.map((line) => {
//             const match = items.find(
//               (it) => String(it.activityId) === String(line.activityId)
//             );
//             if (!match) return line;

//             const price = Number(match.price || 0);
//             const percentage = Number(match.percentage || 0);
//             const itineraryUnit =
//               match.itineraryPrice != null && !isNaN(match.itineraryPrice)
//                 ? Number(match.itineraryPrice)
//                 : Math.round(price * (1 + percentage / 100));

//             return {
//               ...line,
//               price,
//               percentage,
//               itineraryUnit,
//               vendorId: match.vendorId || line.vendorId || null,
//             };
//           });
//           return { ...p, [segKey]: updated };
//         }

//         const fresh = items.map((it) => {
//           const price = Number(it.price || 0);
//           const percentage = Number(it.percentage || 0);
//           const itineraryUnit =
//             it.itineraryPrice != null && !isNaN(it.itineraryPrice)
//               ? Number(it.itineraryPrice)
//               : Math.round(price * (1 + percentage / 100));

//           return {
//             _id: uid(),
//             activityId: it.activityId,
//             name: it.activityName,
//             price,
//             percentage,
//             itineraryUnit,
//             qty: 0,
//             vendorId: it.vendorId || null,
//           };
//         });

//         return { ...p, [segKey]: fresh };
//       });
//     } catch (e) {
//       console.error("activitiesPricing fetch failed", e);
//       toast.error("Failed to load activities pricing for this segment.");
//     }
//   };

//   const fetchAccForSeg = async (destinationId, dateYmd, dIdx, segId) => {
//     const segKey = keyFor(dIdx, segId);
//     if (!destinationId || !dateYmd) return;

//     try {
//       const { data } = await API.get(`/executive/accommodationsPricing`, {
//         params: { destinationId, date: dateYmd },
//       });

//       setAccOptions((p) => ({ ...p, [segKey]: data }));

//       setAccLines((p) => {
//         const existing = p[segKey] || [];
//         if (!existing.length) return { ...p, [segKey]: [] };

//         const props = data?.properties || [];

//         const updated = existing.map((line) => {
//           const prop = props.find(
//             (x) => String(x.accommodationId) === String(line.accommodationId)
//           );
//           if (!prop) return line;

//           const room = (prop.roomTypes || []).find(
//             (r) => r.code === line.roomTypeCode
//           );

//           let next = {
//             ...line,
//             hotelCategory: prop.hotelCategory || line.hotelCategory || "",
//             roomCategory: prop.roomCategory || line.roomCategory || "",
//             commission: prop.commission ?? line.commission ?? 0,
//             vendorId: prop.vendorId ?? line.vendorId ?? null,
//           };

//           if (room) {
//             next = {
//               ...next,
//               bo: room.bo ?? line.bo ?? 0,
//               itinerary: room.itinerary ?? line.itinerary ?? 0,
//             };
//           }

//           return next;
//         });

//         return { ...p, [segKey]: updated };
//       });
//     } catch (e) {
//       console.error("accommodationsPricing fetch failed", e);
//       toast.error("Failed to load accommodations for this segment.");
//     }
//   };

//   /* ---------------- add/remove/update lines ---------------- */
//   const addVehLine = (segKey) => {
//     setVehLines((p) => ({
//       ...p,
//       [segKey]: [
//         ...(p[segKey] || []),
//         {
//           _id: uid(),
//           category: "",
//           vehicleId: "",
//           percentage: 0,
//           basePrice: 0,
//           qty: 0,
//           vendorId: null,
//         },
//       ],
//     }));
//   };
//   const updateVehLine = (segKey, id, next) =>
//     setVehLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, ...next } : l
//       ),
//     }));
//   const removeVehLine = (segKey, id) =>
//     setVehLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));

//   const addAddonVehLine = (segKey) => {
//     setAddonVehLines((p) => ({
//       ...p,
//       [segKey]: [
//         ...(p[segKey] || []),
//         {
//           _id: uid(),
//           category: "",
//           vehicleId: "",
//           percentage: 0,
//           basePrice: 0,
//           qty: 0,
//           vendorId: null,
//         },
//       ],
//     }));
//   };
//   const updateAddonVehLine = (segKey, id, next) =>
//     setAddonVehLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, ...next } : l
//       ),
//     }));
//   const removeAddonVehLine = (segKey, id) =>
//     setAddonVehLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));

//   const addFoodLine = (segKey) => {
//     setFoodLines((p) => ({
//       ...p,
//       [segKey]: [
//         ...(p[segKey] || []),
//         {
//           _id: uid(),
//           mealCategory: "",
//           mealType: "",
//           foodName: "",
//           price: 0,
//           percent: 0,
//           itineraryUnit: 0,
//           qty: 0,
//           vendorId: null,
//         },
//       ],
//     }));
//   };
//   const updateFoodLine = (segKey, id, next) =>
//     setFoodLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, ...next } : l
//       ),
//     }));
//   const removeFoodLine = (segKey, id) =>
//     setFoodLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));

//   const updateActQty = (segKey, id, qty) =>
//     setActLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, qty } : l
//       ),
//     }));
//   const removeActLine = (segKey, id) =>
//     setActLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));

//   const addAccLine = (segKey) => {
//     setAccLines((p) => ({
//       ...p,
//       [segKey]: [
//         ...(p[segKey] || []),
//         {
//           _id: uid(),
//           accommodationId: "",
//           propertyName: "",
//           hotelCategory: "",
//           roomCategory: "",
//           roomTypeCode: "",
//           commission: 0,
//           bo: 0,
//           itinerary: 0,
//           qty: 0,
//           vendorId: null,
//         },
//       ],
//     }));
//   };
//   const updateAccLine = (segKey, id, next) =>
//     setAccLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, ...next } : l
//       ),
//     }));
//   const removeAccLine = (segKey, id) =>
//     setAccLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));

//   /* ---------------- totals (itinerary + bo) ---------------- */
//   const { perDayItin, grandItin } = useMemo(() => {
//     const perDay = {};
//     let total = 0;

//     const add = (dayIdx, itin) => {
//       perDay[dayIdx] = (perDay[dayIdx] || 0) + itin;
//       total += itin;
//     };

//     const run = (map, calcItin) => {
//       for (const segKey in map) {
//         const [dStr] = segKey.split("-");
//         const dIdx = Number(dStr);
//         for (const line of map[segKey] || []) {
//           const qty = Number(line.qty || 0);
//           if (!qty) continue;
//           add(dIdx, calcItin(line) * qty);
//         }
//       }
//     };

//     run(vehLines, (l) => {
//       const base = Number(l.basePrice || 0);
//       const perc = Number(l.percentage || 0);
//       return Math.round(base * (1 + perc / 100));
//     });

//     run(addonVehLines, (l) => {
//       const base = Number(l.basePrice || 0);
//       const perc = Number(l.percentage || 0);
//       return Math.round(base * (1 + perc / 100));
//     });

//     run(foodLines, (l) => Number(l.itineraryUnit || 0));
//     run(actLines, (l) => Number(l.itineraryUnit || 0));
//     run(accLines, (l) => Number(l.itinerary || 0));

//     return { perDayItin: perDay, grandItin: total };
//   }, [vehLines, addonVehLines, foodLines, actLines, accLines]);

//   const { perDayBo, grandBo } = useMemo(() => {
//     const perDay = {};
//     let total = 0;

//     const add = (dayIdx, bo) => {
//       perDay[dayIdx] = (perDay[dayIdx] || 0) + bo;
//       total += bo;
//     };

//     const run = (map, calcBo) => {
//       for (const segKey in map) {
//         const [dStr] = segKey.split("-");
//         const dIdx = Number(dStr);
//         for (const line of map[segKey] || []) {
//           const qty = Number(line.qty || 0);
//           if (!qty) continue;
//           add(dIdx, calcBo(line) * qty);
//         }
//       }
//     };

//     run(vehLines, (l) => Number(l.basePrice || 0));
//     run(addonVehLines, (l) => Number(l.basePrice || 0));
//     run(foodLines, (l) => Number(l.price || 0));
//     run(actLines, (l) => Number(l.price || 0));
//     run(accLines, (l) => Number(l.bo || 0));

//     return { perDayBo: perDay, grandBo: total };
//   }, [vehLines, addonVehLines, foodLines, actLines, accLines]);

//   const margin = useMemo(
//     () => Math.max(0, Number(grandItin || 0) - Number(grandBo || 0)),
//     [grandItin, grandBo]
//   );

//   /* ---------------- build payload ---------------- */
//   const buildItineraryPayload = () => {
//     return {
//       clientId: client._id,
//       clientSnapshot: {
//         clientId: client.clientId,
//         name: client.name,
//         numberOfPersons: client.numberOfPersons,
//         startDate: client.startDate,
//         numberOfDays: client.numberOfDays,
//         primaryDestinationName: client.primaryDestinationName,
//       },
//       itinerary: days.map((d, dIdx) => ({
//         dayLabel: d.dayLabel || `Day ${dIdx + 1}`,
//         date: d.date,
//         segments: (d.segments || []).map((s) => {
//           const segKey = keyFor(dIdx, s._id);
//           return {
//             segmentId: s._id,
//             country: s.country || null,
//             state: s.state || null,
//             destination: s.destination || null,
//             trip: s.trip || null,
//             selectedAddon: s.selectedAddon || null,
//             selectedActivities: s.selectedActivities || [],
//             tripVehicles: vehLines[segKey] || [],
//             addonVehicles: addonVehLines[segKey] || [],
//             foods: foodLines[segKey] || [],
//             activities: actLines[segKey] || [],
//             accommodations: accLines[segKey] || [],
//           };
//         }),
//       })),
//       totals: {
//         perDayItinerary: days.map((_, i) => perDayItin[i] || 0),
//         grandItinerary: grandItin,
//         perDayBo: days.map((_, i) => perDayBo[i] || 0),
//         grandBo: grandBo,
//         margin: margin,
//       },
//     };
//   };

//   /* ---------------- discount calculation (shared) ---------------- */
//   const calcDiscountAndPoints = () => {
//     const pax = Number(client.numberOfPersons || 0);
//     const pp = Number(pdData.pointPercentage || 0);
//     const dp = Number(pdData.discountPercentage || 0);

//     const maxDiscount = (margin * dp) / 100;
//     const disc = clamp(Number(discountAmount || 0), 0, maxDiscount || 0);

//     const effectiveMargin = Math.max(0, margin - disc);
//     const executivePoint = ((effectiveMargin * pp) / 100 / 20) * pax;

//     return { disc, executivePoint };
//   };

//   /* ---------------- open point/discount ---------------- */
//   const openPointDiscount = async () => {
//     try {
//       setPdOpen(true);
//       setPdLoading(true);

//       const res = await API.get(
//         "/executive/custom-tour-point-discount-options",
//         {
//           params: { clientId: client._id },
//         }
//       );

//       const payload = res.data || {};
//       const pointPercentage = Number(payload.pointPercentage || 0);
//       const discountPercentage = Number(payload.discountPercentage || 0);

//       setPdData({ pointPercentage, discountPercentage });

//       const maxDiscount = (margin * discountPercentage) / 100;
//       setDiscountAmount((prev) =>
//         String(clamp(Number(prev || 0), 0, maxDiscount || 0))
//       );
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message ||
//           err.message ||
//           "Failed to load point/discount options"
//       );
//       setPdOpen(false);
//     } finally {
//       setPdLoading(false);
//     }
//   };

//   /* ---------------- download handlers ---------------- */
//   const downloadBlob = (blob, filename) => {
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename || "itinerary.pdf";
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   };

//   const handleReferralDownload = async () => {
//     if (!nextDate || !nextTime) {
//       toast.error(
//         "Please choose follow-up date and time for referral itinerary"
//       );
//       return;
//     }

//     try {
//       setLoadingReferral(true);
//       const payload = buildItineraryPayload();
//       const { disc, executivePoint } = calcDiscountAndPoints();

//       const res = await API.post(
//         "/executive/custom-tour-referral-itinerary",
//         {
//           ...payload,
//           nextDateRaw: nextDate,
//           nextTimeRaw: nextTime,
//           discountAmount: disc,
//           executivePoint,
//         },
//         { responseType: "blob" }
//       );

//       downloadBlob(
//         res.data,
//         `CustomTour-Referral-${client.clientId || client._id}.pdf`
//       );
//       toast.success("Referral itinerary downloaded");

//       if (typeof onCompleted === "function") onCompleted();
//       else if (typeof onClose === "function") onClose();
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message ||
//         err.message ||
//         "Failed to process referral itinerary";
//       toast.error(msg);
//     } finally {
//       setLoadingReferral(false);
//     }
//   };

//   const handleConfirmDownload = async () => {
//     try {
//       setLoadingConfirm(true);
//       const payload = buildItineraryPayload();
//       const { disc, executivePoint } = calcDiscountAndPoints();

//       const res = await API.post(
//         "/executive/custom-tour-confirm-itinerary",
//         {
//           ...payload,
//           nextDateRaw: nextDate || null,
//           nextTimeRaw: nextTime || null,
//           discountAmount: disc,
//           executivePoint,
//         },
//         { responseType: "blob" }
//       );

//       downloadBlob(
//         res.data,
//         `CustomTour-Confirm-${client.clientId || client._id}.pdf`
//       );
//       toast.success("Confirmed itinerary downloaded");

//       if (typeof onCompleted === "function") onCompleted();
//       else if (typeof onClose === "function") onClose();
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message ||
//         err.message ||
//         "Failed to process confirmed itinerary";
//       toast.error(msg);
//     } finally {
//       setLoadingConfirm(false);
//     }
//   };

//   /* ---------------- options ---------------- */
//   const countryOpts = useMemo(
//     () => toObjOptions(countries, "_id", "name"),
//     [countries]
//   );

//   return (
//     <>
//     <style>{`
//   /* Chrome / Edge / Safari */
//   .ct-glass-scroll::-webkit-scrollbar {
//     width: 10px;
//   }

//   .ct-glass-scroll::-webkit-scrollbar-track {
//     background: rgba(255,255,255,0.35);
//     border-radius: 999px;
//     backdrop-filter: blur(14px);
//   }

//   .ct-glass-scroll::-webkit-scrollbar-thumb {
//     background: rgba(133,112,238,0.28);
//     border-radius: 999px;
//     border: 2px solid rgba(255,255,255,0.45);
//     backdrop-filter: blur(14px);
//   }

//   .ct-glass-scroll::-webkit-scrollbar-thumb:hover {
//     background: rgba(133,112,238,0.42);
//   }

//   /* Firefox */
//   .ct-glass-scroll {
//     scrollbar-width: thin;
//     scrollbar-color: rgba(133,112,238,0.35) rgba(255,255,255,0.25);
//   }
// `}</style>

//       {/* Point & Discount Modal */}
//       <PointDiscountModal
//         open={pdOpen}
//         theme={theme}
//         loading={pdLoading}
//         onClose={() => setPdOpen(false)}
//         margin={margin}
//         pointPercentage={pdData.pointPercentage}
//         discountPercentage={pdData.discountPercentage}
//         pax={Number(client.numberOfPersons || 0)}
//         discountAmount={discountAmount}
//         setDiscountAmount={setDiscountAmount}
//       />

//       <AnimatePresence>
//         <motion.div
//           className="fixed inset-0 z-[120] flex items-center justify-center"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <div className="absolute inset-0 bg-black/40" onClick={onClose} />

//           <motion.div
//             className="relative w-full max-w-6xl mx-3 rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.55)] p-5 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-hidden"
//             initial={{ y: 40, scale: 0.96, opacity: 0 }}
//             animate={{ y: 0, scale: 1, opacity: 1 }}
//             exit={{ y: 20, scale: 0.97, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 140, damping: 18 }}
//           >
//             {/* header */}
//             <div className="flex items-start justify-between gap-3">
//               <div>
//                 <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
//                   Custom Tour
//                 </div>
//                 <div className="text-lg sm:text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
//                   Custom Tour Itinerary Builder
//                 </div>
//                 <div className="mt-1 text-xs text-slate-500 space-y-0.5">
//                   <div>
//                     Client:{" "}
//                     <span className="font-medium">
//                       {client.name || "Client"}
//                     </span>{" "}
//                     <span className="font-mono text-[11px] text-slate-400">
//                       ({client.clientId})
//                     </span>
//                   </div>
//                   <div className="flex flex-wrap items-center gap-3 text-[11px]">
//                     {client.primaryDestinationName?.label && (
//                       <span className="flex items-center gap-1">
//                         <MapPin size={11} />
//                         {client.primaryDestinationName.label}
//                       </span>
//                     )}
//                     {client.numberOfDays && (
//                       <span className="flex items-center gap-1">
//                         <CalendarClock size={11} />
//                         {client.numberOfDays} days
//                       </span>
//                     )}
//                     {typeof client.numberOfPersons !== "undefined" && (
//                       <span className="flex items-center gap-1">
//                         <CircleDot size={11} />
//                         <span>
//                           Pax:{" "}
//                           <span className="font-semibold">
//                             {client.numberOfPersons}
//                           </span>
//                         </span>
//                       </span>
//                     )}
//                     {client.startDate && (
//                       <span className="flex items-center gap-1">
//                         <CalendarClock size={11} />
//                         <span>
//                           Start:{" "}
//                           <span className="font-semibold">
//                             {formatDDMMYYYY(client.startDate)}
//                           </span>
//                         </span>
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="h-8 w-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             {/* schedule date/time */}
//             <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
//               <div className="flex items-center gap-2">
//                 <div
//                   className="h-8 w-8 rounded-xl flex items-center justify-center"
//                   style={{ background: `${theme}22`, color: theme }}
//                 >
//                   <CalendarClock size={16} />
//                 </div>
//                 <div className="text-sm font-semibold text-slate-800">
//                   Schedule follow-up
//                 </div>
//                 <div className="ml-auto text-xs text-slate-500">
//                   Referral: required • Confirm: optional
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
//                 <div>
//                   <div className="text-[11px] text-slate-500 mb-1">
//                     Next contact date
//                   </div>
//                   <input
//                     type="date"
//                     value={nextDate}
//                     onChange={(e) => setNextDate(e.target.value)}
//                     className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2"
//                     style={{ "--tw-ring-color": theme }}
//                   />
//                 </div>
//                 <div>
//                   <div className="text-[11px] text-slate-500 mb-1">
//                     Next contact time
//                   </div>
//                   <input
//                     type="time"
//                     value={nextTime}
//                     onChange={(e) => setNextTime(e.target.value)}
//                     className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2"
//                     style={{ "--tw-ring-color": theme }}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* day nav + totals */}
//             <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() =>
//                     setDayIndex((p) => clamp(p - 1, 0, days.length - 1))
//                   }
//                   className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50"
//                   disabled={dayIndex === 0}
//                 >
//                   <ChevronLeft size={18} />
//                 </button>

//                 <div className="px-3 py-2 rounded-xl border border-slate-200 bg-white">
//                   <div className="text-xs text-slate-500">Current Day</div>
//                   <div className="text-sm font-semibold text-slate-900">
//                     {currentDay?.dayLabel || `Day ${dayIndex + 1}`} •{" "}
//                     {formatDDMMYYYY(currentDay?.date)}
//                   </div>
//                 </div>

//                 <button
//                   onClick={() =>
//                     setDayIndex((p) => clamp(p + 1, 0, days.length - 1))
//                   }
//                   className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50"
//                   disabled={dayIndex >= days.length - 1}
//                 >
//                   <ChevronRight size={18} />
//                 </button>
//               </div>

//               <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
//                 <div className="text-[11px] text-slate-500">
//                   Itinerary Totals
//                 </div>
//                 <div className="flex gap-5">
//                   <div>
//                     Day:{" "}
//                     <span className="font-bold">
//                       {perDayItin[dayIndex] || 0}
//                     </span>
//                   </div>
//                   <div>
//                     Total: <span className="font-bold">{grandItin}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* swipe area */}
//             <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white ct-glass-scroll">
//               <motion.div
//                 key={dayIndex}
//                 drag="x"
//                 dragConstraints={{ left: 0, right: 0 }}
//                 onDragEnd={(_, info) => {
//                   if (info.offset.x > 80)
//                     setDayIndex((p) => clamp(p - 1, 0, days.length - 1));
//                   if (info.offset.x < -80)
//                     setDayIndex((p) => clamp(p + 1, 0, days.length - 1));
//                 }}
//                 className="p-4 sm:p-5 space-y-4"
//               >
//                 {/* segments */}
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm font-semibold text-slate-800">
//                     Segments for {currentDay?.dayLabel || `Day ${dayIndex + 1}`}
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => addSegment(dayIndex)}
//                     className="text-sm px-3 py-2 rounded-xl text-white hover:opacity-90 inline-flex items-center gap-2"
//                     style={{ background: theme }}
//                   >
//                     <Plus size={16} />
//                     Add Segment
//                   </button>
//                 </div>

//                 {(currentDay?.segments || []).map((seg) => {
//                   const segKey = keyFor(dayIndex, seg._id);
//                   const dayDateYmd = toYmd(
//                     currentDay?.date || client.startDate
//                   );

//                   const stList = statesByKey[segKey] || [];
//                   const dsList = destsByKey[segKey] || [];
//                   const trList = tripsByKey[segKey] || [];
//                   const details = tripDetailsByKey[segKey] || {
//                     addonTrips: [],
//                     activities: [],
//                   };

//                   const stateOpts = toObjOptions(stList, "_id", "name");
//                   const destOpts = toObjOptions(dsList, "_id", "name");
//                   const tripOpts = toObjOptions(trList, "_id", "tripName");
//                   const addonOpts = toObjOptions(
//                     details.addonTrips || [],
//                     "_id",
//                     "tripName"
//                   );

//                   return (
//                     <div
//                       key={seg._id}
//                       className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm font-semibold text-slate-900">
//                           Segment
//                         </div>
//                         {(currentDay.segments || []).length > 1 && (
//                           <IconButton
//                             danger
//                             title="Remove Segment"
//                             onClick={() => removeSegment(dayIndex, seg._id)}
//                           >
//                             <Trash2 size={16} />
//                           </IconButton>
//                         )}
//                       </div>

//                       {/* ROW 1 */}
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                         <div>
//                           <div className="text-[11px] text-slate-500 mb-1">
//                             Country
//                           </div>
//                           <Select
//                             styles={selectStyles}
//                             options={countryOpts}
//                             value={findOption(countryOpts, seg.country)}
//                             onChange={(opt) => {
//                               const countryId = opt?.value || "";

//                               // ✅ pricing reset
//                               clearSegPricingOnly(segKey);

//                               // ✅ location chain must reset for country changes
//                               clearSegLocationChain(segKey);

//                               updateSegment(dayIndex, seg._id, {
//                                 country: countryId,
//                                 state: "",
//                                 destination: "",
//                                 trip: "",
//                                 selectedAddon: "",
//                                 selectedActivities: [],
//                               });

//                               // seed empty lists
//                               setStatesByKey((p) => ({ ...p, [segKey]: [] }));
//                               setDestsByKey((p) => ({ ...p, [segKey]: [] }));
//                               setTripsByKey((p) => ({ ...p, [segKey]: [] }));
//                               setTripDetailsByKey((p) => ({
//                                 ...p,
//                                 [segKey]: { addonTrips: [], activities: [] },
//                               }));

//                               if (countryId) fetchStates(countryId, segKey);
//                             }}
//                             isClearable
//                             placeholder="Select"
//                           />
//                         </div>

//                         <div>
//                           <div className="text-[11px] text-slate-500 mb-1">
//                             State
//                           </div>
//                           <Select
//                             styles={selectStyles}
//                             options={stateOpts}
//                             value={findOption(stateOpts, seg.state)}
//                             isDisabled={!seg.country}
//                             onChange={(opt) => {
//                               const stateId = opt?.value || "";

//                               // ✅ pricing reset only (do NOT clear statesByKey)
//                               clearSegPricingOnly(segKey);

//                               // downstream lists only
//                               setDestsByKey((p) => ({ ...p, [segKey]: [] }));
//                               setTripsByKey((p) => ({ ...p, [segKey]: [] }));
//                               setTripDetailsByKey((p) => ({
//                                 ...p,
//                                 [segKey]: { addonTrips: [], activities: [] },
//                               }));

//                               updateSegment(dayIndex, seg._id, {
//                                 state: stateId,
//                                 destination: "",
//                                 trip: "",
//                                 selectedAddon: "",
//                                 selectedActivities: [],
//                               });

//                               if (seg.country && stateId)
//                                 fetchDestinations(seg.country, stateId, segKey);
//                             }}
//                             isClearable
//                             placeholder="Select"
//                           />
//                         </div>

//                         <div>
//                           <div className="text-[11px] text-slate-500 mb-1">
//                             Destination
//                           </div>
//                           <Select
//                             styles={selectStyles}
//                             options={destOpts}
//                             value={findOption(destOpts, seg.destination)}
//                             isDisabled={!seg.state}
//                             onChange={(opt) => {
//                               const destId = opt?.value || "";

//                               // ✅ pricing reset only (keep state list)
//                               clearSegPricingOnly(segKey);

//                               setTripsByKey((p) => ({ ...p, [segKey]: [] }));
//                               setTripDetailsByKey((p) => ({
//                                 ...p,
//                                 [segKey]: { addonTrips: [], activities: [] },
//                               }));

//                               updateSegment(dayIndex, seg._id, {
//                                 destination: destId,
//                                 trip: "",
//                                 selectedAddon: "",
//                                 selectedActivities: [],
//                               });

//                               if (seg.country && seg.state && destId) {
//                                 fetchTrips(
//                                   seg.country,
//                                   seg.state,
//                                   destId,
//                                   segKey
//                                 );
//                               }
//                             }}
//                             isClearable
//                             placeholder="Select"
//                           />
//                         </div>
//                       </div>

//                       {/* ROW 2 */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         <div>
//                           <div className="text-[11px] text-slate-500 mb-1">
//                             Trip
//                           </div>
//                           <Select
//                             styles={selectStyles}
//                             options={tripOpts}
//                             value={findOption(tripOpts, seg.trip)}
//                             isDisabled={!seg.destination}
//                             onChange={(opt) => {
//                               const tripId = opt?.value || "";

//                               // ✅ clear pricing/lines for trip change
//                               clearSegPricingOnly(segKey);

//                               // keep location lists intact; only tripDetails reset
//                               setTripDetailsByKey((p) => ({
//                                 ...p,
//                                 [segKey]: { addonTrips: [], activities: [] },
//                               }));

//                               updateSegment(dayIndex, seg._id, {
//                                 trip: tripId,
//                                 selectedAddon: "",
//                                 selectedActivities: [],
//                               });

//                               if (tripId) fetchTripDetails(tripId, segKey);
//                             }}
//                             isClearable
//                             placeholder="Select"
//                           />
//                         </div>

//                         <div>
//                           <div className="text-[11px] text-slate-500 mb-1">
//                             Add-on Trip
//                           </div>
//                           <Select
//                             styles={selectStyles}
//                             options={addonOpts}
//                             value={findOption(addonOpts, seg.selectedAddon)}
//                             isDisabled={!seg.trip}
//                             onChange={(opt) => {
//                               const addonId = opt?.value || "";

//                               // ✅ clear addon vehicle pricing+lines if addon changes
//                               setAddonVehOptions((p) => ({
//                                 ...p,
//                                 [segKey]: null,
//                               }));
//                               setAddonVehLines((p) => ({ ...p, [segKey]: [] }));

//                               updateSegment(dayIndex, seg._id, {
//                                 selectedAddon: addonId,
//                               });
//                             }}
//                             isClearable
//                             placeholder="Select"
//                           />
//                         </div>
//                       </div>

//                       {/* Activities chips */}
//                       <div>
//                         <div className="text-[11px] text-slate-500 mb-1">
//                           Activities
//                         </div>
//                         <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-wrap gap-2">
//                           {(details.activities || []).length ? (
//                             (details.activities || []).map((a) => {
//                               const checked = (
//                                 seg.selectedActivities || []
//                               ).includes(a._id);
//                               return (
//                                 <button
//                                   type="button"
//                                   key={a._id}
//                                   onClick={() => {
//                                     const next = checked
//                                       ? (seg.selectedActivities || []).filter(
//                                           (x) => x !== a._id
//                                         )
//                                       : [
//                                           ...(seg.selectedActivities || []),
//                                           a._id,
//                                         ];

//                                     // ✅ when activities change, clear priced lines
//                                     setActPricing((p) => ({
//                                       ...p,
//                                       [segKey]: null,
//                                     }));
//                                     setActLines((p) => ({
//                                       ...p,
//                                       [segKey]: [],
//                                     }));

//                                     updateSegment(dayIndex, seg._id, {
//                                       selectedActivities: next,
//                                     });
//                                   }}
//                                   className={[
//                                     "px-3 py-1 rounded-full text-xs border",
//                                     checked
//                                       ? "bg-[rgba(133,112,238,0.12)] border-[rgba(133,112,238,0.35)] text-slate-900"
//                                       : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
//                                   ].join(" ")}
//                                 >
//                                   {a.tripName}
//                                 </button>
//                               );
//                             })
//                           ) : (
//                             <div className="text-xs text-slate-500">
//                               Select a Trip to load Activities
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {/* Vehicles */}
//                       <SectionCard
//                         title="Trip Vehicles"
//                         right={
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 fetchVehiclesForSeg(
//                                   seg.trip,
//                                   dayDateYmd,
//                                   dayIndex,
//                                   seg._id
//                                 )
//                               }
//                               className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                               disabled={!seg.trip || !dayDateYmd}
//                             >
//                               Load
//                             </button>
//                             {vehOptions[segKey] && (
//                               <button
//                                 type="button"
//                                 onClick={() => addVehLine(segKey)}
//                                 className="text-sm px-3 py-1 rounded-lg text-white hover:opacity-90"
//                                 style={{ background: theme }}
//                               >
//                                 + Add
//                               </button>
//                             )}
//                           </div>
//                         }
//                       >
//                         {vehOptions[segKey] ? (
//                           <VehicleLines
//                             segKey={segKey}
//                             data={vehOptions[segKey]}
//                             lines={vehLines[segKey] || []}
//                             onUpdateLine={updateVehLine}
//                             onRemoveLine={removeVehLine}
//                             selectStyles={selectStyles}
//                           />
//                         ) : (
//                           <Hint text="Click Load to fetch available vehicles & prices." />
//                         )}
//                       </SectionCard>

//                       <SectionCard
//                         title="Add-on Trip Vehicles"
//                         right={
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 fetchAddonVehiclesForSeg(
//                                   seg.selectedAddon,
//                                   dayDateYmd,
//                                   dayIndex,
//                                   seg._id
//                                 )
//                               }
//                               className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                               disabled={!seg.selectedAddon || !dayDateYmd}
//                             >
//                               Load
//                             </button>
//                             {addonVehOptions[segKey] && (
//                               <button
//                                 type="button"
//                                 onClick={() => addAddonVehLine(segKey)}
//                                 className="text-sm px-3 py-1 rounded-lg text-white hover:opacity-90"
//                                 style={{ background: theme }}
//                               >
//                                 + Add
//                               </button>
//                             )}
//                           </div>
//                         }
//                       >
//                         {addonVehOptions[segKey] ? (
//                           <VehicleLines
//                             segKey={segKey}
//                             data={addonVehOptions[segKey]}
//                             lines={addonVehLines[segKey] || []}
//                             onUpdateLine={updateAddonVehLine}
//                             onRemoveLine={removeAddonVehLine}
//                             selectStyles={selectStyles}
//                           />
//                         ) : (
//                           <Hint text="Click Load to fetch add-on vehicles & prices." />
//                         )}
//                       </SectionCard>

//                       {/* Activities priced */}
//                       <SectionCard
//                         title="Activities (Priced)"
//                         right={
//                           <button
//                             type="button"
//                             onClick={() =>
//                               fetchActivitiesForSeg(
//                                 seg.selectedActivities || [],
//                                 dayDateYmd,
//                                 dayIndex,
//                                 seg._id
//                               )
//                             }
//                             className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                             disabled={
//                               !seg.selectedActivities?.length || !dayDateYmd
//                             }
//                           >
//                             Load
//                           </button>
//                         }
//                       >
//                         {actLines[segKey]?.length ? (
//                           <ActivityLines
//                             segKey={segKey}
//                             lines={actLines[segKey]}
//                             onQty={updateActQty}
//                             onRemove={removeActLine}
//                           />
//                         ) : (
//                           <Hint
//                             text={
//                               seg.selectedActivities?.length
//                                 ? "Click Load to fetch prices for selected activities."
//                                 : "No activities selected in this segment."
//                             }
//                           />
//                         )}
//                       </SectionCard>

//                       {/* Food */}
//                       <SectionCard
//                         title="Trip Food"
//                         right={
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 fetchFoodsForSeg(
//                                   seg.trip,
//                                   dayDateYmd,
//                                   dayIndex,
//                                   seg._id
//                                 )
//                               }
//                               className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                               disabled={!seg.trip || !dayDateYmd}
//                             >
//                               Load
//                             </button>
//                             {foodOptions[segKey] && (
//                               <button
//                                 type="button"
//                                 onClick={() => addFoodLine(segKey)}
//                                 className="text-sm px-3 py-1 rounded-lg text-white hover:opacity-90"
//                                 style={{ background: theme }}
//                               >
//                                 + Add
//                               </button>
//                             )}
//                           </div>
//                         }
//                       >
//                         {foodOptions[segKey] ? (
//                           <FoodLines
//                             segKey={segKey}
//                             data={foodOptions[segKey]}
//                             lines={foodLines[segKey] || []}
//                             onUpdateLine={updateFoodLine}
//                             onRemoveLine={removeFoodLine}
//                             selectStyles={selectStyles}
//                           />
//                         ) : (
//                           <Hint text="Click Load to fetch available foods & prices." />
//                         )}
//                       </SectionCard>

//                       {/* Accommodation */}
//                       <SectionCard
//                         title="Accommodation"
//                         right={
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 fetchAccForSeg(
//                                   seg.destination,
//                                   dayDateYmd,
//                                   dayIndex,
//                                   seg._id
//                                 )
//                               }
//                               className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                               disabled={!seg.destination || !dayDateYmd}
//                             >
//                               Load
//                             </button>
//                             {accOptions[segKey]?.properties?.length ? (
//                               <button
//                                 type="button"
//                                 onClick={() => addAccLine(segKey)}
//                                 className="text-sm px-3 py-1 rounded-lg text-white hover:opacity-90"
//                                 style={{ background: theme }}
//                               >
//                                 + Add
//                               </button>
//                             ) : null}
//                           </div>
//                         }
//                       >
//                         {accOptions[segKey]?.properties?.length ? (
//                           <AccommodationLines
//                             segKey={segKey}
//                             data={accOptions[segKey]}
//                             lines={accLines[segKey] || []}
//                             onUpdateLine={updateAccLine}
//                             onRemoveLine={removeAccLine}
//                             selectStyles={selectStyles}
//                           />
//                         ) : (
//                           <Hint text="Click Load to fetch available accommodations & prices." />
//                         )}
//                       </SectionCard>
//                     </div>
//                   );
//                 })}
//               </motion.div>
//             </div>

//             {/* download buttons */}
//             <div className="flex flex-col sm:flex-row gap-3 justify-end pt-1">
//               <button
//                 type="button"
//                 onClick={handleReferralDownload}
//                 disabled={loadingReferral}
//                 className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border shadow-sm hover:bg-slate-50 disabled:opacity-60"
//                 style={{ borderColor: theme, color: theme }}
//               >
//                 {loadingReferral ? (
//                   <>
//                     <Loader2 className="animate-spin mr-2" size={16} />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <Download className="mr-2" size={16} />
//                     Download Referral Itinerary
//                   </>
//                 )}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleConfirmDownload}
//                 disabled={loadingConfirm}
//                 className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border shadow-sm hover:bg-slate-50 disabled:opacity-60"
//                 style={{ borderColor: theme, color: theme }}
//               >
//                 {loadingConfirm ? (
//                   <>
//                     <Loader2 className="animate-spin mr-2" size={16} />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <Download className="mr-2" size={16} />
//                     Download Confirm Itinerary
//                   </>
//                 )}
//               </button>

//               <button
//                 type="button"
//                 onClick={openPointDiscount}
//                 className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border shadow-sm hover:bg-slate-50"
//                 style={{ borderColor: theme, color: theme }}
//               >
//                 View Point and Discount Options
//               </button>
//             </div>

//             <div className="text-[11px] text-slate-500 text-right pr-1">
//               Selected discount:{" "}
//               <span className="font-semibold text-slate-800">
//                 {money(asNum(discountAmount))}
//               </span>
//             </div>
//           </motion.div>
//         </motion.div>
//       </AnimatePresence>
//     </>
//   );
// }

// /* ===============================
//    UI sections + line components
// ================================ */
// function SectionCard({ title, right, children }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
//       <div className="flex items-center justify-between">
//         <div className="font-semibold text-slate-800">{title}</div>
//         {right}
//       </div>
//       {children}
//     </div>
//   );
// }

// function Hint({ text }) {
//   return <p className="text-xs text-gray-500">{text}</p>;
// }

// /* Vehicle Lines: NO hooks inside map */
// function VehicleLines({
//   segKey,
//   data,
//   lines,
//   onUpdateLine,
//   onRemoveLine,
//   selectStyles,
// }) {
//   const { categories = [], options = {} } = data || {};
//   const categoryOpts = toStringOptions(categories);

//   return (
//     <div className="mt-1 space-y-3">
//       {lines.length === 0 && (
//         <div className="text-xs text-gray-500">
//           No vehicles added yet. Click <b>+ Add</b>.
//         </div>
//       )}

//       {lines.map((line) => {
//         const currentCat = line.category || "";
//         const vehicles = options[currentCat] || [];

//         const vehicleOpts = (vehicles || []).map((v) => ({
//           value: v.vehicleId,
//           label: v.vehicleName,
//           raw: v,
//         }));

//         const currentVeh = vehicles.find(
//           (v) => String(v.vehicleId) === String(line.vehicleId)
//         );

//         const percentage = currentVeh?.percentage ?? line.percentage ?? 0;
//         const basePrice = currentVeh?.basePrice ?? line.basePrice ?? 0;
//         const qty = line.qty ?? 0;
//         const itinUnit = Math.round(basePrice * (1 + (percentage || 0) / 100));

//         return (
//           <div
//             key={line._id}
//             className="border border-gray-200 rounded-2xl p-3 bg-white space-y-3"
//           >
//             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
//               <div className="md:col-span-3">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Category
//                 </label>
//                 <Select
//                   styles={selectStyles}
//                   options={categoryOpts}
//                   value={findOption(categoryOpts, currentCat)}
//                   onChange={(opt) =>
//                     onUpdateLine(segKey, line._id, {
//                       category: opt?.value || "",
//                       vehicleId: "",
//                       percentage: 0,
//                       basePrice: 0,
//                       qty: 0,
//                       vendorId: null,
//                     })
//                   }
//                   isClearable
//                   placeholder="Select"
//                 />
//               </div>

//               <div className="md:col-span-5">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Vehicle
//                 </label>
//                 <Select
//                   styles={selectStyles}
//                   options={vehicleOpts}
//                   value={findOption(vehicleOpts, line.vehicleId)}
//                   isDisabled={!currentCat}
//                   onChange={(opt) => {
//                     const v = opt?.raw;
//                     onUpdateLine(segKey, line._id, {
//                       vehicleId: v?.vehicleId || "",
//                       percentage: v?.percentage ?? 0,
//                       basePrice: v?.basePrice ?? 0,
//                       vendorId: v?.vendor ?? null,
//                     });
//                   }}
//                   isClearable
//                   placeholder="Select"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Itinerary Unit
//                 </label>
//                 <input
//                   className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                   readOnly
//                   value={itinUnit || 0}
//                 />
//               </div>

//               <div className="md:col-span-2 flex items-center justify-between gap-2">
//                 <Qty
//                   disabled={!line.vehicleId}
//                   qty={qty}
//                   onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
//                 />
//                 <IconButton
//                   danger
//                   onClick={() => onRemoveLine(segKey, line._id)}
//                   title="Remove"
//                 >
//                   <Trash2 size={16} />
//                 </IconButton>
//               </div>
//             </div>

//             <div className="flex items-center justify-end gap-6 text-sm pt-1">
//               <div>
//                 Itinerary: <b>{(itinUnit || 0) * (qty || 0)}</b>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* Food Lines */
// function FoodLines({
//   segKey,
//   data,
//   lines,
//   onUpdateLine,
//   onRemoveLine,
//   selectStyles,
// }) {
//   const { categories = [], typesByCategory = {}, options = {} } = data || {};
//   const catOpts = toStringOptions(categories);

//   return (
//     <div className="mt-1 space-y-3">
//       {lines.length === 0 && (
//         <div className="text-xs text-gray-500">
//           No foods added yet. Click <b>+ Add</b>.
//         </div>
//       )}

//       {lines.map((line) => {
//         const currentCat = line.mealCategory || "";
//         const currentType = line.mealType || "";

//         const typeList = typesByCategory[currentCat] || [];
//         const typeOpts = toStringOptions(typeList);

//         const items = options[currentCat]?.[currentType] || [];
//         const foodOpts = (items || []).map((it) => ({
//           value: it.foodName,
//           label: it.foodName,
//           raw: it,
//         }));

//         const picked = items.find((it) => it.foodName === line.foodName);

//         const price = picked?.price ?? line.price ?? 0;
//         const percent = picked?.percent ?? line.percent ?? 0;
//         const itineraryUnit =
//           picked?.itineraryPrice != null && !isNaN(picked.itineraryPrice)
//             ? Number(picked.itineraryPrice)
//             : Math.round(Number(price) * (1 + Number(percent || 0) / 100));

//         const qty = line.qty ?? 0;

//         return (
//           <div
//             key={line._id}
//             className="border border-gray-200 rounded-2xl p-3 bg-white space-y-3"
//           >
//             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
//               <div className="md:col-span-4">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Meal Category
//                 </label>
//                 <Select
//                   styles={selectStyles}
//                   options={catOpts}
//                   value={findOption(catOpts, currentCat)}
//                   onChange={(opt) =>
//                     onUpdateLine(segKey, line._id, {
//                       mealCategory: opt?.value || "",
//                       mealType: "",
//                       foodName: "",
//                       price: 0,
//                       percent: 0,
//                       itineraryUnit: 0,
//                       qty: 0,
//                       vendorId: null,
//                     })
//                   }
//                   isClearable
//                   placeholder="Select"
//                 />
//               </div>

//               <div className="md:col-span-3">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Meal Type
//                 </label>
//                 <Select
//                   styles={selectStyles}
//                   options={typeOpts}
//                   value={findOption(typeOpts, currentType)}
//                   isDisabled={!currentCat}
//                   onChange={(opt) =>
//                     onUpdateLine(segKey, line._id, {
//                       mealType: opt?.value || "",
//                       foodName: "",
//                       price: 0,
//                       percent: 0,
//                       itineraryUnit: 0,
//                       qty: 0,
//                       vendorId: null,
//                     })
//                   }
//                   isClearable
//                   placeholder="Select"
//                 />
//               </div>

//               <div className="md:col-span-3">
//                 <label className="text-xs text-gray-600 mb-1 block">Food</label>
//                 <Select
//                   styles={selectStyles}
//                   options={foodOpts}
//                   value={findOption(foodOpts, line.foodName)}
//                   isDisabled={!currentCat || !currentType}
//                   onChange={(opt) => {
//                     const it = opt?.raw;
//                     onUpdateLine(segKey, line._id, {
//                       foodName: it?.foodName || "",
//                       price: it?.price ?? 0,
//                       percent: it?.percent ?? 0,
//                       itineraryUnit:
//                         it?.itineraryPrice != null && !isNaN(it.itineraryPrice)
//                           ? Number(it.itineraryPrice)
//                           : Math.round(
//                               Number(it?.price || 0) *
//                                 (1 + Number(it?.percent || 0) / 100)
//                             ),
//                       vendorId: it?.vendor || null,
//                     });
//                   }}
//                   isClearable
//                   placeholder="Select"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Itinerary Unit
//                 </label>
//                 <input
//                   className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                   readOnly
//                   value={itineraryUnit || 0}
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//               <Qty
//                 disabled={!line.foodName}
//                 qty={qty}
//                 onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
//               />

//               <div className="flex items-center gap-6 text-sm">
//                 <div>
//                   Itinerary: <b>{(itineraryUnit || 0) * (qty || 0)}</b>
//                 </div>
//                 <IconButton
//                   danger
//                   onClick={() => onRemoveLine(segKey, line._id)}
//                   title="Remove"
//                 >
//                   <Trash2 size={16} />
//                 </IconButton>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* Activity Lines */
// function ActivityLines({ segKey, lines, onQty, onRemove }) {
//   return (
//     <div className="mt-1 space-y-3">
//       {lines.map((line) => {
//         const itinUnit = Number(line.itineraryUnit || 0);
//         const qty = Number(line.qty || 0);

//         return (
//           <div
//             key={line._id}
//             className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3 bg-white"
//           >
//             <div className="md:col-span-6">
//               <div className="text-xs text-gray-600 mb-1">Activity</div>
//               <div className="font-semibold text-gray-800">{line.name}</div>
//             </div>

//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Itinerary Unit
//               </label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={itinUnit || 0}
//               />
//             </div>

//             <div className="md:col-span-4 flex items-center justify-between gap-2">
//               <Qty
//                 disabled={!line.activityId}
//                 qty={qty}
//                 onChange={(q) => onQty(segKey, line._id, q)}
//               />
//               <IconButton
//                 danger
//                 onClick={() => onRemove(segKey, line._id)}
//                 title="Remove"
//               >
//                 <Trash2 size={16} />
//               </IconButton>
//             </div>

//             <div className="md:col-span-12 flex items-center justify-end gap-6 text-sm pt-1">
//               <div>
//                 Itinerary: <b>{itinUnit * qty}</b>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* Accommodation Lines */
// function AccommodationLines({
//   segKey,
//   data,
//   lines,
//   onUpdateLine,
//   onRemoveLine,
//   selectStyles,
// }) {
//   const props = data?.properties || [];
//   const propOpts = useMemo(
//     () =>
//       props.map((p) => ({
//         value: p.accommodationId,
//         label: p.propertyName,
//         raw: p,
//       })),
//     [props]
//   );

//   return (
//     <div className="mt-1 space-y-3">
//       {lines.length === 0 && (
//         <div className="text-xs text-gray-500">
//           No accommodations added yet. Click <b>+ Add</b>.
//         </div>
//       )}

//       {lines.map((line) => {
//         const selectedProp = props.find(
//           (p) => String(p.accommodationId) === String(line.accommodationId)
//         );
//         const roomTypes = selectedProp?.roomTypes || [];

//         const roomOpts = (roomTypes || []).map((r) => ({
//           value: r.code,
//           label: r.label,
//           raw: r,
//         }));

//         const pickedRoom = roomTypes.find((r) => r.code === line.roomTypeCode);
//         const itinerary = pickedRoom?.itinerary ?? line.itinerary ?? 0;
//         const qty = line.qty ?? 0;

//         return (
//           <div
//             key={line._id}
//             className="border border-gray-200 rounded-2xl p-3 bg-white space-y-3"
//           >
//             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
//               <div className="md:col-span-6">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Property
//                 </label>
//                 <Select
//                   styles={selectStyles}
//                   options={propOpts}
//                   value={findOption(propOpts, line.accommodationId)}
//                   onChange={(opt) => {
//                     const p = opt?.raw;
//                     onUpdateLine(segKey, line._id, {
//                       accommodationId: p?.accommodationId || "",
//                       propertyName: p?.propertyName || "",
//                       hotelCategory: p?.hotelCategory || "",
//                       roomCategory: p?.roomCategory || "",
//                       commission: p?.commission ?? 0,
//                       roomTypeCode: "",
//                       bo: 0,
//                       itinerary: 0,
//                       qty: 0,
//                       vendorId: p?.vendorId || null,
//                     });
//                   }}
//                   isClearable
//                   placeholder="Select"
//                 />
//               </div>

//               <div className="md:col-span-4">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Room Type
//                 </label>
//                 <Select
//                   styles={selectStyles}
//                   options={roomOpts}
//                   value={findOption(roomOpts, line.roomTypeCode)}
//                   isDisabled={!selectedProp}
//                   onChange={(opt) => {
//                     const r = opt?.raw;
//                     onUpdateLine(segKey, line._id, {
//                       roomTypeCode: r?.code || "",
//                       bo: r?.bo ?? 0,
//                       itinerary: r?.itinerary ?? 0,
//                     });
//                   }}
//                   isClearable
//                   placeholder="Select"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="text-xs text-gray-600 mb-1 block">
//                   Itinerary Unit
//                 </label>
//                 <input
//                   className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                   readOnly
//                   value={itinerary || 0}
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//               <Qty
//                 disabled={!line.roomTypeCode}
//                 qty={qty}
//                 onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
//               />

//               <div className="flex items-center gap-6 text-sm">
//                 <div>
//                   Itinerary: <b>{(itinerary || 0) * (qty || 0)}</b>
//                 </div>
//                 <IconButton
//                   danger
//                   onClick={() => onRemoveLine(segKey, line._id)}
//                   title="Remove"
//                 >
//                   <Trash2 size={16} />
//                 </IconButton>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// src/pages/Executive/CustomTourItineraryModal.jsx


import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CalendarClock,
  MapPin,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Download,
  Sparkles,
  Gift,
  BadgePercent,
} from "lucide-react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

/* =========================
   HELPERS (NO UI CHANGE)
========================= */
const uid = () => Math.random().toString(36).slice(2, 10);
const toYmd = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const asNum = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
const money = (n) => asNum(n).toLocaleString("en-IN");
const keyFor = (dayIdx, segId) => `${dayIdx}-${segId}`;

function formatDDMMYYYY(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-GB");
}

const toObjOptions = (arr, valueKey, labelKey) =>
  (Array.isArray(arr) ? arr : []).map((x) => ({
    value: x?.[valueKey],
    label: x?.[labelKey] ?? "-",
    raw: x,
  }));

const toStringOptions = (arr) =>
  (Array.isArray(arr) ? arr : []).filter(Boolean).map((s) => ({
    value: s,
    label: s,
  }));

const findOption = (options, value) =>
  (options || []).find((o) => String(o.value) === String(value)) || null;

/* =========================
   ADVANCE HELPERS (LOCKED 🔒)
   Backend decides advanceUnit
   Frontend only multiplies/sums
========================= */
const calcAdvanceUnit = (base, pct) => {
  const b = Number(base || 0);
  const p = Number(pct || 0);
  return Math.round((b * p) / 100);
};

// baseKey:
// - vehicles/addonVehicles => "basePrice"
// - foods/activities => "price"
// - accommodations => "bo"
function applyAdvance (line, baseKey)  {
  const qty = Number(line.qty || 0);

  // if backend already sent advanceUnit → use it
  // else compute using baseKey (mainly for accommodation)
  const unit =
    line.advanceUnit != null
      ? Number(line.advanceUnit || 0)
      : calcAdvanceUnit(line?.[baseKey], line?.advancePercentage);

  return {
    ...line,
    advanceUnit: unit,
    advanceTotal: unit * qty,
  };
};

/* =========================
   SMALL UI COMPONENTS
========================= */
function Qty({ disabled, qty, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
        disabled={disabled}
        onClick={() => onChange(Math.max(0, (qty || 0) - 1))}
        aria-label="decrement"
      >
        <Minus size={16} />
      </button>
      <div className="min-w-[3rem] text-center font-semibold">{qty || 0}</div>
      <button
        type="button"
        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
        disabled={disabled}
        onClick={() => onChange((qty || 0) + 1)}
        aria-label="increment"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function IconButton({ children, onClick, danger, title }) {
  return (
    <button
      type="button"
      className={[
        "w-9 h-9 rounded-lg flex items-center justify-center",
        danger
          ? "bg-red-100 hover:bg-red-200 text-red-600"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700",
      ].join(" ")}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function GlassChip({ children, theme }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border shadow-sm"
      style={{
        borderColor: `${theme}33`,
        background: `${theme}10`,
        color: theme,
      }}
    >
      {children}
    </span>
  );
}

function MiniStat({ icon: Icon, label, value, theme }) {
  return (
    <div className="rounded-2xl p-4 bg-white/75 backdrop-blur-xl border border-white/55 shadow-[0_12px_40px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            {label}
          </div>
          <div className="mt-1 text-sm font-extrabold text-slate-900 truncate">
            {value}
          </div>
        </div>
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner shrink-0"
          style={{
            background: `${theme}10`,
            color: theme,
            borderColor: `${theme}25`,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function SoftInput({
  value,
  onChange,
  theme,
  placeholder,
  type = "text",
  min = 0,
}) {
  return (
    <input
      type={type}
      min={min}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2"
      style={{ "--tw-ring-color": theme }}
    />
  );
}

/* =========================
   POINT/DISCOUNT MODAL
========================= */
function PointDiscountModal({
  open,
  theme,
  loading,
  onClose,
  margin,
  pointPercentage,
  discountPercentage,
  pax,
  discountAmount,
  setDiscountAmount,
}) {
  if (!open) return null;

  const m = asNum(margin);
  const pp = asNum(pointPercentage);
  const dp = asNum(discountPercentage);
  const p = asNum(pax);

  const maxDiscount = useMemo(() => (m * dp) / 100, [m, dp]);
  const disc = clamp(asNum(discountAmount), 0, maxDiscount || 0);

  const points = useMemo(() => {
    const effectiveMargin = Math.max(0, m - disc);
    return ((effectiveMargin * pp) / 100 / 20) * p;
  }, [m, disc, pp, p]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[140] flex items-start sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/45" onClick={onClose} />
        <motion.div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-xl mx-3 my-3 sm:my-8 rounded-[28px] border border-white/25 shadow-[0_30px_90px_rgba(15,23,42,0.55)] bg-white/92 backdrop-blur-2xl overflow-hidden max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-64px)] flex flex-col"
          initial={{ y: 22, scale: 0.985, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 12, scale: 0.99, opacity: 0 }}
          transition={{ type: "spring", stiffness: 175, damping: 18 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="h-2 w-full"
            style={{ background: `linear-gradient(90deg, ${theme}, #c7bef9)` }}
          />

          <div className="px-4 sm:px-5 py-4 border-b border-white/40 bg-white/70">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Sparkles size={14} style={{ color: theme }} />
                  Point & Discount Options
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-900 truncate">
                  Check benefit before discount
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white flex items-center justify-center shrink-0"
                aria-label="Close"
              >
                <X size={18} className="text-slate-700" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 sm:p-5 bg-gradient-to-b from-white to-purple-50/60 space-y-4">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Loading options…
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    <MiniStat
                      icon={Gift}
                      theme={theme}
                      label="You will get points"
                      value={points ? points.toFixed(2) : "0.00"}
                    />
                    <MiniStat
                      icon={BadgePercent}
                      theme={theme}
                      label="Maximum discount you can give"
                      value={money(maxDiscount)}
                    />
                  </div>

                  <div className="rounded-[24px] border border-white/55 bg-white/75 backdrop-blur-2xl shadow-[0_18px_55px_rgba(15,23,42,0.12)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Discount amount
                        </div>
                        <div className="mt-1 text-sm font-extrabold text-slate-900">
                          Enter discount to see updated points
                        </div>
                      </div>

                      <GlassChip theme={theme}>
                        Max:{" "}
                        <span className="ml-1 font-mono">
                          {money(maxDiscount)}
                        </span>
                      </GlassChip>
                    </div>

                    <div className="mt-3">
                      <SoftInput
                        type="number"
                        min={0}
                        theme={theme}
                        value={discountAmount}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") return setDiscountAmount("");
                          const num = asNum(v);
                          setDiscountAmount(
                            String(clamp(num, 0, maxDiscount || 0))
                          );
                        }}
                        placeholder="0"
                      />
                      <div className="mt-2 text-[11px] text-slate-500">
                        Points will be recalculated automatically.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-5 py-4 border-t border-white/40 bg-white/70 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white text-sm font-extrabold text-slate-700"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function CustomTourItineraryModal({
  client,
  brandColor,
  onClose,
  onCompleted,
}) {
  if (!client) return null;

  const theme = brandColor || "#8570EE";

  // react-select styles (keep premium UI)
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 14,
        borderColor: state.isFocused ? theme : "#e5e7eb",
        boxShadow: state.isFocused ? `0 0 0 2px ${theme}22` : "none",
        minHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? theme : "#d1d5db" },
      }),
      valueContainer: (b) => ({ ...b, padding: "0 12px" }),
      input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
      dropdownIndicator: (b) => ({
        ...b,
        color: "#6b7280",
        ":hover": { color: "#4b5563" },
      }),
      menu: (b) => ({
        ...b,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 18px 50px rgba(15,23,42,0.18)",
        zIndex: 250,
      }),
      option: (b, s) => ({
        ...b,
        backgroundColor: s.isFocused
          ? `${theme}14`
          : s.isSelected
          ? `${theme}22`
          : "white",
        color: "#222",
      }),
      placeholder: (b) => ({ ...b, color: "#6b7280" }),
      singleValue: (b) => ({ ...b, color: "#111827" }),
    }),
    [theme]
  );

  // schedule follow-up
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  // day ui
  const [dayIndex, setDayIndex] = useState(0);

  // itinerary days
  const [days, setDays] = useState([]);
  const daysCount = Math.max(1, Number(client.numberOfDays || 1));

  // catalogs
  const [countries, setCountries] = useState([]);
  const [statesByKey, setStatesByKey] = useState({});
  const [destsByKey, setDestsByKey] = useState({});
  const [tripsByKey, setTripsByKey] = useState({});
  const [tripDetailsByKey, setTripDetailsByKey] = useState({}); // addons + activities

  // ✅ accommodation hotel categories cache (per segment)
  const [accHotelCatsByKey, setAccHotelCatsByKey] = useState({});

  // pricing catalogs per segment
  const [vehOptions, setVehOptions] = useState({});
  const [addonVehOptions, setAddonVehOptions] = useState({});
  const [foodOptions, setFoodOptions] = useState({});
  const [actPricing, setActPricing] = useState({});
  const [accOptions, setAccOptions] = useState({});

  // editable lines per segment
  const [vehLines, setVehLines] = useState({});
  const [addonVehLines, setAddonVehLines] = useState({});
  const [foodLines, setFoodLines] = useState({});
  const [actLines, setActLines] = useState({});
  const [accLines, setAccLines] = useState({});

  // point/discount popup
  const [pdOpen, setPdOpen] = useState(false);
  const [pdLoading, setPdLoading] = useState(false);
  const [pdData, setPdData] = useState({
    pointPercentage: 0,
    discountPercentage: 0,
  });
  const [discountAmount, setDiscountAmount] = useState("0");

  // init days whenever client changes
  useEffect(() => {
    const start = client.startDate ? new Date(client.startDate) : new Date();
    const init = Array.from({ length: daysCount }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        dayLabel: `Day ${i + 1}`,
        date: d.toISOString(),
        segments: [
          {
            _id: uid(),
            country: "",
            state: "",
            destination: "",
            trip: "",
            selectedAddon: "",
            selectedActivities: [],
          },
        ],
      };
    });

    setDays(init);
    setDayIndex(0);

    // reset discount when client changes
    setDiscountAmount("0");
    setPdOpen(false);

    // reset accommodation category cache
    setAccHotelCatsByKey({});
  }, [client?._id]);

  // load countries once
  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/executive/countries");
        setCountries(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load countries");
      }
    })();
  }, []);

  const currentDay = days[dayIndex];

  /* =========================
     CLEAR HELPERS
  ========================= */
  const clearSegPricingOnly = (segKey) => {
    const del = (setter) =>
      setter((p) => {
        const n = { ...p };
        delete n[segKey];
        return n;
      });

    del(setVehOptions);
    del(setAddonVehOptions);
    del(setFoodOptions);
    del(setActPricing);
    del(setAccOptions);

    del(setVehLines);
    del(setAddonVehLines);
    del(setFoodLines);
    del(setActLines);
    del(setAccLines);

    del(setTripDetailsByKey);
    del(setAccHotelCatsByKey);
  };

  const clearSegLocationChain = (segKey) => {
    const del = (setter) =>
      setter((p) => {
        const n = { ...p };
        delete n[segKey];
        return n;
      });

    del(setStatesByKey);
    del(setDestsByKey);
    del(setTripsByKey);
  };

  /* =========================
     SEGMENT MUTATIONS
  ========================= */
  const updateSegment = (dIdx, segId, next) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dIdx) return d;
        return {
          ...d,
          segments: (d.segments || []).map((s) =>
            String(s._id) === String(segId) ? { ...s, ...next } : s
          ),
        };
      })
    );
  };

  const addSegment = (dIdx) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dIdx) return d;
        return {
          ...d,
          segments: [
            ...(d.segments || []),
            {
              _id: uid(),
              country: "",
              state: "",
              destination: "",
              trip: "",
              selectedAddon: "",
              selectedActivities: [],
            },
          ],
        };
      })
    );
  };

  const removeSegment = (dIdx, segId) => {
    const segKey = keyFor(dIdx, segId);

    clearSegPricingOnly(segKey);
    clearSegLocationChain(segKey);

    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dIdx) return d;
        const nextSegs = (d.segments || []).filter(
          (s) => String(s._id) !== String(segId)
        );
        return { ...d, segments: nextSegs.length ? nextSegs : d.segments };
      })
    );
  };

  /* =========================
     LOCATION FETCHERS
  ========================= */
  const fetchStates = async (countryId, segKey) => {
    if (!countryId) return;
    try {
      const { data } = await API.get(`/executive/states/${countryId}`);
      setStatesByKey((p) => ({
        ...p,
        [segKey]: Array.isArray(data) ? data : [],
      }));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load states");
    }
  };

  const fetchDestinations = async (countryId, stateId, segKey) => {
    if (!countryId || !stateId) return;
    try {
      const { data } = await API.get(
        `/executive/destinationsByCountryAndState/${countryId}/${stateId}`
      );
      setDestsByKey((p) => ({
        ...p,
        [segKey]: Array.isArray(data) ? data : [],
      }));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load destinations");
    }
  };

  const fetchTrips = async (countryId, stateId, destinationId, segKey) => {
    if (!countryId || !stateId || !destinationId) return;
    try {
      const { data } = await API.get(
        `/executive/tripsByLocation/${countryId}/${stateId}/${destinationId}`
      );
      setTripsByKey((p) => ({
        ...p,
        [segKey]: Array.isArray(data) ? data : [],
      }));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load trips");
    }
  };

  const fetchTripDetails = async (tripId, segKey) => {
    if (!tripId) return;
    try {
      const { data } = await API.get(`/executive/tripDetails/${tripId}`);
      setTripDetailsByKey((p) => ({
        ...p,
        [segKey]: data || { addonTrips: [], activities: [] },
      }));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load trip details");
    }
  };

  // ✅ PART 1 END HERE
  // PART 2 will include:
  // - PRICING FETCHERS (tripVehicles/addonVehicles/foods/activities/accommodations)
  // - LINE CRUD helpers updated to store advancePercentage/advanceUnit/advanceTotal
  /* =========================
     PRICING FETCHERS (PER SEG)
     ✅ backend decides advanceUnit (except accommodation room advanceUnit computed in FE)
     ✅ frontend stores advancePercentage/advanceUnit and keeps them refreshed
  ========================= */

  const fetchVehiclesForSeg = async (tripId, dateYmd, dIdx, segId) => {
    const segKey = keyFor(dIdx, segId);
    if (!tripId || !dateYmd) return;

    try {
      const { data } = await API.get(`/executive/tripVehicles/${tripId}`, {
        params: { date: dateYmd },
      });

      setVehOptions((p) => ({ ...p, [segKey]: data }));

      // ✅ refresh existing selected lines from latest options
      setVehLines((p) => {
        const existing = p[segKey] || [];
        if (!existing.length) return { ...p, [segKey]: [] };

        const { options = {} } = data || {};
        const updated = existing.map((line) => {
          const vehicles = options[line.category] || [];
          const match = vehicles.find(
            (v) => String(v.vehicleId) === String(line.vehicleId)
          );

          // if not found, just recompute totals from stored fields
          if (!match) return applyAdvance(line, "basePrice");

          const next = {
            ...line,
            vehicleName: match.vehicleName ?? line.vehicleName ?? "",
            basePrice: Number(match.basePrice ?? line.basePrice ?? 0),
            percentage: Number(match.percentage ?? line.percentage ?? 0),
            vendorId: match.vendor ?? line.vendorId ?? null,

            // ✅ advance from backend
            advancePercentage: Number(
              match.advancePercentage ?? line.advancePercentage ?? 0
            ),
            advanceUnit:
              match.advanceUnit != null
                ? Number(match.advanceUnit || 0)
                : line.advanceUnit,
          };

          return applyAdvance(next, "basePrice");
        });

        return { ...p, [segKey]: updated };
      });
    } catch (e) {
      console.error("tripVehicles fetch failed", e);
      toast.error("Failed to load vehicles for this segment.");
    }
  };

  const fetchAddonVehiclesForSeg = async (addonTripId, dateYmd, dIdx, segId) => {
    const segKey = keyFor(dIdx, segId);
    if (!addonTripId || !dateYmd) return;

    try {
      const { data } = await API.get(
        `/executive/addonTripVehicles/${addonTripId}`,
        { params: { date: dateYmd } }
      );

      setAddonVehOptions((p) => ({ ...p, [segKey]: data }));

      setAddonVehLines((p) => {
        const existing = p[segKey] || [];
        if (!existing.length) return { ...p, [segKey]: [] };

        const { options = {} } = data || {};
        const updated = existing.map((line) => {
          const vehicles = options[line.category] || [];
          const match = vehicles.find(
            (v) => String(v.vehicleId) === String(line.vehicleId)
          );

          if (!match) return applyAdvance(line, "basePrice");

          const next = {
            ...line,
            vehicleName: match.vehicleName ?? line.vehicleName ?? "",
            basePrice: Number(match.basePrice ?? line.basePrice ?? 0),
            percentage: Number(match.percentage ?? line.percentage ?? 0),
            vendorId: match.vendor ?? line.vendorId ?? null,

            // ✅ advance from backend
            advancePercentage: Number(
              match.advancePercentage ?? line.advancePercentage ?? 0
            ),
            advanceUnit:
              match.advanceUnit != null
                ? Number(match.advanceUnit || 0)
                : line.advanceUnit,
          };

          return applyAdvance(next, "basePrice");
        });

        return { ...p, [segKey]: updated };
      });
    } catch (e) {
      console.error("addonTripVehicles fetch failed", e);
      toast.error("Failed to load add-on vehicles for this segment.");
    }
  };

  const fetchFoodsForSeg = async (tripId, dateYmd, dIdx, segId) => {
    const segKey = keyFor(dIdx, segId);
    if (!tripId || !dateYmd) return;

    try {
      const { data } = await API.get(`/executive/tripFoods/${tripId}`, {
        params: { date: dateYmd },
      });

      setFoodOptions((p) => ({ ...p, [segKey]: data }));

      setFoodLines((p) => {
        const existing = p[segKey] || [];
        if (!existing.length) return { ...p, [segKey]: [] };

        const { options = {} } = data || {};
        const updated = existing.map((line) => {
          const cat = line.mealCategory || "";
          const type = line.mealType || "";
          const itemsForType = options[cat]?.[type] || [];

          const match = itemsForType.find((it) => it.foodName === line.foodName);
          if (!match) return applyAdvance(line, "price");

          const itineraryUnit =
            match.itineraryPrice != null && !isNaN(match.itineraryPrice)
              ? Number(match.itineraryPrice)
              : Math.round(
                  Number(match.price || 0) *
                    (1 + Number(match.percent || 0) / 100)
                );

          const next = {
            ...line,
            description: match.description ?? line.description ?? "",
            price: Number(match.price ?? line.price ?? 0),
            percent: Number(match.percent ?? line.percent ?? 0),
            itineraryUnit: Number(itineraryUnit || 0),
            vendorId: match.vendor ?? line.vendorId ?? null,
            vendorName: match.vendorName ?? line.vendorName ?? "",

            // ✅ advance from backend
            advancePercentage: Number(
              match.advancePercentage ?? line.advancePercentage ?? 0
            ),
            advanceUnit:
              match.advanceUnit != null
                ? Number(match.advanceUnit || 0)
                : line.advanceUnit,
          };

          return applyAdvance(next, "price");
        });

        return { ...p, [segKey]: updated };
      });
    } catch (e) {
      console.error("tripFoods fetch failed", e);
      toast.error("Failed to load foods for this segment.");
    }
  };

  const fetchActivitiesForSeg = async (activityIds, dateYmd, dIdx, segId) => {
    const segKey = keyFor(dIdx, segId);

    if (!Array.isArray(activityIds) || !activityIds.length || !dateYmd) {
      toast.info("No activities to load for this segment.");
      return;
    }

    try {
      const ids = activityIds
        .map((a) => (typeof a === "object" ? a._id : a))
        .filter(Boolean)
        .join(",");

      const { data } = await API.get(`/executive/activitiesPricing`, {
        params: { ids, date: dateYmd },
      });

      // map for quick lookup (unchanged style)
      const map = {};
      (data.items || []).forEach((it) => {
        map[it.activityId] = {
          name: it.activityName,
          price: Number(it.price || 0),
          percentage: Number(it.percentage || 0),
          itineraryPrice: Number(it.itineraryPrice || 0),
          vendorId: it.vendorId || null,
          vendorName: it.vendorName || "",

          // ✅ advance from backend
          advancePercentage: Number(it.advancePercentage || 0),
          advanceUnit: Number(it.advanceUnit || 0),
        };
      });
      setActPricing((p) => ({ ...p, [segKey]: map }));

      setActLines((p) => {
        const existing = p[segKey] || [];
        const items = data.items || [];

        // ✅ refresh existing
        if (existing.length) {
          const updated = existing.map((line) => {
            const match = items.find(
              (it) => String(it.activityId) === String(line.activityId)
            );
            if (!match) return applyAdvance(line, "price");

            const price = Number(match.price || 0);
            const percentage = Number(match.percentage || 0);
            const itineraryUnit =
              match.itineraryPrice != null && !isNaN(match.itineraryPrice)
                ? Number(match.itineraryPrice)
                : Math.round(price * (1 + percentage / 100));

            const next = {
              ...line,
              name: match.activityName ?? line.name ?? "",
              price,
              percentage,
              itineraryUnit: Number(itineraryUnit || 0),
              vendorId: match.vendorId || line.vendorId || null,
              vendorName: match.vendorName ?? line.vendorName ?? "",

              // ✅ advance from backend
              advancePercentage: Number(match.advancePercentage || 0),
              advanceUnit:
                match.advanceUnit != null
                  ? Number(match.advanceUnit || 0)
                  : line.advanceUnit,
            };

            return applyAdvance(next, "price");
          });

          return { ...p, [segKey]: updated };
        }

        // ✅ create fresh lines
        const fresh = items.map((it) => {
          const price = Number(it.price || 0);
          const percentage = Number(it.percentage || 0);
          const itineraryUnit =
            it.itineraryPrice != null && !isNaN(it.itineraryPrice)
              ? Number(it.itineraryPrice)
              : Math.round(price * (1 + percentage / 100));

          const base = {
            _id: uid(),
            activityId: it.activityId,
            name: it.activityName,
            price,
            percentage,
            itineraryUnit: Number(itineraryUnit || 0),
            qty: 0,
            vendorId: it.vendorId || null,
            vendorName: it.vendorName || "",

            // ✅ advance from backend
            advancePercentage: Number(it.advancePercentage || 0),
            advanceUnit: Number(it.advanceUnit || 0),
            advanceTotal: 0,
          };

          return applyAdvance(base, "price");
        });

        return { ...p, [segKey]: fresh };
      });
    } catch (e) {
      console.error("activitiesPricing fetch failed", e);
      toast.error("Failed to load activities pricing for this segment.");
    }
  };

  const fetchAccForSeg = async (destinationId, dateYmd, dIdx, segId) => {
    const segKey = keyFor(dIdx, segId);
    if (!destinationId || !dateYmd) return;

    try {
      const { data } = await API.get(`/executive/accommodationsPricing`, {
        params: { destinationId, date: dateYmd },
      });

      setAccOptions((p) => ({ ...p, [segKey]: data }));

      // hotel categories list per segment
      const props = data?.properties || [];
      const cats = Array.from(
        new Set((props || []).map((x) => x?.hotelCategory).filter(Boolean))
      );
      setAccHotelCatsByKey((p) => ({ ...p, [segKey]: cats }));

      // ✅ refresh existing lines from latest properties
      setAccLines((p) => {
        const existing = p[segKey] || [];
        if (!existing.length) return { ...p, [segKey]: [] };

        const updated = existing.map((line) => {
          const prop = props.find(
            (x) => String(x.accommodationId) === String(line.accommodationId)
          );

          if (!prop) return applyAdvance(line, "bo");

          const room = (prop.roomTypes || []).find(
            (r) => r.code === line.roomTypeCode
          );

          // IMPORTANT: backend gives only advancePercentage for accommodation.
          // advanceUnit must be calculated in FE from selected room bo.
          const next = {
            ...line,
            propertyName: prop.propertyName ?? line.propertyName ?? "",
            hotelCategory: prop.hotelCategory || line.hotelCategory || "",
            roomCategory: prop.roomCategory || line.roomCategory || "",
            commission: Number(prop.commission ?? line.commission ?? 0),
            vendorId: prop.vendorId ?? line.vendorId ?? null,
            vendorName: prop.vendorName ?? line.vendorName ?? "",

            // ✅ advancePercentage from backend
            advancePercentage: Number(
              prop.advancePercentage ?? line.advancePercentage ?? 0
            ),
          };

          const withRoom = room
            ? {
                ...next,
                bo: Number(room.bo ?? line.bo ?? 0),
                itinerary: Number(room.itinerary ?? line.itinerary ?? 0),

                // ✅ compute advanceUnit from selected room BO & advancePercentage
                advanceUnit: calcAdvanceUnit(
                  Number(room.bo ?? line.bo ?? 0),
                  Number(prop.advancePercentage ?? line.advancePercentage ?? 0)
                ),
              }
            : next;

          return applyAdvance(withRoom, "bo");
        });

        return { ...p, [segKey]: updated };
      });
    } catch (e) {
      console.error("accommodationsPricing fetch failed", e);
      toast.error("Failed to load accommodations for this segment.");
    }
  };

  /* =========================
     LINE CRUD HELPERS
     ✅ stores advance fields + keeps advanceTotal updated on qty change
  ========================= */

  // vehicles
  const addVehLine = (segKey) => {
    setVehLines((p) => ({
      ...p,
      [segKey]: [
        ...(p[segKey] || []),
        applyAdvance(
          {
            _id: uid(),
            category: "",
            vehicleId: "",
            vehicleName: "",
            percentage: 0,
            basePrice: 0,
            qty: 0,
            vendorId: null,
            vendorName: "",

            // ✅ NEW
            advancePercentage: 0,
            advanceUnit: 0,
            advanceTotal: 0,
          },
          "basePrice"
        ),
      ],
    }));
  };

  const updateVehLine = (segKey, id, next) =>
    setVehLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) =>
        l._id === id ? applyAdvance({ ...l, ...next }, "basePrice") : l
      ),
    }));

  const removeVehLine = (segKey, id) =>
    setVehLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));

  // add-on vehicles
  const addAddonVehLine = (segKey) => {
    setAddonVehLines((p) => ({
      ...p,
      [segKey]: [
        ...(p[segKey] || []),
        applyAdvance(
          {
            _id: uid(),
            category: "",
            vehicleId: "",
            vehicleName: "",
            percentage: 0,
            basePrice: 0,
            qty: 0,
            vendorId: null,
            vendorName: "",

            // ✅ NEW
            advancePercentage: 0,
            advanceUnit: 0,
            advanceTotal: 0,
          },
          "basePrice"
        ),
      ],
    }));
  };

  const updateAddonVehLine = (segKey, id, next) =>
    setAddonVehLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) =>
        l._id === id ? applyAdvance({ ...l, ...next }, "basePrice") : l
      ),
    }));

  const removeAddonVehLine = (segKey, id) =>
    setAddonVehLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));

  // foods
  const addFoodLine = (segKey) => {
    setFoodLines((p) => ({
      ...p,
      [segKey]: [
        ...(p[segKey] || []),
        applyAdvance(
          {
            _id: uid(),
            mealCategory: "",
            mealType: "",
            foodName: "",
            description: "",
            price: 0,
            percent: 0,
            itineraryUnit: 0,
            qty: 0,
            vendorId: null,
            vendorName: "",

            // ✅ NEW
            advancePercentage: 0,
            advanceUnit: 0,
            advanceTotal: 0,
          },
          "price"
        ),
      ],
    }));
  };

  const updateFoodLine = (segKey, id, next) =>
    setFoodLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) =>
        l._id === id ? applyAdvance({ ...l, ...next }, "price") : l
      ),
    }));

  const removeFoodLine = (segKey, id) =>
    setFoodLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));

  // activities
  const updateActQty = (segKey, id, qty) =>
    setActLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) =>
        l._id === id ? applyAdvance({ ...l, qty }, "price") : l
      ),
    }));

  const removeActLine = (segKey, id) =>
    setActLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));

  // accommodation (hotel category first)
  const addAccLine = (segKey) => {
    setAccLines((p) => ({
      ...p,
      [segKey]: [
        ...(p[segKey] || []),
        applyAdvance(
          {
            _id: uid(),
            hotelCategory: "",
            accommodationId: "",
            propertyName: "",
            roomCategory: "",
            roomTypeCode: "",
            commission: 0,
            bo: 0,
            itinerary: 0,
            qty: 0,
            vendorId: null,
            vendorName: "",

            // ✅ NEW
            advancePercentage: 0,
            advanceUnit: 0,
            advanceTotal: 0,
          },
          "bo"
        ),
      ],
    }));
  };

  const updateAccLine = (segKey, id, next) =>
    setAccLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) =>
        l._id === id ? applyAdvance({ ...l, ...next }, "bo") : l
      ),
    }));

  const removeAccLine = (segKey, id) =>
    setAccLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));

  // ✅ PART 2 END HERE
  // PART 3 will include:
  // - TOTALS (itinerary + BO)
  // - ✅ grandAdvance = sum of advanceTotal across all line types
  // - payload builder includes advance fields
  // - discount/points + download handlers
// ===============================
// PART 3
// - applyAdvance helper (LOCKED logic)
// - totals (itinerary + BO)
// - ✅ grandAdvance = sum(advanceTotal) across all line types
// - payload builder includes advance fields
// - discount/point + download handlers (UNCHANGED UI)
// ===============================

  /* =========================
     ADVANCE HELPERS (LOCKED 🔒)
     Backend decides advanceUnit for:
       - trip vehicles, addon vehicles, foods, activities
     Frontend decides advanceUnit ONLY for accommodation using selected room BO + advancePercentage
     Frontend always calculates:
       advanceTotal = advanceUnit * qty
  ========================= */

  const calcAdvanceUnit = (base, pct) => {
    const b = Number(base || 0);
    const p = Number(pct || 0);
    if (!b || !p) return 0;
    return Math.round((b * p) / 100);
  };

  const applyAdvance = (line, baseKey) => {
    const qty = Number(line?.qty || 0);

    const advancePct = Number(line?.advancePercentage || 0);

    // if backend already provided advanceUnit, keep it
    // else compute from baseKey (used mainly for accommodation)
    let unit =
      line?.advanceUnit != null && !Number.isNaN(Number(line.advanceUnit))
        ? Number(line.advanceUnit || 0)
        : calcAdvanceUnit(Number(line?.[baseKey] || 0), advancePct);

    if (!Number.isFinite(unit)) unit = 0;

    const total = Math.round(unit * qty);

    return {
      ...line,
      advancePercentage: advancePct,
      advanceUnit: unit,
      advanceTotal: total,
    };
  };

  /* =========================
     TOTALS
     - itinerary total same as before
     - bo total same as before
     - ✅ grandAdvance from advanceTotal ONLY (frontend multiplies & sums)
  ========================= */

  const { perDayItin, grandItin } = useMemo(() => {
    const perDay = {};
    let total = 0;

    const add = (dayIdx, itin) => {
      perDay[dayIdx] = (perDay[dayIdx] || 0) + itin;
      total += itin;
    };

    const run = (map, calcItin) => {
      for (const segKey in map) {
        const [dStr] = segKey.split("-");
        const dIdx = Number(dStr);
        for (const line of map[segKey] || []) {
          const qty = Number(line.qty || 0);
          if (!qty) continue;
          add(dIdx, calcItin(line) * qty);
        }
      }
    };

    // Vehicles itinerary unit = basePrice * (1 + percentage/100)
    run(vehLines, (l) => {
      const base = Number(l.basePrice || 0);
      const perc = Number(l.percentage || 0);
      return Math.round(base * (1 + perc / 100));
    });

    run(addonVehLines, (l) => {
      const base = Number(l.basePrice || 0);
      const perc = Number(l.percentage || 0);
      return Math.round(base * (1 + perc / 100));
    });

    // Foods already store itineraryUnit
    run(foodLines, (l) => Number(l.itineraryUnit || 0));

    // Activities store itineraryUnit
    run(actLines, (l) => Number(l.itineraryUnit || 0));

    // Accommodation uses itinerary unit
    run(accLines, (l) => Number(l.itinerary || 0));

    return { perDayItin: perDay, grandItin: total };
  }, [vehLines, addonVehLines, foodLines, actLines, accLines]);

  const { perDayBo, grandBo } = useMemo(() => {
    const perDay = {};
    let total = 0;

    const add = (dayIdx, bo) => {
      perDay[dayIdx] = (perDay[dayIdx] || 0) + bo;
      total += bo;
    };

    const run = (map, calcBo) => {
      for (const segKey in map) {
        const [dStr] = segKey.split("-");
        const dIdx = Number(dStr);
        for (const line of map[segKey] || []) {
          const qty = Number(line.qty || 0);
          if (!qty) continue;
          add(dIdx, calcBo(line) * qty);
        }
      }
    };

    run(vehLines, (l) => Number(l.basePrice || 0));
    run(addonVehLines, (l) => Number(l.basePrice || 0));
    run(foodLines, (l) => Number(l.price || 0));
    run(actLines, (l) => Number(l.price || 0));
    run(accLines, (l) => Number(l.bo || 0));

    return { perDayBo: perDay, grandBo: total };
  }, [vehLines, addonVehLines, foodLines, actLines, accLines]);

  const margin = useMemo(
    () => Math.max(0, Number(grandItin || 0) - Number(grandBo || 0)),
    [grandItin, grandBo]
  );

  // ✅ TOTAL ADVANCE (LOCKED)
  // frontend only multiplies & sums advanceTotal already maintained by applyAdvance()
  const grandAdvance = useMemo(() => {
    let total = 0;

    const run = (map) => {
      for (const segKey in map) {
        for (const line of map[segKey] || []) {
          total += Number(line.advanceTotal || 0);
        }
      }
    };

    run(vehLines);
    run(addonVehLines);
    run(foodLines);
    run(actLines);
    run(accLines);

    return Math.round(total);
  }, [vehLines, addonVehLines, foodLines, actLines, accLines]);

  /* =========================
     PAYLOAD BUILDER
     ✅ includes advance fields in each line
     ✅ totals include grandAdvance
  ========================= */

  const buildItineraryPayload = () => {
    return {
      clientId: client._id,
      clientSnapshot: {
        clientId: client.clientId,
        name: client.name,
        numberOfPersons: client.numberOfPersons,
        startDate: client.startDate,
        numberOfDays: client.numberOfDays,
        primaryDestinationName: client.primaryDestinationName,
      },
      itinerary: days.map((d, dIdx) => ({
        dayLabel: d.dayLabel || `Day ${dIdx + 1}`,
        date: d.date,
        segments: (d.segments || []).map((s) => {
          const segKey = keyFor(dIdx, s._id);

          return {
            segmentId: s._id,
            country: s.country || null,
            state: s.state || null,
            destination: s.destination || null,
            trip: s.trip || null,
            selectedAddon: s.selectedAddon || null,
            selectedActivities: s.selectedActivities || [],

            // ✅ include advance fields inside each line array
            tripVehicles: (vehLines[segKey] || []).map((l) => ({
              ...l,
              advancePercentage: Number(l.advancePercentage || 0),
              advanceUnit: Number(l.advanceUnit || 0),
              advanceTotal: Number(l.advanceTotal || 0),
            })),
            addonVehicles: (addonVehLines[segKey] || []).map((l) => ({
              ...l,
              advancePercentage: Number(l.advancePercentage || 0),
              advanceUnit: Number(l.advanceUnit || 0),
              advanceTotal: Number(l.advanceTotal || 0),
            })),
            foods: (foodLines[segKey] || []).map((l) => ({
              ...l,
              advancePercentage: Number(l.advancePercentage || 0),
              advanceUnit: Number(l.advanceUnit || 0),
              advanceTotal: Number(l.advanceTotal || 0),
            })),
            activities: (actLines[segKey] || []).map((l) => ({
              ...l,
              advancePercentage: Number(l.advancePercentage || 0),
              advanceUnit: Number(l.advanceUnit || 0),
              advanceTotal: Number(l.advanceTotal || 0),
            })),
            accommodations: (accLines[segKey] || []).map((l) => ({
              ...l,
              advancePercentage: Number(l.advancePercentage || 0),
              advanceUnit: Number(l.advanceUnit || 0),
              advanceTotal: Number(l.advanceTotal || 0),
            })),
          };
        }),
      })),
      totals: {
        perDayItinerary: days.map((_, i) => perDayItin[i] || 0),
        grandItinerary: grandItin,
        perDayBo: days.map((_, i) => perDayBo[i] || 0),
        grandBo: grandBo,
        margin: margin,

        // ✅ NEW
        grandAdvance: grandAdvance,
      },
    };
  };

  /* =========================
     DISCOUNT + POINT HELPERS
     (no UI change)
  ========================= */

  const calcDiscountAndPoints = () => {
    const pax = Number(client.numberOfPersons || 0);
    const pp = Number(pdData.pointPercentage || 0);
    const dp = Number(pdData.discountPercentage || 0);

    const maxDiscount = (margin * dp) / 100;
    const disc = clamp(Number(discountAmount || 0), 0, maxDiscount || 0);

    const effectiveMargin = Math.max(0, margin - disc);
    const executivePoint = ((effectiveMargin * pp) / 100 / 20) * pax;

    return { disc, executivePoint };
  };

  const openPointDiscount = async () => {
    try {
      setPdOpen(true);
      setPdLoading(true);

      const res = await API.get(
        "/executive/custom-tour-point-discount-options",
        { params: { clientId: client._id } }
      );

      const payload = res.data || {};
      const pointPercentage = Number(payload.pointPercentage || 0);
      const discountPercentage = Number(payload.discountPercentage || 0);

      setPdData({ pointPercentage, discountPercentage });

      const maxDiscount = (margin * discountPercentage) / 100;
      setDiscountAmount((prev) =>
        String(clamp(Number(prev || 0), 0, maxDiscount || 0))
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load point/discount options"
      );
      setPdOpen(false);
    } finally {
      setPdLoading(false);
    }
  };

  /* =========================
     DOWNLOAD HANDLERS (UNCHANGED)
  ========================= */

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "itinerary.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleReferralDownload = async () => {
    if (!nextDate || !nextTime) {
      toast.error("Please choose follow-up date and time for referral itinerary");
      return;
    }

    try {
      setLoadingReferral(true);
      const payload = buildItineraryPayload();
      const { disc, executivePoint } = calcDiscountAndPoints();
      console.log("📦 Referral Itinerary Payload:", {
      ...payload,
      nextDateRaw: nextDate,
      nextTimeRaw: nextTime,
      discountAmount: disc,
      executivePoint,
    });

      const res = await API.post(
        "/executive/custom-tour-referral-itinerary",
        {
          ...payload,
          nextDateRaw: nextDate,
          nextTimeRaw: nextTime,
          discountAmount: disc,
          executivePoint,
        },
        { responseType: "blob" }
      );

      downloadBlob(
        res.data,
        `CustomTour-Referral-${client.clientId || client._id}.pdf`
      );
      toast.success("Referral itinerary downloaded");

      if (typeof onCompleted === "function") onCompleted();
      else if (typeof onClose === "function") onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to process referral itinerary";
      toast.error(msg);
    } finally {
      setLoadingReferral(false);
    }
  };

  const handleConfirmDownload = async () => {
    try {
      setLoadingConfirm(true);
      const payload = buildItineraryPayload();
      const { disc, executivePoint } = calcDiscountAndPoints();

      const res = await API.post(
        "/executive/custom-tour-confirm-itinerary",
        {
          ...payload,
          nextDateRaw: nextDate || null,
          nextTimeRaw: nextTime || null,
          discountAmount: disc,
          executivePoint,
        },
        { responseType: "blob" }
      );

      downloadBlob(
        res.data,
        `CustomTour-Confirm-${client.clientId || client._id}.pdf`
      );
      toast.success("Confirmed itinerary downloaded");

      if (typeof onCompleted === "function") onCompleted();
      else if (typeof onClose === "function") onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to process confirmed itinerary";
      toast.error(msg);
    } finally {
      setLoadingConfirm(false);
    }
  };

  /* =========================
     OPTIONS (COUNTRIES)
  ========================= */

  const countryOpts = useMemo(
    () => toObjOptions(countries, "_id", "name"),
    [countries]
  );

  // ✅ END OF PART 3
  // PART 4 will be FULL return() + subcomponents updates:
  // - VehicleLines should set advancePercentage/advanceUnit from option raw
  // - FoodLines same
  // - ActivityLines already uses lines
  // - AccommodationLines must compute advanceUnit when room selected (bo * advancePercentage)
  // - UI shows only Total Advance (already in return)
// ===============================
// PART 4 (FINAL)
// - FULL return() UI (NO SKIPS)
// - Subcomponents updated to track advancePercentage/advanceUnit
// - Accommodation advanceUnit computed from selected room BO * advancePercentage (frontend)
// ===============================

  /* ===============================
     MAIN return()
  ================================ */
  return (
    <>
      <style>{`
        /* Chrome / Edge / Safari */
        .ct-glass-scroll::-webkit-scrollbar { width: 10px; }
        .ct-glass-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.35);
          border-radius: 999px;
          backdrop-filter: blur(14px);
        }
        .ct-glass-scroll::-webkit-scrollbar-thumb {
          background: rgba(133,112,238,0.28);
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.45);
          backdrop-filter: blur(14px);
        }
        .ct-glass-scroll::-webkit-scrollbar-thumb:hover { background: rgba(133,112,238,0.42); }

        /* Firefox */
        .ct-glass-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(133,112,238,0.35) rgba(255,255,255,0.25);
        }
      `}</style>

      {/* Point & Discount Modal */}
      <PointDiscountModal
        open={pdOpen}
        theme={theme}
        loading={pdLoading}
        onClose={() => setPdOpen(false)}
        margin={margin}
        pointPercentage={pdData.pointPercentage}
        discountPercentage={pdData.discountPercentage}
        pax={Number(client.numberOfPersons || 0)}
        discountAmount={discountAmount}
        setDiscountAmount={setDiscountAmount}
      />

      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-6xl mx-3 rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.55)] p-5 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-hidden"
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Custom Tour
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                  Custom Tour Itinerary Builder
                </div>

                <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                  <div>
                    Client:{" "}
                    <span className="font-medium">{client.name || "Client"}</span>{" "}
                    <span className="font-mono text-[11px] text-slate-400">
                      ({client.clientId})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px]">
                    {client.primaryDestinationName?.label && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {client.primaryDestinationName.label}
                      </span>
                    )}
                    {client.numberOfDays && (
                      <span className="flex items-center gap-1">
                        <CalendarClock size={11} />
                        {client.numberOfDays} days
                      </span>
                    )}
                    {typeof client.numberOfPersons !== "undefined" && (
                      <span className="flex items-center gap-1">
                        <CircleDot size={11} />
                        <span>
                          Pax:{" "}
                          <span className="font-semibold">
                            {client.numberOfPersons}
                          </span>
                        </span>
                      </span>
                    )}
                    {client.startDate && (
                      <span className="flex items-center gap-1">
                        <CalendarClock size={11} />
                        <span>
                          Start:{" "}
                          <span className="font-semibold">
                            {formatDDMMYYYY(client.startDate)}
                          </span>
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* schedule date/time */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme}22`, color: theme }}
                >
                  <CalendarClock size={16} />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Schedule follow-up
                </div>
                <div className="ml-auto text-xs text-slate-500">
                  Referral: required • Confirm: optional
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    Next contact date
                  </div>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2"
                    style={{ "--tw-ring-color": theme }}
                  />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    Next contact time
                  </div>
                  <input
                    type="time"
                    value={nextTime}
                    onChange={(e) => setNextTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2"
                    style={{ "--tw-ring-color": theme }}
                  />
                </div>
              </div>
            </div>

            {/* day nav + totals */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDayIndex((p) => clamp(p - 1, 0, days.length - 1))
                  }
                  className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50"
                  disabled={dayIndex === 0}
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="px-3 py-2 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500">Current Day</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {currentDay?.dayLabel || `Day ${dayIndex + 1}`} •{" "}
                    {formatDDMMYYYY(currentDay?.date)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDayIndex((p) => clamp(p + 1, 0, days.length - 1))
                  }
                  className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50"
                  disabled={dayIndex >= days.length - 1}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Totals box */}
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
                <div className="text-[11px] text-slate-500">Totals</div>
                <div className="flex flex-wrap gap-5">
                  <div>
                    Day Itin:{" "}
                    <span className="font-bold">{perDayItin[dayIndex] || 0}</span>
                  </div>
                  <div>
                    Total Itin: <span className="font-bold">{grandItin || 0}</span>
                  </div>

                  <div className="hidden sm:block h-5 w-[1px] bg-slate-200" />

                  <div>
                    Total Advance:{" "}
                    <span className="font-bold">{grandAdvance || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* swipe area */}
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white ct-glass-scroll">
              <motion.div
                key={dayIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 80)
                    setDayIndex((p) => clamp(p - 1, 0, days.length - 1));
                  if (info.offset.x < -80)
                    setDayIndex((p) => clamp(p + 1, 0, days.length - 1));
                }}
                className="p-4 sm:p-5 space-y-4"
              >
                {/* segments header */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">
                    Segments for {currentDay?.dayLabel || `Day ${dayIndex + 1}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => addSegment(dayIndex)}
                    className="text-sm px-3 py-2 rounded-xl text-white hover:opacity-90 inline-flex items-center gap-2"
                    style={{ background: theme }}
                  >
                    <Plus size={16} />
                    Add Segment
                  </button>
                </div>

                {(currentDay?.segments || []).map((seg) => {
                  const segKey = keyFor(dayIndex, seg._id);
                  const dayDateYmd = toYmd(currentDay?.date || client.startDate);

                  const stList = statesByKey[segKey] || [];
                  const dsList = destsByKey[segKey] || [];
                  const trList = tripsByKey[segKey] || [];
                  const details = tripDetailsByKey[segKey] || {
                    addonTrips: [],
                    activities: [],
                  };

                  const stateOpts = toObjOptions(stList, "_id", "name");
                  const destOpts = toObjOptions(dsList, "_id", "name");
                  const tripOpts = toObjOptions(trList, "_id", "tripName");
                  const addonOpts = toObjOptions(
                    details.addonTrips || [],
                    "_id",
                    "tripName"
                  );

                  const activityOpts = toObjOptions(
                    details.activities || [],
                    "_id",
                    "tripName"
                  );

                  return (
                    <div
                      key={seg._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4"
                    >
                      {/* segment header row */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">
                          Segment
                        </div>

                        {(currentDay.segments || []).length > 1 && (
                          <IconButton
                            danger
                            title="Remove Segment"
                            onClick={() => removeSegment(dayIndex, seg._id)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </div>

                      {/* ROW 1: Country / State / Destination */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Country */}
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">
                            Country
                          </div>
                          <Select
                            styles={selectStyles}
                            options={countryOpts}
                            value={findOption(countryOpts, seg.country)}
                            onChange={(opt) => {
                              const countryId = opt?.value || "";
                              updateSegment(dayIndex, seg._id, {
                                country: countryId,
                                state: "",
                                destination: "",
                                trip: "",
                                selectedAddon: "",
                                selectedActivities: [],
                              });

                              clearSegLocationChain(segKey);
                              clearSegPricingOnly(segKey);

                              if (countryId) fetchStates(countryId, segKey);
                            }}
                            isClearable
                            placeholder="Select country"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">
                            State
                          </div>
                          <Select
                            styles={selectStyles}
                            options={stateOpts}
                            value={findOption(stateOpts, seg.state)}
                            onChange={(opt) => {
                              const stateId = opt?.value || "";
                              updateSegment(dayIndex, seg._id, {
                                state: stateId,
                                destination: "",
                                trip: "",
                                selectedAddon: "",
                                selectedActivities: [],
                              });

                              setDestsByKey((p) => {
                                const n = { ...p };
                                delete n[segKey];
                                return n;
                              });
                              setTripsByKey((p) => {
                                const n = { ...p };
                                delete n[segKey];
                                return n;
                              });
                              clearSegPricingOnly(segKey);

                              if (seg.country && stateId) {
                                fetchDestinations(seg.country, stateId, segKey);
                              }
                            }}
                            isDisabled={!seg.country}
                            isClearable
                            placeholder="Select state"
                          />
                        </div>

                        {/* Destination */}
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">
                            Destination
                          </div>
                          <Select
                            styles={selectStyles}
                            options={destOpts}
                            value={findOption(destOpts, seg.destination)}
                            onChange={(opt) => {
                              const destinationId = opt?.value || "";
                              updateSegment(dayIndex, seg._id, {
                                destination: destinationId,
                                trip: "",
                                selectedAddon: "",
                                selectedActivities: [],
                              });

                              setTripsByKey((p) => {
                                const n = { ...p };
                                delete n[segKey];
                                return n;
                              });
                              clearSegPricingOnly(segKey);

                              if (seg.country && seg.state && destinationId) {
                                fetchTrips(seg.country, seg.state, destinationId, segKey);
                              }
                            }}
                            isDisabled={!seg.country || !seg.state}
                            isClearable
                            placeholder="Select destination"
                          />
                        </div>
                      </div>

                      {/* ROW 2: Trip / Add-on Trip */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Trip */}
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">
                            Trip
                          </div>
                          <Select
                            styles={selectStyles}
                            options={tripOpts}
                            value={findOption(tripOpts, seg.trip)}
                            onChange={(opt) => {
                              const tripId = opt?.value || "";
                              updateSegment(dayIndex, seg._id, {
                                trip: tripId,
                                selectedAddon: "",
                                selectedActivities: [],
                              });

                              clearSegPricingOnly(segKey);

                              if (tripId) fetchTripDetails(tripId, segKey);
                              else {
                                setTripDetailsByKey((p) => {
                                  const n = { ...p };
                                  delete n[segKey];
                                  return n;
                                });
                              }
                            }}
                            isDisabled={!seg.destination}
                            isClearable
                            placeholder="Select trip"
                          />
                        </div>

                        {/* Add-on Trip */}
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">
                            Add-on Trip
                          </div>
                          <Select
                            styles={selectStyles}
                            options={addonOpts}
                            value={findOption(addonOpts, seg.selectedAddon)}
                            onChange={(opt) => {
                              const addonId = opt?.value || "";
                              updateSegment(dayIndex, seg._id, {
                                selectedAddon: addonId,
                              });

                              setAddonVehOptions((p) => {
                                const n = { ...p };
                                delete n[segKey];
                                return n;
                              });
                              setAddonVehLines((p) => {
                                const n = { ...p };
                                delete n[segKey];
                                return n;
                              });
                            }}
                            isDisabled={!seg.trip}
                            isClearable
                            placeholder="Select add-on trip"
                          />
                        </div>
                      </div>

                      {/* Activities (select multiple) */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-800">
                            Activities (Select)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Choose activities, then Load pricing below
                          </div>
                        </div>

                        <Select
                          isMulti
                          styles={selectStyles}
                          options={activityOpts}
                          value={(seg.selectedActivities || [])
                            .map((id) => findOption(activityOpts, id))
                            .filter(Boolean)}
                          onChange={(opts) => {
                            const ids = (opts || []).map((o) => o.value);
                            updateSegment(dayIndex, seg._id, {
                              selectedActivities: ids,
                            });

                            setActPricing((p) => {
                              const n = { ...p };
                              delete n[segKey];
                              return n;
                            });
                            setActLines((p) => {
                              const n = { ...p };
                              delete n[segKey];
                              return n;
                            });
                          }}
                          isDisabled={!seg.trip}
                          placeholder="Select activities"
                        />

                        {(seg.selectedActivities || []).length ? (
                          <div className="flex flex-wrap gap-2">
                            {(seg.selectedActivities || []).map((id) => {
                              const opt = findOption(activityOpts, id);
                              return (
                                <span
                                  key={id}
                                  className="text-[11px] px-2 py-1 rounded-full border bg-slate-50"
                                >
                                  {opt?.label || id}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500">
                            No activity selected
                          </div>
                        )}
                      </div>

                      {/* Trip Vehicles */}
                      <SectionCard
                        title="Trip Vehicles"
                        right={
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                fetchVehiclesForSeg(seg.trip, dayDateYmd, dayIndex, seg._id)
                              }
                              className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                              disabled={!seg.trip || !dayDateYmd}
                            >
                              Load
                            </button>
                            {vehOptions[segKey] && (
                              <button
                                type="button"
                                onClick={() => addVehLine(segKey)}
                                className="text-sm px-3 py-1 rounded-lg text-white hover:opacity-90"
                                style={{ background: theme }}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        }
                      >
                        {vehOptions[segKey] ? (
                          <VehicleLines
                            segKey={segKey}
                            data={vehOptions[segKey]}
                            lines={vehLines[segKey] || []}
                            onUpdateLine={updateVehLine}
                            onRemoveLine={removeVehLine}
                            selectStyles={selectStyles}
                          />
                        ) : (
                          <Hint text="Click Load to fetch available vehicles & prices." />
                        )}
                      </SectionCard>

                      {/* Add-on Trip Vehicles */}
                      <SectionCard
                        title="Add-on Trip Vehicles"
                        right={
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                fetchAddonVehiclesForSeg(
                                  seg.selectedAddon,
                                  dayDateYmd,
                                  dayIndex,
                                  seg._id
                                )
                              }
                              className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                              disabled={!seg.selectedAddon || !dayDateYmd}
                            >
                              Load
                            </button>
                            {addonVehOptions[segKey] && (
                              <button
                                type="button"
                                onClick={() => addAddonVehLine(segKey)}
                                className="text-sm px-3 py-1 rounded-lg text-white hover:opacity-90"
                                style={{ background: theme }}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        }
                      >
                        {addonVehOptions[segKey] ? (
                          <VehicleLines
                            segKey={segKey}
                            data={addonVehOptions[segKey]}
                            lines={addonVehLines[segKey] || []}
                            onUpdateLine={updateAddonVehLine}
                            onRemoveLine={removeAddonVehLine}
                            selectStyles={selectStyles}
                          />
                        ) : (
                          <Hint text="Click Load to fetch add-on vehicles & prices." />
                        )}
                      </SectionCard>

                      {/* Activities (Priced) */}
                      <SectionCard
                        title="Activities (Priced)"
                        right={
                          <button
                            type="button"
                            onClick={() =>
                              fetchActivitiesForSeg(
                                seg.selectedActivities || [],
                                dayDateYmd,
                                dayIndex,
                                seg._id
                              )
                            }
                            className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            disabled={!seg.selectedActivities?.length || !dayDateYmd}
                          >
                            Load
                          </button>
                        }
                      >
                        {actLines[segKey]?.length ? (
                          <ActivityLines
                            segKey={segKey}
                            lines={actLines[segKey]}
                            onQty={updateActQty}
                            onRemove={removeActLine}
                          />
                        ) : (
                          <Hint
                            text={
                              seg.selectedActivities?.length
                                ? "Click Load to fetch prices for selected activities."
                                : "No activities selected in this segment."
                            }
                          />
                        )}
                      </SectionCard>

                      {/* Trip Food */}
                      <SectionCard
                        title="Trip Food"
                        right={
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                fetchFoodsForSeg(seg.trip, dayDateYmd, dayIndex, seg._id)
                              }
                              className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                              disabled={!seg.trip || !dayDateYmd}
                            >
                              Load
                            </button>
                            {foodOptions[segKey] && (
                              <button
                                type="button"
                                onClick={() => addFoodLine(segKey)}
                                className="text-sm px-3 py-1 rounded-lg text-white hover:opacity-90"
                                style={{ background: theme }}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        }
                      >
                        {foodOptions[segKey] ? (
                          <FoodLines
                            segKey={segKey}
                            data={foodOptions[segKey]}
                            lines={foodLines[segKey] || []}
                            onUpdateLine={updateFoodLine}
                            onRemoveLine={removeFoodLine}
                            selectStyles={selectStyles}
                          />
                        ) : (
                          <Hint text="Click Load to fetch available foods & prices." />
                        )}
                      </SectionCard>

                      {/* Accommodation */}
                      <SectionCard
                        title="Accommodation"
                        right={
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                fetchAccForSeg(seg.destination, dayDateYmd, dayIndex, seg._id)
                              }
                              className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                              disabled={!seg.destination || !dayDateYmd}
                            >
                              Load
                            </button>
                            {accOptions[segKey]?.properties?.length ? (
                              <button
                                type="button"
                                onClick={() => addAccLine(segKey)}
                                className="text-sm px-3 py-1 rounded-lg text-white hover:opacity-90"
                                style={{ background: theme }}
                              >
                                + Add
                              </button>
                            ) : null}
                          </div>
                        }
                      >
                        {accOptions[segKey]?.properties?.length ? (
                          <AccommodationLines
                            segKey={segKey}
                            data={accOptions[segKey]}
                            lines={accLines[segKey] || []}
                            onUpdateLine={updateAccLine}
                            onRemoveLine={removeAccLine}
                            selectStyles={selectStyles}
                            hotelCategories={accHotelCatsByKey[segKey] || []}
                          />
                        ) : (
                          <Hint text="Click Load to fetch available accommodations & prices." />
                        )}
                      </SectionCard>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* download buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={handleReferralDownload}
                disabled={loadingReferral}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border shadow-sm hover:bg-slate-50 disabled:opacity-60"
                style={{ borderColor: theme, color: theme }}
              >
                {loadingReferral ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2" size={16} />
                    Download Referral Itinerary
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleConfirmDownload}
                disabled={loadingConfirm}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border shadow-sm hover:bg-slate-50 disabled:opacity-60"
                style={{ borderColor: theme, color: theme }}
              >
                {loadingConfirm ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2" size={16} />
                    Download Confirm Itinerary
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={openPointDiscount}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border shadow-sm hover:bg-slate-50"
                style={{ borderColor: theme, color: theme }}
              >
                View Point and Discount Options
              </button>
            </div>

            <div className="text-[11px] text-slate-500 text-right pr-1">
              Selected discount:{" "}
              <span className="font-semibold text-slate-800">
                {money(asNum(discountAmount))}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

/* ===============================
   SUB COMPONENTS
================================ */

function SectionCard({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-slate-800">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Hint({ text }) {
  return <p className="text-xs text-gray-500">{text}</p>;
}

/* Vehicle Lines
   ✅ sets advancePercentage + advanceUnit from backend option raw
   ✅ totals auto update because parent updateVehLine uses applyAdvance()
*/
function VehicleLines({
  segKey,
  data,
  lines,
  onUpdateLine,
  onRemoveLine,
  selectStyles,
}) {
  const { categories = [], options = {} } = data || {};
  const categoryOpts = toStringOptions(categories);

  return (
    <div className="mt-1 space-y-3">
      {lines.length === 0 && (
        <div className="text-xs text-gray-500">
          No vehicles added yet. Click <b>+ Add</b>.
        </div>
      )}

      {lines.map((line) => {
        const currentCat = line.category || "";
        const vehicles = options[currentCat] || [];

        const vehicleOpts = (vehicles || []).map((v) => ({
          value: v.vehicleId,
          label: v.vehicleName,
          raw: v,
        }));

        const currentVeh = vehicles.find(
          (v) => String(v.vehicleId) === String(line.vehicleId)
        );

        const percentage = currentVeh?.percentage ?? line.percentage ?? 0;
        const basePrice = currentVeh?.basePrice ?? line.basePrice ?? 0;
        const qty = line.qty ?? 0;
        const itinUnit = Math.round(basePrice * (1 + (percentage || 0) / 100));

        return (
          <div
            key={line._id}
            className="border border-gray-200 rounded-2xl p-3 bg-white space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="text-xs text-gray-600 mb-1 block">
                  Category
                </label>
                <Select
                  styles={selectStyles}
                  options={categoryOpts}
                  value={findOption(categoryOpts, currentCat)}
                  onChange={(opt) =>
                    onUpdateLine(segKey, line._id, {
                      category: opt?.value || "",
                      vehicleId: "",
                      vehicleName: "",
                      percentage: 0,
                      basePrice: 0,
                      qty: 0,
                      vendorId: null,

                      // ✅ advance reset
                      advancePercentage: 0,
                      advanceUnit: 0,
                      advanceTotal: 0,
                    })
                  }
                  isClearable
                  placeholder="Select"
                />
              </div>

              <div className="md:col-span-5">
                <label className="text-xs text-gray-600 mb-1 block">
                  Vehicle
                </label>
                <Select
                  styles={selectStyles}
                  options={vehicleOpts}
                  value={findOption(vehicleOpts, line.vehicleId)}
                  isDisabled={!currentCat}
                  onChange={(opt) => {
                    const v = opt?.raw;

                    onUpdateLine(segKey, line._id, {
                      vehicleId: v?.vehicleId || "",
                      vehicleName: v?.vehicleName || "",
                      percentage: v?.percentage ?? 0,
                      basePrice: v?.basePrice ?? 0,
                      vendorId: v?.vendor ?? null,

                      // ✅ from backend
                      advancePercentage: v?.advancePercentage ?? 0,
                      advanceUnit: v?.advanceUnit ?? 0,
                    });
                  }}
                  isClearable
                  placeholder="Select"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-600 mb-1 block">
                  Itinerary Unit
                </label>
                <input
                  className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                  readOnly
                  value={itinUnit || 0}
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-2">
                <Qty
                  disabled={!line.vehicleId}
                  qty={qty}
                  onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
                />
                <IconButton
                  danger
                  onClick={() => onRemoveLine(segKey, line._id)}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 text-sm pt-1">
              <div>
                Itinerary: <b>{(itinUnit || 0) * (qty || 0)}</b>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Food Lines
   ✅ sets advancePercentage + advanceUnit from backend item raw
*/
function FoodLines({
  segKey,
  data,
  lines,
  onUpdateLine,
  onRemoveLine,
  selectStyles,
}) {
  const { categories = [], typesByCategory = {}, options = {} } = data || {};
  const catOpts = toStringOptions(categories);

  return (
    <div className="mt-1 space-y-3">
      {lines.length === 0 && (
        <div className="text-xs text-gray-500">
          No foods added yet. Click <b>+ Add</b>.
        </div>
      )}

      {lines.map((line) => {
        const currentCat = line.mealCategory || "";
        const currentType = line.mealType || "";

        const typeList = typesByCategory[currentCat] || [];
        const typeOpts = toStringOptions(typeList);

        const items = options[currentCat]?.[currentType] || [];
        const foodOpts = (items || []).map((it) => ({
          value: it.foodName,
          label: it.foodName,
          raw: it,
        }));

        const picked = items.find((it) => it.foodName === line.foodName);

        const price = picked?.price ?? line.price ?? 0;
        const percent = picked?.percent ?? line.percent ?? 0;
        const itineraryUnit =
          picked?.itineraryPrice != null && !isNaN(picked.itineraryPrice)
            ? Number(picked.itineraryPrice)
            : Math.round(Number(price) * (1 + Number(percent || 0) / 100));

        const qty = line.qty ?? 0;

        return (
          <div
            key={line._id}
            className="border border-gray-200 rounded-2xl p-3 bg-white space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="text-xs text-gray-600 mb-1 block">
                  Meal Category
                </label>
                <Select
                  styles={selectStyles}
                  options={catOpts}
                  value={findOption(catOpts, currentCat)}
                  onChange={(opt) =>
                    onUpdateLine(segKey, line._id, {
                      mealCategory: opt?.value || "",
                      mealType: "",
                      foodName: "",
                      description: "",
                      price: 0,
                      percent: 0,
                      itineraryUnit: 0,
                      qty: 0,
                      vendorId: null,

                      // ✅ advance reset
                      advancePercentage: 0,
                      advanceUnit: 0,
                      advanceTotal: 0,
                    })
                  }
                  isClearable
                  placeholder="Select"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-gray-600 mb-1 block">
                  Meal Type
                </label>
                <Select
                  styles={selectStyles}
                  options={typeOpts}
                  value={findOption(typeOpts, currentType)}
                  isDisabled={!currentCat}
                  onChange={(opt) =>
                    onUpdateLine(segKey, line._id, {
                      mealType: opt?.value || "",
                      foodName: "",
                      description: "",
                      price: 0,
                      percent: 0,
                      itineraryUnit: 0,
                      qty: 0,
                      vendorId: null,

                      // ✅ advance reset
                      advancePercentage: 0,
                      advanceUnit: 0,
                      advanceTotal: 0,
                    })
                  }
                  isClearable
                  placeholder="Select"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-gray-600 mb-1 block">Food</label>
                <Select
                  styles={selectStyles}
                  options={foodOpts}
                  value={findOption(foodOpts, line.foodName)}
                  isDisabled={!currentCat || !currentType}
                  onChange={(opt) => {
                    const it = opt?.raw;

                    onUpdateLine(segKey, line._id, {
                      foodName: it?.foodName || "",
                      description: it?.description || "",
                      price: it?.price ?? 0,
                      percent: it?.percent ?? 0,
                      itineraryUnit:
                        it?.itineraryPrice != null && !isNaN(it.itineraryPrice)
                          ? Number(it.itineraryPrice)
                          : Math.round(
                              Number(it?.price || 0) *
                                (1 + Number(it?.percent || 0) / 100)
                            ),
                      vendorId: it?.vendor || null,

                      // ✅ from backend
                      advancePercentage: it?.advancePercentage ?? 0,
                      advanceUnit: it?.advanceUnit ?? 0,
                    });
                  }}
                  isClearable
                  placeholder="Select"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-600 mb-1 block">
                  Itinerary Unit
                </label>
                <input
                  className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                  readOnly
                  value={itineraryUnit || 0}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <Qty
                disabled={!line.foodName}
                qty={qty}
                onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
              />

              <div className="flex items-center gap-6 text-sm">
                <div>
                  Itinerary: <b>{(itineraryUnit || 0) * (qty || 0)}</b>
                </div>
                <IconButton
                  danger
                  onClick={() => onRemoveLine(segKey, line._id)}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Activity Lines (no UI change) */
function ActivityLines({ segKey, lines, onQty, onRemove }) {
  return (
    <div className="mt-1 space-y-3">
      {lines.map((line) => {
        const itinUnit = Number(line.itineraryUnit || 0);
        const qty = Number(line.qty || 0);

        return (
          <div
            key={line._id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3 bg-white"
          >
            <div className="md:col-span-6">
              <div className="text-xs text-gray-600 mb-1">Activity</div>
              <div className="font-semibold text-gray-800">{line.name}</div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">
                Itinerary Unit
              </label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={itinUnit || 0}
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-between gap-2">
              <Qty
                disabled={!line.activityId}
                qty={qty}
                onChange={(q) => onQty(segKey, line._id, q)}
              />
              <IconButton
                danger
                onClick={() => onRemove(segKey, line._id)}
                title="Remove"
              >
                <Trash2 size={16} />
              </IconButton>
            </div>

            <div className="md:col-span-12 flex items-center justify-end gap-6 text-sm pt-1">
              <div>
                Itinerary: <b>{itinUnit * qty}</b>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Accommodation Lines (Hotel Category FIRST)
   ✅ advancePercentage from backend property (prop.advancePercentage)
   ✅ advanceUnit computed in frontend via parent applyAdvance() using baseKey="bo"
   -> So whenever room BO changes we set advanceUnit:null to force compute.
*/
function AccommodationLines({
  segKey,
  data,
  lines,
  onUpdateLine,
  onRemoveLine,
  selectStyles,
  hotelCategories = [],
}) {
  const props = data?.properties || [];

  const hotelCatOpts = useMemo(
    () => toStringOptions(hotelCategories),
    [hotelCategories]
  );

  return (
    <div className="mt-1 space-y-3">
      {lines.length === 0 && (
        <div className="text-xs text-gray-500">
          No accommodations added yet. Click <b>+ Add</b>.
        </div>
      )}

      {lines.map((line) => {
        const selectedHotelCat = line.hotelCategory || "";

        const filteredProps = selectedHotelCat
          ? props.filter((p) => (p.hotelCategory || "") === selectedHotelCat)
          : [];

        const propOpts = filteredProps.map((p) => ({
          value: p.accommodationId,
          label: p.propertyName,
          raw: p,
        }));

        const selectedProp = filteredProps.find(
          (p) => String(p.accommodationId) === String(line.accommodationId)
        );

        const roomTypes = selectedProp?.roomTypes || [];
        const roomOpts = (roomTypes || []).map((r) => ({
          value: r.code,
          label: r.label,
          raw: r,
        }));

        const pickedRoom = roomTypes.find((r) => r.code === line.roomTypeCode);
        const itinerary = pickedRoom?.itinerary ?? line.itinerary ?? 0;
        const qty = line.qty ?? 0;

        return (
          <div
            key={line._id}
            className="border border-gray-200 rounded-2xl p-3 bg-white space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Hotel Category FIRST */}
              <div className="md:col-span-4">
                <label className="text-xs text-gray-600 mb-1 block">
                  Hotel Category
                </label>
                <Select
                  styles={selectStyles}
                  options={hotelCatOpts}
                  value={findOption(hotelCatOpts, selectedHotelCat)}
                  onChange={(opt) => {
                    const cat = opt?.value || "";
                    onUpdateLine(segKey, line._id, {
                      hotelCategory: cat,
                      accommodationId: "",
                      propertyName: "",
                      roomCategory: "",
                      commission: 0,
                      roomTypeCode: "",
                      bo: 0,
                      itinerary: 0,
                      qty: 0,
                      vendorId: null,

                      // ✅ advance reset
                      advancePercentage: 0,
                      advanceUnit: null,
                      advanceTotal: 0,
                    });
                  }}
                  isClearable
                  placeholder="Select"
                />
              </div>

              {/* Property filtered by category */}
              <div className="md:col-span-4">
                <label className="text-xs text-gray-600 mb-1 block">
                  Property
                </label>
                <Select
                  styles={selectStyles}
                  options={propOpts}
                  value={findOption(propOpts, line.accommodationId)}
                  isDisabled={!selectedHotelCat}
                  onChange={(opt) => {
                    const p = opt?.raw;

                    onUpdateLine(segKey, line._id, {
                      accommodationId: p?.accommodationId || "",
                      propertyName: p?.propertyName || "",
                      hotelCategory: p?.hotelCategory || selectedHotelCat || "",
                      roomCategory: p?.roomCategory || "",
                      commission: p?.commission ?? 0,
                      roomTypeCode: "",
                      bo: 0,
                      itinerary: 0,
                      qty: 0,
                      vendorId: p?.vendorId || null,

                      // ✅ from backend property
                      advancePercentage: p?.advancePercentage ?? 0,
                      // ✅ compute later when BO exists (room selected)
                      advanceUnit: null,
                    });
                  }}
                  isClearable
                  placeholder={
                    selectedHotelCat ? "Select" : "Select hotel category first"
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-600 mb-1 block">
                  Room Type
                </label>
                <Select
                  styles={selectStyles}
                  options={roomOpts}
                  value={findOption(roomOpts, line.roomTypeCode)}
                  isDisabled={!selectedProp}
                  onChange={(opt) => {
                    const r = opt?.raw;

                    onUpdateLine(segKey, line._id, {
                      roomTypeCode: r?.code || "",
                      bo: r?.bo ?? 0,
                      itinerary: r?.itinerary ?? 0,

                      // ✅ force frontend recompute advanceUnit from BO * advancePercentage
                      advanceUnit: null,
                    });
                  }}
                  isClearable
                  placeholder="Select"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-600 mb-1 block">
                  Itinerary Unit
                </label>
                <input
                  className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                  readOnly
                  value={itinerary || 0}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <Qty
                disabled={!line.roomTypeCode}
                qty={qty}
                onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
              />

              <div className="flex items-center gap-6 text-sm">
                <div>
                  Itinerary: <b>{(itinerary || 0) * (qty || 0)}</b>
                </div>
                <IconButton
                  danger
                  onClick={() => onRemoveLine(segKey, line._id)}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
