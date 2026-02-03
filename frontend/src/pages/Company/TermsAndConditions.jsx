

// import React, { useEffect, useState } from "react";
// import TextEditor from "./TextEditor";
// import API from "../../api";
// import { toast } from "react-toastify";

// const TermsAndConditions = () => {
//   const [formData, setFormData] = useState({
//     itineraryTerms: "",
//     invoiceTerms: "",
//     voucherTerms: "",
//   });

//   const [initialData, setInitialData] = useState({
//     itineraryTerms: "",
//     invoiceTerms: "",
//     voucherTerms: "",
//   });

//   useEffect(() => {
//     const fetchTerms = async () => {
//       try {
//         const res = await API.get("/company/terms");
//         const { itineraryTerms, invoiceTerms, voucherTerms } = res.data || {};
//         setFormData({ itineraryTerms, invoiceTerms, voucherTerms });
//         setInitialData({ itineraryTerms, invoiceTerms, voucherTerms });
//       } catch (err) {
//         toast.error(err.response?.data?.message || "Failed to load terms");
//       }
//     };

//     fetchTerms();
//   }, []);

//   const handleSave = async (type) => {
//     try {
//       const updatedTerms = {
//         ...initialData,
//         [type]: formData[type],
//       };

//       await API.put("/company/terms", updatedTerms);
//       setInitialData(updatedTerms);
//       toast.success(`${type} saved successfully`);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save");
//     }
//   };

//   const handleCancel = (type) => {
//     setFormData((prev) => ({
//       ...prev,
//       [type]: initialData[type],
//     }));
//   };

//   return (
//     <div className="max-w-[100rem] mx-auto p-6 bg-white rounded-3xl shadow-sm mt-6 mb-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-6">
//         Add Company Terms & Conditions
//       </h2>

//       <div className="space-y-6">
//         {/* Itinerary */}
//         <TextEditor
//           label="Enter Itinerary Terms & Conditions"
//           value={formData.itineraryTerms}
//           onChange={(val) =>
//             setFormData((prev) => ({ ...prev, itineraryTerms: val }))
//           }
//         />
//         <div className="flex gap-3 mb-1 justify-end">
//           <button
//             onClick={() => handleSave("itineraryTerms")}
//             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[#8570EE] rounded-lg hover:bg-[#6f5edc]"
//           >
//             Save Edit
//           </button>
//           <button
//             onClick={() => handleCancel("itineraryTerms")}
//             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//         </div>
//         <h2 className="text-xl font-semibold text-gray-800 mb-6">
//         Add Invoice Terms & Conditions
//       </h2>

//         {/* Invoice */}
//         <TextEditor
//           label="Enter Invoice Terms & Conditions"
//           value={formData.invoiceTerms}
//           onChange={(val) =>
//             setFormData((prev) => ({ ...prev, invoiceTerms: val }))
//           }
//         />
//         <div className="flex gap-3 mb-1 justify-end">
//           <button
//             onClick={() => handleSave("invoiceTerms")}
//             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[#8570EE] rounded-lg hover:bg-[#6f5edc]"
//           >
//             Save Edit
//           </button>
//           <button
//             onClick={() => handleCancel("invoiceTerms")}
//             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//         </div>
//         <h2 className="text-xl font-semibold text-gray-800 mb-6">
//         Add Voucher Terms & Conditions
//       </h2>

//         {/* Voucher */}
//         <TextEditor
//           label="Enter Voucher Terms & Conditions"
//           value={formData.voucherTerms}
//           onChange={(val) =>
//             setFormData((prev) => ({ ...prev, voucherTerms: val }))
//           }
//         />
//         <div className="flex gap-3 mb-6 justify-end">
//           <button
//             onClick={() => handleSave("voucherTerms")}
//             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[#8570EE] rounded-lg hover:bg-[#6f5edc]"
//           >
//             Save Edit
//           </button>
//           <button
//             onClick={() => handleCancel("voucherTerms")}
//             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TermsAndConditions;









// import React, { useEffect, useState } from "react";
// import TextEditor from "./TextEditor";
// import API from "../../api";
// import { toast } from "react-toastify";

// const THEME = "#8570EE";

// /* ✅ UI-only helpers OUTSIDE (prevents remount/focus loss) */
// const PrimaryBtn =
//   "inline-flex items-center justify-center px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white " +
//   "shadow-[0_18px_45px_rgba(133,112,238,0.35)] hover:opacity-95 transition active:scale-[0.99]";

// const SecondaryBtn =
//   "inline-flex items-center justify-center px-7 py-3.5 rounded-2xl text-sm font-extrabold " +
//   "border bg-white/80 hover:bg-purple-50/60 transition active:scale-[0.99]";

