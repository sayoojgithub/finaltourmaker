import { Pencil, CheckCircle, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

const CreateVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    gstNumber: "",
    mobileNumber: "",
    whatsappNumber: "",
    address: "",
    country: "",
    state: "",
    destination: "",
    services: [],
  });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isManuallyEditing, setIsManuallyEditing] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const fetchCountries = async () => {
    try {
      const res = await API.get("/purchaser/countries");
      setCountries(res.data);
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      const res = await API.get(`/purchaser/states/${countryId}`);
      setStates(res.data);
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchDestinations = async (countryId, stateId) => {
    try {
      const res = await API.get(
        `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`
      );
      setDestinations(res.data);
    } catch (err) {
      console.error("Error fetching destinations:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await API.get(
        `/purchaser/vendors?page=${page}&search=${search}`
      );
      setVendors(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry && !isManuallyEditing) {
      fetchStates(selectedCountry);
      setFormData((prev) => ({ ...prev, state: "", destination: "" }));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && !isManuallyEditing) {
      fetchDestinations(selectedCountry, selectedState);
      setFormData((prev) => ({ ...prev, destination: "" }));
    }
  }, [selectedState]);

  useEffect(() => {
    fetchVendors();
  }, [page, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (service) => {
    const exists = formData.services.includes(service);
    if (exists) {
      setFormData({
        ...formData,
        services: formData.services.filter((s) => s !== service),
      });
    } else {
      setFormData({
        ...formData,
        services: [...formData.services, service],
      });
    }
  };
  console.log(formData);
  const handleSubmit = async () => {
    const requiredFields = [
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "destination", label: "Destination" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "companyName", label: "Company Name" },
      { key: "mobileNumber", label: "Mobile Number" },
      { key: "whatsappNumber", label: "WhatsApp Number" },
      { key: "address", label: "Address" },
    ];

    // Check required string fields
    for (let field of requiredFields) {
      const value = formData[field.key];
      if (!value || value.trim() === "") {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    // Check services array
    if (!formData.services || formData.services.length === 0) {
      toast.error("At least one service must be selected");
      return;
    }
    try {
      if (editingId) {
        await API.put(`/purchaser/vendor/${editingId}`, formData);
        toast.success("Vendor updated successfully");
      } else {
        await API.post("/purchaser/vendor", formData);
        toast.success("Vendor created successfully");
      }
      setFormData({
        name: "",
        email: "",
        mobileNumber: "",
        whatsappNumber: "",
        address: "",
        country: "",
        state: "",
        destination: "",
        services: [],
      });
      setEditingId(null);
      fetchVendors();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || err.response?.data || "Operation failed";
      toast.error(errorMessage);
    }
  };

  const handleEdit = async (vendor) => {
    try {
      setIsManuallyEditing(true); // 🔐 Stop auto-reset
      setEditingId(vendor._id);

      setSelectedCountry(vendor.country);
      const stateRes = await API.get(`/purchaser/states/${vendor.country}`);
      setStates(stateRes.data);

      setSelectedState(vendor.state);
      const destinationRes = await API.get(
        `/purchaser/destinationsByCountryAndState/${vendor.country}/${vendor.state}`
      );
      setDestinations(destinationRes.data);

      setFormData({
        ...vendor,
        country: vendor.country,
        state: vendor.state,
        destination: vendor.destination?._id || vendor.destination, // ✅ ID only
      });

      setTimeout(() => setIsManuallyEditing(false), 100); // Re-enable after safe time
    } catch (err) {
      console.error("handleEdit error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to populate vendor details";
      toast.error(errorMessage);
    }
  };
  const handleStatusClick = (vendor) => {
    setSelectedVendor(vendor);
    setShowPopup(true);
  };
  const handleToggleStatus = async () => {
    if (!selectedVendor) return;

    try {
      const updatedStatus = !selectedVendor.activeStatus;

      const res = await API.patch(
        `/purchaser/updateVendorStatus/${selectedVendor._id}/status`,
        {
          activeStatus: updatedStatus,
        }
      );

      if (res.data.success) {
        toast.success(
          `Vendor ${updatedStatus ? "activated" : "deactivated"} successfully`
        );
        await fetchVendors(); // refresh table
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedVendor(null);
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-xl space-y-12 mb-6">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCountry(val);
                setFormData({ ...formData, country: val });
              }}
              disabled={!!editingId}
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

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedState(val);
                setFormData({ ...formData, state: val });
              }}
              disabled={!!editingId}
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

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Destination
            </label>
            <select
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              disabled={!!editingId}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:cursor-not-allowed"
            >
              <option value="">Select Destination</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              disabled={!!editingId}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:bg-white disabled:cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              disabled={!!editingId}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:bg-white disabled:cursor-not-allowed"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName || ""}
              onChange={handleChange}
              placeholder="Company Name"
              disabled={!!editingId}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition disabled:bg-white disabled:cursor-not-allowed"
            />
          </div>

          {/* GST Number */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              GST Number
            </label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber || ""}
              onChange={handleChange}
              placeholder="GST Number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition "
            />
          </div>

          {/* Mobile Number & WhatsApp Number */}
          {["mobileNumber", "whatsappNumber"].map((field) => (
            <div key={field}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {field === "mobileNumber" ? "Mobile Number" : "WhatsApp Number"}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={
                  field === "mobileNumber" ? "Mobile Number" : "WhatsApp Number"
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition"
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Address
            </label>
            <textarea
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Services</label>
          <div className="flex flex-wrap gap-6 pt-1">
            {["Vehicle", "Hotels", "Activities", "Guide", "Rental", "Food"].map(
              (service, i) => (
                <label
                  key={i}
                  className="inline-flex items-center space-x-2 text-sm font-medium text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={() => handleCheckboxChange(service)}
                    className="w-4 h-4 text-[#8570EE] rounded focus:ring-[#8570EE]"
                  />
                  <span>{service}</span>
                </label>
              )
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-[#8570EE] text-white text-sm font-semibold px-10 py-3 rounded-xl shadow-lg hover:bg-[#6e5bd9] active:scale-95 transition-all w-full"
          >
            {editingId ? "Update Vendor" : "Create Vendor"}
          </button>
        </div>
      </div>

      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
          View Vendors
        </h5>
        <p className="block mb-6 text-sm font-light text-gray-400">
          Search and Edit Vendors
        </p>
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name..."
            className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Sl No</th>
                <th className="px-6 py-4">vendor code</th>
                <th className="px-6 py-4">Vendor Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">destination</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, idx) => (
                <tr key={v._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">
                    {(page - 1) * 3 + idx + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold">{v.vendorCode}</td>
                  <td className="px-6 py-4 font-semibold">{v.name}</td>
                  <td className="px-6 py-4 font-semibold">{v.email}</td>
                  <td className="px-6 py-4 font-semibold">
                    {v.destination?.name || "-"}
                  </td>
                  <td className="px-6 py-4  font-semibold">
                    {v.activeStatus ? (
                      <span
                        className="inline-flex items-center gap-1 text-green-600 cursor-pointer"
                        onClick={() => handleStatusClick(v)}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Active
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-red-500 cursor-pointer"
                        onClick={() => handleStatusClick(v)}
                      >
                        <XCircle className="w-5 h-5" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    <button
                      onClick={() => handleEdit(v)}
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
      {showPopup && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedVendor.activeStatus ? "Deactivate" : "Activate"} Vendor
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {selectedVendor.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the vendor:{" "}
              <span className="font-semibold">{selectedVendor.name}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setSelectedVendor(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  selectedVendor.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {selectedVendor.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVendor;
