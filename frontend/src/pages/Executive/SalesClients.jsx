
// // Sales_Clients.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Search,
//   Filter,
//   ArrowUpDown,
//   ChevronLeft,
//   ChevronRight,
//   PhoneCall,
//   CalendarClock,
//   MapPin,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import API from "../../api";

// import ContactFlowModal from "./ContactFlowModal";

// /* =========================
//    DEMO TOURS (unchanged)
// ========================= */

// const BASE_TOURS = [
//   {
//     baseId: "DXB-FIX",
//     type: "fixed",
//     destination: "Dubai",
//     name: "Dubai Highlights",
//     durationDays: 5,
//     seatsAvailable: 8,
//   },
//   {
//     baseId: "DXB-GRP",
//     type: "group",
//     destination: "Dubai",
//     name: "Dubai Group Explorer",
//     durationDays: 6,
//     seatsAvailable: 20,
//   },
//   {
//     baseId: "BALI-FIX",
//     type: "fixed",
//     destination: "Bali",
//     name: "Bali Beach & Temples",
//     durationDays: 5,
//     seatsAvailable: 5,
//   },
//   {
//     baseId: "BALI-GRP",
//     type: "group",
//     destination: "Bali",
//     name: "Bali Group Fun",
//     durationDays: 7,
//     seatsAvailable: 15,
//   },
//   {
//     baseId: "SING-FIX",
//     type: "fixed",
//     destination: "Singapore",
//     name: "Singapore City Break",
//     durationDays: 4,
//     seatsAvailable: 10,
//   },
//   {
//     baseId: "SING-GRP",
//     type: "group",
//     destination: "Singapore",
//     name: "Singapore + Malaysia Group",
//     durationDays: 6,
//     seatsAvailable: 18,
//   },
// ];

// const DEMO_TOURS = Array.from({ length: 20 }).map((_, index) => {
//   const base = BASE_TOURS[index % BASE_TOURS.length];
//   return {
//     id: `${base.baseId}-${index + 1}`,
//     type: base.type,
//     destination: base.destination,
//     name: `${base.name} ${index + 1}`,
//     durationDays: base.durationDays,
//     seatsAvailable: base.seatsAvailable - (index % 3),
//   };
// });

// /* =========================
//    MAIN: LIGHT-MODE TABLE
// ========================= */
// // Helper: format date as dd/mm/yyyy
// function formatDate(dateInput) {
//   if (!dateInput) return "";

//   const d = new Date(dateInput);
//   if (Number.isNaN(d.getTime())) return "";

//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();

//   return `${day}/${month}/${year}`;
// }

// export default function SalesClients({ category, onBack }) {
//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("all"); // keep same UI, we will send to backend
//   const [sortKey, setSortKey] = useState("date"); // "date" | "destination"
//   const [sortDir, setSortDir] = useState("asc");
//   const [page, setPage] = useState(1);

//   const [clients, setClients] = useState([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const [activeClient, setActiveClient] = useState(null);

//   const pageSize = 10;

//   // Fetch from backend whenever filters change
//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         setLoading(true);

//         const params = {
//           category,
//           page,
//           limit: pageSize,
//           sortKey,
//           sortDir,
//         };

//         // search only by client name (backend uses it only on name)
//         if (search.trim()) {
//           params.search = search.trim();
//         }

//         // optional urgency filter (urgent / non-urgent)
//         if (typeFilter !== "all") {
//           params.type = typeFilter;
//         }

//         const res = await API.get("/executive/clients", { params });

//         const data = res.data || {};
//         setClients(data.docs || []);
//         setTotalPages(data.totalPages || 1);
//         setTotal(data.total || 0);

//         // keep page in sync with backend safe page if returned
//         if (data.page && data.page !== page) {
//           setPage(data.page);
//         }
//       } catch (err) {
//         const msg =
//           err?.response?.data?.message ||
//           err.message ||
//           "Failed to load clients";
//         toast.error(msg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClients();
//   }, [category, page, sortKey, sortDir, search, typeFilter]);

