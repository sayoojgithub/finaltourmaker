// import React, { useEffect, useMemo, useState } from "react";
// import Select from "react-select";
// import API from "../../api";
// import { toast } from "react-toastify";

// /**
//  * <CreateClient prefill={clientRow} onCancel={() => setActiveTab(0)} />
//  */
// export default function CreateClient({ prefill = null, onCancel }) {
//   console.log(prefill, "prefill data");
//   // ---------- react-select styles (fixed height, right-aligned chips look) ----------
//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 12,
//         borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         maxHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
//       }),
//       valueContainer: (b) => ({
//         ...b,
//         padding: "0 12px",
//         overflowX: "auto",
//         overflowY: "hidden",
//         whiteSpace: "nowrap",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "flex-end",
//         gap: 6,
//       }),
//       input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
//       dropdownIndicator: (b) => ({
//         ...b,
//         color: "#6b7280",
//         ":hover": { color: "#4b5563" },
//       }),
//       menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 50 }),
//       option: (b, s) => ({
//         ...b,
//         backgroundColor: s.isFocused
//           ? "rgba(133,112,238,0.08)"
//           : s.isSelected
//           ? "rgba(133,112,238,0.16)"
//           : "white",
//         color: "#222",
//       }),
//       placeholder: (b) => ({ ...b, color: "#6b7280" }),
//       singleValue: (b) => ({ ...b, color: "#111827" }),
//     }),
//     []
//   );

//   // ---------- options ----------
//   const [destinations, setDestinations] = useState([]);
//   const [loadingDest, setLoadingDest] = useState(false);

//   const groupTypeOptions = [
//     { value: "single", label: "Single" },
//     { value: "couple", label: "Couple" },
//     { value: "family", label: "Family" },
//     { value: "friends", label: "Friends" },
//   ];
//   const behaviourOptions = [
//     { value: "polite", label: "Polite" },
//     { value: "normal", label: "Normal" },
//     { value: "hard", label: "Hard" },
//     { value: "educated", label: "Educated" },
//   ];
//   const clientTypeOptions = [
//     { value: "Urgent Contact", label: "Urgent Contact" },
//     { value: "Non Urgent Contact", label: "Non Urgent Contact" },
//   ];
//   const contactOptions = [
//     { value: "phone", label: "Phone" },
//     { value: "whatsapp", label: "WhatsApp" },
//   ];
//   const tourTypeOptions = [
//     { value: "grouptour", label: "Group Tour" },
//     { value: "fixedtour", label: "Fixed Tour" },
//     { value: "customtour", label: "Custom Tour" },
//   ];

//   const preUrgent =
//     (
//       prefill?.clientType?.value ||
//       prefill?.clientType?.label ||
//       ""
//     ).toLowerCase() === "urgent contact";

//   // ---------- form ----------
//   const [form, setForm] = useState({
//     name: prefill?.name || "",
//     mobileNumber: prefill?.mobileNumber || "",
//     whatsappNumber: "",
//     email: "",
//     tourType: null,
//     primaryDestinationName: prefill?.primaryDestinationName
//       ? {
//           _id: prefill.primaryDestinationName._id,
//           value: prefill.primaryDestinationName.value,
//           label:
//             prefill.primaryDestinationName.label ||
//             prefill.primaryDestinationName.value,
//         }
//       : null,
//     addonDestinations: [], // chips list (array of options)
//     addonDestinationInput: null, // single select to add via "+"

//     groupType: null,
//     numberOfPersons: "",
//     startDate: "",
//     endDate: "",
//     numberOfDays: "",

//     pincode: "",
//     district: "",
//     state: "",

//     clientContactOption: contactOptions[0],
//     clientType: preUrgent
//       ? { value: "Urgent Contact", label: "Urgent Contact" }
//       : null,
//     clientCurrentLocation: null,
//     connectedThrough: prefill?.connectedThrough || null,
//     behavior: null,

//     gstNumber: "",
//     additionalRequirementsInput: "",
//     additionalRequirements: [],

//     clientByEntryId: prefill?._id || null,
//   });

//   const [submitting, setSubmitting] = useState(false);

//   // ---------- load destinations ----------
//   const loadDestinations = async () => {
//     try {
//       setLoadingDest(true);
//       const res = await API.get("/frontoffice/destinations");
//       const opts = (res.data || []).map((d) => ({
//         _id: d._id,
//         value: d.value,
//         label: d.label,
//       }));
//       setDestinations(opts);
//       if (form.primaryDestinationName?._id) {
//         const match = opts.find(
//           (o) => o._id === form.primaryDestinationName._id
//         );
//         if (match) setForm((p) => ({ ...p, primaryDestinationName: match }));
//       }
//     } catch (e) {
//       toast.error(
//         e?.response?.data?.message || e.message || "Failed to load destinations"
//       );
//     } finally {
//       setLoadingDest(false);
//     }
//   };
//   useEffect(() => {
//     loadDestinations();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- inclusive days ----------
//   const computeDays = (start, end) => {
//     if (!start || !end) return "";
//     const s = new Date(start);
//     const e = new Date(end);
//     if (Number.isNaN(s) || Number.isNaN(e)) return "";
//     const sd = new Date(s);
//     sd.setHours(0, 0, 0, 0);
//     const ed = new Date(e);
//     ed.setHours(0, 0, 0, 0);
//     const diff = (ed - sd) / (1000 * 60 * 60 * 24);
//     return diff >= 0 ? String(diff + 1) : "";
//   };
//   useEffect(() => {
//     setForm((p) => ({
//       ...p,
//       numberOfDays: computeDays(p.startDate, p.endDate),
//     }));
//   }, [form.startDate, form.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ---------- pincode autofill ----------
//   const fetchPincodeDetails = async (pincode) => {
//     try {
//       const response = await fetch(
//         `https://api.postalpincode.in/pincode/${pincode}`
//       );
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       console.log(data, "pincode related data");
//       if (!Array.isArray(data) || !data[0] || data[0].Status !== "Success") {
//         toast.error("Invalid Pincode , Please check the pincode.");
//         return { error: "Invalid Pincode", details: null };
//       }
//       const po = data[0].PostOffice?.[0];
//       if (!po) throw new Error("No Post Office found for this pincode");
//       return { country: po.Country, state: po.State, district: po.District };
//     } catch (error) {
//       toast.error(error.message);
//       return { error: error.message, details: null };
//     }
//   };

//   const handlePincodeChange = async (e) => {
//     const value = e.target.value.replace(/\D/g, "");
//     setForm((prev) => ({ ...prev, pincode: value, district: "", state: "" }));
//     if (value.length > 6) {
//       toast.error("Pincode should be exactly 6 digits.");
//       return;
//     }
//     if (value.length === 6) {
//       const details = await fetchPincodeDetails(value);
//       if (details && !details.error) {
//         setForm((prev) => ({
//           ...prev,
//           district: details.district || "",
//           state: details.state || "",
//         }));
//       }
//     }
//   };

//   // ---------- Additional Requirements ----------
//   const addRequirement = () => {
//     const text = (form.additionalRequirementsInput || "").trim();
//     if (!text) return;
//     setForm((p) => ({
//       ...p,
//       additionalRequirements: [...p.additionalRequirements, text],
//       additionalRequirementsInput: "",
//     }));
//   };
//   const removeRequirement = (idx) => {
//     setForm((p) => ({
//       ...p,
//       additionalRequirements: p.additionalRequirements.filter(
//         (_, i) => i !== idx
//       ),
//     }));
//   };

//   // ---------- Add-on Destinations (add + chips like Additional Requirements) ----------
//   const addAddonDestination = () => {
//     const sel = form.addonDestinationInput;
//     if (!sel) return;
//     // prevent duplicates by _id or value
//     const exists = (form.addonDestinations || []).some(
//       (d) => d._id === sel._id || d.value === sel.value
//     );
//     if (exists) {
//       toast.info("Destination already added");
//       return;
//     }
//     setForm((p) => ({
//       ...p,
//       addonDestinations: [...(p.addonDestinations || []), sel],
//       addonDestinationInput: null,
//     }));
//   };
//   const removeAddonDestination = (idx) => {
//     setForm((p) => ({
//       ...p,
//       addonDestinations: (p.addonDestinations || []).filter(
//         (_, i) => i !== idx
//       ),
//     }));
//   };

//   // ---------- validation ----------
//   const validate = () => {
//     if (!form.name || !form.name.trim())
//       return toast.error("Name is required"), false;
//     if (!/^\d{10,15}$/.test(String(form.mobileNumber || "").trim()))
//       return toast.error("Mobile number must be 10–15 digits"), false;
//     if (!form.tourType) return toast.error("Tour type is required"), false;
//     if (!form.primaryDestinationName)
//       return toast.error("Primary destination is required"), false;
//     if (!form.groupType) return toast.error("Group type is required"), false;
//     if (!form.numberOfPersons || Number(form.numberOfPersons) <= 0)
//       return toast.error("Number of persons is required"), false;
//     if (!form.startDate) return toast.error("Start date is required"), false;
//     if (!form.endDate) return toast.error("End date is required"), false;
//     if (!form.numberOfDays)
//       return toast.error("Number of days is required"), false;
//     if (!form.pincode) return toast.error("Pincode is required"), false;
//     if (!form.state) return toast.error("State is required"), false;
//     if (!form.district) return toast.error("District is required"), false;
//     if (!form.clientContactOption)
//       return toast.error("Client contact option is required"), false;
//     if (!preUrgent && !form.clientType)
//       return toast.error("Client type is required"), false;
//     if (!form.clientCurrentLocation)
//       return toast.error("Client current location is required"), false;
//     if (!form.connectedThrough)
//       return toast.error("Connected through is required"), false;
//     if (!form.behavior)
//       return toast.error("Client behaviour is required"), false;
//     return true;
//   };

//   // ---------- submit ----------
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submitting) return;
//     if (!validate()) return;

//     try {
//       setSubmitting(true);

//       const payload = {
//         name: form.name?.trim(),
//         mobileNumber: form.mobileNumber,
//         email: form.email?.trim() || null,
//         whatsappNumber: form.whatsappNumber?.trim() || null,
//         tourType: form.tourType
//           ? { value: form.tourType.value, label: form.tourType.label }
//           : null,
//         primaryDestinationName: form.primaryDestinationName
//           ? {
//               _id: form.primaryDestinationName._id,
//               value: form.primaryDestinationName.value,
//               label: form.primaryDestinationName.label,
//             }
//           : null,

//         // keep structured options for backend
//         addonDestinations: (form.addonDestinations || []).map((d) => ({
//           _id: d._id,
//           value: d.value,
//           label: d.label,
//         })),

//         groupType: form.groupType,
//         numberOfPersons: Number(form.numberOfPersons),

//         startDate: form.startDate,
//         endDate: form.endDate,
//         numberOfDays: Number(form.numberOfDays),

//         pincode: form.pincode,
//         district: form.district,
//         state: form.state,

//         clientContactOption: form.clientContactOption,
//         clientType: preUrgent
//           ? { value: "Urgent Contact", label: "Urgent Contact" }
//           : form.clientType,
//         clientCurrentLocation: form.clientCurrentLocation,
//         connectedThrough: form.connectedThrough,
//         behavior: form.behavior,

//         gstNumber: form.gstNumber?.trim() || null,

//         additionalRequirments: form.additionalRequirements.length
//           ? form.additionalRequirements.join(" | ")
//           : null,
//         additionalRequirements: form.additionalRequirements,

//         clientByEntryId: form.clientByEntryId || null,
//         campaignName: prefill?.campaignName
//           ? {
//               kind: prefill.campaignName.kind,
//               refId: prefill.campaignName.refId,
//               label: prefill.campaignName.label,
//             }
//           : null,
//         createdAtByEntry: prefill?.createdAtByEntry || null,
//         entryId: prefill?.entryId || null,
//       };

//       await API.post("/frontoffice/create-client", payload);
//       toast.success("Client created");
//       if (onCancel) onCancel();
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || err.message || "Something went wrong"
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
//         {/* ==== 4 ROWS • 5 FIELDS EACH (20 fields) ==== */}
//         {/* Row 1 */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <Field label="Name" required>
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.name}
//               onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//               placeholder="Client name"
//               disabled={Boolean(prefill?.name)}
//             />
//           </Field>

//           <Field label="Mobile Number" required>
//             <input
//               type="tel"
//               inputMode="numeric"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.mobileNumber}
//               disabled
//             />
//           </Field>

//           <Field label="WhatsApp Number">
//             <input
//               type="tel"
//               inputMode="numeric"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.whatsappNumber}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, whatsappNumber: e.target.value }))
//               }
//               placeholder="e.g., 9876543210"
//             />
//           </Field>
//           <Field label="Email">
//             <input
//               type="email"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.email}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, email: e.target.value }))
//               }
//               placeholder="name@example.com"
//             />
//           </Field>
//           <Field label="Tour Type" required>
//             <Select
//               options={tourTypeOptions}
//               value={form.tourType}
//               onChange={(v) => setForm((p) => ({ ...p, tourType: v }))}
//               placeholder="Select tour type"
//               styles={selectStyles}
//               classNamePrefix="create-tour-type"
//               isClearable
//             />
//           </Field>
//         </div>

