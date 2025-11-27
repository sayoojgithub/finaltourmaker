
import React, { useEffect, useState } from "react";
import {
  Sparkles,
  PhoneMissed,
  WifiOff,
  MailCheck,
  HeartHandshake,
  CheckCircle2,
  Info,
} from "lucide-react";
import API from "../../api";
import { toast } from "react-toastify";
import SalesClients from "./SalesClients";

export default function ClientCategories() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  console.log(selectedCategory)

  // categories we actually show
  const categories = [
    { id: "new", label: "New Clients", icon: Sparkles },
    { id: "not-answered", label: "Not Answered", icon: PhoneMissed },
    { id: "not-reachable", label: "Not Reachable", icon: WifiOff },
    { id: "detail-sent", label: "Detail Sent", icon: MailCheck },
    { id: "interested", label: "Interested", icon: HeartHandshake },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "todo", label: "To Do", icon: Sparkles }, // special button
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await API.get("/executive/client-categories");
        setStats(res.data?.categories || {});
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to load client categories";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [statsRefreshKey]);
  const handleStatusChange = () => {
  // 🔹 whenever a client moves (New → Not Answered etc.)
  //     we want to refresh the category stats
  setStatsRefreshKey((prev) => prev + 1);
};
   if (selectedCategory) {
    return <SalesClients  category={selectedCategory} onBack={() => setSelectedCategory(null)} onStatusChange={handleStatusChange}  />;
  }
  return (
    <div className=" w-full flex items-center justify-center px-6">
      <div className="grid items-stretch gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isTodo = cat.id === "todo";

          const count =
            stats && Object.prototype.hasOwnProperty.call(stats, cat.id)
              ? stats[cat.id]
              : 0;

          // ---------- SPECIAL "TO DO" BUTTON ----------
          if (isTodo) {
            return (
              <div
                key={cat.id}
                className="
                  col-span-1 sm:col-span-2 lg:col-span-3
                  flex justify-center
                "
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="
                    px-8 py-4
                    rounded-3xl
                    bg-white
                    border-2
                    shadow-sm
                    hover:shadow-md hover:scale-[1.02]
                    transition-all duration-200
                    text-center
                    text-[#8570EE] font-semibold text-lg
                  "
                  style={{
                    borderColor: "#8570EE",
                  }}
                >
                  To Do
                </button>
              </div>
            );
          }

          // ---------- NORMAL CATEGORY BUTTONS ----------
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className="
                group relative w-full h-full
                rounded-3xl px-7 py-7
                flex items-center justify-between gap-4
                border border-white/25
                shadow-[0_22px_45px_rgba(0,0,0,0.28)]
                bg-[#8570EE]/90 backdrop-blur-xl
                overflow-visible
                transform-gpu
                transition-transform duration-200 ease-out
                hover:-translate-y-1 hover:scale-[1.01]
                hover:shadow-[0_30px_70px_rgba(0,0,0,0.35)]
              "
              style={{
                backgroundImage:
                  "linear-gradient(145deg, rgba(190,176,255,0.9) 0%, rgba(133,112,238,0.97) 40%, rgba(98,75,206,1) 100%)",
              }}
            >
              {/* inner glass layer */}
              <div className="pointer-events-none absolute inset-[1px] rounded-[1.7rem] bg-white/5" />

              {/* icon block */}
              <div
                className="
                  relative z-[1]
                  flex items-center justify-center
                  h-20 w-20
                  rounded-3xl
                  bg-white/18
                  border border-white/35
                  shadow-[0_12px_26px_rgba(0,0,0,0.35)]
                  transition-transform duration-200
                  group-hover:-translate-y-1
                "
              >
                <Icon className="h-10 w-10 text-white drop-shadow-md group-hover:scale-[1.05] transition-transform" />
              </div>

              {/* label + MOBILE details */}
              <div className="relative z-[1] flex flex-col text-left">
                <span className="text-xl font-semibold text-white drop-shadow-sm">
                  {cat.label}
                </span>

                {/* MOBILE ONLY: show count inside button */}
                <div className="mt-2 text-xs text-white/90 sm:hidden">
                  <div className="font-semibold">
                    {loading ? "Loading..." : `${count} clients`}
                  </div>
                </div>
              </div>

              {/* DESKTOP glassy popup with count */}
              <div className="absolute left-1/2 -top-5 -translate-x-1/2 hidden sm:block pointer-events-none">
                <div
                  className="
                    opacity-0 translate-y-2
                    group-hover:opacity-100 group-hover:translate-y-0
                    transition-all duration-200
                    rounded-2xl px-4 py-2
                    bg-white/20 backdrop-blur-xl
                    border border-white/40
                    shadow-[0_8px_22px_rgba(0,0,0,0.25)]
                    flex items-center gap-3
                  "
                >
                  <div className="h-6 w-6 rounded-xl bg-white/25 flex items-center justify-center">
                    <Info className="h-3.5 w-3.5 text-white/90" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-white">
                      {loading ? "Loading..." : `${count} clients`}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
