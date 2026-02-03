// import React, { useState, useEffect } from "react";
// import API from "../../api";
// import uploadImageToCloudinary from "../../utils/uploadCloudinary";
// import { toast } from "react-toastify";
// const Profile = () => {
//   const [isDirty, setIsDirty] = useState(false);
//   const [profileData, setProfileData] = useState(null);
//   const [formData, setFormData] = useState({
//     companyName: "",
//     ownerName: "",
//     email: "",
//     contactNumber: "",
//     additionalNumber: "",
//     gstin: "",
//     buildingName: "",
//     roadAreaStreet: "",
//     city: "",
//     state: "",
//     country: "",
//     pincode: "",
//     logo: "",
//   });
//   const [previewURL, setPreviewURL] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Fetch profile on component mount
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await API.get("/company/profile");
//         setProfileData(res.data);
//         setFormData({
//           companyName: res.data.companyName || "",
//           ownerName: res.data.ownerName || "",
//           email: res.data.email || "",
//           contactNumber: res.data.contactNumber || "",
//           additionalNumber: res.data.additionalNumber || "",
//           gstin: res.data.gstin || "",
//           buildingName: res.data.buildingName || "",
//           roadAreaStreet: res.data.roadAreaStreet || "",
//           city: res.data.city || "",
//           state: res.data.state || "",
//           country: res.data.country || "",
//           pincode: res.data.pincode || "",
//           logo: res.data.logo || "",
//         });
//         setPreviewURL(res.data.logo || "");
//       } catch (err) {
//         alert(err.response?.data?.message || "Failed to load profile");
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setIsDirty(true);
//   };

//   const handleLogoChange = async (e) => {
//     const file = e.target.files[0];

//     if (!file) return;
//     if (file.size > 2 * 1024 * 1024) {
//       toast.error("File must be under 2MB");
//       return;
//     }

//     try {
//       setLoading(true);
//       const data = await uploadImageToCloudinary(file);
//       setFormData((prev) => ({ ...prev, logo: data.secure_url }));
//       setPreviewURL(data.secure_url);
//       setIsDirty(true);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to load profile");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // ✅ List required fields (excluding gstin and logo)
//     const requiredFields = [
//       "companyName",
//       "ownerName",
//       "email",
//       "contactNumber",
//       "additionalNumber",
//       "buildingName",
//       "roadAreaStreet",
//       "city",
//       "state",
//       "country",
//       "pincode",
//     ];

//     // ✅ Check for missing fields
//     for (let field of requiredFields) {
//       if (!formData[field]?.trim()) {
//         toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
//         return;
//       }
//     }
//     try {
//       const res = await API.put("/company/profileUpdate", formData);
//       toast.success("Profile updated successfully");
//       setProfileData(res.data);
//       setIsDirty(false);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Update failed");
//     }
//   };

//   return (
//     <div className="w-full max-w-[100rem] bg-white rounded-3xl shadow-lg p-6 md:p-8 mx-auto mb-10 ">
//       <form
//         onSubmit={handleSubmit}
//         className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-[100rem] mx-auto "
//       >
//         <input
//           type="text"
//           name="companyName"
//           value={formData.companyName}
//           onChange={handleChange}
//           placeholder="Company Name"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//           disabled
//         />
//         <input
//           type="text"
//           name="ownerName"
//           value={formData.ownerName}
//           onChange={handleChange}
//           placeholder="Owner's Name"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//           disabled
//         />
//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           placeholder="Email ID"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//           disabled
//         />
//         <input
//           type="tel"
//           name="contactNumber"
//           value={formData.contactNumber}
//           onChange={handleChange}
//           placeholder="Phone Number"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//           disabled
//         />
//         <input
//           type="tel"
//           name="additionalNumber"
//           value={formData.additionalNumber}
//           onChange={handleChange}
//           placeholder="Additional Number"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//         />
//         <input
//           type="text"
//           name="gstin"
//           value={formData.gstin}
//           onChange={handleChange}
//           placeholder="GSTIN"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//         />
//         <input
//           type="text"
//           name="buildingName"
//           value={formData.buildingName}
//           onChange={handleChange}
//           placeholder="Building Name"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//         />
//         <input
//           type="text"
//           name="roadAreaStreet"
//           value={formData.roadAreaStreet}
//           onChange={handleChange}
//           placeholder="Road name, Area, Street"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//         />
//         <input
//           type="text"
//           name="city"
//           value={formData.city}
//           onChange={handleChange}
//           placeholder="City"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//           disabled
//         />
//         <input
//           type="text"
//           name="state"
//           value={formData.state}
//           onChange={handleChange}
//           placeholder="State"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//           disabled
//         />
//         <input
//           type="text"
//           name="country"
//           value={formData.country}
//           onChange={handleChange}
//           placeholder="Country"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//           disabled
//         />
//         <input
//           type="text"
//           name="pincode"
//           value={formData.pincode}
//           onChange={handleChange}
//           placeholder="Pin Code"
//           className="border-[0.5px] border-gray-300 rounded p-3"
//           disabled
//         />

