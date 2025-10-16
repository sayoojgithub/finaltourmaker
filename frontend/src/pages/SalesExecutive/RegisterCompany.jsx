
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../../api';

const RegisterCompany = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    contactNumber: '',
    additionalNumber: '',
    buildingName: '',
    roadAreaStreet: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
   const validateFields = () => {
    for (const [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        toast.error(`${key.charAt(0).toUpperCase() + key.slice(1)} is mandatory`);
        return false;
      }
    }
    return true;
  };
   useEffect(() => {
     const fetchPincodeDetails = async () => {
       const isValidPincode = formData.pincode.length === 6 && /^\d{6}$/.test(formData.pincode);
   
       if (isValidPincode) {
         try {
           const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
           const data = await response.json();
   
           if (data[0].Status === "Success") {
             const postOffice = data[0].PostOffice?.[0];
             if (postOffice) {
               setFormData((prev) => ({
                 ...prev,
                 city: postOffice.District || '',
                 state: postOffice.State || '',
                 country: postOffice.Country || '',
               }));
             }
           } else {
             // API call was successful but no data returned
             toast.error("Invalid Pincode. Please check the pincode.");
             setFormData((prev) => ({
               ...prev,
               city: '',
               state: '',
               country: '',
             }));
           }
         } catch (err) {
           toast.error("Failed to fetch pincode details.");
           setFormData((prev) => ({
             ...prev,
             city: '',
             state: '',
             country: '',
           }));
         }
       } else {
         // Pincode is incomplete or invalid
         setFormData((prev) => ({
           ...prev,
           city: '',
           state: '',
           country: '',
         }));
       }
     };
   
     fetchPincodeDetails();
   }, [formData.pincode]);
console.log(formData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    try {
      const res = await API.post("/salesExecutive/registerCompany", formData);
      toast.success(res.data.message || "Company registered successfully");
      setFormData({
        companyName: '',
        ownerName: '',
        email: '',
        contactNumber: '',
        additionalNumber: '',
        buildingName: '',
        roadAreaStreet: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="w-full max-w-7xl bg-white rounded-3xl shadow-lg p-4 md:p-8 mx-auto mb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 h-full">
        
        {/* Left Panel */}
        <div className="w-full md:w-1/2 h-auto flex flex-col rounded-xl p-4">
          <h5 className="text-2xl md:text-3xl font-Abril text-[#321F6A] mb-2">
            Register a company
          </h5>
          <h5 className="text-xs md:text-sm font-Inter text-[#8570EE] mb-4">
            Please enter your details without error
          </h5>
          <img
            src="src/assets/Home.png"
            alt="Illustration"
            className="max-h-72 object-contain"
          />
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 rounded-xl p-6 flex justify-center items-center">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Company name (In block letters)"
                className="w-full px-4 py-2 border rounded-md focus:outline-none"
              />
                <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Owner's Name"
                className="w-full px-4 py-2 border rounded-md focus:outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-md focus:outline-none"
              />
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Contact Number"
                className="w-full px-4 py-2 border rounded-md focus:outline-none"
              />
                <input
                type="tel"
                name="additionalNumber"
                value={formData.additionalNumber}
                onChange={handleChange}
                placeholder="Additional Number"
                className="w-full px-4 py-2 border rounded-md focus:outline-none"
              />
              <input
                type="text"
                name="buildingName"
                value={formData.buildingName}
                onChange={handleChange}
                placeholder="Building name"
                className="w-full px-4 py-2 border rounded-md focus:outline-none"
              />
              <input
                type="text"
                name="roadAreaStreet"
                value={formData.roadAreaStreet}
                onChange={handleChange}
                placeholder="Road name, Area, Street"
                className="w-full px-4 py-2 border rounded-md focus:outline-none"
              />
              <div className="flex gap-4">
              <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  className="w-1/2 px-4 py-2 border rounded-md focus:outline-none"
                />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-1/2 px-4 py-2 border rounded-md focus:outline-none"
                />
                
              </div>
              <div className="flex gap-4">
              <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-1/2 px-4 py-2 border rounded-md focus:outline-none"
                />
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="w-1/2 px-4 py-2 border rounded-md focus:outline-none"
                />
               
              </div>
              <button
                type="submit"
                className="w-full bg-[#8570EE] hover:bg-purple-600 text-white font-medium py-2 rounded-md"
              >
                Register
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default RegisterCompany;
