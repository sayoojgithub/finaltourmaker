
// import React, { useEffect, useMemo, useState } from "react";
// import API from "../../api";
// import { toast } from "react-toastify";

// const THEME = "#1a73e8"; // Google blue

// const money = (n) => {
//   const x = Number(n || 0);
//   return Number.isFinite(x) ? x.toLocaleString("en-IN") : "0";
// };

// // Tiny inline icons (no deps)
// const Icon = {
//   Lock: ({ className }) => (
//     <svg viewBox="0 0 24 24" className={className} fill="none">
//       <path
//         d="M7.5 10V8.25C7.5 5.764 9.514 3.75 12 3.75c2.486 0 4.5 2.014 4.5 4.5V10"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//       <path
//         d="M6.5 10h11a2 2 0 0 1 2 2v6.25a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M12 14.25v2.75"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//     </svg>
//   ),
//   Search: ({ className }) => (
//     <svg viewBox="0 0 24 24" className={className} fill="none">
//       <path
//         d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
//         stroke="currentColor"
//         strokeWidth="1.8"
//       />
//       <path
//         d="M16.7 16.7 21 21"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//     </svg>
//   ),
//   Chevron: ({ className }) => (
//     <svg viewBox="0 0 24 24" className={className} fill="none">
//       <path
//         d="M9 6l6 6-6 6"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   ),
//   Receipt: ({ className }) => (
//     <svg viewBox="0 0 24 24" className={className} fill="none">
//       <path
//         d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M9 8h6M9 12h6M9 16h4"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//     </svg>
//   ),
// };

// export default function Pay() {
//   const [form, setForm] = useState({
//     mobileNumber: "",
//     email: "",
//     tourStartDate: "",
//   });

//   const [loadingFind, setLoadingFind] = useState(false);
//   const [matches, setMatches] = useState([]);
//   const [selected, setSelected] = useState(null); // selected match object
//   const [amount, setAmount] = useState("");
//   const [creating, setCreating] = useState(false);

//   const [history, setHistory] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);

//   // Read order result from query params after redirect back
//   useEffect(() => {
//     const url = new URL(window.location.href);
//     const orderId = url.searchParams.get("orderId");
//     const status = url.searchParams.get("status");
//     if (orderId && status) {
//       if (status === "SUCCESS") toast.success(`Payment success (Order: ${orderId})`);
//       else if (status === "FAILED") toast.error(`Payment failed (Order: ${orderId})`);
//       else toast.info(`Payment status: ${status} (Order: ${orderId})`);
//     }
//   }, []);

//   const canPay = useMemo(() => {
//     if (!selected) return false;
//     const bal = Number(selected.balance || 0);
//     const amt = Math.round(Number(amount || 0));
//     return amt > 0 && amt <= bal;
//   }, [selected, amount]);

//   const loadHistory = async (sel) => {
//     if (!sel?.clientObjectId || !sel?.paymentToken) return;
//     try {
//       setHistoryLoading(true);
//       const res = await API.get(`/payments/public/client/${sel.clientObjectId}/history`, {
//         params: { paymentToken: sel.paymentToken },
//       });
//       setHistory(res.data?.history || []);
//     } catch (e) {
//       setHistory([]);
//     } finally {
//       setHistoryLoading(false);
//     }
//   };

//   const onFind = async () => {
//     try {
//       setLoadingFind(true);
//       setSelected(null);
//       setMatches([]);
//       setHistory([]);

//       const payload = {
//         mobileNumber: form.mobileNumber,
//         email: form.email,
//         tourStartDate: form.tourStartDate,
//       };

//       const res = await API.post("/payments/public/find-clients", payload);
//       const list = res.data?.matches || [];

//       setMatches(list);
//       if (list.length === 1) {
//         setSelected(list[0]);
//         setAmount("");
//         await loadHistory(list[0]);
//       }
//       toast.success(`${list.length} match found`);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || err.message || "Find failed");
//     } finally {
//       setLoadingFind(false);
//     }
//   };

//   const onSelect = async (m) => {
//     setSelected(m);
//     setAmount("");
//     await loadHistory(m);
//   };

//   const onPay = async () => {
//     if (!selected) return toast.error("Select a client first");
//     if (!canPay) return toast.error("Enter a valid amount (≤ balance)");