//         {/* Upload Logo */}
//         <div className="mt-2 md:col-span-2">
//           <label className="block text-sm font-medium mb-2">
//             Upload Your Logo
//           </label>
//           <label
//             htmlFor="logo-upload"
//             className="flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
//           >
//             <div className="text-center">
//               {loading ? (
//                 <p className="text-sm text-purple-500">Uploading...</p>
//               ) : previewURL ? (
//                 <img
//                   src={previewURL}
//                   alt="Logo Preview"
//                   className="h-20 object-contain mx-auto"
//                 />
//               ) : (
//                 <>
//                   <svg
//                     className="w-6 h-6 mx-auto text-[#8570EE]"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M12 4v16m8-8H4"
//                     />
//                   </svg>
//                   <p className="text-sm text-gray-500">
//                     Click to upload or drag and drop
//                   </p>
//                   {/* <p className="text-xs text-gray-400">
//                     JPG, PNG, GIF (max 2MB)
//                   </p> */}
//                 </>
//               )}
//             </div>
//             <input
//               id="logo-upload"
//               type="file"
//               accept="image/*"
//               onChange={handleLogoChange}
//               className="hidden"
//             />
//           </label>
//         </div>

//         {/* Buttons */}
//         {isDirty && (
//           <div className="flex justify-center gap-4 mt-6 md:col-span-2">
//             <button
//               type="submit"
//               style={{ backgroundColor: "#8570EE", color: "white" }}
//               className="px-6 py-2 rounded-md text-sm hover:opacity-90"
//             >
//               Submit
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 if (profileData) {
//                   setFormData({ ...profileData });
//                   setPreviewURL(profileData.logo || "");
//                   setIsDirty(false);
//                 }
//               }}
//               style={{ borderColor: "#8570EE", color: "#8570EE" }}
//               className="border px-6 py-2 rounded-md text-sm hover:bg-purple-50"
//             >
//               Cancel
//             </button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default Profile;

import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { toast } from "react-toastify";

const THEME = "#8570EE";

/* ✅ Keep outside (prevents focus loss) */
const Field = ({ label, hint, children }) => (
  <div className="space-y-2">
    <div className="flex items-end justify-between gap-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      {hint ? (
        <div className="text-[11px] text-slate-400 whitespace-nowrap">
          {hint}
        </div>
      ) : null}
    </div>
    {children}
  </div>
);

const SectionTitle = ({ title, desc }) => (
  <div className="space-y-1">
    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
      {title}
    </div>
    {desc ? <div className="text-sm text-slate-500">{desc}</div> : null}
  </div>
);

/* UI-only class presets */
const baseInput =
  "w-full rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3.5 text-sm text-slate-900 outline-none " +
  "transition shadow-[0_1px_0_rgba(15,23,42,0.04)] " +
  "placeholder:text-slate-400 " +
  "hover:border-slate-300 hover:bg-white " +
  "focus:border-[#8570EE]/45 focus:ring-4 focus:ring-[#8570EE]/15";

const disabledInput =
  "disabled:bg-slate-50/70 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed";

const softCard =
  "rounded-[28px] border border-slate-200/70 bg-white/80 backdrop-blur " +
  "shadow-[0_18px_55px_rgba(15,23,42,0.10)]";

