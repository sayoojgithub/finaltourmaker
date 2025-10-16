
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

/**
 * <CreateClient prefill={clientRow} onCancel={() => setActiveTab(0)} />
 */
export default function CreateClient({ prefill = null, onCancel }) {
    console.log(prefill,"prefill data")
  // ---------- react-select styles (fixed height, right-aligned chips look) ----------
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
      dropdownIndicator: (b) => ({ ...b, color: "#6b7280", ":hover": { color: "#4b5563" } }),
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

  // ---------- options ----------
  const [destinations, setDestinations] = useState([]);
  const [loadingDest, setLoadingDest] = useState(false);

  const groupTypeOptions = [
    { value: "single", label: "Single" },
    { value: "couple", label: "Couple" },
    { value: "family", label: "Family" },
    { value: "friends", label: "Friends" },
  ];
  const behaviourOptions = [
    { value: "polite", label: "Polite" },
    { value: "normal", label: "Normal" },
    { value: "hard", label: "Hard" },
    { value: "educated", label: "Educated" },
  ];
  const clientTypeOptions = [
    { value: "Urgent Contact", label: "Urgent Contact" },
    { value: "Non Urgent Contact", label: "Non Urgent Contact" },
  ];
  const contactOptions = [
    { value: "phone", label: "Phone" },
    { value: "whatsapp", label: "WhatsApp" },
  ];

  const preUrgent =
    (prefill?.clientType?.value || prefill?.clientType?.label || "")
      .toLowerCase() === "urgent contact";

  // ---------- form ----------
  const [form, setForm] = useState({
    name: prefill?.name || "",
    mobileNumber: prefill?.mobileNumber || "",
    whatsappNumber: "",
    additionalNumber: "",
    email: "",
    primaryDestinationName: prefill?.primaryDestinationName
      ? {
          _id: prefill.primaryDestinationName._id,
          value: prefill.primaryDestinationName.value,
          label: prefill.primaryDestinationName.label || prefill.primaryDestinationName.value,
        }
      : null,
    addonDestinations: [],           // chips list (array of options)
    addonDestinationInput: null,     // single select to add via "+"

    groupType: null,
    numberOfPersons: "",
    startDate: "",
    endDate: "",
    numberOfDays: "",

    pincode: "",
    district: "",
    state: "",

    clientContactOption: contactOptions[0],
    clientType: preUrgent ? { value: "Urgent Contact", label: "Urgent Contact" } : null,
    clientCurrentLocation: null,
    connectedThrough: prefill?.connectedThrough || null,
    behavior: null,

    gstNumber: "",
    additionalRequirementsInput: "",
    additionalRequirements: [],

    clientByEntryId: prefill?._id || null,
  });

  const [submitting, setSubmitting] = useState(false);

  // ---------- load destinations ----------
  const loadDestinations = async () => {
    try {
      setLoadingDest(true);
      const res = await API.get("/frontoffice/destinations");
      const opts = (res.data || []).map((d) => ({
        _id: d._id,
        value: d.value,
        label: d.label,
      }));
      setDestinations(opts);
      if (form.primaryDestinationName?._id) {
        const match = opts.find((o) => o._id === form.primaryDestinationName._id);
        if (match) setForm((p) => ({ ...p, primaryDestinationName: match }));
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
    } finally {
      setLoadingDest(false);
    }
  };
  useEffect(() => {
    loadDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- inclusive days ----------
  const computeDays = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s) || Number.isNaN(e)) return "";
    const sd = new Date(s); sd.setHours(0,0,0,0);
    const ed = new Date(e); ed.setHours(0,0,0,0);
    const diff = (ed - sd) / (1000 * 60 * 60 * 24);
    return diff >= 0 ? String(diff + 1) : "";
  };
  useEffect(() => {
    setForm((p) => ({ ...p, numberOfDays: computeDays(p.startDate, p.endDate) }));
  }, [form.startDate, form.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- pincode autofill ----------
  const fetchPincodeDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (!Array.isArray(data) || !data[0] || data[0].Status !== "Success") {
        toast.error("Invalid Pincode , Please check the pincode.");
        return { error: "Invalid Pincode", details: null };
      }
      const po = data[0].PostOffice?.[0];
      if (!po) throw new Error("No Post Office found for this pincode");
      return { country: po.Country, state: po.State, district: po.District };
    } catch (error) {
      toast.error(error.message);
      return { error: error.message, details: null };
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, pincode: value, district: "", state: "" }));
    if (value.length > 6) {
      toast.error("Pincode should be exactly 6 digits.");
      return;
    }
    if (value.length === 6) {
      const details = await fetchPincodeDetails(value);
      if (details && !details.error) {
        setForm((prev) => ({
          ...prev,
          district: details.district || "",
          state: details.state || "",
        }));
      }
    }
  };

  // ---------- Additional Requirements ----------
  const addRequirement = () => {
    const text = (form.additionalRequirementsInput || "").trim();
    if (!text) return;
    setForm((p) => ({
      ...p,
      additionalRequirements: [...p.additionalRequirements, text],
      additionalRequirementsInput: "",
    }));
  };
  const removeRequirement = (idx) => {
    setForm((p) => ({
      ...p,
      additionalRequirements: p.additionalRequirements.filter((_, i) => i !== idx),
    }));
  };

  // ---------- Add-on Destinations (add + chips like Additional Requirements) ----------
  const addAddonDestination = () => {
    const sel = form.addonDestinationInput;
    if (!sel) return;
    // prevent duplicates by _id or value
    const exists = (form.addonDestinations || []).some(
      (d) => d._id === sel._id || d.value === sel.value
    );
    if (exists) {
      toast.info("Destination already added");
      return;
    }
    setForm((p) => ({
      ...p,
      addonDestinations: [...(p.addonDestinations || []), sel],
      addonDestinationInput: null,
    }));
  };
  const removeAddonDestination = (idx) => {
    setForm((p) => ({
      ...p,
      addonDestinations: (p.addonDestinations || []).filter((_, i) => i !== idx),
    }));
  };

  // ---------- validation ----------
  const validate = () => {
    if (!form.name || !form.name.trim()) return toast.error("Name is required"), false;
    if (!/^\d{10,15}$/.test(String(form.mobileNumber || "").trim()))
      return toast.error("Mobile number must be 10–15 digits"), false;
    if (!form.primaryDestinationName) return toast.error("Primary destination is required"), false;
    if (!form.groupType) return toast.error("Group type is required"), false;
    if (!form.numberOfPersons || Number(form.numberOfPersons) <= 0)
      return toast.error("Number of persons is required"), false;
    if (!form.startDate) return toast.error("Start date is required"), false;
    if (!form.endDate) return toast.error("End date is required"), false;
    if (!form.numberOfDays) return toast.error("Number of days is required"), false;
    if (!form.pincode) return toast.error("Pincode is required"), false;
    if (!form.state) return toast.error("State is required"), false;
    if (!form.district) return toast.error("District is required"), false;
    if (!form.clientContactOption) return toast.error("Client contact option is required"), false;
    if (!preUrgent && !form.clientType) return toast.error("Client type is required"), false;
    if (!form.clientCurrentLocation)
      return toast.error("Client current location is required"), false;
    if (!form.connectedThrough) return toast.error("Connected through is required"), false;
    if (!form.behavior) return toast.error("Client behaviour is required"), false;
    return true;
  };

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        name: form.name?.trim(),
        mobileNumber: form.mobileNumber,
        email: form.email?.trim() || null,
        whatsappNumber: form.whatsappNumber?.trim() || null,
        additionalNumber: form.additionalNumber?.trim() || null,

        primaryDestinationName: form.primaryDestinationName
          ? {
              _id: form.primaryDestinationName._id,
              value: form.primaryDestinationName.value,
              label: form.primaryDestinationName.label,
            }
          : null,

        // keep structured options for backend
        addonDestinations: (form.addonDestinations || []).map((d) => ({
          _id: d._id,
          value: d.value,
          label: d.label,
        })),

        groupType: form.groupType,
        numberOfPersons: Number(form.numberOfPersons),

        startDate: form.startDate,
        endDate: form.endDate,
        numberOfDays: Number(form.numberOfDays),

        pincode: form.pincode,
        district: form.district,
        state: form.state,

        clientContactOption: form.clientContactOption,
        clientType: preUrgent ? { value: "Urgent Contact", label: "Urgent Contact" } : form.clientType,
        clientCurrentLocation: form.clientCurrentLocation,
        connectedThrough: form.connectedThrough,
        behavior: form.behavior,

        gstNumber: form.gstNumber?.trim() || null,

        additionalRequirments:
          form.additionalRequirements.length ? form.additionalRequirements.join(" | ") : null,
        additionalRequirements: form.additionalRequirements,

        clientByEntryId: form.clientByEntryId || null,
      };

      await API.post("/frontoffice/create-client", payload);
      toast.success("Client created");
      if (onCancel) onCancel();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
        {/* ==== 4 ROWS • 5 FIELDS EACH (20 fields) ==== */}
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Field label="Name" required>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Client name"
              disabled={Boolean(prefill?.name)}
            />
          </Field>

          <Field label="Mobile Number" required>
            <input
              type="tel"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.mobileNumber}
              disabled
            />
          </Field>

          <Field label="WhatsApp Number">
            <input
              type="tel"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.whatsappNumber}
              onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
              placeholder="e.g., 9876543210"
            />
          </Field>

          <Field label="Additional Number">
            <input
              type="tel"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.additionalNumber}
              onChange={(e) => setForm((p) => ({ ...p, additionalNumber: e.target.value }))}
              placeholder="optional"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="name@example.com"
            />
          </Field>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Field label="Primary Destination" required>
            <Select
              isLoading={loadingDest}
              options={destinations}
              value={form.primaryDestinationName}
              onChange={(v) => setForm((p) => ({ ...p, primaryDestinationName: v }))}
              placeholder={loadingDest ? "Loading destinations..." : "Select destination"}
              styles={selectStyles}
              classNamePrefix="create-primary-destination"
              getOptionValue={(o) => String(o._id || o.value)}
            />
          </Field>

          <Field label="Group Type" required>
            <Select
              options={groupTypeOptions}
              value={form.groupType}
              onChange={(v) => setForm((p) => ({ ...p, groupType: v }))}
              placeholder="Select group type"
              styles={selectStyles}
              classNamePrefix="create-group-type"
            />
          </Field>

          <Field label="Number of Persons" required>
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.numberOfPersons}
              onChange={(e) => setForm((p) => ({ ...p, numberOfPersons: e.target.value }))}
              placeholder="e.g., 2"
            />
          </Field>

          <Field label="Start Date" required>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            />
          </Field>

          <Field label="End Date" required>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            />
          </Field>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Field label="Number of Days" required>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.numberOfDays}
              readOnly
            />
          </Field>

          <Field label="Client Contact Option" required>
            <Select
              options={contactOptions}
              value={form.clientContactOption}
              onChange={(v) => setForm((p) => ({ ...p, clientContactOption: v }))}
              placeholder="Select"
              styles={selectStyles}
              classNamePrefix="create-contact-option"
            />
          </Field>

          <Field label="Client Type" required>
            {preUrgent ? (
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-50"
                value="Urgent Contact"
                readOnly
              />
            ) : (
              <Select
                options={clientTypeOptions}
                value={form.clientType}
                onChange={(v) => setForm((p) => ({ ...p, clientType: v }))}
                placeholder="Select"
                styles={selectStyles}
                classNamePrefix="create-client-type"
                isClearable
              />
            )}
          </Field>

          <Field label="Pincode" required>
            <input
              type="tel"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.pincode}
              onChange={handlePincodeChange}
              placeholder="6 digits"
              maxLength={6}
            />
          </Field>

          <Field label="District" required>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.district}
              onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
              placeholder="Auto from pincode"
            />
          </Field>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Field label="State" required>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              placeholder="Auto from pincode"
            />
          </Field>

          <Field label="Client Current Location" required>
            <Select
              options={[
                { value: "insider", label: "Insider" },
                { value: "outsider", label: "Outsider" },
              ]}
              value={form.clientCurrentLocation}
              onChange={(v) => setForm((p) => ({ ...p, clientCurrentLocation: v }))}
              placeholder="Select"
              styles={selectStyles}
              classNamePrefix="create-current-location"
            />
          </Field>

          <Field label="Client Behaviour" required>
            <Select
              options={behaviourOptions}
              value={form.behavior}
              onChange={(v) => setForm((p) => ({ ...p, behavior: v }))}
              placeholder="Select"
              styles={selectStyles}
              classNamePrefix="create-behaviour"
            />
          </Field>

          <Field label="Connected Through (Readonly)" required>
            <input
              type="text"
              value={form.connectedThrough?.label || form.connectedThrough?.value || ""}
              readOnly
              className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-gray-50"
            />
          </Field>

          <Field label="GST Number">
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={form.gstNumber}
              onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))}
              placeholder="optional"
            />
          </Field>
        </div>

        {/* ===== Add-on Destinations (like add+chips) ===== */}
        {/* <div className="grid grid-cols-1 gap-2">
          <label className="block">
            <span className="block text-sm font-medium text-[#222] mb-1">
              Add-on Destinations
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  isLoading={loadingDest}
                  options={destinations}
                  value={form.addonDestinationInput}
                  onChange={(v) => setForm((p) => ({ ...p, addonDestinationInput: v }))}
                  placeholder={loadingDest ? "Loading destinations..." : "Pick a destination"}
                  styles={selectStyles}
                  classNamePrefix="addon-destinations-input"
                  getOptionValue={(o) => String(o._id || o.value)}
                  isClearable
                />
              </div>
              <button
                type="button"
                onClick={addAddonDestination}
                className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
                aria-label="Add add-on destination"
              >
                +
              </button>
            </div>
          </label>

          {form.addonDestinations.length > 0 && (
            <div className="w-full overflow-x-auto whitespace-nowrap">
              <div className="inline-flex gap-2 py-1">
                {form.addonDestinations.map((d, idx) => (
                  <span
                    key={`${d._id || d.value}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
                    style={{ backgroundColor: "rgba(133,112,238,0.16)" }}
                    title={d.label || d.value}
                  >
                    {d.label || d.value}
                    <button
                      type="button"
                      aria-label="Remove destination"
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => removeAddonDestination(idx)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div> */}

        {/* ===== Additional Requirements (full width, add+chips) ===== */}
        {/* <div className="grid grid-cols-1 gap-2">
          <label className="block">
            <span className="block text-sm font-medium text-[#222] mb-1">
              Additional Requirements
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                placeholder="Type a requirement"
                value={form.additionalRequirementsInput}
                onChange={(e) =>
                  setForm((p) => ({ ...p, additionalRequirementsInput: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
              />
              <button
                type="button"
                onClick={addRequirement}
                className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
                aria-label="Add requirement"
              >
                +
              </button>
            </div>
          </label>

          {form.additionalRequirements.length > 0 && (
            <div className="w-full overflow-x-auto whitespace-nowrap">
              <div className="inline-flex gap-2 py-1">
                {form.additionalRequirements.map((item, idx) => (
                  <span
                    key={`${item}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
                    style={{ backgroundColor: "rgba(133,112,238,0.16)" }}
                  >
                    {item}
                    <button
                      type="button"
                      aria-label="Remove requirement"
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => removeRequirement(idx)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div> */}

        {/* Actions */}
        {/* <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Client"}
          </button>
        </div> */}
        {/* ===== Add-on Destinations (like add+chips, glassy) ===== */}