//     try {
//       setCreating(true);

//       const res = await API.post("/payments/public/hdfc/create-session", {
//         clientObjectId: selected.clientObjectId,
//         amountRupees: Math.round(Number(amount)),
//         paymentToken: selected.paymentToken,
//       });

//       const link = res.data?.paymentLink;
//       if (!link) throw new Error("No payment link received");

//       // Redirect to HDFC hosted payment page
//       window.location.href = link;
//     } catch (err) {
//       toast.error(err?.response?.data?.message || err.message || "Failed to start payment");
//     } finally {
//       setCreating(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F6F8FC] text-slate-900">
//       {/* Top App Bar (Google Pay-ish) */}
//       <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
//         <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div
//               className="h-9 w-9 rounded-full grid place-items-center"
//               style={{ background: "rgba(26,115,232,0.10)", color: THEME }}
//             >
//               <Icon.Lock className="h-5 w-5" />
//             </div>
//             <div>
//               <div className="text-[11px] text-slate-500 leading-none">Secure payment</div>
//               <div className="text-sm font-extrabold leading-tight">Google Pay style checkout</div>
//             </div>
//           </div>

//           <div className="hidden sm:flex items-center gap-2">
//             <span className="text-[11px] text-slate-500">Protected by</span>
//             <span className="text-[11px] font-extrabold text-slate-700">HDFC SmartGateway</span>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
//         {/* Card: Identify booking */}
//         <Card>
//           <div className="flex items-start justify-between gap-3">
//             <div>
//               <div className="text-[12px] text-slate-500">Step 1</div>
//               <div className="text-lg font-extrabold">Find your booking</div>
//               <div className="mt-1 text-sm text-slate-600">
//                 Enter details to fetch your balance securely.
//               </div>
//             </div>
//             <TrustPill />
//           </div>

//           <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
//             <GPayInput
//               label="Mobile number"
//               value={form.mobileNumber}
//               onChange={(v) => setForm((p) => ({ ...p, mobileNumber: v }))}
//               placeholder="e.g. 9876543210"
//               inputMode="numeric"
//             />
//             <GPayInput
//               label="Email"
//               value={form.email}
//               onChange={(v) => setForm((p) => ({ ...p, email: v }))}
//               placeholder="name@example.com"
//             />
//             <GPayInput
//               label="Tour start date"
//               type="date"
//               value={form.tourStartDate}
//               onChange={(v) => setForm((p) => ({ ...p, tourStartDate: v }))}
//             />
//           </div>

//           <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
//             <div className="flex items-center gap-2 text-xs text-slate-500">
//               <Icon.Lock className="h-4 w-4" />
//               <span>We never store your payment details on this page.</span>
//             </div>

//             <button
//               onClick={onFind}
//               disabled={loadingFind}
//               className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3
//                          font-extrabold text-white shadow-sm transition
//                          disabled:opacity-60 disabled:cursor-not-allowed"
//               style={{
//                 background: THEME,
//                 boxShadow: "0 10px 22px rgba(26,115,232,0.25)",
//               }}
//             >
//               <Icon.Search className="h-5 w-5" />
//               {loadingFind ? "Finding..." : "Find Booking"}
//             </button>
//           </div>
//         </Card>

//         {/* Match list (multiple) */}
//         {matches.length > 1 && (
//           <Card>
//             <div className="flex items-start justify-between gap-3">
//               <div>
//                 <div className="text-[12px] text-slate-500">Step 2</div>
//                 <div className="text-base font-extrabold">Select a booking</div>
//                 <div className="mt-1 text-sm text-slate-600">
//                   We found multiple matches. Choose the correct one.
//                 </div>
//               </div>
//               <div className="text-xs text-slate-500">
//                 {matches.length} results
//               </div>
//             </div>

