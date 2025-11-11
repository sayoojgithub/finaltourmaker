// src/pages/company/PincodeManager.jsx
import React, { useEffect, useState } from "react";
import API from "../../api";
import { X, ArrowLeft, PlusCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

const parseSixDigit = (str) => {
  const parts = String(str || "").split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
  const unique = Array.from(new Set(parts));
  const valid = unique.filter(p => /^\d{6}$/.test(p));
  const invalid = unique.filter(p => !/^\d{6}$/.test(p));
  return { valid, invalid };
};

export default function PincodeManager({ target, onBack }) {
  const { type, id, name } = target;
  const [loading, setLoading] = useState(true);
  const [pincodes, setPincodes] = useState([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // NEW: conflict modal state
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  const base = `/company/${type}/${id}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(base);
      setPincodes(data.assignedPincodes || []);
    } catch (e) {
      console.error(e?.response?.data || e);
      toast.error(e?.response?.data?.message || "Failed to load pincodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [id, type]);

  const assign = async () => {
    const { valid, invalid } = parseSixDigit(input);
    if (invalid.length) {
      toast.error(`Invalid pincodes: ${invalid.join(", ")}`);
      return;
    }
    if (!valid.length) {
      toast.error("Enter at least one 6-digit pincode");
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await API.post(`${base}/assign`, { pincodes: valid });
      setPincodes(data.assignedPincodes || []);
      setInput("");
      toast.success("Pincodes assigned");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to assign";
      toast.error(msg);
      const c = e?.response?.data?.conflicts;
      if (Array.isArray(c) && c.length) {
        setConflicts(c);
        setConflictOpen(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (pin) => {
    try {
      const { data } = await API.post(`${base}/remove`, { pincodes: [pin] });
      setPincodes(data.assignedPincodes || []);
      toast.success("Removed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove");
    }
  };

  // Glass chip style
  const chipCls =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full border " +
    "backdrop-blur-md bg-white/30 border-white/50 " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_rgba(133,112,238,0.15)] " +
    "text-gray-800";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-[0.5px] border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h3 className="text-lg font-bold">
          Pincode Management — {type === "branch" ? "Branch" : "Franchisee"}: {name}
        </h3>
      </div>

      {/* Assign form */}
      <div className="flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter pincode(s), e.g. 673001, 673002"
          className="w-full border-[0.5px] border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8570EE]"
        />
        <button
          onClick={assign}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#8570EE] text-white hover:opacity-90 disabled:opacity-60"
        >
          <PlusCircle size={18} /> Assign
        </button>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <AlertTriangle size={14} />
        <span>Only 6-digit pincodes. Duplicates within the company are not allowed.</span>
      </div>

      {/* Assigned list */}
      <div className="border-[0.5px] border-gray-300 rounded-2xl p-4">
        <div className="font-semibold mb-3">Assigned pincodes</div>
        {loading ? (
          <div>Loading…</div>
        ) : pincodes.length === 0 ? (
          <div className="text-gray-600">No pincodes assigned</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pincodes.map((pin) => (
              <span key={pin} className={chipCls}>
                <span className="font-semibold">{pin}</span>
                <button
                  className="p-1 rounded-full transition hover:bg-white/50"
                  onClick={() => remove(pin)}
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Warning Popup (Modal) */}
      {conflictOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConflictOpen(false)}
          />
          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AlertTriangle className="text-amber-500" size={22} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">Pincodes already assigned</h4>
                <p className="text-sm text-gray-600 mt-1">
                  The following pincodes are already assigned within your company:
                </p>

                <div className="mt-4 max-h-60 overflow-auto border-[0.5px] border-gray-300 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-3 py-2">Pincode</th>
                        <th className="px-3 py-2">Assigned To</th>
                        <th className="px-3 py-2">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conflicts.map((c, i) => (
                        <tr key={`${c.pincode}-${c.id}-${i}`} className="border-t">
                          <td className="px-3 py-2 font-semibold">{c.pincode}</td>
                          <td className="px-3 py-2">{c.name}</td>
                          <td className="px-3 py-2 capitalize">{c.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setConflictOpen(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-[0.5px] border-gray-300 hover:bg-gray-50 "
                  >
                    <X size={14} /> Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
