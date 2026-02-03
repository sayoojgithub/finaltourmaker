// // src/controllers/executiveController.js
// import mongoose from "mongoose";
// import Client from "../models/clientModel.js";
// import Executive from "../models/executiveModel.js";

// export async function getExecutiveClientCategories(req, res) {
//   try {
//     const executiveId = req.userId;
//     if (!executiveId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (!mongoose.isValidObjectId(executiveId)) {
//       return res.status(400).json({ message: "Invalid executiveId" });
//     }

//     const exec = await Executive.findById(executiveId)
//       .select("_id status")
//       .lean();

//     if (!exec) {
//       return res.status(404).json({ message: "Executive not found" });
//     }

//     // Fetch only clients actively managed by this executive, with some status history
//     const clients = await Client.find({
//       executiveId: executiveId,
//       executiveManagingStatus: true,
//       "statusUpdatedByExecutive.0": { $exists: true },
//     })
//       .select("statusUpdatedByExecutive")
//       .lean();

//     const categories = {
//       "new": 0,
//       "not-answered": 0,
//       "not-reachable": 0,
//       "detail-sent": 0,
//       "interested": 0,
//       "confirmed": 0,
//     };

//     for (const c of clients) {
//       const history = c.statusUpdatedByExecutive || [];
//       if (!history.length) continue;

//       const first = history[0];
//       const rest = history.slice(1);
//       const last = history[history.length - 1];
//       const lastStatus = (last.status || "").trim();

//       // Special rules: ignoring first status
//       const allRestNotAnswered =
//         rest.length > 0 &&
//         rest.every((s) => (s.status || "").trim() === "Not Answered");

//       const allRestNotReachable =
//         rest.length > 0 &&
//         rest.every((s) => (s.status || "").trim() === "Not Reachable");

//       let bucketId = null;

//       // 1) Handle special Not Answered / Not Reachable rules
//       if (allRestNotAnswered) {
//         bucketId = "not-answered";
//       } else if (allRestNotReachable) {
//         bucketId = "not-reachable";
//       } else {
//         // 2) Otherwise: classify based on last status
//         switch (lastStatus) {
//           case "New Client":
//             bucketId = "new";
//             break;
//           case "Detail Sent":
//           case "Details Sent":
//             bucketId = "detail-sent";
//             break;
//           case "Interested":
//             bucketId = "interested";
//             break;
//           case "Confirmed":
//             bucketId = "confirmed";
//             break;
//           case "Not Answered":
//             bucketId = "not-answered";
//             break;
//           case "Not Reachable":
//             bucketId = "not-reachable";
//             break;
//           default:
//             bucketId = null;
//         }
//       }

//       if (bucketId && Object.prototype.hasOwnProperty.call(categories, bucketId)) {
//         categories[bucketId] += 1;
//       }
//     }

//     return res.json({ categories });
//   } catch (err) {
//     console.error("getExecutiveClientCategories error:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// }
import puppeteer from "puppeteer";
import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
import mongoose from "mongoose";
import Client from "../models/clientModel.js";
import Executive from "../models/executiveModel.js";
import Destination from "../models/destinationModel.js";
import GroupTour from "../models/groupTourModel.js";
import FixedTour from "../models/fixedTourModel.js";
import Country from "../models/countryModel.js";
import State from "../models/stateModel.js";
import Trip from "../models/tripModel.js";
import AddOnTrip from "../models/addontripModel.js";
import Activity from "../models/activityModel.js";
import Food from "../models/foodModel.js";
import Accommodation from "../models/accommodationModel.js";
import Vendor from "../models/vendorModel.js";
import Company from "../models/companyModel.js";
import Vehicle from "../models/vehicleModel.js";
/** Helper: classify one client based on statusUpdatedByExecutive history */
function getExecutiveBucketId(history = []) {
  if (!Array.isArray(history) || history.length === 0) return null;

  let maxVal = -1;

  for (const item of history) {
    if (!item) continue;
    const v = typeof item.value === "number" ? item.value : null;
    if (v === null) continue;
    if (v > maxVal) {
      maxVal = v;
    }
  }

  if (maxVal < 0) return null;

  switch (maxVal) {
    case 0:
      return "new";
    case 1:
      return "not-reachable";
    case 2:
      return "not-answered";
    case 3:
      return "detail-sent";
    case 4:
      return "interested";
    case 5:
      return "not-interested";
    case 6:
      return "confirmed";
    default:
      return null;
  }
}

