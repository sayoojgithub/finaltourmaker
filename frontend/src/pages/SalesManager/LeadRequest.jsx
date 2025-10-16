// import React, { useMemo, useState, useEffect } from "react";
// import Select from "react-select";
// import API from "../../api";
// import { toast } from "react-toastify";

// export default function LeadRequest() {
//   // ---------- OPTIONS ----------
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);

//   // ---------- FORM FIELDS ----------
//   const [country, setCountry] = useState(null);
//   const [stateOpt, setStateOpt] = useState(null);
//   const [destination, setDestination] = useState(null);
//   const [tourName, setTourName] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [frequency, setFrequency] = useState(null);

//   // ---------- META ----------
//   const [prefillId, setPrefillId] = useState(null);
//   const [prefillActive, setPrefillActive] = useState(false);
//   const [changeSource, setChangeSource] = useState(null); // 'user' | 'prefill' | null
//   // Decision (approved/rejected/processing) info for prefills
//   const [decisionMeta, setDecisionMeta] = useState(null);

//   // ---------- TABLE / LIST ----------
//   const [rows, setRows] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loadingTable, setLoadingTable] = useState(false);

//   // ---------- FILTERS ----------
//   const [filterDestination, setFilterDestination] = useState(null);
//   const [filterFrequency, setFilterFrequency] = useState(null);
//   const [filterStartDate, setFilterStartDate] = useState("");
//   const [filterEndDate, setFilterEndDate] = useState("");

//   // ---------- LOADERS ----------
//   const [loadingCountries, setLoadingCountries] = useState(false);
//   const [loadingStates, setLoadingStates] = useState(false);
//   const [loadingDestinations, setLoadingDestinations] = useState(false);

//   const isLocked = prefillActive || !!prefillId;

//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 12,
//         borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         backgroundColor: "white",
//         opacity: 1,
//         cursor: state.isDisabled ? "not-allowed" : "default",
//         ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
//       }),
//       valueContainer: (base) => ({ ...base, padding: "0 12px" }),
//       input: (base) => ({ ...base, margin: 0, padding: 0, color: "#111827" }),
//       indicatorsContainer: (base) => ({ ...base, paddingRight: 8, opacity: 1 }),
//       indicatorSeparator: (base) => ({ ...base, backgroundColor: "#e5e7eb", opacity: 1 }),
//       dropdownIndicator: (base) => ({ ...base, color: "#6b7280", opacity: 1, ":hover": { color: "#4b5563" } }),
//       menu: (base) => ({ ...base, borderRadius: 12, overflow: "hidden" }),
//       option: (base, state) => ({
//         ...base,
//         backgroundColor: state.isFocused
//           ? "rgba(133,112,238,0.08)"
//           : state.isSelected
//           ? "rgba(133,112,238,0.16)"
//           : "white",
//         color: "#222",
//         ":active": { backgroundColor: "rgba(133,112,238,0.16)" },
//       }),
//       placeholder: (base) => ({ ...base, color: "#6b7280", opacity: 1 }),
//       singleValue: (base) => ({ ...base, color: "#111827", opacity: 1 }),
//     }),
//     []
//   );

//   const frequencyOptions = useMemo(
//     () => [
//       { value: "daily", label: "Daily" },
//       { value: "weekly", label: "Weekly" },
//       { value: "monthly", label: "Monthly" },
//     ],
//     []
//   );

//   // ---------- UTILS ----------
//   const pad = (n) => String(n).padStart(2, "0");
//   const formatDMY = (value) => {
//     if (!value) return "—";
//     const d = value instanceof Date ? value : new Date(value);
//     if (Number.isNaN(d.getTime())) {
//       if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
//         const [y, m, day] = value.split("-");
//         return `${pad(Number(day))}/${pad(Number(m))}/${y}`;
//       }
//       return "—";
//     }
//     return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
//   };

//   const userChange = () => {
//     setPrefillId(null);
//     setChangeSource("user");
//     setDecisionMeta(null);
//   };

//   // ---------- IMPERATIVE LOADERS ----------
//   const loadStatesFor = async (countryId, ensureOpt) => {
//     setLoadingStates(true);
//     try {
//       const res = await API.get(`/salesManager/states/${encodeURIComponent(countryId)}`);
//       let opts = (res.data || []).map((s) => ({ value: s._id, label: s.name }));
//       if (ensureOpt && !opts.find((o) => o.value === ensureOpt.value)) {
//         opts = [...opts, ensureOpt];
//       }
//       setStates(opts);
//       return opts;
//     } finally {
//       setLoadingStates(false);
//     }
//   };

//   const loadDestinationsFor = async (countryId, stateId, ensureOpt) => {
//     setLoadingDestinations(true);
//     try {
//       const url = `/salesManager/destinations/${encodeURIComponent(countryId)}/${encodeURIComponent(stateId)}`;
//       const res = await API.get(url);
//       let opts = (res.data || []).map((d) => ({ value: d._id, label: d.name }));
//       if (ensureOpt && !opts.find((o) => o.value === ensureOpt.value)) {
//         opts = [...opts, ensureOpt];
//       }
//       setDestinations(opts);
//       return opts;
//     } finally {
//       setLoadingDestinations(false);
//     }
//   };

//   // ---------- EFFECTS: LOAD COUNTRIES ----------
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoadingCountries(true);
//         const res = await API.get("/salesManager/countries");
//         const opts = (res.data || []).map((c) => ({ value: c._id, label: c.name }));
//         if (alive) setCountries(opts);
//       } catch {
//         toast.error("Failed to load countries");
//       } finally {
//         if (alive) setLoadingCountries(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // ---------- EFFECTS: COUNTRY -> STATES (user-triggered only) ----------
//   useEffect(() => {
//     if (!country) {
//       setStates([]);
//       setStateOpt(null);
//       setDestinations([]);
//       setDestination(null);
//       return;
//     }
//     if (changeSource !== "user") return;

