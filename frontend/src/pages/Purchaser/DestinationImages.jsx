// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Select from "react-select";
// import { motion, AnimatePresence } from "framer-motion";
// import { Sparkles, Image as ImageIcon, MapPin, Search, X, Save } from "lucide-react";
// import API from "../../api";
// import { toast } from "react-toastify";
// import uploadImageToCloudinary from "../../utils/uploadCloudinary";

// const DestinationImages = () => {
//   const THEME = "#8570EE";

//   const [destinations, setDestinations] = useState([]);
//   const [destSearch, setDestSearch] = useState("");
//   const [selectedDestination, setSelectedDestination] = useState(null);

//   const [loadingDestinations, setLoadingDestinations] = useState(false);
//   const [loadingImages, setLoadingImages] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // ✅ 8 image URLs
//   const [imageUrl, setImageUrl] = useState("");
//   const [secondImageUrl, setSecondImageUrl] = useState("");
//   const [thirdImageUrl, setThirdImageUrl] = useState("");
//   const [fourthImageUrl, setFourthImageUrl] = useState("");
//   const [fifthImageUrl, setFifthImageUrl] = useState("");
//   const [sixthImageUrl, setSixthImageUrl] = useState("");
//   const [seventhImageUrl, setSeventhImageUrl] = useState("");
//   const [eightImageUrl, setEightImageUrl] = useState("");
//   const [textColor, setTextColor] = useState("#000000");
//   // keep file refs only to reset input value
//   const refs = {
//     1: useRef(null),
//     2: useRef(null),
//     3: useRef(null),
//     4: useRef(null),
//     5: useRef(null),
//     6: useRef(null),
//     7: useRef(null),
//     8: useRef(null),
//   };

//   const resetAll = () => {
//     setSelectedDestination(null);
//     setImageUrl("");
//     setSecondImageUrl("");
//     setThirdImageUrl("");
//     setFourthImageUrl("");
//     setFifthImageUrl("");
//     setSixthImageUrl("");
//     setSeventhImageUrl("");
//     setEightImageUrl("");
//     setTextColor("#000000");

//     Object.values(refs).forEach((r) => {
//       if (r.current) r.current.value = "";
//     });
//   };

//   // ✅ Premium react-select (same standard)
//   const selectStyles = useMemo(
//     () => ({
//       container: (b) => ({ ...b, width: "100%" }),
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 14,
//         borderColor: state.isFocused ? THEME : "#e5e7eb",
//         boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
//         minHeight: 44,
//         maxHeight: 44,
//         backgroundColor: "white",
//         ":hover": { borderColor: state.isFocused ? THEME : "#d1d5db" },
//         overflow: "hidden",
//       }),
//       valueContainer: (b) => ({
//         ...b,
//         padding: "0 12px",
//         overflow: "hidden",
//         whiteSpace: "nowrap",
//         minWidth: 0,
//       }),
//       singleValue: (b) => ({
//         ...b,
//         color: "#111827",
//         overflow: "hidden",
//         textOverflow: "ellipsis",
//         whiteSpace: "nowrap",
//         maxWidth: "100%",
//       }),
//       input: (b) => ({
//         ...b,
//         margin: 0,
//         padding: 0,
//         color: "#111827",
//         minWidth: 2,
//       }),
//       indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
//       indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
//       dropdownIndicator: (b) => ({
//         ...b,
//         color: "#6b7280",
//         ":hover": { color: "#4b5563" },
//       }),
//       menuPortal: (b) => ({ ...b, zIndex: 99999 }),
//       menu: (b) => ({ ...b, borderRadius: 14, overflow: "hidden", zIndex: 99999 }),
//       menuList: (b) => ({ ...b, maxHeight: 260, overflowY: "auto" }),
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
//     }),
//     [THEME]
//   );

//   const fetchDestinationsForSelect = async () => {
//     try {
//       setLoadingDestinations(true);
//       const res = await API.get(
//         `/purchaser/destinationsForSelect?search=${encodeURIComponent(destSearch)}`
//       );
//       setDestinations(res.data || []);
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
//     } finally {
//       setLoadingDestinations(false);
//     }
//   };

//   const fetchDestinationImages = async (destinationId) => {
//     try {
//       setLoadingImages(true);
//       const res = await API.get(`/purchaser/destinationImages/${destinationId}`);
//       const d = res.data?.data;

