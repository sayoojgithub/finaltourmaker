import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import ClientsToCreate from "./ClientsToCreate";
import CreateClient from "./CreateClient";

const tabData = [
  { label: "Clients To Create" },
  { label: "Search Created Clients" },
  { label: "Download Report" },
];

export default function FrontOfficerProfile() {
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefillClient, setPrefillClient] = useState(null);

  // NEW: controls whether we’re in “hidden” Create view
  const [inCreate, setInCreate] = useState(false);

  const activeLabel = inCreate
    ? "Create Client"
    : (tabData[activeTab]?.label ?? "");

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

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
    setInCreate(false);       // ensure we exit create mode when using the menu
    setActiveTab(idx);
    closeMenu();
  };

  // When user clicks ＋ on a row
  const handleCreateFromRow = (row) => {
    setPrefillClient(row);
    setInCreate(true);        // jump to hidden Create view
    closeMenu();
  };

  const renderTabContent = () => {
    if (inCreate) {
      return (
        <CreateClient
          prefill={prefillClient}
          onCancel={() => {
            setInCreate(false);
            setActiveTab(0); // go back to Clients To Create
          }}
        />
      );
    }
    switch (activeTab) {
      case 0:
        return <ClientsToCreate onCreate={handleCreateFromRow} />;
      case 1:
        // TODO: return your Search Created Clients component
        return null;
      case 2:
        // TODO: return your Download Report component
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto bg-white rounded-3xl shadow-md p-6 md:p-8 mb-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-[#8570EE] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8570EE]"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="purchaser-drawer"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <h2 className="text-xl md:text-2xl font-semibold text-[#222] truncate">
          {activeLabel}
        </h2>

        <div className="w-10 h-10" />
      </div>

      <main className="mt-6 min-h-[10rem]">{renderTabContent()}</main>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer (note: no Create Client item here) */}
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
                !inCreate && activeTab === idx
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
