// // src/pages/company/PincodeManagement.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { Pencil } from "lucide-react";
// import API from "../../api";

// const PAGE_SIZE = 2;

// export default function PincodeManagement({ onOpenTarget }) {
//   const [mode, setMode] = useState("branch"); // 'branch' | 'franchisee'
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [rows, setRows] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

//   useEffect(() => {
//     let isMounted = true;
//     setLoading(true);
//     const url =
//       mode === "branch"
//         ? `/company/branches?search=${encodeURIComponent(search)}&page=${page}&limit=${PAGE_SIZE}`
//         : `/company/franchisees?search=${encodeURIComponent(search)}&page=${page}&limit=${PAGE_SIZE}`;

//     API.get(url)
//       .then(({ data }) => {
//         if (!isMounted) return;
//         setRows(data.items || []);
//         setTotal(data.total || 0);
//       })
//       .catch(() => {
//         if (!isMounted) return;
//         setRows([]);
//         setTotal(0);
//       })
//       .finally(() => isMounted && setLoading(false));

//     return () => {
//       isMounted = false;
//     };
//   }, [mode, search, page]);

//   return (
//     <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
//       {/* Centered selector styled like Active/Inactive radios */}
//       <div className="w-full flex justify-center mt-1 mb-5">
//         <div className="flex gap-3">
//           <label className="flex items-center gap-2 text-black font-medium cursor-pointer select-none">
//             <input
//               type="radio"
//               name="mode"
//               value="branch"
//               checked={mode === "branch"}
//               onChange={() => { setMode("branch"); setPage(1); }}
//               className="accent-purple-500"
//             />
//             <span>Branch</span>
//           </label>
//           <label className="flex items-center gap-2 text-black font-medium cursor-pointer select-none">
//             <input
//               type="radio"
//               name="mode"
//               value="franchisee"
//               checked={mode === "franchisee"}
//               onChange={() => { setMode("franchisee"); setPage(1); }}
//               className="accent-purple-500"
//             />
//             <span>Franchisee</span>
//           </label>
//         </div>
//       </div>

//       {/* Search input (same feel as CreateBranch) */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder={mode === "branch" ? "Search by Branch Name" : "Search by Franchisee Name"}
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setPage(1);
//           }}
//           className="w-full max-w-sm border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//         />
//       </div>

//       {/* Table styled exactly like CreateBranch */}
//       <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
//         <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//           <tr>
//             <th className="px-6 py-4">Sl No</th>
//             <th className="px-6 py-4">{mode === "branch" ? "Branch Name" : "Franchisee Name"}</th>
//             <th className="px-6 py-4">Email</th>
//             <th className="px-6 py-4">Contact Number</th>
//             <th className="px-6 py-4">Status</th>
//             <th className="px-6 py-4 text-center">Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {loading ? (
//             <tr><td className="px-6 py-6" colSpan={6}>Loading…</td></tr>
//           ) : rows.length === 0 ? (
//             <tr><td className="px-6 py-6" colSpan={6}>No records</td></tr>
//           ) : (
//             rows.map((row, idx) => {
//               const name = mode === "branch" ? row.branchName : row.franchiseeName;
//               const isActive = row.status === "Active";
//               return (
//                 <tr key={row._id} className="border-b hover:bg-gray-50">
//                   <td className="px-6 py-4">{(page - 1) * PAGE_SIZE + idx + 1}</td>
//                   <td className="px-6 py-4 font-semibold">{name}</td>
//                   <td className="px-6 py-4">{row.email}</td>
//                   <td className="px-6 py-4 font-semibold">{row.contactNumber}</td>
//                   <td className="px-6 py-4">
//                     {isActive ? (
//                       <span className="inline-flex items-center text-green-600 text-xs font-medium bg-green-100 rounded-full px-3 py-1">
//                         ● Active
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center text-gray-600 text-xs font-medium bg-gray-200 rounded-full px-3 py-1">
//                         ● Inactive
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <button
//                       className="text-gray-500 hover:text-gray-700"
//                       onClick={() =>
//                         onOpenTarget({
//                           type: mode,
//                           id: row._id,
//                           name,
//                         })
//                       }
//                       title="Manage pincodes"
//                     >
//                       <Pencil className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>

//       {/* Numbered pagination (same as CreateBranch) */}
//       {pages > 1 && (
//         <div className="flex justify-end items-center gap-1 mt-6 pr-2 text-sm text-gray-500">
//           {Array.from({ length: pages }, (_, i) => (
//             <button
//               key={i}
//               onClick={() => setPage(i + 1)}
//               className={`px-3 py-1 rounded-full ${
//                 page === i + 1 ? "bg-gray-900 text-white" : "hover:bg-gray-200"
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// src/pages/company/PincodeManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import API from "../../api";