// const ShellCard =
//   "relative w-full rounded-[32px] overflow-hidden border border-slate-200/70 bg-white " +
//   "shadow-[0_30px_90px_rgba(15,23,42,0.14)]";

// const SoftCard =
//   "rounded-[28px] border border-slate-200/70 bg-white/80 backdrop-blur " +
//   "shadow-[0_18px_55px_rgba(15,23,42,0.10)] overflow-hidden";

// const DividerHeader = ({ eyebrow, title, desc }) => (
//   <div className="px-5 py-4 border-b border-slate-100 bg-white/70">
//     <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{eyebrow}</div>
//     <div className="mt-1 text-lg font-extrabold text-slate-900">{title}</div>
//     {desc ? <div className="mt-1 text-sm text-slate-500">{desc}</div> : null}
//   </div>
// );

// const Section = ({ eyebrow, title, desc, children, actions }) => (
//   <div className={SoftCard}>
//     <DividerHeader eyebrow={eyebrow} title={title} desc={desc} />
//     <div className="p-5 md:p-6 bg-gradient-to-b from-white via-white to-purple-50/40">
//       {children}
//       <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-end">{actions}</div>
//     </div>
//   </div>
// );

// const TermsAndConditions = () => {
//   const [formData, setFormData] = useState({
//     itineraryTerms: "",
//     invoiceTerms: "",
//     voucherTerms: "",
//   });

//   const [initialData, setInitialData] = useState({
//     itineraryTerms: "",
//     invoiceTerms: "",
//     voucherTerms: "",
//   });

//   useEffect(() => {
//     const fetchTerms = async () => {
//       try {
//         const res = await API.get("/company/terms");
//         const { itineraryTerms, invoiceTerms, voucherTerms } = res.data || {};
//         setFormData({ itineraryTerms, invoiceTerms, voucherTerms });
//         setInitialData({ itineraryTerms, invoiceTerms, voucherTerms });
//       } catch (err) {
//         toast.error(err.response?.data?.message || "Failed to load terms");
//       }
//     };

//     fetchTerms();
//   }, []);

//   const handleSave = async (type) => {
//     try {
//       const updatedTerms = {
//         ...initialData,
//         [type]: formData[type],
//       };

//       await API.put("/company/terms", updatedTerms);
//       setInitialData(updatedTerms);
//       toast.success(`${type} saved successfully`);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save");
//     }
//   };

//   const handleCancel = (type) => {
//     setFormData((prev) => ({
//       ...prev,
//       [type]: initialData[type],
//     }));
//   };

//   return (
//     <div className="w-full max-w-[100rem] mx-auto mt-6 mb-6 px-3 sm:px-4">
//       <div className={ShellCard}>
//         {/* Premium ribbon */}
//         <div
//           className="h-2 w-full"
//           style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
//         />

//         {/* subtle glows */}
//         <div
//           className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
//           style={{ background: THEME }}
//         />
//         <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-violet-400" />

//         <div className="relative p-6 md:p-8 space-y-7">
//           {/* Header */}
//           <div className="flex items-start justify-between gap-3 flex-wrap">
//             <div className="min-w-0">
//               <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
//                 Company
//               </div>
//               <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
//                 Terms & Conditions
//               </div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Manage terms content used in itineraries, invoices, and vouchers.
//               </div>
//             </div>

//             <div
//               className="
//                 h-11 px-4 rounded-2xl
//                 flex items-center
//                 border
//                 bg-white/70
//                 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]
//                 backdrop-blur
//                 text-sm font-semibold
//               "
//               style={{ color: THEME, borderColor: `${THEME}26` }}
//             >
//               Company Panel
//             </div>
//           </div>

//           {/* Sections */}
//           <div className="grid grid-cols-1 gap-6">
//             <Section
//               eyebrow="Itinerary"
//               title="Itinerary terms & conditions"
//               desc="This content appears in your itinerary documents."
//               actions={
//                 <>
//                   <button
//                     type="button"
//                     onClick={() => handleCancel("itineraryTerms")}
//                     className={SecondaryBtn}
//                     style={{ borderColor: THEME, color: THEME }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => handleSave("itineraryTerms")}
//                     className={PrimaryBtn}
//                     style={{ backgroundColor: THEME }}
//                   >
//                     Save
//                   </button>
//                 </>
//               }
//             >
//               <TextEditor
//                 label="Enter itinerary terms & conditions"
//                 value={formData.itineraryTerms}
//                 onChange={(val) =>
//                   setFormData((prev) => ({ ...prev, itineraryTerms: val }))
//                 }
//               />
//             </Section>

