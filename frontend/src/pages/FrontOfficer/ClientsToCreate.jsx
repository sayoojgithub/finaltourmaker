// // src/pages/frontoffice/ClientsToCreate.jsx
// import React, { useEffect, useState } from "react";
// import API from "../../api";
// import { toast } from "react-toastify";

// export default function ClientsToCreate() {
//   const [rows, setRows] = useState([]);
//   const [loadingTable, setLoadingTable] = useState(false);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);

//   // Filters (mirroring your style)
//   const [filterMobile, setFilterMobile] = useState("");
//   const [filterDestination, setFilterDestination] = useState("");
//   const [filterDateFrom, setFilterDateFrom] = useState("");
//   const [filterDateTo, setFilterDateTo] = useState("");

//   // Debounce mirrors
//   const [debounceMobile, setDebounceMobile] = useState(filterMobile);
//   const [debounceDestination, setDebounceDestination] = useState(filterDestination);
//   const [debounceDateFrom, setDebounceDateFrom] = useState(filterDateFrom);
//   const [debounceDateTo, setDebounceDateTo] = useState(filterDateTo);

//   const pad = (n) => String(n).padStart(2, "0");
//   const formatDMY = (iso) => {
//     if (!iso) return "—";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "—";
//     return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
//   };
//   const formatHMS = (iso) => {
//     if (!iso) return "—";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "—";
//     return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
//   };

//   const fetchRows = async (nextPage = page, opt = {
//     mobileQ: debounceMobile,
//     destinationQ: debounceDestination,
//     dateFromQ: debounceDateFrom,
//     dateToQ: debounceDateTo
//   }) => {
//     try {
//       setLoadingTable(true);
//       const params = new URLSearchParams();
//       params.set("page", String(nextPage));
//       params.set("limit", "7");
//       if (opt.mobileQ?.trim()) params.set("mobile", opt.mobileQ.trim());
//       if (opt.destinationQ?.trim()) params.set("destination", opt.destinationQ.trim());
//       if (opt.dateFromQ) params.set("dateFrom", opt.dateFromQ);
//       if (opt.dateToQ) params.set("dateTo", opt.dateToQ);

//       const res = await API.get(`/frontoffice/clients-to-create?${params.toString()}`);
//       const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
//       setRows(docs);
//       setPage(p);
//       setTotalPages(totalPages);
//       setTotal(total);
//     } catch (e) {
//       if (e?.response?.status === 401) {
//         toast.error("Not authorized. Please login as a Front Officer.");
//       } else {
//         toast.error("Failed to load assigned clients");
//       }
//     } finally {
//       setLoadingTable(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     fetchRows(1, { mobileQ: "", destinationQ: "", dateFromQ: "", dateToQ: "" });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Debounce filters
//   useEffect(() => {
//     const t = setTimeout(() => setDebounceMobile(filterMobile), 300);
//     return () => clearTimeout(t);
//   }, [filterMobile]);

//   useEffect(() => {
//     const t = setTimeout(() => setDebounceDestination(filterDestination), 300);
//     return () => clearTimeout(t);
//   }, [filterDestination]);

//   useEffect(() => {
//     const t = setTimeout(() => setDebounceDateFrom(filterDateFrom), 150);
//     return () => clearTimeout(t);
//   }, [filterDateFrom]);

//   useEffect(() => {
//     const t = setTimeout(() => setDebounceDateTo(filterDateTo), 150);
//     return () => clearTimeout(t);
//   }, [filterDateTo]);

//   // Refetch when debounced filters change
//   useEffect(() => {
//     fetchRows(1, {
//       mobileQ: debounceMobile,
//       destinationQ: debounceDestination,
//       dateFromQ: debounceDateFrom,
//       dateToQ: debounceDateTo
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debounceMobile, debounceDestination, debounceDateFrom, debounceDateTo]);

//   const handlePrev = () => page > 1 && fetchRows(page - 1);
//   const handleNext = () => page < totalPages && fetchRows(page + 1);

//   // Action button handler (you can wire this to your FO create flow)
//   const handleCreateFromClient = (client) => {
//     // TODO: open drawer/modal or navigate to create form using this client's data
//     toast.info(`Prepare to create from ${client.name || client.mobileNumber}`);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Field label="Filter by Mobile">
//           <input
//             type="text"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             value={filterMobile}
//             onChange={(e) => setFilterMobile(e.target.value)}
//             placeholder="starts with…"
//             inputMode="numeric"
//           />
//         </Field>

