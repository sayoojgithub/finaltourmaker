import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Pencil } from "lucide-react";
import Select from "react-select";

import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const CreateAddOnTrip = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [vendors, setVendors] = useState([]);

  const [selectedVendor, setSelectedVendor] = useState("");
  const [vehiclesCache, setVehiclesCache] = useState({});
  const [trips, setTrips] = useState([]);
  const [addontrips, setAddOnTrips] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [editingTripId, setEditingTripId] = useState(null);
  const [search, setSearch] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);
  const [selectedAddOnTrip, setSelectedAddOnTrip] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [rows, setRows] = useState([
    {
      vendor: "",
      category: "",
      vehicle: "",
      prices: [{ validFrom: "", validTo: "", price: "" }],
      expanded: true,
    },
  ]);
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    approxKm: "",
    trip: "",
    addontripName: "",
    description: "",
  });

  // -------- EXACT same react-select styles as in your other pages --------
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        maxHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
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
  // ----------------------------------------------------------------------

  // ---------- Helpers to map options ----------
  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  // const destinationOptions = destinations.map((d) => ({ value: d._id, label: d.name }));
  const destinationOptions = destinations.map((d) => ({
  value: d._id,
  label: d.activeStatus === false ? `${d.name} (inactive)` : d.name,
}));
  // const tripOptions = trips.map((t) => ({ value: t._id, label: t.tripName }));