//       setImageUrl(d?.imageUrl || "");
//       setSecondImageUrl(d?.secondImageUrl || "");
//       setThirdImageUrl(d?.thirdImageUrl || "");
//       setFourthImageUrl(d?.fourthImageUrl || "");
//       setFifthImageUrl(d?.fifthImageUrl || "");
//       setSixthImageUrl(d?.sixthImageUrl || "");
//       setSeventhImageUrl(d?.seventhImageUrl || "");
//       setEightImageUrl(d?.eightImageUrl || "");
//       setTextColor(d?.textColor || "#000000");

//       Object.values(refs).forEach((r) => {
//         if (r.current) r.current.value = "";
//       });
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to load destination images");
//     } finally {
//       setLoadingImages(false);
//     }
//   };

//   useEffect(() => {
//     fetchDestinationsForSelect();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [destSearch]);

//   const destinationOptions = destinations.map((d) => {
//     const labelBase = `${d.name}${d.destinationCode ? ` (${d.destinationCode})` : ""}`;
//     const labelLoc = d.country?.name && d.state?.name ? ` • ${d.country.name}, ${d.state.name}` : "";
//     const label = d.activeStatus === false ? `${labelBase}${labelLoc} (inactive)` : `${labelBase}${labelLoc}`;
//     return { value: d._id, label };
//   });

//   // ✅ same upload pattern you use in CreateTrip
//   const uploadAndSetUrl = async (file, setUrl) => {
//     if (!file) return;
//     try {
//       const result = await uploadImageToCloudinary(file);
//       setUrl(result.secure_url);
//       toast.success("Image uploaded");
//     } catch (err) {
//       console.error("Upload failed", err);
//       toast.error("Upload failed");
//     }
//   };

//   const saveImages = async () => {
//     if (!selectedDestination?.value) {
//       toast.error("Please select a destination");
//       return;
//     }
//     const hexOk = /^#([0-9a-fA-F]{6})$/.test((textColor || "").trim());
//     if (!hexOk) {
//       toast.error("Text color must be a valid hex");
//       return;
//     }

//     try {
//       setSaving(true);
//       const payload = {
//         imageUrl,
//         secondImageUrl,
//         thirdImageUrl,
//         fourthImageUrl,
//         fifthImageUrl,
//         sixthImageUrl,
//         seventhImageUrl,
//         eightImageUrl,
//          textColor,
//       };

//       const res = await API.put(`/purchaser/destinationImages/${selectedDestination.value}`, payload);
//       if (res.data?.success) {
//         toast.success("Destination images updated");
//       } else {
//         toast.error("Update failed");
//       }
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to update images");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ✅ same style as CreateTrip image slot, reused for 8 slots
//   const ImageSlot = ({ title, url, inputId, inputRef, onPick, onClear }) => (
//     <div className="flex flex-col items-center gap-2">
//       <label
//         htmlFor={inputId}
//         className="
//           relative group
//           h-24 w-32 sm:h-28 sm:w-36 rounded-2xl
//           border border-dashed border-slate-300
//           bg-white/90 hover:bg-white
//           shadow-sm hover:shadow-md transition
//           flex items-center justify-center
//           cursor-pointer overflow-hidden
//         "
//         title={url ? `Change ${title}` : `Upload ${title}`}
//       >
//         {url ? (
//           <img src={url} alt={title} className="block w-full h-full object-cover object-center rounded-2xl" />
//         ) : (
//           <div className="flex flex-col items-center gap-1 text-slate-500">
//             <ImageIcon className="w-5 h-5" />
//             <span className="text-xs font-semibold">Upload</span>
//           </div>
//         )}
//       </label>

//       <input id={inputId} type="file" accept="image/*" ref={inputRef} className="hidden" onChange={onPick} />

//       <button
//         type="button"
//         onClick={onClear}
//         className="
//           h-9 w-full rounded-2xl
//           border border-red-200
//           bg-red-50 text-red-700
//           hover:bg-red-100 transition
//           text-sm font-semibold
//         "
//       >
//         X
//       </button>
//     </div>
//   );

