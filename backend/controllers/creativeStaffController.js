import mongoose from "mongoose";
import AdRequest from "../models/adRequestModel.js";
import LeadRequest from "../models/leadRequestModel.js";
import UploadRequest from "../models/uploadRequestModel.js";
import CreativeStaff from "../models/creativeStaffModel.js";
import Destination from "../models/destinationModel.js";
import AdAssignment from "../models/adAssignmentModel.js";
import LeadAssignment from "../models/LeadAssignmentModel.js";
import UploadAssignment from "../models/uploadAssignmentModel.js";

// Safety helper: ensure this request is assigned to the CS of this user
async function guardAssignedToCS(req, adId) {
  const cs = await CreativeStaff.findById(req.userId).select("_id company");
  if (!cs) return { error: { code: 401, msg: "You are not authorised" } };

  const doc = await AdRequest.findOne({
    _id: adId,
    company: cs.company, // same company
    assignedCreativeStaff: cs._id, // assigned to this CS
    status: "approved", // only approved requests should show here
  })
    .populate({ path: "destination", select: "name" })
    .lean();

  if (!doc) return { error: { code: 404, msg: "Ad request not found" } };
  return { cs, doc };
}

// GET /creativeStaff/ad-requests

export async function listCreativeAdRequests(req, res) {
  try {
    const cs = await CreativeStaff.findById(req.userId).select("_id company");
    if (!cs) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      task,
      deadlineDate,       // yyyy-mm-dd (matches approvedDate OR date)
      rescheduledDate,    // yyyy-mm-dd (matches any resheduledatewithreason.date)
      status,             // ONLY: "pending" | "waiting"
      toggled,            // NEW: "true" => filter togglestatus=true
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: cs.company,
      status: "approved",
      assignedCreativeStaff: cs._id,
    };

    if (destinationId && mongoose.isValidObjectId(destinationId)) {
      filter.destination = destinationId;
    }

    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    if (task) filter.task = task;

    // Deadline date (approvedDate || date)
    if (deadlineDate) {
      const d = new Date(deadlineDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedDate: { $gte: start, $lte: end } },
          { $and: [{ approvedDate: null }, { date: { $gte: start, $lte: end } }] },
        ];
      }
    }

    // Rescheduled date
    if (rescheduledDate) {
      const d = new Date(rescheduledDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.resheduledatewithreason = { $elemMatch: { date: { $gte: start, $lte: end } } };
      }
    }

    // Status filter: ONLY pending | waiting (no toggled here)
    if (status === "pending" || status === "waiting" || status === "approved" || status === "rejected") {
      filter.creativeStatus = status;
    }

    // NEW: separate toggled filter (true => only toggled rows)
    if (String(toggled).toLowerCase() === "true") {
      filter.togglestatus = true;
    }

    const [items, total] = await Promise.all([
      AdRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ decidedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdRequest.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      task: r.task,
      date: r.date,
      approvedDate: r.approvedDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus, // include for UI
      lastRescheduledDate:
        r.resheduledatewithreason?.length
          ? r.resheduledatewithreason[r.resheduledatewithreason.length - 1].date
          : null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listCreativeAdRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}



// GET /creativeStaff/ad-requests/:id

export async function getCreativeAdRequest(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const r = guard.doc;
    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      task: r.task,
      date: r.date,
      approvedDate: r.approvedDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      details: r.details || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,            // keep
      fileNames: r.fileNames || [],
      resheduledatewithreason: r.resheduledatewithreason || [],
      creativeRejectionReason: r.creativeRejectionReason || "",
    });
  } catch (e) {
    console.error("getCreativeAdRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// POST /creativeStaff/ad-requests/:id/toggle
// Toggle: pending -> processing, processing -> pending (as per your two statuses for toggle)

// POST /creativeStaff/ad-requests/:id/toggle
// POST /creativeStaff/ad-requests/:id/toggle
export async function toggleCreativeStatus(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const current = !!guard.doc.togglestatus;
    const next = !current;

    const updated = await AdRequest.findByIdAndUpdate(
      id,
      { $set: { togglestatus: next } },
      { new: true, lean: true }
    );

    return res.json({
      message: updated.togglestatus ? "Toggled on" : "Toggled off",
      togglestatus: !!updated.togglestatus,
      creativeStatus: updated.creativeStatus, // unchanged (pending|waiting)
    });
  } catch (e) {
    console.error("toggleCreativeStatus error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}



// POST /creativeStaff/ad-requests/:id/filenames
// Save filenames (array length should match required quantity on the UI)
export async function saveCreativeFilenames(req, res) {
  try {
    const { id } = req.params;
    const { fileNames } = req.body || {}; // array of strings
    if (!Array.isArray(fileNames))
      return res.status(400).json({ message: "fileNames must be an array" });

    const guard = await guardAssignedToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await AdRequest.findByIdAndUpdate(
      id,
      { $set: { fileNames } },
      { new: true, lean: true }
    );

    return res.json({ message: "Saved", fileNames: updated.fileNames || [] });
  } catch (e) {
    console.error("saveCreativeFilenames error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/ad-requests/:id/send-for-approval
// Sets creativeStatus -> waiting
export async function sendCreativeWorkForApproval(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await AdRequest.findByIdAndUpdate(
      id,
      { $set: { creativeStatus: "waiting" } },
      { new: true, lean: true }
    );

    return res.json({ message: "Sent for approval", creativeStatus: updated.creativeStatus });
  } catch (e) {
    console.error("sendCreativeWorkForApproval error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Ensure request belongs to CS' company, is assigned to this CS, and overall is approved
async function guardAssignedLeadToCS(req, leadId) {
  const cs = await CreativeStaff.findById(req.userId).select("_id company");
  if (!cs) return { error: { code: 401, msg: "You are not authorised" } };

  const doc = await LeadRequest.findOne({
    _id: leadId,
    company: cs.company,
    assignedCreativeStaff: cs._id,
    status: "approved",
  })
    .populate({ path: "destination", select: "name" })
    .lean();

  if (!doc) return { error: { code: 404, msg: "Lead request not found" } };
  return { cs, doc };
}

// GET /creativeStaff/lead-requests
export async function listCreativeLeadRequests(req, res) {
  try {
    const cs = await CreativeStaff.findById(req.userId).select("_id company");
    if (!cs) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      frequency,
      startDate,        // yyyy-mm-dd — match approvedStartDate || startDate (like "deadline" on AdRequest)
      rescheduledDate,  // yyyy-mm-dd — any resheduledatewithreason.date
      status,           // creativeStatus: "pending" | "waiting"
      toggled,          // "true" => togglestatus=true
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: cs.company,
      status: "approved",
      assignedCreativeStaff: cs._id,
    };

    if (destinationId && mongoose.isValidObjectId(destinationId)) {
      filter.destination = destinationId;
    }

    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    // Prefer approvedFrequency when present; otherwise use original frequency
if (frequency) {
  const freqClause = {
    $or: [
      { approvedFrequency: frequency },
      { $and: [{ approvedFrequency: null }, { frequency }] },
    ],
  };
  // Combine safely with any existing conditions (including your startDate $or)
  filter.$and = filter.$and ? [...filter.$and, freqClause] : [freqClause];
}


    // Start date filter — approvedStartDate in range OR (no approvedStartDate and startDate in range)
    if (startDate) {
      const d = new Date(startDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedStartDate: { $gte: start, $lte: end } },
          { $and: [{ approvedStartDate: null }, { startDate: { $gte: start, $lte: end } }] },
        ];
      }
    }

    if (rescheduledDate) {
      const d = new Date(rescheduledDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.resheduledatewithreason = { $elemMatch: { date: { $gte: start, $lte: end } } };
      }
    }

    // creativeStatus filter: ONLY pending | waiting
    if (["pending", "waiting", "approved", "rejected"].includes(status)) {
  filter.creativeStatus = status;
}

    // Only toggled
    if (String(toggled).toLowerCase() === "true") {
      filter.togglestatus = true;
    }

    const [items, total] = await Promise.all([
      LeadRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ decidedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadRequest.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef || "—",
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.frequency,
      approvedFrequency: r.approvedFrequency ?? null,
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      lastRescheduledDate:
        r.resheduledatewithreason?.length
          ? r.resheduledatewithreason[r.resheduledatewithreason.length - 1].date
          : null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listCreativeLeadRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /creativeStaff/lead-requests/:id
export async function getCreativeLeadRequest(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedLeadToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const r = guard.doc;
    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef || "—",
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.frequency,
      approvedFrequency: r.approvedFrequency ?? null,
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      fileNames: r.fileNames || [],
      resheduledatewithreason: r.resheduledatewithreason || [],
      creativeRejectionReason: r.creativeRejectionReason || "",
    });
  } catch (e) {
    console.error("getCreativeLeadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/lead-requests/:id/toggle
export async function toggleLeadToggled(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedLeadToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const current = !!guard.doc.togglestatus;
    const next = !current;

    const updated = await LeadRequest.findByIdAndUpdate(
      id,
      { $set: { togglestatus: next } },
      { new: true, lean: true }
    );

    return res.json({
      message: updated.togglestatus ? "Toggled on" : "Toggled off",
      togglestatus: !!updated.togglestatus,
      creativeStatus: updated.creativeStatus,
    });
  } catch (e) {
    console.error("toggleLeadToggled error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/lead-requests/:id/filenames
export async function saveLeadFilenames(req, res) {
  try {
    const { id } = req.params;
    const { fileNames } = req.body || {};
    if (!Array.isArray(fileNames))
      return res.status(400).json({ message: "fileNames must be an array" });

    const guard = await guardAssignedLeadToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await LeadRequest.findByIdAndUpdate(
      id,
      { $set: { fileNames } },
      { new: true, lean: true }
    );

    return res.json({ message: "Saved", fileNames: updated.fileNames || [] });
  } catch (e) {
    console.error("saveLeadFilenames error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/lead-requests/:id/send-for-approval
// Sets creativeStatus -> waiting
export async function sendLeadWorkForApproval(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedLeadToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await LeadRequest.findByIdAndUpdate(
      id,
      { $set: { creativeStatus: "waiting" } },
      { new: true, lean: true }
    );

    return res.json({ message: "Sent for approval", creativeStatus: updated.creativeStatus });
  } catch (e) {
    console.error("sendLeadWorkForApproval error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function guardAssignedUploadToCS(req, uploadId) {
  const cs = await CreativeStaff.findById(req.userId).select("_id company");
  if (!cs) return { error: { code: 401, msg: "You are not authorised" } };

  const doc = await UploadRequest.findOne({
    _id: uploadId,
    company: cs.company,
    assignedCreativeStaff: cs._id,
    status: "approved",
  }).lean();

  if (!doc) return { error: { code: 404, msg: "Upload request not found" } };
  return { cs, doc };
}

// GET /creativeStaff/upload-requests
// Filters:
// - category (exact match)
// - filenameText (regex on filename)
// - deadlineDate (approvedPublishingDate || publishingDate)
// - rescheduledDate (elemMatch)
// - status (creativeStatus: pending|waiting)
// - toggled ("true" => togglestatus=true)
export async function listCreativeUploadRequests(req, res) {
  try {
    const cs = await CreativeStaff.findById(req.userId).select("_id company");
    if (!cs) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      category,
      filenameText,
      deadlineDate,     // yyyy-mm-dd
      rescheduledDate,  // yyyy-mm-dd
      status,           // pending|waiting
      toggled,          // "true" => togglestatus=true
    } = req.query;
    console.log(category)

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: cs.company,
      status: "approved",
      assignedCreativeStaff: cs._id,
    };

    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ...

if (category && category.trim()) {
  const cregex = new RegExp(escapeRegex(category.trim()), "i"); // case-insensitive "contains"
  filter.category = cregex;
}

if (filenameText && filenameText.trim()) {
  const regex = new RegExp(escapeRegex(filenameText.trim()), "i");
  filter.filename = regex;
}

    // Deadline date — treat deadline as approvedPublishingDate || publishingDate
    if (deadlineDate) {
      const d = new Date(deadlineDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedPublishingDate: { $gte: start, $lte: end } },
          { $and: [{ approvedPublishingDate: null }, { publishingDate: { $gte: start, $lte: end } }] },
        ];
      }
    }

    // Rescheduled date — any resheduledatewithreason.date in range
    if (rescheduledDate) {
      const d = new Date(rescheduledDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.resheduledatewithreason = { $elemMatch: { date: { $gte: start, $lte: end } } };
      }
    }

    // creativeStatus filter: ONLY pending | waiting
    if (["pending", "waiting", "approved", "rejected"].includes(status)) {
  filter.creativeStatus = status;
}

    // Only toggled
    if (String(toggled).toLowerCase() === "true") {
      filter.togglestatus = true;
    }

    const [items, total] = await Promise.all([
      UploadRequest.find(filter).sort({ decidedAt: -1 }).skip(skip).limit(limit).lean(),
      UploadRequest.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      approvedPublishingDate: r.approvedPublishingDate || null,
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      lastRescheduledDate:
        r.resheduledatewithreason?.length
          ? r.resheduledatewithreason[r.resheduledatewithreason.length - 1].date
          : null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listCreativeUploadRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /creativeStaff/upload-requests/:id
export async function getCreativeUploadRequest(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedUploadToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const r = guard.doc;
    return res.json({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      approvedPublishingDate: r.approvedPublishingDate || null,
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      fileNames: r.fileNames || [],
      resheduledatewithreason: r.resheduledatewithreason || [],
      creativeRejectionReason: r.creativeRejectionReason || "",
    });
  } catch (e) {
    console.error("getCreativeUploadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/upload-requests/:id/toggle
export async function toggleUploadToggled(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedUploadToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const next = !guard.doc.togglestatus;
    const updated = await UploadRequest.findByIdAndUpdate(
      id,
      { $set: { togglestatus: next } },
      { new: true, lean: true }
    );

    return res.json({
      message: updated.togglestatus ? "Toggled on" : "Toggled off",
      togglestatus: !!updated.togglestatus,
      creativeStatus: updated.creativeStatus, // unchanged (pending|waiting)
    });
  } catch (e) {
    console.error("toggleUploadToggled error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/upload-requests/:id/filenames
export async function saveUploadFilenames(req, res) {
  try {
    const { id } = req.params;
    const { fileNames } = req.body || {};
    if (!Array.isArray(fileNames))
      return res.status(400).json({ message: "fileNames must be an array" });

    const guard = await guardAssignedUploadToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await UploadRequest.findByIdAndUpdate(
      id,
      { $set: { fileNames } },
      { new: true, lean: true }
    );

    return res.json({ message: "Saved", fileNames: updated.fileNames || [] });
  } catch (e) {
    console.error("saveUploadFilenames error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/upload-requests/:id/send-for-approval
// Sets creativeStatus -> waiting
export async function sendUploadWorkForApproval(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedUploadToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await UploadRequest.findByIdAndUpdate(
      id,
      { $set: { creativeStatus: "waiting" } },
      { new: true, lean: true }
    );

    return res.json({ message: "Sent for approval", creativeStatus: updated.creativeStatus });
  } catch (e) {
    console.error("sendUploadWorkForApproval error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Guard helper: ensures the assignment belongs to company & is assigned to CS
async function guardAssignedAdToCS(req, id) {
  if (!mongoose.isValidObjectId(id)) {
    return { error: { code: 400, msg: "Invalid ID" } };
  }
  const cs = await CreativeStaff.findById(req.userId).select("_id company");
  if (!cs) return { error: { code: 401, msg: "You are not authorised" } };

  const doc = await AdAssignment.findOne({
    _id: id,
    company: cs.company,
    assignedCreativeStaff: cs._id,
  })
    .populate({ path: "destination", select: "name" })
    .lean();

  if (!doc) return { error: { code: 404, msg: "Not found" } };
  return { doc, cs };
}

// GET /creativeStaff/ad-assignments
export async function listCreativeAdAssignments(req, res) {
  try {
    const cs = await CreativeStaff.findById(req.userId).select("_id company");
    if (!cs) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      task,
      deadlineDate,    // yyyy-mm-dd (matches approvedDate || date)
      rescheduledDate, // yyyy-mm-dd
      status,          // creativeStatus filter: pending|waiting|approved|rejected
      toggled,         // "true" -> togglestatus=true
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: cs.company,
      assignedCreativeStaff: cs._id,
      // NOTE: unlike AdRequest flow, we DON'T require status="approved" here
      // because this is already an "assignment" object from MM.
    };

    if (destinationId && mongoose.isValidObjectId(destinationId)) {
      filter.destination = destinationId;
    }

    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    if (task) filter.task = task;

    // Publish/approved date filter (same logic)
    if (deadlineDate) {
      const d = new Date(deadlineDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedDate: { $gte: start, $lte: end } },
          { $and: [{ approvedDate: null }, { date: { $gte: start, $lte: end } }] },
        ];
      }
    }

    if (rescheduledDate) {
      const d = new Date(rescheduledDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.resheduledatewithreason = { $elemMatch: { date: { $gte: start, $lte: end } } };
      }
    }

    if (["pending", "waiting", "approved", "rejected"].includes(status)) {
      filter.creativeStatus = status;
    }

    if (String(toggled).toLowerCase() === "true") {
      filter.togglestatus = true;
    }

    const [items, total] = await Promise.all([
      AdAssignment.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdAssignment.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      task: r.task,
      date: r.date,
      approvedDate: r.approvedDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      lastRescheduledDate:
        r.resheduledatewithreason?.length
          ? r.resheduledatewithreason[r.resheduledatewithreason.length - 1].date
          : null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listCreativeAssignments error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /creativeStaff/ad-assignments/:id
export async function getCreativeAdAssignment(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedAdToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const r = guard.doc;
    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      task: r.task,
      date: r.date,
      approvedDate: r.approvedDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      details: r.details || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      fileNames: r.fileNames || [],
      resheduledatewithreason: r.resheduledatewithreason || [],
      creativeRejectionReason: r.creativeRejectionReason || "",
    });
  } catch (e) {
    console.error("getCreativeAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/ad-assignments/:id/toggle
export async function toggleCreativeAdAssignment(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedAdToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const next = !guard.doc.togglestatus;
    const updated = await AdAssignment.findByIdAndUpdate(
      id,
      { $set: { togglestatus: next } },
      { new: true, lean: true }
    );
    return res.json({
      message: updated.togglestatus ? "Toggled on" : "Toggled off",
      togglestatus: !!updated.togglestatus,
      creativeStatus: updated.creativeStatus,
    });
  } catch (e) {
    console.error("toggleCreativeAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/ad-assignments/:id/filenames
export async function saveCreativeAdAssignmentFilenames(req, res) {
  try {
    const { id } = req.params;
    const { fileNames } = req.body || {};
    if (!Array.isArray(fileNames)) {
      return res.status(400).json({ message: "fileNames must be an array" });
    }

    const guard = await guardAssignedAdToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await AdAssignment.findByIdAndUpdate(
      id,
      { $set: { fileNames } },
      { new: true, lean: true }
    );

    return res.json({ message: "Saved", fileNames: updated.fileNames || [] });
  } catch (e) {
    console.error("saveCreativeAssignmentFilenames error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/ad-assignments/:id/send-for-approval
export async function sendCreativeAdAssignmentForApproval(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedAdToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await AdAssignment.findByIdAndUpdate(
      id,
      {
        $set: {
          creativeStatus: "waiting",
          creativeDecisionBy: null,
          creativeDecidedAt: null,
        },
      },
      { new: true, lean: true }
    );

    return res.json({ message: "Sent for approval", creativeStatus: updated.creativeStatus });
  } catch (e) {
    console.error("sendCreativeAssignmentForApproval error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function guardAssignedLeadAssignmentToCS(req, id) {
  if (!mongoose.isValidObjectId(id)) {
    return { error: { code: 400, msg: "Invalid ID" } };
  }
  const cs = await CreativeStaff.findById(req.userId).select("_id company");
  if (!cs) return { error: { code: 401, msg: "You are not authorised" } };

  const doc = await LeadAssignment.findOne({
    _id: id,
    company: cs.company,
    assignedCreativeStaff: cs._id,
  })
    .populate({ path: "destination", select: "name" })
    .lean();

  if (!doc) return { error: { code: 404, msg: "Lead assignment not found" } };
  return { cs, doc };
}

// GET /creativeStaff/lead-assignments
export async function listCreativeLeadAssignments(req, res) {
  try {
    const cs = await CreativeStaff.findById(req.userId).select("_id company");
    if (!cs) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      frequency,
      startDate,       // yyyy-mm-dd (approvedStartDate || startDate)
      rescheduledDate, // yyyy-mm-dd (any resheduledatewithreason.date)
      status,          // creativeStatus: pending|waiting|approved|rejected
      toggled,         // "true" => togglestatus = true
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: cs.company,
      assignedCreativeStaff: cs._id,
      // NOTE: This is an *assignment*, so we don’t force status="approved" here
    };

    if (destinationId && mongoose.isValidObjectId(destinationId)) {
      filter.destination = destinationId;
    }

    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    // Prefer approvedFrequency if present; else frequency
    if (frequency) {
      const freqClause = {
        $or: [
          { approvedFrequency: frequency },
          { $and: [{ approvedFrequency: null }, { frequency }] },
        ],
      };
      filter.$and = filter.$and ? [...filter.$and, freqClause] : [freqClause];
    }

    if (startDate) {
      const d = new Date(startDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedStartDate: { $gte: start, $lte: end } },
          { $and: [{ approvedStartDate: null }, { startDate: { $gte: start, $lte: end } }] },
        ];
      }
    }

    if (rescheduledDate) {
      const d = new Date(rescheduledDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.resheduledatewithreason = { $elemMatch: { date: { $gte: start, $lte: end } } };
      }
    }

    if (["pending", "waiting", "approved", "rejected"].includes(status)) {
      filter.creativeStatus = status;
    }

    if (String(toggled).toLowerCase() === "true") {
      filter.togglestatus = true;
    }

    const [items, total] = await Promise.all([
      LeadAssignment.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadAssignment.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef || "—",
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.frequency,
      approvedFrequency: r.approvedFrequency ?? null,
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      lastRescheduledDate:
        r.resheduledatewithreason?.length
          ? r.resheduledatewithreason[r.resheduledatewithreason.length - 1].date
          : null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listCreativeLeadAssignments error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /creativeStaff/lead-assignments/:id
export async function getCreativeLeadAssignment(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedLeadAssignmentToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const r = guard.doc;
    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef || "—",
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.frequency,
      approvedFrequency: r.approvedFrequency ?? null,
      details: r.details || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      fileNames: r.fileNames || [],
      resheduledatewithreason: r.resheduledatewithreason || [],
      creativeRejectionReason: r.creativeRejectionReason || "",
    });
  } catch (e) {
    console.error("getCreativeLeadAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/lead-assignments/:id/toggle
export async function toggleLeadAssignment(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedLeadAssignmentToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const next = !guard.doc.togglestatus;
    const updated = await LeadAssignment.findByIdAndUpdate(
      id,
      { $set: { togglestatus: next } },
      { new: true, lean: true }
    );

    return res.json({
      message: updated.togglestatus ? "Toggled on" : "Toggled off",
      togglestatus: !!updated.togglestatus,
      creativeStatus: updated.creativeStatus,
    });
  } catch (e) {
    console.error("toggleLeadAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/lead-assignments/:id/filenames
export async function saveLeadAssignmentFilenames(req, res) {
  try {
    const { id } = req.params;
    const { fileNames } = req.body || {};
    if (!Array.isArray(fileNames))
      return res.status(400).json({ message: "fileNames must be an array" });

    const guard = await guardAssignedLeadAssignmentToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await LeadAssignment.findByIdAndUpdate(
      id,
      { $set: { fileNames } },
      { new: true, lean: true }
    );

    return res.json({ message: "Saved", fileNames: updated.fileNames || [] });
  } catch (e) {
    console.error("saveLeadAssignmentFilenames error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/lead-assignments/:id/send-for-approval
export async function sendLeadAssignmentForApproval(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedLeadAssignmentToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await LeadAssignment.findByIdAndUpdate(
      id,
      {
        $set: {
          creativeStatus: "waiting",
          creativeDecisionBy: null,
          creativeDecidedAt: null,
        },
      },
      { new: true, lean: true }
    );

    return res.json({ message: "Sent for approval", creativeStatus: updated.creativeStatus });
  } catch (e) {
    console.error("sendLeadAssignmentForApproval error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
// Guard – CS must belong to company and be assigned to this assignment
async function guardAssignedUploadAssignmentToCS(req, id) {
  if (!mongoose.isValidObjectId(id)) {
    return { error: { code: 400, msg: "Invalid ID" } };
  }
  const cs = await CreativeStaff.findById(req.userId).select("_id company");
  if (!cs) return { error: { code: 401, msg: "You are not authorised" } };

  const doc = await UploadAssignment.findOne({
    _id: id,
    company: cs.company,
    assignedCreativeStaff: cs._id,
  }).lean();

  if (!doc) return { error: { code: 404, msg: "Upload assignment not found" } };
  return { cs, doc };
}

// GET /creativeStaff/upload-assignments
// Filters:
// - category (regex contains)
// - filenameText (regex contains)
// - deadlineDate (approvedPublishingDate || publishingDate)
// - rescheduledDate (elemMatch)
// - status (creativeStatus: pending|waiting|approved|rejected)
// - toggled ("true" => togglestatus=true)
export async function listCreativeUploadAssignments(req, res) {
  try {
    const cs = await CreativeStaff.findById(req.userId).select("_id company");
    if (!cs) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      category,
      filenameText,
      deadlineDate,    // yyyy-mm-dd
      rescheduledDate, // yyyy-mm-dd
      status,
      toggled,
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: cs.company,
      assignedCreativeStaff: cs._id,
      // NOTE: it's an assignment object (no need to force status = "approved")
    };

    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (category && category.trim()) {
      filter.category = new RegExp(escapeRegex(category.trim()), "i");
    }
    if (filenameText && filenameText.trim()) {
      filter.filename = new RegExp(escapeRegex(filenameText.trim()), "i");
    }

    if (deadlineDate) {
      const d = new Date(deadlineDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedPublishingDate: { $gte: start, $lte: end } },
          { $and: [{ approvedPublishingDate: null }, { publishingDate: { $gte: start, $lte: end } }] },
        ];
      }
    }

    if (rescheduledDate) {
      const d = new Date(rescheduledDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.resheduledatewithreason = { $elemMatch: { date: { $gte: start, $lte: end } } };
      }
    }

    if (["pending", "waiting", "approved", "rejected"].includes(status)) {
      filter.creativeStatus = status;
    }

    if (String(toggled).toLowerCase() === "true") {
      filter.togglestatus = true;
    }

    const [items, total] = await Promise.all([
      UploadAssignment.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      UploadAssignment.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      approvedPublishingDate: r.approvedPublishingDate || null,
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      lastRescheduledDate:
        r.resheduledatewithreason?.length
          ? r.resheduledatewithreason[r.resheduledatewithreason.length - 1].date
          : null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listCreativeUploadAssignments error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /creativeStaff/upload-assignments/:id
export async function getCreativeUploadAssignment(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedUploadAssignmentToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const r = guard.doc;
    return res.json({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      approvedPublishingDate: r.approvedPublishingDate || null,
      details: r.details || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      togglestatus: !!r.togglestatus,
      fileNames: r.fileNames || [],
      resheduledatewithreason: r.resheduledatewithreason || [],
      creativeRejectionReason: r.creativeRejectionReason || "",
    });
  } catch (e) {
    console.error("getCreativeUploadAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/upload-assignments/:id/toggle
export async function toggleUploadAssignment(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedUploadAssignmentToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const next = !guard.doc.togglestatus;
    const updated = await UploadAssignment.findByIdAndUpdate(
      id,
      { $set: { togglestatus: next } },
      { new: true, lean: true }
    );

    return res.json({
      message: updated.togglestatus ? "Toggled on" : "Toggled off",
      togglestatus: !!updated.togglestatus,
      creativeStatus: updated.creativeStatus,
    });
  } catch (e) {
    console.error("toggleUploadAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/upload-assignments/:id/filenames
export async function saveUploadAssignmentFilenames(req, res) {
  try {
    const { id } = req.params;
    const { fileNames } = req.body || {};
    if (!Array.isArray(fileNames)) {
      return res.status(400).json({ message: "fileNames must be an array" });
    }

    const guard = await guardAssignedUploadAssignmentToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await UploadAssignment.findByIdAndUpdate(
      id,
      { $set: { fileNames } },
      { new: true, lean: true }
    );

    return res.json({ message: "Saved", fileNames: updated.fileNames || [] });
  } catch (e) {
    console.error("saveUploadAssignmentFilenames error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /creativeStaff/upload-assignments/:id/send-for-approval
export async function sendUploadAssignmentForApproval(req, res) {
  try {
    const { id } = req.params;
    const guard = await guardAssignedUploadAssignmentToCS(req, id);
    if (guard.error) return res.status(guard.error.code).json({ message: guard.error.msg });

    const updated = await UploadAssignment.findByIdAndUpdate(
      id,
      {
        $set: {
          creativeStatus: "waiting",
          creativeDecisionBy: null,
          creativeDecidedAt: null,
        },
      },
      { new: true, lean: true }
    );

    return res.json({ message: "Sent for approval", creativeStatus: updated.creativeStatus });
  } catch (e) {
    console.error("sendUploadAssignmentForApproval error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}