
// FixedTourFullDetail.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   X,
//   CalendarClock,
//   MapPin,
//   CircleDot,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
//   Sparkles,
// } from "lucide-react";
// import API from "../../api";
// import { toast } from "react-toastify";

// /* -----------------------------
//   Helpers
// ------------------------------ */
// function nameOrDash(v) {
//   if (!v) return "-";
//   if (typeof v === "string") return v;
//   if (typeof v === "object" && v.name) return v.name;
//   if (typeof v === "object" && v.label) return v.label;
//   return "-";
// }

// function formatDate(d) {
//   if (!d) return "-";
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return "-";
//   return dt.toLocaleDateString("en-GB");
// }

// /* -----------------------------
//   Small UI (SAME STYLE)
// ------------------------------ */
// function GlassChip({ children, theme }) {
//   return (
//     <span
//       className="
//         inline-flex items-center
//         rounded-full px-3 py-1
//         text-[11px] font-semibold
//         border shadow-sm
//       "
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

// function KV({ k, v, theme }) {
//   return (
//     <div
//       className="
//         rounded-2xl p-4
//         bg-white/70 backdrop-blur-xl
//         border border-white/55
//         shadow-[0_12px_40px_rgba(15,23,42,0.10)]
//       "
//     >
//       <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
//         {k}
//       </div>
//       <div className="mt-1 text-sm font-semibold text-slate-800 break-words">
//         {v && String(v).trim() ? v : "-"}
//       </div>

//       <div
//         className="mt-3 h-[2px] w-10 rounded-full"
//         style={{ background: `${theme}55` }}
//       />
//     </div>
//   );
// }

// function PanelTitle({ icon: Icon, title, subtitle, theme }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div
//         className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner"
//         style={{
//           background: `${theme}12`,
//           color: theme,
//           borderColor: `${theme}30`,
//         }}
//       >
//         <Icon size={18} />
//       </div>
//       <div className="min-w-0">
//         <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
//           {subtitle}
//         </div>
//         <div className="text-sm font-extrabold text-slate-900 truncate">
//           {title}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* -----------------------------
//   Main Component
// ------------------------------ */
// export default function FixedTourFullDetail({
//   tour, // { clientId, id, name?, destination?, totalDays?, articleNumber? }
//   brandColor,
//   onClose,
//   onCompleted,
// }) {
//   if (!tour) return null;

//   const theme = brandColor || "#8570EE";

//   // ✅ Freeze background scroll when modal open
//   useEffect(() => {
//     const prevHtmlOverflow = document.documentElement.style.overflow;
//     const prevBodyOverflow = document.body.style.overflow;
//     document.documentElement.style.overflow = "hidden";
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.documentElement.style.overflow = prevHtmlOverflow;
//       document.body.style.overflow = prevBodyOverflow;
//     };
//   }, []);

//   // follow-up schedule fields (keep existing behavior)
//   const [nextDate, setNextDate] = useState("");
//   const [nextTime, setNextTime] = useState("");
//   const [loadingReferral, setLoadingReferral] = useState(false);
//   const [loadingConfirm, setLoadingConfirm] = useState(false);

//   // fetched preview
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [client, setClient] = useState(null);
//   const [tourFull, setTourFull] = useState(null);

//   /**
//    * ✅ IMPORTANT: index 0 = OVERVIEW slide
//    * index 1 = Day 1
//    * index 2 = Day 2 ...
//    */
//   const [stepIndex, setStepIndex] = useState(0);
//   const [dir, setDir] = useState(1);

//   // ✅ fetch fixed tour + client details when modal opens OR tour changes
//   useEffect(() => {
//     const fetchPreview = async () => {
//       if (!tour?.clientId || !tour?.id) return;

//       try {
//         setPreviewLoading(true);
//         setClient(null);
//         setTourFull(null);
//         setStepIndex(0);

//         // ✅ NEW API for fixed tour preview
//         const res = await API.get("/executive/fixed-tour-preview", {
//           params: { clientId: tour.clientId, fixedTourId: tour.id },
//         });

//         setClient(res.data?.client || null);
//         setTourFull(res.data?.tour || null);
//       } catch (err) {
//         const msg =
//           err?.response?.data?.message ||
//           err.message ||
//           "Failed to load fixed tour details";
//         toast.error(msg);
//       } finally {
//         setPreviewLoading(false);
//       }
//     };

//     fetchPreview();
//   }, [tour?.clientId, tour?.id]);

//   // header values (prefer backend)
//   const tourName = tourFull?.tourName || tour?.name || "Fixed Tour";
//   const destName = nameOrDash(tourFull?.destination) || tour?.destination || "-";
//   const totalDays = tourFull?.totalDays ?? tour?.totalDays ?? "-";
//   const articleNumber = tourFull?.articleNumber || tour?.articleNumber || "-";

//   const clientName = client?.name || tour?.clientName || "Client";
//   const persons = client?.numberOfPersons
//     ? `${client.numberOfPersons} pax`
//     : "pax -";

//   // overview fields
//   const overview = useMemo(() => {
//     const t = tourFull || {};
//     const paxPrices = t.paxPrices && typeof t.paxPrices === "object" ? t.paxPrices : {};

//     // format paxPrices: "1: 1000, 2: 1800..."
//     const paxText = Object.keys(paxPrices)
//       .sort((a, b) => Number(a) - Number(b))
//       .map((k) => `${k}p: ${paxPrices[k] ?? "-"}`)
//       .join(" • ");

//     return {
//       category: t.category || "-",
//       pickupPoint: t.pickupPoint || "-",
//       dropOffPoint: t.dropOffPoint || "-",
//       validFrom: t.validFrom ? formatDate(t.validFrom) : "-",
//       validTill: t.validTill ? formatDate(t.validTill) : "-",
//       totalNights: t.totalNights ?? "-",
//       paxPricesText: paxText || "-",
//       includes: Array.isArray(t.includes) ? t.includes : [],
//       excludes: Array.isArray(t.excludes) ? t.excludes : [],
//     };
//   }, [tourFull]);

//   const days = Array.isArray(tourFull?.days) ? tourFull.days : [];
//   const totalSteps = 1 + (days.length || 0);

//   const safeStepIndex = Math.min(
//     Math.max(0, stepIndex),
//     Math.max(0, totalSteps - 1)
//   );

//   const dayIdx = safeStepIndex - 1;
//   const day = dayIdx >= 0 ? days[dayIdx] : null;

//   // ✅ day view model (text only)
//   const dayText = useMemo(() => {
//     if (!day) return null;

//     const segments = Array.isArray(day.segments) ? day.segments : [];

