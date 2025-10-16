import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import DigitalMarketerAdPosting from "./DigitalMarketerAdPosting";
import DigitalMarketerLeadRequests from "./DigitalMarketerLeadRequests";
import DigitalMarketerUploadRequests from "./DigitalMarketerUploadRequests";
import AllTaskManagement from "./AllTaskManagement";
import AllManagerAssignedTaskManagement from "./AllManagerAssignedTaskManagement";
// const tabData = [
//   { label: "Ad Requests" },
//   { label: "Lead Requests" },
//   { label: "Uploads Requests" },
//   { label: "Daily Task Requests"}


// ];
const tabData = [
  { label: "Manager Approved Tasks"},
  { label: "Manager Assigned Tasks"}
]

export default function DigitalMarketerProfile() {
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false); // one toggle for ALL viewports

  const activeLabel = tabData[activeTab]?.label ?? "";

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  // ESC to close + prevent background scroll when menu is open (all sizes)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  const handleSelect = (idx) => {
    setActiveTab(idx);
    closeMenu();
  };

  // const renderTabContent = () => {
  //   switch (activeTab) {
  //     case 0:
  //       return <DigitalMarketerAdPosting/>
  //     case 1:
  //       return <DigitalMarketerLeadRequests/>
  //     case 2:
  //       return <DigitalMarketerUploadRequests/>
  //     case 3:
  //       return 
  //     case 4:
  //       return 
  //     default:
  //       return null;
  //   }
  // };
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <AllTaskManagement/>
      case 1:
        return <AllManagerAssignedTaskManagement/>
      default:
        return null;
    }
  }

  return (
    <div className="w-full max-w-[100rem] mx-auto bg-white rounded-3xl shadow-md p-6 md:p-8 mb-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Menu button: same on all viewports */}
        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-[#8570EE] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="purchaser-drawer"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
          {/* <span className="hidden sm:inline">Menu</span> */}
        </button>

        <h2 className="text-xl md:text-2xl font-semibold text-[#222] truncate">
          {activeLabel}
        </h2>

        {/* spacer */}
        <div className="w-10 h-10" />
      </div>

      {/* Content area stays full-width; the menu is a drawer overlay for ALL sizes */}
      <main className="mt-6 min-h-[10rem]">{renderTabContent()}</main>

      {/* Backdrop (all sizes) */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer (all sizes) */}
      <div
        id="purchaser-drawer"
        className={`fixed inset-y-0 left-0 w-80 md:w-96 max-w-[90%] bg-white z-50 shadow-2xl transform transition-transform duration-300 will-change-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Purchaser navigation"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Choose a section</span>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-2 overflow-y-auto max-h-[calc(100vh-64px)]">
          {tabData.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => handleSelect(idx)}
              className={[
                "w-full flex items-center gap-2 px-4 py-3 rounded-xl text-left font-semibold",
                activeTab === idx
                  ? "bg-[#8570EE] text-white"
                  : "text-[#222] hover:bg-gray-100",
              ].join(" ")}
            >
              <span className="truncate">{tab.label}</span>
              <ChevronRight className="ml-auto opacity-60" size={16} />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}