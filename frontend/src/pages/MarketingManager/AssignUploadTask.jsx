import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

const AssignUploadTask = () => {
  // Options (static)
  const categoryOptions = useMemo(
    () => [
      { value: "Branch Video", label: "Branch Video" },
      { value: "Franchisee Video", label: "Franchisee Video" },
      { value: "Office Video", label: "Office Video" },
      { value: "Staff performance", label: "Staff performance" },
    ],
    []
  );

  // Loadable options
  const [dmOptions, setDmOptions] = useState([]);
  const [csOptions, setCsOptions] = useState([]);

  // Form fields
  const [category, setCategory] = useState(null);
  const [filename, setFilename] = useState("");
  const [publishingDate, setPublishingDate] = useState(""); // yyyy-mm-dd
  const [assignDm, setAssignDm] = useState(null);
  const [assignCs, setAssignCs] = useState(null);
  const [msgDM, setMsgDM] = useState("");
  const [msgCS, setMsgCS] = useState("");

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
        ":active": { backgroundColor: "rgba(133,112,238,0.16)" },
      }),
    }),
    []
  );

  const isBlank = (s) => !s || !String(s).trim();
  const isValidISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

  // Load DM + CS
  useEffect(() => {
    (async () => {
      try {
        const [dmRes, csRes] = await Promise.all([
          API.get("/marketingManager/digital-marketers"),
          API.get("/marketingManager/creative-staff"),
        ]);
        setDmOptions(dmRes.data || []);
        setCsOptions(csRes.data || []);
      } catch {
        toast.error("Failed to load team lists");
      }
    })();
  }, []);

  const clearForm = () => {
    setCategory(null);
    setFilename("");
    setPublishingDate("");
    setAssignDm(null);
    setAssignCs(null);
    setMsgDM("");
    setMsgCS("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!category?.value) return toast.error("Select a category");
    if (isBlank(filename)) return toast.error("Enter a filename");
    if (!isValidISODate(publishingDate)) return toast.error("Pick a valid publishing date");
    if (!assignDm?.value) return toast.error("Select a digital marketer");
    if (isBlank(msgDM)) return toast.error("Message for the digital marketer is required");
    if (assignCs?.value && isBlank(msgCS))
      return toast.error("Message for creative staff is required when staff is selected");

    try {
      setSubmitting(true);
      await API.post("/marketingManager/upload-assignments", {
        category: category.value,
        filename: filename.trim(),
        publishingDate, // yyyy-mm-dd
        digitalMarketerId: assignDm.value,
        messageForDigitalMarketer: msgDM.trim(),
        creativeStaffId: assignCs?.value || undefined,
        messageForCreativeStaff: assignCs?.value ? msgCS.trim() : undefined,
      });
      toast.success("Upload task assigned");
      clearForm();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to assign upload task";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* <h2 className="text-xl font-semibold text-[#222]">Assign Upload Task</h2> */}

      <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
        {/* Row 1: Category / Filename / Publishing Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Category" required>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="Select category"
              styles={selectStyles}
              classNamePrefix="assignupload-category"
            />
          </Field>

          <Field label="File name" required>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., branch-jan-2025.mp4"
            />
          </Field>

          <Field label="Publishing Date" required>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={publishingDate}
              onChange={(e) => setPublishingDate(e.target.value)}
            />
          </Field>
        </div>

        {/* Row 2: Assignments */}
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
              placeholder="Select creative staff (optional)"
              styles={selectStyles}
            />
          </Field>
        </div>

        {/* Row 3: Messages */}
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
              placeholder="Instructions for the creative staff (if assigned)"
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
            {submitting ? "Assigning…" : "Assign"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignUploadTask;

/* small primitive */
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
