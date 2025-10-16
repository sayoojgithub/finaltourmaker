// // src/pages/creative/AdRequests.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import API from "../../api";
// import Select from "react-select";
// import { toast } from "react-toastify";

// export default function CreativeAdRequests() {
//   // table
//   const [rows, setRows] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   // filters
//   const [filterDestinationText, setFilterDestinationText] = useState("");
//   const taskOptions = useMemo(
//     () => [
//       { value: "Poster", label: "Poster" },
//       { value: "Reel", label: "Reel" },
//       { value: "Video", label: "Video" },
//       { value: "Review", label: "Review" },
//       { value: "Staff Performance", label: "Staff Performance" },
//     ],
//     []
//   );
//   const statusOptions = [
//     { value: "pending", label: "Pending" },
//     { value: "processing", label: "Processing" },
//     { value: "waiting", label: "Waiting" },
//   ];
//   const [filterTask, setFilterTask] = useState(null);
//   const [filterStatus, setFilterStatus] = useState(null);
//   const [filterDeadlineDate, setFilterDeadlineDate] = useState("");       // yyyy-mm-dd
//   const [filterRescheduledDate, setFilterRescheduledDate] = useState(""); // yyyy-mm-dd

//   // prefill form state (shown ABOVE filters)
//   const [openId, setOpenId] = useState(null);
//   const [detail, setDetail] = useState(null);
//   const [panelLoading, setPanelLoading] = useState(false);

//   // dynamic file name inputs
//   const [fileNames, setFileNames] = useState([]);

//   const pad = (n) => String(n).padStart(2, "0");
//   const formatDMY = (v) => {
//     if (!v) return "—";
//     const d = new Date(v);
//     if (Number.isNaN(d.getTime())) return "—";
//     return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
//   };

//   const buildQuery = (nextPage = page) => {
//     const params = new URLSearchParams();
//     params.set("page", String(nextPage));
//     params.set("limit", "10");
//     if (filterDestinationText.trim()) params.set("destinationText", filterDestinationText.trim());
//     if (filterTask?.value) params.set("task", filterTask.value);
//     if (filterStatus?.value) params.set("status", filterStatus.value);
//     if (filterDeadlineDate) params.set("deadlineDate", filterDeadlineDate);
//     if (filterRescheduledDate) params.set("rescheduledDate", filterRescheduledDate);
//     return params.toString();
//   };

//   const fetchList = async (nextPage = page) => {
//     try {
//       setLoading(true);
//       const res = await API.get(`/creativeStaff/ad-requests?${buildQuery(nextPage)}`);
//       const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
//       setRows(docs);
//       setPage(p);
//       setTotalPages(totalPages);
//       setTotal(total);
//     } catch {
//       toast.error("Failed to load requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchList(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     fetchList(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterDestinationText, filterTask, filterStatus, filterDeadlineDate, filterRescheduledDate]);

//   const openPanel = async (id) => {
//     setOpenId(id);     // shows the form ABOVE filters
//     setPanelLoading(true);
//     setDetail(null);
//     setFileNames([]);

//     try {
//       const res = await API.get(`/creativeStaff/ad-requests/${id}`);
//       const d = res.data;
//       setDetail(d);

//       const reqQty = d.approvedQuantity ?? d.quantity ?? 0;
//       const base = Array.from({ length: reqQty }, (_, i) => d.fileNames?.[i] || "");
//       setFileNames(base);
//     } catch {
//       toast.error("Failed to load details");
//     } finally {
//       setPanelLoading(false);
//     }
//   };

//   const closePanel = () => {
//     setOpenId(null);
//     setDetail(null);
//     setFileNames([]);
//   };

//   const toggleStatus = async (id) => {
//     try {
//       const res = await API.post(`/creativeStaff/ad-requests/${id}/toggle`);
//       toast.success(`Status: ${res.data.creativeStatus}`);
//       fetchList(page);
//       if (openId === id) openPanel(id);
//     } catch (e) {
//       const msg = e?.response?.data?.message || "Failed to toggle";
//       toast.error(msg);
//     }
//   };