const ReadonlyBar = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
      {label}
    </div>
    <div className="mt-1 text-sm font-semibold text-slate-800 break-words">
      {value || "—"}
    </div>
  </div>
);

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

  /* UI-only helpers */
  const lockHint = useMemo(() => "Locked by system", []);

  return (
    <div className="w-full max-w-[100rem] mx-auto mb-10 mt-6 px-3 sm:px-4">
      <div
        className="
          relative
          rounded-[32px]
          overflow-hidden
          border border-slate-200/70
          bg-white
          shadow-[0_30px_90px_rgba(15,23,42,0.14)]
        "
      >
        {/* Top ribbon */}
        <div
          className="h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${THEME}, #c7bef9)` }}
        />

        {/* Decorative glows */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: THEME }}
        />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-violet-400" />

        <div className="relative p-6 md:p-8 space-y-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2">
                <div
                  className="h-9 w-9 rounded-2xl border shadow-inner flex items-center justify-center"
                  style={{
                    background: `${THEME}12`,
                    borderColor: `${THEME}30`,
                    color: THEME,
                  }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: THEME }}
                  />
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Company
                </div>
              </div>

              <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Company Profile
              </div>

              <div className="mt-1 text-sm text-slate-500">
                Your core business identity. Keep it clean, accurate, and always updated.
              </div>
            </div>

            {/* Status pill */}
            <div
              className="
                rounded-2xl border
                bg-white/70 backdrop-blur
                px-4 py-2.5
                shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]
              "
              style={{ borderColor: `${THEME}26` }}
            >
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Panel
              </div>
              <div className="text-sm font-extrabold" style={{ color: THEME }}>
                Company Side
              </div>
            </div>
          </div>

          {/* ✅ TOP ROW: Logo left + Read-only right (same height) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            {/* LEFT: Logo (stretch height) */}
            <div className="lg:col-span-2 h-full">
              <div className={`${softCard} h-full flex flex-col`}>
                <div className="px-5 py-4 border-b border-slate-100 bg-white/70">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Brand
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    Company logo
                  </div>
                </div>

                <div className="p-5 md:p-6 flex-1 flex flex-col">
                  <label
                    htmlFor="logo-upload"
                    className="
                      relative
                      group
                      block
                      rounded-[26px]
                      border border-slate-200/70
                      bg-white/70
                      shadow-[0_12px_36px_rgba(15,23,42,0.08)]
                      overflow-hidden
                      cursor-pointer
                      transition
                      hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)]
                      hover:bg-white
                      flex-1
                    "
                    style={{ minHeight: 0 }}
                  >
                    <div
                      className="
                        pointer-events-none absolute inset-0
                        opacity-0 group-hover:opacity-100
                        transition
                      "
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0) 55%)",
                      }}
                    />

                    <div className="relative p-6 h-full flex flex-col justify-center">
                      {loading && (
                        <div className="absolute inset-0 bg-white/65 backdrop-blur-[3px] flex items-center justify-center">
                          <div
                            className="text-sm font-extrabold"
                            style={{ color: THEME }}
                          >
                            Uploading...
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col items-center gap-4">
                        <div className="w-full">
                          <div
                            className="
                              h-[160px]
                              rounded-2xl
                              border border-slate-200
                              bg-gradient-to-b from-white to-slate-50
                              flex items-center justify-center
                              overflow-hidden
                            "
                          >
                            {previewURL ? (
                              <img
                                src={previewURL}
                                alt="Logo Preview"
                                className="h-[120px] object-contain"
                              />
                            ) : (
                              <div className="text-center">
                                <div className="text-sm font-extrabold text-slate-800">
                                  Upload logo
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Click to choose an image
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                              Format
                            </div>
                            <div className="text-sm font-semibold text-slate-800">
                              JPG / PNG
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                              Limit
                            </div>
                            <div className="text-sm font-semibold text-slate-800">
                              Max 2MB
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500">
                          Tip: Use a transparent PNG for the cleanest look.
                        </div>
                      </div>
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
              </div>
            </div>

            {/* RIGHT: Read-only (stretch height) */}
            <div className="lg:col-span-3 h-full">
              <div className={`${softCard} h-full flex flex-col`}>
                <div className="px-5 py-4 border-b border-slate-100 bg-white/70">
                  <SectionTitle
                    title="Read-only"
                    desc="These values are set by your account."
                  />
                </div>

                <div className="p-5 md:p-6 space-y-4 flex-1">
                  {/* Row 1: company + owner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadonlyBar
                      label={`Company name • ${lockHint}`}
                      value={formData.companyName}
                    />
                    <ReadonlyBar
                      label={`Owner name • ${lockHint}`}
                      value={formData.ownerName}
                    />
                  </div>

                  {/* Row 2: email + contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadonlyBar
                      label={`Email • ${lockHint}`}
                      value={formData.email}
                    />
                    <ReadonlyBar
                      label={`Contact number • ${lockHint}`}
                      value={formData.contactNumber}
                    />
                  </div>

                  {/* Row 3: address full width */}
                  <div className="grid grid-cols-1">
                    <ReadonlyBar
                      label={`Address • ${lockHint}`}
                      value={
                        [formData.city, formData.state, formData.country, formData.pincode]
                          .filter(Boolean)
                          .join(" • ") || "—"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ FULL WIDTH BELOW: Editable section */}
            <div className="lg:col-span-5">
              <div className={softCard}>
                <div className="px-5 py-4 border-b border-slate-100 bg-white/70 flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Editable
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">
                      Update business details
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Submit appears when changes are detected.
                    </div>
                  </div>

                  <div
                    className="
                      rounded-2xl border
                      bg-white/70 backdrop-blur
                      px-4 py-2.5
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]
                      text-sm font-semibold
                    "
                    style={{
                      color: isDirty ? "#0f172a" : "#64748b",
                      borderColor: isDirty
                        ? `${THEME}35`
                        : "rgba(148,163,184,0.35)",
                    }}
                  >
                    {isDirty ? (
                      <span className="font-extrabold" style={{ color: THEME }}>
                        Unsaved changes
                      </span>
                    ) : (
                      <span>Up to date</span>
                    )}
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-5 md:p-6 bg-gradient-to-b from-white via-white to-purple-50/40"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Additional number" hint="Required">
                      <input
                        type="tel"
                        name="additionalNumber"
                        value={formData.additionalNumber}
                        onChange={handleChange}
                        placeholder="Additional Number"
                        className={`${baseInput} ${disabledInput}`}
                      />
                    </Field>

                    <Field label="GSTIN" hint="Optional">
                      <input
                        type="text"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        placeholder="GSTIN"
                        className={`${baseInput} ${disabledInput}`}
                      />
                    </Field>

                    <Field label="Building name" hint="Required">
                      <input
                        type="text"
                        name="buildingName"
                        value={formData.buildingName}
                        onChange={handleChange}
                        placeholder="Building Name"
                        className={`${baseInput} ${disabledInput}`}
                      />
                    </Field>

                    <Field label="Road / area / street" hint="Required">
                      <input
                        type="text"
                        name="roadAreaStreet"
                        value={formData.roadAreaStreet}
                        onChange={handleChange}
                        placeholder="Road name, Area, Street"
                        className={`${baseInput} ${disabledInput}`}
                      />
                    </Field>
                  </div>

                  {isDirty && (
                    <div className="mt-7 flex flex-col sm:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (profileData) {
                            setFormData({
                              companyName: profileData.companyName || "",
                              ownerName: profileData.ownerName || "",
                              email: profileData.email || "",
                              contactNumber: profileData.contactNumber || "",
                              additionalNumber: profileData.additionalNumber || "",
                              gstin: profileData.gstin || "",
                              buildingName: profileData.buildingName || "",
                              roadAreaStreet: profileData.roadAreaStreet || "",
                              city: profileData.city || "",
                              state: profileData.state || "",
                              country: profileData.country || "",
                              pincode: profileData.pincode || "",
                              logo: profileData.logo || "",
                            });
                            setPreviewURL(profileData.logo || "");
                            setIsDirty(false);
                          }
                        }}
                        className="
                          px-6 py-3.5 rounded-2xl text-sm font-extrabold
                          border border-slate-200
                          bg-white/80
                          hover:bg-white hover:shadow-md
                          transition active:scale-[0.99]
                        "
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="
                          px-6 py-3.5 rounded-2xl text-sm font-extrabold text-white
                          shadow-[0_18px_45px_rgba(133,112,238,0.35)]
                          hover:opacity-95 transition active:scale-[0.99]
                        "
                        style={{ backgroundColor: THEME }}
                      >
                        Save changes
                      </button>
                    </div>
                  )}

                  {!isDirty && (
                    <div className="mt-7 text-xs text-slate-500">
                      No changes to save.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Read-only and logo cards align in height. Editable section uses full width below.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