//     let alive = true;
//     (async () => {
//       try {
//         setLoadingStates(true);
//         const res = await API.get(`/salesManager/states/${encodeURIComponent(country.value)}`);
//         if (!alive) return;
//         const opts = (res.data || []).map((s) => ({ value: s._id, label: s.name }));
//         setStates(opts);
//         setStateOpt(null);
//         setDestinations([]);
//         setDestination(null);
//       } catch {
//         if (alive) toast.error("Failed to load states");
//       } finally {
//         if (alive) setLoadingStates(false);
//       }
//     })();

//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [country, changeSource]);

//   // ---------- EFFECTS: STATE -> DESTINATIONS (user-triggered only) ----------
//   useEffect(() => {
//     if (!country || !stateOpt) {
//       setDestinations([]);
//       setDestination(null);
//       return;
//     }
//     if (changeSource !== "user") return;

//     let alive = true;
//     (async () => {
//       try {
//         setLoadingDestinations(true);
//         const url = `/salesManager/destinations/${encodeURIComponent(country.value)}/${encodeURIComponent(stateOpt.value)}`;
//         const res = await API.get(url);
//         if (!alive) return;
//         const opts = (res.data || []).map((d) => ({ value: d._id, label: d.name }));
//         setDestinations(opts);
//         setDestination(null);
//       } catch {
//         if (alive) toast.error("Failed to load destinations");
//       } finally {
//         if (alive) setLoadingDestinations(false);
//       }
//     })();

//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [stateOpt, country, changeSource]);

//   // ---------- SUBMIT ----------
//   const onSubmit = async (e) => {
//     e.preventDefault();
//     if (isLocked) return;

//     try {
//       if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
//         toast.error("End date cannot be earlier than start date");
//         return;
//       }

//       const payload = {
//         countryId: country?.value,
//         stateId: stateOpt?.value,
//         destinationId: destination?.value,
//         tourName,
//         startDate,
//         endDate,
//         quantity,
//         frequency: frequency?.value || null,
//       };

//       await API.post("/salesManager/lead-requests", payload);
//       toast.success("Lead request submitted successfully!");
//       clearPrefillAndForm();
//       setPage(1);
//       await fetchRequests(1, filterDestination, filterFrequency, filterStartDate, filterEndDate);
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message || "Something went wrong";
//       toast.error(message);
//     }
//   };

//   // ---------- CLEAR ----------
//   const clearPrefillAndForm = () => {
//     setPrefillId(null);
//     setPrefillActive(false);
//     setChangeSource(null);
//     setDecisionMeta(null);

//     setCountry(null);
//     setStateOpt(null);
//     setDestination(null);
//     setTourName("");
//     setStartDate("");
//     setEndDate("");
//     setQuantity(1);
//     setFrequency(null);
//     setFilterDestination(null);
//     setFilterFrequency(null);
//     setFilterStartDate("");
//     setFilterEndDate("");
//   };

//   const handleClearPrefillClick = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     clearPrefillAndForm();
//   };

//   // ---------- TABLE LOAD ----------
//   const fetchRequests = async (
//     nextPage = page,
//     fDestination = filterDestination,
//     fFrequency = filterFrequency,
//     fStart = filterStartDate,
//     fEnd = filterEndDate
//   ) => {
//     try {
//       setLoadingTable(true);
//       const params = new URLSearchParams();
//       params.set("page", String(nextPage));
//       params.set("limit", "7");
//       if (fDestination?.value) params.set("destinationId", fDestination.value);
//       if (fFrequency?.value) params.set("frequency", fFrequency.value);
//       if (fStart) params.set("startDate", fStart);
//       if (fEnd) params.set("endDate", fEnd);

//       const res = await API.get(`/salesManager/lead-requests?${params.toString()}`);
//       const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
//       setRows(docs);
//       setPage(p);
//       setTotalPages(totalPages);
//       setTotal(total);
//     } catch {
//       toast.error("Failed to load lead requests");
//     } finally {
//       setLoadingTable(false);
//     }
//   };

//   useEffect(() => {
//     fetchRequests(1, null, null, "", "");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     fetchRequests(1, filterDestination, filterFrequency, filterStartDate, filterEndDate);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterDestination, filterFrequency, filterStartDate, filterEndDate]);

//   const handlePrev = () => page > 1 && fetchRequests(page - 1);
//   const handleNext = () => page < totalPages && fetchRequests(page + 1);

//   // ---------- PREFILL ----------
//   const handlePrefill = async (id) => {
//     try {
//       if (prefillActive) return;
//       setPrefillActive(true);
//       setChangeSource("prefill");

//       const res = await API.get(`/salesManager/lead-requests/${id}`);
//       const r = res.data;
//       if (!r || !r._id) {
//         setPrefillActive(false);
//         setChangeSource(null);
//         toast.error("Could not load request details");
//         return;
//       }

//       // Country
//       const countryOptObj = { value: r.countryId, label: r.countryName };
//       setCountries((prev) =>
//         prev.find((c) => c.value === countryOptObj.value) ? prev : [...prev, countryOptObj]
//       );
//       setCountry(countryOptObj);

//       // States
//       const wantedState = { value: r.stateId, label: r.stateName };
//       const stateList = await loadStatesFor(r.countryId, wantedState);
//       const stateMatch = stateList.find((o) => o.value === wantedState.value) || wantedState;
//       setStateOpt(stateMatch);

//       // Destinations
//       const wantedDest = { value: r.destinationId, label: r.destinationName };
//       const destList = await loadDestinationsFor(r.countryId, r.stateId, wantedDest);
//       const destMatch = destList.find((o) => o.value === wantedDest.value) || wantedDest;
//       setDestination(destMatch);

//       // Primitive fields
//       setTourName(r.tourName || r.articleNumber || "");
//       setStartDate(r.startDate ? r.startDate.slice(0, 10) : "");
//       setEndDate(r.endDate ? r.endDate.slice(0, 10) : "");
//       setQuantity(r.quantity || 1);
//       const freqMatch = frequencyOptions.find((f) => f.value === r.frequency) || null;
//       setFrequency(freqMatch);