//             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
//               {matches.map((m) => {
//                 const active = selected?.clientObjectId === m.clientObjectId;
//                 return (
//                   <button
//                     key={m.clientObjectId}
//                     onClick={() => onSelect(m)}
//                     className={`w-full text-left rounded-2xl border p-4 transition
//                       ${active ? "bg-white border-blue-200" : "bg-white/70 border-slate-200 hover:bg-white"}`}
//                     style={
//                       active
//                         ? { boxShadow: "0 10px 24px rgba(26,115,232,0.12)" }
//                         : undefined
//                     }
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div>
//                         <div className="text-[11px] text-slate-500">
//                           Client ID{" "}
//                           <span className="font-mono text-slate-600">
//                             {m.clientId || "-"}
//                           </span>
//                         </div>
//                         <div className="mt-1 text-sm font-extrabold">
//                           {m.name || "Client"}
//                         </div>
//                         <div className="mt-1 text-xs text-slate-600">
//                           Tour:{" "}
//                           <span className="font-semibold">
//                             {m.confirmedTourName || m.confirmedTourType || "-"}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <span
//                           className="text-[11px] font-extrabold rounded-full px-3 py-1 border"
//                           style={{
//                             background: "rgba(26,115,232,0.08)",
//                             borderColor: "rgba(26,115,232,0.22)",
//                             color: THEME,
//                           }}
//                         >
//                           Balance ₹ {money(m.balance)}
//                         </span>
//                         <Icon.Chevron className="h-5 w-5 text-slate-400" />
//                       </div>
//                     </div>

//                     <div className="mt-3 grid grid-cols-3 gap-2">
//                       <GStat label="Total" value={`₹ ${money(m.totalAmountToBePaid)}`} />
//                       <GStat label="Paid" value={`₹ ${money(m.totalAmountPaid)}`} />
//                       <GStat
//                         label="Balance"
//                         value={`₹ ${money(m.balance)}`}
//                         emphasis
//                       />
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </Card>
//         )}

//         {/* Selected summary + Pay (Google Pay-like card + right rail history) */}
//         {selected && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//             {/* Left: Checkout */}
//             <Card className="lg:col-span-2">
//               <div className="flex items-start justify-between gap-3">
//                 <div>
//                   <div className="text-[12px] text-slate-500">Step 3</div>
//                   <div className="text-lg font-extrabold">Confirm & pay</div>
//                   <div className="mt-1 text-sm text-slate-600">
//                     Review your booking and enter the amount to pay.
//                   </div>
//                 </div>
//                 <TrustPill />
//               </div>

//               {/* Selected booking "merchant/recipient" block */}
//               <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
//                 <div className="flex items-start justify-between gap-3">
//                   <div>
//                     <div className="text-xs text-slate-500">Paying for</div>
//                     <div className="mt-1 text-sm font-extrabold">
//                       {selected.name || "Client"}{" "}
//                       <span className="text-xs font-mono text-slate-500">
//                         ({selected.clientId || "-"})
//                       </span>
//                     </div>
//                     <div className="mt-1 text-xs text-slate-600">
//                       Tour:{" "}
//                       <span className="font-semibold">
//                         {selected.confirmedTourName || selected.confirmedTourType || "-"}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <div className="text-xs text-slate-500">Available balance</div>
//                     <div
//                       className="mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border"
//                       style={{
//                         borderColor: "rgba(26,115,232,0.22)",
//                         background: "rgba(26,115,232,0.08)",
//                         color: THEME,
//                       }}
//                     >
//                       ₹ {money(selected.balance)}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
//                   <InfoTile label="Total amount" value={`₹ ${money(selected.totalAmountToBePaid)}`} />
//                   <InfoTile label="Already paid" value={`₹ ${money(selected.totalAmountPaid)}`} />
//                   <InfoTile
//                     label="Balance"
//                     value={`₹ ${money(selected.balance)}`}
//                     emphasis
//                   />
//                 </div>
//               </div>

//               {/* Amount + Pay button (GPay style) */}
//               <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
//                 <GPayInput
//                   label="Amount to pay (₹)"
//                   type="number"
//                   value={amount}
//                   onChange={(v) => setAmount(v)}
//                   placeholder={`Max ₹${money(selected.balance)}`}
//                 />

//                 <button
//                   onClick={onPay}
//                   disabled={!canPay || creating}
//                   className="rounded-full px-6 py-3 font-extrabold text-white transition
//                              disabled:opacity-60 disabled:cursor-not-allowed
//                              flex items-center justify-center gap-2"
//                   style={{
//                     background: !canPay || creating ? "rgba(26,115,232,0.55)" : THEME,
//                     boxShadow: canPay ? "0 12px 26px rgba(26,115,232,0.28)" : "none",
//                   }}
//                 >
//                   <Icon.Lock className="h-5 w-5" />
//                   {creating ? "Redirecting…" : "Pay securely"}
//                 </button>
//               </div>

