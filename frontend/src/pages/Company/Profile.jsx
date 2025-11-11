import React, { useState, useEffect } from "react";
import API from "../../api";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { toast } from "react-toastify";
const Profile = () => {
  const [isDirty, setIsDirty] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    contactNumber: "",
    additionalNumber: "",
    gstin: "",
    buildingName: "",
    roadAreaStreet: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    logo: "",
  });
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/company/profile");
        setProfileData(res.data);
        setFormData({
          companyName: res.data.companyName || "",
          ownerName: res.data.ownerName || "",
          email: res.data.email || "",
          contactNumber: res.data.contactNumber || "",
          additionalNumber: res.data.additionalNumber || "",
          gstin: res.data.gstin || "",
          buildingName: res.data.buildingName || "",
          roadAreaStreet: res.data.roadAreaStreet || "",
          city: res.data.city || "",
          state: res.data.state || "",
          country: res.data.country || "",
          pincode: res.data.pincode || "",
          logo: res.data.logo || "",
        });
        setPreviewURL(res.data.logo || "");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be under 2MB");
      return;
    }

    try {
      setLoading(true);
      const data = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, logo: data.secure_url }));
      setPreviewURL(data.secure_url);
      setIsDirty(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ✅ List required fields (excluding gstin and logo)
    const requiredFields = [
      "companyName",
      "ownerName",
      "email",
      "contactNumber",
      "additionalNumber",
      "buildingName",
      "roadAreaStreet",
      "city",
      "state",
      "country",
      "pincode",
    ];

    // ✅ Check for missing fields
    for (let field of requiredFields) {
      if (!formData[field]?.trim()) {
        toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
        return;
      }
    }
    try {
      const res = await API.put("/company/profileUpdate", formData);
      toast.success("Profile updated successfully");
      setProfileData(res.data);
      setIsDirty(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="w-full max-w-[100rem] bg-white rounded-3xl shadow-lg p-6 md:p-8 mx-auto mb-10 ">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-[100rem] mx-auto "
      >
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Company Name"
          className="border-[0.5px] border-gray-300 rounded p-3"
          disabled
        />
        <input
          type="text"
          name="ownerName"
          value={formData.ownerName}
          onChange={handleChange}
          placeholder="Owner's Name"
          className="border-[0.5px] border-gray-300 rounded p-3"
          disabled
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email ID"
          className="border-[0.5px] border-gray-300 rounded p-3"
          disabled
        />
        <input
          type="tel"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          className="border-[0.5px] border-gray-300 rounded p-3"
          disabled
        />
        <input
          type="tel"
          name="additionalNumber"
          value={formData.additionalNumber}
          onChange={handleChange}
          placeholder="Additional Number"
          className="border-[0.5px] border-gray-300 rounded p-3"
        />
        <input
          type="text"
          name="gstin"
          value={formData.gstin}
          onChange={handleChange}
          placeholder="GSTIN"
          className="border-[0.5px] border-gray-300 rounded p-3"
        />
        <input
          type="text"
          name="buildingName"
          value={formData.buildingName}
          onChange={handleChange}
          placeholder="Building Name"
          className="border-[0.5px] border-gray-300 rounded p-3"
        />
        <input
          type="text"
          name="roadAreaStreet"
          value={formData.roadAreaStreet}
          onChange={handleChange}
          placeholder="Road name, Area, Street"
          className="border-[0.5px] border-gray-300 rounded p-3"
        />
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
          className="border-[0.5px] border-gray-300 rounded p-3"
          disabled
        />
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          placeholder="State"
          className="border-[0.5px] border-gray-300 rounded p-3"
          disabled
        />
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Country"
          className="border-[0.5px] border-gray-300 rounded p-3"
          disabled
        />
        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          placeholder="Pin Code"
          className="border-[0.5px] border-gray-300 rounded p-3"
          disabled
        />

        {/* Upload Logo */}
        <div className="mt-2 md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Upload Your Logo
          </label>
          <label
            htmlFor="logo-upload"
            className="flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="text-center">
              {loading ? (
                <p className="text-sm text-purple-500">Uploading...</p>
              ) : previewURL ? (
                <img
                  src={previewURL}
                  alt="Logo Preview"
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
                  <p className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                  {/* <p className="text-xs text-gray-400">
                    JPG, PNG, GIF (max 2MB)
                  </p> */}
                </>
              )}
            </div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Buttons */}
        {isDirty && (
          <div className="flex justify-center gap-4 mt-6 md:col-span-2">
            <button
              type="submit"
              style={{ backgroundColor: "#8570EE", color: "white" }}
              className="px-6 py-2 rounded-md text-sm hover:opacity-90"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                if (profileData) {
                  setFormData({ ...profileData });
                  setPreviewURL(profileData.logo || "");
                  setIsDirty(false);
                }
              }}
              style={{ borderColor: "#8570EE", color: "#8570EE" }}
              className="border px-6 py-2 rounded-md text-sm hover:bg-purple-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
