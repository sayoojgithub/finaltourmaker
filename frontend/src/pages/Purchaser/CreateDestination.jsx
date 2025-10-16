import React, { useEffect, useState } from "react";
import { Pencil, CheckCircle, XCircle } from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

const CreateDestination = () => {
  const [selectedType, setSelectedType] = useState("Country");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
 const [selectedDestination, setSelectedDestination] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  // Fetch countries
  const fetchCountries = async () => {
    const res = await API.get("/purchaser/countries");
    setCountries(res.data);
  };

  // Fetch states based on selected country
  const fetchStates = async () => {
    if (selectedCountry) {
      const res = await API.get(`/purchaser/states/${selectedCountry}`);
      setStates(res.data);
    }
  };

  // Fetch destinations with pagination and search
  const fetchDestinations = async () => {
    const res = await API.get(
      `/purchaser/destinations?page=${page}&search=${search}`
    );
    setDestinations(res.data.data);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) fetchStates();
  }, [selectedCountry]);

  useEffect(() => {
    fetchDestinations();
  }, [page, search]);
  console.log(inputValue, selectedCountry);

  // Handle create logic
  const handleCreate = async () => {
    if (!inputValue.trim()) {
      if (selectedType === "Country") {
        toast.error("Country name is mandatory");
      } else if (selectedType === "State") {
        toast.error("Country and State name are mandatory");
      } else if (selectedType === "Destination") {
        toast.error("Country, State and Destination name are mandatory");
      }
      return;
    }

    try {
      if (selectedType === "Country") {
        await API.post("/purchaser/country", { name: inputValue });
      } else if (selectedType === "State") {
        if (!selectedCountry) {
          toast.error("Please select a country");
          return;
        }
        await API.post("/purchaser/state", {
          name: inputValue,
          country: selectedCountry,
        });
      } else if (selectedType === "Destination") {
        if (!selectedCountry || !selectedState) {
          toast.error("Please select both country and state");
          return;
        }
        await API.post("/purchaser/destination", {
          name: inputValue,
          country: selectedCountry,
          state: selectedState,
        });
        fetchDestinations();
      }

      setInputValue("");
      setSelectedCountry("");
      setSelectedState("");
      fetchCountries();
      fetchStates();

      toast.success(`${selectedType} created successfully`);
    } catch (err) {
      console.error(err);
      // Handle Axios errors specifically
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
          {
            activeStatus: updatedStatus,
          }
        );
  
        if (res.data.success) {
          toast.success(
            `Destination ${updatedStatus ? "activated" : "deactivated"} successfully`
          );
          await fetchDestinations(); // refresh table
        } else {
          toast.error("Update failed");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      } finally {
        setShowPopup(false);
        setSelectedDestination(null);
      }
    };

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
                    setSelectedCountry("");
                    setSelectedState("");
                    setInputValue("");
                  }}
                  className="accent-[#8570EE]"
                />
                <span className="text-[#8570EE] font-medium">{type}</span>
              </label>
            ))}
          </div>

          {/* Country select */}
          {selectedType !== "Country" && (
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState("");
              }}
              className="w-full mt-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* State select */}
          {selectedType === "Destination" && (
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full mt-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
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
          <p className="mb-4 text-sm text-gray-400">
            Paginated destination list
          </p>

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
                  <td className="px-6 py-4 font-semibold">
                    {d.destinationCode}
                  </td>
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
