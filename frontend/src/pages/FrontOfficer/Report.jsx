// src/pages/frontoffice/Report.jsx
import React, { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function Report() {
  const [loading, setLoading] = useState(false);
  const [dateStr, setDateStr] = useState("");        // dd/mm/yyyy (display)
  const [taken, setTaken] = useState(0);

  // format today in dd/mm/yyyy (IST display only)
  function formatTodayDDMMYYYY() {
    const now = new Date();
    // show in en-GB to force dd/mm/yyyy (display only)
    return now.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
  }

  async function fetchTodayTaken() {
    try {
      setLoading(true);
      const res = await API.get("/frontoffice/report/todaytaken", {
        validateStatus: () => true,
      });
      if (res.status !== 200) {
        const msg =
          res?.data?.message || `Failed to fetch (HTTP ${res.status})`;
        toast.error(msg);
        return;
      }
      // res.data => { dateISO: 'YYYY-MM-DD', taken: number }
      const { dateISO, taken } = res.data || {};
      // keep the server's dateISO authoritative, but display as dd/mm/yyyy
      const [yy, mm, dd] = (dateISO || "").split("-");
      const pretty = dateISO ? `${dd}/${mm}/${yy}` : formatTodayDDMMYYYY();
      setDateStr(pretty);
      setTaken(typeof taken === "number" ? taken : 0);
    } catch (err) {
      toast.error(err?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setDateStr(formatTodayDDMMYYYY());
    fetchTodayTaken();
  }, []);

  return (
    <div className="flex justify-center py-16">
      <div className="bg-white/30 shadow-lg rounded-2xl w-full max-w-md p-6 space-y-5">
        <h2 className="text-center text-2xl font-semibold text-[#222] mb-4">
          Download Report
        </h2>

        <Field label="Date">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-100 text-gray-800"
            value={dateStr}
            readOnly
            disabled
          />
        </Field>

        <Field label="Taken">
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-100 text-gray-800"
            value={taken}
            readOnly
            disabled
          />
        </Field>

        <div className="pt-3 flex justify-center">
          <button
            type="button"
            onClick={fetchTodayTaken}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60 w-full"
          >
            {loading ? "Downloading..." : "Download"}
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
