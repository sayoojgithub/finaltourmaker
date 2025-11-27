// // TourPickerOverlay.jsx
// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Clock,
//   Users,
//   CircleDot,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// export default function TourPickerOverlay({
//   client,
//   tourType,
//   brandColor,
//   demoTours = [],
//   onClose,
//   onSelectTour,
// }) {
//   const [page, setPage] = useState(1);
//   const perPage = 5;

//   const dest = client?.primaryDestinationName?.label || "";
//   const destLower = dest.toLowerCase();

//   let tours = demoTours.filter(
//     (t) => t.type === tourType && t.destination.toLowerCase() === destLower
//   );
//   if (!tours.length) {
//     tours = demoTours.filter((t) => t.type === tourType);
//   }

//   const totalPages = Math.max(1, Math.ceil(tours.length / perPage));
//   const currentPage = Math.min(page, totalPages);
//   const startIndex = (currentPage - 1) * perPage;
//   const visibleTours = tours.slice(startIndex, startIndex + perPage);

//   const title =
//     tourType === "fixed"
//       ? "Choose a Fixed Tour"
//       : tourType === "group"
//       ? "Choose a Group Tour"
//       : "Choose a Tour";

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="absolute inset-0 z-[90] flex items-center justify-center"
//         initial={{ opacity: 0, scale: 0.97 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.97 }}
//         transition={{
//           type: "spring",
//           stiffness: 130,
//           damping: 18,
//           mass: 0.9,
//         }}
//       >
//        {/* 🔥 DEBUG INFO FOR YOU */}
//   <div className="absolute top-5 left-5 z-[200]">
//     <h1 style={{ fontSize: "20px", color: "red" }}>
//       CLIENT: {client?._id}
//     </h1>
//     <h1 style={{ fontSize: "20px", color: "blue" }}>
//       TOUR TYPE: {tourType}
//     </h1>
//   </div>
//         <div className="absolute inset-0 bg-black/40" />

//         <div className="relative w-full max-w-6xl mx-2 sm:mx-4 rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.55)] overflow-hidden flex flex-col">
//           {/* Header bar */}
//           <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
//             <div>
//               <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
//                 {dest ? `Tours for ${dest}` : "Available tours"}
//               </div>
//               <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
//                 {title}
//                 <span className="text-xs font-normal text-slate-500">
//                   ({tours.length} options)
//                 </span>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
//             >
//               Back
//             </button>
//           </div>

//           {/* Content */}
//           <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4 bg-gradient-to-b from-white to-slate-50">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto scroll-smooth pr-1">
//               {visibleTours.map((tour) => (
//                 <div
//                   key={tour.id}
//                   className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col gap-2 text-sm"
//                 >
//                   <div className="flex items-start justify-between gap-2">
//                     <div>
//                       <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
//                         {tourType === "fixed"
//                           ? "Fixed Departure"
//                           : "Group Tour"}
//                       </div>
//                       <div className="font-semibold text-slate-900">
//                         {tour.name}
//                       </div>
//                     </div>
//                     <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
//                       {tour.destination}
//                     </span>
//                   </div>

//                   <div className="flex items-center gap-4 text-xs text-slate-600 mt-1 flex-wrap">
//                     <div className="flex items-center gap-1">
//                       <Clock size={12} />
//                       <span>{tour.durationDays} days</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Users size={12} />
//                       <span>{tour.seatsAvailable} seats left</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <CircleDot size={12} />
//                       <span className="font-mono text-[11px]">
//                         {tour.id}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Tiny seat bar */}
//                   <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
//                     <div
//                       className="h-full rounded-full"
//                       style={{
//                         background: brandColor,
//                         width: `${Math.min(
//                           100,
//                           (tour.seatsAvailable / 20) * 100
//                         )}%`,
//                       }}
//                     />
//                   </div>

//                   <div className="pt-2 flex justify-end">
//                     <button
//                       type="button"
//                       onClick={() => onSelectTour(tour)}
//                       className="
//                         px-4 py-2 rounded-xl text-white text-xs font-semibold
//                         shadow
//                         transition
//                       "
//                       style={{ background: brandColor }}
//                     >
//                       More info
//                     </button>
//                   </div>
//                 </div>
//               ))}

//               {visibleTours.length === 0 && (
//                 <div className="text-xs text-slate-500">
//                   No tours configured for this type yet.
//                 </div>
//               )}
//             </div>

//             {/* Pagination */}
//             <div className="flex items-center justify-center gap-2 pt-2">
//               <button
//                 type="button"
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className={`
//                   px-2 py-1 rounded-lg border text-xs
//                   ${
//                     currentPage === 1
//                       ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                       : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                   }
//                 `}
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </button>