//   // Shape data for UI (no extra filtering/sorting here — backend handles it)
//   const processed = useMemo(
//     () =>
//       clients.map((c) => {
//         const rawType = (c.clientType?.value || "").toLowerCase();

//         let tableType = "non-urgent";
//         if (rawType.startsWith("urgent")) {
//           tableType = "urgent";
//         } else if (rawType.startsWith("non urgent")) {
//           tableType = "non-urgent";
//         }

//         return {
//           ...c,
//           tableId: c.clientId,
//           tableName: c.name || "",
//           tableType,
//           tableDestination: c.destination || "",
//           tableStartDate: c.startDate ? formatDate(c.startDate) : "",
//         };
//       }),
//     [clients]
//   );

//   const currentPage = Math.min(page, totalPages);
//   const visible = processed; // already paginated by backend

//   const goToPage = (p) => {
//     if (p < 1 || p > totalPages) return;
//     setPage(p);
//   };

//   const handleCreateItinerary = (client, context) => {
//     console.log("Create Itinerary for:", client, "context:", context);
//   };

//   const handleEditClient = (client, context) => {
//     console.log("Edit Client for:", client, "context:", context);
//   };

//   return (
//     <div className="min-h-screen w-full flex justify-center bg-white text-slate-700">
//       <div className="w-full max-w-[1400px] px-3 sm:px-4 py-6 sm:py-8 mx-auto">
//         {/* TOP CONTROLS */}
//         <div className="mb-6 flex flex-col gap-4">
//           {/* Top title row */}
//           <div className="flex items-center justify-between gap-3 flex-wrap">
//           <div className="flex items-center gap-2">
//       {onBack && (
//         <button
//           type="button"
//           onClick={onBack}
//           className="
//             inline-flex items-center gap-2
//             px-4 py-2
//             rounded-xl
//             border border-slate-300
//             bg-white
//             text-slate-700
//             text-sm
//             shadow-sm
//             hover:bg-slate-100
//             transition
//           "
//         >
//           <ChevronLeft className="h-4 w-4" />
//           <span>Back</span>
//         </button>
//       )}
//     </div>
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 rounded-xl bg-[#8570EE]/15 flex items-center justify-center shadow">
//                 <Filter className="h-5 w-5 text-[#8570EE]" />
//               </div>
//               <div>
//                 <div className="text-xs uppercase tracking-widest text-slate-500">
//                   Clients
//                 </div>
//                 <div className="text-lg sm:text-xl font-bold text-slate-900">
//                   {loading
//                     ? "Loading..."
//                     : `${total} Found • Page ${currentPage}/${totalPages}`}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Controls row */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             {/* Search + type on left (stack on mobile) */}
//             <div className="flex flex-col xs:flex-row gap-3">
//               {/* Search (only by name on backend) */}
//               <div className="flex items-center gap-2 h-10 bg-white border border-slate-300 rounded-xl px-3 shadow-sm hover:shadow-md transition w-full xs:w-auto">
//                 <Search className="h-4 w-4 text-slate-500" />
//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(e) => {
//                     setSearch(e.target.value);
//                     setPage(1);
//                   }}
//                   placeholder="Search by client name..."
//                   className="
//                     bg-transparent
//                     outline-none
//                     border-none
//                     text-sm text-slate-700
//                     w-full
//                     placeholder:text-slate-400
//                     focus:ring-0
//                     h-full
//                   "
//                 />
//               </div>

//               {/* Type Filter (urgent / non-urgent) */}
//               <select
//                 value={typeFilter}
//                 onChange={(e) => {
//                   setTypeFilter(e.target.value);
//                   setPage(1);
//                 }}
//                 className="
//                   h-10
//                   px-3
//                   rounded-xl
//                   border border-slate-300
//                   bg-white
//                   shadow-sm
//                   text-sm text-slate-700
//                   outline-none
//                   focus:ring-2 focus:ring-[#8570EE] focus:border-[#8570EE]
//                   transition
//                   w-full
//                   xs:w-auto
//                 "
//               >
//                 <option value="all">All Types</option>
//                 <option value="urgent">Urgent</option>
//                 <option value="non-urgent">Non Urgent</option>
//               </select>
//             </div>

//             {/* Sort on right */}
//             <div className="flex items-center gap-2 h-10 bg-white border border-slate-300 rounded-xl px-3 shadow-sm hover:shadow-md transition w-full sm:w-auto">
//               <span className="text-sm text-slate-600">Sort:</span>
//               <select
//                 value={sortKey}
//                 onChange={(e) => {
//                   setSortKey(e.target.value);
//                   setPage(1);
//                 }}
//                 className="
//                   bg-transparent
//                   outline-none
//                   border-none
//                   text-sm
//                   text-slate-700
//                   focus:ring-0
//                   h-full
//                   flex-1
//                 "
//               >
//                 {/* ONLY Tour Date & Destination as requested */}
//                 <option value="date">Tour Date</option>
//                 <option value="destination">Destination</option>
//               </select>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
//                 }
//                 className="bg-[#8570EE]/15 px-2 py-1 rounded-md hover:bg-[#8570EE]/25 transition h-7 flex items-center justify-center shrink-0"
//               >
//                 <ArrowUpDown className="h-4 w-4 text-[#8570EE]" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* DESKTOP TABLE (md and up) */}
//         <div className="hidden md:block">
//           <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden w-full">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
//                   <th className="px-4 py-3 text-left">Client ID</th>
//                   <th className="px-4 py-3 text-left">Client Name</th>
//                   <th className="px-4 py-3 text-left">Type</th>
//                   <th className="px-4 py-3 text-left">Tour Start</th>
//                   <th className="px-4 py-3 text-left">Destination</th>
//                   <th className="px-4 py-3 text-right">Contact</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {visible.map((client) => {
//                   const urgent = client.tableType === "urgent";

//                   return (
//                     <tr
//                       key={client._id || client.clientId}
//                       className={`
//     border-b border-slate-100
//     transition
//     hover:bg-[#8570EE]/10
//     ${urgent ? "bg-white" : ""}
//   `}
//                     >
//                       <td className="px-4 py-3">{client.tableId}</td>
//                       <td className="px-4 py-3 font-medium">
//                         {client.tableName}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className={`
//                             px-3 py-1 rounded-full text-xs font-semibold
//                             border
//                             ${
//                               urgent
//                                 ? "bg-red-50 text-red-600 border-red-300"
//                                 : "bg-emerald-50 text-emerald-600 border-emerald-300"
//                             }
//                           `}
//                         >
//                           {urgent ? "Urgent" : "Non Urgent"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">{client.tableStartDate}</td>
//                       <td className="px-4 py-3">{client.tableDestination}</td>
//                       <td className="px-4 py-3 text-right">
//                         <button
//                           type="button"
//                           onClick={() => setActiveClient(client)}
//                           className="
//                             bg-[#8570EE]
//                             text-white
//                             font-semibold
//                             px-10
//                             py-2.5
//                             rounded-xl
//                             shadow-[0_4px_14px_rgba(133,112,238,0.35)]
//                             transition
//                             hover:bg-[#9d89ff]
//                             hover:shadow-[0_6px_20px_rgba(133,112,238,0.45)]
//                           "
//                         >
//                           <PhoneCall className="h-4 w-4 inline mr-1" />
//                           Contact
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}

