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
import mongoose from "mongoose";
import Client from "../models/clientModel.js";
import Executive from "../models/executiveModel.js";
import Destination from "../models/destinationModel.js";
import GroupTour from "../models/groupTourModel.js";
import FixedTour from "../models/fixedTourModel.js";

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
      return res.status(404).json({ message: "Client not found or not managed by this executive" });
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
    if (!ExecutiveId)
      return res.status(401).json({ message: "Unauthorized" });

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
      nextDateRaw,              // "YYYY-MM-DD"
      nextTimeRaw,              // "HH:MM"
      nextDateISO,              // ISO string or null
      nextDateReadable,         // "23 Nov 2025"
      nextDateTimeReadable,     // "23 Nov 2025, 10:30 AM"
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
    const todayTimeStr = `${hh}:${min}`;        // "15:22"

    /* ============================
       2) Push statusUpdatedByExecutive entry
    ============================ */

    const statusEntry = {
      status: "Not Answered",
      value: 2,
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,              // "dd/mm/yyyy"
      time: todayTimeStr,              // "HH:MM"
      createdAt: ist,                  // proper Date object
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
      scheduledDate: scheduledDateObj,      // proper Date object
      scheduledTimeRaw: nextTimeRaw,        // "HH:MM"
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
      status,               // should be "not_reachable"
      reasonId,
      reasonLabel,
      nextDateRaw,          // "YYYY-MM-DD"
      nextTimeRaw,          // "HH:MM"
      nextDateISO,          // ISO string or null
      nextDateReadable,     // "23 Nov 2025" (not used now but okay to accept)
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
    const todayTimeStr = `${hh}:${min}`;        // "HH:MM"

    // 2) Push statusUpdatedByExecutive entry
    const statusEntry = {
      status: "Not Reachable", // 👈 HUMAN LABEL
      value: 1,                // 👈 THIS IS IMPORTANT FOR BUCKET: "not-reachable"
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
      status,               // should be "not_interested"
      reasonId,
      reasonLabel,
      nextDateRaw,          // "YYYY-MM-DD"
      nextTimeRaw,          // "HH:MM"
      nextDateISO,          // ISO string or null
      nextDateReadable,     // e.g. "23 Nov 2025" (optional but ok)
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
    const todayTimeStr = `${hh}:${min}`;        // "HH:MM"

    /* ============================
       2) Push statusUpdatedByExecutive entry
    ============================ */

    const statusEntry = {
      status: "Not Interested", // 👈 HUMAN LABEL
      value: 5,                 // 👈 BUCKET: "not-interested"
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
      status: "Not Interested",                 // 👈 YOUR REQUIREMENT
      reasonLabel,
      scheduledDate: scheduledDateObj,         // proper Date object
      scheduledTimeRaw: nextTimeRaw,           // "HH:MM"
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


function parsePagination(pageRaw, limitRaw) {
  const page = Math.max(1, parseInt(pageRaw, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(limitRaw, 10) || 10)); // max 50
  return { page, limit };
}

// ===============================
// GROUP TOURS FOR CLIENT
// ===============================
export async function getClientGroupTours(req, res) {
  console.log(1)
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
      GroupTour.countDocuments(query),
      GroupTour.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("destination", "name")
        .lean(),
    ]);
 console.log(2)
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
console.log(3)
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
    todayTimeStr: `${hh}:${min}`,        // "HH:MM"
  };
}

function buildScheduledDate(nextDateRaw, nextTimeRaw) {
  if (!nextDateRaw || !nextTimeRaw) return null;
  const combined = `${nextDateRaw}T${nextTimeRaw || "00:00"}:00`;
  const d = new Date(combined);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}


export async function downloadGroupTourReferralItinerary(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      groupTourId,
      groupTourName,
      nextDateRaw,
      nextTimeRaw,
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
    if (!mongoose.isValidObjectId(groupTourId)) {
      return res.status(400).json({ message: "Invalid groupTourId" });
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

    const tour = await GroupTour.findById(groupTourId).lean();
    if (!tour) {
      return res.status(404).json({ message: "Group tour not found" });
    }

    const ist = getIstNow();
    const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

    const statusEntry = {
      status: "Detail Sent",
      value: 3, // bucket "detail-sent"
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      tourType: "Group Tour",
      tourId: tour._id,
      reasonLabel: "Group Tour Referral Itinerary Sent",
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
      reasonLabel: "Group Tour Referral Itinerary Sent",
      scheduledDate: scheduledDateObj,
      scheduledTimeRaw: nextTimeRaw,
      scheduledDateTimeReadable: null, // optional; generate if you want
      executiveId: exec._id,
      executiveName: exec.name || null,
      createdAt: ist,
      createdAtISO: ist.toISOString(),
      tourType: "Group Tour",
      tourId: tour._id,
    };

    if (!Array.isArray(client.ScheduleDatesByExecutives)) {
      client.ScheduleDatesByExecutives = [];
    }
    client.ScheduleDatesByExecutives.push(scheduleEntry);

    await client.save();

    // TODO: generate & stream actual PDF referral itinerary if needed.
    return res.json({
      message: "Group tour referral itinerary status saved",
      statusEntry,
      scheduleEntry,
    });
  } catch (err) {
    console.error("downloadGroupTourReferralItinerary error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function downloadGroupTourConfirmItinerary(req, res) {
  try {
    const executiveId = req.userId;
    const {
      clientId,
      groupTourId,
      groupTourName,
      nextDateRaw,
      nextTimeRaw,
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
    if (!mongoose.isValidObjectId(groupTourId)) {
      return res.status(400).json({ message: "Invalid groupTourId" });
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

    const tour = await GroupTour.findById(groupTourId).lean();
    if (!tour) {
      return res.status(404).json({ message: "Group tour not found" });
    }

    const ist = getIstNow();
    const { todayDateStr, todayTimeStr } = formatIstDateTime(ist);

    const statusEntry = {
      status: "Confirmed",
      value: 6, // bucket "confirmed"
      executiveId: exec._id,
      executiveName: exec.name || null,
      date: todayDateStr,
      time: todayTimeStr,
      createdAt: ist,
      tourType: "Group Tour",
      tourId: tour._id,
      reasonLabel: "Group Tour Confirmed",
    };

    if (!Array.isArray(client.statusUpdatedByExecutive)) {
      client.statusUpdatedByExecutive = [];
    }
    client.statusUpdatedByExecutive.push(statusEntry);

    // date/time OPTIONAL
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

        if (!Array.isArray(client.ScheduleDatesByExecutives)) {
          client.ScheduleDatesByExecutives = [];
        }
        client.ScheduleDatesByExecutives.push(scheduleEntry);
      }
    }

    await client.save();

    // TODO: generate & stream actual confirmed itinerary PDF
    return res.json({
      message: "Group tour confirmed itinerary status saved",
      statusEntry,
      scheduleEntry,
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
      reasonLabel: "Fixed Tour Referral Itinerary Sent",
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
      reasonLabel: "Fixed Tour Confirmed",
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

export async function downloadCustomTourReferralItinerary(req, res) {
  try {
    const executiveId = req.userId;
    const { clientId, nextDateRaw, nextTimeRaw } = req.body || {};

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
      reasonLabel: "Custom Tour Referral Itinerary Sent",
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
    const { clientId, nextDateRaw, nextTimeRaw } = req.body || {};

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
      reasonLabel: "Custom Tour Confirmed",
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
