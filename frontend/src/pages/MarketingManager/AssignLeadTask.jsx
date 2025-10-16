import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function AssignLeadTask() {
  // --------- Cascading options ---------
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Selections
  const [country, setCountry] = useState(null);
  const [stateOpt, setStateOpt] = useState(null);
  const [destination, setDestination] = useState(null);

  // Tours (Group/Fixed) for the destination
  const [tourOptions, setTourOptions] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null); // value: "group:<id>" | "fixed:<id>"
  const [loadingTours, setLoadingTours] = useState(false);

  // Form basics
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState(null);
  const [details, setDetails] = useState("");

  // Assignments + messages
  const [dmOptions, setDmOptions] = useState([]);
  const [csOptions, setCsOptions] = useState([]);
  const [assignDm, setAssignDm] = useState(null);
  const [assignCs, setAssignCs] = useState(null);
  const [msgDM, setMsgDM] = useState("");
  const [msgCS, setMsgCS] = useState("");

  // Ad Category + dynamic fields
  const [adCatOptions, setAdCatOptions] = useState([]); // [{value,label}]
  const [adCat, setAdCat] = useState(null);
  const [adCatFields, setAdCatFields] = useState([]);   // [{ _id, key, label, type, required, order, config }]
  const [adForm, setAdForm] = useState({});             // key -> value
  const [destOptionsForAd, setDestOptionsForAd] = useState([]); // used by "destinations" field type

  const frequencyOptions = useMemo(
    () => [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ],
    []
  );

  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
      }),
      valueContainer: (b) => ({ ...b, padding: "0 12px" }),
      input: (b) => ({ ...b, margin: 0, padding: 0, color: "#111827" }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      indicatorSeparator: (b) => ({ ...b, backgroundColor: "#e5e7eb" }),
      dropdownIndicator: (b) => ({ ...b, color: "#6b7280", ":hover": { color: "#4b5563" } }),
      menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden" }),
      option: (b, s) => ({
        ...b,
        backgroundColor: s.isFocused
          ? "rgba(133,112,238,0.08)"
          : s.isSelected
          ? "rgba(133,112,238,0.16)"
          : "white",
        color: "#222",
        ":active": { backgroundColor: "rgba(133,112,238,0.16)" },
      }),
    }),
    []
  );

  // ---------- Utils ----------
  const isBlank = (v) => !v || !String(v).trim();
  const pad = (n) => String(n).padStart(2, "0");

  // Campaign Name auto-fills from selected tour
  const campaignName =
    selectedTour?.meta?.title ||
    selectedTour?.label ||
    "";

  // ---------- Loaders ----------
  useEffect(() => {
    (async () => {
      try {
        // Company-scoped lists for MM
        const [cRes, dmRes, csRes, catRes, destRes] = await Promise.all([
          API.get("/marketingManager/lead-assign/countries"),
          API.get("/marketingManager/digital-marketers"),
          API.get("/marketingManager/creative-staff"),
          API.get("/marketingManager/ad-categories-leadside"),
          // API.get("/marketingManager/destinations"),
        ]);
        setCountries((cRes.data || []).map((c) => ({ value: c._id, label: c.name })));
        setDmOptions(dmRes.data || []);
        setCsOptions(csRes.data || []);
        setAdCatOptions(catRes.data || []);
        // setDestOptionsForAd(destRes.data || []); // for "destinations" field type in adForm
      } catch {
        toast.error("Failed to load initial data");
      }
    })();
  }, []);

  const onChangeCountry = async (opt) => {
    setCountry(opt);
    setStateOpt(null);
    setDestination(null);
    setTourOptions([]);
    setSelectedTour(null);
    if (!opt?.value) {
      setStates([]);
      setDestinations([]);
      return;
    }
    try {
      const res = await API.get(`/marketingManager/lead-assign/states/${encodeURIComponent(opt.value)}`);
      setStates((res.data || []).map((s) => ({ value: s._id, label: s.name })));
      setDestinations([]);
    } catch {
      toast.error("Failed to load states");
    }
  };

  const onChangeState = async (opt) => {
    setStateOpt(opt);
    setDestination(null);
    setTourOptions([]);
    setSelectedTour(null);
    if (!country?.value || !opt?.value) {
      setDestinations([]);
      return;
    }
    try {
      const url = `/marketingManager/lead-assign/destinations/${encodeURIComponent(
        country.value
      )}/${encodeURIComponent(opt.value)}`;
      const res = await API.get(url);
      setDestinations((res.data || []).map((d) => ({ value: d._id, label: d.name })));
    } catch {
      toast.error("Failed to load destinations");
    }
  };

  const loadTours = async (destId, q = "") => {
    setLoadingTours(true);
    try {
      const params = new URLSearchParams();
      params.set("destinationId", destId);
      if (q) params.set("q", q);
      const res = await API.get(`/marketingManager/lead-assign/tours?${params.toString()}`);
      setTourOptions(res.data || []);
    } catch {
      toast.error("Failed to load tours");
    } finally {
      setLoadingTours(false);
    }
  };

  const onChangeDestination = async (opt) => {
    setDestination(opt);
    setSelectedTour(null);
    setTourOptions([]);
    if (opt?.value) await loadTours(opt.value);
  };

  // ---------- Ad Category fields ----------
  const fetchAdCategoryFields = async (categoryId) => {
    if (!categoryId) return;
    try {
      const res = await API.get(`/marketingManager/ad-categories-leadside/${categoryId}`);
      const { fields = [] } = res.data || {};
      const sorted = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0));
      setAdCatFields(sorted);

      // default values
      const init = {};
      sorted.forEach((f) => {
        if (f?.config?.defaultValue !== undefined) {
          init[f.key] = f.config.defaultValue;
        }
      });
      setAdForm((prev) => ({ ...init, ...prev }));
    } catch {
      toast.error("Failed to load ad fields");
    }
  };

  const onChangeAdCat = async (opt) => {
    setAdCat(opt);
    setAdCatFields([]);
    setAdForm({});
    if (opt?.value) await fetchAdCategoryFields(opt.value);
  };

  const setAdField = (key, value) => setAdForm((prev) => ({ ...prev, [key]: value }));

  const validateAdFormForUI = () => {
    const errors = [];
    if (!adCat?.value) errors.push("Select an Ad Category.");
    adCatFields.forEach((f) => {
      const val = adForm[f.key];
      const cfg = f.config || {};
      const missing =
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "") ||
        (Array.isArray(val) && val.length === 0);

      if (f.required && missing) {
        errors.push(`"${f.label}" is required`);
        return;
      }
      if (missing) return;

      if (f.type === "number") {
        const n = Number(val);
        if (!Number.isFinite(n)) errors.push(`"${f.label}" must be a number`);
        if (cfg.min !== undefined && n < Number(cfg.min))
          errors.push(`"${f.label}" must be ≥ ${cfg.min}`);
        if (cfg.max !== undefined && n > Number(cfg.max))
          errors.push(`"${f.label}" must be ≤ ${cfg.max}`);
      }
      if (f.type === "url") {
        try { new URL(String(val)); } catch { errors.push(`"${f.label}" must be a valid URL`); }
      }
    });
    return errors;
  };

  // ---------- Submit ----------
  const onSubmit = async (e) => {
    e.preventDefault();

    // Required basics
    if (!country?.value) return toast.error("Select country");
    if (!stateOpt?.value) return toast.error("Select state");
    if (!destination?.value) return toast.error("Select destination");
    if (!selectedTour?.value) return toast.error("Select a tour");
    if (!startDate) return toast.error("Select start date");
    if (!endDate) return toast.error("Select end date");
    if (new Date(endDate) < new Date(startDate)) return toast.error("End date cannot be earlier than start date");
    if (!frequency?.value) return toast.error("Select frequency");
    if (!assignDm?.value) return toast.error("Assign a digital marketer");
    if (isBlank(msgDM)) return toast.error("Message for digital marketer is required");
    if (assignCs?.value && isBlank(msgCS)) return toast.error("Message for creative staff is required");

    // Ad category validations
    const adErrors = validateAdFormForUI();
    if (adErrors.length) return toast.error(adErrors[0]);

    try {
      const payload = {
        countryId: country.value,
        stateId: stateOpt.value,
        destinationId: destination.value,
        selectedTour: selectedTour.value,              // "group:..." | "fixed:..."
        tourName: selectedTour?.meta?.title || selectedTour?.label || "", // human-friendly
        startDate,
        endDate,
        quantity: Number(quantity) || 1,
        frequency: frequency.value,
        details: details?.trim() || "",

        // auto campaign from tour name
        campaignName,

        // Assignments
        digitalMarketerId: assignDm.value,
        messageForDigitalMarketer: msgDM.trim(),
        creativeStaffId: assignCs?.value || null,
        messageForCreativeStaff: isBlank(msgCS) ? "" : msgCS.trim(),

        // Ad category payload
        adCategoryId: adCat?.value,
        adData: adForm,
      };

      await API.post("/marketingManager/lead-assignments", payload);
      toast.success("Lead task assigned");
      // reset form (keep lists)
      setCountry(null); setStates([]); setStateOpt(null);
      setDestinations([]); setDestination(null);
      setTourOptions([]); setSelectedTour(null);
      setStartDate(""); setEndDate(""); setQuantity(1); setFrequency(null);
      setDetails("");
      setAssignDm(null); setAssignCs(null); setMsgDM(""); setMsgCS("");
      setAdCat(null); setAdCatFields([]); setAdForm({});
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to assign";
      toast.error(msg);
    }
  };

  // ---------- Render dynamic Ad fields ----------
  const renderAdField = (f) => {
    const Label = (
      <span className="block text-sm font-medium text-[#222] mb-1">
        {f.label} {f.required && <span className="text-red-500">*</span>}
      </span>
    );

    switch (f.type) {
      case "text":
        return (
          <label key={f._id} className="block">
            {Label}
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              placeholder={f.config?.placeholder || ""}
              value={adForm[f.key] ?? ""}
              onChange={(e) => setAdField(f.key, e.target.value)}
            />
            {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
          </label>
        );

      case "textarea":
        return (
          <label key={f._id} className="block">
            {Label}
            <textarea
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              placeholder={f.config?.placeholder || ""}
              value={adForm[f.key] ?? ""}
              onChange={(e) => setAdField(f.key, e.target.value)}
            />
            {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
          </label>
        );

      case "number":
        return (
          <label key={f._id} className="block">
            {Label}
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              placeholder={f.config?.placeholder || ""}
              min={f.config?.min !== undefined ? Number(f.config.min) : undefined}
              max={f.config?.max !== undefined ? Number(f.config.max) : undefined}
              value={adForm[f.key] ?? ""}
              onChange={(e) => setAdField(f.key, e.target.value)}
            />
            {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
          </label>
        );

      case "date":
        return (
          <label key={f._id} className="block">
            {Label}
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={adForm[f.key] ?? ""}
              onChange={(e) => setAdField(f.key, e.target.value)}
            />
            {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
          </label>
        );

      case "url":
        return (
          <label key={f._id} className="block">
            {Label}
            <input
              type="url"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              placeholder={f.config?.placeholder || "https://..."}
              value={adForm[f.key] ?? ""}
              onChange={(e) => setAdField(f.key, e.target.value)}
            />
            {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
          </label>
        );

      case "select": {
        const options = (f.config?.options || []).map((o) => ({ value: o.value, label: o.label }));
        const val = options.find((o) => o.value === adForm[f.key]) || null;
        return (
          <label key={f._id} className="block">
            {Label}
            <Select
              options={options}
              value={val}
              onChange={(opt) => setAdField(f.key, opt?.value ?? "")}
              isClearable
              placeholder={f.config?.placeholder || "Select..."}
              styles={selectStyles}
            />
            {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
          </label>
        );
      }

      case "multiselect": {
        const options = (f.config?.options || []).map((o) => ({ value: o.value, label: o.label }));
        const valArr = Array.isArray(adForm[f.key]) ? adForm[f.key] : [];
        const selected = options.filter((o) => valArr.includes(o.value));
        return (
          <label key={f._id} className="block">
            {Label}
            <Select
              options={options}
              value={selected}
              onChange={(arr) => setAdField(f.key, (arr || []).map((o) => o.value))}
              isClearable
              isMulti
              placeholder={f.config?.placeholder || "Select..."}
              styles={selectStyles}
            />
            {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
          </label>
        );
      }

      case "destinations": {
        // company-scoped destinations fetched upfront for adForm
        if (f.config?.multiple) {
          const chosen = destOptionsForAd.filter(
            (o) => Array.isArray(adForm[f.key]) && adForm[f.key].includes(o.value)
          );
          return (
            <label key={f._id} className="block">
              {Label}
              <Select
                options={destOptionsForAd}
                value={chosen}
                onChange={(arr) => setAdField(f.key, (arr || []).map((o) => o.value))}
                isClearable
                isMulti
                placeholder={f.config?.placeholder || "Select destination(s)"}
                styles={selectStyles}
              />
              {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
            </label>
          );
        }
        const chosen = destOptionsForAd.find((o) => o.value === adForm[f.key]) || null;
        return (
          <label key={f._id} className="block">
            {Label}
            <Select
              options={destOptionsForAd}
              value={chosen}
              onChange={(opt) => setAdField(f.key, opt?.value ?? "")}
              isClearable
              placeholder={f.config?.placeholder || "Select destination"}
              styles={selectStyles}
            />
            {f.config?.helpText && <p className="text-xs text-gray-500 mt-1">{f.config.helpText}</p>}
          </label>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[#222]">Assign Lead Task</h2>

      <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
        {/* Row 0: Country / State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Country" required>
            <Select
              options={countries}
              value={country}
              onChange={onChangeCountry}
              placeholder="Select country"
              styles={selectStyles}
            />
          </Field>

          <Field label="State" required>
            <Select
              options={states}
              isDisabled={!country}
              value={stateOpt}
              onChange={onChangeState}
              placeholder={!country ? "Select country first" : "Select state"}
              styles={selectStyles}
            />
          </Field>
        </div>

        {/* Row 1: Destination / Tour */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Destination" required>
            <Select
              options={destinations}
              isDisabled={!stateOpt}
              value={destination}
              onChange={onChangeDestination}
              placeholder={!stateOpt ? "Select state first" : "Select destination"}
              styles={selectStyles}
            />
          </Field>

          <Field label="Tour (Group or Fixed)" required>
            <Select
              options={tourOptions}
              isLoading={loadingTours}
              isDisabled={!destination}
              value={selectedTour}
              onChange={(opt) => setSelectedTour(opt || null)}
              onInputChange={(val, meta) => {
                if (meta.action === "input-change" && destination?.value) loadTours(destination.value, val);
              }}
              placeholder={!destination ? "Select destination first" : "Search/select a tour"}
              // Show only name (title) in dropdown
              getOptionLabel={(o) => o?.meta?.title || o?.label || ""}
              getOptionValue={(o) => o?.value ?? ""}
              styles={selectStyles}
            />
          </Field>
        </div>

        {/* Row 2: Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Start Date" required>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>

          <Field label="End Date" required>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        </div>

        {/* Row 3: Quantity / Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Quantity" required>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              placeholder="e.g., 10"
            />
          </Field>
          <Field label="Frequency" required>
            <Select
              options={frequencyOptions}
              value={frequency}
              onChange={setFrequency}
              placeholder="Select frequency"
              styles={selectStyles}
            />
          </Field>
        </div>

        {/* Row 4: Details */}
        {/* <div>
          <Field label="Details">
            <textarea
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add any notes, links, or context…"
            />
          </Field>
        </div> */}

       {/* Row 5: Ad Category + Campaign Name (same row) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Field label="Ad Category" required>
    <Select
      options={adCatOptions}
      value={adCat}
      onChange={onChangeAdCat}
      placeholder="Select category (e.g., Meta Ads)"
      styles={selectStyles}
    />
  </Field>

  <Field label="Campaign Name (auto)">
    <input
      type="text"
      readOnly
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
      value={campaignName}
      placeholder="Auto from tour"
      title="Auto-filled from selected tour"
    />
  </Field>
</div>


        {adCat && (
  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
    {adCatFields.length === 0 ? (
      <p className="text-sm text-gray-500">No fields in this category.</p>
    ) : (
      adCatFields.map((f) => (
        <div key={f._id} className="col-span-1">{renderAdField(f)}</div>
      ))
    )}
  </div>
)}


        {/* Row 7: Assignments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Assign Digital Marketer" required>
            <Select
              options={dmOptions}
              value={assignDm}
              onChange={setAssignDm}
              placeholder="Select digital marketer"
              styles={selectStyles}
            />
          </Field>

          <Field label="Assign Creative Staff">
            <Select
              options={csOptions}
              value={assignCs}
              onChange={setAssignCs}
              isClearable
              placeholder="Select creative staff"
              styles={selectStyles}
            />
          </Field>
        </div>

        {/* Row 8: Messages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Message for Digital Marketer" required>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
              value={msgDM}
              onChange={(e) => setMsgDM(e.target.value)}
              placeholder="Instructions for the digital marketer"
            />
          </Field>

          <Field label="Message for Creative Staff">
            <textarea
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
              value={msgCS}
              onChange={(e) => setMsgCS(e.target.value)}
              placeholder="Instructions for the creative staff"
            />
          </Field>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-center">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
          >
            Assign Task
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#222] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
