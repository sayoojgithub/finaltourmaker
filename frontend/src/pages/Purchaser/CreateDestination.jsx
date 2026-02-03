// import React, { useEffect, useMemo, useState } from "react";
// import Select from "react-select";
// import { CheckCircle, XCircle } from "lucide-react";
// import API from "../../api";
// import { toast } from "react-toastify";

// const CreateDestination = () => {
//   const [selectedType, setSelectedType] = useState("Country");
//   const [selectedCountry, setSelectedCountry] = useState(null); // react-select option or null
//   const [selectedState, setSelectedState] = useState(null); // react-select option or null
//   const [inputValue, setInputValue] = useState("");
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedDestination, setSelectedDestination] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);

//   // --------- shared react-select styles (same as your CreateClient) ----------
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

//   // Helpers to map API data -> Select options
//   const toCountryOption = (c) => ({ _id: c._id, value: c._id, label: c.name });
//   const toStateOption = (s) => ({ _id: s._id, value: s._id, label: s.name });

//   // Fetch countries
//   const fetchCountries = async () => {
//     try {
//       const res = await API.get("/purchaser/countries");
//       setCountries(res.data || []);
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to load countries");
//     }
//   };

//   // Fetch states based on selected country
//   const fetchStates = async () => {
//     try {
//       if (selectedCountry?.value) {
//         const res = await API.get(`/purchaser/states/${selectedCountry.value}`);
//         setStates(res.data || []);
//       } else {
//         setStates([]);
//       }
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to load states");
//     }
//   };

//   // Fetch destinations with pagination and search
//   const fetchDestinations = async () => {
//     try {
//       const res = await API.get(
//         `/purchaser/destinations?page=${page}&search=${encodeURIComponent(search)}`
//       );
//       setDestinations(res.data?.data || []);
//       setTotalPages(res.data?.totalPages || 1);
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
//     }
//   };

//   useEffect(() => {
//     fetchCountries();
//   }, []);

//   useEffect(() => {
//     // Whenever country changes, refresh states
//     fetchStates();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCountry?.value]);

//   useEffect(() => {
//     fetchDestinations();
//   }, [page, search]);

//   // Handle create logic
//   const handleCreate = async () => {
//     const type = selectedType;

//     if (!inputValue.trim()) {
//       if (type === "Country") {
//         toast.error("Country name is mandatory");
//       } else if (type === "State") {
//         toast.error("Country and State name are mandatory");
//       } else if (type === "Destination") {
//         toast.error("Country, State and Destination name are mandatory");
//       }
//       return;
//     }

//     try {
//       if (type === "Country") {
//         await API.post("/purchaser/country", { name: inputValue });
//       } else if (type === "State") {
//         if (!selectedCountry?.value) {
//           toast.error("Please select a country");
//           return;
//         }
//         await API.post("/purchaser/state", {
//           name: inputValue,
//           country: selectedCountry.value, // ID
//         });
//       } else if (type === "Destination") {
//         if (!selectedCountry?.value || !selectedState?.value) {
//           toast.error("Please select both country and state");
//           return;
//         }
//         await API.post("/purchaser/destination", {
//           name: inputValue,
//           country: selectedCountry.value, // ID
//           state: selectedState.value, // ID
//         });
//         fetchDestinations();
//       }

//       // Reset inputs and refresh dropdown data
//       setInputValue("");
//       setSelectedCountry(null);
//       setSelectedState(null);
//       fetchCountries();
//       fetchStates();

//       toast.success(`${type} created successfully`);
//     } catch (err) {
//       const errorMessage =
//         err?.response?.data?.message || err.message || "Something went wrong";
//       toast.error(errorMessage);
//     }
//   };

//   const handleStatusClick = (destination) => {
//     setSelectedDestination(destination);
//     setShowPopup(true);
//   };

//   const handleToggleStatus = async () => {
//     if (!selectedDestination) return;

//     try {
//       const updatedStatus = !selectedDestination.activeStatus;
//       const res = await API.patch(
//         `/purchaser/updateDestinationStatus/${selectedDestination._id}/status`,
//         { activeStatus: updatedStatus }
//       );

//       if (res.data.success) {
//         toast.success(
//           `Destination ${updatedStatus ? "activated" : "deactivated"} successfully`
//         );
//         await fetchDestinations();
//       } else {
//         toast.error("Update failed");
//       }
//     } catch (err) {
//       toast.error("Server error");
//     } finally {
//       setShowPopup(false);
//       setSelectedDestination(null);
//     }
//   };

