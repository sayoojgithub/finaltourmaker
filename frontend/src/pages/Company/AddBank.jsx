// import React, { useEffect, useState } from "react";
// import { Pencil } from "lucide-react";
// import uploadImageToCloudinary from "../../utils/uploadCloudinary";
// import API from "../../api";
// import { toast } from "react-toastify";

// const AddBank = () => {
//   const [banks, setBanks] = useState([]);
//   const [qrPreview, setQrPreview] = useState(null);
//   const [qrLoading, setQrLoading] = useState(false);
//   const [editBankId, setEditBankId] = useState(null);
//   const [form, setForm] = useState({
//     bankName: "",
//     accountHolderName: "",
//     accountNumber: "",
//     ifscCode: "",
//     branch: "",
//     status: "Active",
//     qrCodeUrl: "",
//   });
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchBanks = async (pageNo = 1) => {
//     try {
//       const res = await API.get(`/company/getBankDetails?page=${pageNo}`);
//       setBanks(res.data.banks);
//       setTotalPages(res.data.totalPages);
//     } catch (err) {
//       console.error("Failed to fetch banks", err);
//     }
//   };

//   useEffect(() => {
//     fetchBanks(page);
//   }, [page]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };
//   const handleQRChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.size > 2 * 1024 * 1024) {
//       toast.error("File must be under 2MB");
//       return;
//     }

//     try {
//       setQrLoading(true);
//       const data = await uploadImageToCloudinary(file);
//       setForm((prev) => ({ ...prev, qrCodeUrl: data.secure_url }));
//       setQrPreview(data.secure_url);
//     } catch (err) {
//       toast.error("Failed to upload QR code");
//       console.error(err);
//     } finally {
//       setQrLoading(false);
//     }
//   };
//   console.log(form);

//   console.log(editBankId);
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//      const requiredFields = ["bankName",  "accountNumber", "ifscCode", "branch","accountHolderName"];
//   for (let field of requiredFields) {
//     if (!form[field]?.trim()) {
//       toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
//       return;
//     }
//   }
//     try {
//       const payload = { ...form };

//       if (editBankId) {
//         console.log("edit");
//         // 🔁 Update bank
//         await API.put(`/company/updateBankDetails/${editBankId}`, payload);
//       } else {
//         console.log("create");
//         // ➕ Add new bank
//         await API.post("/company/addBankDetails", payload);
//       }

//       setForm({
//         bankName: "",
//         accountHolderName: "",
//         accountNumber: "",
//         ifscCode: "",
//         branch: "",
//         status: "Active",
//         qrCodeUrl: "",
//       });
//       setQrPreview(null);
//       setEditBankId(null);
//       fetchBanks(page);
//     } catch (err) {
//       console.error("Failed to submit bank details", err);
//     }
//   };
//   const handleEdit = (bank) => {
//     setForm({
//       bankName: bank.bankName,
//       accountHolderName: bank.accountHolderName || "",
//       accountNumber: bank.accountNumber,
//       ifscCode: bank.ifscCode,
//       branch: bank.branch,
//       status: bank.status,
//       qrCodeUrl: bank.qrCodeUrl || "",
//     });
//     setQrPreview(bank.qrCodeUrl || null);
//     setEditBankId(bank._id);
//   };
//   const handleCancel = () => {
//   setForm({
//     bankName: "",
//     accountHolderName: "",
//     accountNumber: "",
//     ifscCode: "",
//     branch: "",
//     status: "Active",
//     qrCodeUrl: "",
//   });
//   setQrPreview(null);
//   setEditBankId(null);
// };

//   return (
//     <div>
//       <div className="w-full max-w-[100rem] bg-white rounded-3xl shadow p-6 mx-auto mt-6 mb-6">
//         <h2 className="text-xl font-semibold mb-6">Add bank details</h2>

//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//   {/* Other fields (Bank Name, Account Number, IFSC, Branch) */}
//   <input
//     type="text"
//     placeholder="Bank Name"
//     name="bankName"
//     value={form.bankName}
//     onChange={handleChange}
//     className="border-[0.5px] border-gray-300 rounded-md p-3 w-full"
//     disabled={!!editBankId}
//   />
//   <input
//     type="text"
//     placeholder="Account Number"
//     name="accountNumber"
//     value={form.accountNumber}
//     onChange={handleChange}
//     className="border-[0.5px] border-gray-300 rounded-md p-3 w-full"
//     disabled={!!editBankId}
//   />
//   <input
//     type="text"
//     placeholder="IFSC Code"
//     name="ifscCode"
//     value={form.ifscCode}
//     onChange={handleChange}
//     className="border-[0.5px] border-gray-300 rounded-md p-3 w-full"
//      disabled={!!editBankId}
//   />
//   <input
//     type="text"
//     placeholder="Branch"
//     name="branch"
//     value={form.branch}
//     onChange={handleChange}
//     className="border-[0.5px] border-gray-300 rounded-md p-3 w-full"
//      disabled={!!editBankId}
//   />

//   {/* QR Upload - Left Side */}
//   <div className="col-span-1">
//     <label className="block text-sm font-medium mb-2">Upload UPI QR Code</label>
//     <label
//       htmlFor="qr-upload"
//       className="flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
//     >
//       <div className="text-center">
//         {qrLoading ? (
//           <p className="text-sm text-purple-500">Uploading...</p>
//         ) : qrPreview ? (
//           <img
//             src={qrPreview}
//             alt="QR Preview"
//             className="h-20 object-contain mx-auto"
//           />
//         ) : (
//           <>
//             <svg
//               className="w-6 h-6 mx-auto text-[#8570EE]"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M12 4v16m8-8H4"
//               />
//             </svg>
//             <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
//           </>
//         )}
//       </div>
//       <input
//         id="qr-upload"
//         type="file"
//         accept="image/*"
//         onChange={handleQRChange}
//         className="hidden"
//       />
//     </label>
//     <div className="text-xs text-gray-500 mt-2 flex gap-2">
//       <span className="border px-2 py-0.5 rounded">JPG</span>
//       <span className="border px-2 py-0.5 rounded">PNG</span>
//       <span className="border px-2 py-0.5 rounded">{"> 2 MB"}</span>
//     </div>
//   </div>

//   {/* Account Holder Name, Status, Buttons - Right Side */}
//   <div className="col-span-1 flex flex-col justify-between h-full">
//     <input
//       type="text"
//       placeholder="Account Holder Name"
//       name="accountHolderName"
//       value={form.accountHolderName}
//       onChange={handleChange}
//       className="border-[0.5px] border-gray-300 rounded-md p-3 w-full mb-3"
//       disabled={!!editBankId}
//     />
//     <select
//       name="status"
//       value={form.status}
//       onChange={handleChange}
//       className="border-[0.5px] border-gray-300 rounded-md p-3 w-full mb-3"
//     >
//       <option>Active</option>
//       <option>Inactive</option>
//     </select>
//     <div className="flex justify-center gap-4 mt-2">
//       <button
//         type="submit"
//         style={{ backgroundColor: "#8570EE", color: "white" }}
//         className="px-6 py-2 rounded-md text-sm hover:opacity-90"
//       >
//         Submit
//       </button>
//       <button
//         type="button"
//         onClick={handleCancel}
//         style={{ borderColor: "#8570EE", color: "#8570EE" }}
//         className="border px-6 py-2 rounded-md text-sm hover:bg-purple-50"
//       >
//         Cancel
//       </button>
//     </div>
//   </div>
// </form>


//         {/* Table display section */}
//         <div className="max-w-[100rem] mx-auto mt-10 p-6 rounded-3xl shadow-md bg-white">
//           <div className="overflow-x-auto rounded-lg">
//             <table className="w-full text-sm text-left text-gray-700">
//               <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//                 <tr>
//                   <th className="px-6 py-4">Sl No</th>
//                   <th className="px-6 py-4">Bank Name</th>
//                   <th className="px-6 py-4">IFSC</th>
//                   <th className="px-6 py-4">Branch</th>
//                   <th className="px-6 py-4">Status</th>
//                   <th className="px-6 py-4 text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {banks.map((bank, idx) => (
//                   <tr key={bank._id} className="border-b hover:bg-gray-50">
//                     <td className="px-6 py-4">{(page - 1) * 2 + idx + 1}</td>
//                     <td className="px-6 py-4 font-semibold">{bank.bankName}</td>
//                     <td className="px-6 py-4">{bank.ifscCode}</td>
//                     <td className="px-6 py-4">{bank.branch}</td>
//                     <td className="px-6 py-4">
//                       {bank.status === "Active" ? (
//                         <span className="inline-flex items-center text-green-600 text-xs font-medium bg-green-100 rounded-full px-3 py-1">
//                           ● Active
//                         </span>
//                       ) : (
//                         <span className="inline-flex items-center text-gray-600 text-xs font-medium bg-gray-200 rounded-full px-3 py-1">
//                           ● Inactive
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <button
//                         className="text-gray-500 hover:text-gray-700"
//                         onClick={() => handleEdit(bank)}
//                       >
//                         <Pencil className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Pagination */}
//             <div className="flex justify-end items-center gap-1 mt-6 pr-2 text-sm text-gray-500">
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setPage(i + 1)}
//                   className={`px-3 py-1 rounded-full ${
//                     page === i + 1
//                       ? "bg-gray-900 text-white"
//                       : "hover:bg-gray-200"
//                   }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddBank;