//                 {!loading && visible.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="px-4 py-8 text-center text-slate-500"
//                     >
//                       No clients match your filters.
//                     </td>
//                   </tr>
//                 )}

//                 {loading && (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="px-4 py-8 text-center text-slate-500"
//                     >
//                       Loading...
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>

//             {/* PAGINATION */}
//             <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
//               <button
//                 type="button"
//                 onClick={() => goToPage(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`
//                   px-2 py-1 rounded-lg border text-sm
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
//                     onClick={() => goToPage(p)}
//                     className={`
//                       px-3 py-1 rounded-lg text-sm
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
//                 onClick={() => goToPage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`
//                   px-2 py-1 rounded-lg border text-sm
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

//         {/* MOBILE CARD LIST (only on small screens) */}
//         <div className="md:hidden space-y-3">
//           {visible.map((client) => {
//             const urgent = client.tableType === "urgent";
//             return (
//               <div
//                 key={client._id || client.clientId}
//                 className={`
//     rounded-2xl border shadow-md px-4 py-3 flex flex-col gap-2
//     ${urgent ? "bg-white border-slate-200" : "bg-white border-slate-200"}
//   `}
//               >
//                 <div className="flex items-center justify-between gap-2">
//                   <div>
//                     <div className="text-xs text-slate-400">
//                       {client.tableId}
//                     </div>
//                     <div className="text-sm font-semibold text-slate-900">
//                       {client.tableName}
//                     </div>
//                   </div>
//                   <span
//                     className={`
//                       px-2.5 py-1 rounded-full text-[11px] font-semibold border
//                       ${
//                         urgent
//                           ? "bg-red-50 text-red-600 border-red-300"
//                           : "bg-emerald-50 text-emerald-600 border-emerald-300"
//                       }
//                     `}
//                   >
//                     {urgent ? "Urgent" : "Non Urgent"}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between text-xs text-slate-600">
//                   <div className="flex flex-col gap-0.5">
//                     <span className="flex items-center gap-1">
//                       <CalendarClock size={12} />
//                       {client.tableStartDate || "-"}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <MapPin size={12} />
//                       {client.tableDestination || "-"}
//                     </span>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setActiveClient(client)}
//                     className="
//                       bg-[#8570EE]
//                       text-white
//                       font-semibold
//                       px-4
//                       py-2
//                       rounded-xl
//                       shadow-[0_4px_14px_rgba(133,112,238,0.35)]
//                       transition
//                       hover:bg-[#9d89ff]
//                     "
//                   >
//                     <PhoneCall className="h-4 w-4 inline mr-1" />
//                     Contact
//                   </button>
//                 </div>
//               </div>
//             );
//           })}