//   // Build option arrays each render (cheap map)
//   const countryOptions = countries.map(toCountryOption);
//   const stateOptions = states.map(toStateOption);

//   return (
//     <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-md p-6 md:p-8 mx-auto mb-6">
//       <div className="min-h-screen bg-white px-4 py-10 flex flex-col items-center gap-10">
//         <div className="w-full max-w-md mx-auto p-4 md:p-6">
//           {/* Type selector */}
//           <div className="flex justify-between bg-white border border-gray-300 rounded-xl p-3">
//             {["Country", "State", "Destination"].map((type) => (
//               <label
//                 key={type}
//                 className="flex items-center space-x-2 cursor-pointer text-sm md:text-base"
//               >
//                 <input
//                   type="radio"
//                   name="locationType"
//                   value={type}
//                   checked={selectedType === type}
//                   onChange={() => {
//                     setSelectedType(type);
//                     setSelectedCountry(null);
//                     setSelectedState(null);
//                     setInputValue("");
//                   }}
//                   className="accent-[#8570EE]"
//                 />
//                 <span className="text-[#8570EE] font-medium">{type}</span>
//               </label>
//             ))}
//           </div>

//           {/* Country select (React Select) */}
//           {selectedType !== "Country" && (
//             <div className="w-full mt-4">
//               <Select
//                 options={countryOptions}
//                 value={selectedCountry}
//                 onChange={(v) => {
//                   setSelectedCountry(v);
//                   setSelectedState(null);
//                 }}
//                 placeholder="Select Country"
//                 styles={selectStyles}
//                 classNamePrefix="create-country"
//                 getOptionValue={(o) => String(o._id || o.value)}
//                 isClearable
//                 // menuPortalTarget={document.body} // enable if you face clipping
//                 // styles={{ ...selectStyles, menuPortal: b => ({ ...b, zIndex: 9999 }) }}
//               />
//             </div>
//           )}

//           {/* State select (React Select) */}
//           {selectedType === "Destination" && (
//             <div className="w-full mt-4">
//               <Select
//                 options={stateOptions}
//                 value={selectedState}
//                 onChange={(v) => setSelectedState(v)}
//                 placeholder="Select State"
//                 styles={selectStyles}
//                 classNamePrefix="create-state"
//                 getOptionValue={(o) => String(o._id || o.value)}
//                 isClearable
//                 isDisabled={!selectedCountry?.value}
//               />
//             </div>
//           )}

//           {/* Input field */}
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             placeholder={`Enter ${selectedType}`}
//             className="w-full mt-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//           />

//           {/* Submit button */}
//           <button
//             onClick={handleCreate}
//             className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
//           >
//             Create
//           </button>
//         </div>

//         {/* Table + Search */}
//         <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
//           <h5 className="text-3xl font-Abril text-[#321F6A] mb-1">
//             View Destinations
//           </h5>
//           <p className="mb-4 text-sm text-gray-400">Paginated destination list</p>

//           {/* Search input (top-left) */}
//           <div className="flex justify-start mb-4">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPage(1);
//               }}
//               placeholder="Search destination..."
//               className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             />
//           </div>

//           {/* Table */}
//           <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
//             <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//               <tr>
//                 <th className="px-6 py-4">Sl No</th>
//                 <th className="px-6 py-4">Country</th>
//                 <th className="px-6 py-4">State</th>
//                 <th className="px-6 py-4">Destination</th>
//                 <th className="px-6 py-4">Destination code</th>
//                 <th className="px-6 py-4">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {destinations.map((d, idx) => (
//                 <tr key={d._id} className="border-b hover:bg-gray-50">
//                   <td className="px-6 py-4 font-semibold">
//                     {(page - 1) * 3 + idx + 1}
//                   </td>
//                   <td className="px-6 py-4 font-semibold">{d.country?.name}</td>
//                   <td className="px-6 py-4 font-semibold">{d.state?.name}</td>
//                   <td className="px-6 py-4 font-semibold">{d.name}</td>
//                   <td className="px-6 py-4 font-semibold">{d.destinationCode}</td>
//                   <td className="px-6 py-4  font-semibold">
//                     {d.activeStatus ? (
//                       <span
//                         className="inline-flex items-center gap-1 text-green-600 cursor-pointer"
//                         onClick={() => handleStatusClick(d)}
//                       >
//                         <CheckCircle className="w-5 h-5" />
//                         Active
//                       </span>
//                     ) : (
//                       <span
//                         className="inline-flex items-center gap-1 text-red-500 cursor-pointer"
//                         onClick={() => handleStatusClick(d)}
//                       >
//                         <XCircle className="w-5 h-5" />
//                         Inactive
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className="flex justify-center mt-4 space-x-2">
//             <button
//               onClick={() => setPage((p) => Math.max(p - 1, 1))}
//               disabled={page === 1}
//               className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-60"
//             >
//               Previous
//             </button>
//             <span className="px-3 py-1">{page}</span>
//             <button
//               onClick={() => setPage((p) => p + 1)}
//               disabled={page >= totalPages}
//               className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-60"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Activate/Deactivate Popup */}
//       {showPopup && selectedDestination && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
//           <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">
//               {selectedDestination.activeStatus ? "Deactivate" : "Activate"} Destination
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to{" "}
//               <span className="font-bold">
//                 {selectedDestination.activeStatus ? "deactivate" : "activate"}
//               </span>{" "}
//               the destination:{" "}
//               <span className="font-semibold">{selectedDestination.name}</span>?
//             </p>

