import React, { useState } from "react";
import CreativeStaffAdRequestManagement from "./CreativeStaffAdRequestManagement";
import CreativeStaffLeadRequestManagement from "./CreativeStaffLeadRequestManagement";
import CreativeStaffUploadRequestManagement from "./CreativeStaffUploadRequestManagement";
import CreativeStaffDailyTaskRequestManagement from "./CreativeStaffDailyTaskRequestManagement";
import CreativeStaffAssignedAdTaskManagement from "./CreativeStaffAssignedAdTaskManagement";
import CreativeStaffAssignedLeadTaskManagement from "./CreativeStaffAssignedLeadTaskManagement";
import CreativeStaffUploadTaskManagement from "./CreativeStaffUploadTaskManagement";

export default function CreativeStaffWorkManagement() {
  const [active, setActive] = useState("adrequest"); // default

  const tabs = [
    { key: "adrequest", label: "Ad Request" },
    { key: "leadrequest", label: "Lead Request" },
    { key: "uploadrequest", label: "Upload Request" },
    // { key: "dailytaskrequest", label: "Daily Task Request" },
    { key:"adtask", label:"Ad Task"},
    { key:"leadtask", label:"Lead Task"},
    { key:"uploadtask", label:"Upload Task"}
  ];

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-5 py-2 rounded-full border text-sm font-medium transition-all w-full sm:w-auto text-center
              ${
                active === t.key
                  ? "bg-[#8570EE] text-white border-[#8570EE] shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Render Selected Component */}
      <div className="mt-6">
        {active === "adrequest" && <CreativeStaffAdRequestManagement />}
        {active === "leadrequest" && <CreativeStaffLeadRequestManagement />}
        {active === "uploadrequest" && <CreativeStaffUploadRequestManagement />}
        {/* {active === "dailytaskrequest" && <CreativeStaffDailyTaskRequestManagement />} */}
        {active === "adtask" && <CreativeStaffAssignedAdTaskManagement />}
        {active === "leadtask" && <CreativeStaffAssignedLeadTaskManagement />}
        {active === "uploadtask" && <CreativeStaffUploadTaskManagement />}
      </div>
    </div>
  );
}
