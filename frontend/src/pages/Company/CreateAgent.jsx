import React, { useState, useEffect } from "react";
import { Eye, Pencil } from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";

const CreateAgent = () => {
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    agentName: "",
    buildingName: "",
    contactNumber: "",
    roadAreaStreet: "",
    email: "",
    otp: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    gstin: "",
    status: "Active",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgents = async () => {
    try {
      const res = await API.get(
        `/company/listAgent?page=${page}&search=${searchTerm}`
      );
      setAgents(res.data.agents);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  useEffect(() => {
    fetchAgents();
    // window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (isEditMode) {
    // ✅ Required fields for update (excluding otp and gstin)
    const requiredFields = {
      agentName: "Agent Name",
      buildingName: "Building Name",
      contactNumber: "Contact Number",
      roadAreaStreet: "Road/Area/Street",
      email: "Email",
      city: "City",
      state: "State",
      country: "Country",
      pincode: "Pincode",
      status: "Status",
    };

    for (const field in requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        toast.error(`${requiredFields[field]} is mandatory.`);
        return;
      }
    }

    try {
      await API.put(`/company/updateAgent/${editingAgentId}`, formData);
      toast.success("Agent updated successfully!");
      resetForm();
      fetchAgents();
      setPage(1);
    } catch (err) {
      console.error("Agent update failed:", err);
      toast.error("Failed to update agent.");
    }

  } else {
    // ✅ Required fields for create (excluding gstin but including otp)
    const requiredFields = {
      agentName: "Agent Name",
      buildingName: "Building Name",
      contactNumber: "Contact Number",
      roadAreaStreet: "Road/Area/Street",
      email: "Email",
      otp: "OTP",
      city: "City",
      state: "State",
      country: "Country",
      pincode: "Pincode",
      status: "Status",
    };

    for (const field in requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        toast.error(`${requiredFields[field]} is mandatory.`);
        return;
      }
    }

    // 🔐 OTP Match Check
    const storedOtp = localStorage.getItem("AgentOtp");
    if (formData.otp !== storedOtp) {
      toast.error("OTP is incorrect or expired.");
      return;
    }

    try {
      await API.post("/company/createAgent", formData);
      toast.success("Agent created successfully!");
      resetForm();
      fetchAgents();
      setPage(1);
    } catch (err) {
      console.error("Agent creation failed:", err);
      toast.error("Failed to create Agent.");
    }
  }
};

  const handleEditAgent = (agent) => {
    setIsEditMode(true);
    setEditingAgentId(agent._id);

    setFormData({
      agentName: agent.agentName || "",
      buildingName: agent.buildingName || "",
      contactNumber: agent.contactNumber || "",
      roadAreaStreet: agent.roadAreaStreet || "",
      email: agent.email || "",
      otp: "",
      city: agent.city || "",
      state: agent.state || "",
      country: agent.country || "",
      pincode: agent.pincode || "",
      gstin: agent.gstin || "",
      status: agent.status || "Active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingAgentId(null);
    setFormData({
      agentName: "",
      buildingName: "",
      contactNumber: "",
      roadAreaStreet: "",
      email: "",
      otp: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      gstin: "",
      status: "Active",
    });
  };
  const handleSendOtp = async () => {
  try {
    const res = await API.post("/company/sendOtp", {
      email: formData.email,
    });
    const generatedOtp = res.data.otp;
    localStorage.setItem("AgentOtp", generatedOtp);
    toast.success("OTP sent to email!");
  } catch (err) {
    console.error("Failed to send OTP", err);
    toast.error("Failed to send OTP");
  }
};
useEffect(() => {
  const controller = new AbortController(); // For fetch cancellation
  const signal = controller.signal;

  const fetchPincodeDetails = async () => {
    const isValidPincode = formData.pincode.length === 6 && /^\d{6}$/.test(formData.pincode);

    if (isValidPincode) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`, { signal });
        const data = await response.json();

        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice?.[0];
          if (postOffice && formData.pincode.length === 6) {
            setFormData((prev) => ({
              ...prev,
              city: postOffice.District || '',
              state: postOffice.State || '',
              country: postOffice.Country || '',
            }));
          }
        } else {
          toast.error("Invalid Pincode. Please check the pincode.");
          setFormData((prev) => ({
            ...prev,
            city: '',
            state: '',
            country: '',
          }));
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Failed to fetch pincode details.");
        }
        setFormData((prev) => ({
          ...prev,
          city: '',
          state: '',
          country: '',
        }));
      }
    } else {
      // Clear if pincode is not valid
      setFormData((prev) => ({
        ...prev,
        city: '',
        state: '',
        country: '',
      }));
    }
  };

  fetchPincodeDetails();

  return () => {
    controller.abort(); // Cancel previous fetch when pincode changes
  };
}, [formData.pincode]);


  return (
    
    <div className="min-h-screen px-4 pt-1 pb-10 flex flex-col items-center gap-10 ">
   
      {/* Form Section */}
      <form
        className="w-full max-w-[100rem] bg-white rounded-3xl p-6 md:p-10 shadow-lg space-y-6"
        onSubmit={handleSubmit}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="agentName"
            value={formData.agentName}
            onChange={handleChange}
            type="text"
            placeholder="Agent Name"
            className="border border-gray-300 rounded-md p-3 w-full"
            disabled={isEditMode}
          />
          <input
            name="buildingName"
            value={formData.buildingName}
            onChange={handleChange}
            type="text"
            placeholder="Building name"
            className="border border-gray-300 rounded-md p-3 w-full"
          />

          <input
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            type="text"
            placeholder="Contact Number"
            className="border border-gray-300 rounded-md p-3 w-full"
            disabled={isEditMode}
          />
          <input
            name="roadAreaStreet"
            value={formData.roadAreaStreet}
            onChange={handleChange}
            type="text"
            placeholder="Road name, Area, Street"
            className="border border-gray-300 rounded-md p-3 w-full"
          />

          {/* Email + City & State */}
          <div className="relative w-full col-span-1">
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="border border-gray-300 rounded-md p-3 w-full pr-28"
              disabled={isEditMode}
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isEditMode}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-500 hover:underline"
            >
              Verify email
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
          <input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              type="text"
              placeholder="Pincode"
              className="border border-gray-300 rounded-md p-3 w-full"
              disabled={isEditMode}
            />
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              type="text"
              placeholder="City"
              className="border border-gray-300 rounded-md p-3 w-full"
              disabled={isEditMode}
            />
            
          </div>

          {/* OTP + Country & Pincode */}
          <input
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            type="text"
            placeholder="Enter OTP received in your mail"
            className="border border-gray-300 rounded-md p-3 w-full"
            disabled={isEditMode}
          />
          <div className="grid grid-cols-2 gap-4">
           <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              type="text"
              placeholder="State"
              className="border border-gray-300 rounded-md p-3 w-full"
              disabled={isEditMode}
            />
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              type="text"
              placeholder="Country"
              className="border border-gray-300 rounded-md p-3 w-full"
              disabled={isEditMode}
            />
            
          </div>

          
        
        </div>

        <div className="w-full flex justify-center">
          <input
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
            type="text"
            placeholder="GST No (Optional)"
            className="border border-gray-300 rounded-md p-3 w-full max-w-md"
          />
        </div>
        <div className="w-full flex justify-center mt-4">
          <div className="flex gap-10">
            <label className="flex items-center gap-2 text-black font-medium">
              <input
                type="radio"
                name="status"
                value="Active"
                checked={formData.status === "Active"}
                onChange={handleChange}
                className="accent-purple-500"
              />
              <span>Active</span>
            </label>
            <label className="flex items-center gap-2 text-black font-medium">
              <input
                type="radio"
                name="status"
                value="Inactive"
                checked={formData.status === "Inactive"}
                onChange={handleChange}
                className="accent-purple-500"
              />
              <span>Inactive</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-3 rounded-md hover:bg-purple-600 transition"
        >
          {isEditMode ? "Update Agent" : "Register Agent"}
        </button>

        {isEditMode && (
          <button
            type="button"
            onClick={resetForm}
            className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition mt-2"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Table Display Section */}
      <div className="w-full max-w-[100rem] overflow-x-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Agent Name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // reset to first page on new search
            }}
            className="w-full max-w-sm border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Sl No</th>
              <th className="px-6 py-4">Agent Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Contact Number</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, idx) => (
              <tr key={agent._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{(page - 1) * 2 + idx + 1}</td>
                <td className="px-6 py-4 font-semibold">{agent.agentName}</td>
                <td className="px-6 py-4">{agent.email}</td>
                <td className="px-6 py-4 font-semibold">
                  {agent.contactNumber}
                </td>
                <td className="px-6 py-4">
                  {agent.status === "Active" ? (
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
                    onClick={() => handleEditAgent(agent)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Numbered Pagination */}
        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  );
};

export default CreateAgent;
