import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import { Pencil, Plus, X } from "lucide-react";
import { ReceiptText } from "lucide-react";
import { toast } from "react-toastify";

const PURPLE = "#8570EE";

// ---------- react-select styles (same as GroupTour) ----------
const useSelectStyles = () =>
  useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? PURPLE : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        maxHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? PURPLE : "#d1d5db" },
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

// ---------- builders ----------
const emptySegment = () => ({
  country: "",
  state: "",
  destination: "",
  trip: "",
  selectedAddon: "",
  selectedActivities: [],

  // per-segment dependent options
  states: [],
  destinations: [],
  trips: [],
  addonTrips: [],
  activities: [],
});

const emptyDay = () => ({
  expanded: false,             // collapsed by default
  segments: [emptySegment()],  // multiple segments supported
});

const CreateFixedTour = () => {
  const selectStyles = useSelectStyles();

  // Top-level dropdown data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Top-level form
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
    paxPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),
  });

  // Tags
  const [includes, setIncludes] = useState([]);
  const [excludes, setExcludes] = useState([]);

  // Days (with segments)
  const [days, setDays] = useState([]);

  // List view
  const [fixedTours, setFixedTours] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentlyEditingTourId, setCurrentlyEditingTourId] = useState(null);

  // ---------- options helpers ----------
  const toOptions = (arr = [], labelKey = "name") =>
    arr.map((i) => ({ value: i._id, label: i[labelKey] }));

  const countryOptions = countries.map((c) => ({ value: c._id, label: c.name }));
  const stateOptions = states.map((s) => ({ value: s._id, label: s.name }));
  const destinationOptions = destinations.map((d) => ({ value: d._id, label: d.name }));

  // ---------- fetch list ----------
  const fetchFixedTours = async () => {
    try {
      const res = await API.get("/purchaser/fixedTours", { params: { page, limit: 3, search } });
      setFixedTours(res.data.tours || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching fixed tours:", err);
      toast.error("Failed to fetch fixed tours.");
    }
  };
  useEffect(() => { fetchFixedTours(); }, [search, page]);

  // ---------- bootstrap countries ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/purchaser/countries");
        setCountries(res.data || []);
      } catch {
        toast.error("Error fetching countries");
      }
    })();
  }, []);

  // ---------- dependent: states ----------
  useEffect(() => {
    if (!formData.country || currentlyEditingTourId) return;
    setStates([]); setDestinations([]);
    setFormData((p) => ({ ...p, state: "", destination: "" }));
    (async () => {
      try {
        const res = await API.get(`/purchaser/states/${formData.country}`);
        setStates(res.data || []);
      } catch {
        toast.error("Error fetching states");
      }
    })();
  }, [formData.country, currentlyEditingTourId]);

  // ---------- dependent: destinations ----------
  useEffect(() => {
    if (!formData.country || !formData.state || currentlyEditingTourId) return;
    setDestinations([]); setFormData((p) => ({ ...p, destination: "" }));
    (async () => {
      try {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${formData.country}/${formData.state}`
        );
        setDestinations(res.data || []);
      } catch {
        toast.error("Error fetching destinations");
      }
    })();
  }, [formData.state, formData.country, currentlyEditingTourId]);

  // ---------- keep days count in sync ----------
  useEffect(() => {
    const total = parseInt(formData.totalDays, 10);
    if (!formData.totalDays || isNaN(total) || total <= 0) return;
    setDays((prev) => {
      const out = [...prev];
      while (out.length < total) out.push(emptyDay());
      if (out.length > total) out.splice(total);
      return out;
    });
  }, [formData.totalDays]);

  // ---------- tag helpers ----------
  const handleAddItem = (val, setList, list, inputId) => {
    if (val && !list.includes(val)) {
      setList([...list, val]);
      const el = document.getElementById(inputId);
      if (el) el.value = "";
    }
  };
  const handleRemoveItem = (idx, setList, list) => {
    const copy = [...list]; copy.splice(idx, 1); setList(copy);
  };

  // ---------- day ops ----------
  const toggleDayExpand = (i) => {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, expanded: !d.expanded } : d)));
  };
  const handleRemoveDay = (i) => {
    setDays((prev) => {
      const copy = [...prev]; copy.splice(i, 1); return copy;
    });
    setFormData((p) => ({ ...p, totalDays: String(Math.max(1, parseInt(p.totalDays || "1", 10) - 1)) }));
  };

  // ---------- segment ops ----------
  const addSegment = (dayIndex) => {
    setDays((prev) => {
      const copy = [...prev];
      copy[dayIndex] = { ...copy[dayIndex], segments: [...copy[dayIndex].segments, emptySegment()] };
      return copy;
    });
  };
  const removeSegment = (dayIndex, segIndex) => {
    setDays((prev) => {
      const copy = [...prev];
      const segs = [...copy[dayIndex].segments];
      segs.splice(segIndex, 1);
      if (segs.length === 0) segs.push(emptySegment());
      copy[dayIndex] = { ...copy[dayIndex], segments: segs };
      return copy;
    });
  };

  // ---------- update a segment field + dependent fetch ----------
  const updateSegmentField = async (dayIndex, segIndex, field, value) => {
    const currentSeg = days?.[dayIndex]?.segments?.[segIndex] || {};
    const nextCountry = field === "country" ? value : currentSeg.country || "";
    const nextState = field === "state" ? value : currentSeg.state || "";
    const nextDestination = field === "destination" ? value : currentSeg.destination || "";
    const nextTrip = field === "trip" ? value : currentSeg.trip || "";

    // 1) update local state
    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };
      seg[field] = value;

      if (field === "country") {
        seg.state = ""; seg.destination = ""; seg.trip = "";
        seg.selectedAddon = ""; seg.selectedActivities = [];
        seg.states = []; seg.destinations = []; seg.trips = [];
        seg.addonTrips = []; seg.activities = [];
      }
      if (field === "state") {
        seg.destination = ""; seg.trip = "";
        seg.selectedAddon = ""; seg.selectedActivities = [];
        seg.destinations = []; seg.trips = []; seg.addonTrips = []; seg.activities = [];
      }
      if (field === "destination") {
        seg.trip = "";
        seg.selectedAddon = ""; seg.selectedActivities = [];
        seg.trips = []; seg.addonTrips = []; seg.activities = [];
      }
      if (field === "trip") {
        seg.selectedAddon = ""; seg.selectedActivities = [];
        seg.addonTrips = []; seg.activities = [];
      }

      const newSegments = [...d[dayIndex].segments];
      newSegments[segIndex] = seg;
      d[dayIndex] = { ...d[dayIndex], segments: newSegments };
      return d;
    });

    // 2) dependent fetches
    try {
      if (field === "country" && nextCountry) {
        const res = await API.get(`/purchaser/states/${nextCountry}`);
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].states = res.data || [];
          return d;
        });
      }
      if (field === "state" && nextCountry && nextState) {
        const res = await API.get(
          `/purchaser/destinationsByCountryAndState/${nextCountry}/${nextState}`
        );
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].destinations = res.data || [];
          return d;
        });
      }
      if (field === "destination" && nextCountry && nextState && nextDestination) {
        const res = await API.get(
          `/purchaser/tripsByLocation/${nextCountry}/${nextState}/${nextDestination}`
        );
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].trips = res.data || [];
          return d;
        });
      }
      if (field === "trip" && nextTrip) {
        const res = await API.get(`/purchaser/tripDetails/${nextTrip}`);
        setDays((prev) => {
          const d = [...prev];
          d[dayIndex].segments[segIndex].addonTrips = res.data.addonTrips || [];
          d[dayIndex].segments[segIndex].activities = res.data.activities || [];
          return d;
        });
      }
    } catch (err) {
      console.error("Dropdown fetch failed", err);
      toast.error("Dropdown fetch failed");
    }
  };

  const clearSegmentTarget = (dayIndex, segIndex, key) => {
    setDays((prev) => {
      const d = [...prev];
      const seg = { ...d[dayIndex].segments[segIndex] };
      if (key === "trip") {
        seg.trip = "";
        seg.selectedAddon = "";
        seg.selectedActivities = [];
        seg.addonTrips = [];
        seg.activities = [];
      } else if (key === "selectedAddon") {
        seg.selectedAddon = "";
      } else if (key === "selectedActivities") {
        seg.selectedActivities = [];
      }
      d[dayIndex].segments[segIndex] = seg;
      return d;
    });
  };

  // ---------- edit ----------
  const handleEditTour = async (tour) => {
    try {
      setCurrentlyEditingTourId(tour._id);

      // top-level
      setFormData({
        country: tour.country || "",
        state: "",
        destination: "",
        tourName: tour.tourName || "",
        articleNumber: tour.articleNumber || "",
        category: tour.category || "",
        pickupPoint: tour.pickupPoint || "",
        dropOffPoint: tour.dropOffPoint || "",
        totalDays: String(tour.totalDays || 1),
        totalNights: String(tour.totalNights || 0),
        validFrom: tour.validFrom ? tour.validFrom.slice(0, 10) : "",
        validTill: tour.validTill ? tour.validTill.slice(0, 10) : "",
        paxPrices: Object.fromEntries(
          Array.from({ length: 18 }, (_, i) => {
            const n = `${i + 1}`;
            return [i + 1, (tour.paxPrices?.[n] ?? tour.paxPrices?.[i + 1] ?? "").toString()];
          })
        ),
      });
      setIncludes(tour.includes || []);
      setExcludes(tour.excludes || []);

      // top-level dependent lists
      if (tour.country) {
        const resStates = await API.get(`/purchaser/states/${tour.country}`);
        setStates(resStates.data || []);
      }
      setFormData((p) => ({ ...p, state: tour.state || "" }));

      if (tour.country && tour.state) {
        const resDest = await API.get(
          `/purchaser/destinationsByCountryAndState/${tour.country}/${tour.state}`
        );
        setDestinations(resDest.data || []);
      }
      setFormData((p) => ({ ...p, destination: tour.destination || "" }));

      // build days/segments
      const builtDays = await Promise.all(
        (tour.days || []).map(async (day) => {
          const rawSegments = Array.isArray(day.segments) && day.segments.length
            ? day.segments
            : [];

          const segments = await Promise.all(
            rawSegments.map(async (seg) => {
              const segment = {
                country: seg.country || "",
                state: seg.state || "",
                destination: seg.destination || "",
                trip: seg.trip || "",
                selectedAddon: seg.selectedAddon || "",
                selectedActivities: Array.isArray(seg.selectedActivities) ? seg.selectedActivities : [],
                states: [], destinations: [], trips: [], addonTrips: [], activities: [],
              };
              try {
                if (segment.country) {
                  const rs = await API.get(`/purchaser/states/${segment.country}`);
                  segment.states = rs.data || [];
                }
                if (segment.country && segment.state) {
                  const rd = await API.get(
                    `/purchaser/destinationsByCountryAndState/${segment.country}/${segment.state}`
                  );
                  segment.destinations = rd.data || [];
                }
                if (segment.country && segment.state && segment.destination) {
                  const rt = await API.get(
                    `/purchaser/tripsByLocation/${segment.country}/${segment.state}/${segment.destination}`
                  );
                  segment.trips = rt.data || [];
                }
                if (segment.trip) {
                  const rdet = await API.get(`/purchaser/tripDetails/${segment.trip}`);
                  segment.addonTrips = rdet.data.addonTrips || [];
                  segment.activities = rdet.data.activities || [];
                }
              } catch (e) {
                console.error("Segment prefill failed", e);
              }
              return segment;
            })
          );
          return { expanded: false, segments: segments.length ? segments : [emptySegment()] };
        })
      );

      setDays(builtDays);
    } catch (err) {
      console.error("Edit load failed", err);
      toast.error("Failed to prepare edit form.");
    }
  };

  // ---------- submit ----------
  const handleCreateFixedTour = async () => {
    try {
      // basic validations
      const required = {
        country: "Country is required",
        state: "State is required",
        destination: "Destination is required",
        tourName: "Tour Name is required",
        // articleNumber: "Article Number is required",
        category: "Category is required",
        pickupPoint: "Pickup Point is required",
        dropOffPoint: "Drop-off Point is required",
        totalDays: "Total Days is required",
        totalNights: "Total Nights is required",
        validFrom: "Valid From is required",
        validTill: "Valid Till is required",
      };
      for (const [k, msg] of Object.entries(required)) {
        if (!String(formData[k] || "").trim()) { toast.error(msg); return; }
      }

      const from = new Date(formData.validFrom);
      const till = new Date(formData.validTill);
      if (!(from < till)) { toast.error("Valid From must be earlier than Valid Till."); return; }

      if (!includes.length) return toast.error("At least one Include is required.");
      if (!excludes.length) return toast.error("At least one Exclude is required.");

      for (let i = 1; i <= 18; i++) {
        const v = formData.paxPrices[i];
        if (!v || Number(v) <= 0) { toast.error(`PAX price for ${i} must be > 0`); return; }
      }

      if (!days.length) return toast.error("At least one day is required.");
      if (days.length !== Number(formData.totalDays)) {
        return toast.error(`You must provide exactly ${formData.totalDays} day(s) of details.`);
      }
      if (Number(formData.totalNights) !== Number(formData.totalDays) - 1) {
        return toast.error("Total Nights should be exactly one less than Total Days.");
      }

      // validate segments
      for (let i = 0; i < days.length; i++) {
        const segs = days[i].segments;
        if (!Array.isArray(segs) || segs.length === 0) {
          return toast.error(`Day ${i + 1}: add at least one segment`);
        }
        for (let j = 0; j < segs.length; j++) {
          const s = segs[j];
          if (!s.country || !s.state || !s.destination || !s.trip) {
            return toast.error(`Day ${i + 1}, Segment ${j + 1}: Country, State, Destination and Trip are required`);
          }
        }
      }

      const payload = {
        ...formData,
        includes,
        excludes,
        days: days.map((d) => ({
          segments: d.segments.map((s) => ({
            country: s.country || undefined,
            state: s.state || undefined,
            destination: s.destination || undefined,
            trip: s.trip || undefined,
            selectedAddon: s.selectedAddon || undefined,
            selectedActivities: Array.isArray(s.selectedActivities)
              ? s.selectedActivities.filter(Boolean)
              : [],
          })),
        })),
      };

      if (currentlyEditingTourId) {
        await API.put(`/purchaser/updateFixedTour/${currentlyEditingTourId}`, payload);
        toast.success("Fixed tour updated successfully!");
        setCurrentlyEditingTourId(null);
      } else {
        await API.post("/purchaser/createFixedTour", payload);
        toast.success("Fixed tour created successfully!");
      }

      // reset
      setFormData({
        country: "", state: "", destination: "",
        tourName: "", articleNumber: "", category: "",
        pickupPoint: "", dropOffPoint: "",
        totalDays: "", totalNights: "",
        validFrom: "", validTill: "",
        paxPrices: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, ""])),
      });
      setIncludes([]); setExcludes([]); setDays([]); setStates([]); setDestinations([]);
      await fetchFixedTours();
    } catch (err) {
      console.error("Error creating/updating fixed tour:", err);
      toast.error("Failed to save fixed tour.");
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[100rem] mx-auto text-base font-sans bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-2xl">
      {/* Top-level selects (react-select) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
          <Select
            styles={selectStyles}
            options={countryOptions}
            isClearable
            isDisabled={!!currentlyEditingTourId}
            placeholder="Select Country"
            value={countryOptions.find(o => o.value === formData.country) || null}
            onChange={(opt) => setFormData((p) => ({ ...p, country: opt?.value || "" }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
          <Select
            styles={selectStyles}
            options={stateOptions}
            isClearable
            isDisabled={!!currentlyEditingTourId || !formData.country}
            placeholder="Select State"
            value={stateOptions.find(o => o.value === formData.state) || null}
            onChange={(opt) => setFormData((p) => ({ ...p, state: opt?.value || "" }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Destination</label>
          <Select
            styles={selectStyles}
            options={destinationOptions}
            isClearable
            isDisabled={!!currentlyEditingTourId || !formData.state}
            placeholder="Select Destination"
            value={destinationOptions.find(o => o.value === formData.destination) || null}
            onChange={(opt) => setFormData((p) => ({ ...p, destination: opt?.value || "" }))}
          />
        </div>

        {/* Tour meta */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Tour Name</label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            disabled={!!currentlyEditingTourId}
            placeholder="Tour Name"
            value={formData.tourName}
            onChange={(e) => setFormData((p) => ({ ...p, tourName: e.target.value.toUpperCase() }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Article Number</label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Auto-generated after create"
            value={formData.articleNumber}
            readOnly
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
          <Select
            styles={selectStyles}
            isClearable
            isDisabled={!!currentlyEditingTourId}
            placeholder="Select Category"
            options={[
              { value: "Standard", label: "Standard" },
              { value: "Delux", label: "Delux" },
              { value: "Premium", label: "Premium" },
            ]}
            value={formData.category ? { value: formData.category, label: formData.category } : null}
            onChange={(opt) => setFormData((p) => ({ ...p, category: opt?.value || "" }))}
          />
        </div>

        {/* Pickup / Drop */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Pickup Point</label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Enter Pickup Point"
            value={formData.pickupPoint}
            onChange={(e) => setFormData((p) => ({ ...p, pickupPoint: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Drop Off Point</label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Enter Drop Off Point"
            value={formData.dropOffPoint}
            onChange={(e) => setFormData((p) => ({ ...p, dropOffPoint: e.target.value }))}
          />
        </div>

        {/* Days/Nights & validity */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Total Days</label>
          <input
            type="number" min={1}
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            value={formData.totalDays}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value || "1", 10));
              setFormData((p) => ({ ...p, totalDays: String(val) }));
            }}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Total Nights</label>
          <input
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            placeholder="Enter Total Nights"
            value={formData.totalNights}
            onChange={(e) => setFormData((p) => ({ ...p, totalNights: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Valid From</label>
          <input
            type="date"
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            value={formData.validFrom}
            onChange={(e) => setFormData((p) => ({ ...p, validFrom: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Valid Till</label>
          <input
            type="date"
            className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
            value={formData.validTill}
            onChange={(e) => setFormData((p) => ({ ...p, validTill: e.target.value }))}
          />
        </div>
      </div>

      {/* Includes / Excludes */}
      <div className="flex w-full gap-3">
        <div className="w-1/2 flex items-center gap-3">
          <input id="includeInput" className="border border-gray-300 p-3 w-full rounded-xl" placeholder="Add to Includes" />
          <button
            onClick={() =>
              handleAddItem(document.getElementById("includeInput").value, setIncludes, includes, "includeInput")
            }
            className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
          >+</button>
        </div>
        <div className="w-1/2 flex items-center gap-3">
          <input id="excludeInput" className="border border-gray-300 p-3 w-full rounded-xl" placeholder="Add to Excludes" />
          <button
            onClick={() =>
              handleAddItem(document.getElementById("excludeInput").value, setExcludes, excludes, "excludeInput")
            }
            className="bg-[#8570EE] text-white w-10 h-10 rounded-xl shadow-md hover:bg-purple-700 flex-shrink-0"
          >+</button>
        </div>
      </div>

      <div className="space-y-6">
  {/* Includes */}
  <div>
    <h2 className="font-semibold text-gray-700 mb-2 text-lg">Includes</h2>
    <div className="flex flex-wrap gap-4">
      {includes.map((tag, i) => (
        <span
          key={i}
          className="relative group bg-white/30 backdrop-blur-md text-gray-800 
                     px-4 py-2 rounded-2xl flex items-center gap-3 
                     border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                     hover:shadow-[0_6px_18px_rgba(133,112,238,0.3)] 
                     transition-all duration-300 transform hover:-translate-y-1"
        >
          <span className="font-medium tracking-wide">{tag}</span>
          <button
            onClick={() => handleRemoveItem(i, setIncludes, includes)}
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center 
                       rounded-full bg-[#8570EE] text-white font-bold 
                       shadow-md hover:bg-[#6f59da] transition-all duration-300"
          >
            ×
          </button>
        </span>
      ))}

      {includes.length === 0 && (
        <p className="text-gray-400 italic">No includes added yet</p>
      )}
    </div>
  </div>

  {/* Excludes */}
  <div>
    <h2 className="font-semibold text-gray-700 mb-2 text-lg">Excludes</h2>
    <div className="flex flex-wrap gap-4">
      {excludes.map((tag, i) => (
        <span
          key={i}
          className="relative group bg-white/30 backdrop-blur-md text-gray-800 
                     px-4 py-2 rounded-2xl flex items-center gap-3 
                     border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                     hover:shadow-[0_6px_18px_rgba(133,112,238,0.3)] 
                     transition-all duration-300 transform hover:-translate-y-1"
        >
          <span className="font-medium tracking-wide">{tag}</span>
          <button
            onClick={() => handleRemoveItem(i, setExcludes, excludes)}
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center 
                       rounded-full bg-[#8570EE] text-white font-bold 
                       shadow-md hover:bg-[#6f59da] transition-all duration-300"
          >
            ×
          </button>
        </span>
      ))}

      {excludes.length === 0 && (
        <p className="text-gray-400 italic">No excludes added yet</p>
      )}
    </div>
  </div>
</div>


      {/* PAX Pricing */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-700">PAX Pricing</h2>
        {[0, 1].map((row) => (
          <div key={row} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-4">
            {Array.from({ length: 9 }, (_, i) => {
              const pax = i + 1 + row * 9;
              return (
                <div key={pax}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{pax} PAX</label>
                  <input
                    type="number" min="0"
                    placeholder={`Enter price for ${pax} PAX`}
                    value={formData.paxPrices[pax]}
                    onChange={(e) => setFormData((p) => ({
                      ...p, paxPrices: { ...p.paxPrices, [pax]: e.target.value }
                    }))}
                    className="border border-gray-300 p-3 rounded-xl shadow-md w-full"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* DAYS with multiple SEGMENTS */}
      {days.map((day, i) => (
        <div key={i} className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDayExpand(i)}>
              <span className="text-lg font-bold text-gray-500">{day.expanded ? "▾" : "▸"}</span>
              <h3 className="text-xl font-semibold text-gray-800">Day {i + 1}</h3>
            </div>
            <button onClick={() => handleRemoveDay(i)} className="text-gray-300 hover:text-red-400 font-bold text-xl">×</button>
          </div>

          {day.expanded && (
            <div className="space-y-4">
              {day.segments.map((seg, j) => {
                const countryOpts = countryOptions;
                const stateOpts = toOptions(seg.states);
                const destOpts = toOptions(seg.destinations);
                const tripOpts = toOptions(seg.trips, "tripName");
                const addonOpts = toOptions(seg.addonTrips, "tripName");
                const actOpts = toOptions(seg.activities, "tripName");

                return (
                  <div key={j} className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">Segment {j + 1}</span>
                      <div className="flex items-center gap-2">
                        {j === 0 ? (
                          <button onClick={() => addSegment(i)} className="w-8 h-8 rounded-full bg-[#8570EE] text-white flex items-center justify-center"><Plus size={16} /></button>
                        ) : (
                          <button onClick={() => removeSegment(i, j)} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={16} /></button>
                        )}
                      </div>
                    </div>

                    {/* Country / State / Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Select
                        styles={selectStyles}
                        options={countryOpts}
                        isClearable
                        placeholder="Country"
                        value={countryOpts.find(o => o.value === seg.country) || null}
                        onChange={(opt) => updateSegmentField(i, j, "country", opt?.value || "")}
                      />
                      <Select
                        styles={selectStyles}
                        options={stateOpts}
                        isClearable
                        isDisabled={!seg.country}
                        placeholder="State"
                        value={stateOpts.find(o => o.value === seg.state) || null}
                        onChange={(opt) => updateSegmentField(i, j, "state", opt?.value || "")}
                      />
                      <Select
                        styles={selectStyles}
                        options={destOpts}
                        isClearable
                        isDisabled={!seg.state}
                        placeholder="Destination"
                        value={destOpts.find(o => o.value === seg.destination) || null}
                        onChange={(opt) => updateSegmentField(i, j, "destination", opt?.value || "")}
                      />
                    </div>

                    {/* Trip + clear */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <Select
                        styles={selectStyles}
                        options={tripOpts}
                        isClearable
                        isDisabled={!seg.destination}
                        placeholder="Trip"
                        value={tripOpts.find(o => o.value === seg.trip) || null}
                        onChange={(opt) => updateSegmentField(i, j, "trip", opt?.value || "")}
                      />
                      <button onClick={() => clearSegmentTarget(i, j, "trip")} className="px-3 py-2 rounded-lg bg-red-100 text-red-600">Clear</button>
                    </div>

                    {/* Add-on + clear */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <Select
                        styles={selectStyles}
                        options={addonOpts}
                        isClearable
                        isDisabled={!seg.trip}
                        placeholder="Add-on Trip"
                        value={addonOpts.find(o => o.value === seg.selectedAddon) || null}
                        onChange={(opt) => updateSegmentField(i, j, "selectedAddon", opt?.value || "")}
                      />
                      <button onClick={() => clearSegmentTarget(i, j, "selectedAddon")} className="px-3 py-2 rounded-lg bg-red-100 text-red-600">Clear</button>
                    </div>

                    {/* Activities (MULTI) + clear */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <Select
                        styles={selectStyles}
                        options={actOpts}
                        isClearable
                        isMulti
                        isDisabled={!seg.trip}
                        placeholder="Activities"
                        value={actOpts.filter(o => (seg.selectedActivities || []).includes(o.value))}
                        onChange={(opts) =>
                          updateSegmentField(i, j, "selectedActivities", Array.isArray(opts) ? opts.map(o => o.value) : [])
                        }
                      />
                      <button onClick={() => clearSegmentTarget(i, j, "selectedActivities")} className="px-3 py-2 rounded-lg bg-red-100 text-red-600">Clear</button>
                    </div>
                  </div>
                );
              })}
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

      {/* Table */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h5 className="text-3xl font-semibold text-[#321F6A] mb-1">View Fixed Tour</h5>
        <p className="block mb-6 text-sm font-light text-gray-400">Search and Edit Fixed Tour</p>
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                  <tr key={tour._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{(page - 1) * 3 + idx + 1}</td>
                    <td className="px-6 py-4 font-semibold">{tour.tourName}</td>
                    <td className="px-6 py-4 font-semibold">{tour.articleNumber}</td>
                    <td className="px-6 py-4 font-semibold">{tour.category}</td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <button onClick={() => handleEditTour(tour)} className="text-gray-700 hover:text-gray-700">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <button title="Booking Order" className="text-purple-600 hover:text-purple-800">
                        <ReceiptText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-4 text-gray-400">No tours found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6 space-x-2">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Previous</button>
          <span className="px-3 py-1">{page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="px-7 py-1 bg-gray-100 rounded hover:bg-gray-200">Next</button>
        </div>
      </div>
    </div>
  );
};

export default CreateFixedTour;
