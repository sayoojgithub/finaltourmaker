// import React, { useState, useEffect } from "react";
// import API from "../../api";
// import { Pencil } from "lucide-react";
// import { ReceiptText } from "lucide-react";
// import { toast } from "react-toastify";

// const CreateGroupTour = () => {
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [destinations, setDestinations] = useState([]);
//   const [formData, setFormData] = useState({
//     country: "",
//     state: "",
//     destination: "",
//     tourName: "",
//     articleNumber: "",
//     category: "",
//     pickupPoint: "",
//     dropOffPoint: "",
//     totalDays: "",
//     totalNights: "",
//     startDate: "",
//     netCost: "",
//     pricePerPax: "",
//     totalPax: "",
//     riskAmount: "",
//   });
//   const [includes, setIncludes] = useState([]);
//   const [excludes, setExcludes] = useState([]);
//   const [days, setDays] = useState([]);
//   const [groupTours, setGroupTours] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentlyEditingTourId, setCurrentlyEditingTourId] = useState(null);
//   const fetchGroupTours = async () => {
//     try {
//       const res = await API.get("/purchaser/groupTours", {
//         params: {
//           page,
//           limit: 3,
//           search,
//         },
//       });
//       setGroupTours(res.data.tours); // Assuming response shape
//       setTotalPages(res.data.totalPages || 1);
//     } catch (error) {
//       console.error("Error fetching group tours:", error);
//       toast.error("Failed to fetch group tours.");
//     }
//   };
//   useEffect(() => {
//     fetchGroupTours();
//   }, [search, page]);

//   useEffect(() => {
//     const total = parseInt(formData.totalDays, 10);
//     if (formData.totalDays === "" || isNaN(total) || total <= 0) return;

//     setDays((prev) => {
//       const newDays = [...prev];

//       // If total increased, add new empty day objects
//       while (newDays.length < total) {
//         newDays.push({
//           country: "",
//           state: "",
//           destination: "",
//           trip: "",
//           activities: ["", "", ""],
//           expanded: false,
//           availableStates: [],
//           availableDestinations: [],
//           availableTrips: [],
//           availableAddonTrips: [],
//           availableActivities: [],
//           selectedAddon: "",
//           selectedActivity: "",
//           date: "",
//         });
//       }

//       // If total decreased, remove extra days
//       if (newDays.length > total) {
//         newDays.splice(total); // cuts off extra elements
//       }

//       return newDays;
//     });
//   }, [formData.totalDays]);

//   useEffect(() => {
//     const fetchCountries = async () => {
//       try {
//         const res = await API.get("/purchaser/countries");
//         setCountries(res.data);
//       } catch (err) {
//         toast.error("Error fetching countries:", err);
//       }
//     };
//     fetchCountries();
//   }, []);
//   useEffect(() => {
//     const fetchStates = async () => {
//       if (!formData.country || currentlyEditingTourId) return;
//       setStates([]);
//       setDestinations([]);
//       setFormData((prev) => ({
//         ...prev,
//         state: "",
//         destination: "",
//       }));
//       try {
//         const res = await API.get(`/purchaser/states/${formData.country}`);
//         setStates(res.data);
//       } catch (err) {
//         toast.error("Error fetching states");
//       }
//     };
//     fetchStates();
//   }, [formData.country]);
//   useEffect(() => {
//     if (!formData.country || !formData.state || currentlyEditingTourId) return;
//     setDestinations([]);
//     setFormData((prev) => ({
//       ...prev,
//       destination: "",
//     }));

//     const fetchDestinations = async () => {
//       try {
//         const res = await API.get(
//           `/purchaser/destinationsByCountryAndState/${formData.country}/${formData.state}`
//         );
//         setDestinations(res.data);
//         setFormData((prev) => ({ ...prev, destination: "" }));
//       } catch (err) {
//         toast.error("Error fetching destinations");
//       }
//     };
//     fetchDestinations();
//   }, [formData.state, formData.country]);

//   const handleAddItem = (item, setItemList, itemList, inputId) => {
//     if (item && !itemList.includes(item)) {
//       setItemList([...itemList, item]);
//       document.getElementById(inputId).value = "";
//     }
//   };

//   const handleRemoveItem = (index, setItemList, itemList) => {
//     const newList = [...itemList];
//     newList.splice(index, 1);
//     setItemList(newList);
//   };

//   const handleClearActivity = (dayIndex, actIndex) => {
//     const newDays = [...days];

//     if (actIndex === 0) {
//       newDays[dayIndex].trip = "";
//       newDays[dayIndex].selectedAddon = "";
//       newDays[dayIndex].selectedActivity = "";
//     } else if (actIndex === 1) {
//       newDays[dayIndex].selectedAddon = "";
//     } else if (actIndex === 2) {
//       newDays[dayIndex].selectedActivity = "";
//     }

//     setDays(newDays);
//   };

//   const handleRemoveDay = (index) => {
//     const newDays = [...days];
//     newDays.splice(index, 1);
//     setDays(newDays);
//   };

//   const toggleDayExpand = (index) => {
//     const newDays = [...days];
//     newDays[index].expanded = !newDays[index].expanded;
//     setDays(newDays);
//   };
//   const updateDayField = async (index, field, value) => {
//     const d = [...days];
//     const day = d[index];
//     day[field] = value;

//     // Reset dependent fields
//     if (field === "country") {
//       day.state = "";
//       day.destination = "";
//       day.trip = "";
//       day.availableStates = [];
//       day.availableDestinations = [];
//       day.availableTrips = [];
//       day.availableAddonTrips = [];
//       day.availableActivities = [];
//     }
//     if (field === "state") {
//       day.destination = "";
//       day.trip = "";
//       day.availableDestinations = [];
//       day.availableTrips = [];
//       day.availableAddonTrips = [];
//       day.availableActivities = [];
//     }
//     if (field === "destination") {
//       day.trip = "";
//       day.availableTrips = [];
//       day.availableAddonTrips = [];
//       day.availableActivities = [];
//     }

//     // Fetch options based on the changed field
//     try {
//       if (field === "country") {
//         const res = await API.get(`/purchaser/states/${value}`);
//         day.availableStates = res.data;
//       }
//       if (field === "state") {
//         const res = await API.get(
//           `/purchaser/destinationsByCountryAndState/${day.country}/${value}`
//         );
//         day.availableDestinations = res.data;
//       }
//       if (field === "destination") {
//         const res = await API.get(
//           `/purchaser/tripsByLocation/${day.country}/${day.state}/${value}`
//         );
//         day.availableTrips = res.data;
//       }
//       if (field === "trip") {
//         const res = await API.get(`/purchaser/tripDetails/${value}`);
//         day.availableAddonTrips = res.data.addonTrips || [];
//         day.availableActivities = res.data.activities || [];
//       }
//     } catch (err) {
//       console.error("Error fetching", field, err);
//     }

//     // Compute the date for this day
//     if (formData.startDate) {
//       const base = new Date(formData.startDate);
//       base.setDate(base.getDate() + index);
//       day.date = base.toISOString().split("T")[0];
//     }

//     d[index] = day;
//     setDays(d);
//   };
//   const handleEditTour = async (tour) => {
//     setCurrentlyEditingTourId(tour._id);

//     // Step 1: set form data (but blank state/destination temporarily)
//     setFormData({
//       ...formData,
//       country: tour.country || "",
//       state: "",
//       destination: "",
//       tourName: tour.tourName || "",
//       articleNumber: tour.articleNumber || "",
//       category: tour.category || "",
//       pickupPoint: tour.pickupPoint || "",
//       dropOffPoint: tour.dropOffPoint || "",
//       totalDays: tour.totalDays?.toString() || "1",
//       totalNights: tour.totalNights?.toString() || "",
//       startDate: tour.startDate?.slice(0, 10) || "",
//       netCost: tour.netCost?.toString() || "",
//       pricePerPax: tour.pricePerPax?.toString() || "",
//       totalPax: tour.totalPax?.toString() || "",
//       riskAmount: tour.riskAmount?.toString() || "",
//     });

//     setIncludes(tour.includes || []);
//     setExcludes(tour.excludes || []);

//     try {
//       // Step 2: Fetch states and then set state
//       if (tour.country) {
//         const resStates = await API.get(`/purchaser/states/${tour.country}`);
//         setStates(resStates.data);
//       }

//       setFormData((prev) => ({
//         ...prev,
//         state: tour.state || "",
//       }));

//       // Step 3: Fetch destinations and then set destination
//       if (tour.country && tour.state) {
//         const resDest = await API.get(
//           `/purchaser/destinationsByCountryAndState/${tour.country}/${tour.state}`
//         );
//         setDestinations(resDest.data);
//       }

//       setFormData((prev) => ({
//         ...prev,
//         destination: tour.destination || "",
//       }));
//     } catch (err) {
//       console.error("Failed to fetch state/destination in edit:", err);
//       toast.error("Error preparing form for edit.");
//     }

//     // Step 4: Load days info with options
//     const filledDays = await Promise.all(
//       (tour.days || []).map(async (day, i) => {
//         const d = {
//           country: day.country || "",
//           state: day.state || "",
//           destination: day.destination || "",
//           trip: day.trip || "",
//           selectedAddon: day.selectedAddon || "",
//           selectedActivity: day.selectedActivity || "",
//           activities: ["", "", ""],
//           expanded: false,
//           date: day.date ? day.date.slice(0, 10) : "",
//           availableStates: [],
//           availableDestinations: [],
//           availableTrips: [],
//           availableAddonTrips: [],
//           availableActivities: [],
//         };

//         try {
//           if (d.country) {
//             const res = await API.get(`/purchaser/states/${d.country}`);
//             d.availableStates = res.data;
//           }
//           if (d.country && d.state) {
//             const res = await API.get(
//               `/purchaser/destinationsByCountryAndState/${d.country}/${d.state}`
//             );
//             d.availableDestinations = res.data;
//           }
//           if (d.country && d.state && d.destination) {
//             const res = await API.get(
//               `/purchaser/tripsByLocation/${d.country}/${d.state}/${d.destination}`
//             );
//             d.availableTrips = res.data;
//           }
//           if (d.trip) {
//             const res = await API.get(`/purchaser/tripDetails/${d.trip}`);
//             d.availableAddonTrips = res.data.addonTrips || [];
//             d.availableActivities = res.data.activities || [];
//           }
//         } catch (err) {
//           console.error(`Failed to fetch dropdowns for Day ${i + 1}:`, err);
//         }

//         return d;
//       })
//     );

//     setDays(filledDays);
//   };

//   const handleCreateGroupTour = async () => {
//     try {
//       const requiredFields = {
//         country: "Country is required",
//         state: "State is required",
//         destination: "Destination is required",
//         tourName: "Tour Name is required",
//         articleNumber: "Article Number is required",
//         category: "Category is required",
//         pickupPoint: "Pickup Point is required",
//         dropOffPoint: "Drop-off Point is required",
//         totalDays: "Total Days is required",
//         totalNights: "Total Nights is required",
//         startDate: "Start Date is required",
//         pricePerPax: "Price per Pax is required",
//         totalPax: "Total Pax is required",
//       };

