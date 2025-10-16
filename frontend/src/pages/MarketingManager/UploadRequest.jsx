// // src/pages/marketing/UploadRequest.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Select from "react-select";
// import API from "../../api";
// import { toast } from "react-toastify";

// export default function UploadRequest() {
//   // table state
//   const [rows, setRows] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   // filters
//   const [filterSalesManagerText, setFilterSalesManagerText] = useState("");
//   const [filterFilename, setFilterFilename] = useState("");
//   const [filterPublishingDate, setFilterPublishingDate] = useState("");
//   const statusOptions = [
//     { value: "processing", label: "Processing" },
//     { value: "approved", label: "Approved" },
//     { value: "rejected", label: "Rejected" },
//   ];
//   const [filterStatus, setFilterStatus] = useState(null);

//   const categoryOptions = useMemo(
//     () => [
//       { value: "Branch Video", label: "Branch Video" },
//       { value: "Franchisee Video", label: "Franchisee Video" },
//       { value: "Office Video", label: "Office Video" },
//       { value: "Staff performance", label: "Staff performance" },
//     ],
//     []
//   );
//   const [filterCategory, setFilterCategory] = useState(null);

//   // inline decision panel state
//   const [openId, setOpenId] = useState(null);
//   const [detail, setDetail] = useState(null);
//   const [panelLoading, setPanelLoading] = useState(false);

//   // DM list + override date + rejection
//   const [dmOptions, setDmOptions] = useState([]);
//   const [assignDm, setAssignDm] = useState(null);
//   const [overridePublishingDate, setOverridePublishingDate] = useState("");
//   const [rejectReason, setRejectReason] = useState("");

//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 12,
//         borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
//       }),
//       valueContainer: (b) => ({ ...b, padding: "0 12px" }),
//       input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
//       dropdownIndicator: (b) => ({ ...b, color: "#6b7280", ":hover": { color: "#4b5563" } }),
//       menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden" }),
//       option: (b, s) => ({
//         ...b,
//         backgroundColor: s.isFocused
//           ? "rgba(133,112,238,0.08)"
//           : s.isSelected
//           ? "rgba(133,112,238,0.16)"
//           : "white",
//         color: "#222",
//         ":active": { backgroundColor: "rgba(133,112,238,0.16)" },
//       }),
//     }),
//     []
//   );

//   const pad = (n) => String(n).padStart(2, "0");
//   const formatDMY = (value) => {
//     if (!value) return "—";
//     const d = new Date(value);
//     if (Number.isNaN(d.getTime())) return "—";
//     return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
//   };

//   const fetchDMs = async () => {
//     try {
//       const res = await API.get("/marketingManager/digital-marketers");
//       setDmOptions(res.data || []);
//     } catch {
//       toast.error("Failed to load digital marketers");
//     }
//   };

//   const fetchList = async (nextPage = page) => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       params.set("page", String(nextPage));
//       params.set("limit", "7");
//       if (filterSalesManagerText.trim())
//         params.set("salesManagerText", filterSalesManagerText.trim());
//       if (filterFilename.trim()) params.set("filename", filterFilename.trim());
//       if (filterPublishingDate) params.set("publishingDate", filterPublishingDate);
//       if (filterCategory?.value) params.set("category", filterCategory.value);
//       if (filterStatus?.value) params.set("status", filterStatus.value);

//       const res = await API.get(`/marketingManager/upload-requests?${params.toString()}`);
//       const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
//       setRows(docs);
//       setPage(p);
//       setTotalPages(totalPages);
//       setTotal(total);
//     } catch {
//       toast.error("Failed to load upload requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchList(1);
//     fetchDMs();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     fetchList(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterSalesManagerText, filterFilename, filterPublishingDate, filterCategory, filterStatus]);

//   const handlePrev = () => page > 1 && fetchList(page - 1);
//   const handleNext = () => page < totalPages && fetchList(page + 1);

//   const openPanel = async (id) => {
//     setOpenId(id);
//     setPanelLoading(true);
//     setDetail(null);
//     setAssignDm(null);
//     setOverridePublishingDate("");
//     setRejectReason("");

