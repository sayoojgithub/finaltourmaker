import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Pencil } from "lucide-react";

import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
const CreateTrip = () => {
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
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [editingTripId, setEditingTripId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);
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
    tripName: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);
  console.log(formData);
  console.log(rows);
  const fetchTrips = async () => {
    try {
      const res = await API.get(
        `/purchaser/trips?page=${page}&search=${search}`
      );
      setTrips(res.data.trips);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Failed to load trips");
    }
  };
  useEffect(() => {
    fetchTrips();
  }, [page, search]);
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
  useEffect(() => {
    if (selectedCountry && selectedState && selectedDestination) {
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
      // fetchVendors();
      // setSelectedVendor("");
      fetchVendors();

      setSelectedVendor("");

      setVehiclesCache({}); // clear per-vendor cache
      setRows([
        {
          vendor: "",
          category: "",
          vehicle: "",
          prices: [{ validFrom: "", validTo: "", price: "" }],
          expanded: true,
        },
      ]); // reset all rows
    }
  }, [selectedDestination]);

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
  const handleEditTrip = async (trip) => {
    setEditingTripId(trip._id);

    setFormData({
      tripName: trip.tripName,
      country: trip.country._id,
      state: trip.state._id,
      destination: trip.destination._id,
      description: trip.description,
      approxKm: trip.approxKm,
    });
    setImageUrl(trip.imageUrl || "");
    setSelectedCountry(trip.country._id);

    // 1. Fetch states
    try {
      const statesRes = await API.get(`/purchaser/states/${trip.country._id}`);
      setStates(statesRes.data);
    } catch (err) {
      toast.error("Error fetching states");
      return;
    }

    setSelectedState(trip.state._id);

    // 2. Fetch destinations
    try {
      const destRes = await API.get(
        `/purchaser/destinationsByCountryAndState/${trip.country._id}/${trip.state._id}`
      );
      setDestinations(destRes.data);
    } catch (err) {
      toast.error("Error fetching destinations");
      return;
    }

    setSelectedDestination(trip.destination._id);

    // 3. Fetch vendors
    try {
      const vendorsRes = await API.get(
        `/purchaser/vendorsOfVehicles/${trip.country._id}/${trip.state._id}/${trip.destination._id}`
      );
      setVendors(vendorsRes.data);
    } catch (err) {
      toast.error("Error fetching vendors");
      return;
    }

    // 4. Cache vehicles for each vendor
    const newVehiclesCache = {};
    for (const vehicleGroup of trip.vehicles) {
      const vendorId = vehicleGroup.vendor._id;
      if (!newVehiclesCache[vendorId]) {
        try {
          const res = await API.get(
            `/purchaser/vehiclesForTrip/${trip.country._id}/${trip.state._id}/${trip.destination._id}/${vendorId}`
          );
          newVehiclesCache[vendorId] = res.data;
        } catch (err) {
          toast.error("Error loading vehicles for vendor");
        }
      }
    }
    setVehiclesCache(newVehiclesCache);

    // 5. Set rows
    setRows(
      trip.vehicles.map((v) => ({
        vendor: v.vendor._id,
        category: v.category,
        vehicle: v.vehicle._id,
        prices: v.prices.map((p) => ({
          validFrom: p.validFrom?.slice(0, 10),
          validTo: p.validTo?.slice(0, 10),
          price: p.price,
        })),
        expanded: true,
      }))
    );
  };

  console.log(rows);
  const validateVehiclePriceRanges = (rows) => {
    const vehicleDateMap = new Map(); // vehicleId => array of {from, to, rowIndex, entryIndex}

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

        // ❌ Check if validFrom is strictly before validTo
        if (from > to) {
          toast.error(
            `Row ${rowIndex + 1}, Entry ${
              priceIndex + 1
            }: 'Valid From' must be before 'Valid To'`
          );
          return false;
        }

        const existingRanges = vehicleDateMap.get(vehicleId);

        // 🔍 Check for overlap with existing ranges for this vehicle
        for (const range of existingRanges) {
          const isOverlap = from <= range.to && to >= range.from; // Inclusive-overlap

          if (isOverlap) {
            toast.error(
              `Overlap for vehicle in:\n- Row ${rowIndex + 1}, Entry ${
                priceIndex + 1
              } \nand\n- Row ${range.rowIndex + 1}, Entry ${
                range.entryIndex + 1
              }`
            );
            return false;
          }
        }

        // ✅ Add this price to the map for future comparisons
        existingRanges.push({ from, to, rowIndex, entryIndex: priceIndex });
      }
    }

    return true; // ✅ All checks passed
  };

  const handleCreateTrip = async () => {
    const requiredFields = [
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "destination", label: "Destination" },
      { key: "tripName", label: "Trip Name" },
      { key: "description", label: "Trip Description" },
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
    // Validate pricing ranges — only per vehicle (i.e., per row)
    const isValid = validateVehiclePriceRanges(rows);
    if (!isValid) return;

    try {
      const payload = {
        formData: {
          ...formData,
          imageUrl, // ✅ Include imageUrl
        },
        rows,
      };

      if (editingTripId) {
        // Updating existing trip
        const res = await API.put(
          `/purchaser/updateTrip/${editingTripId}`,
          payload
        );
        toast.success("Trip updated successfully!");
      } else {
        // Creating new trip
        const res = await API.post("/purchaser/createTrip", payload);
        toast.success("Trip created successfully!");
      }

      // Reset state after submit
      setFormData({
        country: "",
        state: "",
        destination: "",
        approxKm: "",
        tripName: "",
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
      setVehiclesCache({});
      setStates([]);
      setDestinations([]);
      setEditingTripId(null); // Clear editing state
      fetchTrips(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to save trip");
    }
  };
  const handleStatusClick = (trip) => {
    setSelectedTrip(trip);
    setShowPopup(true);
  };
  const handleToggleStatus = async () => {
    if (!selectedTrip) return;

    try {
      const updatedStatus = !selectedTrip.activeStatus;

      const res = await API.patch(
        `/purchaser/updateTripStatus/${selectedTrip._id}/status`,
        {
          activeStatus: updatedStatus,
        }
      );

      if (res.data.success) {
        toast.success(
          `Trip ${updatedStatus ? "activated" : "deactivated"} successfully`
        );
        await fetchTrips(); // refresh table
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedTrip(null);
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 space-y-10 text-sm font-medium">
      {/* Header Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Country
          </label>
          <select
            className="p-2 border border-gray-300 rounded shadow-sm w-full  disabled:cursor-not-allowed"
            value={selectedCountry}
            disabled={!!editingTripId}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCountry(value);
              setFormData({ ...formData, country: value });
            }}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country._id} value={country._id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            State
          </label>
          <select
            className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
            value={selectedState}
            disabled={!!editingTripId}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedState(value);
              setFormData((prev) => ({ ...prev, state: value }));
            }}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state._id} value={state._id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Destination
          </label>
          <select
            className="p-2 border border-gray-300 rounded shadow-sm w-full disabled:cursor-not-allowed"
            value={selectedDestination}
            disabled={!!editingTripId}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDestination(value);
              setFormData((prev) => ({ ...prev, destination: value }));
            }}
          >
            <option value="">Select Destination</option>
            {destinations.map((dest) => (
              <option key={dest._id} value={dest._id}>
                {dest.name}
              </option>
            ))}
          </select>
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
            onChange={(e) =>
              setFormData({ ...formData, approxKm: e.target.value })
            }
          />
        </div>
      </div>

      {/* Trip Name and Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Day Trip Name
        </label>
        <input
          type="text"
          placeholder="Day Trip Name"
          className="input-style w-full"
          value={formData.tripName}
          onChange={(e) =>
            setFormData({ ...formData, tripName: e.target.value })
          }
        />
      </div>
      {/* <textarea
        placeholder="Day Trip Description"
        className="input-style w-full h-28 resize-none"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      /> */}
      {/* Trip Description & Image Upload in one row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
        {/* Trip Description - 80% */}
        <div className="col-span-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Day Trip Description
          </label>
          <textarea
            placeholder="Enter trip description..."
            className="w-full h-28 resize-none p-3 border border-gray-300 rounded shadow-sm"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Image Upload - 20% */}
        <div className="col-span-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Upload Image
          </label>
          <div className="flex flex-col items-start gap-3">
            {!imageUrl ? (
              <>
                {/* Upload / Preview Button */}
                <label
                  htmlFor="image-upload"
                  className="relative group w-56 h-28 flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl shadow-inner border border-dashed border-gray-400 cursor-pointer overflow-hidden"
                >
                  <Plus className="w-6 h-6 text-gray-500" />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    Upload Image
                  </div>
                </label>

                {/* Hidden Input */}
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
                {/* Image Preview */}
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-56 h-26 object-cover rounded-xl shadow-inner border"
                />

                {/* Clear Button */}
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
      {rows.map((row, rowIndex) => (
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
              {row.expanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
            <select
              className="input-style"
              value={row.vendor}
              onChange={async (e) => {
                const selected = e.target.value;
                const updatedRows = [...rows];

                // Update row vendor
                updatedRows[rowIndex].vendor = selected;
                updatedRows[rowIndex].category = "";
                updatedRows[rowIndex].vehicle = "";

                setRows(updatedRows);

                // Check cache first
                if (vehiclesCache[selected]) {
                  return;
                }

                // Fetch and store in cache
                if (
                  selectedCountry &&
                  selectedState &&
                  selectedDestination &&
                  selected
                ) {
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
              }}
            >
              <option value="">Select Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>

            <select
              className="input-style"
              value={row.category}
              onChange={(e) => {
                const updatedRows = [...rows];
                updatedRows[rowIndex].category = e.target.value;
                updatedRows[rowIndex].vehicle = ""; // Clear vehicle if category changes
                setRows(updatedRows);
              }}
            >
              <option value="">Select vehicle category</option>
              {[
                ...new Set(
                  (vehiclesCache[row.vendor] || []).map((v) => v.category)
                ),
              ].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="input-style"
              value={row.vehicle}
              onChange={(e) => {
                const updatedRows = [...rows];
                updatedRows[rowIndex].vehicle = e.target.value;
                setRows(updatedRows);
              }}
            >
              <option value="">Select vehicle</option>
              {(vehiclesCache[row.vendor] || [])
                .filter((v) => v.category === row.category)
                .map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicle}
                  </option>
                ))}
            </select>

            <div className="flex justify-end">
              {rowIndex === 0 ? (
                <button
                  onClick={addRow}
                  className="btn-purple"
                  title="Add Vehicle"
                >
                  <Plus size={18} />
                </button>
              ) : (
                <button
                  onClick={() => removeRow(rowIndex)}
                  className="btn-red"
                  title="Remove Vehicle"
                >
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
                      handlePriceChange(
                        rowIndex,
                        priceIndex,
                        "validFrom",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="date"
                    className="input-style"
                    placeholder="Valid To"
                    value={priceRow.validTo}
                    onChange={(e) =>
                      handlePriceChange(
                        rowIndex,
                        priceIndex,
                        "validTo",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="text"
                    placeholder="Price"
                    className="input-style"
                    value={priceRow.price}
                    onChange={(e) =>
                      handlePriceChange(
                        rowIndex,
                        priceIndex,
                        "price",
                        e.target.value
                      )
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
      ))}
      <button
        onClick={handleCreateTrip}
        className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
      >
        {editingTripId ? "Update Trip" : "Create Trip"}
      </button>
      {/* Table Section */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
          View Trip
        </h5>
        <p className="block mb-6 text-sm font-light text-gray-400">
          View and Edit Trip
        </p>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by trip name"
            value={search}
            onChange={(e) => {
              setPage(1); // reset to first page on new search
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
                <th className="px-6 py-4">TRIP NAME</th>
                <th className="px-6 py-4">COUNTRY</th>
                <th className="px-6 py-4">STATE</th>
                <th className="px-6 py-4">DESTINATION</th>
                <th className="px-6 py-4">APPROX KM</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((entry, index) => (
                <tr key={entry._id || index} className="border-b">
                  <td className="px-6 py-4 font-semibold">
                    {(page - 1) * 3 + index + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold">{entry.tripName}</td>
                  <td className="px-6 py-4 font-semibold">
                    {entry.country?.name}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {entry.state?.name}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {entry.destination?.name}
                  </td>
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
      {showPopup && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedTrip.activeStatus ? "Deactivate" : "Activate"} Trip
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {selectedTrip.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the trip:{" "}
              <span className="font-semibold">{selectedTrip.tripName}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setSelectedTrip(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  selectedTrip.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {selectedTrip.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTrip;