//         {/* Row 2 */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <Field label="Primary Destination" required>
//             <Select
//               isLoading={loadingDest}
//               options={destinations}
//               value={form.primaryDestinationName}
//               onChange={(v) =>
//                 setForm((p) => ({ ...p, primaryDestinationName: v }))
//               }
//               placeholder={
//                 loadingDest ? "Loading destinations..." : "Select destination"
//               }
//               styles={selectStyles}
//               classNamePrefix="create-primary-destination"
//               getOptionValue={(o) => String(o._id || o.value)}
//             />
//           </Field>

//           <Field label="Group Type" required>
//             <Select
//               options={groupTypeOptions}
//               value={form.groupType}
//               onChange={(v) => setForm((p) => ({ ...p, groupType: v }))}
//               placeholder="Select group type"
//               styles={selectStyles}
//               classNamePrefix="create-group-type"
//             />
//           </Field>

//           <Field label="Number of Persons" required>
//             <input
//               type="number"
//               min={1}
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.numberOfPersons}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, numberOfPersons: e.target.value }))
//               }
//               placeholder="e.g., 2"
//             />
//           </Field>

//           <Field label="Start Date" required>
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.startDate}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, startDate: e.target.value }))
//               }
//             />
//           </Field>

//           <Field label="End Date" required>
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.endDate}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, endDate: e.target.value }))
//               }
//             />
//           </Field>
//         </div>

//         {/* Row 3 */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <Field label="Number of Days" required>
//             <input
//               type="number"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.numberOfDays}
//               readOnly
//             />
//           </Field>

//           <Field label="Client Contact Option" required>
//             <Select
//               options={contactOptions}
//               value={form.clientContactOption}
//               onChange={(v) =>
//                 setForm((p) => ({ ...p, clientContactOption: v }))
//               }
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-contact-option"
//             />
//           </Field>

//           <Field label="Client Type" required>
//             {preUrgent ? (
//               <input
//                 type="text"
//                 className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-50"
//                 value="Urgent Contact"
//                 readOnly
//               />
//             ) : (
//               <Select
//                 options={clientTypeOptions}
//                 value={form.clientType}
//                 onChange={(v) => setForm((p) => ({ ...p, clientType: v }))}
//                 placeholder="Select"
//                 styles={selectStyles}
//                 classNamePrefix="create-client-type"
//                 isClearable
//               />
//             )}
//           </Field>

//           <Field label="Pincode" required>
//             <input
//               type="tel"
//               inputMode="numeric"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.pincode}
//               onChange={handlePincodeChange}
//               placeholder="6 digits"
//               maxLength={6}
//             />
//           </Field>

//           <Field label="District" required>
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.district}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, district: e.target.value }))
//               }
//               placeholder="Auto from pincode"
//             />
//           </Field>
//         </div>

//         {/* Row 4 */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <Field label="State" required>
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.state}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, state: e.target.value }))
//               }
//               placeholder="Auto from pincode"
//             />
//           </Field>

//           <Field label="Client Current Location" required>
//             <Select
//               options={[
//                 { value: "insider", label: "Insider" },
//                 { value: "outsider", label: "Outsider" },
//               ]}
//               value={form.clientCurrentLocation}
//               onChange={(v) =>
//                 setForm((p) => ({ ...p, clientCurrentLocation: v }))
//               }
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-current-location"
//             />
//           </Field>

//           <Field label="Client Behaviour" required>
//             <Select
//               options={behaviourOptions}
//               value={form.behavior}
//               onChange={(v) => setForm((p) => ({ ...p, behavior: v }))}
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-behaviour"
//             />
//           </Field>

//           <Field label="Connected Through (Readonly)" required>
//             <input
//               type="text"
//               value={
//                 form.connectedThrough?.label ||
//                 form.connectedThrough?.value ||
//                 ""
//               }
//               readOnly
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-50"
//             />
//           </Field>

//           <Field label="GST Number">
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.gstNumber}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, gstNumber: e.target.value }))
//               }
//               placeholder="optional"
//             />
//           </Field>
//         </div>

//         {/* ===== Add-on Destinations (like add+chips) ===== */}
//         {/* <div className="grid grid-cols-1 gap-2">
//           <label className="block">
//             <span className="block text-sm font-medium text-[#222] mb-1">
//               Add-on Destinations
//             </span>
//             <div className="flex items-center gap-2">
//               <div className="flex-1">
//                 <Select
//                   isLoading={loadingDest}
//                   options={destinations}
//                   value={form.addonDestinationInput}
//                   onChange={(v) => setForm((p) => ({ ...p, addonDestinationInput: v }))}
//                   placeholder={loadingDest ? "Loading destinations..." : "Pick a destination"}
//                   styles={selectStyles}
//                   classNamePrefix="addon-destinations-input"
//                   getOptionValue={(o) => String(o._id || o.value)}
//                   isClearable
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={addAddonDestination}
//                 className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
//                 aria-label="Add add-on destination"
//               >
//                 +
//               </button>
//             </div>
//           </label>

//           {form.addonDestinations.length > 0 && (
//             <div className="w-full overflow-x-auto whitespace-nowrap">
//               <div className="inline-flex gap-2 py-1">
//                 {form.addonDestinations.map((d, idx) => (
//                   <span
//                     key={`${d._id || d.value}-${idx}`}
//                     className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
//                     style={{ backgroundColor: "rgba(133,112,238,0.16)" }}
//                     title={d.label || d.value}
//                   >
//                     {d.label || d.value}
//                     <button
//                       type="button"
//                       aria-label="Remove destination"
//                       className="text-gray-700 hover:text-gray-900"
//                       onClick={() => removeAddonDestination(idx)}
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div> */}

//         {/* ===== Additional Requirements (full width, add+chips) ===== */}
//         {/* <div className="grid grid-cols-1 gap-2">
//           <label className="block">
//             <span className="block text-sm font-medium text-[#222] mb-1">
//               Additional Requirements
//             </span>
//             <div className="flex items-center gap-2">
//               <input
//                 type="text"
//                 className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//                 placeholder="Type a requirement"
//                 value={form.additionalRequirementsInput}
//                 onChange={(e) =>
//                   setForm((p) => ({ ...p, additionalRequirementsInput: e.target.value }))
//                 }
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     addRequirement();
//                   }
//                 }}
//               />
//               <button
//                 type="button"
//                 onClick={addRequirement}
//                 className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
//                 aria-label="Add requirement"
//               >
//                 +
//               </button>
//             </div>
//           </label>

//           {form.additionalRequirements.length > 0 && (
//             <div className="w-full overflow-x-auto whitespace-nowrap">
//               <div className="inline-flex gap-2 py-1">
//                 {form.additionalRequirements.map((item, idx) => (
//                   <span
//                     key={`${item}-${idx}`}
//                     className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
//                     style={{ backgroundColor: "rgba(133,112,238,0.16)" }}
//                   >
//                     {item}
//                     <button
//                       type="button"
//                       aria-label="Remove requirement"
//                       className="text-gray-700 hover:text-gray-900"
//                       onClick={() => removeRequirement(idx)}
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div> */}

//         {/* Actions */}
//         {/* <div className="pt-2 flex items-center justify-center gap-3">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             disabled={submitting}
//             className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60"
//           >
//             {submitting ? "Creating..." : "Create Client"}
//           </button>
//         </div> */}
//         {/* ===== Add-on Destinations (like add+chips, glassy) ===== */}
//         <div className="grid grid-cols-1 gap-2">
//           <label className="block">
//             <span className="block text-sm font-medium text-[#222] mb-1">
//               Add-on Destinations
//             </span>
//             <div className="flex items-center gap-2">
//               <div className="flex-1">
//                 <Select
//                   isLoading={loadingDest}
//                   options={destinations}
//                   value={form.addonDestinationInput}
//                   onChange={(v) =>
//                     setForm((p) => ({ ...p, addonDestinationInput: v }))
//                   }
//                   placeholder={
//                     loadingDest
//                       ? "Loading destinations..."
//                       : "Pick a destination"
//                   }
//                   styles={selectStyles}
//                   classNamePrefix="addon-destinations-input"
//                   getOptionValue={(o) => String(o._id || o.value)}
//                   isClearable
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={addAddonDestination}
//                 className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
//                 aria-label="Add add-on destination"
//               >
//                 +
//               </button>
//             </div>
//           </label>

//           {form.addonDestinations.length > 0 && (
//             <div className="w-full overflow-x-auto whitespace-nowrap">
//               <div className="inline-flex gap-2 py-1">
//                 {form.addonDestinations.map((d, idx) => (
//                   <span
//                     key={`${d._id || d.value}-${idx}`}
//                     title={d.label || d.value}
//                     className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
//                        bg-white/30 backdrop-blur-md border border-white/40 shadow-sm
//                        hover:bg-white/40 transition"
//                   >
//                     {d.label || d.value}
//                     <button
//                       type="button"
//                       aria-label="Remove destination"
//                       onClick={() => removeAddonDestination(idx)}
//                       className="inline-flex items-center justify-center w-5 h-5 rounded-full
//                          bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ===== Additional Requirements (full width, add+chips, glassy) ===== */}
//         <div className="grid grid-cols-1 gap-2">
//           <label className="block">
//             <span className="block text-sm font-medium text-[#222] mb-1">
//               Additional Requirements
//             </span>
//             <div className="flex items-center gap-2">
//               <input
//                 type="text"
//                 className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//                 placeholder="Type a requirement"
//                 value={form.additionalRequirementsInput}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     additionalRequirementsInput: e.target.value,
//                   }))
//                 }
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     addRequirement();
//                   }
//                 }}
//               />
//               <button
//                 type="button"
//                 onClick={addRequirement}
//                 className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
//                 aria-label="Add requirement"
//               >
//                 +
//               </button>
//             </div>
//           </label>

//           {form.additionalRequirements.length > 0 && (
//             <div className="w-full overflow-x-auto whitespace-nowrap">
//               <div className="inline-flex gap-2 py-1">
//                 {form.additionalRequirements.map((item, idx) => (
//                   <span
//                     key={`${item}-${idx}`}
//                     className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
//                        bg-white/30 backdrop-blur-md border border-white/40 shadow-sm
//                        hover:bg-white/40 transition"
//                   >
//                     {item}
//                     <button
//                       type="button"
//                       aria-label="Remove requirement"
//                       onClick={() => removeRequirement(idx)}
//                       className="inline-flex items-center justify-center w-5 h-5 rounded-full
//                          bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ===== Actions (cross above Create) ===== */}
//         <div className="pt-2 flex flex-col items-center gap-2">
//           <button
//             type="button"
//             onClick={onCancel}
//             aria-label="Close"
//             className="inline-flex items-center justify-center w-8 h-8 rounded-full
//                bg-white/70 backdrop-blur-md border border-gray-200 shadow
//                text-gray-700 hover:bg-white transition"
//           >
//             ×
//           </button>

//           <button
//             type="submit"
//             disabled={submitting}
//             className="inline-flex items-center justify-center rounded-full bg-[#8570EE]
//                text-white px-6 py-3 font-semibold hover:opacity-90
//                focus:outline-none focus:ring-2 focus:ring-offset-2
//                focus:ring-[#8570EE] disabled:opacity-60 w-full"
//           >
//             {submitting ? "Creating..." : "Create Client"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

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





// import React, { useEffect, useMemo, useState } from "react";
// import Select from "react-select";
// import { motion, AnimatePresence } from "framer-motion";
// import API from "../../api";
// import { toast } from "react-toastify";

// /**
//  * Gamified multi-step Create Client
//  * - Preserves original validation & functionality
//  * - Adds step-by-step flow, animated transitions, score bar, and celebration
//  */
// export default function CreateClient({ prefill = null, onCancel }) {
//   // ---------- theme helpers ----------
//   const PURPLE = "#8570EE"; // brand primary
//   const PURPLE_LIGHT = "rgba(133,112,238,0.16)";
//   const GRAY_BORDER = "#e5e7eb";

