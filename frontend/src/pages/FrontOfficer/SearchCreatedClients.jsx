// src/pages/frontoffice/SearchCreatedClients.jsx
import React, { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function SearchCreatedClients({ onOpenUpdate }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const isFullMobile = (s) => /^\d{10,15}$/.test(String(s || "").trim());
  const isClientId = (s) =>
    /^[A-Za-z]{2,8}\d{1,10}$/.test(String(s || "").trim());
  const isValidQuery = isFullMobile(q) || isClientId(q);

  const handleSearch = async () => {
    if (!isValidQuery) {
      toast.info(
        "Enter full mobile (10–15 digits) or a valid Client ID (e.g., TRI12)."
      );
      return;
    }
    try {
      setLoading(true);
      const res = await API.get("/frontoffice/search-created", {
        params: { query: q.trim() },
      });
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Enter full Mobile (10–15 digits) or Client ID (e.g., TRI12)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6b4fe0]"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!isValidQuery || loading}
          className={[
            "rounded-2xl px-5 py-3 font-semibold text-white transition",
            isValidQuery && !loading
              ? "bg-[#6b4fe0] hover:opacity-90"
              : "bg-gray-300 cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {!loading && results.length === 0 && isValidQuery && q.trim() !== "" && (
        <div className="text-gray-500">No matches for “{q.trim()}”.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.map((c) => (
          <button
            key={c._id}
            onClick={() => onOpenUpdate?.(c._id)}
            className="text-left group"
          >
            <div
              className="rounded-3xl p-5 border shadow-[0_8px_24px_rgba(0,0,0,0.08)]
                         transition transform group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]
                         bg-white/40 backdrop-blur-xl border-white/50"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.85), rgba(238,240,255,0.6))",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  Client
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-white/60 text-gray-600 border border-white/70">
                  {c.status || "nil"}
                </span>
              </div>

              <div className="text-2xl font-extrabold text-[#6b4fe0]">
                {c.clientId}
              </div>
              <div className="mt-0.5 text-gray-700 font-medium truncate">
                {c.name || "-"}
              </div>
              <div className="mt-0.5 text-gray-700">{c.mobileNumber}</div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-white/70 border border-white/60 px-3 py-2">
                  <div className="text-[11px] text-gray-500">
                    Primary Destination
                  </div>
                  <div className="font-semibold truncate">
                    {c?.primaryDestinationName?.label ||
                      c?.primaryDestinationName?.value ||
                      "-"}
                  </div>
                </div>
                <div className="rounded-xl bg-white/70 border border-white/60 px-3 py-2">
                  <div className="text-[11px] text-gray-500">Start Date</div>
                  <div className="font-semibold">
                    {c.startDate
                      ? new Date(c.startDate).toLocaleDateString("en-GB") // ✅ forces DD/MM/YYYY
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
