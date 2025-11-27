// // ClientDetailsPanel.jsx
// import React, { useState } from "react";
// import {
//   Plane,
//   Users,
//   CalendarClock,
//   CircleDot,
//   FileText,
//   MapPin,
//   User,
//   Phone,
//   PhoneCall,
//   Mail,
//   Edit3,
// } from "lucide-react";

// export default function ClientDetailsPanel({ client, brandColor }) {
//   if (!client) return null;

//   const [editingDest, setEditingDest] = useState(false);
//   const [primaryDest, setPrimaryDest] = useState(
//     client.primaryDestinationName?.label || ""
//   );
//   const [addonDest, setAddonDest] = useState(
//     client.addonDestinations?.length
//       ? client.addonDestinations.map((d) => d.label || d.value).join(", ")
//       : ""
//   );

//   const [editingGroup, setEditingGroup] = useState(false);
//   const [groupTypeLabel, setGroupTypeLabel] = useState(
//     client.groupType?.label || ""
//   );
//   const [persons, setPersons] = useState(
//     client.numberOfPersons ? String(client.numberOfPersons) : ""
//   );

//   const [editingDates, setEditingDates] = useState(false);
//   const initialStartIso = client.startDate
//     ? new Date(client.startDate).toISOString().slice(0, 10)
//     : "";
//   const initialEndIso = client.endDate
//     ? new Date(client.endDate).toISOString().slice(0, 10)
//     : "";
//   const [startDateInput, setStartDateInput] = useState(initialStartIso);
//   const [endDateInput, setEndDateInput] = useState(initialEndIso);

//   const formatDisplayDate = (iso) => {
//     if (!iso) return "-";
//     const d = new Date(iso);
//     if (isNaN(d.getTime())) return iso;
//     return d.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const computeDays = () => {
//     if (startDateInput && endDateInput) {
//       const start = new Date(startDateInput);
//       const end = new Date(endDateInput);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
//         if (diff >= 0) return Math.round(diff) + 1;
//       }
//     }
//     if (client.numberOfDays) return client.numberOfDays;
//     return "-";
//   };

//   const numberOfDays = computeDays();

//   return (
//     <div className="h-full flex flex-col">
//       {/* Header stripe */}
//       <div
//         className="h-2 w-full"
//         style={{
//           background: `linear-gradient(90deg, #e5e7eb, ${brandColor})`,
//         }}
//       />

//       {/* Main header */}
//       <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <div
//             className="h-11 w-11 rounded-2xl flex items-center justify-center text-white text-lg font-semibold shadow"
//             style={{ background: brandColor }}
//           >
//             {client.name?.[0] || "C"}
//           </div>
//           <div>
//             <div className="flex items-center gap-2 flex-wrap">
//               <h2 className="text-lg font-bold text-slate-900">
//                 {client.name}
//               </h2>
//               {client.clientType?.label && (
//                 <span
//                   className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
//                     client.clientType.value === "urgent"
//                       ? "bg-red-50 text-red-600 border-red-200"
//                       : "bg-emerald-50 text-emerald-600 border-emerald-200"
//                   }`}
//                 >
//                   {client.clientType.label}
//                 </span>
//               )}
//             </div>
//             <div className="text-xs text-slate-500">
//               Client ID:{" "}
//               <span className="font-mono">{client.clientId}</span>
//             </div>
//           </div>
//         </div>

//         {client.tourType?.label && (
//           <div className="text-xs text-right">
//             <div className="uppercase tracking-[0.14em] text-slate-400">
//               Tour Type
//             </div>
//             <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#8570EE]/10 text-[#8570EE] px-2 py-1 text-[11px] font-semibold border border-[#8570EE]/30">
//               <Plane size={12} />
//               {client.tourType.label}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Body – scrollable left panel */}
//       <div className="p-4 sm:p-5 space-y-4 overflow-y-auto scroll-smooth max-h-[420px]">
//         {/* Contact & location */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <InfoCard
//             title="Contact"
//             icon={User}
//             items={[
//               { label: "Mobile", value: client.mobileNumber },
//               {
//                 label: "WhatsApp",
//                 value: client.whatsappNumber,
//               },
//               { label: "Email", value: client.email },
//             ]}
//           />
//           <InfoCard
//             title="Location & Type"
//             icon={MapPin}
//             items={[
//               {
//                 label: "Current location",
//                 value: client.clientCurrentLocation?.label,
//               },
//               { label: "Pincode", value: client.pincode },
//               {
//                 label: "District / State",
//                 value: [client.district, client.state]
//                   .filter(Boolean)
//                   .join(", "),
//               },
//               {
//                 label: "Contact via",
//                 value: client.clientContactOption?.label,
//               },
//             ]}
//           />
//         </div>