//   // ---------- react-select styles ----------
//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 12,
//         borderColor: state.isFocused ? PURPLE : GRAY_BORDER,
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         maxHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? PURPLE : "#d1d5db" },
//       }),
//       valueContainer: (b) => ({
//         ...b,
//         padding: "0 12px",
//         overflowX: "auto",
//         overflowY: "hidden",
//         whiteSpace: "nowrap",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "flex-end",
//         gap: 6,
//       }),
//       input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: GRAY_BORDER }),
//       dropdownIndicator: (b) => ({
//         ...b,
//         color: "#6b7280",
//         ":hover": { color: "#4b5563" },
//       }),
//       menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 50 }),
//       option: (b, s) => ({
//         ...b,
//         backgroundColor: s.isFocused
//           ? "rgba(133,112,238,0.08)"
//           : s.isSelected
//           ? PURPLE_LIGHT
//           : "white",
//         color: "#222",
//       }),
//       placeholder: (b) => ({ ...b, color: "#6b7280" }),
//       singleValue: (b) => ({ ...b, color: "#111827" }),
//     }),
//     []
//   );

//   // ---------- static options ----------
//   const groupTypeOptions = [
//     { value: "single", label: "Single" },
//     { value: "couple", label: "Couple" },
//     { value: "family", label: "Family" },
//     { value: "friends", label: "Friends" },
//   ];
//   const behaviourOptions = [
//     { value: "polite", label: "Polite" },
//     { value: "normal", label: "Normal" },
//     { value: "hard", label: "Hard" },
//     { value: "educated", label: "Educated" },
//   ];
//   const clientTypeOptions = [
//     { value: "Urgent Contact", label: "Urgent Contact" },
//     { value: "Non Urgent Contact", label: "Non Urgent Contact" },
//   ];
//   const contactOptions = [
//     { value: "phone", label: "Phone" },
//     { value: "whatsapp", label: "WhatsApp" },
//   ];
//   const tourTypeOptions = [
//     { value: "grouptour", label: "Group Tour" },
//     { value: "fixedtour", label: "Fixed Tour" },
//     { value: "customtour", label: "Custom Tour" },
//   ];

//   const preUrgent = (
//     (prefill?.clientType?.value || prefill?.clientType?.label || "").toLowerCase() ===
//     "urgent contact"
//   );

//   // ---------- destinations ----------
//   const [destinations, setDestinations] = useState([]);
//   const [loadingDest, setLoadingDest] = useState(false);

//   // ---------- form ----------
//   const [form, setForm] = useState({
//     name: prefill?.name || "",
//     mobileNumber: prefill?.mobileNumber || "",
//     whatsappNumber: "",
//     email: "",
//     tourType: null,
//     primaryDestinationName: prefill?.primaryDestinationName
//       ? {
//           _id: prefill.primaryDestinationName._id,
//           value: prefill.primaryDestinationName.value,
//           label: prefill.primaryDestinationName.label || prefill.primaryDestinationName.value,
//         }
//       : null,
//     addonDestinations: [],
//     addonDestinationInput: null,

//     groupType: null,
//     numberOfPersons: "",
//     startDate: "",
//     endDate: "",
//     numberOfDays: "",

//     pincode: "",
//     district: "",
//     state: "",

//     clientContactOption: contactOptions[0],
//     clientType: preUrgent ? { value: "Urgent Contact", label: "Urgent Contact" } : null,
//     clientCurrentLocation: null,
//     connectedThrough: prefill?.connectedThrough || null,
//     behavior: null,

//     gstNumber: "",
//     additionalRequirementsInput: "",
//     additionalRequirements: [],

//     clientByEntryId: prefill?._id || null,
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [activeStep, setActiveStep] = useState(0);
//   const [showWin, setShowWin] = useState(false);

//   // ---------- load destinations ----------
//   const loadDestinations = async () => {
//     try {
//       setLoadingDest(true);
//       const res = await API.get("/frontoffice/destinations");
//       const opts = (res.data || []).map((d) => ({ _id: d._id, value: d.value, label: d.label }));
//       setDestinations(opts);
//       if (form.primaryDestinationName?._id) {
//         const match = opts.find((o) => o._id === form.primaryDestinationName._id);
//         if (match) setForm((p) => ({ ...p, primaryDestinationName: match }));
//       }
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
//     } finally {
//       setLoadingDest(false);
//     }
//   };
//   useEffect(() => {
//     loadDestinations();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- inclusive days ----------
//   const computeDays = (start, end) => {
//     if (!start || !end) return "";
//     const s = new Date(start);
//     const e = new Date(end);
//     if (Number.isNaN(s) || Number.isNaN(e)) return "";
//     const sd = new Date(s); sd.setHours(0,0,0,0);
//     const ed = new Date(e); ed.setHours(0,0,0,0);
//     const diff = (ed - sd) / (1000 * 60 * 60 * 24);
//     return diff >= 0 ? String(diff + 1) : "";
//   };
//   useEffect(() => {
//     setForm((p) => ({ ...p, numberOfDays: computeDays(p.startDate, p.endDate) }));
//   }, [form.startDate, form.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ---------- pincode autofill ----------
//   const fetchPincodeDetails = async (pincode) => {
//     try {
//       const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       if (!Array.isArray(data) || !data[0] || data[0].Status !== "Success") {
//         toast.error("Invalid Pincode , Please check the pincode.");
//         return { error: "Invalid Pincode", details: null };
//       }
//       const po = data[0].PostOffice?.[0];
//       if (!po) throw new Error("No Post Office found for this pincode");
//       return { country: po.Country, state: po.State, district: po.District };
//     } catch (error) {
//       toast.error(error.message);
//       return { error: error.message, details: null };
//     }
//   };
//   const handlePincodeChange = async (e) => {
//     const value = e.target.value.replace(/\D/g, "");
//     setForm((prev) => ({ ...prev, pincode: value, district: "", state: "" }));
//     if (value.length > 6) {
//       toast.error("Pincode should be exactly 6 digits.");
//       return;
//     }
//     if (value.length === 6) {
//       const details = await fetchPincodeDetails(value);
//       if (details && !details.error) {
//         setForm((prev) => ({ ...prev, district: details.district || "", state: details.state || "" }));
//       }
//     }
//   };

//   // ---------- Requirements & Add-ons ----------
//   const addRequirement = () => {
//     const text = (form.additionalRequirementsInput || "").trim();
//     if (!text) return;
//     setForm((p) => ({
//       ...p,
//       additionalRequirements: [...p.additionalRequirements, text],
//       additionalRequirementsInput: "",
//     }));
//   };
//   const removeRequirement = (idx) => {
//     setForm((p) => ({ ...p, additionalRequirements: p.additionalRequirements.filter((_, i) => i !== idx) }));
//   };
//   const addAddonDestination = () => {
//     const sel = form.addonDestinationInput;
//     if (!sel) return;
//     const exists = (form.addonDestinations || []).some((d) => d._id === sel._id || d.value === sel.value);
//     if (exists) return toast.info("Destination already added");
//     setForm((p) => ({ ...p, addonDestinations: [...(p.addonDestinations || []), sel], addonDestinationInput: null }));
//   };
//   const removeAddonDestination = (idx) => {
//     setForm((p) => ({ ...p, addonDestinations: (p.addonDestinations || []).filter((_, i) => i !== idx) }));
//   };

//   // ---------- validation (unchanged) ----------
//   const validate = () => {
//     if (!form.name || !form.name.trim()) return toast.error("Name is required"), false;
//     if (!/^\d{10,15}$/.test(String(form.mobileNumber || "").trim())) return toast.error("Mobile number must be 10–15 digits"), false;
//     if (!form.tourType) return toast.error("Tour type is required"), false;
//     if (!form.primaryDestinationName) return toast.error("Primary destination is required"), false;
//     if (!form.groupType) return toast.error("Group type is required"), false;
//     if (!form.numberOfPersons || Number(form.numberOfPersons) <= 0) return toast.error("Number of persons is required"), false;
//     if (!form.startDate) return toast.error("Start date is required"), false;
//     if (!form.endDate) return toast.error("End date is required"), false;
//     if (!form.numberOfDays) return toast.error("Number of days is required"), false;
//     if (!form.pincode) return toast.error("Pincode is required"), false;
//     if (!form.state) return toast.error("State is required"), false;
//     if (!form.district) return toast.error("District is required"), false;
//     if (!form.clientContactOption) return toast.error("Client contact option is required"), false;
//     if (!preUrgent && !form.clientType) return toast.error("Client type is required"), false;
//     if (!form.clientCurrentLocation) return toast.error("Client current location is required"), false;
//     if (!form.connectedThrough) return toast.error("Connected through is required"), false;
//     if (!form.behavior) return toast.error("Client behaviour is required"), false;
//     return true;
//   };

