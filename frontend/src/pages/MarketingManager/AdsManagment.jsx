import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "checkbox", label: "Checkbox" },
  // { value: "url", label: "URL" },
  // { value: "destinations", label: "Destination(s)" },
];

export default function AdsManagment() {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);

  // create/edit category form
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catActive, setCatActive] = useState(true);
  const [editingCatId, setEditingCatId] = useState(null);

  // add field form
  const [fLabel, setFLabel] = useState("");
  const [fKey, setFKey] = useState("");
  const [fType, setFType] = useState(null);
  const [fRequired, setFRequired] = useState(false);
  const [fPlaceholder, setFPlaceholder] = useState("");
  const [fHelp, setFHelp] = useState("");
  const [fOptions, setFOptions] = useState([{ label: "", value: "" }]); // for select/multi
  const [fMultipleDest, setFMultipleDest] = useState(false);
  const [fMin, setFMin] = useState("");
  const [fMax, setFMax] = useState("");

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
      dropdownIndicator: (b) => ({
        ...b,
        color: "#6b7280",
        ":hover": { color: "#4b5563" },
      }),
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

  const loadCats = async () => {
    try {
      setLoadingCats(true);
      const res = await API.get("/marketingManager/ad-categories");
      setCategories(res.data || []);
      // refresh selected cat
      if (selectedCatId) {
        const sc = (res.data || []).find((c) => c._id === selectedCatId) || null;
        setSelectedCat(sc);
      }
    } catch {
      toast.error("Failed to load ad categories");
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetCatForm = () => {
    setEditingCatId(null);
    setCatName("");
    setCatDesc("");
    setCatActive(true);
  };

  const submitCategory = async () => {
    try {
      if (!catName.trim()) {
        toast.error("Category name is required");
        return;
      }
      if (editingCatId) {
        await API.patch(`/marketingManager/ad-categories/${editingCatId}`, {
          name: catName.trim(),
          description: catDesc,
          isActive: catActive,
        });
        toast.success("Category updated");
      } else {
        await API.post("/marketingManager/ad-categories", {
          name: catName.trim(),
          description: catDesc,
          isActive: catActive,
        });
        toast.success("Category created");
      }
      resetCatForm();
      loadCats();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to save category";
      toast.error(msg);
    }
  };

  const editCategory = (cat) => {
    setEditingCatId(cat._id);
    setCatName(cat.name || "");
    setCatDesc(cat.description || "");
    setCatActive(!!cat.isActive);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? This cannot be undone.")) return;
    try {
      await API.delete(`/marketingManager/ad-categories/${id}`);
      toast.success("Category deleted");
      if (selectedCatId === id) {
        setSelectedCatId(null);
        setSelectedCat(null);
      }
      loadCats();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const selectCategory = async (id) => {
    setSelectedCatId(id);
    try {
      const res = await API.get(`/marketingManager/ad-categories/${id}`);
      setSelectedCat(res.data || null);
    } catch {
      toast.error("Failed to load category details");
    }
  };

  // ----- Field helpers -----
  const resetFieldForm = () => {
    setFLabel("");
    setFKey("");
    setFType(null);
    setFRequired(false);
    setFPlaceholder("");
    setFHelp("");
    setFOptions([{ label: "", value: "" }]);
    setFMultipleDest(false);
    setFMin("");
    setFMax("");
  };

  const addOptionRow = () => setFOptions((prev) => [...prev, { label: "", value: "" }]);
  const removeOptionRow = (i) =>
    setFOptions((prev) => prev.filter((_, idx) => idx !== i));
  const updateOption = (i, k, v) =>
    setFOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, [k]: v } : o)));

  const addField = async () => {
    if (!selectedCatId) {
      toast.error("Select a category first");
      return;
    }
    if (!fLabel.trim()) {
      toast.error("Field label is required");
      return;
    }
    if (!fType?.value) {
      toast.error("Field type is required");
      return;
    }

    const payload = {
      label: fLabel.trim(),
      key: fKey.trim() || undefined,
      type: fType.value,
      required: fRequired,
      config: {
        placeholder: fPlaceholder || "",
        helpText: fHelp || "",
      },
    };

    if (fType.value === "select" || fType.value === "multiselect") {
      payload.config.options = (fOptions || [])
        .map((o) => ({
          label: String(o.label || "").trim(),
          value: String(o.value || "").trim(),
        }))
        .filter((o) => o.label && o.value);
      if (!payload.config.options.length) {
        toast.error("Add at least one option");
        return;
      }
    }

    if (fType.value === "destinations") {
      payload.config.multiple = !!fMultipleDest;
    }

    if (fType.value === "number") {
      if (fMin !== "") payload.config.min = Number(fMin);
      if (fMax !== "") payload.config.max = Number(fMax);
    }

    try {
      await API.post(`/marketingManager/ad-categories/${selectedCatId}/fields`, payload);
      toast.success("Field added");
      resetFieldForm();
      selectCategory(selectedCatId);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to add field";
      toast.error(msg);
    }
  };

  const deleteField = async (fieldId) => {
    if (!window.confirm("Delete this field?")) return;
    try {
      await API.delete(
        `/marketingManager/ad-categories/${selectedCatId}/fields/${fieldId}`
      );
      toast.success("Field deleted");
      selectCategory(selectedCatId);
    } catch {
      toast.error("Failed to delete field");
    }
  };

  const moveField = async (fieldId, dir) => {
    // reorder locally, then push new order to API
    const fields = [...(selectedCat?.fields || [])];
    const idx = fields.findIndex((f) => f._id === fieldId);
    if (idx < 0) return;
    const swapWith = dir === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= fields.length) return;
    [fields[idx], fields[swapWith]] = [fields[swapWith], fields[idx]];
    const newOrder = fields.map((f) => f._id);

    try {
      await API.patch(`/marketingManager/ad-categories/${selectedCatId}/fields-reorder`, {
        order: newOrder,
      });
      selectCategory(selectedCatId);
    } catch {
      toast.error("Failed to reorder fields");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#222]">Ads Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========== Categories ========== */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="text-lg font-semibold mb-3">Create / Edit Category</h3>

            <Field label="Name" required>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g., Meta Ads"
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={2}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Optional description"
              />
            </Field>

            <label className="inline-flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={catActive}
                onChange={(e) => setCatActive(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>

            <div className="flex gap-2 pt-4">
              <button
                onClick={submitCategory}
                className="rounded-full bg-[#8570EE] text-white px-5 py-2 font-semibold hover:opacity-90"
              >
                {editingCatId ? "Update" : "Create"}
              </button>
              {editingCatId && (
                <button
                  onClick={resetCatForm}
                  className="rounded-full border border-gray-300 px-5 py-2 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Categories</h3>
              <button
                onClick={loadCats}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            {loadingCats ? (
              <p className="text-gray-500">Loading…</p>
            ) : (categories || []).length === 0 ? (
              <p className="text-gray-500">No categories yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categories.map((c) => (
                  <li key={c._id} className="py-2 flex items-center justify-between">
                    <button
                      onClick={() => selectCategory(c._id)}
                      className={`text-left flex-1 pr-2 ${
                        selectedCatId === c._id ? "font-semibold" : ""
                      }`}
                    >
                      {c.name}
                      {!c.isActive && (
                        <span className="ml-2 text-xs rounded-full bg-gray-100 px-2 py-0.5">
                          inactive
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editCategory(c)}
                        className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(c._id)}
                        className="rounded-full border border-red-300 text-red-700 px-3 py-1 text-sm hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ========== Fields for selected category ========== */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                {selectedCat ? `Fields — ${selectedCat.name}` : "Fields"}
              </h3>
              {selectedCat && (
                <span className="text-sm text-gray-500">
                  {selectedCat.fields?.length || 0} field(s)
                </span>
              )}
            </div>

            {!selectedCat ? (
              <p className="text-gray-500">Select a category to manage its fields.</p>
            ) : (selectedCat.fields || []).length === 0 ? (
              <p className="text-gray-500">No fields yet. Create one below.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {selectedCat.fields.map((f, idx) => (
                  <li key={f._id} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#222]">{f.label}</div>
                      <div className="text-xs text-gray-600">
                        key: <code>{f.key}</code> &middot; type:{" "}
                        <span className="font-medium">{f.type}</span>{" "}
                        {f.required ? "· required" : ""}
                      </div>
                      {f.config?.helpText ? (
                        <div className="text-xs text-gray-500 mt-1">
                          {f.config.helpText}
                        </div>
                      ) : null}
                      {["select", "multiselect"].includes(f.type) && (
                        <div className="text-xs text-gray-600 mt-1">
                          Options:{" "}
                          {(f.config?.options || [])
                            .map((o) => `${o.label} (${o.value})`)
                            .join(", ") || "—"}
                        </div>
                      )}
                      {f.type === "destinations" && (
                        <div className="text-xs text-gray-600 mt-1">
                          {f.config?.multiple ? "Multiple destinations" : "Single destination"}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveField(f._id, "up")}
                        disabled={idx === 0}
                        className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveField(f._id, "down")}
                        disabled={idx === selectedCat.fields.length - 1}
                        className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteField(f._id)}
                        className="rounded-full border border-red-300 text-red-700 px-3 py-1 text-sm hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Field */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="text-lg font-semibold mb-3">Add Field</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Label" required>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                  value={fLabel}
                  onChange={(e) => setFLabel(e.target.value)}
                  placeholder="e.g., Gender"
                />
              </Field>
              <Field label="Key (optional)">
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                  value={fKey}
                  onChange={(e) => setFKey(e.target.value)}
                  placeholder="auto-from-label if empty (slug: a-z0-9-_ )"
                />
              </Field>

              <Field label="Type" required>
                <Select
                  options={FIELD_TYPES}
                  value={fType}
                  onChange={setFType}
                  placeholder="Select type"
                  styles={selectStyles}
                />
              </Field>

              <Field label="Required?">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fRequired}
                    onChange={(e) => setFRequired(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
              </Field>

              <Field label="Placeholder">
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                  value={fPlaceholder}
                  onChange={(e) => setFPlaceholder(e.target.value)}
                />
              </Field>

              <Field label="Help text">
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                  value={fHelp}
                  onChange={(e) => setFHelp(e.target.value)}
                />
              </Field>
            </div>

            {/* Type-specific config */}
            {fType?.value === "number" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Field label="Min">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                    value={fMin}
                    onChange={(e) => setFMin(e.target.value)}
                  />
                </Field>
                <Field label="Max">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                    value={fMax}
                    onChange={(e) => setFMax(e.target.value)}
                  />
                </Field>
              </div>
            )}

            {(fType?.value === "select" || fType?.value === "multiselect") && (
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Options</h4>
                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="rounded-full bg-[#8570EE] text-white px-3 py-1 text-sm font-semibold hover:opacity-90"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {fOptions.map((o, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <input
                        type="text"
                        className="md:col-span-2 rounded-xl border border-gray-300 px-3 py-2"
                        placeholder="Label"
                        value={o.label}
                        onChange={(e) => updateOption(i, "label", e.target.value)}
                      />
                      <input
                        type="text"
                        className="md:col-span-2 rounded-xl border border-gray-300 px-3 py-2"
                        placeholder="Value (slug)"
                        value={o.value}
                        onChange={(e) => updateOption(i, "value", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionRow(i)}
                        className="rounded-xl border border-red-300 text-red-700 px-3 py-2 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fType?.value === "destinations" && (
              <div className="mt-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fMultipleDest}
                    onChange={(e) => setFMultipleDest(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Allow multiple destinations</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  (This will render a destination picker later in LeadRequest.)
                </p>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={addField}
                disabled={!selectedCatId}
                className="rounded-full bg-[#16a34a] text-white px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      </div>
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
