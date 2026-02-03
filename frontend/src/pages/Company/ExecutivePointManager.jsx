// src/pages/company/ExecutivePointManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import { Pencil, X, User } from "lucide-react";
import { toast } from "react-toastify";

const THEME = "#8570EE";

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-end justify-between gap-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      {hint ? (
        <div className="text-[11px] text-slate-400 whitespace-nowrap">{hint}</div>
      ) : null}
    </div>
    {children}
  </div>
);

const baseInput =
  "w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 text-sm text-slate-900 outline-none " +
  "transition shadow-[0_1px_0_rgba(15,23,42,0.04)] placeholder:text-slate-400 " +
  "hover:border-slate-300 focus:border-[#8570EE]/45 focus:ring-4 focus:ring-[#8570EE]/15";

const baseSelect =
  "w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 text-sm text-slate-900 outline-none " +
  "transition shadow-[0_1px_0_rgba(15,23,42,0.04)] " +
  "hover:border-slate-300 focus:border-[#8570EE]/45 focus:ring-4 focus:ring-[#8570EE]/15";

const pillBtn =
  "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold transition active:scale-[0.99]";

function clampPct(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.min(100, Math.max(0, num));
}

export default function ExecutivePointManager() {
  const [mode, setMode] = useState("company"); // company | branch | franchisee
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [executiveSearch, setExecutiveSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [franchiseeSearch, setFranchiseeSearch] = useState("");

  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // row
  const [editForm, setEditForm] = useState({
    pointPercentage: 0,
    discountPercentage: 0,
  });

  const modeLabel = useMemo(() => {
    if (mode === "branch") return "Branch";
    if (mode === "franchisee") return "Franchisee";
    return "Company";
  }, [mode]);

  const fetchExecutives = async () => {
    try {
      setLoading(true);

      const params = {
        mode,
        page,
        limit,
        executiveSearch,
        branchSearch: mode === "branch" ? branchSearch : "",
        franchiseeSearch: mode === "franchisee" ? franchiseeSearch : "",
      };

      const { data } = await API.get("/company/executives", { params });

      setRows(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to load executives");
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutives();
    // eslint-disable-next-line
  }, [mode, page, executiveSearch, branchSearch, franchiseeSearch]);

  useEffect(() => {
    setPage(1);
  }, [mode]);

  const openEdit = (row) => {
    setEditing(row);
    setEditForm({
      pointPercentage: clampPct(row.pointPercentage ?? 0),
      discountPercentage: clampPct(row.discountPercentage ?? 0),
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const saveEdit = async () => {
    if (!editing?._id) return;

    const pointPercentage = clampPct(editForm.pointPercentage);
    const discountPercentage = clampPct(editForm.discountPercentage);

    try {
      setSaving(true);
      await API.put(`/company/executives/${editing._id}/incentives`, {
        pointPercentage,
        discountPercentage,
      });

      toast.success("Updated incentives");

      // refresh list
      await fetchExecutives();
      closeEdit();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto mt-6 mb-10 px-3 sm:px-4">
      <div
        className="
          relative
          w-full rounded-3xl overflow-hidden
          border border-slate-200/70
          bg-white
          shadow-[0_24px_70px_rgba(15,23,42,0.12)]
        "
      >
        {/* ✅ Blue glows (top-right + bottom-left) */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-[340px] w-[340px] rounded-full bg-[#8570EE]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[340px] w-[340px] rounded-full bg-[#8570EE]/20 blur-[120px]" />

        {/* Premium ribbon */}
        <div
          className="h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
        />

        <div className="p-6 md:p-8 space-y-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Company
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
                Executive Percentage Management
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Filter executives and assign <span className="font-semibold">Point %</span> and{" "}
                <span className="font-semibold">Discount %</span>.
              </div>
            </div>

            <div
              className="
                h-11 px-4 rounded-2xl
                flex items-center
                border
                bg-white/70
                shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]
                backdrop-blur
                text-sm font-semibold
              "
              style={{ color: THEME, borderColor: `${THEME}26` }}
            >
              {modeLabel} Mode
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-[28px] border border-slate-200/70 bg-white overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Filters
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                Search executives
              </div>
            </div>

            <div className="p-5 md:p-6 bg-gradient-to-b from-white via-white to-purple-50/40 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Field label="Mode">
                  <select
                    className={baseSelect}
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="company">Company</option>
                    <option value="branch">Branch</option>
                    <option value="franchisee">Franchisee</option>
                  </select>
                </Field>

                {mode === "branch" && (
                  <Field label="Branch name" hint="Filter by branch">
                    <input
                      className={baseInput}
                      value={branchSearch}
                      onChange={(e) => {
                        setBranchSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by Branch Name"
                    />
                  </Field>
                )}

                {mode === "franchisee" && (
                  <Field label="Franchisee name" hint="Filter by franchisee">
                    <input
                      className={baseInput}
                      value={franchiseeSearch}
                      onChange={(e) => {
                        setFranchiseeSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by Franchisee Name"
                    />
                  </Field>
                )}

                <Field
                  label="Executive name"
                  hint={mode === "company" ? "Company executives" : "Also filters executive list"}
                >
                  <input
                    className={baseInput}
                    value={executiveSearch}
                    onChange={(e) => {
                      setExecutiveSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by Executive Name"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="rounded-[28px] border border-slate-200/70 bg-white overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/80 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  View
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">
                  Executives
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {mode === "branch"
                    ? "Showing executives under branch."
                    : mode === "franchisee"
                    ? "Showing executives under franchisee."
                    : "Showing company executives."}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Page{" "}
                <span
                  className="px-2 py-1 rounded-full border"
                  style={{
                    color: THEME,
                    borderColor: `${THEME}26`,
                    background: `${THEME}10`,
                  }}
                >
                  {page} / {totalPages}
                </span>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-700 min-w-[980px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <th className="px-6 py-4">Sl No</th>
                    <th className="px-6 py-4">Executive</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">{modeLabel} Name</th>
                    <th className="px-6 py-4">Point %</th>
                    <th className="px-6 py-4">Discount %</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-slate-600">
                        Loading…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-slate-500">
                        No executives found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => {
                      const isActive = row.status === "Active";
                      const avatar = row.profileImage;

                      return (
                        <tr
                          key={row._id}
                          className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                        >
                          <td className="px-6 py-4 font-semibold">
                            {(page - 1) * limit + idx + 1}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-2xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                                {avatar ? (
                                  <img
                                    src={avatar}
                                    alt={row.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-slate-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-900 truncate">
                                  {row.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {row.type}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">{row.email}</td>
                          <td className="px-6 py-4 font-semibold">{row.contactNumber}</td>
                          <td className="px-6 py-4 font-semibold">{row.entityName || "-"}</td>

                          <td className="px-6 py-4">
                            <span
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border"
                              style={{
                                borderColor: `${THEME}26`,
                                background: `${THEME}10`,
                                color: THEME,
                              }}
                            >
                              {Number(row.pointPercentage ?? 0)}%
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">
                              {Number(row.discountPercentage ?? 0)}%
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {isActive ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-600 border-slate-200">
                                Inactive
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              className="
                                inline-flex items-center justify-center
                                h-10 w-10 rounded-2xl
                                border border-slate-200
                                bg-white
                                shadow-sm
                                hover:shadow-md
                                hover:bg-slate-50
                                transition
                              "
                              onClick={() => openEdit(row)}
                              aria-label="Edit incentives"
                              title="Edit incentives"
                            >
                              <Pencil className="w-4 h-4 text-slate-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="py-4 px-4 flex items-center justify-end gap-2 bg-white border-t border-slate-200">
                {Array.from({ length: totalPages }, (_, i) => {
                  const isActive = page === i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={[
                        "h-9 min-w-[36px] px-3 rounded-2xl text-sm font-semibold border transition",
                        isActive
                          ? "text-white shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                      ].join(" ")}
                      style={
                        isActive
                          ? { backgroundColor: THEME, borderColor: THEME }
                          : undefined
                      }
                      type="button"
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeEdit}
            />
            <div
              className="
                relative z-10 w-full max-w-xl mx-3
                rounded-[28px]
                border border-white/25
                shadow-[0_30px_90px_rgba(15,23,42,0.55)]
                bg-white/92 backdrop-blur-2xl
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
              />

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Edit
                    </div>
                    <div className="mt-1 text-xl font-extrabold text-slate-900 truncate">
                      {editing?.name || "Executive"}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {editing?.entityName ? (
                        <>
                          <span className="font-semibold">{editing.type}</span> •{" "}
                          <span className="font-semibold">{editing.entityName}</span>
                        </>
                      ) : (
                        <span className="font-semibold">{editing?.type}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeEdit}
                    className="p-2 rounded-2xl hover:bg-slate-100 transition"
                    aria-label="Close"
                  >
                    <X size={18} className="text-slate-600" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Point percentage" hint="0 - 100">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.pointPercentage}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, pointPercentage: e.target.value }))
                      }
                      className={baseInput}
                      placeholder="e.g. 5"
                    />
                  </Field>

                  <Field label="Discount percentage" hint="0 - 100">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.discountPercentage}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, discountPercentage: e.target.value }))
                      }
                      className={baseInput}
                      placeholder="e.g. 10"
                    />
                  </Field>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className={`${pillBtn} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={saving}
                    className={`${pillBtn} text-white shadow-[0_18px_45px_rgba(133,112,238,0.35)] hover:opacity-95 disabled:opacity-60`}
                    style={{ backgroundColor: THEME }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Note: Percentages are clamped between 0 and 100.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
