
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function LeadRequest() {
  // table state
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters
  const [filterSalesManagerText, setFilterSalesManagerText] = useState("");
  const [filterFrequency, setFilterFrequency] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // inline decision panel
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  // DM + Creative + overrides
  const [dmOptions, setDmOptions] = useState([]);
  const [csOptions, setCsOptions] = useState([]); // NEW
  const [assignDm, setAssignDm] = useState(null);
  const [assignCs, setAssignCs] = useState(null); // NEW
  const [overrideStartDate, setOverrideStartDate] = useState("");
  const [overrideEndDate, setOverrideEndDate] = useState("");
  const [overrideQty, setOverrideQty] = useState("");
  const [overrideFreq, setOverrideFreq] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // NEW meta/messages
  const [campaignName, setCampaignName] = useState(""); // NEW
  const [msgDM, setMsgDM] = useState(""); // NEW
  const [msgCS, setMsgCS] = useState(""); // NEW
  const [updationReason, setUpdationReason] = useState(""); // NEW

  // ---------- NEW: Ad Category + dynamic fields ----------
  const [adCatOptions, setAdCatOptions] = useState([]); // [{value,label}]
  const [adCat, setAdCat] = useState(null); // {value,label}
  const [adCatFields, setAdCatFields] = useState([]); // fields def from server
  const [adForm, setAdForm] = useState({}); // key -> value
  const [destOptions, setDestOptions] = useState([]); // for "destinations" field type

  const frequencyOptions = useMemo(
    () => [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ],
    []
  );
  const statusOptions = [
    { value: "processing", label: "Processing" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

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

  const pad = (n) => String(n).padStart(2, "0");
  const formatDMY = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const isBlank = (s) => !s || !String(s).trim();
  const isValidISODate = (s) => {
    if (isBlank(s)) return false;
    const d = new Date(s);
    return !Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(s);
  };
  const isPositiveInt = (v) => {
    if (isBlank(v)) return false;
    const n = Number(v);
    return Number.isInteger(n) && n > 0;
  };

  const fetchDMs = async () => {
    try {
      const res = await API.get("/marketingManager/digital-marketers");
      setDmOptions(res.data || []);
    } catch {
      toast.error("Failed to load digital marketers");
    }
  };
  const fetchCS = async () => {
    try {
      const res = await API.get("/marketingManager/creative-staff");
      setCsOptions(res.data || []);
    } catch {
      toast.error("Failed to load creative staff");
    }
  };

  const fetchAdCategories = async () => {
    try {
      const res = await API.get("/marketingManager/ad-categories-leadside");
      setAdCatOptions(res.data || []);
    } catch {
      toast.error("Failed to load ad categories");
    }
  };
  const fetchAdCategoryFields = async (categoryId) => {
    if (!categoryId) return;
    try {
      const res = await API.get(`/marketingManager/ad-categories-leadside/${categoryId}`);
      const { fields = [] } = res.data || {};
      const sorted = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0));
      setAdCatFields(sorted);

      // initialize defaults
      const init = {};
      sorted.forEach((f) => {
        if (f?.config?.defaultValue !== undefined) {
          init[f.key] = f.config.defaultValue;
        }
      });
      setAdForm((prev) => ({ ...init, ...prev }));
    } catch {
      toast.error("Failed to load category fields");
    }
  };
  const fetchDestinations = async () => {
    try {
      // Expecting: [{value: 'destId', label:'Bali'}, ...]
      const res = await API.get("/marketingManager/destinations");
      setDestOptions(res.data || []);
    } catch {
      setDestOptions([]);
    }
  };

  const fetchList = async (nextPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");
      if (filterSalesManagerText.trim())
        params.set("salesManagerText", filterSalesManagerText.trim());
      if (filterFrequency?.value) params.set("frequency", filterFrequency.value);
      if (filterStatus?.value) params.set("status", filterStatus.value);
      if (filterStartDate) params.set("startDate", filterStartDate);
      if (filterEndDate) params.set("endDate", filterEndDate);

      const res = await API.get(`/marketingManager/lead-requests?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch {
      toast.error("Failed to load lead requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    fetchDMs();
    fetchCS();
    fetchAdCategories(); // NEW
    fetchDestinations(); // NEW
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSalesManagerText, filterFrequency, filterStatus, filterStartDate, filterEndDate]);

  const handlePrev = () => page > 1 && fetchList(page - 1);
  const handleNext = () => page < totalPages && fetchList(page + 1);

  const openPanel = async (id) => {
    setOpenId(id);
    setPanelLoading(true);
    setDetail(null);
    setAssignDm(null);
    setAssignCs(null);
    setOverrideStartDate("");
    setOverrideEndDate("");
    setOverrideQty("");
    setOverrideFreq(null);
    setRejectReason("");
    setCampaignName("");
    setMsgDM("");
    setMsgCS("");
    setUpdationReason("");
    // NEW
    setAdCat(null);
    setAdCatFields([]);
    setAdForm({});

    try {
      const res = await API.get(`/marketingManager/lead-requests/${id}`);
      const d = res.data;
      setDetail(d);

      if (d.assignedDigitalMarketerId) {
        const opt =
          dmOptions.find((o) => o.value === d.assignedDigitalMarketerId) || {
            value: d.assignedDigitalMarketerId,
            label: d.assignedDigitalMarketerName,
          };
        setAssignDm(opt);
      }
      if (d.assignedCreativeStaffId) {
        const opt =
          csOptions.find((o) => o.value === d.assignedCreativeStaffId) || {
            value: d.assignedCreativeStaffId,
            label: d.assignedCreativeStaffName,
          };
        setAssignCs(opt);
      }
      if (d.approvedStartDate) setOverrideStartDate(String(d.approvedStartDate).slice(0, 10));
      if (d.approvedEndDate) setOverrideEndDate(String(d.approvedEndDate).slice(0, 10));
      if (d.approvedQuantity) setOverrideQty(String(d.approvedQuantity));
      if (d.approvedFrequency) {
        const f = frequencyOptions.find((x) => x.value === d.approvedFrequency);
        if (f) setOverrideFreq(f);
      }
      // setCampaignName(d.campaignName || "");
      const cleanTourName = d.tourRef || d.tourName || "";
      setCampaignName(d.campaignName || cleanTourName);
      setMsgDM(d.messageForDigitalMarketer || "");
      setMsgCS(d.messageForCreativeStaff || "");
      setUpdationReason(d.updationReason || "");

      // ---------- NEW: Prefill Ad Category + Ad Data ----------
      if (d.adCategoryId) {
        const catOpt =
          (adCatOptions || []).find((o) => o.value === d.adCategoryId) ||
          { value: d.adCategoryId, label: d.adCategoryName || "Selected Category" };
        setAdCat(catOpt);
        await fetchAdCategoryFields(d.adCategoryId);
      }
      if (d.adData) {
        setAdForm((prev) => ({ ...prev, ...d.adData }));
      }
    } catch {
      toast.error("Failed to load details");
    } finally {
      setPanelLoading(false);
    }
  };

  const closePanel = () => {
    setOpenId(null);
    setDetail(null);
    setAssignDm(null);
    setAssignCs(null);
    setOverrideStartDate("");
    setOverrideEndDate("");
    setOverrideQty("");
    setOverrideFreq(null);
    setRejectReason("");
    setCampaignName("");
    setMsgDM("");
    setMsgCS("");
    setUpdationReason("");
    // NEW
    setAdCat(null);
    setAdCatFields([]);
    setAdForm({});
  };

  // ---------- NEW: handle Ad Category change ----------
  const onChangeAdCat = async (opt) => {
    setAdCat(opt);
    setAdCatFields([]);
    setAdForm({});
    if (opt?.value) await fetchAdCategoryFields(opt.value);
  };

  // ---------- NEW: dynamic field helpers ----------
  const setAdField = (key, value) => setAdForm((prev) => ({ ...prev, [key]: value }));

  const validateAdFormForUI = () => {
    const errors = [];
    if (!adCat?.value) {
      errors.push("Select an Ad Category.");
    }
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
        try {
          // basic url validation
          // eslint-disable-next-line no-new
          new URL(String(val));
        } catch {
          errors.push(`"${f.label}" must be a valid URL`);
        }
      }
    });
    return errors;
  };

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
              rows={1}
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

      case "checkbox":
        return (
          <label key={f._id} className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={!!adForm[f.key]}
              onChange={(e) => setAdField(f.key, e.target.checked)}
            />
            <span className="text-sm text-[#222]">{f.label}</span>
            {f.config?.helpText && <p className="text-xs text-gray-500 ml-2">{f.config.helpText}</p>}
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
        if (f.config?.multiple) {
          const chosen = destOptions.filter(
            (o) => Array.isArray(adForm[f.key]) && adForm[f.key].includes(o.value)
          );
          return (
            <label key={f._id} className="block">
              {Label}
              <Select
                options={destOptions}
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
        const chosen = destOptions.find((o) => o.value === adForm[f.key]) || null;
        return (
          <label key={f._id} className="block">
            {Label}
            <Select
              options={destOptions}
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
const computedCampaignName =
  !isBlank(campaignName) ? campaignName : (detail?.tourRef || detail?.tourName || "");
  const approve = async () => {
    if (!detail?._id) return;

    // REQUIRED: Digital Marketer
    if (!assignDm?.value) {
      toast.error("Select a digital marketer");
      return;
    }

    // REQUIRED: Message for DM
    if (isBlank(msgDM)) {
      toast.error("Message for the digital marketer is required");
      return;
    }

    // CS message required when CS selected
    if (assignCs?.value && isBlank(msgCS)) {
      toast.error("Message for creative staff is required if staff is selected");
      return;
    }

    // Validate optional overrides
    if (!isBlank(overrideStartDate) && !isValidISODate(overrideStartDate)) {
      toast.error("Allowed Start must be a valid date");
      return;
    }
    if (!isBlank(overrideEndDate) && !isValidISODate(overrideEndDate)) {
      toast.error("Allowed End must be a valid date");
      return;
    }
    if (!isBlank(overrideStartDate) && !isBlank(overrideEndDate)) {
      if (new Date(overrideEndDate) < new Date(overrideStartDate)) {
        toast.error("Allowed End cannot be earlier than Allowed Start");
        return;
      }
    }
    if (!isBlank(overrideQty) && !isPositiveInt(overrideQty)) {
      toast.error("Allowed Quantity must be a positive whole number");
      return;
    }

    // If any override -> updation reason required
    const providedOverride =
      !isBlank(overrideStartDate) ||
      !isBlank(overrideEndDate) ||
      !isBlank(overrideQty) ||
      !!overrideFreq?.value;
    if (providedOverride && isBlank(updationReason)) {
      toast.error("Updation Reason is required when any Allowed field is set");
      return;
    }

    // ---------- NEW: Validate Ad Category + fields ----------
    const adErrors = validateAdFormForUI();
    if (adErrors.length) {
      toast.error(adErrors[0]);
      return;
    }

    try {
      const payload = {
        digitalMarketerId: assignDm.value,
        creativeStaffId: assignCs?.value || undefined,
        startDate: !isBlank(overrideStartDate) ? overrideStartDate : undefined,
        endDate: !isBlank(overrideEndDate) ? overrideEndDate : undefined,
        quantity: !isBlank(overrideQty) ? Number(overrideQty) : undefined,
        frequency: overrideFreq?.value || undefined,
        // campaignName: !isBlank(campaignName) ? campaignName : undefined,
        campaignName: computedCampaignName || undefined,
        messageForDigitalMarketer: msgDM.trim(),
        messageForCreativeStaff: !isBlank(msgCS) ? msgCS.trim() : undefined,
        updationReason: !isBlank(updationReason) ? updationReason.trim() : undefined,

        // ---------- NEW ----------
        adCategoryId: adCat?.value,
        adData: adForm,
      };

      await API.post(`/marketingManager/lead-requests/${detail._id}/approve`, payload);
      toast.success("Approved");
      closePanel();
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to approve";
      toast.error(msg);
    }
  };

  const reject = async () => {
    if (!detail?._id) return;

    if (isBlank(rejectReason)) {
      toast.error("Rejection reason is mandatory");
      return;
    }

    try {
      await API.post(`/marketingManager/lead-requests/${detail._id}/reject`, {
        reason: rejectReason.trim(),
        updationReason: !isBlank(updationReason) ? updationReason.trim() : undefined,
      });
      toast.success("Rejected");
      closePanel();
      fetchList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to reject";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#222]">Lead Requests — Marketing</h2>

      {/* ---------- INLINE DECISION PANEL ---------- */}
      {openId && (
        <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Review & Decide</h3>
            <button
              onClick={closePanel}
              className="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-50"
              title="Close"
            >
              ✕
            </button>
          </div>

          {panelLoading || !detail ? (
            <p className="text-gray-500">Loading…</p>
          ) : (
            <>
              {/* Row 1: Destination / Tour */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Destination">
                  <input
                    type="text"
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                    value={detail.destinationName || "—"}
                  />
                </Field>
                <Field label="Tour (Group or Fixed)">
                  <input
                    type="text"
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                    value={detail.tourRef || "—"}
                  />
                </Field>
              </div>

              {/* Row 2: Dates (original vs allowed) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Start Date">
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                      value={formatDMY(detail.startDate)}
                    />
                  </Field>
                  <Field label="Allowed Start Date (optional)">
                    <input
                      type="date"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                      value={overrideStartDate}
                      onChange={(e) => setOverrideStartDate(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="End Date">
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                      value={formatDMY(detail.endDate)}
                    />
                  </Field>
                  <Field label="Allowed End Date (optional)">
                    <input
                      type="date"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                      value={overrideEndDate}
                      onChange={(e) => setOverrideEndDate(e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* Row 3: Qty / Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Quantity">
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                      value={detail.quantity ?? "—"}
                    />
                  </Field>
                  <Field label="Allowed Quantity (optional)">
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                      value={overrideQty}
                      onChange={(e) => setOverrideQty(e.target.value)}
                      placeholder="e.g., 25"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Frequency">
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
                      value={detail.frequency || "—"}
                    />
                  </Field>
                  <Field label="Allowed Frequency (optional)">
                    <Select
                      options={frequencyOptions}
                      value={overrideFreq}
                      onChange={setOverrideFreq}
                      isClearable
                      placeholder="Same as requested"
                      styles={selectStyles}
                    />
                  </Field>
                </div>
              </div>

              {/* Sales Manager & Unit */}
              <p className="text-sm text-gray-700 mt-3">
                <b>Requested by:</b> {detail?.salesManagerName || "—"} &nbsp;•&nbsp;
                <b>Unit:</b> {detail?.salesManagerUnitType || "—"} &nbsp;•&nbsp;
                <b>Unit Name:</b> {detail?.salesManagerUnitName || "—"}
              </p>

              {/* ---------- NEW: Ad Category + Dynamic Fields ---------- */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Ad Category" required>
                  <Select
                    options={adCatOptions}
                    value={adCat}
                    onChange={onChangeAdCat}
                    placeholder="Select category (e.g., Meta Ads)"
                    styles={selectStyles}
                  />
                </Field>

                {/* <Field label="Campaign Name">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Summer Splash 2025"
                  />
                </Field> */}
                <Field label="Campaign Name (auto)">
  <input
    type="text"
    readOnly
    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
    value={campaignName}
    placeholder="Auto from Tour"
    title="Auto-filled from selected tour and cannot be edited"
  />
</Field>


                <div className="hidden md:block" />
              </div>

              {adCat && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adCatFields.length === 0 ? (
                    <p className="text-sm text-gray-500">No fields in this category.</p>
                  ) : (
                    adCatFields.map((f) => (
                      <div key={f._id} className="">{renderAdField(f)}</div>
                    ))
                  )}
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {/* Row 6: Messages (DM + Creative) */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

              

              {/* Row 7: Rejection + Updation Reasons */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Rejection Reason (only if rejecting)">
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this request is rejected"
                  />
                </Field>

                <Field label="Updation Reason">
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y"
                    value={updationReason}
                    onChange={(e) => setUpdationReason(e.target.value)}
                    placeholder="Describe what/why was updated"
                  />
                </Field>
              </div>

              {/* Actions */}
              {(() => {
                const isFinalized = detail?.status === "approved" || detail?.status === "rejected";
                return (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={approve}
                      disabled={isFinalized}
                      className="inline-flex items-center justify-center rounded-full bg-[#16a34a] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                    <button
                      onClick={reject}
                      disabled={isFinalized}
                      className="inline-flex items-center justify-center rounded-full bg-[#dc2626] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                );
              })()}

              {detail.status !== "processing" && (
                <p className="text-sm text-gray-600 mt-3">
                  <b>Status:</b> {detail.status}
                  {detail.status === "rejected" && detail.rejectionReason
                    ? ` — ${detail.rejectionReason}`
                    : ""}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ---------- FILTERS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Field label="Sales Manager (name/email)">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            placeholder="e.g., Priya / priya@..."
            value={filterSalesManagerText}
            onChange={(e) => setFilterSalesManagerText(e.target.value)}
          />
        </Field>

        <Field label="Frequency">
          <Select
            options={frequencyOptions}
            value={filterFrequency}
            onChange={setFilterFrequency}
            isClearable
            placeholder="All frequencies"
            styles={selectStyles}
          />
        </Field>

        <Field label="Status">
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            isClearable
            placeholder="All statuses"
            styles={selectStyles}
          />
        </Field>

        <Field label="Start Date">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </Field>

        <Field label="End Date">
          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </Field>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Sales Manager (Unit)</Th>
              <Th>Destination</Th>
              <Th>Tour</Th>
              <Th>Start Date</Th>
              <Th>Allowed Start Date</Th>
              <Th>End Date</Th>
              <Th>Allowed End Date</Th>
              <Th>Quantity</Th>
              <Th>Allowed Quantity</Th>
              <Th>Frequency</Th>
              <Th>Allowed Frequency</Th>
              <Th>Status</Th>
              <Th>{/* actions */}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={13}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={13}>
                  No requests.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <Td>
                    {r.salesManagerName || "—"}
                    {r.salesManagerUnitName ? ` — ${r.salesManagerUnitName}` : ""}
                  </Td>
                  <Td>{r.destinationName || "—"}</Td>
                  <Td>{r.tourRef || "—"}</Td>
                  <Td>{formatDMY(r.startDate)}</Td>
                  <Td>{r.approvedStartDate ? formatDMY(r.approvedStartDate) : "—"}</Td>
                  <Td>{formatDMY(r.endDate)}</Td>
                  <Td>{r.approvedEndDate ? formatDMY(r.approvedEndDate) : "—"}</Td>
                  <Td>{r.quantity}</Td>
                  <Td>{r.approvedQuantity ?? "—"}</Td>
                  <Td>{r.frequency ?? "—"}</Td>
                  <Td>{r.approvedFrequency ?? "—"}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        r.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : r.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => openPanel(r._id)}
                      title="Details / Decide"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
                    >
                      +
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- PAGINATION ---------- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> •{" "}
          <span className="font-semibold">{total}</span> total
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={page <= 1 || loading}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={page >= totalPages || loading}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- small primitives ---------- */
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
function Th({ children }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
      {children}
    </th>
  );
}
function Td({ children }) {
  return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
}