//   // ---------- submit ----------
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submitting) return;
//     if (!validate()) return;
//     try {
//       setSubmitting(true);
//       const payload = {
//         name: form.name?.trim(),
//         mobileNumber: form.mobileNumber,
//         email: form.email?.trim() || null,
//         whatsappNumber: form.whatsappNumber?.trim() || null,
//         tourType: form.tourType ? { value: form.tourType.value, label: form.tourType.label } : null,
//         primaryDestinationName: form.primaryDestinationName
//           ? { _id: form.primaryDestinationName._id, value: form.primaryDestinationName.value, label: form.primaryDestinationName.label }
//           : null,
//         addonDestinations: (form.addonDestinations || []).map((d) => ({ _id: d._id, value: d.value, label: d.label })),
//         groupType: form.groupType,
//         numberOfPersons: Number(form.numberOfPersons),
//         startDate: form.startDate,
//         endDate: form.endDate,
//         numberOfDays: Number(form.numberOfDays),
//         pincode: form.pincode,
//         district: form.district,
//         state: form.state,
//         clientContactOption: form.clientContactOption,
//         clientType: preUrgent ? { value: "Urgent Contact", label: "Urgent Contact" } : form.clientType,
//         clientCurrentLocation: form.clientCurrentLocation,
//         connectedThrough: form.connectedThrough,
//         behavior: form.behavior,
//         gstNumber: form.gstNumber?.trim() || null,
//         additionalRequirments: form.additionalRequirements.length ? form.additionalRequirements.join(" | ") : null,
//         additionalRequirements: form.additionalRequirements,
//         clientByEntryId: form.clientByEntryId || null,
//         campaignName: prefill?.campaignName
//           ? { kind: prefill.campaignName.kind, refId: prefill.campaignName.refId, label: prefill.campaignName.label }
//           : null,
//         createdAtByEntry: prefill?.createdAtByEntry || null,
//         entryId: prefill?.entryId || null,
//       };
//       await API.post("/frontoffice/create-client", payload);
//       toast.success("Client created");
//       setShowWin(true);
//       setTimeout(() => { if (onCancel) onCancel(); }, 1800);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || err.message || "Something went wrong");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- STEP CONFIG ----------
//   // Steps as groups requested by user
//   const steps = [
//     {
//       key: "basic",
//       title: "Player Intro",
//       desc: "Tell us who the hero is",
//       fields: ["name", "mobileNumber", "whatsappNumber", "email"],
//       node: (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Field label="Name" required>
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.name}
//               onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//               placeholder="Client name"
//               disabled={Boolean(prefill?.name)}
//             />
//           </Field>
//           <Field label="Mobile Number" required>
//             <input
//               type="tel"
//               inputMode="numeric"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.mobileNumber}
//               disabled
//             />
//           </Field>
//           <Field label="WhatsApp Number">
//             <input
//               type="tel"
//               inputMode="numeric"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.whatsappNumber}
//               onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
//               placeholder="e.g., 9876543210"
//             />
//           </Field>
//           <Field label="Email">
//             <input
//               type="email"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.email}
//               onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
//               placeholder="name@example.com"
//             />
//           </Field>
//         </div>
//       ),
//     },
//     {
//       key: "trip-core",
//       title: "Quest Setup",
//       desc: "Pick the quest type & party",
//       fields: ["tourType", "primaryDestinationName", "groupType", "numberOfPersons"],
//       node: (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Field label="Tour Type" required>
//             <Select
//               options={tourTypeOptions}
//               value={form.tourType}
//               onChange={(v) => setForm((p) => ({ ...p, tourType: v }))}
//               placeholder="Select tour type"
//               styles={selectStyles}
//               classNamePrefix="create-tour-type"
//               isClearable
//             />
//           </Field>
//           <Field label="Primary Destination" required>
//             <Select
//               isLoading={loadingDest}
//               options={destinations}
//               value={form.primaryDestinationName}
//               onChange={(v) => setForm((p) => ({ ...p, primaryDestinationName: v }))}
//               placeholder={loadingDest ? "Loading destinations..." : "Select destination"}
//               styles={selectStyles}
//               classNamePrefix="create-primary-destination"
//               getOptionValue={(o) => String(o._id || o.value)}
//             />
//           </Field>
//           <Field label="Group Type" required>
//             <Select
//               options={groupTypeOptions}
//               value={form.groupType}
//               onChange={(v) => setForm((p) => ({ ...p, groupType: v }))}
//               placeholder="Select group type"
//               styles={selectStyles}
//               classNamePrefix="create-group-type"
//             />
//           </Field>
//           <Field label="Number of Persons" required>
//             <input
//               type="number"
//               min={1}
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.numberOfPersons}
//               onChange={(e) => setForm((p) => ({ ...p, numberOfPersons: e.target.value }))}
//               placeholder="e.g., 2"
//             />
//           </Field>
//         </div>
//       ),
//     },
//     {
//       key: "dates",
//       title: "Choose Dates",
//       desc: "Set the adventure timeline",
//       fields: ["startDate", "endDate", "numberOfDays"],
//       node: (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Field label="Start Date" required>
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.startDate}
//               onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
//             />
//           </Field>
//           <Field label="End Date" required>
//             <input
//               type="date"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.endDate}
//               onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
//             />
//           </Field>
//           <Field label="Number of Days" required>
//             <input
//               type="number"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.numberOfDays}
//               readOnly
//             />
//           </Field>
//         </div>
//       ),
//     },
//     {
//       key: "contact",
//       title: "Contact Mode",
//       desc: "How should we reach out?",
//       fields: preUrgent ? ["clientContactOption"] : ["clientContactOption", "clientType"],
//       node: (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Field label="Client Contact Option" required>
//             <Select
//               options={contactOptions}
//               value={form.clientContactOption}
//               onChange={(v) => setForm((p) => ({ ...p, clientContactOption: v }))}
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-contact-option"
//             />
//           </Field>
//           <Field label="Client Type" required>
//             {preUrgent ? (
//               <input type="text" className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-50" value="Urgent Contact" readOnly />
//             ) : (
//               <Select
//                 options={clientTypeOptions}
//                 value={form.clientType}
//                 onChange={(v) => setForm((p) => ({ ...p, clientType: v }))}
//                 placeholder="Select"
//                 styles={selectStyles}
//                 classNamePrefix="create-client-type"
//                 isClearable
//               />
//             )}
//           </Field>
//         </div>
//       ),
//     },
//     {
//       key: "address",
//       title: "Where From?",
//       desc: "Pincode powers auto-fill",
//       fields: ["pincode", "district", "state"],
//       node: (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Field label="Pincode" required>
//             <input
//               type="tel"
//               inputMode="numeric"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.pincode}
//               onChange={handlePincodeChange}
//               placeholder="6 digits"
//               maxLength={6}
//             />
//           </Field>
//           <Field label="District" required>
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.district}
//               onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
//               placeholder="Auto from pincode"
//             />
//           </Field>
//           <Field label="State" required>
//             <input
//               type="text"
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//               value={form.state}
//               onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
//               placeholder="Auto from pincode"
//             />
//           </Field>
//         </div>
//       ),
//     },
//     {
//       key: "persona",
//       title: "Know the Player",
//       desc: "Location, behaviour & source",
//       fields: ["clientCurrentLocation", "behavior", "connectedThrough"],
//       node: (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Field label="Client Current Location" required>
//             <Select
//               options={[{ value: "insider", label: "Insider" }, { value: "outsider", label: "Outsider" }]}
//               value={form.clientCurrentLocation}
//               onChange={(v) => setForm((p) => ({ ...p, clientCurrentLocation: v }))}
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-current-location"
//             />
//           </Field>
//           <Field label="Client Behaviour" required>
//             <Select
//               options={behaviourOptions}
//               value={form.behavior}
//               onChange={(v) => setForm((p) => ({ ...p, behavior: v }))}
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-behaviour"
//             />
//           </Field>
//           <Field label="Connected Through (Readonly)" required>
//             <input
//               type="text"
//               value={form.connectedThrough?.label || form.connectedThrough?.value || ""}
//               readOnly
//               className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-50"
//             />
//           </Field>
//         </div>
//       ),
//     },
//     {
//       key: "others",
//       title: "Extras & Power-ups",
//       desc: "Add GST, add-on destinations and notes",
//       fields: ["gstNumber", "addonDestinations", "additionalRequirements"],
//       node: (
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Field label="GST Number">
//               <input
//                 type="text"
//                 className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//                 value={form.gstNumber}
//                 onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))}
//                 placeholder="optional"
//               />
//             </Field>
//             <Field label="Add-on Destination">
//               <div className="flex items-center gap-2">
//                 <div className="flex-1">
//                   <Select
//                     isLoading={loadingDest}
//                     options={destinations}
//                     value={form.addonDestinationInput}
//                     onChange={(v) => setForm((p) => ({ ...p, addonDestinationInput: v }))}
//                     placeholder={loadingDest ? "Loading destinations..." : "Pick a destination"}
//                     styles={selectStyles}
//                     classNamePrefix="addon-destinations-input"
//                     getOptionValue={(o) => String(o._id || o.value)}
//                     isClearable
//                   />
//                 </div>
//                 <button
//                   type="button"
//                   onClick={addAddonDestination}
//                   className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
//                   aria-label="Add add-on destination"
//                 >
//                   +
//                 </button>
//               </div>
//             </Field>
//             <div />
//           </div>

//           {form.addonDestinations.length > 0 && (
//             <div className="w-full overflow-x-auto whitespace-nowrap">
//               <div className="inline-flex gap-2 py-1">
//                 {form.addonDestinations.map((d, idx) => (
//                   <span
//                     key={`${d._id || d.value}-${idx}`}
//                     title={d.label || d.value}
//                     className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-white/30 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/40 transition"
//                   >
//                     {d.label || d.value}
//                     <button
//                       type="button"
//                       aria-label="Remove destination"
//                       onClick={() => removeAddonDestination(idx)}
//                       className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-1 gap-2">
//             <Field label="Additional Requirements">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="text"
//                   className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//                   placeholder="Type a requirement"
//                   value={form.additionalRequirementsInput}
//                   onChange={(e) => setForm((p) => ({ ...p, additionalRequirementsInput: e.target.value }))}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") { e.preventDefault(); addRequirement(); }
//                   }}
//                 />
//                 <button
//                   type="button"
//                   onClick={addRequirement}
//                   className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
//                   aria-label="Add requirement"
//                 >
//                   +
//                 </button>
//               </div>
//             </Field>
//             {form.additionalRequirements.length > 0 && (
//               <div className="w-full overflow-x-auto whitespace-nowrap">
//                 <div className="inline-flex gap-2 py-1">
//                   {form.additionalRequirements.map((item, idx) => (
//                     <span
//                       key={`${item}-${idx}`}
//                       className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-white/30 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/40 transition"
//                     >
//                       {item}
//                       <button
//                         type="button"
//                         aria-label="Remove requirement"
//                         onClick={() => removeRequirement(idx)}
//                         className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       ),
//     },
//   ];

//   // ---------- scoring ----------
//   // Count filled fields across steps; required + optional increment score
//   const fieldIsFilled = (key) => {
//     const v = form[key];
//     if (v == null) return false;
//     if (Array.isArray(v)) return v.length > 0;
//     if (typeof v === "object") return Object.keys(v || {}).length > 0; // select objects
//     return String(v).trim() !== "" && v !== 0;
//   };
//   const totalScoreItems = steps.reduce((acc, s) => acc + s.fields.length, 0);
//   const currentScore = steps.reduce((acc, s) => acc + s.fields.filter((f) => fieldIsFilled(f)).length, 0);
//   const progress = Math.round((currentScore / totalScoreItems) * 100);
//   const progressHue = 0 + (120 * progress) / 100; // 0=red to 120=green

//   // ---------- step navigation ----------
//   const canGoNext = () => {
//     // soft gate: allow proceed but nudge if nothing filled in this step
//     const current = steps[activeStep];
//     const anyFilled = current.fields.some((f) => fieldIsFilled(f));
//     if (!anyFilled) toast.info("Fill at least one field to continue");
//     return anyFilled;
//   };
//   const next = () => {
//     if (activeStep < steps.length - 1 && canGoNext()) setActiveStep((s) => s + 1);
//   };
//   const back = () => setActiveStep((s) => Math.max(0, s - 1));

//   // ---------- animations ----------
//   const variants = {
//     initial: { opacity: 0, y: 24, scale: 0.98 },
//     in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
//     out: { opacity: 0, y: -24, scale: 0.98, transition: { duration: 0.25 } },
//   };

//   return (
//     <div className="relative">
//       {/* Glow background */}
//       <div className="absolute -inset-6 -z-10 bg-gradient-to-b from-[#F6F4FF] to-white rounded-3xl" />

//       {/* Header with score */}
//       <div className="flex items-center justify-between gap-4 mb-4">
//         <div>
//           <h2 className="text-xl font-bold text-gray-800">Create Client — Game Mode</h2>
//           <p className="text-sm text-gray-500">Fill the steps, level up the bar, claim victory 🎉</p>
//         </div>
//         <div className="min-w-[240px]">
//           <div className="flex items-center justify-between text-xs mb-1 text-gray-600">
//             <span>Score</span>
//             <span className="font-semibold">{currentScore}/{totalScoreItems}</span>
//           </div>
//           <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
//             <motion.div
//               className="h-3 rounded-full"
//               initial={{ width: 0 }}
//               animate={{ width: `${progress}%`, backgroundColor: `hsl(${progressHue}, 85%, 45%)` }}
//               transition={{ type: "spring", stiffness: 120, damping: 20 }}
//             />
//           </div>
//           <div className="text-right text-[11px] text-gray-500 mt-1">{progress}%</div>
//         </div>
//       </div>

//       {/* Stepper pills */}
//       <div className="flex flex-wrap items-center gap-2 mb-4">
//         {steps.map((s, idx) => {
//           const done = idx < activeStep;
//           const current = idx === activeStep;
//           return (
//             <button
//               key={s.key}
//               type="button"
//               onClick={() => setActiveStep(idx)}
//               className={`px-3 py-1.5 rounded-full text-sm border transition ${
//                 current
//                   ? "bg-[#8570EE] text-white border-[#8570EE] shadow"
//                   : done
//                   ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
//                   : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
//               }`}
//             >
//               {idx + 1}. {s.title}
//             </button>
//           );
//         })}
//       </div>

//       {/* Form container */}
//       <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
//         <div className="relative min-h-[220px]">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={steps[activeStep].key}
//               variants={variants}
//               initial="initial"
//               animate="in"
//               exit="out"
//               className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm"
//             >
//               <div className="mb-2">
//                 <div className="text-base font-semibold text-gray-800">{steps[activeStep].title}</div>
//                 <div className="text-sm text-gray-500">{steps[activeStep].desc}</div>
//               </div>
//               {steps[activeStep].node}
//             </motion.div>
//           </AnimatePresence>
//         </div>

//         {/* Controls */}
//         <div className="flex items-center justify-between mt-2">
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={onCancel}
//               aria-label="Close"
//               className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
//             >
//               ×
//             </button>
//             {activeStep > 0 && (
//               <button
//                 type="button"
//                 onClick={back}
//                 className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
//               >
//                 ← Back
//               </button>
//             )}
//           </div>

//           {activeStep < steps.length - 1 ? (
//             <button
//               type="button"
//               onClick={next}
//               className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
//             >
//               Continue →
//             </button>
//           ) : (
//             <button
//               type="submit"
//               disabled={submitting}
//               className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60"
//             >
//               {submitting ? "Creating..." : "Finish & Create"}
//             </button>
//           )}
//         </div>
//       </form>

//       {/* Celebration overlay */}
//       <AnimatePresence>
//         {showWin && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
//           >
//             <motion.div
//               initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
//               animate={{ scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 160, damping: 12 } }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-2xl p-8 shadow-2xl border border-white/60 text-center max-w-sm mx-auto"
//               style={{ background: "linear-gradient(180deg, rgba(133,112,238,0.08), white)" }}
//             >
//               <div className="text-5xl mb-2">🏆</div>
//               <h3 className="text-xl font-bold text-gray-800">Victory!</h3>
//               <p className="text-gray-600 mt-1">Client created successfully. Great run! ✨</p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

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





// import React, { useEffect, useMemo, useState } from "react";
// import Select from "react-select";
// import { motion, AnimatePresence } from "framer-motion";
// import API from "../../api";
// import { toast } from "react-toastify";

// /**
//  * Gamified multi-step Create Client (Professional, highly animated)
//  * - Preserves original validation & functionality
//  * - Step-by-step flow with refined, smooth animations
//  * - Brand color scheme (#8570EE) throughout; no emojis
//  */
// export default function CreateClient({ prefill = null, onCancel }) {
//   // ---------- theme helpers ----------
//   const BRAND = "#8570EE";
//   const BRAND_LIGHT = "rgba(133,112,238,0.16)";
//   const GRAY_BORDER = "#e5e7eb";