export async function getExecutiveClientCategories(req, res) {
  try {
    const executiveId = req.userId;
    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }

    const exec = await Executive.findById(executiveId)
      .select("_id status")
      .lean();

    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const clients = await Client.find({
      executiveId: executiveId,
      executiveManagingStatus: true,
      "statusUpdatedByExecutive.0": { $exists: true },
    })
      .select("statusUpdatedByExecutive")
      .lean();

    const categories = {
      new: 0,
      "not-answered": 0,
      "not-reachable": 0,
      "detail-sent": 0,
      interested: 0,
      confirmed: 0,
    };

    for (const c of clients) {
      const bucketId = getExecutiveBucketId(c.statusUpdatedByExecutive || []);
      if (
        bucketId &&
        Object.prototype.hasOwnProperty.call(categories, bucketId)
      ) {
        categories[bucketId] += 1;
      }
    }

    return res.json({ categories });
  } catch (err) {
    console.error("getExecutiveClientCategories error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/** NEW: list clients for an executive by category, with backend pagination */
export async function listExecutiveClients(req, res) {
  try {
    const executiveId = req.userId;
    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }

    const exec = await Executive.findById(executiveId)
      .select("_id status")
      .lean();
    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    let {
      category = "",
      page = 1,
      limit = 10,
      search = "",
      sortKey = "date", // "date" | "destination"
      sortDir = "asc",
      type = "all", // "all" | "urgent" | "non-urgent"
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    sortDir = sortDir === "desc" ? "desc" : "asc";
    category = String(category || "").trim();

    const searchLower = String(search || "")
      .trim()
      .toLowerCase();
    const typeFilter =
      type === "urgent" || type === "non-urgent" ? type : "all";

    // Base filter: only this executive, actively managing, with some history
    const baseFilter = {
      executiveId: new mongoose.Types.ObjectId(executiveId),
      executiveManagingStatus: true,
      "statusUpdatedByExecutive.0": { $exists: true },
    };

    // Fetch minimal fields we need
    const rawClients = await Client.find(baseFilter)
      .select(
        "clientId name startDate primaryDestinationName clientType statusUpdatedByExecutive"
      )
      .lean();

    // 1) classify each client into bucket
    let filtered = [];
    for (const c of rawClients) {
      const bucketId = getExecutiveBucketId(c.statusUpdatedByExecutive || []);

      // "todo" → no special logic yet, show all matching this exec
      if (category && category !== "todo") {
        if (bucketId !== category) continue;
      }

      // urgency filter
      // urgency filter (fixed)
      if (typeFilter !== "all") {
        const val = (c.clientType?.value || "").toLowerCase();

        const isUrgent = val.startsWith("urgent"); // "urgent contact"
        const isNonUrgent = val.startsWith("non urgent"); // "non urgent contact"

        if (typeFilter === "urgent" && !isUrgent) continue;
        if (typeFilter === "non-urgent" && !isNonUrgent) continue;
      }

      // search only on client name
      if (searchLower) {
        const nameLower = (c.name || "").toLowerCase();
        if (!nameLower.includes(searchLower)) continue;
      }

      filtered.push(c);
    }

    // 2) sort in memory: only by tour date OR destination
    filtered.sort((a, b) => {
      const A = (a.clientType?.value || "").toLowerCase();
      const B = (b.clientType?.value || "").toLowerCase();

      const aUrg = A.startsWith("urgent");
      const bUrg = B.startsWith("urgent");

      if (aUrg !== bUrg) return aUrg ? -1 : 1; // urgent at top
      let valA;
      let valB;

      if (sortKey === "destination") {
        const destA =
          a.primaryDestinationName?.label ||
          a.primaryDestinationName?.value ||
          "";
        const destB =
          b.primaryDestinationName?.label ||
          b.primaryDestinationName?.value ||
          "";
        valA = destA.toLowerCase();
        valB = destB.toLowerCase();
      } else {
        // default: sort by startDate
        const tA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const tB = b.startDate ? new Date(b.startDate).getTime() : 0;
        valA = tA;
        valB = tB;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    // 3) pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const docsSlice = filtered.slice(start, start + limit);

    // 4) shape docs for frontend
    const docs = docsSlice.map((c) => ({
      _id: c._id,
      clientId: c.clientId,
      name: c.name || "",
      startDate: c.startDate || null,
      destination:
        c.primaryDestinationName?.label ||
        c.primaryDestinationName?.value ||
        "",
      clientType: c.clientType || null,
    }));

    return res.json({
      docs,
      page: safePage,
      limit,
      total,
      totalPages,
    });
  } catch (err) {
    console.error("listExecutiveClients error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getExecutiveClientById(req, res) {
  try {
    const executiveId = req.userId;
    const clientId = req.params.id;

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid client id" });
    }

    const exec = await Executive.findById(executiveId)
      .select("_id status")
      .lean();
    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const client = await Client.findOne({
      _id: clientId,
      executiveId: new mongoose.Types.ObjectId(executiveId),
      executiveManagingStatus: true,
    }).lean();

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.json({ client });
  } catch (err) {
    console.error("getExecutiveClientById error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 🔹 PUT /executive/clients/:id
// Update editable fields for a client belonging to this executive
export async function updateExecutiveClient(req, res) {
  try {
    const executiveId = req.userId;
    const clientId = req.params.id;

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid client id" });
    }

    const exec = await Executive.findById(executiveId)
      .select("_id status")
      .lean();
    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const body = req.body || {};

    // Only allow these fields to be changed by executive
    const allowedFields = [
      "name",
      "mobileNumber",
      "whatsappNumber",
      "email",
      "tourType",
      "primaryDestinationName",
      "addonDestinations",
      "groupType",
      "numberOfPersons",
      "startDate",
      "endDate",
      "numberOfDays",
      "pincode",
      "district",
      "state",
      "clientContactOption",
      "clientType",
      "clientCurrentLocation",
      "connectedThrough",
      "behavior",
      "gstNumber",
      "additionalRequirements",
    ];

    const update = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        update[key] = body[key];
      }
    }

    // Optional: recompute numberOfDays for safety if both dates present
    if (update.startDate && update.endDate && !update.numberOfDays) {
      const s = new Date(update.startDate);
      const e = new Date(update.endDate);
      if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
        const sd = new Date(s);
        const ed = new Date(e);
        sd.setHours(0, 0, 0, 0);
        ed.setHours(0, 0, 0, 0);
        const diff = (ed - sd) / (1000 * 60 * 60 * 24);
        if (diff >= 0) {
          update.numberOfDays = diff + 1;
        }
      }
    }

    const client = await Client.findOneAndUpdate(
      {
        _id: clientId,
        executiveId: new mongoose.Types.ObjectId(executiveId),
        executiveManagingStatus: true,
      },
      { $set: update },
      { new: true }
    ).lean();

    if (!client) {
      return res
        .status(404)
        .json({ message: "Client not found or not managed by this executive" });
    }

    return res.json({ message: "Client updated", client });
  } catch (err) {
    console.error("updateExecutiveClient error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function listExecutiveDestinations(req, res) {
  try {
    const ExecutiveId = req.userId;
    if (!ExecutiveId) return res.status(401).json({ message: "Unauthorized" });

    const ex = await Executive.findById(ExecutiveId).select("company");
    if (!ex) return res.status(404).json({ message: "Executive not found" });

    // Find destinations for this company
    const dests = await Destination.find({
      company: ex.company,
    })
      .select("_id name destinationCode")
      .sort({ name: 1 })
      .lean();

    // Return as { _id, value, label }
    const options = dests.map((d) => ({
      _id: d._id,
      value: d.name,
      label: d.name, // you could enrich with code: `${d.name} • ${d.destinationCode}`
    }));

    return res.json(options);
  } catch (err) {
    console.error("listEntryDestinations error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateExecutiveNotAnsweredStatus(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      status, // should be "not_answered"
      reasonId,
      reasonLabel,
      nextDateRaw, // "YYYY-MM-DD"
      nextTimeRaw, // "HH:MM"
      nextDateISO, // ISO string or null
      nextDateReadable, // "23 Nov 2025"
      nextDateTimeReadable, // "23 Nov 2025, 10:30 AM"
    } = req.body || {};

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }

    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    // Basic validation – we NEED a reason and a scheduled date & time
    if (status !== "not_answered") {
      return res
        .status(400)
        .json({ message: "Invalid status, must be 'not_answered'" });
    }

    if (!reasonId || !reasonLabel) {
      return res
        .status(400)
        .json({ message: "Reason is required for not answered case" });
    }

    if (!nextDateRaw || !nextTimeRaw) {
      return res.status(400).json({
        message: "Scheduled date and time are required",
      });
    }

    // Make sure executive exists
    const exec = await Executive.findById(executiveId)
      .select("_id name")
      .lean();

    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    // Make sure client belongs to this executive and is actively managed
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        message: "Client not found or not managed by this executive",
      });
    }

    /* ============================
       1) Build current IST date/time
    ============================ */

    const now = new Date();
    // Shift to IST (UTC+5:30) – adjust if your server already runs in IST
    // const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
    // const ist = new Date(istMs);
    const ist = now;
    const dd = String(ist.getDate()).padStart(2, "0");
    const mm = String(ist.getMonth() + 1).padStart(2, "0");
    const yyyy = ist.getFullYear();
    const hh = String(ist.getHours()).padStart(2, "0");
    const min = String(ist.getMinutes()).padStart(2, "0");

    const todayDateStr = `${dd}/${mm}/${yyyy}`; // "22/11/2025"
    const todayTimeStr = `${hh}:${min}`; // "15:22"

    /* ============================
       2) Push statusUpdatedByExecutive entry
    ============================ */

    const statusEntry = {
      status: "Not Answered",
      value: 2,
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr, // "dd/mm/yyyy"
      time: todayTimeStr, // "HH:MM"
      createdAt: ist, // proper Date object
      reasonLabel,
    };

    client.statusUpdatedByExecutive.push(statusEntry);

    /* ============================
       3) Push ScheduleDatesByExecutives entry
    ============================ */

    // Build JS Date from scheduled date + time
    let scheduledDateObj = null;

    if (nextDateISO) {
      const tmp = new Date(nextDateISO);
      if (!Number.isNaN(tmp.getTime())) {
        scheduledDateObj = tmp;
      }
    }

    // Fallback: construct from raw date/time if ISO not given / invalid
    if (!scheduledDateObj) {
      const combined = `${nextDateRaw}T${nextTimeRaw || "00:00"}:00`;
      const tmp = new Date(combined);
      if (!Number.isNaN(tmp.getTime())) {
        scheduledDateObj = tmp;
      }
    }

    const scheduleEntry = {
      status: "Not Answered",
      reasonLabel,
      scheduledDate: scheduledDateObj, // proper Date object
      scheduledTimeRaw: nextTimeRaw, // "HH:MM"
      scheduledDateTimeReadable: nextDateTimeReadable || null, // "23 Nov 2025, 10:30 AM"
      executiveId: exec._id,
      executiveName: exec.name || null,
      createdAt: ist,
      createdAtISO: ist.toISOString(),
    };

    if (!Array.isArray(client.ScheduleDatesByExecutives)) {
      client.ScheduleDatesByExecutives = [];
    }
    client.ScheduleDatesByExecutives.push(scheduleEntry);

    /* ============================
       4) Save and respond
    ============================ */

    await client.save();

    return res.json({
      message: "Not answered status & follow-up saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("updateExecutiveNotAnsweredStatus error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function updateExecutiveNotReachableStatus(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      status, // should be "not_reachable"
      reasonId,
      reasonLabel,
      nextDateRaw, // "YYYY-MM-DD"
      nextTimeRaw, // "HH:MM"
      nextDateISO, // ISO string or null
      nextDateReadable, // "23 Nov 2025" (not used now but okay to accept)
      nextDateTimeReadable, // "23 Nov 2025, 10:30 AM"
    } = req.body || {};

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }

    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    // status must be "not_reachable"
    if (status !== "not_reachable") {
      return res
        .status(400)
        .json({ message: "Invalid status, must be 'not_reachable'" });
    }

    if (!reasonId || !reasonLabel) {
      return res
        .status(400)
        .json({ message: "Reason is required for not reachable case" });
    }

    if (!nextDateRaw || !nextTimeRaw) {
      return res.status(400).json({
        message: "Scheduled date and time are required",
      });
    }

    // Make sure executive exists
    const exec = await Executive.findById(executiveId)
      .select("_id name")
      .lean();

    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    // Fetch client (you can tighten this to check executiveId if you want)
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        message: "Client not found or not managed by this executive",
      });
    }

    // 1) Build current IST date/time
    const now = new Date();
    // const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
    // const ist = new Date(istMs);
    const ist = now;
    const dd = String(ist.getDate()).padStart(2, "0");
    const mm = String(ist.getMonth() + 1).padStart(2, "0");
    const yyyy = ist.getFullYear();
    const hh = String(ist.getHours()).padStart(2, "0");
    const min = String(ist.getMinutes()).padStart(2, "0");

    const todayDateStr = `${dd}/${mm}/${yyyy}`; // "dd/mm/yyyy"
    const todayTimeStr = `${hh}:${min}`; // "HH:MM"

    // 2) Push statusUpdatedByExecutive entry
    const statusEntry = {
      status: "Not Reachable", // 👈 HUMAN LABEL
      value: 1, // 👈 THIS IS IMPORTANT FOR BUCKET: "not-reachable"
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      reasonLabel,
    };

    if (!Array.isArray(client.statusUpdatedByExecutive)) {
      client.statusUpdatedByExecutive = [];
    }
    client.statusUpdatedByExecutive.push(statusEntry);

    // 3) Push ScheduleDatesByExecutives entry
    let scheduledDateObj = null;

    if (nextDateISO) {
      const tmp = new Date(nextDateISO);
      if (!Number.isNaN(tmp.getTime())) {
        scheduledDateObj = tmp;
      }
    }

    if (!scheduledDateObj) {
      const combined = `${nextDateRaw}T${nextTimeRaw || "00:00"}:00`;
      const tmp = new Date(combined);
      if (!Number.isNaN(tmp.getTime())) {
        scheduledDateObj = tmp;
      }
    }

    const scheduleEntry = {
      status: "Not Reachable",
      reasonLabel,
      scheduledDate: scheduledDateObj,
      scheduledTimeRaw: nextTimeRaw,
      scheduledDateTimeReadable: nextDateTimeReadable || null,
      executiveId: exec._id,
      executiveName: exec.name || null,
      createdAt: ist,
      createdAtISO: ist.toISOString(),
    };

    if (!Array.isArray(client.ScheduleDatesByExecutives)) {
      client.ScheduleDatesByExecutives = [];
    }
    client.ScheduleDatesByExecutives.push(scheduleEntry);

    await client.save();

    return res.json({
      message: "Not reachable status & follow-up saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("updateExecutiveNotReachableStatus error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function updateExecutiveNotInterestedStatus(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      status, // should be "not_interested"
      reasonId,
      reasonLabel,
      nextDateRaw, // "YYYY-MM-DD"
      nextTimeRaw, // "HH:MM"
      nextDateISO, // ISO string or null
      nextDateReadable, // e.g. "23 Nov 2025" (optional but ok)
      nextDateTimeReadable, // e.g. "23 Nov 2025, 10:30 AM"
    } = req.body || {};

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }

    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    // status must be "not_interested"
    if (status !== "not_interested") {
      return res
        .status(400)
        .json({ message: "Invalid status, must be 'not_interested'" });
    }

    if (!reasonId || !reasonLabel) {
      return res
        .status(400)
        .json({ message: "Reason is required for not interested case" });
    }

    if (!nextDateRaw || !nextTimeRaw) {
      return res.status(400).json({
        message: "Scheduled date and time are required",
      });
    }

    // Ensure executive exists
    const exec = await Executive.findById(executiveId)
      .select("_id name")
      .lean();

    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    // Fetch client
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        message: "Client not found or not managed by this executive",
      });
    }

    /* ============================
       1) Build current IST date/time
    ============================ */
    const now = new Date();
    const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
    const ist = new Date(istMs);

    const dd = String(ist.getDate()).padStart(2, "0");
    const mm = String(ist.getMonth() + 1).padStart(2, "0");
    const yyyy = ist.getFullYear();
    const hh = String(ist.getHours()).padStart(2, "0");
    const min = String(ist.getMinutes()).padStart(2, "0");

    const todayDateStr = `${dd}/${mm}/${yyyy}`; // "dd/mm/yyyy"
    const todayTimeStr = `${hh}:${min}`; // "HH:MM"

    /* ============================
       2) Push statusUpdatedByExecutive entry
    ============================ */

    const statusEntry = {
      status: "Not Interested", // 👈 HUMAN LABEL
      value: 5, // 👈 BUCKET: "not-interested"
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      reasonLabel,
    };

    if (!Array.isArray(client.statusUpdatedByExecutive)) {
      client.statusUpdatedByExecutive = [];
    }
    client.statusUpdatedByExecutive.push(statusEntry);

    /* ============================
       3) Push ScheduleDatesByExecutives entry
    ============================ */

    let scheduledDateObj = null;

    if (nextDateISO) {
      const tmp = new Date(nextDateISO);
      if (!Number.isNaN(tmp.getTime())) {
        scheduledDateObj = tmp;
      }
    }

    if (!scheduledDateObj) {
      const combined = `${nextDateRaw}T${nextTimeRaw || "00:00"}:00`;
      const tmp = new Date(combined);
      if (!Number.isNaN(tmp.getTime())) {
        scheduledDateObj = tmp;
      }
    }

    const scheduleEntry = {
      status: "Not Interested", // 👈 YOUR REQUIREMENT
      reasonLabel,
      scheduledDate: scheduledDateObj, // proper Date object
      scheduledTimeRaw: nextTimeRaw, // "HH:MM"
      scheduledDateTimeReadable: nextDateTimeReadable || null,
      executiveId: exec._id,
      executiveName: exec.name || null,
      createdAt: ist,
      createdAtISO: ist.toISOString(),
    };

    if (!Array.isArray(client.ScheduleDatesByExecutives)) {
      client.ScheduleDatesByExecutives = [];
    }
    client.ScheduleDatesByExecutives.push(scheduleEntry);

    /* ============================
       4) Save & respond
    ============================ */

    await client.save();

    return res.json({
      message: "Not interested status & follow-up saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("updateExecutiveNotInterestedStatus error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function updateExecutiveInterestedStatus(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      status, // must be "interested"
      reasonId,
      reasonLabel,
      changeTypeId,
      changeTypeLabel,
      nextDateRaw,
      nextTimeRaw,
      nextDateISO,
      nextDateReadable,
      nextDateTimeReadable,
      note,
    } = req.body || {};

    if (!executiveId) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    if (status !== "interested") {
      return res
        .status(400)
        .json({ message: "Invalid status, must be 'interested'" });
    }

    if (!reasonId || !reasonLabel) {
      return res
        .status(400)
        .json({ message: "Reason is required for interested case" });
    }

    if (!nextDateRaw || !nextTimeRaw) {
      return res
        .status(400)
        .json({ message: "Scheduled date and time are required" });
    }

    // executive
    const exec = await Executive.findById(executiveId)
      .select("_id name")
      .lean();
    if (!exec) return res.status(404).json({ message: "Executive not found" });

    // client
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        message: "Client not found or not managed by this executive",
      });
    }

    // IST now (same style as your not-answered/not-reachable)
    const ist = new Date();
    const dd = String(ist.getDate()).padStart(2, "0");
    const mm = String(ist.getMonth() + 1).padStart(2, "0");
    const yyyy = ist.getFullYear();
    const hh = String(ist.getHours()).padStart(2, "0");
    const min = String(ist.getMinutes()).padStart(2, "0");

    const todayDateStr = `${dd}/${mm}/${yyyy}`;
    const todayTimeStr = `${hh}:${min}`;

    // If "change" selected, enrich reasonLabel (safe for schema)
    const finalReasonLabel =
      reasonId === "change" && changeTypeLabel
        ? `${reasonLabel} (${changeTypeLabel})`
        : reasonLabel;

    // ✅ status entry (choose value=4 for "Interested")
    const statusEntry = {
      status: "Interested",
      value: 4,
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      reasonLabel: finalReasonLabel,
    };

    if (!Array.isArray(client.statusUpdatedByExecutive)) {
      client.statusUpdatedByExecutive = [];
    }
    client.statusUpdatedByExecutive.push(statusEntry);

    // build scheduledDate
    let scheduledDateObj = null;
    if (nextDateISO) {
      const tmp = new Date(nextDateISO);
      if (!Number.isNaN(tmp.getTime())) scheduledDateObj = tmp;
    }
    if (!scheduledDateObj) {
      const combined = `${nextDateRaw}T${nextTimeRaw || "00:00"}:00`;
      const tmp = new Date(combined);
      if (!Number.isNaN(tmp.getTime())) scheduledDateObj = tmp;
    }

    const scheduleEntry = {
      status: "Interested",
      reasonLabel: finalReasonLabel,
      scheduledDate: scheduledDateObj,
      scheduledTimeRaw: nextTimeRaw,
      scheduledDateTimeReadable: nextDateTimeReadable || null,
      executiveId: exec._id,
      executiveName: exec.name || null,
      createdAt: ist,
      createdAtISO: ist.toISOString(),
    };

    if (!Array.isArray(client.ScheduleDatesByExecutives)) {
      client.ScheduleDatesByExecutives = [];
    }
    client.ScheduleDatesByExecutives.push(scheduleEntry);

    await client.save();

    // ✅ server-side log if you want to see payload too
    console.log("✅ Interested saved:", {
      clientId,
      reasonId,
      reasonLabel,
      changeTypeId,
      changeTypeLabel,
      nextDateRaw,
      nextTimeRaw,
      note,
    });

    return res.json({
      message: "Interested status & follow-up saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("updateExecutiveInterestedStatus error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

function parsePagination(pageRaw, limitRaw) {
  const page = Math.max(1, parseInt(pageRaw, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(limitRaw, 10) || 10)); // max 50
  return { page, limit };
}

// ===============================
// GROUP TOURS FOR CLIENT
// ===============================
export async function getClientGroupTours(req, res) {
  console.log(1);
  try {
    const executiveId = req.userId;
    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    const { clientId, page: pageRaw, limit: limitRaw } = req.query;
    if (!clientId) {
      return res.status(400).json({ message: "clientId is required" });
    }

    const { page, limit } = parsePagination(pageRaw, limitRaw);

    const client = await Client.findById(clientId).select(
      "primaryDestinationName companyId"
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const destId = client.primaryDestinationName?._id;
    if (!destId) {
      return res
        .status(400)
        .json({ message: "Client does not have a primary destination set" });
    }

    const query = {
      destination: destId,
      activeStatus:true,
    };

    const [total, docs] = await Promise.all([
      GroupTour.countDocuments(query),
      GroupTour.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("destination", "name")
        .lean(),
    ]);
    console.log(2);
    const tours = docs.map((t) => ({
      id: t._id,
      type: "group",
      name: t.tourName,
      articleNumber: t.articleNumber,
      totalDays: t.totalDays,
      destination: t.destination?.name || "",
      seatsAvailable:
        typeof t.seatsAvailable === "number"
          ? t.seatsAvailable
          : t.totalPax || 0,
    }));
    console.log(3);
    return res.json({
      tours,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    console.error("Error in getClientGroupTours:", err);
    return res.status(500).json({ message: "Failed to fetch group tours" });
  }
}
export const getExecutiveGroupTourPreview = async (req, res) => {
  try {
    const executiveId = req.userId;
    const { clientId, groupTourId } = req.query;

    if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }
    if (!mongoose.isValidObjectId(groupTourId)) {
      return res.status(400).json({ message: "Invalid groupTourId" });
    }

    // ✅ ensure executive exists
    const exec = await Executive.findById(executiveId).select("_id").lean();
    if (!exec) return res.status(404).json({ message: "Executive not found" });

    // ✅ get client (optionally ensure belongs to this executive)
    const client = await Client.findById(clientId)
      .select("_id name clientId numberOfPersons executiveId")
      .lean();

    if (!client) return res.status(404).json({ message: "Client not found" });

    // OPTIONAL STRICT CHECK (enable if you want):
    // if (String(client.executiveId) !== String(executiveId)) {
    //   return res.status(403).json({ message: "Client not managed by this executive" });
    // }

    // ✅ get group tour (company/purchaser filtering optional — your call)
    const tour = await GroupTour.findById(groupTourId)
      .populate("country", "name")
      .populate("state", "name")
      .populate("destination", "name")
      .populate({ path: "days.segments.country", select: "name" })
      .populate({ path: "days.segments.state", select: "name" })
      .populate({ path: "days.segments.destination", select: "name" })
      .populate({ path: "days.segments.trip", select: "tripName duration" })
      .populate({
        path: "days.segments.selectedAddon",
        select: "addontripName",
      })
      .populate({
        path: "days.segments.selectedActivities",
        select: "activityName",
      })
      .lean();

    if (!tour) return res.status(404).json({ message: "Group tour not found" });

    return res.status(200).json({
      client: {
        _id: client._id,
        clientId: client.clientId,
        name: client.name || null,
        numberOfPersons: client.numberOfPersons || null,
      },
      tour,
    });
  } catch (err) {
    console.error("getExecutiveGroupTourPreview error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getExecutiveGroupTourPointDiscountOptions = async (req, res) => {
  try {
    const executiveId = req.userId;
    const { clientId, groupTourId } = req.query;

    if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

    // ✅ validate ids (clientId is optional for this endpoint, but you asked to pass it)
    if (clientId && !mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }
    if (!mongoose.isValidObjectId(groupTourId)) {
      return res.status(400).json({ message: "Invalid groupTourId" });
    }

    // ✅ executive
    const exec = await Executive.findById(executiveId)
      .select("_id pointPercentage discountPercentage")
      .lean();

    if (!exec) return res.status(404).json({ message: "Executive not found" });

    // ✅ group tour (only need margin)
    const tour = await GroupTour.findById(groupTourId)
      .select("_id margin")
      .lean();
    if (!tour) return res.status(404).json({ message: "Group tour not found" });

    return res.status(200).json({
      margin: Number(tour.margin || 0),
      pointPercentage: Number(exec.pointPercentage || 0),
      discountPercentage: Number(exec.discountPercentage || 0),
    });
  } catch (err) {
    console.error("getExecutiveGroupTourPointDiscountOptions error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// ===============================
// FIXED TOURS FOR CLIENT
// ===============================
export async function getClientFixedTours(req, res) {
  try {
    const executiveId = req.userId;
    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    const { clientId, page: pageRaw, limit: limitRaw } = req.query;
    if (!clientId) {
      return res.status(400).json({ message: "clientId is required" });
    }

    const { page, limit } = parsePagination(pageRaw, limitRaw);

    const client = await Client.findById(clientId).select(
      "primaryDestinationName companyId"
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const destId = client.primaryDestinationName?._id;
    if (!destId) {
      return res
        .status(400)
        .json({ message: "Client does not have a primary destination set" });
    }

    const query = {
      destination: destId,
    };

    const [total, docs] = await Promise.all([
      FixedTour.countDocuments(query),
      FixedTour.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("destination", "name")
        .lean(),
    ]);

    const tours = docs.map((t) => ({
      id: t._id,
      type: "fixed",
      name: t.tourName,
      articleNumber: t.articleNumber,
      totalDays: t.totalDays,
      destination: t.destination?.name || "",
    }));

    return res.json({
      tours,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    console.error("Error in getClientFixedTours:", err);
    return res.status(500).json({ message: "Failed to fetch fixed tours" });
  }
}
function getIstNow() {
  const now = new Date();
  // const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const istMs = now;
  return new Date(istMs);
}

function formatIstDateTime(ist) {
  const dd = String(ist.getDate()).padStart(2, "0");
  const mm = String(ist.getMonth() + 1).padStart(2, "0");
  const yyyy = ist.getFullYear();
  const hh = String(ist.getHours()).padStart(2, "0");
  const min = String(ist.getMinutes()).padStart(2, "0");

  return {
    todayDateStr: `${dd}/${mm}/${yyyy}`, // "dd/mm/yyyy"
    todayTimeStr: `${hh}:${min}`, // "HH:MM"
  };
}

function buildScheduledDate(nextDateRaw, nextTimeRaw) {
  if (!nextDateRaw || !nextTimeRaw) return null;
  const combined = `${nextDateRaw}T${nextTimeRaw || "00:00"}:00`;
  const d = new Date(combined);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
// export const getExecutiveFixedTourPreview = async (req, res) => {
//   try {
//     const executiveId = req.userId;
//     const { clientId, fixedTourId } = req.query;

//     if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

//     if (!mongoose.isValidObjectId(clientId)) {
//       return res.status(400).json({ message: "Invalid clientId" });
//     }
//     if (!mongoose.isValidObjectId(fixedTourId)) {
//       return res.status(400).json({ message: "Invalid fixedTourId" });
//     }

//     // ensure executive exists
//     const exec = await Executive.findById(executiveId).select("_id").lean();
//     if (!exec) return res.status(404).json({ message: "Executive not found" });

//     // client (keep same fields as group preview)
//     const client = await Client.findById(clientId)
//       .select("_id name clientId numberOfPersons executiveId")
//       .lean();

//     if (!client) return res.status(404).json({ message: "Client not found" });

//     // OPTIONAL strict check
//     // if (String(client.executiveId) !== String(executiveId)) {
//     //   return res.status(403).json({ message: "Client not managed by this executive" });
//     // }

//     // fixed tour + populates you requested
//     const tour = await FixedTour.findById(fixedTourId)
//       .populate("country", "name")
//       .populate("state", "name")
//       .populate("destination", "name")
//       .populate({ path: "days.segments.country", select: "name" })
//       .populate({ path: "days.segments.state", select: "name" })
//       .populate({ path: "days.segments.destination", select: "name" })
//       .populate({ path: "days.segments.trip", select: "tripName duration" })
//       .populate({ path: "days.segments.selectedAddon", select: "addontripName" })
//       .populate({
//         path: "days.segments.selectedActivities",
//         select: "activityName",
//       })
//       .lean();

//     if (!tour) return res.status(404).json({ message: "Fixed tour not found" });

//     return res.status(200).json({
//       client: {
//         _id: client._id,
//         clientId: client.clientId,
//         name: client.name || null,
//         numberOfPersons: client.numberOfPersons || null,
//       },
//       tour,
//     });
//   } catch (err) {
//     console.error("getExecutiveFixedTourPreview error:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const getExecutiveFixedTourPreview = async (req, res) => {
  try {
    const executiveId = req.userId;
    const { clientId, fixedTourId } = req.query;

    if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }
    if (!mongoose.isValidObjectId(fixedTourId)) {
      return res.status(400).json({ message: "Invalid fixedTourId" });
    }

    const exec = await Executive.findById(executiveId).select("_id").lean();
    if (!exec) return res.status(404).json({ message: "Executive not found" });

    const client = await Client.findById(clientId)
      .select("_id name clientId numberOfPersons executiveId")
      .lean();

    if (!client) return res.status(404).json({ message: "Client not found" });

    // ✅ fixed tour populate only what you requested
    const tour = await FixedTour.findById(fixedTourId)
      .populate("country", "name")
      .populate("state", "name")
      .populate("destination", "name")
      .populate({ path: "days.segments.country", select: "name" })
      .populate({ path: "days.segments.state", select: "name" })
      .populate({ path: "days.segments.destination", select: "name" })
      .populate({ path: "days.segments.trip", select: "tripName duration" })
      .populate({
        path: "days.segments.selectedAddon",
        select: "addontripName",
      })
      .populate({
        path: "days.segments.selectedActivities",
        select: "activityName",
      })
      .lean();

    if (!tour) return res.status(404).json({ message: "Fixed tour not found" });

    return res.status(200).json({
      client: {
        _id: client._id,
        clientId: client.clientId,
        name: client.name || null,
        numberOfPersons: client.numberOfPersons || null,
      },
      tour,
    });
  } catch (err) {
    console.error("getExecutiveFixedTourPreview error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export async function getFixedTourPointDiscountOptions(req, res) {
  try {
    const executiveId = req.userId;
    const { clientId, fixedTourId } = req.query;

    if (!executiveId) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(clientId))
      return res.status(400).json({ message: "Invalid clientId" });
    if (!mongoose.isValidObjectId(fixedTourId))
      return res.status(400).json({ message: "Invalid fixedTourId" });

    // ✅ NEW: executive config (same as group tour)
    const exec = await Executive.findById(executiveId)
      .select("_id pointPercentage discountPercentage")
      .lean();

    if (!exec) return res.status(404).json({ message: "Executive not found" });

    const client = await Client.findById(clientId)
      .select("numberOfPersons")
      .lean();
    if (!client) return res.status(404).json({ message: "Client not found" });

    const tour = await FixedTour.findById(fixedTourId).lean();
    if (!tour) return res.status(404).json({ message: "Fixed tour not found" });

    const pax = Number(client.numberOfPersons || 0);
    const paxKey = String(pax);

    const sell = Number(tour?.paxPrices?.[paxKey] || 0); // selling price per pax
    const cost = Number(tour?.itineraryPrices?.[paxKey] || 0); // itinerary cost per pax

    const margin = Math.max(0, cost - sell); // ✅ as you said (difference is margin)

    return res.json({
      margin,
      pointPercentage: Number(exec.pointPercentage || 0),
      discountPercentage: Number(exec.discountPercentage || 0),
    });
  } catch (err) {
    console.error("getFixedTourPointDiscountOptions error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}



// export async function downloadGroupTourReferralItinerary(req, res) {
//   try {
//     const executiveId = req.userId;
//     const {
//       clientId,
//       groupTourId,
//       nextDateRaw,
//       nextTimeRaw,
//       discountAmount = 0,
//     } = req.body || {};

//     /* ---------- VALIDATIONS (UNCHANGED) ---------- */
//     if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

//     if (
//       !mongoose.isValidObjectId(executiveId) ||
//       !mongoose.isValidObjectId(clientId) ||
//       !mongoose.isValidObjectId(groupTourId)
//     ) {
//       return res.status(400).json({ message: "Invalid IDs" });
//     }

//     if (!nextDateRaw || !nextTimeRaw) {
//       return res
//         .status(400)
//         .json({ message: "nextDateRaw and nextTimeRaw are required" });
//     }

//     /* ---------- FETCH CORE DATA ---------- */
//     const exec = await Executive.findById(executiveId).populate("company").lean();
//     if (!exec) return res.status(404).json({ message: "Executive not found" });

//     const client = await Client.findById(clientId);
//     if (!client) return res.status(404).json({ message: "Client not found" });

//     const tour = await GroupTour.findById(groupTourId).lean();
//     if (!tour) return res.status(404).json({ message: "Group tour not found" });

//     const company = await Company.findById(exec.company).lean();

//     /* ---------- POPULATE DAY SEGMENTS ---------- */
//     for (const day of tour.days || []) {
//       for (const seg of day.segments || []) {
//         seg.tripDoc = seg.trip ? await Trip.findById(seg.trip).lean() : null;

//         seg.addonDoc = seg.selectedAddon
//           ? await AddOnTrip.findById(seg.selectedAddon).lean()
//           : null;

//         seg.activityDocs = await Activity.find({
//           _id: { $in: seg.selectedActivities || [] },
//         }).lean();

//         for (const v of seg.boTripVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const v of seg.boAddonVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const a of seg.boAccommodations || []) {
//           a.accommodationDoc = a.accommodationId
//             ? await Accommodation.findById(a.accommodationId).lean()
//             : null;
//         }
//       }
//     }

//     /* ===============================
//        SMALL HELPERS (safe HTML)
//     ================================ */
//     const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

//     const esc = (s) => {
//       if (s === null || s === undefined) return "";
//       return String(s)
//         .replaceAll("&", "&amp;")
//         .replaceAll("<", "&lt;")
//         .replaceAll(">", "&gt;")
//         .replaceAll('"', "&quot;")
//         .replaceAll("'", "&#039;");
//     };

//     const safeImg = (url) => (url && String(url).trim() ? String(url).trim() : "");

//     /* ===============================
//        HTML/CSS (UNCHANGED)
//     ================================ */
//     const fallbackCoverBg =
//       "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

//     const commonCss = `
//       @page { size:A4; margin:0 }
//       html, body { margin:0; padding:0; font-family: Inter, Arial, sans-serif; }
//       * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

//       /* page number */
//       body{ counter-reset: page; }
//       .pageNo{
//         position: fixed;
//         bottom: 10px;
//         right: 12px;
//         z-index: 5;
//         font-size: 9px;
//         letter-spacing: .12em;
//         color: rgba(255,255,255,.55);
//         font-weight: 800;
//       }
//       .pageNo::after{ content: counter(page); }

//       /* small centered logo on every page */
//       .pageLogo{
//         position: fixed;
//         top: 14px;
//         left: 50%;
//         transform: translateX(-50%);
//         z-index: 5;
//         width: 34px;
//         height: auto;
//         opacity: .92;
//         filter: drop-shadow(0 10px 22px rgba(0,0,0,.35));
//       }

//       .bgFixed{
//         position: fixed;
//         top:0; left:0;
//         width:100vw; height:100vh;
//         background-size: cover;
//         background-position: center;
//         background-repeat: no-repeat;
//         z-index:0;
//         transform: scale(1.03);
//       }
//       .bgFixed::after{
//         content:"";
//         position:absolute; inset:0;
//         background: linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.55));
//         backdrop-filter: blur(2px);
//       }

//       .wrap{ position:relative; z-index:2; padding:52px; min-height:100vh; }

//       .keepTogether{
//         break-inside: avoid;
//         page-break-inside: avoid;
//         -webkit-column-break-inside: avoid;
//       }

//       /* Cover layout */
//       .coverWrap{
//         min-height: calc(100vh - 104px);
//         display:flex;
//         flex-direction: column;
//         align-items: center;
//         text-align:center;
//         padding-top: 26px;
//       }
//       .coverSpacer{ flex:1; }

//       .coverTopLogo{
//         width: 160px;
//         height:auto;
//         object-fit:contain;
//         filter: drop-shadow(0 14px 34px rgba(0,0,0,.35));
//       }
//       .tourTitle {
//         font-family: "Cinzel", "Playfair Display", "Cormorant Garamond", "Georgia", serif;
//         font-size: 62px;
//         font-weight: 800;
//         letter-spacing: .03em;
//         color: #ffffff;
//         text-shadow: 0 14px 40px rgba(0,0,0,.55);
//         margin: 18px 0 12px 0;
//       }
//       .metaRow{
//         display:flex;
//         justify-content: space-between;
//         align-items:center;
//         gap: 16px;
//         margin-top: 6px;
//         width: 100%;
//         max-width: 600px;
//         color: rgba(255,255,255,.90);
//         font-weight: 900;
//         text-transform: uppercase;
//         letter-spacing: .10em;
//         font-size: 11px;
//       }

//       .glassBar{
//         background: rgba(255,255,255,.12);
//         border: 1px solid rgba(255,255,255,.18);
//         backdrop-filter: blur(14px);
//         border-radius: 18px;
//         padding: 14px 16px;
//         box-shadow: 0 20px 60px rgba(0,0,0,.22);
//       }
//       .companyBlock{
//         background: rgba(0,0,0,.35);
//         border: 1px solid rgba(255,255,255,.10);
//         border-radius: 20px;
//         padding: 18px 18px;
//         backdrop-filter: blur(10px);
//         max-width:600px;
//         width:100%;
//       }
//       .miniLogo{
//         width: 46px;
//         height:auto;
//         object-fit:contain;
//         opacity:.92;
//         margin-bottom:10px;
//       }
//       .muted { color: rgba(255,255,255,.82); line-height:1.55; font-weight:700; }

//       /* Day container */
//       .dayContainer{
//         padding: 18px;
//         border-radius: 22px;
//         background: rgba(0,0,0,.18);
//         border: 1px solid rgba(255,255,255,.10);
//         backdrop-filter: blur(8px);
//         box-shadow: 0 22px 70px rgba(0,0,0,.28);
//         margin-top: 12px;
//       }
//       .dayHeader{ margin-top: 4px; margin-bottom: 18px; text-align:left; }
//       .dayTitle{
//         font-size: 48px;
//         font-weight: 950;
//         color:#fff;
//         margin:0;
//         letter-spacing:.01em;
//         text-shadow: 0 16px 45px rgba(0,0,0,.55);
//       }
//       .dayDate{
//         font-size: 20px;
//         margin-top: 10px;
//         color: rgba(255,255,255,.88);
//         font-weight: 850;
//         letter-spacing: .06em;
//       }

//       .softPanel{
//         background: rgba(10,10,12,.28);
//         border: 1px solid rgba(255,255,255,.14);
//         border-radius: 18px;
//         padding: 16px 16px;
//         box-shadow: 0 14px 40px rgba(0,0,0,.25);
//       }

//       .section{ margin-top: 16px; }
//       .h3{
//         font-size: 13px;
//         font-weight: 950;
//         letter-spacing: .10em;
//         text-transform: uppercase;
//         color: rgba(255,255,255,.92);
//         margin: 0 0 10px 0;
//       }

//       .twoCol{
//         display:grid;
//         grid-template-columns: 1fr 1fr;
//         gap: 14px;
//         align-items:start;
//       }
//       .leftText{ padding-right: 6px; }
//       .titleStrong{
//         font-size: 16px;
//         font-weight: 950;
//         color:#fff;
//         margin: 0 0 8px 0;
//       }
//       .desc{
//         color: rgba(255,255,255,.84);
//         line-height: 1.6;
//         font-weight: 650;
//         font-size: 12.8px;
//       }

//       .heroImg{
//         width:100%;
//         height: 220px;
//         object-fit:cover;
//         border-radius: 18px;
//         border: 1px solid rgba(255,255,255,.14);
//         box-shadow: 0 18px 50px rgba(0,0,0,.38);
//       }
//       .addonImg{
//         width:100%;
//         height: 180px;
//         object-fit:cover;
//         border-radius: 16px;
//         border: 1px solid rgba(255,255,255,.12);
//         box-shadow: 0 16px 44px rgba(0,0,0,.34);
//       }

//       /* Activities right images */
//       .rightGrid3{
//         display:grid;
//         grid-template-columns: repeat(3, 1fr);
//         gap: 10px;
//       }
//       .rightGrid3 img{
//         width:100%;
//         height: 150px;
//         object-fit: cover;
//         border-radius: 14px;
//         border: 1px solid rgba(255,255,255,.12);
//         box-shadow: 0 12px 34px rgba(0,0,0,.30);
//       }

//       .tripleRow{
//         display:grid;
//         grid-template-columns: 1fr 1fr 1fr;
//         gap: 10px;
//       }
//       .infoCard{
//         padding: 12px 12px;
//         border-radius: 16px;
//         background: rgba(255,255,255,.06);
//         border: 1px solid rgba(255,255,255,.12);
//       }
//       .infoK{
//         font-size: 10px;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         color: rgba(255,255,255,.70);
//         font-weight: 950;
//       }
//       .infoV{
//         margin-top: 7px;
//         font-size: 12px;
//         font-weight: 950;
//         color: #fff;
//       }

//       .hotel3{
//         display:grid;
//         grid-template-columns: repeat(3, 1fr);
//         gap: 10px;
//         margin-top: 12px;
//       }
//       .hotel3 img{
//         width:100%;
//         height: 120px;
//         object-fit:cover;
//         border-radius: 14px;
//         border: 1px solid rgba(255,255,255,.12);
//         box-shadow: 0 12px 34px rgba(0,0,0,.30);
//       }

//       /* food icon */
//       .foodList{ margin-top: 10px; display:grid; gap:8px; }
//       .foodItem{
//         display:flex;
//         align-items:center;
//         justify-content: space-between;
//         padding: 10px 12px;
//         border-radius: 14px;
//         background: rgba(255,255,255,.06);
//         border: 1px solid rgba(255,255,255,.12);
//       }
//       .foodLeft{ color: rgba(255,255,255,.90); font-weight: 850; }
//       .foodRight{
//         display:flex;
//         align-items:center;
//         gap: 8px;
//         color: rgba(255,255,255,.95);
//         font-weight: 950;
//       }
//       .tickIcon{ width: 14px; height: 14px; opacity: .95; flex: 0 0 auto; }

//       .vehicleSectionTitle{
//         font-size: 11px;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         color: rgba(255,255,255,.85);
//         font-weight: 950;
//         margin: 10px 0 10px 0;
//       }
//     `;

//     const tickSvg = `
//       <svg class="tickIcon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M20 6L9 17L4 12" stroke="rgba(255,255,255,.95)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
//       </svg>
//     `;

//     /* ===============================
//        COVER HTML (UNCHANGED)
//     ================================ */
//     const coverHtml = `<!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8"/>
//       <style>${commonCss}</style>
//       <link rel="preconnect" href="https://fonts.googleapis.com">
//       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//       <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
//     </head>
//     <body>
//       <div class="bgFixed" style="background-image:url('${fallbackCoverBg}')"></div>

//       ${
//         company?.logo
//           ? `<img class="pageLogo" src="${safeImg(company.logo)}" />`
//           : ""
//       }
//       <div class="pageNo"></div>

//       <div class="wrap">
//         <div class="coverWrap">
//           ${
//             company?.logo
//               ? `<img class="coverTopLogo" src="${safeImg(company.logo)}" />`
//               : ""
//           }

//           <div class="tourTitle">${esc(tour.tourName || "Group Tour")}</div>

//           <div class="metaRow">
//             <div>Group Tour</div>
//             <div>${esc(tour.totalDays)}D / ${esc(tour.totalNights)}N</div>
//           </div>

//           <div class="coverSpacer"></div>

//           <div class="glassBar keepTogether" style="max-width:600px; width:100%; margin-bottom:14px;">
//             <div style="color:#fff; font-weight:950; letter-spacing:.04em;">
//               Referral Itinerary
//             </div>
//             <div class="muted" style="margin-top:6px; font-weight:750;">
//               This is for reference only. It does not confirm travel.
//             </div>
//           </div>

//           <div class="companyBlock keepTogether">
//             ${
//               company?.logo
//                 ? `<div style="text-align:center;"><img class="miniLogo" src="${safeImg(
//                     company.logo
//                   )}" /></div>`
//                 : ""
//             }
//             <div style="color:#fff; font-weight:950; letter-spacing:.10em; text-transform:uppercase; font-size:11px;">
//               Company Details
//             </div>
//             <div class="muted" style="margin-top:10px;">
//               <b style="color:#fff">${esc(company?.companyName || "")}</b><br/>
//               ${esc(company?.buildingName || "")}${
//                 company?.roadAreaStreet ? `, ${esc(company?.roadAreaStreet)}` : ""
//               }<br/>
//               ${esc(company?.city || "")}${
//                 company?.state ? `, ${esc(company?.state)}` : ""
//               }${company?.country ? `, ${esc(company?.country)}` : ""}
//             </div>
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>`;

//     /* ===============================
//        DAY HTML (FIXED: show ALL + DEDUPE PER DAY)
//        - Activities: show all unique by Activity _id
//        - Accommodations: show all unique by accommodationId (fallback propertyName)
//        - Trip Vehicles: show all unique by vehicleId (fallback vehicleName)
//        - Add-on Vehicles: show all unique by vehicleId (fallback vehicleName)
//        - Segments: render one after another (no "segment" heading)
//        - Meals heading: "Meals Included in <tripName>"
//        - Transportation: Category + Vehicle (50/50) + 3 images below (if any)
//     ================================ */
//     const dayHtml = (day) => {
//       const segments = Array.isArray(day.segments) ? day.segments : [];
//       const tripBg = safeImg(segments?.[0]?.tripDoc?.imageUrl) || fallbackCoverBg;

//       // DEDUPE SETS (per DAY)
//       const seenTripVehicle = new Set();
//       const seenAddonVehicle = new Set();
//       const seenAccommodation = new Set();
//       const seenActivity = new Set();

//       const pickMealFromFoods = (foods, type) =>
//         (foods || []).find((f) => String(f?.mealType || "").toLowerCase() === type)
//           ?.foodName || "-";

//       const segmentBlocks = segments
//         .map((seg) => {
//           const trip = seg.tripDoc || null;
//           const addon = seg.addonDoc || null;

//           const activities = Array.isArray(seg.activityDocs) ? seg.activityDocs : [];
//           const foods = Array.isArray(seg.boFoods) ? seg.boFoods : [];
//           const accs = Array.isArray(seg.boAccommodations) ? seg.boAccommodations : [];
//           const tripVehicles = Array.isArray(seg.boTripVehicles) ? seg.boTripVehicles : [];
//           const addonVehicles = Array.isArray(seg.boAddonVehicles) ? seg.boAddonVehicles : [];

//           const tripHero = safeImg(trip?.imageUrl);
//           const tripAlt =
//             safeImg(trip?.secondImageUrl) ||
//             safeImg(trip?.thirdImageUrl) ||
//             tripHero;

//           const addonAny =
//             safeImg(addon?.imageUrl) ||
//             safeImg(addon?.secondImageUrl) ||
//             safeImg(addon?.thirdImageUrl);

//           // TRIP
//           const tripBlock = trip
//             ? `
//               <div class="section keepTogether softPanel">
//                 <div class="h3">Trip</div>
//                 <div class="twoCol">
//                   <div class="leftText">
//                     <div class="titleStrong">${esc(trip.tripName || "")}</div>
//                     <div class="desc">${esc(trip.description || "")}</div>
//                   </div>
//                   <div>
//                     ${tripHero ? `<img class="heroImg" src="${tripHero}" />` : ""}
//                   </div>
//                 </div>
//               </div>
//             `
//             : "";

//           // ADDON
//           const addonBlock = addon
//             ? `
//               <div class="section keepTogether softPanel">
//                 <div class="h3">Add-on Trip</div>
//                 <div class="twoCol">
//                   <div>
//                     ${addonAny ? `<img class="addonImg" src="${addonAny}" />` : ""}
//                   </div>
//                   <div class="leftText">
//                     <div class="titleStrong">${esc(addon.addontripName || "")}</div>
//                     <div class="desc">${esc(addon.description || "")}</div>
//                   </div>
//                 </div>
//               </div>
//             `
//             : "";

//           // ACTIVITIES (ALL UNIQUE)
//           const activitiesHtml = activities
//             .map((a) => {
//               const aKey = String(a?._id || "");
//               if (!aKey) return "";
//               if (seenActivity.has(aKey)) return "";
//               seenActivity.add(aKey);

//               const aImg =
//                 safeImg(a?.imageUrl) || safeImg(a?.secondImageUrl) || safeImg(a?.thirdImageUrl);
//               const imgs = [aImg, tripAlt, addonAny].filter(Boolean);

//               return `
//                 <div class="section keepTogether softPanel">
//                   <div class="h3">Activities</div>
//                   <div class="twoCol">
//                     <div class="leftText">
//                       <div class="titleStrong">${esc(a?.name || a?.activityName || "")}</div>
//                       <div class="desc">${esc(a?.description || "")}</div>
//                     </div>
//                     <div class="rightGrid3">
//                       ${imgs.slice(0, 3).map((u) => `<img src="${u}" />`).join("")}
//                     </div>
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           // ACCOMMODATIONS (ALL UNIQUE)
//           const accommodationsHtml = accs
//             .map((acc) => {
//               const accKey = String(acc?.accommodationId || acc?.propertyName || "");
//               if (!accKey) return "";
//               if (seenAccommodation.has(accKey)) return "";
//               seenAccommodation.add(accKey);

//               const accDoc = acc?.accommodationDoc || null;
//               const hotelImgs = [
//                 safeImg(accDoc?.imageUrl),
//                 safeImg(accDoc?.secondImageUrl),
//                 safeImg(accDoc?.thirdImageUrl),
//               ].filter(Boolean);

//               return `
//                 <div class="section keepTogether softPanel">
//                   <div class="h3">Accommodation</div>

//                   <div class="tripleRow">
//                     <div class="infoCard">
//                       <div class="infoK">Property</div>
//                       <div class="infoV">${esc(acc?.propertyName || "-")}</div>
//                     </div>
//                     <div class="infoCard">
//                       <div class="infoK">Category</div>
//                       <div class="infoV">${esc(acc?.hotelCategory || "-")}</div>
//                     </div>
//                     <div class="infoCard">
//                       <div class="infoK">Room</div>
//                       <div class="infoV">${esc(acc?.roomCategory || "-")}</div>
//                     </div>
//                   </div>

//                   ${
//                     hotelImgs.length
//                       ? `
//                     <div class="hotel3">
//                       ${hotelImgs.slice(0, 3).map((u) => `<img src="${u}" />`).join("")}
//                     </div>
//                     `
//                       : ""
//                   }
//                 </div>
//               `;
//             })
//             .join("");

//           // MEALS
//           const breakfast = pickMealFromFoods(foods, "breakfast");
//           const lunch = pickMealFromFoods(foods, "lunch");
//           const dinner = pickMealFromFoods(foods, "dinner");

//           const mealsHeading = esc(
//             trip?.tripName ? `Meals Included in ${trip.tripName}` : "Meals Included"
//           );

//           const mealsBlock = `
//             <div class="section keepTogether softPanel">
//               <div class="h3">${mealsHeading}</div>
//               <div class="foodList">
//                 <div class="foodItem">
//                   <div class="foodLeft">Breakfast</div>
//                   <div class="foodRight"><span>${esc(breakfast)}</span>${tickSvg}</div>
//                 </div>
//                 <div class="foodItem">
//                   <div class="foodLeft">Lunch</div>
//                   <div class="foodRight"><span>${esc(lunch)}</span>${tickSvg}</div>
//                 </div>
//                 <div class="foodItem">
//                   <div class="foodLeft">Dinner</div>
//                   <div class="foodRight"><span>${esc(dinner)}</span>${tickSvg}</div>
//                 </div>
//               </div>
//             </div>
//           `;

//           // VEHICLE HEADINGS
//           const tripVehiclesHeading = esc(
//             trip?.tripName ? `Vehicle for ${trip.tripName}` : "Vehicle - Trip Vehicles"
//           );
//           const addonVehiclesHeading = esc(
//             addon?.addontripName
//               ? `Vehicle for ${addon.addontripName}`
//               : "Vehicle - Add-on Trip Vehicles"
//           );

//           // TRIP VEHICLES (ALL UNIQUE)
//           const tripVehiclesHtml = tripVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";
//               if (seenTripVehicle.has(vKey)) return "";
//               seenTripVehicle.add(vKey);

//               const vd = v?.vehicleDoc || null;
//               const imgs = [
//                 safeImg(vd?.imageUrl),
//                 safeImg(vd?.secondImageUrl),
//                 safeImg(vd?.thirdImageUrl),
//               ].filter(Boolean);

//               return `
//                 <div class="keepTogether" style="margin-top:12px;">
//                   <div class="twoCol">
//                     <div class="infoCard">
//                       <div class="infoK">Category</div>
//                       <div class="infoV">${esc(v?.category || "-")}</div>
//                     </div>
//                     <div class="infoCard">
//                       <div class="infoK">Vehicle</div>
//                       <div class="infoV">${esc(v?.vehicleName || "-")}</div>
//                     </div>
//                   </div>

//                   ${
//                     imgs.length
//                       ? `
//                     <div class="hotel3">
//                       ${imgs.slice(0, 3).map((u) => `<img src="${u}" />`).join("")}
//                     </div>
//                     `
//                       : ""
//                   }
//                 </div>
//               `;
//             })
//             .join("");

//           // ADDON VEHICLES (ALL UNIQUE)
//           const addonVehiclesHtml = addonVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";
//               if (seenAddonVehicle.has(vKey)) return "";
//               seenAddonVehicle.add(vKey);

//               const vd = v?.vehicleDoc || null;
//               const imgs = [
//                 safeImg(vd?.imageUrl),
//                 safeImg(vd?.secondImageUrl),
//                 safeImg(vd?.thirdImageUrl),
//               ].filter(Boolean);

//               return `
//                 <div class="keepTogether" style="margin-top:12px;">
//                   <div class="twoCol">
//                     <div class="infoCard">
//                       <div class="infoK">Category</div>
//                       <div class="infoV">${esc(v?.category || "-")}</div>
//                     </div>
//                     <div class="infoCard">
//                       <div class="infoK">Vehicle</div>
//                       <div class="infoV">${esc(v?.vehicleName || "-")}</div>
//                     </div>
//                   </div>

//                   ${
//                     imgs.length
//                       ? `
//                     <div class="hotel3">
//                       ${imgs.slice(0, 3).map((u) => `<img src="${u}" />`).join("")}
//                     </div>
//                     `
//                       : ""
//                   }
//                 </div>
//               `;
//             })
//             .join("");

//           // TRANSPORTATION (only if this segment adds NEW unique vehicles)
//           const transportationBlock =
//             tripVehiclesHtml || addonVehiclesHtml
//               ? `
//                 <div class="section keepTogether softPanel">
//                   <div class="h3">Transportation</div>

//                   ${
//                     tripVehiclesHtml
//                       ? `
//                     <div class="vehicleSectionTitle">${tripVehiclesHeading}</div>
//                     ${tripVehiclesHtml}
//                     `
//                       : ""
//                   }

//                   ${
//                     addonVehiclesHtml
//                       ? `
//                     <div class="vehicleSectionTitle" style="margin-top:16px;">${addonVehiclesHeading}</div>
//                     ${addonVehiclesHtml}
//                     `
//                       : ""
//                   }
//                 </div>
//               `
//               : "";

//           return `
//             ${tripBlock}
//             ${addonBlock}
//             ${activitiesHtml}
//             ${accommodationsHtml}
//             ${mealsBlock}
//             ${transportationBlock}
//           `;
//         })
//         .join("");

//       return `<!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8"/>
//         <style>
//           ${commonCss}
//           .bgFixed::after{
//             background: linear-gradient(180deg, rgba(0,0,0,.74), rgba(0,0,0,.76));
//             backdrop-filter: blur(3px);
//           }
//         </style>
//       </head>
//       <body>
//         <div class="bgFixed" style="background-image:url('${tripBg}')"></div>

//         ${
//           company?.logo
//             ? `<img class="pageLogo" src="${safeImg(company.logo)}" />`
//             : ""
//         }
//         <div class="pageNo"></div>

//         <div class="wrap">
//           <div class="dayContainer">
//             <div class="dayHeader keepTogether">
//               <div class="dayTitle">${esc(day.dayLabel || "Day")}</div>
//               <div class="dayDate">${esc(fmtDate(day.date))}</div>
//             </div>

//             ${
//               segmentBlocks ||
//               `<div class="section keepTogether softPanel muted">No itinerary segments found for this day.</div>`
//             }
//           </div>
//         </div>
//       </body>
//       </html>`;
//     };

//     /* ===============================
//        PDF RENDER + MERGE (UNCHANGED)
//     ================================ */
//     async function renderPdfFromHtml(browser, html) {
//       const page = await browser.newPage();
//       await page.setViewport({ width: 1123, height: 1587 }); // A4-ish
//       await page.setContent(html, { waitUntil: "networkidle0" });

//       const buf = await page.pdf({
//         format: "A4",
//         printBackground: true,
//         margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
//       });

//       await page.close();
//       return buf;
//     }

//     async function mergePdfs(buffers) {
//       const merged = await PDFDocument.create();
//       for (const b of buffers) {
//         const pdf = await PDFDocument.load(b);
//         const pages = await merged.copyPages(pdf, pdf.getPageIndices());
//         pages.forEach((p) => merged.addPage(p));
//       }
//       return Buffer.from(await merged.save());
//     }

//     const browser = await puppeteer.launch({ headless: "new" });
//     const pdfParts = [];

//     // cover
//     pdfParts.push(await renderPdfFromHtml(browser, coverHtml));

//     // days
//     for (const day of tour.days || []) {
//       pdfParts.push(await renderPdfFromHtml(browser, dayHtml(day)));
//     }

//     await browser.close();

//     const finalPdfBuffer = await mergePdfs(pdfParts);

//     /* ---------- UPDATE CLIENT (AFTER PDF) ---------- */
//     const pax = Number(client.numberOfPersons || 0);
//     const totalCost = pax * Number(tour.pricePerPax || 0);
//     const disc = Number(discountAmount || 0);

//     const ist = getIstNow();
//     const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

//     const reasonLabel =
//       disc > 0
//         ? `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
//         : `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent without any discount`;

//     client.statusUpdatedByExecutive.push({
//       status: "Detail Sent",
//       value: 3,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       date: todayDateStr,
//       time: todayTimeStr,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//       reasonLabel,
//     });

//     const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
//     if (!scheduledDateObj) {
//       return res
//         .status(400)
//         .json({ message: "Invalid date/time for scheduled follow-up" });
//     }

//     client.ScheduleDatesByExecutives.push({
//       status: "Detail Sent",
//       reasonLabel: "Group Tour Referral Itinerary Sent",
//       scheduledDate: scheduledDateObj,
//       scheduledTimeRaw: nextTimeRaw,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//     });

//     await client.save();

//     /* ---------- STREAM PDF ---------- */
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="Referral-Itinerary-${tour.tourName}.pdf"`,
//     });

//     return res.send(finalPdfBuffer);
//   } catch (err) {
//     console.error("Referral PDF error:", err);
//     return res.status(500).json({ message: "PDF generation failed" });
//   }
// }













// export async function downloadGroupTourReferralItinerary(req, res) {
//   try {
//     const executiveId = req.userId;
//     const {
//       clientId,
//       groupTourId,
//       nextDateRaw,
//       nextTimeRaw,
//       discountAmount = 0,
//     } = req.body || {};

//     /* ---------- VALIDATIONS (UNCHANGED) ---------- */
//     if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

//     if (
//       !mongoose.isValidObjectId(executiveId) ||
//       !mongoose.isValidObjectId(clientId) ||
//       !mongoose.isValidObjectId(groupTourId)
//     ) {
//       return res.status(400).json({ message: "Invalid IDs" });
//     }

//     if (!nextDateRaw || !nextTimeRaw) {
//       return res
//         .status(400)
//         .json({ message: "nextDateRaw and nextTimeRaw are required" });
//     }

//     /* ---------- FETCH CORE DATA ---------- */
//     const exec = await Executive.findById(executiveId).populate("company").lean();
//     if (!exec) return res.status(404).json({ message: "Executive not found" });

//     const client = await Client.findById(clientId);
//     if (!client) return res.status(404).json({ message: "Client not found" });

//     const tour = await GroupTour.findById(groupTourId).lean();
//     if (!tour) return res.status(404).json({ message: "Group tour not found" });

//     const company = await Company.findById(exec.company).lean();

//     /* ---------- POPULATE DAY SEGMENTS ---------- */
//     for (const day of tour.days || []) {
//       for (const seg of day.segments || []) {
//         seg.tripDoc = seg.trip ? await Trip.findById(seg.trip).lean() : null;

//         seg.addonDoc = seg.selectedAddon
//           ? await AddOnTrip.findById(seg.selectedAddon).lean()
//           : null;

//         seg.activityDocs = await Activity.find({
//           _id: { $in: seg.selectedActivities || [] },
//         }).lean();

//         for (const v of seg.boTripVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const v of seg.boAddonVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const a of seg.boAccommodations || []) {
//           a.accommodationDoc = a.accommodationId
//             ? await Accommodation.findById(a.accommodationId).lean()
//             : null;
//         }
//       }
//     }

//     /* ===============================
//        SMALL HELPERS (safe HTML)
//     ================================ */
//     const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

//     const esc = (s) => {
//       if (s === null || s === undefined) return "";
//       return String(s)
//         .replaceAll("&", "&amp;")
//         .replaceAll("<", "&lt;")
//         .replaceAll(">", "&gt;")
//         .replaceAll('"', "&quot;")
//         .replaceAll("'", "&#039;");
//     };

//     const safeImg = (url) => (url && String(url).trim() ? String(url).trim() : "");

//     const getDocImgsUpTo8 = (doc) => {
//       if (!doc) return [];
//       // handle both "eightImageUrl" and "eighthImageUrl" spellings
//       const urls = [
//         doc.imageUrl,
//         doc.secondImageUrl,
//         doc.thirdImageUrl,
//         doc.fourthImageUrl,
//         doc.fifthImageUrl,
//         doc.sixthImageUrl,
//         doc.seventhImageUrl,
//         doc.eightImageUrl || doc.eighthImageUrl,
//       ];
//       return urls.map(safeImg).filter(Boolean);
//     };

//     const fallbackCoverBg =
//       "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

//     /* ===============================
//        PDF DESIGN: Destination fetch for images + textColor (PDF ONLY)
//        (does not change business logic)
//     ================================ */
//     let destinationDoc = null;
//     try {
//       if (tour?.destination && mongoose.isValidObjectId(tour.destination)) {
//         destinationDoc = await Destination.findById(tour.destination).lean();
//       }
//     } catch (_) {
//       destinationDoc = null;
//     }

//     const destImgs = getDocImgsUpTo8(destinationDoc);
//     const destTextColor = safeImg(destinationDoc?.textColor) || "#ffffff";
//     const destName = destinationDoc?.name ? String(destinationDoc.name) : "";

//     // cover bg = destination 1st image
//     const coverBg = destImgs[0] || fallbackCoverBg;
//     // overlay = destination 2nd image (bg-less image user uploaded)
//     const coverOverlay = destImgs[1] || "";

//     // Pick unique top/bottom watercolor images per day (no-repeat best-effort)
//     const pickDayDecor = (() => {
//       const used = new Set();
//       const pool = destImgs.length ? destImgs.slice() : [fallbackCoverBg];
//       let idx = 0;

//       const takeUnique = () => {
//         // best effort: try unique, else allow reuse if not enough
//         for (let t = 0; t < pool.length; t++) {
//           const u = pool[(idx + t) % pool.length];
//           if (!used.has(u)) {
//             used.add(u);
//             idx = (idx + t + 1) % pool.length;
//             return u;
//           }
//         }
//         // fallback (not enough images)
//         const u = pool[idx % pool.length];
//         idx = (idx + 1) % pool.length;
//         return u;
//       };

//       return (dayIndex) => {
//         // deterministic-ish progression per day
//         idx = (idx + (dayIndex * 2 + 1)) % pool.length;
//         const top = takeUnique();
//         const bottom = takeUnique();
//         return { top, bottom };
//       };
//     })();

//     /* ===============================
//        HTML/CSS (UPDATED: PDF DESIGN ONLY)
//     ================================ */
//     const commonCss = `
//       @page { size:A4; margin:0 }
//       html, body { margin:0; padding:0; font-family: Inter, Arial, sans-serif; }
//       * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

//       /* Cover page background */
//       .coverBg{
//         position: fixed;
//         inset:0;
//         background-size: cover;
//         background-position: center;
//         background-repeat: no-repeat;
//         z-index:0;
//       }
//       .coverBg::after{
//         content:"";
//         position:absolute; inset:0;
//         background:
//           radial-gradient(1000px 700px at 50% 35%, rgba(0,0,0,.18), rgba(0,0,0,.58)),
//           linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,.55));
//       }

//       /* Day page paper background */
//       .paperBg{
//         position: fixed;
//         inset:0;
//         z-index:0;
//         background:
//           radial-gradient(1100px 800px at 20% 10%, rgba(0,0,0,.03), transparent 60%),
//           radial-gradient(900px 700px at 80% 30%, rgba(0,0,0,.02), transparent 60%),
//           linear-gradient(180deg, #fbfaf7 0%, #f7f4ee 100%);
//       }
//       .paperNoise{
//         position: fixed;
//         inset:0;
//         z-index:1;
//         opacity: .18;
//         background-image:
//           radial-gradient(circle at 10% 20%, rgba(0,0,0,.03) 0 1px, transparent 1px),
//           radial-gradient(circle at 70% 60%, rgba(0,0,0,.02) 0 1px, transparent 1px),
//           radial-gradient(circle at 40% 85%, rgba(0,0,0,.02) 0 1px, transparent 1px);
//         background-size: 14px 14px, 18px 18px, 22px 22px;
//         mix-blend-mode: multiply;
//       }

//       /* Watercolor destination splashes */
//       .wcTop, .wcBottom{
//         position: fixed;
//         left: 0;
//         width: 100%;
//         height: 190px;
//         z-index: 2;
//         pointer-events:none;
//       }
//       .wcTop{ top: 0; }
//       .wcBottom{ bottom: 0; transform: rotate(180deg); }

//       .wcImg{
//         position:absolute;
//         inset:0;
//         background-size: cover;
//         background-position: center;
//         filter: saturate(1.08) contrast(1.02);
//         opacity: .92;
//         -webkit-mask-image: radial-gradient(120% 90% at 50% 40%, #000 0 55%, transparent 74%);
//         mask-image: radial-gradient(120% 90% at 50% 40%, #000 0 55%, transparent 74%);
//       }
//       .wcWash{
//         position:absolute; inset:0;
//         background:
//           radial-gradient(120% 90% at 50% 40%, rgba(255,255,255,.00) 0 40%, rgba(255,255,255,.82) 72%),
//           linear-gradient(180deg, rgba(255,255,255,.00), rgba(255,255,255,.65));
//         mix-blend-mode: screen;
//       }

//       /* layout wrapper */
//       .wrap{ position:relative; z-index: 5; padding: 44px; min-height:100vh; }

//       /* top bar (cover) */
//       .topBar{
//         display:flex;
//         align-items:center;
//         justify-content: space-between;
//         gap: 14px;
//         padding: 14px 16px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.10);
//         border: 1px solid rgba(255,255,255,.18);
//         backdrop-filter: blur(12px);
//         box-shadow: 0 18px 55px rgba(0,0,0,.25);
//       }
//       .topLeft{
//         display:flex;
//         align-items:center;
//         gap: 10px;
//         min-width: 180px;
//       }
//       .topLogo{
//         width: 54px;
//         height:auto;
//         object-fit:contain;
//         filter: drop-shadow(0 12px 28px rgba(0,0,0,.35));
//       }
//       .topCenter{
//         flex:1;
//         text-align:center;
//         font-weight: 950;
//         letter-spacing: .16em;
//         text-transform: uppercase;
//         font-size: 11px;
//       }
//       .topRight{
//         min-width: 180px;
//         text-align:right;
//         font-weight: 950;
//         letter-spacing: .08em;
//         font-size: 11px;
//         opacity: .96;
//       }

//       /* cover hero text */
//       .coverHero{
//         position: relative;
//         margin-top: 72px;
//         display:flex;
//         align-items:flex-start;
//         justify-content:center;
//         text-align:center;
//         padding: 0 18px;
//       }
//       .heroStack{
//         position: relative;
//         max-width: 680px;
//         z-index: 4;
//       }

//       .welcome1{
//         font-family: "Bebas Neue", "Oswald", Inter, Arial, sans-serif;
//         font-size: 44px;
//         font-weight: 900;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         opacity: .95;
//         text-shadow: 0 16px 40px rgba(0,0,0,.55);
//       }
//       .welcome2{
//         font-family: "Playfair Display", "Cinzel", Georgia, serif;
//         font-size: 56px;
//         font-weight: 900;
//         letter-spacing: .02em;
//         margin-top: 10px;
//         text-shadow: 0 18px 45px rgba(0,0,0,.58);
//       }
//       .welcome3{
//         font-family: "Cinzel", "Playfair Display", Georgia, serif;
//         font-size: 40px;
//         font-weight: 900;
//         letter-spacing: .06em;
//         margin-top: 12px;
//         text-transform: uppercase;
//         text-shadow: 0 18px 45px rgba(0,0,0,.58);
//       }

//       /* cover overlay destination cutout image */
//       .coverOverlay{
//         position: absolute;
//         left: 50%;
//         top: 150px;
//         transform: translateX(-50%);
//         width: 650px;
//         max-width: 92%;
//         height: auto;
//         z-index: 6; /* above text */
//         pointer-events:none;
//         filter: drop-shadow(0 22px 55px rgba(0,0,0,.35));
//         opacity: .98;
//       }
//       /* text should be behind overlay */
//       .heroBehind{ z-index: 4; }

//       /* cover bottom */
//       .coverBottom{
//         position: absolute;
//         left: 0;
//         right: 0;
//         bottom: 34px;
//         display:flex;
//         flex-direction: column;
//         align-items:center;
//         justify-content:center;
//         gap: 10px;
//         padding: 0 44px;
//         z-index: 6;
//       }
//       .inclHead{
//         font-weight: 950;
//         letter-spacing: .16em;
//         text-transform: uppercase;
//         font-size: 11px;
//         opacity: .95;
//       }
//       .inclList{
//         text-align:center;
//         font-weight: 850;
//         font-size: 12px;
//         letter-spacing: .06em;
//         opacity: .96;
//       }
//       .priceLine{
//         margin-top: 6px;
//         display:inline-flex;
//         align-items:center;
//         justify-content:center;
//         gap: 10px;
//         padding: 10px 16px;
//         border-radius: 16px;
//         background: rgba(255,255,255,.12);
//         border: 1px solid rgba(255,255,255,.20);
//         backdrop-filter: blur(12px);
//         box-shadow: 0 18px 55px rgba(0,0,0,.25);
//         font-weight: 950;
//         letter-spacing: .08em;
//       }

//       /* day header */
//       .dayHeader{
//         display:flex;
//         align-items:flex-end;
//         justify-content: space-between;
//         gap: 14px;
//         padding-top: 8px;
//         padding-bottom: 14px;
//         border-bottom: 1px dashed rgba(0,0,0,.18);
//       }
//       .dayLeft{
//         display:flex;
//         flex-direction:column;
//         gap: 6px;
//       }
//       .dayLabel{
//         font-family: "Caveat", "Patrick Hand", "Segoe Script", cursive;
//         font-size: 40px;
//         font-weight: 800;
//         letter-spacing: .02em;
//         color: rgba(0,0,0,.82);
//       }
//       .dayDate{
//         font-family: "Caveat", "Patrick Hand", "Segoe Script", cursive;
//         font-size: 22px;
//         font-weight: 700;
//         color: rgba(0,0,0,.62);
//       }
//       .dayDest{
//         font-weight: 950;
//         letter-spacing: .16em;
//         text-transform: uppercase;
//         font-size: 10px;
//       }

//       /* section shell */
//       .section{
//         margin-top: 16px;
//         padding: 16px 16px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.72);
//         border: 1px solid rgba(0,0,0,.06);
//         box-shadow: 0 14px 45px rgba(0,0,0,.06);
//       }
//       .secTitle{
//         font-weight: 950;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         font-size: 11px;
//         color: rgba(0,0,0,.70);
//         margin-bottom: 10px;
//       }
//       .twoCol{
//         display:grid;
//         grid-template-columns: 1.05fr .95fr;
//         gap: 14px;
//         align-items:start;
//       }
//       .titleStrong{
//         font-family: "Playfair Display", "Cinzel", Georgia, serif;
//         font-size: 18px;
//         font-weight: 900;
//         color: rgba(0,0,0,.88);
//         margin: 0 0 8px 0;
//       }
//       .desc{
//         color: rgba(0,0,0,.68);
//         line-height: 1.65;
//         font-weight: 650;
//         font-size: 12.6px;
//       }

//       /* polaroid collage (trip/addon/activity) */
//       .polaroidStage{
//         position: relative;
//         height: 260px;
//         border-radius: 18px;
//         background: radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,.05), transparent 60%);
//         overflow: visible;
//       }
//       .polaroid{
//         position:absolute;
//         width: 160px;
//         height: 120px;
//         background: #fff;
//         border-radius: 14px;
//         padding: 8px 8px 18px 8px;
//         box-shadow: 0 16px 44px rgba(0,0,0,.18);
//         border: 1px solid rgba(0,0,0,.06);
//       }
//       .polaroid img{
//         width:100%;
//         height: 92px;
//         object-fit: cover;
//         border-radius: 10px;
//       }
//       .polaroid small{
//         display:block;
//         margin-top: 6px;
//         font-family: "Caveat", "Patrick Hand", cursive;
//         font-size: 14px;
//         color: rgba(0,0,0,.55);
//       }

//       /* center cutout (8th image) */
//       .cutoutCenter{
//         position:absolute;
//         left: 50%;
//         top: 50%;
//         transform: translate(-50%,-42%);
//         width: 190px;
//         height:auto;
//         filter: drop-shadow(0 20px 48px rgba(0,0,0,.22));
//         opacity: .98;
//         pointer-events:none;
//       }

//       /* vehicle layout (big + 3 overlap) */
//       .vehicleWrap{
//         margin-top: 6px;
//       }
//       .vehicleTitle{
//         font-weight: 950;
//         letter-spacing: .10em;
//         text-transform: uppercase;
//         font-size: 11px;
//         color: rgba(0,0,0,.72);
//         margin-bottom: 10px;
//       }
//       .vehStage{
//         position: relative;
//         height: 230px;
//         border-radius: 18px;
//         overflow: visible;
//       }
//       .vehBig{
//         position:absolute;
//         left: 0;
//         right: 0;
//         top: 0;
//         height: 185px;
//         border-radius: 18px;
//         overflow:hidden;
//         box-shadow: 0 16px 44px rgba(0,0,0,.18);
//         border: 1px solid rgba(0,0,0,.06);
//         background: #fff;
//       }
//       .vehBig img{
//         width:100%;
//         height:100%;
//         object-fit: cover;
//       }
//       .vehSmallRow{
//         position:absolute;
//         left: 0;
//         right: 0;
//         bottom: 0;
//         display:flex;
//         gap: 10px;
//         justify-content:center;
//         padding: 0 10px;
//       }
//       .vehSmall{
//         width: 120px;
//         height: 78px;
//         border-radius: 14px;
//         overflow:hidden;
//         border: 6px solid #fff;
//         box-shadow: 0 14px 34px rgba(0,0,0,.18);
//         transform: translateY(-14px);
//       }
//       .vehSmall:nth-child(1){ transform: translateY(-18px) rotate(-2deg); }
//       .vehSmall:nth-child(2){ transform: translateY(-22px) rotate(1deg); }
//       .vehSmall:nth-child(3){ transform: translateY(-18px) rotate(-1deg); }
//       .vehSmall img{ width:100%; height:100%; object-fit: cover; }

//       /* accommodation banner */
//       .accBanner{
//         position: relative;
//         border-radius: 22px;
//         overflow:hidden;
//         min-height: 210px;
//         box-shadow: 0 18px 55px rgba(0,0,0,.18);
//         border: 1px solid rgba(0,0,0,.06);
//       }
//       .accBg{
//         position:absolute; inset:0;
//         background-size: cover;
//         background-position:center;
//         filter: saturate(1.05);
//       }
//       .accTint{
//         position:absolute; inset:0;
//         background: rgba(10, 45, 28, .64); /* standard dark green tint */
//       }
//       .accContent{
//         position: relative;
//         z-index: 2;
//         padding: 18px 18px;
//         color: rgba(255,255,255,.92);
//       }
//       .accContent .accName{
//         font-family: "Playfair Display", "Cinzel", Georgia, serif;
//         font-size: 18px;
//         font-weight: 900;
//         margin: 0 0 8px 0;
//       }
//       .accMeta{
//         display:flex;
//         gap: 12px;
//         flex-wrap: wrap;
//         margin-top: 10px;
//         font-weight: 850;
//         letter-spacing: .06em;
//         font-size: 12px;
//         color: rgba(255,255,255,.90);
//       }
//       .accMeta span{
//         padding: 8px 10px;
//         border-radius: 14px;
//         background: rgba(255,255,255,.10);
//         border: 1px solid rgba(255,255,255,.16);
//         backdrop-filter: blur(10px);
//       }
//       .accFloatImgs{
//         position: relative;
//         margin-top: 12px;
//         height: 120px;
//       }
//       .accFloat{
//         position:absolute;
//         width: 160px;
//         height: 110px;
//         border-radius: 18px;
//         overflow:hidden;
//         border: 7px solid rgba(255,255,255,.95);
//         box-shadow: 0 18px 55px rgba(0,0,0,.22);
//       }
//       .accFloat img{ width:100%; height:100%; object-fit: cover; }
//       .accFloat.one{ right: 10px; top: -30px; transform: rotate(2deg); }
//       .accFloat.two{ right: 150px; top: -20px; transform: rotate(-2deg); }
//       .accFloat.three{ right: 290px; top: -28px; transform: rotate(1deg); }

//       /* meals (kept, just styled) */
//       .mealRow{
//         display:flex;
//         flex-wrap: wrap;
//         gap: 10px;
//         margin-top: 6px;
//       }
//       .mealPill{
//         padding: 10px 12px;
//         border-radius: 16px;
//         background: rgba(0,0,0,.04);
//         border: 1px solid rgba(0,0,0,.06);
//         font-weight: 850;
//         color: rgba(0,0,0,.74);
//       }

//       /* keepTogether */
//       .keepTogether{
//         break-inside: avoid;
//         page-break-inside: avoid;
//         -webkit-column-break-inside: avoid;
//       }
//     `;

//     /* ===============================
//        COVER HTML (UPDATED DESIGN ONLY)
//     ================================ */
//     const pax = Number(client.numberOfPersons || 0);
//     const totalCost = pax * Number(tour.pricePerPax || 0);
//     const disc = Number(discountAmount || 0);
//     const finalPayable = Math.max(0, totalCost - disc);

//     const clientDisplayName =
//       client?.name || client?.clientName || client?.fullName || "Customer";
//     const clientDisplayId =
//       client?.clientId ||
//       client?.clientCode ||
//       client?.clientNumber ||
//       String(client?._id || "");

//     const inclusions = Array.isArray(tour?.includes) ? tour.includes.filter(Boolean) : [];
//     const inclusionsLine =
//       inclusions.length > 0 ? inclusions.map((x) => esc(x)).join(" | ") : "-";

//     const coverHtml = `<!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8"/>
//       <style>${commonCss}</style>
//       <link rel="preconnect" href="https://fonts.googleapis.com">
//       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//       <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Playfair+Display:wght@600;700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
//     </head>
//     <body>
//       <div class="coverBg" style="background-image:url('${coverBg}')"></div>

//       <div class="wrap" style="padding-top:34px;">
//         <div class="topBar" style="color:${esc(destTextColor)}">
//           <div class="topLeft">
//             ${
//               company?.logo
//                 ? `<img class="topLogo" src="${safeImg(company.logo)}" />`
//                 : `<div style="width:54px;height:34px;"></div>`
//             }
//           </div>
//           <div class="topCenter">Group Tour</div>
//           <div class="topRight">Client ID: ${esc(clientDisplayId)}</div>
//         </div>

//         <div class="coverHero">
//           <div class="heroStack heroBehind" style="color:${esc(destTextColor)}">
//             <div class="welcome1">WELCOME</div>
//             <div class="welcome2">${esc(clientDisplayName)}</div>
//             <div class="welcome3">TO ${esc(tour.tourName || "TOUR")}</div>
//           </div>

//           ${
//             coverOverlay
//               ? `<img class="coverOverlay" src="${coverOverlay}" />`
//               : ``
//           }
//         </div>

//         <div class="coverBottom" style="color:${esc(destTextColor)}">
//           <div class="inclHead">INCLUSIONS</div>
//           <div class="inclList">${inclusionsLine}</div>

//           <div class="priceLine">
//             <span>Total Price:</span>
//             <span>${esc(finalPayable)}${disc > 0 ? ` (Discount ${esc(disc)})` : ""}</span>
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>`;

//     /* ===============================
//        DAY HTML (UPDATED DESIGN ONLY)
//        - off white paper + watercolor destination images (top/bottom, no repeat best-effort)
//        - trip collage uses up to 8 images with 8th as center cutout
//        - trip vehicle layout: big + 3 overlap
//        - addon collage like polaroid stage + description
//        - show addon vehicle only if different
//        - activities creative collage + details
//        - accommodation banner with dark green tint + float images half-outside
//        - meals kept but styled
//        - destination name shown using Destination.textColor
//     ================================ */
//     const dayHtml = (day, dayIndex) => {
//       const segments = Array.isArray(day.segments) ? day.segments : [];
//       const decor = pickDayDecor(dayIndex);
//       const topImg = decor.top || fallbackCoverBg;
//       const bottomImg = decor.bottom || fallbackCoverBg;

//       // DEDUPE SETS (per DAY) — keep your existing behavior
//       const seenTripVehicle = new Set();
//       const seenAddonVehicle = new Set();
//       const seenAccommodation = new Set();
//       const seenActivity = new Set();

//       const pickMealFromFoods = (foods, type) =>
//         (foods || []).find((f) => String(f?.mealType || "").toLowerCase() === type)
//           ?.foodName || "-";

//       const buildPolaroids = (imgs, labels = []) => {
//         const safe = (imgs || []).filter(Boolean);
//         const p1 = safe[0] || "";
//         const p2 = safe[1] || "";
//         const p3 = safe[2] || "";
//         const p4 = safe[3] || "";
//         const center = safe[7] || ""; // 8th image as cutout center

//         return `
//           <div class="polaroidStage">
//             ${p1 ? `<div class="polaroid" style="left:4px; top:10px; transform:rotate(-4deg)"><img src="${p1}"/><small>${esc(labels[0] || "")}</small></div>` : ""}
//             ${p2 ? `<div class="polaroid" style="right:10px; top:18px; transform:rotate(4deg)"><img src="${p2}"/><small>${esc(labels[1] || "")}</small></div>` : ""}
//             ${p3 ? `<div class="polaroid" style="left:28px; bottom:18px; transform:rotate(2deg)"><img src="${p3}"/><small>${esc(labels[2] || "")}</small></div>` : ""}
//             ${p4 ? `<div class="polaroid" style="right:34px; bottom:12px; transform:rotate(-2deg)"><img src="${p4}"/><small>${esc(labels[3] || "")}</small></div>` : ""}
//             ${center ? `<img class="cutoutCenter" src="${center}" />` : ""}
//           </div>
//         `;
//       };

//       const buildVehicleBlock = (heading, vehicleDoc, fallbackTitle) => {
//         const vImgs = getDocImgsUpTo8(vehicleDoc);
//         if (!vImgs.length) return "";

//         const big = vImgs[0];
//         const smalls = vImgs.slice(1, 4);

//         return `
//           <div class="section keepTogether">
//             <div class="vehicleTitle">${esc(heading || fallbackTitle || "VEHICLE")}</div>
//             <div class="vehStage">
//               <div class="vehBig">${big ? `<img src="${big}" />` : ""}</div>
//               <div class="vehSmallRow">
//                 ${smalls.map((u) => `<div class="vehSmall"><img src="${u}" /></div>`).join("")}
//               </div>
//             </div>
//           </div>
//         `;
//       };

//       const segmentBlocks = segments
//         .map((seg) => {
//           const trip = seg.tripDoc || null;
//           const addon = seg.addonDoc || null;

//           const activities = Array.isArray(seg.activityDocs) ? seg.activityDocs : [];
//           const foods = Array.isArray(seg.boFoods) ? seg.boFoods : [];
//           const accs = Array.isArray(seg.boAccommodations) ? seg.boAccommodations : [];
//           const tripVehicles = Array.isArray(seg.boTripVehicles) ? seg.boTripVehicles : [];
//           const addonVehicles = Array.isArray(seg.boAddonVehicles) ? seg.boAddonVehicles : [];

//           /* -------- TRIP section -------- */
//           const tripImgs = getDocImgsUpTo8(trip);
//           const tripBlock = trip
//             ? `
//               <div class="section keepTogether">
//                 <div class="secTitle">Trip</div>
//                 <div class="twoCol">
//                   <div>
//                     <div class="titleStrong">${esc(trip.tripName || "")}</div>
//                     <div class="desc">${esc(trip.description || "")}</div>
//                   </div>
//                   <div>
//                     ${buildPolaroids(tripImgs, ["", "", "", ""])}
//                   </div>
//                 </div>
//               </div>
//             `
//             : "";

//           /* -------- TRIP VEHICLES (unique) -------- */
//           let firstTripVehicleShown = null;
//           const tripVehiclesHtml = tripVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";
//               if (seenTripVehicle.has(vKey)) return "";
//               seenTripVehicle.add(vKey);

//               // treat first trip vehicle as "main vehicle" for addon compare
//               if (!firstTripVehicleShown) {
//                 firstTripVehicleShown = String(v?.vehicleId || v?.vehicleName || "");
//               }

//               const vd = v?.vehicleDoc || null;
//               const heading = trip?.tripName
//                 ? `THE VEHICLE FOR "${trip.tripName}"`
//                 : "THE VEHICLE FOR TRIP";

//               return buildVehicleBlock(heading, vd, heading);
//             })
//             .join("");

//           /* -------- ADDON section -------- */
//           const addonImgs = getDocImgsUpTo8(addon);
//           const addonBlock = addon
//             ? `
//               <div class="section keepTogether">
//                 <div class="secTitle">Add-on Trip</div>
//                 <div class="twoCol">
//                   <div>
//                     ${buildPolaroids(addonImgs, ["", "", "", ""])}
//                   </div>
//                   <div>
//                     <div class="titleStrong">${esc(addon.addontripName || "")}</div>
//                     <div class="desc">${esc(addon.description || "")}</div>
//                   </div>
//                 </div>
//               </div>
//             `
//             : "";

//           /* -------- ADDON VEHICLE (unique + only if different from trip) -------- */
//           const addonVehiclesHtml = addonVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";

//               // do not show if same as main trip vehicle (best-effort match)
//               if (firstTripVehicleShown && String(v?.vehicleId || v?.vehicleName || "") === firstTripVehicleShown) {
//                 return "";
//               }

//               if (seenAddonVehicle.has(vKey)) return "";
//               seenAddonVehicle.add(vKey);

//               const vd = v?.vehicleDoc || null;
//               const heading = addon?.addontripName
//                 ? `THE VEHICLE FOR "${addon.addontripName}"`
//                 : "THE VEHICLE FOR ADD-ON";

//               return buildVehicleBlock(heading, vd, heading);
//             })
//             .join("");

//           /* -------- ACTIVITIES (ALL UNIQUE) -------- */
//           const activitiesHtml = activities
//             .map((a) => {
//               const aKey = String(a?._id || "");
//               if (!aKey) return "";
//               if (seenActivity.has(aKey)) return "";
//               seenActivity.add(aKey);

//               const aImgs = getDocImgsUpTo8(a);
//               const leftTitle = esc(a?.activityName || a?.name || "");
//               const leftDesc = esc(a?.description || "");

//               // Keep it looking "not auto generated": rotate + varied placement via polaroid stage
//               return `
//                 <div class="section keepTogether">
//                   <div class="secTitle">Activity</div>
//                   <div class="twoCol">
//                     <div>
//                       <div class="titleStrong">${leftTitle}</div>
//                       <div class="desc">${leftDesc}</div>
//                     </div>
//                     <div>
//                       ${buildPolaroids(aImgs, ["", "", "", ""])}
//                     </div>
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           /* -------- ACCOMMODATION (ALL UNIQUE) -------- */
//           const accommodationsHtml = accs
//             .map((acc) => {
//               const accKey = String(acc?.accommodationId || acc?.propertyName || "");
//               if (!accKey) return "";
//               if (seenAccommodation.has(accKey)) return "";
//               seenAccommodation.add(accKey);

//               const accDoc = acc?.accommodationDoc || null;
//               const aImgs = getDocImgsUpTo8(accDoc);

//               const bg = aImgs[0] || "";
//               const floats = aImgs.slice(1, 4);

//               return `
//                 <div class="section keepTogether" style="padding:0; background:transparent; border:none; box-shadow:none;">
//                   <div class="accBanner">
//                     <div class="accBg" style="background-image:url('${bg}')"></div>
//                     <div class="accTint"></div>
//                     <div class="accContent">
//                       <div class="secTitle" style="color: rgba(255,255,255,.85);">Accommodation</div>
//                       <div class="accName">${esc(acc?.propertyName || "-")}</div>
//                       <div style="opacity:.92; line-height:1.55; font-weight:700;">
//                         ${esc(accDoc?.address || "")}
//                       </div>
//                       <div class="accMeta">
//                         <span>Category: ${esc(acc?.hotelCategory || "-")}</span>
//                         <span>Room: ${esc(acc?.roomCategory || "-")}</span>
//                         ${acc?.vendorName ? `<span>Vendor: ${esc(acc.vendorName)}</span>` : ""}
//                       </div>

//                       <div class="accFloatImgs">
//                         ${floats[0] ? `<div class="accFloat one"><img src="${floats[0]}" /></div>` : ""}
//                         ${floats[1] ? `<div class="accFloat two"><img src="${floats[1]}" /></div>` : ""}
//                         ${floats[2] ? `<div class="accFloat three"><img src="${floats[2]}" /></div>` : ""}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           /* -------- MEALS (kept) -------- */
//           const breakfast = pickMealFromFoods(foods, "breakfast");
//           const lunch = pickMealFromFoods(foods, "lunch");
//           const dinner = pickMealFromFoods(foods, "dinner");

//           const mealsHeading = trip?.tripName
//             ? `Meals Included in ${trip.tripName}`
//             : "Meals Included";

//           const mealsBlock = `
//             <div class="section keepTogether">
//               <div class="secTitle">${esc(mealsHeading)}</div>
//               <div class="mealRow">
//                 <div class="mealPill">Breakfast: ${esc(breakfast)}</div>
//                 <div class="mealPill">Lunch: ${esc(lunch)}</div>
//                 <div class="mealPill">Dinner: ${esc(dinner)}</div>
//               </div>
//             </div>
//           `;

//           return `
//             ${tripBlock}
//             ${tripVehiclesHtml}
//             ${addonBlock}
//             ${addonVehiclesHtml}
//             ${activitiesHtml}
//             ${accommodationsHtml}
//             ${mealsBlock}
//           `;
//         })
//         .join("");

//       return `<!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8"/>
//         <style>${commonCss}</style>
//         <link rel="preconnect" href="https://fonts.googleapis.com">
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//         <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:wght@600;700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
//       </head>
//       <body>
//         <div class="paperBg"></div>
//         <div class="paperNoise"></div>

//         <div class="wcTop">
//           <div class="wcImg" style="background-image:url('${topImg}')"></div>
//           <div class="wcWash"></div>
//         </div>
//         <div class="wcBottom">
//           <div class="wcImg" style="background-image:url('${bottomImg}')"></div>
//           <div class="wcWash"></div>
//         </div>

//         <div class="wrap" style="padding-top:56px; padding-bottom:64px;">
//           <div class="dayHeader keepTogether">
//             <div class="dayLeft">
//               <div class="dayLabel">${esc(day.dayLabel || "Day")}</div>
//               <div class="dayDate">${esc(fmtDate(day.date))}</div>
//             </div>
//             <div class="dayDest" style="color:${esc(destinationDoc?.textColor || "#000000")}">
//               ${esc(destName || "")}
//             </div>
//           </div>

//           ${
//             segmentBlocks ||
//             `<div class="section keepTogether" style="background: rgba(255,255,255,.70)">No itinerary segments found for this day.</div>`
//           }
//         </div>
//       </body>
//       </html>`;
//     };

//     /* ===============================
//        PDF RENDER + MERGE (UNCHANGED)
//     ================================ */
//     async function renderPdfFromHtml(browser, html) {
//       const page = await browser.newPage();
//       await page.setViewport({ width: 1123, height: 1587 }); // A4-ish
//       await page.setContent(html, { waitUntil: "networkidle0" });

//       const buf = await page.pdf({
//         format: "A4",
//         printBackground: true,
//         margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
//       });

//       await page.close();
//       return buf;
//     }

//     async function mergePdfs(buffers) {
//       const merged = await PDFDocument.create();
//       for (const b of buffers) {
//         const pdf = await PDFDocument.load(b);
//         const pages = await merged.copyPages(pdf, pdf.getPageIndices());
//         pages.forEach((p) => merged.addPage(p));
//       }
//       return Buffer.from(await merged.save());
//     }

//     const browser = await puppeteer.launch({ headless: "new" });
//     const pdfParts = [];

//     // cover
//     pdfParts.push(await renderPdfFromHtml(browser, coverHtml));

//     // days
//     let di = 0;
//     for (const day of tour.days || []) {
//       pdfParts.push(await renderPdfFromHtml(browser, dayHtml(day, di)));
//       di += 1;
//     }

//     await browser.close();

//     const finalPdfBuffer = await mergePdfs(pdfParts);
  
//     /* ---------- UPDATE CLIENT (AFTER PDF) ---------- */
//     // const pax = Number(client.numberOfPersons || 0);
//     // const totalCost = pax * Number(tour.pricePerPax || 0);
//     // const disc = Number(discountAmount || 0);

//     const ist = getIstNow();
//     const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

//     const reasonLabel =
//       disc > 0
//         ? `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
//         : `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent without any discount`;

//     client.statusUpdatedByExecutive.push({
//       status: "Detail Sent",
//       value: 3,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       date: todayDateStr,
//       time: todayTimeStr,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//       reasonLabel,
//     });

//     const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
//     if (!scheduledDateObj) {
//       return res
//         .status(400)
//         .json({ message: "Invalid date/time for scheduled follow-up" });
//     }

//     client.ScheduleDatesByExecutives.push({
//       status: "Detail Sent",
//       reasonLabel: "Group Tour Referral Itinerary Sent",
//       scheduledDate: scheduledDateObj,
//       scheduledTimeRaw: nextTimeRaw,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//     });

//     await client.save();

//     /* ---------- STREAM PDF ---------- */
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="Referral-Itinerary-${tour.tourName}.pdf"`,
//     });

//     return res.send(finalPdfBuffer);
//   } catch (err) {
//     console.error("Referral PDF error:", err);
//     return res.status(500).json({ message: "PDF generation failed" });
//   }
// }
 


// export async function downloadGroupTourReferralItinerary(req, res) {
//   try {
//     const executiveId = req.userId;
//     const {
//       clientId,
//       groupTourId,
//       nextDateRaw,
//       nextTimeRaw,
//       discountAmount = 0,
//     } = req.body || {};

//     /* ---------- VALIDATIONS (UNCHANGED) ---------- */
//     if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

//     if (
//       !mongoose.isValidObjectId(executiveId) ||
//       !mongoose.isValidObjectId(clientId) ||
//       !mongoose.isValidObjectId(groupTourId)
//     ) {
//       return res.status(400).json({ message: "Invalid IDs" });
//     }

//     if (!nextDateRaw || !nextTimeRaw) {
//       return res
//         .status(400)
//         .json({ message: "nextDateRaw and nextTimeRaw are required" });
//     }

//     /* ---------- FETCH CORE DATA ---------- */
//     const exec = await Executive.findById(executiveId).populate("company").lean();
//     if (!exec) return res.status(404).json({ message: "Executive not found" });

//     const client = await Client.findById(clientId);
//     if (!client) return res.status(404).json({ message: "Client not found" });

//     const tour = await GroupTour.findById(groupTourId).lean();
//     if (!tour) return res.status(404).json({ message: "Group tour not found" });

//     const company = await Company.findById(exec.company).lean();

//     /* ---------- POPULATE DAY SEGMENTS ---------- */
//     for (const day of tour.days || []) {
//       for (const seg of day.segments || []) {
//         seg.tripDoc = seg.trip ? await Trip.findById(seg.trip).lean() : null;

//         seg.addonDoc = seg.selectedAddon
//           ? await AddOnTrip.findById(seg.selectedAddon).lean()
//           : null;

//         seg.activityDocs = await Activity.find({
//           _id: { $in: seg.selectedActivities || [] },
//         }).lean();

//         for (const v of seg.boTripVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const v of seg.boAddonVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const a of seg.boAccommodations || []) {
//           a.accommodationDoc = a.accommodationId
//             ? await Accommodation.findById(a.accommodationId).lean()
//             : null;
//         }
//       }
//     }

//     /* ===============================
//        SMALL HELPERS (safe HTML)
//        ✅ keep optimization (size+speed) untouched
//     ================================ */
//     const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

//     const esc = (s) => {
//       if (s === null || s === undefined) return "";
//       return String(s)
//         .replaceAll("&", "&amp;")
//         .replaceAll("<", "&lt;")
//         .replaceAll(">", "&gt;")
//         .replaceAll('"', "&quot;")
//         .replaceAll("'", "&#039;");
//     };

//     const safeImgRaw = (url) => (url && String(url).trim() ? String(url).trim() : "");

//     const cloudinaryOptimized = (url, w = 1600) => {
//       const u = safeImgRaw(url);
//       if (!u) return "";
//       if (!u.includes("/upload/")) return u; // non-cloudinary
//       if (
//         u.includes("/upload/f_auto") ||
//         u.includes("/upload/q_auto") ||
//         u.includes("f_auto") ||
//         u.includes("q_auto")
//       ) {
//         return u;
//       }
//       return u.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_limit/`);
//     };

//     const imgTag = (url, w, className = "", style = "") => {
//       const orig = safeImgRaw(url);
//       if (!orig) return "";
//       const opt = cloudinaryOptimized(orig, w);
//       return `<img${className ? ` class="${className}"` : ""}${
//         style ? ` style="${style}"` : ""
//       } src="${opt}" onerror="this.onerror=null;this.src='${orig}'" />`;
//     };

//     const bgCss = (url, w) => {
//       const orig = safeImgRaw(url);
//       if (!orig) return "";
//       const opt = cloudinaryOptimized(orig, w);
//       return `background-image:url('${opt}'), url('${orig}')`;
//     };

//     const safeImg = safeImgRaw;

//     const getDocImgsUpTo8 = (doc) => {
//       if (!doc) return [];
//       const urls = [
//         doc.imageUrl,
//         doc.secondImageUrl,
//         doc.thirdImageUrl,
//         doc.fourthImageUrl,
//         doc.fifthImageUrl,
//         doc.sixthImageUrl,
//         doc.seventhImageUrl,
//         doc.eightImageUrl || doc.eighthImageUrl,
//       ];
//       return urls.map(safeImg).filter(Boolean);
//     };

//     const fallbackCoverBg =
//       "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

//     /* ===============================
//        Destination fetch (PDF ONLY)
//     ================================ */
//     let destinationDoc = null;
//     try {
//       if (tour?.destination && mongoose.isValidObjectId(tour.destination)) {
//         destinationDoc = await Destination.findById(tour.destination).lean();
//       }
//     } catch (_) {
//       destinationDoc = null;
//     }

//     const destImgsAll = getDocImgsUpTo8(destinationDoc);
//     const destTextColor = safeImg(destinationDoc?.textColor) || "#ffffff";
//     const destName = destinationDoc?.name ? String(destinationDoc.name) : "";

//     const coverBg = destImgsAll[0] || fallbackCoverBg;
//     const coverOverlay = destImgsAll[1] || "";

//     // ✅ Day decor pool must NOT use destination 2nd image
//     const decorPool = (destImgsAll || [])
//       .filter(Boolean)
//       .filter((u) => u !== destImgsAll[1]); // exclude 2nd image from random bg pool
//     if (!decorPool.length) decorPool.push(coverBg || fallbackCoverBg);

//     const pickDayDecor = (() => {
//       const used = new Set();
//       const pool = decorPool.slice();
//       let idx = 0;

//       const takeUnique = () => {
//         for (let t = 0; t < pool.length; t++) {
//           const u = pool[(idx + t) % pool.length];
//           if (!used.has(u)) {
//             used.add(u);
//             idx = (idx + t + 1) % pool.length;
//             return u;
//           }
//         }
//         const u = pool[idx % pool.length];
//         idx = (idx + 1) % pool.length;
//         return u;
//       };

//       return (dayIndex) => {
//         idx = (idx + (dayIndex * 2 + 1)) % pool.length;
//         const top = takeUnique();
//         const bottom = takeUnique();
//         return { top, bottom };
//       };
//     })();

//     /* ===============================
//        HTML/CSS (UPDATED DESIGN ONLY)
//     ================================ */
//     const commonCss = `
//       @page { size:A4; margin:0 }
//       html, body { margin:0; padding:0; font-family: Inter, Arial, sans-serif; }
//       * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

//       /* COVER */
//       .coverBg{
//         position: fixed; inset:0;
//         background-size: cover;
//         background-position: center;
//         background-repeat: no-repeat;
//         z-index:0;
//       }
//       /* ✅ no darkening */
//       .coverBg::after{
//         content:"";
//         position:absolute; inset:0;
//         background: none;
//       }

//       /* Full-page cutout overlay (2nd image) */
//       .coverOverlayFull{
//         position: fixed;
//         inset:0;
//         width:100%;
//         height:100%;
//         object-fit: cover;
//         z-index: 5; /* above text */
//         pointer-events:none;
//       }

//       /* sporty top details (bigger) */
//       .coverTop{
//         position: fixed;
//         top: 26px;
//         left: 32px;
//         right: 32px;
//         z-index: 6;
//         display:flex;
//         align-items:center;
//         justify-content: space-between;
//         gap: 14px;
//       }
//       .coverTopLeft{
//         display:flex;
//         align-items:center;
//         gap: 12px;
//       }
//       .coverLogo{
//         width: 86px;
//         height:auto;
//         object-fit:contain;
//         filter: drop-shadow(0 16px 36px rgba(0,0,0,.22));
//       }
//       .coverTopMid{
//         flex: 1;
//         text-align:center;
//         font-family: "Teko", "Anton", Inter, sans-serif;
//         font-size: 26px;
//         letter-spacing: .22em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//       }
//       .coverTopRight{
//         font-family: "Teko", "Anton", Inter, sans-serif;
//         font-size: 22px;
//         letter-spacing: .10em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//       }

//       /* hero text (sporty) */
//       .wrap{ position:relative; z-index: 4; padding: 44px; min-height:100vh; }

//       .coverHero{
//         position: relative;
//         margin-top: 130px;
//         display:flex;
//         align-items:flex-start;
//         justify-content:center;
//         text-align:center;
//         padding: 0 22px;
//         z-index: 4; /* ✅ behind overlay image */
//       }
//       .heroStack{
//         position: relative;
//         max-width: 760px;
//         z-index: 4;
//       }

//       .welcome1{
//         font-family: "Bangers", "Black Ops One", "Anton", sans-serif;
//         font-size: 56px;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }
//       .welcome2{
//         font-family: "Black Ops One", "Bangers", "Anton", sans-serif;
//         font-size: 64px;
//         letter-spacing: .05em;
//         margin-top: 10px;
//         font-weight: 900;
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }
//       .welcome3{
//         font-family: "Teko", "Anton", sans-serif;
//         font-size: 50px;
//         letter-spacing: .18em;
//         margin-top: 12px;
//         text-transform: uppercase;
//         font-weight: 900;
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }

//       /* bottom area */
//       .coverBottom{
//         position: fixed;
//         left: 0;
//         right: 0;
//         bottom: 30px;
//         display:flex;
//         flex-direction: column;
//         align-items:center;
//         justify-content:center;
//         gap: 10px;
//         padding: 0 44px;
//         z-index: 6;
//       }
//       .inclHead{
//         font-family: "Teko","Anton",sans-serif;
//         font-weight: 900;
//         letter-spacing: .22em;
//         text-transform: uppercase;
//         font-size: 16px;
//         opacity: .98;
//       }
//       .inclList{
//         text-align:center;
//         font-weight: 850;
//         font-size: 12px;
//         letter-spacing: .06em;
//         opacity: .98;
//       }

//       .priceLine{
//         margin-top: 4px;
//         display:flex;
//         align-items:center;
//         justify-content:center;
//         gap: 12px;
//         padding: 10px 16px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.14);
//         border: 1px solid rgba(255,255,255,.22);
//         backdrop-filter: blur(14px);
//         box-shadow: 0 18px 55px rgba(0,0,0,.12);
//         font-family: "Teko","Anton",sans-serif;
//         letter-spacing: .10em;
//         font-size: 18px;
//         font-weight: 900;
//       }

//       .alertBox{
//         margin-top: 8px;
//         width: 92%;
//         max-width: 720px;
//         padding: 12px 14px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.18);
//         border: 1px solid rgba(255,255,255,.24);
//         backdrop-filter: blur(14px);
//         box-shadow: 0 18px 55px rgba(0,0,0,.12);
//         text-align:center;
//         font-weight: 850;
//         letter-spacing: .04em;
//         font-size: 12px;
//         opacity: .98;
//       }

//       /* DAY PAGES */
//       .paperBg{
//         position: fixed; inset:0; z-index:0;
//         background:
//           radial-gradient(1100px 800px at 20% 10%, rgba(0,0,0,.03), transparent 60%),
//           radial-gradient(900px 700px at 80% 30%, rgba(0,0,0,.02), transparent 60%),
//           linear-gradient(180deg, #fbfaf7 0%, #f7f4ee 100%);
//       }
//       .paperNoise{
//         position: fixed; inset:0; z-index:1; opacity: .18;
//         background-image:
//           radial-gradient(circle at 10% 20%, rgba(0,0,0,.03) 0 1px, transparent 1px),
//           radial-gradient(circle at 70% 60%, rgba(0,0,0,.02) 0 1px, transparent 1px),
//           radial-gradient(circle at 40% 85%, rgba(0,0,0,.02) 0 1px, transparent 1px);
//         background-size: 14px 14px, 18px 18px, 22px 22px;
//         mix-blend-mode: multiply;
//       }

//       .wcTop, .wcBottom{
//         position: fixed; left: 0; width: 100%; height: 190px;
//         z-index: 2; pointer-events:none;
//       }
//       .wcTop{ top: 0; }
//       .wcBottom{ bottom: 0; transform: rotate(180deg); }

//       .wcImg{
//         position:absolute; inset:0;
//         background-size: cover;
//         background-position: center;
//         filter: saturate(1.08) contrast(1.02);
//         opacity: .92;
//         -webkit-mask-image: radial-gradient(120% 90% at 50% 40%, #000 0 55%, transparent 74%);
//         mask-image: radial-gradient(120% 90% at 50% 40%, #000 0 55%, transparent 74%);
//       }
//       .wcWash{
//         position:absolute; inset:0;
//         background:
//           radial-gradient(120% 90% at 50% 40%, rgba(255,255,255,.00) 0 40%, rgba(255,255,255,.82) 72%),
//           linear-gradient(180deg, rgba(255,255,255,.00), rgba(255,255,255,.65));
//         mix-blend-mode: screen;
//       }

//       .dayHeader{
//         display:flex;
//         align-items:flex-end;
//         justify-content: space-between;
//         gap: 14px;
//         padding-top: 8px;
//         padding-bottom: 14px;
//         border-bottom: 1px dashed rgba(0,0,0,.18);
//       }
//       .dayLabel{
//         font-family: "Caveat","Patrick Hand","Segoe Script",cursive;
//         font-size: 40px;
//         font-weight: 800;
//         color: rgba(0,0,0,.82);
//       }
//       .dayDate{
//         font-family: "Caveat","Patrick Hand","Segoe Script",cursive;
//         font-size: 22px;
//         font-weight: 700;
//         color: rgba(0,0,0,.62);
//       }
//       .dayDest{
//         font-weight: 950;
//         letter-spacing: .16em;
//         text-transform: uppercase;
//         font-size: 10px;
//       }

//       .section{
//         margin-top: 16px;
//         padding: 16px 16px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.72);
//         border: 1px solid rgba(0,0,0,.06);
//         box-shadow: 0 14px 45px rgba(0,0,0,.06);
//       }
//       .secTitle{
//         font-weight: 950;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         font-size: 11px;
//         color: rgba(0,0,0,.70);
//         margin-bottom: 10px;
//       }
//       .twoCol{
//         display:grid;
//         grid-template-columns: 1.05fr .95fr;
//         gap: 14px;
//         align-items:start;
//       }
//       .titleStrong{
//         font-family: "Montserrat Alternates","Playfair Display","Cinzel",Georgia,serif;
//         font-size: 18px;
//         font-weight: 900;
//         color: rgba(0,0,0,.88);
//         margin: 0 0 8px 0;
//       }
//       .desc{
//         color: rgba(0,0,0,.68);
//         line-height: 1.65;
//         font-weight: 650;
//         font-size: 12.6px;
//       }

//       /* Trip collage upgraded (more “designed”) */
//       .collage{
//         position: relative;
//         height: 270px;
//         border-radius: 20px;
//         overflow: visible;
//         background:
//           radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,.06), transparent 60%);
//       }
//       .card{
//         position:absolute;
//         width: 168px;
//         height: 126px;
//         border-radius: 18px;
//         overflow:hidden;
//         box-shadow: 0 18px 52px rgba(0,0,0,.18);
//         transform-origin: center;
//       }
//       .card img{ width:100%; height:100%; object-fit: cover; }

//       .card.a{ left: 6px; top: 10px; transform: rotate(-6deg); }
//       .card.b{ right: 10px; top: 12px; transform: rotate(6deg); }
//       .card.c{ left: 30px; bottom: 10px; transform: rotate(3deg); }
//       .card.d{ right: 34px; bottom: 6px; transform: rotate(-3deg); }

//       /* ✅ last trip image (8th) as top layer */
//       .collageTopCutout{
//         position:absolute;
//         left: 50%;
//         top: 6px;
//         transform: translateX(-50%);
//         width: 220px;
//         height:auto;
//         filter: drop-shadow(0 22px 55px rgba(0,0,0,.20));
//         pointer-events:none;
//         z-index: 5;
//       }

//       /* VEHICLE: narrow big + 3 strips (no gaps, no stroke) */
//       .vehicleTitle{
//         font-weight: 950;
//         letter-spacing: .10em;
//         text-transform: uppercase;
//         font-size: 11px;
//         color: rgba(0,0,0,.72);
//         margin-bottom: 10px;
//       }
//       .vehStage{
//         position: relative;
//         height: 210px;
//         border-radius: 18px;
//         overflow: hidden;
//         background: rgba(0,0,0,.03);
//       }
//       .vehMain{
//         position:absolute;
//         left: 50%;
//         top: 10px;
//         transform: translateX(-50%);
//         width: 72%;
//         height: 130px;
//         border-radius: 18px;
//         overflow:hidden;
//         box-shadow: 0 16px 44px rgba(0,0,0,.16);
//       }
//       .vehMain img{ width:100%; height:100%; object-fit: cover; }

//       .vehStrips{
//         position:absolute;
//         left:0; right:0;
//         bottom:0;
//         height: 80px;
//         display:flex;
//         gap: 0; /* no gap */
//       }
//       .vehStrip{
//         flex: 1;
//         overflow:hidden;
//       }
//       .vehStrip img{
//         width:100%;
//         height:100%;
//         object-fit: cover;
//       }

//       /* Addon layout: reference-like cards */
//       .addonCards{
//         display:flex;
//         flex-direction: column;
//         gap: 10px;
//       }
//       .addonCard{
//         border-radius: 18px;
//         overflow:hidden;
//         background: #fff;
//         box-shadow: 0 14px 40px rgba(0,0,0,.12);
//         border: 1px solid rgba(0,0,0,.06);
//       }
//       .addonCard img{
//         width:100%;
//         height: 110px;
//         object-fit: cover;
//       }

//       /* accommodation banner + neat images at lower edge (no stroke) */
//       .accBanner{
//         position: relative;
//         border-radius: 22px;
//         overflow:hidden;
//         min-height: 220px;
//         box-shadow: 0 18px 55px rgba(0,0,0,.18);
//         border: 1px solid rgba(0,0,0,.06);
//       }
//       .accBg{ position:absolute; inset:0; background-size: cover; background-position:center; filter: saturate(1.05); }
//       .accTint{ position:absolute; inset:0; background: rgba(10, 45, 28, .64); }
//       .accContent{ position: relative; z-index: 2; padding: 18px 18px 80px 18px; color: rgba(255,255,255,.92); }
//       .accName{ font-family: "Montserrat Alternates","Playfair Display","Cinzel",Georgia,serif; font-size: 18px; font-weight: 900; margin: 0 0 8px 0; }
//       .accMeta{ display:flex; gap: 12px; flex-wrap: wrap; margin-top: 10px; font-weight: 850; letter-spacing: .06em; font-size: 12px; }
//       .accMeta span{ padding: 8px 10px; border-radius: 14px; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16); backdrop-filter: blur(10px); }

//       .accEdgeImgs{
//         position:absolute;
//         left:0; right:0;
//         bottom:0;
//         height: 80px;
//         display:flex;
//         gap: 0;
//         z-index: 3;
//       }
//       .accEdgeImgs img{
//         width: 33.333%;
//         height: 100%;
//         object-fit: cover;
//       }

//       .mealRow{ display:flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
//       .mealPill{ padding: 10px 12px; border-radius: 16px; background: rgba(0,0,0,.04); border: 1px solid rgba(0,0,0,.06); font-weight: 850; color: rgba(0,0,0,.74); }

//       .keepTogether{ break-inside: avoid; page-break-inside: avoid; -webkit-column-break-inside: avoid; }
//     `;

//     /* ===============================
//        COVER HTML (UPDATED)
//     ================================ */
//     const pax = Number(client.numberOfPersons || 0);
//     const totalCost = pax * Number(tour.pricePerPax || 0);
//     const disc = Number(discountAmount || 0);
//     const finalPayable = Math.max(0, totalCost - disc);

//     const clientDisplayName =
//       client?.name || client?.clientName || client?.fullName || "Customer";
//     const clientDisplayId =
//       client?.clientId ||
//       client?.clientCode ||
//       client?.clientNumber ||
//       String(client?._id || "");

//     const inclusions = Array.isArray(tour?.includes) ? tour.includes.filter(Boolean) : [];
//     const inclusionsLine =
//       inclusions.length > 0 ? inclusions.map((x) => esc(x)).join(" | ") : "-";

//     const perHead = Number(tour.pricePerPax || 0);

//     const coverHtml = `<!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8"/>
//       <style>${commonCss}</style>
//       <link rel="preconnect" href="https://fonts.googleapis.com">
//       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//       <link href="https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@600;700&family=Bangers&family=Black+Ops+One&family=Montserrat+Alternates:wght@700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
//     </head>
//     <body>
//       <div class="coverBg" style="${bgCss(coverBg, 2000)}"></div>

//       <!-- ✅ full-page cutout overlay image (2nd destination image) -->
//       ${coverOverlay ? imgTag(coverOverlay, 2000, "coverOverlayFull") : ""}

//       <!-- ✅ bigger top details (no glass bar) -->
//       <div class="coverTop" style="color:${esc(destTextColor)}">
//         <div class="coverTopLeft">
//           ${company?.logo ? imgTag(company.logo, 520, "coverLogo") : ""}
//         </div>
//         <div class="coverTopMid">GROUP TOUR</div>
//         <div class="coverTopRight">CLIENT ID: ${esc(clientDisplayId)}</div>
//       </div>

//       <div class="wrap">
//         <div class="coverHero">
//           <div class="heroStack" style="color:${esc(destTextColor)}">
//             <div class="welcome1">WELCOME</div>
//             <div class="welcome2">${esc(clientDisplayName)}</div>
//             <div class="welcome3">TO ${esc(tour.tourName || "TOUR")}</div>
//           </div>
//         </div>

//         <div class="coverBottom" style="color:${esc(destTextColor)}">
//           <div class="inclHead">INCLUSIONS</div>
//           <div class="inclList">${inclusionsLine}</div>

//           <div class="priceLine">
//             <span>PER HEAD:</span><span>${esc(perHead)}</span>
//             <span style="opacity:.7">•</span>
//             <span>TOTAL:</span><span>${esc(finalPayable)}</span>
//             ${disc > 0 ? `<span style="opacity:.8">(DISCOUNT ${esc(disc)})</span>` : ""}
//           </div>

//           <div class="alertBox">
//             ⚠️ This is a <b>Referral Itinerary</b> for reference only. It does not confirm travel.
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>`;

//     /* ===============================
//        DAY HTML (UPDATED)
//     ================================ */
//     const dayHtml = (day, dayIndex) => {
//       const segments = Array.isArray(day.segments) ? day.segments : [];
//       const decor = pickDayDecor(dayIndex);
//       const topImg = decor.top || fallbackCoverBg;
//       const bottomImg = decor.bottom || fallbackCoverBg;

//       const seenTripVehicle = new Set();
//       const seenAddonVehicle = new Set();
//       const seenAccommodation = new Set();
//       const seenActivity = new Set();

//       const pickMealFromFoods = (foods, type) =>
//         (foods || []).find((f) => String(f?.mealType || "").toLowerCase() === type)
//           ?.foodName || "-";

//       const buildTripCollage = (imgs) => {
//         const arr = (imgs || []).filter(Boolean);
//         const p1 = arr[0] || "";
//         const p2 = arr[1] || "";
//         const p3 = arr[2] || "";
//         const p4 = arr[3] || "";
//         const topCut = arr[7] || ""; // ✅ last image on top

//         return `
//           <div class="collage">
//             ${p1 ? `<div class="card a">${imgTag(p1, 900)}</div>` : ""}
//             ${p2 ? `<div class="card b">${imgTag(p2, 900)}</div>` : ""}
//             ${p3 ? `<div class="card c">${imgTag(p3, 900)}</div>` : ""}
//             ${p4 ? `<div class="card d">${imgTag(p4, 900)}</div>` : ""}
//             ${topCut ? `<img class="collageTopCutout" src="${cloudinaryOptimized(topCut, 1200)}" onerror="this.onerror=null;this.src='${topCut}'" />` : ""}
//           </div>
//         `;
//       };

//       const buildVehicleBlock = (heading, vehicleDoc) => {
//         const vImgs = getDocImgsUpTo8(vehicleDoc);
//         if (!vImgs.length) return "";

//         const main = vImgs[0];
//         const strips = vImgs.slice(1, 4);

//         return `
//           <div class="section keepTogether">
//             <div class="vehicleTitle">${esc(heading || "VEHICLE")}</div>
//             <div class="vehStage">
//               <div class="vehMain">${main ? imgTag(main, 1300) : ""}</div>
//               <div class="vehStrips">
//                 ${strips
//                   .map((u) => `<div class="vehStrip">${imgTag(u, 900)}</div>`)
//                   .join("")}
//               </div>
//             </div>
//           </div>
//         `;
//       };

//       const buildAddonCards = (imgs) => {
//         const arr = (imgs || []).filter(Boolean).slice(0, 3);
//         if (!arr.length) return "";
//         return `
//           <div class="addonCards">
//             ${arr
//               .map((u) => `<div class="addonCard">${imgTag(u, 1200)}</div>`)
//               .join("")}
//           </div>
//         `;
//       };

//       const segmentBlocks = segments
//         .map((seg) => {
//           const trip = seg.tripDoc || null;
//           const addon = seg.addonDoc || null;

//           const activities = Array.isArray(seg.activityDocs) ? seg.activityDocs : [];
//           const foods = Array.isArray(seg.boFoods) ? seg.boFoods : [];
//           const accs = Array.isArray(seg.boAccommodations) ? seg.boAccommodations : [];
//           const tripVehicles = Array.isArray(seg.boTripVehicles) ? seg.boTripVehicles : [];
//           const addonVehicles = Array.isArray(seg.boAddonVehicles) ? seg.boAddonVehicles : [];

//           const tripImgs = getDocImgsUpTo8(trip);
//           const tripBlock = trip
//             ? `
//               <div class="section keepTogether">
//                 <div class="secTitle">Trip</div>
//                 <div class="twoCol">
//                   <div>
//                     <div class="titleStrong">${esc(trip.tripName || "")}</div>
//                     <div class="desc">${esc(trip.description || "")}</div>
//                   </div>
//                   <div>${buildTripCollage(tripImgs)}</div>
//                 </div>
//               </div>
//             `
//             : "";

//           let firstTripVehicleShown = null;
//           const tripVehiclesHtml = tripVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";
//               if (seenTripVehicle.has(vKey)) return "";
//               seenTripVehicle.add(vKey);

//               if (!firstTripVehicleShown) {
//                 firstTripVehicleShown = String(v?.vehicleId || v?.vehicleName || "");
//               }

//               const vd = v?.vehicleDoc || null;
//               const heading = trip?.tripName
//                 ? `THE VEHICLE FOR "${trip.tripName}"`
//                 : "THE VEHICLE FOR TRIP";

//               return buildVehicleBlock(heading, vd);
//             })
//             .join("");

//           const addonImgs = getDocImgsUpTo8(addon);
//           // ✅ removed "Add-on Trip" heading as requested
//           const addonBlock = addon
//             ? `
//               <div class="section keepTogether">
//                 <div class="twoCol">
//                   <div>${buildAddonCards(addonImgs)}</div>
//                   <div>
//                     <div class="titleStrong">${esc(addon.addontripName || "")}</div>
//                     <div class="desc">${esc(addon.description || "")}</div>
//                   </div>
//                 </div>
//               </div>
//             `
//             : "";

//           const addonVehiclesHtml = addonVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";

//               if (
//                 firstTripVehicleShown &&
//                 String(v?.vehicleId || v?.vehicleName || "") === firstTripVehicleShown
//               ) {
//                 return "";
//               }

//               if (seenAddonVehicle.has(vKey)) return "";
//               seenAddonVehicle.add(vKey);

//               const vd = v?.vehicleDoc || null;
//               const heading = addon?.addontripName
//                 ? `THE VEHICLE FOR "${addon.addontripName}"`
//                 : "THE VEHICLE FOR ADD-ON";

//               return buildVehicleBlock(heading, vd);
//             })
//             .join("");

//           const activitiesHtml = activities
//             .map((a) => {
//               const aKey = String(a?._id || "");
//               if (!aKey) return "";
//               if (seenActivity.has(aKey)) return "";
//               seenActivity.add(aKey);

//               const aImgs = getDocImgsUpTo8(a);
//               return `
//                 <div class="section keepTogether">
//                   <div class="secTitle">Activity</div>
//                   <div class="twoCol">
//                     <div>
//                       <div class="titleStrong">${esc(a?.activityName || a?.name || "")}</div>
//                       <div class="desc">${esc(a?.description || "")}</div>
//                     </div>
//                     <div>${buildTripCollage(aImgs)}</div>
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           const accommodationsHtml = accs
//             .map((acc) => {
//               const accKey = String(acc?.accommodationId || acc?.propertyName || "");
//               if (!accKey) return "";
//               if (seenAccommodation.has(accKey)) return "";
//               seenAccommodation.add(accKey);

//               const accDoc = acc?.accommodationDoc || null;
//               const aImgs = getDocImgsUpTo8(accDoc);

//               const bg = aImgs[0] || "";
//               const edgeImgs = aImgs.slice(1, 4);

//               return `
//                 <div class="section keepTogether" style="padding:0; background:transparent; border:none; box-shadow:none;">
//                   <div class="accBanner">
//                     <div class="accBg" style="${bgCss(bg, 1800)}"></div>
//                     <div class="accTint"></div>
//                     <div class="accContent">
//                       <div class="secTitle" style="color: rgba(255,255,255,.85);">Accommodation</div>
//                       <div class="accName">${esc(acc?.propertyName || "-")}</div>
//                       <div style="opacity:.92; line-height:1.55; font-weight:700;">
//                         ${esc(accDoc?.address || "")}
//                       </div>
//                       <div class="accMeta">
//                         <span>Category: ${esc(acc?.hotelCategory || "-")}</span>
//                         <span>Room: ${esc(acc?.roomCategory || "-")}</span>
//                         ${acc?.vendorName ? `<span>Vendor: ${esc(acc.vendorName)}</span>` : ""}
//                       </div>
//                     </div>

//                     ${
//                       edgeImgs.length
//                         ? `<div class="accEdgeImgs">
//                             ${edgeImgs[0] ? imgTag(edgeImgs[0], 1100, "", 'width:33.333%;height:100%;object-fit:cover;') : ""}
//                             ${edgeImgs[1] ? imgTag(edgeImgs[1], 1100, "", 'width:33.333%;height:100%;object-fit:cover;') : ""}
//                             ${edgeImgs[2] ? imgTag(edgeImgs[2], 1100, "", 'width:33.333%;height:100%;object-fit:cover;') : ""}
//                           </div>`
//                         : ""
//                     }
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           const breakfast = pickMealFromFoods(foods, "breakfast");
//           const lunch = pickMealFromFoods(foods, "lunch");
//           const dinner = pickMealFromFoods(foods, "dinner");

//           const mealsHeading = trip?.tripName
//             ? `Meals Included in ${trip.tripName}`
//             : "Meals Included";

//           const mealsBlock = `
//             <div class="section keepTogether">
//               <div class="secTitle">${esc(mealsHeading)}</div>
//               <div class="mealRow">
//                 <div class="mealPill">Breakfast: ${esc(breakfast)}</div>
//                 <div class="mealPill">Lunch: ${esc(lunch)}</div>
//                 <div class="mealPill">Dinner: ${esc(dinner)}</div>
//               </div>
//             </div>
//           `;

//           return `
//             ${tripBlock}
//             ${tripVehiclesHtml}
//             ${addonBlock}
//             ${addonVehiclesHtml}
//             ${activitiesHtml}
//             ${accommodationsHtml}
//             ${mealsBlock}
//           `;
//         })
//         .join("");

//       return `<!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8"/>
//         <style>${commonCss}</style>
//         <link rel="preconnect" href="https://fonts.googleapis.com">
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//         <link href="https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@600;700&family=Bangers&family=Black+Ops+One&family=Montserrat+Alternates:wght@700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
//       </head>
//       <body>
//         <div class="paperBg"></div>
//         <div class="paperNoise"></div>

//         <div class="wcTop">
//           <div class="wcImg" style="${bgCss(topImg, 1600)}"></div>
//           <div class="wcWash"></div>
//         </div>
//         <div class="wcBottom">
//           <div class="wcImg" style="${bgCss(bottomImg, 1600)}"></div>
//           <div class="wcWash"></div>
//         </div>

//         <div class="wrap" style="padding-top:56px; padding-bottom:64px;">
//           <div class="dayHeader keepTogether">
//             <div>
//               <div class="dayLabel">${esc(day.dayLabel || "Day")}</div>
//               <div class="dayDate">${esc(fmtDate(day.date))}</div>
//             </div>
//             <div class="dayDest" style="color:${esc(destinationDoc?.textColor || "#000000")}">
//               ${esc(destName || "")}
//             </div>
//           </div>

//           ${
//             segmentBlocks ||
//             `<div class="section keepTogether" style="background: rgba(255,255,255,.70)">No itinerary segments found for this day.</div>`
//           }
//         </div>
//       </body>
//       </html>`;
//     };

//     /* ===============================
//        PDF RENDER + MERGE (keep speed+size)
//     ================================ */
//     const waitForImages = async (page) => {
//       await page.evaluate(async () => {
//         const imgs = Array.from(document.images || []);
//         await Promise.all(
//           imgs.map((img) =>
//             img.complete
//               ? Promise.resolve()
//               : new Promise((res) => {
//                   img.addEventListener("load", res, { once: true });
//                   img.addEventListener("error", res, { once: true });
//                 })
//           )
//         );
//       });
//     };

//     async function renderPdfFromHtml(page, html) {
//       await page.setViewport({ width: 1123, height: 1587 });
//       await page.setContent(html, { waitUntil: "domcontentloaded" });
//       await waitForImages(page);

//       return await page.pdf({
//         format: "A4",
//         printBackground: true,
//         preferCSSPageSize: true,
//         scale: 0.88,
//         margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
//       });
//     }

//     async function mergePdfs(buffers) {
//       const merged = await PDFDocument.create();
//       for (const b of buffers) {
//         const pdf = await PDFDocument.load(b);
//         const pages = await merged.copyPages(pdf, pdf.getPageIndices());
//         pages.forEach((p) => merged.addPage(p));
//       }
//       return Buffer.from(await merged.save());
//     }

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
//     });

//     const page = await browser.newPage();
//     await page.setCacheEnabled(true);

//     const pdfParts = [];

//     pdfParts.push(await renderPdfFromHtml(page, coverHtml));

//     let di = 0;
//     for (const day of tour.days || []) {
//       pdfParts.push(await renderPdfFromHtml(page, dayHtml(day, di)));
//       di += 1;
//     }

//     await page.close();
//     await browser.close();

//     const finalPdfBuffer = await mergePdfs(pdfParts);

//     /* ---------- UPDATE CLIENT (AFTER PDF) ---------- */
//     const ist = getIstNow();
//     const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

//     const reasonLabel =
//       disc > 0
//         ? `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
//         : `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent without any discount`;

//     client.statusUpdatedByExecutive.push({
//       status: "Detail Sent",
//       value: 3,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       date: todayDateStr,
//       time: todayTimeStr,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//       reasonLabel,
//     });

//     const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
//     if (!scheduledDateObj) {
//       return res
//         .status(400)
//         .json({ message: "Invalid date/time for scheduled follow-up" });
//     }

//     client.ScheduleDatesByExecutives.push({
//       status: "Detail Sent",
//       reasonLabel: "Group Tour Referral Itinerary Sent",
//       scheduledDate: scheduledDateObj,
//       scheduledTimeRaw: nextTimeRaw,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//     });

//     await client.save();

//     /* ---------- STREAM PDF ---------- */
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="Referral-Itinerary-${tour.tourName}.pdf"`,
//     });

//     return res.send(finalPdfBuffer);
//   } catch (err) {
//     console.error("Referral PDF error:", err);
//     return res.status(500).json({ message: "PDF generation failed" });
//   }
// }

// export async function downloadGroupTourReferralItinerary(req, res) {
//   try {
//     const executiveId = req.userId;
//     const {
//       clientId,
//       groupTourId,
//       nextDateRaw,
//       nextTimeRaw,
//       discountAmount = 0,
//     } = req.body || {};

//     /* ---------- VALIDATIONS (UNCHANGED) ---------- */
//     if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

//     if (
//       !mongoose.isValidObjectId(executiveId) ||
//       !mongoose.isValidObjectId(clientId) ||
//       !mongoose.isValidObjectId(groupTourId)
//     ) {
//       return res.status(400).json({ message: "Invalid IDs" });
//     }

//     if (!nextDateRaw || !nextTimeRaw) {
//       return res
//         .status(400)
//         .json({ message: "nextDateRaw and nextTimeRaw are required" });
//     }

//     /* ---------- FETCH CORE DATA ---------- */
//     const exec = await Executive.findById(executiveId).populate("company").lean();
//     if (!exec) return res.status(404).json({ message: "Executive not found" });

//     const client = await Client.findById(clientId);
//     if (!client) return res.status(404).json({ message: "Client not found" });

//     const tour = await GroupTour.findById(groupTourId).lean();
//     if (!tour) return res.status(404).json({ message: "Group tour not found" });

//     const company = await Company.findById(exec.company).lean();

//     /* ---------- POPULATE DAY SEGMENTS ---------- */
//     for (const day of tour.days || []) {
//       for (const seg of day.segments || []) {
//         seg.tripDoc = seg.trip ? await Trip.findById(seg.trip).lean() : null;

//         seg.addonDoc = seg.selectedAddon
//           ? await AddOnTrip.findById(seg.selectedAddon).lean()
//           : null;

//         seg.activityDocs = await Activity.find({
//           _id: { $in: seg.selectedActivities || [] },
//         }).lean();

//         for (const v of seg.boTripVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const v of seg.boAddonVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const a of seg.boAccommodations || []) {
//           a.accommodationDoc = a.accommodationId
//             ? await Accommodation.findById(a.accommodationId).lean()
//             : null;
//         }
//       }
//     }

//     /* ===============================
//        SMALL HELPERS (safe HTML + image optimization)
//        ✅ keep business logic untouched
//     ================================ */
//     const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

//     const esc = (s) => {
//       if (s === null || s === undefined) return "";
//       return String(s)
//         .replaceAll("&", "&amp;")
//         .replaceAll("<", "&lt;")
//         .replaceAll(">", "&gt;")
//         .replaceAll('"', "&quot;")
//         .replaceAll("'", "&#039;");
//     };

//     const safeImgRaw = (url) => (url && String(url).trim() ? String(url).trim() : "");

//     // Safe Cloudinary optimization (no logic change, only faster/smaller)
//     const cloudinaryOptimized = (url, w = 1600) => {
//       const u = safeImgRaw(url);
//       if (!u) return "";
//       if (!u.includes("/upload/")) return u; // non-cloudinary
//       if (
//         u.includes("/upload/f_auto") ||
//         u.includes("/upload/q_auto") ||
//         u.includes("f_auto") ||
//         u.includes("q_auto")
//       ) {
//         return u;
//       }
//       return u.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_limit/`);
//     };

//     const imgTag = (url, w, className = "", style = "") => {
//       const orig = safeImgRaw(url);
//       if (!orig) return "";
//       const opt = cloudinaryOptimized(orig, w);
//       return `<img${className ? ` class="${className}"` : ""}${
//         style ? ` style="${style}"` : ""
//       } src="${opt}" onerror="this.onerror=null;this.src='${orig}'" />`;
//     };

//     const bgStyle = (url, w) => {
//       const orig = safeImgRaw(url);
//       if (!orig) return "";
//       const opt = cloudinaryOptimized(orig, w);
//       return `background-image:url('${opt}'), url('${orig}');`;
//     };

//     const safeImg = safeImgRaw;

//     const getDocImgsUpTo8 = (doc) => {
//       if (!doc) return [];
//       const urls = [
//         doc.imageUrl,
//         doc.secondImageUrl,
//         doc.thirdImageUrl,
//         doc.fourthImageUrl,
//         doc.fifthImageUrl,
//         doc.sixthImageUrl,
//         doc.seventhImageUrl,
//         doc.eightImageUrl || doc.eighthImageUrl,
//       ];
//       return urls.map(safeImg).filter(Boolean);
//     };

//     const fallbackCoverBg =
//       "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

//     /* ===============================
//        PDF DESIGN: Destination fetch (PDF ONLY)
//     ================================ */
//     let destinationDoc = null;
//     try {
//       if (tour?.destination && mongoose.isValidObjectId(tour.destination)) {
//         destinationDoc = await Destination.findById(tour.destination).lean();
//       }
//     } catch (_) {
//       destinationDoc = null;
//     }

//     const destImgsAll = getDocImgsUpTo8(destinationDoc);
//     const destTextColor = safeImg(destinationDoc?.textColor) || "#ffffff";
//     const destName = destinationDoc?.name ? String(destinationDoc.name) : "";

//     // cover bg = destination 1st image
//     const coverBg = destImgsAll[0] || fallbackCoverBg;
//     // overlay = destination 2nd image (bg-less)
//     const coverOverlay = destImgsAll[1] || "";

//     // ✅ Day decor pool must NOT use destination 2nd image
//     const decorPool = (destImgsAll || [])
//       .filter(Boolean)
//       .filter((u) => u !== destImgsAll[1]);
//     if (!decorPool.length) decorPool.push(coverBg || fallbackCoverBg);

//     const pickDayDecor = (() => {
//       const used = new Set();
//       const pool = decorPool.slice();
//       let idx = 0;

//       const takeUnique = () => {
//         for (let t = 0; t < pool.length; t++) {
//           const u = pool[(idx + t) % pool.length];
//           if (!used.has(u)) {
//             used.add(u);
//             idx = (idx + t + 1) % pool.length;
//             return u;
//           }
//         }
//         const u = pool[idx % pool.length];
//         idx = (idx + 1) % pool.length;
//         return u;
//       };

//       return (dayIndex) => {
//         idx = (idx + (dayIndex * 2 + 1)) % pool.length;
//         const top = takeUnique();
//         const bottom = takeUnique();
//         return { top, bottom };
//       };
//     })();

//     /* ===============================
//        CSS (UPDATED DESIGN ONLY)
//     ================================ */
//     const commonCss = `
//       @page { size:A4; margin:0 }
//       html, body { margin:0; padding:0; font-family: Inter, Arial, sans-serif; }
//       * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

//       /* COVER */
//       .coverBg{
//         position: fixed; inset:0;
//         background-size: cover;
//         background-position: center;
//         background-repeat: no-repeat;
//         z-index:0;
//       }
//       /* ✅ no darken */
//       .coverBg::after{ content:""; position:absolute; inset:0; background:none; }

//       /* Full-page cutout overlay (2nd image) */
//       .coverOverlayFull{
//         position: fixed; inset:0;
//         width:100%; height:100%;
//         object-fit: cover;
//         z-index: 5; /* above welcome text */
//         pointer-events:none;
//       }

//       /* top details (bigger) */
//       .coverTop{
//         position: fixed;
//         top: 26px; left: 32px; right: 32px;
//         z-index: 8; /* ✅ above overlay so visible */
//         display:flex;
//         align-items:center;
//         justify-content: space-between;
//         gap: 14px;
//         pointer-events:none;
//       }
//       .coverLogo{
//         width: 86px;
//         height:auto;
//         object-fit:contain;
//         filter: drop-shadow(0 16px 36px rgba(0,0,0,.22));
//       }
//       .coverTopMid{
//         flex: 1;
//         text-align:center;
//         font-family: "Teko", "Anton", Inter, sans-serif;
//         font-size: 26px;
//         letter-spacing: .22em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//       }
//       .coverTopRight{
//         font-family: "Teko", "Anton", Inter, sans-serif;
//         font-size: 22px;
//         letter-spacing: .10em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//       }

//       .wrap{ position:relative; z-index: 4; padding: 44px; min-height:100vh; }

//       /* welcome text (sandwich: bg < text < overlay) */
//       .coverHero{
//         position: relative;
//         margin-top: 130px;
//         display:flex;
//         align-items:flex-start;
//         justify-content:center;
//         text-align:center;
//         padding: 0 22px;
//         z-index: 4; /* ✅ below overlay */
//       }
//       .heroStack{
//         position: relative;
//         max-width: 860px;
//         z-index: 4;
//       }

//       /* ✅ Use FIRST font for all welcome texts */
//       .welcome1{
//         font-family: "Bangers", "Black Ops One", "Anton", sans-serif;
//         font-size: 56px;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }
//       .welcome2{
//         font-family: "Bangers", "Black Ops One", "Anton", sans-serif;
//         font-size: clamp(56px, 7vw, 92px);
//         letter-spacing: .06em;
//         margin-top: 10px;
//         font-weight: 900;
//         line-height: .92;
//         max-width: 860px;
//         margin-left: auto;
//         margin-right: auto;
//         word-break: break-word;
//         overflow-wrap: anywhere;
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }
//       .welcome3{
//         font-family: "Bangers", "Black Ops One", "Anton", sans-serif;
//         font-size: clamp(42px, 4.8vw, 64px);
//         letter-spacing: .16em;
//         margin-top: 12px;
//         text-transform: uppercase;
//         font-weight: 900;
//         line-height: .96;
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }

//       /* bottom info (above overlay) */
//       .coverBottom{
//         position: fixed;
//         left: 0; right: 0; bottom: 30px;
//         display:flex;
//         flex-direction: column;
//         align-items:center;
//         justify-content:center;
//         gap: 10px;
//         padding: 0 44px;
//         z-index: 8; /* ✅ above overlay */
//       }
//       .inclHead{
//         font-family: "Teko","Anton",sans-serif;
//         font-weight: 900;
//         letter-spacing: .22em;
//         text-transform: uppercase;
//         font-size: 16px;
//         opacity: .98;
//       }
//       .inclList{
//         text-align:center;
//         font-weight: 850;
//         font-size: 12px;
//         letter-spacing: .06em;
//         opacity: .98;
//       }
//       .priceLine{
//         margin-top: 4px;
//         display:flex;
//         align-items:center;
//         justify-content:center;
//         gap: 12px;
//         padding: 10px 16px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.14);
//         border: 1px solid rgba(255,255,255,.22);
//         backdrop-filter: blur(14px);
//         box-shadow: 0 18px 55px rgba(0,0,0,.12);
//         font-family: "Teko","Anton",sans-serif;
//         letter-spacing: .10em;
//         font-size: 18px;
//         font-weight: 900;
//       }
//       .alertBox{
//         margin-top: 8px;
//         width: 92%;
//         max-width: 720px;
//         padding: 12px 14px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.18);
//         border: 1px solid rgba(255,255,255,.24);
//         backdrop-filter: blur(14px);
//         box-shadow: 0 18px 55px rgba(0,0,0,.12);
//         text-align:center;
//         font-weight: 850;
//         letter-spacing: .04em;
//         font-size: 12px;
//         opacity: .98;
//       }

//       /* DAY PAGES */
//       .paperBg{
//         position: fixed; inset:0; z-index:0;
//         background:
//           radial-gradient(1100px 800px at 20% 10%, rgba(0,0,0,.03), transparent 60%),
//           radial-gradient(900px 700px at 80% 30%, rgba(0,0,0,.02), transparent 60%),
//           linear-gradient(180deg, #fbfaf7 0%, #f7f4ee 100%);
//       }
//       .paperNoise{
//         position: fixed; inset:0; z-index:1; opacity: .18;
//         background-image:
//           radial-gradient(circle at 10% 20%, rgba(0,0,0,.03) 0 1px, transparent 1px),
//           radial-gradient(circle at 70% 60%, rgba(0,0,0,.02) 0 1px, transparent 1px),
//           radial-gradient(circle at 40% 85%, rgba(0,0,0,.02) 0 1px, transparent 1px);
//         background-size: 14px 14px, 18px 18px, 22px 22px;
//         mix-blend-mode: multiply;
//       }

//       /* ✅ Smooth low-opacity background blend (no cut) */
//       .bgBlendTop, .bgBlendBottom{
//         position: fixed;
//         left:0; right:0;
//         height: 55vh;
//         z-index: 2;
//         pointer-events:none;
//         opacity: .10;
//         background-size: cover;
//         background-position: center;
//         filter: saturate(1.05) contrast(1.02);
//       }
//       .bgBlendTop{
//         top: 0;
//         -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
//         mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
//       }
//       .bgBlendBottom{
//         bottom: 0;
//         -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0));
//         mask-image: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0));
//       }

//       /* ✅ Folded paper effect */
//       .foldFx{
//         position: fixed;
//         inset:0;
//         z-index: 3;
//         pointer-events:none;
//         opacity: .22;
//         background:
//           linear-gradient(135deg, rgba(0,0,0,.06), transparent 42%),
//           linear-gradient(315deg, rgba(0,0,0,.04), transparent 40%),
//           radial-gradient(800px 380px at 55% 52%, rgba(0,0,0,.05), transparent 65%);
//         mix-blend-mode: multiply;
//       }

//       /* day header */
//       .dayHeader{
//         display:flex;
//         align-items:flex-end;
//         justify-content: space-between;
//         gap: 14px;
//         padding-top: 8px;
//         padding-bottom: 14px;
//         border-bottom: 1px dashed rgba(0,0,0,.18);
//       }
//       .dayLabel{
//         font-family: "Caveat","Patrick Hand","Segoe Script",cursive;
//         font-size: 40px;
//         font-weight: 800;
//         color: rgba(0,0,0,.82);
//       }
//       .dayDate{
//         font-family: "Caveat","Patrick Hand","Segoe Script",cursive;
//         font-size: 22px;
//         font-weight: 700;
//         color: rgba(0,0,0,.62);
//       }
//       .dayDest{
//         font-weight: 950;
//         letter-spacing: .16em;
//         text-transform: uppercase;
//         font-size: 10px;
//       }

//       /* section */
//       .section{
//         margin-top: 16px;
//         padding: 16px 16px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.72);
//         border: 1px solid rgba(0,0,0,.06);
//         box-shadow: 0 14px 45px rgba(0,0,0,.06);
//       }
//       .secTitle{
//         font-weight: 950;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         font-size: 11px;
//         color: rgba(0,0,0,.70);
//         margin-bottom: 10px;
//       }
//       .twoCol{
//         display:grid;
//         grid-template-columns: 1.05fr .95fr;
//         gap: 14px;
//         align-items:start;
//       }
//       .titleStrong{
//         font-family: "Montserrat Alternates","Playfair Display","Cinzel",Georgia,serif;
//         font-size: 18px;
//         font-weight: 900;
//         color: rgba(0,0,0,.88);
//         margin: 0 0 8px 0;
//       }
//       .desc{
//         color: rgba(0,0,0,.68);
//         line-height: 1.65;
//         font-weight: 650;
//         font-size: 12.6px;
//       }

//       /* Trip collage */
//       .collage{
//         position: relative;
//         height: 270px;
//         border-radius: 20px;
//         overflow: visible;
//         background:
//           radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,.06), transparent 60%);
//       }
//       .card{
//         position:absolute;
//         width: 168px;
//         height: 126px;
//         border-radius: 18px;
//         overflow:hidden;
//         box-shadow: 0 18px 52px rgba(0,0,0,.18);
//         transform-origin: center;
//       }
//       .card img{ width:100%; height:100%; object-fit: cover; }
//       .card.a{ left: 6px; top: 10px; transform: rotate(-6deg); }
//       .card.b{ right: 10px; top: 12px; transform: rotate(6deg); }
//       .card.c{ left: 30px; bottom: 10px; transform: rotate(3deg); }
//       .card.d{ right: 34px; bottom: 6px; transform: rotate(-3deg); }

//       /* ✅ 8th image on TOP of the whole collage */
//       .collageTopCutout{
//         position:absolute;
//         left: 50%;
//         top: -10px;
//         transform: translateX(-50%);
//         width: 240px;
//         height:auto;
//         filter: drop-shadow(0 22px 55px rgba(0,0,0,.20));
//         pointer-events:none;
//         z-index: 6;
//       }

//       /* VEHICLE: more visible strips (overflow + taller) */
//       .vehicleTitle{
//         font-weight: 950;
//         letter-spacing: .10em;
//         text-transform: uppercase;
//         font-size: 11px;
//         color: rgba(0,0,0,.72);
//         margin-bottom: 10px;
//       }
//       .vehStage{
//         position: relative;
//         height: 250px;
//         border-radius: 18px;
//         overflow: visible;
//         background: rgba(0,0,0,.03);
//       }
//       .vehMain{
//         position:absolute;
//         left: 50%;
//         top: 12px;
//         transform: translateX(-50%);
//         width: 68%;
//         height: 135px;
//         border-radius: 18px;
//         overflow:hidden;
//         box-shadow: 0 16px 44px rgba(0,0,0,.16);
//       }
//       .vehMain img{ width:100%; height:100%; object-fit: cover; }
//       .vehStrips{
//         position:absolute;
//         left:0; right:0;
//         bottom: -18px;
//         height: 120px;
//         display:flex;
//         gap: 0;
//       }
//       .vehStrip{ flex: 1; overflow:hidden; }
//       .vehStrip img{ width:100%; height:100%; object-fit: cover; }

//       /* Addon layout (reference-like cards) */
//       .addonCards{ display:flex; flex-direction: column; gap: 10px; }
//       .addonCard{
//         border-radius: 18px;
//         overflow:hidden;
//         // background: #fff;
//         box-shadow: 0 14px 40px rgba(0,0,0,.12);
//         border: 1px solid rgba(0,0,0,.06);
//       }
//       .addonCard img{ width:100%; height: 110px; object-fit: cover; }

//       /* Accommodation banner + more visible edge images */
//       .accBanner{
//         position: relative;
//         border-radius: 22px;
//         overflow: visible;
//         min-height: 240px;
//         box-shadow: 0 18px 55px rgba(0,0,0,.18);
//         border: 1px solid rgba(0,0,0,.06);
//       }
//       .accBg{ position:absolute; inset:0; background-size: cover; background-position:center; filter: saturate(1.05); }
//       .accTint{ position:absolute; inset:0; background: rgba(10, 45, 28, .64); }
//       .accContent{
//         position: relative;
//         z-index: 2;
//         padding: 18px 18px 90px 18px; /* room for edge images */
//         color: rgba(255,255,255,.92);
//       }
//       .accName{
//         font-family: "Montserrat Alternates","Playfair Display","Cinzel",Georgia,serif;
//         font-size: 18px;
//         font-weight: 900;
//         margin: 0 0 8px 0;
//       }
//       .accMeta{
//         display:flex;
//         gap: 12px;
//         flex-wrap: wrap;
//         margin-top: 10px;
//         font-weight: 850;
//         letter-spacing: .06em;
//         font-size: 12px;
//       }
//       .accMeta span{
//         padding: 8px 10px;
//         border-radius: 14px;
//         background: rgba(255,255,255,.10);
//         border: 1px solid rgba(255,255,255,.16);
//         backdrop-filter: blur(10px);
//       }
//       .accEdgeImgs{
//         position:absolute;
//         left:0; right:0;
//         bottom: -18px;
//         height: 110px;
//         display:flex;
//         gap: 0;
//         z-index: 3;
//       }
//       .accEdgeImgs img{
//         width: 33.333%;
//         height: 100%;
//         object-fit: cover;
//       }

//       .mealRow{ display:flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
//       .mealPill{
//         padding: 10px 12px;
//         border-radius: 16px;
//         background: rgba(0,0,0,.04);
//         border: 1px solid rgba(0,0,0,.06);
//         font-weight: 850;
//         color: rgba(0,0,0,.74);
//       }

//       .keepTogether{ break-inside: avoid; page-break-inside: avoid; -webkit-column-break-inside: avoid; }
//     `;

//     /* ===============================
//        COVER HTML (UPDATED)
//     ================================ */
//     const pax = Number(client.numberOfPersons || 0);
//     const totalCost = pax * Number(tour.pricePerPax || 0);
//     const disc = Number(discountAmount || 0);
//     const finalPayable = Math.max(0, totalCost - disc);

//     const clientDisplayName =
//       client?.name || client?.clientName || client?.fullName || "Customer";
//     const clientDisplayId =
//       client?.clientId ||
//       client?.clientCode ||
//       client?.clientNumber ||
//       String(client?._id || "");

//     const inclusions = Array.isArray(tour?.includes) ? tour.includes.filter(Boolean) : [];
//     const inclusionsLine =
//       inclusions.length > 0 ? inclusions.map((x) => esc(x)).join(" | ") : "-";

//     const perHead = Number(tour.pricePerPax || 0);

//     const coverHtml = `<!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8"/>
//       <style>${commonCss}</style>
//       <link rel="preconnect" href="https://fonts.googleapis.com">
//       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//       <link href="https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@600;700&family=Bangers&family=Black+Ops+One&family=Montserrat+Alternates:wght@700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
//     </head>
//     <body>
//   <div class="coverBg" style="${bgStyle(coverBg, 2000)}"></div>

//   ${coverOverlay ? imgTag(coverOverlay, 2000, "coverOverlayFull") : ""}

//   <div class="coverTop" style="color:${esc(destTextColor)}">
//     <div>
//       ${company?.logo ? imgTag(company.logo, 520, "coverLogo") : ""}
//     </div>
//     <div class="coverTopMid">GROUP TOUR</div>
//     <div class="coverTopRight">CLIENT ID: ${esc(clientDisplayId)}</div>
//   </div>

//   <div class="wrap">
//     <div class="coverHero">
//       <div class="heroStack" style="color:${esc(destTextColor)}">
//         <div class="welcome1">WELCOME</div>
//         <div class="welcome2">${esc(clientDisplayName)}</div>
//         <div class="welcome3">TO ${esc(tour.tourName || "TOUR")}</div>
//       </div>
//     </div>
//   </div>

//   <!-- ✅ MOVE THIS OUTSIDE .wrap -->
//   <div class="coverBottom" style="color:${esc(destTextColor)}">
//     <div class="inclHead">INCLUSIONS</div>
//     <div class="inclList">${inclusionsLine}</div>

//     <div class="priceLine">
//       <span>PER HEAD:</span><span>${esc(perHead)}</span>
//       <span style="opacity:.7">•</span>
//       <span>TOTAL:</span><span>${esc(finalPayable)}</span>
//       ${disc > 0 ? `<span style="opacity:.8">(DISCOUNT ${esc(disc)})</span>` : ""}
//     </div>

//     <div class="alertBox">
//       ⚠️ This is a <b>Referral Itinerary</b> for reference only. It does not confirm travel.
//     </div>
//   </div>
// </body>

//     </html>`;

//     /* ===============================
//        DAY HTML
//     ================================ */
//     const dayHtml = (day, dayIndex) => {
//       const segments = Array.isArray(day.segments) ? day.segments : [];
//       const decor = pickDayDecor(dayIndex);
//       const topImg = decor.top || fallbackCoverBg;
//       const bottomImg = decor.bottom || fallbackCoverBg;

//       // DEDUPE SETS (per DAY) — keep your existing behavior
//       const seenTripVehicle = new Set();
//       const seenAddonVehicle = new Set();
//       const seenAccommodation = new Set();
//       const seenActivity = new Set();

//       const pickMealFromFoods = (foods, type) =>
//         (foods || []).find((f) => String(f?.mealType || "").toLowerCase() === type)
//           ?.foodName || "-";

//       const buildTripCollage = (imgs) => {
//         const arr = (imgs || []).filter(Boolean);
//         const p1 = arr[0] || "";
//         const p2 = arr[1] || "";
//         const p3 = arr[2] || "";
//         const p4 = arr[3] || "";
//         const topCut = arr[7] || arr[arr.length - 1] || ""; // ✅ 8th if exists else last

//         return `
//           <div class="collage">
//             ${p1 ? `<div class="card a">${imgTag(p1, 900)}</div>` : ""}
//             ${p2 ? `<div class="card b">${imgTag(p2, 900)}</div>` : ""}
//             ${p3 ? `<div class="card c">${imgTag(p3, 900)}</div>` : ""}
//             ${p4 ? `<div class="card d">${imgTag(p4, 900)}</div>` : ""}
//             ${
//               topCut
//                 ? `<img class="collageTopCutout" src="${cloudinaryOptimized(
//                     topCut,
//                     1200
//                   )}" onerror="this.onerror=null;this.src='${topCut}'" />`
//                 : ""
//             }
//           </div>
//         `;
//       };

//       const buildVehicleBlock = (heading, vehicleDoc) => {
//         const vImgs = getDocImgsUpTo8(vehicleDoc);
//         if (!vImgs.length) return "";

//         const main = vImgs[0];
//         const strips = vImgs.slice(1, 4);

//         return `
//           <div class="section keepTogether">
//             <div class="vehicleTitle">${esc(heading || "VEHICLE")}</div>
//             <div class="vehStage">
//               <div class="vehMain">${main ? imgTag(main, 1300) : ""}</div>
//               <div class="vehStrips">
//                 ${strips
//                   .map((u) => `<div class="vehStrip">${imgTag(u, 900)}</div>`)
//                   .join("")}
//               </div>
//             </div>
//           </div>
//         `;
//       };

//       const buildAddonCards = (imgs) => {
//         const arr = (imgs || []).filter(Boolean).slice(0, 3);
//         if (!arr.length) return "";
//         return `
//           <div class="addonCards">
//             ${arr.map((u) => `<div class="addonCard">${imgTag(u, 1200)}</div>`).join("")}
//           </div>
//         `;
//       };

//       const segmentBlocks = segments
//         .map((seg) => {
//           const trip = seg.tripDoc || null;
//           const addon = seg.addonDoc || null;

//           const activities = Array.isArray(seg.activityDocs) ? seg.activityDocs : [];
//           const foods = Array.isArray(seg.boFoods) ? seg.boFoods : [];
//           const accs = Array.isArray(seg.boAccommodations) ? seg.boAccommodations : [];
//           const tripVehicles = Array.isArray(seg.boTripVehicles) ? seg.boTripVehicles : [];
//           const addonVehicles = Array.isArray(seg.boAddonVehicles) ? seg.boAddonVehicles : [];

//           /* -------- TRIP section -------- */
//           const tripImgs = getDocImgsUpTo8(trip);
//           const tripBlock = trip
//             ? `
//               <div class="section keepTogether">
//                 <div class="secTitle">Trip</div>
//                 <div class="twoCol">
//                   <div>
//                     <div class="titleStrong">${esc(trip.tripName || "")}</div>
//                     <div class="desc">${esc(trip.description || "")}</div>
//                   </div>
//                   <div>${buildTripCollage(tripImgs)}</div>
//                 </div>
//               </div>
//             `
//             : "";

//           /* -------- TRIP VEHICLES (unique) -------- */
//           let firstTripVehicleShown = null;
//           const tripVehiclesHtml = tripVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";
//               if (seenTripVehicle.has(vKey)) return "";
//               seenTripVehicle.add(vKey);

//               if (!firstTripVehicleShown) {
//                 firstTripVehicleShown = String(v?.vehicleId || v?.vehicleName || "");
//               }

//               const vd = v?.vehicleDoc || null;
//               const heading = trip?.tripName
//                 ? `THE VEHICLE FOR "${trip.tripName}"`
//                 : "THE VEHICLE FOR TRIP";

//               return buildVehicleBlock(heading, vd);
//             })
//             .join("");

//           /* -------- ADDON section (no heading) -------- */
//           const addonImgs = getDocImgsUpTo8(addon);
//           const addonBlock = addon
//             ? `
//               <div class="section keepTogether">
//                 <div class="twoCol">
//                   <div>${buildAddonCards(addonImgs)}</div>
//                   <div>
//                     <div class="titleStrong">${esc(addon.addontripName || "")}</div>
//                     <div class="desc">${esc(addon.description || "")}</div>
//                   </div>
//                 </div>
//               </div>
//             `
//             : "";

//           /* -------- ADDON VEHICLE (unique + only if different from trip) -------- */
//           const addonVehiclesHtml = addonVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";

//               if (
//                 firstTripVehicleShown &&
//                 String(v?.vehicleId || v?.vehicleName || "") === firstTripVehicleShown
//               ) {
//                 return "";
//               }

//               if (seenAddonVehicle.has(vKey)) return "";
//               seenAddonVehicle.add(vKey);

//               const vd = v?.vehicleDoc || null;
//               const heading = addon?.addontripName
//                 ? `THE VEHICLE FOR "${addon.addontripName}"`
//                 : "THE VEHICLE FOR ADD-ON";

//               return buildVehicleBlock(heading, vd);
//             })
//             .join("");

//           /* -------- ACTIVITIES (ALL UNIQUE) -------- */
//           const activitiesHtml = activities
//             .map((a) => {
//               const aKey = String(a?._id || "");
//               if (!aKey) return "";
//               if (seenActivity.has(aKey)) return "";
//               seenActivity.add(aKey);

//               const aImgs = getDocImgsUpTo8(a);
//               return `
//                 <div class="section keepTogether">
//                   <div class="secTitle">Activity</div>
//                   <div class="twoCol">
//                     <div>
//                       <div class="titleStrong">${esc(a?.activityName || a?.name || "")}</div>
//                       <div class="desc">${esc(a?.description || "")}</div>
//                     </div>
//                     <div>${buildTripCollage(aImgs)}</div>
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           /* -------- ACCOMMODATION (ALL UNIQUE) -------- */
//           const accommodationsHtml = accs
//             .map((acc) => {
//               const accKey = String(acc?.accommodationId || acc?.propertyName || "");
//               if (!accKey) return "";
//               if (seenAccommodation.has(accKey)) return "";
//               seenAccommodation.add(accKey);

//               const accDoc = acc?.accommodationDoc || null;
//               const aImgs = getDocImgsUpTo8(accDoc);

//               const bg = aImgs[0] || "";
//               const edgeImgs = aImgs.slice(1, 4);

//               return `
//                 <div class="section keepTogether" style="padding:0; background:transparent; border:none; box-shadow:none;">
//                   <div class="accBanner">
//                     <div class="accBg" style="${bgStyle(bg, 1800)}"></div>
//                     <div class="accTint"></div>
//                     <div class="accContent">
//                       <div class="secTitle" style="color: rgba(255,255,255,.85);">Accommodation</div>
//                       <div class="accName">${esc(acc?.propertyName || "-")}</div>
//                       <div style="opacity:.92; line-height:1.55; font-weight:700;">
//                         ${esc(accDoc?.address || "")}
//                       </div>
//                       <div class="accMeta">
//                         <span>Category: ${esc(acc?.hotelCategory || "-")}</span>
//                         <span>Room: ${esc(acc?.roomCategory || "-")}</span>
//                         ${acc?.vendorName ? `<span>Vendor: ${esc(acc.vendorName)}</span>` : ""}
//                       </div>
//                     </div>

//                     ${
//                       edgeImgs.length
//                         ? `<div class="accEdgeImgs">
//                             ${edgeImgs[0] ? imgTag(edgeImgs[0], 1100) : ""}
//                             ${edgeImgs[1] ? imgTag(edgeImgs[1], 1100) : ""}
//                             ${edgeImgs[2] ? imgTag(edgeImgs[2], 1100) : ""}
//                           </div>`
//                         : ""
//                     }
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           /* -------- MEALS (kept) -------- */
//           const breakfast = pickMealFromFoods(foods, "breakfast");
//           const lunch = pickMealFromFoods(foods, "lunch");
//           const dinner = pickMealFromFoods(foods, "dinner");

//           const mealsHeading = trip?.tripName
//             ? `Meals Included in ${trip.tripName}`
//             : "Meals Included";

//           const mealsBlock = `
//             <div class="section keepTogether">
//               <div class="secTitle">${esc(mealsHeading)}</div>
//               <div class="mealRow">
//                 <div class="mealPill">Breakfast: ${esc(breakfast)}</div>
//                 <div class="mealPill">Lunch: ${esc(lunch)}</div>
//                 <div class="mealPill">Dinner: ${esc(dinner)}</div>
//               </div>
//             </div>
//           `;

//           return `
//             ${tripBlock}
//             ${tripVehiclesHtml}
//             ${addonBlock}
//             ${addonVehiclesHtml}
//             ${activitiesHtml}
//             ${accommodationsHtml}
//             ${mealsBlock}
//           `;
//         })
//         .join("");

//       return `<!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8"/>
//         <style>${commonCss}</style>
//         <link rel="preconnect" href="https://fonts.googleapis.com">
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//         <link href="https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@600;700&family=Bangers&family=Black+Ops+One&family=Montserrat+Alternates:wght@700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
//       </head>
//       <body>
//         <div class="paperBg"></div>
//         <div class="paperNoise"></div>

//         <div class="bgBlendTop" style="${bgStyle(topImg, 1600)}"></div>
//         <div class="bgBlendBottom" style="${bgStyle(bottomImg, 1600)}"></div>
//         <div class="foldFx"></div>

//         <div class="wrap" style="padding-top:56px; padding-bottom:64px;">
//           <div class="dayHeader keepTogether">
//             <div>
//               <div class="dayLabel">${esc(day.dayLabel || "Day")}</div>
//               <div class="dayDate">${esc(fmtDate(day.date))}</div>
//             </div>
//             <div class="dayDest" style="color:${esc(destinationDoc?.textColor || "#000000")}">
//               ${esc(destName || "")}
//             </div>
//           </div>

//           ${
//             segmentBlocks ||
//             `<div class="section keepTogether" style="background: rgba(255,255,255,.70)">No itinerary segments found for this day.</div>`
//           }
//         </div>
//       </body>
//       </html>`;
//     };

//     /* ===============================
//        PDF RENDER + MERGE (keep perf)
//     ================================ */
//     const waitForImages = async (page) => {
//       await page.evaluate(async () => {
//         const imgs = Array.from(document.images || []);
//         await Promise.all(
//           imgs.map((img) =>
//             img.complete
//               ? Promise.resolve()
//               : new Promise((res) => {
//                   img.addEventListener("load", res, { once: true });
//                   img.addEventListener("error", res, { once: true });
//                 })
//           )
//         );
//       });
//     };

//     async function renderPdfFromHtml(page, html) {
//       await page.setViewport({ width: 1123, height: 1587 }); // A4-ish
//       await page.setContent(html, { waitUntil: "domcontentloaded" });
//       await waitForImages(page);

//       return await page.pdf({
//         format: "A4",
//         printBackground: true,
//         preferCSSPageSize: true,
//         scale: 0.88,
//         margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
//       });
//     }

//     async function mergePdfs(buffers) {
//       const merged = await PDFDocument.create();
//       for (const b of buffers) {
//         const pdf = await PDFDocument.load(b);
//         const pages = await merged.copyPages(pdf, pdf.getPageIndices());
//         pages.forEach((p) => merged.addPage(p));
//       }
//       return Buffer.from(await merged.save());
//     }

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
//     });

//     const page = await browser.newPage();
//     await page.setCacheEnabled(true);

//     const pdfParts = [];

//     // cover
//     pdfParts.push(await renderPdfFromHtml(page, coverHtml));

//     // days
//     let di = 0;
//     for (const day of tour.days || []) {
//       pdfParts.push(await renderPdfFromHtml(page, dayHtml(day, di)));
//       di += 1;
//     }

//     await page.close();
//     await browser.close();

//     const finalPdfBuffer = await mergePdfs(pdfParts);

//     /* ---------- UPDATE CLIENT (AFTER PDF) ---------- */
//     const ist = getIstNow();
//     const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

//     const reasonLabel =
//       disc > 0
//         ? `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
//         : `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent without any discount`;

//     client.statusUpdatedByExecutive.push({
//       status: "Detail Sent",
//       value: 3,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       date: todayDateStr,
//       time: todayTimeStr,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//       reasonLabel,
//     });

//     const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
//     if (!scheduledDateObj) {
//       return res
//         .status(400)
//         .json({ message: "Invalid date/time for scheduled follow-up" });
//     }

//     client.ScheduleDatesByExecutives.push({
//       status: "Detail Sent",
//       reasonLabel: "Group Tour Referral Itinerary Sent",
//       scheduledDate: scheduledDateObj,
//       scheduledTimeRaw: nextTimeRaw,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//     });

//     await client.save();

//     /* ---------- STREAM PDF ---------- */
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="Referral-Itinerary-${tour.tourName}.pdf"`,
//     });

//     return res.send(finalPdfBuffer);
//   } catch (err) {
//     console.error("Referral PDF error:", err);
//     return res.status(500).json({ message: "PDF generation failed" });
//   }
// }



// export async function downloadGroupTourReferralItinerary(req, res) {
//   try {
//     const executiveId = req.userId;
//     const {
//       clientId,
//       groupTourId,
//       nextDateRaw,
//       nextTimeRaw,
//       discountAmount = 0,
//     } = req.body || {};

//     /* ---------- VALIDATIONS (UNCHANGED) ---------- */
//     if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

//     if (
//       !mongoose.isValidObjectId(executiveId) ||
//       !mongoose.isValidObjectId(clientId) ||
//       !mongoose.isValidObjectId(groupTourId)
//     ) {
//       return res.status(400).json({ message: "Invalid IDs" });
//     }

//     if (!nextDateRaw || !nextTimeRaw) {
//       return res
//         .status(400)
//         .json({ message: "nextDateRaw and nextTimeRaw are required" });
//     }

//     /* ---------- FETCH CORE DATA ---------- */
//     const exec = await Executive.findById(executiveId).populate("company").lean();
//     if (!exec) return res.status(404).json({ message: "Executive not found" });

//     const client = await Client.findById(clientId);
//     if (!client) return res.status(404).json({ message: "Client not found" });

//     const tour = await GroupTour.findById(groupTourId).lean();
//     if (!tour) return res.status(404).json({ message: "Group tour not found" });

//     const company = await Company.findById(exec.company).lean();

//     /* ---------- POPULATE DAY SEGMENTS ---------- */
//     for (const day of tour.days || []) {
//       for (const seg of day.segments || []) {
//         seg.tripDoc = seg.trip ? await Trip.findById(seg.trip).lean() : null;

//         seg.addonDoc = seg.selectedAddon
//           ? await AddOnTrip.findById(seg.selectedAddon).lean()
//           : null;

//         seg.activityDocs = await Activity.find({
//           _id: { $in: seg.selectedActivities || [] },
//         }).lean();

//         for (const v of seg.boTripVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const v of seg.boAddonVehicles || []) {
//           v.vehicleDoc = v.vehicleId
//             ? await Vehicle.findById(v.vehicleId).lean()
//             : null;
//         }

//         for (const a of seg.boAccommodations || []) {
//           a.accommodationDoc = a.accommodationId
//             ? await Accommodation.findById(a.accommodationId).lean()
//             : null;
//         }
//       }
//     }

//     /* ===============================
//        SMALL HELPERS (safe HTML + image optimization)
//        ✅ keep business logic untouched
//     ================================ */
//     const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

//     const esc = (s) => {
//       if (s === null || s === undefined) return "";
//       return String(s)
//         .replaceAll("&", "&amp;")
//         .replaceAll("<", "&lt;")
//         .replaceAll(">", "&gt;")
//         .replaceAll('"', "&quot;")
//         .replaceAll("'", "&#039;");
//     };

//     const safeImgRaw = (url) => (url && String(url).trim() ? String(url).trim() : "");

//     // Safe Cloudinary optimization (no logic change, only faster/smaller)
//     const cloudinaryOptimized = (url, w = 1600) => {
//       const u = safeImgRaw(url);
//       if (!u) return "";
//       if (!u.includes("/upload/")) return u; // non-cloudinary
//       if (
//         u.includes("/upload/f_auto") ||
//         u.includes("/upload/q_auto") ||
//         u.includes("f_auto") ||
//         u.includes("q_auto")
//       ) {
//         return u;
//       }
//       return u.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_limit/`);
//     };

//     const imgTag = (url, w, className = "", style = "") => {
//       const orig = safeImgRaw(url);
//       if (!orig) return "";
//       const opt = cloudinaryOptimized(orig, w);
//       return `<img${className ? ` class="${className}"` : ""}${
//         style ? ` style="${style}"` : ""
//       } src="${opt}" onerror="this.onerror=null;this.src='${orig}'" />`;
//     };

//     const bgStyle = (url, w) => {
//       const orig = safeImgRaw(url);
//       if (!orig) return "";
//       const opt = cloudinaryOptimized(orig, w);
//       return `background-image:url('${opt}'), url('${orig}');`;
//     };

//     const safeImg = safeImgRaw;

//     const getDocImgsUpTo8 = (doc) => {
//       if (!doc) return [];
//       const urls = [
//         doc.imageUrl,
//         doc.secondImageUrl,
//         doc.thirdImageUrl,
//         doc.fourthImageUrl,
//         doc.fifthImageUrl,
//         doc.sixthImageUrl,
//         doc.seventhImageUrl,
//         doc.eightImageUrl || doc.eighthImageUrl,
//       ];
//       return urls.map(safeImg).filter(Boolean);
//     };

//     const fallbackCoverBg =
//       "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

//     /* ===============================
//        PDF DESIGN: Destination fetch (PDF ONLY)
//     ================================ */
//     let destinationDoc = null;
//     try {
//       if (tour?.destination && mongoose.isValidObjectId(tour.destination)) {
//         destinationDoc = await Destination.findById(tour.destination).lean();
//       }
//     } catch (_) {
//       destinationDoc = null;
//     }

//     const destImgsAll = getDocImgsUpTo8(destinationDoc);
//     const destTextColor = safeImg(destinationDoc?.textColor) || "#ffffff";
//     const destName = destinationDoc?.name ? String(destinationDoc.name) : "";

//     // cover bg = destination 1st image
//     const coverBg = destImgsAll[0] || fallbackCoverBg;
//     // overlay = destination 2nd image (bg-less)
//     const coverOverlay = destImgsAll[1] || "";

//     // ✅ Day decor pool must NOT use destination 2nd image
//     const decorPool = (destImgsAll || [])
//       .filter(Boolean)
//       .filter((u) => u !== destImgsAll[1]);
//     if (!decorPool.length) decorPool.push(coverBg || fallbackCoverBg);

//     const pickDayDecor = (() => {
//       const used = new Set();
//       const pool = decorPool.slice();
//       let idx = 0;

//       const takeUnique = () => {
//         for (let t = 0; t < pool.length; t++) {
//           const u = pool[(idx + t) % pool.length];
//           if (!used.has(u)) {
//             used.add(u);
//             idx = (idx + t + 1) % pool.length;
//             return u;
//           }
//         }
//         const u = pool[idx % pool.length];
//         idx = (idx + 1) % pool.length;
//         return u;
//       };

//       return (dayIndex) => {
//         idx = (idx + (dayIndex * 2 + 1)) % pool.length;
//         const top = takeUnique();
//         const bottom = takeUnique();
//         return { top, bottom };
//       };
//     })();

//     /* ===============================
//        CSS (UPDATED DESIGN ONLY)
//        ✅ ONLY CHANGES: cover hero sizing/position + logo/tour label center
//        ✅ ONLY CHANGES: vehicle section new two-column layout
//        (all other css unchanged)
//     ================================ */
//     const commonCss = `
//       @page { size:A4; margin:0 }
//       html, body { margin:0; padding:0; font-family: Inter, Arial, sans-serif; }
//       * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

//       /* COVER */
//       .coverBg{
//         position: fixed; inset:0;
//         background-size: cover;
//         background-position: center;
//         background-repeat: no-repeat;
//         z-index:0;
//       }
//       /* ✅ no darken */
//       .coverBg::after{ content:""; position:absolute; inset:0; background:none; }

//       /* Full-page cutout overlay (2nd image) */
//       .coverOverlayFull{
//         position: fixed; inset:0;
//         width:100%; height:100%;
//         object-fit: cover;
//         z-index: 5; /* above welcome text */
//         pointer-events:none;
//       }

//       /* top details (bigger + centered tour category + bigger logo) */
//       .coverTop{
//         position: fixed;
//         top: 26px; left: 32px; right: 32px;
//         z-index: 8;
//         display:flex;
//         align-items:center;
//         justify-content: space-between;
//         gap: 14px;
//         pointer-events:none;
//       }
//       .coverLogo{
//         width: 120px; /* ✅ bigger logo */
//         height:auto;
//         object-fit:contain;
//         filter: drop-shadow(0 16px 36px rgba(0,0,0,.22));
//       }
//       .coverTopMid{
//         flex: 1;
//         text-align:center; /* ✅ centered */
//         font-family: "Teko", "Anton", Inter, sans-serif;
//         font-size: 30px;  /* ✅ bigger */
//         letter-spacing: .24em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//       }
//       .coverTopRight{
//         font-family: "Teko", "Anton", Inter, sans-serif;
//         font-size: 24px; /* ✅ bigger */
//         letter-spacing: .10em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//       }

//       .wrap{ position:relative; z-index: 4; padding: 44px; min-height:100vh; }

//       /* welcome text (bigger + lower + almost full width, no breaking) */
//       .coverHero{
//         position: relative;
//         margin-top: 170px; /* ✅ lower a bit */
//         display:flex;
//         align-items:flex-start;
//         justify-content:center;
//         text-align:center;
//         padding: 0 16px;
//         z-index: 4;
//       }
//       .heroStack{
//         position: relative;
//         width: 98%;        /* ✅ almost full width */
//         max-width: 980px;
//         z-index: 4;
//       }

//       .welcome1{
//         font-family: "Bangers", "Black Ops One", "Anton", sans-serif;
//         font-size: 64px; /* ✅ bigger */
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         font-weight: 900;
//         opacity: .98;
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }
//       .welcome2{
//         font-family: "Bangers", "Black Ops One", "Anton", sans-serif;
//         font-size: clamp(70px, 8vw, 112px); /* ✅ bigger */
//         letter-spacing: .06em;
//         margin-top: 10px;
//         font-weight: 900;
//         line-height: .92;
//         width: 100%;
//         white-space: nowrap;         /* ✅ no breaking */
//         overflow: hidden;
//         text-overflow: ellipsis;     /* ✅ handle large names */
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }
//       .welcome3{
//         font-family: "Bangers", "Black Ops One", "Anton", sans-serif;
//         font-size: clamp(52px, 6.2vw, 82px); /* ✅ bigger */
//         letter-spacing: .16em;
//         margin-top: 12px;
//         text-transform: uppercase;
//         font-weight: 900;
//         width: 100%;
//         white-space: nowrap;         /* ✅ no breaking */
//         overflow: hidden;
//         text-overflow: ellipsis;
//         text-shadow: 0 18px 45px rgba(0,0,0,.22);
//       }

//       /* ✅ Single clear glassy background for inclusions + rate + alert */
//       .coverBottom{
//         position: fixed;
//         left: 0; right: 0; bottom: 26px;
//         display:flex;
//         flex-direction: column;
//         align-items:center;
//         justify-content:center;
//         padding: 0 34px;
//         z-index: 8;
//       }
//       .coverGlass{
//         width: 96%;
//         max-width: 860px;
//         padding: 16px 16px;
//         border-radius: 22px;
//         background: rgba(255,255,255,.26); /* ✅ more visible */
//         border: 1px solid rgba(255,255,255,.36);
//         backdrop-filter: blur(16px);
//         box-shadow: 0 18px 55px rgba(0,0,0,.14);
//         text-align:center;
//       }
//       .inclHead{
//         font-family: "Teko","Anton",sans-serif;
//         font-weight: 900;
//         letter-spacing: .22em;
//         text-transform: uppercase;
//         font-size: 18px; /* ✅ bigger */
//         opacity: .98;
//       }
//       .inclList{
//         text-align:center;
//         font-weight: 850;
//         font-size: 13px; /* ✅ bigger */
//         letter-spacing: .06em;
//         opacity: .98;
//         margin-top: 6px;
//       }
//       .priceLine{
//         margin-top: 12px;
//         display:flex;
//         align-items:center;
//         justify-content:center;
//         gap: 14px;
//         padding: 12px 16px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.16);
//         border: 1px solid rgba(255,255,255,.28);
//         backdrop-filter: blur(14px);
//         font-family: "Teko","Anton",sans-serif;
//         letter-spacing: .10em;
//         font-size: 22px; /* ✅ bigger */
//         font-weight: 900;
//       }
//       .alertBox{
//         margin-top: 12px;
//         padding: 12px 14px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.16);
//         border: 1px solid rgba(255,255,255,.28);
//         backdrop-filter: blur(14px);
//         text-align:center;
//         font-weight: 850;
//         letter-spacing: .04em;
//         font-size: 12.5px;
//         opacity: .98;
//       }

//       /* DAY PAGES (UNCHANGED) */
//       .paperBg{
//         position: fixed; inset:0; z-index:0;
//         background:
//           radial-gradient(1100px 800px at 20% 10%, rgba(0,0,0,.03), transparent 60%),
//           radial-gradient(900px 700px at 80% 30%, rgba(0,0,0,.02), transparent 60%),
//           linear-gradient(180deg, #fbfaf7 0%, #f7f4ee 100%);
//       }
//       .paperNoise{
//         position: fixed; inset:0; z-index:1; opacity: .18;
//         background-image:
//           radial-gradient(circle at 10% 20%, rgba(0,0,0,.03) 0 1px, transparent 1px),
//           radial-gradient(circle at 70% 60%, rgba(0,0,0,.02) 0 1px, transparent 1px),
//           radial-gradient(circle at 40% 85%, rgba(0,0,0,.02) 0 1px, transparent 1px);
//         background-size: 14px 14px, 18px 18px, 22px 22px;
//         mix-blend-mode: multiply;
//       }

//       .bgBlendTop, .bgBlendBottom{
//         position: fixed;
//         left:0; right:0;
//         height: 55vh;
//         z-index: 2;
//         pointer-events:none;
//         opacity: .10;
//         background-size: cover;
//         background-position: center;
//         filter: saturate(1.05) contrast(1.02);
//       }
//       .bgBlendTop{
//         top: 0;
//         -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
//         mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
//       }
//       .bgBlendBottom{
//         bottom: 0;
//         -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0));
//         mask-image: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0));
//       }

//       .foldFx{
//         position: fixed;
//         inset:0;
//         z-index: 3;
//         pointer-events:none;
//         opacity: .22;
//         background:
//           linear-gradient(135deg, rgba(0,0,0,.06), transparent 42%),
//           linear-gradient(315deg, rgba(0,0,0,.04), transparent 40%),
//           radial-gradient(800px 380px at 55% 52%, rgba(0,0,0,.05), transparent 65%);
//         mix-blend-mode: multiply;
//       }

//       .dayHeader{
//         display:flex;
//         align-items:flex-end;
//         justify-content: space-between;
//         gap: 14px;
//         padding-top: 8px;
//         padding-bottom: 14px;
//         border-bottom: 1px dashed rgba(0,0,0,.18);
//       }
//       .dayLabel{
//         font-family: "Caveat","Patrick Hand","Segoe Script",cursive;
//         font-size: 40px;
//         font-weight: 800;
//         color: rgba(0,0,0,.82);
//       }
//       .dayDate{
//         font-family: "Caveat","Patrick Hand","Segoe Script",cursive;
//         font-size: 22px;
//         font-weight: 700;
//         color: rgba(0,0,0,.62);
//       }
//       .dayDest{
//         font-weight: 950;
//         letter-spacing: .16em;
//         text-transform: uppercase;
//         font-size: 10px;
//       }

//       .section{
//         margin-top: 16px;
//         padding: 16px 16px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.72);
//         border: 1px solid rgba(0,0,0,.06);
//         box-shadow: 0 14px 45px rgba(0,0,0,.06);
//       }
//       .secTitle{
//         font-weight: 950;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         font-size: 11px;
//         color: rgba(0,0,0,.70);
//         margin-bottom: 10px;
//       }
//       .twoCol{
//         display:grid;
//         grid-template-columns: 1.05fr .95fr;
//         gap: 14px;
//         align-items:start;
//       }
//       .titleStrong{
//         font-family: "Montserrat Alternates","Playfair Display","Cinzel",Georgia,serif;
//         font-size: 18px;
//         font-weight: 900;
//         color: rgba(0,0,0,.88);
//         margin: 0 0 8px 0;
//       }
//       .desc{
//         color: rgba(0,0,0,.68);
//         line-height: 1.65;
//         font-weight: 650;
//         font-size: 12.6px;
//       }

//       .collage{
//         position: relative;
//         height: 270px;
//         border-radius: 20px;
//         overflow: visible;
//         background:
//           radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,.06), transparent 60%);
//       }
//       .card{
//         position:absolute;
//         width: 168px;
//         height: 126px;
//         border-radius: 18px;
//         overflow:hidden;
//         box-shadow: 0 18px 52px rgba(0,0,0,.18);
//         transform-origin: center;
//       }
//       .card img{ width:100%; height:100%; object-fit: cover; }
//       .card.a{ left: 6px; top: 10px; transform: rotate(-6deg); }
//       .card.b{ right: 10px; top: 12px; transform: rotate(6deg); }
//       .card.c{ left: 30px; bottom: 10px; transform: rotate(3deg); }
//       .card.d{ right: 34px; bottom: 6px; transform: rotate(-3deg); }

//       .collageTopCutout{
//         position:absolute;
//         left: 50%;
//         top: -10px;
//         transform: translateX(-50%);
//         width: 240px;
//         height:auto;
//         filter: drop-shadow(0 22px 55px rgba(0,0,0,.20));
//         pointer-events:none;
//         z-index: 6;
//       }

//       /* ✅ VEHICLE SECTION UPDATE (two-column + collage 2/3/4 + 1st cutout on top) */
//       .vehTwoCol{
//         display:grid;
//         grid-template-columns: 1.05fr .95fr;
//         gap: 14px;
//         align-items: center;
//       }
//       .vehLeftStage{
//         position: relative;
//         height: 270px;
//         border-radius: 20px;
//         overflow: visible;
//         background: radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,.05), transparent 62%);
//       }
//       .vehGrid234{
//         position:absolute;
//         left: 0; right: 0;
//         top: 44px;
//         display:grid;
//         grid-template-columns: repeat(3, 1fr);
//         gap: 10px;
//         padding: 0 8px;
//       }
//       .vehGrid234 img{
//         width:100%;
//         height: 190px; /* ✅ more visible */
//         object-fit: cover;
//         border-radius: 18px;
//         box-shadow: 0 14px 40px rgba(0,0,0,.16);
//       }
//       .vehCutout1{
//         position:absolute;
//         left: 50%;
//         top: 4px;
//         transform: translateX(-50%);
//         width: 396px;
//         max-width: 95%;
//         height:auto;
//         z-index: 6;
//         pointer-events:none;
//         filter: drop-shadow(0 22px 55px rgba(0,0,0,.18));
//       }
//       .vehInfoBox{
//         padding: 14px 14px;
//         border-radius: 18px;
//         background: rgba(255,255,255,.72);
//         border: 1px solid rgba(0,0,0,.06);
//         box-shadow: 0 14px 40px rgba(0,0,0,.06);
//       }
//       .vehK{
//         font-weight: 950;
//         letter-spacing: .14em;
//         text-transform: uppercase;
//         font-size: 10px;
//         color: rgba(0,0,0,.60);
//         margin-bottom: 6px;
//       }
//       .vehV{
//         font-family: "Montserrat Alternates","Anton",sans-serif;
//         font-weight: 900;
//         font-size: 18px;
//         color: rgba(0,0,0,.86);
//         line-height: 1.12;
//         word-break: break-word;
//         overflow-wrap: anywhere;
//       }
//       .vehV.small{
//         margin-top: 10px;
//         font-size: 15px;
//         opacity: .88;
//       }

//       /* old vehicle css remains (not used now) */
//       .vehicleTitle{
//         font-weight: 950;
//         letter-spacing: .10em;
//         text-transform: uppercase;
//         font-size: 11px;
//         color: rgba(0,0,0,.72);
//         margin-bottom: 10px;
//       }
//       .vehStage{
//         position: relative;
//         height: 250px;
//         border-radius: 18px;
//         overflow: visible;
//         background: rgba(0,0,0,.03);
//       }
//       .vehMain{
//         position:absolute;
//         left: 50%;
//         top: 12px;
//         transform: translateX(-50%);
//         width: 68%;
//         height: 135px;
//         border-radius: 18px;
//         overflow:hidden;
//         box-shadow: 0 16px 44px rgba(0,0,0,.16);
//       }
//       .vehMain img{ width:100%; height:100%; object-fit: cover; }
//       .vehStrips{
//         position:absolute;
//         left:0; right:0;
//         bottom: -18px;
//         height: 120px;
//         display:flex;
//         gap: 0;
//       }
//       .vehStrip{ flex: 1; overflow:hidden; }
//       .vehStrip img{ width:100%; height:100%; object-fit: cover; }

//       .addonCards{ display:flex; flex-direction: column; gap: 10px; }
//       .addonCard{
//         border-radius: 18px;
//         overflow:hidden;
//         box-shadow: 0 14px 40px rgba(0,0,0,.12);
//         border: 1px solid rgba(0,0,0,.06);
//       }
//       .addonCard img{ width:100%; height: 110px; object-fit: cover; }

//       .accBanner{
//         position: relative;
//         border-radius: 22px;
//         overflow: visible;
//         min-height: 240px;
//         box-shadow: 0 18px 55px rgba(0,0,0,.18);
//         border: 1px solid rgba(0,0,0,.06);
//       }
//       .accBg{ position:absolute; inset:0; background-size: cover; background-position:center; filter: saturate(1.05); }
//       .accTint{ position:absolute; inset:0; background: rgba(10, 45, 28, .64); }
//       .accContent{
//         position: relative;
//         z-index: 2;
//         padding: 18px 18px 90px 18px;
//         color: rgba(255,255,255,.92);
//       }
//       .accName{
//         font-family: "Montserrat Alternates","Playfair Display","Cinzel",Georgia,serif;
//         font-size: 18px;
//         font-weight: 900;
//         margin: 0 0 8px 0;
//       }
//       .accMeta{
//         display:flex;
//         gap: 12px;
//         flex-wrap: wrap;
//         margin-top: 10px;
//         font-weight: 850;
//         letter-spacing: .06em;
//         font-size: 12px;
//       }
//       .accMeta span{
//         padding: 8px 10px;
//         border-radius: 14px;
//         background: rgba(255,255,255,.10);
//         border: 1px solid rgba(255,255,255,.16);
//         backdrop-filter: blur(10px);
//       }
//       .accEdgeImgs{
//         position:absolute;
//         left:0; right:0;
//         bottom: -18px;
//         height: 110px;
//         display:flex;
//         gap: 0;
//         z-index: 3;
//       }
//       .accEdgeImgs img{
//         width: 33.333%;
//         height: 100%;
//         object-fit: cover;
//       }

//       .mealRow{ display:flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
//       .mealPill{
//         padding: 10px 12px;
//         border-radius: 16px;
//         background: rgba(0,0,0,.04);
//         border: 1px solid rgba(0,0,0,.06);
//         font-weight: 850;
//         color: rgba(0,0,0,.74);
//       }

//       .keepTogether{ break-inside: avoid; page-break-inside: avoid; -webkit-column-break-inside: avoid; }
//     `;

//     /* ===============================
//        COVER HTML (UPDATED)
//        ✅ Only changed bottom to single glass panel
//     ================================ */
//     const pax = Number(client.numberOfPersons || 0);
//     const totalCost = pax * Number(tour.pricePerPax || 0);
//     const disc = Number(discountAmount || 0);
//     const finalPayable = Math.max(0, totalCost - disc);

//     const clientDisplayName =
//       client?.name || client?.clientName || client?.fullName || "Customer";
//     const clientDisplayId =
//       client?.clientId ||
//       client?.clientCode ||
//       client?.clientNumber ||
//       String(client?._id || "");

//     const inclusions = Array.isArray(tour?.includes) ? tour.includes.filter(Boolean) : [];
//     const inclusionsLine =
//       inclusions.length > 0 ? inclusions.map((x) => esc(x)).join(" | ") : "-";

//     const perHead = Number(tour.pricePerPax || 0);

//     const coverHtml = `<!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8"/>
//       <style>${commonCss}</style>
//       <link rel="preconnect" href="https://fonts.googleapis.com">
//       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//       <link href="https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@600;700&family=Bangers&family=Black+Ops+One&family=Montserrat+Alternates:wght@700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
//     </head>
//     <body>
//    <div class="coverBg" style="${bgStyle(coverBg, 2000)}"></div>
     

//   ${coverOverlay ? imgTag(coverOverlay, 2000, "coverOverlayFull") : ""}

//   <div class="coverTop" style="color:${esc(destTextColor)}">
//     <div>
//       ${company?.logo ? imgTag(company.logo, 520, "coverLogo") : ""}
//     </div>
//     <div class="coverTopMid">GROUP TOUR</div>
//     <div class="coverTopRight">CLIENT ID: ${esc(clientDisplayId)}</div>
//   </div>

//   <div class="wrap">
//     <div class="coverHero">
//       <div class="heroStack" style="color:${esc(destTextColor)}">
//         <div class="welcome1">WELCOME</div>
//         <div class="welcome2" title="${esc(clientDisplayName)}">${esc(
//       clientDisplayName
//     )}</div>
//         <div class="welcome3" title="${esc(tour.tourName || "TOUR")}">TO ${esc(
//       tour.tourName || "TOUR"
//     )}</div>
//       </div>
//     </div>
//   </div>

//   <div class="coverBottom" style="color:${esc(destTextColor)}">
//     <div class="coverGlass">
//       <div class="inclHead">INCLUSIONS</div>
//       <div class="inclList">${inclusionsLine}</div>

//       <div class="priceLine">
//         <span>PER HEAD:</span><span>${esc(perHead)}</span>
//         <span style="opacity:.7">•</span>
//         <span>TOTAL:</span><span>${esc(finalPayable)}</span>
//         ${disc > 0 ? `<span style="opacity:.8">(DISCOUNT ${esc(disc)})</span>` : ""}
//       </div>

//       <div class="alertBox">
//         ⚠️ This is a <b>Referral Itinerary</b> for reference only. It does not confirm travel.
//       </div>
//     </div>
//   </div>
// </body>

//     </html>`;
//     /* ===============================
//        DAY HTML
//        ✅ ONLY CHANGE in this section:
//        - vehicle block is replaced with the new two-column layout you requested
//        - it now shows: left = images 2/3/4 collage + image1 cutout on top
//        - right = vehicle name + vehicle category (handles whitespace)
//        Everything else is unchanged.
//     ================================ */
//     const dayHtml = (day, dayIndex) => {
//       const segments = Array.isArray(day.segments) ? day.segments : [];
//       const decor = pickDayDecor(dayIndex);
//       const topImg = decor.top || fallbackCoverBg;
//       const bottomImg = decor.bottom || fallbackCoverBg;

//       // DEDUPE SETS (per DAY) — keep your existing behavior
//       const seenTripVehicle = new Set();
//       const seenAddonVehicle = new Set();
//       const seenAccommodation = new Set();
//       const seenActivity = new Set();

//       const pickMealFromFoods = (foods, type) =>
//         (foods || []).find((f) => String(f?.mealType || "").toLowerCase() === type)
//           ?.foodName || "-";

//       const buildTripCollage = (imgs) => {
//         const arr = (imgs || []).filter(Boolean);
//         const p1 = arr[0] || "";
//         const p2 = arr[1] || "";
//         const p3 = arr[2] || "";
//         const p4 = arr[3] || "";
//         const topCut = arr[7] || arr[arr.length - 1] || ""; // ✅ 8th if exists else last

//         return `
//           <div class="collage">
//             ${p1 ? `<div class="card a">${imgTag(p1, 900)}</div>` : ""}
//             ${p2 ? `<div class="card b">${imgTag(p2, 900)}</div>` : ""}
//             ${p3 ? `<div class="card c">${imgTag(p3, 900)}</div>` : ""}
//             ${p4 ? `<div class="card d">${imgTag(p4, 900)}</div>` : ""}
//             ${
//               topCut
//                 ? `<img class="collageTopCutout" src="${cloudinaryOptimized(
//                     topCut,
//                     1200
//                   )}" onerror="this.onerror=null;this.src='${topCut}'" />`
//                 : ""
//             }
//           </div>
//         `;
//       };

//       /* ✅ UPDATED VEHICLE BLOCK (ONLY THIS CHANGED) */
//       const buildVehicleBlock = (heading, vehicleDoc) => {
//         const vImgs = getDocImgsUpTo8(vehicleDoc);
//         if (!vImgs.length) return "";

//         const img1 = vImgs[0] || ""; // bg-less cutout (top)
//         const img2 = vImgs[1] || "";
//         const img3 = vImgs[2] || "";
//         const img4 = vImgs[3] || "";

//         // Vehicle name + category (handle whitespace)
//         const vehicleName =
//           vehicleDoc?.vehicle || vehicleDoc?.vehicleName || vehicleDoc?.name || "-";
//         const vehicleCategory = vehicleDoc?.category || "-";

//         return `
//           <div class="section keepTogether">
//             <div class="vehicleTitle">${esc(heading || "VEHICLE")}</div>

//             <div class="vehTwoCol">
//               <!-- LEFT: images 2/3/4 collage + image1 cutout on top -->
//               <div class="vehLeftStage">
//                 <div class="vehGrid234">
//                   ${img2 ? imgTag(img2, 1000) : `<div></div>`}
//                   ${img3 ? imgTag(img3, 1000) : `<div></div>`}
//                   ${img4 ? imgTag(img4, 1000) : `<div></div>`}
//                 </div>

//                 ${
//                   img1
//                     ? `<img class="vehCutout1"
//                         src="${cloudinaryOptimized(img1, 1400)}"
//                         onerror="this.onerror=null;this.src='${img1}'" />`
//                     : ""
//                 }
//               </div>

//               <!-- RIGHT: vehicle name + category -->
//               <div class="vehInfoBox">
//                 <div class="vehK">VEHICLE NAME</div>
//                 <div class="vehV" title="${esc(vehicleName)}">${esc(vehicleName)}</div>

//                 <div class="vehK" style="margin-top:12px;">CATEGORY</div>
//                 <div class="vehV small" title="${esc(vehicleCategory)}">${esc(
//           vehicleCategory
//         )}</div>
//               </div>
//             </div>
//           </div>
//         `;
//       };

//       const buildAddonCards = (imgs) => {
//         const arr = (imgs || []).filter(Boolean).slice(0, 3);
//         if (!arr.length) return "";
//         return `
//           <div class="addonCards">
//             ${arr.map((u) => `<div class="addonCard">${imgTag(u, 1200)}</div>`).join("")}
//           </div>
//         `;
//       };

//       const segmentBlocks = segments
//         .map((seg) => {
//           const trip = seg.tripDoc || null;
//           const addon = seg.addonDoc || null;

//           const activities = Array.isArray(seg.activityDocs) ? seg.activityDocs : [];
//           const foods = Array.isArray(seg.boFoods) ? seg.boFoods : [];
//           const accs = Array.isArray(seg.boAccommodations) ? seg.boAccommodations : [];
//           const tripVehicles = Array.isArray(seg.boTripVehicles) ? seg.boTripVehicles : [];
//           const addonVehicles = Array.isArray(seg.boAddonVehicles) ? seg.boAddonVehicles : [];

//           /* -------- TRIP section -------- */
//           const tripImgs = getDocImgsUpTo8(trip);
//           const tripBlock = trip
//             ? `
//               <div class="section keepTogether">
//                 <div class="secTitle">Trip</div>
//                 <div class="twoCol">
//                   <div>
//                     <div class="titleStrong">${esc(trip.tripName || "")}</div>
//                     <div class="desc">${esc(trip.description || "")}</div>
//                   </div>
//                   <div>${buildTripCollage(tripImgs)}</div>
//                 </div>
//               </div>
//             `
//             : "";

//           /* -------- TRIP VEHICLES (unique) -------- */
//           let firstTripVehicleShown = null;
//           const tripVehiclesHtml = tripVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";
//               if (seenTripVehicle.has(vKey)) return "";
//               seenTripVehicle.add(vKey);

//               if (!firstTripVehicleShown) {
//                 firstTripVehicleShown = String(v?.vehicleId || v?.vehicleName || "");
//               }

//               const vd = v?.vehicleDoc || null;
//               const heading = trip?.tripName
//                 ? `THE VEHICLE FOR "${trip.tripName}"`
//                 : "THE VEHICLE FOR TRIP";

//               return buildVehicleBlock(heading, vd);
//             })
//             .join("");

//           /* -------- ADDON section (no heading) -------- */
//           const addonImgs = getDocImgsUpTo8(addon);
//           const addonBlock = addon
//             ? `
//               <div class="section keepTogether">
//                 <div class="twoCol">
//                   <div>${buildAddonCards(addonImgs)}</div>
//                   <div>
//                     <div class="titleStrong">${esc(addon.addontripName || "")}</div>
//                     <div class="desc">${esc(addon.description || "")}</div>
//                   </div>
//                 </div>
//               </div>
//             `
//             : "";

//           /* -------- ADDON VEHICLE (unique + only if different from trip) -------- */
//           const addonVehiclesHtml = addonVehicles
//             .map((v) => {
//               const vKey = String(v?.vehicleId || v?.vehicleName || "");
//               if (!vKey) return "";

//               if (
//                 firstTripVehicleShown &&
//                 String(v?.vehicleId || v?.vehicleName || "") === firstTripVehicleShown
//               ) {
//                 return "";
//               }

//               if (seenAddonVehicle.has(vKey)) return "";
//               seenAddonVehicle.add(vKey);

//               const vd = v?.vehicleDoc || null;
//               const heading = addon?.addontripName
//                 ? `THE VEHICLE FOR "${addon.addontripName}"`
//                 : "THE VEHICLE FOR ADD-ON";

//               return buildVehicleBlock(heading, vd);
//             })
//             .join("");

//           /* -------- ACTIVITIES (ALL UNIQUE) -------- */
//           const activitiesHtml = activities
//             .map((a) => {
//               const aKey = String(a?._id || "");
//               if (!aKey) return "";
//               if (seenActivity.has(aKey)) return "";
//               seenActivity.add(aKey);

//               const aImgs = getDocImgsUpTo8(a);
//               return `
//                 <div class="section keepTogether">
//                   <div class="secTitle">Activity</div>
//                   <div class="twoCol">
//                     <div>
//                       <div class="titleStrong">${esc(a?.activityName || a?.name || "")}</div>
//                       <div class="desc">${esc(a?.description || "")}</div>
//                     </div>
//                     <div>${buildTripCollage(aImgs)}</div>
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           /* -------- ACCOMMODATION (ALL UNIQUE) -------- */
//           const accommodationsHtml = accs
//             .map((acc) => {
//               const accKey = String(acc?.accommodationId || acc?.propertyName || "");
//               if (!accKey) return "";
//               if (seenAccommodation.has(accKey)) return "";
//               seenAccommodation.add(accKey);

//               const accDoc = acc?.accommodationDoc || null;
//               const aImgs = getDocImgsUpTo8(accDoc);

//               const bg = aImgs[0] || "";
//               const edgeImgs = aImgs.slice(1, 4);

//               return `
//                 <div class="section keepTogether" style="padding:0; background:transparent; border:none; box-shadow:none;">
//                   <div class="accBanner">
//                     <div class="accBg" style="${bgStyle(bg, 1800)}"></div>
//                     <div class="accTint"></div>
//                     <div class="accContent">
//                       <div class="secTitle" style="color: rgba(255,255,255,.85);">Accommodation</div>
//                       <div class="accName">${esc(acc?.propertyName || "-")}</div>
//                       <div style="opacity:.92; line-height:1.55; font-weight:700;">
//                         ${esc(accDoc?.address || "")}
//                       </div>
//                       <div class="accMeta">
//                         <span>Category: ${esc(acc?.hotelCategory || "-")}</span>
//                         <span>Room: ${esc(acc?.roomCategory || "-")}</span>
//                         ${acc?.vendorName ? `<span>Vendor: ${esc(acc.vendorName)}</span>` : ""}
//                       </div>
//                     </div>

//                     ${
//                       edgeImgs.length
//                         ? `<div class="accEdgeImgs">
//                             ${edgeImgs[0] ? imgTag(edgeImgs[0], 1100) : ""}
//                             ${edgeImgs[1] ? imgTag(edgeImgs[1], 1100) : ""}
//                             ${edgeImgs[2] ? imgTag(edgeImgs[2], 1100) : ""}
//                           </div>`
//                         : ""
//                     }
//                   </div>
//                 </div>
//               `;
//             })
//             .join("");

//           /* -------- MEALS (kept) -------- */
//           const breakfast = pickMealFromFoods(foods, "breakfast");
//           const lunch = pickMealFromFoods(foods, "lunch");
//           const dinner = pickMealFromFoods(foods, "dinner");

//           const mealsHeading = trip?.tripName
//             ? `Meals Included in ${trip.tripName}`
//             : "Meals Included";

//           const mealsBlock = `
//             <div class="section keepTogether">
//               <div class="secTitle">${esc(mealsHeading)}</div>
//               <div class="mealRow">
//                 <div class="mealPill">Breakfast: ${esc(breakfast)}</div>
//                 <div class="mealPill">Lunch: ${esc(lunch)}</div>
//                 <div class="mealPill">Dinner: ${esc(dinner)}</div>
//               </div>
//             </div>
//           `;

//           return `
//             ${tripBlock}
//             ${tripVehiclesHtml}
//             ${addonBlock}
//             ${addonVehiclesHtml}
//             ${activitiesHtml}
//             ${accommodationsHtml}
//             ${mealsBlock}
//           `;
//         })
//         .join("");

//       return `<!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8"/>
//         <style>${commonCss}</style>
//         <link rel="preconnect" href="https://fonts.googleapis.com">
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//         <link href="https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@600;700&family=Bangers&family=Black+Ops+One&family=Montserrat+Alternates:wght@700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
//       </head>
//       <body>
//         <div class="paperBg"></div>
//         <div class="paperNoise"></div>

//          <div class="bgBlendTop" style="${bgStyle(topImg, 1600)}"></div>
//          <div class="bgBlendBottom" style="${bgStyle(bottomImg, 1600)}"></div>
//         <div class="foldFx"></div>

//         <div class="wrap" style="padding-top:56px; padding-bottom:64px;">
//           <div class="dayHeader keepTogether">
//             <div>
//               <div class="dayLabel">${esc(day.dayLabel || "Day")}</div>
//               <div class="dayDate">${esc(fmtDate(day.date))}</div>
//             </div>
//             <div class="dayDest" style="color:${esc(destinationDoc?.textColor || "#000000")}">
//               ${esc(destName || "")}
//             </div>
//           </div>

//           ${
//             segmentBlocks ||
//             `<div class="section keepTogether" style="background: rgba(255,255,255,.70)">No itinerary segments found for this day.</div>`
//           }
//         </div>
//       </body>
//       </html>`;
//     };

//     /* ===============================
//        PDF RENDER + MERGE (keep perf)
//        (UNCHANGED)
//     ================================ */
//     const waitForImages = async (page) => {
//       await page.evaluate(async () => {
//         const imgs = Array.from(document.images || []);
//         await Promise.all(
//           imgs.map((img) =>
//             img.complete
//               ? Promise.resolve()
//               : new Promise((res) => {
//                   img.addEventListener("load", res, { once: true });
//                   img.addEventListener("error", res, { once: true });
//                 })
//           )
//         );
//       });
//     };

//     async function renderPdfFromHtml(page, html) {
//       await page.setViewport({ width: 1123, height: 1587 }); // A4-ish
//       await page.setContent(html, { waitUntil: "domcontentloaded" });
//       await waitForImages(page);

//       return await page.pdf({
//         format: "A4",
//         printBackground: true,
//         preferCSSPageSize: true,
//         scale: 0.88,
//         margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
//       });
//     }

//     async function mergePdfs(buffers) {
//       const merged = await PDFDocument.create();
//       for (const b of buffers) {
//         const pdf = await PDFDocument.load(b);
//         const pages = await merged.copyPages(pdf, pdf.getPageIndices());
//         pages.forEach((p) => merged.addPage(p));
//       }
//       return Buffer.from(await merged.save());
//     }

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
//     });

//     const page = await browser.newPage();
//     await page.setCacheEnabled(true);

//     const pdfParts = [];

//     // cover
//     pdfParts.push(await renderPdfFromHtml(page, coverHtml));

//     // days
//     let di = 0;
//     for (const day of tour.days || []) {
//       pdfParts.push(await renderPdfFromHtml(page, dayHtml(day, di)));
//       di += 1;
//     }

//     await page.close();
//     await browser.close();

//     const finalPdfBuffer = await mergePdfs(pdfParts);

//     /* ---------- UPDATE CLIENT (AFTER PDF) ---------- */
//     const ist = getIstNow();
//     const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

//     const reasonLabel =
//       disc > 0
//         ? `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
//         : `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent without any discount`;

//     client.statusUpdatedByExecutive.push({
//       status: "Detail Sent",
//       value: 3,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       date: todayDateStr,
//       time: todayTimeStr,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//       reasonLabel,
//     });

//     const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
//     if (!scheduledDateObj) {
//       return res
//         .status(400)
//         .json({ message: "Invalid date/time for scheduled follow-up" });
//     }

//     client.ScheduleDatesByExecutives.push({
//       status: "Detail Sent",
//       reasonLabel: "Group Tour Referral Itinerary Sent",
//       scheduledDate: scheduledDateObj,
//       scheduledTimeRaw: nextTimeRaw,
//       executiveId: exec._id,
//       executiveName: exec.name,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//     });

//     await client.save();

//     /* ---------- STREAM PDF ---------- */
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="Referral-Itinerary-${tour.tourName}.pdf"`,
//     });

//     return res.send(finalPdfBuffer);
//   } catch (err) {
//     console.error("Referral PDF error:", err);
//     return res.status(500).json({ message: "PDF generation failed" });
//   }
// }





export async function downloadGroupTourReferralItinerary(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      groupTourId,
      nextDateRaw,
      nextTimeRaw,
      discountAmount = 0,
    } = req.body || {};

    /* ---------- VALIDATIONS (UNCHANGED) ---------- */
    if (!executiveId) return res.status(401).json({ message: "Unauthorized" });

    if (
      !mongoose.isValidObjectId(executiveId) ||
      !mongoose.isValidObjectId(clientId) ||
      !mongoose.isValidObjectId(groupTourId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    if (!nextDateRaw || !nextTimeRaw) {
      return res
        .status(400)
        .json({ message: "nextDateRaw and nextTimeRaw are required" });
    }

    /* ---------- FETCH CORE DATA ---------- */
    const exec = await Executive.findById(executiveId)
      .populate("company")
      .lean();
    if (!exec) return res.status(404).json({ message: "Executive not found" });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const tour = await GroupTour.findById(groupTourId).lean();
    if (!tour) return res.status(404).json({ message: "Group tour not found" });

    const company = await Company.findById(exec.company).lean();

    /* ---------- POPULATE DAY SEGMENTS (UNCHANGED) ---------- */
    for (const day of tour.days || []) {
      for (const seg of day.segments || []) {
        seg.tripDoc = seg.trip ? await Trip.findById(seg.trip).lean() : null;
        seg.addonDoc = seg.selectedAddon
          ? await AddOnTrip.findById(seg.selectedAddon).lean()
          : null;

        seg.activityDocs = await Activity.find({
          _id: { $in: seg.selectedActivities || [] },
        }).lean();

        for (const v of seg.boTripVehicles || []) {
          v.vehicleDoc = v.vehicleId
            ? await Vehicle.findById(v.vehicleId).lean()
            : null;
        }

        for (const v of seg.boAddonVehicles || []) {
          v.vehicleDoc = v.vehicleId
            ? await Vehicle.findById(v.vehicleId).lean()
            : null;
        }

        for (const a of seg.boAccommodations || []) {
          a.accommodationDoc = a.accommodationId
            ? await Accommodation.findById(a.accommodationId).lean()
            : null;
        }
      }
    }

    /* ===============================
       HELPERS (OPTIMIZED & SAFE)
       ✅ NO LOGIC CHANGE
    ================================ */
    const fmtDate = (d) =>
      d ? new Date(d).toLocaleDateString("en-GB") : "-";

    const esc = (s) => {
      if (s === null || s === undefined) return "";
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    };

    const safeImgRaw = (url) =>
      url && String(url).trim() ? String(url).trim() : "";

    const cloudinaryOptimized = (url, w = 1200, q = 55) => {
      const u = safeImgRaw(url);
      if (!u) return "";
      if (!u.includes("/upload/")) return u;
      return u.replace(
        "/upload/",
        `/upload/f_jpg,fl_progressive,q_${q},w_${w},c_limit/`
      );
    };

    const imgTag = (url, w, className = "", style = "") => {
      const orig = safeImgRaw(url);
      if (!orig) return "";
      const opt = cloudinaryOptimized(orig, w);
      return `<img${className ? ` class="${className}"` : ""}${
        style ? ` style="${style}"` : ""
      } src="${opt}" onerror="this.onerror=null;this.src='${orig}'" />`;
    };

    const bgStyle = (url, w) => {
      const orig = safeImgRaw(url);
      if (!orig) return "";
      const opt = cloudinaryOptimized(orig, w);
      return `background-image:url('${opt}');`;
    };

    const getDocImgsUpTo8 = (doc) => {
      if (!doc) return [];
      return [
        doc.imageUrl,
        doc.secondImageUrl,
        doc.thirdImageUrl,
        doc.fourthImageUrl,
        doc.fifthImageUrl,
        doc.sixthImageUrl,
        doc.seventhImageUrl,
        doc.eightImageUrl || doc.eighthImageUrl,
      ]
        .map(safeImgRaw)
        .filter(Boolean);
    };

    const fallbackCoverBg =
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

    /* ===============================
       DESTINATION DATA (UNCHANGED)
    ================================ */
    let destinationDoc = null;
    if (tour?.destination && mongoose.isValidObjectId(tour.destination)) {
      destinationDoc = await Destination.findById(tour.destination).lean();
    }

    const destImgsAll = getDocImgsUpTo8(destinationDoc);
    const destTextColor = destinationDoc?.textColor || "#ffffff";
    const destName = destinationDoc?.name || "";

    const coverBg = destImgsAll[0] || fallbackCoverBg;
    const coverOverlay = destImgsAll[1] || ""; // cutout

    /* ===============================
       CSS
       ✅ COVER: Tour name TOP layer (above cutout)
       ✅ COVER: Welcome texts BEHIND cutout (between 1st and 2nd image)
       ✅ DAY: remove random destination image backgrounds (NO bgTop/bgBottom)
       ✅ ACC: more space between details and bottom images
       ✅ Vendor removed (in HTML below)
    ================================ */
    const commonCss = `
      @page { size:A4; margin:0 }
      html,body{margin:0;padding:0;font-family:Inter,Arial,sans-serif}
      *{box-sizing:border-box;print-color-adjust:exact}
      img{display:block;max-width:100%}

      /* ---------- COVER LAYERS ---------- */
      .coverBg{
        position:fixed; inset:0;
        background-size:cover;
        background-position:center;
        z-index: 0;
      }

      /* Welcome stack must be BEHIND overlay */
      .coverHero{
        position: relative;
        margin-top: 210px;  /* ✅ lower a bit */
        text-align:center;
        color:${esc(destTextColor)};
        z-index: 2;         /* ✅ behind overlay */
        padding: 0 18px;
      }

      /* Cutout overlay ABOVE welcome texts */
      .coverOverlayFull{
        position:fixed; inset:0;
        width:100%; height:100%;
        object-fit:cover;
        pointer-events:none;
        opacity:.98;
        z-index: 5;         /* ✅ above hero text */
      }

      /* Top strip (logo + client id) ABOVE overlay */
      .coverTop{
        position: fixed;
        top: 26px; left: 32px; right: 32px;
        z-index: 8;
        display:flex;
        align-items:center;
        justify-content: space-between;
        gap: 14px;
        color:${esc(destTextColor)};
        pointer-events:none;
      }
      .coverLogo{width:110px;height:auto}

      /* TOUR NAME MUST BE TOPMOST (above overlay) */
      .tourNameTop{
        position: fixed;
        top: 105px;
        left: 42px;
        right: 42px;
        z-index: 9;         /* ✅ top layer */
        text-align:center;
        color:${esc(destTextColor)};
        font-family:"Bangers","Black Ops One","Anton",sans-serif;
        letter-spacing:.10em;
        font-weight: 900;
        font-size: 56px;
        line-height: .95;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 18px 45px rgba(0,0,0,.24);
        pointer-events:none;
      }

      .wrap{position:relative;padding:42px;min-height:100vh;z-index: 1;}

      .welcome1{
        font-family:"Bangers","Black Ops One","Anton",sans-serif;
        font-size:62px;font-weight:900;letter-spacing:.18em;
        text-shadow:0 18px 45px rgba(0,0,0,.22);
      }
      .welcome2{
        font-family:"Bangers","Black Ops One","Anton",sans-serif;
        font-size:98px;font-weight:900;line-height:.92;letter-spacing:.06em;
        text-shadow:0 18px 45px rgba(0,0,0,.22);
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      }
      .welcome3{
        font-family:"Bangers","Black Ops One","Anton",sans-serif;
        font-size:66px;font-weight:900;letter-spacing:.14em;
        text-shadow:0 18px 45px rgba(0,0,0,.22);
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      }

      /* Details fixed to bottom, ABOVE overlay (so it's readable even with cutout) */
      .coverBottom{
        position:fixed;
        left:0; right:0; bottom:24px;
        display:flex;
        justify-content:center;
        padding:0 34px;
        z-index: 8;
      }
      .glassBox{
        width:96%;
        max-width:860px;
        padding:18px;
        border-radius:22px;
        background:rgba(255,255,255,.22);
        border:1px solid rgba(255,255,255,.35);
        box-shadow:0 12px 40px rgba(0,0,0,.15);
        color:${esc(destTextColor)};
        text-align:center;
      }

      /* ---------- COMMON SECTIONS ---------- */
      .section{
        margin-top:16px;
        padding:16px;
        border-radius:18px;
        background:#ffffffee;
        box-shadow:0 10px 28px rgba(0,0,0,.08);
        break-inside:avoid;
        page-break-inside:avoid;
      }

      /* ---------- ACCOMMODATION STABILITY + EXTRA SPACE ---------- */
      .accBanner{
        position:relative;
        border-radius:22px;
        overflow:hidden;
        min-height:260px;
        box-shadow:0 18px 55px rgba(0,0,0,.18);
        border:1px solid rgba(0,0,0,.06);
      }
      .accBg{position:absolute;inset:0;background-size:cover;background-position:center}
      .accTint{position:absolute;inset:0;background:rgba(10,45,28,.64)}
      .accContent{
        position:relative;
        z-index:2;
        padding:18px 18px 160px 18px;  /* ✅ MORE SPACE before bottom images */
        color:rgba(255,255,255,.92);
      }
      .accName{
        font-family:"Montserrat Alternates",Georgia,serif;
        font-size:18px;font-weight:900;margin:0 0 8px 0
      }
      .accMeta{
        display:flex;
        gap:12px;
        flex-wrap:wrap;
        margin-top:14px;    /* ✅ more spacing */
        font-weight:850;
        letter-spacing:.06em;
        font-size:12px;
      }
      .accMeta span{
        padding:9px 11px;   /* ✅ slightly bigger */
        border-radius:14px;
        background:rgba(255,255,255,.12);
        border:1px solid rgba(255,255,255,.18);
      }
      .accEdgeImgs{
        position:absolute;
        left:0; right:0;
        bottom:0;
        height:120px;        /* ✅ a bit bigger */
        display:flex;
        gap:0;
        z-index:3;
      }
      .accEdgeImgs img{width:33.333%;height:100%;object-fit:cover;display:block}
    `;

    /* ===============================
       COVER HTML
       ✅ Tour name top layer above cutout
       ✅ Welcome texts behind cutout
    ================================ */
    const pax = Number(client.numberOfPersons || 0);
    const totalCost = pax * Number(tour.pricePerPax || 0);
    const disc = Number(discountAmount || 0);
    const finalPayable = Math.max(0, totalCost - disc);

    const clientDisplayName =
      client?.name || client?.clientName || client?.fullName || "Customer";
    const clientDisplayId =
      client?.clientId ||
      client?.clientCode ||
      client?.clientNumber ||
      String(client?._id || "");

    const inclusions = Array.isArray(tour?.includes)
      ? tour.includes.filter(Boolean)
      : [];
    const inclusionsLine =
      inclusions.length > 0 ? inclusions.map((x) => esc(x)).join(" | ") : "-";

    const perHead = Number(tour.pricePerPax || 0);

    const coverHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>${commonCss}</style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@600;700&family=Bangers&family=Black+Ops+One&family=Montserrat+Alternates:wght@700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="coverBg" style="${bgStyle(coverBg, 1400)}"></div>

  <!-- ✅ Welcome texts (z-index 2) -->
  <div class="wrap">
    <div class="coverHero">
      <div class="welcome1">WELCOME</div>
      <div class="welcome2" title="${esc(clientDisplayName)}">${esc(
      clientDisplayName
    )}</div>
      <div class="welcome3">TO</div>
    </div>
  </div>

  <!-- ✅ Cutout overlay ABOVE texts -->
  ${
    coverOverlay
      ? `<img class="coverOverlayFull"
             src="${cloudinaryOptimized(coverOverlay, 1400, 55)}"
             onerror="this.onerror=null;this.src='${coverOverlay}'" />`
      : ""
  }

  <!-- ✅ Top strip above overlay -->
  <div class="coverTop">
    <div>${
      company?.logo
        ? `<img class="coverLogo"
               src="${cloudinaryOptimized(company.logo, 520, 60)}"
               onerror="this.onerror=null;this.src='${company.logo}'" />`
        : ""
    }</div>
    <div style="flex:1;text-align:center;font-family:Teko,Anton,sans-serif;font-size:30px;letter-spacing:.24em;font-weight:900">
      GROUP TOUR
    </div>
    <div style="font-family:Teko,Anton,sans-serif;font-size:22px;letter-spacing:.10em;font-weight:900">
      CLIENT ID: ${esc(clientDisplayId)}
    </div>
  </div>

  <!-- ✅ TOUR NAME top-most layer -->
  <div class="tourNameTop" title="${esc(tour.tourName || "TOUR")}">
    ${esc(tour.tourName || "TOUR")}
  </div>

  <!-- ✅ Details fixed to bottom -->
  <div class="coverBottom">
    <div class="glassBox">
      <div style="font-family:Teko,Anton,sans-serif;font-weight:900;letter-spacing:.22em;text-transform:uppercase;font-size:18px">
        INCLUSIONS
      </div>
      <div style="margin-top:6px;font-weight:850;font-size:13px;letter-spacing:.06em">
        ${inclusionsLine}
      </div>

      <div style="margin-top:12px;padding:12px 16px;border-radius:18px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);font-family:Teko,Anton,sans-serif;letter-spacing:.10em;font-size:22px;font-weight:900">
        PER HEAD: ${esc(perHead)} &nbsp;&nbsp;•&nbsp;&nbsp; TOTAL: ${esc(finalPayable)}
        ${disc > 0 ? ` <span style="opacity:.85">(DISCOUNT ${esc(disc)})</span>` : ""}
      </div>

      <div style="margin-top:12px;padding:12px 14px;border-radius:18px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);font-weight:850;letter-spacing:.04em;font-size:12.5px">
        ⚠️ This is a <b>Referral Itinerary</b> for reference only. It does not confirm travel.
      </div>
    </div>
  </div>
</body>
</html>`;

    /* ===============================
       DAY CSS ADDONS
       ✅ Removed destination image backgrounds completely
       (NO bgTop/bgBottom divs, NO random destination images)
    ================================ */
    const dayCssAddon = `
      .paperBg{
        position:fixed;inset:0;z-index:0;
        background: linear-gradient(180deg, #fbfaf7 0%, #f7f4ee 100%);
      }
      .paperNoise{
        position:fixed;inset:0;z-index:1;opacity:.12;
        background-image:
          radial-gradient(circle at 10% 20%, rgba(0,0,0,.03) 0 1px, transparent 1px),
          radial-gradient(circle at 70% 60%, rgba(0,0,0,.02) 0 1px, transparent 1px),
          radial-gradient(circle at 40% 85%, rgba(0,0,0,.02) 0 1px, transparent 1px);
        background-size: 14px 14px, 18px 18px, 22px 22px;
      }

      .dayHeader{
        display:flex;justify-content:space-between;align-items:flex-end;
        padding-top:8px;padding-bottom:14px;border-bottom:1px dashed rgba(0,0,0,.18);
      }
      .dayLabel{font-family:Caveat,cursive;font-size:40px;font-weight:800;color:rgba(0,0,0,.82)}
      .dayDate{font-family:Caveat,cursive;font-size:22px;font-weight:700;color:rgba(0,0,0,.62)}
      .dayDest{font-weight:950;letter-spacing:.16em;text-transform:uppercase;font-size:10px}

      .twoCol{display:grid;grid-template-columns:1.05fr .95fr;gap:14px;align-items:start}
      .secTitle{font-weight:950;letter-spacing:.14em;text-transform:uppercase;font-size:11px;color:rgba(0,0,0,.70);margin-bottom:10px}
      .titleStrong{font-family:"Montserrat Alternates",Georgia,serif;font-size:18px;font-weight:900;color:rgba(0,0,0,.88);margin:0 0 8px 0}
      .desc{color:rgba(0,0,0,.68);line-height:1.65;font-weight:650;font-size:12.6px}

      .collage{position:relative;height:270px;border-radius:20px;overflow:visible;background:rgba(0,0,0,.03)}
      .card{position:absolute;width:168px;height:126px;border-radius:18px;overflow:hidden;box-shadow:0 18px 52px rgba(0,0,0,.18)}
      .card img{width:100%;height:100%;object-fit:cover;display:block}
      .card.a{left:6px;top:10px;transform:rotate(-6deg)}
      .card.b{right:10px;top:12px;transform:rotate(6deg)}
      .card.c{left:30px;bottom:10px;transform:rotate(3deg)}
      .card.d{right:34px;bottom:6px;transform:rotate(-3deg)}
      .collageTopCutout{position:absolute;left:50%;top:-10px;transform:translateX(-50%);width:240px;height:auto;filter:drop-shadow(0 22px 55px rgba(0,0,0,.20));pointer-events:none;z-index:6}

      .vehTwoCol{display:grid;grid-template-columns:1.05fr .95fr;gap:14px;align-items:center}
      .vehLeftStage{position:relative;height:270px;border-radius:20px;overflow:visible;background:rgba(0,0,0,.03)}
      .vehGrid234{position:absolute;left:0;right:0;top:44px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 8px}
      .vehGrid234 img{width:100%;height:190px;object-fit:cover;border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.16);display:block}
      .vehCutout1{position:absolute;left:50%;top:4px;transform:translateX(-50%);width:396px;max-width:95%;height:auto;z-index:6;pointer-events:none;filter:drop-shadow(0 22px 55px rgba(0,0,0,.18))}
      .vehInfoBox{padding:14px;border-radius:18px;background:#ffffffee;border:1px solid rgba(0,0,0,.06);box-shadow:0 14px 40px rgba(0,0,0,.06)}
      .vehK{font-weight:950;letter-spacing:.14em;text-transform:uppercase;font-size:10px;color:rgba(0,0,0,.60);margin-bottom:6px}
      .vehV{font-family:"Montserrat Alternates","Anton",sans-serif;font-weight:900;font-size:18px;color:rgba(0,0,0,.86);line-height:1.12;word-break:break-word;overflow-wrap:anywhere}
      .vehV.small{margin-top:10px;font-size:15px;opacity:.88}

      .addonCards{display:flex;flex-direction:column;gap:10px}
      .addonCard{border-radius:18px;overflow:hidden;box-shadow:0 14px 40px rgba(0,0,0,.12);border:1px solid rgba(0,0,0,.06)}
      .addonCard img{width:100%;height:110px;object-fit:cover;display:block}

      .mealRow{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
      .mealPill{padding:10px 12px;border-radius:16px;background:rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.06);font-weight:850;color:rgba(0,0,0,.74)}
    `;

    /* ✅ decor picker stays (still used only for logic; day backgrounds removed so it won't render heavy images) */
    const decorPool = (destImgsAll || [])
      .filter(Boolean)
      .filter((u) => u !== destImgsAll[1]);
    if (!decorPool.length) decorPool.push(coverBg || fallbackCoverBg);

    const pickDayDecor = (() => {
      const used = new Set();
      const pool = decorPool.slice();
      let idx = 0;

      const takeUnique = () => {
        for (let t = 0; t < pool.length; t++) {
          const u = pool[(idx + t) % pool.length];
          if (!used.has(u)) {
            used.add(u);
            idx = (idx + t + 1) % pool.length;
            return u;
          }
        }
        const u = pool[idx % pool.length];
        idx = (idx + 1) % pool.length;
        return u;
      };

      return (dayIndex) => {
        idx = (idx + (dayIndex * 2 + 1)) % pool.length;
        const top = takeUnique();
        const bottom = takeUnique();
        return { top, bottom };
      };
    })();

    /* ===============================
       DAY HTML
       ✅ Removed bgTop/bgBottom DIVS completely
       ✅ Vendor removed
       ✅ Accommodation spacing increased (CSS already)
    ================================ */
    const dayHtml = (day, dayIndex) => {
      const segments = Array.isArray(day.segments) ? day.segments : [];

      // still computed (no longer used for backgrounds)
      pickDayDecor(dayIndex);

      const seenTripVehicle = new Set();
      const seenAddonVehicle = new Set();
      const seenAccommodation = new Set();
      const seenActivity = new Set();

      const pickMealFromFoods = (foods, type) =>
        (foods || []).find((f) => String(f?.mealType || "").toLowerCase() === type)
          ?.foodName || "-";

      const buildTripCollage = (imgs) => {
        const arr = (imgs || []).filter(Boolean);
        const p1 = arr[0] || "";
        const p2 = arr[1] || "";
        const p3 = arr[2] || "";
        const p4 = arr[3] || "";
        const topCut = arr[7] || arr[arr.length - 1] || "";

        return `
          <div class="collage">
            ${p1 ? `<div class="card a">${imgTag(p1, 900)}</div>` : ""}
            ${p2 ? `<div class="card b">${imgTag(p2, 900)}</div>` : ""}
            ${p3 ? `<div class="card c">${imgTag(p3, 900)}</div>` : ""}
            ${p4 ? `<div class="card d">${imgTag(p4, 900)}</div>` : ""}
            ${
              topCut
                ? `<img class="collageTopCutout"
                    src="${cloudinaryOptimized(topCut, 1100, 55)}"
                    onerror="this.onerror=null;this.src='${topCut}'" />`
                : ""
            }
          </div>
        `;
      };

      const buildVehicleBlock = (heading, vehicleDoc) => {
        const vImgs = getDocImgsUpTo8(vehicleDoc);
        if (!vImgs.length) return "";

        const img1 = vImgs[0] || "";
        const img2 = vImgs[1] || "";
        const img3 = vImgs[2] || "";
        const img4 = vImgs[3] || "";

        const vehicleName =
          vehicleDoc?.vehicle || vehicleDoc?.vehicleName || vehicleDoc?.name || "-";
        const vehicleCategory = vehicleDoc?.category || "-";

        return `
          <div class="section">
            <div style="font-weight:950;letter-spacing:.10em;text-transform:uppercase;font-size:11px;color:rgba(0,0,0,.72);margin-bottom:10px">
              ${esc(heading || "VEHICLE")}
            </div>

            <div class="vehTwoCol">
              <div class="vehLeftStage">
                <div class="vehGrid234">
                  ${img2 ? imgTag(img2, 1000) : `<div></div>`}
                  ${img3 ? imgTag(img3, 1000) : `<div></div>`}
                  ${img4 ? imgTag(img4, 1000) : `<div></div>`}
                </div>

                ${
                  img1
                    ? `<img class="vehCutout1"
                        src="${cloudinaryOptimized(img1, 1300, 55)}"
                        onerror="this.onerror=null;this.src='${img1}'" />`
                    : ""
                }
              </div>

              <div class="vehInfoBox">
                <div class="vehK">VEHICLE NAME</div>
                <div class="vehV">${esc(vehicleName)}</div>

                <div class="vehK" style="margin-top:12px;">CATEGORY</div>
                <div class="vehV small">${esc(vehicleCategory)}</div>
              </div>
            </div>
          </div>
        `;
      };

      const buildAddonCards = (imgs) => {
        const arr = (imgs || []).filter(Boolean).slice(0, 3);
        if (!arr.length) return "";
        return `
          <div class="addonCards">
            ${arr.map((u) => `<div class="addonCard">${imgTag(u, 1100)}</div>`).join("")}
          </div>
        `;
      };

      const segmentBlocks = segments
        .map((seg) => {
          const trip = seg.tripDoc || null;
          const addon = seg.addonDoc || null;

          const activities = Array.isArray(seg.activityDocs) ? seg.activityDocs : [];
          const foods = Array.isArray(seg.boFoods) ? seg.boFoods : [];
          const accs = Array.isArray(seg.boAccommodations) ? seg.boAccommodations : [];
          const tripVehicles = Array.isArray(seg.boTripVehicles) ? seg.boTripVehicles : [];
          const addonVehicles = Array.isArray(seg.boAddonVehicles) ? seg.boAddonVehicles : [];

          const tripImgs = getDocImgsUpTo8(trip);
          const tripBlock = trip
            ? `
              <div class="section">
                <div class="secTitle">Trip</div>
                <div class="twoCol">
                  <div>
                    <div class="titleStrong">${esc(trip.tripName || "")}</div>
                    <div class="desc">${esc(trip.description || "")}</div>
                  </div>
                  <div>${buildTripCollage(tripImgs)}</div>
                </div>
              </div>
            `
            : "";

          let firstTripVehicleShown = null;
          const tripVehiclesHtml = tripVehicles
            .map((v) => {
              const vKey = String(v?.vehicleId || v?.vehicleName || "");
              if (!vKey) return "";
              if (seenTripVehicle.has(vKey)) return "";
              seenTripVehicle.add(vKey);

              if (!firstTripVehicleShown) {
                firstTripVehicleShown = String(v?.vehicleId || v?.vehicleName || "");
              }

              const vd = v?.vehicleDoc || null;
              const heading = trip?.tripName
                ? `THE VEHICLE FOR "${trip.tripName}"`
                : "THE VEHICLE FOR TRIP";
              return buildVehicleBlock(heading, vd);
            })
            .join("");

          const addonImgs = getDocImgsUpTo8(addon);
          const addonBlock = addon
            ? `
              <div class="section">
                <div class="twoCol">
                  <div>${buildAddonCards(addonImgs)}</div>
                  <div>
                    <div class="titleStrong">${esc(addon.addontripName || "")}</div>
                    <div class="desc">${esc(addon.description || "")}</div>
                  </div>
                </div>
              </div>
            `
            : "";

          const addonVehiclesHtml = addonVehicles
            .map((v) => {
              const vKey = String(v?.vehicleId || v?.vehicleName || "");
              if (!vKey) return "";

              if (
                firstTripVehicleShown &&
                String(v?.vehicleId || v?.vehicleName || "") === firstTripVehicleShown
              ) {
                return "";
              }

              if (seenAddonVehicle.has(vKey)) return "";
              seenAddonVehicle.add(vKey);

              const vd = v?.vehicleDoc || null;
              const heading = addon?.addontripName
                ? `THE VEHICLE FOR "${addon.addontripName}"`
                : "THE VEHICLE FOR ADD-ON";
              return buildVehicleBlock(heading, vd);
            })
            .join("");

          const activitiesHtml = activities
            .map((a) => {
              const aKey = String(a?._id || "");
              if (!aKey) return "";
              if (seenActivity.has(aKey)) return "";
              seenActivity.add(aKey);

              const aImgs = getDocImgsUpTo8(a);
              return `
                <div class="section">
                  <div class="secTitle">Activity</div>
                  <div class="twoCol">
                    <div>
                      <div class="titleStrong">${esc(a?.activityName || a?.name || "")}</div>
                      <div class="desc">${esc(a?.description || "")}</div>
                    </div>
                    <div>${buildTripCollage(aImgs)}</div>
                  </div>
                </div>
              `;
            })
            .join("");

          const accommodationsHtml = accs
            .map((acc) => {
              const accKey = String(acc?.accommodationId || acc?.propertyName || "");
              if (!accKey) return "";
              if (seenAccommodation.has(accKey)) return "";
              seenAccommodation.add(accKey);

              const accDoc = acc?.accommodationDoc || null;
              const aImgs = getDocImgsUpTo8(accDoc);

              const bg = aImgs[0] || "";
              const edgeImgs = aImgs.slice(1, 4);

              return `
                <div class="section" style="padding:0;background:transparent;border:none;box-shadow:none;">
                  <div class="accBanner">
                    <div class="accBg" style="${bgStyle(bg, 1400)}"></div>
                    <div class="accTint"></div>
                    <div class="accContent">
                      <div class="secTitle" style="color:rgba(255,255,255,.85);">Accommodation</div>
                      <div class="accName">${esc(acc?.propertyName || "-")}</div>
                      <div style="opacity:.92;line-height:1.6;font-weight:750;">
                        ${esc(accDoc?.address || "")}
                      </div>
                      <div class="accMeta">
                        <span>Category: ${esc(acc?.hotelCategory || "-")}</span>
                        <span>Room: ${esc(acc?.roomCategory || "-")}</span>
                        <!-- ✅ Vendor removed -->
                      </div>
                    </div>

                    ${
                      edgeImgs.length
                        ? `<div class="accEdgeImgs">
                            ${edgeImgs[0] ? imgTag(edgeImgs[0], 1000) : ""}
                            ${edgeImgs[1] ? imgTag(edgeImgs[1], 1000) : ""}
                            ${edgeImgs[2] ? imgTag(edgeImgs[2], 1000) : ""}
                          </div>`
                        : ""
                    }
                  </div>
                </div>
              `;
            })
            .join("");

          const breakfast = pickMealFromFoods(foods, "breakfast");
          const lunch = pickMealFromFoods(foods, "lunch");
          const dinner = pickMealFromFoods(foods, "dinner");

          const mealsHeading = trip?.tripName
            ? `Meals Included in ${trip.tripName}`
            : "Meals Included";

          const mealsBlock = `
            <div class="section">
              <div class="secTitle">${esc(mealsHeading)}</div>
              <div class="mealRow">
                <div class="mealPill">Breakfast: ${esc(breakfast)}</div>
                <div class="mealPill">Lunch: ${esc(lunch)}</div>
                <div class="mealPill">Dinner: ${esc(dinner)}</div>
              </div>
            </div>
          `;

          return `
            ${tripBlock}
            ${tripVehiclesHtml}
            ${addonBlock}
            ${addonVehiclesHtml}
            ${activitiesHtml}
            ${accommodationsHtml}
            ${mealsBlock}
          `;
        })
        .join("");

      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>${commonCss}${dayCssAddon}</style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@600;700&family=Bangers&family=Black+Ops+One&family=Montserrat+Alternates:wght@700;800&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="paperBg"></div>
  <div class="paperNoise"></div>

  <div class="wrap" style="padding-top:56px;padding-bottom:64px;">
    <div class="dayHeader">
      <div>
        <div class="dayLabel">${esc(day.dayLabel || "Day")}</div>
        <div class="dayDate">${esc(fmtDate(day.date))}</div>
      </div>
      <div class="dayDest" style="color:${esc(destinationDoc?.textColor || "#000")}">
        ${esc(destName || "")}
      </div>
    </div>

    ${
      segmentBlocks ||
      `<div class="section">No itinerary segments found for this day.</div>`
    }
  </div>
</body>
</html>`;
    };

    /* ===============================
       FAST RENDER (UNCHANGED)
    ================================ */
    const waitForImages = async (page) => {
      await page.evaluate(async () => {
        const imgs = Array.from(document.images || []);
        await Promise.all(
          imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((res) => {
                  img.addEventListener("load", res, { once: true });
                  img.addEventListener("error", res, { once: true });
                })
          )
        );
      });
    };

    async function renderPdfFromHtml(page, html) {
      await page.setViewport({ width: 900, height: 1273 });
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await waitForImages(page);

      return await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        scale: 0.78,
        margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      });
    }

    async function mergePdfs(buffers) {
      const merged = await PDFDocument.create();
      for (const b of buffers) {
        const pdf = await PDFDocument.load(b);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      return Buffer.from(await merged.save({ useObjectStreams: true }));
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setCacheEnabled(true);

    const pdfParts = [];
    pdfParts.push(await renderPdfFromHtml(page, coverHtml));

    let di = 0;
    for (const day of tour.days || []) {
      pdfParts.push(await renderPdfFromHtml(page, dayHtml(day, di)));
      di += 1;
    }

    await page.close();
    await browser.close();

    const finalPdfBuffer = await mergePdfs(pdfParts);

    /* ---------- UPDATE CLIENT (UNCHANGED) ---------- */
    const ist = getIstNow();
    const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

    const reasonLabel =
      disc > 0
        ? `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
        : `Referral itinerary of Group Tour (${tour.tourName}) having itinerary amount (${totalCost}) sent without any discount`;

    client.statusUpdatedByExecutive.push({
      status: "Detail Sent",
      value: 3,
      executiveId: exec._id,
      executiveName: exec.name,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      tourType: "Group Tour",
      tourId: tour._id,
      reasonLabel,
    });

    const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
    if (!scheduledDateObj) {
      return res
        .status(400)
        .json({ message: "Invalid date/time for scheduled follow-up" });
    }

    client.ScheduleDatesByExecutives.push({
      status: "Detail Sent",
      reasonLabel: "Group Tour Referral Itinerary Sent",
      scheduledDate: scheduledDateObj,
      scheduledTimeRaw: nextTimeRaw,
      executiveId: exec._id,
      executiveName: exec.name,
      createdAt: ist,
      tourType: "Group Tour",
      tourId: tour._id,
    });

    await client.save();

    /* ---------- STREAM PDF ---------- */
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Referral-Itinerary-${tour.tourName}.pdf"`,
    });

    return res.send(finalPdfBuffer);
  } catch (err) {
    console.error("Referral PDF error:", err);
    return res.status(500).json({ message: "PDF generation failed" });
  }
}

























// export async function downloadGroupTourConfirmItinerary(req, res) {
//   try {
//     const executiveId = req.userId;
//     const {
//       clientId,
//       groupTourId,
//       groupTourName,
//       nextDateRaw,
//       nextTimeRaw,
//       discountAmount = 0,
//     } = req.body || {};

//     if (!executiveId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     if (!mongoose.isValidObjectId(executiveId)) {
//       return res.status(400).json({ message: "Invalid executiveId" });
//     }
//     if (!mongoose.isValidObjectId(clientId)) {
//       return res.status(400).json({ message: "Invalid clientId" });
//     }
//     if (!mongoose.isValidObjectId(groupTourId)) {
//       return res.status(400).json({ message: "Invalid groupTourId" });
//     }

//     const exec = await Executive.findById(executiveId)
//       .select("_id name")
//       .lean();
//     if (!exec) {
//       return res.status(404).json({ message: "Executive not found" });
//     }

//     const client = await Client.findById(clientId);
//     if (!client) {
//       return res
//         .status(404)
//         .json({ message: "Client not found or not managed by this executive" });
//     }

//     const tour = await GroupTour.findById(groupTourId).lean();
//     if (!tour) {
//       return res.status(404).json({ message: "Group tour not found" });
//     }
//     const pax = Number(client?.numberOfPersons || 0);
//     const pricePerPax = Number(tour?.pricePerPax || 0);
//     const totalCost = pricePerPax * pax;

//     const disc = Number(discountAmount || 0);

//     const tName = tour?.tourName || "Group Tour";

//    const reasonLabel =
//   disc > 0
//     ? `Confirm itinerary of Group Tour (${tName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
//     : `Confirm itinerary of Group Tour (${tName}) having itinerary amount (${totalCost}) sent without any discount`;


//     const ist = getIstNow();
//     const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

//     const statusEntry = {
//       status: "Confirmed",
//       value: 6, // bucket "confirmed"
//       executiveId: exec._id,
//       executiveName: exec.name || null,
//       date: todayDateStr,
//       time: todayTimeStr,
//       createdAt: ist,
//       tourType: "Group Tour",
//       tourId: tour._id,
//       reasonLabel,
//     };

//     if (!Array.isArray(client.statusUpdatedByExecutive)) {
//       client.statusUpdatedByExecutive = [];
//     }
//     client.statusUpdatedByExecutive.push(statusEntry);

//     // date/time OPTIONAL
//     let scheduleEntry = null;
//     if (nextDateRaw && nextTimeRaw) {
//       const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
//       if (scheduledDateObj) {
//         scheduleEntry = {
//           status: "Confirmed",
//           reasonLabel: "Group Tour Confirmed",
//           scheduledDate: scheduledDateObj,
//           scheduledTimeRaw: nextTimeRaw,
//           scheduledDateTimeReadable: null,
//           executiveId: exec._id,
//           executiveName: exec.name || null,
//           createdAt: ist,
//           createdAtISO: ist.toISOString(),
//           tourType: "Group Tour",
//           tourId: tour._id,
//         };

//         if (!Array.isArray(client.ScheduleDatesByExecutives)) {
//           client.ScheduleDatesByExecutives = [];
//         }
//         client.ScheduleDatesByExecutives.push(scheduleEntry);
//       }
//     }

//     await client.save();

//     // TODO: generate & stream actual confirmed itinerary PDF
//     return res.json({
//       message: "Group tour confirmed itinerary status saved",
//       statusEntry,
//       scheduleEntry,
//     });
//   } catch (err) {
//     console.error("downloadGroupTourConfirmItinerary error:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// }

const genPaymentCode = (len = 8) =>
  crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len).toUpperCase();

export async function downloadGroupTourConfirmItinerary(req, res) {
  try {


    const executiveId = req.userId;
    const {
      clientId,
      groupTourId,
      groupTourName, // keep as-is (not required)
      nextDateRaw,
      nextTimeRaw,
      discountAmount = 0,
    } = req.body || {};
    
    if (!executiveId) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(executiveId))
      return res.status(400).json({ message: "Invalid executiveId" });
    if (!mongoose.isValidObjectId(clientId))
      return res.status(400).json({ message: "Invalid clientId" });
    if (!mongoose.isValidObjectId(groupTourId))
      return res.status(400).json({ message: "Invalid groupTourId" });

    const exec = await Executive.findById(executiveId).select("_id name").lean();
    if (!exec) return res.status(404).json({ message: "Executive not found" });

    const client = await Client.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ message: "Client not found or not managed by this executive" });
    }

    const pax = Number(client?.numberOfPersons || 0);
    if (!Number.isFinite(pax) || pax <= 0) {
      return res.status(400).json({ message: "Invalid client numberOfPersons" });
    }

    const tour = await GroupTour.findById(groupTourId).lean();
    if (!tour) return res.status(404).json({ message: "Group tour not found" });

    const pricePerPax = Number(tour?.pricePerPax || 0);
    const totalDays = Number(tour?.totalDays || 0);

    if (!tour?.startDate) {
      return res.status(400).json({ message: "Group tour startDate missing" });
    }
    if (!Number.isFinite(totalDays) || totalDays <= 0) {
      return res.status(400).json({ message: "Group tour totalDays invalid" });
    }

    // ---- COST CALCS (integers, no decimals) ----
    const tourCost = Math.round(pricePerPax * pax);
    const disc = Math.round(Number(discountAmount || 0));
    const additionalItemsCost = 0;

    const totalAmountToBePaid = Math.max(
      0,
      Math.round(tourCost + additionalItemsCost - disc)
    );

    const totalAmountPaid = 0;
    const balance = totalAmountToBePaid;

    const tName = tour?.tourName || "Group Tour";

    // ---- DATES ----
    const tourStartDate = new Date(tour.startDate);
    const tourEndDate = new Date(tourStartDate);
    tourEndDate.setDate(tourEndDate.getDate() + (totalDays - 1));

    const ist = getIstNow();
    const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

    // ---- STEP 1: ATOMIC SEAT RESERVE (race safe) ----
   const seatUpdate = await GroupTour.findOneAndUpdate(
  { _id: groupTourId, seatsAvailable: { $gte: pax } },
  {
    $inc: { seatsAvailable: -pax, seatsBooked: +pax },
    $push: {
      confirmedClients: {
        clientId: client._id,
        clientName: client?.name || "",
        pax,
        confirmedAt: ist, // same confirmed time you already calculated
      },
    },
  },
  { new: true }
).lean();

    if (!seatUpdate) {
      return res.status(400).json({
        message: "Not enough seats available to confirm this group tour",
        requiredSeats: pax,
      });
    }

    // ---- STATUS ENTRY (your existing logic) ----
    const reasonLabel =
      disc > 0
        ? `Confirm itinerary of Group Tour (${tName}) having itinerary amount (${tourCost}) sent with discount (${disc})`
        : `Confirm itinerary of Group Tour (${tName}) having itinerary amount (${tourCost}) sent without any discount`;

    const statusEntry = {
      status: "Confirmed",
      value: 6,
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      tourType: "Group Tour",
      tourId: tour._id,
      reasonLabel,
    };

    // ---- schedule entry optional (same behavior) ----
    let scheduleEntry = null;
    if (nextDateRaw && nextTimeRaw) {
      const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
      if (scheduledDateObj) {
        scheduleEntry = {
          status: "Confirmed",
          reasonLabel: "Group Tour Confirmed",
          scheduledDate: scheduledDateObj,
          scheduledTimeRaw: nextTimeRaw,
          scheduledDateTimeReadable: null,
          executiveId: exec._id,
          executiveName: exec.name || null,
          createdAt: ist,
          createdAtISO: ist.toISOString(),
          tourType: "Group Tour",
          tourId: tour._id,
        };
      }
    }

    // ---- STEP 2: ATOMIC CLIENT UPDATE (prevent double-confirm) ----
    const clientUpdateOps = {
      $set: {
        confirmedTourType: "Group Tour",
        confirmedTour: {
          tourId: tour._id,
          tourName: tName,
          startDate: tourStartDate,
        },
        tourConfirmedDate: ist,
        tourStartDate: tourStartDate,
        tourEndDate: tourEndDate,
        tourCost: tourCost,
        discount: disc,
        additionalItemsCost: additionalItemsCost,
        totalAmountToBePaid: totalAmountToBePaid,
        totalAmountPaid: totalAmountPaid,
        balance: balance,
      },
      $push: {
        statusUpdatedByExecutive: statusEntry,
        ...(scheduleEntry ? { ScheduleDatesByExecutives: scheduleEntry } : {}),
      },
    };

    // const updatedClient = await Client.findOneAndUpdate(
    //   {
    //     _id: clientId,
    //     // prevents confirming SAME tour twice for same client
    //     "confirmedTour.tourId": { $ne: tour._id },
    //   },
    //   clientUpdateOps,
    //   { new: true }
    // );
     let updatedClient = null;

