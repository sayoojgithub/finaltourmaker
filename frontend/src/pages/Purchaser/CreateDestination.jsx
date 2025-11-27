import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { CheckCircle, XCircle } from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

const CreateDestination = () => {
  const [selectedType, setSelectedType] = useState("Country");
  const [selectedCountry, setSelectedCountry] = useState(null); // react-select option or null
  const [selectedState, setSelectedState] = useState(null); // react-select option or null
  const [inputValue, setInputValue] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // --------- shared react-select styles (same as your CreateClient) ----------
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
      const res = await API.get(
        `/purchaser/destinations?page=${page}&search=${encodeURIComponent(search)}`
      );
      setDestinations(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    // Whenever country changes, refresh states
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry?.value]);

  useEffect(() => {
    fetchDestinations();
  }, [page, search]);

  // Handle create logic
  const handleCreate = async () => {
    const type = selectedType;

    if (!inputValue.trim()) {
      if (type === "Country") {
        toast.error("Country name is mandatory");
      } else if (type === "State") {
        toast.error("Country and State name are mandatory");
      } else if (type === "Destination") {
        toast.error("Country, State and Destination name are mandatory");
      }
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
          country: selectedCountry.value, // ID
        });
      } else if (type === "Destination") {
        if (!selectedCountry?.value || !selectedState?.value) {
          toast.error("Please select both country and state");
          return;
        }
        await API.post("/purchaser/destination", {
          name: inputValue,
          country: selectedCountry.value, // ID
          state: selectedState.value, // ID
        });
        fetchDestinations();
      }

      // Reset inputs and refresh dropdown data
      setInputValue("");
      setSelectedCountry(null);
      setSelectedState(null);
      fetchCountries();
      fetchStates();

      toast.success(`${type} created successfully`);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err.message || "Something went wrong";
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
        toast.success(
          `Destination ${updatedStatus ? "activated" : "deactivated"} successfully`
        );
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

  // Build option arrays each render (cheap map)
  const countryOptions = countries.map(toCountryOption);
  const stateOptions = states.map(toStateOption);

  return (
    <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-md p-6 md:p-8 mx-auto mb-6">
      <div className="min-h-screen bg-white px-4 py-10 flex flex-col items-center gap-10">
        <div className="w-full max-w-md mx-auto p-4 md:p-6">
          {/* Type selector */}
          <div className="flex justify-between bg-white border border-gray-300 rounded-xl p-3">
            {["Country", "State", "Destination"].map((type) => (
              <label
                key={type}
                className="flex items-center space-x-2 cursor-pointer text-sm md:text-base"
              >
                <input
                  type="radio"
                  name="locationType"
                  value={type}
                  checked={selectedType === type}
                  onChange={() => {
                    setSelectedType(type);
                    setSelectedCountry(null);
                    setSelectedState(null);
                    setInputValue("");
                  }}
                  className="accent-[#8570EE]"
                />
                <span className="text-[#8570EE] font-medium">{type}</span>
              </label>
            ))}
          </div>

          {/* Country select (React Select) */}
          {selectedType !== "Country" && (
            <div className="w-full mt-4">
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={(v) => {
                  setSelectedCountry(v);
                  setSelectedState(null);
                }}
                placeholder="Select Country"
                styles={selectStyles}
                classNamePrefix="create-country"
                getOptionValue={(o) => String(o._id || o.value)}
                isClearable
                // menuPortalTarget={document.body} // enable if you face clipping
                // styles={{ ...selectStyles, menuPortal: b => ({ ...b, zIndex: 9999 }) }}
              />
            </div>
          )}

          {/* State select (React Select) */}
          {selectedType === "Destination" && (
            <div className="w-full mt-4">
              <Select
                options={stateOptions}
                value={selectedState}
                onChange={(v) => setSelectedState(v)}
                placeholder="Select State"
                styles={selectStyles}
                classNamePrefix="create-state"
                getOptionValue={(o) => String(o._id || o.value)}
                isClearable
                isDisabled={!selectedCountry?.value}
              />
            </div>
          )}

          {/* Input field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter ${selectedType}`}
            className="w-full mt-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />

          {/* Submit button */}
          <button
            onClick={handleCreate}
            className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
          >
            Create
          </button>
        </div>

        {/* Table + Search */}
        <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <h5 className="text-3xl font-Abril text-[#321F6A] mb-1">
            View Destinations
          </h5>
          <p className="mb-4 text-sm text-gray-400">Paginated destination list</p>

          {/* Search input (top-left) */}
          <div className="flex justify-start mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search destination..."
              className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            />
          </div>

          {/* Table */}
          <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Sl No</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Destination code</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d, idx) => (
                <tr key={d._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">
                    {(page - 1) * 3 + idx + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold">{d.country?.name}</td>
                  <td className="px-6 py-4 font-semibold">{d.state?.name}</td>
                  <td className="px-6 py-4 font-semibold">{d.name}</td>
                  <td className="px-6 py-4 font-semibold">{d.destinationCode}</td>
                  <td className="px-6 py-4  font-semibold">
                    {d.activeStatus ? (
                      <span
                        className="inline-flex items-center gap-1 text-green-600 cursor-pointer"
                        onClick={() => handleStatusClick(d)}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Active
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-red-500 cursor-pointer"
                        onClick={() => handleStatusClick(d)}
                      >
                        <XCircle className="w-5 h-5" />
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-60"
            >
              Previous
            </button>
            <span className="px-3 py-1">{page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Activate/Deactivate Popup */}
      {showPopup && selectedDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedDestination.activeStatus ? "Deactivate" : "Activate"} Destination
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {selectedDestination.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the destination:{" "}
              <span className="font-semibold">{selectedDestination.name}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setSelectedDestination(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  selectedDestination.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {selectedDestination.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDestination;