//               <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-3">
//                 <div className="flex items-start gap-2">
//                   <Icon.Lock className="h-4 w-4 text-slate-600 mt-0.5" />
//                   <div className="text-[12px] text-slate-600">
//                     You’ll be redirected to <span className="font-bold">HDFC SmartGateway</span> to complete the payment.
//                     After payment, you’ll return here automatically.
//                   </div>
//                 </div>
//               </div>
//             </Card>

//             {/* Right: History */}
//             <Card>
//               <div className="flex items-start justify-between">
//                 <div>
//                   <div className="text-[12px] text-slate-500">Receipts</div>
//                   <div className="text-base font-extrabold">Payment history</div>
//                   <div className="mt-1 text-sm text-slate-600">Last 30 transactions</div>
//                 </div>
//                 <div
//                   className="h-9 w-9 rounded-full grid place-items-center border border-slate-200 bg-white"
//                   title="History"
//                 >
//                   <Icon.Receipt className="h-5 w-5 text-slate-600" />
//                 </div>
//               </div>

//               <div className="mt-4 space-y-2 max-h-[380px] overflow-auto pr-1">
//                 {historyLoading ? (
//                   <div className="text-sm text-slate-500 py-8 text-center">Loading…</div>
//                 ) : history.length === 0 ? (
//                   <div className="text-sm text-slate-500 py-8 text-center">No payments yet</div>
//                 ) : (
//                   history.map((h) => (
//                     <div
//                       key={h.orderId}
//                       className="rounded-2xl border border-slate-200 bg-white p-3"
//                     >
//                       <div className="text-[11px] text-slate-500 font-mono break-all">
//                         {h.orderId}
//                       </div>

//                       <div className="mt-2 flex items-center justify-between gap-2">
//                         <div className="text-sm font-extrabold">
//                           ₹ {money(h.amountRupees)}
//                         </div>
//                         <span
//                           className="text-[11px] font-extrabold rounded-full px-2.5 py-1 border"
//                           style={{
//                             borderColor:
//                               h.status === "SUCCESS"
//                                 ? "rgba(22,163,74,0.35)"
//                                 : h.status === "FAILED"
//                                   ? "rgba(244,63,94,0.35)"
//                                   : "rgba(100,116,139,0.35)",
//                             background:
//                               h.status === "SUCCESS"
//                                 ? "rgba(22,163,74,0.10)"
//                                 : h.status === "FAILED"
//                                   ? "rgba(244,63,94,0.10)"
//                                   : "rgba(100,116,139,0.10)",
//                             color:
//                               h.status === "SUCCESS"
//                                 ? "rgb(22,163,74)"
//                                 : h.status === "FAILED"
//                                   ? "rgb(244,63,94)"
//                                   : "rgb(71,85,105)",
//                           }}
//                         >
//                           {h.status}
//                         </span>
//                       </div>

//                       <div className="mt-1 text-[11px] text-slate-500">
//                         Credited:{" "}
//                         {h.credited ? (
//                           <span className="font-semibold text-slate-700">
//                             Yes (₹{money(h.creditedAmountRupees)})
//                           </span>
//                         ) : (
//                           "No"
//                         )}
//                       </div>

//                       {h.failureReason ? (
//                         <div className="mt-1 text-[11px] text-rose-600">
//                           {h.failureReason}
//                         </div>
//                       ) : null}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </Card>
//           </div>
//         )}
//       </div>

//       {/* Footer reassurance */}
//       <div className="mt-8 border-t border-slate-200 bg-white">
//         <div className="max-w-4xl mx-auto px-4 py-5 text-xs text-slate-600 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
//           <div className="flex items-center gap-2">
//             <Icon.Lock className="h-4 w-4" />
//             <span>
//               Secure redirect to bank gateway • No card/UPI details stored here
//             </span>
//           </div>
//           <div className="text-slate-500">
//             If payment completes but balance doesn’t update, refresh and check history.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------- UI atoms (no logic changes) ---------- */