//       // ✅ Validate main form fields
//       for (const [field, message] of Object.entries(requiredFields)) {
//         if (!formData[field]) {
//           toast.error(message);
//           return;
//         }
//       }

//       // ✅ Validate includes and excludes
//       if (includes.length === 0) {
//         toast.error("At least one Include is required.");
//         return;
//       }

//       if (excludes.length === 0) {
//         toast.error("At least one Exclude is required.");
//         return;
//       }

//       // ✅ Validate days
//       if (days.length === 0) {
//         toast.error("At least one day is required.");
//         return;
//       }

//       for (let i = 0; i < days.length; i++) {
//         const day = days[i];
//         if (!day.country) {
//           toast.error(`Country is required for Day ${i + 1}`);
//           return;
//         }
//         if (!day.state) {
//           toast.error(`State is required for Day ${i + 1}`);
//           return;
//         }
//         if (!day.destination) {
//           toast.error(`Destination is required for Day ${i + 1}`);
//           return;
//         }
//         if (!day.trip) {
//           toast.error(`Trip is required for Day ${i + 1}`);
//           return;
//         }
//       }
//       if (days.length !== Number(formData.totalDays)) {
//         toast.error(
//           `You must provide exactly ${formData.totalDays} day(s) of details.`
//         );
//         return;
//       }

//       if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
//         toast.error("Total Nights should be exactly one less than Total Days.");
//         return;
//       }

//       // Build request payload
//       const payload = {
//         ...formData,
//         includes,
//         excludes,
//         days: days.map((day) => ({
//           country: day.country,
//           state: day.state,
//           destination: day.destination,
//           trip: day.trip,
//           selectedAddon: day.selectedAddon || undefined,
//           selectedActivity: day.selectedActivity || undefined,
//         })),
//       };

//       let res;
//       if (currentlyEditingTourId) {
//         res = await API.put(
//           `/purchaser/updateGroupTour/${currentlyEditingTourId}`,
//           payload
//         );
//         toast.success("Group tour updated successfully!");
//         setCurrentlyEditingTourId(null);
//         await fetchGroupTours();
//       } else {
//         res = await API.post("/purchaser/createGroupTour", payload);
//         toast.success("Group tour created successfully!");
//         await fetchGroupTours();
//       }

//       // ✅ Clear all form data
//       setFormData({
//         country: "",
//         state: "",
//         destination: "",
//         tourName: "",
//         articleNumber: "",
//         category: "",
//         pickupPoint: "",
//         dropOffPoint: "",
//         totalDays: "",
//         totalNights: "",
//         startDate: "",
//         netCost: "",
//         pricePerPax: "",
//         totalPax: "",
//         riskAmount: "",
//       });
//       setIncludes([]);
//       setExcludes([]);
//       setDays([]);
//       setStates([]);
//       setDestinations([]);
//     } catch (error) {
//       console.error("Error creating group tour:", error);
//       toast.error("Failed to create group tour.");
//     }
//   };

//   return (
//     <div className="p-8 space-y-8 max-w-[100rem] mx-auto text-base font-sans bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-2xl">
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {/* Country */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Country
//           </label>
//           <select
//             value={formData.country}
//             disabled={!!currentlyEditingTourId}
//             onChange={(e) =>
//               setFormData({ ...formData, country: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full disabled:cursor-not-allowed"
//           >
//             <option value="">Select Country</option>
//             {countries.map((country) => (
//               <option key={country._id} value={country._id}>
//                 {country.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* State */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             State
//           </label>
//           <select
//             value={formData.state}
//             disabled={!!currentlyEditingTourId}
//             onChange={(e) =>
//               setFormData({ ...formData, state: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full disabled:cursor-not-allowed"
//           >
//             <option value="">Select State</option>
//             {states.map((state) => (
//               <option key={state._id} value={state._id}>
//                 {state.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Destination */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Destination
//           </label>
//           <select
//             value={formData.destination}
//             disabled={!!currentlyEditingTourId}
//             onChange={(e) =>
//               setFormData({ ...formData, destination: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full disabled:cursor-not-allowed"
//           >
//             <option value="">Select Destination</option>
//             {destinations.map((destination) => (
//               <option key={destination._id} value={destination._id}>
//                 {destination.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Tour Name */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Tour Name
//           </label>
//           <input
//             type="text"
//             placeholder="Tour Name"
//             value={formData.tourName}
//             disabled={!!currentlyEditingTourId}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 tourName: e.target.value.toUpperCase(),
//               })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full disabled:cursor-not-allowed"
//           />
//         </div>

//         {/* Article Number */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Article Number
//           </label>
//           <input
//             type="text"
//             placeholder="Article Number"
//             value={formData.articleNumber}
//             disabled={!!currentlyEditingTourId}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 articleNumber: e.target.value.toUpperCase(),
//               })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full disabled:cursor-not-allowed"
//           />
//         </div>

//         {/* Category */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Category
//           </label>
//           <select
//             value={formData.category}
//             disabled={!!currentlyEditingTourId}
//             onChange={(e) =>
//               setFormData({ ...formData, category: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full disabled:cursor-not-allowed"
//           >
//             <option value="">Select Category</option>
//             <option value="Standard">Standard</option>
//             <option value="Delux">Delux</option>
//             <option value="Premium">Premium</option>
//           </select>
//         </div>

//         {/* Pickup Point */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Pickup Point
//           </label>
//           <input
//             type="text"
//             placeholder="Enter Pickup Point"
//             value={formData.pickupPoint}
//             onChange={(e) =>
//               setFormData({ ...formData, pickupPoint: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
//           />
//         </div>

//         {/* Drop Off Point */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Drop Off Point
//           </label>
//           <input
//             type="text"
//             placeholder="Enter Drop Off Point"
//             value={formData.dropOffPoint}
//             onChange={(e) =>
//               setFormData({ ...formData, dropOffPoint: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
//           />
//         </div>

//         {/* Total Days */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Days
//           </label>
//           <input
//             type="number"
//             min={1}
//             value={formData.totalDays}
//             onChange={(e) => {
//               // Block manual typing — only allow arrow keys (↑↓)
//               const val = e.target.value;
//               const nativeEvent = e.nativeEvent;

//               // Allow only keyboard arrows, not manual typing
//               if (nativeEvent.inputType === "insertText" && isNaN(Number(val)))
//                 return;

//               // Always keep value ≥ 1
//               const parsed = Math.max(1, parseInt(val || "1", 10));
//               setFormData({ ...formData, totalDays: String(parsed) });
//             }}
//             onKeyDown={(e) => {
//               if (e.key === "ArrowUp") {
//                 e.preventDefault();
//                 const current = parseInt(formData.totalDays || "1");
//                 setFormData({ ...formData, totalDays: String(current + 1) });
//               } else if (e.key === "ArrowDown") {
//                 e.preventDefault();
//                 const current = parseInt(formData.totalDays || "1");
//                 if (current > 1) {
//                   setFormData({ ...formData, totalDays: String(current - 1) });
//                 }
//               }
//             }}
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
//           />
//         </div>

//         {/* Total Nights */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Nights
//           </label>
//           <input
//             type="text"
//             placeholder="Enter Total Nights"
//             value={formData.totalNights}
//             onChange={(e) =>
//               setFormData({ ...formData, totalNights: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
//           />
//         </div>

//         {/* Start Date */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Start Date
//           </label>
//           <input
//             type="date"
//             value={formData.startDate}
//             onChange={(e) =>
//               setFormData({ ...formData, startDate: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full"
//           />
//         </div>

//         {/* Net Cost */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Net Cost
//           </label>
//           <input
//             type="text"
//             readOnly
//             placeholder="Net Cost"
//             value={formData.netCost}
//             onChange={(e) =>
//               setFormData({ ...formData, netCost: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
//           />
//         </div>

//         {/* Price Per Pax */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Price Per Pax
//           </label>
//           <input
//             type="text"
//             placeholder="Price Per Pax"
//             value={formData.pricePerPax}
//             onChange={(e) =>
//               setFormData({ ...formData, pricePerPax: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
//           />
//         </div>

//         {/* Total Pax */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Pax
//           </label>
//           <input
//             type="text"
//             placeholder="Total Pax"
//             value={formData.totalPax}
//             onChange={(e) =>
//               setFormData({ ...formData, totalPax: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
//           />
//         </div>

//         {/* Risk Amount */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Risk Amount
//           </label>
//           <input
//             type="text"
//             placeholder="Risk Amount"
//             value={formData.riskAmount}
//             onChange={(e) =>
//               setFormData({ ...formData, riskAmount: e.target.value })
//             }
//             className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
//           />
//         </div>
//       </div>

//       <div className="flex w-full gap-3">
//         {/* Include Section - 50% */}
//         <div className="w-1/2 flex items-center gap-3">
//           <input
//             id="includeInput"
//             className="border border-gray-300 p-3 w-full rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             placeholder="Add to Includes"
//           />
//           <button
//             onClick={() =>
//               handleAddItem(
//                 document.getElementById("includeInput").value,
//                 setIncludes,
//                 includes,
//                 "includeInput"
//               )
//             }
//             className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
//           >
//             +
//           </button>
//         </div>

//         {/* Exclude Section - 50% */}
//         <div className="w-1/2 flex items-center gap-3">
//           <input
//             id="excludeInput"
//             className="border border-gray-300 p-3 w-full rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//             placeholder="Add to Excludes"
//           />
//           <button
//             onClick={() =>
//               handleAddItem(
//                 document.getElementById("excludeInput").value,
//                 setExcludes,
//                 excludes,
//                 "excludeInput"
//               )
//             }
//             className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
//           >
//             +
//           </button>
//         </div>
//       </div>

//       <div className="space-y-3">
//         <h2 className="font-semibold text-gray-700">Includes</h2>
//         <div className="flex flex-wrap gap-3">
//           {includes.map((tag, index) => (
//             <span
//               key={index}
//               className="bg-white text-black px-4 py-1 rounded-full flex items-center gap-2 shadow border border-black"
//             >
//               {tag}
//               <button
//                 onClick={() => handleRemoveItem(index, setIncludes, includes)}
//                 className="text-black hover:text-red-500 font-bold"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-3">
//         <h2 className="font-semibold text-gray-700">Excludes</h2>
//         <div className="flex flex-wrap gap-3">
//           {excludes.map((tag, index) => (
//             <span
//               key={index}
//               className="bg-white text-black px-4 py-1 rounded-full flex items-center gap-2 shadow border border-black"
//             >
//               {tag}
//               <button
//                 onClick={() => handleRemoveItem(index, setExcludes, excludes)}
//                 className="text-black hover:text-red-500 font-bold"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//         </div>
//       </div>

//       {days.map((day, i) => (
//         <div
//           key={i}
//           className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between mb-2">
//             <div
//               className="flex items-center gap-2 cursor-pointer"
//               onClick={() => toggleDayExpand(i)}
//             >
//               <span className="text-lg font-bold text-gray-500">
//                 {day.expanded ? "▾" : "▸"}
//               </span>
//               <h3 className="text-xl font-semibold text-gray-800">
//                 Day {i + 1}
//               </h3>
//             </div>
//             <button
//               onClick={() => handleRemoveDay(i)}
//               className="text-gray-300 hover:text-red-400 font-bold text-xl"
//             >
//               ×
//             </button>
//           </div>

//           {/* 👇 EVERYTHING THAT SHOULD BE HIDDEN UNTIL EXPANDED GOES HERE */}
//           {day.expanded && (
//             <div>
//               {/* COUNTRY / STATE / DEST */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
//                 <select
//                   value={day.country}
//                   onChange={(e) => updateDayField(i, "country", e.target.value)}
//                   className="..."
//                 >
//                   <option value="">Select Country</option>
//                   {countries.map((c) => (
//                     <option key={c._id} value={c._id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>

//                 <select
//                   value={day.state}
//                   onChange={(e) => updateDayField(i, "state", e.target.value)}
//                   className="..."
//                 >
//                   <option value="">Select State</option>
//                   {day.availableStates.map((s) => (
//                     <option key={s._id} value={s._id}>
//                       {s.name}
//                     </option>
//                   ))}
//                 </select>

//                 <select
//                   value={day.destination}
//                   onChange={(e) =>
//                     updateDayField(i, "destination", e.target.value)
//                   }
//                   className="..."
//                 >
//                   <option value="">Select Destination</option>
//                   {day.availableDestinations.map((d) => (
//                     <option key={d._id} value={d._id}>
//                       {d.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* TRIP */}
//               <div className="flex items-center gap-3 mb-3">
//                 <select
//                   value={day.trip}
//                   onChange={async (e) => {
//                     const val = e.target.value;
//                     await updateDayField(i, "trip", val);
//                   }}
//                   className="w-full border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700"
//                 >
//                   <option value="">Select Trip</option>
//                   {day.availableTrips?.map((opt) => (
//                     <option key={opt._id} value={opt._id}>
//                       {opt.tripName}
//                     </option>
//                   ))}
//                 </select>

//                 <button
//                   onClick={() => handleClearActivity(i, 0)}
//                   className="bg-red-500 text-white px-3 py-2 rounded-lg"
//                 >
//                   ×
//                 </button>
//               </div>

//               {/* ADD-ON */}
//               <div className="flex items-center gap-3 mb-3">
//                 <select
//                   value={day.selectedAddon}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     const d2 = [...days];
//                     d2[i].selectedAddon = val;
//                     setDays(d2);
//                   }}
//                   className="w-full border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700"
//                 >
//                   <option value="">Select Addon Trip</option>
//                   {day.availableAddonTrips?.map((opt) => (
//                     <option key={opt._id} value={opt._id}>
//                       {opt.tripName}
//                     </option>
//                   ))}
//                 </select>

//                 <button
//                   onClick={() => handleClearActivity(i, 1)}
//                   className="bg-red-500 text-white px-3 py-2 rounded-lg"
//                 >
//                   ×
//                 </button>
//               </div>

//               {/* ACTIVITY */}
//               <div className="flex items-center gap-3 mb-3">
//                 <select
//                   value={day.selectedActivity}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     const d2 = [...days];
//                     d2[i].selectedActivity = val;
//                     setDays(d2);
//                   }}
//                   className="w-full border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700"
//                 >
//                   <option value="">Select Activity</option>
//                   {day.availableActivities?.map((opt) => (
//                     <option key={opt._id} value={opt._id}>
//                       {opt.tripName}
//                     </option>
//                   ))}
//                 </select>

//                 <button
//                   onClick={() => handleClearActivity(i, 2)}
//                   className="bg-red-500 text-white px-3 py-2 rounded-lg"
//                 >
//                   ×
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ))}

