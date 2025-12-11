import React, { useState, useEffect, useRef, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { Pencil, CheckCircle, XCircle } from "lucide-react";
import Select from "react-select";

import API from "../../api";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const CreateActivity = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [trips, setTrips] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingActivityId, setEditingActivityId] = useState(null);

  const [priceFields, setPriceFields] = useState([
    { from: "", to: "", price: "", percentage: "", itineraryPrice: "" },
  ]);

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    vendor: "",
    trip: "",
    activityName: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const fileInputRef = useRef(null);

  // ---------- react-select styles (same family as other pages) ----------
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
        opacity: 1,
        cursor: state.isDisabled ? "not-allowed" : "default",
      }),
      valueContainer: (b) => ({
        ...b,
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
      dropdownIndicator: (b) => ({
        ...b,
        color: "#6b7280",
        ":hover": { color: "#4b5563" },
      }),
      placeholder: (b) => ({ ...b, color: "#9CA3AF" }),
      singleValue: (b) => ({ ...b, color: "#111827" }),
      menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 50 }),
      option: (b, s) => ({
        ...b,
        backgroundColor: s.isSelected
          ? "rgba(133,112,238,0.16)"
          : s.isFocused
          ? "rgba(133,112,238,0.08)"
          : "white",
        color: "#111827",
        cursor: "pointer",
      }),
    }),
    []
  );

  // ---------- options ----------
  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  // const destinationOptions = destinations.map((d) => ({ value: d._id, label: d.name }));
  // const vendorOptions = vendors.map((v) => ({ value: v._id, label: v.name }));
  // const tripOptions = trips.map((t) => ({ value: t._id, label: t.tripName }));
  const destinationOptions = destinations.map((d) => ({
  value: d._id,
  label: d.activeStatus === false ? `${d.name} (inactive)` : d.name,
}));

const vendorOptions = vendors.map((v) => ({
  value: v._id,
  label: v.activeStatus === false ? `${v.name} (inactive)` : v.name,
}));

const tripOptions = trips.map((t) => ({
  value: t._id,
  label: t.activeStatus === false ? `${t.tripName} (inactive)` : t.tripName,
}));
  const fetchActivities = async () => {
    try {
      const res = await API.get("/purchaser/activities", {
        params: { page, limit: 3, search },
      });
      setActivities(res.data.activities);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch activities");
    }
  };
  useEffect(() => { fetchActivities(); }, [page, search]);

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

  const fetchStates = async (countryId) => {
    try {
      const res = await API.get(`/purchaser/states/${countryId}`);
      setStates(res.data);
    } catch (err) {
      toast.error(`Error fetching states: ${err.message}`);
    }
  };

  // const fetchDestinations = async (countryId, stateId) => {
  //   try {
  //     if (countryId && stateId) {
  //       const res = await API.get(
  //         `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`
  //       );
  //       setDestinations(res.data);
  //     } else {
  //       setDestinations([]);
  //     }
  //   } catch (err) {
  //     toast.error(`Error fetching destinations: ${err.message}`);
  //   }
  // };
  const fetchDestinations = async (countryId, stateId, currentDestinationId) => {
  try {
    if (countryId && stateId) {
      let url = `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`;
      if (currentDestinationId) {
        url += `?currentDestinationId=${encodeURIComponent(currentDestinationId)}`;
      }
      const res = await API.get(url);
      setDestinations(res.data);
    } else {
      setDestinations([]);
    }
  } catch (err) {
    toast.error(`Error fetching destinations: ${err.message}`);
  }
};


  // useEffect(() => {
  //   fetchDestinations(formData.country, formData.state);
  // }, [formData.country, formData.state]);
  useEffect(() => {
  if (!formData.country || !formData.state) return;
  if (editingActivityId) return; // 👈 don't override while editing
  fetchDestinations(formData.country, formData.state);
}, [formData.country, formData.state, editingActivityId]);

  // const fetchData = async (countryId, stateId, destinationId) => {
  //   try {
  //     if (countryId && stateId && destinationId) {
  //       const [vendorsRes, tripsRes] = await Promise.all([
  //         API.get(`/purchaser/vendorsOfActivities/${countryId}/${stateId}/${destinationId}`),
  //         API.get(`/purchaser/tripsByLocation/${countryId}/${stateId}/${destinationId}`),
  //       ]);
  //       setVendors(vendorsRes.data);
  //       setTrips(tripsRes.data);
  //     } else {
  //       setVendors([]);
  //       setTrips([]);
  //     }
  //   } catch (err) {
  //     toast.error(`Error fetching vendors/trips: ${err.message}`);
  //   }
  // };
  const fetchData = async (
  countryId,
  stateId,
  destinationId,
  currentVendorId,
  currentTripId
) => {
  try {
    if (countryId && stateId && destinationId) {
      let vendorsUrl = `/purchaser/vendorsOfActivities/${countryId}/${stateId}/${destinationId}`;
      if (currentVendorId) {
        vendorsUrl += `?currentVendorId=${encodeURIComponent(currentVendorId)}`;
      }

      let tripsUrl = `/purchaser/tripsByLocation/${countryId}/${stateId}/${destinationId}`;
      if (currentTripId) {
        tripsUrl += `?currentTripId=${encodeURIComponent(currentTripId)}`;
      }

      const [vendorsRes, tripsRes] = await Promise.all([
        API.get(vendorsUrl),
        API.get(tripsUrl),
      ]);

      setVendors(vendorsRes.data);
      setTrips(tripsRes.data);
    } else {
      setVendors([]);
      setTrips([]);
    }
  } catch (err) {
    toast.error(`Error fetching vendors/trips: ${err.message}`);
  }
};

  // useEffect(() => {
  //   fetchData(formData.country, formData.state, formData.destination);
  // }, [formData.country, formData.state, formData.destination]);