//     const segmentBlocks = segments.map((seg, idx) => {
//       const segCountry = nameOrDash(seg?.country);
//       const segState = nameOrDash(seg?.state);
//       const segDest = nameOrDash(seg?.destination);

//       const tripName =
//         typeof seg?.trip === "object"
//           ? seg?.trip?.tripName
//           : nameOrDash(seg?.trip);

//       const addonName =
//         typeof seg?.selectedAddon === "object"
//           ? seg?.selectedAddon?.addontripName
//           : nameOrDash(seg?.selectedAddon);

//       const activities = Array.isArray(seg?.selectedActivities)
//         ? seg.selectedActivities
//             .map((a) => (typeof a === "object" ? a.activityName : a))
//             .filter(Boolean)
//         : [];

//       // fixed schema categories
//       const tripVehicleCategory = seg?.tripVehicleCategory || "-";
//       const addonTripVehicleCategory = seg?.addonTripVehicleCategory || "-";
//       const hotelCategory = seg?.hotelCategory || "-";
//       const roomCategory = seg?.roomCategory || "-";

//       // meals show "mealType - mealName"
//       const meals = Array.isArray(seg?.meals)
//         ? seg.meals
//             .map((m) => {
//               const mt = m?.mealType || "";
//               const mn = m?.mealName || "";
//               const out = `${mt}${mt && mn ? " - " : ""}${mn}`.trim();
//               return out || null;
//             })
//             .filter(Boolean)
//         : [];

//       return {
//         title: `Segment ${idx + 1}`,
//         placeLine: `Country: ${segCountry} • State: ${segState} • Destination: ${segDest}`,
//         tripName: tripName && tripName !== "-" ? tripName : null,
//         addonName: addonName && addonName !== "-" ? addonName : null,
//         activities,
//         tripVehicleCategory,
//         addonTripVehicleCategory,
//         hotelCategory,
//         roomCategory,
//         meals,
//       };
//     });

//     return {
//       dayLabel: day.dayLabel || `Day ${dayIdx + 1}`,
//       segmentBlocks,
//     };
//   }, [day, dayIdx]);

//   /* -----------------------------
//     Existing API actions (NO CHANGE)
//   ------------------------------ */
//   const handleReferralDownload = async () => {
//     if (!nextDate || !nextTime) {
//       toast.error("Please choose follow-up date and time for referral itinerary");
//       return;
//     }

//     try {
//       setLoadingReferral(true);
//       await API.post("/executive/fixed-tour-referral-itinerary", {
//         clientId: tour.clientId,
//         fixedTourId: tour.id,
//         fixedTourName: tourFull?.tourName || tour?.name,
//         nextDateRaw: nextDate,
//         nextTimeRaw: nextTime,
//       });

//       toast.success("Referral itinerary status saved");
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
//       await API.post("/executive/fixed-tour-confirm-itinerary", {
//         clientId: tour.clientId,
//         fixedTourId: tour.id,
//         fixedTourName: tourFull?.tourName || tour?.name,
//         nextDateRaw: nextDate || null,
//         nextTimeRaw: nextTime || null,
//       });

//       toast.success("Confirmed itinerary status saved");
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

//   /* -----------------------------
//     Step navigation (overview + days)
//   ------------------------------ */
//   const goPrev = () => {
//     if (safeStepIndex <= 0) return;
//     setDir(-1);
//     setStepIndex((s) => Math.max(0, s - 1));
//   };

//   const goNext = () => {
//     if (safeStepIndex >= totalSteps - 1) return;
//     setDir(1);
//     setStepIndex((s) => Math.min(totalSteps - 1, s + 1));
//   };

//   const slideVariants = {
//     enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0, filter: "blur(6px)" }),
//     center: { x: 0, opacity: 1, filter: "blur(0px)" },
//     exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0, filter: "blur(6px)" }),
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         {/* Backdrop */}
//         <div className="absolute inset-0 bg-black/45" onClick={onClose} />

//         {/* Modal shell */}
//         <motion.div
//           role="dialog"
//           aria-modal="true"
//           className="
//             relative w-full max-w-6xl
//             mx-3 my-3 sm:my-8
//             rounded-[34px]
//             border border-white/25
//             shadow-[0_30px_90px_rgba(15,23,42,0.55)]
//             bg-white/92 backdrop-blur-2xl
//             overflow-hidden
//             max-h-[calc(100vh-24px)]
//             sm:max-h-[calc(100vh-64px)]
//             flex flex-col
//           "
//           initial={{ y: 26, scale: 0.98, opacity: 0 }}
//           animate={{ y: 0, scale: 1, opacity: 1 }}
//           exit={{ y: 14, scale: 0.99, opacity: 0 }}
//           transition={{ type: "spring", stiffness: 160, damping: 18 }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* top ribbon */}
//           <div
//             className="h-2 w-full"
//             style={{ background: `linear-gradient(90deg, ${theme}, #c7bef9)` }}
//           />

//           {/* header */}
//           <div className="px-4 sm:px-6 py-4 border-b border-white/40 bg-white/70">
//             <div className="flex items-start justify-between gap-3">
//               <div className="min-w-0">
//                 <div className="text-xs text-slate-500 flex items-center gap-2">
//                   <Sparkles size={14} style={{ color: theme }} />
//                   Fixed Tour Overview
//                 </div>

//                 <div className="mt-1 flex flex-wrap items-center gap-2">
//                   <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
//                     {tourName}
//                   </div>
//                   <GlassChip theme={theme}>
//                     <CircleDot size={11} />
//                     <span className="ml-1 font-mono">{articleNumber}</span>
//                   </GlassChip>
//                 </div>

//                 <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
//                   <span className="inline-flex items-center gap-1">
//                     Client: <span className="font-semibold">{clientName}</span>{" "}
//                     <span className="font-mono opacity-75">({persons})</span>
//                   </span>
//                   <span className="inline-flex items-center gap-1">
//                     <MapPin size={11} />
//                     {destName}
//                   </span>
//                   <span className="inline-flex items-center gap-1">
//                     <CalendarClock size={11} />
//                     {totalDays} days
//                   </span>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="
//                   h-10 w-10 rounded-2xl
//                   border border-slate-200
//                   bg-white/80
//                   hover:bg-white
//                   flex items-center justify-center
//                   shrink-0
//                 "
//                 aria-label="Close"
//               >
//                 <X size={18} className="text-slate-700" />
//               </button>
//             </div>
//           </div>

