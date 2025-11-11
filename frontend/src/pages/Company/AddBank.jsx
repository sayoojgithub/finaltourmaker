import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import API from "../../api";
import { toast } from "react-toastify";

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

  const fetchBanks = async (pageNo = 1) => {
    try {
      const res = await API.get(`/company/getBankDetails?page=${pageNo}`);
      setBanks(res.data.banks);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch banks", err);
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
  console.log(form);

  console.log(editBankId);
  const handleSubmit = async (e) => {
    e.preventDefault();
     const requiredFields = ["bankName",  "accountNumber", "ifscCode", "branch","accountHolderName"];
  for (let field of requiredFields) {
    if (!form[field]?.trim()) {
      toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
      return;
    }
  }
    try {
      const payload = { ...form };

      if (editBankId) {
        console.log("edit");
        // 🔁 Update bank
        await API.put(`/company/updateBankDetails/${editBankId}`, payload);
      } else {
        console.log("create");
        // ➕ Add new bank
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

  return (
    <div>
      <div className="w-full max-w-[100rem] bg-white rounded-3xl shadow p-6 mx-auto mt-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Add bank details</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Other fields (Bank Name, Account Number, IFSC, Branch) */}
  <input
    type="text"
    placeholder="Bank Name"
    name="bankName"
    value={form.bankName}
    onChange={handleChange}
    className="border-[0.5px] border-gray-300 rounded-md p-3 w-full"
    disabled={!!editBankId}
  />
  <input
    type="text"
    placeholder="Account Number"
    name="accountNumber"
    value={form.accountNumber}
    onChange={handleChange}
    className="border-[0.5px] border-gray-300 rounded-md p-3 w-full"
    disabled={!!editBankId}
  />
  <input
    type="text"
    placeholder="IFSC Code"
    name="ifscCode"
    value={form.ifscCode}
    onChange={handleChange}
    className="border-[0.5px] border-gray-300 rounded-md p-3 w-full"
     disabled={!!editBankId}
  />
  <input
    type="text"
    placeholder="Branch"
    name="branch"
    value={form.branch}
    onChange={handleChange}
    className="border-[0.5px] border-gray-300 rounded-md p-3 w-full"
     disabled={!!editBankId}
  />

  {/* QR Upload - Left Side */}
  <div className="col-span-1">
    <label className="block text-sm font-medium mb-2">Upload UPI QR Code</label>
    <label
      htmlFor="qr-upload"
      className="flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
    >
      <div className="text-center">
        {qrLoading ? (
          <p className="text-sm text-purple-500">Uploading...</p>
        ) : qrPreview ? (
          <img
            src={qrPreview}
            alt="QR Preview"
            className="h-20 object-contain mx-auto"
          />
        ) : (
          <>
            <svg
              className="w-6 h-6 mx-auto text-[#8570EE]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
          </>
        )}
      </div>
      <input
        id="qr-upload"
        type="file"
        accept="image/*"
        onChange={handleQRChange}
        className="hidden"
      />
    </label>
    <div className="text-xs text-gray-500 mt-2 flex gap-2">
      <span className="border px-2 py-0.5 rounded">JPG</span>
      <span className="border px-2 py-0.5 rounded">PNG</span>
      <span className="border px-2 py-0.5 rounded">{"> 2 MB"}</span>
    </div>
  </div>

  {/* Account Holder Name, Status, Buttons - Right Side */}
  <div className="col-span-1 flex flex-col justify-between h-full">
    <input
      type="text"
      placeholder="Account Holder Name"
      name="accountHolderName"
      value={form.accountHolderName}
      onChange={handleChange}
      className="border-[0.5px] border-gray-300 rounded-md p-3 w-full mb-3"
      disabled={!!editBankId}
    />
    <select
      name="status"
      value={form.status}
      onChange={handleChange}
      className="border-[0.5px] border-gray-300 rounded-md p-3 w-full mb-3"
    >
      <option>Active</option>
      <option>Inactive</option>
    </select>
    <div className="flex justify-center gap-4 mt-2">
      <button
        type="submit"
        style={{ backgroundColor: "#8570EE", color: "white" }}
        className="px-6 py-2 rounded-md text-sm hover:opacity-90"
      >
        Submit
      </button>
      <button
        type="button"
        onClick={handleCancel}
        style={{ borderColor: "#8570EE", color: "#8570EE" }}
        className="border px-6 py-2 rounded-md text-sm hover:bg-purple-50"
      >
        Cancel
      </button>
    </div>
  </div>
</form>


        {/* Table display section */}
        <div className="max-w-[100rem] mx-auto mt-10 p-6 rounded-3xl shadow-md bg-white">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
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
                  <tr key={bank._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{(page - 1) * 2 + idx + 1}</td>
                    <td className="px-6 py-4 font-semibold">{bank.bankName}</td>
                    <td className="px-6 py-4">{bank.ifscCode}</td>
                    <td className="px-6 py-4">{bank.branch}</td>
                    <td className="px-6 py-4">
                      {bank.status === "Active" ? (
                        <span className="inline-flex items-center text-green-600 text-xs font-medium bg-green-100 rounded-full px-3 py-1">
                          ● Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-600 text-xs font-medium bg-gray-200 rounded-full px-3 py-1">
                          ● Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => handleEdit(bank)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-end items-center gap-1 mt-6 pr-2 text-sm text-gray-500">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-full ${
                    page === i + 1
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBank;
