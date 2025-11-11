import SalesManager from "../models/salesManagerModel.js";
import Country from "../models/countryModel.js";
import State from "../models/stateModel.js";
import Destination from "../models/destinationModel.js";
import AdRequest from "../models/adRequestModel.js";
import LeadRequest from "../models/leadRequestModel.js";
import UploadRequest from "../models/uploadRequestModel.js";
import DailyTaskRequest from "../models/dailyTaskRequestModel.js";
import GroupTour from "../models/groupTourModel.js";
import FixedTour from "../models/fixedTourModel.js";
import Executive from "../models/executiveModel.js";
import mongoose from "mongoose";
export async function getSalesManagerCountries(req, res) {
  try {
    const userId = req.userId; // set by verifyUser
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the sales manager
    const manager = await SalesManager.findById(userId).select("company status");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }

    

    // Ensure company exists on the manager
    if (!manager.company) {
      return res.status(404).json({ message: "Company not found for this user" });
    }

    // Fetch countries for the manager's company
    const countries = await Country.find({ company: manager.company })
      .select("_id name")
      .sort({ name: 1 });

    return res.status(200).json(countries);
  } catch (err) {
    console.error("getSalesManagerCountries error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSalesManagerStates(req, res) {
  try {
    const userId = req.userId; // set by verifyUser
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const manager = await SalesManager.findById(userId).select("company");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }
    const { countryId } = req.params;

    const states = await State.find({
      company: manager.company,
      country: countryId,
    })
      .select("_id name")
      .sort({ name: 1 });

    return res.status(200).json(states);
  } catch (err) {
    console.error("getSalesManagerStates error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSalesManagerDestinations(req, res) {
  try {
    const userId = req.userId; // set by verifyUser
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const manager = await SalesManager.findById(userId).select("company");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }

    const { countryId, stateId } = req.params;

    const destinations = await Destination.find({
      company: manager.company,
      country: countryId,
      state: stateId,
      activeStatus: true, // keep if you only want active destinations
    })
      .select("_id name")
      .sort({ name: 1 });

    return res.status(200).json(destinations);
  } catch (err) {
    console.error("getSalesManagerDestinations error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function createSalesManagerAdRequest(req, res) {
  try {
    const userId = req.userId; 
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Who is submitting?
    const manager = await SalesManager.findById(userId).select("company status");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }
   
   

    // Payload
    const {
      countryId,
      stateId,
      destinationId,
      task,
      date,       // user-selected date (string like '2025-08-20')
      quantity,
      details,
    } = req.body || {};


    // Server-side timestamp for request
    const now = new Date();
    // Format as YYYY-MM-DD and HH:mm:ss (server local time)
    const pad = (n) => String(n).padStart(2, "0");
    const requestedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const requestedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Create request
    const doc = await AdRequest.create({
      salesManager: manager._id,
      company: manager.company,
      country: countryId,
      state: stateId,
      destination: destinationId,
      task,
      date: date,           // scheduled/target date from UI
      quantity: quantity,
      details: details?.trim() || "",
      requestedAt: now,
      requestedDate,
      requestedTime,
      status: "processing",
    });

    return res.status(201).json({
      message: "Ad request created",
      id: doc._id,
      status: doc.status,
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
    });
  } catch (err) {
    console.error("createSalesManagerAdRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listSalesManagerAdRequests(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("company");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }

    let { page = 1, limit = 7, destinationId, task, date } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    const filter = { salesManager: manager._id };

    if (destinationId) filter.destination = destinationId;
    if (task) filter.task = task;

    if (date) {
      // date is expected as yyyy-mm-dd; filter AdRequest.date within that day
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      AdRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdRequest.countDocuments(filter),
    ]);

    const docs = items.map((it) => ({
      _id: it._id,
      destinationName: it.destination?.name || "",
      task: it.task,
      date: it.date, // frontend formats dd/mm/yyyy
      requestedDate: it.requestedDate, // "YYYY-MM-DD" string; frontend formats to dd/mm/yyyy
      requestedTime: it.requestedTime, // "HH:mm:ss"
      status: it.status,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("listSalesManagerAdRequests error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function getSalesManagerAdRequest(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("_id");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }

    const { id } = req.params;

    const doc = await AdRequest.findOne({
      _id: id,
      salesManager: manager._id,
    })
      .populate({ path: "country", select: "name" })
      .populate({ path: "state", select: "name" })
      .populate({ path: "destination", select: "name" })
      .lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });

    return res.json({
      _id: doc._id,
      // selection chain
      countryId: doc.country?._id?.toString() || null,
      countryName: doc.country?.name || "",
      stateId: doc.state?._id?.toString() || null,
      stateName: doc.state?.name || "",
      destinationId: doc.destination?._id?.toString() || null,
      destinationName: doc.destination?.name || "",
      // details
      task: doc.task,
      date: doc.date,            // ISO date; client slices to yyyy-mm-dd
      quantity: doc.quantity,
      details: doc.details || "",
      // meta (if you want to show more later)
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      status: doc.status,
      approvedDate: doc.approvedDate || null,
    approvedQuantity: doc.approvedQuantity ?? null,
    rejectionReason: doc.rejectionReason || "",
    updationReason: doc.updationReason || "",
    decidedAt: doc.decidedAt || null,
    });
  } catch (err) {
    console.error("getSalesManagerAdRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /salesManager/lead-requests
// export async function createSalesManagerLeadRequest(req, res) {
//   try {
//     const userId = req.userId;
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const manager = await SalesManager.findById(userId).select("company");
//     if (!manager) {
//       return res.status(401).json({ message: "You are not authorised" });
//     }

//     // Accept either tourRef or tourName from client (your UI currently sends tourName)
//     const {
//       countryId,
//       stateId,
//       destinationId,
//       tourRef,           // preferred key (schema)
//       tourName,         // alias from UI
//       startDate,
//       endDate,
//       quantity,
//       frequency,
//     } = req.body || {};

//     const now = new Date();
//     const pad = (n) => String(n).padStart(2, "0");
//     const requestedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
//     const requestedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

//     const doc = await LeadRequest.create({
//       salesManager: manager._id,
//       company: manager.company,
//       country: countryId,
//       state: stateId,
//       destination: destinationId,
//       tourRef: (tourRef ?? tourName ?? "").trim(),  // single field in DB
//       startDate,
//       endDate,
//       quantity,
//       frequency,
//       requestedAt: now,
//       requestedDate,
//       requestedTime,
//       status: "processing",
//     });

//     return res.status(201).json({
//       message: "Lead request created",
//       id: doc._id,
//       status: doc.status,
//       requestedDate: doc.requestedDate,
//       requestedTime: doc.requestedTime,
//     });
//   } catch (err) {
//     console.error("createSalesManagerLeadRequest error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }

// // GET /salesManager/lead-requests
// export async function listSalesManagerLeadRequests(req, res) {
//   try {
//     const userId = req.userId;
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const manager = await SalesManager.findById(userId).select("company");
//     if (!manager) {
//       return res.status(401).json({ message: "You are not authorised" });
//     }

//     let {
//       page = 1,
//       limit = 7,
//       destinationId,
//       frequency,          // filter
//       startDate,          // filter lower bound (YYYY-MM-DD)
//       endDate,            // filter upper bound (YYYY-MM-DD)
//     } = req.query;

//     page = Math.max(1, parseInt(page, 10) || 1);
//     limit = Math.max(1, parseInt(limit, 10) || 7);

//     const filter = { salesManager: manager._id };

//     if (destinationId) filter.destination = destinationId;
//     if (frequency) filter.frequency = frequency;

//     // Date range filters (inclusive day bounds)
//     const dayStart = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
//     const dayEnd   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

//     if (startDate) {
//       const d = new Date(startDate);
//       if (!Number.isNaN(d.getTime())) {
//         filter.startDate = { ...(filter.startDate || {}), $gte: dayStart(d) };
//       }
//     }
//     if (endDate) {
//       const d = new Date(endDate);
//       if (!Number.isNaN(d.getTime())) {
//         filter.endDate = { ...(filter.endDate || {}), $lte: dayEnd(d) };
//       }
//     }

//     const skip = (page - 1) * limit;

//     const [items, total] = await Promise.all([
//       LeadRequest.find(filter)
//         .populate({ path: "destination", select: "name" })
//         .sort({ requestedAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       LeadRequest.countDocuments(filter),
//     ]);

//     const docs = items.map((it) => ({
//       _id: it._id,
//       destinationName: it.destination?.name || "",
//       // alias for UI compatibility:
//       tourName: it.tourRef || "",     // your table currently reads r.tourName || r.articleNumber
//       startDate: it.startDate,
//       endDate: it.endDate,
//       quantity: it.quantity,
//       frequency: it.frequency,
//       status: it.status,
//       requestedDate: it.requestedDate,
//       requestedTime: it.requestedTime,
//     }));

//     return res.json({
//       docs,
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit) || 1,
//     });
//   } catch (err) {
//     console.error("listSalesManagerLeadRequests error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }


// export async function getSalesManagerLeadRequest(req, res) {
//   try {
//     const userId = req.userId;
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const manager = await SalesManager.findById(userId).select("_id");
//     if (!manager) {
//       return res.status(401).json({ message: "You are not authorised" });
//     }

//     const { id } = req.params;

//     const doc = await LeadRequest.findOne({
//       _id: id,
//       salesManager: manager._id,
//     })
//       .populate({ path: "country", select: "name" })
//       .populate({ path: "state", select: "name" })
//       .populate({ path: "destination", select: "name" })
//       .lean();

//     if (!doc) return res.status(404).json({ message: "Request not found" });

//     return res.json({
//       _id: doc._id,
//       // selection chain
//       countryId: doc.country?._id?.toString() || null,
//       countryName: doc.country?.name || "",
//       stateId: doc.state?._id?.toString() || null,
//       stateName: doc.state?.name || "",
//       destinationId: doc.destination?._id?.toString() || null,
//       destinationName: doc.destination?.name || "",

//       // details (alias tourRef -> tourName for your current UI)
//       tourRef: doc.tourRef || "",
//       tourName: doc.tourRef || "",

//       startDate: doc.startDate, // ISO date string
//       endDate: doc.endDate,     // ISO date string
//       quantity: doc.quantity,
//       frequency: doc.frequency,

//       // meta
//       requestedDate: doc.requestedDate,
//       requestedTime: doc.requestedTime,
//       status: doc.status,
//       approvedStartDate: doc.approvedStartDate || null,
//       approvedEndDate: doc.approvedEndDate || null,
//       approvedQuantity: doc.approvedQuantity ?? null,
//       approvedFrequency: doc.approvedFrequency || null,
//       rejectionReason: doc.rejectionReason || "",
//       updationReason:doc.updationReason || "",
//       decidedAt: doc.decidedAt || null,
//     });
//   } catch (err) {
//     console.error("getSalesManagerLeadRequest error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }
/** Utilities */
const pad = (n) => String(n).padStart(2, "0");
const dayStart = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const dayEnd   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

/** Create */
export async function createSalesManagerLeadRequest(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("company");
    if (!manager) return res.status(401).json({ message: "You are not authorised" });

    const {
      countryId,
      stateId,
      destinationId,
      // legacy text fallback for DB display
      tourName,
      tourRef,
      // NEW: "group:<id>" | "fixed:<id>"
      selectedTour,
      startDate,
      endDate,
      quantity,
      frequency,
    } = req.body || {};

    if (!countryId || !stateId || !destinationId) {
      return res.status(400).json({ message: "countryId, stateId and destinationId are required" });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }
    if (!quantity || !frequency) {
      return res.status(400).json({ message: "quantity and frequency are required" });
    }

    let selectedTourModel = null;
    let selectedTourId = null;
    // Always store a friendly string for display in lists
    let resolvedTourRef = (tourRef ?? tourName ?? "").trim();

    if (selectedTour && typeof selectedTour === "string" && selectedTour.includes(":")) {
      const [tType, tId] = selectedTour.split(":");
      if (tType === "group" && tId) {
        selectedTourModel = "GroupTour";
        selectedTourId = tId;
        const t = await GroupTour.findById(tId).select("tourName articleNumber");
        if (t?.tourName) resolvedTourRef = t.tourName.trim(); // use NAME only
        else if (t?.articleNumber) resolvedTourRef = t.articleNumber.trim();
      } else if (tType === "fixed" && tId) {
        selectedTourModel = "FixedTour";
        selectedTourId = tId;
        const t = await FixedTour.findById(tId).select("tourName articleNumber");
        if (t?.tourName) resolvedTourRef = t.tourName.trim(); // use NAME only
        else if (t?.articleNumber) resolvedTourRef = t.articleNumber.trim();
      }
    }

    if (!resolvedTourRef) {
      return res.status(400).json({ message: "Please select a tour or provide a tour name" });
    }

    const now = new Date();
    const requestedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const requestedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const doc = await LeadRequest.create({
      salesManager: manager._id,
      company: manager.company,
      country: countryId,
      state: stateId,
      destination: destinationId,
      tourRef: resolvedTourRef,      // NAME ONLY (or fallback)
      selectedTourModel,             // "GroupTour" | "FixedTour" | null
      selectedTourId,                // ObjectId | null
      startDate,
      endDate,
      quantity,
      frequency,
      requestedAt: now,
      requestedDate,
      requestedTime,
      status: "processing",
    });

    return res.status(201).json({
      message: "Lead request created",
      id: doc._id,
      status: doc.status,
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
    });
  } catch (err) {
    console.error("createSalesManagerLeadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/** List with filters & pagination */
export async function listSalesManagerLeadRequests(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("company");
    if (!manager) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 7,
      destinationId,
      frequency,
      startDate,
      endDate,
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    const filter = { salesManager: manager._id };
    if (destinationId) filter.destination = destinationId;
    if (frequency) filter.frequency = frequency;

    if (startDate) {
      const d = new Date(startDate);
      if (!Number.isNaN(d)) filter.startDate = { ...(filter.startDate || {}), $gte: dayStart(d) };
    }
    if (endDate) {
      const d = new Date(endDate);
      if (!Number.isNaN(d)) filter.endDate = { ...(filter.endDate || {}), $lte: dayEnd(d) };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LeadRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadRequest.countDocuments(filter),
    ]);

    const docs = items.map((it) => ({
      _id: it._id,
      destinationName: it.destination?.name || "",
      tourName: it.tourRef || "", // NAME ONLY
      startDate: it.startDate,
      endDate: it.endDate,
      quantity: it.quantity,
      frequency: it.frequency,
      status: it.status,
      requestedDate: it.requestedDate,
      requestedTime: it.requestedTime,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("listSalesManagerLeadRequests error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/** Get single (returns selectedTourValue + clean tour name) */
export async function getSalesManagerLeadRequest(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("_id");
    if (!manager) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;

    const doc = await LeadRequest.findOne({
      _id: id,
      salesManager: manager._id,
    })
      .populate({ path: "country", select: "name" })
      .populate({ path: "state", select: "name" })
      .populate({ path: "destination", select: "name" })
      .lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });

    // Build composite for UI select & guarantee name-only for tourRef/tourName
    let selectedTourValue = null;
    let cleanTourName = doc.tourRef || "";

    if (doc.selectedTourModel && doc.selectedTourId) {
      selectedTourValue =
        (doc.selectedTourModel === "GroupTour" ? "group:" : "fixed:") + String(doc.selectedTourId);

      // Prefer live tourName from source model
      if (doc.selectedTourModel === "GroupTour") {
        const t = await GroupTour.findById(doc.selectedTourId).select("tourName");
        if (t?.tourName) cleanTourName = t.tourName;
      } else if (doc.selectedTourModel === "FixedTour") {
        const t = await FixedTour.findById(doc.selectedTourId).select("tourName");
        if (t?.tourName) cleanTourName = t.tourName;
      }
    }

    return res.json({
      _id: doc._id,
      // selection chain
      countryId: doc.country?._id?.toString() || null,
      countryName: doc.country?.name || "",
      stateId: doc.state?._id?.toString() || null,
      stateName: doc.state?.name || "",
      destinationId: doc.destination?._id?.toString() || null,
      destinationName: doc.destination?.name || "",

      // details (name only)
      tourRef: cleanTourName,
      tourName: cleanTourName,

      // also return selectedTour for prefill
      selectedTourModel: doc.selectedTourModel || null,
      selectedTourId: doc.selectedTourId ? String(doc.selectedTourId) : null,
      selectedTourValue, // "group:<id>" | "fixed:<id>" | null

      startDate: doc.startDate,
      endDate: doc.endDate,
      quantity: doc.quantity,
      frequency: doc.frequency,

      // meta
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      status: doc.status,
      approvedStartDate: doc.approvedStartDate || null,
      approvedEndDate: doc.approvedEndDate || null,
      approvedQuantity: doc.approvedQuantity ?? null,
      approvedFrequency: doc.approvedFrequency || null,
      rejectionReason: doc.rejectionReason || "",
      updationReason: doc.updationReason || "",
      decidedAt: doc.decidedAt || null,
    });
  } catch (err) {
    console.error("getSalesManagerLeadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/** Merged tours for a destination (Group + Fixed) — labels show NAME only */
export async function listToursForDestination(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("company");
    if (!manager) return res.status(401).json({ message: "You are not authorised" });

    const { destinationId, q } = req.query;
    if (!destinationId) return res.status(400).json({ message: "destinationId is required" });

    const like = q
      ? {
          $or: [
            { tourName: { $regex: q, $options: "i" } },
            { articleNumber: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const matchBase = { company: manager.company, destination: destinationId, ...like };

    const [groupTours, fixedTours] = await Promise.all([
      GroupTour.find(matchBase).select("_id tourName startDate totalDays totalNights updatedAt").lean(),
      FixedTour.find(matchBase).select("_id tourName validFrom validTill updatedAt").lean(),
    ]);

    const options = [
      ...groupTours.map((t) => ({
        value: `group:${t._id}`,
        label: `${t.tourName || "(Untitled)"}`, // NAME only
        meta: {
          type: "group",
          id: String(t._id),
          title: t.tourName || "",
          subtitle: t.startDate
            ? `Starts ${new Date(t.startDate).toLocaleDateString("en-GB")} • ${t.totalDays ?? "-"}D/${t.totalNights ?? "-"}N`
            : `${t.totalDays ?? "-"}D/${t.totalNights ?? "-"}N`,
        },
        sortKey: t.updatedAt ? new Date(t.updatedAt).getTime() : 0,
      })),
      ...fixedTours.map((t) => ({
        value: `fixed:${t._id}`,
        label: `${t.tourName || "(Untitled)"}`, // NAME only
        meta: {
          type: "fixed",
          id: String(t._id),
          title: t.tourName || "",
          subtitle:
            t.validFrom || t.validTill
              ? `Valid ${t.validFrom ? new Date(t.validFrom).toLocaleDateString("en-GB") : "—"} → ${t.validTill ? new Date(t.validTill).toLocaleDateString("en-GB") : "—"}`
              : "Fixed Tour",
        },
        sortKey: t.updatedAt ? new Date(t.updatedAt).getTime() : 0,
      })),
    ]
      .sort((a, b) => b.sortKey - a.sortKey)
      .map(({ sortKey, ...o }) => o);

    return res.json(options);
  } catch (err) {
    console.error("listToursForDestination error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
// helper: safe regex for "contains" search
function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createUploadRequest(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("company");
    if (!manager) return res.status(401).json({ message: "You are not authorised" });

    const { category, filename, publishingDate } = req.body || {};
    if (!category || !filename) {
      return res.status(400).json({ message: "Category and filename are required" });
    }

    // validate publishingDate if present
    let pubDate = null;
    if (publishingDate) {
      const d = new Date(publishingDate);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: "Invalid publishing date" });
      }
      pubDate = d;
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const requestedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const requestedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const doc = await UploadRequest.create({
      salesManager: manager._id,
      company: manager.company,
      category,
      filename: filename.trim(),
      publishingDate: pubDate,
      requestedAt: now,
      requestedDate,
      requestedTime,
      status: "processing",
    });

    return res.status(201).json({
      message: "Upload request created",
      id: doc._id,
      status: doc.status,
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      publishingDate: doc.publishingDate,
    });
  } catch (err) {
    console.error("createUploadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /salesManager/upload-requests
// supports: ?page=1&limit=7&category=...&filename=...&requestedDate=YYYY-MM-DD&publishingDate=YYYY-MM-DD
export async function getUploadRequests(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      page = 1,
      limit = 7,
      category,
      filename,
      requestedDate,  // YYYY-MM-DD (string)
      publishingDate, // YYYY-MM-DD (string)
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const lim = Math.max(1, Number(limit) || 7);
    const skip = (pageNum - 1) * lim;

    const filter = { salesManager: userId };
    if (category) filter.category = category;
    if (filename) filter.filename = { $regex: escapeRegex(filename), $options: "i" };
    if (requestedDate) filter.requestedDate = requestedDate;

    // NEW: publishingDate filter (on Date field, match any time within that day)
    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        filter.publishingDate = { $gte: start, $lte: end };
      }
    }

    const [docs, total] = await Promise.all([
      UploadRequest.find(filter).sort({ requestedAt: -1 }).skip(skip).limit(lim).lean(),
      UploadRequest.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / lim));

    return res.json({
      docs,        // includes publishingDate if present
      page: pageNum,
      totalPages,
      total,
    });
  } catch (err) {
    console.error("getUploadRequests error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function getUploadRequestById(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const doc = await UploadRequest.findOne({ _id: id, salesManager: userId })
      .populate({ path: "assignedDigitalMarketer", select: "name email" })
      .lean();

    if (!doc) return res.status(404).json({ message: "Upload request not found" });

    // shape a convenient response (keeps old fields, adds DM name)
    return res.json({
      _id: doc._id,
      category: doc.category,
      filename: doc.filename,
      publishingDate: doc.publishingDate,
      approvedPublishingDate: doc.approvedPublishingDate,
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      status: doc.status,
      rejectionReason: doc.rejectionReason || "",
      updationReason: doc.updationReason || "",
      assignedDigitalMarketerId: doc.assignedDigitalMarketer?._id?.toString() || null,
      assignedDigitalMarketerName:
        doc.assignedDigitalMarketer?.name || doc.assignedDigitalMarketer?.email || "",
    });
  } catch (err) {
    console.error("getUploadRequestById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function createDailyTaskRequest(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const manager = await SalesManager.findById(userId).select("company status");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }

    // Payload (from DailyTaskRequest UI)
    const {
      countryId,
      stateId,
      destinationId,
      task,
      dates,      // array of 'YYYY-MM-DD' strings
      quantity,
      details,
    } = req.body || {};

    // Validate dates
    const asArray = Array.isArray(dates) ? dates : [];
    if (asArray.length === 0) {
      return res.status(400).json({ message: "Please provide at least one target date" });
    }

    // Normalize, dedupe, and convert to Date
    const dedup = Array.from(
      new Set(
        asArray
          .filter(Boolean)
          .map((d) => String(d).slice(0, 10)) // yyyy-mm-dd
      )
    );

    if (dedup.length === 0) {
      return res.status(400).json({ message: "No valid target dates were provided" });
    }

    const dateObjs = [];
    for (const s of dedup) {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: `Invalid date: ${s}` });
      }
      dateObjs.push(d);
    }

    // Server-side timestamp for request
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const requestedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const requestedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const doc = await DailyTaskRequest.create({
      salesManager: manager._id,
      company: manager.company,
      country: countryId,
      state: stateId,
      destination: destinationId,
      task,
      dates: dateObjs, // store as Date[]
      quantity,
      details: details?.trim() || "",
      requestedAt: now,
      requestedDate,
      requestedTime,
      status: "processing",
    });

    return res.status(201).json({
      message: "Daily task request created",
      id: doc._id,
      status: doc.status,
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
    });
  } catch (err) {
    console.error("createDailyTaskRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listDailyTaskRequests(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("company");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }

    let { page = 1, limit = 7, destinationId, task, date } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    const filter = { salesManager: manager._id };

    if (destinationId) filter.destination = destinationId;
    if (task) filter.task = task;

    if (date) {
      // Filter any request whose *any* target date falls within this day
      // date expected as 'YYYY-MM-DD'
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        filter.dates = { $elemMatch: { $gte: start, $lte: end } };
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DailyTaskRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DailyTaskRequest.countDocuments(filter),
    ]);

    const docs = items.map((it) => {
      // To help frontends that still look for "date", expose first date too
      const firstDate = Array.isArray(it.dates) && it.dates.length ? it.dates[0] : null;

      return {
        _id: it._id,
        destinationName: it.destination?.name || "",
        task: it.task,
        // MULTI
        dates: it.dates || [],
        // Legacy convenience (optional): first date
        date: firstDate || null,
        requestedDate: it.requestedDate, // "YYYY-MM-DD"
        requestedTime: it.requestedTime, // "HH:mm:ss"
        status: it.status,
      };
    });

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("listDailyTaskRequests error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getDailyTaskRequest(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId).select("_id");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }

    const { id } = req.params;

    const doc = await DailyTaskRequest.findOne({
      _id: id,
      salesManager: manager._id,
    })
      .populate({ path: "country", select: "name" })
      .populate({ path: "state", select: "name" })
      .populate({ path: "destination", select: "name" })
      .lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });

    // For client convenience return ISO-8601 strings (yyyy-mm-ddTHH:mm:ss.sssZ).
    // The UI can slice(0,10) to get 'YYYY-MM-DD'.
    const isoDates = Array.isArray(doc.dates) ? doc.dates.map((d) => d?.toISOString?.() || d) : [];

    return res.json({
      _id: doc._id,
      // selection chain
      countryId: doc.country?._id?.toString() || null,
      countryName: doc.country?.name || "",
      stateId: doc.state?._id?.toString() || null,
      stateName: doc.state?.name || "",
      destinationId: doc.destination?._id?.toString() || null,
      destinationName: doc.destination?.name || "",
      // details
      task: doc.task,
      dates: isoDates,            // <— multi-dates
      // optional: legacy single date (first)
      date: isoDates[0] || null,
      quantity: doc.quantity,
      details: doc.details || "",
      // meta
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      status: doc.status,
      approvedDates: Array.isArray(doc.approvedDates) ? doc.approvedDates.map((d) => d?.toISOString?.() || d) : [],
      approvedQuantity: doc.approvedQuantity ?? null,
      rejectionReason: doc.rejectionReason || "",
      updationReason: doc.updationReason || "",
      decidedAt: doc.decidedAt || null,
    });
  } catch (err) {
    console.error("getDailyTaskRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function listExecutivesForSalesManager(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const manager = await SalesManager.findById(userId)
      .select("company type branch franchisee");
    if (!manager) {
      return res.status(401).json({ message: "You are not authorised" });
    }

    let { page = 1, limit = 7, search = "" } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    const filter = {
      company: manager.company,
      type: manager.type,
    };
    if (manager.branch) filter.branch = manager.branch;
    if (manager.franchisee) filter.franchisee = manager.franchisee;

    if (search && String(search).trim().length) {
      const safe = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: safe, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Executive.find(filter)
        .select("name contactNumber email status createdAt")
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Executive.countDocuments(filter),
    ]);

    return res.json({
      docs: items.map((it) => ({
        _id: it._id,
        name: it.name,
        contactNumber: it.contactNumber,
        email: it.email,
        status: it.status,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("listExecutivesForSalesManager error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listAllCompanyDestinationsForManager(req, res) {
  try {
    const manager = await SalesManager.findById(req.userId).select("company");
    if (!manager) return res.status(401).json({ message: "Unauthorized" });

    const dests = await Destination.find({ company: manager.company })
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    const options = dests.map((d) => ({ _id: d._id, value: d.name, label: d.name }));
    return res.json(options);
  } catch (err) {
    console.error("listAllCompanyDestinationsForManager:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /salesManager/executives/:id/preferences
 * → Fetch a single executive and return all preference arrays.
 */
export async function getExecutivePreferences(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid executive ID" });

    const exec = await Executive.findById(id)
      .select(
        "name email contactNumber status " +
          "prefTourCategories prefPrimaryDestinations prefGroupTypes prefNumberOfDays " +
          "prefClientTypes prefCurrentLocations prefBehaviours prefConnectedThrough prefClientContactOptions"
      )
      .lean();

    if (!exec) return res.status(404).json({ message: "Executive not found" });

    return res.json(exec);
  } catch (err) {
    console.error("getExecutivePreferences:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * PUT /salesManager/executives/:id/preferences
 * → Replace all provided preference arrays for the given executive.
 */
export async function updateExecutivePreferences(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid executive ID" });

    const allowed = [
      "prefTourCategories",
      "prefPrimaryDestinations",
      "prefGroupTypes",
      "prefNumberOfDays",
      "prefClientTypes",
      "prefCurrentLocations",
      "prefBehaviours",
      "prefConnectedThrough",
      "prefClientContactOptions"
    ];

    const $set = {};
    for (const k of allowed) {
      if (k in req.body) $set[k] = Array.isArray(req.body[k]) ? req.body[k] : [];
    }

    // sanitize days
    if ("prefNumberOfDays" in $set) {
      $set.prefNumberOfDays = $set.prefNumberOfDays
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n > 0 && n <= 365)
        .map((n) => Math.trunc(n));
    }

    const updated = await Executive.findByIdAndUpdate(id, { $set }, { new: true })
      .select(
        "prefTourCategories prefPrimaryDestinations prefGroupTypes prefNumberOfDays " +
          "prefClientTypes prefCurrentLocations prefBehaviours prefConnectedThrough prefClientContactOptions"
      );

    if (!updated) return res.status(404).json({ message: "Executive not found" });
    return res.json(updated);
  } catch (err) {
    console.error("updateExecutivePreferences:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}