//             <Section
//               eyebrow="Invoice"
//               title="Invoice terms & conditions"
//               desc="This content appears in your invoice documents."
//               actions={
//                 <>
//                   <button
//                     type="button"
//                     onClick={() => handleCancel("invoiceTerms")}
//                     className={SecondaryBtn}
//                     style={{ borderColor: THEME, color: THEME }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => handleSave("invoiceTerms")}
//                     className={PrimaryBtn}
//                     style={{ backgroundColor: THEME }}
//                   >
//                     Save
//                   </button>
//                 </>
//               }
//             >
//               <TextEditor
//                 label="Enter invoice terms & conditions"
//                 value={formData.invoiceTerms}
//                 onChange={(val) =>
//                   setFormData((prev) => ({ ...prev, invoiceTerms: val }))
//                 }
//               />
//             </Section>

//             <Section
//               eyebrow="Voucher"
//               title="Voucher terms & conditions"
//               desc="This content appears in your voucher documents."
//               actions={
//                 <>
//                   <button
//                     type="button"
//                     onClick={() => handleCancel("voucherTerms")}
//                     className={SecondaryBtn}
//                     style={{ borderColor: THEME, color: THEME }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => handleSave("voucherTerms")}
//                     className={PrimaryBtn}
//                     style={{ backgroundColor: THEME }}
//                   >
//                     Save
//                   </button>
//                 </>
//               }
//             >
//               <TextEditor
//                 label="Enter voucher terms & conditions"
//                 value={formData.voucherTerms}
//                 onChange={(val) =>
//                   setFormData((prev) => ({ ...prev, voucherTerms: val }))
//                 }
//               />
//             </Section>
//           </div>

//           <div className="text-xs text-slate-500">
//             Tip: Keep terms short and clear. Changes are saved per section.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TermsAndConditions;










import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

const THEME = "#8570EE";

const sectionMeta = [
  { key: "itineraryTerms", title: "Itinerary terms", desc: "Used in itinerary documents." },
  { key: "invoiceTerms", title: "Invoice terms", desc: "Used in invoice documents." },
  { key: "voucherTerms", title: "Voucher terms", desc: "Used in voucher documents." },
  { key: "paymentPolicy", title: "Payment policy", desc: "Used in payment policy section." },
  { key: "cancellationPolicy", title: "Cancellation policy", desc: "Used in cancellation policy section." },
];

const inputBase =
  "w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm outline-none shadow-sm transition " +
  "focus:ring-2 focus:ring-[#8570EE]";

const card =
  "rounded-[28px] border border-slate-200/70 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.10)] overflow-hidden";

