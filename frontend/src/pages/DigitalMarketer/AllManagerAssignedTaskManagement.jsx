import React, { useState } from "react";
import DigitalMarketerAssignedAdTasks from "./DigitalMarketerAssignedAdTasks";
import DigitalMarketerAssignedLeadTasks from "./DigitalMarketerAssignedLeadTasks";
import DigitalMarketerAssignedUploadTasks from "./DigitalMarketerAssignedUploadTasks";
export default function AllManagerAssignedTaskManagement() {
  const [active, setActive] = useState("adtask"); // default

  const tabs = [
    { key: "adtask", label: "Assigned Ad Task" },
    { key: "leadtask", label: "Assigned Lead Task" },
    { key: "uploadtask", label: "Assigned Upload Task" },
    
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
        {active === "adtask" && <DigitalMarketerAssignedAdTasks/> }
        {active === "leadtask" && <DigitalMarketerAssignedLeadTasks/>}
        {active === "uploadtask" && <DigitalMarketerAssignedUploadTasks/>}
        {/* {active === "dailytaskrequest" && <DailyTaskRequest/>} */}
      </div>
    </div>
  );
}