//   const saveNames = async () => {
//     if (!detail?._id) return;
//     try {
//       await API.post(`/creativeStaff/ad-requests/${detail._id}/filenames`, {
//         fileNames: fileNames.map((s) => String(s || "").trim()),
//       });
//       toast.success("Saved file names");
//       fetchList(page);
//     } catch (e) {
//       const msg = e?.response?.data?.message || "Failed to save file names";
//       toast.error(msg);
//     }
//   };

//   const sendForApproval = async () => {
//     if (!detail?._id) return;
//     try {
//       await API.post(`/creativeStaff/ad-requests/${detail._id}/send-for-approval`);
//       toast.success("Sent for approval");
//       closePanel();
//       fetchList(page);
//     } catch (e) {
//       const msg = e?.response?.data?.message || "Failed to send";
//       toast.error(msg);
//     }
//   };

//   // Green round toggle
//   const Toggle = ({ on, onClick, disabled }) => (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       className={`relative inline-flex h-6 w-11 items-center rounded-full transition
//         ${on ? "bg-green-500" : "bg-gray-300"}
//         ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}
//       `}
//       title="Toggle pending/processing"
//     >
//       <span
//         className={`inline-block h-5 w-5 transform rounded-full bg-white transition
//           ${on ? "translate-x-5" : "translate-x-1"}
//         `}
//       />
//     </button>
//   );

//   return (
//     <div className="space-y-6">
//       <h2 className="text-xl font-semibold text-[#222]">Ad Requests — Creative Staff</h2>

//       {/* ---------- PREFILL FORM (ABOVE FILTERS) ---------- */}
//       {openId && (
//         <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold">Work Form</h3>
//             <button
//               onClick={closePanel}
//               className="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-50"
//               title="Close"
//             >
//               ✕
//             </button>
//           </div>

//           {panelLoading || !detail ? (
//             <p className="text-gray-500">Loading…</p>
//           ) : (
//             <>
//               {/* Row 1: Destination & Task */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Field label="Destination">
//                   <input
//                     readOnly
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
//                     value={detail.destinationName || "—"}
//                   />
//                 </Field>
//                 <Field label="Task">
//                   <input
//                     readOnly
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
//                     value={detail.task || "—"}
//                   />
//                 </Field>
//               </div>

//               {/* Row 2: Deadline & Required Quantity */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                 <Field label="Deadline">
//                   <input
//                     readOnly
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
//                     value={formatDMY(detail.approvedDate || detail.date)}
//                   />
//                 </Field>
//                 <Field label="Required Quantity">
//                   <input
//                     readOnly
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
//                     value={detail.approvedQuantity ?? detail.quantity ?? "—"}
//                   />
//                 </Field>
//               </div>

//               {/* Row 3: Details (full width) */}
//               <div className="mt-4">
//                 <Field label="Details">
//                   <textarea
//                     readOnly
//                     rows={4}
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-y"
//                     value={detail.details || ""}
//                   />
//                 </Field>
//               </div>

//               {/* Row 4: Message for Creative Staff (full width) */}
//               <div className="mt-4">
//                 <Field label="Message for Creative Staff">
//                   <textarea
//                     readOnly
//                     rows={3}
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-y"
//                     value={detail.messageForCreativeStaff || ""}
//                   />
//                 </Field>
//               </div>

//               {/* Dynamic file name inputs */}
//               <div className="mt-6">
//                 <h4 className="font-semibold mb-2">File Names ({fileNames.length})</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   {fileNames.map((v, idx) => (
//                     <label key={idx} className="block">
//                       <span className="block text-sm text-[#222] mb-1">File {idx + 1}</span>
//                       <input
//                         type="text"
//                         className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//                         value={v}
//                         onChange={(e) => {
//                           const next = [...fileNames];
//                           next[idx] = e.target.value;
//                           setFileNames(next);
//                         }}
//                         placeholder={`Enter file name ${idx + 1}`}
//                       />
//                     </label>
//                   ))}
//                 </div>