for (let attempt = 1; attempt <= 6; attempt++) {
  const paymentCode = genPaymentCode(8); // choose 6/8/10 as you want

  const clientUpdateOpsWithCode = {
    ...clientUpdateOps,
    $set: {
      ...(clientUpdateOps.$set || {}),
      paymentCode, // ✅ NEW
    },
  };

  try {
    updatedClient = await Client.findOneAndUpdate(
      {
        _id: clientId,
        // prevents confirming SAME tour twice for same client
        "confirmedTour.tourId": { $ne: tour._id },
      },
      clientUpdateOpsWithCode,
      { new: true }
    );

    // if client already confirmed, no need to retry
    if (!updatedClient) break;

    // success ✅
    break;
  } catch (e) {
    // duplicate key on paymentCode => retry with a new one
    if (e?.code === 11000 && e?.keyPattern?.paymentCode) continue;
    throw e;
  }
}

    // If client update fails (already confirmed etc), rollback seats
    // if (!updatedClient) {
    //   await GroupTour.updateOne(
    //     { _id: groupTourId },
    //     { 
    //       $inc: { seatsAvailable: +pax, seatsBooked: -pax },
    //       $pull: { confirmedClients: { clientId: client._id, confirmedAt: ist } },
    //      }
    //   );

    //   return res.status(409).json({
    //     message: "Client already confirmed this group tour (no changes made).",
    //   });
    // }
    if (!updatedClient) {
  await GroupTour.updateOne(
    { _id: groupTourId },
    {
      $inc: { seatsAvailable: +pax, seatsBooked: -pax },
      $pull: { confirmedClients: { clientId: client._id, confirmedAt: ist } },
    }
  );

  return res.status(409).json({
    message: "Client already confirmed this group tour (no changes made).",
  });
}

    return res.json({
      message: "Group tour confirmed itinerary status saved",
      statusEntry,
      scheduleEntry,
      seats: {
        seatsAvailable: seatUpdate.seatsAvailable,
        seatsBooked: seatUpdate.seatsBooked,
      },
    });
  } catch (err) {
    console.error("downloadGroupTourConfirmItinerary error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}








export async function downloadFixedTourReferralItinerary(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      fixedTourId,
      fixedTourName,
      nextDateRaw,
      nextTimeRaw,
      discountAmount = 0,
    } = req.body || {};

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }
    if (!mongoose.isValidObjectId(fixedTourId)) {
      return res.status(400).json({ message: "Invalid fixedTourId" });
    }

    // referral: date + time required
    if (!nextDateRaw || !nextTimeRaw) {
      return res
        .status(400)
        .json({ message: "nextDateRaw and nextTimeRaw are required" });
    }

    const exec = await Executive.findById(executiveId)
      .select("_id name")
      .lean();
    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ message: "Client not found or not managed by this executive" });
    }

    const tour = await FixedTour.findById(fixedTourId).lean();
    if (!tour) {
      return res.status(404).json({ message: "Fixed tour not found" });
    }
    const pax = Number(client?.numberOfPersons || 0);
    const paxKey = String(pax);

    
    const totalCost = Number(tour?.itineraryPrices?.[paxKey])
    const disc = Number(discountAmount || 0);
    const tName = tour?.tourName || fixedTourName || "Fixed Tour";

    const reasonLabel =
  disc > 0
    ? `Referral itinerary of Fixed Tour (${tName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
    : `Referral itinerary of Fixed Tour (${tName}) having itinerary amount (${totalCost}) sent without any discount`;


    const ist = getIstNow();
    const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

    const statusEntry = {
      status: "Detail Sent",
      value: 3,
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      tourType: "Fixed Tour",
      tourId: tour._id,
      reasonLabel,
    };

    if (!Array.isArray(client.statusUpdatedByExecutive)) {
      client.statusUpdatedByExecutive = [];
    }
    client.statusUpdatedByExecutive.push(statusEntry);

    const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
    if (!scheduledDateObj) {
      return res
        .status(400)
        .json({ message: "Invalid date/time for scheduled follow-up" });
    }

    const scheduleEntry = {
      status: "Detail Sent",
      reasonLabel: "Fixed Tour Referral Itinerary Sent",
      scheduledDate: scheduledDateObj,
      scheduledTimeRaw: nextTimeRaw,
      scheduledDateTimeReadable: null,
      executiveId: exec._id,
      executiveName: exec.name || null,
      createdAt: ist,
      createdAtISO: ist.toISOString(),
      tourType: "Fixed Tour",
      tourId: tour._id,
    };

    if (!Array.isArray(client.ScheduleDatesByExecutives)) {
      client.ScheduleDatesByExecutives = [];
    }
    client.ScheduleDatesByExecutives.push(scheduleEntry);

    await client.save();

    return res.json({
      message: "Fixed tour referral itinerary status saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("downloadFixedTourReferralItinerary error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function downloadFixedTourConfirmItinerary(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      fixedTourId,
      fixedTourName,
      nextDateRaw,
      nextTimeRaw,
      discountAmount = 0,
    } = req.body || {};

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }
    if (!mongoose.isValidObjectId(fixedTourId)) {
      return res.status(400).json({ message: "Invalid fixedTourId" });
    }

    const exec = await Executive.findById(executiveId)
      .select("_id name")
      .lean();
    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ message: "Client not found or not managed by this executive" });
    }

    const tour = await FixedTour.findById(fixedTourId).lean();
    if (!tour) {
      return res.status(404).json({ message: "Fixed tour not found" });
    }
    const pax = Number(client?.numberOfPersons || 0);
    const paxKey = String(pax);

    const totalCost = Number(tour?.itineraryPrices?.[paxKey])
    const disc = Number(discountAmount || 0);
    const tName = tour?.tourName || fixedTourName || "Fixed Tour";

   const reasonLabel =
  disc > 0
    ? `Confirm itinerary of Fixed Tour (${tName}) having itinerary amount (${totalCost}) sent with discount (${disc})`
    : `Confirm itinerary of Fixed Tour (${tName}) having itinerary amount (${totalCost}) sent without any discount`;


    const ist = getIstNow();
    const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

    const statusEntry = {
      status: "Confirmed",
      value: 6,
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      tourType: "Fixed Tour",
      tourId: tour._id,
      reasonLabel,
    };

    if (!Array.isArray(client.statusUpdatedByExecutive)) {
      client.statusUpdatedByExecutive = [];
    }
    client.statusUpdatedByExecutive.push(statusEntry);

    let scheduleEntry = null;
    if (nextDateRaw && nextTimeRaw) {
      const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
      if (scheduledDateObj) {
        scheduleEntry = {
          status: "Confirmed",
          reasonLabel: "Fixed Tour Confirmed",
          scheduledDate: scheduledDateObj,
          scheduledTimeRaw: nextTimeRaw,
          scheduledDateTimeReadable: null,
          executiveId: exec._id,
          executiveName: exec.name || null,
          createdAt: ist,
          createdAtISO: ist.toISOString(),
          tourType: "Fixed Tour",
          tourId: tour._id,
        };

        if (!Array.isArray(client.ScheduleDatesByExecutives)) {
          client.ScheduleDatesByExecutives = [];
        }
        client.ScheduleDatesByExecutives.push(scheduleEntry);
      }
    }

    await client.save();

    return res.json({
      message: "Fixed tour confirmed itinerary status saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("downloadFixedTourConfirmItinerary error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
function inRange(dayDate, from, to) {
  if (!dayDate || !from || !to) return false;
  const d = new Date(dayDate).getTime();
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return d >= f && d <= t;
}

async function getScope(req) {
  // If your verifyExecutive already attaches these, use them directly.
  // else fallback to Executive lookup.
  if (req.companyId && req.purchaserId) {
    return {
      companyId: req.companyId,
      purchaserId: req.purchaserId,
      executiveId: req.userId,
    };
  }

  const executive = await Executive.findById(req.userId).lean();
  if (!executive) return null;

  // adapt field names to your Executive schema
  return {
    executiveId: req.userId,
    companyId: executive.company || executive.companyId,
    purchaserId: executive.purchaser || executive.purchaserId, // if exists
  };
}

/* =======================
   LOCATION LISTS
======================= */

export const getCountries = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    // If you store purchaser on Country, prefer purchaserId.
    // Else filter by company.
    const q = scope.purchaserId
      ? { purchaser: scope.purchaserId }
      : { company: scope.companyId };

    const countries = await Country.find(q)
      .select("_id name")
      .sort({ name: 1 });
    res.status(200).json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStatesByCountry = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const countryId = req.params.countryId;
    const q = scope.purchaserId
      ? { purchaser: scope.purchaserId, country: countryId }
      : { company: scope.companyId, country: countryId };

    const states = await State.find(q).select("_id name").sort({ name: 1 });
    res.status(200).json(states);
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDestinationsByCountryAndState = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const { countryId, stateId } = req.params;

    const q = scope.purchaserId
      ? {
          purchaser: scope.purchaserId,
          company: scope.companyId,
          country: countryId,
          state: stateId,
          activeStatus: true,
        }
      : {
          company: scope.companyId,
          country: countryId,
          state: stateId,
          activeStatus: true,
        };

    const destinations = await Destination.find(q)
      .select("_id name activeStatus")
      .sort({ name: 1 });
    res.status(200).json(destinations);
  } catch (err) {
    console.error("Error fetching destinations:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching destinations" });
  }
};

export const getTripsByLocation = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const { countryId, stateId, destinationId } = req.params;

    const q = scope.purchaserId
      ? {
          purchaser: scope.purchaserId,
          company: scope.companyId,
          country: countryId,
          state: stateId,
          destination: destinationId,
          activeStatus: true,
        }
      : {
          company: scope.companyId,
          country: countryId,
          state: stateId,
          destination: destinationId,
          activeStatus: true,
        };

    const trips = await Trip.find(q)
      .select("_id tripName activeStatus")
      .sort({ tripName: 1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

export const getTripDetails = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const { tripId } = req.params;

    const qAddon = scope.purchaserId
      ? {
          purchaser: scope.purchaserId,
          trip: tripId,
          activeStatus: { $ne: false },
        }
      : { trip: tripId, activeStatus: { $ne: false } };

    const addonTrips = await AddOnTrip.find(qAddon).select("_id addontripName");

    const formattedAddons = addonTrips.map((trip) => ({
      _id: trip._id,
      tripName: trip.addontripName,
    }));

    const qAct = scope.purchaserId
      ? {
          purchaser: scope.purchaserId,
          trip: tripId,
          activeStatus: { $ne: false },
        }
      : { trip: tripId, activeStatus: { $ne: false } };

    const rawActivities = await Activity.find(qAct)
      .populate("vendor", "activeStatus")
      .lean();

    const filteredActivities = rawActivities.filter(
      (act) => act.vendor && act.vendor.activeStatus !== false
    );

    const formattedActivities = filteredActivities.map((act) => ({
      _id: act._id,
      tripName: act.activityName,
    }));

    return res.json({
      addonTrips: formattedAddons,
      activities: formattedActivities,
    });
  } catch (err) {
    console.error("Error in getTripDetails:", err.message);
    res
      .status(500)
      .json({ message: "Server error while fetching trip details." });
  }
};

/* =======================
   PRICING ENDPOINTS
======================= */

export const getTripVehiclesForDate = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const { tripId } = req.params;
    const { date } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ message: "date query (YYYY-MM-DD) is required" });
    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    const tripQ = scope.purchaserId
      ? { _id: tripId, purchaser: scope.purchaserId }
      : { _id: tripId };
    const trip = await Trip.findOne(tripQ)
      .populate({
        path: "vehicles.vehicle",
        select: "vehicle percentage activeStatus advancePercentage",
      })
      .populate({ path: "vehicles.vendor", select: "activeStatus" })
      .lean();

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const byCategory = {};

    for (const row of trip.vehicles || []) {
      const vehDoc = row.vehicle;
      const vendorDoc = row.vendor;

      if (!vehDoc || vehDoc.activeStatus === false) continue;
      if (!vendorDoc || vendorDoc.activeStatus === false) continue;

      const match = (row.prices || []).find((p) =>
        inRange(dayDate, p.validFrom, p.validTo)
      );
      if (!match) continue;
     const advancePct = Number(vehDoc?.advancePercentage || 0);
      const basePrice = Number(match.price || 0);
      const advanceUnit = Math.round((basePrice * advancePct) / 100)
      const entry = {
        vehicleId: vehDoc?._id,
        vehicleName: vehDoc?.vehicle,
        percentage: Number(vehDoc?.percentage ?? 0),
        basePrice,
        vendor: vendorDoc?._id || null,
        advancePercentage: advancePct,
        advanceUnit,
      };

      if (!byCategory[row.category]) byCategory[row.category] = [];
      byCategory[row.category].push(entry);
    }

    return res.status(200).json({
      tripId,
      date,
      categories: Object.keys(byCategory),
      options: byCategory,
    });
  } catch (err) {
    console.error("getTripVehiclesForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching trip vehicles." });
  }
};

export const getAddonTripVehiclesForDate = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const { addonTripId } = req.params;
    const { date } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ message: "date query (YYYY-MM-DD) is required" });
    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    const addonQ = scope.purchaserId
      ? { _id: addonTripId, purchaser: scope.purchaserId }
      : { _id: addonTripId };

    const addon = await AddOnTrip.findOne(addonQ)
      .populate({
        path: "vehicles.vehicle",
        select: "vehicle percentage activeStatus advancePercentage",
      })
      .populate({ path: "vehicles.vendor", select: "activeStatus" })
      .lean();

    if (!addon)
      return res.status(404).json({ message: "Add-on trip not found" });

    const byCategory = {};

    for (const row of addon.vehicles || []) {
      const vehDoc = row.vehicle;
      const vendorDoc = row.vendor;

      if (!vehDoc || vehDoc.activeStatus === false) continue;
      if (!vendorDoc || vendorDoc.activeStatus === false) continue;

      const matched = (row.prices || []).find((p) =>
        inRange(dayDate, p.validFrom, p.validTo)
      );
      if (!matched) continue;
       const advancePct = Number(vehDoc?.advancePercentage || 0);
      const basePrice = Number(matched.price || 0);
      const advanceUnit = Math.round((basePrice * advancePct) / 100)

      const entry = {
        vehicleId: vehDoc?._id,
        vehicleName: vehDoc?.vehicle,
        percentage: Number(vehDoc?.percentage ?? 0),
        basePrice,
        vendor: vendorDoc?._id || null,
        advancePercentage: advancePct,
        advanceUnit,
      };

      if (!byCategory[row.category]) byCategory[row.category] = [];
      byCategory[row.category].push(entry);
    }

    return res.status(200).json({
      addonTripId,
      date,
      categories: Object.keys(byCategory),
      options: byCategory,
    });
  } catch (err) {
    console.error("getAddonTripVehiclesForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching add-on vehicles." });
  }
};

export const getTripFoodsForDate = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const { tripId } = req.params;
    const { date } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ message: "date query (YYYY-MM-DD) is required" });
    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    const foodQ = scope.purchaserId
      ? {
          trip: tripId,
          purchaser: scope.purchaserId,
          activeStatus: { $ne: false },
        }
      : { trip: tripId, activeStatus: { $ne: false } };

    const foodDoc = await Food.findOne(foodQ)
      .populate("rows.vendor", "name activeStatus")
      .lean();

    if (!foodDoc) {
      return res.status(200).json({
        tripId,
        date,
        categories: [],
        typesByCategory: {},
        options: {},
      });
    }

    const byCategoryType = {};
    const categoriesSet = new Set();
    const typesByCategory = {};

    for (const row of foodDoc.rows || []) {
      const vendorDoc = row.vendor;
      if (!vendorDoc || vendorDoc.activeStatus === false) continue;

      const match = (row.prices || []).find((p) =>
        inRange(dayDate, p.validFrom, p.validTo)
      );
      if (!match) continue;
     const advancePct = Number(
  match?.advancePercentage ?? row?.advancePercentage ?? 0
);
const advanceUnit = Math.round((Number(match.price || 0) * advancePct) / 100);
      const item = {
        foodName: row.foodName,
        description: row.description || "",
        price: Number(match.price || 0),
        percent: Number(match.percent || 0),
        itineraryPrice: Number(match.itineraryPrice || 0),
        vendor: vendorDoc?._id || null,
        vendorName: vendorDoc?.name || "",
        advancePercentage: advancePct,
        advanceUnit,
      };

      const catKey = row.mealCategory || "Uncategorized";
      const mealType = row.mealType || "Other";

      categoriesSet.add(catKey);

      if (!byCategoryType[catKey]) byCategoryType[catKey] = {};
      if (!byCategoryType[catKey][mealType])
        byCategoryType[catKey][mealType] = [];
      byCategoryType[catKey][mealType].push(item);
    }

    for (const cat of Object.keys(byCategoryType)) {
      typesByCategory[cat] = Object.keys(byCategoryType[cat]);
    }

    return res.status(200).json({
      tripId,
      date,
      categories: Array.from(categoriesSet),
      typesByCategory,
      options: byCategoryType,
    });
  } catch (err) {
    console.error("getTripFoodsForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching trip foods." });
  }
};

export const getActivitiesPricingForDate = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const { ids, date } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ message: "date query (YYYY-MM-DD) is required" });
    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    if (!ids)
      return res.status(400).json({
        message: "ids query is required (comma separated activity ids)",
      });
    const idList = ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!idList.length)
      return res.status(400).json({ message: "No valid ids provided" });

    const actsQ = scope.purchaserId
      ? {
          _id: { $in: idList },
          purchaser: scope.purchaserId,
          activeStatus: { $ne: false },
        }
      : { _id: { $in: idList }, activeStatus: { $ne: false } };

    const acts = await Activity.find(actsQ).populate("vendor", "name").lean();

    const items = [];
    for (const a of acts) {
      const match = (a.prices || []).find((p) =>
        inRange(dayDate, p.validFrom, p.validTo)
      );
      if (!match) continue;

      const base = Number(match.price || 0);
      const perc = Number(match.percentage || 0);
      const itin =
        match.itineraryPrice != null && !isNaN(match.itineraryPrice)
          ? Number(match.itineraryPrice)
          : Math.round(base * (1 + perc / 100));
       const advancePct = Number(
  match?.advancePercentage ?? a?.advancePercentage ?? 0
);
const advanceUnit = Math.round((base * advancePct) / 100);
      items.push({
        activityId: String(a._id),
        activityName: a.activityName,
        price: base,
        percentage: perc,
        itineraryPrice: itin,
        vendorId: a.vendor?._id || null,
        vendorName: a.vendor?.name || "",
        advancePercentage: advancePct,
        advanceUnit,
      });
    }

    return res.status(200).json({ date, items });
  } catch (err) {
    console.error("getActivitiesPricingForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching activities pricing." });
  }
};

export const getAccommodationsPricingForDate = async (req, res) => {
  try {
    const scope = await getScope(req);
    if (!scope?.companyId)
      return res.status(404).json({ message: "Unauthorized" });

    const { destinationId, date } = req.query;

    if (!destinationId)
      return res.status(400).json({ message: "destinationId is required" });
    if (!date)
      return res.status(400).json({ message: "date (YYYY-MM-DD) is required" });

    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    const accQ = scope.purchaserId
      ? {
          destination: destinationId,
          purchaserId: scope.purchaserId,
          status: "Active",
        }
      : { destination: destinationId, status: "Active" };

    const accs = await Accommodation.find(accQ)
      .populate("vendor", "name activeStatus")
      .lean();

    const ROOM_KEYS = [
      "2BEDEP",
      "2BEDCP",
      "2BEDMAP",
      "3BEDEP",
      "3BEDCP",
      "3BEDMAP",
      "4BEDEP",
      "4BEDCP",
      "4BEDMAP",
      "EXTRABEDEP",
      "EXTRABEDCP",
      "EXTRABEDMAP",
      "FRESHUP",
      "EARLYCHECKIN",
      "LATECHECKOUT",
    ];

    const items = [];

    for (const a of accs) {
      const vendorDoc = a.vendor;
      if (!vendorDoc || vendorDoc.activeStatus === false) continue;

      const baseSection = (a.formSections || []).find((ps) =>
        inRange(dayDate, ps?.validFrom, ps?.validTo)
      );
      const commSection = (a.formSectionsWithCommission || []).find((ps) =>
        inRange(dayDate, ps?.validFrom, ps?.validTo)
      );
      if (!baseSection || !commSection) continue;

      const roomTypes = [];
      for (const key of ROOM_KEYS) {
        const boVal = Number(baseSection[key] ?? 0);
        const itinVal = Number(commSection[key] ?? 0);
        if (!Number.isFinite(boVal) || boVal <= 0) continue;

        roomTypes.push({
          code: key,
          label: key,
          bo: boVal,
          itinerary: Number.isFinite(itinVal)
            ? itinVal
            : Math.round(
                boVal * (1 + Number(baseSection.commission || 0) / 100)
              ),
        });
      }

      if (!roomTypes.length) continue;
      const advancePct = Number(
  baseSection?.advancePercentage ?? a?.advancePercentage ?? 0
);
      items.push({
        accommodationId: String(a._id),
        propertyName: a.propertyName,
        hotelCategory: a.hotelCategory || "",
        roomCategory: a.roomCategory || "",
        vendorId: vendorDoc?._id || null,
        vendorName: vendorDoc?.name || "",
        commission: Number(baseSection.commission || 0),
        advancePercentage: advancePct,
        roomTypes,
      });
    }

    return res.status(200).json({ destinationId, date, properties: items });
  } catch (err) {
    console.error("getAccommodationsPricingForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching accommodations pricing." });
  }
};

export async function getCustomTourPointDiscountOptions(req, res) {
  try {
    const executiveId = req.userId;
    const { clientId } = req.query || {};

    if (!executiveId) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(executiveId))
      return res.status(400).json({ message: "Invalid executiveId" });

    // clientId is optional here (you asked for it). Validate if you want:
    if (clientId && !mongoose.isValidObjectId(clientId))
      return res.status(400).json({ message: "Invalid clientId" });

    const exec = await Executive.findById(executiveId)
      .select("_id pointPercentage discountPercentage") // ✅ adjust if your field names differ
      .lean();

    if (!exec) return res.status(404).json({ message: "Executive not found" });

    return res.json({
      pointPercentage: Number(exec.pointPercentage || 0),
      discountPercentage: Number(exec.discountPercentage || 0),
    });
  } catch (err) {
    console.error("getCustomTourPointDiscountOptions error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function downloadCustomTourReferralItinerary(req, res) {
  try {
    const executiveId = req.userId;
    const { clientId, 
      nextDateRaw,
       nextTimeRaw,
       discountAmount = 0,
       totals = {}
       } = req.body || {};

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    // date & time MANDATORY in referral case
    if (!nextDateRaw || !nextTimeRaw) {
      return res
        .status(400)
        .json({ message: "nextDateRaw and nextTimeRaw are required" });
    }

    const exec = await Executive.findById(executiveId)
      .select("_id name")
      .lean();
    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ message: "Client not found or not managed by this executive" });
    }

    const ist = getIstNow();
    const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);
    const itineraryAmount = Number(totals?.grandItinerary || 0);
    const disc = Number(discountAmount || 0);
    const reasonLabel =
  disc > 0
    ? `Referral itinerary of Custom Tour having itinerary amount (${itineraryAmount}) sent with discount (${disc})`
    : `Referral itinerary of Custom Tour having itinerary amount (${itineraryAmount}) sent without any discount`;

    const statusEntry = {
      status: "Detail Sent",
      value: 3, // bucket "detail-sent"
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      tourType: "Custom Tour",
      // ⬇️ no tourId here
      reasonLabel,
    };

    if (!Array.isArray(client.statusUpdatedByExecutive)) {
      client.statusUpdatedByExecutive = [];
    }
    client.statusUpdatedByExecutive.push(statusEntry);

    const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
    if (!scheduledDateObj) {
      return res
        .status(400)
        .json({ message: "Invalid date/time for scheduled follow-up" });
    }

    const scheduleEntry = {
      status: "Detail Sent",
      reasonLabel: "Custom Tour Referral Itinerary Sent",
      scheduledDate: scheduledDateObj,
      scheduledTimeRaw: nextTimeRaw,
      scheduledDateTimeReadable: null, // optional; you can fill pretty text
      executiveId: exec._id,
      executiveName: exec.name || null,
      createdAt: ist,
      createdAtISO: ist.toISOString(),
      tourType: "Custom Tour",
      // ⬇️ no tourId here
    };

    if (!Array.isArray(client.ScheduleDatesByExecutives)) {
      client.ScheduleDatesByExecutives = [];
    }
    client.ScheduleDatesByExecutives.push(scheduleEntry);

    await client.save();

    return res.json({
      message: "Custom tour referral itinerary status saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("downloadCustomTourReferralItinerary error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function downloadCustomTourConfirmItinerary(req, res) {
  try {
    const executiveId = req.userId;
    const { clientId,
       nextDateRaw,
        nextTimeRaw,
        discountAmount = 0,
        totals = {}
       } = req.body || {};

    if (!executiveId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!mongoose.isValidObjectId(executiveId)) {
      return res.status(400).json({ message: "Invalid executiveId" });
    }
    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    const exec = await Executive.findById(executiveId)
      .select("_id name")
      .lean();
    if (!exec) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ message: "Client not found or not managed by this executive" });
    }

    const ist = getIstNow();
    const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);
    const itineraryAmount = Number(totals?.grandItinerary || 0);
    const disc = Number(discountAmount || 0);
    const reasonLabel =
  disc > 0
    ? `Confirmed itinerary of Custom Tour having itinerary amount (${itineraryAmount}) sent with discount (${disc})`
    : `Confirmed itinerary of Custom Tour having itinerary amount (${itineraryAmount}) sent without any discount`;

    const statusEntry = {
      status: "Confirmed",
      value: 6, // bucket "confirmed"
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      tourType: "Custom Tour",
      // ⬇️ no tourId
      reasonLabel,
    };

    if (!Array.isArray(client.statusUpdatedByExecutive)) {
      client.statusUpdatedByExecutive = [];
    }
    client.statusUpdatedByExecutive.push(statusEntry);

    // date/time OPTIONAL for confirm
    let scheduleEntry = null;
    if (nextDateRaw && nextTimeRaw) {
      const scheduledDateObj = buildScheduledDate(nextDateRaw, nextTimeRaw);
      if (scheduledDateObj) {
        scheduleEntry = {
          status: "Confirmed",
          reasonLabel: "Custom Tour Confirmed",
          scheduledDate: scheduledDateObj,
          scheduledTimeRaw: nextTimeRaw,
          scheduledDateTimeReadable: null,
          executiveId: exec._id,
          executiveName: exec.name || null,
          createdAt: ist,
          createdAtISO: ist.toISOString(),
          tourType: "Custom Tour",
          // ⬇️ no tourId
        };

        if (!Array.isArray(client.ScheduleDatesByExecutives)) {
          client.ScheduleDatesByExecutives = [];
        }
        client.ScheduleDatesByExecutives.push(scheduleEntry);
      }
    }

    await client.save();

    return res.json({
      message: "Custom tour confirmed itinerary status saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("downloadCustomTourConfirmItinerary error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getDestinationsForClientCompany(req, res) {
  try {
    const { clientId } = req.params;

    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    // 1) Find client → get companyId
    const client = await Client.findById(clientId).select("companyId").lean();
    if (!client?.companyId) {
      return res.status(404).json({ message: "Client/company not found" });
    }

    // 2) Fetch destinations for that company (active only)
    const dests = await Destination.find({
      company: client.companyId, // ✅ correct field
      activeStatus: true, // ✅ only active
    })
      .select("_id name") // ✅ correct field
      .sort({ name: 1 })
      .lean();

    // 3) Convert to react-select option structure
    const destinations = dests.map((d) => ({
      _id: d._id,
      value: d.name,
      label: d.name,
    }));

    return res.json({ destinations });
  } catch (err) {
    console.error("getDestinationsForClientCompany error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