import React, { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import API from "../../api";
import { toast } from "react-toastify";

/* ---------------- UI ONLY CONSTANTS ---------------- */
const THEME = "#8570EE";

const Field = ({ label, hint, children }) => (
  <div className="space-y-2">
    <div className="flex items-end justify-between gap-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      {hint ? (
        <div className="text-[11px] text-slate-400 whitespace-nowrap">{hint}</div>
      ) : null}
    </div>
    {children}
  </div>
);

const softCard =
  "rounded-[28px] border border-slate-200/70 bg-white/80 backdrop-blur " +
  "shadow-[0_18px_55px_rgba(15,23,42,0.10)] overflow-hidden";

const baseInput =
  "w-full rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3.5 text-sm text-slate-900 outline-none " +
  "transition shadow-[0_1px_0_rgba(15,23,42,0.04)] " +
  "placeholder:text-slate-400 " +
  "hover:border-slate-300 hover:bg-white " +
  "focus:border-[#8570EE]/45 focus:ring-4 focus:ring-[#8570EE]/15";

const disabledInput =
  "disabled:bg-slate-50/70 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed";

const baseSelect =
  "w-full rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3.5 text-sm text-slate-900 outline-none " +
  "transition shadow-[0_1px_0_rgba(15,23,42,0.04)] " +
  "hover:border-slate-300 hover:bg-white " +
  "focus:border-[#8570EE]/45 focus:ring-4 focus:ring-[#8570EE]/15";