//     try {
//       const res = await API.get(`/marketingManager/upload-requests/${id}`);
//       const d = res.data;
//       setDetail(d);

//       if (d.assignedDigitalMarketerId) {
//         const opt =
//           dmOptions.find((o) => o.value === d.assignedDigitalMarketerId) || {
//             value: d.assignedDigitalMarketerId,
//             label: d.assignedDigitalMarketerName,
//           };
//         setAssignDm(opt);
//       }
//       if (d.approvedPublishingDate) {
//         setOverridePublishingDate(String(d.approvedPublishingDate).slice(0, 10));
//       }
//     } catch {
//       toast.error("Failed to load details");
//     } finally {
//       setPanelLoading(false);
//     }
//   };

//   const closePanel = () => {
//     setOpenId(null);
//     setDetail(null);
//     setAssignDm(null);
//     setOverridePublishingDate("");
//     setRejectReason("");
//   };

//   const approve = async () => {
//     if (!detail?._id) return;
//     if (!assignDm?.value) {
//       toast.error("Select a digital marketer");
//       return;
//     }
//     try {
//       const payload = {
//         digitalMarketerId: assignDm.value,
//         publishingDate: overridePublishingDate || undefined, // optional override
//       };
//       await API.post(`/marketingManager/upload-requests/${detail._id}/approve`, payload);
//       toast.success("Approved");
//       closePanel();
//       fetchList(page);
//     } catch (e) {
//       const msg = e?.response?.data?.message || "Failed to approve";
//       toast.error(msg);
//     }
//   };

//   const reject = async () => {
//     if (!detail?._id) return;
//     if (!rejectReason.trim()) {
//       toast.error("Please enter a rejection reason");
//       return;
//     }
//     try {
//       await API.post(`/marketingManager/upload-requests/${detail._id}/reject`, {
//         reason: rejectReason.trim(),
//       });
//       toast.success("Rejected");
//       closePanel();
//       fetchList(page);
//     } catch (e) {
//       const msg = e?.response?.data?.message || "Failed to reject";
//       toast.error(msg);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <h2 className="text-xl font-semibold text-[#222]">Upload Requests — Marketing</h2>

//       {/* ---------- INLINE DECISION PANEL ---------- */}
//       {openId && (
//         <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold">Review & Decide</h3>
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
//               {/* Row 1: Category / File name */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Field label="Category">
//                   <input
//                     type="text"
//                     readOnly
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
//                     value={detail.category || "—"}
//                   />
//                 </Field>

//                 <Field label="File name">
//                   <input
//                     type="text"
//                     readOnly
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
//                     value={detail.filename || "—"}
//                   />
//                 </Field>
//               </div>

//               {/* Row 2: Publishing Date (requested) + Allowed Publishing Date (override) */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                 <Field label="Publishing Date (requested)">
//                   <input
//                     type="text"
//                     readOnly
//                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
//                     value={formatDMY(detail.publishingDate)}
//                   />
//                 </Field>

//                 <Field label="Allowed Publishing Date (optional)">
//                   <input
//                     type="date"
//                     className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//                     value={overridePublishingDate}
//                     onChange={(e) => setOverridePublishingDate(e.target.value)}
//                   />
//                 </Field>
//               </div>

//               {/* Sales Manager & Unit — BELOW */}
//               <p className="text-sm text-gray-700 mt-2">
//                 <b>Requested by:</b> {detail?.salesManagerName || "—"} &nbsp;•&nbsp;
//                 <b>Unit:</b> {detail?.salesManagerUnitType || "—"} &nbsp;•&nbsp;
//                 <b>Unit Name:</b> {detail?.salesManagerUnitName || "—"}
//               </p>

//               {/* Row 3: Assign DM */}
//               <div className="mt-4">
//                 <Field label="Assign Digital Marketer" required>
//                   <Select
//                     options={dmOptions}
//                     value={assignDm}
//                     onChange={setAssignDm}
//                     placeholder="Select digital marketer"
//                     styles={selectStyles}
//                   />
//                 </Field>
//               </div>