//         <Field label="Filter by Destination">
//           <input
//             type="text"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             value={filterDestination}
//             onChange={(e) => setFilterDestination(e.target.value)}
//             placeholder="e.g., Bali"
//           />
//         </Field>

//         <Field label="Created From">
//           <input
//             type="date"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             value={filterDateFrom}
//             onChange={(e) => setFilterDateFrom(e.target.value)}
//           />
//         </Field>

//         <Field label="Created To">
//           <input
//             type="date"
//             className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             value={filterDateTo}
//             onChange={(e) => setFilterDateTo(e.target.value)}
//           />
//         </Field>

//         <div className="md:col-span-4 flex items-end">
//           <button
//             onClick={() => {
//               setFilterMobile("");
//               setFilterDestination("");
//               setFilterDateFrom("");
//               setFilterDateTo("");
//               fetchRows(1, { mobileQ: "", destinationQ: "", dateFromQ: "", dateToQ: "" });
//             }}
//             className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
//           >
//             Clear filters
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto rounded-2xl border border-gray-200">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <Th>Name</Th>
//               <Th>Mobile</Th>
//               <Th>Destination</Th>
//               <Th>Type</Th>
//               <Th>Created Date</Th>
//               <Th>Created Time</Th>
//               <Th className="text-right">Action</Th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 bg-white">
//             {loadingTable ? (
//               <tr>
//                 <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>Loading…</td>
//               </tr>
//             ) : rows.length === 0 ? (
//               <tr>
//                 <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>No clients to create.</td>
//               </tr>
//      ) : (
//   rows.map((r) => {
//     const ctLabel = r.clientType?.label || r.clientType?.value || "";
//     const urgent = r.isUrgent || ctLabel.toLowerCase() === "urgent contact";

//     return (
//       <tr key={r._id} className={urgent ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
//         <Td className={urgent ? "text-red-800 font-semibold" : ""}>{r.name || "—"}</Td>
//         <Td className={urgent ? "text-red-800 font-semibold" : ""}>{r.mobileNumber || "—"}</Td>
//         <Td className={urgent ? "text-red-800 font-semibold" : ""}>{r.destination || "—"}</Td>
//         <Td>
//           <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${urgent ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
//             {ctLabel || "-----------------"}
//           </span>
//         </Td>
//         <Td>{formatDMY(r.createdAt)}</Td>
//         <Td>{formatHMS(r.createdAt)}</Td>
//         <Td className="text-right">
//           <button
//             onClick={() => handleCreateFromClient(r)}
//             disabled={loadingTable}
//             className={`rounded-full px-3 py-1 text-sm font-medium border ${urgent ? "border-red-300 hover:bg-red-100" : "border-gray-300 hover:bg-gray-50"} disabled:opacity-50`}
//             aria-label={`Create from client ${r.name || r.mobileNumber}`}
//             title="Create from this client"
//           >
//             +
//           </button>
//         </Td>
//       </tr>
//     );
//   })
// )}