useEffect(() => {
  if (!formData.country || !formData.state || !formData.destination) return;
  if (editingActivityId) return; // 👈 don't override while editing
  fetchData(formData.country, formData.state, formData.destination);
}, [formData.country, formData.state, formData.destination, editingActivityId]);

  const handleFieldChange = (index, field, value) => {
    const updated = [...priceFields];
    updated[index][field] = value;

    const basePrice = parseFloat(updated[index].price || 0);
    const percentage = parseFloat(updated[index].percentage || 0);
    const itineraryPrice = basePrice + (basePrice * percentage) / 100;

    updated[index].itineraryPrice = isNaN(itineraryPrice) ? "" : itineraryPrice.toFixed(2);
    setPriceFields(updated);
  };

  const addField = () => {
    setPriceFields((prev) => [
      ...prev,
      { from: "", to: "", price: "", percentage: "", itineraryPrice: "" },
    ]);
  };

  const removeField = (index) => {
    const updated = [...priceFields];
    updated.splice(index, 1);
    setPriceFields(updated);
  };

  // const handleEdit = async (activity) => {
  //   try {
  //     setEditingActivityId(activity._id);

  //     await fetchStates(activity.country?._id);
  //     await fetchDestinations(activity.country?._id, activity.state?._id);
  //     await fetchData(activity.country?._id, activity.state?._id, activity.destination?._id);

  //     setFormData({
  //       country: activity.country?._id || "",
  //       state: activity.state?._id || "",
  //       destination: activity.destination?._id || "",
  //       vendor: activity.vendor?._id || "",
  //       trip: activity.trip?._id || "",
  //       activityName: activity.activityName || "",
  //       description: activity.description || "",
  //     });

  //     setImageUrl(activity.imageUrl || "");
  //     setPriceFields(
  //       activity.prices?.length
  //         ? activity.prices.map((p) => ({
  //             from: p.validFrom?.slice(0, 10) || "",
  //             to: p.validTo?.slice(0, 10) || "",
  //             price: p.price || "",
  //             percentage: p.percentage || "",
  //             itineraryPrice: p.itineraryPrice || "",
  //           }))
  //         : [{ from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]
  //     );
  //   } catch (err) {
  //     toast.error(`Error during editing: ${err.message}`);
  //   }
  // };
