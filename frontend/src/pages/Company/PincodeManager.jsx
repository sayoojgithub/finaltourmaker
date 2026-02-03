// // src/pages/company/PincodeManager.jsx
// import React, { useEffect, useState } from "react";
// import API from "../../api";
// import { X, ArrowLeft, PlusCircle, AlertTriangle } from "lucide-react";
// import { toast } from "react-toastify";

// const parseSixDigit = (str) => {
//   const parts = String(str || "").split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
//   const unique = Array.from(new Set(parts));
//   const valid = unique.filter(p => /^\d{6}$/.test(p));
//   const invalid = unique.filter(p => !/^\d{6}$/.test(p));
//   return { valid, invalid };
// };

// export default function PincodeManager({ target, onBack }) {
//   const { type, id, name } = target;
//   const [loading, setLoading] = useState(true);
//   const [pincodes, setPincodes] = useState([]);
//   const [input, setInput] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   // NEW: conflict modal state
//   const [conflictOpen, setConflictOpen] = useState(false);
//   const [conflicts, setConflicts] = useState([]);

//   const base = `/company/${type}/${id}`;

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const { data } = await API.get(base);
//       setPincodes(data.assignedPincodes || []);
//     } catch (e) {
//       console.error(e?.response?.data || e);
//       toast.error(e?.response?.data?.message || "Failed to load pincodes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [id, type]);

//   const assign = async () => {
//     const { valid, invalid } = parseSixDigit(input);
//     if (invalid.length) {
//       toast.error(`Invalid pincodes: ${invalid.join(", ")}`);
//       return;
//     }
//     if (!valid.length) {
//       toast.error("Enter at least one 6-digit pincode");
//       return;
//     }
//     try {
//       setSubmitting(true);
//       const { data } = await API.post(`${base}/assign`, { pincodes: valid });
//       setPincodes(data.assignedPincodes || []);
//       setInput("");
//       toast.success("Pincodes assigned");
//     } catch (e) {
//       const msg = e?.response?.data?.message || "Failed to assign";
//       toast.error(msg);
//       const c = e?.response?.data?.conflicts;
//       if (Array.isArray(c) && c.length) {
//         setConflicts(c);
//         setConflictOpen(true);
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const remove = async (pin) => {
//     try {
//       const { data } = await API.post(`${base}/remove`, { pincodes: [pin] });
//       setPincodes(data.assignedPincodes || []);
//       toast.success("Removed");
//     } catch (e) {
//       toast.error(e?.response?.data?.message || "Failed to remove");
//     }
//   };

//   // Glass chip style
//   const chipCls =
//     "inline-flex items-center gap-2 px-3 py-1 rounded-full border " +
//     "backdrop-blur-md bg-white/30 border-white/50 " +
//     "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_rgba(133,112,238,0.15)] " +
//     "text-gray-800";

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-3">
//         <button
//           onClick={onBack}
//           className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-[0.5px] border-gray-300 hover:bg-gray-50"
//         >
//           <ArrowLeft size={16} /> Back
//         </button>
//         <h3 className="text-lg font-bold">
//           Pincode Management — {type === "branch" ? "Branch" : "Franchisee"}: {name}
//         </h3>
//       </div>

//       {/* Assign form */}
//       <div className="flex items-center gap-3">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Enter pincode(s), e.g. 673001, 673002"
//           className="w-full border-[0.5px] border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//         />
//         <button
//           onClick={assign}
//           disabled={submitting}
//           className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#8570EE] text-white hover:opacity-90 disabled:opacity-60"
//         >
//           <PlusCircle size={18} /> Assign
//         </button>
//       </div>

//       {/* Hint */}
//       <div className="flex items-center gap-2 text-sm text-gray-600">
//         <AlertTriangle size={14} />
//         <span>Only 6-digit pincodes. Duplicates within the company are not allowed.</span>
//       </div>

//       {/* Assigned list */}
//       <div className="border-[0.5px] border-gray-300 rounded-2xl p-4">
//         <div className="font-semibold mb-3">Assigned pincodes</div>
//         {loading ? (
//           <div>Loading…</div>
//         ) : pincodes.length === 0 ? (
//           <div className="text-gray-600">No pincodes assigned</div>
//         ) : (
//           <div className="flex flex-wrap gap-2">
//             {pincodes.map((pin) => (
//               <span key={pin} className={chipCls}>
//                 <span className="font-semibold">{pin}</span>
//                 <button
//                   className="p-1 rounded-full transition hover:bg-white/50"
//                   onClick={() => remove(pin)}
//                   title="Remove"
//                 >
//                   <X size={14} />
//                 </button>
//               </span>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Warning Popup (Modal) */}
//       {conflictOpen && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center"
//           aria-modal="true"
//           role="dialog"
//         >
//           {/* Backdrop */}
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() => setConflictOpen(false)}
//           />
//           {/* Panel */}
//           <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border p-6">
//             <div className="flex items-start gap-3">
//               <div className="mt-1">
//                 <AlertTriangle className="text-amber-500" size={22} />
//               </div>
//               <div className="flex-1">
//                 <h4 className="font-semibold text-lg">Pincodes already assigned</h4>
//                 <p className="text-sm text-gray-600 mt-1">
//                   The following pincodes are already assigned within your company:
//                 </p>