//   const images = [
//     { key: "imageUrl", title: "Image 1", url: imageUrl, setUrl: setImageUrl, ref: refs[1], id: "dest-img-1" },
//     { key: "secondImageUrl", title: "Image 2", url: secondImageUrl, setUrl: setSecondImageUrl, ref: refs[2], id: "dest-img-2" },
//     { key: "thirdImageUrl", title: "Image 3", url: thirdImageUrl, setUrl: setThirdImageUrl, ref: refs[3], id: "dest-img-3" },
//     { key: "fourthImageUrl", title: "Image 4", url: fourthImageUrl, setUrl: setFourthImageUrl, ref: refs[4], id: "dest-img-4" },
//     { key: "fifthImageUrl", title: "Image 5", url: fifthImageUrl, setUrl: setFifthImageUrl, ref: refs[5], id: "dest-img-5" },
//     { key: "sixthImageUrl", title: "Image 6", url: sixthImageUrl, setUrl: setSixthImageUrl, ref: refs[6], id: "dest-img-6" },
//     { key: "seventhImageUrl", title: "Image 7", url: seventhImageUrl, setUrl: setSeventhImageUrl, ref: refs[7], id: "dest-img-7" },
//     { key: "eightImageUrl", title: "Image 8", url: eightImageUrl, setUrl: setEightImageUrl, ref: refs[8], id: "dest-img-8" },
//   ];

//   return (
//     <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
//       <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
//         <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }} />

//         <div className="p-6 md:p-8 space-y-7">
//           {/* Header */}
//           <div className="flex items-start justify-between gap-3 flex-wrap">
//             <div className="min-w-0">
//               <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
//                 <Sparkles size={14} style={{ color: THEME }} />
//                 Purchaser
//               </div>
//               <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
//                 Destination Images
//               </div>
//               <div className="mt-1 text-sm text-slate-500">
//                 Select a destination and manage up to 8 images (upload / remove / update).
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {selectedDestination && (
//                 <button
//                   type="button"
//                   onClick={resetAll}
//                   title="Reset"
//                   className="
//                     inline-flex items-center justify-center
//                     w-10 h-10 rounded-2xl
//                     bg-white/70 backdrop-blur-md
//                     border border-slate-200
//                     shadow hover:bg-white transition
//                     text-slate-700
//                   "
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               )}

//               <div
//                 className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
//                 style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
//               >
//                 <MapPin size={20} />
//               </div>
//             </div>
//           </div>
          

//           {/* FULL WIDTH: Select + Upload */}
//           <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
          
//             <div className="px-5 py-4 border-b border-slate-100 bg-white/80">
//               <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Manage</div>
//               <div className="mt-1 text-lg font-extrabold text-slate-900">Upload destination images</div>
              
//             </div>

//             <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/40">
//               {/* Search + Destination Select */}
//               <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
//                 <div className="lg:col-span-2">
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                     Search destination
//                   </div>
//                   <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition">
//                     <Search className="h-4 w-4 text-slate-500" />
//                     <input
//                       type="text"
//                       value={destSearch}
//                       onChange={(e) => setDestSearch(e.target.value)}
//                       placeholder="Search..."
//                       className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
//                     />
//                   </div>
//                 </div>
                

//                 <div className="lg:col-span-3">
//                   <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//                     Destination
//                   </div>
//                   <Select
//                     options={destinationOptions}
//                     value={selectedDestination}
//                     onChange={async (opt) => {
//                       setSelectedDestination(opt || null);
//                       if (opt?.value) await fetchDestinationImages(opt.value);
//                       else resetAll();
//                     }}
//                     placeholder={loadingDestinations ? "Loading..." : "Select Destination"}
//                     styles={selectStyles}
//                     menuPortalTarget={document.body}
//                     classNamePrefix="dest-images"
//                     isClearable
//                     isLoading={loadingDestinations}
//                   />
//                 </div>
//               </div>
              

//               {/* Loading veil for images */}
//               <div className="relative rounded-2xl border border-slate-200 bg-white/80 p-4 overflow-hidden">
//                 <AnimatePresence>
//                   {loadingImages && (
//                     <motion.div
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px]"
//                     />
//                   )}
//                 </AnimatePresence>

//                 <div className="flex items-center gap-3 mb-4">
//                   <div
//                     className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner"
//                     style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
//                   >
//                     <ImageIcon size={18} />
//                   </div>
//                   <div>
//                     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
//                       Images (8 slots)
//                     </div>
//                     <div className="text-sm font-semibold text-slate-800">
//                       Upload / replace / clear, then click “Save Images”.
//                     </div>
//                   </div>
//                 </div>

