import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
const CreateEmployee = () => {
  const [branches, setBranches] = useState([]);
  const [franchisees, setFranchisees] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [franchiseeSearchTerm, setFranchiseeSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialFormData = {
    name: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    otp: "",
    department: "",
    type: "Branch",
    status: "Active",
    branch: "",
    franchisee: "",
    profileImage: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  console.log(formData)

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    toast.error("File size must be under 2MB");
    return;
  }

  try {
    setUploading(true);
    const data = await uploadImageToCloudinary(file);
    setProfilePreview(data.secure_url);
    setFormData((prev) => ({
      ...prev,
      profileImage: data.secure_url,
    }));
    toast.success("Image uploaded!");
  } catch (err) {
    console.error("Upload failed:", err);
    toast.error("Image upload failed");
  } finally {
    setUploading(false);
  }
};
 const triggerFileInput = () => {
    document.getElementById("avatar-upload").click();
  };

  const fetchBranches = async () => {
    try {
      const res = await API.get("/company/listBranchInEmployeeCreate", {
        params: { page, search: branchSearchTerm },
      });
      setBranches(res.data.branches);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchFranchisees = async () => {
    try {
      const res = await API.get("/company/listFranchiseeInEmployeeCreate", {
        params: { search: franchiseeSearchTerm },
      });
      setFranchisees(res.data.franchisees);
    } catch (err) {
      console.error("Error fetching franchisees:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/company/listEmployee");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    if (formData.type === "Branch") {
      fetchBranches();
    } else if (formData.type === "Franchisee") {
      fetchFranchisees();
    }
  }, [formData.type, page, branchSearchTerm, franchiseeSearchTerm]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



const handleSubmit = async () => {
  let updatedFormData = { ...formData }; // Create local copy

  const requiredFields = {
    name: "Name",
    contactNumber: "Contact Number",
    email: "Email",
    department: "Department",
    password: "Password",
  };

  for (const field in requiredFields) {
    if (!updatedFormData[field] || updatedFormData[field].trim() === "") {
      toast.error(`${requiredFields[field]} is mandatory.`);
      return;
    }
  }

  // Type-specific adjustments
  if (updatedFormData.type === "Company") {
    if (updatedFormData.branch) updatedFormData.branch = "";
    if (updatedFormData.franchisee) updatedFormData.franchisee = "";
  }

  if (
    updatedFormData.department === "purchaser" &&
    updatedFormData.type !== "Company"
  ) {
    toast.error("You can create purchaser only for company");
    updatedFormData.branch = "";
    updatedFormData.franchisee = "";
    setFormData(updatedFormData); // update in state too
    return;
  }
  if (
    updatedFormData.department === "digitalmarketer" &&
    updatedFormData.type !== "Company"
  ) {
    toast.error("You can create digital marketer only for company");
    updatedFormData.branch = "";
    updatedFormData.franchisee = "";
    setFormData(updatedFormData); // update in state too
    return;
  }
   if (
    updatedFormData.department === "marketingmanager" &&
    updatedFormData.type !== "Company"
  ) {
    toast.error("You can create marketing manager only for company");
    updatedFormData.branch = "";
    updatedFormData.franchisee = "";
    setFormData(updatedFormData); // update in state too
    return;
  }
   if (
    updatedFormData.department === "creativestaff" &&
    updatedFormData.type !== "Company"
  ) {
    toast.error("You can create creative staff only for company");
    updatedFormData.branch = "";
    updatedFormData.franchisee = "";
    setFormData(updatedFormData); // update in state too
    return;
  }
   if (
    updatedFormData.department === "entry" &&
    updatedFormData.type !== "Company"
  ) {
    toast.error("You can create entry staff only for company");
    updatedFormData.branch = "";
    updatedFormData.franchisee = "";
    setFormData(updatedFormData); // update in state too
    return;
  }
   if (
    updatedFormData.department === "frontofficer" &&
    updatedFormData.type !== "Company"
  ) {
    toast.error("You can create frontofficer only for company");
    updatedFormData.branch = "";
    updatedFormData.franchisee = "";
    setFormData(updatedFormData); // update in state too
    return;
  }

  if (updatedFormData.type === "Branch") {
    if (!updatedFormData.branch) {
      toast.error("Select the Branch");
      return;
    }
    if (updatedFormData.franchisee) updatedFormData.franchisee = "";
  }

  if (updatedFormData.type === "Franchisee") {
    if (!updatedFormData.franchisee) {
      toast.error("Select the Franchisee");
      return;
    }
    if (updatedFormData.branch) updatedFormData.branch = "";
  }

  if (updatedFormData.password !== updatedFormData.confirmPassword) {
    toast.error("Reenter password and it should be same");
    return;
  }

  const storedOtp = localStorage.getItem("EmployeeOtp");
  if (!storedOtp || updatedFormData.otp !== storedOtp) {
    toast.error("Enter the valid OTP you received in the email.");
    return;
  }

  try {
    if (isEditing) {
      await API.put(`/company/updateEmployee/${editingEmployeeId}`, updatedFormData);
      toast.success("Employee updated successfully!");
    } else {
      await API.post("/company/createEmployee", updatedFormData);
      toast.success("Employee created successfully!");
    }

    setFormData(initialFormData);
    setIsEditing(false);
    setEditingEmployeeId(null);
    setProfilePreview(null);
    fetchEmployees();
  } catch (err) {
    console.error("Error creating/updating employee:", err);
  }
};

  const handleEdit = (emp) => {
    setFormData({
      name: emp.name,
      email: emp.email,
      contactNumber: emp.contactNumber,
      password: "",
      confirmPassword: "",
      otp: "",
      department: emp.department,
      type: emp.type,
      status: emp.status,
      branch: emp.branch?._id || "",
      franchisee: emp.franchisee?._id || "",
      profileImage: emp.profileImage || "",
    });
    setProfilePreview(emp.profileImage || null);
    setEditingEmployeeId(emp._id);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingEmployeeId(null);
    setProfilePreview(null);

  };
const handleSendOtp = async () => {
  try {
    const res = await API.post("/company/sendOtp", {
      email: formData.email,
    });
    const generatedOtp = res.data.otp;
    localStorage.setItem("EmployeeOtp", generatedOtp);
    toast.success("OTP sent to email!");
  } catch (err) {
    console.error("Failed to send OTP", err);
    toast.error("Failed to send OTP");
  }
};
  return (
    <div className="min-h-screen px-4 py-10 ">
      {/* Employee Form */}
      <div className="w-full max-w-[100rem] mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-10 grid md:grid-cols-2 gap-6">
        {/* Left Section */}
        <div className="flex flex-col items-center">
          {/* <div className="w-40 h-40 rounded-full border-4 border-gray-200 overflow-hidden flex items-center justify-center mb-4">
            <img
              src="https://www.w3schools.com/howto/img_avatar.png"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="bg-purple-500 text-white px-6 py-2 rounded-md mb-6 hover:bg-purple-600 transition">
            Upload
          </button> */}
          <div className="flex flex-col items-center">
      {/* Avatar Preview Circle */}
      <div className="w-40 h-40 rounded-full border-4 border-gray-200 overflow-hidden flex items-center justify-center mb-4">
        <img
          src={
            profilePreview
              ? profilePreview
              : "https://www.w3schools.com/howto/img_avatar.png"
          }
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Upload Button */}
      <button
        type="button"
        onClick={triggerFileInput}
        className="bg-purple-500 text-white px-6 py-2 rounded-md mb-6 hover:bg-purple-600 transition"
      >
        Upload
      </button>

      {/* Hidden File Input */}
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
       


          {/* Type Options */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            {["Company", "Branch", "Franchisee"].map((type) => (
              <label className="flex items-center gap-1" key={type}>
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={formData.type === type}
                  onChange={handleChange}
                />
                {type}
              </label>
            ))}
          </div>

          {/* Status Toggle */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            {["Active", "Inactive"].map((status) => (
              <label className="flex items-center gap-1" key={status}>
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={handleChange}
                />
                {status}
              </label>
            ))}
          </div>

          {/* Department */}
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 mb-3"
          >
            <option value="">Select Department</option>
            <option value="digitalmarketer">Digital Marketer</option>
            <option value="entry">Entry</option>
            <option value="frontofficer">Front Officer</option>
            <option value="executive">Executive</option>
            <option value="purchaser">Purchaser</option>
            <option value="salesmanager">Sales Manager</option>
            <option value="marketingmanager">Marketing Manager</option>
            <option value="creativestaff">Creative Staff</option>
          </select>

          {/* Branch Dropdown */}
          {formData.type === "Branch" && (
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.branchName}
                </option>
              ))}
            </select>
          )}

          {/* Franchisee Dropdown */}
          {formData.type === "Franchisee" && (
            <select
              name="franchisee"
              value={formData.franchisee}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Franchisee</option>
              {franchisees.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.franchiseeName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right Section */}
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border border-gray-300 rounded-md p-2"
          />
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number"
            className="w-full border border-gray-300 rounded-md p-2"
          />
          <div className="relative w-full">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md p-2 pr-28"
            />
            <button
              type="button"
              onClick={handleSendOtp}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-500 hover:underline"
            >
              Verify email
            </button>
          </div>{" "}
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter OTP"
            className="w-full border border-gray-300 rounded-md p-2"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md p-2"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter Password"
            className="w-full border border-gray-300 rounded-md p-2"
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSubmit}
              disabled={isEditing}
              className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 transition"
            >
              {isEditing ? "Update" : "Submit"}
            </button>
            <button
              onClick={handleCancel}
              className="border border-purple-500 text-purple-500 px-6 py-2 rounded-md hover:bg-purple-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <hr className="my-10 border-t border-gray-300 max-w-6xl mx-auto" />

      {/* Employee Table */}
      <div className="w-full max-w-[100rem] mx-auto overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Sl No</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={emp._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{idx + 1}</td>
                <td className="px-6 py-4 font-semibold">{emp.name}</td>
                <td className="px-6 py-4">{emp.email}</td>
                <td className="px-6 py-4">{emp.contactNumber}</td>
                <td className="px-6 py-4">{emp.department}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center text-xs font-medium rounded-full px-3 py-1 ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    ● {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => handleEdit(emp)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateEmployee;