<div className="grid grid-cols-1 gap-2">
  <label className="block">
    <span className="block text-sm font-medium text-[#222] mb-1">
      Add-on Destinations
    </span>
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select
          isLoading={loadingDest}
          options={destinations}
          value={form.addonDestinationInput}
          onChange={(v) => setForm((p) => ({ ...p, addonDestinationInput: v }))}
          placeholder={loadingDest ? "Loading destinations..." : "Pick a destination"}
          styles={selectStyles}
          classNamePrefix="addon-destinations-input"
          getOptionValue={(o) => String(o._id || o.value)}
          isClearable
        />
      </div>
      <button
        type="button"
        onClick={addAddonDestination}
        className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
        aria-label="Add add-on destination"
      >
        +
      </button>
    </div>
  </label>

  {form.addonDestinations.length > 0 && (
    <div className="w-full overflow-x-auto whitespace-nowrap">
      <div className="inline-flex gap-2 py-1">
        {form.addonDestinations.map((d, idx) => (
          <span
            key={`${d._id || d.value}-${idx}`}
            title={d.label || d.value}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
                       bg-white/30 backdrop-blur-md border border-white/40 shadow-sm
                       hover:bg-white/40 transition"
          >
            {d.label || d.value}
            <button
              type="button"
              aria-label="Remove destination"
              onClick={() => removeAddonDestination(idx)}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full
                         bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )}
</div>

{/* ===== Additional Requirements (full width, add+chips, glassy) ===== */}
<div className="grid grid-cols-1 gap-2">
  <label className="block">
    <span className="block text-sm font-medium text-[#222] mb-1">
      Additional Requirements
    </span>
    <div className="flex items-center gap-2">
      <input
        type="text"
        className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
        placeholder="Type a requirement"
        value={form.additionalRequirementsInput}
        onChange={(e) =>
          setForm((p) => ({ ...p, additionalRequirementsInput: e.target.value }))
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addRequirement();
          }
        }}
      />
      <button
        type="button"
        onClick={addRequirement}
        className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
        aria-label="Add requirement"
      >
        +
      </button>
    </div>
  </label>

  {form.additionalRequirements.length > 0 && (
    <div className="w-full overflow-x-auto whitespace-nowrap">
      <div className="inline-flex gap-2 py-1">
        {form.additionalRequirements.map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
                       bg-white/30 backdrop-blur-md border border-white/40 shadow-sm
                       hover:bg-white/40 transition"
          >
            {item}
            <button
              type="button"
              aria-label="Remove requirement"
              onClick={() => removeRequirement(idx)}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full
                         bg-[#8570EE]/20 hover:bg-[#8570EE]/30 text-[#1f2937] leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )}
</div>

{/* ===== Actions (cross above Create) ===== */}
<div className="pt-2 flex flex-col items-center gap-2">
  <button
    type="button"
    onClick={onCancel}
    aria-label="Close"
    className="inline-flex items-center justify-center w-8 h-8 rounded-full
               bg-white/70 backdrop-blur-md border border-gray-200 shadow
               text-gray-700 hover:bg-white transition"
  >
    ×
  </button>

  <button
    type="submit"
    disabled={submitting}
    className="inline-flex items-center justify-center rounded-full bg-[#8570EE]
               text-white px-6 py-3 font-semibold hover:opacity-90
               focus:outline-none focus:ring-2 focus:ring-offset-2
               focus:ring-[#8570EE] disabled:opacity-60 w-full"
  >
    {submitting ? "Creating..." : "Create Client"}
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