const tripOptions = trips.map((t) => ({
  value: t._id,
  label: t.activeStatus === false ? `${t.tripName} (inactive)` : t.tripName,
}));

  const fetchAddOnTrips = async () => {
    try {
      const res = await API.get(`/purchaser/addontrips?page=${page}&search=${search}`);
      setAddOnTrips(res.data.trips);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load trips");
    }
  };
  useEffect(() => { fetchAddOnTrips(); }, [page, search]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data);
      } catch (err) {
        toast.error(`Error fetching countries: ${err.message}`);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      if (editingTripId) return;
      const fetchStates = async () => {
        try {
          const res = await API.get(`/purchaser/states/${selectedCountry}`);
          setStates(res.data);
        } catch (err) {
          toast.error("Error fetching states:", err);
        }
      };
      fetchStates();
      setSelectedState("");
      setDestinations([]);
      setSelectedDestination("");
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      if (editingTripId) return;
      const fetchDestinations = async () => {
        try {
          const res = await API.get(
            `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
          );
          setDestinations(res.data);
        } catch (err) {
          toast.error("Error fetching destinations:", err);
        }
      };
      fetchDestinations();
      setSelectedDestination("");
    }
  }, [selectedState]);

  // useEffect(() => {
  //   if (selectedCountry && selectedState && selectedDestination) {
  //     const fetchVendors = async () => {
  //       try {
  //         const res = await API.get(
  //           `/purchaser/vendorsOfVehicles/${selectedCountry}/${selectedState}/${selectedDestination}`
  //         );
  //         setVendors(res.data);
  //       } catch (err) {
  //         toast.error("Error fetching vendors:", err);
  //       }
  //     };
  //     fetchVendors();

  //     setSelectedVendor("");
  //     setVehiclesCache({});
  //     setRows([
  //       {
  //         vendor: "",
  //         category: "",
  //         vehicle: "",
  //         prices: [{ validFrom: "", validTo: "", price: "" }],
  //         expanded: true,
  //       },
  //     ]);
  //   }
  // }, [selectedDestination]);
useEffect(() => {
  if (!selectedCountry || !selectedState || !selectedDestination) return;

  // ❗ in edit mode, vendors are handled inside handleEditTrip
  if (editingTripId) return;

  const fetchVendors = async () => {
    try {
      const res = await API.get(
        `/purchaser/vendorsOfVehicles/${selectedCountry}/${selectedState}/${selectedDestination}`
      );
      setVendors(res.data);
    } catch (err) {
      toast.error("Error fetching vendors:", err);
    }
  };

  fetchVendors();

  setSelectedVendor("");
  setVehiclesCache({});
  setRows([
    {
      vendor: "",
      category: "",
      vehicle: "",
      prices: [{ validFrom: "", validTo: "", price: "" }],
      expanded: true,
    },
  ]);
}, [selectedDestination, selectedCountry, selectedState, editingTripId]);

  // useEffect(() => {
  //   if (selectedCountry && selectedState && selectedDestination) {
  //     setTrips([]);
  //     if (!editingTripId) {
  //       setFormData((prev) => ({ ...prev, trip: "" }));
  //     }

  //     const fetchTrips = async () => {
  //       try {
  //         const res = await API.get(
  //           `/purchaser/tripsByLocation/${selectedCountry}/${selectedState}/${selectedDestination}`
  //         );
  //         setTrips(res.data);
  //       } catch (err) {
  //         toast.error("Error fetching Trips:", err);
  //       }
  //     };

  //     fetchTrips();
  //   }
  // }, [selectedCountry, selectedState, selectedDestination]);
useEffect(() => {
  if (!selectedCountry || !selectedState || !selectedDestination) return;

  // ❗ in edit mode, trips are loaded inside handleEditTrip (with currentTripId)
  if (editingTripId) return;

  setTrips([]);
  setFormData((prev) => ({ ...prev, trip: "" }));

  const fetchTrips = async () => {
    try {
      const res = await API.get(
        `/purchaser/tripsByLocation/${selectedCountry}/${selectedState}/${selectedDestination}`
      );
      setTrips(res.data);
    } catch (err) {
      toast.error("Error fetching Trips:", err);
    }
  };

  fetchTrips();
}, [selectedCountry, selectedState, selectedDestination, editingTripId]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        vendor: "",
        category: "",
        vehicle: "",
        prices: [{ validFrom: "", validTo: "", price: "" }],
        expanded: true,
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const addPriceRow = (rowIndex) => {
    const updated = [...rows];
    updated[rowIndex].prices.push({ validFrom: "", validTo: "", price: "" });
    setRows(updated);
  };

  const removePriceRow = (rowIndex, priceIndex) => {
    const updated = [...rows];
    updated[rowIndex].prices.splice(priceIndex, 1);
    setRows(updated);
  };

  const toggleExpand = (index) => {
    const updated = [...rows];
    updated[index].expanded = !updated[index].expanded;
    setRows(updated);
  };

  const handlePriceChange = (rowIndex, priceIndex, field, value) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex].prices[priceIndex][field] = value;
    setRows(updatedRows);
  };

  // const handleEditTrip = async (trip) => {
  //   setEditingTripId(trip._id);

  //   setFormData({
  //     addontripName: trip.addontripName,
  //     country: trip.country._id,
  //     state: trip.state._id,
  //     destination: trip.destination._id,
  //     trip: trip.trip._id,
  //     description: trip.description,
  //     approxKm: trip.approxKm,
  //   });
  //   setImageUrl(trip.imageUrl || "");

  //   setSelectedCountry(trip.country._id);

  //   // 1. Fetch states
  //   try {
  //     const statesRes = await API.get(`/purchaser/states/${trip.country._id}`);
  //     setStates(statesRes.data);
  //   } catch {
  //     toast.error("Error fetching states");
  //     return;
  //   }

  //   setSelectedState(trip.state._id);

  //   // 2. Fetch destinations
  //   try {
  //     const destRes = await API.get(
  //       `/purchaser/destinationsByCountryAndState/${trip.country._id}/${trip.state._id}`
  //     );
  //     setDestinations(destRes.data);
  //   } catch {
  //     toast.error("Error fetching destinations");
  //     return;
  //   }

  //   setSelectedDestination(trip.destination._id);

  //   // 3. Fetch vendors
  //   try {
  //     const vendorsRes = await API.get(
  //       `/purchaser/vendorsOfVehicles/${trip.country._id}/${trip.state._id}/${trip.destination._id}`
  //     );
  //     setVendors(vendorsRes.data);
  //   } catch {
  //     toast.error("Error fetching vendors");
  //     return;
  //   }

  //   try {
  //     const tripsRes = await API.get(
  //       `/purchaser/tripsByLocation/${trip.country._id}/${trip.state._id}/${trip.destination._id}`
  //     );
  //     setTrips(tripsRes.data);
  //   } catch {
  //     toast.error("Error fetching trips");
  //     return;
  //   }

  //   // 4. Cache vehicles for each vendor
  //   const newVehiclesCache = {};
  //   for (const vehicleGroup of trip.vehicles) {
  //     const vendorId = vehicleGroup.vendor._id;
  //     if (!newVehiclesCache[vendorId]) {
  //       try {
  //         const res = await API.get(
  //           `/purchaser/vehiclesForTrip/${trip.country._id}/${trip.state._id}/${trip.destination._id}/${vendorId}`
  //         );
  //         newVehiclesCache[vendorId] = res.data;
  //       } catch {
  //         toast.error("Error loading vehicles for vendor");
  //       }
  //     }
  //   }
  //   setVehiclesCache(newVehiclesCache);

  //   // 5. Set rows
  //   setRows(
  //     trip.vehicles.map((v) => ({
  //       vendor: v.vendor._id,
  //       category: v.category,
  //       vehicle: v.vehicle._id,
  //       prices: v.prices.map((p) => ({
  //         validFrom: p.validFrom?.slice(0, 10),
  //         validTo: p.validTo?.slice(0, 10),
  //         price: p.price,
  //       })),
  //       expanded: true,
  //     }))
  //   );
  // };
const handleEditTrip = async (addon) => {
  setEditingTripId(addon._id);

  // basic form fields
  setFormData({
    addontripName: addon.addontripName,
    country: addon.country._id,
    state: addon.state._id,
    destination: addon.destination._id,
    trip: addon.trip._id,
    description: addon.description,
    approxKm: addon.approxKm,
  });

  setImageUrl(addon.imageUrl || "");
  setSelectedCountry(addon.country._id);

  // 1) States
  try {
    const statesRes = await API.get(`/purchaser/states/${addon.country._id}`);
    setStates(statesRes.data);
  } catch {
    toast.error("Error fetching states");
    return;
  }
  setSelectedState(addon.state._id);

  // 2) Destinations (include current even if inactive)
  try {
    const destRes = await API.get(
      `/purchaser/destinationsByCountryAndState/${addon.country._id}/${addon.state._id}?currentDestinationId=${addon.destination._id}`
    );
    setDestinations(destRes.data);
  } catch {
    toast.error("Error fetching destinations");
    return;
  }
  setSelectedDestination(addon.destination._id);

  // 3) Trips (include current trip even if inactive)
  try {
    const tripsRes = await API.get(
      `/purchaser/tripsByLocation/${addon.country._id}/${addon.state._id}/${addon.destination._id}?currentTripId=${addon.trip._id}`
    );
    setTrips(tripsRes.data);
  } catch {
    toast.error("Error fetching trips");
    return;
  }

  // 4) Vendors (include all vendors used in this addon trip, even if inactive)
  const vendorIdSet = new Set(
    (addon.vehicles || []).map((v) => v.vendor?._id).filter(Boolean)
  );
  const vendorIdCsv = Array.from(vendorIdSet).join(",");

  try {
    const vendorsRes = await API.get(
      `/purchaser/vendorsOfVehicles/${addon.country._id}/${addon.state._id}/${addon.destination._id}?currentVendorId=${encodeURIComponent(
        vendorIdCsv
      )}`
    );
    setVendors(vendorsRes.data);
  } catch {
    toast.error("Error fetching vendors");
    return;
  }

  // 5) Vehicles (per vendor – include any inactive ones used in this addon trip)
  const vendorToVehicleIds = {};
  (addon.vehicles || []).forEach((vg) => {
    const vId = vg.vendor?._id;
    const vehId = vg.vehicle?._id;
    if (!vId || !vehId) return;
    if (!vendorToVehicleIds[vId]) vendorToVehicleIds[vId] = new Set();
    vendorToVehicleIds[vId].add(vehId);
  });

  const newVehiclesCache = {};
  for (const [vendorId, idSet] of Object.entries(vendorToVehicleIds)) {
    const csv = Array.from(idSet).join(",");
    try {
      const res = await API.get(
        `/purchaser/vehiclesForTrip/${addon.country._id}/${addon.state._id}/${addon.destination._id}/${vendorId}?currentVehicleIds=${encodeURIComponent(
          csv
        )}`
      );
      newVehiclesCache[vendorId] = res.data;
    } catch {
      toast.error("Error loading vehicles for vendor");
    }
  }
  setVehiclesCache(newVehiclesCache);

  // 6) Rows prefill
  setRows(
    (addon.vehicles || []).map((v) => ({
      vendor: v.vendor?._id || "",
      category: v.category || "",
      vehicle: v.vehicle?._id || "",
      prices: (v.prices || []).map((p) => ({
        validFrom: p.validFrom?.slice(0, 10) || "",
        validTo: p.validTo?.slice(0, 10) || "",
        price: p.price ?? "",
      })),
      expanded: true,
    }))
  );
};

  const validateVehiclePriceRanges = (rows) => {
    const vehicleDateMap = new Map();

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const vehicleId = row.vehicle;

      if (!vehicleId) continue;

      if (!vehicleDateMap.has(vehicleId)) {
        vehicleDateMap.set(vehicleId, []);
      }

      for (let priceIndex = 0; priceIndex < row.prices.length; priceIndex++) {
        const p = row.prices[priceIndex];
        const from = new Date(p.validFrom);
        const to = new Date(p.validTo);

        if (from > to) {
          toast.error(
            `Row ${rowIndex + 1}, Entry ${priceIndex + 1}: 'Valid From' must be before 'Valid To'`
          );
          return false;
        }

        const existingRanges = vehicleDateMap.get(vehicleId);

        for (const range of existingRanges) {
          const isOverlap = from <= range.to && to >= range.from;
          if (isOverlap) {
            toast.error(
              `Overlap for vehicle in:\n- Row ${rowIndex + 1}, Entry ${priceIndex + 1} \nand\n- Row ${range.rowIndex + 1}, Entry ${range.entryIndex + 1}`
            );
            return false;
          }
        }

        existingRanges.push({ from, to, rowIndex, entryIndex: priceIndex });
      }
    }

    return true;
  };

  const handleCreateTrip = async () => {
    const requiredFields = [
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "destination", label: "Destination" },
      { key: "trip", label: "Trip" },
      { key: "addontripName", label: "AddOnTrip" },
      { key: "description", label: "AddOnTrip Description" },
    ];

    for (const field of requiredFields) {
      const value = formData[field.key];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        toast.error(`${field.label} is mandatory`);
        return;
      }
    }
    const hasValidRow = rows.some(
      (row) => row.vendor && row.category && row.vehicle
    );

    if (!hasValidRow) {
      toast.error("Please add atleast one vehicle.");
      return;
    }

    const isValid = validateVehiclePriceRanges(rows);
    if (!isValid) return;

    try {
      const payload = {
        formData: {
          ...formData,
          imageUrl,
        },
        rows,
      };

      if (editingTripId) {
        await API.put(`/purchaser/updateAddOnTrip/${editingTripId}`, payload);
        toast.success("Trip updated successfully!");
      } else {
        await API.post("/purchaser/createAddOnTrip", payload);
        toast.success("Trip created successfully!");
      }

      setFormData({
        country: "",
        state: "",
        destination: "",
        approxKm: "",
        trip: "",
        addontripName: "",
        description: "",
      });
      setImageUrl("");

      setRows([
        {
          vendor: "",
          category: "",
          vehicle: "",
          prices: [{ validFrom: "", validTo: "", price: "" }],
          expanded: true,
        },
      ]);

      setSelectedCountry("");
      setSelectedState("");
      setSelectedDestination("");
      setSelectedVendor("");
      setVendors([]);
      setTrips([]);
      setVehiclesCache({});
      setStates([]);
      setDestinations([]);
      setEditingTripId(null);
      fetchAddOnTrips();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save trip");
    }
  };

  const handleStatusClick = (addontrip) => {
    setSelectedAddOnTrip(addontrip);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedAddOnTrip) return;

    try {
      const updatedStatus = !selectedAddOnTrip.activeStatus;

      const res = await API.patch(
        `/purchaser/updateAddOnTripStatus/${selectedAddOnTrip._id}/status`,
        {
          activeStatus: updatedStatus,
        }
      );

      if (res.data.success) {
        toast.success(
          `Addontrip ${updatedStatus ? "activated" : "deactivated"} successfully`
        );
        await fetchAddOnTrips();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedAddOnTrip(null);
    }
  };

  // ---------- Clear all prefilled edit data ----------
  const clearAllPrefill = () => {
    setEditingTripId(null);
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDestination("");
    setSelectedVendor("");
    setStates([]);
    setDestinations([]);
    setVendors([]);
    setTrips([]);
    setVehiclesCache({});
    setRows([
      {
        vendor: "",
        category: "",
        vehicle: "",
        prices: [{ validFrom: "", validTo: "", price: "" }],
        expanded: true,
      },
    ]);
    setFormData({
      country: "",
      state: "",
      destination: "",
      approxKm: "",
      trip: "",
      addontripName: "",
      description: "",
    });
    setImage(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Options for row-level selects
  // const vendorOptions = vendors.map((v) => ({ value: v._id, label: v.name }));
//    const vendorOptions = vendors.map((v) => ({
//   value: v._id,
//   label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
// }));

//   const categoryOptionsForVendor = (vendorId) => {
//     const categories = [
//       ...new Set((vehiclesCache[vendorId] || []).map((v) => v.category)),
//     ];
//     return categories.map((c) => ({ value: c, label: c }));
//   };

//   // const vehicleOptionsForRow = (vendorId, category) =>
//   //   (vehiclesCache[vendorId] || [])
//   //     .filter((v) => v.category === category)
//   //     .map((v) => ({ value: v._id, label: v.vehicle }));
// const vehicleOptions = (vehiclesCache[row.vendor] || [])
//   .filter((v) => v.category === row.category)
//   .map((v) => ({
//     value: v._id,
//     label: v.activeStatus === false ? `${v.vehicle} (inactive)` : v.vehicle,
//   }));
  return (
    <div className="w-full max-w-[100rem] mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 space-y-10 text-sm font-medium">
      {/* Clear prefill button */}
      {editingTripId && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearAllPrefill}
            className="w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-50"
            title="Clear prefilled edit data"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Header Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Country
          </label>
          <Select
            styles={selectStyles}
            options={countryOptions}
            placeholder="Select Country"
            value={countryOptions.find((o) => o.value === selectedCountry) || null}
            onChange={(opt) => {
              const value = opt?.value || "";
              setSelectedCountry(value);
              setFormData({ ...formData, country: value });
            }}
            isDisabled={!!editingTripId}
            isClearable
            classNamePrefix="addon-country"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            State
          </label>
          <Select
            styles={selectStyles}
            options={stateOptions}
            placeholder="Select State"
            value={stateOptions.find((o) => o.value === selectedState) || null}
            onChange={(opt) => {
              const value = opt?.value || "";
              setSelectedState(value);
              setFormData((prev) => ({ ...prev, state: value }));
            }}
            isDisabled={!!editingTripId}
            isClearable
            classNamePrefix="addon-state"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Destination
          </label>
          <Select
            styles={selectStyles}
            options={destinationOptions}
            placeholder="Select Destination"
            value={destinationOptions.find((o) => o.value === selectedDestination) || null}
            onChange={(opt) => {
              const value = opt?.value || "";
              setSelectedDestination(value);
              setFormData((prev) => ({ ...prev, destination: value }));
            }}
            isDisabled={!!editingTripId}
            isClearable
            classNamePrefix="addon-destination"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Approx KM
          </label>
          <input
            type="text"
            placeholder="Approx KM"
            className="p-2 border border-gray-300 rounded shadow-sm w-full"
            value={formData.approxKm}
            onChange={(e) => setFormData({ ...formData, approxKm: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Select Trip
        </label>
        <Select
          styles={selectStyles}
          options={tripOptions}
          placeholder="Select Trip"
          value={tripOptions.find((o) => o.value === formData.trip) || null}
          onChange={(opt) => setFormData({ ...formData, trip: opt?.value || "" })}
          isDisabled={!!editingTripId}
          isClearable
          classNamePrefix="addon-trip"
        />
      </div>

      {/* Trip Name and Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          AddOnTrip Name
        </label>
        <input
          type="text"
          placeholder="AddOnTrip Name"
          className="input-style w-full"
          value={formData.addontripName}
          onChange={(e) => setFormData({ ...formData, addontripName: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
        {/* Description */}
        <div className="col-span-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            AddOnTrip Description
          </label>
          <textarea
            placeholder="Enter trip description..."
            className="w-full h-28 resize-none p-3 border border-gray-300 rounded shadow-sm"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Image Upload */}
        <div className="col-span-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Upload Image
          </label>
          <div className="flex flex-col items-start gap-3">
            {!imageUrl ? (
              <>
                <label
                  htmlFor="image-upload"
                  className="relative group w-56 h-28 flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl shadow-inner border border-dashed border-gray-400 cursor-pointer overflow-hidden"
                >
                  <Plus className="w-6 h-6 text-gray-500" />
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    Upload Image
                  </div>
                </label>

                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    try {
                      const result = await uploadImageToCloudinary(file);
                      setImage(file);
                      setImageUrl(result.secure_url);
                      toast.success("Image uploaded");
                    } catch (err) {
                      console.error("Upload failed", err);
                      toast.error("Upload failed");
                    }
                  }}
                />
              </>
            ) : (
              <>
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-56 h-26 object-cover rounded-xl shadow-inner border"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setImageUrl("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="px-18 py-2 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-600 rounded-xl shadow transition"
                >
                  Clear Image
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Rows */}
      {rows.map((row, rowIndex) => {
        {/* const vendorOptions = vendors.map((v) => ({ value: v._id, label: v.name })); */}
        const vendorOptions = vendors.map((v) => ({
  value: v._id,
  label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
}));
        const vendorValue = vendorOptions.find((o) => o.value === row.vendor) || null;
        const categoryOptions = [
          ...new Set((vehiclesCache[row.vendor] || []).map((v) => v.category)),
        ].map((c) => ({ value: c, label: c }));
        const categoryValue = categoryOptions.find((o) => o.value === row.category) || null;
        {/* const vehicleOptions = (vehiclesCache[row.vendor] || [])
          .filter((v) => v.category === row.category)
          .map((v) => ({ value: v._id, label: v.vehicle })); */}
          const vehicleOptions = (vehiclesCache[row.vendor] || [])
  .filter((v) => v.category === row.category)
  .map((v) => ({
    value: v._id,
    label: v.activeStatus === false ? `${v.vehicle} (inactive)` : v.vehicle,
  }));
        const vehicleValue = vehicleOptions.find((o) => o.value === row.vehicle) || null;

        return (
          <div
            key={rowIndex}
            className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 space-y-4"
          >
            {/* Row Header with Collapse */}
            <div className="grid grid-cols-1 md:grid-cols-[40px_1fr_1fr_1fr_auto] gap-4 items-center">
              <button
                onClick={() => toggleExpand(rowIndex)}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-inner"
                title={row.expanded ? "Collapse" : "Expand"}
              >
                {row.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>

              {/* Vendor */}
              <Select
                styles={selectStyles}
                options={vendorOptions}
                placeholder="Select Vendor"
                value={vendorValue}
                onChange={async (opt) => {
                  const selected = opt?.value || "";
                  const updatedRows = [...rows];

                  updatedRows[rowIndex].vendor = selected;
                  updatedRows[rowIndex].category = "";
                  updatedRows[rowIndex].vehicle = "";

                  setRows(updatedRows);

                  if (!selected) return;

                  if (!vehiclesCache[selected]) {
                    if (selectedCountry && selectedState && selectedDestination) {
                      try {
                        const res = await API.get(
                          `/purchaser/vehiclesForTrip/${selectedCountry}/${selectedState}/${selectedDestination}/${selected}`
                        );
                        setVehiclesCache((prev) => ({
                          ...prev,
                          [selected]: res.data,
                        }));
                      } catch (err) {
                        toast.error("Error fetching vehicles:", err);
                      }
                    }
                  }
                }}
                isClearable
                classNamePrefix="addon-vendor"
              />

              {/* Vehicle Category */}
              <Select
                styles={selectStyles}
                options={categoryOptions}
                placeholder="Select vehicle category"
                value={categoryValue}
                onChange={(opt) => {
                  const updatedRows = [...rows];
                  updatedRows[rowIndex].category = opt?.value || "";
                  updatedRows[rowIndex].vehicle = "";
                  setRows(updatedRows);
                }}
                isDisabled={!row.vendor}
                isClearable
                classNamePrefix="addon-category"
              />

              {/* Vehicle */}
              <Select
                styles={selectStyles}
                options={vehicleOptions}
                placeholder="Select vehicle"
                value={vehicleValue}
                onChange={(opt) => {
                  const updatedRows = [...rows];
                  updatedRows[rowIndex].vehicle = opt?.value || "";
                  setRows(updatedRows);
                }}
                isDisabled={!row.vendor || !row.category}
                isClearable
                classNamePrefix="addon-vehicle"
              />

              <div className="flex justify-end">
                {rowIndex === 0 ? (
                  <button onClick={addRow} className="btn-purple" title="Add Vehicle">
                    <Plus size={18} />
                  </button>
                ) : (
                  <button onClick={() => removeRow(rowIndex)} className="btn-red" title="Remove Vehicle">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Price Rows */}
            {row.expanded && (
              <div className="space-y-3">
                {row.prices.map((priceRow, priceIndex) => (
                  <div
                    key={priceIndex}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center"
                  >
                    <input
                      type="date"
                      className="input-style"
                      placeholder="Valid From"
                      value={priceRow.validFrom}
                      onChange={(e) =>
                        handlePriceChange(rowIndex, priceIndex, "validFrom", e.target.value)
                      }
                    />
                    <input
                      type="date"
                      className="input-style"
                      placeholder="Valid To"
                      value={priceRow.validTo}
                      onChange={(e) =>
                        handlePriceChange(rowIndex, priceIndex, "validTo", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      className="input-style"
                      value={priceRow.price}
                      onChange={(e) =>
                        handlePriceChange(rowIndex, priceIndex, "price", e.target.value)
                      }
                    />
                    <div className="flex justify-end">
                      {priceIndex === 0 ? (
                        <button
                          onClick={() => addPriceRow(rowIndex)}
                          className="btn-purple"
                          title="Add Price Row"
                        >
                          <Plus size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => removePriceRow(rowIndex, priceIndex)}
                          className="btn-red"
                          title="Remove Price Row"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={handleCreateTrip}
        className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
      >
        {editingTripId ? "Update AddOnTrip" : "Create AddOnTrip"}
      </button>

      {/* Table Section */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">View AddOnTrip</h5>
        <p className="block mb-6 text-sm font-light text-gray-400">View and Edit AddOnTrip</p>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by trip name"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Sl No</th>
                <th className="px-6 py-4">ADDONTRIP NAME</th>
                <th className="px-6 py-4">COUNTRY</th>
                <th className="px-6 py-4">STATE</th>
                <th className="px-6 py-4">DESTINATION</th>
                <th className="px-6 py-4">APPROX KM</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {addontrips.map((entry, index) => (
                <tr key={entry._id || index} className="border-b">
                  <td className="px-6 py-4 font-semibold">{(page - 1) * 3 + index + 1}</td>
                  <td className="px-6 py-4 font-semibold">{entry.addontripName}</td>
                  <td className="px-6 py-4 font-semibold">{entry.country?.name}</td>
                  <td className="px-6 py-4 font-semibold">{entry.state?.name}</td>
                  <td className="px-6 py-4 font-semibold">{entry.destination?.name}</td>
                  <td className="px-6 py-4 font-semibold">{entry.approxKm}</td>
                  <td className="px-6 py-4  font-semibold">
                    {entry.activeStatus ? (
                      <span
                        className="inline-flex items-center gap-1 text-green-600 cursor-pointer"
                        onClick={() => handleStatusClick(entry)}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Active
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-red-500 cursor-pointer"
                        onClick={() => handleStatusClick(entry)}
                      >
                        <XCircle className="w-5 h-5" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    <button
                      onClick={() => handleEditTrip(entry)}
                      className="text-gray-700 hover:text-gray-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Previous
          </button>
          <span className="px-3 py-1">{page}</span>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>

      {showPopup && selectedAddOnTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedAddOnTrip.activeStatus ? "Deactivate" : "Activate"} AddOnTrip
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {selectedAddOnTrip.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the addontrip:{" "}
              <span className="font-semibold">{selectedAddOnTrip.addontripName}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setSelectedAddOnTrip(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  selectedAddOnTrip.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {selectedAddOnTrip.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAddOnTrip;

