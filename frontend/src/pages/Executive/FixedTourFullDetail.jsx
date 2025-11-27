// FixedTourFullDetail.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarClock, MapPin, CircleDot } from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

export default function FixedTourFullDetail({ tour, brandColor, onClose, onCompleted }) {
  if (!tour) return null;

  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const theme = brandColor || "#8570EE";

  const handleReferralDownload = async () => {
    if (!nextDate || !nextTime) {
      toast.error("Please choose follow-up date and time for referral itinerary");
      return;
    }

    try {
      setLoadingReferral(true);
      await API.post("/executive/fixed-tour-referral-itinerary", {
        clientId: tour.clientId,
        fixedTourId: tour.id,
        fixedTourName: tour.name,
        nextDateRaw: nextDate,
        nextTimeRaw: nextTime,
      });
      toast.success("Referral itinerary status saved");
       if (typeof onCompleted === "function") {
      onCompleted();
    } else if (typeof onClose === "function") {
      onClose();
    }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to process referral itinerary";
      toast.error(msg);
    } finally {
      setLoadingReferral(false);
    }
  };

  const handleConfirmDownload = async () => {
    try {
      setLoadingConfirm(true);
      await API.post("/executive/fixed-tour-confirm-itinerary", {
        clientId: tour.clientId,
        fixedTourId: tour.id,
        fixedTourName: tour.name,
        nextDateRaw: nextDate || null,
        nextTimeRaw: nextTime || null,
      });
      toast.success("Confirmed itinerary status saved");
      if (typeof onCompleted === "function") {
      onCompleted();
    } else if (typeof onClose === "function") {
      onClose();
    }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to process confirmed itinerary";
      toast.error(msg);
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-3xl mx-3 rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.55)] p-5 sm:p-6 flex flex-col gap-4"
          initial={{ y: 40, scale: 0.96, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.97, opacity: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Fixed Tour
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                {tour.name || "Fixed Tour"}
              </div>
              <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                <div>
                  Client:{" "}
                  <span className="font-medium">
                    {tour.clientName || "Client"}
                  </span>{" "}
                  <span className="font-mono text-[11px] text-slate-400">
                    ({tour.clientId})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {tour.destination || "-"}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarClock size={11} />
                    {tour.totalDays} days
                  </span>
                  <span className="flex items-center gap-1">
                    <CircleDot size={11} />
                    <span className="font-mono">
                      {tour.articleNumber || tour.id}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: `${brandColor}22`, color: brandColor }}
              >
                <CalendarClock size={16} />
              </div>
              <div className="text-sm font-semibold text-slate-800">
                Schedule follow-up
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  Next contact date
                </div>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#8570EE]"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  Next contact time
                </div>
                <input
                  type="time"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#8570EE]"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              • Referral Itinerary: date & time required.  
              • Confirm Itinerary: date & time optional.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={handleReferralDownload}
              disabled={loadingReferral}
              className="
                inline-flex items-center justify-center
                rounded-full px-4 py-2 text-xs sm:text-sm font-semibold
                text-white shadow
                hover:opacity-90 disabled:opacity-60
              "
              style={{ background: theme }}
            >
              {loadingReferral ? "Processing..." : "Download Referral Itinerary"}
            </button>

            <button
              type="button"
              onClick={handleConfirmDownload}
              disabled={loadingConfirm}
              className="
                inline-flex items-center justify-center
                rounded-full px-4 py-2 text-xs sm:text-sm font-semibold
                border shadow-sm
                hover:bg-slate-50 disabled:opacity-60
              "
              style={{ borderColor: theme, color: theme }}
            >
              {loadingConfirm ? "Processing..." : "Download Confirm Itinerary"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
