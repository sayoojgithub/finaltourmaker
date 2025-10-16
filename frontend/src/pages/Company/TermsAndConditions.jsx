// import React from 'react';
// import {
//   Lock,
//   MapPin,
//   Image,
//   Code2,
//   Smile,
//   List,
//   Settings,
//   CalendarDays,
//   Download,
//   Maximize2,
// } from 'lucide-react';

// const TextEditor = ({ label }) => {
// return (
//     <form>
//         <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50">
//             <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
//                 <div className="flex flex-wrap items-center divide-gray-200 sm:divide-x sm:rtl:divide-x-reverse">
//                     <div className="flex items-center space-x-1 rtl:space-x-reverse sm:pe-4">
//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <Lock className="w-4 h-4" />
//                             <span className="sr-only">Attach file</span>
//                         </button>

//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <MapPin className="w-4 h-4" />
//                             <span className="sr-only">Embed map</span>
//                         </button>

//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <Image className="w-4 h-4" />
//                             <span className="sr-only">Upload image</span>
//                         </button>

//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <Code2 className="w-4 h-4" />
//                             <span className="sr-only">Format code</span>
//                         </button>

//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <Smile className="w-4 h-4" />
//                             <span className="sr-only">Add emoji</span>
//                         </button>
//                     </div>

//                     <div className="flex flex-wrap items-center space-x-1 rtl:space-x-reverse sm:ps-4">
//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <List className="w-4 h-4" />
//                             <span className="sr-only">Add list</span>
//                         </button>

//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <Settings className="w-4 h-4" />
//                             <span className="sr-only">Settings</span>
//                         </button>

//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <CalendarDays className="w-4 h-4" />
//                             <span className="sr-only">Timeline</span>
//                         </button>

//                         <button
//                             type="button"
//                             className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//                         >
//                             <Download className="w-4 h-4" />
//                             <span className="sr-only">Download</span>
//                         </button>
//                     </div>
//                 </div>

//                 <button
//                     type="button"
//                     data-tooltip-target="tooltip-fullscreen"
//                     className="p-2 text-gray-500 rounded-sm cursor-pointer sm:ms-auto hover:text-gray-900 hover:bg-gray-100"
//                 >
//                     <Maximize2 className="w-4 h-4" />
//                     <span className="sr-only">Full screen</span>
//                 </button>

//                 <div
//                     id="tooltip-fullscreen"
//                     role="tooltip"
//                     className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip"
//                 >
//                     Show full screen
//                     <div className="tooltip-arrow" data-popper-arrow></div>
//                 </div>
//             </div>

//             <div className="px-4 py-2 bg-white rounded-b-lg">
//                 <label htmlFor="editor" className="sr-only">
//                     {label}
//                 </label>
//                 <textarea
//                     id="editor"
//                     rows="8"
//                     className="block w-full px-0 text-sm text-gray-800 bg-white border-0 focus:ring-0 placeholder-gray-400"
//                     placeholder="Write an article..."
//                     required
//                 ></textarea>
//             </div>
//         </div>

//         <div className="flex gap-3">
//             <button
//                 type="submit"
//                 className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-[#8570EE] rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
//             >
//                 Save Edit
//             </button>
//             <button
//                 type="button"
//                 className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-lg focus:ring-4 focus:ring-gray-300 hover:bg-gray-300"
//             >
//                 Cancel
//             </button>
//         </div>
//     </form>
// );
// };

// const TermsAndConditions = () => {
//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-white rounded-3xl shadow-sm mt-10">
//       <h2 className="text-xl font-semibold text-gray-800 mb-6">
//         Add Company Terms & Conditions
//       </h2>

//       <form className="space-y-6">
//         <TextEditor label="Enter Itinerary Terms & Conditions" />
//         <TextEditor label="Enter Invoice Terms & Conditions" />
//         <TextEditor label="Enter Voucher Terms & Conditions" />
//       </form>
//     </div>
//   );
// };

// export default TermsAndConditions;
// import React, { useEffect, useState } from "react";
// import TextEditor from "./TextEditor";
// import API from "../../api";
// import { toast } from "react-toastify";

// const TermsAndConditions = () => {
//   const [initialData, setInitialData] = useState({
//     itineraryTerms: "",
//     invoiceTerms: "",
//     voucherTerms: "",
//   });

//   const [formData, setFormData] = useState({
//     itineraryTerms: "",
//     invoiceTerms: "",
//     voucherTerms: "",
//   });

