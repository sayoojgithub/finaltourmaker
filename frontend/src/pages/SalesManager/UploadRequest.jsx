// // src/components/UploadRequest/UploadRequest.jsx
// import React, { useMemo, useState, useEffect } from "react";
// import Select from "react-select";
// import API from "../../api";
// import { toast } from "react-toastify";

// export default function UploadRequest() {
//   // ---------- OPTIONS ----------
//   const categoryOptions = useMemo(
//     () => [
//       { value: "Branch Video", label: "Branch Video" },
//       { value: "Franchisee Video", label: "Franchisee Video" },
//       { value: "Office Video", label: "Office Video" },
//       { value: "Staff performance", label: "Staff performance" },
//     ],
//     []
//   );

//   // ---------- FORM FIELDS ----------
//   const [category, setCategory] = useState(null);
//   const [filename, setFilename] = useState("");
//   const [publishingDate, setPublishingDate] = useState(""); // YYYY-MM-DD

//   // ---------- PREFILL META ----------
//   const [prefillId, setPrefillId] = useState(null);
//   const [prefillActive, setPrefillActive] = useState(false);
//   const [prefillMeta, setPrefillMeta] = useState(null); // status / approved / rejection etc.
//   const isLocked = prefillActive || !!prefillId;

//   // ---------- FILTERS ----------
//   const [filterCategory, setFilterCategory] = useState(null);
//   const [filterFilename, setFilterFilename] = useState("");
//   const [filterRequestedDate, setFilterRequestedDate] = useState("");
//   const [filterPublishingDate, setFilterPublishingDate] = useState("");

//   // ---------- TABLE / LIST ----------
//   const [rows, setRows] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loadingTable, setLoadingTable] = useState(false);

//   // ---------- LOADERS ----------
//   const [submitting, setSubmitting] = useState(false);

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
//         ":hover": { borderColor: state.isFocused ? "#8570EE" : " #d1d5db" },
//       }),
//       valueContainer: (base) => ({ ...base, padding: "0 12px" }),
//       input: (base) => ({ ...base, margin: 0, padding: 0, color: "#111827" }),
//       indicatorsContainer: (base) => ({ ...base, paddingRight: 8, opacity: 1 }),
//       indicatorSeparator: (base) => ({ ...base, backgroundColor: "#e5e7eb", opacity: 1 }),
//       dropdownIndicator: (base) => ({
//         ...base,
//         color: "#6b7280",
//         opacity: 1,
//         ":hover": { color: "#4b5563" },
//       }),
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

//   // ---------- HELPERS ----------
//   const formatToDMY = (value) => {
//     if (!value) return "—";
//     if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
//       const [y, m, d] = value.split("-");
//       return `${d}/${m}/${y}`;
//     }
//     const d = new Date(value);
//     if (Number.isNaN(d.getTime())) return "—";
//     const dd = String(d.getDate()).padStart(2, "0");
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     const yy = d.getFullYear();
//     return `${dd}/${mm}/${yy}`;
//   };

//   const clearPrefillAndForm = () => {
//     setPrefillId(null);
//     setPrefillActive(false);

//     setCategory(null);
//     setFilename("");
//     setPublishingDate("");

//     setPrefillMeta(null); // reset decision panel meta
//   };

//   const handleClearPrefillClick = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     clearPrefillAndForm();
//   };

//   // ---------- SUBMIT ----------
//   const onSubmit = async (e) => {
//     e.preventDefault();
//     if (!category || !filename.trim()) {
//       toast.error("Category and filename are required");
//       return;
//     }
//     if (isLocked) return; // never submit while prefilled

//     try {
//       setSubmitting(true);
//       await API.post("/salesManager/upload-requests", {
//         category: category.value,
//         filename: filename.trim(),
//         publishingDate: publishingDate || null, // "YYYY-MM-DD" or null
//       });
//       toast.success("Upload request submitted!");
//       clearPrefillAndForm();
//       // refresh first page with current filters (if any)
//       fetchRequests(
//         1,
//         filterCategory,
//         filterFilename,
//         filterRequestedDate,
//         filterPublishingDate
//       );
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || "Something went wrong";
//       toast.error(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- PREFILL ----------
//   const handlePrefill = async (id) => {
//     try {
//       if (prefillActive) return;
//       setPrefillActive(true);