//   // ---------- react-select styles ----------
//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 12,
//         borderColor: state.isFocused ? BRAND : GRAY_BORDER,
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         maxHeight: 44,
//         backgroundColor: "white",
//         transition: "border-color 160ms ease, box-shadow 160ms ease",
//         ":hover": { borderColor: state.isFocused ? BRAND : "#d1d5db" },
//       }),
//       valueContainer: (b) => ({
//         ...b,
//         padding: "0 12px",
//         overflowX: "auto",
//         overflowY: "hidden",
//         whiteSpace: "nowrap",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "flex-end",
//         gap: 6,
//       }),
//       input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: GRAY_BORDER }),
//       dropdownIndicator: (b) => ({
//         ...b,
//         color: "#6b7280",
//         transition: "color 160ms ease",
//         ":hover": { color: "#4b5563" },
//       }),
//       menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 50 }),
//       option: (b, s) => ({
//         ...b,
//         backgroundColor: s.isFocused
//           ? "rgba(133,112,238,0.08)"
//           : s.isSelected
//           ? BRAND_LIGHT
//           : "white",
//         color: "#222",
//       }),
//       placeholder: (b) => ({ ...b, color: "#6b7280" }),
//       singleValue: (b) => ({ ...b, color: "#111827" }),
//     }),
//     []
//   );

//   // ---------- static options ----------
//   const groupTypeOptions = [
//     { value: "single", label: "Single" },
//     { value: "couple", label: "Couple" },
//     { value: "family", label: "Family" },
//     { value: "friends", label: "Friends" },
//   ];
//   const behaviourOptions = [
//     { value: "polite", label: "Polite" },
//     { value: "normal", label: "Normal" },
//     { value: "hard", label: "Hard" },
//     { value: "educated", label: "Educated" },
//   ];
//   const clientTypeOptions = [
//     { value: "Urgent Contact", label: "Urgent Contact" },
//     { value: "Non Urgent Contact", label: "Non Urgent Contact" },
//   ];
//   const contactOptions = [
//     { value: "phone", label: "Phone" },
//     { value: "whatsapp", label: "WhatsApp" },
//   ];
//   const tourTypeOptions = [
//     { value: "grouptour", label: "Group Tour" },
//     { value: "fixedtour", label: "Fixed Tour" },
//     { value: "customtour", label: "Custom Tour" },
//   ];

//   const preUrgent =
//     (
//       prefill?.clientType?.value ||
//       prefill?.clientType?.label ||
//       ""
//     ).toLowerCase() === "urgent contact";

//   // ---------- destinations ----------
//   const [destinations, setDestinations] = useState([]);
//   const [loadingDest, setLoadingDest] = useState(false);

//   // ---------- form ----------
//   const [form, setForm] = useState({
//     name: prefill?.name || "",
//     mobileNumber: prefill?.mobileNumber || "",
//     whatsappNumber: "",
//     email: "",
//     tourType: null,
//     primaryDestinationName: prefill?.primaryDestinationName
//       ? {
//           _id: prefill.primaryDestinationName._id,
//           value: prefill.primaryDestinationName.value,
//           label:
//             prefill.primaryDestinationName.label ||
//             prefill.primaryDestinationName.value,
//         }
//       : null,
//     addonDestinations: [],
//     addonDestinationInput: null,

//     groupType: null,
//     numberOfPersons: "",
//     startDate: "",
//     endDate: "",
//     numberOfDays: "",

//     pincode: "",
//     district: "",
//     state: "",

//     clientContactOption: contactOptions[0],
//     clientType: preUrgent
//       ? { value: "Urgent Contact", label: "Urgent Contact" }
//       : null,
//     clientCurrentLocation: null,
//     connectedThrough: prefill?.connectedThrough || null,
//     behavior: null,

//     gstNumber: "",
//     additionalRequirementsInput: "",
//     additionalRequirements: [],

//     clientByEntryId: prefill?._id || null,
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [activeStep, setActiveStep] = useState(0);
//   const [showWin, setShowWin] = useState(false);

//   // ---------- load destinations ----------
//   const loadDestinations = async () => {
//     try {
//       setLoadingDest(true);
//       const res = await API.get("/frontoffice/destinations");
//       const opts = (res.data || []).map((d) => ({
//         _id: d._id,
//         value: d.value,
//         label: d.label,
//       }));
//       setDestinations(opts);
//       if (form.primaryDestinationName?._id) {
//         const match = opts.find(
//           (o) => o._id === form.primaryDestinationName._id
//         );
//         if (match) setForm((p) => ({ ...p, primaryDestinationName: match }));
//       }
//     } catch (e) {
//       toast.error(
//         e?.response?.data?.message || e.message || "Failed to load destinations"
//       );
//     } finally {
//       setLoadingDest(false);
//     }
//   };
//   useEffect(() => {
//     loadDestinations();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- inclusive days ----------
//   const computeDays = (start, end) => {
//     if (!start || !end) return "";
//     const s = new Date(start);
//     const e = new Date(end);
//     if (Number.isNaN(s) || Number.isNaN(e)) return "";
//     const sd = new Date(s);
//     sd.setHours(0, 0, 0, 0);
//     const ed = new Date(e);
//     ed.setHours(0, 0, 0, 0);
//     const diff = (ed - sd) / (1000 * 60 * 60 * 24);
//     return diff >= 0 ? String(diff + 1) : "";
//   };
//   useEffect(() => {
//     setForm((p) => ({
//       ...p,
//       numberOfDays: computeDays(p.startDate, p.endDate),
//     }));
//   }, [form.startDate, form.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ---------- pincode autofill ----------
//   const fetchPincodeDetails = async (pincode) => {
//     try {
//       const response = await fetch(
//         `https://api.postalpincode.in/pincode/${pincode}`
//       );
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       if (!Array.isArray(data) || !data[0] || data[0].Status !== "Success") {
//         toast.error("Invalid Pincode , Please check the pincode.");
//         return { error: "Invalid Pincode", details: null };
//       }
//       const po = data[0].PostOffice?.[0];
//       if (!po) throw new Error("No Post Office found for this pincode");
//       return { country: po.Country, state: po.State, district: po.District };
//     } catch (error) {
//       toast.error(error.message);
//       return { error: error.message, details: null };
//     }
//   };

//   const handlePincodeChange = async (e) => {
//     const value = e.target.value.replace(/\D/g, "");
//     setForm((prev) => ({ ...prev, pincode: value, district: "", state: "" }));
//     if (value.length > 6) {
//       toast.error("Pincode should be exactly 6 digits.");
//       return;
//     }
//     if (value.length === 6) {
//       const details = await fetchPincodeDetails(value);
//       if (details && !details.error) {
//         setForm((prev) => ({
//           ...prev,
//           district: details.district || "",
//           state: details.state || "",
//         }));
//       }
//     }
//   };

//   // ---------- Additional Requirements ----------
//   const addRequirement = () => {
//     const text = (form.additionalRequirementsInput || "").trim();
//     if (!text) return;
//     setForm((p) => ({
//       ...p,
//       additionalRequirements: [...p.additionalRequirements, text],
//       additionalRequirementsInput: "",
//     }));
//   };
//   const removeRequirement = (idx) => {
//     setForm((p) => ({
//       ...p,
//       additionalRequirements: p.additionalRequirements.filter((_, i) => i !== idx),
//     }));
//   };

//   // ---------- Add-on Destinations ----------
//   const addAddonDestination = () => {
//     const sel = form.addonDestinationInput;
//     if (!sel) return;
//     const exists = (form.addonDestinations || []).some(
//       (d) => d._id === sel._id || d.value === sel.value
//     );
//     if (exists) {
//       toast.info("Destination already added");
//       return;
//     }
//     setForm((p) => ({
//       ...p,
//       addonDestinations: [...(p.addonDestinations || []), sel],
//       addonDestinationInput: null,
//     }));
//   };
//   const removeAddonDestination = (idx) => {
//     setForm((p) => ({
//       ...p,
//       addonDestinations: (p.addonDestinations || []).filter((_, i) => i !== idx),
//     }));
//   };

//   // ---------- validation (unchanged) ----------
//   const validate = () => {
//     if (!form.name || !form.name.trim())
//       return toast.error("Name is required"), false;
//     if (!/^\d{10,15}$/.test(String(form.mobileNumber || "").trim()))
//       return toast.error("Mobile number must be 10–15 digits"), false;
//     if (!form.tourType) return toast.error("Tour type is required"), false;
//     if (!form.primaryDestinationName)
//       return toast.error("Primary destination is required"), false;
//     if (!form.groupType) return toast.error("Group type is required"), false;
//     if (!form.numberOfPersons || Number(form.numberOfPersons) <= 0)
//       return toast.error("Number of persons is required"), false;
//     if (!form.startDate) return toast.error("Start date is required"), false;
//     if (!form.endDate) return toast.error("End date is required"), false;
//     if (!form.numberOfDays)
//       return toast.error("Number of days is required"), false;
//     if (!form.pincode) return toast.error("Pincode is required"), false;
//     if (!form.state) return toast.error("State is required"), false;
//     if (!form.district) return toast.error("District is required"), false;
//     if (!form.clientContactOption)
//       return toast.error("Client contact option is required"), false;
//     if (!preUrgent && !form.clientType)
//       return toast.error("Client type is required"), false;
//     if (!form.clientCurrentLocation)
//       return toast.error("Client current location is required"), false;
//     if (!form.connectedThrough)
//       return toast.error("Connected through is required"), false;
//     if (!form.behavior)
//       return toast.error("Client behaviour is required"), false;
//     return true;
//   };

//   // ---------- submit ----------
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submitting) return;
//     if (!validate()) return;

//     try {
//       setSubmitting(true);

//       const payload = {
//         name: form.name?.trim(),
//         mobileNumber: form.mobileNumber,
//         email: form.email?.trim() || null,
//         whatsappNumber: form.whatsappNumber?.trim() || null,
//         tourType: form.tourType
//           ? { value: form.tourType.value, label: form.tourType.label }
//           : null,
//         primaryDestinationName: form.primaryDestinationName
//           ? {
//               _id: form.primaryDestinationName._id,
//               value: form.primaryDestinationName.value,
//               label: form.primaryDestinationName.label,
//             }
//           : null,

//         addonDestinations: (form.addonDestinations || []).map((d) => ({
//           _id: d._id,
//           value: d.value,
//           label: d.label,
//         })),

//         groupType: form.groupType,
//         numberOfPersons: Number(form.numberOfPersons),

//         startDate: form.startDate,
//         endDate: form.endDate,
//         numberOfDays: Number(form.numberOfDays),

//         pincode: form.pincode,
//         district: form.district,
//         state: form.state,

//         clientContactOption: form.clientContactOption,
//         clientType: preUrgent
//           ? { value: "Urgent Contact", label: "Urgent Contact" }
//           : form.clientType,
//         clientCurrentLocation: form.clientCurrentLocation,
//         connectedThrough: form.connectedThrough,
//         behavior: form.behavior,

//         gstNumber: form.gstNumber?.trim() || null,

//         additionalRequirments: form.additionalRequirements.length
//           ? form.additionalRequirements.join(" | ")
//           : null,
//         additionalRequirements: form.additionalRequirements,

//         clientByEntryId: form.clientByEntryId || null,
//         campaignName: prefill?.campaignName
//           ? {
//               kind: prefill.campaignName.kind,
//               refId: prefill.campaignName.refId,
//               label: prefill.campaignName.label,
//             }
//           : null,
//         createdAtByEntry: prefill?.createdAtByEntry || null,
//         entryId: prefill?.entryId || null,
//       };

