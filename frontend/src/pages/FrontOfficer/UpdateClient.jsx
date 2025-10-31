// src/pages/frontoffice/UpdateClient.jsx
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function UpdateClient({ clientId, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [loadingDest, setLoadingDest] = useState(false);

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

  const contactOptions = [
    { value: "phone", label: "Phone" },
    { value: "whatsapp", label: "WhatsApp" },
  ];
  const clientTypeOptions = [
    { value: "Urgent Contact", label: "Urgent Contact" },
    { value: "Non Urgent Contact", label: "Non Urgent Contact" },
  ];
  const groupTypeOptions = [
    { value: "single", label: "Single" },
    { value: "couple", label: "Couple" },
    { value: "family", label: "Family" },
    { value: "friends", label: "Friends" },
  ];
 const tourTypeOptions = [
  { value: "grouptour", label: "Group Tour" },
  { value: "fixedtour", label: "Fixed Tour" },
  { value: "customtour", label: "Custom Tour" },
];
  const [form, setForm] = useState(null);
  const isUrgent =
  (form?.clientType?.value || form?.clientType?.label || "")
    .toLowerCase() === "urgent contact";

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

  const loadDestinations = async () => {
    try {
      setLoadingDest(true);
      const res = await API.get("/frontoffice/destinations");
      const opts = (res.data || []).map((d) => ({
        _id: d._id, value: d.value, label: d.label,
      }));
      setDestinations(opts);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load destinations");
    } finally {
      setLoadingDest(false);
    }
  };

  // ---- Pincode autofill (same pattern as Create) ----
  const fetchPincodeDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (!Array.isArray(data) || !data[0] || data[0].Status !== "Success") {
        toast.error("Invalid Pincode , Please check the pincode.");
        return { error: "Invalid Pincode" };
      }
      const po = data[0].PostOffice?.[0];
      if (!po) throw new Error("No Post Office found for this pincode");
      return { state: po.State, district: po.District };
    } catch (err) {
      toast.error(err.message);
      return { error: err.message };
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm((p) => ({ ...p, pincode: value, district: "", state: "" }));
    if (value.length > 6) { toast.error("Pincode should be exactly 6 digits."); return; }
    if (value.length === 6) {
      const details = await fetchPincodeDetails(value);
      if (!details?.error) {
        setForm((p) => ({ ...p, district: details.district || "", state: details.state || "" }));
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadDestinations();
        const res = await API.get(`/frontoffice/client/${clientId}`);
        const c = res.data;

        const primary = c.primaryDestinationName
          ? {
              _id: c.primaryDestinationName._id,
              value: c.primaryDestinationName.value,
              label: c.primaryDestinationName.label || c.primaryDestinationName.value,
            }
          : null;

        setForm({
          _id: c._id,
          clientId: c.clientId,

          // readonly visible in header
          name: c.name || "",
          mobileNumber: c.mobileNumber || "",

          // editable fields
          whatsappNumber: c.whatsappNumber || "",
          email: c.email || "",
          tourType: c.tourType || null,
          clientContactOption: c.clientContactOption || contactOptions[0],
          clientType: c.clientType || null,
          pincode: c.pincode || "",
          district: c.district || "",
          state: c.state || "",
          gstNumber: c.gstNumber || "",

          primaryDestinationName: primary,
          groupType: c.groupType || null,
          numberOfPersons: String(c.numberOfPersons || ""),
          startDate: c.startDate ? c.startDate.slice(0, 10) : "",
          endDate: c.endDate ? c.endDate.slice(0, 10) : "",
          numberOfDays: c.numberOfDays ? String(c.numberOfDays) : "",

          addonDestinations: (c.addonDestinations || []).map((d) => ({
            _id: d._id, value: d.value, label: d.label || d.value,
          })),
          additionalRequirements: Array.isArray(c.additionalRequirements) ? c.additionalRequirements : [],
          additionalRequirementsInput: "",
          addonDestinationInput: null,
        });
      } catch (e) {
        toast.error(e?.response?.data?.message || e.message || "Failed to load client");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    if (!form) return;
    setForm((p) => ({ ...p, numberOfDays: computeDays(p.startDate, p.endDate) }));
  }, [form?.startDate, form?.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const addAddonDestination = () => {
    const sel = form.addonDestinationInput;
    if (!sel) return;
    const exists = (form.addonDestinations || []).some(
      (d) => d._id === sel._id || d.value === sel.value
    );
    if (exists) return toast.info("Destination already added");
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
  // ---- simple validators ----
const isEmail = (v) =>
  !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

const isDigitsBetween = (v, min = 10, max = 15) =>
  !!v && /^\d+$/.test(String(v)) && String(v).length >= min && String(v).length <= max;

// ---- page validations (similar to Create) ----
const validate = () => {
  if (!form.primaryDestinationName)
    return toast.error("Primary destination is required"), false;

  if (!form.groupType)
    return toast.error("Group type is required"), false;

  if (!form.tourType)
    return toast.error("Tour type is required"), false;

  if (!form.numberOfPersons || Number(form.numberOfPersons) <= 0)
    return toast.error("Number of persons is required"), false;

  if (!form.startDate)
    return toast.error("Start date is required"), false;

  if (!form.endDate)
    return toast.error("End date is required"), false;

  if (!form.numberOfDays)
    return toast.error("Number of days is required"), false;

  if (!form.pincode)
    return toast.error("Pincode is required"), false;

  if (!form.state)
    return toast.error("State is required"), false;

  if (!form.district)
    return toast.error("District is required"), false;

  if (!form.clientContactOption)
    return toast.error("Client contact option is required"), false;

  // optional-but-if-present validations
  if (form.email && !isEmail(form.email))
    return toast.error("Please enter a valid email"), false;

  if (form.whatsappNumber && !isDigitsBetween(form.whatsappNumber, 10, 15))
    return toast.error("WhatsApp number must be 10–15 digits"), false;

  return true;
};

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving || !form) return;
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = {
        // NEW/edited fields
        whatsappNumber: form.whatsappNumber?.trim() || null,
        clientContactOption: form.clientContactOption,
        clientType: form.clientType,
        pincode: form.pincode,
        district: form.district,
        state: form.state,
        gstNumber: form.gstNumber?.trim() || null,

        // existing
        email: form.email?.trim() || null,
           tourType: form.tourType
     ? { value: form.tourType.value, label: form.tourType.label }
     : null,
        primaryDestinationName: form.primaryDestinationName
          ? { _id: form.primaryDestinationName._id, value: form.primaryDestinationName.value, label: form.primaryDestinationName.label }
          : null,
        groupType: form.groupType,
        numberOfPersons: Number(form.numberOfPersons || 0),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        numberOfDays: Number(form.numberOfDays || 0),
        addonDestinations: (form.addonDestinations || []).map((d) => ({
          _id: d._id, value: d.value, label: d.label,
        })),
        additionalRequirements: form.additionalRequirements,
      };

      await API.put(`/frontoffice/client/${form._id}`, payload);
      toast.success("Client updated");
      onCancel?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="text-gray-500">Loading…</div>;

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      {/* Header card */}
      <div
        className="rounded-3xl p-5 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(245,245,255,0.75))" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Update</div>
            <div className="text-2xl font-extrabold text-[#6b4fe0]">{form.clientId}</div>
            <div className="text-gray-700">{form.name} • {form.mobileNumber}</div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full
               bg-white/70 backdrop-blur-md border border-gray-200 shadow
               text-gray-700 hover:bg-white transition"
          >
            ×
          </button>
        </div>
      </div>

      {/* Editable grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* NEW: WhatsApp before Email */}
        <Field label="WhatsApp Number">
          <input
            type="tel"
            inputMode="numeric"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={form.whatsappNumber}
            onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </Field>
               <Field label="Tour Type" required>
         <Select
           options={tourTypeOptions}
           value={form.tourType}
           onChange={(v) => setForm((p) => ({ ...p, tourType: v }))}
           styles={selectStyles}
           classNamePrefix="update-tour-type"
           placeholder="Select tour type"
           isClearable
         />
       </Field>
        <Field label="Primary Destination" required>
          <Select
            isLoading={loadingDest}
            options={destinations}
            value={form.primaryDestinationName}
            onChange={(v) => setForm((p) => ({ ...p, primaryDestinationName: v }))}
            styles={selectStyles}
            classNamePrefix="update-primary-destination"
            placeholder={loadingDest ? "Loading..." : "Select"}
            getOptionValue={(o) => String(o._id || o.value)}
            isClearable
          />
        </Field>

        <Field label="Group Type" required>
          <Select
            options={groupTypeOptions}
            value={form.groupType}
            onChange={(v) => setForm((p) => ({ ...p, groupType: v }))}
            styles={selectStyles}
            classNamePrefix="update-group-type"
            isClearable
          />
        </Field>

        <Field label="Number of Persons" required>
          <input
            type="number"
            min={1}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={form.numberOfPersons}
            onChange={(e) => setForm((p) => ({ ...p, numberOfPersons: e.target.value }))}
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

        <Field label="Number of Days" required>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={form.numberOfDays}
            readOnly
          />
        </Field>

        {/* AFTER numberOfDays: Client Contact Option, Client Type, Pincode, District, State, GST Number */}
        <Field label="Client Contact Option" required>
          <Select
            options={contactOptions}
            value={form.clientContactOption}
            onChange={(v) => setForm((p) => ({ ...p, clientContactOption: v }))}
            styles={selectStyles}
            classNamePrefix="update-contact-option"
          />
        </Field>

        <Field label="Client Type" required>
          <Select
            options={clientTypeOptions}
            value={form.clientType}
            onChange={(v) => setForm((p) => ({ ...p, clientType: v }))}
            styles={selectStyles}
            classNamePrefix="update-client-type"
            isClearable
            isDisabled={isUrgent}
          />
        </Field>

        <Field label="Pincode" required>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={form.pincode}
            onChange={handlePincodeChange}
            placeholder="6 digits"
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

        <Field label="State" required>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={form.state}
            onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
            placeholder="Auto from pincode"
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

      {/* Add-on Destinations */}
      <div className="grid grid-cols-1 gap-2">
        <label className="block">
          <span className="block text-sm font-medium text-[#222] mb-1">Add-on Destinations</span>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                isLoading={loadingDest}
                options={destinations}
                value={form.addonDestinationInput}
                onChange={(v) => setForm((p) => ({ ...p, addonDestinationInput: v }))}
                placeholder={loadingDest ? "Loading..." : "Pick a destination"}
                styles={selectStyles}
                classNamePrefix="update-addon-destinations-input"
                getOptionValue={(o) => String(o._id || o.value)}
                isClearable
              />
            </div>
            <button
              type="button"
              onClick={addAddonDestination}
              className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
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

      {/* Additional Requirements */}
      <div className="grid grid-cols-1 gap-2">
        <label className="block">
          <span className="block text-sm font-medium text-[#222] mb-1">Additional Requirements</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              placeholder="Type a requirement"
              value={form.additionalRequirementsInput}
              onChange={(e) => setForm((p) => ({ ...p, additionalRequirementsInput: e.target.value }))}
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

    
      <div className="pt-2 flex flex-col items-center gap-2">
  {/* Cross above */}
  <button
    type="button"
    onClick={onCancel}
    aria-label="Close"
    className="inline-flex items-center justify-center w-9 h-9 rounded-full
               bg-white/70 backdrop-blur-md border border-gray-200 shadow
               text-gray-700 hover:bg-white transition"
  >
    ×
  </button>

  {/* Full-width Save */}
  <button
    type="submit"
    disabled={saving}
    className="w-full inline-flex items-center justify-center rounded-full
               bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90
               focus:outline-none focus:ring-2 focus:ring-offset-2
               focus:ring-[#8570EE] disabled:opacity-60"
  >
    {saving ? "Saving…" : "Update Client"}
  </button>
</div>

    </form>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="block">
          <span className="block text-sm font-medium text-[#222] mb-1">
       {label} {required && <span className="text-red-500">*</span>}
     </span>
      {children}
    </label>
  );
}