//             <div className="flex justify-end space-x-3">
//               <button
//                 className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
//                 onClick={() => {
//                   setShowPopup(false);
//                   setSelectedDestination(null);
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 className={`px-4 py-2 text-white rounded ${
//                   selectedDestination.activeStatus
//                     ? "bg-red-500 hover:bg-red-600"
//                     : "bg-green-500 hover:bg-green-600"
//                 }`}
//                 onClick={handleToggleStatus}
//               >
//                 {selectedDestination.activeStatus ? "Deactivate" : "Activate"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


import React, { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe2,
  MapPin,
  Flag,
} from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

const CreateDestination = () => {
  const THEME = "#8570EE";

  const [selectedType, setSelectedType] = useState("Country");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ UI-only: table animation direction + loading veil (NO logic change)
  const [pageDir, setPageDir] = useState(1); // 1 = next (slide left), -1 = prev (slide right)
  const [tableLoading, setTableLoading] = useState(false);

  /* --------------------------------------------
    ✅ react-select dropdown + value overflow FIX
    - menuPortalTarget to body (prevents clipping)
    - menuList maxHeight + scroll
    - singleValue ellipsis
    - valueContainer NO horizontal scroll
  --------------------------------------------- */
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

      menuList: (b) => ({
        ...b,
        maxHeight: 260,
        overflowY: "auto",
      }),

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

  // Helpers to map API data -> Select options
  const toCountryOption = (c) => ({ _id: c._id, value: c._id, label: c.name });
  const toStateOption = (s) => ({ _id: s._id, value: s._id, label: s.name });

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const res = await API.get("/purchaser/countries");
      setCountries(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load countries");
    }
  };

  // Fetch states based on selected country
  const fetchStates = async () => {
    try {
      if (selectedCountry?.value) {
        const res = await API.get(`/purchaser/states/${selectedCountry.value}`);
        setStates(res.data || []);
      } else {
        setStates([]);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load states");
    }
  };

  // Fetch destinations with pagination and search
  const fetchDestinations = async () => {
    try {
      // ✅ UI-only (no logic change): show a tiny veil while page changes
      setTableLoading(true);

      const res = await API.get(
        `/purchaser/destinations?page=${page}&search=${encodeURIComponent(search)}`
      );
      setDestinations(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry?.value]);

  useEffect(() => {
    fetchDestinations();
  }, [page, search]);

  // Handle create logic (UNCHANGED validations)
  const handleCreate = async () => {
    const type = selectedType;

    if (!inputValue.trim()) {
      if (type === "Country") toast.error("Country name is mandatory");
      else if (type === "State") toast.error("Country and State name are mandatory");
      else if (type === "Destination") toast.error("Country, State and Destination name are mandatory");
      return;
    }

    try {
      if (type === "Country") {
        await API.post("/purchaser/country", { name: inputValue });
      } else if (type === "State") {
        if (!selectedCountry?.value) {
          toast.error("Please select a country");
          return;
        }
        await API.post("/purchaser/state", {
          name: inputValue,
          country: selectedCountry.value,
        });
      } else if (type === "Destination") {
        if (!selectedCountry?.value || !selectedState?.value) {
          toast.error("Please select both country and state");
          return;
        }
        await API.post("/purchaser/destination", {
          name: inputValue,
          country: selectedCountry.value,
          state: selectedState.value,
        });
        fetchDestinations();
      }

      // Reset + refresh
      setInputValue("");
      setSelectedCountry(null);
      setSelectedState(null);
      fetchCountries();
      fetchStates();

      toast.success(`${type} created successfully`);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message || "Something went wrong";
      toast.error(errorMessage);
    }
  };

  const handleStatusClick = (destination) => {
    setSelectedDestination(destination);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedDestination) return;

    try {
      const updatedStatus = !selectedDestination.activeStatus;
      const res = await API.patch(
        `/purchaser/updateDestinationStatus/${selectedDestination._id}/status`,
        { activeStatus: updatedStatus }
      );

      if (res.data.success) {
        toast.success(`Destination ${updatedStatus ? "activated" : "deactivated"} successfully`);
        await fetchDestinations();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedDestination(null);
    }
  };

  const countryOptions = countries.map(toCountryOption);
  const stateOptions = states.map(toStateOption);

  // ✅ Premium directional slide (UI only)
  const bodyVariants = {
    initial: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 34 : -34,
      filter: "blur(6px)",
    }),
    animate: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -34 : 34,
      filter: "blur(6px)",
    }),
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto mb-6 mt-6 px-3 sm:px-4">
      <div className="w-full bg-white rounded-3xl shadow-[0_22px_55px_rgba(15,23,42,0.12)] overflow-hidden">
        {/* Top ribbon */}
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
                Create Destination
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Create Country / State / Destination and manage status.
              </div>
            </div>

            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner"
              style={{ background: `${THEME}12`, color: THEME, borderColor: `${THEME}30` }}
            >
              <MapPin size={20} />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* LEFT: CREATE PANEL */}
            <div className="lg:col-span-2">
              <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-white/80">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Create</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">Add new location</div>
                </div>

                <div className="p-5 space-y-4 bg-gradient-to-b from-white to-purple-50/40">
                  {/* Type selector responsive */}
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {["Country", "State", "Destination"].map((type) => {
                        const active = selectedType === type;
                        const Icon = type === "Country" ? Globe2 : type === "State" ? Flag : MapPin;

                        return (
                          <label
                            key={type}
                            className={[
                              "cursor-pointer rounded-2xl border px-3 py-2.5 flex items-center gap-2 justify-center",
                              "transition shadow-sm",
                              active
                                ? "bg-[#8570EE]/10 border-[#8570EE]/40"
                                : "bg-white border-slate-200 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <input
                              type="radio"
                              name="locationType"
                              value={type}
                              checked={active}
                              onChange={() => {
                                setSelectedType(type);
                                setSelectedCountry(null);
                                setSelectedState(null);
                                setInputValue("");
                              }}
                              className="accent-[#8570EE]"
                            />
                            <Icon size={16} style={{ color: THEME }} />
                            <span className="text-sm font-semibold" style={{ color: THEME }}>
                              {type}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Country select */}
                  {selectedType !== "Country" && (
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                        Country
                      </div>
                      <Select
                        options={countryOptions}
                        value={selectedCountry}
                        onChange={(v) => {
                          setSelectedCountry(v);
                          setSelectedState(null);
                        }}
                        placeholder="Select Country"
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        classNamePrefix="create-country"
                        getOptionValue={(o) => String(o._id || o.value)}
                        isClearable
                      />
                    </div>
                  )}

                  {/* State select */}
                  {selectedType === "Destination" && (
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                        State
                      </div>
                      <Select
                        options={stateOptions}
                        value={selectedState}
                        onChange={(v) => setSelectedState(v)}
                        placeholder="Select State"
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        classNamePrefix="create-state"
                        getOptionValue={(o) => String(o._id || o.value)}
                        isClearable
                        isDisabled={!selectedCountry?.value}
                      />
                      {!selectedCountry?.value && (
                        <div className="mt-1 text-xs text-slate-400">
                          Select country first to enable states.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input */}
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                      {selectedType} name
                    </div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Enter ${selectedType}`}
                      className="
                        w-full
                        rounded-2xl
                        border border-slate-300
                        bg-white/90
                        px-4 py-3
                        text-sm
                        outline-none
                        focus:ring-2 focus:ring-[#8570EE]
                      "
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleCreate}
                    className="
                      w-full
                      rounded-2xl
                      px-5 py-3.5
                      text-sm font-extrabold
                      text-white
                      shadow-[0_16px_40px_rgba(133,112,238,0.35)]
                      hover:opacity-95
                      transition
                    "
                    style={{ background: THEME }}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: LIST PANEL */}
            <div className="lg:col-span-3">
              <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">View</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">Destinations</div>
                    <div className="mt-1 text-sm text-slate-500">Paginated destination list</div>
                  </div>

                  {/* Search */}
                  <div className="flex items-center gap-2 h-11 bg-white border border-slate-300 rounded-2xl px-4 shadow-sm hover:shadow-md transition w-full sm:w-[320px]">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPageDir(1); // UI-only
                        setPage(1);
                      }}
                      placeholder="Search destination..."
                      className="bg-transparent outline-none border-none text-sm text-slate-700 w-full placeholder:text-slate-400 focus:ring-0 h-full"
                    />
                  </div>
                </div>

                {/* ✅ NO scrollbar flash:
                    Outer keeps horizontal scrolling for small screens,
                    but blocks vertical overflow.
                    Inner clips BOTH axis during motion animations.
                */}
                <div className="relative overflow-x-auto overflow-y-hidden">
                  <div className="relative overflow-hidden">
                    {/* UI-only loading veil */}
                    <AnimatePresence>
                      {tableLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 bg-white/55 backdrop-blur-[2px]"
                        />
                      )}
                    </AnimatePresence>

                    <table className="w-full text-sm text-left text-slate-700 min-w-[760px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <th className="px-5 py-3">Sl No</th>
                          <th className="px-5 py-3">Country</th>
                          <th className="px-5 py-3">State</th>
                          <th className="px-5 py-3">Destination</th>
                          <th className="px-5 py-3">Destination code</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>

                      <AnimatePresence mode="wait" custom={pageDir}>
                        <motion.tbody
                          key={`${page}-${search}`}
                          custom={pageDir}
                          variants={bodyVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          style={{ willChange: "transform" }}
                        >
                          {destinations.map((d, idx) => (
                            <tr
                              key={d._id}
                              className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                            >
                              <td className="px-5 py-3 font-semibold">
                                {(page - 1) * 3 + idx + 1}
                              </td>
                              <td className="px-5 py-3 font-semibold">{d.country?.name}</td>
                              <td className="px-5 py-3 font-semibold">{d.state?.name}</td>
                              <td className="px-5 py-3 font-semibold">{d.name}</td>
                              <td className="px-5 py-3 font-semibold">{d.destinationCode}</td>
                              <td className="px-5 py-3 font-semibold">
                                {d.activeStatus ? (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusClick(d)}
                                    className="
                                      inline-flex items-center gap-2
                                      px-3 py-1.5 rounded-full
                                      text-xs font-semibold
                                      border
                                      bg-emerald-50 text-emerald-700 border-emerald-200
                                      hover:bg-emerald-100 transition
                                    "
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Active
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusClick(d)}
                                    className="
                                      inline-flex items-center gap-2
                                      px-3 py-1.5 rounded-full
                                      text-xs font-semibold
                                      border
                                      bg-red-50 text-red-700 border-red-200
                                      hover:bg-red-100 transition
                                    "
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Inactive
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}

                          {destinations.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                                No destinations found.
                              </td>
                            </tr>
                          )}
                        </motion.tbody>
                      </AnimatePresence>
                    </table>
                  </div>
                </div>

                {/* Pagination (UI-only: sets direction) */}
                <div className="py-4 flex items-center justify-center gap-2 bg-white border-t border-slate-200">
                  <button
                    onClick={() => {
                      setPageDir(-1);
                      setPage((p) => Math.max(p - 1, 1));
                    }}
                    disabled={page === 1}
                    className={`
                      inline-flex items-center gap-2
                      px-3 py-2 rounded-xl border text-sm
                      ${
                        page === 1
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }
                    `}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <span className="px-4 py-2 rounded-xl bg-[#8570EE]/10 text-[#8570EE] font-bold border border-[#8570EE]/25">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => {
                      setPageDir(1);
                      setPage((p) => p + 1);
                    }}
                    disabled={page >= totalPages}
                    className={`
                      inline-flex items-center gap-2
                      px-3 py-2 rounded-xl border text-sm
                      ${
                        page >= totalPages
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }
                    `}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popup (logic unchanged) */}
        {showPopup && selectedDestination && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                setSelectedDestination(null);
              }}
            />

            <div
              className="
                relative
                w-full max-w-md mx-3
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
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Confirm action
                </div>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {selectedDestination.activeStatus ? "Deactivate" : "Activate"} Destination
                </h2>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold">
                    {selectedDestination.activeStatus ? "deactivate" : "activate"}
                  </span>{" "}
                  the destination:{" "}
                  <span className="font-semibold">{selectedDestination.name}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                    onClick={() => {
                      setShowPopup(false);
                      setSelectedDestination(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-xl text-white font-extrabold shadow hover:opacity-95"
                    style={{
                      background: selectedDestination.activeStatus ? "#ef4444" : "#22c55e",
                    }}
                    onClick={handleToggleStatus}
                  >
                    {selectedDestination.activeStatus ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDestination;


