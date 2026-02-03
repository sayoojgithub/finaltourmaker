// ContactFlowModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  PhoneOff,
  Voicemail,
  Ban,
  CheckCircle2,
  X,
  Edit3,
  MapPin,
  CircleDot,
  Clock,
  AlertOctagon,
  CalendarClock,
  FileText,
  Wallet,
  Plane,
} from "lucide-react";

// import ClientDetailsPanel from "./ClientDetailsPanel";
import ClientDetailsPanel from "./ClientDetailsPanel";
// import ContactFlowRightPanel from "./ContactFlowRightPanel";
import ContactFlowRightPanel from "./ContactFlowRightPanel";
// import TourPickerOverlay from "./TourPickerOverlay";
import TourPickerOverlay from "./TourPickerOverlay";
import GroupTourFullDetail from "./GroupTourFullDetail";
import FixedTourFullDetail from "./FixedTourFullDetail";
import CustomTourItineraryModal from "./CustomTourItineraryModal"
/* =========================
   CONTACT FLOW LOGIC
========================= */

const FLOW = {
  root: {
    label: "How did the call go?",
    options: [
      { id: "not_answered", label: "Not answered", icon: Voicemail },
      { id: "answered", label: "Answered", icon: PhoneCall },
      { id: "not_reachable", label: "Not reachable", icon: PhoneOff },
    ],
  },
  not_answered: {
    label: "What happened?",
    options: [
      { id: "full_ring", label: "Full ring", icon: Clock },
      { id: "busy", label: "Busy", icon: AlertOctagon },
      { id: "cut_phone", label: "Cut phone", icon: Ban },
      { id: "blocked", label: "Blocked", icon: Ban },
    ],
    terminal: true,
  },
  not_reachable: {
    label: "Reason?",
    options: [
      { id: "switched_off", label: "Switched off", icon: PowerIcon },
      { id: "out_of_coverage", label: "Out of coverage", icon: MapPin },
    ],
    terminal: true,
  },
  answered: {
    label: "Result?",
    options: [
      { id: "details_sent", label: "Details sent", icon: FileText },
      { id: "interested", label: "Interested", icon: CircleDot },
      { id: "not_interested", label: "Not interested", icon: X },
      { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    ],
  },
  details_sent_tourtype: {
    label: "Which tour type?",
    options: [
      { id: "fixed_tour", label: "Fixed Tour", icon: Plane },
      { id: "group_tour", label: "Group Tour", icon: Plane },
      { id: "custom_tour", label: "Custom Tour", icon: Edit3 },
    ],
  },
  fixed_tours: {
    label: "Fixed tours",
    options: [],
  },
  group_tours: {
    label: "Group tours",
    options: [],
  },
  interested: {
    label: "Next step",
    options: [
      { id: "book_tomorrow", label: "Book tomorrow", icon: CalendarClock },
      { id: "hold", label: "Hold", icon: Clock },
      { id: "change", label: "Change", icon: Edit3 },
    ],
  },
  change: {
    label: "Change what?",
    options: [
      { id: "itinerary_change", label: "Itinerary", icon: Plane },
      { id: "price_change", label: "Price", icon: Wallet },
      { id: "destination_change", label: "Destination", icon: MapPin },
      { id: "date_change", label: "Date", icon: CalendarClock },
    ],
  },
  not_interested: {
    label: "Why not?",
    options: [
      { id: "price_high", label: "Price high", icon: Wallet },
      { id: "not_right_time", label: "Not right time", icon: Clock },
      { id: "not_intended_tour", label: "Not intended tour", icon: Plane },
      { id: "group_full", label: "Group full", icon: AlertOctagon },
    ],
    terminal: true,
  },
};

function PowerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} {...props}>
      <path
        d="M12 2v10m6.364-6.364a9 9 0 11-12.728 0"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================
   MAIN MODAL
========================= */