//         {/* Destinations + group */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {/* Destinations editable */}
//           <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-2">
//                 <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
//                   <Plane size={14} />
//                 </div>
//                 <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
//                   Destinations
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setEditingDest((v) => !v)}
//                 className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
//               >
//                 <Edit3 size={12} />
//                 {editingDest ? "Done" : "Edit"}
//               </button>
//             </div>
//             {!editingDest ? (
//               <div className="space-y-1.5 text-xs text-slate-600">
//                 <div className="flex items-center justify-between gap-2">
//                   <span className="text-[11px] text-slate-500">Primary</span>
//                   <span className="text-[12px] font-medium text-slate-800">
//                     {primaryDest || "-"}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between gap-2">
//                   <span className="text-[11px] text-slate-500">Add-on</span>
//                   <span className="text-[12px] font-medium text-slate-800 text-right">
//                     {addonDest || "-"}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-2 text-xs">
//                 <div>
//                   <div className="text-[11px] text-slate-500 mb-1">
//                     Primary destination
//                   </div>
//                   <input
//                     value={primaryDest}
//                     onChange={(e) => setPrimaryDest(e.target.value)}
//                     className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
//                   />
//                 </div>
//                 <div>
//                   <div className="text-[11px] text-slate-500 mb-1">
//                     Add-on destinations (comma separated)
//                   </div>
//                   <textarea
//                     value={addonDest}
//                     onChange={(e) => setAddonDest(e.target.value)}
//                     className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE] min-h-[50px]"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Group editable */}
//           <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-2">
//                 <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
//                   <Users size={14} />
//                 </div>
//                 <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
//                   Group Details
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setEditingGroup((v) => !v)}
//                 className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
//               >
//                 <Edit3 size={12} />
//                 {editingGroup ? "Done" : "Edit"}
//               </button>
//             </div>
//             {!editingGroup ? (
//               <div className="space-y-1.5 text-xs text-slate-600">
//                 <div className="flex items-center justify-between gap-2">
//                   <span className="text-[11px] text-slate-500">
//                     Group type
//                   </span>
//                   <span className="text-[12px] font-medium text-slate-800">
//                     {groupTypeLabel || "-"}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between gap-2">
//                   <span className="text-[11px] text-slate-500">
//                     No. of persons
//                   </span>
//                   <span className="text-[12px] font-medium text-slate-800">
//                     {persons || "-"}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-2 text-xs">
//                 <div>
//                   <div className="text-[11px] text-slate-500 mb-1">
//                     Group type
//                   </div>
//                   <input
//                     value={groupTypeLabel}
//                     onChange={(e) => setGroupTypeLabel(e.target.value)}
//                     className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
//                   />
//                 </div>
//                 <div>
//                   <div className="text-[11px] text-slate-500 mb-1">
//                     No. of persons
//                   </div>
//                   <input
//                     type="number"
//                     min={1}
//                     value={persons}
//                     onChange={(e) => setPersons(e.target.value)}
//                     className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Travel dates */}
//         <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-2">
//               <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
//                 <CalendarClock size={14} />
//               </div>
//               <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
//                 Travel Dates
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={() => setEditingDates((v) => !v)}
//               className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
//             >
//               <Edit3 size={12} />
//               {editingDates ? "Done" : "Edit"}
//             </button>
//           </div>

