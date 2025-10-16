import React, { useState, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Profile from "./Profile";
import RegisterCompany from "./RegisterCompany";
import RegisteredCompanies from "./RegisteredCompanies";

const tabData = [
  { label: "Profile" },
  { label: "Register Company" },
  { label: "Registered Companies" }
];

export default function SalesProfile() {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef(null);

  const scrollTabs = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -150 : 150,
        behavior: "smooth",
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Profile />;
      case 1:
        return <RegisterCompany />;
      case 2:
        return <RegisteredCompanies />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Scrollable Tab Container */}
      <div
        className="tab-container"
        style={{
          maxWidth: 900,
          margin: "20px auto 0",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Scroll Left Button */}
        <button onClick={() => scrollTabs("left")}>
          <ArrowLeft size={20} color="#ffffff" />
        </button>

        {/* Tab Buttons */}
        <div
          style={{
            flex: 1,
            background: "#EAEAEA",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(162,89,255,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {tabData.map((tab, idx) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(idx)}
                className="tab-button"
                style={{
                  flex: "0 0 auto",
                  padding: "18px 32px",
                  background: activeTab === idx ? "#8570EE" : "transparent",
                  color: activeTab === idx ? "#fff" : "#222",
                  border: "none",
                  outline: "none",
                  fontWeight: 600,
                  fontSize: 18,
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Right Button */}
        <button onClick={() => scrollTabs("right")}>
          <ArrowRight size={20} color="#ffffff" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{renderTabContent()}</div>
    </>
  );
}