//                 {/* ✅ 4 per row on lg */}
//                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//                   {images.map((slot) => (
//                     <ImageSlot
//                       key={slot.key}
//                       title={slot.title}
//                       url={slot.url}
//                       inputId={slot.id}
//                       inputRef={slot.ref}
//                       onPick={async (e) => {
//                         const file = e.target.files?.[0];
//                         if (!file) return;
//                         await uploadAndSetUrl(file, slot.setUrl);
//                       }}
//                       onClear={() => {
//                         slot.setUrl("");
//                         if (slot.ref.current) slot.ref.current.value = "";
//                       }}
//                     />
//                   ))}
//                 </div>
                

//                 {/* <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-end">
                
//                   <button
//                     type="button"
//                     onClick={resetAll}
//                     className="
//                       px-4 py-2 rounded-xl
//                       border border-slate-200
//                       bg-white hover:bg-slate-50
//                       text-slate-700 font-semibold
//                     "
//                   >
//                     Reset
//                   </button>

//                   <button
//                     type="button"
//                     onClick={saveImages}
//                     disabled={!selectedDestination?.value || saving}
//                     className={`
//                       inline-flex items-center justify-center gap-2
//                       px-4 py-2 rounded-xl
//                       text-white font-extrabold
//                       shadow-[0_16px_40px_rgba(133,112,238,0.35)]
//                       hover:opacity-95 transition
//                       ${!selectedDestination?.value || saving ? "opacity-60 cursor-not-allowed" : ""}
//                     `}
//                     style={{ background: THEME }}
//                   >
//                     <Save className="w-4 h-4" />
//                     {saving ? "Saving..." : "Save Images"}
//                   </button>
//                 </div> */}
//                 {/* Bottom row: Text Color (left) + buttons (right) */}
// <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
//   {/* ✅ Text Color (Hex) - LEFT */}
//   <div className="w-full lg:max-w-[520px]">
//     <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
//       Text color (Hex)
//     </div>

//     <div className="flex items-center gap-3">
//       {/* preview box */}
//       <div
//         className="h-11 w-11 rounded-2xl border border-slate-300 shadow-inner"
//         style={{ background: textColor || "#000000" }}
//         title={textColor || "#000000"}
//       />

//       {/* hex input */}
//       <input
//         type="text"
//         value={textColor}
//         onChange={(e) => setTextColor(e.target.value)}
//         placeholder="#000000"
//         disabled={!selectedDestination?.value}
//         className={`
//           w-full
//           rounded-2xl
//           border border-slate-300
//           bg-white/90
//           px-4 py-3
//           text-sm
//           outline-none
//           focus:ring-2 focus:ring-[#8570EE]
//           ${!selectedDestination?.value ? "opacity-60 cursor-not-allowed" : ""}
//         `}
//       />
//     </div>

//     {!!selectedDestination?.value && (
//       <div className="mt-1 text-xs text-slate-400">
//         Example: <span className="font-semibold">#8570EE</span>
//       </div>
//     )}
//   </div>

//   {/* Buttons - RIGHT */}
//   <div className="flex flex-col sm:flex-row gap-2 justify-end">
//     <button
//       type="button"
//       onClick={resetAll}
//       className="
//         px-4 py-2 rounded-xl
//         border border-slate-200
//         bg-white hover:bg-slate-50
//         text-slate-700 font-semibold
//       "
//     >
//       Reset
//     </button>

//     <button
//       type="button"
//       onClick={saveImages}
//       disabled={!selectedDestination?.value || saving}
//       className={`
//         inline-flex items-center justify-center gap-2
//         px-4 py-2 rounded-xl
//         text-white font-extrabold
//         shadow-[0_16px_40px_rgba(133,112,238,0.35)]
//         hover:opacity-95 transition
//         ${!selectedDestination?.value || saving ? "opacity-60 cursor-not-allowed" : ""}
//       `}
//       style={{ background: THEME }}
//     >
//       <Save className="w-4 h-4" />
//       {saving ? "Saving..." : "Save Images"}
//     </button>
//   </div>
// </div>

//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default DestinationImages;