//               {Array.from({ length: totalPages }).map((_, idx) => {
//                 const p = idx + 1;
//                 const active = p === currentPage;
//                 return (
//                   <button
//                     key={p}
//                     type="button"
//                     onClick={() => setPage(p)}
//                     className={`
//                       px-3 py-1 rounded-lg text-xs
//                       ${
//                         active
//                           ? "bg-[#8570EE] text-white shadow"
//                           : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-200"
//                       }
//                     `}
//                   >
//                     {p}
//                   </button>
//                 );
//               })}

//               <button
//                 type="button"
//                 onClick={() =>
//                   setPage((p) => Math.min(totalPages, p + 1))
//                 }
//                 disabled={currentPage === totalPages}
//                 className={`
//                   px-2 py-1 rounded-lg border text-xs
//                   ${
//                     currentPage === totalPages
//                       ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                       : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                   }
//                 `}
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
// TourPickerOverlay.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  CircleDot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

export default function TourPickerOverlay({
  client,
  tourType, // "group" | "fixed"
  brandColor,
  onClose,
  onSelectTour,
}) {
  const [page, setPage] = useState(1);
  const [tours, setTours] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const dest = client?.primaryDestinationName?.label || "";

  // Reset page when client or tourType changes
  useEffect(() => {
    setPage(1);
  }, [client?._id, tourType]);

  // Fetch tours from backend (no AbortController)
  useEffect(() => {
    if (!client?._id || !tourType) return;

    const fetchTours = async () => {
      try {
        setLoading(true);
        const endpoint =
          tourType === "group"
            ? "/executive/client-group-tours"
            : "/executive/client-fixed-tours";

        const res = await API.get(endpoint, {
          params: { clientId: client._id, page, limit: 10 },
        });

        const data = res.data || {};
        setTours(data.tours || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to load tours", err);
        const msg =
          err?.response?.data?.message ||
          "Failed to load tours for this client";
        toast.error(msg);
        setTours([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [client?._id, tourType, page]);

  const title =
    tourType === "fixed"
      ? "Choose a Fixed Tour"
      : tourType === "group"
      ? "Choose a Group Tour"
      : "Choose a Tour";

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-[90] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{
          type: "spring",
          stiffness: 130,
          damping: 18,
          mass: 0.9,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative w-full max-w-6xl mx-2 sm:mx-4 rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.55)] overflow-hidden flex flex-col">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                {dest ? `Tours for ${dest}` : "Available tours"}
              </div>
              <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {title}
                <span className="text-xs font-normal text-slate-500">
                  ({total} options)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
            >
              Back
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4 bg-gradient-to-b from-white to-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto scroll-smooth pr-1">
              {loading && (
                <div className="text-xs text-slate-500">Loading tours...</div>
              )}

              {!loading &&
                tours.map((tour) => (
                  <div
                    key={tour.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col gap-2 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {tourType === "fixed"
                            ? "Fixed Departure"
                            : "Group Tour"}
                        </div>
                        <div className="font-semibold text-slate-900">
                          {tour.name}
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {tour.destination}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{tour.totalDays} days</span>
                      </div>

                      {/* ✅ Seats left ONLY for group tours */}
                      {tourType === "group" &&
                        typeof tour.seatsAvailable === "number" && (
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>{tour.seatsAvailable} seats left</span>
                          </div>
                        )}

                      <div className="flex items-center gap-1">
                        <CircleDot size={12} />
                        <span className="font-mono text-[11px]">
                          {tour.articleNumber || tour.id}
                        </span>
                      </div>
                    </div>

                    {/* Tiny seat bar - COMMENTED OUT FOR NOW */}
                    {/*
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: brandColor,
                          width: `${Math.min(
                            100,
                            (tour.seatsAvailable / 20) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    */}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onSelectTour(tour)}
                        className="
                          px-4 py-2 rounded-xl text-white text-xs font-semibold
                          shadow
                          transition
                        "
                        style={{ background: brandColor }}
                      >
                        More info
                      </button>
                    </div>
                  </div>
                ))}

              {!loading && tours.length === 0 && (
                <div className="text-xs text-slate-500">
                  No tours configured for this client destination & type yet.
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`
                  px-2 py-1 rounded-lg border text-xs
                  ${
                    page === 1
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                  }
                `}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                const active = p === page;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`
                      px-3 py-1 rounded-lg text-xs
                      ${
                        active
                          ? "bg-[#8570EE] text-white shadow"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-200"
                      }
                    `}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`
                  px-2 py-1 rounded-lg border text-xs
                  ${
                    page === totalPages
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                  }
                `}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
