
// // src/pages/purchaser/GroupTourBO.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import API from "../../api";
// import {
//   Loader2,
//   ChevronDown,
//   ChevronRight,
//   Minus,
//   Plus,
//   Trash2,
//   Save,
//   XCircle,
// } from "lucide-react";
// import { toast } from "react-toastify";

// /* ---------- small helpers ---------- */
// const keyForSeg = (dayIdx, segIdx) => `${dayIdx}-${segIdx}`;
// const toYmd = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
// const uid = () => Math.random().toString(36).slice(2, 10);
// const toISODate = (d) => (d ? new Date(d).toISOString() : null);

// /* ===================================
//    MAIN: GroupTourBO
// =================================== */
// export default function GroupTourBO({ tourId, onBack }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [tour, setTour] = useState(null);
//   const [expandedDays, setExpandedDays] = useState({});

//   // Option catalogs (fetched per segment)
//   const [vehOptions, setVehOptions] = useState({});
//   const [foodOptions, setFoodOptions] = useState({});
//   const [addonVehOptions, setAddonVehOptions] = useState({});
//   const [accOptions, setAccOptions] = useState({});
//   const [actPricing, setActPricing] = useState({});

//   // Editable BO lines (keyed by "i-j")
//   const [vehLines, setVehLines] = useState({});
//   const [foodLines, setFoodLines] = useState({});
//   const [addonVehLines, setAddonVehLines] = useState({});
//   const [actLines, setActLines] = useState({});
//   const [accLines, setAccLines] = useState({});
//   console.log(vehLines,"trip vehicle details")
//   console.log(addonVehLines,"addontrip vehicle details")
//   console.log(actLines,"activity details")
//   console.log(accLines,"accommodation details")
//   console.log(foodLines,"food details")
//   /* ---------- Load + hydrate from persisted tour ---------- */
//   useEffect(() => {
//     let active = true;
//     (async () => {
//       try {
//         setLoading(true);
//         if (!tourId) return;
//         const res = await API.get(`/purchaser/groupTours/${tourId}`);
//         if (!active) return;
//         const fetched = res.data?.tour || null;
//         setTour(fetched);

//         if (fetched?.days?.length) {
//           const _veh = {},
//             _addon = {},
//             _food = {},
//             _act = {},
//             _acc = {};
//           fetched.days.forEach((d, i) => {
//             (d.segments || []).forEach((s, j) => {
//               const k = keyForSeg(i, j);
//               if (s.boTripVehicles?.length) _veh[k] = s.boTripVehicles;
//               if (s.boAddonVehicles?.length) _addon[k] = s.boAddonVehicles;
//               if (s.boFoods?.length) _food[k] = s.boFoods;
//               if (s.boActivities?.length) _act[k] = s.boActivities;
//               if (s.boAccommodations?.length) _acc[k] = s.boAccommodations;
//             });
//           });
//           setVehLines(_veh);
//           setAddonVehLines(_addon);
//           setFoodLines(_food);
//           setActLines(_act);
//           setAccLines(_acc);
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch Group Tour details.");
//       } finally {
//         if (active) setLoading(false);
//       }
//     })();
//     return () => {
//       active = false;
//     };
//   }, [tourId]);
//   // AUTO-refresh prices after tour loads
// useEffect(() => {
//   if (!tour || !tour.days) return;

//   tour.days.forEach((day, dIdx) => {
//     const dateYmd = toYmd(day.date || tour.startDate);

//     (day.segments || []).forEach((seg, sIdx) => {
//       const segKey = keyForSeg(dIdx, sIdx);

//       const tripId = seg.trip?._id || seg.trip;
//       const addonId = seg.selectedAddon?._id || seg.selectedAddon;
//       const destId = seg.destination?._id || seg.destination;
//       const actIds = Array.isArray(seg.selectedActivities)
//         ? seg.selectedActivities.map(a => (typeof a === "object" ? a._id : a))
//         : [];

//       // auto-refresh trip vehicles
//       if (tripId) fetchVehiclesForSeg(tripId, dateYmd, dIdx, sIdx);

//       // auto-refresh addon vehicles
//       if (addonId) fetchAddonVehiclesForSeg(addonId, dateYmd, dIdx, sIdx);

//       // auto-refresh foods
//       if (tripId) fetchFoodsForSeg(tripId, dateYmd, dIdx, sIdx);

//       // auto-refresh activities
//       if (actIds.length) fetchActivitiesForSeg(actIds, dateYmd, dIdx, sIdx);

//       // auto-refresh accommodation
//       if (destId) fetchAccForSeg(destId, dateYmd, dIdx, sIdx);
//     });
//   });
// }, [tour]);


//   const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");
//   const toggleDay = (i) => setExpandedDays((p) => ({ ...p, [i]: !p[i] }));

//   /* ---------- TRIP VEHICLES ---------- */
//   // const fetchVehiclesForSeg = async (tripId, dateYmd, dIdx, sIdx) => {
//   //   const segKey = keyForSeg(dIdx, sIdx);
//   //   if (!tripId || !dateYmd) return;
//   //   try {
//   //     const { data } = await API.get(`/purchaser/tripVehicles/${tripId}`, {
//   //       params: { date: dateYmd },
//   //     });
//   //     setVehOptions((p) => ({ ...p, [segKey]: data }));
//   //     setVehLines((p) => (p[segKey] ? p : { ...p, [segKey]: [] }));
//   //   } catch (e) {
//   //     console.error("tripVehicles fetch failed", e);
//   //     toast.error("Failed to load vehicles for this segment.");
//   //   }
//   // };
//   const fetchVehiclesForSeg = async (tripId, dateYmd, dIdx, sIdx) => {
//   const segKey = keyForSeg(dIdx, sIdx);
//   if (!tripId || !dateYmd) return;

//   try {
//     const { data } = await API.get(`/purchaser/tripVehicles/${tripId}`, {
//       params: { date: dateYmd },
//     });

//     setVehOptions((p) => ({ ...p, [segKey]: data }));

//     setVehLines((p) => {
//       const existing = p[segKey] || [];
//       if (!existing.length) return { ...p, [segKey]: [] };

//       const { options = {} } = data || {};
//       const updated = existing.map((line) => {
//         const vehicles = options[line.category] || [];
//         const match = vehicles.find(
//           (v) => String(v.vehicleId) === String(line.vehicleId)
//         );
//         if (!match) return line; // no matching vehicle -> keep old

//         return {
//           ...line,
//           basePrice: match.basePrice ?? line.basePrice ?? 0,
//           percentage: match.percentage ?? line.percentage ?? 0,
//         };
//       });

//       return { ...p, [segKey]: updated };
//     });
//   } catch (e) {
//     console.error("tripVehicles fetch failed", e);
//     toast.error("Failed to load vehicles for this segment.");
//   }
// };

//   const addVehLine = (segKey, meta = {}) => {
//     setVehLines((p) => ({
//       ...p,
//       [segKey]: [
//         ...(p[segKey] || []),
//         {
//           _id: uid(),
//           category: "",
//           vehicleId: "",
//           percentage: 0,
//           basePrice: 0,
//           qty: 0,
//           tripId: meta.tripId || "",
//           tripName: meta.tripName || "",
//           date: meta.date ? toISODate(meta.date) : null,
//         },
//       ],
//     }));
//   };
//   const removeVehLine = (segKey, id) =>
//     setVehLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));
//   const updateVehLine = (segKey, id, next) =>
//     setVehLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, ...next } : l
//       ),
//     }));

//   /* ---------- FOODS ---------- */
//   // const fetchFoodsForSeg = async (tripId, dateYmd, dIdx, sIdx) => {
//   //   const segKey = keyForSeg(dIdx, sIdx);
//   //   if (!tripId || !dateYmd) return;

//   //   const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
//   //   const tripName =
//   //     typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
//   //   const dateISO = toISODate(dateYmd);

//   //   try {
//   //     const { data } = await API.get(`/purchaser/tripFoods/${tripId}`, {
//   //       params: { date: dateYmd },
//   //     });
//   //     setFoodOptions((p) => ({ ...p, [segKey]: data }));
//   //     setFoodLines((p) => {
//   //       const existing = p[segKey] || [];
//   //       if (!existing.length) return { ...p, [segKey]: [] };
//   //       return {
//   //         ...p,
//   //         [segKey]: existing.map((l) => ({ ...l, tripId, tripName, date: dateISO })),
//   //       };
//   //     });
//   //   } catch (e) {
//   //     console.error("tripFoods fetch failed", e);
//   //     toast.error("Failed to load foods for this segment.");
//   //   }
//   // };
//   const fetchFoodsForSeg = async (tripId, dateYmd, dIdx, sIdx) => {
//   const segKey = keyForSeg(dIdx, sIdx);
//   if (!tripId || !dateYmd) return;

//   const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
//   const tripName =
//     typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
//   const dateISO = toISODate(dateYmd);

//   try {
//     const { data } = await API.get(`/purchaser/tripFoods/${tripId}`, {
//       params: { date: dateYmd },
//     });

//     // 1) latest options
//     setFoodOptions((p) => ({ ...p, [segKey]: data }));

//     // 2) refresh existing lines (if any)
//     setFoodLines((p) => {
//       const existing = p[segKey] || [];
//       if (!existing.length) {
//         // keep old behaviour: initialize empty
//         return { ...p, [segKey]: [] };
//       }

//       const { options = {} } = data || {};

//       const updated = existing.map((line) => {
//         const cat = line.mealCategory || "";
//         const type = line.mealType || "";
//         const itemsForType = options[cat]?.[type] || [];

//         const match = itemsForType.find(
//           (it) => it.foodName === line.foodName
//         );

//         if (!match) {
//           // even if not matched, still update trip metadata
//           return {
//             ...line,
//             tripId,
//             tripName,
//             date: dateISO,
//           };
//         }

//         return {
//           ...line,
//           tripId,
//           tripName,
//           date: dateISO,
//           price: match.price ?? line.price ?? 0,
//           percent: match.percent ?? line.percent ?? 0,
//           itineraryUnit:
//             match.itineraryPrice != null && !isNaN(match.itineraryPrice)
//               ? Number(match.itineraryPrice)
//               : Math.round(
//                   Number(match.price || 0) *
//                     (1 + Number(match.percent || 0) / 100)
//                 ),
//           vendorId: match.vendor ?? line.vendorId ?? null,
//         };
//       });

//       return { ...p, [segKey]: updated };
//     });
//   } catch (e) {
//     console.error("tripFoods fetch failed", e);
//     toast.error("Failed to load foods for this segment.");
//   }
// };

//   const addFoodLine = (segKey, meta = {}) => {
//     setFoodLines((p) => ({
//       ...p,
//       [segKey]: [
//         ...(p[segKey] || []),
//         {
//           _id: uid(),
//           mealCategory: "",
//           mealType: "",
//           foodName: "",
//           price: 0,
//           percent: 0,
//           itineraryUnit: 0,
//           qty: 0,
//           tripId: meta.tripId || "",
//           tripName: meta.tripName || "",
//           date: meta.date ? toISODate(meta.date) : null,
//           vendorId: null,
//         },
//       ],
//     }));
//   };
//   const removeFoodLine = (segKey, id) =>
//     setFoodLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));
//   const updateFoodLine = (segKey, id, next) =>
//     setFoodLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, ...next } : l
//       ),
//     }));

//   /* ---------- ADD-ON VEHICLES ---------- */
//   // const fetchAddonVehiclesForSeg = async (addonTripId, dateYmd, dIdx, sIdx) => {
//   //   const segKey = keyForSeg(dIdx, sIdx);
//   //   if (!addonTripId || !dateYmd) return;
//   //   try {
//   //     const { data } = await API.get(
//   //       `/purchaser/addonTripVehicles/${addonTripId}`,
//   //       { params: { date: dateYmd } }
//   //     );
//   //     setAddonVehOptions((p) => ({ ...p, [segKey]: data }));
//   //     setAddonVehLines((p) => (p[segKey] ? p : { ...p, [segKey]: [] }));
//   //   } catch (e) {
//   //     console.error("addonTripVehicles fetch failed", e);
//   //     toast.error("Failed to load add-on vehicles for this segment.");
//   //   }
//   // };
//   const fetchAddonVehiclesForSeg = async (addonTripId, dateYmd, dIdx, sIdx) => {
//   const segKey = keyForSeg(dIdx, sIdx);
//   if (!addonTripId || !dateYmd) return;

//   try {
//     const { data } = await API.get(
//       `/purchaser/addonTripVehicles/${addonTripId}`,
//       { params: { date: dateYmd } }
//     );

//     // 1) latest options
//     setAddonVehOptions((p) => ({ ...p, [segKey]: data }));

//     // 2) refresh existing lines
//     setAddonVehLines((p) => {
//       const existing = p[segKey] || [];
//       if (!existing.length) return { ...p, [segKey]: [] };

//       const { options = {} } = data || {};

//       const updated = existing.map((line) => {
//         const vehicles = options[line.category] || [];
//         const match = vehicles.find(
//           (v) => String(v.vehicleId) === String(line.vehicleId)
//         );

//         if (!match) return line;

//         return {
//           ...line,
//           percentage: match.percentage ?? line.percentage ?? 0,
//           basePrice: match.basePrice ?? line.basePrice ?? 0,
//         };
//       });

//       return { ...p, [segKey]: updated };
//     });
//   } catch (e) {
//     console.error("addonTripVehicles fetch failed", e);
//     toast.error("Failed to load add-on vehicles for this segment.");
//   }
// };

//   const addAddonVehLine = (segKey, meta = {}) => {
//     setAddonVehLines((p) => ({
//       ...p,
//       [segKey]: [
//         ...(p[segKey] || []),
//         {
//           _id: uid(),
//           category: "",
//           vehicleId: "",
//           percentage: 0,
//           basePrice: 0,
//           qty: 0,
//           addonTripId: meta.addonTripId || "",
//           addonTripName: meta.addonTripName || "",
//           date: meta.date ? toISODate(meta.date) : null,
//         },
//       ],
//     }));
//   };
//   const removeAddonVehLine = (segKey, id) =>
//     setAddonVehLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));
//   const updateAddonVehLine = (segKey, id, next) =>
//     setAddonVehLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, ...next } : l
//       ),
//     }));