// function Card({ children, className = "" }) {
//   return (
//     <div
//       className={`rounded-3xl bg-white border border-slate-200 shadow-sm ${className}`}
//       style={{ boxShadow: "0 12px 30px rgba(15,23,42,0.06)" }}
//     >
//       <div className="p-5">{children}</div>
//     </div>
//   );
// }

// function TrustPill() {
//   return (
//     <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
//       <span
//         className="h-2 w-2 rounded-full"
//         style={{ background: "rgb(34,197,94)" }}
//       />
//       <span className="text-[11px] font-extrabold text-slate-700">Verified</span>
//       <span className="text-[11px] text-slate-500">SSL secured</span>
//     </div>
//   );
// }

// function GPayInput({
//   label,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   inputMode,
// }) {
//   return (
//     <label className="block">
//       <div className="text-[12px] font-semibold text-slate-700 mb-1">{label}</div>
//       <input
//         type={type}
//         value={value}
//         inputMode={inputMode}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm
//                    outline-none transition"
//         style={{
//           boxShadow: "inset 0 1px 0 rgba(15,23,42,0.03)",
//         }}
//         onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(26,115,232,0.55)")}
//         onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(226,232,240,1)")}
//       />
//     </label>
//   );
// }

// function GStat({ label, value, emphasis }) {
//   return (
//     <div
//       className="rounded-2xl border p-3"
//       style={{
//         borderColor: emphasis ? "rgba(26,115,232,0.22)" : "rgba(226,232,240,1)",
//         background: emphasis ? "rgba(26,115,232,0.06)" : "rgba(248,250,252,1)",
//       }}
//     >
//       <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
//         {label}
//       </div>
//       <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
//     </div>
//   );
// }

// function InfoTile({ label, value, emphasis }) {
//   return (
//     <div
//       className="rounded-2xl border p-4"
//       style={{
//         borderColor: emphasis ? "rgba(26,115,232,0.22)" : "rgba(226,232,240,1)",
//         background: emphasis ? "rgba(26,115,232,0.06)" : "rgba(248,250,252,1)",
//       }}
//     >
//       <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
//         {label}
//       </div>
//       <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

const THEME = "#1a73e8"; // Google blue

const money = (n) => {
  const x = Number(n || 0);
  return Number.isFinite(x) ? x.toLocaleString("en-IN") : "0";
};