//       const res = await API.get(`/salesManager/upload-requests/${id}`);
//       const r = res.data;
//       if (!r || !r._id) {
//         setPrefillActive(false);
//         toast.error("Could not load request details");
//         return;
//       }

//       // category: ensure selectable (even if server holds a value not in current options)
//       const found = categoryOptions.find((c) => c.value === r.category);
//       setCategory(found || { value: r.category, label: r.category });

//       setFilename(r.filename || "");
//       setPublishingDate(r.publishingDate ? String(r.publishingDate).slice(0, 10) : "");

//       setPrefillId(r._id);

//       // collect decision meta for the panel (handles both enriched & raw doc)
//       setPrefillMeta({
//         status: r.status || "processing",
//         requestedPublishingDate: r.publishingDate || null,
//         approvedPublishingDate: r.approvedPublishingDate || null,
//         rejectionReason: r.rejectionReason || "",
//         assignedDigitalMarketerName: r.assignedDigitalMarketerName || "",
//         requestedDate: r.requestedDate,
//         requestedTime: r.requestedTime,
//       });

//       toast.success("Prefilled from selected request. Form is locked.");
//     } catch {
//       toast.error("Failed to prefill—try again");
//     } finally {
//       setPrefillActive(false);
//     }
//   };

//   // ---------- TABLE LOAD ----------
//   const fetchRequests = async (
//     nextPage = 1,
//     fCategory = filterCategory,
//     fFilename = filterFilename,
//     fRequestedDate = filterRequestedDate,
//     fPublishingDate = filterPublishingDate
//   ) => {
//     try {
//       setLoadingTable(true);
//       const params = new URLSearchParams();
//       params.set("page", String(nextPage));
//       params.set("limit", "7");
//       if (fCategory?.value) params.set("category", fCategory.value);
//       if (fFilename) params.set("filename", fFilename);
//       if (fRequestedDate) params.set("requestedDate", fRequestedDate); // YYYY-MM-DD
//       if (fPublishingDate) params.set("publishingDate", fPublishingDate); // YYYY-MM-DD

//       const res = await API.get(`/salesManager/upload-requests?${params.toString()}`);
//       const { docs = [], page: p = 1, totalPages: tp = 1, total: t = 0 } = res.data || {};
//       setRows(docs);
//       setPage(p);
//       setTotalPages(tp);
//       setTotal(t);
//     } catch (err) {
//       toast.error("Failed to load upload requests");
//     } finally {
//       setLoadingTable(false);
//     }
//   };

//   useEffect(() => {
//     // initial load
//     fetchRequests(1, null, "", "", "");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // refetch when filters change (reset to page 1)
//   useEffect(() => {
//     fetchRequests(1, filterCategory, filterFilename, filterRequestedDate, filterPublishingDate);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterCategory, filterFilename, filterRequestedDate, filterPublishingDate]);

//   const handlePrev = () =>
//     page > 1 &&
//     fetchRequests(page - 1, filterCategory, filterFilename, filterRequestedDate, filterPublishingDate);
//   const handleNext = () =>
//     page < totalPages &&
//     fetchRequests(page + 1, filterCategory, filterFilename, filterRequestedDate, filterPublishingDate);

//   return (
//     <div className="space-y-10">
//       {/* ---------- CREATE FORM ---------- */}
//       <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Field label="Category" required>
//             <Select
//               options={categoryOptions}
//               value={category}
//               onChange={(v) => setCategory(v)}
//               placeholder="Select category"
//               styles={selectStyles}
//               classNamePrefix="uploadreq-category"
//               isDisabled={isLocked}
//             />
//           </Field>

//           <Field label="File name" required>
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
//               value={filename}
//               onChange={(e) => setFilename(e.target.value)}
//               placeholder="e.g., branch-jan-2025.mp4"
//               disabled={isLocked}
//             />
//           </Field>