//       await API.post("/frontoffice/create-client", payload);
//       toast.success("Client created");
//       setShowWin(true);
//       setTimeout(() => {
//         if (onCancel) onCancel();
//       }, 1600);
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || err.message || "Something went wrong"
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- STEP CONFIG (professional copy, no emojis) ----------
//   const steps = [
//     {
//       key: "basic",
//       title: "Enter Client Details",
//       desc: "Provide the client's primary contact information.",
//       fields: ["name", "mobileNumber", "whatsappNumber", "email"],
//       node: (
//         <StepGrid cols={4}>
//           <Field label="Name" required>
//             <InputText
//               value={form.name}
//               onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//               placeholder="Client name"
//               disabled={Boolean(prefill?.name)}
//             />
//           </Field>
//           <Field label="Mobile Number" required>
//             <InputText value={form.mobileNumber} disabled inputMode="numeric" />
//           </Field>
//           <Field label="WhatsApp Number">
//             <InputText
//               value={form.whatsappNumber}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, whatsappNumber: e.target.value }))
//               }
//               inputMode="numeric"
//               placeholder="e.g., 9876543210"
//             />
//           </Field>
//           <Field label="Email">
//             <InputText
//               type="email"
//               value={form.email}
//               onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
//               placeholder="name@example.com"
//             />
//           </Field>
//         </StepGrid>
//       ),
//     },
//     {
//       key: "trip-core",
//       title: "Trip Basics",
//       desc: "Select tour type, destination and group details.",
//       fields: [
//         "tourType",
//         "primaryDestinationName",
//         "groupType",
//         "numberOfPersons",
//       ],
//       node: (
//         <StepGrid cols={4}>
//           <Field label="Tour Type" required>
//             <Select
//               options={tourTypeOptions}
//               value={form.tourType}
//               onChange={(v) => setForm((p) => ({ ...p, tourType: v }))}
//               placeholder="Select tour type"
//               styles={selectStyles}
//               classNamePrefix="create-tour-type"
//               isClearable
//             />
//           </Field>
//           <Field label="Primary Destination" required>
//             <Select
//               isLoading={loadingDest}
//               options={destinations}
//               value={form.primaryDestinationName}
//               onChange={(v) =>
//                 setForm((p) => ({ ...p, primaryDestinationName: v }))
//               }
//               placeholder={
//                 loadingDest ? "Loading destinations..." : "Select destination"
//               }
//               styles={selectStyles}
//               classNamePrefix="create-primary-destination"
//               getOptionValue={(o) => String(o._id || o.value)}
//             />
//           </Field>
//           <Field label="Group Type" required>
//             <Select
//               options={groupTypeOptions}
//               value={form.groupType}
//               onChange={(v) => setForm((p) => ({ ...p, groupType: v }))}
//               placeholder="Select group type"
//               styles={selectStyles}
//               classNamePrefix="create-group-type"
//             />
//           </Field>
//           <Field label="Number of Persons" required>
//             <InputNumber
//               min={1}
//               value={form.numberOfPersons}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, numberOfPersons: e.target.value }))
//               }
//               placeholder="e.g., 2"
//             />
//           </Field>
//         </StepGrid>
//       ),
//     },
//     {
//       key: "dates",
//       title: "Dates",
//       desc: "Set trip start, end and total days.",
//       fields: ["startDate", "endDate", "numberOfDays"],
//       node: (
//         <StepGrid cols={3}>
//           <Field label="Start Date" required>
//             <InputText
//               type="date"
//               value={form.startDate}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, startDate: e.target.value }))
//               }
//             />
//           </Field>
//           <Field label="End Date" required>
//             <InputText
//               type="date"
//               value={form.endDate}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, endDate: e.target.value }))
//               }
//             />
//           </Field>
//           <Field label="Number of Days" required>
//             <InputNumber value={form.numberOfDays} readOnly />
//           </Field>
//         </StepGrid>
//       ),
//     },
//     {
//       key: "contact",
//       title: "Contact Preferences",
//       desc: "Choose contact option and client type.",
//       fields: preUrgent
//         ? ["clientContactOption"]
//         : ["clientContactOption", "clientType"],
//       node: (
//         <StepGrid cols={2}>
//           <Field label="Client Contact Option" required>
//             <Select
//               options={contactOptions}
//               value={form.clientContactOption}
//               onChange={(v) =>
//                 setForm((p) => ({ ...p, clientContactOption: v }))
//               }
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-contact-option"
//             />
//           </Field>
//           <Field label="Client Type" required>
//             {preUrgent ? (
//               <InputText value="Urgent Contact" readOnly />
//             ) : (
//               <Select
//                 options={clientTypeOptions}
//                 value={form.clientType}
//                 onChange={(v) => setForm((p) => ({ ...p, clientType: v }))}
//                 placeholder="Select"
//                 styles={selectStyles}
//                 classNamePrefix="create-client-type"
//                 isClearable
//               />
//             )}
//           </Field>
//         </StepGrid>
//       ),
//     },
//     {
//       key: "address",
//       title: "Address",
//       desc: "Enter pincode to auto-fill district and state.",
//       fields: ["pincode", "district", "state"],
//       node: (
//         <StepGrid cols={3}>
//           <Field label="Pincode" required>
//             <InputText
//               inputMode="numeric"
//               value={form.pincode}
//               onChange={handlePincodeChange}
//               placeholder="6 digits"
//               maxLength={6}
//             />
//           </Field>
//           <Field label="District" required>
//             <InputText
//               value={form.district}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, district: e.target.value }))
//               }
//               placeholder="Auto from pincode"
//             />
//           </Field>
//           <Field label="State" required>
//             <InputText
//               value={form.state}
//               onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
//               placeholder="Auto from pincode"
//             />
//           </Field>
//         </StepGrid>
//       ),
//     },
//     {
//       key: "persona",
//       title: "Client Profile",
//       desc: "Select location, behaviour and source.",
//       fields: ["clientCurrentLocation", "behavior", "connectedThrough"],
//       node: (
//         <StepGrid cols={3}>
//           <Field label="Client Current Location" required>
//             <Select
//               options={[
//                 { value: "insider", label: "Insider" },
//                 { value: "outsider", label: "Outsider" },
//               ]}
//               value={form.clientCurrentLocation}
//               onChange={(v) =>
//                 setForm((p) => ({ ...p, clientCurrentLocation: v }))
//               }
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-current-location"
//             />
//           </Field>
//           <Field label="Client Behaviour" required>
//             <Select
//               options={behaviourOptions}
//               value={form.behavior}
//               onChange={(v) => setForm((p) => ({ ...p, behavior: v }))}
//               placeholder="Select"
//               styles={selectStyles}
//               classNamePrefix="create-behaviour"
//             />
//           </Field>
//           <Field label="Connected Through (Readonly)" required>
//             <InputText
//               value={
//                 form.connectedThrough?.label ||
//                 form.connectedThrough?.value ||
//                 ""
//               }
//               readOnly
//             />
//           </Field>
//         </StepGrid>
//       ),
//     },
//     {
//       key: "others",
//       title: "Additional Details",
//       desc: "Add GST, add-on destinations and requirements.",
//       fields: ["gstNumber", "addonDestinations", "additionalRequirements"],
//       node: (
//         <div className="space-y-4">
//           <StepGrid cols={3}>
//             <Field label="GST Number">
//               <InputText
//                 value={form.gstNumber}
//                 onChange={(e) =>
//                   setForm((p) => ({ ...p, gstNumber: e.target.value }))
//                 }
//                 placeholder="optional"
//               />
//             </Field>
//             <Field label="Add-on Destination">
//               <div className="flex items-center gap-2">
//                 <div className="flex-1">
//                   <Select
//                     isLoading={loadingDest}
//                     options={destinations}
//                     value={form.addonDestinationInput}
//                     onChange={(v) =>
//                       setForm((p) => ({ ...p, addonDestinationInput: v }))
//                     }
//                     placeholder={
//                       loadingDest ? "Loading destinations..." : "Pick a destination"
//                     }
//                     styles={selectStyles}
//                     classNamePrefix="addon-destinations-input"
//                     getOptionValue={(o) => String(o._id || o.value)}
//                     isClearable
//                   />
//                 </div>
//                 <ActionButton onClick={addAddonDestination}>Add</ActionButton>
//               </div>
//             </Field>
//             <div />
//           </StepGrid>

//           {form.addonDestinations.length > 0 && (
//             <div className="w-full overflow-x-auto whitespace-nowrap">
//               <div className="inline-flex gap-2 py-1">
//                 {form.addonDestinations.map((d, idx) => (
//                   <span
//                     key={`${d._id || d.value}-${idx}`}
//                     title={d.label || d.value}
//                     className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
//                        bg-white/30 backdrop-blur-md border border-white/40 shadow-sm
//                        hover:bg-white/40 transition"
//                   >
//                     {d.label || d.value}
//                     <button
//                       type="button"
//                       aria-label="Remove destination"
//                       onClick={() => removeAddonDestination(idx)}
//                       className="inline-flex items-center justify-center w-5 h-5 rounded-full
//                          bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-1 gap-2">
//             <Field label="Additional Requirements">
//               <div className="flex items-center gap-2">
//                 <InputText
//                   value={form.additionalRequirementsInput}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       additionalRequirementsInput: e.target.value,
//                     }))
//                   }
//                   placeholder="Type a requirement"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       addRequirement();
//                     }
//                   }}
//                 />
//                 <ActionButton onClick={addRequirement}>Add</ActionButton>
//               </div>
//             </Field>

//             {form.additionalRequirements.length > 0 && (
//               <div className="w-full overflow-x-auto whitespace-nowrap">
//                 <div className="inline-flex gap-2 py-1">
//                   {form.additionalRequirements.map((item, idx) => (
//                     <span
//                       key={`${item}-${idx}`}
//                       className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
//                        bg-white/30 backdrop-blur-md border border-white/40 shadow-sm
//                        hover:bg-white/40 transition"
//                     >
//                       {item}
//                       <button
//                         type="button"
//                         aria-label="Remove requirement"
//                         onClick={() => removeRequirement(idx)}
//                         className="inline-flex items-center justify-center w-5 h-5 rounded-full
//                          bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       ),
//     },
//   ];

//   // ---------- scoring ----------
//   const fieldIsFilled = (key) => {
//     const v = form[key];
//     if (v == null) return false;
//     if (Array.isArray(v)) return v.length > 0;
//     if (typeof v === "object") return Object.keys(v || {}).length > 0;
//     return String(v).trim() !== "" && v !== 0;
//   };
//   const totalScoreItems = steps.reduce((acc, s) => acc + s.fields.length, 0);
//   const currentScore = steps.reduce(
//     (acc, s) => acc + s.fields.filter((f) => fieldIsFilled(f)).length,
//     0
//   );
//   const progress = Math.round((currentScore / totalScoreItems) * 100);
//   const progressHue = 0 + (120 * progress) / 100; // 0=red to 120=green

//   // ---------- step navigation ----------
//   const canGoNext = () => {
//     const current = steps[activeStep];
//     const anyFilled = current.fields.some((f) => fieldIsFilled(f));
//     if (!anyFilled) toast.info("Fill at least one field to continue");
//     return anyFilled;
//   };
//   const next = () => {
//     if (activeStep < steps.length - 1 && canGoNext())
//       setActiveStep((s) => s + 1);
//   };
//   const back = () => setActiveStep((s) => Math.max(0, s - 1));

//   // ---------- animations ----------
//   const cardVariants = {
//     initial: { opacity: 0, y: 24, scale: 0.98, filter: "blur(4px)" },
//     in: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       filter: "blur(0px)",
//       transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
//     },
//     out: {
//       opacity: 0,
//       y: -16,
//       scale: 0.985,
//       filter: "blur(4px)",
//       transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
//     },
//   };

//   return (
//     <div className="relative">
//       {/* Animated gradient backdrop */}
//       <motion.div
//         aria-hidden
//         className="absolute -inset-6 -z-10 rounded-3xl"
//         initial={{
//           background:
//             `radial-gradient(60% 60% at 20% 20%, ${BRAND_LIGHT} 0%, rgba(255,255,255,0) 60%), 
//              radial-gradient(60% 60% at 80% 0%, rgba(133,112,238,0.08) 0%, rgba(255,255,255,0) 60%)`,
//         }}
//         animate={{
//           background: [
//             `radial-gradient(60% 60% at 20% 20%, ${BRAND_LIGHT} 0%, rgba(255,255,255,0) 60%), 
//              radial-gradient(60% 60% at 80% 0%, rgba(133,112,238,0.08) 0%, rgba(255,255,255,0) 60%)`,
//             `radial-gradient(60% 60% at 80% 20%, ${BRAND_LIGHT} 0%, rgba(255,255,255,0) 60%), 
//              radial-gradient(60% 60% at 20% 0%, rgba(133,112,238,0.08) 0%, rgba(255,255,255,0) 60%)`,
//           ],
//         }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Header with score */}
//       <div className="flex items-center justify-between gap-4 mb-4">
//         <div>
//           <h2 className="text-xl font-bold text-gray-800">Create Client</h2>
//           <p className="text-sm text-gray-500">
//             Complete each step to finish creating the client.
//           </p>
//         </div>
//         <div className="min-w-[260px]">
//           <div className="flex items-center justify-between text-xs mb-1 text-gray-600">
//             <span>Completion</span>
//             <span className="font-semibold">
//               {currentScore}/{totalScoreItems}
//             </span>
//           </div>
//           <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
//             <motion.div
//               className="h-3 rounded-full"
//               initial={{ width: 0 }}
//               animate={{
//                 width: `${progress}%`,
//                 backgroundColor: `hsl(${progressHue}, 85%, 45%)`,
//               }}
//               transition={{ type: "spring", stiffness: 140, damping: 18 }}
//             />
//           </div>
//           <div className="text-right text-[11px] text-gray-500 mt-1">
//             {progress}%
//           </div>
//         </div>
//       </div>

//       {/* Stepper pills */}
//       <div className="flex flex-wrap items-center gap-2 mb-4">
//         {steps.map((s, idx) => {
//           const done = idx < activeStep;
//           const current = idx === activeStep;
//           return (
//             <motion.button
//               whileHover={{ y: -1 }}
//               whileTap={{ scale: 0.98 }}
//               key={s.key}
//               type="button"
//               onClick={() => setActiveStep(idx)}
//               className={`px-3 py-1.5 rounded-full text-sm border transition ${
//                 current
//                   ? "bg-[#8570EE] text-white border-[#8570EE] shadow"
//                   : done
//                   ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
//                   : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
//               }`}
//             >
//               {idx + 1}. {s.title}
//             </motion.button>
//           );
//         })}
//       </div>