//           {!loading && visible.length === 0 && (
//             <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500 text-sm">
//               No clients match your filters.
//             </div>
//           )}

//           {loading && (
//             <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500 text-sm">
//               Loading...
//             </div>
//           )}

//           {/* Pagination (mobile) */}
//           <div className="mt-3 py-3 flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
//             <button
//               type="button"
//               onClick={() => goToPage(currentPage - 1)}
//               disabled={currentPage === 1}
//               className={`
//                 px-2 py-1 rounded-lg border text-xs
//                 ${
//                   currentPage === 1
//                     ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                     : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                 }
//               `}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </button>

//             {Array.from({ length: totalPages }).map((_, idx) => {
//               const p = idx + 1;
//               const active = p === currentPage;
//               return (
//                 <button
//                   key={p}
//                   type="button"
//                   onClick={() => goToPage(p)}
//                   className={`
//                     px-3 py-1 rounded-lg text-xs
//                     ${
//                       active
//                         ? "bg-[#8570EE] text-white shadow"
//                         : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-200"
//                     }
//                   `}
//                 >
//                   {p}
//                 </button>
//               );
//             })}

//             <button
//               type="button"
//               onClick={() => goToPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className={`
//                 px-2 py-1 rounded-lg border text-xs
//                 ${
//                   currentPage === totalPages
//                     ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                     : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
//                 }
//               `}
//             >
//               <ChevronRight className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Contact Flow Modal (unchanged) */}
//       <ContactFlowModal
//         open={!!activeClient}
//         onClose={() => setActiveClient(null)}
//         client={activeClient}
//         brand={{ color: "#8570EE" }}
//         onCreateItinerary={handleCreateItinerary}
//         onEditClient={handleEditClient}
//         demoTours={DEMO_TOURS}
//       />
//     </div>
//   );
// }

// Sales_Clients.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  CalendarClock,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";

import ContactFlowModal from "./ContactFlowModal";

/* =========================
   DEMO TOURS (unchanged)
========================= */