//       <button
//         onClick={handleCreateGroupTour}
//         className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
//       >
//         {currentlyEditingTourId ? "Update Group Tour" : "Create Group Tour"}
//       </button>
//       <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
//         <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
//           View Group Tour
//         </h5>
//         <p className="block mb-6 text-sm font-light text-gray-400">
//           Search and Edit Group Tour
//         </p>
//         <div className="mb-4">
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1); // Reset to first page on new search
//             }}
//             placeholder="Search by Group Tour Name..."
//             className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//           />
//         </div>
//         <div className="overflow-x-auto ">
//           <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
//             <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//               <tr>
//                 <th className="px-6 py-4">Sl No</th>
//                 <th className="px-6 py-4">TOUR NAME</th>
//                 <th className="px-6 py-4">ARTICLE NUMBER</th>
//                 <th className="px-6 py-4">CATEGORY</th>
//                 <th className="px-6 py-4">START DATE</th>
//                 <th className="px-6 py-4 text-center">EDIT</th>
//                 <th className="px-6 py-4 text-center">Bo</th>
//               </tr>
//             </thead>
//             <tbody>
//               {groupTours.length > 0 ? (
//                 groupTours.map((tour, idx) => (
//                   <tr
//                     key={tour._id}
//                     className="bg-white border-b hover:bg-gray-50"
//                   >
//                     <td className="px-6 py-4 font-semibold">
//                       {(page - 1) * 3 + idx + 1}
//                     </td>
//                     <td className="px-6 py-4 font-semibold">{tour.tourName}</td>
//                     <td className="px-6 py-4 font-semibold">
//                       {tour.articleNumber}
//                     </td>
//                     <td className="px-6 py-4 font-semibold">{tour.category}</td>
//                     <td className="px-6 py-4 font-semibold">
//                       {tour.startDate
//                         ? new Date(tour.startDate).toLocaleDateString("en-GB")
//                         : "-"}
//                     </td>
//                     <td className="px-6 py-4 text-center font-semibold">
//                       <button
//                         onClick={() => handleEditTour(tour)}
//                         className="text-gray-700 hover:text-gray-700"
//                       >
//                         <Pencil className="w-4 h-4" />
//                       </button>
//                     </td>
//                     <td className="px-6 py-4 text-center font-semibold">
//                       <button
//                         title="Booking Order"
//                         className="text-purple-600 hover:text-purple-800"
//                         onClick={() => handleBookingOrder(tour)}
//                       >
//                         <ReceiptText className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center py-4 text-gray-400">
//                     No tours found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="flex justify-center mt-6 space-x-2">
//           <button
//             onClick={() => setPage((p) => Math.max(p - 1, 1))}
//             disabled={page === 1}
//             className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
//           >
//             Previous
//           </button>
//           <span className="px-3 py-1">{page}</span>
//           <button
//             onClick={() => setPage((p) => p + 1)}
//             disabled={page >= totalPages}
//             className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default CreateGroupTour;








// src/pages/purchaser/CreateGroupTour.jsx

// import React, { useEffect, useMemo, useState } from "react";
// import API from "../../api";
// import Select from "react-select";
// import { Pencil, Plus, X } from "lucide-react";
// import { ReceiptText } from "lucide-react";
// import { toast } from "react-toastify";

// const PURPLE = "#8570EE";

// // ---- builders ----
// const emptySegment = () => ({
//   country: "",
//   state: "",
//   destination: "",
//   trip: "",
//   selectedAddon: "",
//   selectedActivity: "",
//   // per-segment dependent options
//   states: [],
//   destinations: [],
//   trips: [],
//   addonTrips: [],
//   activities: [],
// });

// const emptyDay = () => ({
//   expanded: true, // open by default so users can work immediately
//   date: "",
//   segments: [emptySegment()],
// });

// const CreateGroupTour = () => {
//   // ---------- react-select styles ----------
//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         borderRadius: 12,
//         borderColor: state.isFocused ? PURPLE : "#e5e7eb",
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

//   // ---------- top-level lists ----------
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]); // for top-level state select
//   const [destinations, setDestinations] = useState([]); // top-level

//   // ---------- lists for table view ----------
//   const [groupTours, setGroupTours] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // ---------- editing ----------
//   const [currentlyEditingTourId, setCurrentlyEditingTourId] = useState(null);

//   // ---------- main form ----------
//   const [formData, setFormData] = useState({
//     country: "",
//     state: "",
//     destination: "",
//     tourName: "",
//     articleNumber: "",
//     category: "",
//     pickupPoint: "",
//     dropOffPoint: "",
//     totalDays: "",
//     totalNights: "",
//     startDate: "",
//     netCost: "",
//     pricePerPax: "",
//     totalPax: "",
//     riskAmount: "",
//   });

//   // ---------- tags ----------
//   const [includes, setIncludes] = useState([]);
//   const [excludes, setExcludes] = useState([]);

//   // ---------- days with multiple segments ----------
//   const [days, setDays] = useState([]);

//   // ---------- fetch list + search ----------
//   const fetchGroupTours = async () => {
//     try {
//       const res = await API.get("/purchaser/groupTours", {
//         params: { page, limit: 3, search },
//       });
//       setGroupTours(res.data.tours || []);
//       setTotalPages(res.data.totalPages || 1);
//     } catch {
//       toast.error("Failed to fetch group tours.");
//     }
//   };
//   useEffect(() => {
//     fetchGroupTours();
//   }, [search, page]);

//   // ---------- countries (once) ----------
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await API.get("/purchaser/countries");
//         setCountries(res.data || []);
//       } catch {
//         toast.error("Error fetching countries");
//       }
//     })();
//   }, []);

//   // ---------- top-level dependent: states ----------
//   useEffect(() => {
//     if (!formData.country || currentlyEditingTourId) return;
//     setStates([]);
//     setDestinations([]);
//     setFormData((p) => ({ ...p, state: "", destination: "" }));
//     (async () => {
//       try {
//         const res = await API.get(`/purchaser/states/${formData.country}`);
//         setStates(res.data || []);
//       } catch {
//         toast.error("Error fetching states");
//       }
//     })();
//   }, [formData.country, currentlyEditingTourId]);

//   // ---------- top-level dependent: destinations ----------
//   useEffect(() => {
//     if (!formData.country || !formData.state || currentlyEditingTourId) return;
//     setDestinations([]);
//     setFormData((p) => ({ ...p, destination: "" }));
//     (async () => {
//       try {
//         const res = await API.get(
//           `/purchaser/destinationsByCountryAndState/${formData.country}/${formData.state}`
//         );
//         setDestinations(res.data || []);
//       } catch {
//         toast.error("Error fetching destinations");
//       }
//     })();
//   }, [formData.state, formData.country, currentlyEditingTourId]);

//   // ---------- keep days length in sync with totalDays ----------
//   useEffect(() => {
//     const total = parseInt(formData.totalDays, 10);
//     if (!formData.totalDays || isNaN(total) || total <= 0) return;

//     setDays((prev) => {
//       const out = [...prev];
//       while (out.length < total) out.push(emptyDay());
//       if (out.length > total) out.splice(total);

//       // compute date per day when startDate is available
//       if (formData.startDate) {
//         const base = new Date(formData.startDate);
//         for (let i = 0; i < out.length; i++) {
//           const d = new Date(base);
//           d.setDate(base.getDate() + i);
//           out[i].date = d.toISOString().slice(0, 10);
//         }
//       }
//       return out;
//     });
//   }, [formData.totalDays, formData.startDate]);

//   // ---------- helpers for react-select options ----------
//   const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
//   const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
//   const destinationOptions = destinations.map((d) => ({
//     value: d._id,
//     label: d.name,
//   }));