//       {/* Form container */}
//       <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
//         <div className="relative min-h-[240px]">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={steps[activeStep].key}
//               variants={cardVariants}
//               initial="initial"
//               animate="in"
//               exit="out"
//               className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm"
//             >
//               <div className="mb-3">
//                 <div className="text-base font-semibold text-gray-800">
//                   {steps[activeStep].title}
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   {steps[activeStep].desc}
//                 </div>
//               </div>

//               {steps[activeStep].node}
//             </motion.div>
//           </AnimatePresence>
//         </div>

//         {/* Controls */}
//         <div className="flex items-center justify-between mt-2">
//           <div className="flex items-center gap-2">
//             <IconButton onClick={onCancel} ariaLabel="Close">
//               ×
//             </IconButton>
//             {activeStep > 0 && <OutlineButton onClick={back}>Back</OutlineButton>}
//           </div>

//           {activeStep < steps.length - 1 ? (
//             <PrimaryButton onClick={next}>Continue</PrimaryButton>
//           ) : (
//             <PrimaryButton type="submit" disabled={submitting}>
//               {submitting ? "Creating..." : "Finish & Create"}
//             </PrimaryButton>
//           )}
//         </div>
//       </form>

//       {/* Celebration overlay */}
//       <AnimatePresence>
//         {showWin && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{
//                 scale: 1,
//                 opacity: 1,
//                 transition: { type: "spring", stiffness: 160, damping: 12 },
//               }}
//               exit={{ scale: 0.98, opacity: 0 }}
//               className="bg-white rounded-2xl p-8 shadow-2xl border border-white/60 text-center max-w-sm mx-auto"
//               style={{
//                 background:
//                   "linear-gradient(180deg, rgba(133,112,238,0.08), white)",
//               }}
//             >
//               {/* Animated checkmark */}
//               <svg width="64" height="64" viewBox="0 0 24 24" className="mx-auto mb-2">
//                 <motion.path
//                   d="M20 7L9 18l-5-5"
//                   fill="none"
//                   stroke={BRAND}
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   initial={{ pathLength: 0 }}
//                   animate={{ pathLength: 1 }}
//                   transition={{ duration: 0.6, ease: "easeInOut" }}
//                 />
//               </svg>
//               <h3 className="text-xl font-bold text-gray-800">Client Created</h3>
//               <p className="text-gray-600 mt-1">
//                 Your client has been created successfully.
//               </p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ---------- UI atoms ----------
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

// function StepGrid({ cols = 4, children }) {
//   return <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>{children}</div>;
// }

// function InputText(props) {
//   const { className = "", ...rest } = props;
//   return (
//     <motion.input
//       whileFocus={{ boxShadow: "0 0 0 4px rgba(133,112,238,0.20)", y: -1 }}
//       className={`w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] ${className}`}
//       {...rest}
//     />
//   );
// }
// function InputNumber(props) {
//   return <InputText type="number" {...props} />;
// }

// function PrimaryButton({ children, onClick, type = "button", disabled }) {
//   return (
//     <motion.button
//       type={type}
//       disabled={disabled}
//       whileHover={{ y: -1 }}
//       whileTap={{ scale: 0.98 }}
//       className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60"
//       onClick={onClick}
//     >
//       {children}
//     </motion.button>
//   );
// }
// function OutlineButton({ children, onClick }) {
//   return (
//     <motion.button
//       whileHover={{ y: -1 }}
//       whileTap={{ scale: 0.98 }}
//       type="button"
//       onClick={onClick}
//       className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
//     >
//       {children}
//     </motion.button>
//   );
// }
// function IconButton({ children, onClick, ariaLabel }) {
//   return (
//     <motion.button
//       whileHover={{ scale: 1.03 }}
//       whileTap={{ scale: 0.97 }}
//       type="button"
//       onClick={onClick}
//       aria-label={ariaLabel}
//       className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
//     >
//       {children}
//     </motion.button>
//   );
// }
// function ActionButton({ children, onClick }) {
//   return (
//     <motion.button
//       type="button"
//       whileHover={{ y: -1 }}
//       whileTap={{ scale: 0.98 }}
//       onClick={onClick}
//       className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
//     >
//       {children}
//     </motion.button>
//   );
// }



import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../api";
import { toast } from "react-toastify";

/**
 * Gamified multi-step Create Client
 * - Preserves original validation & functionality
 * - Adds step-by-step flow, animated transitions, score bar, and celebration
 */