//           {!editingDates ? (
//             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
//               <div>
//                 <span className="text-[11px] text-slate-500">Start</span>
//                 <div className="text-[12px] font-medium text-slate-800">
//                   {formatDisplayDate(startDateInput)}
//                 </div>
//               </div>
//               <div>
//                 <span className="text-[11px] text-slate-500">End</span>
//                 <div className="text-[12px] font-medium text-slate-800">
//                   {formatDisplayDate(endDateInput)}
//                 </div>
//               </div>
//               <div>
//                 <span className="text-[11px] text-slate-500">
//                   Number of days
//                 </span>
//                 <div className="text-[12px] font-medium text-slate-800">
//                   {numberOfDays !== "-" ? `${numberOfDays} days` : "-"}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-3 text-xs">
//               <div>
//                 <div className="text-[11px] text-slate-500 mb-1">Start</div>
//                 <input
//                   type="date"
//                   value={startDateInput}
//                   onChange={(e) => setStartDateInput(e.target.value)}
//                   className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
//                 />
//               </div>
//               <div>
//                 <div className="text-[11px] text-slate-500 mb-1">End</div>
//                 <input
//                   type="date"
//                   value={endDateInput}
//                   onChange={(e) => setEndDateInput(e.target.value)}
//                   className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
//                 />
//               </div>
//               <div className="col-span-2">
//                 <div className="text-[11px] text-slate-500 mb-0.5">
//                   Number of days
//                 </div>
//                 <div className="text-[12px] font-medium text-slate-800">
//                   {numberOfDays !== "-" ? `${numberOfDays} days` : "-"}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Behaviour & source */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <InfoCard
//             title="Client Insight"
//             icon={CircleDot}
//             items={[
//               { label: "Behavior", value: client.behavior?.label },
//               {
//                 label: "Connected through",
//                 value: client.connectedThrough?.label,
//               },
//             ]}
//           />
//           <InfoCard
//             title="Other"
//             icon={FileText}
//             items={[{ label: "GST Number", value: client.gstNumber || "-" }]}
//           />
//         </div>

//         {/* Additional requirements */}
//         <div>
//           <div className="text-xs font-semibold text-slate-500 uppercase tracking-[0.14em] mb-1">
//             Additional requirements
//           </div>
//           {client.additionalRequirements?.length ? (
//             <div className="flex flex-wrap gap-1.5">
//               {client.additionalRequirements.map((req, idx) => (
//                 <span
//                   key={idx}
//                   className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
//                 >
//                   {req}
//                 </span>
//               ))}
//             </div>
//           ) : (
//             <div className="text-xs text-slate-400">No extra notes</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function InfoCard({ title, icon: Icon, items, inline = false }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
//       <div className="flex items-center gap-2 mb-2">
//         <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
//           <Icon size={14} />
//         </div>
//         <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
//           {title}
//         </div>
//       </div>
//       <div
//         className={
//           inline
//             ? "grid grid-cols-2 gap-x-4 gap-y-1"
//             : "space-y-1.5 text-xs text-slate-600"
//         }
//       >
//         {items.map((it, idx) => {
//           if (!it?.label) return null;
//           const value =
//             it.value === undefined || it.value === null || it.value === ""
//               ? "-"
//               : it.value;
//           return (
//             <div
//               key={idx}
//               className={
//                 inline ? "text-xs" : "flex items-center justify-between gap-2"
//               }
//             >
//               <span className="text-[11px] text-slate-500">{it.label}</span>
//               <span className="text-[12px] font-medium text-slate-800">
//                 {value}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
// src/components/Executive/ClientDetailsPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import API from "../../api";
import {
  Plane,
  Users,
  CalendarClock,
  CircleDot,
  FileText,
  MapPin,
  User,
} from "lucide-react";

