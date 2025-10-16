// import React, { useState, useRef } from "react";
// import { ArrowLeft, ArrowRight } from "lucide-react";
// import Profile from "./Profile";
// import AddBank from "./AddBank";
// import TermsAndConditions from "./TermsAndConditions";
// import CreateBranch from "./CreateBranch";
// import CreateFranchisee from "./CreateFranchisee";
// import CreateAgent from "./CreateAgent";
// import CreateEmployee from "./CreateEmployee";

// const tabData = [
//   { label: "Profile" },
//   { label: "Bank Details"},
//   { label: "T & C"},
//   { label: "Create Branch"},
//   { label: "Create Franchisee"},
//   { label: "Create Agent"},
//   { label: "Create Employee"}


// ];

// export default function CompanyProfile() {
//   const [activeTab, setActiveTab] = useState(0);
//   const scrollRef = useRef(null);

//   const scrollTabs = (direction) => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollBy({
//         left: direction === "left" ? -150 : 150,
//         behavior: "smooth",
//       });
//     }
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 0:
//         return <Profile />;
//       case 1:
//         return <AddBank />;
//       case 2:
//         return <TermsAndConditions />;
//       case 3:
//         return <CreateBranch />;
//       case 4:
//         return <CreateFranchisee />
//       case 5:
//         return <CreateAgent />
//       case 6:
//         return <CreateEmployee />  
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       {/* Scrollable Tab Container */}
//       <div
//         className="tab-container"
//         style={{
//           maxWidth: 900,
//           margin: "20px auto 0",
//           display: "flex",
//           alignItems: "center",
//           gap: 12,
//         }}
//       >
//         {/* Scroll Left Button */}
//         <button onClick={() => scrollTabs("left")}>
//           <ArrowLeft size={20} color="#ffffff" />
//         </button>

//         {/* Tab Buttons */}
//         <div
//           style={{
//             flex: 1,
//             background: "#EAEAEA",
//             borderRadius: "20px",
//             boxShadow: "0 2px 8px rgba(162,89,255,0.07)",
//             overflow: "hidden",
//           }}
//         >
//           <div
//             ref={scrollRef}
//             style={{
//               display: "flex",
//               overflowX: "auto",
//               scrollbarWidth: "none",
//               msOverflowStyle: "none",
//             }}
//           >
//             {tabData.map((tab, idx) => (
//               <button
//                 key={tab.label}
//                 onClick={() => setActiveTab(idx)}
//                 className="tab-button"
//                 style={{
//                   flex: "0 0 auto",
//                   padding: "18px 32px",
//                   background: activeTab === idx ? "#8570EE" : "transparent",
//                   color: activeTab === idx ? "#fff" : "#222",
//                   border: "none",
//                   outline: "none",
//                   fontWeight: 600,
//                   fontSize: 18,
//                   cursor: "pointer",
//                   transition: "background 0.2s, color 0.2s",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Scroll Right Button */}
//         <button onClick={() => scrollTabs("right")}>
//           <ArrowRight size={20} color="#ffffff" />
//         </button>
//       </div>

//       {/* Tab Content */}
//       <div className="mt-6">{renderTabContent()}</div>
//     </>
//   );
// }
import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import Profile from "./Profile";
import AddBank from "./AddBank";
import TermsAndConditions from "./TermsAndConditions";
import CreateBranch from "./CreateBranch";
import CreateFranchisee from "./CreateFranchisee";
import CreateAgent from "./CreateAgent";
import CreateEmployee from "./CreateEmployee";

const tabData = [
  { label: "Profile" },
  { label: "Bank Details"},
  { label: "T & C"},
  { label: "Create Branch"},
  { label: "Create Franchisee"},
  { label: "Create Agent"},
  { label: "Create Employee"}


];

export default function CompanyProfile() {
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Profile />;
      case 1:
        return <AddBank />;
      case 2:
        return <TermsAndConditions />;
      case 3:
        return <CreateBranch />;
      case 4:
        return <CreateFranchisee />
      case 5:
        return <CreateAgent />
      case 6:
        return <CreateEmployee />  
      default:
        return null;
    }
  };

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