//   const toOptions = (arr = [], labelKey = "name") =>
//     arr.map((i) => ({ value: i._id, label: i[labelKey] }));

//   // ---------- tag helpers ----------
//   const handleAddItem = (val, setList, list, inputId) => {
//     if (val && !list.includes(val)) {
//       setList([...list, val]);
//       const el = document.getElementById(inputId);
//       if (el) el.value = "";
//     }
//   };
//   const handleRemoveItem = (idx, setList, list) => {
//     const copy = [...list];
//     copy.splice(idx, 1);
//     setList(copy);
//   };

//   // ---------- day expand/remove ----------
//   const toggleDayExpand = (i) => {
//     setDays((prev) =>
//       prev.map((d, idx) => (idx === i ? { ...d, expanded: !d.expanded } : d))
//     );
//   };

//   const handleRemoveDay = (i) => {
//     setDays((prev) => {
//       const copy = [...prev];
//       copy.splice(i, 1);
//       return copy;
//     });
//     setFormData((p) => ({
//       ...p,
//       totalDays: String(Math.max(1, parseInt(p.totalDays || "1", 10) - 1)),
//     }));
//   };

//   // ---------- segment ops ----------
//   const addSegment = (dayIndex) => {
//     setDays((prev) => {
//       const copy = [...prev];
//       copy[dayIndex] = {
//         ...copy[dayIndex],
//         segments: [...copy[dayIndex].segments, emptySegment()],
//       };
//       return copy;
//     });
//   };

//   const removeSegment = (dayIndex, segIndex) => {
//     setDays((prev) => {
//       const copy = [...prev];
//       const segs = [...copy[dayIndex].segments];
//       segs.splice(segIndex, 1);
//       if (segs.length === 0) segs.push(emptySegment());
//       copy[dayIndex] = { ...copy[dayIndex], segments: segs };
//       return copy;
//     });
//   };

//   // ---------- update a segment field (with safe, non-stale dependent fetches) ----------
//   const updateSegmentField = async (dayIndex, segIndex, field, value) => {
//     // snapshot current segment to compute dependent fetch params
//     const currentSeg = days?.[dayIndex]?.segments?.[segIndex] || {};
//     const nextCountry =
//       field === "country" ? value : currentSeg.country || "";
//     const nextState = field === "state" ? value : currentSeg.state || "";
//     const nextDestination =
//       field === "destination" ? value : currentSeg.destination || "";
//     const nextTrip = field === "trip" ? value : currentSeg.trip || "";

//     // 1) update local state immediately (immutably), clearing deeper deps
//     setDays((prev) => {
//       const d = [...prev];
//       const seg = { ...d[dayIndex].segments[segIndex] };
//       seg[field] = value;

//       if (field === "country") {
//         seg.state = "";
//         seg.destination = "";
//         seg.trip = "";
//         seg.selectedAddon = "";
//         seg.selectedActivity = "";
//         seg.states = [];
//         seg.destinations = [];
//         seg.trips = [];
//         seg.addonTrips = [];
//         seg.activities = [];
//       }
//       if (field === "state") {
//         seg.destination = "";
//         seg.trip = "";
//         seg.selectedAddon = "";
//         seg.selectedActivity = "";
//         seg.destinations = [];
//         seg.trips = [];
//         seg.addonTrips = [];
//         seg.activities = [];
//       }
//       if (field === "destination") {
//         seg.trip = "";
//         seg.selectedAddon = "";
//         seg.selectedActivity = "";
//         seg.trips = [];
//         seg.addonTrips = [];
//         seg.activities = [];
//       }
//       if (field === "trip") {
//         seg.selectedAddon = "";
//         seg.selectedActivity = "";
//         seg.addonTrips = [];
//         seg.activities = [];
//       }

//       const newSegments = [...d[dayIndex].segments];
//       newSegments[segIndex] = seg;
//       d[dayIndex] = { ...d[dayIndex], segments: newSegments };
//       return d;
//     });

//     // 2) run dependent fetch based on "next" IDs computed above
//     try {
//       if (field === "country" && nextCountry) {
//         const res = await API.get(`/purchaser/states/${nextCountry}`);
//         setDays((prev) => {
//           const d = [...prev];
//           d[dayIndex].segments[segIndex].states = res.data || [];
//           return d;
//         });
//       }

//       if (field === "state" && nextCountry && nextState) {
//         const res = await API.get(
//           `/purchaser/destinationsByCountryAndState/${nextCountry}/${nextState}`
//         );
//         setDays((prev) => {
//           const d = [...prev];
//           d[dayIndex].segments[segIndex].destinations = res.data || [];
//           return d;
//         });
//       }

//       if (
//         field === "destination" &&
//         nextCountry &&
//         nextState &&
//         nextDestination
//       ) {
//         const res = await API.get(
//           `/purchaser/tripsByLocation/${nextCountry}/${nextState}/${nextDestination}`
//         );
//         setDays((prev) => {
//           const d = [...prev];
//           d[dayIndex].segments[segIndex].trips = res.data || [];
//           return d;
//         });
//       }

//       if (field === "trip" && nextTrip) {
//         const res = await API.get(`/purchaser/tripDetails/${nextTrip}`);
//         setDays((prev) => {
//           const d = [...prev];
//           d[dayIndex].segments[segIndex].addonTrips = res.data.addonTrips || [];
//           d[dayIndex].segments[segIndex].activities = res.data.activities || [];
//           return d;
//         });
//       }
//     } catch (err) {
//       console.error("Dropdown fetch failed", err);
//       toast.error("Dropdown fetch failed");
//     }
//   };

//   // ---------- clear a selection inside a segment (trip/addon/activity) ----------
//   const clearSegmentTarget = (dayIndex, segIndex, key) => {
//     setDays((prev) => {
//       const d = [...prev];
//       const seg = { ...d[dayIndex].segments[segIndex] };
//       seg[key] = "";
//       if (key === "trip") {
//         seg.selectedAddon = "";
//         seg.selectedActivity = "";
//         seg.addonTrips = [];
//         seg.activities = [];
//       }
//       d[dayIndex].segments[segIndex] = seg;
//       return d;
//     });
//   };

//   // ---------- EDIT ----------
//   const handleEditTour = async (tour) => {
//     try {
//       setCurrentlyEditingTourId(tour._id);

//       // top-level
//       setFormData({
//         country: tour.country || "",
//         state: "", // fill after fetch
//         destination: "", // fill after fetch
//         tourName: tour.tourName || "",
//         articleNumber: tour.articleNumber || "",
//         category: tour.category || "",
//         pickupPoint: tour.pickupPoint || "",
//         dropOffPoint: tour.dropOffPoint || "",
//         totalDays: String(tour.totalDays || 1),
//         totalNights: String(tour.totalNights || ""),
//         startDate: tour.startDate ? tour.startDate.slice(0, 10) : "",
//         netCost: String(tour.netCost || ""),
//         pricePerPax: String(tour.pricePerPax || ""),
//         totalPax: String(tour.totalPax || ""),
//         riskAmount: String(tour.riskAmount || ""),
//       });
//       setIncludes(tour.includes || []);
//       setExcludes(tour.excludes || []);

//       // fetch states for top-level
//       if (tour.country) {
//         const resStates = await API.get(`/purchaser/states/${tour.country}`);
//         setStates(resStates.data || []);
//       }
//       setFormData((p) => ({ ...p, state: tour.state || "" }));

//       // fetch destinations for top-level
//       if (tour.country && tour.state) {
//         const resDest = await API.get(
//           `/purchaser/destinationsByCountryAndState/${tour.country}/${tour.state}`
//         );
//         setDestinations(resDest.data || []);
//       }
//       setFormData((p) => ({ ...p, destination: tour.destination || "" }));

//       // days/segments
//       const builtDays = await Promise.all(
//         (tour.days || []).map(async (day) => {
//           const dateValue = day.date ? day.date.slice(0, 10) : "";

//           // If your backend still stores old shape (no segments), adapt here:
//           const rawSegments =
//             Array.isArray(day.segments) && day.segments.length
//               ? day.segments
//               : [
//                   {
//                     country: day.country,
//                     state: day.state,
//                     destination: day.destination,
//                     trip: day.trip,
//                     selectedAddon: day.selectedAddon,
//                     selectedActivity: day.selectedActivity,
//                   },
//                 ];

//           const segments = await Promise.all(
//             rawSegments.map(async (seg) => {
//               const segment = {
//                 country: seg.country || "",
//                 state: seg.state || "",
//                 destination: seg.destination || "",
//                 trip: seg.trip || "",
//                 selectedAddon: seg.selectedAddon || "",
//                 selectedActivity: seg.selectedActivity || "",
//                 states: [],
//                 destinations: [],
//                 trips: [],
//                 addonTrips: [],
//                 activities: [],
//               };
//               try {
//                 if (segment.country) {
//                   const rs = await API.get(`/purchaser/states/${segment.country}`);
//                   segment.states = rs.data || [];
//                 }
//                 if (segment.country && segment.state) {
//                   const rd = await API.get(
//                     `/purchaser/destinationsByCountryAndState/${segment.country}/${segment.state}`
//                   );
//                   segment.destinations = rd.data || [];
//                 }
//                 if (segment.country && segment.state && segment.destination) {
//                   const rt = await API.get(
//                     `/purchaser/tripsByLocation/${segment.country}/${segment.state}/${segment.destination}`
//                   );
//                   segment.trips = rt.data || [];
//                 }
//                 if (segment.trip) {
//                   const rdet = await API.get(`/purchaser/tripDetails/${segment.trip}`);
//                   segment.addonTrips = rdet.data.addonTrips || [];
//                   segment.activities = rdet.data.activities || [];
//                 }
//               } catch (e) {
//                 console.error("Segment prefill failed", e);
//               }
//               return segment;
//             })
//           );
//           return {
//             expanded: true,
//             date: dateValue,
//             segments: segments.length ? segments : [emptySegment()],
//           };
//         })
//       );

//       setDays(builtDays);
//     } catch (err) {
//       console.error("Failed to prepare edit form.", err);
//       toast.error("Failed to prepare edit form.");
//     }
//   };

//   // ---------- SUBMIT ----------
//   const handleCreateGroupTour = async () => {
//     try {
//       const required = {
//         country: "Country is required",
//         state: "State is required",
//         destination: "Destination is required",
//         tourName: "Tour Name is required",
//         articleNumber: "Article Number is required",
//         category: "Category is required",
//         pickupPoint: "Pickup Point is required",
//         dropOffPoint: "Drop-off Point is required",
//         totalDays: "Total Days is required",
//         totalNights: "Total Nights is required",
//         startDate: "Start Date is required",
//         pricePerPax: "Price per Pax is required",
//         totalPax: "Total Pax is required",
//       };

//       for (const [k, msg] of Object.entries(required)) {
//         if (!String(formData[k] || "").trim()) {
//           toast.error(msg);
//           return;
//         }
//       }
//       if (!includes.length) return toast.error("At least one Include is required.");
//       if (!excludes.length) return toast.error("At least one Exclude is required.");
//       if (!days.length) return toast.error("At least one day is required.");
//       if (days.length !== Number(formData.totalDays)) {
//         return toast.error(`You must provide exactly ${formData.totalDays} day(s) of details.`);
//       }
//       if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
//         return toast.error("Total Nights should be exactly one less than Total Days.");
//       }