const Badge = ({ children, tone = "neutral" }) => {
  const cls =
    tone === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "inactive"
      ? "border-slate-200 bg-slate-100 text-slate-600"
      : "border-slate-200 bg-white text-slate-700";

  return (
    <span
      className={[
        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border",
        cls,
      ].join(" ")}
    >
      {children}
    </span>
  );
};

/* ---------------- COMPONENT ---------------- */
const AddBank = () => {
  const [banks, setBanks] = useState([]);
  const [qrPreview, setQrPreview] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [editBankId, setEditBankId] = useState(null);

  const [form, setForm] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    status: "Active",
    qrCodeUrl: "",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ UI only: page direction + table veil (no logic change)
  const [pageDir, setPageDir] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchBanks = async (pageNo = 1) => {
    try {
      setTableLoading(true); // UI-only
      const res = await API.get(`/company/getBankDetails?page=${pageNo}`);
      setBanks(res.data.banks);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch banks", err);
    } finally {
      setTableLoading(false); // UI-only
    }
  };

  useEffect(() => {
    fetchBanks(page);
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQRChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be under 2MB");
      return;
    }

    try {
      setQrLoading(true);
      const data = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, qrCodeUrl: data.secure_url }));
      setQrPreview(data.secure_url);
    } catch (err) {
      toast.error("Failed to upload QR code");
      console.error(err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "bankName",
      "accountNumber",
      "ifscCode",
      "branch",
      "accountHolderName",
    ];
    for (let field of requiredFields) {
      if (!form[field]?.trim()) {
        toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
        return;
      }
    }

    try {
      const payload = { ...form };

      if (editBankId) {
        await API.put(`/company/updateBankDetails/${editBankId}`, payload);
      } else {
        await API.post("/company/addBankDetails", payload);
      }

      setForm({
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        branch: "",
        status: "Active",
        qrCodeUrl: "",
      });
      setQrPreview(null);
      setEditBankId(null);
      fetchBanks(page);
    } catch (err) {
      console.error("Failed to submit bank details", err);
    }
  };

  const handleEdit = (bank) => {
    setForm({
      bankName: bank.bankName,
      accountHolderName: bank.accountHolderName || "",
      accountNumber: bank.accountNumber,
      ifscCode: bank.ifscCode,
      branch: bank.branch,
      status: bank.status,
      qrCodeUrl: bank.qrCodeUrl || "",
    });
    setQrPreview(bank.qrCodeUrl || null);
    setEditBankId(bank._id);
  };

  const handleCancel = () => {
    setForm({
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      branch: "",
      status: "Active",
      qrCodeUrl: "",
    });
    setQrPreview(null);
    setEditBankId(null);
  };

  // ✅ Premium directional slide (UI only)
  const bodyVariants = useMemo(
    () => ({
      initial: (dir) => ({
        opacity: 0,
        x: dir > 0 ? 34 : -34,
        filter: "blur(6px)",
      }),
      animate: { opacity: 1, x: 0, filter: "blur(0px)" },
      exit: (dir) => ({
        opacity: 0,
        x: dir > 0 ? -34 : 34,
        filter: "blur(6px)",
      }),
    }),
    []
  );

  return (
    <div className="w-full max-w-[100rem] mx-auto mt-6 mb-6 px-3 sm:px-4">
      <div
        className="
          relative
          w-full rounded-[32px] overflow-hidden
          border border-slate-200/70 bg-white
          shadow-[0_30px_90px_rgba(15,23,42,0.14)]
        "
      >
        {/* Premium ribbon */}
        <div
          className="h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
        />

        {/* subtle glows */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: THEME }}
        />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-violet-400" />

        <div className="relative p-6 md:p-8 space-y-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Company
              </div>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
                Bank Details
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Add or update bank details and manage status.
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
              {editBankId ? "Editing" : "Create"}
            </div>
          </div>

          {/* ✅ TOP ROW: LEFT QR card + RIGHT form card (same height) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            {/* LEFT: QR Upload (stretches) */}
            <div className="lg:col-span-2 h-full">
              <div className={`${softCard} h-full flex flex-col`}>
                <div className="px-5 py-4 border-b border-slate-100 bg-white/70">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    QR code
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    UPI QR
                  </div>
                </div>

                <div className="p-5 md:p-6 flex-1 flex flex-col">
                  <label
                    htmlFor="qr-upload"
                    className="
                      relative
                      group
                      flex-1
                      flex items-center justify-center
                      rounded-[26px]
                      border border-slate-200/70
                      bg-white/70
                      shadow-[0_12px_36px_rgba(15,23,42,0.08)]
                      overflow-hidden
                      cursor-pointer
                      transition
                      hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)]
                      hover:bg-white
                      min-h-[220px]
                    "
                  >
                    <div
                      className="
                        pointer-events-none absolute inset-0
                        opacity-0 group-hover:opacity-100
                        transition
                      "
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0) 55%)",
                      }}
                    />

                    {qrLoading && (
                      <div className="absolute inset-0 bg-white/65 backdrop-blur-[3px] flex items-center justify-center">
                        <div className="text-sm font-extrabold" style={{ color: THEME }}>
                          Uploading...
                        </div>
                      </div>
                    )}

                    <div className="relative text-center px-6">
                      {qrPreview ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-[140px] w-full flex items-center justify-center">
                            <img
                              src={qrPreview}
                              alt="QR Preview"
                              className="h-[140px] object-contain"
                            />
                          </div>
                          <div className="text-xs text-slate-500">
                            Click to change (max 2MB)
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="text-sm font-extrabold text-slate-800">
                            Upload QR image
                          </div>
                          <div className="text-xs text-slate-500">Click to choose an image</div>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {["JPG", "PNG", "≤ 2MB"].map((t) => (
                          <span
                            key={t}
                            className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <input
                      id="qr-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleQRChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT: Main Form (stretches to match QR) */}
            <div className="lg:col-span-3 h-full">
              <div className={`${softCard} h-full flex flex-col`}>
                <div className="px-5 py-4 border-b border-slate-100 bg-white/70">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Form
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    {editBankId ? "Update bank details" : "Add bank details"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Fill the details and save.
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-5 md:p-6 bg-gradient-to-b from-white via-white to-purple-50/40 flex-1 flex flex-col"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Bank name">
                      <input
                        type="text"
                        name="bankName"
                        value={form.bankName}
                        onChange={handleChange}
                        placeholder="Bank Name"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={!!editBankId}
                      />
                    </Field>

                    <Field label="Account holder name">
                      <input
                        type="text"
                        name="accountHolderName"
                        value={form.accountHolderName}
                        onChange={handleChange}
                        placeholder="Account Holder Name"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={!!editBankId}
                      />
                    </Field>

                    <Field label="Account number">
                      <input
                        type="text"
                        name="accountNumber"
                        value={form.accountNumber}
                        onChange={handleChange}
                        placeholder="Account Number"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={!!editBankId}
                      />
                    </Field>

                    <Field label="IFSC code">
                      <input
                        type="text"
                        name="ifscCode"
                        value={form.ifscCode}
                        onChange={handleChange}
                        placeholder="IFSC Code"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={!!editBankId}
                      />
                    </Field>

                    <Field label="Branch">
                      <input
                        type="text"
                        name="branch"
                        value={form.branch}
                        onChange={handleChange}
                        placeholder="Branch"
                        className={`${baseInput} ${disabledInput}`}
                        disabled={!!editBankId}
                      />
                    </Field>

                    <Field label="Status">
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className={baseSelect}
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </Field>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={{ borderColor: THEME, color: THEME }}
                      className="
                        px-7 py-3.5 rounded-2xl text-sm font-extrabold
                        border bg-white/80
                        hover:bg-purple-50/60 transition
                        active:scale-[0.99]
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      style={{ backgroundColor: THEME, color: "white" }}
                      className="
                        px-7 py-3.5 rounded-2xl text-sm font-extrabold
                        shadow-[0_18px_45px_rgba(133,112,238,0.35)]
                        hover:opacity-95 transition
                        active:scale-[0.99]
                      "
                    >
                      {editBankId ? "Update" : "Submit"}
                    </button>
                  </div>

                  {editBankId && (
                    <div className="mt-3 text-xs text-slate-500">
                      Some fields are locked while editing.
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* ✅ FULL WIDTH BELOW: Table */}
            <div className="lg:col-span-5">
              <div className={softCard}>
                <div className="px-5 py-4 border-b border-slate-100 bg-white/70 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      View
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">
                      Bank list
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Paginated bank details
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

                {/* table wrapper with no vertical scroll flash + loading veil */}
                <div className="relative overflow-x-auto overflow-y-hidden">
                  <div className="relative overflow-hidden">
                    {tableLoading && (
                      <div className="absolute inset-0 z-10 bg-white/55 backdrop-blur-[2px]" />
                    )}

                    <table className="w-full text-sm text-left text-slate-700 min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <th className="px-6 py-4">Sl No</th>
                          <th className="px-6 py-4">Bank Name</th>
                          <th className="px-6 py-4">IFSC</th>
                          <th className="px-6 py-4">Branch</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {banks.map((bank, idx) => (
                          <tr
                            key={bank._id}
                            className="border-b border-slate-100 transition hover:bg-[#8570EE]/10"
                          >
                            <td className="px-6 py-4 font-semibold">
                              {(page - 1) * 2 + idx + 1}
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              {bank.bankName}
                            </td>
                            <td className="px-6 py-4">{bank.ifscCode}</td>
                            <td className="px-6 py-4">{bank.branch}</td>
                            <td className="px-6 py-4">
                              {bank.status === "Active" ? (
                                <Badge tone="active">Active</Badge>
                              ) : (
                                <Badge tone="inactive">Inactive</Badge>
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
                                onClick={() => handleEdit(bank)}
                                aria-label="Edit bank"
                              >
                                <Pencil className="w-4 h-4 text-slate-600" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {banks.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-10 text-center text-slate-500"
                            >
                              No bank details found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="py-4 px-4 flex items-center justify-end gap-2 bg-white border-t border-slate-200">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const isActive = page === i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setPageDir(i + 1 > page ? 1 : -1);
                          setPage(i + 1);
                        }}
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
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Note: Images must be under 2MB.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBank;