export default function CreateClient({ prefill = null, onCancel }) {
  // ---------- theme helpers ----------
  const PURPLE = "#8570EE"; // brand primary
  const PURPLE_LIGHT = "rgba(133,112,238,0.16)";
  const GRAY_BORDER = "#e5e7eb";

  // ---------- react-select styles ----------
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? PURPLE : GRAY_BORDER,
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        maxHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? PURPLE : "#d1d5db" },
      }),
      valueContainer: (b) => ({
        ...b,
        padding: "0 12px",
        overflowX: "auto",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
      }),
      input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: GRAY_BORDER }),
      dropdownIndicator: (b) => ({
        ...b,
        color: "#6b7280",
        ":hover": { color: "#4b5563" },
      }),
      menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 50 }),
      option: (b, s) => ({
        ...b,
        backgroundColor: s.isFocused
          ? "rgba(133,112,238,0.08)"
          : s.isSelected
          ? PURPLE_LIGHT
          : "white",
        color: "#222",
      }),
      placeholder: (b) => ({ ...b, color: "#6b7280" }),
      singleValue: (b) => ({ ...b, color: "#111827" }),
    }),
    []
  );

  // ---------- static options ----------
  const groupTypeOptions = [
    { value: "single", label: "Single" },
    { value: "couple", label: "Couple" },
    { value: "family", label: "Family" },
    { value: "friends", label: "Friends" },
  ];
  const behaviourOptions = [
    { value: "polite", label: "Polite" },
    { value: "normal", label: "Normal" },
    { value: "hard", label: "Hard" },
    { value: "educated", label: "Educated" },
  ];
  const clientTypeOptions = [
    { value: "Urgent Contact", label: "Urgent Contact" },
    { value: "Non Urgent Contact", label: "Non Urgent Contact" },
  ];
  const contactOptions = [
    { value: "phone", label: "Phone" },
    { value: "whatsapp", label: "WhatsApp" },
  ];
  const tourTypeOptions = [
    { value: "grouptour", label: "Group Tour" },
    { value: "fixedtour", label: "Fixed Tour" },
    { value: "customtour", label: "Custom Tour" },
  ];

  const preUrgent = (
    (prefill?.clientType?.value || prefill?.clientType?.label || "").toLowerCase() ===
    "urgent contact"
  );

  // ---------- destinations ----------
  const [destinations, setDestinations] = useState([]);
  const [loadingDest, setLoadingDest] = useState(false);

  // ---------- form ----------
  const [form, setForm] = useState({
    name: prefill?.name || "",
    mobileNumber: prefill?.mobileNumber || "",
    whatsappNumber: "",
    email: "",
    tourType: null,
    primaryDestinationName: prefill?.primaryDestinationName
      ? {
          _id: prefill.primaryDestinationName._id,
          value: prefill.primaryDestinationName.value,
          label: prefill.primaryDestinationName.label || prefill.primaryDestinationName.value,
        }
      : null,
    addonDestinations: [],
    addonDestinationInput: null,

    groupType: null,
    numberOfPersons: "",
    startDate: "",
    endDate: "",
    numberOfDays: "",

    pincode: "",
    district: "",
    state: "",

    clientContactOption: contactOptions[0],
    clientType: preUrgent ? { value: "Urgent Contact", label: "Urgent Contact" } : null,
    clientCurrentLocation: null,
    connectedThrough: prefill?.connectedThrough || null,
    behavior: null,

    gstNumber: "",
    additionalRequirementsInput: "",
    additionalRequirements: [],

    clientByEntryId: prefill?._id || null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showWin, setShowWin] = useState(false);

  // ---------- load destinations ----------
  const loadDestinations = async () => {
    try {
      setLoadingDest(true);
      const res = await API.get("/frontoffice/destinations");
      const opts = (res.data || []).map((d) => ({ _id: d._id, value: d.value, label: d.label }));
      setDestinations(opts);
      if (form.primaryDestinationName?._id) {
        const match = opts.find((o) => o._id === form.primaryDestinationName._id);
        if (match) setForm((p) => ({ ...p, primaryDestinationName: match }));
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
    } finally {
      setLoadingDest(false);
    }
  };
  useEffect(() => {
    loadDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- inclusive days ----------
  const computeDays = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s) || Number.isNaN(e)) return "";
    const sd = new Date(s); sd.setHours(0,0,0,0);
    const ed = new Date(e); ed.setHours(0,0,0,0);
    const diff = (ed - sd) / (1000 * 60 * 60 * 24);
    return diff >= 0 ? String(diff + 1) : "";
  };
  useEffect(() => {
    setForm((p) => ({ ...p, numberOfDays: computeDays(p.startDate, p.endDate) }));
  }, [form.startDate, form.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- pincode autofill ----------
  const fetchPincodeDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (!Array.isArray(data) || !data[0] || data[0].Status !== "Success") {
        toast.error("Invalid Pincode , Please check the pincode.");
        return { error: "Invalid Pincode", details: null };
      }
      const po = data[0].PostOffice?.[0];
      if (!po) throw new Error("No Post Office found for this pincode");
      return { country: po.Country, state: po.State, district: po.District };
    } catch (error) {
      toast.error(error.message);
      return { error: error.message, details: null };
    }
  };
  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, pincode: value, district: "", state: "" }));
    if (value.length > 6) {
      toast.error("Pincode should be exactly 6 digits.");
      return;
    }
    if (value.length === 6) {
      const details = await fetchPincodeDetails(value);
      if (details && !details.error) {
        setForm((prev) => ({ ...prev, district: details.district || "", state: details.state || "" }));
      }
    }
  };

  // ---------- Requirements & Add-ons ----------
  const addRequirement = () => {
    const text = (form.additionalRequirementsInput || "").trim();
    if (!text) return;
    setForm((p) => ({
      ...p,
      additionalRequirements: [...p.additionalRequirements, text],
      additionalRequirementsInput: "",
    }));
  };
  const removeRequirement = (idx) => {
    setForm((p) => ({ ...p, additionalRequirements: p.additionalRequirements.filter((_, i) => i !== idx) }));
  };
  const addAddonDestination = () => {
    const sel = form.addonDestinationInput;
    if (!sel) return;
    const exists = (form.addonDestinations || []).some((d) => d._id === sel._id || d.value === sel.value);
    if (exists) return toast.info("Destination already added");
    setForm((p) => ({ ...p, addonDestinations: [...(p.addonDestinations || []), sel], addonDestinationInput: null }));
  };
  const removeAddonDestination = (idx) => {
    setForm((p) => ({ ...p, addonDestinations: (p.addonDestinations || []).filter((_, i) => i !== idx) }));
  };

  // ---------- validation (unchanged) ----------
  const validate = () => {
    if (!form.name || !form.name.trim()) return toast.error("Name is required"), false;
    if (!/^\d{10,15}$/.test(String(form.mobileNumber || "").trim())) return toast.error("Mobile number must be 10–15 digits"), false;
    if (!form.tourType) return toast.error("Tour type is required"), false;
    if (!form.primaryDestinationName) return toast.error("Primary destination is required"), false;
    if (!form.groupType) return toast.error("Group type is required"), false;
    if (!form.numberOfPersons || Number(form.numberOfPersons) <= 0) return toast.error("Number of persons is required"), false;
    if (!form.startDate) return toast.error("Start date is required"), false;
    if (!form.endDate) return toast.error("End date is required"), false;
    if (!form.numberOfDays) return toast.error("Number of days is required"), false;
    if (!form.pincode) return toast.error("Pincode is required"), false;
    if (!form.state) return toast.error("State is required"), false;
    if (!form.district) return toast.error("District is required"), false;
    if (!form.clientContactOption) return toast.error("Client contact option is required"), false;
    if (!preUrgent && !form.clientType) return toast.error("Client type is required"), false;
    if (!form.clientCurrentLocation) return toast.error("Client current location is required"), false;
    if (!form.connectedThrough) return toast.error("Connected through is required"), false;
    if (!form.behavior) return toast.error("Client behaviour is required"), false;
    return true;
  };

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    try {
      setSubmitting(true);
      const payload = {
        name: form.name?.trim(),
        mobileNumber: form.mobileNumber,
        email: form.email?.trim() || null,
        whatsappNumber: form.whatsappNumber?.trim() || null,
        tourType: form.tourType ? { value: form.tourType.value, label: form.tourType.label } : null,
        primaryDestinationName: form.primaryDestinationName
          ? { _id: form.primaryDestinationName._id, value: form.primaryDestinationName.value, label: form.primaryDestinationName.label }
          : null,
        addonDestinations: (form.addonDestinations || []).map((d) => ({ _id: d._id, value: d.value, label: d.label })),
        groupType: form.groupType,
        numberOfPersons: Number(form.numberOfPersons),
        startDate: form.startDate,
        endDate: form.endDate,
        numberOfDays: Number(form.numberOfDays),
        pincode: form.pincode,
        district: form.district,
        state: form.state,
        clientContactOption: form.clientContactOption,
        clientType: preUrgent ? { value: "Urgent Contact", label: "Urgent Contact" } : form.clientType,
        clientCurrentLocation: form.clientCurrentLocation,
        connectedThrough: form.connectedThrough,
        behavior: form.behavior,
        gstNumber: form.gstNumber?.trim() || null,
        additionalRequirments: form.additionalRequirements.length ? form.additionalRequirements.join(" | ") : null,
        additionalRequirements: form.additionalRequirements,
        clientByEntryId: form.clientByEntryId || null,
        campaignName: prefill?.campaignName
          ? { kind: prefill.campaignName.kind, refId: prefill.campaignName.refId, label: prefill.campaignName.label }
          : null,
        createdAtByEntry: prefill?.createdAtByEntry || null,
        entryId: prefill?.entryId || null,
      };
      await API.post("/frontoffice/create-client", payload);
      toast.success("Client created");
      setShowWin(true);
      setTimeout(() => { if (onCancel) onCancel(); }, 1800);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- STEP CONFIG ----------
  // Steps as groups requested by user
  const steps = [
    {
      key: "basic",
      title: "Player Intro",
      desc: "Tell us who the hero is",
      fields: ["name", "mobileNumber", "whatsappNumber", "email"],
      node: (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Name" required>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Client name"
              disabled={Boolean(prefill?.name)}
            />
          </Field>
          <Field label="Mobile Number" required>
            <input
              type="tel"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.mobileNumber}
              disabled
            />
          </Field>
          <Field label="WhatsApp Number">
            <input
              type="tel"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.whatsappNumber}
              onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
              placeholder="e.g., 9876543210"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="name@example.com"
            />
          </Field>
        </div>
      ),
    },
    {
      key: "trip-core",
      title: "Quest Setup",
      desc: "Pick the quest type & party",
      fields: ["tourType", "primaryDestinationName", "groupType", "numberOfPersons"],
      node: (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Tour Type" required>
            <Select
              options={tourTypeOptions}
              value={form.tourType}
              onChange={(v) => setForm((p) => ({ ...p, tourType: v }))}
              placeholder="Select tour type"
              styles={selectStyles}
              classNamePrefix="create-tour-type"
              isClearable
            />
          </Field>
          <Field label="Primary Destination" required>
            <Select
              isLoading={loadingDest}
              options={destinations}
              value={form.primaryDestinationName}
              onChange={(v) => setForm((p) => ({ ...p, primaryDestinationName: v }))}
              placeholder={loadingDest ? "Loading destinations..." : "Select destination"}
              styles={selectStyles}
              classNamePrefix="create-primary-destination"
              getOptionValue={(o) => String(o._id || o.value)}
            />
          </Field>
          <Field label="Group Type" required>
            <Select
              options={groupTypeOptions}
              value={form.groupType}
              onChange={(v) => setForm((p) => ({ ...p, groupType: v }))}
              placeholder="Select group type"
              styles={selectStyles}
              classNamePrefix="create-group-type"
            />
          </Field>
          <Field label="Number of Persons" required>
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.numberOfPersons}
              onChange={(e) => setForm((p) => ({ ...p, numberOfPersons: e.target.value }))}
              placeholder="e.g., 2"
            />
          </Field>
        </div>
      ),
    },
    {
      key: "dates",
      title: "Choose Dates",
      desc: "Set the adventure timeline",
      fields: ["startDate", "endDate", "numberOfDays"],
      node: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Start Date" required>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            />
          </Field>
          <Field label="End Date" required>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            />
          </Field>
          <Field label="Number of Days" required>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.numberOfDays}
              readOnly
            />
          </Field>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact Mode",
      desc: "How should we reach out?",
      fields: preUrgent ? ["clientContactOption"] : ["clientContactOption", "clientType"],
      node: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Client Contact Option" required>
            <Select
              options={contactOptions}
              value={form.clientContactOption}
              onChange={(v) => setForm((p) => ({ ...p, clientContactOption: v }))}
              placeholder="Select"
              styles={selectStyles}
              classNamePrefix="create-contact-option"
            />
          </Field>
          <Field label="Client Type" required>
            {preUrgent ? (
              <input type="text" className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-50" value="Urgent Contact" readOnly />
            ) : (
              <Select
                options={clientTypeOptions}
                value={form.clientType}
                onChange={(v) => setForm((p) => ({ ...p, clientType: v }))}
                placeholder="Select"
                styles={selectStyles}
                classNamePrefix="create-client-type"
                isClearable
              />
            )}
          </Field>
        </div>
      ),
    },
    {
      key: "address",
      title: "Where From?",
      desc: "Pincode powers auto-fill",
      fields: ["pincode", "district", "state"],
      node: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Pincode" required>
            <input
              type="tel"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.pincode}
              onChange={handlePincodeChange}
              placeholder="6 digits"
              maxLength={6}
            />
          </Field>
          <Field label="District" required>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.district}
              onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
              placeholder="Auto from pincode"
            />
          </Field>
          <Field label="State" required>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              placeholder="Auto from pincode"
            />
          </Field>
        </div>
      ),
    },
    {
      key: "persona",
      title: "Know the Player",
      desc: "Location, behaviour & source",
      fields: ["clientCurrentLocation", "behavior", "connectedThrough"],
      node: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Client Current Location" required>
            <Select
              options={[{ value: "insider", label: "Insider" }, { value: "outsider", label: "Outsider" }]}
              value={form.clientCurrentLocation}
              onChange={(v) => setForm((p) => ({ ...p, clientCurrentLocation: v }))}
              placeholder="Select"
              styles={selectStyles}
              classNamePrefix="create-current-location"
            />
          </Field>
          <Field label="Client Behaviour" required>
            <Select
              options={behaviourOptions}
              value={form.behavior}
              onChange={(v) => setForm((p) => ({ ...p, behavior: v }))}
              placeholder="Select"
              styles={selectStyles}
              classNamePrefix="create-behaviour"
            />
          </Field>
          <Field label="Connected Through (Readonly)" required>
            <input
              type="text"
              value={form.connectedThrough?.label || form.connectedThrough?.value || ""}
              readOnly
              className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-50"
            />
          </Field>
        </div>
      ),
    },
    {
      key: "others",
      title: "Extras & Power-ups",
      desc: "Add GST, add-on destinations and notes",
      fields: ["gstNumber", "addonDestinations", "additionalRequirements"],
      node: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="GST Number">
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                value={form.gstNumber}
                onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))}
                placeholder="optional"
              />
            </Field>
            <Field label="Add-on Destination">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    isLoading={loadingDest}
                    options={destinations}
                    value={form.addonDestinationInput}
                    onChange={(v) => setForm((p) => ({ ...p, addonDestinationInput: v }))}
                    placeholder={loadingDest ? "Loading destinations..." : "Pick a destination"}
                    styles={selectStyles}
                    classNamePrefix="addon-destinations-input"
                    getOptionValue={(o) => String(o._id || o.value)}
                    isClearable
                  />
                </div>
                <button
                  type="button"
                  onClick={addAddonDestination}
                  className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
                  aria-label="Add add-on destination"
                >
                  +
                </button>
              </div>
            </Field>
            <div />
          </div>

          {form.addonDestinations.length > 0 && (
            <div className="w-full overflow-x-auto whitespace-nowrap">
              <div className="inline-flex gap-2 py-1">
                {form.addonDestinations.map((d, idx) => (
                  <span
                    key={`${d._id || d.value}-${idx}`}
                    title={d.label || d.value}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-white/30 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/40 transition"
                  >
                    {d.label || d.value}
                    <button
                      type="button"
                      aria-label="Remove destination"
                      onClick={() => removeAddonDestination(idx)}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <Field label="Additional Requirements">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                  placeholder="Type a requirement"
                  value={form.additionalRequirementsInput}
                  onChange={(e) => setForm((p) => ({ ...p, additionalRequirementsInput: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addRequirement(); }
                  }}
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
                  aria-label="Add requirement"
                >
                  +
                </button>
              </div>
            </Field>
            {form.additionalRequirements.length > 0 && (
              <div className="w-full overflow-x-auto whitespace-nowrap">
                <div className="inline-flex gap-2 py-1">
                  {form.additionalRequirements.map((item, idx) => (
                    <span
                      key={`${item}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-white/30 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/40 transition"
                    >
                      {item}
                      <button
                        type="button"
                        aria-label="Remove requirement"
                        onClick={() => removeRequirement(idx)}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  // ---------- scoring ----------
  // Count filled fields across steps; required + optional increment score
  const fieldIsFilled = (key) => {
    const v = form[key];
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v || {}).length > 0; // select objects
    return String(v).trim() !== "" && v !== 0;
  };
  const totalScoreItems = steps.reduce((acc, s) => acc + s.fields.length, 0);
  const currentScore = steps.reduce((acc, s) => acc + s.fields.filter((f) => fieldIsFilled(f)).length, 0);
  const progress = Math.round((currentScore / totalScoreItems) * 100);
  const progressHue = 0 + (120 * progress) / 100; // 0=red to 120=green

  // ---------- step navigation ----------
  const canGoNext = () => {
    // soft gate: allow proceed but nudge if nothing filled in this step
    const current = steps[activeStep];
    const anyFilled = current.fields.some((f) => fieldIsFilled(f));
    if (!anyFilled) toast.info("Fill at least one field to continue");
    return anyFilled;
  };
  const next = () => {
    if (activeStep < steps.length - 1 && canGoNext()) setActiveStep((s) => s + 1);
  };
  const back = () => setActiveStep((s) => Math.max(0, s - 1));

  // Prevent Enter submitting before final step
  const handleFormKeyDown = (e) => {
    if (e.key === "Enter" && activeStep < steps.length - 1) {
      e.preventDefault();
      const current = steps[activeStep];
      if (current.fields.some((f) => fieldIsFilled(f))) setActiveStep((s) => s + 1);
    }
  };

  // ---------- animations ----------
  const variants = {
    initial: { opacity: 0, y: 30, scale: 0.98, rotateX: -8, filter: "blur(6px)" },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
    out: { opacity: 0, y: -18, scale: 0.985, rotateX: 6, filter: "blur(6px)", transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative">
      {/* Glow background */}
      <div className="absolute -inset-6 -z-10 bg-gradient-to-b from-[#F6F4FF] to-white rounded-3xl" />

      {/* Header with score */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Create Client</h2>
          <p className="text-sm text-gray-500">Complete each step to finish creating the client.</p>
        </div>
        <div className="min-w-[240px]">
          <div className="flex items-center justify-between text-xs mb-1 text-gray-600">
            <span>Score</span>
            <span className="font-semibold">{currentScore}/{totalScoreItems}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%`, backgroundColor: `hsl(${progressHue}, 85%, 45%)` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <div className="text-right text-[11px] text-gray-500 mt-1">{progress}%</div>
        </div>
      </div>

      {/* Stepper pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {steps.map((s, idx) => {
          const done = idx < activeStep;
          const current = idx === activeStep;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                current
                  ? "bg-[#8570EE] text-white border-[#8570EE] shadow"
                  : done
                  ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {idx + 1}. {s.title}
            </button>
          );
        })}
      </div>

      {/* Form container */}
      <form className="space-y-6" onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} autoComplete="off">
        <div className="relative min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={steps[activeStep].key}
              variants={variants}
              initial="initial"
              animate="in"
              exit="out"
              className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm"
            >
              <div className="mb-2">
                <div className="text-base font-semibold text-gray-800">{steps[activeStep].title}</div>
                <div className="text-sm text-gray-500">{steps[activeStep].desc}</div>
              </div>
              {steps[activeStep].node}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              ×
            </button>
            {activeStep > 0 && (
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
              >
                ← Back
              </button>
            )}
          </div>

          {activeStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Finish & Create"}
            </button>
          )}
        </div>
      </form>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 160, damping: 12 } }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl border border-white/60 text-center max-w-sm mx-auto"
              style={{ background: "linear-gradient(180deg, rgba(133,112,238,0.08), white)" }}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" className="mx-auto mb-2"><motion.path d="M20 7L9 18l-5-5" fill="none" stroke="#8570EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeInOut" }} /></svg>
              <h3 className="text-xl font-bold text-gray-800">Client Created</h3>
              <p className="text-gray-600 mt-1">The client has been created successfully.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