//       // validate segments
//       for (let i = 0; i < days.length; i++) {
//         const segs = days[i].segments;
//         if (!Array.isArray(segs) || segs.length === 0) {
//           return toast.error(`Day ${i + 1}: add at least one segment`);
//         }
//         for (let j = 0; j < segs.length; j++) {
//           const s = segs[j];
//           if (!s.country || !s.state || !s.destination || !s.trip) {
//             return toast.error(
//               `Day ${i + 1}, Segment ${j + 1}: Country, State, Destination and Trip are required`
//             );
//           }
//         }
//       }

//       const payload = {
//         ...formData,
//         includes,
//         excludes,
//         days: days.map((d) => ({
//           // backend will re-derive dayLabel/date from startDate + index
//           segments: d.segments.map((s) => ({
//             country: s.country || undefined,
//             state: s.state || undefined,
//             destination: s.destination || undefined,
//             trip: s.trip || undefined,
//             selectedAddon: s.selectedAddon || undefined,
//             selectedActivity: s.selectedActivity || undefined,
//           })),
//         })),
//       };

//       if (currentlyEditingTourId) {
//         await API.put(`/purchaser/updateGroupTour/${currentlyEditingTourId}`, payload);
//         toast.success("Group tour updated successfully!");
//         setCurrentlyEditingTourId(null);
//       } else {
//         await API.post("/purchaser/createGroupTour", payload);
//         toast.success("Group tour created successfully!");
//       }

//       // Reset after success
//       setFormData({
//         country: "",
//         state: "",
//         destination: "",
//         tourName: "",
//         articleNumber: "",
//         category: "",
//         pickupPoint: "",
//         dropOffPoint: "",
//         totalDays: "",
//         totalNights: "",
//         startDate: "",
//         netCost: "",
//         pricePerPax: "",
//         totalPax: "",
//         riskAmount: "",
//       });
//       setIncludes([]);
//       setExcludes([]);
//       setDays([]);
//       setStates([]);
//       setDestinations([]);
//       await fetchGroupTours();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save group tour.");
//     }
//   };

//   return (
//     <div className="p-8 space-y-8 max-w-[100rem] mx-auto text-base font-sans bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-2xl">
//       {/* Top-level filters with react-select */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {/* Country */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Country
//           </label>
//           <Select
//             styles={selectStyles}
//             options={countryOptions}
//             isClearable
//             isDisabled={!!currentlyEditingTourId}
//             placeholder="Select Country"
//             value={countryOptions.find((o) => o.value === formData.country) || null}
//             onChange={(opt) =>
//               setFormData((p) => ({ ...p, country: opt?.value || "" }))
//             }
//           />
//         </div>

//         {/* State */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             State
//           </label>
//           <Select
//             styles={selectStyles}
//             options={stateOptions}
//             isClearable
//             isDisabled={!!currentlyEditingTourId || !formData.country}
//             placeholder="Select State"
//             value={stateOptions.find((o) => o.value === formData.state) || null}
//             onChange={(opt) =>
//               setFormData((p) => ({ ...p, state: opt?.value || "" }))
//             }
//           />
//         </div>

//         {/* Destination */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Destination
//           </label>
//           <Select
//             styles={selectStyles}
//             options={destinationOptions}
//             isClearable
//             isDisabled={!!currentlyEditingTourId || !formData.state}
//             placeholder="Select Destination"
//             value={
//               destinationOptions.find((o) => o.value === formData.destination) ||
//               null
//             }
//             onChange={(opt) =>
//               setFormData((p) => ({ ...p, destination: opt?.value || "" }))
//             }
//           />
//         </div>

//         {/* Tour Name */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Tour Name
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             disabled={!!currentlyEditingTourId}
//             placeholder="Tour Name"
//             value={formData.tourName}
//             onChange={(e) =>
//               setFormData((p) => ({
//                 ...p,
//                 tourName: e.target.value.toUpperCase(),
//               }))
//             }
//           />
//         </div>

//         {/* Article Number */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Article Number
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             disabled={!!currentlyEditingTourId}
//             placeholder="Article Number"
//             value={formData.articleNumber}
//             onChange={(e) =>
//               setFormData((p) => ({
//                 ...p,
//                 articleNumber: e.target.value.toUpperCase(),
//               }))
//             }
//           />
//         </div>

//         {/* Category */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Category
//           </label>
//           <Select
//             styles={selectStyles}
//             isClearable
//             isDisabled={!!currentlyEditingTourId}
//             placeholder="Select Category"
//             options={[
//               { value: "Standard", label: "Standard" },
//               { value: "Delux", label: "Delux" },
//               { value: "Premium", label: "Premium" },
//             ]}
//             value={
//               formData.category
//                 ? { value: formData.category, label: formData.category }
//                 : null
//             }
//             onChange={(opt) =>
//               setFormData((p) => ({ ...p, category: opt?.value || "" }))
//             }
//           />
//         </div>

//         {/* Pickup / Drop */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Pickup Point
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Enter Pickup Point"
//             value={formData.pickupPoint}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, pickupPoint: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Drop Off Point
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Enter Drop Off Point"
//             value={formData.dropOffPoint}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, dropOffPoint: e.target.value }))
//             }
//           />
//         </div>

//         {/* Days / Nights / Start */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Days
//           </label>
//           <input
//             type="number"
//             min={1}
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             value={formData.totalDays}
//             onChange={(e) => {
//               const val = Math.max(1, parseInt(e.target.value || "1", 10));
//               setFormData((p) => ({ ...p, totalDays: String(val) }));
//             }}
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Nights
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Enter Total Nights"
//             value={formData.totalNights}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, totalNights: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Start Date
//           </label>
//           <input
//             type="date"
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             value={formData.startDate}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, startDate: e.target.value }))
//             }
//           />
//         </div>

//         {/* Pricing meta */}
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Net Cost
//           </label>
//           <input
//             readOnly
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Net Cost"
//             value={formData.netCost}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, netCost: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Price Per Pax
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Price per Pax"
//             value={formData.pricePerPax}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, pricePerPax: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Total Pax
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Total Pax"
//             value={formData.totalPax}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, totalPax: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium text-gray-700 mb-1 block">
//             Risk Amount
//           </label>
//           <input
//             className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
//             placeholder="Risk Amount"
//             value={formData.riskAmount}
//             onChange={(e) =>
//               setFormData((p) => ({ ...p, riskAmount: e.target.value }))
//             }
//           />
//         </div>
//       </div>

//       {/* Includes / Excludes */}
//       <div className="flex w-full gap-3">
//         <div className="w-1/2 flex items-center gap-3">
//           <input
//             id="includeInput"
//             className="border border-gray-300 p-3 w-full rounded-xl"
//             placeholder="Add to Includes"
//           />
//           <button
//             onClick={() =>
//               handleAddItem(
//                 document.getElementById("includeInput").value,
//                 setIncludes,
//                 includes,
//                 "includeInput"
//               )
//             }
//             className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
//           >
//             +
//           </button>
//         </div>
//         <div className="w-1/2 flex items-center gap-3">
//           <input
//             id="excludeInput"
//             className="border border-gray-300 p-3 w-full rounded-xl"
//             placeholder="Add to Excludes"
//           />
//           <button
//             onClick={() =>
//               handleAddItem(
//                 document.getElementById("excludeInput").value,
//                 setExcludes,
//                 excludes,
//                 "excludeInput"
//               )
//             }
//             className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
//           >
//             +
//           </button>
//         </div>
//       </div>

//       <div className="space-y-3">
//         <h2 className="font-semibold text-gray-700">Includes</h2>
//         <div className="flex flex-wrap gap-3">
//           {includes.map((tag, i) => (
//             <span
//               key={i}
//               className="bg-white text-black px-4 py-1 rounded-full flex items-center gap-2 shadow border"
//             >
//               {tag}
//               <button
//                 onClick={() => handleRemoveItem(i, setIncludes, includes)}
//                 className="text-black hover:text-red-500 font-bold"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-3">
//         <h2 className="font-semibold text-gray-700">Excludes</h2>
//         <div className="flex flex-wrap gap-3">
//           {excludes.map((tag, i) => (
//             <span
//               key={i}
//               className="bg-white text-black px-4 py-1 rounded-full flex items-center gap-2 shadow border"
//             >
//               {tag}
//               <button
//                 onClick={() => handleRemoveItem(i, setExcludes, excludes)}
//                 className="text-black hover:text-red-500 font-bold"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* DAYS with multiple SEGMENTS */}
//       {days.map((day, i) => (
//         <div
//           key={i}
//           className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between mb-3">
//             <div
//               className="flex items-center gap-2 cursor-pointer"
//               onClick={() => toggleDayExpand(i)}
//             >
//               <span className="text-lg font-bold text-gray-500">
//                 {day.expanded ? "▾" : "▸"}
//               </span>
//               <h3 className="text-xl font-semibold text-gray-800">
//                 Day {i + 1}
//               </h3>
//               {day.date && (
//                 <span className="ml-2 text-gray-500 text-sm">({day.date})</span>
//               )}
//             </div>
//             <button
//               onClick={() => handleRemoveDay(i)}
//               className="text-gray-300 hover:text-red-400 font-bold text-xl"
//             >
//               ×
//             </button>
//           </div>

//           {day.expanded && (
//             <div className="space-y-4">
//               {day.segments.map((seg, j) => {
//                 const countryOpts = countryOptions;
//                 const stateOpts = toOptions(seg.states);
//                 const destOpts = toOptions(seg.destinations);
//                 const tripOpts = toOptions(seg.trips, "tripName");
//                 const addonOpts = toOptions(seg.addonTrips, "tripName");
//                 const actOpts = toOptions(seg.activities, "activityName");

//                 return (
//                   <div
//                     key={j}
//                     className="border border-gray-200 rounded-xl p-4 space-y-3"
//                   >
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-semibold text-gray-600">
//                         Segment {j + 1}
//                       </span>
//                       <div className="flex items-center gap-2">
//                         {j === 0 ? (
//                           <button
//                             onClick={() => addSegment(i)}
//                             className="w-8 h-8 rounded-full bg-[#8570EE] text-white flex items-center justify-center"
//                           >
//                             <Plus size={16} />
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => removeSegment(i, j)}
//                             className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"
//                           >
//                             <X size={16} />
//                           </button>
//                         )}
//                       </div>
//                     </div>

//                     {/* Country / State / Destination */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                       <Select
//                         styles={selectStyles}
//                         options={countryOpts}
//                         isClearable
//                         placeholder="Country"
//                         value={
//                           countryOpts.find((o) => o.value === seg.country) ||
//                           null
//                         }
//                         onChange={(opt) =>
//                           updateSegmentField(
//                             i,
//                             j,
//                             "country",
//                             opt?.value || ""
//                           )
//                         }
//                       />
//                       <Select
//                         styles={selectStyles}
//                         options={stateOpts}
//                         isClearable
//                         isDisabled={!seg.country}
//                         placeholder="State"
//                         value={
//                           stateOpts.find((o) => o.value === seg.state) || null
//                         }
//                         onChange={(opt) =>
//                           updateSegmentField(i, j, "state", opt?.value || "")
//                         }
//                       />
//                       <Select
//                         styles={selectStyles}
//                         options={destOpts}
//                         isClearable
//                         isDisabled={!seg.state}
//                         placeholder="Destination"
//                         value={
//                           destOpts.find((o) => o.value === seg.destination) ||
//                           null
//                         }
//                         onChange={(opt) =>
//                           updateSegmentField(
//                             i,
//                             j,
//                             "destination",
//                             opt?.value || ""
//                           )
//                         }
//                       />
//                     </div>

