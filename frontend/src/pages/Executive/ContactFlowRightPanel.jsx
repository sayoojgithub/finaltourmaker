// // ContactFlowRightPanel.jsx
// import React, { useState,useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   ArrowLeft,
//   ChevronRight as CrumbChevronRight,
//   Plane,
//   CircleDot,
//   PartyPopper,
//   CalendarClock,
// } from "lucide-react";
// import Select from "react-select";
// import API from "../../api";
// import { toast } from "react-toastify";
// export default function ContactFlowRightPanel({
//   client,
//   brandColor,
//   breadcrumb,
//   percent,
//   node,
//   path,
//   currentKey,
//   completed,
//   note,
//   setNote,
//   onPick,
//   goStepBack,
//   isFixedOrGroupStep,
//   tourPickerOpen,
//   onReopenTours,
//   onMiniQuestionDone,
//   onCloseAll,
//   onStatusUpdated,
// }) {
//   const themeColor = brandColor || "#8570EE";
//   const isAnsweredStep = currentKey === "answered";
//   console.log(client, "client details");
//   /* ========================================
//      TRACKING STATES (EACH CASE HAS ITS OWN SHAPE)
//   ======================================== */

//   // 1) Not reachable:
//   // status: "not_reachable"
//   // reasonId: "switched_off" | "out_of_coverage" | etc
//   // reasonLabel: display text
//   // next date/time in raw + iso + readable formats
//   const [notReachableTrack, setNotReachableTrack] = useState({
//     status: "not_reachable",
//     reasonId: null,
//     reasonLabel: "",
//     nextDateRaw: "", // "YYYY-MM-DD"
//     nextTimeRaw: "", // "HH:MM"
//     nextDateISO: null, // ISO string
//     nextDateReadable: "", // "23 Nov 2025"
//     nextDateTimeReadable: "", // "23 Nov 2025, 10:30 AM"
//   });

//   // 2) Not answered:
//   // status: "not_answered"
//   // reasonId: "full_ring" | "busy" | "cut_phone" | "blocked"
//   const [notAnsweredTrack, setNotAnsweredTrack] = useState({
//     status: "not_answered",
//     reasonId: null,
//     reasonLabel: "",
//     nextDateRaw: "",
//     nextTimeRaw: "",
//     nextDateISO: null,
//     nextDateReadable: "",
//     nextDateTimeReadable: "",
//   });

//   // 3) Answered – group tour:
//   // For now, only track that this path was chosen and tour ID (to be filled later).
//   const [answeredGroupTrack, setAnsweredGroupTrack] = useState({
//     status: "answered_group_tour",
//     selectedGroupTourId: null, // to be set from tour picker in future
//   });

//   // 4) Answered – fixed tour:
//   const [answeredFixedTrack, setAnsweredFixedTrack] = useState({
//     status: "answered_fixed_tour",
//     selectedFixedTourId: null, // to be set from tour picker in future
//   });

//   // 5) Answered – custom tour (we'll extend later)
//   const [answeredCustomTrack, setAnsweredCustomTrack] = useState({
//     status: "answered_custom_tour",
//     // future fields
//   });

//   // 6) Answered – interested:
//   // status: "interested"
//   // reasonId: "book_tomorrow" | "hold" | "change"
//   // if reason === "change": changeTypeId: "itinerary_change" | "price_change" | "destination_change" | "date_change"
//   const [answeredInterestedTrack, setAnsweredInterestedTrack] = useState({
//     status: "interested",
//     reasonId: null,
//     reasonLabel: "",
//     changeTypeId: null,
//     changeTypeLabel: "",
//     nextDateRaw: "",
//     nextTimeRaw: "",
//     nextDateISO: null,
//     nextDateReadable: "",
//     nextDateTimeReadable: "",
//   });

//   // 7) Answered – not interested:
//   // status: "not_interested"
//   // reasonId: "price_high" | "not_right_time" | "not_interested_tour" | "group_full"
//   const [answeredNotInterestedTrack, setAnsweredNotInterestedTrack] = useState({
//     status: "not_interested",
//     reasonId: null,
//     reasonLabel: "",
//     nextDateRaw: "",
//     nextTimeRaw: "",
//     nextDateISO: null,
//     nextDateReadable: "",
//     nextDateTimeReadable: "",
//   });

//   // Which "answered" branch was chosen? ("group" | "fixed" | "custom" | "interested" | "not_interested")
//   const [lastAnsweredKind, setLastAnsweredKind] = useState(null);
//   const [changeEditMode, setChangeEditMode] = useState(null);
// // null | "destination" | "date"

// const [destOptions, setDestOptions] = useState([]);
// const [loadingDestOptions, setLoadingDestOptions] = useState(false);
// const [selectedNewDestination, setSelectedNewDestination] = useState(null);

// const [newStartDate, setNewStartDate] = useState("");
// const [newEndDate, setNewEndDate] = useState("");

// const [savingChange, setSavingChange] = useState(false);

//   /* ========================================
//      TRACKING LOGIC – WHAT HAPPENS WHEN WE PICK AN OPTION
//   ======================================== */

//   const trackOptionSelection = (key, option) => {
//     if (!key || !option) return;

//     const id = (option.id || "").toLowerCase();
//     const label = option.label || "";

//     // 1) NOT REACHABLE node (reasons: switched off, out of coverage, etc.)
//     if (key === "not_reachable") {
//       setNotReachableTrack((prev) => ({
//         ...prev,
//         reasonId: id,
//         reasonLabel: label,
//       }));
//     }

//     // 2) NOT ANSWERED node (reasons: full ring, busy, cut phone, blocked)
//     else if (key === "not_answered") {
//       setNotAnsweredTrack((prev) => ({
//         ...prev,
//         reasonId: id,
//         reasonLabel: label,
//       }));
//     }

//     // 3) ANSWERED node – initial branch selection
//     else if (key === "answered") {
//       if (id === "group_tours") {
//         setAnsweredGroupTrack((prev) => ({
//           ...prev,
//           status: "answered_group_tour",
//         }));
//         setLastAnsweredKind("group");
//       } else if (id === "fixed_tours") {
//         setAnsweredFixedTrack((prev) => ({
//           ...prev,
//           status: "answered_fixed_tour",
//         }));
//         setLastAnsweredKind("fixed");
//       } else if (id === "custom_tour") {
//         setAnsweredCustomTrack((prev) => ({
//           ...prev,
//           status: "answered_custom_tour",
//         }));
//         setLastAnsweredKind("custom");
//       } else if (id === "interested") {
//         // Mark that this flow is "interested"
//         setAnsweredInterestedTrack((prev) => ({
//           ...prev,
//           status: "interested",
//         }));
//         setLastAnsweredKind("interested");
//       } else if (id === "not_interested") {
//         // Mark that this flow is "not interested"
//         setAnsweredNotInterestedTrack((prev) => ({
//           ...prev,
//           status: "not_interested",
//         }));
//         setLastAnsweredKind("not_interested");
//       }
//     }

//     // 4) INTERESTED node – reasons: book_tomorrow / hold / change
//     else if (key === "interested") {
//       setAnsweredInterestedTrack((prev) => ({
//         ...prev,
//         reasonId: id,
//         reasonLabel: label,
//       }));
//     }