//           {/* Publishing Date (optional) */}
//           <Field label="Publishing Date">
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
//               value={publishingDate}
//               onChange={(e) => setPublishingDate(e.target.value)}
//               disabled={isLocked}
//             />
//           </Field>
//         </div>

//         {/* ---------- DECISION PANEL (shows when prefilled/locked) ---------- */}
//         {prefillId && prefillMeta && (
//           <DecisionPanel
//             meta={prefillMeta}
//             formatDMY={(v) => formatToDMY(typeof v === "string" ? v.slice(0, 10) : v)}
//           />
//         )}

//         <div className="pt-2 flex items-center justify-center gap-3">
//           {isLocked ? (
//             <button
//               type="button"
//               onClick={handleClearPrefillClick}
//               className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
//             >
//               Clear Prefill
//             </button>
//           ) : (
//             <button
//               type="submit"
//               disabled={submitting}
//               className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60"
//             >
//               {submitting ? "Submitting…" : "Send for approval"}
//             </button>
//           )}
//         </div>
//       </form>

//       {/* ---------- FILTERS + TABLE ---------- */}
//       <section className="space-y-4">
//         <h3 className="text-lg font-semibold text-[#222]">My Upload Requests</h3>

//         {/* Filters: 4 columns (includes Publishing Date) */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Field label="Filter by Category">
//             <Select
//               options={categoryOptions}
//               value={filterCategory}
//               onChange={setFilterCategory}
//               isClearable
//               placeholder="All categories"
//               styles={selectStyles}
//               classNamePrefix="uploadreq-filter-category"
//             />
//           </Field>

//           <Field label="Filter by File name">
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={filterFilename}
//               onChange={(e) => setFilterFilename(e.target.value)}
//               placeholder="Search filename (contains)"
//             />
//           </Field>

//           <Field label="Filter by Requested Date">
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={filterRequestedDate}
//               onChange={(e) => setFilterRequestedDate(e.target.value)}
//               placeholder="YYYY-MM-DD"
//             />
//           </Field>

//           <Field label="Filter by Publishing Date">
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={filterPublishingDate}
//               onChange={(e) => setFilterPublishingDate(e.target.value)}
//               placeholder="YYYY-MM-DD"
//             />
//           </Field>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto rounded-2xl border border-gray-200">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <Th>Category</Th>
//                 <Th>File Name</Th>
//                 <Th>Publishing Date</Th>
//                 <Th>Requested Date</Th>
//                 <Th>Requested Time</Th>
//                 <Th>Status</Th>
//                 <Th>{/* actions */}</Th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 bg-white">
//               {loadingTable ? (
//                 <tr>
//                   <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
//                     Loading…
//                   </td>
//                 </tr>
//               ) : rows.length === 0 ? (
//                 <tr>
//                   <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
//                     No upload requests found.
//                   </td>
//                 </tr>
//               ) : (
//                 rows.map((r) => (
//                   <tr key={r._id} className="hover:bg-gray-50">
//                     <Td>{r.category || "—"}</Td>
//                     <Td>{r.filename || "—"}</Td>
//                     <Td>
//                       {formatToDMY(
//                         r.publishingDate ? String(r.publishingDate).slice(0, 10) : ""
//                       )}
//                     </Td>
//                     <Td>{formatToDMY(r.requestedDate)}</Td>
//                     <Td>{r.requestedTime || "—"}</Td>
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
//                         {r.status || "processing"}
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

// /* ---------- DECISION PANEL ---------- */
// function DecisionPanel({ meta, formatDMY }) {
//   const status = meta?.status || "processing";

//   // Dates as YYYY-MM-DD strings (if present)
//   const req = meta?.requestedPublishingDate
//     ? String(meta.requestedPublishingDate).slice(0, 10)
//     : null;
//   const appr = meta?.approvedPublishingDate
//     ? String(meta.approvedPublishingDate).slice(0, 10)
//     : null;

//   const badge =
//     status === "approved"
//       ? "bg-green-100 text-green-800"
//       : status === "rejected"
//       ? "bg-red-100 text-red-800"
//       : "bg-yellow-100 text-yellow-800";