const THEME = "#8570EE";
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
        ? `/company/branches?search=${encodeURIComponent(
            search
          )}&page=${page}&limit=${PAGE_SIZE}`
        : `/company/franchisees?search=${encodeURIComponent(
            search
          )}&page=${page}&limit=${PAGE_SIZE}`;

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

  const baseInput =
    "w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 text-sm text-slate-900 outline-none " +
    "transition shadow-[0_1px_0_rgba(15,23,42,0.04)] placeholder:text-slate-400 " +
    "hover:border-slate-300 focus:border-[#8570EE]/45 focus:ring-4 focus:ring-[#8570EE]/15";

  return (
    <div className="w-full max-w-[100rem] mx-auto">
      <div
        className="
          relative
          rounded-3xl overflow-hidden
          border border-slate-200/70
          bg-white
          shadow-[0_24px_70px_rgba(15,23,42,0.12)]
        "
      >
        {/* ✅ Blue glows (top-right + bottom-left) */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-[320px] w-[320px] rounded-full bg-[#8570EE]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full bg-[#8570EE]/20 blur-[120px]" />

        <div
          className="h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
        />

        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Company
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
                Pincode Management
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Choose Branch or Franchisee and manage their pincodes.
              </div>
            </div>

            <div
              className="
                rounded-2xl border border-slate-200 bg-white
                px-4 py-2.5
                text-sm font-semibold
              "
              style={{ color: THEME, borderColor: `${THEME}26` }}
            >
              {mode === "branch" ? "Branch" : "Franchisee"}
            </div>
          </div>

          {/* Mode */}
          <div className="w-full flex justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-2 text-center">
                Mode
              </div>
              <div className="flex gap-10 justify-center">
                <label className="flex items-center gap-2 text-slate-800 font-semibold cursor-pointer select-none">
                  <input
                    type="radio"
                    name="mode"
                    value="branch"
                    checked={mode === "branch"}
                    onChange={() => {
                      setMode("branch");
                      setPage(1);
                    }}
                    className="accent-[#8570EE]"
                  />
                  <span>Branch</span>
                </label>

                <label className="flex items-center gap-2 text-slate-800 font-semibold cursor-pointer select-none">
                  <input
                    type="radio"
                    name="mode"
                    value="franchisee"
                    checked={mode === "franchisee"}
                    onChange={() => {
                      setMode("franchisee");
                      setPage(1);
                    }}
                    className="accent-[#8570EE]"
                  />
                  <span>Franchisee</span>
                </label>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="w-full sm:w-[360px]">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
              Search
            </div>
            <input
              type="text"
              placeholder={
                mode === "branch"
                  ? "Search by Branch Name"
                  : "Search by Franchisee Name"
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={baseInput}
            />
          </div>

          {/* Table */}
          <div className="rounded-[28px] border border-slate-200/70 bg-white overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-700 min-w-[760px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <th className="px-6 py-4">Sl No</th>
                    <th className="px-6 py-4">
                      {mode === "branch" ? "Branch Name" : "Franchisee Name"}
                    </th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Contact Number</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-6 py-8 text-slate-600" colSpan={6}>
                        Loading…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-slate-600" colSpan={6}>
                        No records
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => {
                      const name =
                        mode === "branch" ? row.branchName : row.franchiseeName;
                      const isActive = row.status === "Active";
                      return (
                        <tr
                          key={row._id}
                          className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                        >
                          <td className="px-6 py-4 font-semibold">
                            {(page - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td className="px-6 py-4 font-semibold">{name}</td>
                          <td className="px-6 py-4">{row.email}</td>
                          <td className="px-6 py-4 font-semibold">
                            {row.contactNumber}
                          </td>
                          <td className="px-6 py-4">
                            {isActive ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-600 border-slate-200">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              className="
                                inline-flex items-center justify-center
                                h-10 w-10 rounded-2xl
                                border border-slate-200
                                bg-white
                                shadow-sm
                                hover:shadow-md
                                hover:bg-slate-50
                                transition
                              "
                              onClick={() =>
                                onOpenTarget({
                                  type: mode,
                                  id: row._id,
                                  name,
                                })
                              }
                              title="Manage pincodes"
                              aria-label="Manage pincodes"
                            >
                              <Pencil className="w-4 h-4 text-slate-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="py-4 px-4 flex items-center justify-end gap-2 bg-white border-t border-slate-200">
                {Array.from({ length: pages }, (_, i) => {
                  const isActive = page === i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={[
                        "h-9 min-w-[36px] px-3 rounded-2xl text-sm font-semibold border transition",
                        isActive
                          ? "text-white shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                      ].join(" ")}
                      style={
                        isActive
                          ? { backgroundColor: THEME, borderColor: THEME }
                          : undefined
                      }
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
