// src/pages/marketingManager/AssignAdTask.jsx
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function AssignAdTask() {
  // dropdown data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [dmOptions, setDmOptions] = useState([]);
  const [csOptions, setCsOptions] = useState([]);

  // selections
  const [country, setCountry] = useState(null);
  const [stateOpt, setStateOpt] = useState(null);
  const [destination, setDestination] = useState(null);
  const [task, setTask] = useState(null);
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [details, setDetails] = useState("");

  const [assignDm, setAssignDm] = useState(null);
  const [assignCs, setAssignCs] = useState(null);
  const [msgDM, setMsgDM] = useState("");
  const [msgCS, setMsgCS] = useState("");

  // loading flags
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const taskOptions = useMemo(
    () => [
      { value: "Poster", label: "Poster" },
      { value: "Reel", label: "Reel" },
      { value: "Video", label: "Video" },
      { value: "Review", label: "Review" },
      { value: "Staff Performance", label: "Staff Performance" },
    ],
    []
  );

  const selectStyles = useMemo(
    () => ({
      control: (base, s) => ({
        ...base,
        borderRadius: 12,
        borderColor: s.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: s.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        backgroundColor: "white",
        ":hover": { borderColor: s.isFocused ? "#8570EE" : "#d1d5db" },
      }),
      valueContainer: (b) => ({ ...b, padding: "0 12px" }),
      indicatorsContainer: (b) => ({ ...b, paddingRight: 8 }),
      option: (b, s) => ({
        ...b,
        backgroundColor: s.isFocused
          ? "rgba(133,112,238,0.08)"
          : s.isSelected
          ? "rgba(133,112,238,0.16)"
          : "white",
        color: "#222",
      }),
    }),
    []
  );

  // --- load meta ---
  useEffect(() => {
    (async () => {
      try {
        setLoadingCountries(true);
        const [c, dms, css] = await Promise.all([
          API.get("/marketingManager/countries"),
          API.get("/marketingManager/digital-marketers"),
          API.get("/marketingManager/creative-staff"),
        ]);
        setCountries((c.data || []).map((x) => ({ value: x._id, label: x.name })));
        setDmOptions(dms.data || []);
        setCsOptions(css.data || []);
      } catch {
        toast.error("Failed to load setup data");
      } finally {
        setLoadingCountries(false);
      }
    })();
  }, []);

  // country -> states
  useEffect(() => {
    setStates([]);
    setStateOpt(null);
    setDestinations([]);
    setDestination(null);
    if (!country) return;
    (async () => {
      try {
        setLoadingStates(true);
        const res = await API.get(`/marketingManager/states/${country.value}`);
        setStates((res.data || []).map((x) => ({ value: x._id, label: x.name })));
      } catch {
        toast.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    })();
  }, [country]);

  // state -> destinations
  useEffect(() => {
    setDestinations([]);
    setDestination(null);
    if (!country || !stateOpt) return;
    (async () => {
      try {
        setLoadingDestinations(true);
        const res = await API.get(
          `/marketingManager/destinations/${country.value}/${stateOpt.value}`
        );
        setDestinations((res.data || []).map((x) => ({ value: x._id, label: x.name })));
      } catch {
        toast.error("Failed to load destinations");
      } finally {
        setLoadingDestinations(false);
      }
    })();
  }, [country, stateOpt]);

  const today = new Date().toISOString().split("T")[0];

  const validate = () => {
    if (!country?.value) return toast.error("Select country"), false;
    if (!stateOpt?.value) return toast.error("Select state"), false;
    if (!destination?.value) return toast.error("Select destination"), false;
    if (!task?.value) return toast.error("Select task"), false;
    if (!date) return toast.error("Select publishing date"), false;
    if (new Date(date).toString() === "Invalid Date")
      return toast.error("Invalid date"), false;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1)
      return toast.error("Quantity must be a positive whole number"), false;
    if (!assignDm?.value) return toast.error("Assign a digital marketer"), false;
    if (!msgDM.trim()) return toast.error("Message for digital marketer is required"), false;
    if (!assignCs?.value) return toast.error("Assign a creative staff"), false;
    if (!msgCS.trim()) return toast.error("Message for creative staff is required"), false;
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    try {
      setSubmitting(true);
      await API.post("/marketingManager/ad-assignments", {
        countryId: country.value,
        stateId: stateOpt.value,
        destinationId: destination.value,
        task: task.value,
        date, // yyyy-mm-dd from <input type="date">
        quantity: Number(quantity),
        details: details.trim(),
        digitalMarketerId: assignDm.value,
        messageForDigitalMarketer: msgDM.trim(),
        creativeStaffId: assignCs.value,
        messageForCreativeStaff: msgCS.trim(),
      });

      toast.success("Ad task assigned successfully");
      // reset form
      setCountry(null);
      setStateOpt(null);
      setDestination(null);
      setTask(null);
      setDate("");
      setQuantity(1);
      setDetails("");
      setAssignDm(null);
      setAssignCs(null);
      setMsgDM("");
      setMsgCS("");
    } catch (e2) {
      const msg = e2?.response?.data?.message || "Failed to assign task";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* <h2 className="text-xl font-semibold text-[#222]">Assign Ad Task</h2> */}

      <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
        {/* Row 1: Country / State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Country" required>
            <Select
              options={countries}
              isLoading={loadingCountries}
              value={country}
              onChange={setCountry}
              placeholder={loadingCountries ? "Loading countries..." : "Select country"}
              styles={selectStyles}
            />
          </Field>

          <Field label="State" required>
            <Select
              options={states}
              isLoading={loadingStates}
              value={stateOpt}
              onChange={setStateOpt}
              isDisabled={!country}
              placeholder={!country ? "Select country first" : "Select state"}
              styles={selectStyles}
            />
          </Field>
        </div>

        {/* Row 2: Destination / Task */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Destination" required>
            <Select
              options={destinations}
              isLoading={loadingDestinations}
              value={destination}
              onChange={setDestination}
              isDisabled={!country || !stateOpt}
              placeholder={
                !country ? "Select country first" : !stateOpt ? "Select state first" : "Select destination"
              }
              styles={selectStyles}
            />
          </Field>

          <Field label="Task" required>
            <Select
              options={taskOptions}
              value={task}
              onChange={setTask}
              placeholder="Select task"
              styles={selectStyles}
            />
          </Field>
        </div>

        {/* Row 3: Date / Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Publishing Date" required>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>

          <Field label="Quantity" required>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 10"
            />
          </Field>
        </div>

        {/* Row 4: Details */}
        <Field label="Details">
          <textarea
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Any notes, references, links…"
          />
        </Field>

        {/* Row 5: Assignments */}
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

          <Field label="Assign Creative Staff" required>
            <Select
              options={csOptions}
              value={assignCs}
              onChange={setAssignCs}
              placeholder="Select creative staff"
              styles={selectStyles}
            />
          </Field>
        </div>

        {/* Row 6: Messages */}
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

          <Field label="Message for Creative Staff" required>
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
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] disabled:opacity-60"
          >
            {submitting ? "Assigning..." : "Assign Task"}
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