//   return (
//     <div className="rounded-2xl border border-gray-200 p-4 bg-white">
//       {/* Header: status only */}
//       <div className="flex items-center gap-2">
//         <span
//           className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge}`}
//         >
//           {status}
//         </span>
//       </div>

//       {/* APPROVED — show only Approved Publishing Date; if null => same as requested */}
//       {status === "approved" && (
//         <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
//           <div className="text-xs font-medium text-green-700">
//             Approved Publishing Date
//           </div>
//           <div className="mt-1 text-sm font-semibold text-green-900">
//             {appr
//               ? formatDMY(appr)
//               : req
//               ? (
//                   <span className="inline-flex items-center gap-1">
//                     <span className="opacity-80">Same as requested —</span>
//                     {formatDMY(req)}
//                   </span>
//                 )
//               : "—"}
//           </div>
//         </div>
//       )}

//       {/* REJECTED — show only reason */}
//       {status === "rejected" && (
//         <div className="mt-3">
//           <div className="text-sm text-gray-500">Rejection Reason</div>
//           <div className="mt-1 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
//             {meta?.rejectionReason || "No reason provided"}
//           </div>
//         </div>
//       )}

//       {/* PROCESSING — keep simple progress line */}
//       {status === "processing" && (
//         <div className="mt-3 text-sm text-gray-600">
//           Your request is under review. Publishing Date:{" "}
//           <span className="font-medium text-gray-900">
//             {req ? formatDMY(req) : "—"}
//           </span>
//           {meta?.requestedDate && (
//             <>
//               {" "}
//               • Requested on{" "}
//               <span className="font-medium text-gray-900">
//                 {formatDMY(meta.requestedDate)}
//               </span>{" "}
//               at{" "}
//               <span className="font-medium text-gray-900">
//                 {meta.requestedTime || "—"}
//               </span>
//             </>
//           )}
//         </div>
//       )}
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
// src/components/UploadRequest/UploadRequest.jsx
import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function UploadRequest() {
  // ---------- OPTIONS ----------
  const categoryOptions = useMemo(
    () => [
      { value: "Branch Video", label: "Branch Video" },
      { value: "Franchisee Video", label: "Franchisee Video" },
      { value: "Office Video", label: "Office Video" },
      { value: "Staff performance", label: "Staff performance" },
    ],
    []
  );

  // ---------- FORM FIELDS ----------
  const [category, setCategory] = useState(null);
  const [filename, setFilename] = useState("");
  const [publishingDate, setPublishingDate] = useState(""); // YYYY-MM-DD

  // ---------- PREFILL META ----------
  const [prefillId, setPrefillId] = useState(null);
  const [prefillActive, setPrefillActive] = useState(false);
  const [prefillMeta, setPrefillMeta] = useState(null); // status / approved / rejection etc.
  const isLocked = prefillActive || !!prefillId;

  // ---------- FILTERS ----------
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterFilename, setFilterFilename] = useState("");
  const [filterRequestedDate, setFilterRequestedDate] = useState("");
  const [filterPublishingDate, setFilterPublishingDate] = useState("");

  // ---------- TABLE / LIST ----------
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingTable, setLoadingTable] = useState(false);

  // ---------- LOADERS ----------
  const [submitting, setSubmitting] = useState(false);

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
        ":hover": { borderColor: state.isFocused ? "#8570EE" : " #d1d5db" },
      }),
      valueContainer: (base) => ({ ...base, padding: "0 12px" }),
      input: (base) => ({ ...base, margin: 0, padding: 0, color: "#111827" }),
      indicatorsContainer: (base) => ({ ...base, paddingRight: 8, opacity: 1 }),
      indicatorSeparator: (base) => ({ ...base, backgroundColor: "#e5e7eb", opacity: 1 }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "#6b7280",
        opacity: 1,
        ":hover": { color: "#4b5563" },
      }),
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

  // ---------- HELPERS ----------
  const formatToDMY = (value) => {
    if (!value) return "—";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-");
      return `${d}/${m}/${y}`;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };

  const clearPrefillAndForm = () => {
    setPrefillId(null);
    setPrefillActive(false);

    setCategory(null);
    setFilename("");
    setPublishingDate("");

    setPrefillMeta(null); // reset decision panel meta
  };

  const handleClearPrefillClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearPrefillAndForm();
  };

  // ---------- SUBMIT ----------
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!category || !filename.trim()) {
      toast.error("Category and filename are required");
      return;
    }
    if (isLocked) return; // never submit while prefilled

    try {
      setSubmitting(true);
      await API.post("/salesManager/upload-requests", {
        category: category.value,
        filename: filename.trim(),
        publishingDate: publishingDate || null,
      });
      toast.success("Upload request submitted!");
      clearPrefillAndForm();
      fetchRequests(1, filterCategory, filterFilename, filterRequestedDate, filterPublishingDate);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- PREFILL ----------
  const handlePrefill = async (id) => {
    try {
      if (prefillActive) return;
      setPrefillActive(true);

      const res = await API.get(`/salesManager/upload-requests/${id}`);
      const r = res.data;
      if (!r || !r._id) {
        setPrefillActive(false);
        toast.error("Could not load request details");
        return;
      }

      const found = categoryOptions.find((c) => c.value === r.category);
      setCategory(found || { value: r.category, label: r.category });

      setFilename(r.filename || "");
      setPublishingDate(r.publishingDate ? String(r.publishingDate).slice(0, 10) : "");

      setPrefillId(r._id);

      setPrefillMeta({
        status: r.status || "processing",
        requestedPublishingDate: r.publishingDate || null,
        approvedPublishingDate: r.approvedPublishingDate || null,
        rejectionReason: r.rejectionReason || "",
        updationReason: r.updationReason || "",
        assignedDigitalMarketerName: r.assignedDigitalMarketerName || "",
        requestedDate: r.requestedDate,
        requestedTime: r.requestedTime,
      });

      toast.success("Prefilled from selected request. Form is locked.");
    } catch {
      toast.error("Failed to prefill—try again");
    } finally {
      setPrefillActive(false);
    }
  };

  // ---------- TABLE LOAD ----------
  const fetchRequests = async (
    nextPage = 1,
    fCategory = filterCategory,
    fFilename = filterFilename,
    fRequestedDate = filterRequestedDate,
    fPublishingDate = filterPublishingDate
  ) => {
    try {
      setLoadingTable(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");
      if (fCategory?.value) params.set("category", fCategory.value);
      if (fFilename) params.set("filename", fFilename);
      if (fRequestedDate) params.set("requestedDate", fRequestedDate);
      if (fPublishingDate) params.set("publishingDate", fPublishingDate);

      const res = await API.get(`/salesManager/upload-requests?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages: tp = 1, total: t = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(tp);
      setTotal(t);
    } catch (err) {
      toast.error("Failed to load upload requests");
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchRequests(1, null, "", "", "");
  }, []);

  useEffect(() => {
    fetchRequests(1, filterCategory, filterFilename, filterRequestedDate, filterPublishingDate);
  }, [filterCategory, filterFilename, filterRequestedDate, filterPublishingDate]);

  const handlePrev = () =>
    page > 1 &&
    fetchRequests(page - 1, filterCategory, filterFilename, filterRequestedDate, filterPublishingDate);
  const handleNext = () =>
    page < totalPages &&
    fetchRequests(page + 1, filterCategory, filterFilename, filterRequestedDate, filterPublishingDate);

  return (
    <div className="space-y-10">
      {/* ---------- CREATE FORM ---------- */}
      <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Category" required>
            <Select
              options={categoryOptions}
              value={category}
              onChange={(v) => setCategory(v)}
              placeholder="Select category"
              styles={selectStyles}
              classNamePrefix="uploadreq-category"
              isDisabled={isLocked}
            />
          </Field>

          <Field label="File name" required>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., branch-jan-2025.mp4"
              disabled={isLocked}
            />
          </Field>

          <Field label="Publishing Date">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
              value={publishingDate}
              onChange={(e) => setPublishingDate(e.target.value)}
              disabled={isLocked}
            />
          </Field>
        </div>

        {/* ---------- DECISION PANEL ---------- */}
        {prefillId && prefillMeta && (
          <DecisionPanel
            meta={prefillMeta}
            formatDMY={(v) => formatToDMY(typeof v === "string" ? v.slice(0, 10) : v)}
          />
        )}

        <div className="pt-2 flex items-center justify-center gap-3">
          {isLocked ? (
            <button
              type="button"
              onClick={handleClearPrefillClick}
              className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] w-full"
            >
              Clear Prefill
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60 w-full"
            >
              {submitting ? "Submitting…" : "Send for approval"}
            </button>
          )}
        </div>
      </form>

      {/* ---------- FILTERS + TABLE ---------- */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[#222]">My Upload Requests</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Filter by Category">
            <Select
              options={categoryOptions}
              value={filterCategory}
              onChange={setFilterCategory}
              isClearable
              placeholder="All categories"
              styles={selectStyles}
              classNamePrefix="uploadreq-filter-category"
            />
          </Field>

          <Field label="Filter by File name">
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={filterFilename}
              onChange={(e) => setFilterFilename(e.target.value)}
              placeholder="Search filename (contains)"
            />
          </Field>

          <Field label="Filter by Requested Date">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={filterRequestedDate}
              onChange={(e) => setFilterRequestedDate(e.target.value)}
            />
          </Field>

          <Field label="Filter by Publishing Date">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={filterPublishingDate}
              onChange={(e) => setFilterPublishingDate(e.target.value)}
            />
          </Field>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Category</Th>
                <Th>File Name</Th>
                <Th>Publishing Date</Th>
                <Th>Requested Date</Th>
                <Th>Requested Time</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadingTable ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-sm text-gray-500">
                    No upload requests found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <Td>{r.category || "—"}</Td>
                    <Td>{r.filename || "—"}</Td>
                    <Td>
                      {formatToDMY(
                        r.publishingDate ? String(r.publishingDate).slice(0, 10) : ""
                      )}
                    </Td>
                    <Td>{formatToDMY(r.requestedDate)}</Td>
                    <Td>{r.requestedTime || "—"}</Td>
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
                        {r.status || "processing"}
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

/* ---------- DECISION PANEL ---------- */
function DecisionPanel({ meta, formatDMY }) {
  const status = meta?.status || "processing";

  const req = meta?.requestedPublishingDate
    ? String(meta.requestedPublishingDate).slice(0, 10)
    : null;
  const appr = meta?.approvedPublishingDate
    ? String(meta.approvedPublishingDate).slice(0, 10)
    : null;

  const badge =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <div className="rounded-2xl border border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge}`}
        >
          {status}
        </span>
      </div>

      {/* APPROVED */}
      {status === "approved" && (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
            <div className="text-xs font-medium text-green-700">Approved Publishing Date</div>
            <div className="mt-1 text-sm font-semibold text-green-900">
              {appr
                ? formatDMY(appr)
                : req
                ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="opacity-80">Same as requested —</span>
                      {formatDMY(req)}
                    </span>
                  )
                : "—"}
            </div>
          </div>

          {meta?.updationReason && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <div className="text-xs font-medium text-indigo-700">Updation Reason</div>
              <div className="mt-1 text-sm font-semibold text-indigo-900">
                {meta.updationReason}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REJECTED */}
      {status === "rejected" && (
        <div className="mt-3">
          <div className="text-sm text-gray-500">Rejection Reason</div>
          <div className="mt-1 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
            {meta?.rejectionReason || "No reason provided"}
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {status === "processing" && (
        <div className="mt-3 text-sm text-gray-600">
          Your request is under review. Publishing Date:{" "}
          <span className="font-medium text-gray-900">
            {req ? formatDMY(req) : "—"}
          </span>
          {meta?.requestedDate && (
            <>
              {" "}
              • Requested on{" "}
              <span className="font-medium text-gray-900">
                {formatDMY(meta.requestedDate)}
              </span>{" "}
              at{" "}
              <span className="font-medium text-gray-900">
                {meta.requestedTime || "—"}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- SMALL PRIMITIVE COMPONENTS ---------- */
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
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
}
