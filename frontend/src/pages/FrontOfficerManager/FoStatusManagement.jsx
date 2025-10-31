import React, { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function FoStatusManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // per-row toggle spinner
  const [togglingId, setTogglingId] = useState(null);

  const fetchList = async (nextPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");

      const res = await API.get(`/frontOfficerManager/frontofficers?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load front officers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrev = () => page > 1 && fetchList(page - 1);
  const handleNext = () => page < totalPages && fetchList(page + 1);

  const toggleStatus = async (row) => {
    const id = row._id;
    const next = row.status === "Active" ? "Inactive" : "Active";

    try {
      setTogglingId(id);

      // optimistic update
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: next } : r))
      );

      await API.patch(`/frontOfficerManager/frontofficers/${id}/status`, { status: next });
      toast.success(`Status updated to ${next}`);
    } catch (e) {
      // revert on error
      setRows((prev) =>
        prev.map((r) =>
          r._id === row._id ? { ...r, status: row.status } : r
        )
      );
      toast.error(e?.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* <h2 className="text-xl font-semibold text-[#222]">Front Officer Status</h2> */}

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Name</Th>
              <Th>Contact Number</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>{/* actions */}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                  No front officers found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <Td className="font-medium">{r.name || "—"}</Td>
                  <Td>{r.contactNumber || "—"}</Td>
                  <Td>{r.email || "—"}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        r.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </Td>
                  <Td>
                    <Toggle
                      checked={r.status === "Active"}
                      onChange={() => toggleStatus(r)}
                      disabled={togglingId === r._id}
                    />
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

/** Minimal green toggle with accessible button semantics */
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-green-500" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
      aria-pressed={checked}
      aria-label="Toggle status"
      title={checked ? "Set Inactive" : "Set Active"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
