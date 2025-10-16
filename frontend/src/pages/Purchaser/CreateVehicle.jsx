import { Plus, CheckCircle, XCircle, Pencil } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const CreateVehicle = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");

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
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const categories = ["2 Wheeler", "4 Seater", "6 Seater", "7 Seater"];
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const fileInputRef = useRef(null);
  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      if (editingVehicleId) return;
      const fetchStates = async () => {
        try {
          const res = await API.get(`/purchaser/states/${selectedCountry}`);
          setStates(res.data);
        } catch (err) {
          console.error("Error fetching states:", err);
        }
      };
      fetchStates();
      setSelectedState("");
      setDestinations([]);
      setVendors([]);
      setSelectedVendor("");
    }
  }, [selectedCountry]);

  // Fetch destinations when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      if (editingVehicleId) return;
      const fetchDestinations = async () => {
        try {
          const res = await API.get(
            `/purchaser/destinationsByCountryAndState/${selectedCountry}/${selectedState}`
          );
          setDestinations(res.data);
        } catch (err) {
          console.error("Error fetching destinations:", err);
        }
      };
      fetchDestinations();
      setSelectedDestination("");
      setVendors([]);
      setSelectedVendor("");
    }
  }, [selectedState]);

  // Fetch vendors when destination changes
  useEffect(() => {
    if (selectedCountry && selectedState && selectedDestination) {
      if (editingVehicleId) return;
      const fetchVendors = async () => {
        try {
          const res = await API.get(
            `/purchaser/vendorsOfVehicles/${selectedCountry}/${selectedState}/${selectedDestination}`
          );
          setVendors(res.data);
        } catch (err) {
          console.error("Error fetching vendors:", err);
        }
      };
      fetchVendors();
      setSelectedVendor("");
    }
  }, [selectedDestination]);

  // Fetch vehicles when destination or page changes
  const fetchVehicles = async () => {
    try {
      const res = await API.get(
        `/purchaser/vehicles?page=${page}&limit=3&search=${searchTerm}`
      );
      setVehicles(res.data.vehicles);
      setTotalPages(res.data.totalPages);
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
      // 1. Set all relevant selections
      setSelectedCountry(vehicle.country?._id || "");
      setSelectedState(vehicle.state?._id || "");
      setSelectedDestination(vehicle.destination?._id || "");

      // 2. Wait for dependent states/destinations/vendors to load
      const [statesRes, destinationsRes, vendorsRes] = await Promise.all([
        API.get(`/purchaser/states/${vehicle.country?._id}`),
        API.get(
          `/purchaser/destinationsByCountryAndState/${vehicle.country?._id}/${vehicle.state?._id}`
        ),
        API.get(
          `/purchaser/vendorsOfVehicles/${vehicle.country?._id}/${vehicle.state?._id}/${vehicle.destination?._id}`
        ),
      ]);

      setStates(statesRes.data);
      setDestinations(destinationsRes.data);
      setVendors(vendorsRes.data);

      // 3. Select vendor and prefill the form
      setSelectedVendor(vehicle.vendor?._id || "");

      setFormData({
        category: vehicle.category || "",
        vehicle: vehicle.vehicle || "",
        percentage: vehicle.percentage?.toString() || "",
      });
      // ✅ Set image URL so the image shows in preview
      setImageUrl(vehicle.imageUrl || "");
      setImage(null); // Clear file ref

      // Optionally scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading vehicle data:", error);
      toast.error("Failed to load vehicle details");
    }
  };

  const handleSubmit = async () => {
    try {
      const { vehicle, category, percentage } = formData;
      const requiredFields = {
        selectedCountry: "Country",
        selectedState: "State",
        selectedDestination: "Destination",
        selectedVendor: "Vendor",
        category: "Category",
        vehicle: "Vehicle Name",
        percentage: "percentage",
      };

      for (const [key, label] of Object.entries(requiredFields)) {
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
        // 🔁 Update existing vehicle
        await API.put(`/purchaser/updateVehicle/${editingVehicleId}`, payload);
        toast.success("Vehicle updated successfully");
        setEditingVehicleId(null);
      } else {
        // ➕ Create new vehicle
        await API.post("/purchaser/createVehicles", payload);
        toast.success("Vehicle created successfully");
      }

      setFormData({ category: "", vehicle: "", percentage: "" });
      setImageUrl("");
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchVehicles(); // 🔁 refresh list after adding
    } catch (err) {
      console.error("Error saving vehicle:", err);
    }
  };
  const handleClear = () => {
    setSelectedVendor("");
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDestination("");
    setStates([]);
    setDestinations([]);
    setVendors([]);
    setFormData({
      category: "",
      vehicle: "",
      percentage: "",
    });
    setImageUrl("");
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setEditingVehicleId(null);
  };
  const handleStatusClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowPopup(true);
  };
  const handleToggleStatus = async () => {
    if (!selectedVehicle) return;

    try {
      const updatedStatus = !selectedVehicle.activeStatus;

      const res = await API.patch(
        `/purchaser/updateVehicleStatus/${selectedVehicle._id}/status`,
        {
          activeStatus: updatedStatus,
        }
      );

      if (res.data.success) {
        toast.success(
          `Vehicle ${updatedStatus ? "activated" : "deactivated"} successfully`
        );
        await fetchVehicles(); // refresh table
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedVehicle(null);
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
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              disabled={!!editingVehicleId}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:cursor-not-allowed"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country._id} value={country._id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              disabled={!!editingVehicleId}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:cursor-not-allowed"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Destination
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              disabled={!!editingVehicleId}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:cursor-not-allowed"
            >
              <option value="">Select Destination</option>
              {destinations.map((dest) => (
                <option key={dest._id} value={dest._id}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Add Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Vendor */}
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            disabled={!!editingVehicleId}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:cursor-not-allowed"
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            disabled={!!editingVehicleId}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:cursor-not-allowed"
          >
            <option value="">Select vehicle category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Vehicle Name */}
          <input
            type="text"
            value={formData.vehicle}
            onChange={(e) =>
              setFormData({ ...formData, vehicle: e.target.value })
            }
            disabled={!!editingVehicleId}
            placeholder="Enter vehicle name"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:cursor-not-allowed"
          />
          <div className="flex gap-3 w-full items-center">
            <input
              type="number"
              placeholder=" %"
              value={formData.percentage || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, percentage: e.target.value }))
              }
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
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Plus className="w-5 h-5 text-gray-500" />
              )}

              {/* Tooltip */}
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

            {/* Clear Button */}
            <button
              onClick={() => {
                setImage(null);
                setImageUrl("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="h-14 px-5 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-600 rounded-xl shadow-md transition"
            >
              Clear Image
            </button>
            {/* Percentage Input */}
          </div>

          {/* Submit & Clear Buttons - Full Width Container */}
          <div className="col-span-full flex gap-3 w-full mt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 h-12 flex justify-center items-center bg-[#8570EE] hover:bg-[#6e5bd9] text-white rounded-xl shadow-md transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              {editingVehicleId ? "Update Vehicle" : "Add Vehicle"}
            </button>

            <button
              onClick={handleClear}
              className="flex-1 h-12 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
          View Vehicles
        </h5>
        <p className="block mb-6 text-sm font-light text-gray-400">
          View and Delete Vehicles
        </p>
        {/* Top Bar: Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Search Field */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
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
                  <td className="px-6 py-4 font-semibold">
                    {(page - 1) * 3 + idx + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold">{vehicle.vehicle}</td>
                  <td className="px-6 py-4 font-semibold">
                    {vehicle.category}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {vehicle.vendor?.name || "-"}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {vehicle.destination?.name || "-"}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {vehicle.percentage || "-"}
                  </td>

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

          {/* Pagination Controls */}
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
      {showPopup && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedVehicle.activeStatus ? "Deactivate" : "Activate"} Vehicle
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {selectedVehicle.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the vehicle:{" "}
              <span className="font-semibold">{selectedVehicle.vehicle}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setSelectedVehicle(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  selectedVehicle.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {selectedVehicle.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVehicle;