const BASE_TOURS = [
  {
    baseId: "DXB-FIX",
    type: "fixed",
    destination: "Dubai",
    name: "Dubai Highlights",
    durationDays: 5,
    seatsAvailable: 8,
  },
  {
    baseId: "DXB-GRP",
    type: "group",
    destination: "Dubai",
    name: "Dubai Group Explorer",
    durationDays: 6,
    seatsAvailable: 20,
  },
  {
    baseId: "BALI-FIX",
    type: "fixed",
    destination: "Bali",
    name: "Bali Beach & Temples",
    durationDays: 5,
    seatsAvailable: 5,
  },
  {
    baseId: "BALI-GRP",
    type: "group",
    destination: "Bali",
    name: "Bali Group Fun",
    durationDays: 7,
    seatsAvailable: 15,
  },
  {
    baseId: "SING-FIX",
    type: "fixed",
    destination: "Singapore",
    name: "Singapore City Break",
    durationDays: 4,
    seatsAvailable: 10,
  },
  {
    baseId: "SING-GRP",
    type: "group",
    destination: "Singapore",
    name: "Singapore + Malaysia Group",
    durationDays: 6,
    seatsAvailable: 18,
  },
];

const DEMO_TOURS = Array.from({ length: 20 }).map((_, index) => {
  const base = BASE_TOURS[index % BASE_TOURS.length];
  return {
    id: `${base.baseId}-${index + 1}`,
    type: base.type,
    destination: base.destination,
    name: `${base.name} ${index + 1}`,
    durationDays: base.durationDays,
    seatsAvailable: base.seatsAvailable - (index % 3),
  };
});

