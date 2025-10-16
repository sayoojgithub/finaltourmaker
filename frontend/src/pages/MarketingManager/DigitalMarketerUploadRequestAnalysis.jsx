import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
function formatDateOnly(dd) {
  if (!dd) return "-";
  const d = new Date(dd);
  if (Number.isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function DigitalMarketerUploadRequestAnalysis() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filenameText, setFilenameText] = useState("");
  const [categoryText, setCategoryText] = useState("");
  const [publishingDate, setPublishingDate] = useState(""); // yyyy-mm-dd
  const [posted, setPosted] = useState(""); // "", "true", "false"

  const buildQuery = (nextPage = page) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "10");
    if (filenameText.trim()) params.set("filenameText", filenameText.trim());
    if (categoryText.trim()) params.set("categoryText", categoryText.trim());
    if (publishingDate) params.set("publishingDate", publishingDate);
    if (posted === "true" || posted === "false") params.set("posted", posted);
    return params.toString();
  };

  const fetchList = async (nextPage = page) => {
    try {
      setLoading(true);
      const res = await API.get(`/marketingManager/dm-upload-requests?${buildQuery(nextPage)}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filenameText, categoryText, publishingDate, posted]);

  const tableData = useMemo(() => {
    return (rows || []).map((r) => {
      const effPub = r.approvedPublishingDate || r.publishingDate;
      const status = r.dmPostStatus ? `Posted on ${formatDateTime(r.dmPostedAt)}` : "Not posted yet";
      return {
        id: r._id,
        category: r.category || "—",
        filename: r.filename || "—",
        publishingDate: effPub,
        digitalMarketer: r.digitalMarketerName || r.digitalMarketerEmail || "—",
        status,
        posted: !!r.dmPostStatus,
      };
    });
  }, [rows]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#222]">Digital Marketer — Upload Request Analysis</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Filename">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="Search filename"
            value={filenameText}
            onChange={(e) => setFilenameText(e.target.value)}
          />
        </Field>
        <Field label="Category">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="Search category"
            value={categoryText}
            onChange={(e) => setCategoryText(e.target.value)}
          />
        </Field>
        <Field label="Publishing Date">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={publishingDate}
            onChange={(e) => setPublishingDate(e.target.value)}
          />
        </Field>
        <Field label="Posted">
          <select
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={posted}
            onChange={(e) => setPosted(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Posted</option>
            <option value="false">Not posted</option>
          </select>
        </Field>
        {/* <div className="flex items-end">
          <button
            onClick={() => fetchList(1)}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Refresh
          </button>
        </div> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Category</Th>
              <Th>Filename</Th>
              <Th>Publishing Date</Th>
              <Th>Digital Marketer</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : tableData.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                  No requests.
                </td>
              </tr>
            ) : (
              tableData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <Td>{row.category}</Td>
                  <Td className="font-medium">{row.filename}</Td>
                  <Td>{formatDateOnly(row.publishingDate)}</Td>
                  <Td>{row.digitalMarketer}</Td>
                  <Td className={row.posted ? "text-green-700" : "text-amber-700"}>{row.status}</Td>
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
            onClick={() => page > 1 && fetchList(page - 1)}
            disabled={page <= 1 || loading}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => page < totalPages && fetchList(page + 1)}
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