//       // Decision panel inputs (like AdRequest)
//       setDecisionMeta({
//         status: r.status, // 'approved' | 'rejected' | 'processing'
//         // requested (original)
//         requestedStartDate: r.startDate || null,
//         requestedEndDate: r.endDate || null,
//         requestedQuantity: r.quantity ?? null,
//         requestedFrequency: r.frequency || null,
//         // approved overrides
//         approvedStartDate: r.approvedStartDate || null,
//         approvedEndDate: r.approvedEndDate || null,
//         approvedQuantity: r.approvedQuantity ?? null,
//         approvedFrequency: r.approvedFrequency || null,
//         updationReason: r.updationReason || "", 
//         // rejection
//         rejectionReason: r.rejectionReason || "",
//       });

//       setPrefillId(r._id);
//       toast.success("Prefilled from selected lead request");
//     } catch {
//       toast.error("Failed to prefill—try again");
//     } finally {
//       setPrefillActive(false);
//       setChangeSource(null);
//     }
//   };

//   return (
//     <div className="space-y-10">
//       {/* ---------- CREATE FORM ---------- */}
//       <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
//         {/* Row 0: Country / State */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Field label="Country" required>
//             <Select
//               options={countries}
//               isLoading={loadingCountries}
//               value={country}
//               isDisabled={isLocked}
//               onChange={(v) => {
//                 userChange();
//                 setCountry(v);
//               }}
//               placeholder={loadingCountries ? "Loading countries..." : "Select country"}
//               styles={selectStyles}
//               classNamePrefix="leadreq-country"
//             />
//           </Field>

//           <Field label="State" required>
//             <Select
//               options={states}
//               isLoading={loadingStates}
//               isDisabled={isLocked || !country || loadingCountries}
//               value={stateOpt}
//               onChange={(v) => {
//                 userChange();
//                 setStateOpt(v);
//               }}
//               placeholder={
//                 !country
//                   ? "Select country first"
//                   : loadingStates
//                   ? "Loading states..."
//                   : "Select state"
//               }
//               styles={selectStyles}
//               classNamePrefix="leadreq-state"
//             />
//           </Field>
//         </div>

//         {/* Row 1: Destination / Tour Name */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Field label="Destination" required>
//             <Select
//               options={destinations}
//               isLoading={loadingDestinations}
//               isDisabled={isLocked || !country || !stateOpt || loadingStates || loadingCountries}
//               value={destination}
//               onChange={(v) => {
//                 userChange();
//                 setDestination(v);
//               }}
//               placeholder={
//                 !country
//                   ? "Select country first"
//                   : !stateOpt
//                   ? "Select state first"
//                   : loadingDestinations
//                   ? "Loading destinations..."
//                   : "Select destination"
//               }
//               styles={selectStyles}
//               classNamePrefix="leadreq-destination"
//             />
//           </Field>

//           <Field label="Tour Name / Article Number" required>
//             <input
//               type="text"
//               disabled={isLocked}
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
//               value={tourName}
//               onChange={(e) => {
//                 userChange();
//                 setTourName(e.target.value);
//               }}
//               placeholder="e.g., Phuket Bliss 4D3N / ART-1023"
//             />
//           </Field>
//         </div>

//         {/* Row 2: Dates */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Field label="Start Date" required>
//             <input
//               type="date"
//               disabled={isLocked}
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
//               value={startDate}
//               onChange={(e) => {
//                 userChange();
//                 setStartDate(e.target.value);
//               }}
//             />
//           </Field>

//           <Field label="End Date" required>
//             <input
//               type="date"
//               disabled={isLocked}
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
//               value={endDate}
//               onChange={(e) => {
//                 userChange();
//                 setEndDate(e.target.value);
//               }}
//             />
//           </Field>
//         </div>

//         {/* Row 3: Quantity / Frequency */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Field label="Quantity" required>
//             <input
//               type="number"
//               min={1}
//               inputMode="numeric"
//               disabled={isLocked}
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
//               value={quantity}
//               onChange={(e) => {
//                 userChange();
//                 const n = Number(e.target.value);
//                 setQuantity(Number.isFinite(n) && n >= 1 ? n : 1);
//               }}
//               placeholder="e.g., 25"
//             />
//           </Field>

//           <Field label="Frequency" required>
//             <Select
//               options={frequencyOptions}
//               value={frequency}
//               isDisabled={isLocked}
//               onChange={(v) => {
//                 userChange();
//                 setFrequency(v);
//               }}
//               placeholder="Select frequency"
//               styles={selectStyles}
//               classNamePrefix="leadreq-frequency"
//             />
//           </Field>
//         </div>

//         {/* Decision Panel (visible only when a row is prefilled) */}
//         {prefillId && decisionMeta && (
//           <DecisionPanel meta={decisionMeta} formatDMY={formatDMY} />
//         )}

//         {/* Submit / Clear Prefill */}
//         <div className="pt-2 flex items-center justify-center gap-3">
//           {isLocked ? (
//             prefillId && (
//               <button
//                 type="button"
//                 onClick={handleClearPrefillClick}
//                 className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
//               >
//                 Clear Prefill
//               </button>
//             )
//           ) : (
//             <button
//               type="submit"
//               className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
//             >
//               Send for approval
//             </button>
//           )}
//         </div>
//       </form>

//       {/* ---------- FILTERS + TABLE ---------- */}
//       <section className="space-y-4">
//         <h3 className="text-lg font-semibold text-[#222]">My Lead Requests</h3>

//         {/* Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Field label="Filter by Destination">
//             <Select
//               options={destinations}
//               isDisabled={destinations.length === 0}
//               value={filterDestination}
//               onChange={setFilterDestination}
//               isClearable
//               placeholder={
//                 destinations.length === 0
//                   ? "Select a country/state first"
//                   : "All destinations"
//               }
//               styles={selectStyles}
//               classNamePrefix="leadreq-filter-destination"
//             />
//           </Field>