//                     {/* Trip + clear */}
//                     <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                       <Select
//                         styles={selectStyles}
//                         options={tripOpts}
//                         isClearable
//                         isDisabled={!seg.destination}
//                         placeholder="Trip"
//                         value={tripOpts.find((o) => o.value === seg.trip) || null}
//                         onChange={(opt) =>
//                           updateSegmentField(i, j, "trip", opt?.value || "")
//                         }
//                       />
//                       <button
//                         onClick={() => clearSegmentTarget(i, j, "trip")}
//                         className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
//                       >
//                         Clear
//                       </button>
//                     </div>

//                     {/* Addon Trip + clear */}
//                     <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                       <Select
//                         styles={selectStyles}
//                         options={addonOpts}
//                         isClearable
//                         isDisabled={!seg.trip}
//                         placeholder="Add-on Trip"
//                         value={
//                           addonOpts.find(
//                             (o) => o.value === seg.selectedAddon
//                           ) || null
//                         }
//                         onChange={(opt) =>
//                           updateSegmentField(
//                             i,
//                             j,
//                             "selectedAddon",
//                             opt?.value || ""
//                           )
//                         }
//                       />
//                       <button
//                         onClick={() => clearSegmentTarget(i, j, "selectedAddon")}
//                         className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
//                       >
//                         Clear
//                       </button>
//                     </div>

//                     {/* Activity + clear */}
//                     <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
//                       <Select
//                         styles={selectStyles}
//                         options={actOpts}
//                         isClearable
//                         isDisabled={!seg.trip}
//                         placeholder="Activity"
//                         value={
//                           actOpts.find(
//                             (o) => o.value === seg.selectedActivity
//                           ) || null
//                         }
//                         onChange={(opt) =>
//                           updateSegmentField(
//                             i,
//                             j,
//                             "selectedActivity",
//                             opt?.value || ""
//                           )
//                         }
//                       />
//                       <button
//                         onClick={() =>
//                           clearSegmentTarget(i, j, "selectedActivity")
//                         }
//                         className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
//                       >
//                         Clear
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       ))}

//       <button
//         onClick={handleCreateGroupTour}
//         className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
//       >
//         {currentlyEditingTourId ? "Update Group Tour" : "Create Group Tour"}
//       </button>

//       {/* Table */}
//       <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
//         <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
//           View Group Tour
//         </h5>
//         <p className="block mb-6 text-sm font-light text-gray-400">
//           Search and Edit Group Tour
//         </p>
//         <div className="mb-4">
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//             placeholder="Search by Group Tour Name..."
//             className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
//           />
//         </div>
//         <div className="overflow-x-auto ">
//           <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
//             <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//               <tr>
//                 <th className="px-6 py-4">Sl No</th>
//                 <th className="px-6 py-4">TOUR NAME</th>
//                 <th className="px-6 py-4">ARTICLE NUMBER</th>
//                 <th className="px-6 py-4">CATEGORY</th>
//                 <th className="px-6 py-4">START DATE</th>
//                 <th className="px-6 py-4 text-center">EDIT</th>
//                 <th className="px-6 py-4 text-center">Bo</th>
//               </tr>
//             </thead>
//             <tbody>
//               {groupTours.length > 0 ? (
//                 groupTours.map((tour, idx) => (
//                   <tr
//                     key={tour._id}
//                     className="bg-white border-b hover:bg-gray-50"
//                   >
//                     <td className="px-6 py-4 font-semibold">
//                       {(page - 1) * 3 + idx + 1}
//                     </td>
//                     <td className="px-6 py-4 font-semibold">{tour.tourName}</td>
//                     <td className="px-6 py-4 font-semibold">
//                       {tour.articleNumber}
//                     </td>
//                     <td className="px-6 py-4 font-semibold">{tour.category}</td>
//                     <td className="px-6 py-4 font-semibold">
//                       {tour.startDate
//                         ? new Date(tour.startDate).toLocaleDateString("en-GB")
//                         : "-"}
//                     </td>
//                     <td className="px-6 py-4 text-center font-semibold">
//                       <button
//                         onClick={() => handleEditTour(tour)}
//                         className="text-gray-700 hover:text-gray-700"
//                       >
//                         <Pencil className="w-4 h-4" />
//                       </button>
//                     </td>
//                     <td className="px-6 py-4 text-center font-semibold">
//                       <button
//                         title="Booking Order"
//                         className="text-purple-600 hover:text-purple-800"
//                         onClick={() => {
//                           /* your handleBookingOrder(tour) here */
//                         }}
//                       >
//                         <ReceiptText className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center py-4 text-gray-400">
//                     No tours found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="flex justify-center mt-6 space-x-2">
//           <button
//             onClick={() => setPage((p) => Math.max(p - 1, 1))}
//             disabled={page === 1}
//             className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
//           >
//             Previous
//           </button>
//           <span className="px-3 py-1">{page}</span>
//           <button
//             onClick={() => setPage((p) => p + 1)}
//             disabled={page >= totalPages}
//             className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateGroupTour;


import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import { Pencil, Plus, X } from "lucide-react";
import { ReceiptText } from "lucide-react";
import { toast } from "react-toastify";

const PURPLE = "#8570EE";

// ---- builders ----
const emptySegment = () => ({
  country: "",
  state: "",
  destination: "",
  trip: "",
  selectedAddon: "",
  // CHANGED: multiple activities
  selectedActivities: [],
  // per-segment dependent options
  states: [],
  destinations: [],
  trips: [],
  addonTrips: [],
  activities: [],
});

const emptyDay = () => ({
  // CHANGED: start collapsed
  expanded: false,
  date: "",
  segments: [emptySegment()],
});