// Tiny inline icons (no deps)
const Icon = {
  Lock: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M7.5 10V8.25C7.5 5.764 9.514 3.75 12 3.75c2.486 0 4.5 2.014 4.5 4.5V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 10h11a2 2 0 0 1 2 2v6.25a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 14.25v2.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Search: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.7 16.7 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Chevron: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Receipt: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export default function Pay() {
  const [paymentCode, setPaymentCode] = useState("");

  const [loadingFind, setLoadingFind] = useState(false);
  const [selected, setSelected] = useState(null);

  // token from find-by-code (otpVerified: false)
  const [token, setToken] = useState("");

  // OTP
  const [otp, setOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // verified token (otpVerified: true)
  const [verifiedToken, setVerifiedToken] = useState("");

  // amounts unlocked
  const [amounts, setAmounts] = useState(null);

  // pay inputs
  const [amountToPay, setAmountToPay] = useState("");
  const [creating, setCreating] = useState(false);

  // history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Read order result from query params after redirect back
  useEffect(() => {
    const url = new URL(window.location.href);
    const orderId = url.searchParams.get("orderId");
    const status = url.searchParams.get("status");
    if (orderId && status) {
      if (status === "SUCCESS") toast.success(`Payment success (Order: ${orderId})`);
      else if (status === "FAILED") toast.error(`Payment failed (Order: ${orderId})`);
      else toast.info(`Payment status: ${status} (Order: ${orderId})`);
    }
  }, []);

  const unlocked = !!verifiedToken && !!amounts;

  const canPay = useMemo(() => {
    if (!unlocked) return false;
    const bal = Number(amounts?.balance || 0);
    const amt = Math.round(Number(amountToPay || 0));
    return amt > 0 && amt <= bal;
  }, [unlocked, amounts, amountToPay]);

  const resetAll = () => {
    setSelected(null);
    setToken("");
    setVerifiedToken("");
    setAmounts(null);
    setOtp("");
    setOtpSentTo("");
    setHistory([]);
    setAmountToPay("");
  };

  const onFindByCode = async () => {
    try {
      setLoadingFind(true);
      resetAll();

      const res = await API.post("/payments/public/find-by-code", {
        paymentCode: paymentCode.trim(),
      });

      const c = res.data?.client;
      const t = res.data?.paymentToken;

      if (!c || !t) throw new Error("Invalid response from server");

      setSelected(c);
      setToken(t);
      toast.success("Booking found");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Find failed");
    } finally {
      setLoadingFind(false);
    }
  };

  const onSendOtp = async () => {
    if (!token) return toast.error("Find booking first");
    try {
      setSendingOtp(true);
      const res = await API.post("/payments/public/send-otp", { paymentToken: token });
      setOtpSentTo(res.data?.emailMasked || selected?.emailMasked || "");
      toast.success("OTP sent to email");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const loadHistory = async (clientObjectId, vToken) => {
    if (!clientObjectId || !vToken) return;
    try {
      setHistoryLoading(true);
      const res = await API.get(`/payments/public/client/${clientObjectId}/history`, {
        params: { paymentToken: vToken },
      });
      setHistory(res.data?.history || []);
    } catch (e) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (!token) return toast.error("Find booking first");
    if (!otp || otp.trim().length < 4) return toast.error("Enter OTP");
    try {
      setVerifyingOtp(true);

      const res = await API.post("/payments/public/verify-otp", {
        paymentToken: token,
        otp: otp.trim(),
      });

      const vToken = res.data?.verifiedToken;
      const am = res.data?.amounts;

      if (!vToken || !am) throw new Error("Invalid verify response");

      setVerifiedToken(vToken);
      setAmounts(am);
      toast.success("OTP verified");

      // load history now that it’s unlocked
      await loadHistory(selected?.clientObjectId, vToken);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "OTP verify failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const onPay = async () => {
    if (!selected) return toast.error("Find booking first");
    if (!unlocked) return toast.error("OTP verification required");
    if (!canPay) return toast.error("Enter valid amount (≤ balance)");

    try {
      setCreating(true);

      const res = await API.post("/payments/public/hdfc/create-session", {
        clientObjectId: selected.clientObjectId,
        amountRupees: Math.round(Number(amountToPay)),
        paymentToken: verifiedToken,
      });

      const link = res.data?.paymentLink;
      if (!link) throw new Error("No payment link received");

      window.location.href = link;
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to start payment");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900">
      {/* Top App Bar (Google Pay-ish) */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full grid place-items-center"
              style={{ background: "rgba(26,115,232,0.10)", color: THEME }}
            >
              <Icon.Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 leading-none">Secure payment</div>
              {/* <div className="text-sm font-extrabold leading-tight">Google Pay style checkout</div> */}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Protected by</span>
            <span className="text-[11px] font-extrabold text-slate-700">HDFC SmartGateway</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Step 1: Payment Code */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[12px] text-slate-500">Step 1</div>
              <div className="text-lg font-extrabold">Enter payment code</div>
              <div className="mt-1 text-sm text-slate-600">
                Use the code provided by your executive to find your booking.
              </div>
            </div>
            <TrustPill />
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <GPayInput
              label="Payment code"
              value={paymentCode}
              onChange={(v) => setPaymentCode(v.toUpperCase())}
              placeholder="e.g. A1B2C3D4"
            />

            <button
              onClick={onFindByCode}
              disabled={loadingFind || !paymentCode.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3
                         font-extrabold text-white shadow-sm transition
                         disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: THEME,
                boxShadow: "0 10px 22px rgba(26,115,232,0.25)",
              }}
            >
              <Icon.Search className="h-5 w-5" />
              {loadingFind ? "Finding..." : "Find Booking"}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Icon.Lock className="h-4 w-4" />
            <span>Amounts and payment history are hidden until OTP verification.</span>
          </div>
        </Card>

        {/* Booking summary (NO AMOUNTS) */}
        {selected && (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] text-slate-500">Booking</div>
                <div className="text-lg font-extrabold">{selected.name || "Client"}</div>
                <div className="mt-1 text-sm text-slate-600">
                  Client ID{" "}
                  <span className="font-mono font-semibold text-slate-700">
                    {selected.clientId || "-"}
                  </span>
                </div>
              </div>
              <TrustPill />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ReadOnlyField label="Mobile number" value={selected.mobileNumber || "-"} />
                <ReadOnlyField label="Email" value={selected.email || "-"} />
                <ReadOnlyField label="Tour" value={selected.confirmedTourName || selected.confirmedTourType || "-"} />
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <ReadOnlyField
                  label="Group type"
                  value={selected.groupType?.label || selected.groupType?.value || "-"}
                />
                <ReadOnlyField label="No. of persons" value={String(selected.numberOfPersons || "-")} />
                <ReadOnlyField label="Days" value={String(selected.numberOfDays || "-")} />
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <ReadOnlyField
                  label="Start date"
                  value={selected.startDate ? new Date(selected.startDate).toLocaleDateString("en-IN") : "-"}
                />
                <ReadOnlyField
                  label="End date"
                  value={selected.endDate ? new Date(selected.endDate).toLocaleDateString("en-IN") : "-"}
                />
                <ReadOnlyField label="State" value={selected.state || "-"} />
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReadOnlyField label="District" value={selected.district || "-"} />
                <ReadOnlyField label="Pincode" value={selected.pincode || "-"} />
              </div>
            </div>

            {/* OTP gate */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold">Verify OTP to unlock payment details</div>
                  <div className="text-xs text-slate-600 mt-1">
                    OTP will be sent to{" "}
                    <span className="font-bold">{otpSentTo || selected.emailMasked || "your registered email"}</span>
                  </div>
                </div>

                <button
                  onClick={onSendOtp}
                  disabled={sendingOtp}
                  className="rounded-full px-5 py-2.5 font-extrabold text-white transition
                             disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: sendingOtp ? "rgba(26,115,232,0.55)" : THEME,
                    boxShadow: "0 10px 22px rgba(26,115,232,0.18)",
                  }}
                >
                  {sendingOtp ? "Sending…" : "Send OTP"}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <GPayInput
                  label="Enter OTP"
                  value={otp}
                  onChange={(v) => setOtp(v)}
                  placeholder="6-digit OTP"
                  inputMode="numeric"
                />

                <button
                  onClick={onVerifyOtp}
                  disabled={verifyingOtp || !otp.trim()}
                  className="rounded-full px-5 py-2.5 font-extrabold text-white transition
                             disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: verifyingOtp ? "rgba(26,115,232,0.55)" : THEME,
                    boxShadow: "0 10px 22px rgba(26,115,232,0.18)",
                  }}
                >
                  {verifyingOtp ? "Verifying…" : "Verify OTP"}
                </button>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Icon.Lock className="h-4 w-4" />
                  <span>After verification, you can view balance & pay.</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Unlocked: show amounts + pay + history */}
        {selected && unlocked && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Checkout */}
            <Card className="lg:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[12px] text-slate-500">Step 2</div>
                  <div className="text-lg font-extrabold">Payment details</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Balance unlocked. Enter amount and pay securely.
                  </div>
                </div>
                <TrustPill />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <InfoTile label="Total amount" value={`₹ ${money(amounts.totalAmountToBePaid)}`} />
                  <InfoTile label="Already paid" value={`₹ ${money(amounts.totalAmountPaid)}`} />
                  <InfoTile label="Balance" value={`₹ ${money(amounts.balance)}`} emphasis />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <GPayInput
                  label="Amount to pay (₹)"
                  type="number"
                  value={amountToPay}
                  onChange={(v) => setAmountToPay(v)}
                  placeholder={`Max ₹${money(amounts.balance)}`}
                />

                <button
                  onClick={onPay}
                  disabled={!canPay || creating}
                  className="rounded-full px-6 py-3 font-extrabold text-white transition
                             disabled:opacity-60 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  style={{
                    background: !canPay || creating ? "rgba(26,115,232,0.55)" : THEME,
                    boxShadow: canPay ? "0 12px 26px rgba(26,115,232,0.28)" : "none",
                  }}
                >
                  <Icon.Lock className="h-5 w-5" />
                  {creating ? "Redirecting…" : "Pay securely"}
                </button>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-3">
                <div className="flex items-start gap-2">
                  <Icon.Lock className="h-4 w-4 text-slate-600 mt-0.5" />
                  <div className="text-[12px] text-slate-600">
                    You’ll be redirected to <span className="font-bold">HDFC SmartGateway</span>.
                    After payment, you’ll return here automatically.
                  </div>
                </div>
              </div>
            </Card>

            {/* Right: History */}
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[12px] text-slate-500">Receipts</div>
                  <div className="text-base font-extrabold">Payment history</div>
                  <div className="mt-1 text-sm text-slate-600">Last 30 transactions</div>
                </div>
                <div className="h-9 w-9 rounded-full grid place-items-center border border-slate-200 bg-white" title="History">
                  <Icon.Receipt className="h-5 w-5 text-slate-600" />
                </div>
              </div>

              <div className="mt-4 space-y-2 max-h-[380px] overflow-auto pr-1">
                {historyLoading ? (
                  <div className="text-sm text-slate-500 py-8 text-center">Loading…</div>
                ) : history.length === 0 ? (
                  <div className="text-sm text-slate-500 py-8 text-center">No payments yet</div>
                ) : (
                  history.map((h) => (
                    <div key={h.orderId} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-[11px] text-slate-500 font-mono break-all">{h.orderId}</div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="text-sm font-extrabold">₹ {money(h.amountRupees)}</div>
                        <span
                          className="text-[11px] font-extrabold rounded-full px-2.5 py-1 border"
                          style={{
                            borderColor:
                              h.status === "SUCCESS"
                                ? "rgba(22,163,74,0.35)"
                                : h.status === "FAILED"
                                ? "rgba(244,63,94,0.35)"
                                : "rgba(100,116,139,0.35)",
                            background:
                              h.status === "SUCCESS"
                                ? "rgba(22,163,74,0.10)"
                                : h.status === "FAILED"
                                ? "rgba(244,63,94,0.10)"
                                : "rgba(100,116,139,0.10)",
                            color:
                              h.status === "SUCCESS"
                                ? "rgb(22,163,74)"
                                : h.status === "FAILED"
                                ? "rgb(244,63,94)"
                                : "rgb(71,85,105)",
                          }}
                        >
                          {h.status}
                        </span>
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500">
                        Credited:{" "}
                        {h.credited ? (
                          <span className="font-semibold text-slate-700">
                            Yes (₹{money(h.creditedAmountRupees)})
                          </span>
                        ) : (
                          "No"
                        )}
                      </div>

                      {h.failureReason ? (
                        <div className="mt-1 text-[11px] text-rose-600">{h.failureReason}</div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer reassurance */}
      <div className="mt-8 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-5 text-xs text-slate-600 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Icon.Lock className="h-4 w-4" />
            <span>Secure redirect to bank gateway • No card/UPI details stored here</span>
          </div>
          <div className="text-slate-500">If payment completes but balance doesn’t update, refresh and check history.</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI atoms (premium, same style) ---------- */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl bg-white border border-slate-200 shadow-sm ${className}`}
      style={{ boxShadow: "0 12px 30px rgba(15,23,42,0.06)" }}
    >
      <div className="p-5">{children}</div>
    </div>
  );
}

function TrustPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: "rgb(34,197,94)" }} />
      <span className="text-[11px] font-extrabold text-slate-700">Verified</span>
      <span className="text-[11px] text-slate-500">SSL secured</span>
    </div>
  );
}

function GPayInput({ label, value, onChange, placeholder, type = "text", inputMode }) {
  return (
    <label className="block">
      <div className="text-[12px] font-semibold text-slate-700 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition"
        style={{ boxShadow: "inset 0 1px 0 rgba(15,23,42,0.03)" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(26,115,232,0.55)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(226,232,240,1)")}
      />
    </label>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
      style={{ boxShadow: "inset 0 1px 0 rgba(15,23,42,0.03)" }}
    >
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-900 break-words">{value}</div>
    </div>
  );
}

function InfoTile({ label, value, emphasis }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: emphasis ? "rgba(26,115,232,0.22)" : "rgba(226,232,240,1)",
        background: emphasis ? "rgba(26,115,232,0.06)" : "rgba(248,250,252,1)",
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
