// src/pages/salesManager/ExecutiveDetails.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

const selectStyles = {
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
  dropdownIndicator: (b) => ({ ...b, color: "#6b7280" }),
  menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", zIndex: 50 }),
};

// Fixed option lists
const tourTypeOptions = [
  { value: "grouptour", label: "Group Tour" },
  { value: "fixedtour", label: "Fixed Tour" },
  { value: "customtour", label: "Custom Tour" },
];
const groupTypeOptions = [
  { value: "single", label: "Single" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
];
const clientTypeOptions = [
  { value: "Urgent Contact", label: "Urgent Contact" },
  { value: "Non Urgent Contact", label: "Non Urgent Contact" },
];
const currentLocationOptions = [
  { value: "insider", label: "Insider" },
  { value: "outsider", label: "Outsider" },
];
const behaviourOptions = [
  { value: "polite", label: "Polite" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Hard" },
  { value: "educated", label: "Educated" },
];
const connectedThroughOptions = [
  { value: "social media organic", label: "social media organic" },
  { value: "social media promotions", label: "social media promotions" },
  { value: "customer enquiry", label: "customer enquiry" },
  { value: "by call", label: "by call" },
  { value: "recommented", label: "recommented" },
  { value: "instagram chat", label: "instagram chat" },
];
const clientContactOptions = [
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
];

export default function ExecutiveDetails({ id, onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState(null);

  const [destOptions, setDestOptions] = useState([]);

  // prefs (arrays)
  const [tourCats, setTourCats] = useState([]);
  const [primaryDests, setPrimaryDests] = useState([]);
  const [groupTypes, setGroupTypes] = useState([]);
  const [daysList, setDaysList] = useState([]);
  const [clientTypes, setClientTypes] = useState([]);
  const [curLocations, setCurLocations] = useState([]);
  const [behaviours, setBehaviours] = useState([]);
  const [connectedThrough, setConnectedThrough] = useState([]);
  const [clientContact, setClientContact] = useState([]); // ✅ new array

  // single “candidate” values for Add buttons
  const [tourCatCandidate, setTourCatCandidate] = useState(null);
  const [groupTypeCandidate, setGroupTypeCandidate] = useState(null);
  const [clientTypeCandidate, setClientTypeCandidate] = useState(null);
  const [curLocCandidate, setCurLocCandidate] = useState(null);
  const [behaviourCandidate, setBehaviourCandidate] = useState(null);
  const [connectedThroughCandidate, setConnectedThroughCandidate] = useState(null);
  const [clientContactCandidate, setClientContactCandidate] = useState(null); // ✅
  const [destCandidate, setDestCandidate] = useState(null);

  // Number of Days: numeric input + chips
  const [dayInput, setDayInput] = useState("");

  // helpers
  const addOption = (list, setList, candidate, setCandidate) => {
    if (!candidate?.value) return;
    const key = String(candidate.value).trim().toLowerCase();
    if (list.some((o) => String(o.value).toLowerCase() === key)) return;
    setList([...list, { value: key, label: candidate.label || candidate.value }]);
    setCandidate(null);
  };
  const removeOption = (list, setList, value) => {
    const key = String(value).toLowerCase();
    setList(list.filter((o) => String(o.value).toLowerCase() !== key));
  };

  const addDestination = () => {
    if (!destCandidate?._id) return;
    const id = String(destCandidate._id);
    if (primaryDests.some((d) => String(d._id) === id)) return;
    setPrimaryDests([...primaryDests, { _id: id, value: destCandidate.value, label: destCandidate.label }]);
    setDestCandidate(null);
  };
  const removeDestination = (id) => {
    setPrimaryDests(primaryDests.filter((d) => String(d._id) !== String(id)));
  };

  const addDay = () => {
    const n = Number(dayInput);
    if (!Number.isFinite(n) || n < 1 || n > 365) return;
    if (daysList.includes(n)) return;
    setDaysList([...daysList, n].sort((a, b) => a - b));
    setDayInput("");
  };
  const removeDay = (n) => setDaysList(daysList.filter((x) => x !== n));

  const load = async () => {
    try {
      setLoading(true);
      const [prefRes, destRes] = await Promise.all([
        API.get(`/salesManager/executives/${id}/preferences`),
        API.get(`/salesManager/all-destinations`),
      ]);
      const data = prefRes.data || {};

      setInfo({
        name: data.name,
        email: data.email,
        contactNumber: data.contactNumber,
        status: data.status,
      });

      setTourCats(data.prefTourCategories || []);
      setPrimaryDests(data.prefPrimaryDestinations || []);
      setGroupTypes(data.prefGroupTypes || []);
      setDaysList(Array.isArray(data.prefNumberOfDays) ? data.prefNumberOfDays : []);
      setClientTypes(data.prefClientTypes || []);
      setCurLocations(data.prefCurrentLocations || []);
      setBehaviours(data.prefBehaviours || []);
      setConnectedThrough(data.prefConnectedThrough || []);
      setClientContact(data.prefClientContactOptions || []); // ✅

      setDestOptions(destRes.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    try {
      setSaving(true);
      const payload = {
        prefTourCategories: tourCats,
        prefPrimaryDestinations: primaryDests,
        prefGroupTypes: groupTypes,
        prefNumberOfDays: daysList, // numeric array
        prefClientTypes: clientTypes,
        prefCurrentLocations: curLocations,
        prefBehaviours: behaviours,
        prefConnectedThrough: connectedThrough,
        prefClientContactOptions: clientContact, // ✅
      };
      await API.put(`/salesManager/executives/${id}/preferences`, payload);
      toast.success("Preferences saved");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <div className="text-sm text-gray-600">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <h2 className="text-xl font-semibold text-[#222] truncate">
          {info?.name} <span className="text-gray-500">({info?.status})</span>
        </h2>
        <div className="w-24" />
      </div>

      {/* Tour Category */}
      <Field label="Preferred Tour Categories">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={tourTypeOptions}
              value={tourCatCandidate}
              onChange={setTourCatCandidate}
              isClearable
              styles={selectStyles}
              classNamePrefix="exec-tourcats"
              placeholder="Pick a tour category"
            />
          </div>
          <button
            type="button"
            onClick={() => addOption(tourCats, setTourCats, tourCatCandidate, setTourCatCandidate)}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>
        {tourCats.length > 0 && (
          <Chips items={tourCats} onRemove={(v) => removeOption(tourCats, setTourCats, v)} />
        )}
      </Field>

      {/* Primary Destinations */}
      <Field label="Preferred Destinations">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={destOptions}
              value={destCandidate}
              onChange={setDestCandidate}
              isClearable
              styles={selectStyles}
              classNamePrefix="exec-dests"
              getOptionValue={(o) => String(o._id || o.value)}
              placeholder="Pick a destination"
            />
          </div>
          <button
            type="button"
            onClick={addDestination}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>
        {primaryDests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {primaryDests.map((d) => (
              <span
                key={String(d._id)}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
                  bg-white/30 backdrop-blur-md border border-white/40 shadow-sm"
              >
                {d.label || d.value}
                <button
                  type="button"
                  onClick={() => removeDestination(d._id)}
                  className="w-5 h-5 rounded-full bg-[#8570EE]/20 hover:bg-[#8570EE]/30"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Field>

      {/* Group Type */}
      <Field label="Preferred Group Types">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={groupTypeOptions}
              value={groupTypeCandidate}
              onChange={setGroupTypeCandidate}
              isClearable
              styles={selectStyles}
              classNamePrefix="exec-grouptypes"
              placeholder="Pick a group type"
            />
          </div>
          <button
            type="button"
            onClick={() => addOption(groupTypes, setGroupTypes, groupTypeCandidate, setGroupTypeCandidate)}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>
        {groupTypes.length > 0 && (
          <Chips items={groupTypes} onRemove={(v) => removeOption(groupTypes, setGroupTypes, v)} />
        )}
      </Field>

      {/* Number of Days (chips add/remove) */}
      <Field label="Preferred Tour Days">
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={365}
            value={dayInput}
            onChange={(e) => setDayInput(e.target.value)}
            className=" w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="e.g., 3"
          />
          <button
            type="button"
            onClick={addDay}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>

        {daysList.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {daysList.map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
                   bg-white/30 backdrop-blur-md border border-white/40 shadow-sm"
              >
                {n} days
                <button
                  type="button"
                  onClick={() => removeDay(n)}
                  className="w-5 h-5 rounded-full bg-[#8570EE]/20 hover:bg-[#8570EE]/30"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Field>

      {/* Client Contact Option (add multiple)  ✅ NEW, placed right after Days */}
      <Field label="Preferred Client Contact Options">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={clientContactOptions}
              value={clientContactCandidate}
              onChange={setClientContactCandidate}
              isClearable
              styles={selectStyles}
              classNamePrefix="exec-clientcontact"
              placeholder="Pick contact option"
            />
          </div>
          <button
            type="button"
            onClick={() => addOption(clientContact, setClientContact, clientContactCandidate, setClientContactCandidate)}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>
        {clientContact.length > 0 && (
          <Chips items={clientContact} onRemove={(v) => removeOption(clientContact, setClientContact, v)} />
        )}
      </Field>

      {/* Client Type */}
      <Field label="Preferred Client Types">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={clientTypeOptions}
              value={clientTypeCandidate}
              onChange={setClientTypeCandidate}
              isClearable
              styles={selectStyles}
              classNamePrefix="exec-clienttypes"
              placeholder="Pick a client type"
            />
          </div>
          <button
            type="button"
            onClick={() => addOption(clientTypes, setClientTypes, clientTypeCandidate, setClientTypeCandidate)}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>
        {clientTypes.length > 0 && (
          <Chips items={clientTypes} onRemove={(v) => removeOption(clientTypes, setClientTypes, v)} />
        )}
      </Field>

      {/* Client Current Location */}
      <Field label="Preferred Client Current Location">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={currentLocationOptions}
              value={curLocCandidate}
              onChange={setCurLocCandidate}
              isClearable
              styles={selectStyles}
              classNamePrefix="exec-curloc"
              placeholder="Pick current location"
            />
          </div>
          <button
            type="button"
            onClick={() => addOption(curLocations, setCurLocations, curLocCandidate, setCurLocCandidate)}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>
        {curLocations.length > 0 && (
          <Chips items={curLocations} onRemove={(v) => removeOption(curLocations, setCurLocations, v)} />
        )}
      </Field>

      {/* Client Behaviour */}
      <Field label="Preferred Client Behaviour">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={behaviourOptions}
              value={behaviourCandidate}
              onChange={setBehaviourCandidate}
              isClearable
              styles={selectStyles}
              classNamePrefix="exec-behaviour"
              placeholder="Pick behaviour"
            />
          </div>
          <button
            type="button"
            onClick={() => addOption(behaviours, setBehaviours, behaviourCandidate, setBehaviourCandidate)}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>
        {behaviours.length > 0 && (
          <Chips items={behaviours} onRemove={(v) => removeOption(behaviours, setBehaviours, v)} />
        )}
      </Field>

      {/* Connected Through */}
      <Field label="Preferred Connected Through">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              options={connectedThroughOptions}
              value={connectedThroughCandidate}
              onChange={setConnectedThroughCandidate}
              isClearable
              styles={selectStyles}
              classNamePrefix="exec-connectedthrough"
              placeholder="Pick source"
            />
          </div>
          <button
            type="button"
            onClick={() => addOption(connectedThrough, setConnectedThrough, connectedThroughCandidate, setConnectedThroughCandidate)}
            className="rounded-full bg-[#8570EE] text-white px-4 py-2 font-semibold hover:opacity-90"
          >
            +
          </button>
        </div>
        {connectedThrough.length > 0 && (
          <Chips items={connectedThrough} onRemove={(v) => removeOption(connectedThrough, setConnectedThrough, v)} />
        )}
      </Field>

      {/* Full-width Save at bottom */}
      <div className="pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-[#8570EE]
             text-white px-6 py-3 font-semibold hover:opacity-90
             focus:outline-none focus:ring-2 focus:ring-offset-2
             focus:ring-[#8570EE] disabled:opacity-60 w-full"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-[#222]">{label}</span>
      {children}
    </label>
  );
}

function Chips({ items, onRemove }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((o) => (
        <span
          key={String(o.value)}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm
             bg-white/30 backdrop-blur-md border border-white/40 shadow-sm"
        >
          {o.label || o.value}
          <button
            type="button"
            onClick={() => onRemove(o.value)}
            className="w-5 h-5 rounded-full bg-[#8570EE]/20 hover:bg-[#8570EE]/30"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
