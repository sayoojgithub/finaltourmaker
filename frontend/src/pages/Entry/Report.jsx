// src/pages/entry/Report.jsx
import React, { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function Report() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const validate = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return false;
    }
    return true;
  };

  const handleDownload = async (e) => {
  e.preventDefault();
  if (submitting) return;
  if (!validate()) return;

  try {
    setSubmitting(true);

    const res = await API.post(
      "/entry/download-report",
      { startDate, endDate },
      {
        responseType: "blob",
        validateStatus: () => true, // ← don't throw on 4xx/5xx
      }
    );

    if (res.status !== 200) {
      // Try to parse JSON error message
      const contentType = res.headers?.["content-type"] || "";
      let message = `Failed to download report (HTTP ${res.status})`;

      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        try {
          const json = JSON.parse(text);
          if (json?.message) message = json.message;
        } catch {
          // ignore JSON parse error, fallback to default message
        }
      } else if (typeof res.data.text === "function") {
        const text = await res.data.text();
        if (text) message = text;
      }

      toast.error(message);
      return; // stop here
    }

    // 200 OK → download PDF
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients_${startDate}_${endDate}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("PDF downloaded successfully");
  } catch (err) {
    toast.error(err?.message || "Failed to download report");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="flex justify-center py-16">
      <form
        onSubmit={handleDownload}
        className="bg-white/30 shadow-lg rounded-2xl w-full max-w-md p-6 space-y-5"
      >
        <h2 className="text-center text-2xl font-semibold text-[#222] mb-4">
          Download Report
        </h2>

        <Field label="Start Date" required>
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={today}
          />
        </Field>

        <Field label="End Date" required>
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={today}
          />
        </Field>

        <div className="pt-3 flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60 w-full"
          >
            {submitting ? "Generating..." : "Download Report"}
          </button>
        </div>
      </form>
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