/* =========================
   MAIN: LIGHT-MODE TABLE
========================= */
// Helper: format date as dd/mm/yyyy
function formatDate(dateInput) {
  if (!dateInput) return "";

  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function SalesClients({ category, onBack, onStatusChange }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // keep same UI, we will send to backend
  const [sortKey, setSortKey] = useState("date"); // "date" | "destination"
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const [clients, setClients] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 which client is open in modal (full data)
  const [activeClient, setActiveClient] = useState(null);
  // 🔹 loading & saving flags for contact modal
  const [loadingClient, setLoadingClient] = useState(false);
  const [savingClient, setSavingClient] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const pageSize = 10;

  // Fetch from backend whenever filters change
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);

        const params = {
          category,
          page,
          limit: pageSize,
          sortKey,
          sortDir,
        };

        // search only by client name (backend uses it only on name)
        if (search.trim()) {
          params.search = search.trim();
        }

        // optional urgency filter (urgent / non-urgent)
        if (typeFilter !== "all") {
          params.type = typeFilter;
        }

        const res = await API.get("/executive/clients", { params });

        const data = res.data || {};
        setClients(data.docs || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);

        // keep page in sync with backend safe page if returned
        if (data.page && data.page !== page) {
          setPage(data.page);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to load clients";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [category, page, sortKey, sortDir, search, typeFilter, refreshKey]);
  const handleStatusUpdated = () => {
  // trigger re-fetch
  setRefreshKey((prev) => prev + 1);
   if (typeof onStatusChange === "function") {
    onStatusChange();
  }
};

  // Shape data for UI (no extra filtering/sorting here — backend handles it)
  const processed = useMemo(
    () =>
      clients.map((c) => {
        const rawType = (c.clientType?.value || "").toLowerCase();

        let tableType = "non-urgent";
        if (rawType.startsWith("urgent")) {
          tableType = "urgent";
        } else if (rawType.startsWith("non urgent")) {
          tableType = "non-urgent";
        }

        return {
          ...c,
          tableId: c.clientId,
          tableName: c.name || "",
          tableType,
          tableDestination: c.destination || "",
          tableStartDate: c.startDate ? formatDate(c.startDate) : "",
        };
      }),
    [clients]
  );

  const currentPage = Math.min(page, totalPages);
  const visible = processed; // already paginated by backend

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const handleCreateItinerary = (client, context) => {
    console.log("Create Itinerary for:", client, "context:", context);
  };

  const handleEditClient = (client, context) => {
    console.log("Edit Client for:", client, "context:", context);
  };

  // 🔹 When pressing Contact: fetch full details then open modal
  const handleOpenContact = async (rowClient) => {
    if (!rowClient?._id) return;
    try {
      setLoadingClient(true);
      const res = await API.get(`/executive/clients/${rowClient._id}`);
      const fullClient = res.data?.client;
      if (!fullClient) {
        toast.error("Client not found");
        return;
      }
      setActiveClient(fullClient);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to load client details";
      toast.error(msg);
    } finally {
      setLoadingClient(false);
    }
  };

  // 🔹 Save updates coming from ClientDetailsPanel (via ContactFlowModal)
  const handleSaveClient = async (clientId, updates) => {
    if (!clientId) return;
    try {
      setSavingClient(true);
      const res = await API.put(`/executive/clients/${clientId}`, updates);
      const updated = res.data?.client;
      if (!updated) {
        toast.error("Failed to update client");
        return;
      }

      // Update modal data
      setActiveClient(updated);

      // Update the row in the list (so table reflects destination/date/name/type)
      setClients((prev) =>
        prev.map((c) => {
          if (String(c._id) !== String(updated._id)) return c;
          return {
            ...c,
            name: updated.name,
            startDate: updated.startDate,
            destination:
              updated.primaryDestinationName?.label ||
              updated.primaryDestinationName?.value ||
              c.destination,
            clientType: updated.clientType || c.clientType,
          };
        })
      );

      toast.success("Client updated");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to update client";
      toast.error(msg);
    } finally {
      setSavingClient(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-white text-slate-700">
      <div className="w-full max-w-[1400px] px-3 sm:px-4 py-6 sm:py-8 mx-auto">
        {/* TOP CONTROLS */}
        <div className="mb-6 flex flex-col gap-4">
          {/* Top title row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2
                    rounded-xl
                    border border-slate-300
                    bg-white
                    text-slate-700
                    text-sm
                    shadow-sm
                    hover:bg-slate-100
                    transition
                  "
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#8570EE]/15 flex items-center justify-center shadow">
                <Filter className="h-5 w-5 text-[#8570EE]" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500">
                  Clients
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">
                  {loading
                    ? "Loading..."
                    : `${total} Found • Page ${currentPage}/${totalPages}`}
                </div>
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Search + type on left (stack on mobile) */}
            <div className="flex flex-col xs:flex-row gap-3">
              {/* Search (only by name on backend) */}
              <div className="flex items-center gap-2 h-10 bg-white border border-slate-300 rounded-xl px-3 shadow-sm hover:shadow-md transition w-full xs:w-auto">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by client name..."
                  className="
                    bg-transparent
                    outline-none
                    border-none
                    text-sm text-slate-700
                    w-full
                    placeholder:text-slate-400
                    focus:ring-0
                    h-full
                  "
                />
              </div>

              {/* Type Filter (urgent / non-urgent) */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="
                  h-10
                  px-3
                  rounded-xl
                  border border-slate-300
                  bg-white
                  shadow-sm
                  text-sm text-slate-700
                  outline-none
                  focus:ring-2 focus:ring-[#8570EE] focus:border-[#8570EE]
                  transition
                  w-full
                  xs:w-auto
                "
              >
                <option value="all">All Types</option>
                <option value="urgent">Urgent</option>
                <option value="non-urgent">Non Urgent</option>
              </select>
            </div>

            {/* Sort on right */}
            <div className="flex items-center gap-2 h-10 bg-white border border-slate-300 rounded-xl px-3 shadow-sm hover:shadow-md transition w-full sm:w-auto">
              <span className="text-sm text-slate-600">Sort:</span>
              <select
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value);
                  setPage(1);
                }}
                className="
                  bg-transparent
                  outline-none
                  border-none
                  text-sm
                  text-slate-700
                  focus:ring-0
                  h-full
                  flex-1
                "
              >
                {/* ONLY Tour Date & Destination as requested */}
                <option value="date">Tour Date</option>
                <option value="destination">Destination</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="bg-[#8570EE]/15 px-2 py-1 rounded-md hover:bg-[#8570EE]/25 transition h-7 flex items-center justify-center shrink-0"
              >
                <ArrowUpDown className="h-4 w-4 text-[#8570EE]" />
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP TABLE (md and up) */}
        <div className="hidden md:block">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <th className="px-4 py-3 text-left">Client ID</th>
                  <th className="px-4 py-3 text-left">Client Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Tour Start</th>
                  <th className="px-4 py-3 text-left">Destination</th>
                  <th className="px-4 py-3 text-right">Contact</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((client) => {
                  const urgent = client.tableType === "urgent";

                  return (
                    <tr
                      key={client._id || client.clientId}
                      className={`
                        border-b border-slate-100
                        transition
                        hover:bg-[#8570EE]/10
                        ${urgent ? "bg-white" : ""}
                      `}
                    >
                      <td className="px-4 py-3">{client.tableId}</td>
                      <td className="px-4 py-3 font-medium">
                        {client.tableName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            border
                            ${
                              urgent
                                ? "bg-red-50 text-red-600 border-red-300"
                                : "bg-emerald-50 text-emerald-600 border-emerald-300"
                            }
                          `}
                        >
                          {urgent ? "Urgent" : "Non Urgent"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{client.tableStartDate}</td>
                      <td className="px-4 py-3">{client.tableDestination}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenContact(client)}
                          className="
                            bg-[#8570EE]
                            text-white
                            font-semibold
                            px-10
                            py-2.5
                            rounded-xl
                            shadow-[0_4px_14px_rgba(133,112,238,0.35)]
                            transition
                            hover:bg-[#9d89ff]
                            hover:shadow-[0_6px_20px_rgba(133,112,238,0.45)]
                          "
                          disabled={loadingClient}
                        >
                          <PhoneCall className="h-4 w-4 inline mr-1" />
                          {loadingClient ? "Loading..." : "Contact"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && visible.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No clients match your filters.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  px-2 py-1 rounded-lg border text-sm
                  ${
                    currentPage === 1
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                  }
                `}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                const active = p === currentPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    className={`
                      px-3 py-1 rounded-lg text-sm
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
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                  px-2 py-1 rounded-lg border text-sm
                  ${
                    currentPage === totalPages
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

        {/* MOBILE CARD LIST (only on small screens) */}
        <div className="md:hidden space-y-3">
          {visible.map((client) => {
            const urgent = client.tableType === "urgent";
            return (
              <div
                key={client._id || client.clientId}
                className={`
                  rounded-2xl border shadow-md px-4 py-3 flex flex-col gap-2
                  ${urgent ? "bg-white border-slate-200" : "bg-white border-slate-200"}
                `}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-slate-400">
                      {client.tableId}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {client.tableName}
                    </div>
                  </div>
                  <span
                    className={`
                      px-2.5 py-1 rounded-full text-[11px] font-semibold border
                      ${
                        urgent
                          ? "bg-red-50 text-red-600 border-red-300"
                          : "bg-emerald-50 text-emerald-600 border-emerald-300"
                      }
                    `}
                  >
                    {urgent ? "Urgent" : "Non Urgent"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1">
                      <CalendarClock size={12} />
                      {client.tableStartDate || "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {client.tableDestination || "-"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenContact(client)}
                    className="
                      bg-[#8570EE]
                      text-white
                      font-semibold
                      px-4
                      py-2
                      rounded-xl
                      shadow-[0_4px_14px_rgba(133,112,238,0.35)]
                      transition
                      hover:bg-[#9d89ff]
                    "
                    disabled={loadingClient}
                  >
                    <PhoneCall className="h-4 w-4 inline mr-1" />
                    {loadingClient ? "Loading..." : "Contact"}
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && visible.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500 text-sm">
              No clients match your filters.
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500 text-sm">
              Loading...
            </div>
          )}

          {/* Pagination (mobile) */}
          <div className="mt-3 py-3 flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                px-2 py-1 rounded-lg border text-xs
                ${
                  currentPage === 1
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                }
              `}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const active = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
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
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                px-2 py-1 rounded-lg border text-xs
                ${
                  currentPage === totalPages
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

      {/* Contact Flow Modal */}
      <ContactFlowModal
        open={!!activeClient}
        onClose={() => setActiveClient(null)}
        client={activeClient}
        brand={{ color: "#8570EE" }}
        onCreateItinerary={handleCreateItinerary}
        onEditClient={handleEditClient}
        demoTours={DEMO_TOURS}
        // 🔹 new props for editing & saving client in left panel
        onSaveClient={handleSaveClient}
        savingClient={savingClient}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
