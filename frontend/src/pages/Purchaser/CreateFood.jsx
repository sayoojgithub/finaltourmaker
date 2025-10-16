import React, { useState, useEffect } from "react";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { Pencil, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";
const CreateFood = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    destination: "",
    trip: "",
  });
  const [rows, setRows] = useState([
    {
      vendor: "",
      mealType: "",
      mealCategory: "",
      foodName: "",
      description: "",
      prices: [
        {
          validFrom: "",
          validTo: "",
          price: "",
          percent: "",
          itineraryPrice: "",
        },
      ],
      expanded: true,
    },
  ]);
  const [tripsWithFood, setTripsWithFood] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingTripFoodId, setEditingTripFoodId] = useState(null);
  const [selectedTripFood, setSelectedTripFood] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const fetchTripsWithFood = async () => {
    try {
      const res = await API.get("/purchaser/food-trips", {
        params: {
          search,
          page,
          limit: 3,
        },
      });
      setTripsWithFood(res.data.trips);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch trips with food");
      console.error(err);
    }
  };
  useEffect(() => {
    fetchTripsWithFood();
  }, [search, page]);

  const handleChange = (rowIndex, field, value) => {
    const updated = [...rows];
    updated[rowIndex][field] = value;
    setRows(updated);
  };
  const handlePriceChange = (rowIndex, priceIndex, field, value) => {
    const updated = [...rows];
    const priceObj = updated[rowIndex].prices[priceIndex];

    priceObj[field] = value;

    const price = parseFloat(priceObj.price) || 0;
    const percent = parseFloat(priceObj.percent) || 0;
    const itineraryPrice = price + (price * percent) / 100;

    priceObj.itineraryPrice = itineraryPrice.toFixed(2);

    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        vendor: "",
        mealType: "",
        mealCategory: "",
        foodName: "",
        description: "",
        prices: [
          {
            validFrom: "",
            validTo: "",
            price: "",
            percent: "",
            itineraryPrice: "",
          },
        ],
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
    updated[rowIndex].prices.push({
      validFrom: "",
      validTo: "",
      price: "",
      percent: "",
      itineraryPrice: "",
    });
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
    const fetchStates = async (countryId) => {
      if (!countryId) return;

      try {
        const res = await API.get(`/purchaser/states/${countryId}`);
        setStates(res.data); // make sure `states` is defined via useState
      } catch (err) {
        toast.error(`Error fetching states: ${err.message}`);
      }
    };

    fetchStates(formData.country);
  }, [formData.country]);
  useEffect(() => {
    const fetchDestinations = async (countryId, stateId) => {
      if (!countryId || !stateId) return;

      try {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${countryId}/${stateId}`
        );
        setDestinations(res.data);
      } catch (err) {
        toast.error(`Error fetching destinations: ${err.message}`);
      }
    };

    fetchDestinations(formData.country, formData.state);
  }, [formData.country, formData.state]);

  const fetchData = async (countryId, stateId, destinationId) => {
    try {
      if (countryId && stateId && destinationId) {
        const [vendorsRes, tripsRes] = await Promise.all([
          API.get(
            `/purchaser/vendorsOfFoods/${countryId}/${stateId}/${destinationId}`
          ),
          API.get(
            `/purchaser/tripsByLocation/${countryId}/${stateId}/${destinationId}`
          ),
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

  // useEffect just calls it with formData values
  useEffect(() => {
    fetchData(formData.country, formData.state, formData.destination);
  }, [formData.country, formData.state, formData.destination]);
  console.log(formData);
  console.log(rows);
  const validateForm = () => {
    const requiredFields = {
      country: "Country",
      state: "State",
      destination: "Destination",
      trip: "Trip",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key]) {
        toast.error(`${label} is required.`);
        return false;
      }
    }

    if (!rows.length) {
      toast.error("At least one food item is required.");
      return false;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowPrefix = `Row ${i + 1}`;

      const requiredRowFields = {
        vendor: "Vendor",
        mealType: "Meal Type",
        mealCategory: "Meal Category",
        foodName: "Food Name",
        description: "Description",
      };

      for (const [key, label] of Object.entries(requiredRowFields)) {
        if (!row[key]) {
          toast.error(`${rowPrefix}: ${label} is required.`);
          return false;
        }
      }

      if (!row.prices || !row.prices.length) {
        toast.error(`${rowPrefix}: At least one price entry is required.`);
        return false;
      }

      // ✅ CHECK CONFLICTS in prices
      const dateRanges = [];

      for (let j = 0; j < row.prices.length; j++) {
        const price = row.prices[j];
        const pricePrefix = `${rowPrefix}, Price ${j + 1}`;

        if (!price.validFrom || !price.validTo) {
          toast.error(`${pricePrefix}: Valid From and To dates are required.`);
          return false;
        }

        const from = new Date(price.validFrom);
        const to = new Date(price.validTo);

        if (from >= to) {
          toast.error(
            `${pricePrefix}: Valid From must be earlier than Valid To.`
          );
          return false;
        }

        // ✅ Check overlap with previously stored ranges
        for (let k = 0; k < dateRanges.length; k++) {
          const { start, end } = dateRanges[k];
          const isOverlap = !(to < start || from > end);
          if (isOverlap) {
            toast.error(
              `${rowPrefix}: Price ${j + 1} conflicts with Price ${k + 1}.`
            );

            return false;
          }
        }

        // Store current date range
        dateRanges.push({ start: from, end: to });

        const numericPrice = parseFloat(price.price);
        const numericPercent = parseFloat(price.percent);

        if (isNaN(numericPrice) || numericPrice <= 0) {
          toast.error(`${pricePrefix}: Price must be greater than 0.`);
          return false;
        }

        if (isNaN(numericPercent) || numericPercent <= 0) {
          toast.error(`${pricePrefix}: Percent must be greater than 0.`);
          return false;
        }
      }
    }

    return true;
  };

  const handleEdit = async (foodId) => {
    try {
      const res = await API.get(`/purchaser/food/${foodId}`);
      const food = res.data;

      setEditingTripFoodId(foodId);

      // Set formData using IDs
      setFormData({
        country: food.country._id,
        state: food.state._id,
        destination: food.destination._id,
        trip: food.trip._id,
      });

      // Fetch dropdown dependencies
      await API.get(`/purchaser/states/${food.country._id}`).then((res) => {
        setStates(res.data);
      });

      await API.get(
        `/purchaser/destinationsByCountryAndState/${food.country._id}/${food.state._id}`
      ).then((res) => {
        setDestinations(res.data);
      });

      await Promise.all([
        API.get(
          `/purchaser/vendorsOfFoods/${food.country._id}/${food.state._id}/${food.destination._id}`
        ).then((res) => setVendors(res.data)),
        API.get(
          `/purchaser/tripsByLocation/${food.country._id}/${food.state._id}/${food.destination._id}`
        ).then((res) => setTrips(res.data)),
      ]);

      // Convert backend food.rows into form-safe format
      const formattedRows = food.rows.map((row) => ({
        vendor: row.vendor?._id || "",
        mealType: row.mealType || "",
        mealCategory: row.mealCategory || "",
        foodName: row.foodName || "",
        description: row.description || "",
        prices: row.prices.map((p) => ({
          validFrom: p.validFrom ? p.validFrom.slice(0, 10) : "",
          validTo: p.validTo ? p.validTo.slice(0, 10) : "",
          price: p.price || "",
          percent: p.percent || "",
          itineraryPrice: p.itineraryPrice || "",
        })),
        expanded: true,
      }));

      setRows(formattedRows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load food for editing.");
    }
  };

  const handleCreateFood = async () => {
    try {
      if (!validateForm()) return;

      const payload = {
        ...formData,
        rows,
      };

      if (editingTripFoodId) {
        // Update food
        const res = await API.put(
          `/purchaser/food/${editingTripFoodId}`,
          payload
        );

        if (res.data.success) {
          toast.success("Food updated successfully!");
        } else {
          toast.error(res?.data?.message || "Failed to update food.");
          return;
        }
      } else {
        // Create food
        const res = await API.post("/purchaser/createFood", payload);

        if (res.data.success) {
          toast.success("Food created successfully!");
        } else {
          toast.error(res?.data?.message || "Failed to create food.");
          return;
        }
      }

      // Reset form after success
      setFormData({
        country: "",
        state: "",
        destination: "",
        trip: "",
      });
      setRows([
        {
          vendor: "",
          mealType: "",
          mealCategory: "",
          foodName: "",
          description: "",
          prices: [
            {
              validFrom: "",
              validTo: "",
              price: "",
              percent: "",
              itineraryPrice: "",
            },
          ],
          expanded: true,
        },
      ]);
      setStates([]);
      setDestinations([]);
      setTrips([]);
      setVendors([]);
      setEditingTripFoodId(null); // Clear editing state
      fetchTripsWithFood(); // Refresh table/list
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "An error occurred while submitting food."
      );
    }
  };
  const handleStatusClick = (tripfood) => {
    setSelectedTripFood(tripfood);
    setShowPopup(true);
  };
  const handleToggleStatus = async () => {
    if (!selectedTripFood) return;

    try {
      const updatedStatus = !selectedTripFood.activeStatus;

      const res = await API.patch(
        `/purchaser/updateTripFoodStatus/${selectedTripFood._id}/status`,
        {
          activeStatus: updatedStatus,
        }
      );

      if (res.data.success) {
        toast.success(
          `Food in the trip ${
            updatedStatus ? "activated" : "deactivated"
          } successfully`
        );
        await fetchTripsWithFood(); // refresh table
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setShowPopup(false);
      setSelectedTripFood(null);
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 space-y-10 text-sm font-medium">
      {/* Trip Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Country
          </label>
          <select
            disabled={editingTripFoodId !== null}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition duration-300 disabled:cursor-not-allowed"
            value={formData.country}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                country: value,
                state: "",
                destination: "",
                trip: "",
              }));
              setRows([
                {
                  vendor: "",
                  mealType: "",
                  mealCategory: "",
                  foodName: "",
                  description: "",
                  prices: [
                    {
                      validFrom: "",
                      validTo: "",
                      price: "",
                      percent: "",
                      itineraryPrice: "",
                    },
                  ],
                  expanded: true,
                },
              ]);
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
            disabled={editingTripFoodId !== null}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition duration-300 disabled:cursor-not-allowed"
            value={formData.state}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                state: value,
                destination: "",
                trip: "",
              }));
              setRows([
                {
                  vendor: "",
                  mealType: "",
                  mealCategory: "",
                  foodName: "",
                  description: "",
                  prices: [
                    {
                      validFrom: "",
                      validTo: "",
                      price: "",
                      percent: "",
                      itineraryPrice: "",
                    },
                  ],
                  expanded: true,
                },
              ]);
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
            disabled={editingTripFoodId !== null}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition duration-300 disabled:cursor-not-allowed"
            value={formData.destination}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                destination: value,
                trip: "",
              }));
              setRows([
                {
                  vendor: "",
                  mealType: "",
                  mealCategory: "",
                  foodName: "",
                  description: "",
                  prices: [
                    {
                      validFrom: "",
                      validTo: "",
                      price: "",
                      percent: "",
                      itineraryPrice: "",
                    },
                  ],
                  expanded: true,
                },
              ]);
            }}
          >
            <option value="">Select Destination</option>
            {destinations.map((destination) => (
              <option key={destination._id} value={destination._id}>
                {destination.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Trip
          </label>
          <select
            disabled={editingTripFoodId !== null}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 focus:ring-2 focus:ring-[#8570EE] focus:outline-none transition duration-300 disabled:cursor-not-allowed"
            value={formData.trip}
            onChange={(e) => {
              const tripId = e.target.value;
              setFormData((prev) => ({ ...prev, trip: tripId }));

              // Reset rows when trip changes
              setRows([
                {
                  vendor: "",
                  mealType: "",
                  mealCategory: "",
                  foodName: "",
                  description: "",
                  prices: [
                    {
                      validFrom: "",
                      validTo: "",
                      price: "",
                      percent: "",
                      itineraryPrice: "",
                    },
                  ],
                  expanded: true,
                },
              ]);
            }}
          >
            <option value="">Select Trip</option>
            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip.tripName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicle Rows */}
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 space-y-6"
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
              className="input-style w-full bg-gray-100"
              value={row.vendor}
              onChange={(e) => handleChange(rowIndex, "vendor", e.target.value)}
            >
              <option value="">Select Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>

            <select
              className="input-style w-full bg-gray-100"
              value={row.mealType}
              onChange={(e) =>
                handleChange(rowIndex, "mealType", e.target.value)
              }
            >
              <option value="">Select Meal Type</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>

            <select
              className="input-style w-full bg-gray-100"
              value={row.mealCategory}
              onChange={(e) =>
                handleChange(rowIndex, "mealCategory", e.target.value)
              }
            >
              <option value="">Select Meal Category</option>
              <option value="budget">Budget</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
              <option value="3star">3 Star</option>
              <option value="4star">4 Star</option>
              <option value="5star">5 Star</option>
            </select>

            <div className="flex justify-end">
              {rowIndex === 0 ? (
                <button onClick={addRow} className="btn-purple" title="Add Row">
                  <Plus size={18} />
                </button>
              ) : (
                <button
                  onClick={() => removeRow(rowIndex)}
                  className="btn-red"
                  title="Remove Row"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <textarea
              rows="3"
              placeholder="Food Name"
              value={row.foodName}
              onChange={(e) =>
                handleChange(rowIndex, "foodName", e.target.value)
              }
              className="input-style w-full bg-gray-100"
            ></textarea>
            <textarea
              rows="3"
              placeholder="Description"
              value={row.description}
              onChange={(e) =>
                handleChange(rowIndex, "description", e.target.value)
              }
              className="input-style w-full bg-gray-100"
            ></textarea>
          </div>

          {/* Price Rows */}
          {row.expanded && (
            <div className="space-y-3">
              {row.prices.map((priceRow, priceIndex) => (
                <div
                  key={priceIndex}
                  className="grid gap-4 items-center 
                   grid-cols-1 
                   sm:grid-cols-2 
                   md:grid-cols-3 
                   lg:grid-cols-[1fr_1fr_1fr_1fr_210px_80px] 
                   xl:grid-cols-[1fr_1fr_1fr_1fr_210px_80px_auto]"
                >
                  <input
                    type="date"
                    value={priceRow.validFrom}
                    onChange={(e) =>
                      handlePriceChange(
                        rowIndex,
                        priceIndex,
                        "validFrom",
                        e.target.value
                      )
                    }
                    className="input-style w-full bg-gray-100"
                  />
                  <input
                    type="date"
                    value={priceRow.validTo}
                    onChange={(e) =>
                      handlePriceChange(
                        rowIndex,
                        priceIndex,
                        "validTo",
                        e.target.value
                      )
                    }
                    className="input-style w-full bg-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Price"
                    value={priceRow.price}
                    onChange={(e) =>
                      handlePriceChange(
                        rowIndex,
                        priceIndex,
                        "price",
                        e.target.value
                      )
                    }
                    className="input-style w-full bg-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="%"
                    value={priceRow.percent}
                    onChange={(e) =>
                      handlePriceChange(
                        rowIndex,
                        priceIndex,
                        "percent",
                        e.target.value
                      )
                    }
                    className="input-style bg-gray-100"
                  />

                  <input
                    type="text"
                    placeholder="₹1234"
                    className="input-style bg-gray-100"
                    readOnly
                    value={`₹${priceRow.itineraryPrice || "0.00"}`}
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
        onClick={handleCreateFood}
        className="w-full mt-2 bg-[#8570EE] hover:bg-[#7462e3] text-white font-semibold py-3 rounded-xl transition"
      >
        {editingTripFoodId ? "Update Food" : "Create Food"}
      </button>
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">
          View Trips With Food
        </h5>
        <p className="block mb-6 text-sm font-light text-gray-400">
          View and Edit Food Assigned to Trips
        </p>

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
                <th className="px-6 py-4">TRIP NAME</th>
                <th className="px-6 py-4">COUNTRY</th>
                <th className="px-6 py-4">STATE</th>
                <th className="px-6 py-4">DESTINATION</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tripsWithFood.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No trips with food found.
                  </td>
                </tr>
              ) : (
                tripsWithFood.map((trip, index) => (
                  <tr key={trip._id} className="border-b">
                    <td className="px-6 py-3 font-semibold">
                      {(page - 1) * 3 + index + 1}
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      {trip.tripName || "—"}
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      {trip.country || "—"}
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      {trip.state || "—"}
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      {trip.destination || "—"}
                    </td>
                    <td className="px-6 py-4  font-semibold">
                      {trip.activeStatus ? (
                        <span
                          className="inline-flex items-center gap-1 text-green-600 cursor-pointer"
                          onClick={() => handleStatusClick(trip)}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Active
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-red-500 cursor-pointer"
                          onClick={() => handleStatusClick(trip)}
                        >
                          <XCircle className="w-5 h-5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center font-semibold">
                      <button
                        onClick={() => handleEdit(trip._id)} // food document ID
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
      {showPopup && selectedTripFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedTripFood.activeStatus ? "Deactivate" : "Activate"} Food
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-bold">
                {selectedTripFood.activeStatus ? "deactivate" : "activate"}
              </span>{" "}
              the food in the :{" "}
              <span className="font-semibold">{selectedTripFood.tripName}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPopup(false);
                  setSelectedTripFood(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  selectedTripFood.activeStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleStatus}
              >
                {selectedTripFood.activeStatus ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFood;
