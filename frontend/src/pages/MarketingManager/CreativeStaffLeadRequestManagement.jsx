// src/pages/marketing/CreativeStaffLeadRequestManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import { toast } from "react-toastify";

export default function CreativeStaffLeadRequestManagement() {
  // table state
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters
  const [filterDestinationText, setFilterDestinationText] = useState("");
  const [filterCreativeStaffText, setFilterCreativeStaffText] = useState("");
  const frequencyOptions = useMemo(
    () => [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ],
    []
  );
  const statusOptions = [
    { value: "pending",  label: "Pending"  },
    { value: "waiting",  label: "Waiting"  },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];
  const [filterFrequency, setFilterFrequency] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDateWithin, setFilterDateWithin] = useState(""); // yyyy-mm-dd

  // panel state
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const pad = (n) => String(n).padStart(2, "0");
  const dmy = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };
  const isFinalized = (st) => st === "approved" || st === "rejected";

  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? "#8570EE" : "rgb(209,213,219)" },
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

  const buildQuery = (nextPage = page) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "10");
    if (filterDestinationText.trim()) params.set("destinationText", filterDestinationText.trim());
    if (filterCreativeStaffText.trim()) params.set("creativeStaffText", filterCreativeStaffText.trim());
    if (filterFrequency?.value) params.set("frequency", filterFrequency.value);
    if (filterStatus?.value) params.set("status", filterStatus.value);
    if (filterDateWithin) params.set("dateWithin", filterDateWithin);
    return params.toString();
  };

  const fetchList = async (nextPage = page) => {
    try {
      setLoading(true);
      const res = await API.get(`/marketingManager/creative-lead-requests?${buildQuery(nextPage)}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch {
      toast.error("Failed to load creative lead requests");
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
  }, [filterDestinationText, filterCreativeStaffText, filterFrequency, filterStatus, filterDateWithin]);

  const openPanel = async (id) => {
    setOpenId(id);
    setPanelLoading(true);
    setDetail(null);
    setRejectReason("");

    try {
      const res = await API.get(`/marketingManager/creative-lead-requests/${id}`);
      setDetail(res.data);
      setRejectReason(res.data.creativeRejectionReason || "");
    } catch {
      toast.error("Failed to load details");
    } finally {
      setPanelLoading(false);
    }
  };

  const closePanel = () => {
    setOpenId(null);
    setDetail(null);
    setRejectReason("");
  };

  const approve = async () => {
    if (!detail?._id) return;
    try {
      await API.post(`/marketingManager/creative-lead-requests/${detail._id}/approve`);
      toast.success("Creative status approved");
      closePanel();
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to approve";
      toast.error(msg);
    }
  };

  const reject = async () => {
    if (!detail?._id) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await API.post(`/marketingManager/creative-lead-requests/${detail._id}/reject`, {
        reason: rejectReason.trim(),
      });
      toast.success("Creative status rejected");
      closePanel();
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to reject";
      toast.error(msg);
    }
  };

  const handlePrev = () => page > 1 && fetchList(page - 1);
  const handleNext = () => page < totalPages && fetchList(page + 1);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#222]">Creative Staff — Lead Requests (Company-wide)</h2>

      {/* ---------- INLINE PANEL ---------- */}
      {openId && (
        <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Review for Creative Status</h3>
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
              {/* Row 1: Destination / Tour / Creative Staff */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Destination">
                  <input readOnly className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2" value={detail.destinationName || "—"} />
                </Field>
                <Field label="Tour (Group or Fixed)">
                  <input readOnly className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2" value={detail.tourRef || "—"} />
                </Field>
                <Field label="Start Date">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={dmy(detail.approvedStartDate || detail.startDate)}
                  />
                </Field>
                {/* <Field label="Creative Staff">
                  <input readOnly className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2" value={detail.creativeStaffName || "—"} />
                </Field> */}
              </div>

              {/* Row 2: Start / End / Qty (separate fields instead of Window) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                
                <Field label="End Date">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={dmy(detail.approvedEndDate || detail.endDate)}
                  />
                </Field>
                <Field label="Quantity">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={detail.approvedQuantity ?? detail.quantity ?? "—"}
                  />
                </Field>
                <Field label="Frequency">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={(detail.approvedFrequency || detail.frequency || "—").toString()}
                  />
                </Field>
              </div>

              {/* Row 3: Frequency & Current Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Creative Staff">
                  <input readOnly className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2" value={detail.creativeStaffName || "—"} />
                </Field>
                <Field label="Current Creative Status">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={detail.creativeStatus}
                  />
                </Field>
              </div>

              {/* Row 4: Message for Creative Staff */}
              <div className="mt-4">
                <Field label="Message for Creative Staff">
                  <textarea
                    readOnly
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-y"
                    value={detail.messageForCreativeStaff || ""}
                  />
                </Field>
              </div>

              {/* Row 5: Files horizontally */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Files</h4>
                {detail.fileNames?.length ? (
                  <div className="flex gap-2 overflow-x-auto py-1 pr-1">
                    {detail.fileNames.map((f, i) => (
                      <span
                        key={i}
                        className="whitespace-nowrap rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-800"
                        title={f}
                      >
                        {f || `File ${i + 1}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No files listed.</p>
                )}
              </div>

              {/* Row 6: Rejection reason */}
              <div className="mt-4">
                <Field label="Rejection Reason (required for rejection)">
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Give a clear reason for rejection"
                  />
                </Field>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={approve}
                  disabled={isFinalized(detail.creativeStatus)}
                  className="inline-flex items-center justify-center rounded-full bg-[#16a34a] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve
                </button>
                <button
                  onClick={reject}
                  disabled={isFinalized(detail.creativeStatus)}
                  className="inline-flex items-center justify-center rounded-full bg-[#dc2626] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------- FILTERS ---------- */}
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

        <Field label="Creative Staff (name/email)">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="e.g., Rahim / rahim@..."
            value={filterCreativeStaffText}
            onChange={(e) => setFilterCreativeStaffText(e.target.value)}
          />
        </Field>

        <Field label="Frequency">
          <Select
            options={frequencyOptions}
            value={filterFrequency}
            onChange={setFilterFrequency}
            isClearable
            placeholder="All"
            styles={selectStyles}
          />
        </Field>

        <Field label="Date within">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDateWithin}
            onChange={(e) => setFilterDateWithin(e.target.value)}
          />
        </Field>

        <Field label="Creative Status">
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            isClearable
            placeholder="All statuses"
            styles={selectStyles}
          />
        </Field>
      </div>

      {/* ---------- TABLE (separate Start/End columns) ---------- */}
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
              <Th>Creative Staff</Th>
              <Th>Status</Th>
              <Th>{/* open */}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={9}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={9}>No requests.</td>
              </tr>
            ) : (
              rows.map((r) => {
                const s = r.approvedStartDate || r.startDate;
                const e = r.approvedEndDate || r.endDate;
                let pillCls = "bg-gray-100 text-gray-800";
                if (r.creativeStatus === "waiting")  pillCls = "bg-indigo-100 text-indigo-800";
                if (r.creativeStatus === "approved") pillCls = "bg-green-100 text-green-800";
                if (r.creativeStatus === "rejected") pillCls = "bg-red-100 text-red-800";

                return (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <Td>{r.destinationName || "—"}</Td>
                    <Td>{r.tourRef || "—"}</Td>
                    <Td>{dmy(s)}</Td>
                    <Td>{dmy(e)}</Td>
                    <Td>{r.approvedQuantity ?? r.quantity ?? "—"}</Td>
                    <Td>{r.approvedFrequency ?? r.frequency ?? "—"}</Td>
                    <Td>{r.creativeStaffName || "—"}</Td>
                    <Td>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${pillCls}`}>
                        {r.creativeStatus}
                      </span>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => openPanel(r._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
                        title="Details / Decide"
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

      {/* ---------- PAGINATION ---------- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> •{" "}
          <span className="font-semibold">{total}</span> total
        </p>
        <div className="flex items-center gap-2">
          <button onClick={handlePrev} disabled={page <= 1 || loading} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button onClick={handleNext} disabled={page >= totalPages || loading} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
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