//           {/* body */}
//           <div className="flex-1 overflow-y-auto overscroll-contain">
//             <div className="p-4 sm:p-6 bg-gradient-to-b from-white to-purple-50/60">
//               {previewLoading || !tourFull ? (
//                 <div className="py-10 text-center text-sm text-slate-500">
//                   Loading tour details…
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
//                   {/* LEFT: viewer (overview + days) */}
//                   <div className="lg:col-span-3">
//                     <div
//                       className="
//                         rounded-[28px]
//                         border border-white/50
//                         bg-white/70 backdrop-blur-2xl
//                         shadow-[0_24px_70px_rgba(15,23,42,0.12)]
//                         overflow-hidden
//                       "
//                     >
//                       {/* top bar */}
//                       <div className="px-4 sm:px-5 py-3 border-b border-white/45 bg-white/60 flex items-center justify-between gap-3">
//                         <PanelTitle
//                           icon={FileText}
//                           theme={theme}
//                           subtitle="Swipe Flow"
//                           title={
//                             safeStepIndex === 0
//                               ? "Tour Overview"
//                               : `${dayText?.dayLabel || `Day ${dayIdx + 1}`}`
//                           }
//                         />

//                         <div className="flex items-center gap-2">
//                           <button
//                             type="button"
//                             onClick={goPrev}
//                             disabled={safeStepIndex === 0}
//                             className={`h-9 w-9 rounded-2xl border flex items-center justify-center ${
//                               safeStepIndex === 0
//                                 ? "bg-white/60 text-slate-300 border-white/50 cursor-not-allowed"
//                                 : "bg-white/85 text-slate-700 border-white/55 hover:bg-white"
//                             }`}
//                           >
//                             <ChevronLeft size={16} />
//                           </button>

//                           <div className="text-xs font-semibold text-slate-600 px-2">
//                             {safeStepIndex + 1} / {totalSteps}
//                           </div>

//                           <button
//                             type="button"
//                             onClick={goNext}
//                             disabled={safeStepIndex >= totalSteps - 1}
//                             className={`h-9 w-9 rounded-2xl border flex items-center justify-center ${
//                               safeStepIndex >= totalSteps - 1
//                                 ? "bg-white/60 text-slate-300 border-white/50 cursor-not-allowed"
//                                 : "bg-white/85 text-slate-700 border-white/55 hover:bg-white"
//                             }`}
//                           >
//                             <ChevronRight size={16} />
//                           </button>
//                         </div>
//                       </div>

//                       {/* slide content */}
//                       <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto overscroll-contain">
//                         <AnimatePresence mode="wait" custom={dir}>
//                           <motion.div
//                             key={`step-${safeStepIndex}`}
//                             custom={dir}
//                             variants={slideVariants}
//                             initial="enter"
//                             animate="center"
//                             exit="exit"
//                             transition={{ duration: 0.22, ease: "easeOut" }}
//                             className="space-y-4"
//                           >
//                             {/* ✅ STEP 0: OVERVIEW */}
//                             {safeStepIndex === 0 ? (
//                               <div className="space-y-4">
//                                 <div className="flex flex-wrap gap-2">
//                                   <GlassChip theme={theme}>
//                                     Category: {overview.category}
//                                   </GlassChip>
//                                   <GlassChip theme={theme}>
//                                     Valid: {overview.validFrom} → {overview.validTill}
//                                   </GlassChip>
//                                   <GlassChip theme={theme}>
//                                     Nights: {overview.totalNights}
//                                   </GlassChip>
//                                 </div>

//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                   <KV k="Pickup Point" v={overview.pickupPoint} theme={theme} />
//                                   <KV k="Drop-off Point" v={overview.dropOffPoint} theme={theme} />
//                                   <KV k="Pax Prices" v={overview.paxPricesText} theme={theme} />
//                                   <KV k="Total Days" v={String(totalDays)} theme={theme} />
//                                 </div>

//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                   <div
//                                     className="
//                                       rounded-2xl p-4
//                                       bg-white/70 backdrop-blur-xl
//                                       border border-white/55
//                                       shadow-[0_12px_40px_rgba(15,23,42,0.10)]
//                                     "
//                                   >
//                                     <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
//                                       Includes
//                                     </div>
//                                     <div className="mt-2 flex flex-wrap gap-2">
//                                       {overview.includes?.length ? (
//                                         overview.includes.map((x, i) => (
//                                           <span
//                                             key={i}
//                                             className="px-3 py-1 rounded-full text-xs border"
//                                             style={{
//                                               borderColor: `${theme}25`,
//                                               background: `${theme}10`,
//                                               color: "#321F6A",
//                                             }}
//                                           >
//                                             {x}
//                                           </span>
//                                         ))
//                                       ) : (
//                                         <span className="text-sm text-slate-500">-</span>
//                                       )}
//                                     </div>
//                                   </div>

//                                   <div
//                                     className="
//                                       rounded-2xl p-4
//                                       bg-white/70 backdrop-blur-xl
//                                       border border-white/55
//                                       shadow-[0_12px_40px_rgba(15,23,42,0.10)]
//                                     "
//                                   >
//                                     <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
//                                       Excludes
//                                     </div>
//                                     <div className="mt-2 flex flex-wrap gap-2">
//                                       {overview.excludes?.length ? (
//                                         overview.excludes.map((x, i) => (
//                                           <span
//                                             key={i}
//                                             className="px-3 py-1 rounded-full text-xs border"
//                                             style={{
//                                               borderColor: "rgba(244,63,94,0.22)",
//                                               background: "rgba(244,63,94,0.08)",
//                                               color: "#9f1239",
//                                             }}
//                                           >
//                                             {x}
//                                           </span>
//                                         ))
//                                       ) : (
//                                         <span className="text-sm text-slate-500">-</span>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>

//                                 <div className="text-xs text-slate-500">
//                                   Next → to see Day-wise details.
//                                 </div>
//                               </div>
//                             ) : (
//                               /* ✅ STEPS 1..N: DAYS */
//                               <>
//                                 <div className="flex items-center justify-between">
//                                   <div className="text-xs text-slate-500">
//                                     {dayText?.dayLabel ? `${dayText.dayLabel}` : ""}
//                                   </div>
//                                   <GlassChip theme={theme}>
//                                     Day {dayIdx + 1} / {days.length}
//                                   </GlassChip>
//                                 </div>

//                                 {(!dayText || !dayText.segmentBlocks?.length) && (
//                                   <div className="text-sm text-slate-500">
//                                     No itinerary segments found for this day.
//                                   </div>
//                                 )}

