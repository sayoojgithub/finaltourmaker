// src/pages/digital/DigitalMarketerLeadRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import { toast } from "react-toastify";

export default function DigitalMarketerLeadRequests() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters
  const [filterDestinationText, setFilterDestinationText] = useState("");
  const [filterCampaignNameText, setFilterCampaignNameText] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];
  const [filterFrequency, setFilterFrequency] = useState(null);
  const postStatusOptions = [
    { value: "not-posted-yet", label: "Not posted yet" },
    { value: "posted", label: "Posted" },
  ];
  const [filterPostStatus, setFilterPostStatus] = useState(null);

  // panel
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  const pad = (n) => String(n).padStart(2, "0");
  const formatDMY = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };
  const formatDMYHM = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const selectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base, borderRadius: 12,
      borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
      minHeight: 44, backgroundColor: "white",
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
      backgroundColor: s.isFocused ? "rgba(133,112,238,0.08)"
        : s.isSelected ? "rgba(133,112,238,0.16)" : "white",
      color: "#222", ":active": { backgroundColor: "rgba(133,112,238,0.16)" },
    }),
  }), []);

  const buildQuery = (nextPage = page) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "10");
    if (filterDestinationText.trim()) params.set("destinationText", filterDestinationText.trim());
    if (filterCampaignNameText.trim()) params.set("campaignNameText", filterCampaignNameText.trim());
    if (filterDateFrom) params.set("dateFrom", filterDateFrom);
    if (filterDateTo) params.set("dateTo", filterDateTo);
    if (filterFrequency?.value) params.set("frequency", filterFrequency.value);
    if (filterPostStatus?.value) params.set("postStatus", filterPostStatus.value);
    return params.toString();
  };

  const fetchList = async (nextPage = page) => {
    try {
      setLoading(true);
      const res = await API.get(`/digitalMarketer/lead-requests?${buildQuery(nextPage)}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch {
      toast.error("Failed to load lead requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(1); /* eslint-disable-next-line */ }, []);
  useEffect(() => { fetchList(1); /* eslint-disable-next-line */ },
    [filterDestinationText, filterCampaignNameText, filterDateFrom, filterDateTo, filterFrequency, filterPostStatus]
  );

  const openPanel = async (id) => {
    setOpenId(id);
    setPanelLoading(true);
    setDetail(null);
    try {
      const res = await API.get(`/digitalMarketer/lead-requests/${id}`);
      setDetail(res.data);
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

  const markDone = async () => {
    if (!detail?._id) return;
    try {
      await API.post(`/digitalMarketer/lead-requests/${detail._id}/mark-posted`);
      toast.success("Marked as posted");
      closePanel();
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to mark as posted";
      toast.error(msg);
    }
  };

  const handlePrev = () => page > 1 && fetchList(page - 1);
  const handleNext = () => page < totalPages && fetchList(page + 1);

  // Ad data renderer using snapshot labels when available
  const renderAdData = (snapshot, data) => {
    if (!data || typeof data !== "object") return <p className="text-sm text-gray-600">No ad data.</p>;
    const labelMap = {};
    if (snapshot?.fields?.length) {
      snapshot.fields.forEach(f => { if (f?.key) labelMap[f.key] = f.label || f.key; });
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 mb-1">{labelMap[k] || k}</div>
            <div className="text-sm text-gray-800 break-words">{String(v)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#222]">Digital Marketer — Lead Requests</h2>

      {/* ---------- INLINE PANEL (moved ABOVE filters & table) ---------- */}
      {openId && (
        <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Lead Request</h3>
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
              {/* Row 1: Destination / Campaign */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Destination">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={detail.destinationName || "—"}
                  />
                </Field>
                <Field label="Campaign">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={detail.campaignName || "—"}
                  />
                </Field>
              </div>

              {/* Row 2: Start / End */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Start Date">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={formatDMY(detail.approvedStartDate || detail.startDate)}
                  />
                </Field>
                <Field label="End Date">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={formatDMY(detail.approvedEndDate || detail.endDate)}
                  />
                </Field>
              </div>

              {/* Row 3: Quantity / Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 capitalize"
                    value={detail.frequency || "—"}
                  />
                </Field>
              </div>

              {/* Row 4: Message for DM (FULL WIDTH) */}
              <div className="mt-4">
                <Field label="Message for Digital Marketer">
                  <textarea
                    readOnly
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-y"
                    value={detail.messageForDigitalMarketer || ""}
                  />
                </Field>
              </div>

              {/* Row 5: Files (BELOW message, FULL WIDTH) */}
              <div className="mt-4">
                <Field label="Files">
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
                </Field>
              </div>

              {/* Ad details */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Ad Details</h4>
                <div className="rounded-2xl border border-gray-200 p-4 bg-white">
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500">Ad Category</div>
                    <div className="text-sm text-gray-900">
                      {detail.adCategorySnapshot?.name || "—"}
                    </div>
                    {detail.adCategorySnapshot?.description && (
                      <div className="text-xs text-gray-600">{detail.adCategorySnapshot.description}</div>
                    )}
                  </div>
                  {renderAdData(detail.adCategorySnapshot, detail.adData)}
                </div>
              </div>

              {/* Post status */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Post Status">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={detail.dmPostStatus ? "Posted" : "Not posted yet"}
                  />
                </Field>
                <Field label="Posted At">
                  <input
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                    value={formatDMYHM(detail.dmPostedAt)}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={markDone}
                  disabled={detail.dmPostStatus}
                  className="inline-flex items-center justify-center rounded-full bg-[#16a34a] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Done (Mark as Posted)
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------- FILTERS (exactly above the table) ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Field label="Destination">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="Search destination"
            value={filterDestinationText}
            onChange={(e) => setFilterDestinationText(e.target.value)}
          />
        </Field>

        <Field label="Campaign name">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="e.g., Diwali Promo"
            value={filterCampaignNameText}
            onChange={(e) => setFilterCampaignNameText(e.target.value)}
          />
        </Field>

        <Field label="From date">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </Field>

        <Field label="To date">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
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

        <Field label="Post Status">
          <Select
            options={postStatusOptions}
            value={filterPostStatus}
            onChange={setFilterPostStatus}
            isClearable
            placeholder="All"
            styles={selectStyles}
          />
        </Field>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Destination</Th>
              <Th>Campaign</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Quantity</Th>
              <Th>Frequency</Th>
              <Th>Status</Th>
              <Th>Posted At</Th>
              <Th>{/* open */}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={9}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={9}>No requests.</td></tr>
            ) : (
              rows.map((r) => {
                const start = r.approvedStartDate || r.startDate;
                const end   = r.approvedEndDate   || r.endDate;
                const qty   = r.approvedQuantity ?? r.quantity ?? "—";
                const statusText = r.dmPostStatus ? "Posted" : "Not posted yet";
                const pillCls = r.dmPostStatus
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800";

                return (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <Td>{r.destinationName || "—"}</Td>
                    <Td>{r.campaignName || "—"}</Td>
                    <Td>{formatDMY(start)}</Td>
                    <Td>{formatDMY(end)}</Td>
                    <Td>{qty}</Td>
                    <Td className="capitalize">{r.frequency || "—"}</Td>
                    <Td>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${pillCls}`}>
                        {statusText}
                      </span>
                    </Td>
                    <Td>{formatDMYHM(r.dmPostedAt)}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => openPanel(r._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
                        title="Details / Mark as Posted"
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