//   /* ---------- ACTIVITIES ---------- */
//   // const fetchActivitiesForSeg = async (activityIds, dateYmd, dIdx, sIdx) => {
//   //   const segKey = keyForSeg(dIdx, sIdx);
//   //   if (!Array.isArray(activityIds) || !activityIds.length || !dateYmd) {
//   //     toast.info("No activities to load for this segment.");
//   //     return;
//   //   }

//   //   const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
//   //   const tripId = seg?.trip?._id || seg?.trip || "";
//   //   const tripName =
//   //     typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
//   //   const dateISO = toISODate(dateYmd);

//   //   try {
//   //     const ids = activityIds
//   //       .map((a) => (typeof a === "object" ? a._id : a))
//   //       .filter(Boolean)
//   //       .join(",");

//   //     const { data } = await API.get(`/purchaser/activitiesPricing`, {
//   //       params: { ids, date: dateYmd },
//   //     });

//   //     const map = {};
//   //     (data.items || []).forEach((it) => {
//   //       map[it.activityId] = {
//   //         name: it.activityName,
//   //         price: Number(it.price || 0),
//   //         percentage: Number(it.percentage || 0),
//   //         itineraryPrice: Number(it.itineraryPrice || 0),
//   //       };
//   //     });
//   //     setActPricing((p) => ({ ...p, [segKey]: map }));

//   //     setActLines((p) => {
//   //       const existing = p[segKey] || [];
//   //       if (existing.length) {
//   //         return {
//   //           ...p,
//   //           [segKey]: existing.map((l) => ({ ...l, tripId, tripName, date: dateISO })),
//   //         };
//   //       }
//   //       const fresh = (data.items || []).map((it) => ({
//   //         _id: uid(),
//   //         activityId: it.activityId,
//   //         name: it.activityName,
//   //         price: Number(it.price || 0),
//   //         percentage: Number(it.percentage || 0),
//   //         itineraryUnit:
//   //           it.itineraryPrice != null && !isNaN(it.itineraryPrice)
//   //             ? Number(it.itineraryPrice)
//   //             : Math.round(
//   //                 Number(it.price || 0) * (1 + Number(it.percentage || 0) / 100)
//   //               ),
//   //         qty: 0,
//   //         tripId,
//   //         tripName,
//   //         date: dateISO,
//   //       }));
//   //       return { ...p, [segKey]: fresh };
//   //     });
//   //   } catch (e) {
//   //     console.error("activitiesPricing fetch failed", e);
//   //     toast.error("Failed to load activities pricing for this segment.");
//   //   }
//   // };
//   const fetchActivitiesForSeg = async (activityIds, dateYmd, dIdx, sIdx) => {
//   const segKey = keyForSeg(dIdx, sIdx);
//   if (!Array.isArray(activityIds) || !activityIds.length || !dateYmd) {
//     toast.info("No activities to load for this segment.");
//     return;
//   }

//   const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
//   const tripId = seg?.trip?._id || seg?.trip || "";
//   const tripName =
//     typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
//   const dateISO = toISODate(dateYmd);

//   try {
//     const ids = activityIds
//       .map((a) => (typeof a === "object" ? a._id : a))
//       .filter(Boolean)
//       .join(",");

//     const { data } = await API.get(`/purchaser/activitiesPricing`, {
//       params: { ids, date: dateYmd },
//     });

//     // build pricing map (optional, if you still need it elsewhere)
//     const map = {};
//     (data.items || []).forEach((it) => {
//       map[it.activityId] = {
//         name: it.activityName,
//         price: Number(it.price || 0),
//         percentage: Number(it.percentage || 0),
//         itineraryPrice: Number(it.itineraryPrice || 0),
//       };
//     });
//     setActPricing((p) => ({ ...p, [segKey]: map }));

//     // refresh / create lines
//     setActLines((p) => {
//       const existing = p[segKey] || [];
//       const items = data.items || [];

//       if (existing.length) {
//         const updated = existing.map((line) => {
//           const match = items.find(
//             (it) => String(it.activityId) === String(line.activityId)
//           );

//           if (!match) {
//             return {
//               ...line,
//               tripId,
//               tripName,
//               date: dateISO,
//             };
//           }

//           const price = Number(match.price || 0);
//           const percentage = Number(match.percentage || 0);
//           const itineraryUnit =
//             match.itineraryPrice != null && !isNaN(match.itineraryPrice)
//               ? Number(match.itineraryPrice)
//               : Math.round(price * (1 + percentage / 100));

//           return {
//             ...line,
//             tripId,
//             tripName,
//             date: dateISO,
//             price,
//             percentage,
//             itineraryUnit,
//           };
//         });
//         return { ...p, [segKey]: updated };
//       }

//       // no existing lines -> create fresh from API
//       const fresh = items.map((it) => {
//         const price = Number(it.price || 0);
//         const percentage = Number(it.percentage || 0);
//         const itineraryUnit =
//           it.itineraryPrice != null && !isNaN(it.itineraryPrice)
//             ? Number(it.itineraryPrice)
//             : Math.round(price * (1 + percentage / 100));

//         return {
//           _id: uid(),
//           activityId: it.activityId,
//           name: it.activityName,
//           price,
//           percentage,
//           itineraryUnit,
//           qty: 0,
//           tripId,
//           tripName,
//           date: dateISO,
//         };
//       });

//       return { ...p, [segKey]: fresh };
//     });
//   } catch (e) {
//     console.error("activitiesPricing fetch failed", e);
//     toast.error("Failed to load activities pricing for this segment.");
//   }
// };

//   const removeActLine = (segKey, id) =>
//     setActLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));
//   const updateActQty = (segKey, id, qty) =>
//     setActLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, qty } : l
//       ),
//     }));

//   /* ---------- ACCOMMODATIONS ---------- */
//   // const fetchAccForSeg = async (destinationId, dateYmd, dIdx, sIdx) => {
//   //   const segKey = keyForSeg(dIdx, sIdx);
//   //   if (!destinationId || !dateYmd) return;

//   //   const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
//   //   const tripId = seg?.trip?._id || seg?.trip || "";
//   //   const tripName =
//   //     typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
//   //   const dateISO = toISODate(dateYmd);

//   //   try {
//   //     const { data } = await API.get(`/purchaser/accommodationsPricing`, {
//   //       params: { destinationId, date: dateYmd },
//   //     });
//   //     setAccOptions((p) => ({ ...p, [segKey]: data }));
//   //     setAccLines((p) => {
//   //       const existing = p[segKey] || [];
//   //       if (!existing.length) return { ...p, [segKey]: [] };
//   //       return {
//   //         ...p,
//   //         [segKey]: existing.map((l) => ({ ...l, tripId, tripName, date: dateISO })),
//   //       };
//   //     });
//   //   } catch (e) {
//   //     console.error("accommodationsPricing fetch failed", e);
//   //     toast.error("Failed to load accommodations for this segment.");
//   //   }
//   // };
//   const fetchAccForSeg = async (destinationId, dateYmd, dIdx, sIdx) => {
//   const segKey = keyForSeg(dIdx, sIdx);
//   if (!destinationId || !dateYmd) return;

//   const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
//   const tripId = seg?.trip?._id || seg?.trip || "";
//   const tripName =
//     typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
//   const dateISO = toISODate(dateYmd);

//   try {
//     const { data } = await API.get(`/purchaser/accommodationsPricing`, {
//       params: { destinationId, date: dateYmd },
//     });

//     // 1) latest options
//     setAccOptions((p) => ({ ...p, [segKey]: data }));

//     // 2) refresh existing lines
//     setAccLines((p) => {
//       const existing = p[segKey] || [];
//       if (!existing.length) return { ...p, [segKey]: [] };

//       const props = data?.properties || [];

//       const updated = existing.map((line) => {
//         const prop = props.find(
//           (x) => String(x.accommodationId) === String(line.accommodationId)
//         );

//         if (!prop) {
//           // still update trip metadata even if property disappeared
//           return {
//             ...line,
//             tripId,
//             tripName,
//             date: dateISO,
//           };
//         }

//         const roomTypes = prop.roomTypes || [];
//         const room = roomTypes.find(
//           (r) => r.code === line.roomTypeCode
//         );

//         // base object with updated meta + commission/category info
//         let next = {
//           ...line,
//           tripId,
//           tripName,
//           date: dateISO,
//           hotelCategory: prop.hotelCategory || line.hotelCategory || "",
//           roomCategory: prop.roomCategory || line.roomCategory || "",
//           commission: prop.commission ?? line.commission ?? 0,
//         };

//         // if the room still exists, overwrite bo/itinerary
//         if (room) {
//           next = {
//             ...next,
//             bo: room.bo ?? line.bo ?? 0,
//             itinerary: room.itinerary ?? line.itinerary ?? 0,
//           };
//         }

//         return next;
//       });

//       return { ...p, [segKey]: updated };
//     });
//   } catch (e) {
//     console.error("accommodationsPricing fetch failed", e);
//     toast.error("Failed to load accommodations for this segment.");
//   }
// };

//   const addAccLine = (segKey, meta = {}) => {
//     setAccLines((p) => ({
//       ...p,
//       [segKey]: [
//         ...(p[segKey] || []),
//         {
//           _id: uid(),
//           accommodationId: "",
//           propertyName: "",
//           hotelCategory: "",
//           roomCategory: "",
//           roomTypeCode: "",
//           commission: 0,
//           bo: 0,
//           itinerary: 0,
//           qty: 0,
//           tripId: meta.tripId || "",
//           tripName: meta.tripName || "",
//           date: meta.date ? toISODate(meta.date) : null,
//         },
//       ],
//     }));
//   };
//   const removeAccLine = (segKey, id) =>
//     setAccLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
//     }));
//   const updateAccLine = (segKey, id, next) =>
//     setAccLines((p) => ({
//       ...p,
//       [segKey]: (p[segKey] || []).map((l) =>
//         l._id === id ? { ...l, ...next } : l
//       ),
//     }));

//   /* ---------- Totals ---------- */
//   const { perDayTotals, grand } = useMemo(() => {
//     const perDay = {};
//     let totalBO = 0;
//     let totalItin = 0;

//     const add = (i, bo, itin) => {
//       perDay[i] = perDay[i] || { bo: 0, itin: 0 };
//       perDay[i].bo += bo;
//       perDay[i].itin += itin;
//       totalBO += bo;
//       totalItin += itin;
//     };
//     const run = (map, calc) => {
//       for (const segKey in map) {
//         const [iStr] = segKey.split("-");
//         const i = Number(iStr);
//         for (const sel of map[segKey] || []) {
//           if (!sel.qty) continue;
//           const { bo, itin } = calc(sel);
//           add(i, bo, itin);
//         }
//       }
//     };

//     run(vehLines, (sel) => {
//       const bo = Number(sel.basePrice || 0) * Number(sel.qty || 0);
//       const itinUnit = Math.round(
//         Number(sel.basePrice || 0) * (1 + Number(sel.percentage || 0) / 100)
//       );
//       return { bo, itin: itinUnit * Number(sel.qty || 0) };
//     });

//     run(foodLines, (sel) => {
//       const bo = Number(sel.price || 0) * Number(sel.qty || 0);
//       const itinUnit = Number.isFinite(sel.itineraryUnit)
//         ? Number(sel.itineraryUnit)
//         : Math.round(
//             Number(sel.price || 0) * (1 + Number(sel.percent || 0) / 100)
//           );
//       return { bo, itin: itinUnit * Number(sel.qty || 0) };
//     });

//     run(addonVehLines, (sel) => {
//       const bo = Number(sel.basePrice || 0) * Number(sel.qty || 0);
//       const itinUnit = Math.round(
//         Number(sel.basePrice || 0) * (1 + Number(sel.percentage || 0) / 100)
//       );
//       return { bo, itin: itinUnit * Number(sel.qty || 0) };
//     });

//     run(actLines, (sel) => {
//       const price = Number(sel.price || 0);
//       const itinUnit = Number.isFinite(sel.itineraryUnit)
//         ? Number(sel.itineraryUnit)
//         : Math.round(price * (1 + Number(sel.percentage || 0) / 100));
//       const bo = price * Number(sel.qty || 0);
//       return { bo, itin: itinUnit * Number(sel.qty || 0) };
//     });

//     run(accLines, (sel) => {
//       const bo = Number(sel.bo || 0) * Number(sel.qty || 0);
//       const itinUnit = Number(sel.itinerary || 0);
//       return { bo, itin: itinUnit * Number(sel.qty || 0) };
//     });

//     return { perDayTotals: perDay, grand: { bo: totalBO, itin: totalItin } };
//   }, [vehLines, foodLines, addonVehLines, actLines, accLines]);

//   /* ---------- Save ---------- */
//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       await API.put(`/purchaser/groupTours/${tourId}/bo`, {
//         vehLines,
//         addonVehLines,
//         foodLines,
//         actLines,
//         accLines,
//         totalBO: grand.bo,
//         totalItinerary: grand.itin,
//       });
//       toast.success("Booking order saved");

//       // optional: refresh to stay in sync with server
//       const res = await API.get(`/purchaser/groupTours/${tourId}`);
//       setTour(res.data?.tour || null);
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to save booking order");
//     } finally {
//       setSaving(false);
//     }
//   };
//   const handleCancelTour = async () => {
//   try {
//     if (!tourId) return;

    

//     setSaving(true); // reuse saving state to disable buttons
//     await API.delete(`/purchaser/groupTours/${tourId}`);
//     toast.success("Group Tour deleted successfully!");
//     if (onBack) onBack(); // go back after deletion
//   } catch (e) {
//     console.error(e);
//     toast.error("Failed to delete group tour");
//   } finally {
//     setSaving(false);
//   }
// };