//                                 {dayText?.segmentBlocks?.map((seg) => (
//                                   <motion.div
//                                     key={seg.title}
//                                     whileHover={{ y: -2 }}
//                                     className="
//                                       rounded-2xl border border-white/55
//                                       bg-white/75 backdrop-blur-xl
//                                       p-4 shadow-[0_16px_44px_rgba(15,23,42,0.12)]
//                                     "
//                                   >
//                                     <div className="flex items-start justify-between gap-2">
//                                       <div className="text-sm font-extrabold text-slate-900">
//                                         {seg.title}
//                                       </div>
//                                       <GlassChip theme={theme}>Itinerary</GlassChip>
//                                     </div>

//                                     <div className="mt-1 text-xs text-slate-500">
//                                       {seg.placeLine}
//                                     </div>

//                                     <div className="mt-4 space-y-4 text-sm text-slate-700">
//                                       {seg.tripName && (
//                                         <KV k="Trip" v={seg.tripName} theme={theme} />
//                                       )}

//                                       {seg.addonName && (
//                                         <KV k="Add-on Trip" v={seg.addonName} theme={theme} />
//                                       )}

//                                       <KV
//                                         k="Activities"
//                                         v={seg.activities?.length ? seg.activities.join(", ") : "-"}
//                                         theme={theme}
//                                       />

//                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                         <KV
//                                           k="Trip Vehicle Category"
//                                           v={seg.tripVehicleCategory}
//                                           theme={theme}
//                                         />
//                                         <KV
//                                           k="Addon Vehicle Category"
//                                           v={seg.addonTripVehicleCategory}
//                                           theme={theme}
//                                         />
//                                         <KV
//                                           k="Hotel Category"
//                                           v={seg.hotelCategory}
//                                           theme={theme}
//                                         />
//                                         <KV
//                                           k="Room Category"
//                                           v={seg.roomCategory}
//                                           theme={theme}
//                                         />
//                                       </div>

//                                       <KV
//                                         k="Meals"
//                                         v={seg.meals?.length ? seg.meals.join(", ") : "-"}
//                                         theme={theme}
//                                       />
//                                     </div>
//                                   </motion.div>
//                                 ))}
//                               </>
//                             )}
//                           </motion.div>
//                         </AnimatePresence>
//                       </div>
//                     </div>
//                   </div>

//                   {/* RIGHT: follow-up schedule + buttons (keep functionality) */}
//                   <div className="lg:col-span-2 space-y-4">
//                     <div
//                       className="
//                         rounded-[28px]
//                         border border-white/50
//                         bg-white/75 backdrop-blur-2xl
//                         shadow-[0_22px_60px_rgba(15,23,42,0.12)]
//                         p-5
//                       "
//                     >
//                       <PanelTitle
//                         icon={CalendarClock}
//                         theme={theme}
//                         subtitle="Control Panel"
//                         title="Schedule follow-up"
//                       />

//                       <div className="mt-5 grid grid-cols-1 gap-4 text-xs">
//                         <div>
//                           <div className="text-[11px] text-slate-500 mb-1">
//                             Next contact date
//                           </div>
//                           <input
//                             type="date"
//                             value={nextDate}
//                             onChange={(e) => setNextDate(e.target.value)}
//                             className="
//                               w-full rounded-2xl
//                               border border-slate-300
//                               bg-white/90
//                               px-4 py-3
//                               text-sm
//                               outline-none
//                               focus:ring-2
//                             "
//                             style={{ "--tw-ring-color": theme }}
//                           />
//                         </div>

//                         <div>
//                           <div className="text-[11px] text-slate-500 mb-1">
//                             Next contact time
//                           </div>
//                           <input
//                             type="time"
//                             value={nextTime}
//                             onChange={(e) => setNextTime(e.target.value)}
//                             className="
//                               w-full rounded-2xl
//                               border border-slate-300
//                               bg-white/90
//                               px-4 py-3
//                               text-sm
//                               outline-none
//                               focus:ring-2
//                             "
//                             style={{ "--tw-ring-color": theme }}
//                           />
//                         </div>

//                         <div className="text-[12px] text-slate-500 leading-relaxed">
//                           • Referral Itinerary: <b>date & time mandatory</b>
//                           <br />• Confirm Itinerary: optional
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex flex-col gap-4">
//                       <motion.button
//                         whileTap={{ scale: 0.98 }}
//                         type="button"
//                         onClick={handleReferralDownload}
//                         disabled={loadingReferral}
//                         className="
//                           inline-flex items-center justify-center
//                           rounded-2xl px-5 py-3.5
//                           text-sm font-extrabold
//                           text-white
//                           shadow-[0_16px_40px_rgba(133,112,238,0.35)]
//                           hover:opacity-95 disabled:opacity-60
//                         "
//                         style={{ background: theme }}
//                       >
//                         {loadingReferral ? "Processing..." : "Download Referral Itinerary"}
//                       </motion.button>

//                       <motion.button
//                         whileTap={{ scale: 0.98 }}
//                         type="button"
//                         onClick={handleConfirmDownload}
//                         disabled={loadingConfirm}
//                         className="
//                           inline-flex items-center justify-center
//                           rounded-2xl px-5 py-3.5
//                           text-sm font-extrabold
//                           border
//                           shadow-[0_12px_30px_rgba(15,23,42,0.12)]
//                           hover:bg-white disabled:opacity-60
//                         "
//                         style={{
//                           borderColor: `${theme}66`,
//                           color: theme,
//                           background: "rgba(255,255,255,0.65)",
//                         }}
//                       >
//                         {loadingConfirm ? "Processing..." : "Download Confirm Itinerary"}
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CalendarClock,
  MapPin,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Gift,
  BadgePercent,
} from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

/* -----------------------------
  Helpers
------------------------------ */
function nameOrDash(v) {
  if (!v) return "-";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v.name) return v.name;
  if (typeof v === "object" && v.label) return v.label;
  return "-";
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-GB");
}

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const asNum = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
const money = (n) => {
  const x = asNum(n);
  return x.toLocaleString("en-IN");
};