export default function TermsAndConditions() {
  const emptyShape = useMemo(
    () => ({
      itineraryTerms: [],
      invoiceTerms: [],
      voucherTerms: [],
      paymentPolicy: [],
      cancellationPolicy: [],
    }),
    []
  );

  const [formData, setFormData] = useState(emptyShape);
  const [initialData, setInitialData] = useState(emptyShape);

  const [draft, setDraft] = useState({
    itineraryTerms: "",
    invoiceTerms: "",
    voucherTerms: "",
    paymentPolicy: "",
    cancellationPolicy: "",
  });

  // ✅ Editing is per item using sectionKey + index (simple, stable)
  const [editing, setEditing] = useState({
    sectionKey: null,
    index: null,
    text: "",
  });

  const fetchTerms = async () => {
    try {
      const res = await API.get("/company/terms");
      const safe = { ...emptyShape, ...(res.data || {}) };

      const normalized = {
        itineraryTerms: Array.isArray(safe.itineraryTerms) ? safe.itineraryTerms : [],
        invoiceTerms: Array.isArray(safe.invoiceTerms) ? safe.invoiceTerms : [],
        voucherTerms: Array.isArray(safe.voucherTerms) ? safe.voucherTerms : [],
        paymentPolicy: Array.isArray(safe.paymentPolicy) ? safe.paymentPolicy : [],
        cancellationPolicy: Array.isArray(safe.cancellationPolicy) ? safe.cancellationPolicy : [],
      };

      setFormData(normalized);
      setInitialData(normalized);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load terms");
    }
  };

  useEffect(() => {
    fetchTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPoint = (key) => {
    const text = (draft[key] || "").trim();
    if (!text) return toast.error("Enter a point");

    // ✅ add locally without any fake _id; backend will generate on save
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], { text }],
    }));

    setDraft((prev) => ({ ...prev, [key]: "" }));
  };

  const startEdit = (sectionKey, index) => {
    const current = formData[sectionKey]?.[index];
    setEditing({
      sectionKey,
      index,
      text: current?.text || "",
    });
  };

  const cancelEdit = () => {
    setEditing({ sectionKey: null, index: null, text: "" });
  };

  const applyEdit = () => {
    const { sectionKey, index, text } = editing;
    if (sectionKey == null || index == null) return;

    const nextText = (text || "").trim();
    if (!nextText) return toast.error("Point cannot be empty");

    setFormData((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((p, i) =>
        i === index ? { ...p, text: nextText } : p
      ),
    }));

    cancelEdit();
  };

  const deletePoint = (sectionKey, index) => {
    // if deleting currently edited row, close edit
    setEditing((e) =>
      e.sectionKey === sectionKey && e.index === index
        ? { sectionKey: null, index: null, text: "" }
        : e
    );

    setFormData((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter((_, i) => i !== index),
    }));
  };

  const cancelSection = (key) => {
    setFormData((prev) => ({ ...prev, [key]: initialData[key] || [] }));
    setDraft((prev) => ({ ...prev, [key]: "" }));
    cancelEdit();
  };

  const saveAll = async () => {
    try {
      // ✅ IMPORTANT: do not send any _id, only {text}
      const payload = {
        itineraryTerms: formData.itineraryTerms.map((p) => ({ text: p.text })),
        invoiceTerms: formData.invoiceTerms.map((p) => ({ text: p.text })),
        voucherTerms: formData.voucherTerms.map((p) => ({ text: p.text })),
        paymentPolicy: formData.paymentPolicy.map((p) => ({ text: p.text })),
        cancellationPolicy: formData.cancellationPolicy.map((p) => ({ text: p.text })),
      };

      const res = await API.put("/company/terms", payload);
      const terms = res.data?.terms;

      const normalized = {
        itineraryTerms: terms?.itineraryTerms || [],
        invoiceTerms: terms?.invoiceTerms || [],
        voucherTerms: terms?.voucherTerms || [],
        paymentPolicy: terms?.paymentPolicy || [],
        cancellationPolicy: terms?.cancellationPolicy || [],
      };

      setFormData(normalized);
      setInitialData(normalized);
      cancelEdit();

      toast.success("Saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto mt-6 mb-6 px-3 sm:px-4">
      <div className="relative w-full rounded-[32px] overflow-hidden border border-slate-200/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
        <div
          className="h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
        />

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Company
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              Terms & Policies
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Add points, edit or delete points, then save.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {sectionMeta.map((s) => (
              <div key={s.key} className={card}>
                <div className="px-5 py-4 border-b border-slate-100 bg-white/70">
                  <div className="text-lg font-extrabold text-slate-900">{s.title}</div>
                  <div className="text-sm text-slate-500">{s.desc}</div>
                </div>

                <div className="p-5 md:p-6 bg-gradient-to-b from-white via-white to-purple-50/40">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      className={inputBase}
                      placeholder="Type a point and add"
                      value={draft[s.key]}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, [s.key]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => addPoint(s.key)}
                      className="px-5 py-3 rounded-2xl text-sm font-extrabold text-white hover:opacity-95 transition"
                      style={{ backgroundColor: THEME }}
                    >
                      Add
                    </button>
                  </div>

                  {/* Points */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
                    {formData[s.key].length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No points added yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-200">
                        {formData[s.key].map((item, index) => {
                          const isEditing =
                            editing.sectionKey === s.key && editing.index === index;

                          return (
                            <li
                              key={item._id ? String(item._id) : `${s.key}-${index}`}
                              className="px-4 py-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 w-7 h-7 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-xs font-extrabold text-slate-700">
                                  {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  {!isEditing ? (
                                    <div className="text-sm text-slate-800 font-semibold leading-relaxed break-words">
                                      {item.text}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <textarea
                                        value={editing.text}
                                        onChange={(e) =>
                                          setEditing((p) => ({
                                            ...p,
                                            text: e.target.value,
                                          }))
                                        }
                                        rows={3}
                                        className={
                                          "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none " +
                                          "focus:ring-2 focus:ring-[#8570EE]"
                                        }
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          type="button"
                                          onClick={cancelEdit}
                                          className="px-5 py-2 rounded-2xl border bg-white text-sm font-bold"
                                          style={{ borderColor: THEME, color: THEME }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={applyEdit}
                                          className="px-5 py-2 rounded-2xl text-sm font-bold text-white"
                                          style={{ backgroundColor: THEME }}
                                        >
                                          Update
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {!isEditing && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => startEdit(s.key, index)}
                                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deletePoint(s.key, index)}
                                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-red-600 hover:bg-red-50 transition"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => cancelSection(s.key)}
                      className="px-6 py-3 rounded-2xl text-sm font-extrabold border bg-white/80 hover:bg-purple-50/60 transition"
                      style={{ borderColor: THEME, color: THEME }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={saveAll}
                      className="px-6 py-3 rounded-2xl text-sm font-extrabold text-white hover:opacity-95 transition"
                      style={{ backgroundColor: THEME }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Tip: Add short points. Save after finishing changes.
          </div>
        </div>
      </div>
    </div>
  );
}