export default function ContactFlowModal({
  open,
  onClose,
  client,
  brand,
  onCreateItinerary,
  onEditClient,
  demoTours,
  onSaveClient,
  savingClient,
  onStatusUpdated,
}) {
  const [path, setPath] = useState([]);
  const [note, setNote] = useState("");
  const [completed, setCompleted] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourPickerOpen, setTourPickerOpen] = useState(false);
  const [tourPickerType, setTourPickerType] = useState(null);
  const [customTourOpen, setCustomTourOpen] = useState(false);
  const brandColor = brand?.color || "#8570EE";
 
  // 🔒 HARD FREEZE BG SCROLL (body + html)
  useEffect(() => {
    if (!open) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open]);

  const reset = () => {
    setPath([]);
    setNote("");
    setCompleted(false);
    setTourPickerOpen(false);
    setTourPickerType(null);
  };

  const closeAll = () => {
    reset();
    onClose?.();
  };
  const handleItineraryStatusUpdated = () => {
  // 🔁 refresh SalesClients + ClientCategories
  if (typeof onStatusUpdated === "function") {
    onStatusUpdated();
  }
  // 🚪 close the whole contact flow modal → back to SalesClients table
  closeAll();
};
const handleCustomTourCompleted = () => {
  // refresh SalesClients + ClientCategories
  if (typeof onStatusUpdated === "function") {
    onStatusUpdated();
  }
  setCustomTourOpen(false);
  closeAll(); // closes the whole ContactFlowModal
};

  const currentKey = path.length === 0 ? "root" : path[path.length - 1];
  const node = FLOW[currentKey] || { label: "", options: [] };

  const breadcrumb = ["root", ...path];
  const basePercent = 15 + breadcrumb.length * 15;
  const percent = completed ? 100 : Math.min(100, basePercent);

  const isFixedOrGroupStep =
    currentKey === "fixed_tours" || currentKey === "group_tours";

  const onPick = (opt) => {
    if (currentKey === "root") {
      setPath([opt.id]);
      return;
    }

    if (currentKey === "answered") {
      if (opt.id === "details_sent") {
        setPath([...path, "details_sent_tourtype"]);
        return;
      }
      if (opt.id === "confirmed") {
        onCreateItinerary?.(client, { reason: "confirmed" });
        setCompleted(true);
        return;
      }
      if (opt.id === "interested") {
        setPath([...path, opt.id]);
        return;
      }
      if (opt.id === "not_interested") {
        setPath([...path, opt.id]);
        return;
      }
      if (opt.id === "custom_tour") {
    setPath([...path, "custom_tour"]);
    setCustomTourOpen(true);
    return;
  }
    }

    if (currentKey === "details_sent_tourtype") {
      if (opt.id === "custom_tour") {
    // open custom tour modal instead of direct itinerary creation
    setPath([...path, "custom_tour"]);
    setCustomTourOpen(true);
    return;
  }
      if (opt.id === "fixed_tour") {
        setPath([...path, "fixed_tours"]);
        setTourPickerType("fixed");
        setTourPickerOpen(true);
        return;
      }
      if (opt.id === "group_tour") {
        setPath([...path, "group_tours"]);
        setTourPickerType("group");
        setTourPickerOpen(true);
        return;
      }
    }

    // if (currentKey === "interested") {
    //   if (opt.id === "book_tomorrow" || opt.id === "hold") {
    //     setPath([...path, opt.id]);
    //     return;
    //   }
    //   if (opt.id === "change") {
    //     setPath([...path, opt.id]);
    //     return;
    //   }
    // }
    if (currentKey === "interested") {
  if (opt.id === "book_tomorrow" || opt.id === "hold") {
    setPath([...path, opt.id]);
    setCompleted(true); // ✅ open FollowupScheduler immediately
    return;
  }
  if (opt.id === "change") {
    setPath([...path, opt.id]);
    return;
  }
}


    if (currentKey === "change") {
      if (opt.id === "itinerary_change" || opt.id === "price_change") {
        onCreateItinerary?.(client, { reason: "details_sent", from: "change" });
        setCompleted(true);
        return;
      }
      // if (opt.id === "destination_change") {
      //   onEditClient?.(client, { what: "destination" });
      //   setCompleted(true);
      //   return;
      // }
      // if (opt.id === "date_change") {
      //   onEditClient?.(client, { what: "date" });
      //   setCompleted(true);
      //   return;
      // }
      if (opt.id === "destination_change" || opt.id === "date_change") {
  setPath([...path, opt.id]);   // ✅ go next step (destination_change / date_change)
  return;                       // ❌ don't complete yet
}
    }

    if (
      currentKey === "not_answered" ||
      currentKey === "not_reachable" ||
      currentKey === "not_interested"
    ) {
      setCompleted(true);
      return;
    }

    if (path.includes("book_tomorrow") || path.includes("hold")) {
      setCompleted(true);
      return;
    }

    setPath([...path, opt.id]);
  };

  const goStepBack = () => {
    if (completed) {
      setCompleted(false);
      return;
    }
    if (path.length > 0) {
      setPath((prev) => prev.slice(0, -1));
    }
  };

  if (!open || !client) return null;

  return (
    <AnimatePresence>
      {/* FULL-SCREEN OVERLAY, NO SCROLL HERE */}
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        />

        {/* Split layout container */}
        <motion.div
          className="relative w-full max-w-6xl mx-2 sm:mx-4 my-6 flex flex-col md:flex-row gap-4 max-h-[90vh]"
          initial={{ y: 30, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.97 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
            mass: 0.9,
          }}
        >
          {/* LEFT: CLIENT DETAILS PANEL (separate component) */}
          <div className="flex-1 rounded-3xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col min-h-0">
            <ClientDetailsPanel
              client={client}
              brandColor={brandColor}
              // NEW: pass save handler + saving flag
              onSave={(updates) => onSaveClient?.(client._id, updates)}
              saving={savingClient}
            />
          </div>

          {/* RIGHT: FLOW PANEL (separate component) */}
          <div className="flex-[1.2] rounded-3xl bg-white shadow-[0_24px_60px_rgba(88,28,135,0.35)] overflow-hidden flex flex-col min-h-0">
            <ContactFlowRightPanel
              client={client}
              brandColor={brandColor}
              breadcrumb={breadcrumb}
              percent={percent}
              node={node}
              path={path}
              currentKey={currentKey}
              completed={completed}
              note={note}
              setNote={setNote}
              onPick={onPick}
              goStepBack={goStepBack}
              isFixedOrGroupStep={isFixedOrGroupStep}
              tourPickerOpen={tourPickerOpen}
              // onReopenTours={() => setTourPickerOpen(true)}
              onReopenTours={(type) => {
                setTourPickerType(type); // 🔥 set correct type here
                setTourPickerOpen(true); // open overlay
              }}
              onMiniQuestionDone={() => setCompleted(true)}
              onCloseAll={closeAll}
              onStatusUpdated={onStatusUpdated}
            />
          </div>

          {/* FULL-WIDTH TOUR PICKER OVERLAY (on top of split) */}
          {/* {tourPickerOpen && (
            <TourPickerOverlay
              client={client}
              tourType={tourPickerType}
              brandColor={brandColor}
              demoTours={demoTours}
              onClose={() => setTourPickerOpen(false)}
              onSelectTour={(tour) => {
                onCreateItinerary?.(client, {
                  reason: "details_sent",
                  tourType: tour.type,
                  tourId: tour.id,
                });
                setCompleted(true);
                setTourPickerOpen(false);
              }}
            />
          )} */}
          {tourPickerOpen && (
  <TourPickerOverlay
    client={client}
    tourType={tourPickerType}
    brandColor={brandColor}
    demoTours={demoTours}
    onClose={() => setTourPickerOpen(false)}
    onSelectTour={(tour) => {
      // ⬇️ open full detail component instead of directly creating itinerary
      setSelectedTour({
        ...tour,
        clientId: client._id,
        clientName: client.name,
      });
      setTourPickerOpen(false);
    }}
  />
)}
{selectedTour && selectedTour.type === "group" && (
  <GroupTourFullDetail
    tour={selectedTour}
    brandColor={brandColor}
    onClose={() => {
      // 1. Close detail
      setSelectedTour(null);
      // 2. Re-open group tours list
      setTourPickerType("group");
      setTourPickerOpen(true);
    }}
    onCompleted={handleItineraryStatusUpdated}
  />
)}

{selectedTour && selectedTour.type === "fixed" && (
  <FixedTourFullDetail
    tour={selectedTour}
    brandColor={brandColor}
      onClose={() => {
      setSelectedTour(null);
      setTourPickerType("fixed");
      setTourPickerOpen(true);
    }}
    onCompleted={handleItineraryStatusUpdated}
  />
)}
{customTourOpen && (
  <CustomTourItineraryModal
    client={client}
    brandColor={brandColor}
    onClose={() => setCustomTourOpen(false)}
    onCompleted={handleCustomTourCompleted}
  />
)}



        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