//     // 5) CHANGE node – what they want to change: itinerary / price / destination / date
//     else if (key === "change") {
//       setAnsweredInterestedTrack((prev) => ({
//         ...prev,
//         changeTypeId: id,
//         changeTypeLabel: label,
//       }));
//     }

//     // 6) NOT INTERESTED node – reasons: price_high / not_right_time / not_interested_tour / group_full
//     else if (key === "not_interested") {
//       setAnsweredNotInterestedTrack((prev) => ({
//         ...prev,
//         reasonId: id,
//         reasonLabel: label,
//       }));
//     }
//   };

//   // Wrap original onPick
//   const handleOptionClick = (option) => {
//     trackOptionSelection(currentKey, option);
//     onPick(option);
//   };

//   /* ========================================
//      ANSWERED STEP UI (tour type row etc.)
//   ======================================== */

//   const answeredTopOptions = [
//     {
//       id: "group_tours",
//       label: "Group tour",
//       icon: Plane,
//     },
//     {
//       id: "custom_tour",
//       label: "Custom tour",
//       icon: Plane,
//     },
//     {
//       id: "fixed_tours",
//       label: "Fixed tour",
//       icon: Plane,
//     },
//   ];

//   const answeredInterestOptions =
//     node?.options?.filter((o) => {
//       const id = (o.id || "").toLowerCase();
//       const label = (o.label || "").toLowerCase();
//       return (
//         id === "interested" ||
//         id === "not_interested" ||
//         label === "interested" ||
//         label === "not interested"
//       );
//     }) || [];

//   /* ========================================
//      RENDER
//   ======================================== */
//   useEffect(() => {
//   const last = path[path.length - 1];

//   if (last === "destination_change") {
//     setChangeEditMode("destination");
//     setSelectedNewDestination(null);

//     (async () => {
//       try {
//         setLoadingDestOptions(true);
//         const res = await API.get(`/executive/client-destinations/${client._id}`);
//         const opts = (res.data?.destinations || []).map((d) => ({
//           _id: d._id,
//           value: d.value,
//           label: d.label || d.value,
//         }));
//         setDestOptions(opts);
//       } catch (e) {
//         toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
//       } finally {
//         setLoadingDestOptions(false);
//       }
//     })();
//   }
//   else if (last === "date_change") {
//     setChangeEditMode("date");

//     const s = client?.startDate ? new Date(client.startDate).toISOString().slice(0, 10) : "";
//     const e = client?.endDate ? new Date(client.endDate).toISOString().slice(0, 10) : "";
//     setNewStartDate(s);
//     setNewEndDate(e);
//   }
//   else {
//     setChangeEditMode(null);
//   }
// }, [path, client?._id]);
// const saveDestinationChange = async () => {
//   if (!selectedNewDestination?._id) {
//     toast.error("Please select a destination");
//     return;
//   }
//   if (savingChange) return;

//   try {
//     setSavingChange(true);

//     await API.put(`/executive/clients/${client._id}`, {
//       primaryDestinationName: {
//         _id: selectedNewDestination._id,
//         value: selectedNewDestination.value,
//         label: selectedNewDestination.label,
//       },
//     });

//     toast.success("Destination updated");

//     // ✅ now open FollowupScheduler
//     // IMPORTANT: reasonId/label already tracked as change → destination_change
//     onMiniQuestionDone?.();
//   } catch (e) {
//     toast.error(e?.response?.data?.message || e.message || "Failed to update destination");
//   } finally {
//     setSavingChange(false);
//   }
// };
// const saveDateChange = async () => {
//   if (!newStartDate || !newEndDate) {
//     toast.error("Please select start and end dates");
//     return;
//   }

//   const s = new Date(newStartDate);
//   const e = new Date(newEndDate);
//   if (e < s) {
//     toast.error("End date cannot be before start date");
//     return;
//   }

//   if (savingChange) return;

//   try {
//     setSavingChange(true);

//     await API.put(`/executive/clients/${client._id}`, {
//       startDate: newStartDate,
//       endDate: newEndDate,
//     });

//     toast.success("Dates updated");

//     // ✅ now open FollowupScheduler
//     onMiniQuestionDone?.();
//   } catch (err) {
//     toast.error(err?.response?.data?.message || err.message || "Failed to update dates");
//   } finally {
//     setSavingChange(false);
//   }
// };

//   return (
//     <>
//       {/* Top Ribbon */}
//       <div
//         className="h-2 w-full"
//         style={{
//           background: `linear-gradient(90deg, ${themeColor}, #c7bef9)`,
//         }}
//       />

//       {/* Header */}
//       <div className="bg-white p-4 sm:p-6 border-b border-slate-100">
//         <div className="flex items-center justify-between gap-2">
//           <div>
//             <div className="text-sm text-gray-500">Contacting</div>
//             <div className="text-lg font-bold">{client?.name || "Client"}</div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={goStepBack}
//               className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1"
//             >
//               <ArrowLeft size={14} />
//               Back
//             </button>
//           </div>
//         </div>

//         {/* Progress */}
//         <div className="mt-4">
//           <div className="flex items-center justify-between text-xs text-gray-500">
//             <span>Progress</span>
//             <span>{percent}%</span>
//           </div>
//           <div className="mt-2 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
//             <motion.div
//               className="h-full"
//               style={{ background: themeColor }}
//               initial={{ width: 0 }}
//               animate={{ width: `${percent}%` }}
//               transition={{
//                 type: "spring",
//                 stiffness: 120,
//                 damping: 18,
//                 mass: 0.8,
//               }}
//             />
//           </div>

//           {/* Breadcrumb */}
//           <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
//             {breadcrumb.map((k, i) => (
//               <span
//                 key={i}
//                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white"
//                 style={{ borderColor: themeColor, color: themeColor }}
//               >
//                 {labelFor(k)}
//                 {i < breadcrumb.length - 1 && (
//                   <CrumbChevronRight size={14} className="opacity-60" />
//                 )}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Body – scrollable right panel */}
//       <div className="bg-gradient-to-b from-white to-purple-50/50 p-4 sm:p-6 min-h-0 overflow-y-auto scroll-smooth">
//         {!completed ? (
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-3">{node.label}</h3>
//             {changeEditMode === "destination" && (
//   <div className="rounded-2xl border bg-white p-4 mb-4">
//     <div className="font-semibold text-gray-900 mb-2">Select new destination</div>

//     <Select
//       isLoading={loadingDestOptions}
//       options={destOptions}
//       value={selectedNewDestination}
//       onChange={setSelectedNewDestination}
//       placeholder={loadingDestOptions ? "Loading..." : "Select destination"}
//       getOptionValue={(o) => String(o._id || o.value)}
//       isClearable
//     />

//     <div className="mt-4 flex gap-2">
//       <button
//         type="button"
//         onClick={saveDestinationChange}
//         disabled={savingChange}
//         className="px-4 py-2 rounded-xl bg-[#8570EE] text-white font-semibold"
//       >
//         {savingChange ? "Saving..." : "Save & schedule follow-up"}
//       </button>

//       <button
//         type="button"
//         onClick={goStepBack}
//         className="px-4 py-2 rounded-xl border"
//       >
//         Back
//       </button>
//     </div>
//   </div>
// )}
// {changeEditMode === "date" && (
//   <div className="rounded-2xl border bg-white p-4 mb-4">
//     <div className="font-semibold text-gray-900 mb-2">Select new travel dates</div>