const groupTypeOptions = [
  { value: "single", label: "Single" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
];

const contactOptions = [
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
];

const currentLocationOptions = [
  { value: "insider", label: "Insider" },
  { value: "outsider", label: "Outsider" },
];

export default function ClientDetailsPanel({
  client,
  brandColor,
  onSave,
  saving,
}) {
  if (!client) return null;

  /* ========== react-select styles (similar to CreateClient) ========== */
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: state.isFocused
          ? "0 0 0 2px rgba(133,112,238,0.2)"
          : "none",
        minHeight: 36,
        maxHeight: 36,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
      }),
      valueContainer: (b) => ({
        ...b,
        padding: "0 10px",
      }),
      input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 6 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
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
          ? "rgba(133,112,238,0.16)"
          : "white",
        color: "#222",
      }),
      placeholder: (b) => ({ ...b, color: "#6b7280" }),
      singleValue: (b) => ({ ...b, color: "#111827" }),
    }),
    []
  );

  /* ========== DESTINATIONS from backend ========== */
  const [destinations, setDestinations] = useState([]);
  const [loadingDest, setLoadingDest] = useState(false);

  const [primaryDestination, setPrimaryDestination] = useState(
    client.primaryDestinationName
      ? {
          _id: client.primaryDestinationName._id,
          value: client.primaryDestinationName.value,
          label:
            client.primaryDestinationName.label ||
            client.primaryDestinationName.value,
        }
      : null
  );

  const [addonDestinations, setAddonDestinations] = useState(
    (client.addonDestinations || []).map((d) => ({
      _id: d._id,
      value: d.value,
      label: d.label || d.value,
    }))
  );
  const [addonDestinationInput, setAddonDestinationInput] = useState(null);

  const loadDestinations = async () => {
    try {
      setLoadingDest(true);
      const res = await API.get("/executive/destinations");
      const opts = (res.data || []).map((d) => ({
        _id: d._id,
        value: d.value,
        label: d.label,
      }));
      setDestinations(opts);

      // align primary with loaded list
      if (primaryDestination?._id) {
        const match = opts.find((o) => o._id === primaryDestination._id);
        if (match) setPrimaryDestination(match);
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load destinations"
      );
    } finally {
      setLoadingDest(false);
    }
  };

  useEffect(() => {
    loadDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAddonDestination = () => {
    if (!addonDestinationInput) return;
    const exists = addonDestinations.some(
      (d) =>
        d._id === addonDestinationInput._id ||
        d.value === addonDestinationInput.value
    );
    if (exists) {
      toast.info("Destination already added");
      return;
    }
    setAddonDestinations((prev) => [...prev, addonDestinationInput]);
    setAddonDestinationInput(null);
  };

  const removeAddonDestination = (idx) => {
    setAddonDestinations((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ========== CONTACT info ========== */
  const [mobileNumber, setMobileNumber] = useState(client.mobileNumber || "");
  const [whatsappNumber, setWhatsappNumber] = useState(
    client.whatsappNumber || ""
  );
  const [email, setEmail] = useState(client.email || "");

  /* ========== LOCATION + TYPE ========== */
  const [pincode, setPincode] = useState(client.pincode || "");
  const [district, setDistrict] = useState(client.district || "");
  const [stateVal, setStateVal] = useState(client.state || "");

  const [clientContactOption, setClientContactOption] = useState(
    client.clientContactOption
      ? {
          value: client.clientContactOption.value,
          label: client.clientContactOption.label,
        }
      : contactOptions[0]
  );

  const [clientCurrentLocation, setClientCurrentLocation] = useState(
    client.clientCurrentLocation
      ? {
          value: client.clientCurrentLocation.value,
          label: client.clientCurrentLocation.label,
        }
      : null
  );

  const fetchPincodeDetails = async (pin) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pin}`
      );
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
    setPincode(value);
    setDistrict("");
    setStateVal("");
    if (value.length > 6) {
      toast.error("Pincode should be exactly 6 digits.");
      return;
    }
    if (value.length === 6) {
      const details = await fetchPincodeDetails(value);
      if (details && !details.error) {
        setDistrict(details.district || "");
        setStateVal(details.state || "");
      }
    }
  };

  /* ========== GROUP details ========== */
  const [groupType, setGroupType] = useState(
    client.groupType
      ? {
          value: client.groupType.value,
          label: client.groupType.label,
        }
      : null
  );
  const [persons, setPersons] = useState(
    client.numberOfPersons ? String(client.numberOfPersons) : ""
  );

  /* ========== DATES & DAYS ========== */
  const initialStartIso = client.startDate
    ? new Date(client.startDate).toISOString().slice(0, 10)
    : "";
  const initialEndIso = client.endDate
    ? new Date(client.endDate).toISOString().slice(0, 10)
    : "";

  const [startDateInput, setStartDateInput] = useState(initialStartIso);
  const [endDateInput, setEndDateInput] = useState(initialEndIso);

  const computeDays = () => {
    if (startDateInput && endDateInput) {
      const start = new Date(startDateInput);
      const end = new Date(endDateInput);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff =
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (diff >= 0) return Math.round(diff) + 1;
      }
    }
    if (client.numberOfDays) return client.numberOfDays;
    return "-";
  };

  const numberOfDays = computeDays();

  const formatDisplayDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ========== GST + additional requirements ========== */
  const [gstNumber, setGstNumber] = useState(client.gstNumber || "");
  const [additionalRequirements, setAdditionalRequirements] = useState(
    client.additionalRequirements || []
  );
  const [additionalRequirementsInput, setAdditionalRequirementsInput] =
    useState("");

  const addRequirement = () => {
    const text = (additionalRequirementsInput || "").trim();
    if (!text) return;
    setAdditionalRequirements((prev) => [...prev, text]);
    setAdditionalRequirementsInput("");
  };

  const removeRequirement = (idx) => {
    setAdditionalRequirements((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ========== SAVE handler (payload shaped like Client model/CreateClient) ========== */
  const handleSave = () => {
    if (!onSave) return;

    const payload = {
      // contact
      mobileNumber: mobileNumber.trim(),
      whatsappNumber: whatsappNumber.trim() || null,
      email: email.trim() || null,

      // location / type
      pincode,
      district,
      state: stateVal,
      clientContactOption: clientContactOption
        ? {
            value: clientContactOption.value,
            label: clientContactOption.label,
          }
        : null,
      clientCurrentLocation: clientCurrentLocation
        ? {
            value: clientCurrentLocation.value,
            label: clientCurrentLocation.label,
          }
        : null,

      // destinations
      primaryDestinationName: primaryDestination
        ? {
            _id: primaryDestination._id,
            value: primaryDestination.value,
            label: primaryDestination.label,
          }
        : null,
      addonDestinations: addonDestinations.map((d) => ({
        _id: d._id,
        value: d.value,
        label: d.label,
      })),

      // group
      groupType: groupType
        ? {
            value: groupType.value,
            label: groupType.label,
          }
        : null,
      numberOfPersons: persons ? Number(persons) : null,

      // dates
      startDate: startDateInput || null,
      endDate: endDateInput || null,
      numberOfDays:
        typeof numberOfDays === "number"
          ? numberOfDays
          : client.numberOfDays || null,

      // gst + additional requirements
      gstNumber: gstNumber.trim() || null,
      additionalRequirements,
    };

    onSave(payload);
  };

  /* ========== RENDER ========== */

  return (
    <div className="h-full flex flex-col">
      {/* Header stripe */}
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, #e5e7eb, ${brandColor})`,
        }}
      />

      {/* Main header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center text-white text-lg font-semibold shadow"
            style={{ background: brandColor }}
          >
            {client.name?.[0] || "C"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                {client.name}
              </h2>
              {client.clientType?.label && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    (client.clientType.value || "")
                      .toLowerCase()
                      .startsWith("urgent")
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200"
                  }`}
                >
                  {client.clientType.label}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Client ID:{" "}
              <span className="font-mono">{client.clientId}</span>
            </div>
          </div>
        </div>

        {client.tourType?.label && (
          <div className="text-xs text-right">
            <div className="uppercase tracking-[0.14em] text-slate-400">
              Tour Type
            </div>
            <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#8570EE]/10 text-[#8570EE] px-2 py-1 text-[11px] font-semibold border border-[#8570EE]/30">
              <Plane size={12} />
              {client.tourType.label}
            </div>
          </div>
        )}
      </div>

      {/* Body – scrollable left panel */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto scroll-smooth max-h-[420px]">
        {/* Contact & location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contact editable */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
                <User size={14} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Contact
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">Mobile</span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">WhatsApp</span>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
                />
              </div>
            </div>
          </div>

          {/* Location & Type editable */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
                <MapPin size={14} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Location & Type
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">Pincode</span>
                <input
                  type="tel"
                  value={pincode}
                  onChange={handlePincodeChange}
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">
                  District / State
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District"
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
                  />
                  <input
                    type="text"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    placeholder="State"
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">
                  Current location
                </span>
                <Select
                  options={currentLocationOptions}
                  value={clientCurrentLocation}
                  onChange={setClientCurrentLocation}
                  placeholder="Select"
                  styles={selectStyles}
                  classNamePrefix="details-current-location"
                  isClearable
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">
                  Contact via
                </span>
                <Select
                  options={contactOptions}
                  value={clientContactOption}
                  onChange={setClientContactOption}
                  placeholder="Select"
                  styles={selectStyles}
                  classNamePrefix="details-contact-option"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Destinations + group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Destinations editable */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
                  <Plane size={14} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Destinations
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {/* Primary destination */}
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  Primary destination
                </div>
                <Select
                  isLoading={loadingDest}
                  options={destinations}
                  value={primaryDestination}
                  onChange={setPrimaryDestination}
                  placeholder={
                    loadingDest
                      ? "Loading destinations..."
                      : "Select destination"
                  }
                  styles={selectStyles}
                  classNamePrefix="details-primary-destination"
                  getOptionValue={(o) => String(o._id || o.value)}
                  isClearable
                  maxMenuHeight={40}
                />
              </div>

              {/* Add-on destinations (chips) */}
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  Add-on destinations
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1">
                    <Select
                      isLoading={loadingDest}
                      options={destinations}
                      value={addonDestinationInput}
                      onChange={setAddonDestinationInput}
                      placeholder={
                        loadingDest
                          ? "Loading destinations..."
                          : "Pick a destination"
                      }
                      styles={selectStyles}
                      classNamePrefix="details-addon-destination-input"
                      getOptionValue={(o) => String(o._id || o.value)}
                      isClearable
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addAddonDestination}
                    className="rounded-full bg-[#8570EE] text-white px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                  >
                    +
                  </button>
                </div>

                {addonDestinations.length > 0 && (
                  <div className="w-full overflow-x-auto whitespace-nowrap">
                    <div className="inline-flex gap-2 py-1">
                      {addonDestinations.map((d, idx) => (
                        <span
                          key={`${d._id || d.value}-${idx}`}
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px]
                            bg-white/70 border border-slate-200 shadow-sm"
                        >
                          {d.label || d.value}
                          <button
                            type="button"
                            onClick={() => removeAddonDestination(idx)}
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full
                              bg-[#8570EE]/15 hover:bg-[#8570EE]/30 text-xs"
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
          </div>

          {/* Group editable */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
                <Users size={14} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Group Details
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">
                  Group type
                </span>
                <Select
                  options={groupTypeOptions}
                  value={groupType}
                  onChange={setGroupType}
                  placeholder="Select group type"
                  styles={selectStyles}
                  classNamePrefix="details-group-type"
                  isClearable
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">
                  No. of persons
                </span>
                <input
                  type="number"
                  min={1}
                  value={persons}
                  onChange={(e) => setPersons(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Travel dates */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
              <CalendarClock size={14} />
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Travel Dates
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[11px] text-slate-500 mb-1">Start</div>
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
              />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-1">End</div>
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
              />
            </div>
            <div className="col-span-2">
              <div className="text-[11px] text-slate-500 mb-0.5">
                Number of days
              </div>
              <div className="text-[12px] font-medium text-slate-800">
                {numberOfDays !== "-" ? `${numberOfDays} days` : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Behaviour & source – read-only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            title="Client Insight"
            icon={CircleDot}
            items={[
              { label: "Behavior", value: client.behavior?.label },
              {
                label: "Connected through",
                value: client.connectedThrough?.label,
              },
            ]}
          />
          {/* GST editable */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
                <FileText size={14} />
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-500">
                  GST Number
                </span>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[#8570EE]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional requirements */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-[0.14em] mb-1">
            Additional requirements
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              placeholder="Type a requirement"
              value={additionalRequirementsInput}
              onChange={(e) => setAdditionalRequirementsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRequirement();
                }
              }}
            />
            <button
              type="button"
              onClick={addRequirement}
              className="rounded-full bg-[#8570EE] text-white px-3 py-1.5 text-xs font-semibold hover:opacity-90"
            >
              +
            </button>
          </div>

          {additionalRequirements.length ? (
            <div className="flex flex-wrap gap-1.5">
              {additionalRequirements.map((req, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-white/70 border border-slate-200 text-[11px] text-slate-700 inline-flex items-center gap-2"
                >
                  {req}
                  <button
                    type="button"
                    onClick={() => removeRequirement(idx)}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#8570EE]/15 hover:bg-[#8570EE]/30 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400">No extra notes</div>
          )}
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              inline-flex items-center justify-center
              rounded-full px-5 py-2 text-sm font-semibold
              text-white shadow
              hover:opacity-90
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-60
            "
            style={{ background: brandColor }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, icon: Icon, items, inline = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-600">
          <Icon size={14} />
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </div>
      </div>
      <div
        className={
          inline
            ? "grid grid-cols-2 gap-x-4 gap-y-1"
            : "space-y-1.5 text-xs text-slate-600"
        }
      >
        {items.map((it, idx) => {
          if (!it?.label) return null;
          const value =
            it.value === undefined || it.value === null || it.value === ""
              ? "-"
              : it.value;
          return (
            <div
              key={idx}
              className={
                inline ? "text-xs" : "flex items-center justify-between gap-2"
              }
            >
              <span className="text-[11px] text-slate-500">{it.label}</span>
              <span className="text-[12px] font-medium text-slate-800">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