//   /* ---------- Top-level render ---------- */
//   if (!tourId) {
//     return (
//       <div className="p-6 rounded-2xl bg-white text-gray-600">
//         No tour selected.
//       </div>
//     );
//   }
//   if (loading) {
//     return (
//       <div className="p-10 rounded-2xl bg-white flex items-center gap-3 text-gray-600">
//         <Loader2 className="animate-spin" /> Loading booking order…
//       </div>
//     );
//   }
//   if (!tour) {
//     return (
//       <div className="p-6 rounded-2xl bg-white text-red-500">
//         Tour not found.
//       </div>
//     );
//   }

//   const topCountry =
//     typeof tour.country === "object" ? tour.country?.name : tour.country;
//   const topState =
//     typeof tour.state === "object" ? tour.state?.name : tour.state;
//   const topDest =
//     typeof tour.destination === "object"
//       ? tour.destination?.name
//       : tour.destination;

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-2xl font-bold text-[#321F6A] tracking-tight">
//               {tour.tourName || "Group Tour"}
//             </h3>
//             <p className="text-sm text-gray-500">
//               Article:{" "}
//               <span className="font-medium">{tour.articleNumber || "-"}</span>{" "}
//               • Category:{" "}
//               <span className="font-medium">{tour.category || "-"}</span>
//             </p>
//           </div>
//           <div className="text-right">
//             <div className="text-sm text-gray-500">Start Date</div>
//             <div className="text-lg font-semibold">
//               {fmtDate(tour.startDate)}
//             </div>
//           </div>
//         </div>

//         <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//           <Stat label="Country" value={topCountry || "-"} />
//           <Stat label="State" value={topState || "-"} />
//           <Stat label="Destination" value={topDest || "-"} />
//           <Stat
//             label="Days / Nights"
//             value={`${tour.totalDays ?? "-"} / ${tour.totalNights ?? "-"}`}
//           />
//           <Stat
//             label="Price / Pax"
//             value={tour.pricePerPax != null ? String(tour.pricePerPax) : "-"}
//           />
//           <Stat
//             label="Total Pax"
//             value={tour.totalPax != null ? String(tour.totalPax) : "-"}
//           />
//           <Stat
//             label="Net Cost"
//             value={tour.netCost != null ? String(tour.netCost) : "-"}
//           />
//           <Stat
//             label="Risk Amount"
//             value={tour.riskAmount != null ? String(tour.riskAmount) : "-"}
//           />
//         </div>

//         {/* Save */}
//         {/* <div className="mt-4 flex justify-end">
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="px-4 py-2 rounded-lg bg-[#8570EE] text-white hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
//           >
//             {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
//             {saving ? "Saving..." : "Activate Group Tour"}
//           </button>
//         </div> */}
//     <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
//   <button
//     onClick={handleCancelTour}
//     disabled={saving}
//     className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60 inline-flex items-center gap-2"
//   >
//     <XCircle size={16} />
//     Cancel Group Tour
//   </button>

//   <button
//     onClick={handleSave}
//     disabled={saving}
//     className="px-4 py-2 rounded-lg bg-[#8570EE] text-white hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
//   >
//     {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
//     {saving ? "Saving..." : "Activate Tour"}
//   </button>
// </div>


//       </div>

//       {/* Includes / Excludes */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <ChipPanel title="Includes" items={tour.includes || []} />
//         <ChipPanel title="Excludes" items={tour.excludes || []} />
//       </div>

//       {/* Itinerary */}
//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
//         <h4 className="text-xl font-bold text-[#321F6A] mb-4">Itinerary</h4>
//         {(tour.days || []).length === 0 ? (
//           <p className="text-gray-500">No day-wise details.</p>
//         ) : (
//           <div className="space-y-4">
//             {tour.days.map((day, i) => {
//               const open = !!expandedDays[i];
//               const dayDateYmd = toYmd(day.date || tour.startDate);
//               return (
//                 <div key={i} className="border border-gray-200 rounded-xl">
//                   <button
//                     onClick={() => toggleDay(i)}
//                     className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
//                   >
//                     <div className="flex items-center gap-3">
//                       {open ? <ChevronDown /> : <ChevronRight />}
//                       <div className="text-left">
//                         <div className="font-semibold text-gray-800">
//                           {day.dayLabel || `Day ${i + 1}`}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {fmtDate(day.date)}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {Array.isArray(day.segments)
//                         ? `${day.segments.length} segment(s)`
//                         : "0"}
//                     </div>
//                   </button>

//                   {open && (
//                     <div className="px-4 pb-4">
//                       {(day.segments || []).map((s, j) => {
//                         const segCountry =
//                           typeof s.country === "object"
//                             ? s.country?.name
//                             : s.country;
//                         const segState =
//                           typeof s.state === "object" ? s.state?.name : s.state;
//                         const segDest =
//                           typeof s.destination === "object"
//                             ? s.destination?.name
//                             : s.destination;
//                         const segTrip =
//                           typeof s.trip === "object"
//                             ? s.trip?.tripName
//                             : s.trip;
//                         const segAddon =
//                           typeof s.selectedAddon === "object"
//                             ? s.selectedAddon?.addontripName
//                             : s.selectedAddon;

//                         const acts = Array.isArray(s.selectedActivities)
//                           ? s.selectedActivities.map((a) =>
//                               typeof a === "object" ? a._id : a
//                             )
//                           : [];

//                         const segKey = keyForSeg(i, j);
//                         const tripId = s.trip?._id || s.trip;
//                         const addonId = s.selectedAddon?._id || s.selectedAddon;
//                         const destId = s.destination?._id || s.destination;

//                         return (
//                           <div
//                             key={j}
//                             className="mt-3 rounded-lg border border-gray-200 p-3 bg-gray-50 space-y-4"
//                           >
//                             {/* Basic segment info */}
//                             <div className="text-sm grid grid-cols-1 md:grid-cols-3 gap-2">
//                               <KV k="Country" v={segCountry || "-"} />
//                               <KV k="State" v={segState || "-"} />
//                               <KV k="Destination" v={segDest || "-"} />
//                               <KV k="Trip" v={segTrip || "-"} />
//                               <KV k="Add-on" v={segAddon || "-"} />
//                               <KV
//                                 k="Activities"
//                                 v={
//                                   Array.isArray(s.selectedActivities) &&
//                                   s.selectedActivities.length
//                                     ? s.selectedActivities
//                                         .map((a) =>
//                                           typeof a === "object"
//                                             ? a.activityName
//                                             : a
//                                         )
//                                         .join(", ")
//                                     : "-"
//                                 }
//                               />
//                             </div>

//                             {/* Trip Vehicles */}
//                             <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
//                               <div className="flex items-center justify-between">
//                                 <div className="font-semibold text-gray-700">
//                                   Trip Vehicles
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       fetchVehiclesForSeg(
//                                         tripId,
//                                         dayDateYmd,
//                                         i,
//                                         j
//                                       )
//                                     }
//                                     className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                                     disabled={!tripId || !dayDateYmd}
//                                   >
//                                     Load
//                                   </button>
//                                   {vehOptions[segKey] && (
//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         addVehLine(segKey, {
//                                           tripId,
//                                           tripName: segTrip,
//                                           date: dayDateYmd,
//                                         })
//                                       }
//                                       className="text-sm px-3 py-1 rounded-lg bg-[#8570EE] text-white hover:opacity-90"
//                                     >
//                                       + Add Vehicle
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                               {vehOptions[segKey] ? (
//                                 <VehicleLines
//                                   segKey={segKey}
//                                   data={vehOptions[segKey]}
//                                   lines={vehLines[segKey] || []}
//                                   onUpdateLine={(k, id, next) =>
//                                     updateVehLine(k, id, next)
//                                   }
//                                   onRemoveLine={(k, id) => removeVehLine(k, id)}
//                                 />
//                               ) : (
//                                 <p className="text-xs text-gray-500">
//                                   Click Load to fetch available vehicles & prices.
//                                 </p>
//                               )}
//                             </div>

//                             {/* Add-on Trip Vehicles */}
//                             {addonId && (
//                               <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
//                                 <div className="flex items-center justify-between">
//                                   <div className="font-semibold text-gray-700">
//                                     Add-on Trip Vehicles
//                                   </div>
//                                   <div className="flex items-center gap-2">
//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         fetchAddonVehiclesForSeg(
//                                           addonId,
//                                           dayDateYmd,
//                                           i,
//                                           j
//                                         )
//                                       }
//                                       className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                                       disabled={!addonId || !dayDateYmd}
//                                     >
//                                       Load
//                                     </button>
//                                     {addonVehOptions[segKey] && (
//                                       <button
//                                         type="button"
//                                         onClick={() =>
//                                           addAddonVehLine(segKey, {
//                                             addonTripId: addonId,
//                                             addonTripName: segAddon,
//                                             date: dayDateYmd,
//                                           })
//                                         }
//                                         className="text-sm px-3 py-1 rounded-lg bg-[#8570EE] text-white hover:opacity-90"
//                                       >
//                                         + Add Add-on Vehicle
//                                       </button>
//                                     )}
//                                   </div>
//                                 </div>
//                                 {addonVehOptions[segKey] ? (
//                                   <VehicleLines
//                                     segKey={segKey}
//                                     data={addonVehOptions[segKey]}
//                                     lines={addonVehLines[segKey] || []}
//                                     onUpdateLine={(k, id, next) =>
//                                       updateAddonVehLine(k, id, next)
//                                     }
//                                     onRemoveLine={(k, id) =>
//                                       removeAddonVehLine(k, id)
//                                     }
//                                   />
//                                 ) : (
//                                   <p className="text-xs text-gray-500">
//                                     Click Load to fetch add-on vehicles & prices.
//                                   </p>
//                                 )}
//                               </div>
//                             )}

//                             {/* Activities (Priced) */}
//                             <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
//                               <div className="flex items-center justify-between">
//                                 <div className="font-semibold text-gray-700">
//                                   Activities (Priced)
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       fetchActivitiesForSeg(
//                                         acts,
//                                         dayDateYmd,
//                                         i,
//                                         j
//                                       )
//                                     }
//                                     className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                                     disabled={!acts?.length || !dayDateYmd}
//                                   >
//                                     Load
//                                   </button>
//                                 </div>
//                               </div>
//                               {actLines[segKey]?.length ? (
//                                 <ActivityLines
//                                   segKey={segKey}
//                                   lines={actLines[segKey]}
//                                   onQty={(k, id, q) => updateActQty(k, id, q)}
//                                   onRemove={(k, id) => removeActLine(k, id)}
//                                 />
//                               ) : (
//                                 <p className="text-xs text-gray-500">
//                                   {acts?.length
//                                     ? "Click Load to fetch prices for selected activities."
//                                     : "No activities selected in this segment."}
//                                 </p>
//                               )}
//                             </div>

//                             {/* Trip Foods */}
//                             <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
//                               <div className="flex items-center justify-between">
//                                 <div className="font-semibold text-gray-700">
//                                   Trip Food
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       fetchFoodsForSeg(tripId, dayDateYmd, i, j)
//                                     }
//                                     className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                                     disabled={!tripId || !dayDateYmd}
//                                   >
//                                     Load
//                                   </button>
//                                   {foodOptions[segKey] && (
//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         addFoodLine(segKey, {
//                                           tripId,
//                                           tripName: segTrip,
//                                           date: dayDateYmd,
//                                         })
//                                       }
//                                       className="text-sm px-3 py-1 rounded-lg bg-[#8570EE] text-white hover:opacity-90"
//                                     >
//                                       + Add Food
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                               {foodOptions[segKey] ? (
//                                 <FoodLines
//                                   segKey={segKey}
//                                   data={foodOptions[segKey]}
//                                   lines={foodLines[segKey] || []}
//                                   onUpdateLine={updateFoodLine}
//                                   onRemoveLine={removeFoodLine}
//                                 />
//                               ) : (
//                                 <p className="text-xs text-gray-500">
//                                   Click Load to fetch available foods & prices.
//                                 </p>
//                               )}
//                             </div>

//                             {/* Accommodation */}
//                             <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
//                               <div className="flex items-center justify-between">
//                                 <div className="font-semibold text-gray-700">
//                                   Accommodation
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       fetchAccForSeg(destId, dayDateYmd, i, j)
//                                     }
//                                     className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
//                                     disabled={!destId || !dayDateYmd}
//                                   >
//                                     Load
//                                   </button>
//                                   {accOptions[segKey]?.properties?.length ? (
//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         addAccLine(segKey, {
//                                           tripId,
//                                           tripName: segTrip,
//                                           date: dayDateYmd,
//                                         })
//                                       }
//                                       className="text-sm px-3 py-1 rounded-lg bg-[#8570EE] text-white hover:opacity-90"
//                                     >
//                                       + Add Accommodation
//                                     </button>
//                                   ) : null}
//                                 </div>
//                               </div>
//                               {accOptions[segKey]?.properties?.length ? (
//                                 <AccommodationLines
//                                   segKey={segKey}
//                                   data={accOptions[segKey]}
//                                   lines={accLines[segKey] || []}
//                                   onUpdateLine={updateAccLine}
//                                   onRemoveLine={removeAccLine}
//                                 />
//                               ) : (
//                                 <p className="text-xs text-gray-500">
//                                   Click Load to fetch available accommodations &
//                                   prices for this destination and date.
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Totals */}
//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
//         <h4 className="text-xl font-bold text-[#321F6A] mb-4">Totals</h4>
//         {Array.isArray(tour.days) && tour.days.length > 0 ? (
//           <div className="space-y-2">
//             {tour.days.map((d, i) => {
//               const t = perDayTotals[i] || { bo: 0, itin: 0 };
//               return (
//                 <div
//                   key={i}
//                   className="flex items-center justify-between border-b pb-2"
//                 >
//                   <div className="text-sm font-semibold">
//                     {d.dayLabel || `Day ${i + 1}`}
//                   </div>
//                   <div className="text-sm">
//                     <span className="mr-6">
//                       BO: <b>{t.bo}</b>
//                     </span>
//                     <span>
//                       Itinerary: <b>{t.itin}</b>
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//             <div className="flex items-center justify-between pt-3">
//               <div className="text-base font-bold">Grand Total</div>
//               <div className="text-base">
//                 <span className="mr-6">
//                   BO: <b>{grand.bo}</b>
//                 </span>
//                 <span>
//                   Itinerary: <b>{grand.itin}</b>
//                 </span>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p className="text-gray-500">No days found.</p>
//         )}
//       </div>

//       {/* Back */}
//       <div className="flex justify-end">
//         <button
//           onClick={onBack}
//           className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
//         >
//           Back
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ===================================
//    Reusable bits
// =================================== */

// function Stat({ label, value }) {
//   return (
//     <div className="p-3 rounded-xl border border-gray-200 bg-white">
//       <div className="text-[11px] uppercase tracking-wide text-gray-500">
//         {label}
//       </div>
//       <div className="text-[15px] font-semibold text-gray-800">{value}</div>
//     </div>
//   );
// }

// function ChipPanel({ title, items }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
//       <h5 className="font-semibold text-[#321F6A] mb-3">{title}</h5>
//       {Array.isArray(items) && items.length > 0 ? (
//         <div className="flex flex-wrap gap-2">
//           {items.map((t, i) => (
//             <span
//               key={i}
//               className="px-3 py-1 rounded-full bg-[rgba(133,112,238,0.08)] text-[#321F6A] border border-[rgba(133,112,238,0.2)] text-sm"
//             >
//               {t}
//             </span>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-400 text-sm">None</p>
//       )}
//     </div>
//   );
// }

// function KV({ k, v }) {
//   return (
//     <div>
//       <div className="text-[11px] uppercase tracking-wide text-gray-500">{k}</div>
//       <div className="text-[15px] font-semibold text-gray-800 break-words">
//         {v}
//       </div>
//     </div>
//   );
// }

// /* ---------- Vehicle Lines ---------- */
// function VehicleLines({ segKey, data, lines, onUpdateLine, onRemoveLine }) {
//   const { categories = [], options = {} } = data || {};
//   return (
//     <div className="mt-1 space-y-3">
//       {lines.length === 0 && (
//         <div className="text-xs text-gray-500">
//           No vehicles added yet. Click <b>Add Vehicle</b>.
//         </div>
//       )}
//       {lines.map((line) => {
//         const currentCat = line.category || "";
//         const vehicles = options[currentCat] || [];
//         const currentVeh = vehicles.find(
//           (v) => String(v.vehicleId) === String(line.vehicleId)
//         );
//         const percentage = currentVeh?.percentage ?? line.percentage ?? 0;
//         const basePrice = currentVeh?.basePrice ?? line.basePrice ?? 0;
//         const qty = line.qty ?? 0;
//         const itinUnit = Math.round(basePrice * (1 + (percentage || 0) / 100));

//         return (
//           <div
//             key={line._id}
//             className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3"
//           >
//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Category
//               </label>
//               <select
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                 value={currentCat}
//                 onChange={(e) =>
//                   onUpdateLine(segKey, line._id, {
//                     category: e.target.value,
//                     vehicleId: "",
//                     percentage: 0,
//                     basePrice: 0,
//                     qty: 0,
//                   })
//                 }
//               >
//                 <option value="">Select</option>
//                 {categories.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="md:col-span-3">
//               <label className="text-xs text-gray-600 mb-1 block">Vehicle</label>
//               <select
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                 value={line.vehicleId || ""}
//                 disabled={!currentCat}
//                 onChange={(e) => {
//                   const v = vehicles.find(
//                     (x) => String(x.vehicleId) === e.target.value
//                   );
//                   onUpdateLine(segKey, line._id, {
//                     vehicleId: v?.vehicleId || "",
//                     percentage: v?.percentage ?? 0,
//                     basePrice: v?.basePrice ?? 0,
//                   });
//                 }}
//               >
//                 <option value="">Select</option>
//                 {vehicles.map((v) => (
//                   <option key={v.vehicleId} value={v.vehicleId}>
//                     {v.vehicleName}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">%</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={`${percentage || 0}%`}
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">BO Unit</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={basePrice || 0}
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Itinerary Unit
//               </label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={itinUnit || 0}
//               />
//             </div>

//             <div className="md:col-span-2 flex items-center justify-between gap-2">
//               <Qty
//                 disabled={!line.vehicleId}
//                 qty={qty}
//                 onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
//               />
//               <IconButton
//                 danger
//                 onClick={() => onRemoveLine(segKey, line._id)}
//                 title="Remove line"
//               >
//                 <Trash2 size={16} />
//               </IconButton>
//             </div>

//             <div className="md:col-span-12 flex items-center justify-end gap-6 text-sm pt-1">
//               <div>
//                 BO: <b>{(basePrice || 0) * (qty || 0)}</b>
//               </div>
//               <div>
//                 Itinerary: <b>{(itinUnit || 0) * (qty || 0)}</b>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ---------- Food Lines ---------- */
// function FoodLines({ segKey, data, lines, onUpdateLine, onRemoveLine }) {
//   const { categories = [], typesByCategory = {}, options = {} } = data || {};
//   return (
//     <div className="mt-1 space-y-3">
//       {lines.length === 0 && (
//         <div className="text-xs text-gray-500">
//           No foods added yet. Click <b>Add Food</b>.
//         </div>
//       )}
//       {lines.map((line) => {
//         const currentCat = line.mealCategory || "";
//         const currentType = line.mealType || "";
//         const typeList = typesByCategory[currentCat] || [];
//         const items = options[currentCat]?.[currentType] || [];
//         const picked = items.find((it) => it.foodName === line.foodName);
//         const price = picked?.price ?? line.price ?? 0;
//         const percent = picked?.percent ?? line.percent ?? 0;
//         const itineraryUnit =
//           picked?.itineraryPrice != null && !isNaN(picked.itineraryPrice)
//             ? Number(picked.itineraryPrice)
//             : Math.round(Number(price) * (1 + Number(percent || 0) / 100));
//         const qty = line.qty ?? 0;

//         return (
//           <div
//             key={line._id}
//             className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3"
//           >
//             <div className="md:col-span-3">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Meal Category
//               </label>
//               <select
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                 value={currentCat}
//                 onChange={(e) =>
//                   onUpdateLine(segKey, line._id, {
//                     mealCategory: e.target.value,
//                     mealType: "",
//                     foodName: "",
//                     price: 0,
//                     percent: 0,
//                     itineraryUnit: 0,
//                     qty: 0,
//                   })
//                 }
//               >
//                 <option value="">Select</option>
//                 {categories.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="md:col-span-3">
//               <label className="text-xs text-gray-600 mb-1 block">Meal Type</label>
//               <select
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                 value={currentType}
//                 disabled={!currentCat}
//                 onChange={(e) =>
//                   onUpdateLine(segKey, line._id, {
//                     mealType: e.target.value,
//                     foodName: "",
//                     price: 0,
//                     percent: 0,
//                     itineraryUnit: 0,
//                     qty: 0,
//                   })
//                 }
//               >
//                 <option value="">Select</option>
//                 {typeList.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="md:col-span-3">
//               <label className="text-xs text-gray-600 mb-1 block">Food</label>
//               <select
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                 value={line.foodName || ""}
//                 disabled={!currentCat || !currentType}
//                 onChange={(e) => {
//                   const it = items.find((x) => x.foodName === e.target.value);
//                   onUpdateLine(segKey, line._id, {
//                     foodName: it?.foodName || "",
//                     price: it?.price ?? 0,
//                     percent: it?.percent ?? 0,
//                     itineraryUnit:
//                       it?.itineraryPrice != null && !isNaN(it.itineraryPrice)
//                         ? Number(it.itineraryPrice)
//                         : Math.round(
//                             Number(it?.price || 0) *
//                               (1 + Number(it?.percent || 0) / 100)
//                           ),
//                     vendorId: it?.vendor || null, // store vendor id
//                   });
//                 }}
//               >
//                 <option value="">Select</option>
//                 {items.map((it) => (
//                   <option key={it.foodName} value={it.foodName}>
//                     {it.foodName}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">%</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={`${percent || 0}%`}
//               />
//             </div>
//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">BO</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={price || 0}
//               />
//             </div>
//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">Itin</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={itineraryUnit || 0}
//               />
//             </div>

//             <div className="md:col-span-12 md:flex md:items-center md:justify-between">
//               <div className="mt-2 md:mt-0">
//                 <Qty
//                   disabled={!line.foodName}
//                   qty={qty}
//                   onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
//                 />
//               </div>
//               <div className="flex items-center gap-6 text-sm mt-2 md:mt-0">
//                 <div>
//                   BO: <b>{(price || 0) * (qty || 0)}</b>
//                 </div>
//                 <div>
//                   Itinerary: <b>{(itineraryUnit || 0) * (qty || 0)}</b>
//                 </div>
//                 <IconButton
//                   danger
//                   onClick={() => onRemoveLine(segKey, line._id)}
//                   title="Remove food"
//                 >
//                   <Trash2 size={16} />
//                 </IconButton>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ---------- Activity Lines ---------- */
// function ActivityLines({ segKey, lines, onQty, onRemove }) {
//   return (
//     <div className="mt-1 space-y-3">
//       {lines.map((line) => {
//         const price = Number(line.price || 0);
//         const percentage = Number(line.percentage || 0);
//         const itinUnit = Number.isFinite(line.itineraryUnit)
//           ? Number(line.itineraryUnit)
//           : Math.round(price * (1 + percentage / 100));
//         const qty = Number(line.qty || 0);

//         return (
//           <div
//             key={line._id}
//             className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3"
//           >
//             <div className="md:col-span-5">
//               <div className="text-xs text-gray-600 mb-1">Activity</div>
//               <div className="font-semibold text-gray-800">{line.name}</div>
//             </div>

//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">%</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={`${percentage || 0}%`}
//               />
//             </div>
//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 BO Unit
//               </label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={price || 0}
//               />
//             </div>
//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Itinerary Unit
//               </label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={itinUnit || 0}
//               />
//             </div>

//             <div className="md:col-span-2 flex items-center justify-between gap-2">
//               <Qty
//                 disabled={!line.activityId}
//                 qty={qty}
//                 onChange={(q) => onQty(segKey, line._id, q)}
//               />
//               <IconButton
//                 danger
//                 onClick={() => onRemove(segKey, line._id)}
//                 title="Remove activity"
//               >
//                 <Trash2 size={16} />
//               </IconButton>
//             </div>

//             <div className="md:col-span-12 flex items-center justify-end gap-6 text-sm pt-1">
//               <div>
//                 BO: <b>{(price || 0) * (qty || 0)}</b>
//               </div>
//               <div>
//                 Itinerary: <b>{(itinUnit || 0) * (qty || 0)}</b>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ---------- Accommodation Lines ---------- */
// function AccommodationLines({
//   segKey,
//   data,
//   lines,
//   onUpdateLine,
//   onRemoveLine,
// }) {
//   const props = data?.properties || [];
//   return (
//     <div className="mt-1 space-y-3">
//       {lines.length === 0 && (
//         <div className="text-xs text-gray-500">
//           No accommodations added yet. Click <b>Add Accommodation</b>.
//         </div>
//       )}
//       {lines.map((line) => {
//         const selectedProp = props.find(
//           (p) => String(p.accommodationId) === String(line.accommodationId)
//         );
//         const roomTypes = selectedProp?.roomTypes || [];

//         const pickedRoom = roomTypes.find((r) => r.code === line.roomTypeCode);
//         const commission = selectedProp?.commission ?? line.commission ?? 0;
//         const bo = pickedRoom?.bo ?? line.bo ?? 0;
//         const itinerary = pickedRoom?.itinerary ?? line.itinerary ?? 0;
//         const qty = line.qty ?? 0;

//         return (
//           <div
//             key={line._id}
//             className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3"
//           >
//             {/* Property */}
//             <div className="md:col-span-3">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Property
//               </label>
//               <select
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                 value={line.accommodationId || ""}
//                 onChange={(e) => {
//                   const p = props.find(
//                     (x) => String(x.accommodationId) === e.target.value
//                   );
//                   onUpdateLine(segKey, line._id, {
//                     accommodationId: p?.accommodationId || "",
//                     propertyName: p?.propertyName || "",
//                     hotelCategory: p?.hotelCategory || "",
//                     roomCategory: p?.roomCategory || "",
//                     commission: p?.commission ?? 0,
//                     roomTypeCode: "",
//                     bo: 0,
//                     itinerary: 0,
//                     qty: 0,
//                   });
//                 }}
//               >
//                 <option value="">Select</option>
//                 {props.map((p) => (
//                   <option key={p.accommodationId} value={p.accommodationId}>
//                     {p.propertyName}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Hotel Category */}
//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Hotel Category
//               </label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={line.hotelCategory || ""}
//               />
//             </div>

//             {/* Room Category */}
//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Room Category
//               </label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={line.roomCategory || ""}
//               />
//             </div>

//             {/* Room Type */}
//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">
//                 Room Type
//               </label>
//               <select
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                 value={line.roomTypeCode || ""}
//                 disabled={!selectedProp}
//                 onChange={(e) => {
//                   const r = roomTypes.find((x) => x.code === e.target.value);
//                   onUpdateLine(segKey, line._id, {
//                     roomTypeCode: r?.code || "",
//                     bo: r?.bo ?? 0,
//                     itinerary: r?.itinerary ?? 0,
//                   });
//                 }}
//               >
//                 <option value="">Select</option>
//                 {roomTypes.map((r) => (
//                   <option key={r.code} value={r.code}>
//                     {r.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Commission % */}
//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">%</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={`${commission || 0}%`}
//               />
//             </div>

//             {/* BO Unit */}
//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">BO</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={bo || 0}
//               />
//             </div>

//             {/* Itinerary Unit */}
//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">Itin</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={itinerary || 0}
//               />
//             </div>

//             {/* Qty + remove */}
//             <div className="md:col-span-12 md:flex md:items-center md:justify-between">
//               <div className="mt-2 md:mt-0">
//                 <Qty
//                   disabled={!line.roomTypeCode}
//                   qty={qty}
//                   onChange={(q) => onUpdateLine(segKey, line._id, { qty: q })}
//                 />
//               </div>
//               <div className="flex items-center gap-6 text-sm mt-2 md:mt-0">
//                 <div>
//                   BO: <b>{(bo || 0) * (qty || 0)}</b>
//                 </div>
//                 <div>
//                   Itinerary: <b>{(itinerary || 0) * (qty || 0)}</b>
//                 </div>
//                 <IconButton
//                   danger
//                   onClick={() => onRemoveLine(segKey, line._id)}
//                   title="Remove accommodation"
//                 >
//                   <Trash2 size={16} />
//                 </IconButton>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ---------- tiny UI bits ---------- */
// function Qty({ disabled, qty, onChange }) {
//   return (
//     <div className="flex items-center gap-2">
//       <button
//         type="button"
//         className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
//         disabled={disabled}
//         onClick={() => onChange(Math.max(0, (qty || 0) - 1))}
//         aria-label="decrement"
//       >
//         <Minus size={16} />
//       </button>
//       <div className="min-w-[3rem] text-center font-semibold">{qty || 0}</div>
//       <button
//         type="button"
//         className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
//         disabled={disabled}
//         onClick={() => onChange((qty || 0) + 1)}
//         aria-label="increment"
//       >
//         <Plus size={16} />
//       </button>
//     </div>
//   );
// }

// function IconButton({ children, onClick, danger, title }) {
//   return (
//     <button
//       type="button"
//       className={[
//         "w-9 h-9 rounded-lg flex items-center justify-center",
//         danger
//           ? "bg-red-100 hover:bg-red-200 text-red-600"
//           : "bg-gray-100 hover:bg-gray-200 text-gray-700",
//       ].join(" ")}
//       onClick={onClick}
//       title={title}
//     >
//       {children}
//     </button>
//   );
// }

// src/pages/purchaser/GroupTourBO.jsx

import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Save,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

/* ---------- helpers ---------- */
const keyForSeg = (dayIdx, segIdx) => `${dayIdx}-${segIdx}`;
const toYmd = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const uid = () => Math.random().toString(36).slice(2, 10);
const toISODate = (d) => (d ? new Date(d).toISOString() : null);

/* ===================================
   MAIN
=================================== */
export default function GroupTourBO({ tourId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tour, setTour] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});

  const [vehOptions, setVehOptions] = useState({});
  const [addonVehOptions, setAddonVehOptions] = useState({});
  const [foodOptions, setFoodOptions] = useState({});
  const [actPricing, setActPricing] = useState({});
  const [accOptions, setAccOptions] = useState({});

  const [vehLines, setVehLines] = useState({});
  const [addonVehLines, setAddonVehLines] = useState({});
  const [foodLines, setFoodLines] = useState({});
  const [actLines, setActLines] = useState({});
  const [accLines, setAccLines] = useState({});

  /* ---------- Load tour ---------- */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await API.get(`/purchaser/groupTours/${tourId}`);
        if (!active) return;

        const fetched = res.data?.tour || null;
        setTour(fetched);

        if (fetched?.days?.length) {
          const v = {}, av = {}, f = {}, a = {}, ac = {};
          fetched.days.forEach((d, i) => {
            (d.segments || []).forEach((s, j) => {
              const k = keyForSeg(i, j);
              if (s.boTripVehicles?.length) v[k] = s.boTripVehicles;
              if (s.boAddonVehicles?.length) av[k] = s.boAddonVehicles;
              if (s.boFoods?.length) f[k] = s.boFoods;
              if (s.boActivities?.length) a[k] = s.boActivities;
              if (s.boAccommodations?.length) ac[k] = s.boAccommodations;
            });
          });
          setVehLines(v);
          setAddonVehLines(av);
          setFoodLines(f);
          setActLines(a);
          setAccLines(ac);
        }
      } catch (e) {
        toast.error("Failed to load group tour");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => (active = false);
  }, [tourId]);
  // AUTO-refresh prices after tour loads
  useEffect(() => {
    if (!tour || !tour.days) return;

    tour.days.forEach((day, dIdx) => {
      const dateYmd = toYmd(day.date || tour.startDate);

      (day.segments || []).forEach((seg, sIdx) => {
        const tripId = seg.trip?._id || seg.trip;
        const addonId = seg.selectedAddon?._id || seg.selectedAddon;
        const destId = seg.destination?._id || seg.destination;
        const actIds = Array.isArray(seg.selectedActivities)
          ? seg.selectedActivities.map((a) => (typeof a === "object" ? a._id : a))
          : [];

        if (tripId) fetchVehiclesForSeg(tripId, dateYmd, dIdx, sIdx);
        if (addonId) fetchAddonVehiclesForSeg(addonId, dateYmd, dIdx, sIdx);
        if (tripId) fetchFoodsForSeg(tripId, dateYmd, dIdx, sIdx);
        if (actIds.length) fetchActivitiesForSeg(actIds, dateYmd, dIdx, sIdx);
        if (destId) fetchAccForSeg(destId, dateYmd, dIdx, sIdx);
      });
    });
  }, [tour]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");
  const toggleDay = (i) => setExpandedDays((p) => ({ ...p, [i]: !p[i] }));

  const toDateOrNull = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d;
  };

  /* ---------- TRIP VEHICLES ---------- */
  const fetchVehiclesForSeg = async (tripId, dateYmd, dIdx, sIdx) => {
    const segKey = keyForSeg(dIdx, sIdx);
    if (!tripId || !dateYmd) return;

    try {
      const { data } = await API.get(`/purchaser/tripVehicles/${tripId}`, {
        params: { date: dateYmd },
      });

      setVehOptions((p) => ({ ...p, [segKey]: data }));

      setVehLines((p) => {
        const existing = p[segKey] || [];
        if (!existing.length) return { ...p, [segKey]: [] };

        const { options = {} } = data || {};
        const updated = existing.map((line) => {
          const vehicles = options[line.category] || [];
          const match = vehicles.find(
            (v) => String(v.vehicleId) === String(line.vehicleId)
          );
          if (!match) return line;

          const basePrice = match.basePrice ?? line.basePrice ?? 0;
          const advancePercentage =
            match.advancePercentage ?? line.advancePercentage ?? 0;

          const advanceUnit = Math.round(
            Number(basePrice || 0) * Number(advancePercentage || 0) / 100
          );

          return {
            ...line,
            basePrice,
            percentage: match.percentage ?? line.percentage ?? 0,
            advancePercentage,
            advanceUnit,
            advanceTotal: advanceUnit * Number(line.qty || 0),
          };
        });

        return { ...p, [segKey]: updated };
      });
    } catch (e) {
      console.error("tripVehicles fetch failed", e);
      toast.error("Failed to load vehicles for this segment.");
    }
  };

  const addVehLine = (segKey, meta = {}) => {
    setVehLines((p) => ({
      ...p,
      [segKey]: [
        ...(p[segKey] || []),
        {
          _id: uid(),
          category: "",
          vehicleId: "",
          percentage: 0,
          advancePercentage: 0,
          basePrice: 0,
          advanceUnit: 0,
          advanceTotal: 0,
          qty: 0,
          tripId: meta.tripId || "",
          tripName: meta.tripName || "",
          date: meta.date ? toISODate(meta.date) : null,
        },
      ],
    }));
  };
  const removeVehLine = (segKey, id) =>
    setVehLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));
  const updateVehLine = (segKey, id, next) =>
    setVehLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) => {
        if (l._id !== id) return l;
        const merged = { ...l, ...next };
        const basePrice = Number(merged.basePrice || 0);
        const advPerc = Number(merged.advancePercentage || 0);
        const qty = Number(merged.qty || 0);
        const advUnit = Math.round(basePrice * advPerc / 100);
        return {
          ...merged,
          advanceUnit: advUnit,
          advanceTotal: advUnit * qty,
        };
      }),
    }));

  /* ---------- FOODS ---------- */
  const fetchFoodsForSeg = async (tripId, dateYmd, dIdx, sIdx) => {
    const segKey = keyForSeg(dIdx, sIdx);
    if (!tripId || !dateYmd) return;

    const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
    const tripName =
      typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
    const dateISO = toISODate(dateYmd);

    try {
      const { data } = await API.get(`/purchaser/tripFoods/${tripId}`, {
        params: { date: dateYmd },
      });

      setFoodOptions((p) => ({ ...p, [segKey]: data }));

      setFoodLines((p) => {
        const existing = p[segKey] || [];
        if (!existing.length) return { ...p, [segKey]: [] };

        const { options = {} } = data || {};

        const updated = existing.map((line) => {
          const cat = line.mealCategory || "";
          const type = line.mealType || "";
          const itemsForType = options[cat]?.[type] || [];

          const match = itemsForType.find((it) => it.foodName === line.foodName);

          if (!match) {
            return { ...line, tripId, tripName, date: dateISO };
          }

          const price = Number(match.price ?? line.price ?? 0);
          const percent = Number(match.percent ?? line.percent ?? 0);
          const itineraryUnit =
            match.itineraryPrice != null && !isNaN(match.itineraryPrice)
              ? Number(match.itineraryPrice)
              : Math.round(price * (1 + percent / 100));

          const advancePercentage =
            match.advancePercentage ?? line.advancePercentage ?? 0;

          const advanceUnit = Math.round(price * Number(advancePercentage || 0) / 100);

          return {
            ...line,
            tripId,
            tripName,
            date: dateISO,
            price,
            percent,
            itineraryUnit,
            vendorId: match.vendor ?? line.vendorId ?? null,
            advancePercentage,
            advanceUnit,
            advanceTotal: advanceUnit * Number(line.qty || 0),
          };
        });

        return { ...p, [segKey]: updated };
      });
    } catch (e) {
      console.error("tripFoods fetch failed", e);
      toast.error("Failed to load foods for this segment.");
    }
  };

  const addFoodLine = (segKey, meta = {}) => {
    setFoodLines((p) => ({
      ...p,
      [segKey]: [
        ...(p[segKey] || []),
        {
          _id: uid(),
          mealCategory: "",
          mealType: "",
          foodName: "",
          price: 0,
          percent: 0,
          itineraryUnit: 0,
          advancePercentage: 0,
          advanceUnit: 0,
          advanceTotal: 0,
          qty: 0,
          tripId: meta.tripId || "",
          tripName: meta.tripName || "",
          date: meta.date ? toISODate(meta.date) : null,
          vendorId: null,
        },
      ],
    }));
  };
  const removeFoodLine = (segKey, id) =>
    setFoodLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));
  const updateFoodLine = (segKey, id, next) =>
    setFoodLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) => {
        if (l._id !== id) return l;
        const merged = { ...l, ...next };
        const price = Number(merged.price || 0);
        const advPerc = Number(merged.advancePercentage || 0);
        const qty = Number(merged.qty || 0);
        const advUnit = Math.round(price * advPerc / 100);
        return { ...merged, advanceUnit: advUnit, advanceTotal: advUnit * qty };
      }),
    }));

  /* ---------- ADD-ON VEHICLES ---------- */
  const fetchAddonVehiclesForSeg = async (addonTripId, dateYmd, dIdx, sIdx) => {
    const segKey = keyForSeg(dIdx, sIdx);
    if (!addonTripId || !dateYmd) return;

    try {
      const { data } = await API.get(`/purchaser/addonTripVehicles/${addonTripId}`, {
        params: { date: dateYmd },
      });

      setAddonVehOptions((p) => ({ ...p, [segKey]: data }));

      setAddonVehLines((p) => {
        const existing = p[segKey] || [];
        if (!existing.length) return { ...p, [segKey]: [] };

        const { options = {} } = data || {};

        const updated = existing.map((line) => {
          const vehicles = options[line.category] || [];
          const match = vehicles.find(
            (v) => String(v.vehicleId) === String(line.vehicleId)
          );
          if (!match) return line;

          const basePrice = match.basePrice ?? line.basePrice ?? 0;
          const advancePercentage =
            match.advancePercentage ?? line.advancePercentage ?? 0;

          const advanceUnit = Math.round(
            Number(basePrice || 0) * Number(advancePercentage || 0) / 100
          );

          return {
            ...line,
            basePrice,
            percentage: match.percentage ?? line.percentage ?? 0,
            advancePercentage,
            advanceUnit,
            advanceTotal: advanceUnit * Number(line.qty || 0),
          };
        });

        return { ...p, [segKey]: updated };
      });
    } catch (e) {
      console.error("addonTripVehicles fetch failed", e);
      toast.error("Failed to load add-on vehicles for this segment.");
    }
  };

  const addAddonVehLine = (segKey, meta = {}) => {
    setAddonVehLines((p) => ({
      ...p,
      [segKey]: [
        ...(p[segKey] || []),
        {
          _id: uid(),
          category: "",
          vehicleId: "",
          percentage: 0,
          advancePercentage: 0,
          basePrice: 0,
          advanceUnit: 0,
          advanceTotal: 0,
          qty: 0,
          addonTripId: meta.addonTripId || "",
          addonTripName: meta.addonTripName || "",
          date: meta.date ? toISODate(meta.date) : null,
        },
      ],
    }));
  };
  const removeAddonVehLine = (segKey, id) =>
    setAddonVehLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));
  const updateAddonVehLine = (segKey, id, next) =>
    setAddonVehLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) => {
        if (l._id !== id) return l;
        const merged = { ...l, ...next };
        const basePrice = Number(merged.basePrice || 0);
        const advPerc = Number(merged.advancePercentage || 0);
        const qty = Number(merged.qty || 0);
        const advUnit = Math.round(basePrice * advPerc / 100);
        return {
          ...merged,
          advanceUnit: advUnit,
          advanceTotal: advUnit * qty,
        };
      }),
    }));

  /* ---------- ACTIVITIES ---------- */
  const fetchActivitiesForSeg = async (activityIds, dateYmd, dIdx, sIdx) => {
    const segKey = keyForSeg(dIdx, sIdx);
    if (!Array.isArray(activityIds) || !activityIds.length || !dateYmd) {
      toast.info("No activities to load for this segment.");
      return;
    }

    const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
    const tripId = seg?.trip?._id || seg?.trip || "";
    const tripName =
      typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
    const dateISO = toISODate(dateYmd);

    try {
      const ids = activityIds
        .map((a) => (typeof a === "object" ? a._id : a))
        .filter(Boolean)
        .join(",");

      const { data } = await API.get(`/purchaser/activitiesPricing`, {
        params: { ids, date: dateYmd },
      });

      const map = {};
      (data.items || []).forEach((it) => {
        map[it.activityId] = {
          name: it.activityName,
          price: Number(it.price || 0),
          percentage: Number(it.percentage || 0),
          itineraryPrice: Number(it.itineraryPrice || 0),
          advancePercentage: Number(it.advancePercentage || 0),
        };
      });
      setActPricing((p) => ({ ...p, [segKey]: map }));

      setActLines((p) => {
        const existing = p[segKey] || [];
        const items = data.items || [];

        if (existing.length) {
          const updated = existing.map((line) => {
            const match = items.find(
              (it) => String(it.activityId) === String(line.activityId)
            );

            if (!match) {
              return { ...line, tripId, tripName, date: dateISO };
            }

            const price = Number(match.price || 0);
            const percentage = Number(match.percentage || 0);
            const itineraryUnit =
              match.itineraryPrice != null && !isNaN(match.itineraryPrice)
                ? Number(match.itineraryPrice)
                : Math.round(price * (1 + percentage / 100));

            const advancePercentage =
              Number(match.advancePercentage ?? line.advancePercentage ?? 0);

            const advanceUnit = Math.round(price * advancePercentage / 100);

            return {
              ...line,
              tripId,
              tripName,
              date: dateISO,
              price,
              percentage,
              itineraryUnit,
              advancePercentage,
              advanceUnit,
              advanceTotal: advanceUnit * Number(line.qty || 0),
            };
          });

          return { ...p, [segKey]: updated };
        }

        const fresh = items.map((it) => {
          const price = Number(it.price || 0);
          const percentage = Number(it.percentage || 0);
          const itineraryUnit =
            it.itineraryPrice != null && !isNaN(it.itineraryPrice)
              ? Number(it.itineraryPrice)
              : Math.round(price * (1 + percentage / 100));

          const advancePercentage = Number(it.advancePercentage || 0);
          const advanceUnit = Math.round(price * advancePercentage / 100);

          return {
            _id: uid(),
            activityId: it.activityId,
            name: it.activityName,
            price,
            percentage,
            itineraryUnit,
            advancePercentage,
            advanceUnit,
            advanceTotal: advanceUnit * 0,
            qty: 0,
            tripId,
            tripName,
            date: dateISO,
          };
        });

        return { ...p, [segKey]: fresh };
      });
    } catch (e) {
      console.error("activitiesPricing fetch failed", e);
      toast.error("Failed to load activities pricing for this segment.");
    }
  };

  const removeActLine = (segKey, id) =>
    setActLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));

  const updateActQty = (segKey, id, qty) =>
    setActLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) => {
        if (l._id !== id) return l;
        const price = Number(l.price || 0);
        const advPerc = Number(l.advancePercentage || 0);
        const advUnit = Math.round(price * advPerc / 100);
        return { ...l, qty, advanceUnit: advUnit, advanceTotal: advUnit * Number(qty || 0) };
      }),
    }));

  /* ---------- ACCOMMODATIONS ---------- */
  const fetchAccForSeg = async (destinationId, dateYmd, dIdx, sIdx) => {
    const segKey = keyForSeg(dIdx, sIdx);
    if (!destinationId || !dateYmd) return;

    const seg = tour?.days?.[dIdx]?.segments?.[sIdx];
    const tripId = seg?.trip?._id || seg?.trip || "";
    const tripName =
      typeof seg?.trip === "object" ? seg?.trip?.tripName || "" : seg?.trip || "";
    const dateISO = toISODate(dateYmd);

    try {
      const { data } = await API.get(`/purchaser/accommodationsPricing`, {
        params: { destinationId, date: dateYmd },
      });

      setAccOptions((p) => ({ ...p, [segKey]: data }));

      setAccLines((p) => {
        const existing = p[segKey] || [];
        if (!existing.length) return { ...p, [segKey]: [] };

        const props = data?.properties || [];

        const updated = existing.map((line) => {
          const prop = props.find(
            (x) => String(x.accommodationId) === String(line.accommodationId)
          );

          if (!prop) {
            return { ...line, tripId, tripName, date: dateISO };
          }

          const roomTypes = prop.roomTypes || [];
          const room = roomTypes.find((r) => r.code === line.roomTypeCode);

          const advancePercentage =
            Number(prop.advancePercentage ?? line.advancePercentage ?? 0);

          let next = {
            ...line,
            tripId,
            tripName,
            date: dateISO,
            hotelCategory: prop.hotelCategory || line.hotelCategory || "",
            roomCategory: prop.roomCategory || line.roomCategory || "",
            commission: prop.commission ?? line.commission ?? 0,
            advancePercentage,
          };

          if (room) {
            next = {
              ...next,
              bo: room.bo ?? line.bo ?? 0,
              itinerary: room.itinerary ?? line.itinerary ?? 0,
            };
          }

          const boUnit = Number(next.bo || 0);
          const qty = Number(next.qty || 0);
          const advUnit = Math.round(boUnit * advancePercentage / 100);

          return {
            ...next,
            advanceUnit: advUnit,
            advanceTotal: advUnit * qty,
          };
        });

        return { ...p, [segKey]: updated };
      });
    } catch (e) {
      console.error("accommodationsPricing fetch failed", e);
      toast.error("Failed to load accommodations for this segment.");
    }
  };

  const addAccLine = (segKey, meta = {}) => {
    setAccLines((p) => ({
      ...p,
      [segKey]: [
        ...(p[segKey] || []),
        {
          _id: uid(),
          accommodationId: "",
          propertyName: "",
          hotelCategory: "",
          roomCategory: "",
          roomTypeCode: "",
          commission: 0,
          bo: 0,
          itinerary: 0,
          advancePercentage: 0,
          advanceUnit: 0,
          advanceTotal: 0,
          qty: 0,
          tripId: meta.tripId || "",
          tripName: meta.tripName || "",
          date: meta.date ? toISODate(meta.date) : null,
        },
      ],
    }));
  };

  const removeAccLine = (segKey, id) =>
    setAccLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).filter((l) => l._id !== id),
    }));

  const updateAccLine = (segKey, id, next) =>
    setAccLines((p) => ({
      ...p,
      [segKey]: (p[segKey] || []).map((l) => {
        if (l._id !== id) return l;
        const merged = { ...l, ...next };
        const boUnit = Number(merged.bo || 0);
        const advPerc = Number(merged.advancePercentage || 0);
        const qty = Number(merged.qty || 0);
        const advUnit = Math.round(boUnit * advPerc / 100);
        return { ...merged, advanceUnit: advUnit, advanceTotal: advUnit * qty };
      }),
    }));
  /* ---------- Totals ---------- */
  const { perDayTotals, grand } = useMemo(() => {
    const perDay = {};
    let totalBO = 0;
    let totalItin = 0;
    let totalAdv = 0;

    const add = (i, bo, itin, adv) => {
      perDay[i] = perDay[i] || { bo: 0, itin: 0, adv: 0 };
      perDay[i].bo += bo;
      perDay[i].itin += itin;
      perDay[i].adv += adv;
      totalBO += bo;
      totalItin += itin;
      totalAdv += adv;
    };

    const run = (map, calc) => {
      for (const segKey in map) {
        const [iStr] = segKey.split("-");
        const i = Number(iStr);
        for (const sel of map[segKey] || []) {
          if (!sel.qty) continue;
          const { bo, itin, adv } = calc(sel);
          add(i, bo, itin, adv);
        }
      }
    };

    run(vehLines, (sel) => {
      const base = Number(sel.basePrice || 0);
      const qty = Number(sel.qty || 0);
      const perc = Number(sel.percentage || 0);
      const advPerc = Number(sel.advancePercentage || 0);

      const bo = base * qty;
      const itinUnit = Math.round(base * (1 + perc / 100));
      const itin = itinUnit * qty;

      const advUnit = Math.round(base * advPerc / 100);
      const adv = advUnit * qty;

      return { bo, itin, adv };
    });

    run(foodLines, (sel) => {
      const price = Number(sel.price || 0);
      const qty = Number(sel.qty || 0);
      const percent = Number(sel.percent || 0);
      const advPerc = Number(sel.advancePercentage || 0);

      const bo = price * qty;

      const itinUnit = Number.isFinite(sel.itineraryUnit)
        ? Number(sel.itineraryUnit)
        : Math.round(price * (1 + percent / 100));

      const itin = itinUnit * qty;

      const advUnit = Math.round(price * advPerc / 100);
      const adv = advUnit * qty;

      return { bo, itin, adv };
    });

    run(addonVehLines, (sel) => {
      const base = Number(sel.basePrice || 0);
      const qty = Number(sel.qty || 0);
      const perc = Number(sel.percentage || 0);
      const advPerc = Number(sel.advancePercentage || 0);

      const bo = base * qty;
      const itinUnit = Math.round(base * (1 + perc / 100));
      const itin = itinUnit * qty;

      const advUnit = Math.round(base * advPerc / 100);
      const adv = advUnit * qty;

      return { bo, itin, adv };
    });

    run(actLines, (sel) => {
      const price = Number(sel.price || 0);
      const qty = Number(sel.qty || 0);
      const perc = Number(sel.percentage || 0);
      const advPerc = Number(sel.advancePercentage || 0);

      const itinUnit = Number.isFinite(sel.itineraryUnit)
        ? Number(sel.itineraryUnit)
        : Math.round(price * (1 + perc / 100));

      const bo = price * qty;
      const itin = itinUnit * qty;

      const advUnit = Math.round(price * advPerc / 100);
      const adv = advUnit * qty;

      return { bo, itin, adv };
    });

    run(accLines, (sel) => {
      const boUnit = Number(sel.bo || 0);
      const qty = Number(sel.qty || 0);
      const advPerc = Number(sel.advancePercentage || 0);

      const bo = boUnit * qty;
      const itinUnit = Number(sel.itinerary || 0);
      const itin = itinUnit * qty;

      const advUnit = Math.round(boUnit * advPerc / 100);
      const adv = advUnit * qty;

      return { bo, itin, adv };
    });

    return {
      perDayTotals: perDay,
      grand: { bo: totalBO, itin: totalItin, adv: totalAdv },
    };
  }, [vehLines, foodLines, addonVehLines, actLines, accLines]);

  /* ---------- Save ---------- */
  const handleSave = async () => {
    try {
      setSaving(true);
      await API.put(`/purchaser/groupTours/${tourId}/bo`, {
        vehLines,
        addonVehLines,
        foodLines,
        actLines,
        accLines,
        totalBO: grand.bo,
        totalItinerary: grand.itin,
        totalAdvance: grand.adv,
        // NOTE: you can also send totalAdvance if you decide later
      });

      toast.success("Booking order saved");

      const res = await API.get(`/purchaser/groupTours/${tourId}`);
      setTour(res.data?.tour || null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save booking order");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelTour = async () => {
    try {
      if (!tourId) return;
      setSaving(true);
      await API.delete(`/purchaser/groupTours/${tourId}`);
      toast.success("Group Tour deleted successfully!");
      if (onBack) onBack();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete group tour");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Render ---------- */
  if (!tourId) {
    return (
      <div className="p-6 rounded-2xl bg-white text-gray-600">No tour selected.</div>
    );
  }
  if (loading) {
    return (
      <div className="p-10 rounded-2xl bg-white flex items-center gap-3 text-gray-600">
        <Loader2 className="animate-spin" /> Loading booking order…
      </div>
    );
  }
  if (!tour) {
    return (
      <div className="p-6 rounded-2xl bg-white text-red-500">Tour not found.</div>
    );
  }

  const topCountry =
    typeof tour.country === "object" ? tour.country?.name : tour.country;
  const topState = typeof tour.state === "object" ? tour.state?.name : tour.state;
  const topDest =
    typeof tour.destination === "object" ? tour.destination?.name : tour.destination;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#321F6A] tracking-tight">
              {tour.tourName || "Group Tour"}
            </h3>
            <p className="text-sm text-gray-500">
              Article: <span className="font-medium">{tour.articleNumber || "-"}</span>{" "}
              • Category: <span className="font-medium">{tour.category || "-"}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Start Date</div>
            <div className="text-lg font-semibold">{fmtDate(tour.startDate)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Stat label="Country" value={topCountry || "-"} />
          <Stat label="State" value={topState || "-"} />
          <Stat label="Destination" value={topDest || "-"} />
          <Stat
            label="Days / Nights"
            value={`${tour.totalDays ?? "-"} / ${tour.totalNights ?? "-"}`}
          />
          <Stat
  label="Price / Pax"
  value={
    Number(tour?.totalPax || 0) > 0
      ? String(Math.ceil(Number(grand.itin || 0) / Number(tour.totalPax || 0)))
      : "0"
  }
/>

          <Stat label="Total Pax" value={tour.totalPax != null ? String(tour.totalPax) : "-"} />
          <Stat
  label="Advance / Pax"
  value={
    Number(tour?.totalPax || 0) > 0
      ? String(Math.ceil(Number(grand.adv || 0) / Number(tour.totalPax || 0)))
      : "0"
  }
/>

          <Stat label="Risk Amount" value={tour.riskAmount != null ? String(tour.riskAmount) : "-"} />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <button
            onClick={handleCancelTour}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <XCircle size={16} />
            Cancel Group Tour
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#8570EE] text-white hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : "Activate Tour"}
          </button>
        </div>
      </div>

      {/* Includes / Excludes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChipPanel title="Includes" items={tour.includes || []} />
        <ChipPanel title="Excludes" items={tour.excludes || []} />
      </div>

      {/* Itinerary */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h4 className="text-xl font-bold text-[#321F6A] mb-4">Itinerary</h4>
        {(tour.days || []).length === 0 ? (
          <p className="text-gray-500">No day-wise details.</p>
        ) : (
          <div className="space-y-4">
            {tour.days.map((day, i) => {
              const open = !!expandedDays[i];
              const dayDateYmd = toYmd(day.date || tour.startDate);

              return (
                <div key={i} className="border border-gray-200 rounded-xl">
                  <button
                    onClick={() => toggleDay(i)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {open ? <ChevronDown /> : <ChevronRight />}
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">
                          {day.dayLabel || `Day ${i + 1}`}
                        </div>
                        <div className="text-xs text-gray-500">{fmtDate(day.date)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Array.isArray(day.segments) ? `${day.segments.length} segment(s)` : "0"}
                    </div>
                  </button>

                  {open && (
                    <div className="px-4 pb-4">
                      {(day.segments || []).map((s, j) => {
                        const segCountry =
                          typeof s.country === "object" ? s.country?.name : s.country;
                        const segState =
                          typeof s.state === "object" ? s.state?.name : s.state;
                        const segDest =
                          typeof s.destination === "object"
                            ? s.destination?.name
                            : s.destination;

                        const segTrip =
                          typeof s.trip === "object" ? s.trip?.tripName : s.trip;

                        const segAddon =
                          typeof s.selectedAddon === "object"
                            ? s.selectedAddon?.addontripName
                            : s.selectedAddon;

                        const acts = Array.isArray(s.selectedActivities)
                          ? s.selectedActivities.map((a) => (typeof a === "object" ? a._id : a))
                          : [];

                        const segKey = keyForSeg(i, j);
                        const tripId = s.trip?._id || s.trip;
                        const addonId = s.selectedAddon?._id || s.selectedAddon;
                        const destId = s.destination?._id || s.destination;

                        return (
                          <div
                            key={j}
                            className="mt-3 rounded-lg border border-gray-200 p-3 bg-gray-50 space-y-4"
                          >
                            {/* Basic segment info */}
                            <div className="text-sm grid grid-cols-1 md:grid-cols-3 gap-2">
                              <KV k="Country" v={segCountry || "-"} />
                              <KV k="State" v={segState || "-"} />
                              <KV k="Destination" v={segDest || "-"} />
                              <KV k="Trip" v={segTrip || "-"} />
                              <KV k="Add-on" v={segAddon || "-"} />
                              <KV
                                k="Activities"
                                v={
                                  Array.isArray(s.selectedActivities) && s.selectedActivities.length
                                    ? s.selectedActivities
                                        .map((a) => (typeof a === "object" ? a.activityName : a))
                                        .join(", ")
                                    : "-"
                                }
                              />
                            </div>

                            {/* Trip Vehicles */}
                            <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-gray-700">Trip Vehicles</div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => fetchVehiclesForSeg(tripId, dayDateYmd, i, j)}
                                    className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                    disabled={!tripId || !dayDateYmd}
                                  >
                                    Load
                                  </button>
                                  {vehOptions[segKey] && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        addVehLine(segKey, { tripId, tripName: segTrip, date: dayDateYmd })
                                      }
                                      className="text-sm px-3 py-1 rounded-lg bg-[#8570EE] text-white hover:opacity-90"
                                    >
                                      + Add
                                    </button>
                                  )}
                                </div>
                              </div>

                              {vehOptions[segKey] ? (
                                <VehicleLines
                                  segKey={segKey}
                                  data={vehOptions[segKey]}
                                  lines={vehLines[segKey] || []}
                                  onUpdateLine={(k, id, next) => updateVehLine(k, id, next)}
                                  onRemoveLine={(k, id) => removeVehLine(k, id)}
                                />
                              ) : (
                                <p className="text-xs text-gray-500">
                                  Click Load to fetch available vehicles & prices.
                                </p>
                              )}
                            </div>

                            {/* Add-on Trip Vehicles */}
                            {addonId && (
                              <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="font-semibold text-gray-700">Add-on Trip Vehicles</div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => fetchAddonVehiclesForSeg(addonId, dayDateYmd, i, j)}
                                      className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                      disabled={!addonId || !dayDateYmd}
                                    >
                                      Load
                                    </button>
                                    {addonVehOptions[segKey] && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          addAddonVehLine(segKey, {
                                            addonTripId: addonId,
                                            addonTripName: segAddon,
                                            date: dayDateYmd,
                                          })
                                        }
                                        className="text-sm px-3 py-1 rounded-lg bg-[#8570EE] text-white hover:opacity-90"
                                      >
                                        + Add
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {addonVehOptions[segKey] ? (
                                  <VehicleLines
                                    segKey={segKey}
                                    data={addonVehOptions[segKey]}
                                    lines={addonVehLines[segKey] || []}
                                    onUpdateLine={(k, id, next) => updateAddonVehLine(k, id, next)}
                                    onRemoveLine={(k, id) => removeAddonVehLine(k, id)}
                                  />
                                ) : (
                                  <p className="text-xs text-gray-500">
                                    Click Load to fetch add-on vehicles & prices.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Activities */}
                            <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-gray-700">Activities (Priced)</div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => fetchActivitiesForSeg(acts, dayDateYmd, i, j)}
                                    className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                    disabled={!acts?.length || !dayDateYmd}
                                  >
                                    Load
                                  </button>
                                </div>
                              </div>

                              {actLines[segKey]?.length ? (
                                <ActivityLines
                                  segKey={segKey}
                                  lines={actLines[segKey]}
                                  onQty={(k, id, q) => updateActQty(k, id, q)}
                                  onRemove={(k, id) => removeActLine(k, id)}
                                />
                              ) : (
                                <p className="text-xs text-gray-500">
                                  {acts?.length
                                    ? "Click Load to fetch prices for selected activities."
                                    : "No activities selected in this segment."}
                                </p>
                              )}
                            </div>

                            {/* Trip Foods */}
                            <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-gray-700">Trip Food</div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => fetchFoodsForSeg(tripId, dayDateYmd, i, j)}
                                    className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                    disabled={!tripId || !dayDateYmd}
                                  >
                                    Load
                                  </button>
                                  {foodOptions[segKey] && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        addFoodLine(segKey, { tripId, tripName: segTrip, date: dayDateYmd })
                                      }
                                      className="text-sm px-3 py-1 rounded-lg bg-[#8570EE] text-white hover:opacity-90"
                                    >
                                      + Add
                                    </button>
                                  )}
                                </div>
                              </div>

                              {foodOptions[segKey] ? (
                                <FoodLines
                                  segKey={segKey}
                                  data={foodOptions[segKey]}
                                  lines={foodLines[segKey] || []}
                                  onUpdateLine={updateFoodLine}
                                  onRemoveLine={removeFoodLine}
                                />
                              ) : (
                                <p className="text-xs text-gray-500">
                                  Click Load to fetch available foods & prices.
                                </p>
                              )}
                            </div>

                            {/* Accommodation */}
                            <div className="rounded-lg border border-gray-200 p-3 bg-white space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-gray-700">Accommodation</div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => fetchAccForSeg(destId, dayDateYmd, i, j)}
                                    className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                    disabled={!destId || !dayDateYmd}
                                  >
                                    Load
                                  </button>
                                  {accOptions[segKey]?.properties?.length ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        addAccLine(segKey, { tripId, tripName: segTrip, date: dayDateYmd })
                                      }
                                      className="text-sm px-3 py-1 rounded-lg bg-[#8570EE] text-white hover:opacity-90"
                                    >
                                      + Add
                                    </button>
                                  ) : null}
                                </div>
                              </div>

                              {accOptions[segKey]?.properties?.length ? (
                                <AccommodationLines
                                  segKey={segKey}
                                  data={accOptions[segKey]}
                                  lines={accLines[segKey] || []}
                                  onUpdateLine={updateAccLine}
                                  onRemoveLine={removeAccLine}
                                />
                              ) : (
                                <p className="text-xs text-gray-500">
                                  Click Load to fetch available accommodations & prices for this destination and date.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h4 className="text-xl font-bold text-[#321F6A] mb-4">Totals</h4>
        {Array.isArray(tour.days) && tour.days.length > 0 ? (
          <div className="space-y-2">
            {tour.days.map((d, i) => {
              const t = perDayTotals[i] || { bo: 0, itin: 0, adv: 0 };
              return (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div className="text-sm font-semibold">{d.dayLabel || `Day ${i + 1}`}</div>
                  <div className="text-sm">
                    <span className="mr-6">
                      BO: <b>{t.bo}</b>
                    </span>
                    <span className="mr-6">
                      Itinerary: <b>{t.itin}</b>
                    </span>
                    <span>
                      Advance: <b>{t.adv}</b>
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-3">
              <div className="text-base font-bold">Grand Total</div>
              <div className="text-base">
                <span className="mr-6">
                  BO: <b>{grand.bo}</b>
                </span>
                <span className="mr-6">
                  Itinerary: <b>{grand.itin}</b>
                </span>
                <span>
                  Advance: <b>{grand.adv}</b>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No days found.</p>
        )}
      </div>

      {/* Back */}
      <div className="flex justify-end">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Back
        </button>
      </div>
    </div>
  );
}
/* ===================================
   Reusable bits
=================================== */

function Stat({ label, value }) {
  return (
    <div className="p-3 rounded-xl border border-gray-200 bg-white">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="text-[15px] font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function ChipPanel({ title, items }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h5 className="font-semibold text-[#321F6A] mb-3">{title}</h5>
      {Array.isArray(items) && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-[rgba(133,112,238,0.08)] text-[#321F6A] border border-[rgba(133,112,238,0.2)] text-sm"
            >
              {t}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">None</p>
      )}
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{k}</div>
      <div className="text-[15px] font-semibold text-gray-800 break-words">
        {v}
      </div>
    </div>
  );
}

/* ---------- Vehicle Lines ---------- */
function VehicleLines({ segKey, data, lines, onUpdateLine, onRemoveLine }) {
  const { categories = [], options = {} } = data || {};
  return (
    <div className="mt-1 space-y-3">
      {lines.length === 0 && (
        <div className="text-xs text-gray-500">
          No vehicles added yet. Click <b>Add Vehicle</b>.
        </div>
      )}

      {lines.map((line) => {
        const currentCat = line.category || "";
        const vehicles = options[currentCat] || [];
        const currentVeh = vehicles.find(
          (v) => String(v.vehicleId) === String(line.vehicleId)
        );

        const percentage = currentVeh?.percentage ?? line.percentage ?? 0;
        const basePrice = currentVeh?.basePrice ?? line.basePrice ?? 0;

        const advancePercentage =
          currentVeh?.advancePercentage ?? line.advancePercentage ?? 0;

        const qty = line.qty ?? 0;

        const itinUnit = Math.round(basePrice * (1 + (percentage || 0) / 100));
        const advUnit = Math.round(
          Number(basePrice || 0) * Number(advancePercentage || 0) / 100
        );

        return (
          <div
            key={line._id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3"
          >
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={currentCat}
                onChange={(e) =>
                  onUpdateLine(segKey, line._id, {
                    category: e.target.value,
                    vehicleId: "",
                    percentage: 0,
                    advancePercentage: 0,
                    basePrice: 0,
                    advanceUnit: 0,
                    advanceTotal: 0,
                    qty: 0,
                  })
                }
              >
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-gray-600 mb-1 block">Vehicle</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={line.vehicleId || ""}
                disabled={!currentCat}
                onChange={(e) => {
                  const v = vehicles.find((x) => String(x.vehicleId) === e.target.value);
                  const advPerc = Number(v?.advancePercentage ?? 0);
                  const base = Number(v?.basePrice ?? 0);
                  const advU = Math.round(base * advPerc / 100);

                  onUpdateLine(segKey, line._id, {
                    vehicleId: v?.vehicleId || "",
                    percentage: v?.percentage ?? 0,
                    advancePercentage: advPerc,
                    basePrice: base,
                    advanceUnit: advU,
                    advanceTotal: advU * Number(line.qty || 0),
                  });
                }}
              >
                <option value="">Select</option>
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.vehicleName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">%</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={`${percentage || 0}%`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">BO Unit</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={basePrice || 0}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Itinerary Unit</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={itinUnit || 0}
              />
            </div>

            {/* ✅ Advance % */}
            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Adv %</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={`${advancePercentage || 0}%`}
              />
            </div>

            {/* ✅ Advance Unit */}
            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Adv Unit</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={advUnit || 0}
              />
            </div>

            <div className="md:col-span-12 md:flex md:items-center md:justify-between">
              <div className="mt-2 md:mt-0">
                <Qty
                  disabled={!line.vehicleId}
                  qty={qty}
                  onChange={(q) =>
                    onUpdateLine(segKey, line._id, {
                      qty: q,
                      advanceTotal: advUnit * Number(q || 0),
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-6 text-sm mt-2 md:mt-0">
                <div>
                  BO: <b>{(basePrice || 0) * (qty || 0)}</b>
                </div>
                <div>
                  Itinerary: <b>{(itinUnit || 0) * (qty || 0)}</b>
                </div>
                <div>
                  Advance: <b>{(advUnit || 0) * (qty || 0)}</b>
                </div>

                <IconButton
                  danger
                  onClick={() => onRemoveLine(segKey, line._id)}
                  title="Remove line"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Food Lines ---------- */
function FoodLines({ segKey, data, lines, onUpdateLine, onRemoveLine }) {
  const { categories = [], typesByCategory = {}, options = {} } = data || {};
  return (
    <div className="mt-1 space-y-3">
      {lines.length === 0 && (
        <div className="text-xs text-gray-500">
          No foods added yet. Click <b>Add Food</b>.
        </div>
      )}

      {lines.map((line) => {
        const currentCat = line.mealCategory || "";
        const currentType = line.mealType || "";
        const typeList = typesByCategory[currentCat] || [];
        const items = options[currentCat]?.[currentType] || [];
        const picked = items.find((it) => it.foodName === line.foodName);

        const price = picked?.price ?? line.price ?? 0;
        const percent = picked?.percent ?? line.percent ?? 0;

        const itineraryUnit =
          picked?.itineraryPrice != null && !isNaN(picked.itineraryPrice)
            ? Number(picked.itineraryPrice)
            : Math.round(Number(price) * (1 + Number(percent || 0) / 100));

        const advancePercentage =
          picked?.advancePercentage ?? line.advancePercentage ?? 0;

        const advUnit = Math.round(
          Number(price || 0) * Number(advancePercentage || 0) / 100
        );

        const qty = line.qty ?? 0;

        return (
          <div
            key={line._id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3"
          >
            <div className="md:col-span-3">
              <label className="text-xs text-gray-600 mb-1 block">Meal Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={currentCat}
                onChange={(e) =>
                  onUpdateLine(segKey, line._id, {
                    mealCategory: e.target.value,
                    mealType: "",
                    foodName: "",
                    price: 0,
                    percent: 0,
                    itineraryUnit: 0,
                    advancePercentage: 0,
                    advanceUnit: 0,
                    advanceTotal: 0,
                    qty: 0,
                  })
                }
              >
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-gray-600 mb-1 block">Meal Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={currentType}
                disabled={!currentCat}
                onChange={(e) =>
                  onUpdateLine(segKey, line._id, {
                    mealType: e.target.value,
                    foodName: "",
                    price: 0,
                    percent: 0,
                    itineraryUnit: 0,
                    advancePercentage: 0,
                    advanceUnit: 0,
                    advanceTotal: 0,
                    qty: 0,
                  })
                }
              >
                <option value="">Select</option>
                {typeList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-gray-600 mb-1 block">Food</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={line.foodName || ""}
                disabled={!currentCat || !currentType}
                onChange={(e) => {
                  const it = items.find((x) => x.foodName === e.target.value);
                  const advPerc = Number(it?.advancePercentage ?? 0);
                  const pr = Number(it?.price ?? 0);
                  const advU = Math.round(pr * advPerc / 100);

                  onUpdateLine(segKey, line._id, {
                    foodName: it?.foodName || "",
                    price: pr,
                    percent: it?.percent ?? 0,
                    itineraryUnit:
                      it?.itineraryPrice != null && !isNaN(it.itineraryPrice)
                        ? Number(it.itineraryPrice)
                        : Math.round(pr * (1 + Number(it?.percent || 0) / 100)),
                    vendorId: it?.vendor || null,
                    advancePercentage: advPerc,
                    advanceUnit: advU,
                    advanceTotal: advU * Number(line.qty || 0),
                  });
                }}
              >
                <option value="">Select</option>
                {items.map((it) => (
                  <option key={it.foodName} value={it.foodName}>
                    {it.foodName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">%</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={`${percent || 0}%`}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">BO</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={price || 0}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Itin</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={itineraryUnit || 0}
              />
            </div>

            {/* ✅ Advance % + Unit */}
            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Adv %</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={`${advancePercentage || 0}%`}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Adv Unit</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={advUnit || 0}
              />
            </div>

            <div className="md:col-span-12 md:flex md:items-center md:justify-between">
              <div className="mt-2 md:mt-0">
                <Qty
                  disabled={!line.foodName}
                  qty={qty}
                  onChange={(q) =>
                    onUpdateLine(segKey, line._id, {
                      qty: q,
                      advanceTotal: advUnit * Number(q || 0),
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-6 text-sm mt-2 md:mt-0">
                <div>
                  BO: <b>{(price || 0) * (qty || 0)}</b>
                </div>
                <div>
                  Itinerary: <b>{(itineraryUnit || 0) * (qty || 0)}</b>
                </div>
                <div>
                  Advance: <b>{(advUnit || 0) * (qty || 0)}</b>
                </div>
                <IconButton
                  danger
                  onClick={() => onRemoveLine(segKey, line._id)}
                  title="Remove food"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Activity Lines ---------- */
// function ActivityLines({ segKey, lines, onQty, onRemove }) {
//   return (
//     <div className="mt-1 space-y-3">
//       {lines.map((line) => {
//         const price = Number(line.price || 0);
//         const percentage = Number(line.percentage || 0);
//         const itinUnit = Number.isFinite(line.itineraryUnit)
//           ? Number(line.itineraryUnit)
//           : Math.round(price * (1 + percentage / 100));

//         const advancePercentage = Number(line.advancePercentage || 0);
//         const advUnit = Math.round(price * advancePercentage / 100);

//         const qty = Number(line.qty || 0);

//         return (
//           <div
//             key={line._id}
//             className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3"
//           >
//             <div className="md:col-span-3">
//               <div className="text-xs text-gray-600 mb-1">Activity</div>
//               <div className="font-semibold text-gray-800">{line.name}</div>
//             </div>
         

//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">%</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={`${percentage || 0}%`}
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">BO Unit</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={price || 0}
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className="text-xs text-gray-600 mb-1 block">Itinerary Unit</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={itinUnit || 0}
//               />
//             </div>

//             {/* ✅ Advance % + unit */}
//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">Adv %</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={`${advancePercentage || 0}%`}
//               />
//             </div>

//             <div className="md:col-span-1">
//               <label className="text-xs text-gray-600 mb-1 block">Adv Unit</label>
//               <input
//                 className="w-full border bg-gray-50 rounded-lg px-3 py-2"
//                 readOnly
//                 value={advUnit || 0}
//               />
//             </div>

//             <div className="md:col-span-2 flex items-center justify-between gap-3">
//               <Qty
//                 disabled={!line.activityId}
//                 qty={qty}
//                 onChange={(q) => onQty(segKey, line._id, q)}
//               />
//             </div>

//             <div className="md:col-span-12 flex items-center justify-end gap-6 text-sm pt-1">
//               <div>
//                 BO: <b>{(price || 0) * (qty || 0)}</b>
//               </div>
//               <div>
//                 Itinerary: <b>{(itinUnit || 0) * (qty || 0)}</b>
//               </div>
//               <div>
//                 Advance: <b>{(advUnit || 0) * (qty || 0)}</b>
//               </div>
//               <IconButton
//                 danger
//                 onClick={() => onRemove(segKey, line._id)}
//                 title="Remove activity"
//               >
//                 <Trash2 size={16} />
//               </IconButton>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
function ActivityLines({ segKey, lines, onQty, onRemove }) {
  return (
    <div className="mt-1 space-y-3">
      {lines.map((line) => {
        const price = Number(line.price || 0);
        const percentage = Number(line.percentage || 0);
        const itinUnit = Number.isFinite(line.itineraryUnit)
          ? Number(line.itineraryUnit)
          : Math.round(price * (1 + percentage / 100));

        const advancePercentage = Number(line.advancePercentage || 0);
        const advUnit = Math.round(price * advancePercentage / 100);

        const qty = Number(line.qty || 0);

        return (
          <div
            key={line._id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border border-gray-200 rounded-lg p-3"
          >
            {/* ✅ Row 1: Activity + % + BO Unit + Itinerary Unit + Adv% + Adv Unit */}
            <div className="md:col-span-5">
              <div className="text-xs text-gray-600 mb-1">Activity</div>
              <div className="font-semibold text-gray-800">{line.name}</div>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">%</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={`${percentage || 0}%`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">BO Unit</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={price || 0}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Itinerary Unit</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={itinUnit || 0}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Adv %</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={`${advancePercentage || 0}%`}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Adv Unit</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={advUnit || 0}
              />
            </div>

            {/* ✅ Row 2: Qty (left) + totals + delete (right) */}
            <div className="md:col-span-12 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-1">
              <div className="flex justify-start">
                <Qty
                  disabled={!line.activityId}
                  qty={qty}
                  onChange={(q) => onQty(segKey, line._id, q)}
                />
              </div>

              <div className="flex items-center justify-end gap-6 text-sm">
                <div>
                  BO: <b>{(price || 0) * (qty || 0)}</b>
                </div>
                <div>
                  Itinerary: <b>{(itinUnit || 0) * (qty || 0)}</b>
                </div>
                <div>
                  Advance: <b>{(advUnit || 0) * (qty || 0)}</b>
                </div>
                <IconButton
                  danger
                  onClick={() => onRemove(segKey, line._id)}
                  title="Remove activity"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Accommodation Lines ---------- */
function AccommodationLines({ segKey, data, lines, onUpdateLine, onRemoveLine }) {
  const props = data?.properties || [];
  return (
    <div className="mt-1 space-y-3">
      {lines.length === 0 && (
        <div className="text-xs text-gray-500">
          No accommodations added yet. Click <b>Add Accommodation</b>.
        </div>
      )}

      {lines.map((line) => {
        const selectedProp = props.find(
          (p) => String(p.accommodationId) === String(line.accommodationId)
        );

        const roomTypes = selectedProp?.roomTypes || [];
        const pickedRoom = roomTypes.find((r) => r.code === line.roomTypeCode);

        const commission = selectedProp?.commission ?? line.commission ?? 0;
        const bo = pickedRoom?.bo ?? line.bo ?? 0;
        const itinerary = pickedRoom?.itinerary ?? line.itinerary ?? 0;

        const advancePercentage =
          selectedProp?.advancePercentage ?? line.advancePercentage ?? 0;

        const advUnit = Math.round(Number(bo || 0) * Number(advancePercentage || 0) / 100);
        const qty = line.qty ?? 0;

        return (
          <div
            key={line._id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3"
          >
            <div className="md:col-span-3">
              <label className="text-xs text-gray-600 mb-1 block">Property</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={line.accommodationId || ""}
                onChange={(e) => {
                  const p = props.find((x) => String(x.accommodationId) === e.target.value);
                  const advPerc = Number(p?.advancePercentage ?? 0);

                  onUpdateLine(segKey, line._id, {
                    accommodationId: p?.accommodationId || "",
                    propertyName: p?.propertyName || "",
                    hotelCategory: p?.hotelCategory || "",
                    roomCategory: p?.roomCategory || "",
                    commission: p?.commission ?? 0,
                    advancePercentage: advPerc,
                    roomTypeCode: "",
                    bo: 0,
                    itinerary: 0,
                    advanceUnit: 0,
                    advanceTotal: 0,
                    qty: 0,
                  });
                }}
              >
                <option value="">Select</option>
                {props.map((p) => (
                  <option key={p.accommodationId} value={p.accommodationId}>
                    {p.propertyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Hotel Category</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={line.hotelCategory || ""}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Room Category</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={line.roomCategory || ""}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Room Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={line.roomTypeCode || ""}
                disabled={!selectedProp}
                onChange={(e) => {
                  const r = roomTypes.find((x) => x.code === e.target.value);
                  const boVal = Number(r?.bo ?? 0);
                  const advPerc = Number(advancePercentage || 0);
                  const advU = Math.round(boVal * advPerc / 100);

                  onUpdateLine(segKey, line._id, {
                    roomTypeCode: r?.code || "",
                    bo: boVal,
                    itinerary: r?.itinerary ?? 0,
                    advanceUnit: advU,
                    advanceTotal: advU * Number(line.qty || 0),
                  });
                }}
              >
                <option value="">Select</option>
                {roomTypes.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">%</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={`${commission || 0}%`}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">BO</label>
              <input className="w-full border bg-gray-50 rounded-lg px-3 py-2" readOnly value={bo || 0} />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Itin</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={itinerary || 0}
              />
            </div>

            {/* ✅ Advance % + unit */}
            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Adv %</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={`${advancePercentage || 0}%`}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-600 mb-1 block">Adv Unit</label>
              <input
                className="w-full border bg-gray-50 rounded-lg px-3 py-2"
                readOnly
                value={advUnit || 0}
              />
            </div>

            <div className="md:col-span-12 md:flex md:items-center md:justify-between">
              <div className="mt-2 md:mt-0">
                <Qty
                  disabled={!line.roomTypeCode}
                  qty={qty}
                  onChange={(q) =>
                    onUpdateLine(segKey, line._id, {
                      qty: q,
                      advanceTotal: advUnit * Number(q || 0),
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-6 text-sm mt-2 md:mt-0">
                <div>
                  BO: <b>{(bo || 0) * (qty || 0)}</b>
                </div>
                <div>
                  Itinerary: <b>{(itinerary || 0) * (qty || 0)}</b>
                </div>
                <div>
                  Advance: <b>{(advUnit || 0) * (qty || 0)}</b>
                </div>
                <IconButton
                  danger
                  onClick={() => onRemoveLine(segKey, line._id)}
                  title="Remove accommodation"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- tiny UI bits ---------- */
function Qty({ disabled, qty, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
        disabled={disabled}
        onClick={() => onChange(Math.max(0, (qty || 0) - 1))}
        aria-label="decrement"
      >
        <Minus size={16} />
      </button>
      <div className="min-w-[3rem] text-center font-semibold">{qty || 0}</div>
      <button
        type="button"
        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
        disabled={disabled}
        onClick={() => onChange((qty || 0) + 1)}
        aria-label="increment"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function IconButton({ children, onClick, danger, title }) {
  return (
    <button
      type="button"
      className={[
        "w-9 h-9 rounded-lg flex items-center justify-center",
        danger
          ? "bg-red-100 hover:bg-red-200 text-red-600"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700",
      ].join(" ")}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
