import React, { useState, useEffect } from "react";
import API from "../../api";
import { Pencil } from "lucide-react";
import { ReceiptText } from "lucide-react";
import { toast } from "react-toastify";

const CreateFixedTour = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    tourName: "",
    articleNumber: "",
    category: "",
    pickupPoint: "",
    dropOffPoint: "",
    totalDays: "",
    totalNights: "",
    validFrom: "",
    validTill: "",
    paxPrices: {
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "",
      12: "",
      13: "",
      14: "",
      15: "",
      16: "",
      17: "",
      18: "",
    },
  });
  const [includes, setIncludes] = useState([]);
  const [excludes, setExcludes] = useState([]);
  const [days, setDays] = useState([]);
  const [fixedTours, setFixedTours] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentlyEditingTourId, setCurrentlyEditingTourId] = useState(null);
  const fetchFixedTours = async () => {
    try {
      const res = await API.get("/purchaser/fixedTours", {
        params: {
          page,
          limit: 3,
          search,
        },
      });
      setFixedTours(res.data.tours); // Assuming response shape
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching group tours:", error);
      toast.error("Failed to fetch group tours.");
    }
  };
  useEffect(() => {
    fetchFixedTours();
  }, [search, page]);

  useEffect(() => {
    const total = parseInt(formData.totalDays, 10);
    if (formData.totalDays === "" || isNaN(total) || total <= 0) return;

    setDays((prev) => {
      const newDays = [...prev];

      // If total increased, add new empty day objects
      while (newDays.length < total) {
        newDays.push({
          country: "",
          state: "",
          destination: "",
          trip: "",
          activities: ["", "", ""],
          expanded: false,
          availableStates: [],
          availableDestinations: [],
          availableTrips: [],
          availableAddonTrips: [],
          availableActivities: [],
          selectedAddon: "",
          selectedActivity: "",
          date: "",
        });
      }

      // If total decreased, remove extra days
      if (newDays.length > total) {
        newDays.splice(total); // cuts off extra elements
      }

      return newDays;
    });
  }, [formData.totalDays]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data);
      } catch (err) {
        toast.error("Error fetching countries:", err);
      }
    };
    fetchCountries();
  }, []);
  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.country || currentlyEditingTourId) return;
      setStates([]);
      setDestinations([]);
      setFormData((prev) => ({
        ...prev,
        state: "",
        destination: "",
      }));
      try {
        const res = await API.get(`/purchaser/states/${formData.country}`);
        setStates(res.data);
      } catch (err) {
        toast.error("Error fetching states");
      }
    };
    fetchStates();
  }, [formData.country]);
  useEffect(() => {
    if (!formData.country || !formData.state || currentlyEditingTourId) return;
    setDestinations([]);
    setFormData((prev) => ({
      ...prev,
      destination: "",
    }));

    const fetchDestinations = async () => {
      try {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${formData.country}/${formData.state}`
        );
        setDestinations(res.data);
        setFormData((prev) => ({ ...prev, destination: "" }));
      } catch (err) {
        toast.error("Error fetching destinations");
      }
    };
    fetchDestinations();
  }, [formData.state, formData.country]);

  const handleAddItem = (item, setItemList, itemList, inputId) => {
    if (item && !itemList.includes(item)) {
      setItemList([...itemList, item]);
      document.getElementById(inputId).value = "";
    }
  };

  const handleRemoveItem = (index, setItemList, itemList) => {
    const newList = [...itemList];
    newList.splice(index, 1);
    setItemList(newList);
  };

  const handleClearActivity = (dayIndex, actIndex) => {
    const newDays = [...days];

    if (actIndex === 0) {
      newDays[dayIndex].trip = "";
      newDays[dayIndex].selectedAddon = "";
      newDays[dayIndex].selectedActivity = "";
    } else if (actIndex === 1) {
      newDays[dayIndex].selectedAddon = "";
    } else if (actIndex === 2) {
      newDays[dayIndex].selectedActivity = "";
    }

    setDays(newDays);
  };

  const handleRemoveDay = (index) => {
    const newDays = [...days];
    newDays.splice(index, 1);
    setDays(newDays);
  };

  const toggleDayExpand = (index) => {
    const newDays = [...days];
    newDays[index].expanded = !newDays[index].expanded;
    setDays(newDays);
  };
  const updateDayField = async (index, field, value) => {
    const d = [...days];
    const day = d[index];
    day[field] = value;

    // Reset dependent fields
    if (field === "country") {
      day.state = "";
      day.destination = "";
      day.trip = "";
      day.availableStates = [];
      day.availableDestinations = [];
      day.availableTrips = [];
      day.availableAddonTrips = [];
      day.availableActivities = [];
    }
    if (field === "state") {
      day.destination = "";
      day.trip = "";
      day.availableDestinations = [];
      day.availableTrips = [];
      day.availableAddonTrips = [];
      day.availableActivities = [];
    }
    if (field === "destination") {
      day.trip = "";
      day.availableTrips = [];
      day.availableAddonTrips = [];
      day.availableActivities = [];
    }

    // Fetch options based on the changed field
    try {
      if (field === "country") {
        const res = await API.get(`/purchaser/states/${value}`);
        day.availableStates = res.data;
      }
      if (field === "state") {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${day.country}/${value}`
        );
        day.availableDestinations = res.data;
      }
      if (field === "destination") {
        const res = await API.get(
          `/purchaser/tripsByLocation/${day.country}/${day.state}/${value}`
        );
        day.availableTrips = res.data;
      }
      if (field === "trip") {
        const res = await API.get(`/purchaser/tripDetails/${value}`);
        day.availableAddonTrips = res.data.addonTrips || [];
        day.availableActivities = res.data.activities || [];
      }
    } catch (err) {
      console.error("Error fetching", field, err);
    }

    // Compute the date for this day
    if (formData.startDate) {
      const base = new Date(formData.startDate);
      base.setDate(base.getDate() + index);
      day.date = base.toISOString().split("T")[0];
    }

    d[index] = day;
    setDays(d);
  };
  const handleEditTour = async (tour) => {
    setCurrentlyEditingTourId(tour._id);

    // Step 1: set form data (but blank state/destination temporarily)
    setFormData({
      ...formData,
      country: tour.country || "",
      state: "",
      destination: "",
      tourName: tour.tourName || "",
      articleNumber: tour.articleNumber || "",
      category: tour.category || "",
      pickupPoint: tour.pickupPoint || "",
      dropOffPoint: tour.dropOffPoint || "",
      totalDays: tour.totalDays?.toString() || "1",
      totalNights: tour.totalNights?.toString() || "",
      validFrom: tour.validFrom?.slice(0, 10) || "",
      validTill: tour.validTill?.slice(0, 10) || "",
      paxPrices: {
        1: tour.paxPrices?.["1"]?.toString() || "",
        2: tour.paxPrices?.["2"]?.toString() || "",
        3: tour.paxPrices?.["3"]?.toString() || "",
        4: tour.paxPrices?.["4"]?.toString() || "",
        5: tour.paxPrices?.["5"]?.toString() || "",
        6: tour.paxPrices?.["6"]?.toString() || "",
        7: tour.paxPrices?.["7"]?.toString() || "",
        8: tour.paxPrices?.["8"]?.toString() || "",
        9: tour.paxPrices?.["9"]?.toString() || "",
        10: tour.paxPrices?.["10"]?.toString() || "",
        11: tour.paxPrices?.["11"]?.toString() || "",
        12: tour.paxPrices?.["12"]?.toString() || "",
        13: tour.paxPrices?.["13"]?.toString() || "",
        14: tour.paxPrices?.["14"]?.toString() || "",
        15: tour.paxPrices?.["15"]?.toString() || "",
        16: tour.paxPrices?.["16"]?.toString() || "",
        17: tour.paxPrices?.["17"]?.toString() || "",
        18: tour.paxPrices?.["18"]?.toString() || "",
      },
    });

    setIncludes(tour.includes || []);
    setExcludes(tour.excludes || []);

    try {
      // Step 2: Fetch states and then set state
      if (tour.country) {
        const resStates = await API.get(`/purchaser/states/${tour.country}`);
        setStates(resStates.data);
      }

      setFormData((prev) => ({
        ...prev,
        state: tour.state || "",
      }));

      // Step 3: Fetch destinations and then set destination
      if (tour.country && tour.state) {
        const resDest = await API.get(
          `/purchaser/destinationsByCountryAndState/${tour.country}/${tour.state}`
        );
        setDestinations(resDest.data);
      }

      setFormData((prev) => ({
        ...prev,
        destination: tour.destination || "",
      }));
    } catch (err) {
      console.error("Failed to fetch state/destination in edit:", err);
      toast.error("Error preparing form for edit.");
    }

    // Step 4: Load days info with options
    const filledDays = await Promise.all(
      (tour.days || []).map(async (day, i) => {
        const d = {
          country: day.country || "",
          state: day.state || "",
          destination: day.destination || "",
          trip: day.trip || "",
          selectedAddon: day.selectedAddon || "",
          selectedActivity: day.selectedActivity || "",
          activities: ["", "", ""],
          expanded: false,
          date: day.date ? day.date.slice(0, 10) : "",
          availableStates: [],
          availableDestinations: [],
          availableTrips: [],
          availableAddonTrips: [],
          availableActivities: [],
        };

        try {
          if (d.country) {
            const res = await API.get(`/purchaser/states/${d.country}`);
            d.availableStates = res.data;
          }
          if (d.country && d.state) {
            const res = await API.get(
              `/purchaser/destinationsByCountryAndState/${d.country}/${d.state}`
            );
            d.availableDestinations = res.data;
          }
          if (d.country && d.state && d.destination) {
            const res = await API.get(
              `/purchaser/tripsByLocation/${d.country}/${d.state}/${d.destination}`
            );
            d.availableTrips = res.data;
          }
          if (d.trip) {
            const res = await API.get(`/purchaser/tripDetails/${d.trip}`);
            d.availableAddonTrips = res.data.addonTrips || [];
            d.availableActivities = res.data.activities || [];
          }
        } catch (err) {
          console.error(`Failed to fetch dropdowns for Day ${i + 1}:`, err);
        }

        return d;
      })
    );

    setDays(filledDays);
  };
  const handleCreateFixedTour = async () => {
    try {
      const requiredFields = {
        country: "Country is required",
        state: "State is required",
        destination: "Destination is required",
        tourName: "Tour Name is required",
        articleNumber: "Article Number is required",
        category: "Category is required",
        pickupPoint: "Pickup Point is required",
        dropOffPoint: "Drop-off Point is required",
        totalDays: "Total Days is required",
        totalNights: "Total Nights is required",
        validFrom: "Valid From is required",
        validTill: "Valid Till  is required",
      };

      // ✅ Validate main form fields
      for (const [field, message] of Object.entries(requiredFields)) {
        if (!formData[field]) {
          toast.error(message);
          return;
        }
      }
      // ✅ Validate validFrom is before validTill
      const fromDate = new Date(formData.validFrom);
      const tillDate = new Date(formData.validTill);

      if (fromDate >= tillDate) {
        toast.error("Valid From date must be earlier than Valid Till date.");
        return;
      }

      // ✅ Validate includes and excludes
      if (includes.length === 0) {
        toast.error("At least one Include is required.");
        return;
      }

      if (excludes.length === 0) {
        toast.error("At least one Exclude is required.");
        return;
      }
      // ✅ Validate paxPrices
      for (let i = 1; i <= 18; i++) {
        const price = formData.paxPrices[i];
        if (!price || price === "" || Number(price) <= 0) {
          toast.error(
            `Pax Price for ${i} pax is required and must be greater than 0.`
          );
          return;
        }
      }

      // ✅ Validate days
      if (days.length === 0) {
        toast.error("At least one day is required.");
        return;
      }

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (!day.country) {
          toast.error(`Country is required for Day ${i + 1}`);
          return;
        }
        if (!day.state) {
          toast.error(`State is required for Day ${i + 1}`);
          return;
        }
        if (!day.destination) {
          toast.error(`Destination is required for Day ${i + 1}`);
          return;
        }
        if (!day.trip) {
          toast.error(`Trip is required for Day ${i + 1}`);
          return;
        }
      }
      if (days.length !== Number(formData.totalDays)) {
        toast.error(
          `You must provide exactly ${formData.totalDays} day(s) of details.`
        );
        return;
      }

      if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
        toast.error("Total Nights should be exactly one less than Total Days.");
        return;
      }

      // Build request payload
      const payload = {
        ...formData,
        includes,
        excludes,
        days: days.map((day) => ({
          country: day.country,
          state: day.state,
          destination: day.destination,
          trip: day.trip,
          selectedAddon: day.selectedAddon || undefined,
          selectedActivity: day.selectedActivity || undefined,
        })),
      };

      let res;
      if (currentlyEditingTourId) {
        res = await API.put(
          `/purchaser/updateFixedTour/${currentlyEditingTourId}`,
          payload
        );
        toast.success("Group tour updated successfully!");
        setCurrentlyEditingTourId(null);
        await fetchFixedTours();
      } else {
        res = await API.post("/purchaser/createFixedTour", payload);
        toast.success("Group tour created successfully!");
        await fetchFixedTours();
      }

      // ✅ Clear all form data
      setFormData({
        country: "",
        state: "",
        destination: "",
        tourName: "",
        articleNumber: "",
        category: "",
        pickupPoint: "",
        dropOffPoint: "",
        totalDays: "",
        totalNights: "",
        validFrom: "",
        validTill: "",
        paxPrices: {
          1: "",
          2: "",
          3: "",
          4: "",
          5: "",
          6: "",
          7: "",
          8: "",
          9: "",
          10: "",
          11: "",
          12: "",
          13: "",
          14: "",
          15: "",
          16: "",
          17: "",
          18: "",
        },
      });
      setIncludes([]);
      setExcludes([]);
      setDays([]);
      setStates([]);
      setDestinations([]);
    } catch (error) {
      console.error("Error creating group tour:", error);
      toast.error("Failed to create group tour.");
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[100rem] mx-auto text-base font-sans bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Country */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Country
          </label>
          <select
            value={formData.country}
            disabled={!!currentlyEditingTourId}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full disabled:cursor-not-allowed"
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
            value={formData.state}
            disabled={!!currentlyEditingTourId}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full disabled:cursor-not-allowed"
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
            value={formData.destination}
            disabled={!!currentlyEditingTourId}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full disabled:cursor-not-allowed"
          >
            <option value="">Select Destination</option>
            {destinations.map((destination) => (
              <option key={destination._id} value={destination._id}>
                {destination.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tour Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Tour Name
          </label>
          <input
            type="text"
            placeholder="Tour Name"
            value={formData.tourName}
            disabled={!!currentlyEditingTourId}
            onChange={(e) =>
              setFormData({
                ...formData,
                tourName: e.target.value.toUpperCase(),
              })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full disabled:cursor-not-allowed"
          />
        </div>

        {/* Article Number */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Article Number
          </label>
          <input
            type="text"
            placeholder="Article Number"
            value={formData.articleNumber}
            disabled={!!currentlyEditingTourId}
            onChange={(e) =>
              setFormData({
                ...formData,
                articleNumber: e.target.value.toUpperCase(),
              })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full disabled:cursor-not-allowed"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Category
          </label>
          <select
            value={formData.category}
            disabled={!!currentlyEditingTourId}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full disabled:cursor-not-allowed"
          >
            <option value="">Select Category</option>
            <option value="Standard">Standard</option>
            <option value="Delux">Delux</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        {/* Pickup Point */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Pickup Point
          </label>
          <input
            type="text"
            placeholder="Enter Pickup Point"
            value={formData.pickupPoint}
            onChange={(e) =>
              setFormData({ ...formData, pickupPoint: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
          />
        </div>

        {/* Drop Off Point */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Drop Off Point
          </label>
          <input
            type="text"
            placeholder="Enter Drop Off Point"
            value={formData.dropOffPoint}
            onChange={(e) =>
              setFormData({ ...formData, dropOffPoint: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
          />
        </div>

        {/* Total Days */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Total Days
          </label>
          <input
            type="number"
            min={1}
            value={formData.totalDays}
            onChange={(e) => {
              // Block manual typing — only allow arrow keys (↑↓)
              const val = e.target.value;
              const nativeEvent = e.nativeEvent;

              // Allow only keyboard arrows, not manual typing
              if (nativeEvent.inputType === "insertText" && isNaN(Number(val)))
                return;

              // Always keep value ≥ 1
              const parsed = Math.max(1, parseInt(val || "1", 10));
              setFormData({ ...formData, totalDays: String(parsed) });
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const current = parseInt(formData.totalDays || "1");
                setFormData({ ...formData, totalDays: String(current + 1) });
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const current = parseInt(formData.totalDays || "1");
                if (current > 1) {
                  setFormData({ ...formData, totalDays: String(current - 1) });
                }
              }
            }}
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
          />
        </div>

        {/* Total Nights */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Total Nights
          </label>
          <input
            type="text"
            placeholder="Enter Total Nights"
            value={formData.totalNights}
            onChange={(e) =>
              setFormData({ ...formData, totalNights: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
          />
        </div>
        {/*Valid From */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Valid From
          </label>
          <input
            type="date"
            value={formData.validFrom}
            onChange={(e) =>
              setFormData({ ...formData, validFrom: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full"
          />
        </div>
        {/*Valid Till */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Valid Till
          </label>
          <input
            type="date"
            value={formData.validTill}
            onChange={(e) =>
              setFormData({ ...formData, validTill: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700 w-full"
          />
        </div>
      </div>

      <div className="flex w-full gap-3">
        {/* Include Section - 50% */}
        <div className="w-1/2 flex items-center gap-3">
          <input
            id="includeInput"
            className="border border-gray-300 p-3 w-full rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="Add to Includes"
          />
          <button
            onClick={() =>
              handleAddItem(
                document.getElementById("includeInput").value,
                setIncludes,
                includes,
                "includeInput"
              )
            }
            className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
          >
            +
          </button>
        </div>

        {/* Exclude Section - 50% */}
        <div className="w-1/2 flex items-center gap-3">
          <input
            id="excludeInput"
            className="border border-gray-300 p-3 w-full rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="Add to Excludes"
          />
          <button
            onClick={() =>
              handleAddItem(
                document.getElementById("excludeInput").value,
                setExcludes,
                excludes,
                "excludeInput"
              )
            }
            className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">Includes</h2>
        <div className="flex flex-wrap gap-3">
          {includes.map((tag, index) => (
            <span
              key={index}
              className="bg-white text-black px-4 py-1 rounded-full flex items-center gap-2 shadow border border-black"
            >
              {tag}
              <button
                onClick={() => handleRemoveItem(index, setIncludes, includes)}
                className="text-black hover:text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">Excludes</h2>
        <div className="flex flex-wrap gap-3">
          {excludes.map((tag, index) => (
            <span
              key={index}
              className="bg-white text-black px-4 py-1 rounded-full flex items-center gap-2 shadow border border-black"
            >
              {tag}
              <button
                onClick={() => handleRemoveItem(index, setExcludes, excludes)}
                className="text-black hover:text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-700">PAX Pricing</h2>
        {[0, 1].map((rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-4"
          >
            {Array.from({ length: 9 }, (_, i) => {
              const pax = i + 1 + rowIndex * 9;
              return (
                <div key={pax}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {pax} PAX
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Enter price for ${pax} PAX`}
                    value={formData.paxPrices[pax]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paxPrices: {
                          ...prev.paxPrices,
                          [pax]: e.target.value,
                        },
                      }))
                    }
                    className="border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] placeholder-gray-400 w-full"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {days.map((day, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleDayExpand(i)}
            >
              <span className="text-lg font-bold text-gray-500">
                {day.expanded ? "▾" : "▸"}
              </span>
              <h3 className="text-xl font-semibold text-gray-800">
                Day {i + 1}
              </h3>
            </div>
            <button
              onClick={() => handleRemoveDay(i)}
              className="text-gray-300 hover:text-red-400 font-bold text-xl"
            >
              ×
            </button>
          </div>

          {/* 👇 EVERYTHING THAT SHOULD BE HIDDEN UNTIL EXPANDED GOES HERE */}
          {day.expanded && (
            <div>
              {/* COUNTRY / STATE / DEST */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <select
                  value={day.country}
                  onChange={(e) => updateDayField(i, "country", e.target.value)}
                  className="..."
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={day.state}
                  onChange={(e) => updateDayField(i, "state", e.target.value)}
                  className="..."
                >
                  <option value="">Select State</option>
                  {day.availableStates.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={day.destination}
                  onChange={(e) =>
                    updateDayField(i, "destination", e.target.value)
                  }
                  className="..."
                >
                  <option value="">Select Destination</option>
                  {day.availableDestinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* TRIP */}
              <div className="flex items-center gap-3 mb-3">
                <select
                  value={day.trip}
                  onChange={async (e) => {
                    const val = e.target.value;
                    await updateDayField(i, "trip", val);
                  }}
                  className="w-full border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700"
                >
                  <option value="">Select Trip</option>
                  {day.availableTrips?.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.tripName}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleClearActivity(i, 0)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg"
                >
                  ×
                </button>
              </div>

              {/* ADD-ON */}
              <div className="flex items-center gap-3 mb-3">
                <select
                  value={day.selectedAddon}
                  onChange={(e) => {
                    const val = e.target.value;
                    const d2 = [...days];
                    d2[i].selectedAddon = val;
                    setDays(d2);
                  }}
                  className="w-full border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700"
                >
                  <option value="">Select Addon Trip</option>
                  {day.availableAddonTrips?.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.tripName}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleClearActivity(i, 1)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg"
                >
                  ×
                </button>
              </div>

              {/* ACTIVITY */}
              <div className="flex items-center gap-3 mb-3">
                <select
                  value={day.selectedActivity}
                  onChange={(e) => {
                    const val = e.target.value;
                    const d2 = [...days];
                    d2[i].selectedActivity = val;
                    setDays(d2);
                  }}
                  className="w-full border border-gray-300 p-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#8570EE] text-gray-700"
                >
                  <option value="">Select Activity</option>
                  {day.availableActivities?.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.tripName}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleClearActivity(i, 2)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleCreateFixedTour}
        className="w-full mt-6 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
      >
        {currentlyEditingTourId ? "Update Fixed Tour" : "Create Fixed Tour"}
      </button>
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
          View Fixed Tour
        </h5>
        <p className="block mb-6 text-sm font-light text-gray-400">
          Search and Edit Fixed Tour
        </p>
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on new search
            }}
            placeholder="Search by Fixed Tour Name..."
            className="w-full md:w-1/3 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
          />
        </div>
        <div className="overflow-x-auto ">
          <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Sl No</th>
                <th className="px-6 py-4">TOUR NAME</th>
                <th className="px-6 py-4">ARTICLE NUMBER</th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4 text-center">EDIT</th>
                <th className="px-6 py-4 text-center">Bo</th>
              </tr>
            </thead>
            <tbody>
              {fixedTours.length > 0 ? (
                fixedTours.map((tour, idx) => (
                  <tr
                    key={tour._id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {(page - 1) * 3 + idx + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold">{tour.tourName}</td>
                    <td className="px-6 py-4 font-semibold">
                      {tour.articleNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold">{tour.category}</td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <button
                        onClick={() => handleEditTour(tour)}
                        className="text-gray-700 hover:text-gray-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <button
                        title="Booking Order"
                        className="text-purple-600 hover:text-purple-800"
                        //onClick={() => handleBookingOrder(tour)}
                      >
                        <ReceiptText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">
                    No tours found.
                  </td>
                </tr>
              )}
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
    </div>
  );
};
export default CreateFixedTour;
