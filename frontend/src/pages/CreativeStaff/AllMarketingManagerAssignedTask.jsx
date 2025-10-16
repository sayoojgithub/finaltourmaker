import React, { useState } from "react";
import AssignedAdTask from "./AssignedAdTask";
import AssignedLeadTask from "./AssignedLeadTask";
import AssignedUploadTask from "./AssignedUploadTask";
export default function AllMarketingManagerAssignedTask() {
  const [active, setActive] = useState("adrequest"); // default

  const tabs = [
    { key: "adrequest", label: "Assigned Ad Task" },
    { key: "leadrequest", label: "Assigned Lead Task" },
    { key: "uploadrequest", label: "Assigned Upload Task" },
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
        {active === "adrequest" && <AssignedAdTask/> }
        {active === "leadrequest" && <AssignedLeadTask/>}
        {active === "uploadrequest" && <AssignedUploadTask/>}
        {/* {active === "dailytaskrequest" && <DailyTaskRequest/>} */}
      </div>
    </div>
  );
}
