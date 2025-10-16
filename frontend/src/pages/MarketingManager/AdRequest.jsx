import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function AdRequest() {
  // table state
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters (destination removed)
  const [filterSalesManagerText, setFilterSalesManagerText] = useState("");
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
  const statusOptions = [
    { value: "processing", label: "Processing" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];
  const [filterTask, setFilterTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDate, setFilterDate] = useState("");

  // inline decision panel state
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  // DM + Creative Staff lists for assignment + overrides
  const [dmOptions, setDmOptions] = useState([]);
  const [csOptions, setCsOptions] = useState([]);             // NEW
  const [assignDm, setAssignDm] = useState(null);
  const [assignCs, setAssignCs] = useState(null);             // NEW
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideQty, setOverrideQty] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // NEW fields
  const [campaignName, setCampaignName] = useState("");       // NEW
  const [msgDM, setMsgDM] = useState("");                     // NEW
  const [msgCS, setMsgCS] = useState("");                     // NEW
  const [updationReason, setUpdationReason] = useState("");   // NEW

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
      valueContainer: (b) => ({ ...b, padding: "0 12px" }),
      input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
      dropdownIndicator: (b) => ({ ...b, color: "#6b7280", ":hover": { color: "#4b5563" } }),
      menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden" }),
      option: (b, s) => ({
        ...b,
        backgroundColor: s.isFocused
          ? "rgba(133,112,238,0.08)"
          : s.isSelected
          ? "rgba(133,112,238,0.16)"
          : "white",
        color: "#222",
        ":active": { backgroundColor: "rgba(133,112,238,0.16)" },
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
      if (filterSalesManagerText.trim()) params.set("salesManagerText", filterSalesManagerText.trim());
      if (filterTask?.value) params.set("task", filterTask.value);
      if (filterStatus?.value) params.set("status", filterStatus.value);
      if (filterDate) params.set("date", filterDate);

      const res = await API.get(`/marketingManager/ad-requests?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch {
      toast.error("Failed to load ad requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    fetchDMs();
    fetchCS(); // NEW
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSalesManagerText, filterTask, filterStatus, filterDate]);

  const handlePrev = () => page > 1 && fetchList(page - 1);
  const handleNext = () => page < totalPages && fetchList(page + 1);

  const openPanel = async (id) => {
    setOpenId(id);
    setPanelLoading(true);
    setDetail(null);
    setAssignDm(null);
    setAssignCs(null);         // NEW
    setCampaignName("");       // NEW
    setMsgDM("");              // NEW
    setMsgCS("");              // NEW
    setOverrideDate("");
    setOverrideQty("");
    setRejectReason("");
    setUpdationReason("");     // NEW

    try {
      const res = await API.get(`/marketingManager/ad-requests/${id}`);
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

      // NEW: prefill creative staff
      if (d.assignedCreativeStaffId) {
        const opt =
          csOptions.find((o) => o.value === d.assignedCreativeStaffId) || {
            value: d.assignedCreativeStaffId,
            label: d.assignedCreativeStaffName,
          };
        setAssignCs(opt);
      }

      // NEW: prefill campaign + messages + updation
      setCampaignName(d.campaignName || "");
      setMsgDM(d.messageForDigitalMarketer || "");
      setMsgCS(d.messageForCreativeStaff || "");
      setUpdationReason(d.updationReason || "");

      if (d.approvedDate) setOverrideDate(String(d.approvedDate).slice(0, 10));
      if (d.approvedQuantity) setOverrideQty(String(d.approvedQuantity));
    } catch {
      toast.error("Failed to load details");
    } finally {
      setPanelLoading(false);
    }
  };

  const closePanel = () => {
    setOpenId(null);
    setDetail(null);
    setAssignDm(null);
    setAssignCs(null);           // NEW
    setCampaignName("");         // NEW
    setMsgDM("");                // NEW
    setMsgCS("");                // NEW
    setOverrideDate("");
    setOverrideQty("");
    setRejectReason("");
    setUpdationReason("");       // NEW
  };
  const isBlank = (s) => !s || !String(s).trim();
const isValidISODate = (s) => {
  if (isBlank(s)) return false;
  // Accepts yyyy-mm-dd from <input type="date">
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(s);
};
const isPositiveInt = (v) => {
  if (isBlank(v)) return false;
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
};


  // const approve = async () => {
  //   if (!detail?._id) return;
  //   if (!assignDm?.value) {
  //     toast.error("Select a digital marketer");
  //     return;
  //   }
  //   try {
  //     const payload = {
  //       digitalMarketerId: assignDm.value,
  //       creativeStaffId: assignCs?.value || undefined,           // NEW
  //       date: overrideDate || undefined,
  //       quantity: overrideQty ? Number(overrideQty) : undefined,
  //       campaignName: campaignName || undefined,                 // NEW
  //       messageForDigitalMarketer: msgDM || undefined,           // NEW
  //       messageForCreativeStaff: msgCS || undefined,             // NEW
  //       updationReason: updationReason || undefined,
  //     };
  //     await API.post(`/marketingManager/ad-requests/${detail._id}/approve`, payload);
  //     toast.success("Approved");
  //     closePanel();
  //     fetchList(page);
  //   } catch (e) {
  //     const msg = e?.response?.data?.message || "Failed to approve";
  //     toast.error(msg);
  //   }
  // };

  // const reject = async () => {
  //   if (!detail?._id) return;
  //   if (!rejectReason.trim()) {
  //     toast.error("Please enter a rejection reason");
  //     return;
  //   }
  //   try {
  //     await API.post(`/marketingManager/ad-requests/${detail._id}/reject`, {
  //       reason: rejectReason.trim(),
  //       updationReason: updationReason.trim() || undefined, // NEW
  //     });
  //     toast.success("Rejected");
  //     closePanel();
  //     fetchList(page);
  //   } catch (e) {
  //     const msg = e?.response?.data?.message || "Failed to reject";
  //     toast.error(msg);
  //   }
  // };
  const approve = async () => {
  if (!detail?._id) return;

  // --- REQUIRED: Digital Marketer
  if (!assignDm?.value) {
    toast.error("Select a digital marketer");
    return;
  }
  // --- REQUIRED: Message for Digital Marketer
  if (isBlank(msgDM)) {
    toast.error("Message for the digital marketer is required");
    return;
  }
  // --- CONDITIONAL: If Creative Staff selected, message for Creative Staff required
  if (assignCs?.value && isBlank(msgCS)) {
  toast.error("Message for creative staff is required if staff is selected");
    return;
  }
  // --- Validate optional Allowed Date
  if (!isBlank(overrideDate) && !isValidISODate(overrideDate)) {
    toast.error("Allowed Date must be a valid date");
    return;
  }
  // --- Validate optional Allowed Quantity
  if (!isBlank(overrideQty) && !isPositiveInt(overrideQty)) {
    toast.error("Allowed Quantity must be a positive whole number");
    return;
  }
  // --- CONDITIONAL: If Allowed Date OR Allowed Quantity provided -> Updation Reason required
  const providedOverride = !isBlank(overrideDate) || !isBlank(overrideQty);
  if (providedOverride && isBlank(updationReason)) {
    toast.error("Updation Reason is required when Allowed Date or Allowed Quantity is set");
    return;
  }

  try {
    const payload = {
      digitalMarketerId: assignDm.value,
      creativeStaffId: assignCs?.value || undefined,
      date: !isBlank(overrideDate) ? overrideDate : undefined,
      quantity: !isBlank(overrideQty) ? Number(overrideQty) : undefined,
      campaignName: !isBlank(campaignName) ? campaignName : undefined,
      messageForDigitalMarketer: msgDM.trim(),
      messageForCreativeStaff: !isBlank(msgCS) ? msgCS.trim() : undefined,
      updationReason: !isBlank(updationReason) ? updationReason.trim() : undefined,
    };

    await API.post(`/marketingManager/ad-requests/${detail._id}/approve`, payload);
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
    await API.post(`/marketingManager/ad-requests/${detail._id}/reject`, {
      reason: rejectReason.trim(),
      // Not required by your rules, but we’ll pass if provided:
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
      <h2 className="text-xl font-semibold text-[#222]">Ad Requests — Marketing</h2>

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
            <>
              {/* Row 1: Destination / Task */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Destination">
                  <input
                    type="text"
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                    value={detail.destinationName || "—"}
                  />
                </Field>

                <Field label="Task">
                  <input
                    type="text"
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                    value={detail.task || "—"}
                  />
                </Field>
              </div>

              {/* Row 2: Dates & Qty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Publishing Date">
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                      value={formatDMY(detail.date)}
                    />
                  </Field>
                  <Field label="Allowed Publishing Date (optional)">
                    <input
                      type="date"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Quantity">
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                      value={detail.quantity ?? "—"}
                    />
                  </Field>
                  <Field label="Allowed Quantity (optional)">
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                      value={overrideQty}
                      onChange={(e) => setOverrideQty(e.target.value)}
                      placeholder="e.g., 10"
                    />
                  </Field>
                </div>
              </div>

              {/* Row 3: Details */}
              <div className="mt-4">
                <Field label="Details">
                  <textarea
                    readOnly
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 resize-y"
                    value={detail.details || ""}
                  />
                </Field>
              </div>

              {/* Sales Manager & Unit — BELOW Details as plain text */}
              <p className="text-sm text-gray-700 mt-2">
                <b>Requested by:</b> {detail?.salesManagerName || "—"} &nbsp;•&nbsp;
                <b>Unit:</b> {detail?.salesManagerUnitType || "—"} &nbsp;•&nbsp;
                <b>Unit Name:</b> {detail?.salesManagerUnitName || "—"}
              </p>

              {/* Row 4: Assign DM + Creative Staff + Campaign Name (same row) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Assign Digital Marketer" required>
                  <Select
                    options={dmOptions}
                    value={assignDm}
                    onChange={setAssignDm}
                    placeholder="Select digital marketer"
                    styles={selectStyles}
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
                  />
                </Field>

                {/* <Field label="Campaign Name">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Summer Splash 2025"
                  />
                </Field> */}
              </div>

              {/* Row 5: Messages (DM + Creative) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Message for Digital Marketer">
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
                    value={msgDM}
                    onChange={(e) => setMsgDM(e.target.value)}
                    placeholder="Instructions for the digital marketer"
                  />
                </Field>

                <Field label="Message for Creative Staff">
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
                    value={msgCS}
                    onChange={(e) => setMsgCS(e.target.value)}
                    placeholder="Instructions for the creative staff"
                  />
                </Field>
              </div>

              {/* Row 6: Rejection + Updation Reasons (same row) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Rejection Reason (only if rejecting)">
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this request is rejected"
                  />
                </Field>

                <Field label="Updation Reason">
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
                    value={updationReason}
                    onChange={(e) => setUpdationReason(e.target.value)}
                    placeholder="Describe what/why was updated"
                  />
                </Field>
              </div>

              {/* Actions (centered) */}
            {/* Actions (centered) */}
{(() => {
  const isFinalized =
    detail?.status === "approved" || detail?.status === "rejected";

  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        onClick={approve}
        disabled={isFinalized}
        className="inline-flex items-center justify-center rounded-full bg-[#16a34a] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Approve
      </button>
      <button
        onClick={reject}
        disabled={isFinalized}
        className="inline-flex items-center justify-center rounded-full bg-[#dc2626] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reject
      </button>
    </div>
  );
})()}


              {detail.status !== "processing" && (
                <p className="text-sm text-gray-600 mt-3">
                  <b>Status:</b> {detail.status}
                  {detail.status === "rejected" && detail.rejectionReason
                    ? ` — ${detail.rejectionReason}`
                    : ""}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ---------- FILTERS (destination removed) ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Sales Manager (name/email)">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="e.g., Priya / priya@..."
            value={filterSalesManagerText}
            onChange={(e) => setFilterSalesManagerText(e.target.value)}
          />
        </Field>

        <Field label="Task">
          <Select
            options={taskOptions}
            value={filterTask}
            onChange={setFilterTask}
            isClearable
            placeholder="All tasks"
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
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </Field>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Sales Manager (Unit)</Th>
              <Th>Destination</Th>
              <Th>Task</Th>
              <Th>Publishing Date</Th>
              <Th>Allowed Publishing Date</Th>
              <Th>Quantity</Th>
              <Th>Allowed Quantity</Th>
              <Th>Status</Th>
              <Th>{/* actions */}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={9}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={9}>
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
                  <Td>{r.destinationName || "—"}</Td>
                  <Td>{r.task}</Td>
                  <Td>{formatDMY(r.date)}</Td>
                  <Td>{r.approvedDate ? formatDMY(r.approvedDate) : "—"}</Td>
                  <Td>{r.quantity}</Td>
                  <Td>{r.approvedQuantity ?? "—"}</Td>
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
