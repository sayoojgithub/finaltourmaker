import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import API from "../../api";
import { toast } from "react-toastify";

export default function AdRequest() {
  // Option lists
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Selected values
  const [country, setCountry] = useState(null);
  const [stateOpt, setStateOpt] = useState(null);
  const [destination, setDestination] = useState(null);

  // Other fields
  const [task, setTask] = useState(null);
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [details, setDetails] = useState("");

  // Prefill meta
  const [prefillId, setPrefillId] = useState(null);
  const [prefillActive, setPrefillActive] = useState(false);

  // Who triggered the chain? 'user' | 'prefill' | null
  const [changeSource, setChangeSource] = useState(null);

  // Decision/approval info from the selected request
  const [decisionMeta, setDecisionMeta] = useState(null);

  // Table data
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingTable, setLoadingTable] = useState(false);

  // Filters
  const [filterDestination, setFilterDestination] = useState(null);
  const [filterTask, setFilterTask] = useState(null);
  const [filterDate, setFilterDate] = useState("");

  // Loading flags
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  // Lock the form when prefilled
  const isLocked = prefillActive || !!prefillId;

  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderRadius: 12,
        borderColor: state.isFocused ? "#8570EE" : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(133,112,238,0.2)" : "none",
        minHeight: 44,
        backgroundColor: "white",
        opacity: 1,
        cursor: state.isDisabled ? "not-allowed" : "default",
        ":hover": { borderColor: state.isFocused ? "#8570EE" : "#d1d5db" },
      }),
      valueContainer: (base) => ({ ...base, padding: "0 12px" }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
        color: "#111827",
      }),
      indicatorsContainer: (base) => ({
        ...base,
        paddingRight: 8,
        opacity: 1,
      }),
      indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: "#e5e7eb",
        opacity: 1,
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "#6b7280",
        opacity: 1,
        ":hover": { color: "#4b5563" },
      }),
      menu: (base) => ({ ...base, borderRadius: 12, overflow: "hidden" }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
          ? "rgba(133,112,238,0.08)"
          : state.isSelected
          ? "rgba(133,112,238,0.16)"
          : "white",
        color: "#222",
        ":active": { backgroundColor: "rgba(133,112,238,0.16)" },
      }),
      placeholder: (base) => ({
        ...base,
        color: "#6b7280",
        opacity: 1,
      }),
      singleValue: (base) => ({
        ...base,
        color: "#111827",
        opacity: 1,
      }),
    }),
    []
  );

  const taskOptions = [
    { value: "Poster", label: "Poster" },
    { value: "Reel", label: "Reel" },
    { value: "Video", label: "Video" },
    { value: "Review", label: "Review" },
    { value: "Staff Performance", label: "Staff Performance" },
  ];

  // Util
  const pad = (n) => String(n).padStart(2, "0");
  const formatDMY = (value) => {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, day] = value.split("-");
        return `${pad(Number(day))}/${pad(Number(m))}/${y}`;
      }
      return "—";
    }
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  // Imperative loaders
  const loadStatesFor = async (countryId, ensureOpt) => {
    setLoadingStates(true);
    try {
      const res = await API.get(`/salesManager/states/${encodeURIComponent(countryId)}`);
      let opts = (res.data || []).map((s) => ({ value: s._id, label: s.name }));
      if (ensureOpt && !opts.find((o) => o.value === ensureOpt.value)) {
        opts = [...opts, ensureOpt];
      }
      setStates(opts);
      return opts;
    } finally {
      setLoadingStates(false);
    }
  };

  const loadDestinationsFor = async (countryId, stateId, ensureOpt) => {
    setLoadingDestinations(true);
    try {
      const url = `/salesManager/destinations/${encodeURIComponent(
        countryId
      )}/${encodeURIComponent(stateId)}`;
    const res = await API.get(url);
      let opts = (res.data || []).map((d) => ({ value: d._id, label: d.name }));
      if (ensureOpt && !opts.find((o) => o.value === ensureOpt.value)) {
        opts = [...opts, ensureOpt];
      }
      setDestinations(opts);
      return opts;
    } finally {
      setLoadingDestinations(false);
    }
  };

  // Countries on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCountries(true);
        const res = await API.get("/salesManager/countries");
        const opts = (res.data || []).map((c) => ({ value: c._id, label: c.name }));
        if (alive) setCountries(opts);
      } catch {
        toast.error("Failed to load countries");
      } finally {
        if (alive) setLoadingCountries(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Country effect — only clear if USER changed country
  useEffect(() => {
    if (!country) {
      setStates([]);
      setStateOpt(null);
      setDestinations([]);
      setDestination(null);
      return;
    }
    if (changeSource !== "user") return;

    let alive = true;
    (async () => {
      try {
        setLoadingStates(true);
        const res = await API.get(`/salesManager/states/${encodeURIComponent(country.value)}`);
        if (!alive) return;
        const opts = (res.data || []).map((s) => ({ value: s._id, label: s.name }));
        setStates(opts);
        setStateOpt(null);
        setDestinations([]);
        setDestination(null);
      } catch {
        if (alive) toast.error("Failed to load states");
      } finally {
        if (alive) setLoadingStates(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, changeSource]);

  // State effect — only reload destinations if USER changed state
  useEffect(() => {
    if (!country || !stateOpt) {
      setDestinations([]);
      setDestination(null);
      return;
    }
    if (changeSource !== "user") return;

    let alive = true;
    (async () => {
      try {
        setLoadingDestinations(true);
        const url = `/salesManager/destinations/${encodeURIComponent(
          country.value
        )}/${encodeURIComponent(stateOpt.value)}`;
        const res = await API.get(url);
        if (!alive) return;
        const opts = (res.data || []).map((d) => ({ value: d._id, label: d.name }));
        setDestinations(opts);
        setDestination(null);
      } catch {
        if (alive) toast.error("Failed to load destinations");
      } finally {
        if (alive) setLoadingDestinations(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateOpt, country, changeSource]);

  // Submit
  const onSubmit = async (e) => {
    e.preventDefault();
    // SAFEGUARD: never submit while prefilled/locked
    if (isLocked) return;

    try {
      const payload = {
        countryId: country?.value,
        stateId: stateOpt?.value,
        destinationId: destination?.value,
        task: task?.value,
        date,
        quantity,
        details,
      };
      await API.post("/salesManager/ad-requests", payload);
      toast.success("Ad request submitted successfully!");
      clearPrefillAndForm();
      setPage(1);
      await fetchRequests(1, filterDestination, filterTask, filterDate);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
    }
  };

  // Clear only the form; no API calls, no filter/table changes
  const clearPrefillAndForm = () => {
    setPrefillId(null);
    setPrefillActive(false);
    setChangeSource(null);
    setDecisionMeta(null);

    // just clear form fields
    setCountry(null);
    setStateOpt(null);
    setDestination(null);
    setTask(null);
    setDate("");
    setQuantity(1);
    setDetails("");
    setFilterDestination(null);
  };

  // EXTRA SAFEGUARD: prevent default submit from Clear Prefill clicks/bubbling
  const handleClearPrefillClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearPrefillAndForm();
  };

  // Table load
  const fetchRequests = async (
    nextPage = page,
    fDestination = filterDestination,
    fTask = filterTask,
    fDate = filterDate
  ) => {
    try {
      setLoadingTable(true);
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "7");
      if (fDestination?.value) params.set("destinationId", fDestination.value);
      if (fTask?.value) params.set("task", fTask.value);
      if (fDate) params.set("date", fDate);
      const res = await API.get(`/salesManager/ad-requests?${params.toString()}`);
      const { docs = [], page: p = 1, totalPages = 1, total = 0 } = res.data || {};
      setRows(docs);
      setPage(p);
      setTotalPages(totalPages);
      setTotal(total);
    } catch {
      toast.error("Failed to load ad requests");
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchRequests(1, null, null, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRequests(1, filterDestination, filterTask, filterDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDestination, filterTask, filterDate]);

  const handlePrev = () => page > 1 && fetchRequests(page - 1);
  const handleNext = () => page < totalPages && fetchRequests(page + 1);

  // Prefill
  const handlePrefill = async (id) => {
    try {
      if (prefillActive) return;
      setPrefillActive(true);
      setChangeSource("prefill");

      const res = await API.get(`/salesManager/ad-requests/${id}`);
      const r = res.data;
      if (!r || !r._id) {
        setPrefillActive(false);
        setChangeSource(null);
        toast.error("Could not load request details");
        return;
      }

      // Country
      const countryOptObj = { value: r.countryId, label: r.countryName };
      setCountries((prev) =>
        prev.find((c) => c.value === countryOptObj.value) ? prev : [...prev, countryOptObj]
      );
      setCountry(countryOptObj);

      // States
      const wantedState = { value: r.stateId, label: r.stateName };
      const stateList = await loadStatesFor(r.countryId, wantedState);
      const stateMatch = stateList.find((o) => o.value === wantedState.value) || wantedState;
      setStateOpt(stateMatch);

      // Destinations
      const wantedDest = { value: r.destinationId, label: r.destinationName };
      const destList = await loadDestinationsFor(r.countryId, r.stateId, wantedDest);
      const destMatch = destList.find((o) => o.value === wantedDest.value) || wantedDest;
      setDestination(destMatch);

      // Primitive fields
      const taskMatch = taskOptions.find((t) => t.value === r.task) || null;
      setTask(taskMatch);
      setDate(r.date ? r.date.slice(0, 10) : "");
      setQuantity(r.quantity || 1);
      setDetails(r.details || "");

      // Decision panel inputs
      setDecisionMeta({
        status: r.status, // 'approved' | 'rejected' | 'processing'
        requestedDate: r.date || null, // ISO
        requestedQuantity: r.quantity ?? null,
        approvedDate: r.approvedDate || null, // ISO or null
        approvedQuantity: r.approvedQuantity ?? null,
        rejectionReason: r.rejectionReason || "",
        updationReason: r.updationReason || "",
      });

      setPrefillId(r._id);
      toast.success("Prefilled from selected request");
    } catch {
      toast.error("Failed to prefill—try again");
    } finally {
      setPrefillActive(false);
      setChangeSource(null);
    }
  };

  // When user changes anything, mark source as 'user'
  const userChange = () => {
    setPrefillId(null);
    setChangeSource("user");
    setDecisionMeta(null); // decision panel only for prefilled requests
  };

  return (
    <div className="space-y-10">
      {/* ---------- CREATE FORM ---------- */}
      <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
        {/* Row 0: Country / State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Country" required>
            <Select
              options={countries}
              isLoading={loadingCountries}
              value={country}
              isDisabled={isLocked}
              onChange={(v) => {
                userChange();
                setCountry(v);
              }}
              placeholder={loadingCountries ? "Loading countries..." : "Select country"}
              styles={selectStyles}
              classNamePrefix="adreq-country"
            />
          </Field>

          <Field label="State" required>
            <Select
              options={states}
              isLoading={loadingStates}
              isDisabled={isLocked || !country || loadingCountries}
              value={stateOpt}
              onChange={(v) => {
                userChange();
                setStateOpt(v);
              }}
              placeholder={
                !country
                  ? "Select country first"
                  : loadingStates
                  ? "Loading states..."
                  : "Select state"
              }
              styles={selectStyles}
              classNamePrefix="adreq-state"
            />
          </Field>
        </div>

        {/* Row 1: Destination / Task */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Destination" required>
            <Select
              options={destinations}
              isLoading={loadingDestinations}
              isDisabled={
                isLocked || !country || !stateOpt || loadingStates || loadingCountries
              }
              value={destination}
              onChange={(v) => {
                userChange();
                setDestination(v);
              }}
              placeholder={
                !country
                  ? "Select country first"
                  : !stateOpt
                  ? "Select state first"
                  : loadingDestinations
                  ? "Loading destinations..."
                  : "Select destination"
              }
              styles={selectStyles}
              classNamePrefix="adreq-destination"
            />
          </Field>

          <Field label="Task" required>
            <Select
              options={taskOptions}
              value={task}
              isDisabled={isLocked}
              onChange={(v) => {
                userChange();
                setTask(v);
              }}
              placeholder="Select task"
              styles={selectStyles}
              classNamePrefix="adreq-task"
            />
          </Field>
        </div>

        {/* Row 2: Date / Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Publishing Date" required>
            <input
              type="date"
              disabled={isLocked}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
              value={date}
              onChange={(e) => {
                userChange();
                setDate(e.target.value);
              }}
            />
          </Field>

          <Field label="Quantity" required>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              disabled={isLocked}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
              value={quantity}
              onChange={(e) => {
                userChange();
                setQuantity(Number(e.target.value));
              }}
              placeholder="e.g., 10"
            />
          </Field>
        </div>

        {/* Row 3: Details */}
        <div>
          <Field label="Details">
            <textarea
              rows={4}
              disabled={isLocked}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE] resize-y disabled:opacity-100 disabled:bg-white disabled:text-gray-900 disabled:cursor-not-allowed"
              value={details}
              onChange={(e) => {
                userChange();
                setDetails(e.target.value);
              }}
              placeholder="Add any notes, links, or context…"
            />
          </Field>
        </div>

        {/* Decision Panel (visible only when a row is prefilled) */}
        {prefillId && decisionMeta && (
          <DecisionPanel meta={decisionMeta} formatDMY={formatDMY} />
        )}

        {/* Submit + Clear Prefill */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {isLocked ? (
            prefillId && (
              <button
                type="button"
                onClick={handleClearPrefillClick} // <-- prevent default + clear only
                className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] w-full"
              >
                Clear Prefill
              </button>
            )
          ) : (
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#8570EE] text-white px-6 py-3 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE] w-full"
            >
              Send for approval
            </button>
          )}
        </div>
      </form>

      {/* ---------- FILTERS + TABLE ---------- */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[#222]">My Ad Requests</h3>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Filter by Destination">
            <Select
              options={destinations}
              isDisabled={destinations.length === 0}
              value={filterDestination}
              onChange={setFilterDestination}
              isClearable
              placeholder={
                destinations.length === 0
                  ? "Select a country/state first"
                  : "All destinations"
              }
              styles={selectStyles}
              classNamePrefix="adreq-filter-destination"
            />
          </Field>

          <Field label="Filter by Task">
            <Select
              options={taskOptions}
              value={filterTask}
              onChange={setFilterTask}
              isClearable
              placeholder="All tasks"
              styles={selectStyles}
              classNamePrefix="adreq-filter-task"
            />
          </Field>

          <Field label="Filter by Publishing Date">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </Field>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Destination</Th>
                <Th>Task</Th>
                <Th>Publishing Date</Th>
                <Th>Requested Date</Th>
                <Th>Requested Time</Th>
                <Th>Status</Th>
                <Th>{/* actions */}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadingTable ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
                    No requests found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <Td>{r.destinationName || "—"}</Td>
                    <Td>{r.task}</Td>
                    <Td>{formatDMY(r.date)}</Td>
                    <Td>{formatDMY(r.requestedDate)}</Td>
                    <Td>{r.requestedTime || "—"}</Td>
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
                        onClick={() => handlePrefill(r._id)}
                        title="See more / Prefill form"
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span> •{" "}
            <span className="font-semibold">{total}</span> total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={page <= 1 || loadingTable}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page >= totalPages || loadingTable}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
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

function Th({ children }) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-6 py-4 text-sm text-gray-800">{children}</td>;
}

function DecisionPanel({ meta, formatDMY }) {
  const status = meta?.status || "processing";

  // compute effective values
  const effectiveQuantity =
    meta?.approvedQuantity != null ? meta.approvedQuantity : meta?.requestedQuantity ?? "—";

  const effectiveDateISO =
    meta?.approvedDate != null ? meta.approvedDate : meta?.requestedDate ?? null;

  const effectiveDate = effectiveDateISO ? formatDMY(effectiveDateISO) : "—";

  const badge =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge}`}
          >
            {status}
          </span>
          <span className="text-sm text-gray-600">
            {status === "approved"
              ? "Approved details"
              : status === "rejected"
              ? "Rejection details"
              : "Awaiting review"}
          </span>
        </div>
      </div>

      {status === "approved" && (
  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
      <div className="text-xs font-medium text-green-700">Approved Date</div>
      <div className="text-sm font-semibold text-green-900">{effectiveDate}</div>
      {meta?.approvedDate == null && (
        <div className="text-[11px] text-green-600">(same as requested)</div>
      )}
    </div>

    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
      <div className="text-xs font-medium text-green-700">Approved Quantity</div>
      <div className="text-sm font-semibold text-green-900">{effectiveQuantity}</div>
      {meta?.approvedQuantity == null && (
        <div className="text-[11px] text-green-600">(same as requested)</div>
      )}
    </div>
       {meta?.updationReason && (
     <div className="md:col-span-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
       <div className="text-xs font-medium text-indigo-700">Updation Reason</div>
       <div className="text-sm font-semibold text-indigo-900">{meta.updationReason}</div>
     </div>
   )}
  </div>
)}


      {status === "rejected" && (
        <div className="mt-3">
          <div className="text-sm text-gray-500">Rejection Reason</div>
          <div className="mt-1 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
            {meta?.rejectionReason || "No reason provided"}
          </div>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-3 text-sm text-gray-600">
          Your request is under review. Publishing Date:{" "}
          <span className="font-medium text-gray-900">{effectiveDate}</span> • Quantity:{" "}
          <span className="font-medium text-gray-900">{effectiveQuantity}</span>
        </div>
      )}
    </div>
  );
}