const handleEdit = async (activity) => {
  try {
    setEditingActivityId(activity._id);

    const countryId = activity.country?._id;
    const stateId = activity.state?._id;
    const destinationId = activity.destination?._id;
    const vendorId = activity.vendor?._id;
    const tripId = activity.trip?._id;

    await fetchStates(countryId);
    await fetchDestinations(countryId, stateId, destinationId); // 👈 include currentDestinationId
    await fetchData(countryId, stateId, destinationId, vendorId, tripId); // 👈 include currentVendorId & currentTripId

    setFormData({
      country: countryId || "",
      state: stateId || "",
      destination: destinationId || "",
      vendor: vendorId || "",
      trip: tripId || "",
      activityName: activity.activityName || "",
      description: activity.description || "",
    });

    setImageUrl(activity.imageUrl || "");

    setPriceFields(
      activity.prices?.length
        ? activity.prices.map((p) => ({
            from: p.validFrom?.slice(0, 10) || "",
            to: p.validTo?.slice(0, 10) || "",
            price: p.price || "",
            percentage: p.percentage || "",
            itineraryPrice: p.itineraryPrice || "",
          }))
        : [{ from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]
    );
  } catch (err) {
    toast.error(`Error during editing: ${err.message}`);
  }
};

  const handleCreateActivity = async () => {
    const requiredFields = {
      country: "Country",
      state: "State",
      destination: "Destination",
      vendor: "Vendor",
      trip: "Trip",
      activityName: "Activity Name",
      description: "Activity Description",
    };

    for (let key in requiredFields) {
      if (!formData[key]) {
        toast.error(`${requiredFields[key]} is required.`);
        return;
      }
    }

    if (!priceFields.length) {
      toast.error("At least one price field is required.");
      return;
    }

    for (let i = 0; i < priceFields.length; i++) {
      const { from, to, price } = priceFields[i];
      if (!from || !to || !price) {
        toast.error(`Price row ${i + 1} is incomplete. Please fill From, To, and Price.`);
        return;
      }
      if (new Date(from) >= new Date(to)) {
        toast.error(`Price row ${i + 1}: 'From' date must be before 'To' date.`);
        return;
      }
      if (isNaN(price) || Number(price) <= 0) {
        toast.error(`Price row ${i + 1}: Price must be a positive number.`);
        return;
      }
    }

    // Overlap check
    const parsedRanges = priceFields.map((p) => ({ from: new Date(p.from), to: new Date(p.to) }));
    for (let i = 0; i < parsedRanges.length; i++) {
      for (let j = i + 1; j < parsedRanges.length; j++) {
        const a = parsedRanges[i], b = parsedRanges[j];
        if (a.from <= b.to && a.to >= b.from) {
          toast.error(`Date ranges in price row ${i + 1} and ${j + 1} are overlapping.`);
          return;
        }
      }
    }

    try {
      const payload = {
        ...formData,
        prices: priceFields.map((p) => ({
          validFrom: new Date(p.from),
          validTo: new Date(p.to),
          price: Number(p.price),
          percentage: Number(p.percentage || 0),
          itineraryPrice: Number(p.itineraryPrice || 0),
        })),
        imageUrl,
      };

      if (editingActivityId) {
        await API.put(`/purchaser/updateActivity/${editingActivityId}`, payload);
        toast.success("Activity updated successfully!");
      } else {
        await API.post("/purchaser/createActivity", payload);
        toast.success("Activity created successfully!");
      }

      // Reset to create mode
      clearAllPrefill();
      fetchActivities();
    } catch (err) {
      toast.error(`Error creating activity: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleStatusClick = (activity) => {
    setSelectedActivity(activity);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedActivity) return;
    try {
      const updatedStatus = !selectedActivity.activeStatus;
      const res = await API.patch(
        `/purchaser/updateActivityStatus/${selectedActivity._id}/status`,
        { activeStatus: updatedStatus }
      );
      if (res.data.success) {
        toast.success(`Activity ${updatedStatus ? "activated" : "deactivated"} successfully`);
        await fetchActivities();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedActivity(null);
    }
  };

  // ---------- Clear prefill (same pattern as Trip/AddOnTrip) ----------
  const clearAllPrefill = () => {
    setEditingActivityId(null);
    setFormData({
      country: "",
      state: "",
      destination: "",
      vendor: "",
      trip: "",
      activityName: "",
      description: "",
    });
    setPriceFields([{ from: "", to: "", price: "", percentage: "", itineraryPrice: "" }]);
    setStates([]);
    setDestinations([]);
    setVendors([]);
    setTrips([]);
    setImage(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] space-y-10">
      {/* Clear prefill button (only while editing) */}
      {editingActivityId && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearAllPrefill}
            title="Clear prefilled edit data"
            className="w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-50"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Filters (react-select) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
          <Select
            styles={selectStyles}
            options={countryOptions}
            placeholder="Select Country"
            value={countryOptions.find((o) => o.value === formData.country) || null}
            onChange={(opt) => {
              const value = opt?.value || "";
              setFormData((prev) => ({
                ...prev,
                country: value,
                state: "",
                destination: "",
                vendor: "",
                trip: "",
              }));
              if (value) fetchStates(value);
            }}
            isDisabled={!!editingActivityId}
            isClearable={false}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
          <Select
            styles={selectStyles}
            options={stateOptions}
            placeholder="Select State"
            value={stateOptions.find((o) => o.value === formData.state) || null}
            onChange={(opt) => {
              const value = opt?.value || "";
              setFormData((prev) => ({
                ...prev,
                state: value,
                destination: "",
                vendor: "",
                trip: "",
              }));
            }}
            isDisabled={!!editingActivityId || !formData.country}
            isClearable={false}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Destination</label>
          <Select
            styles={selectStyles}
            options={destinationOptions}
            placeholder="Select Destination"
            value={destinationOptions.find((o) => o.value === formData.destination) || null}
            onChange={(opt) => {
              const value = opt?.value || "";
              setFormData((prev) => ({
                ...prev,
                destination: value,
                vendor: "",
                trip: "",
              }));
            }}
            isDisabled={!!editingActivityId || !formData.state}
            isClearable={false}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Vendor</label>
          <Select
            styles={selectStyles}
            options={vendorOptions}
            placeholder="Select Vendor"
            value={vendorOptions.find((o) => o.value === formData.vendor) || null}
            onChange={(opt) => {
              const value = opt?.value || "";
              setFormData((prev) => ({ ...prev, vendor: value }));
            }}
            isDisabled={!!editingActivityId || !formData.destination}
            isClearable={false}
          />
        </div>
      </div>

      {/* Trip & Activity Info */}
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Trip</label>
          <Select
            styles={selectStyles}
            options={tripOptions}
            placeholder="Select Trip"
            value={tripOptions.find((o) => o.value === formData.trip) || null}
            onChange={(opt) => setFormData((prev) => ({ ...prev, trip: opt?.value || "" }))}
            isDisabled={!!editingActivityId || !formData.destination}
            isClearable={false}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Activity Name</label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition"
            placeholder="Activity name"
            value={formData.activityName}
            onChange={(e) => setFormData((prev) => ({ ...prev, activityName: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
          <div className="col-span-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Activity Description</label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm resize-none focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition"
              placeholder="Activity Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Image Upload */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Upload Image</label>
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
                      } catch {
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
                      if (fileInputRef.current) fileInputRef.current.value = "";
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

        {/* Pricing Fields */}
        <div className="space-y-6">
          {priceFields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
            >
              <input
                type="date"
                className="custom-input px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition"
                value={field.from}
                onChange={(e) => handleFieldChange(index, "from", e.target.value)}
              />
              <input
                type="date"
                className="custom-input px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition"
                value={field.to}
                onChange={(e) => handleFieldChange(index, "to", e.target.value)}
              />
              <input
                type="text"
                className="custom-input px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition"
                placeholder="Price"
                value={field.price}
                onChange={(e) => handleFieldChange(index, "price", e.target.value)}
              />
              <input
                type="number"
                placeholder="%"
                className="custom-input px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition"
                value={field.percentage}
                onChange={(e) => handleFieldChange(index, "percentage", e.target.value)}
              />
              <input
                type="text"
                placeholder="Itinerary Price"
                className="custom-input px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                value={field.itineraryPrice}
                readOnly
              />
              <div className="flex justify-center">
                {index === 0 ? (
                  <button
                    className="h-10 w-10 bg-[#8570EE] hover:bg-[#7560de] text-white rounded-md flex items-center justify-center shadow-md transition-transform hover:scale-105"
                    onClick={addField}
                    title="Add"
                    type="button"
                  >
                    <Plus size={18} />
                  </button>
                ) : (
                  <button
                    className="h-10 w-10 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center shadow-md transition-transform hover:scale-105"
                    onClick={() => removeField(index)}
                    title="Remove"
                    type="button"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleCreateActivity}
        className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
      >
        {editingActivityId ? "Update Activity" : "Create Activity"}
      </button>

      {/* Table Section */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">View Activity</h5>
        <p className="block mb-6 text-sm font-light text-gray-400">View and Edit Activity</p>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by activity name"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Sl No</th>
                <th className="px-6 py-4">ACTIVITY NAME</th>
                <th className="px-6 py-4">TRIP NAME</th>
                <th className="px-6 py-4">COUNTRY</th>
                <th className="px-6 py-4">STATE</th>
                <th className="px-6 py-4">DESTINATION</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No activities found.
                  </td>
                </tr>
              ) : (
                activities.map((activity, index) => (
                  <tr key={activity._id} className="border-b">
                    <td className="px-6 py-3 font-semibold">{(page - 1) * 3 + index + 1}</td>
                    <td className="px-6 py-3 font-semibold">{activity.activityName}</td>
                    <td className="px-6 py-3 font-semibold">{activity.trip?.tripName || "—"}</td>
                    <td className="px-6 py-3 font-semibold">{activity.country?.name || "—"}</td>
                    <td className="px-6 py-3 font-semibold">{activity.state?.name || "—"}</td>
                    <td className="px-6 py-3 font-semibold">{activity.destination?.name || "—"}</td>
                    <td className="px-6 py-4 font-semibold">
                      {activity.activeStatus ? (
                        <span
                          className="inline-flex items-center gap-1 text-green-600 cursor-pointer"
                          onClick={() => handleStatusClick(activity)}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Active
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-red-500 cursor-pointer"
                          onClick={() => handleStatusClick(activity)}
                        >
                          <XCircle className="w-5 h-5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center font-semibold">
                      <button
                        onClick={() => handleEdit(activity)}
                        className="text-gray-700 hover:text-gray-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {showPopup && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedActivity.activeStatus ? "Deactivate" : "Activate"} Activity
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {selectedActivity.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the activity:{" "}
              <span className="font-semibold">{selectedActivity.activityName}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setSelectedActivity(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  selectedActivity.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {selectedActivity.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateActivity;
