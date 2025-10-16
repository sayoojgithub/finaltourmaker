import mongoose from "mongoose";
import AdRequest from "../models/adRequestModel.js";
import LeadRequest from "../models/leadRequestModel.js";
import UploadRequest from "../models/uploadRequestModel.js";
import Destination from "../models/destinationModel.js";
import DigitalMarketer from "../models/digitalMarketerModel.js";
import AdAssignment from "../models/adAssignmentModel.js";
import LeadAssignment from "../models/LeadAssignmentModel.js";
import UploadAssignment from "../models/uploadAssignmentModel.js";
const isValidId = (id) => mongoose.isValidObjectId(id);

export async function listApprovedAdRequestsInDigitalMarketerSide(req, res) {
  try {
    // Who is the DM?
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      task,
      publishingDate, // yyyy-mm-dd (approvedDate || date)
      postStatus,     // "not-posted-yet" | "posted"
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Only DM-assigned, company-matching, fully approved requests
    const filter = {
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    };

    if (destinationId && isValidId(destinationId)) {
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

    // Publishing date (approvedDate || date)
    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end   = new Date(d); end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedDate: { $gte: start, $lte: end } },
          { $and: [{ approvedDate: null }, { date: { $gte: start, $lte: end } }] },
        ];
      }
    }

    // Post status
    if (postStatus === "posted") filter.dmPostStatus = true;
    if (postStatus === "not-posted-yet") filter.dmPostStatus = false;

    const [items, total] = await Promise.all([
      AdRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ dmPostStatus: 1, approvedDate: -1, date: -1, _id: -1 })
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
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
      details: r.details || "",
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      fileNames: r.fileNames || [],
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listDigitalMarketerApprovedAdRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getApprovedAdRequestInDigitalMarketerSide(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdRequest.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    })
      .populate({ path: "destination", select: "name" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      task: r.task,
      date: r.date,
      approvedDate: r.approvedDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      details: r.details || "",
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
      fileNames: r.fileNames || [],
    });
  } catch (e) {
    console.error("getDigitalMarketerApprovedAdRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function markAdRequestPosted(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdRequest.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    });

    if (!r) return res.status(404).json({ message: "Not found" });
    if (r.dmPostStatus) {
      return res.status(409).json({ message: "Already marked as posted" });
    }

    r.dmPostStatus = true;
    r.dmPostedAt = new Date();
   

    await r.save();
    return res.json({ message: "Marked as posted", dmPostedAt: r.dmPostedAt });
  } catch (e) {
    console.error("markAdRequestPosted error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listApprovedLeadRequestsInDigitalMarketerSide(req, res) {
  try {
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      campaignNameText,
      dateFrom,   // yyyy-mm-dd
      dateTo,     // yyyy-mm-dd
      frequency,  // daily|weekly|monthly
      postStatus, // "not-posted-yet" | "posted"
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Only DM-assigned, company-matching, fully approved (MM + Creative)
    const filter = {
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    };

    if (destinationId && isValidId(destinationId)) {
      filter.destination = destinationId;
    }

    if (destinationText && destinationText.trim()) {
      const rx = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: rx }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    if (campaignNameText && campaignNameText.trim()) {
      filter.campaignName = new RegExp(campaignNameText.trim(), "i");
    }

    if (["daily", "weekly", "monthly"].includes(frequency)) {
      // approvedFrequency if present, else frequency
      filter.$or = [
        ...(filter.$or || []),
        { approvedFrequency: frequency },
        { $and: [{ approvedFrequency: null }, { frequency }] },
      ];
    }

    // Date range (match if either start or end falls within range; uses approved* fallbacks)
    if (dateFrom || dateTo) {
      const start = dateFrom ? new Date(dateFrom) : null;
      const end   = dateTo   ? new Date(dateTo)   : null;
      if (start && !Number.isNaN(start.getTime())) start.setHours(0,0,0,0);
      if (end   && !Number.isNaN(end.getTime()))   end.setHours(23,59,59,999);

      const inRange = (field) => {
        const cond = {};
        if (start) cond.$gte = start;
        if (end)   cond.$lte = end;
        return cond;
      };

      const rangeOrs = [];
      if (start || end) {
        rangeOrs.push(
          { approvedStartDate: inRange("approvedStartDate") },
          { $and: [{ approvedStartDate: null }, { startDate: inRange("startDate") }] },
          { approvedEndDate: inRange("approvedEndDate") },
          { $and: [{ approvedEndDate: null }, { endDate: inRange("endDate") }] },
        );
      }
      if (rangeOrs.length) filter.$or = [ ...(filter.$or || []), ...rangeOrs ];
    }

    // Post status
    if (postStatus === "posted") filter.dmPostStatus = true;
    if (postStatus === "not-posted-yet") filter.dmPostStatus = false;

    const [items, total] = await Promise.all([
      LeadRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ dmPostStatus: 1, approvedStartDate: -1, startDate: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadRequest.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      campaignName: r.campaignName || "",
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.approvedFrequency || r.frequency,
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listDigitalMarketerApprovedLeadRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getApprovedLeadRequestInDigitalMarketerSide(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadRequest.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    })
      .populate({ path: "destination", select: "name" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      campaignName: r.campaignName || "",
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.approvedFrequency || r.frequency,
      details: r.updationReason || "", // or another details field if you keep one for leads
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      fileNames: r.fileNames || [],
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,

      // Ad meta
      adCategorySnapshot: r.adCategorySnapshot || null,
      adData: r.adData || {},
    });
  } catch (e) {
    console.error("getDigitalMarketerApprovedLeadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function markLeadRequestPosted(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadRequest.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    });

    if (!r) return res.status(404).json({ message: "Not found" });
    if (r.dmPostStatus) return res.status(409).json({ message: "Already marked as posted" });

    r.dmPostStatus = true;
    r.dmPostedAt = new Date();

    await r.save();
    return res.json({ message: "Marked as posted", dmPostedAt: r.dmPostedAt });
  } catch (e) {
    console.error("markLeadRequestPosted error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function listApprovedUploadRequestsInDigitalMarketerSide(req, res) {
  try {
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      categoryText,
      filenameText,
      publishingDate, // yyyy-mm-dd (approvedPublishingDate || publishingDate)
      postStatus,     // "not-posted-yet" | "posted"
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Only DM-assigned, company-matching, fully approved (MM + Creative)
    const filter = {
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    };

    if (categoryText && categoryText.trim()) {
      filter.category = new RegExp(categoryText.trim(), "i");
    }

    // Only the single `filename` field (NOT the `fileNames` array)
    if (filenameText && filenameText.trim()) {
      filter.filename = new RegExp(filenameText.trim(), "i");
    }

    // Publishing date fallback: approvedPublishingDate || publishingDate
    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end   = new Date(d); end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedPublishingDate: { $gte: start, $lte: end } },
          { $and: [{ approvedPublishingDate: null }, { publishingDate: { $gte: start, $lte: end } }] },
        ];
      }
    }

    // Post status
    if (postStatus === "posted") filter.dmPostStatus = true;
    if (postStatus === "not-posted-yet") filter.dmPostStatus = false;

    const [items, total] = await Promise.all([
      UploadRequest.find(filter)
        .sort({ dmPostStatus: 1, approvedPublishingDate: -1, publishingDate: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UploadRequest.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      approvedPublishingDate: r.approvedPublishingDate || null,
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      fileNames: r.fileNames || [],
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listDigitalMarketerApprovedUploadRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getApprovedUploadRequestInDigitalMarketerSide(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await UploadRequest.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    }).lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      approvedPublishingDate: r.approvedPublishingDate || null,
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      fileNames: r.fileNames || [],
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
    });
  } catch (e) {
    console.error("getDigitalMarketerApprovedUploadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function markUploadRequestPosted(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await UploadRequest.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      status: "approved",
      creativeStatus: "approved",
    });

    if (!r) return res.status(404).json({ message: "Not found" });
    if (r.dmPostStatus) {
      return res.status(409).json({ message: "Already marked as posted" });
    }

    r.dmPostStatus = true;
    r.dmPostedAt = new Date();
    

    await r.save();
    return res.json({ message: "Marked as posted", dmPostedAt: r.dmPostedAt });
  } catch (e) {
    console.error("markUploadRequestPosted error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listDigitalMarketerAssignedAdTasks(req, res) {
  try {
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      task,
      publishingDate,
      postStatus,
    } = req.query;

    page  = Math.max(1, parseInt(page, 10)  || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // DM sees items assigned to them; typically only proceed once creative is approved
    const filter = {
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    };

    if (destinationId && isValidId(destinationId)) filter.destination = destinationId;

    if (destinationText && destinationText.trim()) {
      const rx = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: rx }).select("_id").lean();
      if (!dests.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.destination = { $in: dests.map(d => d._id) };
    }

    if (task && ["Poster","Reel","Video","Review","Staff Performance"].includes(task)) {
      filter.task = task;
    }

    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0,0,0,0);
        const end   = new Date(d); end.setHours(23,59,59,999);
        filter.date = { $gte: start, $lte: end };
      }
    }

    if (postStatus === "posted") filter.dmPostStatus = true;
    if (postStatus === "not-posted-yet") filter.dmPostStatus = false;

    const [items, total] = await Promise.all([
      AdAssignment.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ dmPostStatus: 1, date: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdAssignment.countDocuments(filter),
    ]);

    const docs = items.map(r => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      task: r.task,
      date: r.date,
      quantity: r.quantity,
      details: r.details || "",
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      fileNames: r.fileNames || [],
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listDigitalMarketerAssignedAdTasks error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /digitalMarketer/assigned-ad-tasks/:id
 */
export async function getDigitalMarketerAssignedAdTask(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdAssignment.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    })
      .populate({ path: "destination", select: "name" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      task: r.task,
      date: r.date,
      quantity: r.quantity,
      details: r.details || "",
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
      fileNames: r.fileNames || [],
    });
  } catch (e) {
    console.error("getDigitalMarketerAssignedAdTask error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /digitalMarketer/assigned-ad-tasks/:id/mark-posted
 */
export async function markAssignedAdTaskPosted(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdAssignment.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    });

    if (!r) return res.status(404).json({ message: "Not found" });
    if (r.dmPostStatus) {
      return res.status(409).json({ message: "Already marked as posted" });
    }

    r.dmPostStatus = true;
    r.dmPostedAt = new Date();

    await r.save();
    return res.json({ message: "Marked as posted", dmPostedAt: r.dmPostedAt });
  } catch (e) {
    console.error("markAssignedAdTaskPosted error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function listDigitalMarketerAssignedLeadTasks(req, res) {
  try {
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      campaignNameText,
      dateFrom,
      dateTo,
      frequency,
      postStatus,
    } = req.query;

    page  = Math.max(1, parseInt(page, 10)  || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // DM sees assignments made to them, that are ready for execution (creative approved)
    const filter = {
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    };

    if (destinationId && isValidId(destinationId)) {
      filter.destination = destinationId;
    }

    if (destinationText && destinationText.trim()) {
      const rx = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: rx }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.destination = { $in: dests.map(d => d._id) };
    }

    if (campaignNameText && campaignNameText.trim()) {
      filter.campaignName = new RegExp(campaignNameText.trim(), "i");
    }

    if (["daily","weekly","monthly"].includes(frequency)) {
      filter.frequency = frequency;
    }

    // Date window overlap: (start..end) overlaps with (dateFrom..dateTo)
    if (dateFrom || dateTo) {
      const start = dateFrom ? new Date(dateFrom) : null;
      const end   = dateTo   ? new Date(dateTo)   : null;
      if (start && !Number.isNaN(start.getTime())) start.setHours(0,0,0,0);
      if (end   && !Number.isNaN(end.getTime()))   end.setHours(23,59,59,999);

      if (start || end) {
        // overlap: startDate <= end && endDate >= start
        const and = [];
        if (end)   and.push({ startDate: { $lte: end } });
        if (start) and.push({ endDate:   { $gte: start } });
        if (and.length) filter.$and = [...(filter.$and || []), ...and];
      }
    }

    if (postStatus === "posted") filter.dmPostStatus = true;
    if (postStatus === "not-posted-yet") filter.dmPostStatus = false;

    const [items, total] = await Promise.all([
      LeadAssignment.find(filter)
        .populate({ path: "destination", select: "name" })
        .sort({ dmPostStatus: 1, startDate: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadAssignment.countDocuments(filter),
    ]);

    const docs = items.map(r => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      campaignName: r.campaignName || "",
      startDate: r.startDate,
      endDate: r.endDate,
      quantity: r.quantity,
      frequency: r.frequency,
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
      fileNames: r.fileNames || [],
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listDigitalMarketerAssignedLeadTasks error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /digitalMarketer/assigned-lead-tasks/:id
 */
export async function getDigitalMarketerAssignedLeadTask(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadAssignment.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    })
      .populate({ path: "destination", select: "name" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      campaignName: r.campaignName || "",
      startDate: r.startDate,
      endDate: r.endDate,
      quantity: r.quantity,
      frequency: r.frequency,
      details: r.details || "",
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      fileNames: r.fileNames || [],
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
      // Ad meta for detail panel:
      adCategorySnapshot: r.adCategorySnapshot || null,
      adData: r.adData || {},
    });
  } catch (e) {
    console.error("getDigitalMarketerAssignedLeadTask error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /digitalMarketer/assigned-lead-tasks/:id/mark-posted
 */
export async function markAssignedLeadTaskPosted(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadAssignment.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    });

    if (!r) return res.status(404).json({ message: "Not found" });
    if (r.dmPostStatus) return res.status(409).json({ message: "Already marked as posted" });

    r.dmPostStatus = true;
    r.dmPostedAt = new Date();

    await r.save();
    return res.json({ message: "Marked as posted", dmPostedAt: r.dmPostedAt });
  } catch (e) {
    console.error("markAssignedLeadTaskPosted error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listAssignedUploadTasksForDM(req, res) {
  try {
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      categoryText,
      filenameText,
      publishingDate,  // yyyy-mm-dd
      postStatus,      // "not-posted-yet" | "posted"
    } = req.query;

    page  = Math.max(1, parseInt(page, 10)  || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Only this DM's assignments in this company.
    // Show only items that have passed Creative approval (consistent with your execution flows).
    const filter = {
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    };

    if (categoryText && categoryText.trim()) {
      filter.category = new RegExp(categoryText.trim(), "i");
    }
    if (filenameText && filenameText.trim()) {
      filter.filename = new RegExp(filenameText.trim(), "i");
    }

    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end   = new Date(d); end.setHours(23, 59, 59, 999);
        filter.publishingDate = { $gte: start, $lte: end };
      }
    }

    if (postStatus === "posted") filter.dmPostStatus = true;
    if (postStatus === "not-posted-yet") filter.dmPostStatus = false;

    const [items, total] = await Promise.all([
      UploadAssignment.find(filter)
        .populate({ path: "assignedCreativeStaff", select: "name email" })
        .sort({ dmPostStatus: 1, publishingDate: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UploadAssignment.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      creativeStatus: r.creativeStatus || "pending",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listAssignedUploadTasksForDM error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /digitalMarketer/upload-assignments/:id
 */
export async function getAssignedUploadTaskForDM(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    if (!isValidId(id)) return res.status(400).json({ message: "Invalid id" });

    const r = await UploadAssignment.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    })
      .populate({ path: "assignedCreativeStaff", select: "name email" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      fileNames: r.fileNames || [],
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
    });
  } catch (e) {
    console.error("getAssignedUploadTaskForDM error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /digitalMarketer/upload-assignments/:id/mark-posted
 */
export async function markUploadAssignmentPosted(req, res) {
  try {
    const { id } = req.params;
    const dm = await DigitalMarketer.findById(req.userId).select("_id company");
    if (!dm) return res.status(401).json({ message: "You are not authorised" });

    if (!isValidId(id)) return res.status(400).json({ message: "Invalid id" });

    const r = await UploadAssignment.findOne({
      _id: id,
      company: dm.company,
      assignedDigitalMarketer: dm._id,
      creativeStatus: "approved",
    });

    if (!r) return res.status(404).json({ message: "Not found" });
    if (r.dmPostStatus) {
      return res.status(409).json({ message: "Already marked as posted" });
    }

    r.dmPostStatus = true;
    r.dmPostedAt = new Date();
    await r.save();

    return res.json({ message: "Marked as posted", dmPostedAt: r.dmPostedAt });
  } catch (e) {
    console.error("markUploadAssignmentPosted error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}