//                 <div className="mt-4 max-h-60 overflow-auto border-[0.5px] border-gray-300 rounded-lg">
//                   <table className="min-w-full text-sm">
//                     <thead className="bg-gray-50 text-left">
//                       <tr>
//                         <th className="px-3 py-2">Pincode</th>
//                         <th className="px-3 py-2">Assigned To</th>
//                         <th className="px-3 py-2">Type</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {conflicts.map((c, i) => (
//                         <tr key={`${c.pincode}-${c.id}-${i}`} className="border-t">
//                           <td className="px-3 py-2 font-semibold">{c.pincode}</td>
//                           <td className="px-3 py-2">{c.name}</td>
//                           <td className="px-3 py-2 capitalize">{c.type}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="mt-5 flex justify-end">
//                   <button
//                     onClick={() => setConflictOpen(false)}
//                     className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-[0.5px] border-gray-300 hover:bg-gray-50 "
//                   >
//                     <X size={14} /> Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// src/pages/company/PincodeManager.jsx
import React, { useEffect, useState } from "react";
import API from "../../api";
import { X, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

const THEME = "#8570EE";

const parseSixDigit = (str) => {
  const parts = String(str || "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(parts));
  const valid = unique.filter((p) => /^\d{6}$/.test(p));
  const invalid = unique.filter((p) => !/^\d{6}$/.test(p));
  return { valid, invalid };
};

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-end justify-between gap-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      {hint ? (
        <div className="text-[11px] text-slate-400 whitespace-nowrap">{hint}</div>
      ) : null}
    </div>
    {children}
  </div>
);

export default function PincodeManager({ target, onBack }) {
  const { type, id, name } = target;
  const [loading, setLoading] = useState(true);
  const [pincodes, setPincodes] = useState([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // conflict modal state
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  const base = `/company/${type}/${id}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(base);
      setPincodes(data.assignedPincodes || []);
    } catch (e) {
      console.error(e?.response?.data || e);
      toast.error(e?.response?.data?.message || "Failed to load pincodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id, type]);

  const assign = async () => {
    const { valid, invalid } = parseSixDigit(input);
    if (invalid.length) {
      toast.error(`Invalid pincodes: ${invalid.join(", ")}`);
      return;
    }
    if (!valid.length) {
      toast.error("Enter at least one 6-digit pincode");
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await API.post(`${base}/assign`, { pincodes: valid });
      setPincodes(data.assignedPincodes || []);
      setInput("");
      toast.success("Pincodes assigned");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to assign";
      toast.error(msg);
      const c = e?.response?.data?.conflicts;
      if (Array.isArray(c) && c.length) {
        setConflicts(c);
        setConflictOpen(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (pin) => {
    try {
      const { data } = await API.post(`${base}/remove`, { pincodes: [pin] });
      setPincodes(data.assignedPincodes || []);
      toast.success("Removed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove");
    }
  };

  const chipCls =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border " +
    "bg-white border-slate-200 " +
    "shadow-sm hover:shadow-md transition";

  const inputCls =
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
                {type === "branch" ? "Branch" : "Franchisee"}:{" "}
                <span className="font-semibold text-slate-700">{name}</span>
              </div>
            </div>

            <button
              onClick={onBack}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 rounded-2xl
                border border-slate-200
                bg-white
                shadow-sm hover:shadow-md
                hover:bg-slate-50
                transition
              "
              style={{ color: THEME }}
              type="button"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>

          {/* Assign */}
          <div className="rounded-[28px] border border-slate-200/70 bg-white overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Assign
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                Add pincodes
              </div>
            </div>

            <div className="p-5 md:p-6 bg-gradient-to-b from-white via-white to-purple-50/40 space-y-4">
              <Field label="Pincodes" hint="Comma or space separated">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter pincodes, e.g. 673001 673002"
                  className={inputCls}
                />
              </Field>

              <div className="flex items-start gap-2 text-sm text-slate-600">
                <AlertTriangle size={16} className="mt-0.5" />
                <span>
                  Only 6-digit pincodes. Duplicates within the company are not
                  allowed.
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={assign}
                  disabled={submitting}
                  className="
                    inline-flex items-center justify-center
                    px-5 py-3 rounded-2xl
                    text-sm font-extrabold text-white
                    shadow-[0_18px_45px_rgba(133,112,238,0.35)]
                    hover:opacity-95 transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                  style={{ background: THEME }}
                  type="button"
                >
                  {submitting ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>

          {/* Assigned list */}
          <div className="rounded-[28px] border border-slate-200/70 bg-white overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                View
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                Assigned pincodes
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Remove any pincode assigned to this {type}.
              </div>
            </div>

            <div className="p-5 md:p-6">
              {loading ? (
                <div className="text-slate-600">Loading…</div>
              ) : pincodes.length === 0 ? (
                <div className="text-slate-600">No pincodes assigned</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pincodes.map((pin) => (
                    <span key={pin} className={chipCls}>
                      <span className="font-semibold text-slate-800">{pin}</span>
                      <button
                        className="p-1 rounded-full transition hover:bg-slate-100"
                        onClick={() => remove(pin)}
                        title="Remove"
                        type="button"
                      >
                        <X size={14} className="text-slate-500" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conflict Modal */}
        {conflictOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setConflictOpen(false)}
            />
            <div
              className="
                relative z-10 w-full max-w-lg mx-3
                rounded-[28px]
                border border-white/25
                shadow-[0_30px_90px_rgba(15,23,42,0.55)]
                bg-white/92 backdrop-blur-2xl
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
              />
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <AlertTriangle className="text-amber-500" size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Warning
                    </div>
                    <h4 className="mt-1 font-extrabold text-xl text-slate-900">
                      Pincodes already assigned
                    </h4>
                    <p className="text-sm text-slate-600 mt-2">
                      These pincodes are already assigned within your company:
                    </p>

                    <div className="mt-4 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Pincode</th>
                            <th className="px-4 py-3">Assigned to</th>
                            <th className="px-4 py-3">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {conflicts.map((c, i) => (
                            <tr
                              key={`${c.pincode}-${c.id}-${i}`}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-3 font-semibold text-slate-900">
                                {c.pincode}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {c.name}
                              </td>
                              <td className="px-4 py-3 text-slate-700 capitalize">
                                {c.type}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => setConflictOpen(false)}
                        className="
                          inline-flex items-center gap-2
                          px-4 py-2.5 rounded-2xl
                          border border-slate-200
                          bg-white
                          hover:bg-slate-50
                          transition
                          font-semibold
                        "
                        type="button"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setConflictOpen(false)}
                    className="p-2 rounded-2xl hover:bg-slate-100 transition"
                    type="button"
                    aria-label="Close"
                  >
                    <X size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