//     <div className="grid grid-cols-2 gap-3">
//       <div>
//         <label className="text-xs text-gray-600">Start</label>
//         <input
//           type="date"
//           value={newStartDate}
//           onChange={(e) => setNewStartDate(e.target.value)}
//           className="w-full rounded-xl border px-3 py-2"
//         />
//       </div>
//       <div>
//         <label className="text-xs text-gray-600">End</label>
//         <input
//           type="date"
//           value={newEndDate}
//           onChange={(e) => setNewEndDate(e.target.value)}
//           className="w-full rounded-xl border px-3 py-2"
//         />
//       </div>
//     </div>

//     <div className="mt-4 flex gap-2">
//       <button
//         type="button"
//         onClick={saveDateChange}
//         disabled={savingChange}
//         className="px-4 py-2 rounded-xl bg-[#8570EE] text-white font-semibold"
//       >
//         {savingChange ? "Saving..." : "Save & schedule follow-up"}
//       </button>

//       <button
//         type="button"
//         onClick={goStepBack}
//         className="px-4 py-2 rounded-xl border"
//       >
//         Back
//       </button>
//     </div>
//   </div>
// )}

//             {/* Options */}
//             {node.options?.length > 0 && (
//               <>
//                 {/* Special layout ONLY for "answered" step */}
//                 {isAnsweredStep ? (
//                   <div className="grid grid-cols-1 gap-3">
//                     {/* Top row: tour type options */}
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                       {answeredTopOptions.map((o) => (
//                         <OptionCard
//                           key={o.id}
//                           option={o}
//                           onClick={() =>
//                             handleOptionClick({
//                               id: o.id,
//                               label: o.label,
//                               icon: o.icon,
//                             })
//                           }
//                           brandColor={themeColor}
//                         />
//                       ))}
//                     </div>

//                     {/* Second row: interested / not interested */}
//                     {answeredInterestOptions.length > 0 && (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                         {answeredInterestOptions.map((o) => (
//                           <OptionCard
//                             key={o.id || o.label}
//                             option={o}
//                             onClick={() => handleOptionClick(o)}
//                             brandColor={themeColor}
//                           />
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   // Default layout for all other nodes
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {node.options.map((o) => (
//                       <OptionCard
//                         key={o.id}
//                         option={o}
//                         onClick={() => handleOptionClick(o)}
//                         brandColor={themeColor}
//                       />
//                     ))}

//                     {/* {path[path.length - 1] === "book_tomorrow" && (
//                       <MiniQuestion
//                         title="When tomorrow?"
//                         choices={["Morning", "Afternoon", "Evening"]}
//                         onPick={onMiniQuestionDone}
//                       />
//                     )}

//                     {path[path.length - 1] === "hold" && (
//                       <MiniQuestion
//                         title="Hold until?"
//                         choices={["3 days", "1 week", "2 weeks"]}
//                         onPick={onMiniQuestionDone}
//                       />
//                     )} */}
//                   </div>
//                 )}
//               </>
//             )}

//             {/* Re-open tours button */}
//             {isFixedOrGroupStep && !tourPickerOpen && (
//               <div className="mt-3">
//                 <button
//                   type="button"
//                   // onClick={onReopenTours}
//                   onClick={() =>
//                     onReopenTours(
//                       currentKey === "fixed_tours" ? "fixed" : "group"
//                     )
//                   }
//                   className="
//                     inline-flex items-center gap-2
//                     px-4 py-2
//                     rounded-xl
//                     text-sm font-semibold
//                     bg-[#8570EE]/10
//                     text-[#8570EE]
//                     border border-[#8570EE]/40
//                     hover:bg-[#8570EE]/15
//                     transition
//                   "
//                 >
//                   <Plane size={16} />
//                   {currentKey === "fixed_tours"
//                     ? "See fixed tours"
//                     : "See group tours"}
//                 </button>
//               </div>
//             )}

//             {/* Notes */}
//             <div className="mt-5">
//               <label className="text-sm text-gray-600">Notes (optional)</label>
//               <textarea
//                 value={note}
//                 onChange={(e) => setNote(e.target.value)}
//                 className="mt-2 w-full min-h-[80px] rounded-xl border p-3 focus:outline-none focus:ring-4"
//                 style={{ borderColor: "#e5e7eb" }}
//                 placeholder="Type any quick notes here..."
//               />
//             </div>
//           </div>
//         ) : (
//           <FollowupScheduler
//             brandColor={themeColor}
//             onClose={onCloseAll}
//             note={note}
//             currentKey={currentKey}
//             lastAnsweredKind={lastAnsweredKind}
//             // onSaveFollowup={(payload) => {
//             onSaveFollowup={async (payload) => {
//               const {
//                 nextDateRaw,
//                 nextTimeRaw,
//                 nextDateISO,
//                 nextDateReadable,
//                 nextDateTimeReadable,
//               } = payload;
//               // 1) Not Answered Flow
//               if (currentKey === "not_answered") {
//                 if (!nextDateRaw || !nextTimeRaw) {
//                   toast.error("Please schedule follow-up date and time");
//                   return;
//                 }
//                 const updated = {
//                   ...notAnsweredTrack,
//                   nextDateRaw,
//                   nextTimeRaw,
//                   nextDateISO,
//                   nextDateReadable,
//                   nextDateTimeReadable,
//                 };

//                 // update state
//                 setNotAnsweredTrack(updated);

//                 // 🔹 API CALL FOR NOT ANSWERED CASE
//                 if (client?._id) {
//                   try {
//                     await API.post("/executive/not-answered-status-updation", {
//                       clientId: client._id,
//                       ...updated,
//                     });

//                     toast.success("Not answered follow-up saved");
//                     if (typeof onStatusUpdated === "function") {
//                       onStatusUpdated();
//                     }
//                   } catch (err) {
//                     const msg =
//                       err?.response?.data?.message ||
//                       err.message ||
//                       "Failed to save not answered follow-up";
//                     toast.error(msg);
//                     console.error("Failed to save NOT_ANSWERED follow-up", err);
//                   }
//                 }

//                 // important: return so we don't run other branches
//                 return;
//               }

//               // 2) Not reachable flow
//               else if (currentKey === "not_reachable") {
//                 // just to be safe – though FollowupScheduler also blocks
//                 if (!nextDateRaw || !nextTimeRaw) {
//                   toast.error("Please schedule follow-up date and time");
//                   return;
//                 }

//                 const updated = {
//                   ...notReachableTrack,
//                   nextDateRaw,
//                   nextTimeRaw,
//                   nextDateISO,
//                   nextDateReadable,
//                   nextDateTimeReadable,
//                 };

//                 setNotReachableTrack(updated);

//                 if (client?._id) {
//                   try {
//                     await API.post("/executive/not-reachable-status-updation", {
//                       clientId: client._id,
//                       ...updated,
//                     });

//                     toast.success("Not reachable follow-up saved");
//                     if (typeof onStatusUpdated === "function") {
//                       onStatusUpdated();
//                     }
//                   } catch (err) {
//                     const msg =
//                       err?.response?.data?.message ||
//                       err.message ||
//                       "Failed to save not reachable follow-up";
//                     toast.error(msg);
//                     console.error(
//                       "Failed to save NOT_REACHABLE follow-up",
//                       err
//                     );
//                   }
//                 }

//                 return;
//               }

//               // 3) Any "answered" → interested flow
//               // else if (lastAnsweredKind === "interested") {
//               //   setAnsweredInterestedTrack((prev) => {
//               //     const updated = {
//               //       ...prev,
//               //       nextDateRaw,
//               //       nextTimeRaw,
//               //       nextDateISO,
//               //       nextDateReadable,
//               //       nextDateTimeReadable,
//               //     };
//               //     console.log("ANSWERED INTERESTED track:", updated);
//               //     return updated;
//               //   });
//               // }
//               else if (
//                 lastAnsweredKind === "interested" ||
//                 currentKey === "interested"
//               ) {
//                 // ✅ require schedule like other flows
//                 if (!nextDateRaw || !nextTimeRaw) {
//                   toast.error("Please schedule follow-up date and time");
//                   return;
//                 }

//                 const updated = {
//                   ...answeredInterestedTrack, // base: includes reasonId/reasonLabel/changeTypeId/changeTypeLabel
//                   nextDateRaw,
//                   nextTimeRaw,
//                   nextDateISO,
//                   nextDateReadable,
//                   nextDateTimeReadable,
//                   note: note || "", // ✅ include note if you want
//                 };

//                 // ✅ update state
//                 setAnsweredInterestedTrack(updated);

//                 // ✅ API call
//                 if (client?._id) {
//                   try {
//                     await API.post("/executive/interested-status-updation", {
//                       clientId: client._id,
//                       ...updated,
//                     });

//                     toast.success("Interested status & follow-up saved");

//                     if (typeof onStatusUpdated === "function") {
//                       onStatusUpdated();
//                     }
//                   } catch (err) {
//                     const msg =
//                       err?.response?.data?.message ||
//                       err.message ||
//                       "Failed to save interested follow-up";
//                     toast.error(msg);
//                     console.error("Failed to save INTERESTED follow-up", err);
//                     return;
//                   }
//                 }
//                 return;
//               }

//               // 4) Any "answered" → not interested flow
//               else if (
//                 lastAnsweredKind === "not_interested" ||
//                 currentKey === "not_interested"
//               ) {
//                 // 🔒 extra safety – same as not answered / not reachable
//                 if (!nextDateRaw || !nextTimeRaw) {
//                   toast.error("Please schedule follow-up date and time");
//                   return;
//                 }

//                 const updated = {
//                   ...answeredNotInterestedTrack, // base: has status, reasonId, reasonLabel
//                   nextDateRaw,
//                   nextTimeRaw,
//                   nextDateISO,
//                   nextDateReadable,
//                   nextDateTimeReadable,
//                 };

//                 // update state
//                 setAnsweredNotInterestedTrack(updated);

//                 // 🔹 API CALL FOR ANSWERED NOT INTERESTED CASE
//                 if (client?._id) {
//                   try {
//                     await API.post(
//                       "/executive/not-interested-status-updation",
//                       {
//                         clientId: client._id,
//                         ...updated,
//                       }
//                     );

//                     toast.success("Not interested status & follow-up saved");
//                     if (typeof onStatusUpdated === "function") {
//                       onStatusUpdated(); // refresh SalesClients + ClientCategories
//                     }
//                   } catch (err) {
//                     const msg =
//                       err?.response?.data?.message ||
//                       err.message ||
//                       "Failed to save not interested follow-up";
//                     toast.error(msg);
//                     console.error(
//                       "Failed to save NOT_INTERESTED follow-up",
//                       err
//                     );
//                   }
//                 }
//               }

//               // You can still inspect all tracks here if needed:
//               console.log({
//                 notReachableTrack,
//                 notAnsweredTrack,
//                 answeredGroupTrack,
//                 answeredFixedTrack,
//                 answeredCustomTrack,
//                 answeredInterestedTrack,
//                 answeredNotInterestedTrack,
//               });
//             }}
//           />
//         )}
//       </div>
//     </>
//   );
// }

// /* =========================
//    HELPERS & SUBCOMPONENTS
// ========================= */

// function labelFor(key) {
//   if (key === "root") return "Start";
//   const map = {
//     not_answered: "Not answered",
//     answered: "Answered",
//     not_reachable: "Not reachable",
//     details_sent: "Details sent",
//     details_sent_tourtype: "Tour type",
//     fixed_tours: "Fixed tours",
//     group_tours: "Group tours",
//     interested: "Interested",
//     not_interested: "Not interested",
//     confirmed: "Confirmed",
//     book_tomorrow: "Book tomorrow",
//     hold: "Hold",
//     change: "Change",
//     itinerary_change: "Itinerary",
//     price_change: "Price",
//     destination_change: "Destination",
//     date_change: "Date",
//   };
//   return map[key] || key;
// }

// function OptionCard({ option, onClick, brandColor }) {
//   const Icon = option.icon || CircleDot;
//   return (
//     <motion.button
//       whileHover={{ y: -3, scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       onClick={onClick}
//       className="flex items-center gap-3 p-4 rounded-2xl border text-left shadow-sm bg-white hover:shadow-md"
//       style={{ borderColor: brandColor + "33" }}
//       transition={{ type: "spring", stiffness: 160, damping: 16 }}
//     >
//       <div
//         className="p-3 rounded-xl border"
//         style={{ borderColor: brandColor + "55", color: brandColor }}
//       >
//         <Icon size={20} />
//       </div>
//       <div>
//         <div className="font-semibold text-gray-900">{option.label}</div>
//         <div className="text-xs text-gray-500">Tap to choose</div>
//       </div>
//     </motion.button>
//   );
// }

// function MiniQuestion({ title, choices, onPick }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ type: "spring", stiffness: 120, damping: 18 }}
//       className="col-span-full mt-2"
//     >
//       <div className="text-sm text-gray-600 mb-2">{title}</div>
//       <div className="flex flex-wrap gap-2">
//         {choices.map((c) => (
//           <motion.button
//             key={c}
//             whileHover={{ y: -2 }}
//             transition={{ type: "spring", stiffness: 160, damping: 18 }}
//             onClick={onPick}
//             className="px-3 py-1.5 rounded-full border bg-white text-sm"
//           >
//             {c}
//           </motion.button>
//         ))}
//       </div>
//     </motion.div>
//   );
// }

// /* =========================
//    FOLLOW-UP SCHEDULER
// ========================= */

// function FollowupScheduler({
//   brandColor,
//   onClose,
//   note,
//   currentKey,
//   lastAnsweredKind,
//   onSaveFollowup,
// }) {
//   const [nextDate, setNextDate] = useState("");
//   const [nextTime, setNextTime] = useState("");
//   const [saving, setSaving] = useState(false);
//   const handleSubmit = async () => {
//     if (saving) return;
//     // 🔹 Block if date or time missing (for all cases, including not answered)
//     if (!nextDate || !nextTime) {
//       toast.error("Please schedule follow-up date and time");
//       return;
//     }
//     setSaving(true);
//     let iso = null;
//     let readableDate = "";
//     let readableDateTime = "";

//     if (nextDate) {
//       const full = `${nextDate}T${nextTime || "00:00"}:00`;
//       const d = new Date(full);
//       if (!Number.isNaN(d.getTime())) {
//         iso = d.toISOString();
//         readableDate = d.toLocaleDateString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         });
//         readableDateTime = d.toLocaleString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//       }
//     }

//     if (onSaveFollowup) {
//       await onSaveFollowup({
//         nextDateRaw: nextDate,
//         nextTimeRaw: nextTime,
//         nextDateISO: iso,
//         nextDateReadable: readableDate,
//         nextDateTimeReadable: readableDateTime,
//       });
//     }
//     setSaving(false);
//     onClose();
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ type: "spring", stiffness: 120, damping: 18 }}
//       className="max-w-md mx-auto"
//     >
//       <div className="flex items-center justify-center">
//         <motion.div
//           initial={{ scale: 0.9, rotate: -4 }}
//           animate={{ scale: 1, rotate: 0 }}
//           transition={{ type: "spring", stiffness: 200, damping: 16 }}
//           className="w-20 h-20 rounded-3xl grid place-items-center shadow-xl"
//           style={{ background: brandColor + "22", color: brandColor }}
//         >
//           <CalendarClock size={34} />
//         </motion.div>
//       </div>

//       <h3 className="mt-4 text-xl font-bold text-gray-900 text-center">
//         Schedule next contact
//       </h3>
//       <p className="text-gray-600 mt-1 text-center text-sm">
//         Set a date and time to follow up with this client.
//       </p>

//       <div className="mt-5 space-y-4">
//         <div>
//           <label className="text-xs font-semibold text-gray-600 mb-1 block">
//             Next contact date
//           </label>
//           <input
//             type="date"
//             value={nextDate}
//             onChange={(e) => setNextDate(e.target.value)}
//             className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8570EE]"
//           />
//         </div>
//         <div>
//           <label className="text-xs font-semibold text-gray-600 mb-1 block">
//             Next contact time
//           </label>
//           <input
//             type="time"
//             value={nextTime}
//             onChange={(e) => setNextTime(e.target.value)}
//             className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8570EE]"
//           />
//         </div>

//         {note && (
//           <div className="mt-1">
//             <div className="text-xs font-semibold text-gray-600 mb-1">
//               Your note for this client
//             </div>
//             <div className="text-xs bg-white rounded-xl border border-slate-200 px-3 py-2 text-gray-700">
//               {note}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           disabled={saving}
//           className="px-5 py-2.5 rounded-full text-white font-semibold shadow flex items-center gap-2"
//           style={{ background: brandColor }}
//         >
//           <PartyPopper size={16} />
//           <span>{saving ? "Saving..." : "Save follow-up & close"}</span>
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// ContactFlowRightPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight as CrumbChevronRight,
  Plane,
  CircleDot,
  PartyPopper,
  CalendarClock,
} from "lucide-react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function ContactFlowRightPanel({
  client,
  brandColor,
  breadcrumb,
  percent,
  node,
  path,
  currentKey,
  completed,
  note,
  setNote,
  onPick,
  goStepBack,
  isFixedOrGroupStep,
  tourPickerOpen,
  onReopenTours,
  onMiniQuestionDone,
  onCloseAll,
  onStatusUpdated,
}) {
  const themeColor = brandColor || "#8570EE";
  const isAnsweredStep = currentKey === "answered";

  /* ========== react-select styles (match your style) ========== */
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? themeColor : "#e5e7eb",
        boxShadow: state.isFocused ? `0 0 0 2px ${themeColor}22` : "none",
        minHeight: 42,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? themeColor : "#d1d5db" },
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
      menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 60 }),
      option: (b, s) => ({
        ...b,
        backgroundColor: s.isFocused
          ? `${themeColor}14`
          : s.isSelected
          ? `${themeColor}22`
          : "white",
        color: "#111827",
      }),
      placeholder: (b) => ({ ...b, color: "#6b7280" }),
      singleValue: (b) => ({ ...b, color: "#111827" }),
    }),
    [themeColor]
  );

  /* ========================================
     TRACKING STATES (EACH CASE HAS ITS OWN SHAPE)
  ======================================== */

  const [notReachableTrack, setNotReachableTrack] = useState({
    status: "not_reachable",
    reasonId: null,
    reasonLabel: "",
    nextDateRaw: "",
    nextTimeRaw: "",
    nextDateISO: null,
    nextDateReadable: "",
    nextDateTimeReadable: "",
  });

  const [notAnsweredTrack, setNotAnsweredTrack] = useState({
    status: "not_answered",
    reasonId: null,
    reasonLabel: "",
    nextDateRaw: "",
    nextTimeRaw: "",
    nextDateISO: null,
    nextDateReadable: "",
    nextDateTimeReadable: "",
  });

  const [answeredGroupTrack, setAnsweredGroupTrack] = useState({
    status: "answered_group_tour",
    selectedGroupTourId: null,
  });

  const [answeredFixedTrack, setAnsweredFixedTrack] = useState({
    status: "answered_fixed_tour",
    selectedFixedTourId: null,
  });

  const [answeredCustomTrack, setAnsweredCustomTrack] = useState({
    status: "answered_custom_tour",
  });

  const [answeredInterestedTrack, setAnsweredInterestedTrack] = useState({
    status: "interested",
    reasonId: null,
    reasonLabel: "",
    changeTypeId: null,
    changeTypeLabel: "",
    nextDateRaw: "",
    nextTimeRaw: "",
    nextDateISO: null,
    nextDateReadable: "",
    nextDateTimeReadable: "",
  });

  const [answeredNotInterestedTrack, setAnsweredNotInterestedTrack] = useState({
    status: "not_interested",
    reasonId: null,
    reasonLabel: "",
    nextDateRaw: "",
    nextTimeRaw: "",
    nextDateISO: null,
    nextDateReadable: "",
    nextDateTimeReadable: "",
  });

  const [lastAnsweredKind, setLastAnsweredKind] = useState(null);

  /* ========================================
     CHANGE MODE (ONLY destination_change / date_change)
  ======================================== */

  const [changeEditMode, setChangeEditMode] = useState(null); // null | "destination" | "date"

  // destination change
  const [destOptions, setDestOptions] = useState([]);
  const [loadingDestOptions, setLoadingDestOptions] = useState(false);
  const [selectedNewDestination, setSelectedNewDestination] = useState(null);

  // date change
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  // SAME UI schedule (only for these 2 cases)
  const [changeNextDate, setChangeNextDate] = useState("");
  const [changeNextTime, setChangeNextTime] = useState("");

  const [savingChange, setSavingChange] = useState(false);

  const buildReadable = (dateRaw, timeRaw) => {
    if (!dateRaw || !timeRaw) {
      return { iso: null, readableDate: "", readableDateTime: "" };
    }
    const full = `${dateRaw}T${timeRaw}:00`;
    const d = new Date(full);
    if (Number.isNaN(d.getTime())) {
      return { iso: null, readableDate: "", readableDateTime: "" };
    }
    return {
      iso: d.toISOString(),
      readableDate: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      readableDateTime: d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  /* ========================================
     TRACKING LOGIC – OPTION PICK
  ======================================== */

  const trackOptionSelection = (key, option) => {
    if (!key || !option) return;

    const id = (option.id || "").toLowerCase();
    const label = option.label || "";

    if (key === "not_reachable") {
      setNotReachableTrack((prev) => ({
        ...prev,
        reasonId: id,
        reasonLabel: label,
      }));
    } else if (key === "not_answered") {
      setNotAnsweredTrack((prev) => ({
        ...prev,
        reasonId: id,
        reasonLabel: label,
      }));
    } else if (key === "answered") {
      if (id === "group_tours") {
        setAnsweredGroupTrack((prev) => ({
          ...prev,
          status: "answered_group_tour",
        }));
        setLastAnsweredKind("group");
      } else if (id === "fixed_tours") {
        setAnsweredFixedTrack((prev) => ({
          ...prev,
          status: "answered_fixed_tour",
        }));
        setLastAnsweredKind("fixed");
      } else if (id === "custom_tour") {
        setAnsweredCustomTrack((prev) => ({
          ...prev,
          status: "answered_custom_tour",
        }));
        setLastAnsweredKind("custom");
      } else if (id === "interested") {
        setAnsweredInterestedTrack((prev) => ({
          ...prev,
          status: "interested",
        }));
        setLastAnsweredKind("interested");
      } else if (id === "not_interested") {
        setAnsweredNotInterestedTrack((prev) => ({
          ...prev,
          status: "not_interested",
        }));
        setLastAnsweredKind("not_interested");
      }
    } else if (key === "interested") {
      setAnsweredInterestedTrack((prev) => ({
        ...prev,
        reasonId: id,
        reasonLabel: label,
      }));
    } else if (key === "change") {
      setAnsweredInterestedTrack((prev) => ({
        ...prev,
        changeTypeId: id,
        changeTypeLabel: label,
      }));
    } else if (key === "not_interested") {
      setAnsweredNotInterestedTrack((prev) => ({
        ...prev,
        reasonId: id,
        reasonLabel: label,
      }));
    }
  };

  const handleOptionClick = (option) => {
    trackOptionSelection(currentKey, option);
    onPick(option);
  };

  /* ========================================
     ANSWERED STEP UI
  ======================================== */

  const answeredTopOptions = [
    { id: "group_tours", label: "Group tour", icon: Plane },
    { id: "custom_tour", label: "Custom tour", icon: Plane },
    { id: "fixed_tours", label: "Fixed tour", icon: Plane },
  ];

  const answeredInterestOptions =
    node?.options?.filter((o) => {
      const id = (o.id || "").toLowerCase();
      const label = (o.label || "").toLowerCase();
      return (
        id === "interested" ||
        id === "not_interested" ||
        label === "interested" ||
        label === "not interested"
      );
    }) || [];

  /* ========================================
     ENTER / EXIT destination_change & date_change MODE
  ======================================== */

  useEffect(() => {
    const last = path[path.length - 1];

    if (last === "destination_change") {
      setChangeEditMode("destination");
      setSelectedNewDestination(null);

      // reset schedule inputs for change-mode
      setChangeNextDate("");
      setChangeNextTime("");

      (async () => {
        try {
          setLoadingDestOptions(true);
          const res = await API.get(
            `/executive/client-destinations/${client?._id}`
          );
          const opts = (res.data?.destinations || []).map((d) => ({
            _id: d._id,
            value: d.value,
            label: d.label || d.value,
          }));
          setDestOptions(opts);
        } catch (e) {
          toast.error(
            e?.response?.data?.message ||
              e.message ||
              "Failed to load destinations"
          );
        } finally {
          setLoadingDestOptions(false);
        }
      })();
      return;
    }

    if (last === "date_change") {
      setChangeEditMode("date");

      // reset schedule inputs for change-mode
      setChangeNextDate("");
      setChangeNextTime("");

      const s = client?.startDate
        ? new Date(client.startDate).toISOString().slice(0, 10)
        : "";
      const e = client?.endDate
        ? new Date(client.endDate).toISOString().slice(0, 10)
        : "";
      setNewStartDate(s);
      setNewEndDate(e);
      return;
    }

    setChangeEditMode(null);
  }, [path, client?._id]);

  /* ========================================
     SAVE (destination/date) + schedule (same UI) + interested-status-updation
     ONLY FOR destination_change & date_change
  ======================================== */

  const saveDestinationChangeAndSchedule = async () => {
    if (!selectedNewDestination?._id) {
      toast.error("Please select a destination");
      return;
    }
    if (!changeNextDate || !changeNextTime) {
      toast.error("Please schedule next contact date and time");
      return;
    }
    if (savingChange) return;

    const r = buildReadable(changeNextDate, changeNextTime);

    try {
      setSavingChange(true);

      // 1) Update client destination
      await API.put(`/executive/clients/${client._id}`, {
        primaryDestinationName: {
          _id: selectedNewDestination._id,
          value: selectedNewDestination.value,
          label: selectedNewDestination.label,
        },
      });

      // 2) Save interested follow-up (same payload style as your other flows)
      const interestedPayload = {
        ...answeredInterestedTrack,
        nextDateRaw: changeNextDate,
        nextTimeRaw: changeNextTime,
        nextDateISO: r.iso,
        nextDateReadable: r.readableDate,
        nextDateTimeReadable: r.readableDateTime,
        note: note || "",
      };

      await API.post("/executive/interested-status-updation", {
        clientId: client._id,
        ...interestedPayload,
      });

      toast.success("Destination updated + follow-up scheduled");

      if (typeof onStatusUpdated === "function") onStatusUpdated();
      onCloseAll?.();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to save changes"
      );
    } finally {
      setSavingChange(false);
    }
  };

  const saveDateChangeAndSchedule = async () => {
    if (!newStartDate || !newEndDate) {
      toast.error("Please select start and end dates");
      return;
    }
    const s = new Date(newStartDate);
    const e = new Date(newEndDate);
    if (e < s) {
      toast.error("End date cannot be before start date");
      return;
    }
    if (!changeNextDate || !changeNextTime) {
      toast.error("Please schedule next contact date and time");
      return;
    }
    if (savingChange) return;

    const r = buildReadable(changeNextDate, changeNextTime);

    try {
      setSavingChange(true);

      // 1) Update client dates
      await API.put(`/executive/clients/${client._id}`, {
        startDate: newStartDate,
        endDate: newEndDate,
      });

      // 2) Save interested follow-up
      const interestedPayload = {
        ...answeredInterestedTrack,
        nextDateRaw: changeNextDate,
        nextTimeRaw: changeNextTime,
        nextDateISO: r.iso,
        nextDateReadable: r.readableDate,
        nextDateTimeReadable: r.readableDateTime,
        note: note || "",
      };

      await API.post("/executive/interested-status-updation", {
        clientId: client._id,
        ...interestedPayload,
      });

      toast.success("Dates updated + follow-up scheduled");

      if (typeof onStatusUpdated === "function") onStatusUpdated();
      onCloseAll?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to save changes"
      );
    } finally {
      setSavingChange(false);
    }
  };

  /* ========================================
     DEBUG: print entire tracked state
  ======================================== */
  useEffect(() => {
    console.log("CONTACT FLOW TRACK (ALL):", {
      currentKey,
      path,
      lastAnsweredKind,
      notReachableTrack,
      notAnsweredTrack,
      answeredGroupTrack,
      answeredFixedTrack,
      answeredCustomTrack,
      answeredInterestedTrack,
      answeredNotInterestedTrack,
      changeEditMode,
      selectedNewDestination,
      newStartDate,
      newEndDate,
      changeNextDate,
      changeNextTime,
      note,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentKey,
    path,
    lastAnsweredKind,
    notReachableTrack,
    notAnsweredTrack,
    answeredGroupTrack,
    answeredFixedTrack,
    answeredCustomTrack,
    answeredInterestedTrack,
    answeredNotInterestedTrack,
    changeEditMode,
    selectedNewDestination,
    newStartDate,
    newEndDate,
    changeNextDate,
    changeNextTime,
    note,
  ]);

  return (
    <>
      {/* Top Ribbon */}
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${themeColor}, #c7bef9)`,
        }}
      />

      {/* Header */}
      <div className="bg-white p-4 sm:p-6 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm text-gray-500">Contacting</div>
            <div className="text-lg font-bold">{client?.name || "Client"}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goStepBack}
              className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-2 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: themeColor }}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18,
                mass: 0.8,
              }}
            />
          </div>

          {/* Breadcrumb */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {breadcrumb.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {labelFor(k)}
                {i < breadcrumb.length - 1 && (
                  <CrumbChevronRight size={14} className="opacity-60" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-gradient-to-b from-white to-purple-50/50 p-4 sm:p-6 min-h-0 overflow-y-auto scroll-smooth">
        {!completed ? (
          <div>
            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-3">
              {changeEditMode === "destination"
                ? "Change destination"
                : changeEditMode === "date"
                ? "Change travel dates"
                : node?.label || " "}
            </h3>

            {/* ===== destination_change combined UI (destination + schedule) ===== */}
            {changeEditMode === "destination" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
                  Destination update
                </div>

                <div className="text-sm font-semibold text-slate-900 mb-1">
                  Select new destination
                </div>
                <Select
                  styles={selectStyles}
                  isLoading={loadingDestOptions}
                  options={destOptions}
                  value={selectedNewDestination}
                  onChange={setSelectedNewDestination}
                  placeholder={
                    loadingDestOptions ? "Loading..." : "Select destination"
                  }
                  getOptionValue={(o) => String(o._id || o.value)}
                  isClearable
                />

                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
                  Follow-up schedule
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">
                      Next contact date
                    </label>
                    <input
                      type="date"
                      value={changeNextDate}
                      onChange={(e) => setChangeNextDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                      style={{ outlineColor: themeColor }}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">
                      Next contact time
                    </label>
                    <input
                      type="time"
                      value={changeNextTime}
                      onChange={(e) => setChangeNextTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                      style={{ outlineColor: themeColor }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={saveDestinationChangeAndSchedule}
                    disabled={savingChange}
                    className="
      px-5 py-2.5
      rounded-full
      text-white
      font-semibold
      shadow
      hover:opacity-90
      disabled:opacity-60
    "
                    style={{ background: themeColor }}
                  >
                    {savingChange ? "Saving..." : "Save destination + schedule"}
                  </button>

                  {/* <button type="button" onClick={goStepBack} className="px-4 py-2 rounded-xl border">
                    Back
                  </button> */}
                </div>
              </div>
            )}

            {/* ===== date_change combined UI (start/end + schedule) ===== */}
            {changeEditMode === "date" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
                  Date update
                </div>

                <div className="text-sm font-semibold text-slate-900 mb-2">
                  Select new travel dates
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">
                      Start
                    </label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">
                      End
                    </label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
                  Follow-up schedule
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">
                      Next contact date
                    </label>
                    <input
                      type="date"
                      value={changeNextDate}
                      onChange={(e) => setChangeNextDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">
                      Next contact time
                    </label>
                    <input
                      type="time"
                      value={changeNextTime}
                      onChange={(e) => setChangeNextTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={saveDateChangeAndSchedule}
                    disabled={savingChange}
                    className="
      px-5 py-2.5
      rounded-full
      text-white
      font-semibold
      shadow
      hover:opacity-90
      disabled:opacity-60
    "
                    style={{ background: themeColor }}
                  >
                    {savingChange ? "Saving..." : "Save dates + schedule"}
                  </button>

                  {/* <button type="button" onClick={goStepBack} className="px-4 py-2 rounded-xl border">
                    Back
                  </button> */}
                </div>
              </div>
            )}

            {/* Options (hide while destination/date edit mode is active) */}
            {!changeEditMode && node?.options?.length > 0 && (
              <>
                {isAnsweredStep ? (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {answeredTopOptions.map((o) => (
                        <OptionCard
                          key={o.id}
                          option={o}
                          onClick={() =>
                            handleOptionClick({
                              id: o.id,
                              label: o.label,
                              icon: o.icon,
                            })
                          }
                          brandColor={themeColor}
                        />
                      ))}
                    </div>

                    {answeredInterestOptions.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {answeredInterestOptions.map((o) => (
                          <OptionCard
                            key={o.id || o.label}
                            option={o}
                            onClick={() => handleOptionClick(o)}
                            brandColor={themeColor}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {node.options.map((o) => (
                      <OptionCard
                        key={o.id}
                        option={o}
                        onClick={() => handleOptionClick(o)}
                        brandColor={themeColor}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Re-open tours button */}
            {isFixedOrGroupStep && !tourPickerOpen && !changeEditMode && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() =>
                    onReopenTours(
                      currentKey === "fixed_tours" ? "fixed" : "group"
                    )
                  }
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2 rounded-xl
                    text-sm font-semibold
                    bg-[#8570EE]/10 text-[#8570EE]
                    border border-[#8570EE]/40
                    hover:bg-[#8570EE]/15 transition
                  "
                >
                  <Plane size={16} />
                  {currentKey === "fixed_tours"
                    ? "See fixed tours"
                    : "See group tours"}
                </button>
              </div>
            )}

            {/* Notes (keep notes always) */}
            {/* <div className="mt-5">
              <label className="text-sm text-gray-600">Notes (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 w-full min-h-[80px] rounded-xl border p-3 focus:outline-none focus:ring-4"
                style={{ borderColor: "#e5e7eb" }}
                placeholder="Type any quick notes here..."
              />
            </div> */}
          </div>
        ) : (
          <FollowupScheduler
            brandColor={themeColor}
            onClose={onCloseAll}
            note={note}
            currentKey={currentKey}
            lastAnsweredKind={lastAnsweredKind}
            onSaveFollowup={async (payload) => {
              const {
                nextDateRaw,
                nextTimeRaw,
                nextDateISO,
                nextDateReadable,
                nextDateTimeReadable,
              } = payload;

              // 1) Not Answered Flow
              if (currentKey === "not_answered") {
                if (!nextDateRaw || !nextTimeRaw) {
                  toast.error("Please schedule follow-up date and time");
                  return;
                }
                const updated = {
                  ...notAnsweredTrack,
                  nextDateRaw,
                  nextTimeRaw,
                  nextDateISO,
                  nextDateReadable,
                  nextDateTimeReadable,
                };

                setNotAnsweredTrack(updated);

                if (client?._id) {
                  try {
                    await API.post("/executive/not-answered-status-updation", {
                      clientId: client._id,
                      ...updated,
                    });

                    toast.success("Not answered follow-up saved");
                    if (typeof onStatusUpdated === "function")
                      onStatusUpdated();
                  } catch (err) {
                    const msg =
                      err?.response?.data?.message ||
                      err.message ||
                      "Failed to save not answered follow-up";
                    toast.error(msg);
                    console.error("Failed to save NOT_ANSWERED follow-up", err);
                  }
                }
                return;
              }

              // 2) Not reachable flow
              if (currentKey === "not_reachable") {
                if (!nextDateRaw || !nextTimeRaw) {
                  toast.error("Please schedule follow-up date and time");
                  return;
                }

                const updated = {
                  ...notReachableTrack,
                  nextDateRaw,
                  nextTimeRaw,
                  nextDateISO,
                  nextDateReadable,
                  nextDateTimeReadable,
                };

                setNotReachableTrack(updated);

                if (client?._id) {
                  try {
                    await API.post("/executive/not-reachable-status-updation", {
                      clientId: client._id,
                      ...updated,
                    });

                    toast.success("Not reachable follow-up saved");
                    if (typeof onStatusUpdated === "function")
                      onStatusUpdated();
                  } catch (err) {
                    const msg =
                      err?.response?.data?.message ||
                      err.message ||
                      "Failed to save not reachable follow-up";
                    toast.error(msg);
                    console.error(
                      "Failed to save NOT_REACHABLE follow-up",
                      err
                    );
                  }
                }
                return;
              }

              // 3) Answered → interested flow
              if (
                lastAnsweredKind === "interested" ||
                currentKey === "interested"
              ) {
                if (!nextDateRaw || !nextTimeRaw) {
                  toast.error("Please schedule follow-up date and time");
                  return;
                }

                const updated = {
                  ...answeredInterestedTrack,
                  nextDateRaw,
                  nextTimeRaw,
                  nextDateISO,
                  nextDateReadable,
                  nextDateTimeReadable,
                  note: note || "",
                };

                setAnsweredInterestedTrack(updated);

                if (client?._id) {
                  try {
                    await API.post("/executive/interested-status-updation", {
                      clientId: client._id,
                      ...updated,
                    });

                    toast.success("Interested status & follow-up saved");
                    if (typeof onStatusUpdated === "function")
                      onStatusUpdated();
                  } catch (err) {
                    const msg =
                      err?.response?.data?.message ||
                      err.message ||
                      "Failed to save interested follow-up";
                    toast.error(msg);
                    console.error("Failed to save INTERESTED follow-up", err);
                    return;
                  }
                }
                return;
              }

              // 4) Answered → not interested flow
              if (
                lastAnsweredKind === "not_interested" ||
                currentKey === "not_interested"
              ) {
                if (!nextDateRaw || !nextTimeRaw) {
                  toast.error("Please schedule follow-up date and time");
                  return;
                }

                const updated = {
                  ...answeredNotInterestedTrack,
                  nextDateRaw,
                  nextTimeRaw,
                  nextDateISO,
                  nextDateReadable,
                  nextDateTimeReadable,
                };

                setAnsweredNotInterestedTrack(updated);

                if (client?._id) {
                  try {
                    await API.post(
                      "/executive/not-interested-status-updation",
                      {
                        clientId: client._id,
                        ...updated,
                      }
                    );

                    toast.success("Not interested status & follow-up saved");
                    if (typeof onStatusUpdated === "function")
                      onStatusUpdated();
                  } catch (err) {
                    const msg =
                      err?.response?.data?.message ||
                      err.message ||
                      "Failed to save not interested follow-up";
                    toast.error(msg);
                    console.error(
                      "Failed to save NOT_INTERESTED follow-up",
                      err
                    );
                  }
                }
              }
            }}
          />
        )}
      </div>
    </>
  );
}

/* =========================
   HELPERS & SUBCOMPONENTS
========================= */

function labelFor(key) {
  if (key === "root") return "Start";
  const map = {
    not_answered: "Not answered",
    answered: "Answered",
    not_reachable: "Not reachable",
    details_sent: "Details sent",
    details_sent_tourtype: "Tour type",
    fixed_tours: "Fixed tours",
    group_tours: "Group tours",
    interested: "Interested",
    not_interested: "Not interested",
    confirmed: "Confirmed",
    book_tomorrow: "Book tomorrow",
    hold: "Hold",
    change: "Change",
    itinerary_change: "Itinerary",
    price_change: "Price",
    destination_change: "Destination",
    date_change: "Date",
  };
  return map[key] || key;
}

function OptionCard({ option, onClick, brandColor }) {
  const Icon = option.icon || CircleDot;
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl border text-left shadow-sm bg-white hover:shadow-md"
      style={{ borderColor: brandColor + "33" }}
      transition={{ type: "spring", stiffness: 160, damping: 16 }}
    >
      <div
        className="p-3 rounded-xl border"
        style={{ borderColor: brandColor + "55", color: brandColor }}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="font-semibold text-gray-900">{option.label}</div>
        <div className="text-xs text-gray-500">Tap to choose</div>
      </div>
    </motion.button>
  );
}

/* =========================
   FOLLOW-UP SCHEDULER
========================= */

function FollowupScheduler({
  brandColor,
  onClose,
  note,
  currentKey,
  lastAnsweredKind,
  onSaveFollowup,
}) {
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (saving) return;
    if (!nextDate || !nextTime) {
      toast.error("Please schedule follow-up date and time");
      return;
    }

    setSaving(true);

    let iso = null;
    let readableDate = "";
    let readableDateTime = "";

    const full = `${nextDate}T${nextTime || "00:00"}:00`;
    const d = new Date(full);

    if (!Number.isNaN(d.getTime())) {
      iso = d.toISOString();
      readableDate = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      readableDateTime = d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (onSaveFollowup) {
      await onSaveFollowup({
        nextDateRaw: nextDate,
        nextTimeRaw: nextTime,
        nextDateISO: iso,
        nextDateReadable: readableDate,
        nextDateTimeReadable: readableDateTime,
      });
    }

    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="max-w-md mx-auto"
    >
      <div className="flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, rotate: -4 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="w-20 h-20 rounded-3xl grid place-items-center shadow-xl"
          style={{ background: brandColor + "22", color: brandColor }}
        >
          <CalendarClock size={34} />
        </motion.div>
      </div>

      <h3 className="mt-4 text-xl font-bold text-gray-900 text-center">
        Schedule next contact
      </h3>
      <p className="text-gray-600 mt-1 text-center text-sm">
        Set a date and time to follow up with this client.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Next contact date
          </label>
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Next contact time
          </label>
          <input
            type="time"
            value={nextTime}
            onChange={(e) => setNextTime(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>

        {note && (
          <div className="mt-1">
            <div className="text-xs font-semibold text-gray-600 mb-1">
              Your note for this client
            </div>
            <div className="text-xs bg-white rounded-xl border border-slate-200 px-3 py-2 text-gray-700">
              {note}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-full text-white font-semibold shadow flex items-center gap-2"
          style={{ background: brandColor }}
        >
          <PartyPopper size={16} />
          <span>{saving ? "Saving..." : "Save follow-up & close"}</span>
        </button>
      </div>
    </motion.div>
  );
}