//           <Field label="Filter by Frequency">
//             <Select
//               options={frequencyOptions}
//               value={filterFrequency}
//               onChange={setFilterFrequency}
//               isClearable
//               placeholder="All frequencies"
//               styles={selectStyles}
//               classNamePrefix="leadreq-filter-frequency"
//             />
//           </Field>

//           <Field label="Filter Start Date (from)">
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={filterStartDate}
//               onChange={(e) => setFilterStartDate(e.target.value)}
//             />
//           </Field>

//           <Field label="Filter End Date (to)">
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={filterEndDate}
//               onChange={(e) => setFilterEndDate(e.target.value)}
//             />
//           </Field>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto rounded-2xl border border-gray-200">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <Th>Destination</Th>
//                 <Th>Tour/Article</Th>
//                 <Th>Start Date</Th>
//                 <Th>End Date</Th>
//                 <Th>Quantity</Th>
//                 <Th>Frequency</Th>
//                 <Th>Status</Th>
//                 <Th>{/* actions */}</Th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 bg-white">
//               {loadingTable ? (
//                 <tr>
//                   <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>
//                     Loading…
//                   </td>
//                 </tr>
//               ) : rows.length === 0 ? (
//                 <tr>
//                   <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>
//                     No lead requests found.
//                   </td>
//                 </tr>
//               ) : (
//                 rows.map((r) => (
//                   <tr key={r._id} className="hover:bg-gray-50">
//                     <Td>{r.destinationName || "—"}</Td>
//                     <Td>{r.tourName || r.articleNumber || "—"}</Td>
//                     <Td>{formatDMY(r.startDate)}</Td>
//                     <Td>{formatDMY(r.endDate)}</Td>
//                     <Td>{r.quantity ?? "—"}</Td>
//                     <Td>{r.frequency ?? "—"}</Td>
//                     <Td>
//                       <span
//                         className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
//                           r.status === "approved"
//                             ? "bg-green-100 text-green-800"
//                             : r.status === "rejected"
//                             ? "bg-red-100 text-red-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         {r.status || "pending"}
//                       </span>
//                     </Td>
//                     <Td>
//                       <button
//                         type="button"
//                         onClick={() => handlePrefill(r._id)}
//                         title="See more / Prefill form"
//                         className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
//                       >
//                         +
//                       </button>
//                     </Td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="flex items-center justify-between">
//           <p className="text-sm text-gray-600">
//             Showing page <span className="font-semibold">{page}</span> of{" "}
//             <span className="font-semibold">{totalPages}</span> •{" "}
//             <span className="font-semibold">{total}</span> total
//           </p>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handlePrev}
//               disabled={page <= 1 || loadingTable}
//               className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <button
//               onClick={handleNext}
//               disabled={page >= totalPages || loadingTable}
//               className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// /* ---------- SMALL PRIMITIVE COMPONENTS ---------- */

// function Field({ label, required, children }) {
//   return (
//     <label className="block">
//       <span className="block text-sm font-medium text-[#222] mb-1">
//         {label} {required && <span className="text-red-500">*</span>}
//       </span>
//       {children}
//     </label>
//   );
// }

// function Th({ children }) {
//   return (
//     <th
//       scope="col"
//       className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
//     >
//       {children}
//     </th>
//   );
// }

// function Td({ children }) {
//   return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
// }

// /* ---------- DECISION PANEL (Approved / Rejected / Processing) ---------- */

// function DecisionPanel({ meta, formatDMY }) {
//   const status = meta?.status || "processing";

//   // Effective = approved override if present, else requested
//   const startISO =
//     meta?.approvedStartDate != null ? meta.approvedStartDate : meta?.requestedStartDate ?? null;
//   const endISO =
//     meta?.approvedEndDate != null ? meta.approvedEndDate : meta?.requestedEndDate ?? null;
//   const effectiveStart = startISO ? formatDMY(startISO) : "—";
//   const effectiveEnd = endISO ? formatDMY(endISO) : "—";

//   const effectiveQuantity =
//     meta?.approvedQuantity != null ? meta.approvedQuantity : meta?.requestedQuantity ?? "—";

//   const effectiveFrequency =
//     meta?.approvedFrequency != null ? meta.approvedFrequency : meta?.requestedFrequency ?? "—";

//   const badge =
//     status === "approved"
//       ? "bg-green-100 text-green-800"
//       : status === "rejected"
//       ? "bg-red-100 text-red-800"
//       : "bg-yellow-100 text-yellow-800";

//   const GreenInfo = ({ label, value, same }) => (
//     <div className="rounded-xl border border-green-200 bg-green-50 p-3">
//       <div className="text-xs font-medium text-green-700">{label}</div>
//       <div className="text-sm font-semibold text-green-900">{value}</div>
//       {same && <div className="text-[11px] text-green-600">(same as requested)</div>}
//     </div>
//   );

//   return (
//     <div className="rounded-2xl border border-gray-200 p-4">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
//             {status}
//           </span>
//           <span className="text-sm text-gray-600">
//             {status === "approved"
//               ? "Approved details"
//               : status === "rejected"
//               ? "Rejection details"
//               : "Awaiting review"}
//           </span>
//         </div>
//       </div>

