// src/pages/entry/CreateClient.jsx
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function CreateClient() {
  // Options
  const [destinations, setDestinations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // Form state
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [primaryDestinationName, setPrimaryDestinationName] = useState(null); // {_id,value,label}
  const [connectedThrough, setConnectedThrough] = useState(null);             // {value,label} REQUIRED
  const [clientType, setClientType] = useState(null);                         // {value,label} OPTIONAL
  const [campaignName, setCampaignName] = useState(null);                     // {kind,refId,label,value}

  const [loadingDest, setLoadingDest] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      }),
      placeholder: (b) => ({ ...b, color: "#6b7280" }),
      singleValue: (b) => ({ ...b, color: "#111827" }),
    }),
    []
  );

  const connectedThroughOptions = [
    { value: "social media organic", label: "social media organic" },
    { value: "social media promotions", label: "social media promotions" },
    { value: "customer enquiry", label: "customer enquiry" },
    { value: "by call", label: "by call" },
    { value: "recommented", label: "recommented" },
    { value: "instagram chat", label: "instagram chat" },
  ];
  const clientTypeOptions = [{ value: "Urgent Contact", label: "Urgent Contact" }];

  const loadDestinations = async () => {
    try {
      setLoadingDest(true);
      const res = await API.get("/entry/destinations");
      const opts = (res.data || []).map((d) => ({
        _id: d._id,
        value: d.value,
        label: d.label,
      }));
      setDestinations(opts);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to load destinations";
      toast.error(msg);
    } finally {
      setLoadingDest(false);
    }
  };

  const loadCampaigns = async (destinationId) => {
    if (!destinationId) {
      setCampaigns([]);
      return;
    }
    try {
      setLoadingCampaigns(true);
      const res = await API.get("/entry/campaigns", { params: { destinationId } });
      const opts = (res.data || []).map((c) => ({
        value: c.value,    // "fixed:<id>" or "group:<id>"
        label: `${c.label}`,
        kind: c.kind,
        refId: c.refId,
        _raw: c,
      }));
      setCampaigns(opts);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to load campaigns";
      toast.error(msg);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  // update campaigns when destination changes
  useEffect(() => {
    setCampaignName(null);
    loadCampaigns(primaryDestinationName?._id);
  }, [primaryDestinationName]);

  const validate = () => {
    const mobile = String(mobileNumber || "").trim();
    if (!/^\d{10,15}$/.test(mobile)) {
      toast.error("Mobile number must be 10–15 digits");
      return false;
    }
    if (!primaryDestinationName || !primaryDestinationName._id) {
      toast.error("Please select a primary destination");
      return false;
    }
    if (!connectedThrough || !connectedThrough.value) {
      toast.error("Please select Connected Through");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        mobileNumber: String(mobileNumber).trim(),
        primaryDestinationName: {
          _id: primaryDestinationName._id,
          value: primaryDestinationName.value,
          label: primaryDestinationName.label,
        },
        connectedThrough,
        clientType: clientType || null,
        campaignName: campaignName
          ? { kind: campaignName.kind, refId: campaignName.refId, label: campaignName.label }
          : null,
      };

      await API.post("/entry/clients", payload);
      toast.success("Client created");

      // reset
      setName("");
      setMobileNumber("");
      setPrimaryDestinationName(null);
      setConnectedThrough(null);
      setClientType(null);
      setCampaignName(null);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client name (optional)"
            />
          </Field>

          <Field label="Mobile Number" required>
            <input
              type="tel"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="10–15 digits"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Primary Destination" required>
            <Select
              isLoading={loadingDest}
              options={destinations}
              value={primaryDestinationName}
              onChange={setPrimaryDestinationName}
              placeholder={loadingDest ? "Loading destinations..." : "Select destination"}
              styles={selectStyles}
              classNamePrefix="entry-primary-destination"
              getOptionValue={(o) => String(o._id || o.value)}
            />
          </Field>

          <Field label="Connected Through" required>
            <Select
              options={connectedThroughOptions}
              value={connectedThrough}
              onChange={setConnectedThrough}
              placeholder="Select source"
              isClearable
              styles={selectStyles}
              classNamePrefix="entry-connected-through"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Client Type">
            <Select
              options={clientTypeOptions}
              value={clientType}
              onChange={setClientType}
              isClearable
              placeholder="Optional"
              styles={selectStyles}
              classNamePrefix="entry-client-type"
            />
          </Field>

          <Field label="Campaign Name (Group/Fixed tour)">
            <Select
              isLoading={loadingCampaigns}
              options={campaigns}
              value={campaignName}
              onChange={setCampaignName}
              placeholder={
                primaryDestinationName
                  ? loadingCampaigns
                    ? "Loading campaigns..."
                    : "Select a tour"
                  : "Select a destination first"
              }
              isDisabled={!primaryDestinationName || loadingDest}
              styles={selectStyles}
              classNamePrefix="entry-campaign-name"
            />
          </Field>
        </div>

        <div className="pt-2 flex items-center justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60 w-full"
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