//   useEffect(() => {
//     const fetchTerms = async () => {
//       try {
//         const res = await API.get("/company/terms");
//         const { itineraryTerms, invoiceTerms, voucherTerms } = res.data || {};
//         setFormData({ itineraryTerms, invoiceTerms, voucherTerms });
//         setInitialData({ itineraryTerms, invoiceTerms, voucherTerms });
//       } catch (err) {
//         toast.error(err.response?.data?.message || "Failed to load terms");
//       }
//     };

//     fetchTerms();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await API.put("/company/terms", formData);
//       toast.success("Terms & Conditions updated!");
//       setInitialData(formData); // Sync state
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save terms");
//     }
//   };

//   const handleCancel = () => {
//     setFormData(initialData);
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-white rounded-3xl shadow-sm mt-10">
//       <h2 className="text-xl font-semibold text-gray-800 mb-6">
//         Add Company Terms & Conditions
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <TextEditor
//           label="Enter Itinerary Terms & Conditions"
//           value={formData.itineraryTerms}
//           onChange={(val) =>
//             setFormData((prev) => ({ ...prev, itineraryTerms: val }))
//           }
//         />
//         <TextEditor
//           label="Enter Invoice Terms & Conditions"
//           value={formData.invoiceTerms}
//           onChange={(val) =>
//             setFormData((prev) => ({ ...prev, invoiceTerms: val }))
//           }
//         />
//         <TextEditor
//           label="Enter Voucher Terms & Conditions"
//           value={formData.voucherTerms}
//           onChange={(val) =>
//             setFormData((prev) => ({ ...prev, voucherTerms: val }))
//           }
//         />

//         <div className="flex gap-3">
//           <button
//             type="submit"
//             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[#8570EE] rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-[#6f5edc]"
//           >
//             Save Edit
//           </button>
//           <button
//             type="button"
//             onClick={handleCancel}
//             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg focus:ring-4 focus:ring-gray-300 hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default TermsAndConditions;

import React, { useEffect, useState } from "react";
import TextEditor from "./TextEditor";
import API from "../../api";
import { toast } from "react-toastify";

const TermsAndConditions = () => {
  const [formData, setFormData] = useState({
    itineraryTerms: "",
    invoiceTerms: "",
    voucherTerms: "",
  });

  const [initialData, setInitialData] = useState({
    itineraryTerms: "",
    invoiceTerms: "",
    voucherTerms: "",
  });

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await API.get("/company/terms");
        const { itineraryTerms, invoiceTerms, voucherTerms } = res.data || {};
        setFormData({ itineraryTerms, invoiceTerms, voucherTerms });
        setInitialData({ itineraryTerms, invoiceTerms, voucherTerms });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load terms");
      }
    };

    fetchTerms();
  }, []);

  const handleSave = async (type) => {
    try {
      const updatedTerms = {
        ...initialData,
        [type]: formData[type],
      };

      await API.put("/company/terms", updatedTerms);
      setInitialData(updatedTerms);
      toast.success(`${type} saved successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  const handleCancel = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: initialData[type],
    }));
  };

  return (
    <div className="max-w-[100rem] mx-auto p-6 bg-white rounded-3xl shadow-sm mt-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Add Company Terms & Conditions
      </h2>

      <div className="space-y-6">
        {/* Itinerary */}
        <TextEditor
          label="Enter Itinerary Terms & Conditions"
          value={formData.itineraryTerms}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, itineraryTerms: val }))
          }
        />
        <div className="flex gap-3 mb-1 justify-end">
          <button
            onClick={() => handleSave("itineraryTerms")}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[#8570EE] rounded-lg hover:bg-[#6f5edc]"
          >
            Save Edit
          </button>
          <button
            onClick={() => handleCancel("itineraryTerms")}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Add Invoice Terms & Conditions
      </h2>

        {/* Invoice */}
        <TextEditor
          label="Enter Invoice Terms & Conditions"
          value={formData.invoiceTerms}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, invoiceTerms: val }))
          }
        />
        <div className="flex gap-3 mb-1 justify-end">
          <button
            onClick={() => handleSave("invoiceTerms")}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[#8570EE] rounded-lg hover:bg-[#6f5edc]"
          >
            Save Edit
          </button>
          <button
            onClick={() => handleCancel("invoiceTerms")}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Add Voucher Terms & Conditions
      </h2>

        {/* Voucher */}
        <TextEditor
          label="Enter Voucher Terms & Conditions"
          value={formData.voucherTerms}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, voucherTerms: val }))
          }
        />
        <div className="flex gap-3 mb-6 justify-end">
          <button
            onClick={() => handleSave("voucherTerms")}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[#8570EE] rounded-lg hover:bg-[#6f5edc]"
          >
            Save Edit
          </button>
          <button
            onClick={() => handleCancel("voucherTerms")}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