/* -----------------------------
  Small UI (SAME STYLE)
------------------------------ */
function GlassChip({ children, theme }) {
  return (
    <span
      className="
        inline-flex items-center
        rounded-full px-3 py-1
        text-[11px] font-semibold
        border shadow-sm
      "
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

function KV({ k, v, theme }) {
  return (
    <div
      className="
        rounded-2xl p-4
        bg-white/70 backdrop-blur-xl
        border border-white/55
        shadow-[0_12px_40px_rgba(15,23,42,0.10)]
      "
    >
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
        {k}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800 break-words">
        {v && String(v).trim() ? v : "-"}
      </div>

      <div
        className="mt-3 h-[2px] w-10 rounded-full"
        style={{ background: `${theme}55` }}
      />
    </div>
  );
}

function PanelTitle({ icon: Icon, title, subtitle, theme }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner"
        style={{
          background: `${theme}12`,
          color: theme,
          borderColor: `${theme}30`,
        }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
          {subtitle}
        </div>
        <div className="text-sm font-extrabold text-slate-900 truncate">
          {title}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, theme }) {
  return (
    <div
      className="
        rounded-2xl p-4
        bg-white/75 backdrop-blur-xl
        border border-white/55
        shadow-[0_12px_40px_rgba(15,23,42,0.10)]
      "
    >
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
      className="
        w-full rounded-2xl
        border border-slate-300
        bg-white/90
        px-4 py-3
        text-sm
        outline-none
        focus:ring-2
      "
      style={{ "--tw-ring-color": theme }}
    />
  );
}

/* -----------------------------
  Point & Discount Modal (same as group tour)
------------------------------ */
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
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/45" onClick={onClose} />

        {/* Modal (smaller) */}
        <motion.div
          role="dialog"
          aria-modal="true"
          className="
            relative w-full max-w-xl
            mx-3 my-3 sm:my-8
            rounded-[28px]
            border border-white/25
            shadow-[0_30px_90px_rgba(15,23,42,0.55)]
            bg-white/92 backdrop-blur-2xl
            overflow-hidden
            max-h-[calc(100vh-24px)]
            sm:max-h-[calc(100vh-64px)]
            flex flex-col
          "
          initial={{ y: 22, scale: 0.985, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 12, scale: 0.99, opacity: 0 }}
          transition={{ type: "spring", stiffness: 175, damping: 18 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* top ribbon */}
          <div
            className="h-2 w-full"
            style={{ background: `linear-gradient(90deg, ${theme}, #c7bef9)` }}
          />

          {/* header */}
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
                className="
                  h-10 w-10 rounded-2xl
                  border border-slate-200
                  bg-white/80
                  hover:bg-white
                  flex items-center justify-center
                  shrink-0
                "
                aria-label="Close"
              >
                <X size={18} className="text-slate-700" />
              </button>
            </div>
          </div>

          {/* body */}
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

                  <div
                    className="
                      rounded-[24px]
                      border border-white/55
                      bg-white/75 backdrop-blur-2xl
                      shadow-[0_18px_55px_rgba(15,23,42,0.12)]
                      p-4
                    "
                  >
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

          {/* footer */}
          <div className="px-4 sm:px-5 py-4 border-t border-white/40 bg-white/70 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="
                h-10 px-4 rounded-2xl
                border border-slate-200
                bg-white/80
                hover:bg-white
                text-sm font-extrabold text-slate-700
              "
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -----------------------------
  Main Component
------------------------------ */
export default function FixedTourFullDetail({
  tour, // { clientId, id, name?, destination?, totalDays?, articleNumber? }
  brandColor,
  onClose,
  onCompleted,
}) {
  if (!tour) return null;

  const theme = brandColor || "#8570EE";

  // ✅ Freeze background scroll when modal open
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // follow-up schedule fields (keep existing behavior)
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  // fetched preview
  const [previewLoading, setPreviewLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [tourFull, setTourFull] = useState(null);

  /**
   * ✅ IMPORTANT: index 0 = OVERVIEW slide
   * index 1 = Day 1
   * index 2 = Day 2 ...
   */
  const [stepIndex, setStepIndex] = useState(0);
  const [dir, setDir] = useState(1);

  // ✅ Point/discount popup state (NEW)
  const [pdOpen, setPdOpen] = useState(false);
  const [pdLoading, setPdLoading] = useState(false);
  const [pdData, setPdData] = useState({
    margin: 0,
    pointPercentage: 0,
    discountPercentage: 0,
  });
  const [discountAmount, setDiscountAmount] = useState("0");

  // ✅ fetch fixed tour + client details when modal opens OR tour changes
  useEffect(() => {
    const fetchPreview = async () => {
      if (!tour?.clientId || !tour?.id) return;

      try {
        setPreviewLoading(true);
        setClient(null);
        setTourFull(null);
        setStepIndex(0);

        // ✅ API for fixed tour preview
        const res = await API.get("/executive/fixed-tour-preview", {
          params: { clientId: tour.clientId, fixedTourId: tour.id },
        });

        setClient(res.data?.client || null);
        setTourFull(res.data?.tour || null);

        // reset discount on open/change (same behavior as group tour)
        setDiscountAmount("0");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to load fixed tour details";
        toast.error(msg);
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [tour?.clientId, tour?.id]);

  // header values (prefer backend)
  const tourName = tourFull?.tourName || tour?.name || "Fixed Tour";
  const destName = nameOrDash(tourFull?.destination) || tour?.destination || "-";
  const totalDays = tourFull?.totalDays ?? tour?.totalDays ?? "-";
  const articleNumber = tourFull?.articleNumber || tour?.articleNumber || "-";

  const clientName = client?.name || tour?.clientName || "Client";
  const persons = client?.numberOfPersons
    ? `${client.numberOfPersons} pax`
    : "pax -";
  const paxNumber = asNum(client?.numberOfPersons || 0);

  // overview fields (UPDATED: show Price/Pax + Itinerary Price/Pax)
  const overview = useMemo(() => {
    const t = tourFull || {};
    const itineraryPrices =
    t.itineraryPrices && typeof t.itineraryPrices === "object"
      ? t.itineraryPrices
      : {};

  const itineraryPricesPairs = Object.keys(itineraryPrices)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => ({
      key: k,
      label: `${k}p: ${itineraryPrices[k] ?? "-"}`,
    }));
    const pax = asNum(client?.numberOfPersons || 0);
    const key = String(pax);

    const pricePerPax = t?.paxPrices?.[key] ?? "-";
    const itineraryPricePerPax = t?.itineraryPrices?.[key] ?? "-";

    return {
      category: t.category || "-",
      pickupPoint: t.pickupPoint || "-",
      dropOffPoint: t.dropOffPoint || "-",
      validFrom: t.validFrom ? formatDate(t.validFrom) : "-",
      validTill: t.validTill ? formatDate(t.validTill) : "-",
      totalNights: t.totalNights ?? "-",
      itineraryPricesPairs,
      pricePerPax,
      itineraryPricePerPax,
      includes: Array.isArray(t.includes) ? t.includes : [],
      excludes: Array.isArray(t.excludes) ? t.excludes : [],
    };
  }, [tourFull, client]);

  const days = Array.isArray(tourFull?.days) ? tourFull.days : [];
  const totalSteps = 1 + (days.length || 0);

  const safeStepIndex = Math.min(
    Math.max(0, stepIndex),
    Math.max(0, totalSteps - 1)
  );

  const dayIdx = safeStepIndex - 1;
  const day = dayIdx >= 0 ? days[dayIdx] : null;

  // ✅ day view model (text only)
  const dayText = useMemo(() => {
    if (!day) return null;

    const segments = Array.isArray(day.segments) ? day.segments : [];

    const segmentBlocks = segments.map((seg, idx) => {
      const segCountry = nameOrDash(seg?.country);
      const segState = nameOrDash(seg?.state);
      const segDest = nameOrDash(seg?.destination);

      const tripName =
        typeof seg?.trip === "object"
          ? seg?.trip?.tripName
          : nameOrDash(seg?.trip);

      const addonName =
        typeof seg?.selectedAddon === "object"
          ? seg?.selectedAddon?.addontripName
          : nameOrDash(seg?.selectedAddon);

      const activities = Array.isArray(seg?.selectedActivities)
        ? seg.selectedActivities
            .map((a) => (typeof a === "object" ? a.activityName : a))
            .filter(Boolean)
        : [];

      // fixed schema categories
      const tripVehicleCategory = seg?.tripVehicleCategory || "-";
      const addonTripVehicleCategory = seg?.addonTripVehicleCategory || "-";
      const hotelCategory = seg?.hotelCategory || "-";
      const roomCategory = seg?.roomCategory || "-";

      // meals show "mealType - mealName"
      const meals = Array.isArray(seg?.meals)
        ? seg.meals
            .map((m) => {
              const mt = m?.mealType || "";
              const mn = m?.mealName || "";
              const out = `${mt}${mt && mn ? " - " : ""}${mn}`.trim();
              return out || null;
            })
            .filter(Boolean)
        : [];

      return {
        title: `Segment ${idx + 1}`,
        placeLine: `Country: ${segCountry} • State: ${segState} • Destination: ${segDest}`,
        tripName: tripName && tripName !== "-" ? tripName : null,
        addonName: addonName && addonName !== "-" ? addonName : null,
        activities,
        tripVehicleCategory,
        addonTripVehicleCategory,
        hotelCategory,
        roomCategory,
        meals,
      };
    });

    return {
      dayLabel: day.dayLabel || `Day ${dayIdx + 1}`,
      segmentBlocks,
    };
  }, [day, dayIdx]);

  /* -----------------------------
    load point/discount options (NEW)
  ------------------------------ */
  const openPointDiscount = async () => {
    if (!tour?.clientId || !tour?.id) return;

    try {
      setPdOpen(true);
      setPdLoading(true);

      const res = await API.get("/executive/fixed-tour-point-discount-options", {
        params: { clientId: tour.clientId, fixedTourId: tour.id },
      });

      const payload = res.data || {};
      const margin = asNum(payload.margin);
      const pointPercentage = asNum(payload.pointPercentage);
      const discountPercentage = asNum(payload.discountPercentage);

      setPdData({ margin, pointPercentage, discountPercentage });

      const maxDiscount = (margin * discountPercentage) / 100;
      const currentDisc = asNum(discountAmount);
      const clamped = clamp(currentDisc, 0, maxDiscount || 0);
      setDiscountAmount(String(clamped));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to load point/discount options";
      toast.error(msg);
      setPdOpen(false);
    } finally {
      setPdLoading(false);
    }
  };

  /* -----------------------------
    Existing API actions (UPDATED: send discountAmount + executivePoint)
  ------------------------------ */
  const handleReferralDownload = async () => {
    if (!nextDate || !nextTime) {
      toast.error("Please choose follow-up date and time for referral itinerary");
      return;
    }

    try {
      setLoadingReferral(true);

      const margin = asNum(pdData.margin);
      const pp = asNum(pdData.pointPercentage);
      const discAllowed = (margin * asNum(pdData.discountPercentage)) / 100;
      const disc = clamp(asNum(discountAmount), 0, discAllowed || 0);
      const effectiveMargin = Math.max(0, margin - disc);
      const executivePoint = ((effectiveMargin * pp) / 100 / 20) * paxNumber;

      await API.post("/executive/fixed-tour-referral-itinerary", {
        clientId: tour.clientId,
        fixedTourId: tour.id,
        fixedTourName: tourFull?.tourName || tour?.name,
        nextDateRaw: nextDate,
        nextTimeRaw: nextTime,

        discountAmount: disc || 0,
        executivePoint: executivePoint || 0,
      });

      toast.success("Referral itinerary status saved");
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

      const margin = asNum(pdData.margin);
      const pp = asNum(pdData.pointPercentage);
      const discAllowed = (margin * asNum(pdData.discountPercentage)) / 100;
      const disc = clamp(asNum(discountAmount), 0, discAllowed || 0);
      const effectiveMargin = Math.max(0, margin - disc);
      const executivePoint = ((effectiveMargin * pp) / 100 / 20) * paxNumber;

      await API.post("/executive/fixed-tour-confirm-itinerary", {
        clientId: tour.clientId,
        fixedTourId: tour.id,
        fixedTourName: tourFull?.tourName || tour?.name,
        nextDateRaw: nextDate || null,
        nextTimeRaw: nextTime || null,

        discountAmount: disc || 0,
        executivePoint: executivePoint || 0,
      });

      toast.success("Confirmed itinerary status saved");
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

  /* -----------------------------
    Step navigation (overview + days)
  ------------------------------ */
  const goPrev = () => {
    if (safeStepIndex <= 0) return;
    setDir(-1);
    setStepIndex((s) => Math.max(0, s - 1));
  };

  const goNext = () => {
    if (safeStepIndex >= totalSteps - 1) return;
    setDir(1);
    setStepIndex((s) => Math.min(totalSteps - 1, s + 1));
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0, filter: "blur(6px)" }),
  };

  // ✅ shared button style (Confirm-style) + reduced width (same as group tour)
  const outlineBtnClass =
    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold border shadow-[0_12px_30px_rgba(15,23,42,0.12)] hover:bg-white disabled:opacity-60 w-full sm:w-auto";
  const outlineBtnStyle = {
    borderColor: `${theme}66`,
    color: theme,
    background: "rgba(255,255,255,0.65)",
  };

  return (
    <>
      {/* ✅ Point & Discount Modal */}
      <PointDiscountModal
        open={pdOpen}
        theme={theme}
        loading={pdLoading}
        onClose={() => setPdOpen(false)}
        margin={pdData.margin}
        pointPercentage={pdData.pointPercentage}
        discountPercentage={pdData.discountPercentage}
        pax={paxNumber}
        discountAmount={discountAmount}
        setDiscountAmount={setDiscountAmount}
      />

      {/* ✅ Scrollbar glass style (scoped) */}
      <style>{`
        .gt-glass-scroll::-webkit-scrollbar { width: 10px; }
        .gt-glass-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.35);
          border-radius: 999px;
          backdrop-filter: blur(14px);
        }
        .gt-glass-scroll::-webkit-scrollbar-thumb {
          background: rgba(133,112,238,0.28);
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.45);
          backdrop-filter: blur(14px);
        }
        .gt-glass-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(133,112,238,0.42);
        }

        /* Firefox */
        .gt-glass-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(133,112,238,0.35) rgba(255,255,255,0.25);
        }
      `}</style>

      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/45" onClick={onClose} />

          {/* Modal shell */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="
              relative w-full max-w-6xl
              mx-3 my-3 sm:my-8
              rounded-[34px]
              border border-white/25
              shadow-[0_30px_90px_rgba(15,23,42,0.55)]
              bg-white/92 backdrop-blur-2xl
              overflow-hidden
              max-h-[calc(100vh-24px)]
              sm:max-h-[calc(100vh-64px)]
              flex flex-col
            "
            initial={{ y: 26, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.99, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* top ribbon */}
            <div
              className="h-2 w-full"
              style={{ background: `linear-gradient(90deg, ${theme}, #c7bef9)` }}
            />

            {/* header */}
            <div className="px-4 sm:px-6 py-4 border-b border-white/40 bg-white/70">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Sparkles size={14} style={{ color: theme }} />
                    Fixed Tour Overview
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                      {tourName}
                    </div>
                    <GlassChip theme={theme}>
                      <CircleDot size={11} />
                      <span className="ml-1 font-mono">{articleNumber}</span>
                    </GlassChip>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      Client: <span className="font-semibold">{clientName}</span>{" "}
                      <span className="font-mono opacity-75">({persons})</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} />
                      {destName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock size={11} />
                      {totalDays} days
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="
                    h-10 w-10 rounded-2xl
                    border border-slate-200
                    bg-white/80
                    hover:bg-white
                    flex items-center justify-center
                    shrink-0
                  "
                  aria-label="Close"
                >
                  <X size={18} className="text-slate-700" />
                </button>
              </div>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-6 bg-gradient-to-b from-white to-purple-50/60">
                {previewLoading || !tourFull ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    Loading tour details…
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* LEFT: viewer (overview + days) */}
                    <div className="lg:col-span-3">
                      <div
                        className="
                          rounded-[28px]
                          border border-white/50
                          bg-white/70 backdrop-blur-2xl
                          shadow-[0_24px_70px_rgba(15,23,42,0.12)]
                          overflow-hidden
                        "
                      >
                        {/* top bar */}
                        <div className="px-4 sm:px-5 py-3 border-b border-white/45 bg-white/60 flex items-center justify-between gap-3">
                          <PanelTitle
                            icon={FileText}
                            theme={theme}
                            subtitle="Swipe Flow"
                            title={
                              safeStepIndex === 0
                                ? "Tour Overview"
                                : `${dayText?.dayLabel || `Day ${dayIdx + 1}`}`
                            }
                          />

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={goPrev}
                              disabled={safeStepIndex === 0}
                              className={`h-9 w-9 rounded-2xl border flex items-center justify-center ${
                                safeStepIndex === 0
                                  ? "bg-white/60 text-slate-300 border-white/50 cursor-not-allowed"
                                  : "bg-white/85 text-slate-700 border-white/55 hover:bg-white"
                              }`}
                            >
                              <ChevronLeft size={16} />
                            </button>

                            <div className="text-xs font-semibold text-slate-600 px-2">
                              {safeStepIndex + 1} / {totalSteps}
                            </div>

                            <button
                              type="button"
                              onClick={goNext}
                              disabled={safeStepIndex >= totalSteps - 1}
                              className={`h-9 w-9 rounded-2xl border flex items-center justify-center ${
                                safeStepIndex >= totalSteps - 1
                                  ? "bg-white/60 text-slate-300 border-white/50 cursor-not-allowed"
                                  : "bg-white/85 text-slate-700 border-white/55 hover:bg-white"
                              }`}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>

                        {/* slide content */}
                        <div className="p-4 sm:p-5 max-h-[420px] overflow-y-auto overscroll-contain gt-glass-scroll">
                          <AnimatePresence mode="wait" custom={dir}>
                            <motion.div
                              key={`step-${safeStepIndex}`}
                              custom={dir}
                              variants={slideVariants}
                              initial="enter"
                              animate="center"
                              exit="exit"
                              transition={{ duration: 0.22, ease: "easeOut" }}
                              className="space-y-4"
                            >
                              {/* ✅ STEP 0: OVERVIEW */}
                              {safeStepIndex === 0 ? (
                                <div className="space-y-4">
                                  <div className="flex flex-wrap gap-2">
                                    <GlassChip theme={theme}>
                                      Category: {overview.category}
                                    </GlassChip>
                                    <GlassChip theme={theme}>
                                      Valid: {overview.validFrom} → {overview.validTill}
                                    </GlassChip>
                                    <GlassChip theme={theme}>
                                      Nights: {overview.totalNights}
                                    </GlassChip>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <KV k="Pickup Point" v={overview.pickupPoint} theme={theme} />
  <KV k="Drop-off Point" v={overview.dropOffPoint} theme={theme} />

  {/* ✅ Full-width Price / Pax chips */}
  <div
    className="
      sm:col-span-2
      rounded-2xl p-4
      bg-white/70 backdrop-blur-xl
      border border-white/55
      shadow-[0_12px_40px_rgba(15,23,42,0.10)]
    "
  >
    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
      Price / Pax
    </div>

    <div className="mt-2 flex flex-wrap gap-2">
      {Array.isArray(overview.itineraryPricesPairs) &&
      overview.itineraryPricesPairs.length ? (
        overview.itineraryPricesPairs.map((x) => (
          <GlassChip key={x.key} theme={theme}>
            {x.label}
          </GlassChip>
        ))
      ) : (
        <span className="text-sm text-slate-500">-</span>
      )}
    </div>

    <div
      className="mt-3 h-[2px] w-10 rounded-full"
      style={{ background: `${theme}55` }}
    />
  </div>

  {/* <KV
    k=" Price / Pax"
    v={String(overview.itineraryPricePerPax)}
    theme={theme}
  /> */}
</div>


                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div
                                      className="
                                        rounded-2xl p-4
                                        bg-white/70 backdrop-blur-xl
                                        border border-white/55
                                        shadow-[0_12px_40px_rgba(15,23,42,0.10)]
                                      "
                                    >
                                      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                        Includes
                                      </div>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {overview.includes?.length ? (
                                          overview.includes.map((x, i) => (
                                            <span
                                              key={i}
                                              className="px-3 py-1 rounded-full text-xs border"
                                              style={{
                                                borderColor: `${theme}25`,
                                                background: `${theme}10`,
                                                color: "#321F6A",
                                              }}
                                            >
                                              {x}
                                            </span>
                                          ))
                                        ) : (
                                          <span className="text-sm text-slate-500">-</span>
                                        )}
                                      </div>
                                    </div>

                                    <div
                                      className="
                                        rounded-2xl p-4
                                        bg-white/70 backdrop-blur-xl
                                        border border-white/55
                                        shadow-[0_12px_40px_rgba(15,23,42,0.10)]
                                      "
                                    >
                                      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                        Excludes
                                      </div>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {overview.excludes?.length ? (
                                          overview.excludes.map((x, i) => (
                                            <span
                                              key={i}
                                              className="px-3 py-1 rounded-full text-xs border"
                                              style={{
                                                borderColor: "rgba(244,63,94,0.22)",
                                                background: "rgba(244,63,94,0.08)",
                                                color: "#9f1239",
                                              }}
                                            >
                                              {x}
                                            </span>
                                          ))
                                        ) : (
                                          <span className="text-sm text-slate-500">-</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-xs text-slate-500">
                                    Next → to see Day-wise details.
                                  </div>
                                </div>
                              ) : (
                                /* ✅ STEPS 1..N: DAYS */
                                <>
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-500">
                                      {dayText?.dayLabel ? `${dayText.dayLabel}` : ""}
                                    </div>
                                    <GlassChip theme={theme}>
                                      Day {dayIdx + 1} / {days.length}
                                    </GlassChip>
                                  </div>

                                  {(!dayText || !dayText.segmentBlocks?.length) && (
                                    <div className="text-sm text-slate-500">
                                      No itinerary segments found for this day.
                                    </div>
                                  )}

                                  {dayText?.segmentBlocks?.map((seg) => (
                                    <motion.div
                                      key={seg.title}
                                      whileHover={{ y: -2 }}
                                      className="
                                        rounded-2xl border border-white/55
                                        bg-white/75 backdrop-blur-xl
                                        p-4 shadow-[0_16px_44px_rgba(15,23,42,0.12)]
                                      "
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="text-sm font-extrabold text-slate-900">
                                          {seg.title}
                                        </div>
                                        <GlassChip theme={theme}>Itinerary</GlassChip>
                                      </div>

                                      <div className="mt-1 text-xs text-slate-500">
                                        {seg.placeLine}
                                      </div>

                                      <div className="mt-4 space-y-4 text-sm text-slate-700">
                                        {seg.tripName && (
                                          <KV k="Trip" v={seg.tripName} theme={theme} />
                                        )}

                                        {seg.addonName && (
                                          <KV k="Add-on Trip" v={seg.addonName} theme={theme} />
                                        )}

                                        <KV
                                          k="Activities"
                                          v={seg.activities?.length ? seg.activities.join(", ") : "-"}
                                          theme={theme}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <KV
                                            k="Trip Vehicle Category"
                                            v={seg.tripVehicleCategory}
                                            theme={theme}
                                          />
                                          <KV
                                            k="Addon Vehicle Category"
                                            v={seg.addonTripVehicleCategory}
                                            theme={theme}
                                          />
                                          <KV
                                            k="Hotel Category"
                                            v={seg.hotelCategory}
                                            theme={theme}
                                          />
                                          <KV
                                            k="Room Category"
                                            v={seg.roomCategory}
                                            theme={theme}
                                          />
                                        </div>

                                        <KV
                                          k="Meals"
                                          v={seg.meals?.length ? seg.meals.join(", ") : "-"}
                                          theme={theme}
                                        />
                                      </div>
                                    </motion.div>
                                  ))}
                                </>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: follow-up schedule + buttons */}
                    <div className="lg:col-span-2 space-y-4">
                      <div
                        className="
                          rounded-[28px]
                          border border-white/50
                          bg-white/75 backdrop-blur-2xl
                          shadow-[0_22px_60px_rgba(15,23,42,0.12)]
                          p-5
                        "
                      >
                        <PanelTitle
                          icon={CalendarClock}
                          theme={theme}
                          subtitle="Control Panel"
                          title="Schedule follow-up"
                        />

                        <div className="mt-5 grid grid-cols-1 gap-4 text-xs">
                          <div>
                            <div className="text-[11px] text-slate-500 mb-1">
                              Next contact date
                            </div>
                            <input
                              type="date"
                              value={nextDate}
                              onChange={(e) => setNextDate(e.target.value)}
                              className="
                                w-full rounded-2xl
                                border border-slate-300
                                bg-white/90
                                px-4 py-3
                                text-sm
                                outline-none
                                focus:ring-2
                              "
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
                              className="
                                w-full rounded-2xl
                                border border-slate-300
                                bg-white/90
                                px-4 py-3
                                text-sm
                                outline-none
                                focus:ring-2
                              "
                              style={{ "--tw-ring-color": theme }}
                            />
                          </div>

                          <div className="text-[12px] text-slate-500 leading-relaxed">
                            • Referral Itinerary: <b>date & time mandatory</b>
                            <br />• Confirm Itinerary: optional
                          </div>
                        </div>
                      </div>

                      {/* Buttons: reduced width + same Confirm style for all 3 */}
                      <div className="flex flex-col gap-2 items-stretch">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleReferralDownload}
                          disabled={loadingReferral}
                          className={outlineBtnClass}
                          style={outlineBtnStyle}
                        >
                          {loadingReferral ? "Processing..." : "Download Referral Itinerary"}
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleConfirmDownload}
                          disabled={loadingConfirm}
                          className={outlineBtnClass}
                          style={outlineBtnStyle}
                        >
                          {loadingConfirm ? "Processing..." : "Download Confirm Itinerary"}
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={openPointDiscount}
                          disabled={previewLoading || !tourFull}
                          className={outlineBtnClass}
                          style={outlineBtnStyle}
                        >
                          View Point and Discount Options
                        </motion.button>
                      </div>

                      <div className="text-[11px] text-slate-500 px-1 sm:text-right">
                        Selected discount:{" "}
                        <span className="font-semibold text-slate-800">
                          {money(asNum(discountAmount))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

