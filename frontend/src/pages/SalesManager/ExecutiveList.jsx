// src/pages/salesManager/ExecutiveList.jsx
import React, { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";

export default function ExecutiveList({ onOpen }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState("");

  const fetchList = async (nextPage = page, q = search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");
      if (q?.trim()) params.set("search", q.trim());

      const res = await API.get(`/salesManager/executives?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load executives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // small debounce for typing -> search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(typing);
      fetchList(1, typing);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing]);

  const handlePrev = () => page > 1 && fetchList(page - 1, search);
  const handleNext = () => page < totalPages && fetchList(page + 1, search);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <label className="block">
            <span className="block text-sm font-medium text-[#222] mb-1">Search by name</span>
            <input
              type="text"
              value={typing}
              onChange={(e) => setTyping(e.target.value)}
              placeholder="Type a name…"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Name</Th>
              <Th>Contact Number</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>{/* pencil */}</Th>
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
                  No executives found.
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
                    <button
                      type="button"
                      onClick={() => onOpen(r._id)}
                      title="Open"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
                    >
                      <Pencil size={16} />
                    </button>
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
