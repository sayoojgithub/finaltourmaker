// src/pages/entry/SearchClient.jsx
import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function SearchClient() {
  const [rows, setRows] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterName, setFilterName] = useState("");           // (kept for convenience, not indexed)
  const [filterMobile, setFilterMobile] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");   // yyyy-mm-dd
  const [filterDateTo, setFilterDateTo] = useState("");       // yyyy-mm-dd

  // Debounce mirrors
  const [debounceName, setDebounceName] = useState(filterName);
  const [debounceMobile, setDebounceMobile] = useState(filterMobile);
  const [debounceDestination, setDebounceDestination] = useState(filterDestination);
  const [debounceDateFrom, setDebounceDateFrom] = useState(filterDateFrom);
  const [debounceDateTo, setDebounceDateTo] = useState(filterDateTo);

  // Date helpers
  const pad = (n) => String(n).padStart(2, "0");
  const formatDMY = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };
  const formatHMS = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const fetchClients = async (
    nextPage = page,
    opts = {
      nameQ: debounceName,
      mobileQ: debounceMobile,
      destinationQ: debounceDestination,
      dateFromQ: debounceDateFrom,
      dateToQ: debounceDateTo
    }
  ) => {
    try {
      setLoadingTable(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");

      if (opts.nameQ?.trim()) params.set("name", opts.nameQ.trim());
      if (opts.mobileQ?.trim()) params.set("mobile", opts.mobileQ.trim());
      if (opts.destinationQ?.trim()) params.set("destination", opts.destinationQ.trim());
      if (opts.dateFromQ) params.set("dateFrom", opts.dateFromQ);
      if (opts.dateToQ) params.set("dateTo", opts.dateToQ);

      const res = await API.get(`/entry/clients?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch (e) {
      toast.error("Failed to load clients");
    } finally {
      setLoadingTable(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchClients(1, { nameQ: "", mobileQ: "", destinationQ: "", dateFromQ: "", dateToQ: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce text inputs (300ms). Dates usually don't need debounce but we keep it consistent.
  useEffect(() => {
    const t = setTimeout(() => setDebounceName(filterName), 300);
    return () => clearTimeout(t);
  }, [filterName]);

  useEffect(() => {
    const t = setTimeout(() => setDebounceMobile(filterMobile), 300);
    return () => clearTimeout(t);
  }, [filterMobile]);

  useEffect(() => {
    const t = setTimeout(() => setDebounceDestination(filterDestination), 300);
    return () => clearTimeout(t);
  }, [filterDestination]);

  useEffect(() => {
    const t = setTimeout(() => setDebounceDateFrom(filterDateFrom), 150);
    return () => clearTimeout(t);
  }, [filterDateFrom]);

  useEffect(() => {
    const t = setTimeout(() => setDebounceDateTo(filterDateTo), 150);
    return () => clearTimeout(t);
  }, [filterDateTo]);

  // Refetch when any debounced filter changes
  useEffect(() => {
    fetchClients(1, {
      nameQ: debounceName,
      mobileQ: debounceMobile,
      destinationQ: debounceDestination,
      dateFromQ: debounceDateFrom,
      dateToQ: debounceDateTo
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceName, debounceMobile, debounceDestination, debounceDateFrom, debounceDateTo]);

  const handlePrev = () => page > 1 && fetchClients(page - 1);
  const handleNext = () => page < totalPages && fetchClients(page + 1);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Field label="Filter by Name">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="e.g., John"
          />
        </Field>

        <Field label="Filter by Mobile">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterMobile}
            onChange={(e) => setFilterMobile(e.target.value)}
            placeholder="starts with…"
            inputMode="numeric"
          />
        </Field>

        <Field label="Filter by Destination">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterDestination}
            onChange={(e) => setFilterDestination(e.target.value)}
            placeholder="e.g., Bali"
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

        <div className="md:col-span-5 flex items-end">
          <button
            onClick={() => {
              setFilterName("");
              setFilterMobile("");
              setFilterDestination("");
              setFilterDateFrom("");
              setFilterDateTo("");
              fetchClients(1, { nameQ: "", mobileQ: "", destinationQ: "", dateFromQ: "", dateToQ: "" });
            }}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Name</Th>
              <Th>Mobile</Th>
              <Th>Destination</Th>
              <Th>Created Date</Th>
              <Th>Created Time</Th>
              <Th>Front Office Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loadingTable ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                  No clients found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <Td>{r.name || "—"}</Td>
                  <Td>{r.mobileNumber || "—"}</Td>
                  <Td>{r.destination || "—"}</Td>
                  <Td>{formatDMY(r.createdAt)}</Td>
                  <Td>{formatHMS(r.createdAt)}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        r.frontOfficeCreatedStatus
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {r.frontOfficeCreatedStatus ? "Created" : "Pending"}
                    </span>
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