//               {/* Row 4: Rejection Reason */}
//               <div className="mt-4">
//                 <Field label="Rejection Reason (only if rejecting)">
//                   <textarea
//                     rows={3}
//                     className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
//                     value={rejectReason}
//                     onChange={(e) => setRejectReason(e.target.value)}
//                     placeholder="Explain why this request is rejected"
//                   />
//                 </Field>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center justify-center gap-3 pt-4">
//                 <button
//                   onClick={approve}
//                   className="inline-flex items-center justify-center rounded-full bg-[#16a34a] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16a34a]"
//                 >
//                   Approve
//                 </button>
//                 <button
//                   onClick={reject}
//                   className="inline-flex items-center justify-center rounded-full bg-[#dc2626] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dc2626]"
//                 >
//                   Reject
//                 </button>
//               </div>

//               {detail.status !== "processing" && (
//                 <p className="text-sm text-gray-600 mt-3">
//                   <b>Status:</b> {detail.status}
//                   {detail.status === "rejected" && detail.rejectionReason
//                     ? ` — ${detail.rejectionReason}`
//                     : ""}
//                 </p>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       {/* ---------- FILTERS ---------- */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//         <Field label="Sales Manager (name/email)">
//           <input
//             type="text"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             placeholder="e.g., Priya / priya@..."
//             value={filterSalesManagerText}
//             onChange={(e) => setFilterSalesManagerText(e.target.value)}
//           />
//         </Field>

//         <Field label="Category">
//           <Select
//             options={categoryOptions}
//             value={filterCategory}
//             onChange={setFilterCategory}
//             isClearable
//             placeholder="All categories"
//             styles={selectStyles}
//           />
//         </Field>

//         <Field label="Status">
//           <Select
//             options={statusOptions}
//             value={filterStatus}
//             onChange={setFilterStatus}
//             isClearable
//             placeholder="All statuses"
//             styles={selectStyles}
//           />
//         </Field>

//         <Field label="Publishing Date">
//           <input
//             type="date"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             value={filterPublishingDate}
//             onChange={(e) => setFilterPublishingDate(e.target.value)}
//           />
//         </Field>

//         <Field label="Filename (contains)">
//           <input
//             type="text"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             value={filterFilename}
//             onChange={(e) => setFilterFilename(e.target.value)}
//             placeholder="e.g., branch-jan"
//           />
//         </Field>
//       </div>