import React, { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Image as ImageIcon, MapPin, Search, X, Save } from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const DestinationImages = () => {
  const THEME = "#8570EE";

  const [destinations, setDestinations] = useState([]);
  const [destSearch, setDestSearch] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ 8 image URLs
  const [imageUrl, setImageUrl] = useState("");
  const [secondImageUrl, setSecondImageUrl] = useState("");
  const [thirdImageUrl, setThirdImageUrl] = useState("");
  const [fourthImageUrl, setFourthImageUrl] = useState("");
  const [fifthImageUrl, setFifthImageUrl] = useState("");
  const [sixthImageUrl, setSixthImageUrl] = useState("");
  const [seventhImageUrl, setSeventhImageUrl] = useState("");
  const [eightImageUrl, setEightImageUrl] = useState("");

  // ✅ Text color
  const [textColor, setTextColor] = useState("#000000");

  // keep file refs only to reset input value
  const refs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null),
    5: useRef(null),
    6: useRef(null),
    7: useRef(null),
    8: useRef(null),
  };

  // ✅ NEW: color picker ref (so we can open picker from our styled preview box)
  const colorPickerRef = useRef(null);

  const resetAll = () => {
    setSelectedDestination(null);
    setImageUrl("");
    setSecondImageUrl("");
    setThirdImageUrl("");
    setFourthImageUrl("");
    setFifthImageUrl("");
    setSixthImageUrl("");
    setSeventhImageUrl("");
    setEightImageUrl("");
    setTextColor("#000000");

    Object.values(refs).forEach((r) => {
      if (r.current) r.current.value = "";
    });
  };

  // ✅ Premium react-select (same standard)
  const selectStyles = useMemo(
    () => ({
      container: (b) => ({ ...b, width: "100%" }),
      control: (base, state) => ({
        ...base,
        borderRadius: 14,
        borderColor: state.isFocused ? THEME : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        maxHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? THEME : "#d1d5db" },
        overflow: "hidden",
      }),
      valueContainer: (b) => ({
        ...b,
        padding: "0 12px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        minWidth: 0,
      }),
      singleValue: (b) => ({
        ...b,
        color: "#111827",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }),
      input: (b) => ({
        ...b,
        margin: 0,
        padding: 0,
        color: "#111827",
        minWidth: 2,
      }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
      dropdownIndicator: (b) => ({
        ...b,
        color: "#6b7280",
        ":hover": { color: "#4b5563" },
      }),
      menuPortal: (b) => ({ ...b, zIndex: 99999 }),
      menu: (b) => ({ ...b, borderRadius: 14, overflow: "hidden", zIndex: 99999 }),
      menuList: (b) => ({ ...b, maxHeight: 260, overflowY: "auto" }),
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
    }),
    [THEME]
  );

  const fetchDestinationsForSelect = async () => {
    try {
      setLoadingDestinations(true);
      const res = await API.get(
        `/purchaser/destinationsForSelect?search=${encodeURIComponent(destSearch)}`
      );
      setDestinations(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
    } finally {
      setLoadingDestinations(false);
    }
  };

  const fetchDestinationImages = async (destinationId) => {
    try {
      setLoadingImages(true);
      const res = await API.get(`/purchaser/destinationImages/${destinationId}`);
      const d = res.data?.data;

      setImageUrl(d?.imageUrl || "");
      setSecondImageUrl(d?.secondImageUrl || "");
      setThirdImageUrl(d?.thirdImageUrl || "");
      setFourthImageUrl(d?.fourthImageUrl || "");
      setFifthImageUrl(d?.fifthImageUrl || "");
      setSixthImageUrl(d?.sixthImageUrl || "");
      setSeventhImageUrl(d?.seventhImageUrl || "");
      setEightImageUrl(d?.eightImageUrl || "");
      setTextColor(d?.textColor || "#000000");

      Object.values(refs).forEach((r) => {
        if (r.current) r.current.value = "";
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load destination images");
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    fetchDestinationsForSelect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destSearch]);

  const destinationOptions = destinations.map((d) => {
    const labelBase = `${d.name}${d.destinationCode ? ` (${d.destinationCode})` : ""}`;
    const labelLoc =
      d.country?.name && d.state?.name ? ` • ${d.country.name}, ${d.state.name}` : "";
    const label =
      d.activeStatus === false ? `${labelBase}${labelLoc} (inactive)` : `${labelBase}${labelLoc}`;
    return { value: d._id, label };
  });

  // ✅ same upload pattern you use in CreateTrip
  const uploadAndSetUrl = async (file, setUrl) => {
    if (!file) return;
    try {
      const result = await uploadImageToCloudinary(file);
      setUrl(result.secure_url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed");
    }
  };

  const saveImages = async () => {
    if (!selectedDestination?.value) {
      toast.error("Please select a destination");
      return;
    }

    // ✅ keep your validation
    const hexOk = /^#([0-9a-fA-F]{6})$/.test((textColor || "").trim());
    if (!hexOk) {
      toast.error("Text color must be a valid hex");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        imageUrl,
        secondImageUrl,
        thirdImageUrl,
        fourthImageUrl,
        fifthImageUrl,
        sixthImageUrl,
        seventhImageUrl,
        eightImageUrl,
        textColor,
      };

      const res = await API.put(`/purchaser/destinationImages/${selectedDestination.value}`, payload);
      if (res.data?.success) {
        toast.success("Destination images updated");
      } else {
        toast.error("Update failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to update images");
    } finally {
      setSaving(false);
    }
  };

  // ✅ same style as CreateTrip image slot, reused for 8 slots
  const ImageSlot = ({ title, url, inputId, inputRef, onPick, onClear }) => (
    <div className="flex flex-col items-center gap-2">
      <label
        htmlFor={inputId}
        className="
          relative group
          h-24 w-32 sm:h-28 sm:w-36 rounded-2xl
          border border-dashed border-slate-300
          bg-white/90 hover:bg-white
          shadow-sm hover:shadow-md transition
          flex items-center justify-center
          cursor-pointer overflow-hidden
        "
        title={url ? `Change ${title}` : `Upload ${title}`}
      >
        {url ? (
          <img
            src={url}
            alt={title}
            className="block w-full h-full object-cover object-center rounded-2xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs font-semibold">Upload</span>
          </div>
        )}
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={onPick}
      />

      <button
        type="button"
        onClick={onClear}
        className="
          h-9 w-full rounded-2xl
          border border-red-200
          bg-red-50 text-red-700
          hover:bg-red-100 transition
          text-sm font-semibold
        "
      >
        X
      </button>
    </div>
  );

  const images = [
    { key: "imageUrl", title: "Image 1", url: imageUrl, setUrl: setImageUrl, ref: refs[1], id: "dest-img-1" },
    { key: "secondImageUrl", title: "Image 2", url: secondImageUrl, setUrl: setSecondImageUrl, ref: refs[2], id: "dest-img-2" },
    { key: "thirdImageUrl", title: "Image 3", url: thirdImageUrl, setUrl: setThirdImageUrl, ref: refs[3], id: "dest-img-3" },
    { key: "fourthImageUrl", title: "Image 4", url: fourthImageUrl, setUrl: setFourthImageUrl, ref: refs[4], id: "dest-img-4" },
    { key: "fifthImageUrl", title: "Image 5", url: fifthImageUrl, setUrl: setFifthImageUrl, ref: refs[5], id: "dest-img-5" },
    { key: "sixthImageUrl", title: "Image 6", url: sixthImageUrl, setUrl: setSixthImageUrl, ref: refs[6], id: "dest-img-6" },
    { key: "seventhImageUrl", title: "Image 7", url: seventhImageUrl, setUrl: setSeventhImageUrl, ref: refs[7], id: "dest-img-7" },
    { key: "eightImageUrl", title: "Image 8", url: eightImageUrl, setUrl: setEightImageUrl, ref: refs[8], id: "dest-img-8" },
  ];

  return (
    <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
      <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }} />

        <div className="p-6 md:p-8 space-y-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                <Sparkles size={14} style={{ color: THEME }} />
                Purchaser
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
                Destination Images
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Select a destination and manage up to 8 images (upload / remove / update).
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedDestination && (
                <button
                  type="button"
                  onClick={resetAll}
                  title="Reset"
                  className="
                    inline-flex items-center justify-center
                    w-10 h-10 rounded-2xl
                    bg-white/70 backdrop-blur-md
                    border border-slate-200
                    shadow hover:bg-white transition
                    text-slate-700
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
                style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
              >
                <MapPin size={20} />
              </div>
            </div>
          </div>

          {/* FULL WIDTH: Select + Upload */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Manage</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                Upload destination images
              </div>
            </div>

            <div className="p-5 space-y-5 bg-gradient-to-b from-white to-purple-50/40">
              {/* Search + Destination Select */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-2">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                    Search destination
                  </div>
                  <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={destSearch}
                      onChange={(e) => setDestSearch(e.target.value)}
                      placeholder="Search..."
                      className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                    />
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                    Destination
                  </div>
                  <Select
                    options={destinationOptions}
                    value={selectedDestination}
                    onChange={async (opt) => {
                      setSelectedDestination(opt || null);
                      if (opt?.value) await fetchDestinationImages(opt.value);
                      else resetAll();
                    }}
                    placeholder={loadingDestinations ? "Loading..." : "Select Destination"}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    classNamePrefix="dest-images"
                    isClearable
                    isLoading={loadingDestinations}
                  />
                </div>
              </div>

              {/* Loading veil for images */}
              <div className="relative rounded-2xl border border-slate-200 bg-white/80 p-4 overflow-hidden">
                <AnimatePresence>
                  {loadingImages && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px]"
                    />
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-10 w-10 rounded-2xl flex items-center justify-center border shadow-inner"
                    style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
                  >
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Images (8 slots)
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      Upload / replace / clear, then click “Save Images”.
                    </div>
                  </div>
                </div>

                {/* ✅ 4 per row on lg */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((slot) => (
                    <ImageSlot
                      key={slot.key}
                      title={slot.title}
                      url={slot.url}
                      inputId={slot.id}
                      inputRef={slot.ref}
                      onPick={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await uploadAndSetUrl(file, slot.setUrl);
                      }}
                      onClear={() => {
                        slot.setUrl("");
                        if (slot.ref.current) slot.ref.current.value = "";
                      }}
                    />
                  ))}
                </div>

                {/* Bottom row: Color Picker (left) + buttons (right) */}
                <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                  {/* ✅ Text Color (Color Picker) - LEFT */}
                  <div className="w-full lg:max-w-[520px]">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                      Text color
                    </div>

                    <div className="flex items-center gap-3">
                      {/* clickable preview box (keeps premium UI) */}
                      <button
                        type="button"
                        disabled={!selectedDestination?.value}
                        onClick={() => {
                          if (!selectedDestination?.value) return;
                          // open native color picker (best effort)
                          if (colorPickerRef.current?.showPicker) {
                            colorPickerRef.current.showPicker();
                          } else {
                            colorPickerRef.current?.click();
                          }
                        }}
                        className={`
                          h-11 w-11 rounded-2xl border border-slate-300 shadow-inner
                          ${!selectedDestination?.value ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                        `}
                        style={{ background: textColor || "#000000" }}
                        title={textColor || "#000000"}
                      />

                      {/* hex display input (auto-filled, still validated on save) */}
                      <input
                        type="text"
                        value={(textColor || "").toUpperCase()}
                        readOnly
                        disabled={!selectedDestination?.value}
                        className={`
                          w-full
                          rounded-2xl
                          border border-slate-300
                          bg-white/90
                          px-4 py-3
                          text-sm
                          outline-none
                          focus:ring-2 focus:ring-[#8570EE]
                          ${!selectedDestination?.value ? "opacity-60 cursor-not-allowed" : ""}
                        `}
                      />

                      {/* native color input (hidden, drives the actual value) */}
                      <input
                        ref={colorPickerRef}
                        type="color"
                        value={textColor}
                        disabled={!selectedDestination?.value}
                        onChange={(e) => setTextColor((e.target.value || "#000000").toLowerCase())}
                        className="sr-only"
                        aria-label="Pick text color"
                      />
                    </div>

                    {!!selectedDestination?.value && (
                      <div className="mt-1 text-xs text-slate-400">
                        Pick a color and it will fill the hex automatically.
                      </div>
                    )}
                  </div>

                  {/* Buttons - RIGHT */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      type="button"
                      onClick={resetAll}
                      className="
                        px-4 py-2 rounded-xl
                        border border-slate-200
                        bg-white hover:bg-slate-50
                        text-slate-700 font-semibold
                      "
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={saveImages}
                      disabled={!selectedDestination?.value || saving}
                      className={`
                        inline-flex items-center justify-center gap-2
                        px-4 py-2 rounded-xl
                        text-white font-extrabold
                        shadow-[0_16px_40px_rgba(133,112,238,0.35)]
                        hover:opacity-95 transition
                        ${!selectedDestination?.value || saving ? "opacity-60 cursor-not-allowed" : ""}
                      `}
                      style={{ background: THEME }}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Images"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationImages;
