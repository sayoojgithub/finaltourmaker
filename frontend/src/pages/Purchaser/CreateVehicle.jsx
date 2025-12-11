
import { Plus, CheckCircle, XCircle, Pencil } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const categories = ["2 Wheeler", "4 Seater", "6 Seater", "7 Seater"];

const CreateVehicle = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // IDs kept as strings (API contracts unchanged)
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");

  // React-Select option objects (for UI only)
  const [countryOpt, setCountryOpt] = useState(null);
  const [stateOpt, setStateOpt] = useState(null);
  const [destinationOpt, setDestinationOpt] = useState(null);
  const [vendorOpt, setVendorOpt] = useState(null);
  const [categoryOpt, setCategoryOpt] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    vehicle: "",
    percentage: "",
  });

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVehicleRow, setSelectedVehicleRow] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const fileInputRef = useRef(null);

  // ---------- shared react-select styles (same as your CreateClient) ----------
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

  // Map arrays -> options
  const countryOptions = countries.map((c) => ({ _id: c._id, value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ _id: s._id, value: s._id, label: s.name }));
  // const destinationOptions = destinations.map((d) => ({ _id: d._id, value: d._id, label: d.name }));
  const destinationOptions = destinations.map((d) => ({
  _id: d._id,
  value: d._id,
  label: d.activeStatus ? d.name : `${d.name} (inactive)`, // needs activeStatus from backend
}));

  // const vendorOptions = vendors.map((v) => ({ _id: v._id, value: v._id, label: v.name }));
  const vendorOptions = vendors.map((v) => ({
  _id: v._id,
  value: v._id,
  label: v.activeStatus ? v.name : `${v.name} (inactive)`, // 👈 shows inactive in edit
}));
  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  // Fetch countries on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data || []);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    })();
  }, []);

  // Fetch states when country changes (skip if editing prefill in progress)
  useEffect(() => {
    if (!selectedCountry || editingVehicleId) return;
    (async () => {
      try {
        const res = await API.get(`/purchaser/states/${selectedCountry}`);
        setStates(res.data || []);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    })();
    // reset chain
    setSelectedState("");
    setStateOpt(null);
    setDestinations([]);
    setSelectedDestination("");
    setDestinationOpt(null);
    setVendors([]);
    setSelectedVendor("");
    setVendorOpt(null);
  }, [selectedCountry, editingVehicleId]);

  // Fetch destinations when state changes
  useEffect(() => {
    if (!selectedCountry || !selectedState || editingVehicleId) return;
    (async () => {
      try {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
        );
        setDestinations(res.data || []);
      } catch (err) {
        console.error("Error fetching destinations:", err);
      }
    })();
    setSelectedDestination("");
    setDestinationOpt(null);
    setVendors([]);
    setSelectedVendor("");
    setVendorOpt(null);
  }, [selectedState, selectedCountry, editingVehicleId]);

  // Fetch vendors when destination changes
  useEffect(() => {
    if (!selectedCountry || !selectedState || !selectedDestination || editingVehicleId) return;
    (async () => {
      try {
        const res = await API.get(
          `/purchaser/vendorsOfVehicles/${selectedCountry}/${selectedState}/${selectedDestination}`
        );
        setVendors(res.data || []);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    })();
    setSelectedVendor("");
    setVendorOpt(null);
  }, [selectedDestination, selectedCountry, selectedState, editingVehicleId]);

  // Fetch vehicles when page/search changes
  const fetchVehicles = async () => {
    try {
      const res = await API.get(
        `/purchaser/vehicles?page=${page}&limit=3&search=${encodeURIComponent(searchTerm)}`
      );
      setVehicles(res.data?.vehicles || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };
  useEffect(() => {
    fetchVehicles();
  }, [page, searchTerm]);

  const handleEdit = async (vehicle) => {
    try {
      setEditingVehicleId(vehicle._id);

      // Set IDs for chain
      const cId = vehicle.country?._id || "";
      const sId = vehicle.state?._id || "";
      const dId = vehicle.destination?._id || "";
      const vId = vehicle.vendor?._id || "";

      setSelectedCountry(cId);
      setSelectedState(sId);
      setSelectedDestination(dId);

      // Load dependent lists in parallel
      // const [statesRes, destinationsRes, vendorsRes] = await Promise.all([
      //   API.get(`/purchaser/states/${cId}`),
      //   API.get(`/purchaser/destinationsByCountryAndState/${cId}/${sId}`),
      //   API.get(`/purchaser/vendorsOfVehicles/${cId}/${sId}/${dId}`),
      // ]);
     const [statesRes, destinationsRes, vendorsRes] = await Promise.all([
  API.get(`/purchaser/states/${cId}`),
  API.get(
    `/purchaser/destinationsByCountryAndState/${cId}/${sId}`,
    {
      params: {
        currentDestinationId: dId || undefined, // 👈 include current destination
      },
    }
  ),
  API.get(
    `/purchaser/vendorsOfVehicles/${cId}/${sId}/${dId}`,
    {
      params: {
        currentVendorId: vId || undefined, // 👈 include current vendor
      },
    }
  ),
]);

      setStates(statesRes.data || []);
      setDestinations(destinationsRes.data || []);
      setVendors(vendorsRes.data || []);

      // Sync option objects (for selects)
      const cOpt = (countries.length ? countryOptions : (await API.get("/purchaser/countries")).data.map((c) => ({ _id: c._id, value: c._id, label: c.name })))
        .find((o) => o.value === cId) || null;
      if (!countries.length) setCountries((await API.get("/purchaser/countries")).data || []);
      setCountryOpt(cOpt);

      const sOpt = (statesRes.data || []).map((s) => ({ _id: s._id, value: s._id, label: s.name }))
        .find((o) => o.value === sId) || null;
      setStateOpt(sOpt);

      // const dOpt = (destinationsRes.data || []).map((d) => ({ _id: d._id, value: d._id, label: d.name }))
      //   .find((o) => o.value === dId) || null;
      // setDestinationOpt(dOpt);
      const dOpt = (destinationsRes.data || [])
  .map((d) => ({ _id: d._id, value: d._id, label: d.activeStatus ? d.name : `${d.name} (inactive)` }))
  .find((o) => o.value === dId) || null;
setDestinationOpt(dOpt);
      setSelectedVendor(vId);
      // const vOpt = (vendorsRes.data || []).map((v) => ({ _id: v._id, value: v._id, label: v.name }))
      //   .find((o) => o.value === vId) || null;
      // setVendorOpt(vOpt);
      const vOpt = (vendorsRes.data || [])
  .map((v) => ({ _id: v._id, value: v._id, label: v.activeStatus ? v.name : `${v.name} (inactive)` }))
  .find((o) => o.value === vId) || null;
setVendorOpt(vOpt);

      // Prefill form
      setFormData({
        category: vehicle.category || "",
        vehicle: vehicle.vehicle || "",
        percentage: vehicle.percentage?.toString() || "",
      });
      setCategoryOpt(vehicle.category ? { value: vehicle.category, label: vehicle.category } : null);
      setImageUrl(vehicle.imageUrl || "");
      setImage(null);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading vehicle data:", error);
      toast.error("Failed to load vehicle details");
      setEditingVehicleId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const { vehicle, category, percentage } = formData;
      const required = {
        selectedCountry: "Country",
        selectedState: "State",
        selectedDestination: "Destination",
        selectedVendor: "Vendor",
        category: "Category",
        vehicle: "Vehicle Name",
        percentage: "percentage",
      };
      for (const [key, label] of Object.entries(required)) {
        // eslint-disable-next-line no-eval
        if (!eval(key)) {
          toast.error(`${label} is mandatory`);
          return;
        }
      }

      const payload = {
        countryId: selectedCountry,
        stateId: selectedState,
        destinationId: selectedDestination,
        vendorId: selectedVendor,
        category,
        vehicle,
        imageUrl,
        percentage: Number(percentage),
      };

      if (editingVehicleId) {
        await API.put(`/purchaser/updateVehicle/${editingVehicleId}`, payload);
        toast.success("Vehicle updated successfully");
        setEditingVehicleId(null);
      } else {
        await API.post("/purchaser/createVehicles", payload);
        toast.success("Vehicle created successfully");
      }

      clearForm(); // reset fields
      await fetchVehicles();
    } catch (err) {
      console.error("Error saving vehicle:", err);
    }
  };

  const clearForm = () => {
    setSelectedVendor("");
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDestination("");
    setCountryOpt(null);
    setStateOpt(null);
    setDestinationOpt(null);
    setVendorOpt(null);
    setStates([]);
    setDestinations([]);
    setVendors([]);
    setFormData({ category: "", vehicle: "", percentage: "" });
    setCategoryOpt(null);
    setImageUrl("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // NEW: Clear edit (cross button)
  const clearEditAndReset = () => {
    clearForm();
    setEditingVehicleId(null);
  };

  const handleStatusClick = (vehicle) => {
    setSelectedVehicleRow(vehicle);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedVehicleRow) return;
    try {
      const updatedStatus = !selectedVehicleRow.activeStatus;
      const res = await API.patch(
        `/purchaser/updateVehicleStatus/${selectedVehicleRow._id}/status`,
        { activeStatus: updatedStatus }
      );
      if (res.data.success) {
        toast.success(
          `Vehicle ${updatedStatus ? "activated" : "deactivated"} successfully`
        );
        await fetchVehicles();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedVehicleRow(null);
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-xl space-y-12 mb-6">
      {/* Form Block */}
      <div className="space-y-10">
        {/* Top Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Country */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
            <Select
              options={countryOptions}
              value={countryOpt}
              onChange={(opt) => {
                setCountryOpt(opt || null);
                const id = opt?.value || "";
                setSelectedCountry(id);
              }}
              placeholder="Select Country"
              styles={selectStyles}
              classNamePrefix="veh-country"
              getOptionValue={(o) => String(o._id || o.value)}
              isClearable
              isDisabled={!!editingVehicleId}
            />
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
            <Select
              options={stateOptions}
              value={stateOpt}
              onChange={(opt) => {
                setStateOpt(opt || null);
                const id = opt?.value || "";
                setSelectedState(id);
              }}
              placeholder="Select State"
              styles={selectStyles}
              classNamePrefix="veh-state"
              getOptionValue={(o) => String(o._id || o.value)}
              isClearable
              isDisabled={!!editingVehicleId || !selectedCountry}
            />
          </div>

          {/* Destination */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Destination</label>
            <Select
              options={destinationOptions}
              value={destinationOpt}
              onChange={(opt) => {
                setDestinationOpt(opt || null);
                const id = opt?.value || "";
                setSelectedDestination(id);
              }}
              placeholder="Select Destination"
              styles={selectStyles}
              classNamePrefix="veh-destination"
              getOptionValue={(o) => String(o._id || o.value)}
              isClearable
              isDisabled={!!editingVehicleId || !selectedState}
            />
          </div>
        </div>

        {/* Vehicle Add Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Vendor */}
          <Select
            options={vendorOptions}
            value={vendorOpt}
            onChange={(opt) => {
              setVendorOpt(opt || null);
              const id = opt?.value || "";
              setSelectedVendor(id);
            }}
            placeholder="Select Vendor"
            styles={selectStyles}
            classNamePrefix="veh-vendor"
            getOptionValue={(o) => String(o._id || o.value)}
            isClearable
            isDisabled={!!editingVehicleId || !selectedDestination}
          />

          {/* Category */}
          <Select
            options={categoryOptions}
            value={categoryOpt}
            onChange={(opt) => {
              setCategoryOpt(opt || null);
              setFormData((p) => ({ ...p, category: opt?.value || "" }));
            }}
            placeholder="Select vehicle category"
            styles={selectStyles}
            classNamePrefix="veh-category"
            getOptionValue={(o) => String(o.value)}
            isClearable
            isDisabled={!!editingVehicleId}
          />

          {/* Vehicle Name */}
          <input
            type="text"
            value={formData.vehicle}
            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            disabled={!!editingVehicleId}
            placeholder="Enter vehicle name"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:cursor-not-allowed"
          />

          {/* Percentage + Image controls */}
          <div className="flex gap-3 w-full items-center">
            <input
              type="number"
              placeholder=" %"
              value={formData.percentage || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, percentage: e.target.value }))}
              className="h-14 w-28 px-4 text-sm border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              min={0}
              max={100}
            />
            {/* Upload / Preview Button */}
            <label
              htmlFor="image-upload"
              className="relative group w-14 h-14 flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl shadow-inner border border-dashed border-gray-400 cursor-pointer overflow-hidden"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Plus className="w-5 h-5 text-gray-500" />
              )}
              {!imageUrl && (
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Upload Image
                </div>
              )}
            </label>

            {/* Hidden File Input */}
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

            {/* Clear Image */}
            <button
              onClick={() => {
                setImage(null);
                setImageUrl("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="h-14 px-5 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-600 rounded-xl shadow-md transition"
            >
              Clear Image
            </button>
          </div>

          {/* Actions row (full width) */}
          <div className="col-span-full flex flex-col items-center gap-2 w-full mt-2">
            {/* NEW: Clear edit (cross) only in edit mode */}
            {editingVehicleId && (
              <button
                type="button"
                onClick={clearEditAndReset}
                aria-label="Clear edit and reset form"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full
                           bg-white/70 backdrop-blur-md border border-gray-200 shadow
                           text-gray-700 hover:bg-white transition"
                title="Discard changes"
              >
                ×
              </button>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={handleSubmit}
                className="flex-1 h-12 flex justify-center items-center bg-[#8570EE] hover:bg-[#6e5bd9] text-white rounded-xl shadow-md transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                {editingVehicleId ? "Update Vehicle" : "Add Vehicle"}
              </button>

              <button
                onClick={clearForm}
                className="flex-1 h-12 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">View Vehicles</h5>
        <p className="block mb-6 text-sm font-light text-gray-400">View and Delete Vehicles</p>

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Destination"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Sl No</th>
                <th className="px-6 py-4">Vehicle Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Vendor Name</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Percentage</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Edit</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle, idx) => (
                <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{(page - 1) * 3 + idx + 1}</td>
                  <td className="px-6 py-4 font-semibold">{vehicle.vehicle}</td>
                  <td className="px-6 py-4 font-semibold">{vehicle.category}</td>
                  <td className="px-6 py-4 font-semibold">{vehicle.vendor?.name || "-"}</td>
                  <td className="px-6 py-4 font-semibold">{vehicle.destination?.name || "-"}</td>
                  <td className="px-6 py-4 font-semibold">{vehicle.percentage || "-"}</td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {vehicle.activeStatus ? (
                      <span
                        className="inline-flex items-center gap-1 text-green-600 cursor-pointer"
                        onClick={() => handleStatusClick(vehicle)}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Active
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-red-500 cursor-pointer"
                        onClick={() => handleStatusClick(vehicle)}
                      >
                        <XCircle className="w-5 h-5" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Pencil
                      className="w-5 h-5 text-blue-500 cursor-pointer mx-auto"
                      onClick={() => handleEdit(vehicle)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Previous
            </button>

            <span className="px-3 py-2 text-gray-700 font-medium">{page}</span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Activate/Deactivate Popup */}
      {showPopup && selectedVehicleRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedVehicleRow.activeStatus ? "Deactivate" : "Activate"} Vehicle
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {selectedVehicleRow.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the vehicle: <span className="font-semibold">{selectedVehicleRow.vehicle}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setSelectedVehicleRow(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  selectedVehicleRow.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {selectedVehicleRow.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVehicle;