//       {/* ---------- TABLE ---------- */}
//       <div className="overflow-x-auto rounded-2xl border border-gray-200">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <Th>Sales Manager (Unit)</Th>
//               <Th>Category</Th>
//               <Th>File Name</Th>
//               <Th>Publishing Date</Th>
//               <Th>Allowed Publishing Date</Th>
//               <Th>Status</Th>
//               <Th>{/* actions */}</Th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 bg-white">
//             {loading ? (
//               <tr>
//                 <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
//                   Loading…
//                 </td>
//               </tr>
//             ) : rows.length === 0 ? (
//               <tr>
//                 <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
//                   No requests.
//                 </td>
//               </tr>
//             ) : (
//               rows.map((r) => (
//                 <tr key={r._id} className="hover:bg-gray-50">
//                   <Td>
//                     {r.salesManagerName || "—"}
//                     {r.salesManagerUnitName ? ` — ${r.salesManagerUnitName}` : ""}
//                   </Td>
//                   <Td>{r.category || "—"}</Td>
//                   <Td>{r.filename || "—"}</Td>
//                   <Td>{r.publishingDate ? formatDMY(r.publishingDate) : "—"}</Td>
//                   <Td>{r.approvedPublishingDate ? formatDMY(r.approvedPublishingDate) : "—"}</Td>
//                   <Td>
//                     <span
//                       className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
//                         r.status === "approved"
//                           ? "bg-green-100 text-green-800"
//                           : r.status === "rejected"
//                           ? "bg-red-100 text-red-800"
//                           : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {r.status}
//                     </span>
//                   </Td>
//                   <Td>
//                     <button
//                       type="button"
//                       onClick={() => openPanel(r._id)}
//                       title="Details / Decide"
//                       className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
//                     >
//                       +
//                     </button>
//                   </Td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ---------- PAGINATION ---------- */}
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-600">
//           Showing page <span className="font-semibold">{page}</span> of{" "}
//           <span className="font-semibold">{totalPages}</span> •{" "}
//           <span className="font-semibold">{total}</span> total
//         </p>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handlePrev}
//             disabled={page <= 1 || loading}
//             className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <button
//             onClick={handleNext}
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
//     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
//       {children}
//     </th>
//   );
// }
// function Td({ children }) {
//   return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
// }
// src/pages/marketing/UploadRequest.jsx
// src/pages/marketing/UploadRequest.jsx
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function UploadRequest() {
  // table state
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters
  const [filterSalesManagerText, setFilterSalesManagerText] = useState("");
  const [filterFilename, setFilterFilename] = useState("");
  const [filterPublishingDate, setFilterPublishingDate] = useState("");
  const statusOptions = [
    { value: "processing", label: "Processing" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];
  const [filterStatus, setFilterStatus] = useState(null);

  const categoryOptions = useMemo(
    () => [
      { value: "Branch Video", label: "Branch Video" },
      { value: "Franchisee Video", label: "Franchisee Video" },
      { value: "Office Video", label: "Office Video" },
      { value: "Staff performance", label: "Staff performance" },
    ],
    []
  );
  const [filterCategory, setFilterCategory] = useState(null);

  // inline decision panel state
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  // DM + CS lists + messages + overrides
  const [dmOptions, setDmOptions] = useState([]);
  const [csOptions, setCsOptions] = useState([]);
  const [assignDm, setAssignDm] = useState(null);
  const [assignCs, setAssignCs] = useState(null);
  const [msgDM, setMsgDM] = useState("");
  const [msgCS, setMsgCS] = useState("");
  const [overridePublishingDate, setOverridePublishingDate] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [updationReason, setUpdationReason] = useState("");

  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
      }),
    }),
    []
  );

  const pad = (n) => String(n).padStart(2, "0");
  const formatDMY = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const isBlank = (s) => !s || !String(s).trim();
  const isValidISODate = (s) => {
    if (isBlank(s)) return false;
    const d = new Date(s);
    return !Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(s);
  };

  const fetchDMs = async () => {
    try {
      const res = await API.get("/marketingManager/digital-marketers");
      setDmOptions(res.data || []);
    } catch {
      toast.error("Failed to load digital marketers");
    }
  };
  const fetchCS = async () => {
    try {
      const res = await API.get("/marketingManager/creative-staff");
      setCsOptions(res.data || []);
    } catch {
      toast.error("Failed to load creative staff");
    }
  };

  const fetchList = async (nextPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");
      if (filterSalesManagerText.trim())
        params.set("salesManagerText", filterSalesManagerText.trim());
      if (filterFilename.trim()) params.set("filename", filterFilename.trim());
      if (filterPublishingDate) params.set("publishingDate", filterPublishingDate);
      if (filterCategory?.value) params.set("category", filterCategory.value);
      if (filterStatus?.value) params.set("status", filterStatus.value);

      const res = await API.get(`/marketingManager/upload-requests?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch {
      toast.error("Failed to load upload requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    fetchDMs();
    fetchCS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSalesManagerText, filterFilename, filterPublishingDate, filterCategory, filterStatus]);

  const handlePrev = () => page > 1 && fetchList(page - 1);
  const handleNext = () => page < totalPages && fetchList(page + 1);

  const openPanel = async (id) => {
    setOpenId(id);
    setPanelLoading(true);
    setDetail(null);
    setAssignDm(null);
    setAssignCs(null);
    setMsgDM("");
    setMsgCS("");
    setOverridePublishingDate("");
    setRejectReason("");
    setUpdationReason("");

    try {
      const res = await API.get(`/marketingManager/upload-requests/${id}`);
      const d = res.data;
      setDetail(d);

      if (d.assignedDigitalMarketerId) {
        const opt =
          dmOptions.find((o) => o.value === d.assignedDigitalMarketerId) || {
            value: d.assignedDigitalMarketerId,
            label: d.assignedDigitalMarketerName,
          };
        setAssignDm(opt);
      }
      if (d.assignedCreativeStaffId) {
        const opt =
          csOptions.find((o) => o.value === d.assignedCreativeStaffId) || {
            value: d.assignedCreativeStaffId,
            label: d.assignedCreativeStaffName,
          };
        setAssignCs(opt);
      }
      setMsgDM(d.messageForDigitalMarketer || "");
      setMsgCS(d.messageForCreativeStaff || "");
      setUpdationReason(d.updationReason || "");
      if (d.approvedPublishingDate) {
        setOverridePublishingDate(String(d.approvedPublishingDate).slice(0, 10));
      }
    } catch {
      toast.error("Failed to load details");
    } finally {
      setPanelLoading(false);
    }
  };

  const closePanel = () => {
    setOpenId(null);
    setDetail(null);
  };

  const approve = async () => {
    if (!detail?._id) return;
    if (!assignDm?.value) {
      toast.error("Select a digital marketer");
      return;
    }
    if (isBlank(msgDM)) {
      toast.error("Message for the digital marketer is required");
      return;
    }
    if (assignCs?.value && isBlank(msgCS)) {
      toast.error("Message for creative staff is required if staff is selected");
      return;
    }
    if (!isBlank(overridePublishingDate) && !isValidISODate(overridePublishingDate)) {
      toast.error("Allowed Publishing Date must be valid");
      return;
    }
    if (!isBlank(overridePublishingDate) && isBlank(updationReason)) {
      toast.error("Updation Reason is required when override publishing date is set");
      return;
    }

    try {
      const payload = {
        digitalMarketerId: assignDm.value,
        creativeStaffId: assignCs?.value || undefined,
        publishingDate: !isBlank(overridePublishingDate) ? overridePublishingDate : undefined,
        messageForDigitalMarketer: msgDM.trim(),
        messageForCreativeStaff: !isBlank(msgCS) ? msgCS.trim() : undefined,
        updationReason: !isBlank(updationReason) ? updationReason.trim() : undefined,
      };
      await API.post(`/marketingManager/upload-requests/${detail._id}/approve`, payload);
      toast.success("Approved");
      closePanel();
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to approve";
      toast.error(msg);
    }
  };

  const reject = async () => {
    if (!detail?._id) return;
    if (isBlank(rejectReason)) {
      toast.error("Rejection reason is mandatory");
      return;
    }
    try {
      await API.post(`/marketingManager/upload-requests/${detail._id}/reject`, {
        reason: rejectReason.trim(),
        updationReason: !isBlank(updationReason) ? updationReason.trim() : undefined,
      });
      toast.success("Rejected");
      closePanel();
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to reject";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#222]">Upload Requests — Marketing</h2>

      {/* ---------- INLINE DECISION PANEL ---------- */}
      {openId && (
        <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Review & Decide</h3>
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
            (() => {
              const isFinalized =
                detail?.status === "approved" || detail?.status === "rejected";

              return (
                <>
                  {/* Row 1: Category / File name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Category">
                      <input
                        type="text"
                        readOnly
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                        value={detail.category || "—"}
                      />
                    </Field>

                    <Field label="File name">
                      <input
                        type="text"
                        readOnly
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                        value={detail.filename || "—"}
                      />
                    </Field>
                  </div>

                  {/* Row 2: Publishing Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Field label="Publishing Date">
                      <input
                        type="text"
                        readOnly
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                        value={formatDMY(detail.publishingDate)}
                      />
                    </Field>

                    <Field label="Allowed Publishing Date (optional)">
                      <input
                        type="date"
                        disabled={isFinalized}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                        value={overridePublishingDate}
                        onChange={(e) => setOverridePublishingDate(e.target.value)}
                      />
                    </Field>
                  </div>

                  {/* Sales Manager Info */}
                  <p className="text-sm text-gray-700 mt-2">
                    <b>Requested by:</b> {detail?.salesManagerName || "—"} &nbsp;•&nbsp;
                    <b>Unit:</b> {detail?.salesManagerUnitType || "—"} &nbsp;•&nbsp;
                    <b>Unit Name:</b> {detail?.salesManagerUnitName || "—"}
                  </p>

                  {/* Row 3: Assign DM + CS */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Assign Digital Marketer" required>
                      <Select
                        options={dmOptions}
                        value={assignDm}
                        onChange={setAssignDm}
                        placeholder="Select digital marketer"
                        styles={selectStyles}
                        isDisabled={isFinalized}
                      />
                    </Field>

                    <Field label="Assign Creative Staff">
                      <Select
                        options={csOptions}
                        value={assignCs}
                        onChange={setAssignCs}
                        isClearable
                        placeholder="Select creative staff"
                        styles={selectStyles}
                        isDisabled={isFinalized}
                      />
                    </Field>
                  </div>

                  {/* Row 4: Messages */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Message for Digital Marketer">
                      <textarea
                        rows={3}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                        value={msgDM}
                        onChange={(e) => setMsgDM(e.target.value)}
                        disabled={isFinalized}
                      />
                    </Field>
                    <Field label="Message for Creative Staff">
                      <textarea
                        rows={3}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                        value={msgCS}
                        onChange={(e) => setMsgCS(e.target.value)}
                        disabled={isFinalized}
                      />
                    </Field>
                  </div>

                  {/* Row 5: Rejection + Updation Reason */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Rejection Reason (only if rejecting)">
                      <textarea
                        rows={3}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        disabled={isFinalized}
                      />
                    </Field>
                    <Field label="Updation Reason">
                      <textarea
                        rows={3}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                        value={updationReason}
                        onChange={(e) => setUpdationReason(e.target.value)}
                        disabled={isFinalized}
                      />
                    </Field>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={approve}
                      disabled={isFinalized}
                      className="inline-flex items-center justify-center rounded-full bg-[#16a34a] text-white px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={reject}
                      disabled={isFinalized}
                      className="inline-flex items-center justify-center rounded-full bg-[#dc2626] text-white px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>

                  {isFinalized && (
                    <p className="text-sm text-gray-600 mt-3">
                      <b>Status:</b> {detail.status}
                      {detail.status === "rejected" && detail.rejectionReason
                        ? ` — ${detail.rejectionReason}`
                        : ""}
                    </p>
                  )}
                </>
              );
            })()
          )}
        </div>
      )}

      {/* ---------- FILTERS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Field label="Sales Manager (name/email)">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
            placeholder="e.g., Priya / priya@..."
            value={filterSalesManagerText}
            onChange={(e) => setFilterSalesManagerText(e.target.value)}
          />
        </Field>

        <Field label="Category">
          <Select
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
            isClearable
            placeholder="All categories"
            styles={selectStyles}
          />
        </Field>

        <Field label="Status">
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            isClearable
            placeholder="All statuses"
            styles={selectStyles}
          />
        </Field>

        <Field label="Publishing Date">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
            value={filterPublishingDate}
            onChange={(e) => setFilterPublishingDate(e.target.value)}
          />
        </Field>

        <Field label="Filename (contains)">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
            value={filterFilename}
            onChange={(e) => setFilterFilename(e.target.value)}
            placeholder="e.g., branch-jan"
          />
        </Field>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Sales Manager (Unit)</Th>
              <Th>Category</Th>
              <Th>File Name</Th>
              <Th>Publishing Date</Th>
              <Th>Allowed Publishing Date</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
                  No requests.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <Td>
                    {r.salesManagerName || "—"}
                    {r.salesManagerUnitName ? ` — ${r.salesManagerUnitName}` : ""}
                  </Td>
                  <Td>{r.category || "—"}</Td>
                  <Td>{r.filename || "—"}</Td>
                  <Td>{r.publishingDate ? formatDMY(r.publishingDate) : "—"}</Td>
                  <Td>{r.approvedPublishingDate ? formatDMY(r.approvedPublishingDate) : "—"}</Td>
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
                      {r.status}
                    </span>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => openPanel(r._id)}
                      title="Details / Decide"
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

      {/* ---------- PAGINATION ---------- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> •{" "}
          <span className="font-semibold">{total}</span> total
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={page <= 1 || loading}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
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
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
      {children}
    </th>
  );
}
function Td({ children }) {
  return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
}