//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-600">
//           Showing page <span className="font-semibold">{page}</span> of{" "}
//           <span className="font-semibold">{totalPages}</span> •{" "}
//           <span className="font-semibold">{total}</span> total
//         </p>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handlePrev}
//             disabled={page <= 1 || loadingTable}
//             className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <button
//             onClick={handleNext}
//             disabled={page >= totalPages || loadingTable}
//             className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Local table helpers (same vibe as your SearchClient)
// function Field({ label, required, children }) {
//   return (
//     <label className="block">
//       <span className="block text-sm font-medium text-[#222] mb-1">
//         {label} {required && <span className="text-red-500">*</span>}
//       </span>
//       {children}
//     </label>
//   );
// }
// function Th({ children, className = "" }) {
//   return (
//     <th
//       scope="col"
//       className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${className}`}
//     >
//       {children}
//     </th>
//   );
// }
// function Td({ children, className = "" }) {
//   return <td className={`px-6 py-4 text-sm text-gray-800 ${className}`}>{children}</td>;
// }
// src/pages/frontoffice/ClientsToCreate.jsx
import React, { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function ClientsToCreate({ onCreate }) {
  const [rows, setRows] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterMobile, setFilterMobile] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Debounce mirrors
  const [debounceMobile, setDebounceMobile] = useState(filterMobile);
  const [debounceDestination, setDebounceDestination] = useState(filterDestination);
  const [debounceDateFrom, setDebounceDateFrom] = useState(filterDateFrom);
  const [debounceDateTo, setDebounceDateTo] = useState(filterDateTo);

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

  const fetchRows = async (
    nextPage = page,
    opt = {
      mobileQ: debounceMobile,
      destinationQ: debounceDestination,
      dateFromQ: debounceDateFrom,
      dateToQ: debounceDateTo,
    }
  ) => {
    try {
      setLoadingTable(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");
      if (opt.mobileQ?.trim()) params.set("mobile", opt.mobileQ.trim());
      if (opt.destinationQ?.trim()) params.set("destination", opt.destinationQ.trim());
      if (opt.dateFromQ) params.set("dateFrom", opt.dateFromQ);
      if (opt.dateToQ) params.set("dateTo", opt.dateToQ);

      const res = await API.get(`/frontoffice/clients-to-create?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch (e) {
      if (e?.response?.status === 401) {
        toast.error("Not authorized. Please login as a Front Officer.");
      } else {
        toast.error("Failed to load assigned clients");
      }
    } finally {
      setLoadingTable(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRows(1, { mobileQ: "", destinationQ: "", dateFromQ: "", dateToQ: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce timers
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

  // Reactive fetch on debounced values
  useEffect(() => {
    fetchRows(1, {
      mobileQ: debounceMobile,
      destinationQ: debounceDestination,
      dateFromQ: debounceDateFrom,
      dateToQ: debounceDateTo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceMobile, debounceDestination, debounceDateFrom, debounceDateTo]);

  const handlePrev = () => page > 1 && fetchRows(page - 1);
  const handleNext = () => page < totalPages && fetchRows(page + 1);

  const handleCreateFromClient = (client) => {
    if (onCreate) return onCreate(client);
    toast.info(`Prepare to create from ${client.name || client.mobileNumber}`);
  };

  const resetFilters = () => {
    setFilterMobile("");
    setFilterDestination("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Mobile
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Start with digits"
            value={filterMobile}
            onChange={(e) => setFilterMobile(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Destination
          </label>
          <input
            type="text"
            placeholder="Primary destination"
            value={filterDestination}
            onChange={(e) => setFilterDestination(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            From (Created)
          </label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>

        <div className="flex md:block items-end">
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              To (Created)
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            />
          </div>
        </div>

        {/* <div className="md:col-span-5 flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() =>
              fetchRows(1, {
                mobileQ: filterMobile,
                destinationQ: filterDestination,
                dateFromQ: filterDateFrom,
                dateToQ: filterDateTo,
              })
            }
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              resetFilters();
              fetchRows(1, { mobileQ: "", destinationQ: "", dateFromQ: "", dateToQ: "" });
            }}
            className="rounded-full border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
          >
            Reset
          </button>
        </div> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Name</Th>
              <Th>Mobile</Th>
              <Th>Destination</Th>
              <Th>Type</Th>
              <Th>Created Date</Th>
              <Th>Created Time</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loadingTable ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
                  No clients to create.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const ctLabel = r.clientType?.label || r.clientType?.value || "";
                const urgent = r.isUrgent || ctLabel.toLowerCase() === "urgent contact";

                return (
                  <tr
                    key={r._id}
                    className={urgent ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}
                  >
                    <Td className={urgent ? "text-red-800 font-semibold" : ""}>
                      {r.name || "—"}
                    </Td>
                    <Td className={urgent ? "text-red-800 font-semibold" : ""}>
                      {r.mobileNumber || "—"}
                    </Td>
                    <Td className={urgent ? "text-red-800 font-semibold" : ""}>
                      {r.destination || "—"}
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          urgent ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ctLabel || "-----------------"}
                      </span>
                    </Td>
                    <Td>{formatDMY(r.createdAt)}</Td>
                    <Td>{formatHMS(r.createdAt)}</Td>
                    <Td className="text-right">
                      <button
                        onClick={() => handleCreateFromClient(r)}
                        disabled={loadingTable}
                        className={`rounded-full px-3 py-1 text-sm font-medium border ${
                          urgent
                            ? "border-red-300 hover:bg-red-100"
                            : "border-gray-300 hover:bg-gray-50"
                        } disabled:opacity-50`}
                        aria-label={`Create from client ${r.name || r.mobileNumber}`}
                        title="Create from this client"
                      >
                        +
                      </button>
                    </Td>
                  </tr>
                );
              })
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

function Th({ children, className = "" }) {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-6 py-4 text-sm text-gray-800 ${className}`}>{children}</td>;
}
