import { Pencil, CheckCircle, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

const initialForm = {
  name: "",
  email: "",
  companyName: "",
  gstNumber: "",
  mobileNumber: "",
  whatsappNumber: "",
  address: "",
  country: "",      // ID
  state: "",        // ID
  destination: "",  // ID
  services: [],
};

const CreateVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState(initialForm);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // React-Select selected options (objects)
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [isManuallyEditing, setIsManuallyEditing] = useState(false);
  const [confirmVendor, setConfirmVendor] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

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

  // Helpers to map API data -> Select options
  const toCountryOption = (c) => ({ _id: c._id, value: c._id, label: c.name });
  const toStateOption = (s) => ({ _id: s._id, value: s._id, label: s.name });
  const toDestinationOption = (d) => ({ _id: d._id, value: d._id, label: d.name });

  const countryOptions = countries.map(toCountryOption);
  const stateOptions = states.map(toStateOption);
  const destinationOptions = destinations.map(toDestinationOption);

  const fetchCountries = async () => {
    try {
      const res = await API.get("/purchaser/countries");
      setCountries(res.data || []);
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      if (!countryId) {
        setStates([]);
        return;
      }
      const res = await API.get(`/purchaser/states/${countryId}`);
      setStates(res.data || []);
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchDestinations = async (countryId, stateId) => {
    try {
      if (!countryId || !stateId) {
        setDestinations([]);
        return;
      }
      const res = await API.get(
        `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`
      );
      setDestinations(res.data || []);
    } catch (err) {
      console.error("Error fetching destinations:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await API.get(
        `/purchaser/vendors?page=${page}&search=${encodeURIComponent(search)}`
      );
      setVendors(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCountries();
  }, []);

  // When selectedCountry (option) changes, fetch states (unless manually editing lock)
  useEffect(() => {
    if (!isManuallyEditing) {
      const countryId = selectedCountry?.value || "";
      fetchStates(countryId);
      // reset state & destination in form + UI
      setSelectedState(null);
      setSelectedDestination(null);
      setFormData((prev) => ({ ...prev, state: "", destination: "", country: countryId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry?.value]);

  // When selectedState (option) changes, fetch destinations (unless manually editing lock)
  useEffect(() => {
    if (!isManuallyEditing) {
      const countryId = selectedCountry?.value || "";
      const stateId = selectedState?.value || "";
      fetchDestinations(countryId, stateId);
      // reset destination in form + UI
      setSelectedDestination(null);
      setFormData((prev) => ({ ...prev, state: stateId, destination: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState?.value]);

  // Keep vendors list updated
  useEffect(() => {
    fetchVendors();
  }, [page, search]);

  // Sync selected options from IDs whenever lists load (useful after edit preload)
  useEffect(() => {
    if (formData.country && countries.length) {
      const opt = countryOptions.find((o) => o.value === formData.country) || null;
      setSelectedCountry(opt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, formData.country]);

  useEffect(() => {
    if (formData.state && states.length) {
      const opt = stateOptions.find((o) => o.value === formData.state) || null;
      setSelectedState(opt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, formData.state]);

  useEffect(() => {
    if (formData.destination && destinations.length) {
      const opt = destinationOptions.find((o) => o.value === formData.destination) || null;
      setSelectedDestination(opt);
    }
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, [destinations, formData.destination]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCheckboxChange = (service) => {
    setFormData((p) => {
      const exists = p.services.includes(service);
      return {
        ...p,
        services: exists ? p.services.filter((s) => s !== service) : [...p.services, service],
      };
    });
  };

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

    for (let field of requiredFields) {
      const value = formData[field.key];
      if (!value || String(value).trim() === "") {
        toast.error(`${field.label} is required`);
        return;
      }
    }

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

      // reset completely
      clearEditAndReset();
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
      setIsManuallyEditing(true); // stop auto-resets while we hydrate

      setEditingId(vendor._id);
      // form fields (IDs only)
      setFormData({
        name: vendor.name || "",
        email: vendor.email || "",
        companyName: vendor.companyName || "",
        gstNumber: vendor.gstNumber || "",
        mobileNumber: vendor.mobileNumber || "",
        whatsappNumber: vendor.whatsappNumber || "",
        address: vendor.address || "",
        country: vendor.country || "",
        state: vendor.state || "",
        destination: vendor.destination?._id || vendor.destination || "",
        services: Array.isArray(vendor.services) ? vendor.services : [],
      });

      // Country select
      const countryRes = countries.length ? countries : (await API.get("/purchaser/countries")).data || [];
      if (!countries.length) setCountries(countryRes);
      const countryOptionsLocal = countryRes.map(toCountryOption);
      const countryOpt =
        countryOptionsLocal.find((o) => o.value === vendor.country) ||
        null;
      setSelectedCountry(countryOpt);

      // Fetch states for that country, then select
      const stateRes = await API.get(`/purchaser/states/${vendor.country}`);
      setStates(stateRes.data || []);
      const stateOptionsLocal = (stateRes.data || []).map(toStateOption);
      const stateOpt = stateOptionsLocal.find((o) => o.value === vendor.state) || null;
      setSelectedState(stateOpt);

      // Fetch destinations for country+state, then select
      const destinationRes = await API.get(
        `/purchaser/destinationsByCountryAndState/${vendor.country}/${vendor.state}`
      );
      setDestinations(destinationRes.data || []);
      const destinationOptionsLocal = (destinationRes.data || []).map(toDestinationOption);
      const destOpt = destinationOptionsLocal.find(
        (o) => o.value === (vendor.destination?._id || vendor.destination)
      ) || null;
      setSelectedDestination(destOpt);

      // release the manual lock after everything is set
      setTimeout(() => setIsManuallyEditing(false), 100);
    } catch (err) {
      console.error("handleEdit error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to populate vendor details";
      toast.error(errorMessage);
      setIsManuallyEditing(false);
    }
  };

  const handleStatusClick = (vendor) => {
    setConfirmVendor(vendor);
    setShowPopup(true);
  };

  const handleToggleStatus = async () => {
    if (!confirmVendor) return;

    try {
      const updatedStatus = !confirmVendor.activeStatus;
      const res = await API.patch(
        `/purchaser/updateVendorStatus/${confirmVendor._id}/status`,
        { activeStatus: updatedStatus }
      );

      if (res.data.success) {
        toast.success(
          `Vendor ${updatedStatus ? "activated" : "deactivated"} successfully`
        );
        await fetchVendors();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setConfirmVendor(null);
    }
  };

  // === NEW: clear prefill / exit edit mode ===
  const clearEditAndReset = () => {
    setFormData(initialForm);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedDestination(null);
    setStates([]);
    setDestinations([]);
    setEditingId(null);
    setIsManuallyEditing(false);
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-xl space-y-12 mb-6">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Country (React Select) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
            <Select
              options={countryOptions}
              value={selectedCountry}
              onChange={(opt) => {
                setSelectedCountry(opt);
                setFormData((p) => ({ ...p, country: opt?.value || "" }));
              }}
              placeholder="Select Country"
              styles={selectStyles}
              classNamePrefix="vendor-country"
              getOptionValue={(o) => String(o._id || o.value)}
              isClearable
              isDisabled={!!editingId}
            />
          </div>

          {/* State (React Select) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
            <Select
              options={stateOptions}
              value={selectedState}
              onChange={(opt) => {
                setSelectedState(opt);
                setFormData((p) => ({ ...p, state: opt?.value || "" }));
              }}
              placeholder="Select State"
              styles={selectStyles}
              classNamePrefix="vendor-state"
              getOptionValue={(o) => String(o._id || o.value)}
              isClearable
              isDisabled={!!editingId || !selectedCountry?.value}
            />
          </div>

          {/* Destination (React Select) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Destination</label>
            <Select
              options={destinationOptions}
              value={selectedDestination}
              onChange={(opt) => {
                setSelectedDestination(opt);
                setFormData((p) => ({ ...p, destination: opt?.value || "" }));
              }}
              placeholder="Select Destination"
              styles={selectStyles}
              classNamePrefix="vendor-destination"
              getOptionValue={(o) => String(o._id || o.value)}
              isClearable
              isDisabled={!!editingId || !selectedState?.value}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
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

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
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

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Company Name</label>
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

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">GST Number</label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber || ""}
              onChange={handleChange}
              placeholder="GST Number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition "
            />
          </div>

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
                placeholder={field === "mobileNumber" ? "Mobile Number" : "WhatsApp Number"}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8570EE] transition"
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
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

        {/* Actions + NEW clear (cross) when editing */}
        <div className="flex flex-col items-center gap-2">
          {editingId && (
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

          <button
            onClick={handleSubmit}
            className="bg-[#8570EE] text-white text-sm font-semibold px-10 py-3 rounded-xl shadow-lg hover:bg-[#6e5bd9] active:scale-95 transition-all w-full"
          >
            {editingId ? "Update Vendor" : "Create Vendor"}
          </button>
        </div>
      </div>

      {/* Vendors table */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">View Vendors</h5>
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
                  <td className="px-6 py-4 font-semibold">{(page - 1) * 3 + idx + 1}</td>
                  <td className="px-6 py-4 font-semibold">{v.vendorCode}</td>
                  <td className="px-6 py-4 font-semibold">{v.name}</td>
                  <td className="px-6 py-4 font-semibold">{v.email}</td>
                  <td className="px-6 py-4 font-semibold">{v.destination?.name || "-"}</td>
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

      {/* Activate/Deactivate Popup */}
      {showPopup && confirmVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {confirmVendor.activeStatus ? "Deactivate" : "Activate"} Vendor
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {confirmVendor.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the vendor: <span className="font-semibold">{confirmVendor.name}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setConfirmVendor(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  confirmVendor.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {confirmVendor.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVendor;






















// import React, { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   PhoneCall,
//   PhoneOff,
//   Voicemail,
//   Ban,
//   CheckCircle2,
//   X,
//   Edit3,
//   Mail,
//   MapPin,
//   CircleDot,
//   Clock,
//   AlertOctagon,
//   PartyPopper,
//   CalendarClock,
//   FileText,
//   Wallet,
//   Plane,
//   ArrowLeft,
//   ChevronRight,
// } from "lucide-react";

// /**
//  * Fully styled, animated client list with a gamified "Contact" flow modal.
//  * - TailwindCSS + Framer Motion
//  * - Purple brand color: #8570EE
//  * - Single-file, drop-in React component
//  *
//  * Props (all optional):
//  *  - clients: Array of client rows
//  *  - onCreateItinerary(client, context): called when flow says to create itinerary
//  *  - onEditClient(client, context): called when flow wants to edit client details (destination/date)
//  */
// export default function CreateVendor({
//   clients: clientsProp,
//   onCreateItinerary,
//   onEditClient,
// }) {
//   const PURPLE = "#8570EE";
//   const GRAY_BORDER = "#e5e7eb";

//   const sample = useMemo(
//     () => [
//       {
//         id: "C0002",
//         name: "Thailan",
//         email: "thailan@gmail.com",
//         destination: "THAILAND FIRST STATE FIRST DESTINATION",
//         status: "Active",
//       },
//       {
//         id: "C0001",
//         name: "Sobhan",
//         email: "sobhan@gmail.com",
//         destination: "SOBHA MALL",
//         status: "Active",
//       },
//     ],
//     []
//   );

//   const clients = clientsProp?.length ? clientsProp : sample;

//   const [query, setQuery] = useState("");
//   const [active, setActive] = useState(null); // client selected
//   const filtered = clients.filter(
//     (c) =>
//       c.name.toLowerCase().includes(query.toLowerCase()) ||
//       c.email.toLowerCase().includes(query.toLowerCase()) ||
//       c.id.toLowerCase().includes(query.toLowerCase())
//   );

//   const handleCreateItinerary = (client, context) => {
//     if (onCreateItinerary) return onCreateItinerary(client, context);
//     alert(
//       `Redirecting to Create Itinerary for ${client.name} (reason: ${context?.reason || "details_sent/confirmed"})`
//     );
//   };

//   const handleEditClient = (client, context) => {
//     if (onEditClient) return onEditClient(client, context);
//     alert(
//       `Opening client details for ${client.name} to update ${context?.what || "destination/date"}`
//     );
//   };

//   return (
//     <div className="p-6 md:p-10 min-h-screen bg-gradient-to-b from-white to-purple-50/40">
//       <div className="max-w-6xl mx-auto">
//         {/* Heading */}
//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
//               <span className="w-2 h-8 rounded-full" style={{ background: PURPLE }} />
//               View Clients
//             </h1>
//             <p className="text-gray-500 mt-1">Search and contact new clients</p>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="mb-5">
//           <div className="relative">
//             <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by name, email, or code..."
//               className="w-full rounded-xl pl-12 pr-4 py-3 border focus:outline-none focus:ring-4 transition-all"
//               style={{
//                 borderColor: GRAY_BORDER,
//                 boxShadow: "0 0 0 0 rgba(0,0,0,0)",
//               }}
//               onFocus={(e) =>
//                 (e.currentTarget.style.boxShadow = "0 0 0 6px rgba(133,112,238,0.15)")
//               }
//               onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-hidden rounded-2xl border bg-white shadow-[0_20px_40px_-20px_rgba(133,112,238,0.35)]">
//           <div className="grid grid-cols-12 text-xs tracking-wide uppercase text-gray-500 bg-gray-50 px-6 py-3">
//             <div className="col-span-1">Sl No</div>
//             <div className="col-span-2">Client Code</div>
//             <div className="col-span-2">Client Name</div>
//             <div className="col-span-3">Email</div>
//             <div className="col-span-2">Destination</div>
//             <div className="col-span-1 text-center">Status</div>
//             <div className="col-span-1 text-right">Action</div>
//           </div>

//           <AnimatePresence initial={false}>
//             {filtered.map((c, idx) => (
//               <motion.div
//                 key={c.id}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ type: "spring", stiffness: 240, damping: 20 }}
//                 className="grid grid-cols-12 items-center px-6 py-4 border-t hover:bg-purple-50/40"
//               >
//                 <div className="col-span-1 text-sm text-gray-600">{idx + 1}</div>
//                 <div className="col-span-2 font-medium">{c.id}</div>
//                 <div className="col-span-2 font-semibold text-gray-900">{c.name}</div>
//                 <div className="col-span-3 text-gray-700 truncate">{c.email}</div>
//                 <div className="col-span-2 text-gray-700 truncate flex items-center gap-1">
//                   <MapPin size={16} className="opacity-70" /> {c.destination}
//                 </div>
//                 <div className="col-span-1 flex items-center justify-center">
//                   <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//                     <CircleDot size={12} /> {c.status}
//                   </span>
//                 </div>
//                 <div className="col-span-1 flex items-center justify-end gap-2">
//                   <button
//                     onClick={() => setActive(c)}
//                     className="px-4 py-2 rounded-full text-white font-semibold shadow transition transform hover:-translate-y-0.5"
//                     style={{ background: PURPLE }}
//                   >
//                     Contact
//                   </button>
//                   <button className="p-2 rounded-full border hover:bg-gray-50">
//                     <Edit3 size={18} />
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Pagination demo */}
//         <div className="flex items-center justify-center gap-4 mt-6">
//           <button className="px-4 py-2 rounded-full border">Previous</button>
//           <span className="text-sm">1</span>
//           <button className="px-4 py-2 rounded-full border">Next</button>
//         </div>
//       </div>

//       <ContactFlowModal
//         open={!!active}
//         onClose={() => setActive(null)}
//         client={active}
//         onCreateItinerary={handleCreateItinerary}
//         onEditClient={handleEditClient}
//         brand={{ color: PURPLE }}
//       />
//     </div>
//   );
// }

// // ----------------------------- Modal & Flow ------------------------------

// const FLOW = {
//   root: {
//     label: "How did the call go?",
//     options: [
//       { id: "not_answered", label: "Not answered", icon: Voicemail, color: "bg-amber-50 text-amber-700 border-amber-200" },
//       { id: "answered", label: "Answered", icon: PhoneCall, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
//       { id: "not_reachable", label: "Not reachable", icon: PhoneOff, color: "bg-rose-50 text-rose-700 border-rose-200" },
//     ],
//   },
//   not_answered: {
//     label: "What happened?",
//     options: [
//       { id: "full_ring", label: "Full ring", icon: Clock },
//       { id: "busy", label: "Busy", icon: AlertOctagon },
//       { id: "cut_phone", label: "Cut phone", icon: Ban },
//       { id: "blocked", label: "Blocked", icon: Ban },
//     ],
//     terminal: true,
//   },
//   not_reachable: {
//     label: "Reason?",
//     options: [
//       { id: "switched_off", label: "Switched off", icon: PowerIcon },
//       { id: "out_of_coverage", label: "Out of coverage", icon: MapPin },
//     ],
//     terminal: true,
//   },
//   answered: {
//     label: "Result?",
//     options: [
//       { id: "details_sent", label: "Details sent", icon: FileText },
//       { id: "interested", label: "Interested", icon: CircleDot },
//       { id: "not_interested", label: "Not interested", icon: X },
//       { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
//     ],
//   },
//   interested: {
//     label: "Next step",
//     options: [
//       { id: "book_tomorrow", label: "Book tomorrow", icon: CalendarClock },
//       { id: "hold", label: "Hold", icon: Clock },
//       { id: "change", label: "Change", icon: Edit3 },
//     ],
//   },
//   change: {
//     label: "Change what?",
//     options: [
//       { id: "itinerary_change", label: "Itinerary", icon: Plane },
//       { id: "price_change", label: "Price", icon: Wallet },
//       { id: "destination_change", label: "Destination", icon: MapPin },
//       { id: "date_change", label: "Date", icon: CalendarClock },
//     ],
//   },
//   not_interested: {
//     label: "Why not?",
//     options: [
//       { id: "price_high", label: "Price high", icon: Wallet },
//       { id: "not_right_time", label: "Not right time", icon: Clock },
//       { id: "not_intended_tour", label: "Not intended tour", icon: Plane },
//       { id: "group_full", label: "Group full", icon: AlertOctagon },
//     ],
//     terminal: true,
//   },
// };

// function PowerIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" width={20} height={20} {...props}>
//       <path
//         d="M12 2v10m6.364-6.364a9 9 0 11-12.728 0"
//         stroke="currentColor"
//         strokeWidth="2"
//         fill="none"
//         strokeLinecap="round"
//       />
//     </svg>
//   );
// }

// function ContactFlowModal({ open, onClose, client, brand, onCreateItinerary, onEditClient }) {
//   const [path, setPath] = useState([]); // array of chosen step IDs (now includes sub-options)
//   const [note, setNote] = useState("");
//   const [completed, setCompleted] = useState(false);

//   const brandColor = brand?.color || "#8570EE";
//   console.log(path)
//   const reset = () => {
//     setPath([]);
//     setNote("");
//     setCompleted(false);
//   };

//   const closeAll = () => {
//     reset();
//     onClose?.();
//   };

//   // Determine current node
//   const currentKey = path.length === 0 ? "root" : path[path.length - 1];

//   const node = FLOW[currentKey] || { label: "", options: [] };

//   const breadcrumb = ["root", ...path];
//   const percent = Math.min(100, 15 + breadcrumb.length * 15);

//   const onPick = (opt) => {
//     // Root → first branch
//     if (currentKey === "root") {
//       setPath([opt.id]);
//       return;
//     }

//     // Answered branches
//     if (currentKey === "answered") {
//       if (opt.id === "details_sent" || opt.id === "confirmed") {
//         setPath((prev) => [...prev, opt.id]); // TRACK this selection
//         onCreateItinerary?.(client, { reason: opt.id });
//         setCompleted(true);
//         return;
//       }
//       if (opt.id === "interested") {
//         setPath((prev) => [...prev, opt.id]);
//         return;
//       }
//       if (opt.id === "not_interested") {
//         setPath((prev) => [...prev, opt.id]); // go to reasons node
//         return;
//       }
//     }

//     // Interested → sub branches
//     if (currentKey === "interested") {
//       if (opt.id === "book_tomorrow" || opt.id === "hold") {
//         setPath((prev) => [...prev, opt.id]); // show micro-question next
//         return;
//       }
//       if (opt.id === "change") {
//         setPath((prev) => [...prev, opt.id]);
//         return;
//       }
//     }

//     // Change → itinerary/price/destination/date
//     if (currentKey === "change") {
//       if (opt.id === "itinerary_change" || opt.id === "price_change") {
//         setPath((prev) => [...prev, opt.id]); // TRACK
//         onCreateItinerary?.(client, { reason: "details_sent", from: "change" });
//         setCompleted(true);
//         return;
//       }
//       if (opt.id === "destination_change") {
//         setPath((prev) => [...prev, opt.id]); // TRACK
//         onEditClient?.(client, { what: "destination" });
//         setCompleted(true);
//         return;
//       }
//       if (opt.id === "date_change") {
//         setPath((prev) => [...prev, opt.id]); // TRACK
//         onEditClient?.(client, { what: "date" });
//         setCompleted(true);
//         return;
//       }
//     }

//     // Terminal groups → append child, then complete
//     if (currentKey === "not_answered" || currentKey === "not_reachable") {
//       setPath((prev) => [...prev, opt.id]); // e.g., busy / switched_off
//       setCompleted(true);
//       return;
//     }

//     if (currentKey === "not_interested") {
//       setPath((prev) => [...prev, opt.id]); // e.g., price_high
//       setCompleted(true);
//       return;
//     }

//     // Default advance
//     setPath((prev) => [...prev, opt.id]);
//   };

//   const onPickMini = (label) => {
//     // Append composite token to track micro choice (e.g., "book_tomorrow>Morning")
//     const last = path[path.length - 1]; // book_tomorrow or hold
//     const token = `${last}>${label}`;
//     setPath((prev) => [...prev, token]);
//     setCompleted(true);
//   };

//   const goBack = () => {
//     if (completed) return setCompleted(false);
//     if (path.length === 0) return closeAll();
//     setPath(path.slice(0, -1));
//   };

//   if (!open) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 z-[80] flex items-center justify-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         {/* Backdrop */}
//         <motion.div
//           className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         />

//         {/* Modal Card */}
//         <motion.div
//           className="relative w-full max-w-3xl mx-4 rounded-3xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(133,112,238,0.5)]"
//           initial={{ y: 40, opacity: 0, scale: 0.98 }}
//           animate={{ y: 0, opacity: 1, scale: 1 }}
//           exit={{ y: 20, opacity: 0, scale: 0.98 }}
//           transition={{ type: "spring", stiffness: 180, damping: 18 }}
//         >
//           {/* Top Ribbon */}
//           <div
//             className="h-2 w-full"
//             style={{ background: `linear-gradient(90deg, ${brandColor}, #c7bef9)` }}
//           />

//           {/* Header */}
//           <div className="bg-white p-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={goBack}
//                   className="p-2 rounded-full hover:bg-gray-100 border"
//                 >
//                   <ArrowLeft size={18} />
//                 </button>
//                 <div>
//                   <div className="text-sm text-gray-500">Contacting</div>
//                   <div className="text-lg font-bold">{client?.name}</div>
//                 </div>
//               </div>

//               <button
//                 onClick={closeAll}
//                 className="p-2 rounded-full hover:bg-gray-100 border"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* Progress */}
//             <div className="mt-4">
//               <div className="flex items-center justify-between text-xs text-gray-500">
//                 <span>Progress</span>
//                 <span>{percent}%</span>
//               </div>
//               <div className="mt-2 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
//                 <motion.div
//                   className="h-full"
//                   style={{ background: brandColor }}
//                   initial={{ width: 0 }}
//                   animate={{ width: `${percent}%` }}
//                   transition={{ type: "spring", stiffness: 120, damping: 16 }}
//                 />
//               </div>

//               {/* Crumbs */}
//               <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
//                 {breadcrumb.map((k, i) => (
//                   <span
//                     key={i}
//                     className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white"
//                     style={{ borderColor: brandColor, color: brandColor }}
//                   >
//                     {labelFor(k)}
//                     {i < breadcrumb.length - 1 && (
//                       <ChevronRight size={14} className="opacity-60" />
//                     )}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Body */}
//           <div className="bg-gradient-to-b from-white to-purple-50/50 p-6">
//             {!completed ? (
//               <div>
//                 <h3 className="font-semibold text-gray-900 mb-3">{node.label}</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   {node.options?.map((o) => (
//                     <OptionCard key={o.id} option={o} onClick={() => onPick(o)} brandColor={brandColor} />
//                   ))}

//                   {/* Micro-questions for book_tomorrow / hold */}
//                   {path[path.length - 1] === "book_tomorrow" && (
//                     <MiniQuestion
//                       title="When tomorrow?"
//                       choices={["Morning", "Afternoon", "Evening"]}
//                       onPick={(choice) => onPickMini(choice)}
//                     />
//                   )}
//                   {path[path.length - 1] === "hold" && (
//                     <MiniQuestion
//                       title="Hold until?"
//                       choices={["3 days", "1 week", "2 weeks"]}
//                       onPick={(choice) => onPickMini(choice)}
//                     />
//                   )}
//                 </div>

//                 {/* Notes */}
//                 <div className="mt-5">
//                   <label className="text-sm text-gray-600">Notes (optional)</label>
//                   <textarea
//                     value={note}
//                     onChange={(e) => setNote(e.target.value)}
//                     className="mt-2 w-full min-h-[80px] rounded-xl border p-3 focus:outline-none focus:ring-4"
//                     style={{ borderColor: "#e5e7eb" }}
//                     placeholder="Type any quick notes here..."
//                   />
//                 </div>

//                 <div className="mt-5 flex items-center justify-end gap-3">
//                   <button onClick={closeAll} className="px-4 py-2 rounded-full border">Cancel</button>
//                 </div>
//               </div>
//             ) : (
//               <SuccessView brandColor={brandColor} onClose={closeAll} />
//             )}
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// function labelFor(key) {
//   if (key === "root") return "Start";

//   // Handle composite micro-choice tokens like "book_tomorrow>Morning"
//   if (key.includes(">")) {
//     const [base, detail] = key.split(">");
//     const baseLabel = BASE_LABELS[base] || base;
//     return `${baseLabel}: ${detail}`;
//   }

//   return BASE_LABELS[key] || key;
// }

// const BASE_LABELS = {
//   not_answered: "Not answered",
//   answered: "Answered",
//   not_reachable: "Not reachable",
//   details_sent: "Details sent",
//   interested: "Interested",
//   not_interested: "Not interested",
//   confirmed: "Confirmed",
//   book_tomorrow: "Book tomorrow",
//   hold: "Hold",
//   change: "Change",
//   itinerary_change: "Itinerary",
//   price_change: "Price",
//   destination_change: "Destination",
//   date_change: "Date",
// };

// function OptionCard({ option, onClick, brandColor }) {
//   const Icon = option.icon || CircleDot;
//   return (
//     <motion.button
//       whileHover={{ y: -3, scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       onClick={onClick}
//       className="flex items-center gap-3 p-4 rounded-2xl border text-left shadow-sm bg-white hover:shadow-md"
//       style={{ borderColor: brandColor + "33" }}
//     >
//       <div className="p-3 rounded-xl border" style={{ borderColor: brandColor + "55", color: brandColor }}>
//         <Icon size={20} />
//       </div>
//       <div className="">
//         <div className="font-semibold text-gray-900">{option.label}</div>
//         <div className="text-xs text-gray-500">Tap to choose</div>
//       </div>
//     </motion.button>
//   );
// }

// function MiniQuestion({ title, choices, onPick }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="col-span-full mt-2"
//     >
//       <div className="text-sm text-gray-600 mb-2">{title}</div>
//       <div className="flex flex-wrap gap-2">
//         {choices.map((c) => (
//           <motion.button
//             key={c}
//             whileHover={{ y: -2 }}
//             onClick={() => onPick(c)}
//             className="px-3 py-1.5 rounded-full border bg-white text-sm"
//           >
//             {c}
//           </motion.button>
//         ))}
//       </div>
//     </motion.div>
//   );
// }

// function SuccessView({ brandColor, onClose }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="text-center"
//     >
//       <div className="flex items-center justify-center">
//         <motion.div
//           initial={{ scale: 0.8, rotate: -10 }}
//           animate={{ scale: 1, rotate: 0 }}
//           transition={{ type: "spring", stiffness: 200, damping: 12 }}
//           className="w-20 h-20 rounded-3xl grid place-items-center shadow-xl"
//           style={{ background: brandColor + "22", color: brandColor }}
//         >
//           <PartyPopper size={36} />
//         </motion.div>
//       </div>
//       <h3 className="mt-4 text-xl font-bold text-gray-900">All set!</h3>
//       <p className="text-gray-600 mt-1">Your contact outcome was saved successfully.</p>
//       <div className="mt-6">
//         <button
//           onClick={onClose}
//           className="px-5 py-2.5 rounded-full text-white font-semibold shadow"
//           style={{ background: brandColor }}
//         >
//           Close
//         </button>
//       </div>
//     </motion.div>
//   );
// }

