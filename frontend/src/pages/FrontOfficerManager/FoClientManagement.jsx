import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function FoClientManagement() {
  // Frontofficers (from & to)
  const [foOptions, setFoOptions] = useState([]);
  const [fromFO, setFromFO] = useState(null); // the FO whose pending clients we view
  const [toFO, setToFO] = useState(null);     // target FO for reassignment

  // Filters
  const [filterMobile, setFilterMobile] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Table data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false); // select all filtered (across pages)
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
  const formatTimeHM = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const fetchFOs = async () => {
    try {
      // fetch many to fill both dropdowns
      const res = await API.get("/frontOfficerManager/frontofficers?page=1&limit=200");
      const opts = (res.data?.docs || []).map((d) => ({
        value: d._id,
        label: d.name || d.email || d.contactNumber,
      }));
      setFoOptions(opts);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load front officers");
    }
  };

  const fetchClients = async (nextPage = 1) => {
    if (!fromFO?.value) {
      setRows([]);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("frontOfficerId", fromFO.value);
      params.set("page", String(nextPage));
      params.set("limit", "7"); // backend pagination limit
      if (filterMobile.trim()) params.set("mobileNumber", filterMobile.trim());
      if (filterDestination.trim()) params.set("destinationText", filterDestination.trim());
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);

      const res = await API.get(`/frontOfficerManager/fo-clients?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);

      // If not in select-all mode, keep only selected visible rows
      if (!selectAll) {
        const newSet = new Set(docs.filter(x => selectedIds.has(x._id)).map(x => x._id));
        setSelectedIds(newSet);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFOs();
  }, []);

  // Load first page when FO changes
  useEffect(() => {
    setSelectAll(false);
    setSelectedIds(new Set());
    fetchClients(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromFO]);

  // Re-fetch when filters change
  useEffect(() => {
    if (fromFO?.value) fetchClients(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMobile, filterDestination, filterDateFrom, filterDateTo]);

  const handlePrev = () => page > 1 && fetchClients(page - 1);
  const handleNext = () => page < totalPages && fetchClients(page + 1);

  // Selection handlers
  const toggleRow = (id) => {
    if (selectAll) return; // when select-all, disable per-row for clarity
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    if (selectAll) return;
    const allIds = rows.map((r) => r._id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach((id) => next.delete(id));
      } else {
        allIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const activateSelectAllFiltered = () => {
    if (!fromFO?.value) {
      toast.error("Select a front officer first");
      return;
    }
    setSelectedIds(new Set());
    setSelectAll(true);
    toast.success("All filtered clients are selected (across pages).");
  };

  const clearSelection = () => {
    setSelectAll(false);
    setSelectedIds(new Set());
  };

  const canReassign =
    fromFO?.value &&
    toFO?.value &&
    (selectAll || selectedIds.size > 0) &&
    toFO.value !== fromFO.value &&
    !submitting;

  const doReassign = async () => {
    if (!canReassign) return;
    try {
      setSubmitting(true);
      const body = {
        fromFrontOfficerId: fromFO.value,
        toFrontOfficerId: toFO.value,
        selectAll,
        clientIds: selectAll ? undefined : Array.from(selectedIds),
        filters: {
          mobileNumber: filterMobile.trim() || undefined,
          destinationText: filterDestination.trim() || undefined,
          dateFrom: filterDateFrom || undefined,
          dateTo: filterDateTo || undefined,
        },
      };
      const res = await API.post("/frontOfficerManager/fo-clients/reassign", body);
      const moved = res.data?.modified || 0;
      toast.success(`Reassigned ${moved} client${moved === 1 ? "" : "s"}.`);
      clearSelection();
      fetchClients(page); // refresh current page
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to reassign clients");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* <h2 className="text-xl font-semibold text-[#222]">Frontoffice Client Management</h2> */}

      {/* Pick the source FO (whose pending clients we view) and the target FO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Front Officer">
          <Select
            options={foOptions}
            value={fromFO}
            onChange={setFromFO}
            placeholder="Select front officer"
            styles={selectStyles}
          />
        </Field>
        <Field label="Reassign To">
          <Select
            options={foOptions}
            value={toFO}
            onChange={setToFO}
            placeholder="Select another front officer"
            styles={selectStyles}
          />
        </Field>
        <div className="flex items-end gap-2">
          <button
            className="rounded-full bg-[#16a34a] text-white px-5 py-2 font-semibold disabled:opacity-50"
            disabled={!canReassign}
            onClick={doReassign}
          >
            Reassign Selected
          </button>
          {selectAll ? (
            <button className="rounded-full border px-4 py-2" onClick={clearSelection}>
              Clear selection
            </button>
          ) : (
            <button
              className="rounded-full border px-4 py-2 disabled:opacity-50"
              disabled={!fromFO?.value || total === 0}
              onClick={activateSelectAllFiltered}
              title="Select all filtered results across all pages"
            >
              Select all ({total})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Mobile">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterMobile}
            onChange={(e) => setFilterMobile(e.target.value)}
            placeholder="10–15 digits / partial"
          />
        </Field>
        <Field label="Primary Destination">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDestination}
            onChange={(e) => setFilterDestination(e.target.value)}
            placeholder="e.g., Dubai"
          />
        </Field>
        <Field label="Created From">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </Field>
        <Field label="Created To">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </Field>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={selectAll || rows.length === 0}
                    onChange={toggleSelectAllPage}
                    checked={
                      !selectAll &&
                      rows.length > 0 &&
                      rows.every((r) => selectedIds.has(r._id))
                    }
                  />
                  Select
                </div>
              </Th>
              <Th>Name</Th>
              <Th>Mobile</Th>
              <Th>Destination</Th>
              <Th>Created Date</Th>
              <Th>Created Time</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : !fromFO?.value ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                  Select a front officer to view pending clients.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                  No pending clients.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const isSelected = selectAll || selectedIds.has(r._id);
                return (
                  <tr
                    key={r._id}
                    className={`hover:bg-gray-50 ${isSelected ? "bg-green-50" : ""}`}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        {/* green dot when selected */}
                        <span
                          className={`inline-block h-3 w-3 rounded-full ${
                            isSelected ? "bg-green-500" : "bg-gray-300"
                          }`}
                          title={isSelected ? "Selected" : "Not selected"}
                        />
                        <input
                          type="checkbox"
                          disabled={selectAll}
                          checked={isSelected}
                          onChange={() => toggleRow(r._id)}
                        />
                      </div>
                    </Td>
                    <Td className="font-medium">{r.name || "—"}</Td>
                    <Td>{r.mobileNumber || "—"}</Td>
                    <Td>{r.primaryDestination || "—"}</Td>
                    <Td>{formatDMY(r.createdAtByEntry) }</Td>
                    <Td>{formatTimeHM(r.createdAtByEntry)}</Td>
                  </tr>
                );
              })
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
function Td({ children, className = "" }) {
  return <td className={`px-6 py-4 text-sm text-gray-800 ${className}`}>{children}</td>;
}