//       {/* APPROVED */}
//       {/* {status === "approved" && (
//         <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
//           <GreenInfo
//             label="Approved Start Date"
//             value={effectiveStart}
//             same={meta?.approvedStartDate == null}
//           />
//           <GreenInfo
//             label="Approved End Date"
//             value={effectiveEnd}
//             same={meta?.approvedEndDate == null}
//           />
//           <GreenInfo
//             label="Approved Quantity"
//             value={effectiveQuantity}
//             same={meta?.approvedQuantity == null}
//           />
//           <GreenInfo
//             label="Approved Frequency"
//             value={String(effectiveFrequency).charAt(0).toUpperCase() + String(effectiveFrequency).slice(1)}
//             same={meta?.approvedFrequency == null}
//           />
//         </div>
//       )} */}
//       {status === "approved" && (
//   <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
//     <GreenInfo
//       label="Approved Start Date"
//       value={effectiveStart}
//       same={meta?.approvedStartDate == null}
//     />
//     <GreenInfo
//       label="Approved End Date"
//       value={effectiveEnd}
//       same={meta?.approvedEndDate == null}
//     />
//     <GreenInfo
//       label="Approved Quantity"
//       value={effectiveQuantity}
//       same={meta?.approvedQuantity == null}
//     />
//     <GreenInfo
//       label="Approved Frequency"
//       value={String(effectiveFrequency).charAt(0).toUpperCase() + String(effectiveFrequency).slice(1)}
//       same={meta?.approvedFrequency == null}
//     />

//     {/* NEW: Updation Reason (full width on md) */}
//     {meta?.updationReason && (
//       <div className="md:col-span-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
//         <div className="text-xs font-medium text-indigo-700">Updation Reason</div>
//         <div className="text-sm font-semibold text-indigo-900">{meta.updationReason}</div>
//       </div>
//     )}
//   </div>
// )}


//       {/* REJECTED */}
//       {status === "rejected" && (
//         <div className="mt-3">
//           <div className="text-sm text-gray-500">Rejection Reason</div>
//           <div className="mt-1 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
//             {meta?.rejectionReason || "No reason provided"}
//           </div>
//         </div>
//       )}