//                 {/* centered buttons */}
//                 <div className="flex items-center justify-center gap-3 mt-5">
//                   <button
//                     onClick={saveNames}
//                     className="rounded-full bg-[#111827] text-white px-6 py-2.5 font-medium hover:opacity-90"
//                   >
//                     Save
//                   </button>
//                   <button
//                     onClick={sendForApproval}
//                     className="rounded-full bg-[#22c55e] text-white px-6 py-2.5 font-medium hover:opacity-90"
//                   >
//                     Send for Approval
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {/* ---------- FILTERS (EXACTLY ABOVE THE TABLE) ---------- */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//         <Field label="Destination">
//           <input
//             type="text"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             placeholder="Search destination"
//             value={filterDestinationText}
//             onChange={(e) => setFilterDestinationText(e.target.value)}
//           />
//         </Field>

//         <Field label="Task">
//           <Select
//             options={taskOptions}
//             value={filterTask}
//             onChange={setFilterTask}
//             isClearable
//             placeholder="All tasks"
//             styles={{ control: (b) => ({ ...b, borderRadius: 12, minHeight: 42 }) }}
//           />
//         </Field>

//         <Field label="Deadline Date">
//           <input
//             type="date"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             value={filterDeadlineDate}
//             onChange={(e) => setFilterDeadlineDate(e.target.value)}
//           />
//         </Field>

//         <Field label="Rescheduled Date">
//           <input
//             type="date"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             value={filterRescheduledDate}
//             onChange={(e) => setFilterRescheduledDate(e.target.value)}
//           />
//         </Field>

//         <Field label="Status">
//           <Select
//             options={statusOptions}
//             value={filterStatus}
//             onChange={setFilterStatus}
//             isClearable
//             placeholder="All statuses"
//             styles={{ control: (b) => ({ ...b, borderRadius: 12, minHeight: 42 }) }}
//           />
//         </Field>
//       </div>

//       {/* ---------- TABLE ---------- */}
//       <div className="overflow-x-auto rounded-2xl border border-gray-200">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <Th>Destination</Th>
//               <Th>Task</Th>
//               <Th>Deadline</Th>
//               <Th>Required Qty</Th>
//               <Th>Rescheduled Date</Th>
//               <Th>Toggle</Th>
//               <Th>Status</Th>
//               <Th>{/* open */}</Th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 bg-white">
//             {loading ? (
//               <tr>
//                 <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>
//                   Loading…
//                 </td>
//               </tr>
//             ) : rows.length === 0 ? (
//               <tr>
//                 <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>
//                   No requests.
//                 </td>
//               </tr>
//             ) : (
//               rows.map((r) => {
//                 const deadline = r.approvedDate || r.date;
//                 const requiredQty = r.approvedQuantity ?? r.quantity ?? "—";
//                 const lastRes = r.lastRescheduledDate ? formatDMY(r.lastRescheduledDate) : "—";
//                 const isWaiting = r.creativeStatus === "waiting";
//                 return (
//                   <tr key={r._id} className="hover:bg-gray-50">
//                     <Td>{r.destinationName || "—"}</Td>
//                     <Td>{r.task || "—"}</Td>
//                     <Td>{formatDMY(deadline)}</Td>
//                     <Td>{requiredQty}</Td>
//                     <Td>{lastRes}</Td>
//                     <Td>
//                       <Toggle
//                         on={r.creativeStatus === "processing"}
//                         onClick={() => toggleStatus(r._id)}
//                         disabled={isWaiting}
//                       />
//                     </Td>
//                     <Td>
//                       <span
//                         className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
//                           r.creativeStatus === "processing"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : r.creativeStatus === "waiting"
//                             ? "bg-indigo-100 text-indigo-800"
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {r.creativeStatus}
//                       </span>
//                     </Td>
//                     <Td>
//                       <button
//                         type="button"
//                         onClick={() => openPanel(r._id)}
//                         className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50"
//                         title="Open"
//                       >
//                         +
//                       </button>
//                     </Td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* pagination */}
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-600">
//           Showing page <span className="font-semibold">{page}</span> of{" "}
//           <span className="font-semibold">{totalPages}</span> •{" "}
//           <span className="font-semibold">{total}</span> total
//         </p>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => fetchList(page - 1)}
//             disabled={page <= 1 || loading}
//             className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <button
//             onClick={() => fetchList(page + 1)}
//             disabled={page >= totalPages || loading}
//             className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <label className="block">
//       <span className="block text-sm font-medium text-[#222] mb-1">{label}</span>
//       {children}
//     </label>
//   );
// }
// function Th({ children }) {
//   return (
//     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
//       {children}
//     </th>
//   );
// }
// function Td({ children }) {
//   return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
// }
// src/pages/creative/AdRequests.jsx
// src/pages/creative/AdRequests.jsx
// src/pages/creative/AdRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import { toast } from "react-toastify";

export default function CreativeAdRequests() {
  // table
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters
  const [filterDestinationText, setFilterDestinationText] = useState("");
  const taskOptions = useMemo(
    () => [
      { value: "Poster", label: "Poster" },
      { value: "Reel", label: "Reel" },
      { value: "Video", label: "Video" },
      { value: "Review", label: "Review" },
      { value: "Staff Performance", label: "Staff Performance" },
    ],
    []
  );
  // Status: ONLY pending | waiting
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "waiting", label: "Waiting" },
    { value: "approved", label: "approved"},
    { value: "rejected", label: "rejected"}
  ];
  const [filterTask, setFilterTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDeadlineDate, setFilterDeadlineDate] = useState("");       // yyyy-mm-dd
  const [filterRescheduledDate, setFilterRescheduledDate] = useState(""); // yyyy-mm-dd
  const [filterToggledOnly, setFilterToggledOnly] = useState(false);      // separate toggled filter

  // prefill form state (shown ABOVE filters)
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  // dynamic file name inputs
  const [fileNames, setFileNames] = useState([]);

  // per-row toggle loading state
  const [togglingId, setTogglingId] = useState(null);

  const pad = (n) => String(n).padStart(2, "0");
  const formatDMY = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };
  const isFinalized = (s) => s === "approved" || s === "rejected";
  const buildQuery = (nextPage = page) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "10");
    if (filterDestinationText.trim()) params.set("destinationText", filterDestinationText.trim());
    if (filterTask?.value) params.set("task", filterTask.value);
    if (filterStatus?.value) params.set("status", filterStatus.value); // pending|waiting
    if (filterDeadlineDate) params.set("deadlineDate", filterDeadlineDate);
    if (filterRescheduledDate) params.set("rescheduledDate", filterRescheduledDate);
    if (filterToggledOnly) params.set("toggled", "true");              // separate toggled filter
    return params.toString();
  };

  const fetchList = async (nextPage = page) => {
    try {
      setLoading(true);
      const res = await API.get(`/creativeStaff/ad-requests?${buildQuery(nextPage)}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterDestinationText,
    filterTask,
    filterStatus,
    filterDeadlineDate,
    filterRescheduledDate,
    filterToggledOnly,
  ]);

  const openPanel = async (id) => {
    setOpenId(id);     // shows the form ABOVE filters
    setPanelLoading(true);
    setDetail(null);
    setFileNames([]);
    try {
      const res = await API.get(`/creativeStaff/ad-requests/${id}`);
      const d = res.data;
      setDetail(d);

      const reqQty = d.approvedQuantity ?? d.quantity ?? 0;
      const base = Array.from({ length: reqQty }, (_, i) => d.fileNames?.[i] || "");
      setFileNames(base);
    } catch {
      toast.error("Failed to load details");
    } finally {
      setPanelLoading(false);
    }
  };

  const closePanel = () => {
    setOpenId(null);
    setDetail(null);
    setFileNames([]);
  };

  // Bi-directional toggle (togglestatus ON/OFF)
  const flipToggled = async (id) => {
    try {
      setTogglingId(id);
      const res = await API.post(`/creativeStaff/ad-requests/${id}/toggle`);
      toast.success(res.data?.message || "Updated");
      await fetchList(page);
      if (openId === id) await openPanel(id);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to toggle";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const saveNames = async () => {
    if (!detail?._id) return;
    try {
      await API.post(`/creativeStaff/ad-requests/${detail._id}/filenames`, {
        fileNames: fileNames.map((s) => String(s || "").trim()),
      });
      toast.success("Saved file names");
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to save file names";
      toast.error(msg);
    }
  };

  const sendForApproval = async () => {
    if (!detail?._id) return;
    try {
      await API.post(`/creativeStaff/ad-requests/${detail._id}/send-for-approval`);
      toast.success("Sent for approval");
      closePanel();
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to send";
      toast.error(msg);
    }
  };

  // Green round toggle — ON means toggled; click flips either way
  const Toggle = ({ on, onClick, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition
        ${on ? "bg-green-500" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}
      `}
      title={on ? "Turn off toggle" : "Turn on toggle"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition
          ${on ? "translate-x-5" : "translate-x-1"}
        `}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#222]">Ad Requests — Creative Staff</h2>

      {/* ---------- PREFILL FORM (ABOVE FILTERS) ---------- */}
      {openId && (
        <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Work Form</h3>
            <button
              onClick={closePanel}
              className="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-50"
              title="Close"
            >
              ✕
            </button>
          </div>

          {panelLoading || !detail ? (
            <p className="text-gray-500">Loading…</p>
          ) : (
            <>
              {/* Row 1: Destination & Task */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Destination">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={detail.destinationName || "—"}
                  />
                </Field>
                <Field label="Task">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={detail.task || "—"}
                  />
                </Field>
              </div>

              {/* Row 2: Deadline & Required Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Publishing Date">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={formatDMY(detail.approvedDate || detail.date)}
                  />
                </Field>
                <Field label="Quantity">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={detail.approvedQuantity ?? detail.quantity ?? "—"}
                  />
                </Field>
              </div>

              {/* Row 3: Details */}
              <div className="mt-4">
                <Field label="Details">
                  <textarea
                    readOnly
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-y"
                    value={detail.details || ""}
                  />
                </Field>
              </div>

              {/* Row 4: Message for Creative Staff */}
              <div className="mt-4">
                <Field label="Message for Creative Staff">
                  <textarea
                    readOnly
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-y"
                    value={detail.messageForCreativeStaff || ""}
                  />
                </Field>
              </div>
              +{/* If rejected, show the reason from Marketing Manager */}
{detail.creativeStatus === "rejected" && (
  <div className="mt-4">
    <Field label="Rejection Reason (from Marketing Manager)">
      <textarea
        readOnly
        rows={3}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-y"
        value={detail.creativeRejectionReason || ""}
      />
    </Field>
  </div>
)}

              {/* Dynamic file name inputs */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">File Names ({fileNames.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fileNames.map((v, idx) => (
                    <label key={idx} className="block">
                      <span className="block text-sm text-[#222] mb-1">File {idx + 1}</span>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                        value={v}
                        onChange={(e) => {
                          const next = [...fileNames];
                          next[idx] = e.target.value;
                          setFileNames(next);
                        }}
                        placeholder={`Enter file name ${idx + 1}`}
                      />
                    </label>
                  ))}
                </div>

                {/* centered buttons */}
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button
                    onClick={saveNames}
                    disabled={isFinalized(detail.creativeStatus)}
                    className="rounded-full bg-[#111827] text-white px-6 py-2.5 font-medium hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    onClick={sendForApproval}
                    disabled={isFinalized(detail.creativeStatus)}
                    className="rounded-full bg-[#22c55e] text-white px-6 py-2.5 font-medium hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send for Approval
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------- FILTERS (EXACTLY ABOVE THE TABLE) ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Field label="Destination">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="Search destination"
            value={filterDestinationText}
            onChange={(e) => setFilterDestinationText(e.target.value)}
          />
        </Field>

        <Field label="Task">
          <Select
            options={taskOptions}
            value={filterTask}
            onChange={setFilterTask}
            isClearable
            placeholder="All tasks"
            styles={{ control: (b) => ({ ...b, borderRadius: 12, minHeight: 42 }) }}
          />
        </Field>

        <Field label="Publishing Date">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDeadlineDate}
            onChange={(e) => setFilterDeadlineDate(e.target.value)}
          />
        </Field>

        {/* <Field label="Rescheduled Date">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterRescheduledDate}
            onChange={(e) => setFilterRescheduledDate(e.target.value)}
          />
        </Field> */}

        <Field label="Status">
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            isClearable
            placeholder="All statuses"
            styles={{ control: (b) => ({ ...b, borderRadius: 12, minHeight: 42 }) }}
          />
        </Field>

        {/* Separate toggled filter */}
        <label className="block">
          <span className="block text-sm font-medium text-[#222] mb-1">Only Toggled</span>
          <div className="flex items-center h-[42px] rounded-xl border border-gray-300 px-3">
            <input
              id="only-toggled"
              type="checkbox"
              className="h-4 w-4"
              checked={filterToggledOnly}
              onChange={(e) => setFilterToggledOnly(e.target.checked)}
            />
            <label htmlFor="only-toggled" className="ml-2 text-sm text-gray-800">
              Show only toggled
            </label>
          </div>
        </label>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Destination</Th>
              <Th>Task</Th>
              <Th>Publishing Date</Th>
              <Th>Quantity</Th>
              {/* <Th>Rescheduled Date</Th> */}
              <Th>Toggle</Th>
              <Th>Status</Th>
              <Th>{/* open */}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>
                  No requests.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const deadline = r.approvedDate || r.date;
                const requiredQty = r.approvedQuantity ?? r.quantity ?? "—";
                const lastRes = r.lastRescheduledDate ? formatDMY(r.lastRescheduledDate) : "—";
                const isToggled = !!r.togglestatus;
                const isBusy = togglingId === r._id;

                // Status pill from creativeStatus ONLY (pending | waiting)
                 // Status pill from creativeStatus (pending | waiting | approved | rejected)
 let pill = { text: r.creativeStatus || "pending", cls: "bg-gray-100 text-gray-800" };
 if (r.creativeStatus === "waiting")  pill = { text: "waiting",  cls: "bg-indigo-100 text-indigo-800" };
 if (r.creativeStatus === "approved") pill = { text: "approved", cls: "bg-green-100 text-green-800" };
 if (r.creativeStatus === "rejected") pill = { text: "rejected", cls: "bg-red-100 text-red-800" };

                return (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <Td>{r.destinationName || "—"}</Td>
                    <Td>{r.task || "—"}</Td>
                    <Td>{formatDMY(deadline)}</Td>
                    <Td>{requiredQty}</Td>
                    {/* <Td>{lastRes}</Td> */}

                    {/* Toggle: allowed for ANY status, disabled only during request */}
                    <Td>
                      <Toggle
                        on={isToggled}
                        onClick={() => flipToggled(r._id)}
                        disabled={isBusy}
                      />
                    </Td>

                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${pill.cls}`}
                      >
                        {pill.text}
                      </span>
                    </Td>

                    <Td>
                      <button
                        type="button"
                        onClick={() => openPanel(r._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50"
                        title="Open"
                      >
                        +
                      </button>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> •{" "}
          <span className="font-semibold">{total}</span> total
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchList(page - 1)}
            disabled={page <= 1 || loading}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => fetchList(page + 1)}
            disabled={page >= totalPages || loading}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#222] mb-1">{label}</span>
      {children}
    </label>
  );
}
function Th({ children }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
      {children}
    </th>
  );
}
function Td({ children }) {
  return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
}