const CreateGroupTour = () => {
  // ---------- react-select styles ----------
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? PURPLE : "#e5e7eb",
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

  // ---------- top-level lists ----------
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]); // for top-level state select
  const [destinations, setDestinations] = useState([]); // top-level

  // ---------- lists for table view ----------
  const [groupTours, setGroupTours] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ---------- editing ----------
  const [currentlyEditingTourId, setCurrentlyEditingTourId] = useState(null);

  // ---------- main form ----------
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    tourName: "",
    articleNumber: "",
    category: "",
    pickupPoint: "",
    dropOffPoint: "",
    totalDays: "",
    totalNights: "",
    startDate: "",
    netCost: "",
    pricePerPax: "",
    totalPax: "",
    riskAmount: "",
  });

  // ---------- tags ----------
  const [includes, setIncludes] = useState([]);
  const [excludes, setExcludes] = useState([]);

  // ---------- days with multiple segments ----------
  const [days, setDays] = useState([]);

  // ---------- fetch list + search ----------
  const fetchGroupTours = async () => {
    try {
      const res = await API.get("/purchaser/groupTours", {
        params: { page, limit: 3, search },
      });
      setGroupTours(res.data.tours || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to fetch group tours.");
    }
  };
  useEffect(() => {
    fetchGroupTours();
  }, [search, page]);

  // ---------- countries (once) ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data || []);
      } catch {
        toast.error("Error fetching countries");
      }
    })();
  }, []);

  // ---------- top-level dependent: states ----------
  useEffect(() => {
    if (!formData.country || currentlyEditingTourId) return;
    setStates([]);
    setDestinations([]);
    setFormData((p) => ({ ...p, state: "", destination: "" }));
    (async () => {
      try {
        const res = await API.get(`/purchaser/states/${formData.country}`);
        setStates(res.data || []);
      } catch {
        toast.error("Error fetching states");
      }
    })();
  }, [formData.country, currentlyEditingTourId]);

  // ---------- top-level dependent: destinations ----------
  useEffect(() => {
    if (!formData.country || !formData.state || currentlyEditingTourId) return;
    setDestinations([]);
    setFormData((p) => ({ ...p, destination: "" }));
    (async () => {
      try {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${formData.country}/${formData.state}`
        );
        setDestinations(res.data || []);
      } catch {
        toast.error("Error fetching destinations");
      }
    })();
  }, [formData.state, formData.country, currentlyEditingTourId]);

  // ---------- keep days length in sync with totalDays ----------
  useEffect(() => {
    const total = parseInt(formData.totalDays, 10);
    if (!formData.totalDays || isNaN(total) || total <= 0) return;

    setDays((prev) => {
      const out = [...prev];
      while (out.length < total) out.push(emptyDay());
      if (out.length > total) out.splice(total);

      // compute date per day when startDate is available
      if (formData.startDate) {
        const base = new Date(formData.startDate);
        for (let i = 0; i < out.length; i++) {
          const d = new Date(base);
          d.setDate(base.getDate() + i);
          out[i].date = d.toISOString().slice(0, 10);
        }
      }
      return out;
    });
  }, [formData.totalDays, formData.startDate]);

  // ---------- helpers for react-select options ----------
  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  const destinationOptions = destinations.map((d) => ({
    value: d._id,
    label: d.name,
  }));

  const toOptions = (arr = [], labelKey = "name") =>
    arr.map((i) => ({ value: i._id, label: i[labelKey] }));

  // ---------- tag helpers ----------
  const handleAddItem = (val, setList, list, inputId) => {
    if (val && !list.includes(val)) {
      setList([...list, val]);
      const el = document.getElementById(inputId);
      if (el) el.value = "";
    }
  };
  const handleRemoveItem = (idx, setList, list) => {
    const copy = [...list];
    copy.splice(idx, 1);
    setList(copy);
  };

  // ---------- day expand/remove ----------
  const toggleDayExpand = (i) => {
    setDays((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, expanded: !d.expanded } : d))
    );
  };

  const handleRemoveDay = (i) => {
    setDays((prev) => {
      const copy = [...prev];
      copy.splice(i, 1);
      return copy;
    });
    setFormData((p) => ({
      ...p,
      totalDays: String(Math.max(1, parseInt(p.totalDays || "1", 10) - 1)),
    }));
  };

  // ---------- segment ops ----------
  const addSegment = (dayIndex) => {
    setDays((prev) => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        segments: [...copy[dayIndex].segments, emptySegment()],
      };
      return copy;
    });
  };

  const removeSegment = (dayIndex, segIndex) => {
    setDays((prev) => {
      const copy = [...prev];
      const segs = [...copy[dayIndex].segments];
      segs.splice(segIndex, 1);
      if (segs.length === 0) segs.push(emptySegment());
      copy[dayIndex] = { ...copy[dayIndex], segments: segs };
      return copy;
    });
  };

  // ---------- update a segment field (safe, non-stale dependent fetches) ----------
  const updateSegmentField = async (dayIndex, segIndex, field, value) => {
    const currentSeg = days?.[dayIndex]?.segments?.[segIndex] || {};
    const nextCountry = field === "country" ? value : currentSeg.country || "";
    const nextState = field === "state" ? value : currentSeg.state || "";
    const nextDestination = field === "destination" ? value : currentSeg.destination || "";
    const nextTrip = field === "trip" ? value : currentSeg.trip || "";

    // 1) update local state immediately (immutably), clearing deeper deps
    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };
      seg[field] = value;

      if (field === "country") {
        seg.state = "";
        seg.destination = "";
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.states = [];
        seg.destinations = [];
        seg.trips = [];
        seg.addonTrips = [];
        seg.activities = [];
      }
      if (field === "state") {
        seg.destination = "";
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.destinations = [];
        seg.trips = [];
        seg.addonTrips = [];
        seg.activities = [];
      }
      if (field === "destination") {
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.trips = [];
        seg.addonTrips = [];
        seg.activities = [];
      }
      if (field === "trip") {
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.addonTrips = [];
        seg.activities = [];
      }

      const newSegments = [...d[dayIndex].segments];
      newSegments[segIndex] = seg;
      d[dayIndex] = { ...d[dayIndex], segments: newSegments };
      return d;
    });

    // 2) run dependent fetch based on "next" IDs computed above
    try {
      if (field === "country" && nextCountry) {
        const res = await API.get(`/purchaser/states/${nextCountry}`);
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].states = res.data || [];
          return d;
        });
      }

      if (field === "state" && nextCountry && nextState) {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${nextCountry}/${nextState}`
        );
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].destinations = res.data || [];
          return d;
        });
      }

      if (field === "destination" && nextCountry && nextState && nextDestination) {
        const res = await API.get(
          `/purchaser/tripsByLocation/${nextCountry}/${nextState}/${nextDestination}`
        );
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].trips = res.data || [];
          return d;
        });
      }

      if (field === "trip" && nextTrip) {
        const res = await API.get(`/purchaser/tripDetails/${nextTrip}`);
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].addonTrips = res.data.addonTrips || [];
          d[dayIndex].segments[segIndex].activities = res.data.activities || [];
          return d;
        });
      }
    } catch (err) {
      console.error("Dropdown fetch failed", err);
      toast.error("Dropdown fetch failed");
    }
  };

  // ---------- clear a selection inside a segment ----------
  const clearSegmentTarget = (dayIndex, segIndex, key) => {
    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };
      if (key === "trip") {
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.addonTrips = [];
        seg.activities = [];
      } else if (key === "selectedAddon") {
        seg.selectedAddon = "";
      } else if (key === "selectedActivities") {
        seg.selectedActivities = [];
      }
      d[dayIndex].segments[segIndex] = seg;
      return d;
    });
  };

  // ---------- EDIT ----------
  const handleEditTour = async (tour) => {
    try {
      setCurrentlyEditingTourId(tour._id);

      // top-level
      setFormData({
        country: tour.country || "",
        state: "", // fill after fetch
        destination: "", // fill after fetch
        tourName: tour.tourName || "",
        articleNumber: tour.articleNumber || "",
        category: tour.category || "",
        pickupPoint: tour.pickupPoint || "",
        dropOffPoint: tour.dropOffPoint || "",
        totalDays: String(tour.totalDays || 1),
        totalNights: String(tour.totalNights || ""),
        startDate: tour.startDate ? tour.startDate.slice(0, 10) : "",
        netCost: String(tour.netCost || ""),
        pricePerPax: String(tour.pricePerPax || ""),
        totalPax: String(tour.totalPax || ""),
        riskAmount: String(tour.riskAmount || ""),
      });
      setIncludes(tour.includes || []);
      setExcludes(tour.excludes || []);

      // fetch states for top-level
      if (tour.country) {
        const resStates = await API.get(`/purchaser/states/${tour.country}`);
        setStates(resStates.data || []);
      }
      setFormData((p) => ({ ...p, state: tour.state || "" }));

      // fetch destinations for top-level
      if (tour.country && tour.state) {
        const resDest = await API.get(
          `/purchaser/destinationsByCountryAndState/${tour.country}/${tour.state}`
        );
        setDestinations(resDest.data || []);
      }
      setFormData((p) => ({ ...p, destination: tour.destination || "" }));

      // days/segments
      const builtDays = await Promise.all(
        (tour.days || []).map(async (day) => {
          const dateValue = day.date ? day.date.slice(0, 10) : "";

          // Backward compatibility (old shape without segments)
          const rawSegments =
            Array.isArray(day.segments) && day.segments.length
              ? day.segments
              : [
                  {
                    country: day.country,
                    state: day.state,
                    destination: day.destination,
                    trip: day.trip,
                    selectedAddon: day.selectedAddon,
                    // if an old record stored single selectedActivity
                    selectedActivities: day.selectedActivity ? [day.selectedActivity] : [],
                  },
                ];

          const segments = await Promise.all(
            rawSegments.map(async (seg) => {
              const segment = {
                country: seg.country || "",
                state: seg.state || "",
                destination: seg.destination || "",
                trip: seg.trip || "",
                selectedAddon: seg.selectedAddon || "",
                // CHANGED: array of activities in state
                selectedActivities: Array.isArray(seg.selectedActivities)
                  ? seg.selectedActivities
                  : [],
                states: [],
                destinations: [],
                trips: [],
                addonTrips: [],
                activities: [],
              };
              try {
                if (segment.country) {
                  const rs = await API.get(`/purchaser/states/${segment.country}`);
                  segment.states = rs.data || [];
                }
                if (segment.country && segment.state) {
                  const rd = await API.get(
                    `/purchaser/destinationsByCountryAndState/${segment.country}/${segment.state}`
                  );
                  segment.destinations = rd.data || [];
                }
                if (segment.country && segment.state && segment.destination) {
                  const rt = await API.get(
                    `/purchaser/tripsByLocation/${segment.country}/${segment.state}/${segment.destination}`
                  );
                  segment.trips = rt.data || [];
                }
                if (segment.trip) {
                  const rdet = await API.get(`/purchaser/tripDetails/${segment.trip}`);
                  segment.addonTrips = rdet.data.addonTrips || [];
                  segment.activities = rdet.data.activities || [];
                }
              } catch (e) {
                console.error("Segment prefill failed", e);
              }
              return segment;
            })
          );
          return {
            // CHANGED: start collapsed in edit too
            expanded: false,
            date: dateValue,
            segments: segments.length ? segments : [emptySegment()],
          };
        })
      );

      setDays(builtDays);
    } catch (err) {
      console.error("Failed to prepare edit form.", err);
      toast.error("Failed to prepare edit form.");
    }
  };

  // ---------- SUBMIT ----------
  const handleCreateGroupTour = async () => {
    try {
      const required = {
        country: "Country is required",
        state: "State is required",
        destination: "Destination is required",
        tourName: "Tour Name is required",
        articleNumber: "Article Number is required",
        category: "Category is required",
        pickupPoint: "Pickup Point is required",
        dropOffPoint: "Drop-off Point is required",
        totalDays: "Total Days is required",
        totalNights: "Total Nights is required",
        startDate: "Start Date is required",
        pricePerPax: "Price per Pax is required",
        totalPax: "Total Pax is required",
      };

      for (const [k, msg] of Object.entries(required)) {
        if (!String(formData[k] || "").trim()) {
          toast.error(msg);
          return;
        }
      }
      if (!includes.length) return toast.error("At least one Include is required.");
      if (!excludes.length) return toast.error("At least one Exclude is required.");
      if (!days.length) return toast.error("At least one day is required.");
      if (days.length !== Number(formData.totalDays)) {
        return toast.error(`You must provide exactly ${formData.totalDays} day(s) of details.`);
      }
      if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
        return toast.error("Total Nights should be exactly one less than Total Days.");
      }

      // validate segments
      for (let i = 0; i < days.length; i++) {
        const segs = days[i].segments;
        if (!Array.isArray(segs) || segs.length === 0) {
          return toast.error(`Day ${i + 1}: add at least one segment`);
        }
        for (let j = 0; j < segs.length; j++) {
          const s = segs[j];
          if (!s.country || !s.state || !s.destination || !s.trip) {
            return toast.error(
              `Day ${i + 1}, Segment ${j + 1}: Country, State, Destination and Trip are required`
            );
          }
        }
      }

      const payload = {
        ...formData,
        includes,
        excludes,
        days: days.map((d) => ({
          segments: d.segments.map((s) => ({
            country: s.country || undefined,
            state: s.state || undefined,
            destination: s.destination || undefined,
            trip: s.trip || undefined,
            selectedAddon: s.selectedAddon || undefined,
            // CHANGED: send array of activity ids
            selectedActivities: Array.isArray(s.selectedActivities)
              ? s.selectedActivities.filter(Boolean)
              : [],
          })),
        })),
      };

      if (currentlyEditingTourId) {
        await API.put(`/purchaser/updateGroupTour/${currentlyEditingTourId}`, payload);
        toast.success("Group tour updated successfully!");
        setCurrentlyEditingTourId(null);
      } else {
        await API.post("/purchaser/createGroupTour", payload);
        toast.success("Group tour created successfully!");
      }

      // Reset after success
      setFormData({
        country: "",
        state: "",
        destination: "",
        tourName: "",
        articleNumber: "",
        category: "",
        pickupPoint: "",
        dropOffPoint: "",
        totalDays: "",
        totalNights: "",
        startDate: "",
        netCost: "",
        pricePerPax: "",
        totalPax: "",
        riskAmount: "",
      });
      setIncludes([]);
      setExcludes([]);
      setDays([]);
      setStates([]);
      setDestinations([]);
      await fetchGroupTours();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save group tour.");
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[100rem] mx-auto text-base font-sans bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-2xl">
      {/* Top-level filters with react-select */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Country */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Country
          </label>
          <Select
            styles={selectStyles}
            options={countryOptions}
            isClearable
            isDisabled={!!currentlyEditingTourId}
            placeholder="Select Country"
            value={countryOptions.find((o) => o.value === formData.country) || null}
            onChange={(opt) =>
              setFormData((p) => ({ ...p, country: opt?.value || "" }))
            }
          />
        </div>

        {/* State */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            State
          </label>
          <Select
            styles={selectStyles}
            options={stateOptions}
            isClearable
            isDisabled={!!currentlyEditingTourId || !formData.country}
            placeholder="Select State"
            value={stateOptions.find((o) => o.value === formData.state) || null}
            onChange={(opt) =>
              setFormData((p) => ({ ...p, state: opt?.value || "" }))
            }
          />
        </div>

        {/* Destination */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Destination
          </label>
          <Select
            styles={selectStyles}
            options={destinationOptions}
            isClearable
            isDisabled={!!currentlyEditingTourId || !formData.state}
            placeholder="Select Destination"
            value={
              destinationOptions.find((o) => o.value === formData.destination) ||
              null
            }
            onChange={(opt) =>
              setFormData((p) => ({ ...p, destination: opt?.value || "" }))
            }
          />
        </div>

        {/* Tour Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Tour Name
          </label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            disabled={!!currentlyEditingTourId}
            placeholder="Tour Name"
            value={formData.tourName}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                tourName: e.target.value.toUpperCase(),
              }))
            }
          />
        </div>

        {/* Article Number */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Article Number
          </label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            disabled={!!currentlyEditingTourId}
            placeholder="Article Number"
            value={formData.articleNumber}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                articleNumber: e.target.value.toUpperCase(),
              }))
            }
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Category
          </label>
          <Select
            styles={selectStyles}
            isClearable
            isDisabled={!!currentlyEditingTourId}
            placeholder="Select Category"
            options={[
              { value: "Standard", label: "Standard" },
              { value: "Delux", label: "Delux" },
              { value: "Premium", label: "Premium" },
            ]}
            value={
              formData.category
                ? { value: formData.category, label: formData.category }
                : null
            }
            onChange={(opt) =>
              setFormData((p) => ({ ...p, category: opt?.value || "" }))
            }
          />
        </div>

        {/* Pickup / Drop */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Pickup Point
          </label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Enter Pickup Point"
            value={formData.pickupPoint}
            onChange={(e) =>
              setFormData((p) => ({ ...p, pickupPoint: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Drop Off Point
          </label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Enter Drop Off Point"
            value={formData.dropOffPoint}
            onChange={(e) =>
              setFormData((p) => ({ ...p, dropOffPoint: e.target.value }))
            }
          />
        </div>

        {/* Days / Nights / Start */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Total Days
          </label>
          <input
            type="number"
            min={1}
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            value={formData.totalDays}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value || "1", 10));
              setFormData((p) => ({ ...p, totalDays: String(val) }));
            }}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Total Nights
          </label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Enter Total Nights"
            value={formData.totalNights}
            onChange={(e) =>
              setFormData((p) => ({ ...p, totalNights: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Start Date
          </label>
          <input
            type="date"
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            value={formData.startDate}
            onChange={(e) =>
              setFormData((p) => ({ ...p, startDate: e.target.value }))
            }
          />
        </div>

        {/* Pricing meta */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Net Cost
          </label>
          <input
            readOnly
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Net Cost"
            value={formData.netCost}
            onChange={(e) =>
              setFormData((p) => ({ ...p, netCost: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Price Per Pax
          </label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Price per Pax"
            value={formData.pricePerPax}
            onChange={(e) =>
              setFormData((p) => ({ ...p, pricePerPax: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Total Pax
          </label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Total Pax"
            value={formData.totalPax}
            onChange={(e) =>
              setFormData((p) => ({ ...p, totalPax: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Risk Amount
          </label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Risk Amount"
            value={formData.riskAmount}
            onChange={(e) =>
              setFormData((p) => ({ ...p, riskAmount: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Includes / Excludes */}
      <div className="flex w-full gap-3">
        <div className="w-1/2 flex items-center gap-3">
          <input
            id="includeInput"
            className="border border-gray-300 p-3 w-full rounded-xl"
            placeholder="Add to Includes"
          />
          <button
            onClick={() =>
              handleAddItem(
                document.getElementById("includeInput").value,
                setIncludes,
                includes,
                "includeInput"
              )
            }
            className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
          >
            +
          </button>
        </div>
        <div className="w-1/2 flex items-center gap-3">
          <input
            id="excludeInput"
            className="border border-gray-300 p-3 w-full rounded-xl"
            placeholder="Add to Excludes"
          />
          <button
            onClick={() =>
              handleAddItem(
                document.getElementById("excludeInput").value,
                setExcludes,
                excludes,
                "excludeInput"
              )
            }
            className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-6">
  {/* Includes */}
  <div>
    <h2 className="font-semibold text-gray-700 mb-3 text-lg">Includes</h2>
    <div className="flex flex-wrap gap-4">
      {includes.map((tag, i) => (
        <span
          key={i}
          className="relative group bg-white/30 backdrop-blur-md text-gray-800 
                     px-4 py-2 rounded-2xl flex items-center gap-3 
                     border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                     hover:shadow-[0_6px_18px_rgba(133,112,238,0.3)] 
                     transition-all duration-300 transform hover:-translate-y-1"
        >
          <span className="font-medium tracking-wide">{tag}</span>
          <button
            onClick={() => handleRemoveItem(i, setIncludes, includes)}
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center 
                       rounded-full bg-[#8570EE] text-white font-bold 
                       shadow-md hover:bg-[#6f59da] transition-all duration-300"
          >
            ×
          </button>
        </span>
      ))}

      {includes.length === 0 && (
        <p className="text-gray-400 italic">No includes added yet</p>
      )}
    </div>
  </div>

  {/* Excludes */}
  <div>
    <h2 className="font-semibold text-gray-700 mb-3 text-lg">Excludes</h2>
    <div className="flex flex-wrap gap-4">
      {excludes.map((tag, i) => (
        <span
          key={i}
          className="relative group bg-white/30 backdrop-blur-md text-gray-800 
                     px-4 py-2 rounded-2xl flex items-center gap-3 
                     border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                     hover:shadow-[0_6px_18px_rgba(133,112,238,0.3)] 
                     transition-all duration-300 transform hover:-translate-y-1"
        >
          <span className="font-medium tracking-wide">{tag}</span>
          <button
            onClick={() => handleRemoveItem(i, setExcludes, excludes)}
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center 
                       rounded-full bg-[#8570EE] text-white font-bold 
                       shadow-md hover:bg-[#6f59da] transition-all duration-300"
          >
            ×
          </button>
        </span>
      ))}

      {excludes.length === 0 && (
        <p className="text-gray-400 italic">No excludes added yet</p>
      )}
    </div>
  </div>
</div>

      {/* DAYS with multiple SEGMENTS */}
      {days.map((day, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleDayExpand(i)}
            >
              <span className="text-lg font-bold text-gray-500">
                {day.expanded ? "▾" : "▸"}
              </span>
              <h3 className="text-xl font-semibold text-gray-800">
                Day {i + 1}
              </h3>
              {day.date && (
                <span className="ml-2 text-gray-500 text-sm">({day.date})</span>
              )}
            </div>
            <button
              onClick={() => handleRemoveDay(i)}
              className="text-gray-300 hover:text-red-400 font-bold text-xl"
            >
              ×
            </button>
          </div>

          {day.expanded && (
            <div className="space-y-4">
              {day.segments.map((seg, j) => {
                const countryOpts = countryOptions;
                const stateOpts = toOptions(seg.states);
                const destOpts = toOptions(seg.destinations);
                const tripOpts = toOptions(seg.trips, "tripName");
                const addonOpts = toOptions(seg.addonTrips, "tripName");
                const actOpts = toOptions(seg.activities, "tripName");

                return (
                  <div
                    key={j}
                    className="border border-gray-200 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Segment {j + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {j === 0 ? (
                          <button
                            onClick={() => addSegment(i)}
                            className="w-8 h-8 rounded-full bg-[#8570EE] text-white flex items-center justify-center"
                          >
                            <Plus size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => removeSegment(i, j)}
                            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Country / State / Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Select
                        styles={selectStyles}
                        options={countryOpts}
                        isClearable
                        placeholder="Country"
                        value={
                          countryOpts.find((o) => o.value === seg.country) || null
                        }
                        onChange={(opt) =>
                          updateSegmentField(i, j, "country", opt?.value || "")
                        }
                      />
                      <Select
                        styles={selectStyles}
                        options={stateOpts}
                        isClearable
                        isDisabled={!seg.country}
                        placeholder="State"
                        value={stateOpts.find((o) => o.value === seg.state) || null}
                        onChange={(opt) =>
                          updateSegmentField(i, j, "state", opt?.value || "")
                        }
                      />
                      <Select
                        styles={selectStyles}
                        options={destOpts}
                        isClearable
                        isDisabled={!seg.state}
                        placeholder="Destination"
                        value={
                          destOpts.find((o) => o.value === seg.destination) || null
                        }
                        onChange={(opt) =>
                          updateSegmentField(i, j, "destination", opt?.value || "")
                        }
                      />
                    </div>

                    {/* Trip + clear */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <Select
                        styles={selectStyles}
                        options={tripOpts}
                        isClearable
                        isDisabled={!seg.destination}
                        placeholder="Trip"
                        value={tripOpts.find((o) => o.value === seg.trip) || null}
                        onChange={(opt) =>
                          updateSegmentField(i, j, "trip", opt?.value || "")
                        }
                      />
                      <button
                        onClick={() => clearSegmentTarget(i, j, "trip")}
                        className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Addon Trip + clear */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <Select
                        styles={selectStyles}
                        options={addonOpts}
                        isClearable
                        isDisabled={!seg.trip}
                        placeholder="Add-on Trip"
                        value={
                          addonOpts.find((o) => o.value === seg.selectedAddon) ||
                          null
                        }
                        onChange={(opt) =>
                          updateSegmentField(
                            i,
                            j,
                            "selectedAddon",
                            opt?.value || ""
                          )
                        }
                      />
                      <button
                        onClick={() => clearSegmentTarget(i, j, "selectedAddon")}
                        className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Activities (MULTI) + clear */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <Select
                        styles={selectStyles}
                        options={actOpts}
                        isClearable
                        isMulti
                        isDisabled={!seg.trip}
                        placeholder="Activities"
                        value={actOpts.filter((o) =>
                          (seg.selectedActivities || []).includes(o.value)
                        )}
                        onChange={(opts) =>
                          updateSegmentField(
                            i,
                            j,
                            "selectedActivities",
                            Array.isArray(opts) ? opts.map((o) => o.value) : []
                          )
                        }
                      />
                      <button
                        onClick={() =>
                          clearSegmentTarget(i, j, "selectedActivities")
                        }
                        className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleCreateGroupTour}
        className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
      >
        {currentlyEditingTourId ? "Update Group Tour" : "Create Group Tour"}
      </button>

      {/* Table */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
          View Group Tour
        </h5>
        <p className="block mb-6 text-sm font-light text-gray-400">
          Search and Edit Group Tour
        </p>
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Group Tour Name..."
            className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>
        <div className="overflow-x-auto ">
          <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Sl No</th>
                <th className="px-6 py-4">TOUR NAME</th>
                <th className="px-6 py-4">ARTICLE NUMBER</th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4">START DATE</th>
                <th className="px-6 py-4 text-center">EDIT</th>
                <th className="px-6 py-4 text-center">Bo</th>
              </tr>
            </thead>
            <tbody>
              {groupTours.length > 0 ? (
                groupTours.map((tour, idx) => (
                  <tr
                    key={tour._id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {(page - 1) * 3 + idx + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold">{tour.tourName}</td>
                    <td className="px-6 py-4 font-semibold">
                      {tour.articleNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold">{tour.category}</td>
                    <td className="px-6 py-4 font-semibold">
                      {tour.startDate
                        ? new Date(tour.startDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <button
                        onClick={() => handleEditTour(tour)}
                        className="text-gray-700 hover:text-gray-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <button
                        title="Booking Order"
                        className="text-purple-600 hover:text-purple-800"
                        onClick={() => {
                          /* your handleBookingOrder(tour) here */
                        }}
                      >
                        <ReceiptText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-400">
                    No tours found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Previous
          </button>
          <span className="px-3 py-1">{page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupTour;