//       {/* PROCESSING */}
//       {status === "processing" && (
//         <div className="mt-3 text-sm text-gray-600">
//           Your request is under review. Requested Start:{" "}
//           <span className="font-medium text-gray-900">{effectiveStart}</span> • End:{" "}
//           <span className="font-medium text-gray-900">{effectiveEnd}</span> • Qty:{" "}
//           <span className="font-medium text-gray-900">{effectiveQuantity}</span> • Freq:{" "}
//           <span className="font-medium text-gray-900">
//             {String(effectiveFrequency).charAt(0).toUpperCase() + String(effectiveFrequency).slice(1)}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }
// src/pages/marketing/LeadRequest.jsx
// src/pages/marketing/LeadRequest.jsx
import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function LeadRequest() {
  // ---------- OPTIONS ----------
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // ---------- FORM FIELDS ----------
  const [country, setCountry] = useState(null);
  const [stateOpt, setStateOpt] = useState(null);
  const [destination, setDestination] = useState(null);

  // Tour: dropdown (Group + Fixed)
  const [tourOptions, setTourOptions] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null); // { value: "group:<id>" | "fixed:<id>" }
  const [loadingTours, setLoadingTours] = useState(false);

  // keep a legacy text value (server uses as fallback tourRef)
  const [tourName, setTourName] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState(null);

  // ---------- META ----------
  const [prefillId, setPrefillId] = useState(null);
  const [prefillActive, setPrefillActive] = useState(false);
  const [changeSource, setChangeSource] = useState(null); // 'user' | 'prefill' | null
  const [decisionMeta, setDecisionMeta] = useState(null);

  // ---------- TABLE / LIST ----------
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingTable, setLoadingTable] = useState(false);

  // ---------- FILTERS ----------
  const [filterDestination, setFilterDestination] = useState(null);
  const [filterFrequency, setFilterFrequency] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // ---------- LOADERS ----------
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  const isLocked = prefillActive || !!prefillId;

  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        backgroundColor: "white",
        opacity: 1,
        cursor: state.isDisabled ? "not-allowed" : "default",
        ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
      }),
      valueContainer: (base) => ({ ...base, padding: "0 12px" }),
      input: (base) => ({ ...base, margin: 0, padding: 0, color: "#111827" }),
      indicatorsContainer: (base) => ({ ...base, paddingRight: 8, opacity: 1 }),
      indicatorSeparator: (base) => ({ ...base, backgroundColor: "#e5e7eb", opacity: 1 }),
      dropdownIndicator: (base) => ({ ...base, color: "#6b7280", opacity: 1, ":hover": { color: "#4b5563" } }),
      menu: (base) => ({ ...base, borderRadius: 12, overflow: "hidden" }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
          ? "rgba(133,112,238,0.08)"
          : state.isSelected
          ? "rgba(133,112,238,0.16)"
          : "white",
        color: "#222",
        ":active": { backgroundColor: "rgba(133,112,238,0.16)" },
      }),
      placeholder: (base) => ({ ...base, color: "#6b7280", opacity: 1 }),
      singleValue: (base) => ({ ...base, color: "#111827", opacity: 1 }),
    }),
    []
  );

  const frequencyOptions = useMemo(
    () => [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ],
    []
  );

  const pad = (n) => String(n).padStart(2, "0");
  const formatDMY = (value) => {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, day] = value.split("-");
        return `${pad(Number(day))}/${pad(Number(m))}/${y}`;
      }
      return "—";
    }
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const userChange = () => {
    setPrefillId(null);
    setChangeSource("user");
    setDecisionMeta(null);
  };

  // ----------- API LOADERS -----------
  const loadStatesFor = async (countryId, ensureOpt) => {
    setLoadingStates(true);
    try {
      const res = await API.get(`/salesManager/states/${encodeURIComponent(countryId)}`);
      let opts = (res.data || []).map((s) => ({ value: s._id, label: s.name }));
      if (ensureOpt && !opts.find((o) => o.value === ensureOpt.value)) opts = [...opts, ensureOpt];
      setStates(opts);
      return opts;
    } finally {
      setLoadingStates(false);
    }
  };

  const loadDestinationsFor = async (countryId, stateId, ensureOpt) => {
    setLoadingDestinations(true);
    try {
      const url = `/salesManager/destinations/${encodeURIComponent(countryId)}/${encodeURIComponent(stateId)}`;
      const res = await API.get(url);
      let opts = (res.data || []).map((d) => ({ value: d._id, label: d.name }));
      if (ensureOpt && !opts.find((o) => o.value === ensureOpt.value)) opts = [...opts, ensureOpt];
      setDestinations(opts);
      return opts;
    } finally {
      setLoadingDestinations(false);
    }
  };

  const loadToursForDestination = async (destinationId, search = "") => {
    if (!destinationId) {
      setTourOptions([]);
      return [];
    }
    setLoadingTours(true);
    try {
      const params = new URLSearchParams();
      params.set("destinationId", destinationId);
      if (search) params.set("q", search);
      const res = await API.get(`/salesManager/lead-requests/tours?${params.toString()}`);
      const opts = Array.isArray(res.data) ? res.data : [];
      setTourOptions(opts);
      return opts;
    } catch (e) {
      toast.error("Failed to load tours");
      setTourOptions([]);
      return [];
    } finally {
      setLoadingTours(false);
    }
  };

  // ---------- INITIAL LOAD: COUNTRIES ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCountries(true);
        const res = await API.get("/salesManager/countries");
        const opts = (res.data || []).map((c) => ({ value: c._id, label: c.name }));
        if (alive) setCountries(opts);
      } catch {
        toast.error("Failed to load countries");
      } finally {
        if (alive) setLoadingCountries(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ---------- COUNTRY -> STATES (user-triggered only) ----------
  useEffect(() => {
    if (!country) {
      setStates([]); setStateOpt(null);
      setDestinations([]); setDestination(null);
      setTourOptions([]); setSelectedTour(null); setTourName("");
      return;
    }
    if (changeSource !== "user") return;

    let alive = true;
    (async () => {
      try {
        setLoadingStates(true);
        const res = await API.get(`/salesManager/states/${encodeURIComponent(country.value)}`);
        if (!alive) return;
        const opts = (res.data || []).map((s) => ({ value: s._id, label: s.name }));
        setStates(opts);
        setStateOpt(null);
        setDestinations([]); setDestination(null);
        setTourOptions([]); setSelectedTour(null); setTourName("");
      } catch {
        if (alive) toast.error("Failed to load states");
      } finally {
        if (alive) setLoadingStates(false);
      }
    })();

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, changeSource]);

  // ---------- STATE -> DESTINATIONS (user-triggered only) ----------
  useEffect(() => {
    if (!country || !stateOpt) {
      setDestinations([]); setDestination(null);
      setTourOptions([]); setSelectedTour(null); setTourName("");
      return;
    }
    if (changeSource !== "user") return;

    let alive = true;
    (async () => {
      try {
        setLoadingDestinations(true);
        const url = `/salesManager/destinations/${encodeURIComponent(country.value)}/${encodeURIComponent(stateOpt.value)}`;
        const res = await API.get(url);
        if (!alive) return;
        const opts = (res.data || []).map((d) => ({ value: d._id, label: d.name }));
        setDestinations(opts);
        setDestination(null);
        setTourOptions([]); setSelectedTour(null); setTourName("");
      } catch {
        if (alive) toast.error("Failed to load destinations");
      } finally {
        if (alive) setLoadingDestinations(false);
      }
    })();

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateOpt, country, changeSource]);

  // ---------- DESTINATION -> TOURS (user-triggered only) ----------
  useEffect(() => {
    if (changeSource !== "user") return;
    if (destination?.value) {
      loadToursForDestination(destination.value);
      setSelectedTour(null);
      setTourName("");
    } else {
      setTourOptions([]); setSelectedTour(null); setTourName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, changeSource]);

  // ---------- SUBMIT ----------
  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    try {
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        toast.error("End date cannot be earlier than start date");
        return;
      }

      const payload = {
        countryId: country?.value,
        stateId: stateOpt?.value,
        destinationId: destination?.value,
        tourName,                                // name-only fallback
        selectedTour: selectedTour?.value || null, // "group:<id>" | "fixed:<id>"
        startDate,
        endDate,
        quantity,
        frequency: frequency?.value || null,
      };

      await API.post("/salesManager/lead-requests", payload);
      toast.success("Lead request submitted successfully!");
      clearPrefillAndForm();
      setPage(1);
      await fetchRequests(1, filterDestination, filterFrequency, filterStartDate, filterEndDate);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
    }
  };

  // ---------- CLEAR ----------
  const clearPrefillAndForm = () => {
    setPrefillId(null);
    setPrefillActive(false);
    setChangeSource(null);
    setDecisionMeta(null);

    setCountry(null);
    setStateOpt(null);
    setDestination(null);

    setTourOptions([]);
    setSelectedTour(null);
    setTourName("");

    setStartDate("");
    setEndDate("");
    setQuantity(1);
    setFrequency(null);

    setFilterDestination(null);
    setFilterFrequency(null);
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const handleClearPrefillClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearPrefillAndForm();
  };

  // ---------- TABLE LOAD ----------
  const fetchRequests = async (
    nextPage = page,
    fDestination = filterDestination,
    fFrequency = filterFrequency,
    fStart = filterStartDate,
    fEnd = filterEndDate
  ) => {
    try {
      setLoadingTable(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");
      if (fDestination?.value) params.set("destinationId", fDestination.value);
      if (fFrequency?.value) params.set("frequency", fFrequency.value);
      if (fStart) params.set("startDate", fStart);
      if (fEnd) params.set("endDate", fEnd);

      const res = await API.get(`/salesManager/lead-requests?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch {
      toast.error("Failed to load lead requests");
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchRequests(1, null, null, "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRequests(1, filterDestination, filterFrequency, filterStartDate, filterEndDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDestination, filterFrequency, filterStartDate, filterEndDate]);

  const handlePrev = () => page > 1 && fetchRequests(page - 1);
  const handleNext = () => page < totalPages && fetchRequests(page + 1);

  // ---------- PREFILL ----------
  const handlePrefill = async (id) => {
    try {
      if (prefillActive) return;
      setPrefillActive(true);
      setChangeSource("prefill");

      const res = await API.get(`/salesManager/lead-requests/${id}`);
      const r = res.data;
      if (!r || !r._id) {
        setPrefillActive(false);
        setChangeSource(null);
        toast.error("Could not load request details");
        return;
      }

      // Country
      const countryOptObj = { value: r.countryId, label: r.countryName };
      setCountries((prev) =>
        prev.find((c) => c.value === countryOptObj.value) ? prev : [...prev, countryOptObj]
      );
      setCountry(countryOptObj);

      // States
      const wantedState = { value: r.stateId, label: r.stateName };
      const stateList = await loadStatesFor(r.countryId, wantedState);
      const stateMatch = stateList.find((o) => o.value === wantedState.value) || wantedState;
      setStateOpt(stateMatch);

      // Destinations
      const wantedDest = { value: r.destinationId, label: r.destinationName };
      const destList = await loadDestinationsFor(r.countryId, r.stateId, wantedDest);
      const destMatch = destList.find((o) => o.value === wantedDest.value) || wantedDest;
      setDestination(destMatch);

      // Load tours for that destination
      const opts = await loadToursForDestination(r.destinationId);

      // Prefill the specific tour option by composite value, otherwise inject synthetic
      let prefillTourOption = null;
      if (r.selectedTourValue) {
        prefillTourOption = opts.find(o => o.value === r.selectedTourValue) || null;
      }
      if (!prefillTourOption && (r.tourName || r.tourRef)) {
        prefillTourOption = {
          value: r.selectedTourValue || null,
          label: r.tourName || r.tourRef,      // name only
          meta: { title: r.tourName || r.tourRef },
          __synthetic: true,
        };
        setTourOptions(prev => {
          const exists = prefillTourOption.value && prev.some(p => p.value === prefillTourOption.value);
          return exists ? prev : [prefillTourOption, ...prev];
        });
      }
      setSelectedTour(prefillTourOption);
      setTourName(r.tourName || r.tourRef || ""); // keep legacy text

      // Primitive fields
      setStartDate(r.startDate ? r.startDate.slice(0, 10) : "");
      setEndDate(r.endDate ? r.endDate.slice(0, 10) : "");
      setQuantity(r.quantity || 1);
      const freqMatch = frequencyOptions.find((f) => f.value === r.frequency) || null;
      setFrequency(freqMatch);

      // Decision panel
      setDecisionMeta({
        status: r.status,
        requestedStartDate: r.startDate || null,
        requestedEndDate: r.endDate || null,
        requestedQuantity: r.quantity ?? null,
        requestedFrequency: r.frequency || null,
        approvedStartDate: r.approvedStartDate || null,
        approvedEndDate: r.approvedEndDate || null,
        approvedQuantity: r.approvedQuantity ?? null,
        approvedFrequency: r.approvedFrequency || null,
        updationReason: r.updationReason || "",
        rejectionReason: r.rejectionReason || "",
      });

      setPrefillId(r._id);
      toast.success("Prefilled from selected lead request");
    } catch {
      toast.error("Failed to prefill—try again");
    } finally {
      setPrefillActive(false);
      setChangeSource(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* ---------- CREATE FORM ---------- */}
      <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
        {/* Row 0: Country / State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Country" required>
            <Select
              options={countries}
              isLoading={loadingCountries}
              value={country}
              isDisabled={isLocked}
              onChange={(v) => { userChange(); setCountry(v); }}
              placeholder={loadingCountries ? "Loading countries..." : "Select country"}
              styles={selectStyles}
              classNamePrefix="leadreq-country"
            />
          </Field>

          <Field label="State" required>
            <Select
              options={states}
              isLoading={loadingStates}
              isDisabled={isLocked || !country || loadingCountries}
              value={stateOpt}
              onChange={(v) => { userChange(); setStateOpt(v); }}
              placeholder={
                !country ? "Select country first" :
                loadingStates ? "Loading states..." : "Select state"
              }
              styles={selectStyles}
              classNamePrefix="leadreq-state"
            />
          </Field>
        </div>

        {/* Row 1: Destination / Tour */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Destination" required>
            <Select
              options={destinations}
              isLoading={loadingDestinations}
              isDisabled={isLocked || !country || !stateOpt || loadingStates || loadingCountries}
              value={destination}
              onChange={(v) => { userChange(); setDestination(v); }}
              placeholder={
                !country ? "Select country first" :
                !stateOpt ? "Select state first" :
                loadingDestinations ? "Loading destinations..." : "Select destination"
              }
              styles={selectStyles}
              classNamePrefix="leadreq-destination"
            />
          </Field>

          <Field label="Tour (Group or Fixed)" required>
            <Select
              options={tourOptions}
              isLoading={loadingTours}
              isDisabled={isLocked || !destination}
              value={selectedTour}
              onChange={(opt) => {
                userChange();
                setSelectedTour(opt || null);
                const friendly = opt?.meta?.title || opt?.label || ""; // name only
                setTourName(friendly);
              }}
              onInputChange={(val, meta) => {
                if (meta.action === "input-change" && destination?.value) {
                  loadToursForDestination(destination.value, val);
                }
              }}
              placeholder={
                !destination ? "Select destination first" :
                loadingTours ? "Loading tours..." : "Select a tour"
              }
              // show only the tour name in dropdown rows
              getOptionLabel={(o) => o?.meta?.title || o?.label || ""}
              getOptionValue={(o) => o?.value ?? ""}
              styles={selectStyles}
              classNamePrefix="leadreq-tour"
            />
          </Field>
        </div>

        {/* Row 2: Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Start Date" required>
            <input
              type="date"
              disabled={isLocked}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
              value={startDate}
              onChange={(e) => { userChange(); setStartDate(e.target.value); }}
            />
          </Field>

          <Field label="End Date" required>
            <input
              type="date"
              disabled={isLocked}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
              value={endDate}
              onChange={(e) => { userChange(); setEndDate(e.target.value); }}
            />
          </Field>
        </div>

        {/* Row 3: Quantity / Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Quantity" required>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              disabled={isLocked}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
              value={quantity}
              onChange={(e) => {
                userChange();
                const n = Number(e.target.value);
                setQuantity(Number.isFinite(n) && n >= 1 ? n : 1);
              }}
              placeholder="e.g., 25"
            />
          </Field>

          <Field label="Frequency" required>
            <Select
              options={frequencyOptions}
              value={frequency}
              isDisabled={isLocked}
              onChange={(v) => { userChange(); setFrequency(v); }}
              placeholder="Select frequency"
              styles={selectStyles}
              classNamePrefix="leadreq-frequency"
            />
          </Field>
        </div>

        {/* Decision Panel (prefill only) */}
        {prefillId && decisionMeta && <DecisionPanel meta={decisionMeta} formatDMY={formatDMY} />}

        {/* Submit / Clear Prefill */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {isLocked ? (
            prefillId && (
              <button
                type="button"
                onClick={handleClearPrefillClick}
                className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] w-full"
              >
                Clear Prefill
              </button>
            )
          ) : (
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] w-full"
            >
              Send for approval
            </button>
          )}
        </div>
      </form>

      {/* ---------- FILTERS + TABLE ---------- */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[#222]">My Lead Requests</h3>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Filter by Destination">
            <Select
              options={destinations}
              isDisabled={destinations.length === 0}
              value={filterDestination}
              onChange={setFilterDestination}
              isClearable
              placeholder={destinations.length === 0 ? "Select a country/state first" : "All destinations"}
              styles={selectStyles}
              classNamePrefix="leadreq-filter-destination"
            />
          </Field>

          <Field label="Filter by Frequency">
            <Select
              options={frequencyOptions}
              value={filterFrequency}
              onChange={setFilterFrequency}
              isClearable
              placeholder="All frequencies"
              styles={selectStyles}
              classNamePrefix="leadreq-filter-frequency"
            />
          </Field>

          <Field label="Filter Start Date (from)">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </Field>

          <Field label="Filter End Date (to)">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </Field>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Destination</Th>
                <Th>Tour</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Quantity</Th>
                <Th>Frequency</Th>
                <Th>Status</Th>
                <Th>{/* actions */}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadingTable ? (
                <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>No lead requests found.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <Td>{r.destinationName || "—"}</Td>
                    <Td>{r.tourName || "—"}</Td> {/* NAME only */}
                    <Td>{formatDMY(r.startDate)}</Td>
                    <Td>{formatDMY(r.endDate)}</Td>
                    <Td>{r.quantity ?? "—"}</Td>
                    <Td>{r.frequency ?? "—"}</Td>
                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          r.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : r.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {r.status || "pending"}
                      </span>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => handlePrefill(r._id)}
                        title="See more / Prefill form"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
                      >
                        +
                      </button>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span> •{" "}
            <span className="font-semibold">{total}</span> total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={page <= 1 || loadingTable}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page >= totalPages || loadingTable}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- SMALL PRIMITIVES ---------- */
function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#222] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
function Th({ children }) {
  return (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
      {children}
    </th>
  );
}
function Td({ children }) {
  return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
}

/* ---------- DECISION PANEL ---------- */
function DecisionPanel({ meta, formatDMY }) {
  const status = meta?.status || "processing";
  const startISO =
    meta?.approvedStartDate != null ? meta.approvedStartDate : meta?.requestedStartDate ?? null;
  const endISO =
    meta?.approvedEndDate != null ? meta.approvedEndDate : meta?.requestedEndDate ?? null;
  const effectiveStart = startISO ? formatDMY(startISO) : "—";
  const effectiveEnd = endISO ? formatDMY(endISO) : "—";
  const effectiveQuantity =
    meta?.approvedQuantity != null ? meta.approvedQuantity : meta?.requestedQuantity ?? "—";
  const effectiveFrequency =
    meta?.approvedFrequency != null ? meta.approvedFrequency : meta?.requestedFrequency ?? "—";
  const badge =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  const GreenInfo = ({ label, value, same }) => (
    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
      <div className="text-xs font-medium text-green-700">{label}</div>
      <div className="text-sm font-semibold text-green-900">{value}</div>
      {same && <div className="text-[11px] text-green-600">(same as requested)</div>}
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
            {status}
          </span>
          <span className="text-sm text-gray-600">
            {status === "approved"
              ? "Approved details"
              : status === "rejected"
              ? "Rejection details"
              : "Awaiting review"}
          </span>
        </div>
      </div>

      {status === "approved" && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <GreenInfo label="Approved Start Date" value={effectiveStart} same={meta?.approvedStartDate == null} />
          <GreenInfo label="Approved End Date" value={effectiveEnd} same={meta?.approvedEndDate == null} />
          <GreenInfo label="Approved Quantity" value={effectiveQuantity} same={meta?.approvedQuantity == null} />
          <GreenInfo
            label="Approved Frequency"
            value={String(effectiveFrequency).charAt(0).toUpperCase() + String(effectiveFrequency).slice(1)}
            same={meta?.approvedFrequency == null}
          />
          {meta?.updationReason && (
            <div className="md:col-span-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <div className="text-xs font-medium text-indigo-700">Updation Reason</div>
              <div className="text-sm font-semibold text-indigo-900">{meta.updationReason}</div>
            </div>
          )}
        </div>
      )}

      {status === "rejected" && (
        <div className="mt-3">
          <div className="text-sm text-gray-500">Rejection Reason</div>
          <div className="mt-1 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
            {meta?.rejectionReason || "No reason provided"}
          </div>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-3 text-sm text-gray-600">
          Your request is under review. Requested Start:{" "}
          <span className="font-medium text-gray-900">{effectiveStart}</span> • End:{" "}
          <span className="font-medium text-gray-900">{effectiveEnd}</span> • Qty:{" "}
          <span className="font-medium text-gray-900">{effectiveQuantity}</span> • Freq:{" "}
          <span className="font-medium text-gray-900">
            {String(effectiveFrequency).charAt(0).toUpperCase() + String(effectiveFrequency).slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}

