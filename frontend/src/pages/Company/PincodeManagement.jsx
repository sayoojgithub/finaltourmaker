// src/pages/company/PincodeManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import API from "../../api";

const PAGE_SIZE = 2;

export default function PincodeManagement({ onOpenTarget }) {
  const [mode, setMode] = useState("branch"); // 'branch' | 'franchisee'
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const url =
      mode === "branch"
        ? `/company/branches?search=${encodeURIComponent(search)}&page=${page}&limit=${PAGE_SIZE}`
        : `/company/franchisees?search=${encodeURIComponent(search)}&page=${page}&limit=${PAGE_SIZE}`;

    API.get(url)
      .then(({ data }) => {
        if (!isMounted) return;
        setRows(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {
        if (!isMounted) return;
        setRows([]);
        setTotal(0);
      })
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [mode, search, page]);

  return (
    <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
      {/* Centered selector styled like Active/Inactive radios */}
      <div className="w-full flex justify-center mt-1 mb-5">
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-black font-medium cursor-pointer select-none">
            <input
              type="radio"
              name="mode"
              value="branch"
              checked={mode === "branch"}
              onChange={() => { setMode("branch"); setPage(1); }}
              className="accent-purple-500"
            />
            <span>Branch</span>
          </label>
          <label className="flex items-center gap-2 text-black font-medium cursor-pointer select-none">
            <input
              type="radio"
              name="mode"
              value="franchisee"
              checked={mode === "franchisee"}
              onChange={() => { setMode("franchisee"); setPage(1); }}
              className="accent-purple-500"
            />
            <span>Franchisee</span>
          </label>
        </div>
      </div>

      {/* Search input (same feel as CreateBranch) */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={mode === "branch" ? "Search by Branch Name" : "Search by Franchisee Name"}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Table styled exactly like CreateBranch */}
      <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-4">Sl No</th>
            <th className="px-6 py-4">{mode === "branch" ? "Branch Name" : "Franchisee Name"}</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Contact Number</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="px-6 py-6" colSpan={6}>Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td className="px-6 py-6" colSpan={6}>No records</td></tr>
          ) : (
            rows.map((row, idx) => {
              const name = mode === "branch" ? row.branchName : row.franchiseeName;
              const isActive = row.status === "Active";
              return (
                <tr key={row._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-6 py-4 font-semibold">{name}</td>
                  <td className="px-6 py-4">{row.email}</td>
                  <td className="px-6 py-4 font-semibold">{row.contactNumber}</td>
                  <td className="px-6 py-4">
                    {isActive ? (
                      <span className="inline-flex items-center text-green-600 text-xs font-medium bg-green-100 rounded-full px-3 py-1">
                        ● Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-gray-600 text-xs font-medium bg-gray-200 rounded-full px-3 py-1">
                        ● Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        onOpenTarget({
                          type: mode,
                          id: row._id,
                          name,
                        })
                      }
                      title="Manage pincodes"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Numbered pagination (same as CreateBranch) */}
      {pages > 1 && (
        <div className="flex justify-end items-center gap-1 mt-6 pr-2 text-sm text-gray-500">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-full ${
                page === i + 1 ? "bg-gray-900 text-white" : "hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
