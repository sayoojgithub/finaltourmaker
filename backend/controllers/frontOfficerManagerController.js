import FrontOfficerManager from "../models/frontOfficerManagerModel.js";
import FrontOfficer from "../models/frontOfficerModel.js";
import mongoose from "mongoose";
import ClientByEntry from "../models/clientByEntryModel.js";

export async function listFrontOfficersByCompany(req, res) {
  try {
    const fom = await FrontOfficerManager.findById(req.userId).select("company");
    if (!fom) return res.status(401).json({ message: "You are not authorised" });

    let { page = 1, limit = 7 } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);

    const filter = { company: fom.company };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      FrontOfficer.find(filter)
        .select("name contactNumber email status isOnline createdAt")
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FrontOfficer.countDocuments(filter),
    ]);

    return res.json({
      docs: items.map((it) => ({
        _id: it._id,
        name: it.name,
        contactNumber: it.contactNumber,
        email: it.email,
        status: it.status,
        isOnline: !!it.isOnline,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("listFrontOfficersByCompany error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateFrontOfficerStatus(req, res) {
  try {
    const fom = await FrontOfficerManager.findById(req.userId).select("company");
    if (!fom) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid front officer id" });
    }
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Status must be Active or Inactive" });
    }

    const doc = await FrontOfficer.findOneAndUpdate(
      { _id: id, company: fom.company },
      { $set: { status } },
      { new: true, select: "status _id" }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Front officer not found" });
    return res.json({ message: "Updated", id: doc._id, status: doc.status });
  } catch (err) {
    console.error("updateFrontOfficerStatus error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function listPendingClientsByFO(req, res) {
  try {
    const fom = await FrontOfficerManager.findById(req.userId).select("company");
    if (!fom) return res.status(401).json({ message: "You are not authorised" });

    let {
      frontOfficerId,
      page = 1,
      limit = 7,
      mobileNumber,
      destinationText,
      dateFrom,   // yyyy-mm-dd
      dateTo,     // yyyy-mm-dd
    } = req.query;

    if (!frontOfficerId || !mongoose.isValidObjectId(frontOfficerId)) {
      return res.status(400).json({ message: "frontOfficerId is required" });
    }

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    // ensure FO belongs to company
    const fo = await FrontOfficer.findOne({
      _id: frontOfficerId,
      company: fom.company,
    }).select("_id");
    if (!fo) return res.status(404).json({ message: "Front officer not found" });

    const filter = {
      companyId: fom.company,
      assignedFrontOfficerId: fo._id,
      frontOfficeCreatedStatus: false,
    };

    if (mobileNumber && mobileNumber.trim()) {
      filter.mobileNumber = new RegExp(mobileNumber.trim(), "i");
    }

    const orArr = [];
    if (destinationText && destinationText.trim()) {
      const r = new RegExp(destinationText.trim(), "i");
      orArr.push({ "primaryDestinationName.label": r });
      orArr.push({ "primaryDestinationName.value": r });
    }
    if (orArr.length) filter.$or = orArr;

    // Date range on createdAtByEntry (inclusive for both ends)
    if (dateFrom || dateTo) {
      const range = {};
      if (dateFrom) {
        const s = new Date(dateFrom);
        if (!Number.isNaN(s.getTime())) {
          s.setHours(0, 0, 0, 0);
          range.$gte = s;
        }
      }
      if (dateTo) {
        const e = new Date(dateTo);
        if (!Number.isNaN(e.getTime())) {
          e.setHours(23, 59, 59, 999);
          range.$lte = e;
        }
      }
      if (Object.keys(range).length) {
        filter.createdAtByEntry = range;
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ClientByEntry.find(filter)
        .select(
          "name mobileNumber primaryDestinationName connectedThrough createdAtByEntry"
        )
        .sort({ createdAtByEntry: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ClientByEntry.countDocuments(filter),
    ]);

    const docs = items.map((c) => ({
      _id: c._id,
      name: c.name || "",
      mobileNumber: c.mobileNumber || "",
      primaryDestination:
        c.primaryDestinationName?.label ||
        c.primaryDestinationName?.value ||
        "",
      createdAtByEntry: c.createdAtByEntry || null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("listPendingClientsByFO error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function reassignPendingClients(req, res) {
  try {
    const fom = await FrontOfficerManager.findById(req.userId).select("company");
    if (!fom) return res.status(401).json({ message: "You are not authorised" });

    const {
      fromFrontOfficerId,
      toFrontOfficerId,
      clientIds = [],
      selectAll = false,
      filters = {},
      excludedIds = [],             // NEW: allow exclusions when selectAll is true
    } = req.body || {};

    // ---- helpers ----
    const escapeRe = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const isOid = (v) => mongoose.isValidObjectId(v);

    // UTC day bounds from yyyy-mm-dd
    const dayStartUtc = (isoDate) => new Date(`${isoDate}T00:00:00.000Z`);
    const dayEndUtc   = (isoDate) => new Date(`${isoDate}T23:59:59.999Z`);

    // ---- validate ids ----
    if (!fromFrontOfficerId || !toFrontOfficerId || !isOid(fromFrontOfficerId) || !isOid(toFrontOfficerId)) {
      return res.status(400).json({ message: "Valid from/to front officer ids are required" });
    }
    if (fromFrontOfficerId === toFrontOfficerId) {
      return res.status(400).json({ message: "Source and target cannot be the same" });
    }

    const [fromFO, toFO] = await Promise.all([
      FrontOfficer.findOne({ _id: fromFrontOfficerId, company: fom.company }).select("_id"),
      FrontOfficer.findOne({ _id: toFrontOfficerId, company: fom.company }).select("_id"),
    ]);
    if (!fromFO) return res.status(404).json({ message: "Source front officer not found" });
    if (!toFO) return res.status(404).json({ message: "Target front officer not found" });

    // ---- base filter: pending for fromFO within company ----
    const baseFilter = {
      companyId: fom.company,
      assignedFrontOfficerId: fromFO._id,
      frontOfficeCreatedStatus: false,
    };

    // ---- build selection ----
    if (selectAll) {
      const { mobileNumber, destinationText, dateFrom, dateTo } = filters || {};

      if (mobileNumber?.trim()) {
        baseFilter.mobileNumber = { $regex: escapeRe(mobileNumber.trim()), $options: "i" };
      }

      const orArr = [];
      if (destinationText?.trim()) {
        const rx = { $regex: escapeRe(destinationText.trim()), $options: "i" };
        orArr.push({ "primaryDestinationName.label": rx });
        orArr.push({ "primaryDestinationName.value": rx });
      }
      if (orArr.length) baseFilter.$or = orArr;

      if (dateFrom || dateTo) {
        const range = {};
        if (dateFrom) range.$gte = dayStartUtc(dateFrom);
        if (dateTo)   range.$lte = dayEndUtc(dateTo);
        baseFilter.createdAtByEntry = range;
      }

      // NEW: exclude specific ids the user unchecked while in global select-all
      const validExcluded = (excludedIds || []).filter(isOid);
      if (validExcluded.length) {
        baseFilter._id = { ...(baseFilter._id || {}), $nin: validExcluded };
      }
    } else {
      // explicit ids mode
      const validIds = (clientIds || []).filter(isOid);
      if (!validIds.length) {
        return res.status(400).json({ message: "clientIds required when selectAll is false" });
      }
      // (optional) guard on huge payloads
      const MAX_IDS = 2000;
      if (validIds.length > MAX_IDS) {
        return res.status(400).json({ message: `Too many clientIds in one request (>${MAX_IDS})` });
      }
      baseFilter._id = { $in: validIds };
    }

    // ---- safety pre-count & optional bulk cap ----
    const willAffect = await ClientByEntry.countDocuments(baseFilter);
    if (!willAffect) {
      return res.status(404).json({ message: "No matching clients to reassign" });
    }
    const MAX_BULK = 5000; // tune to your ops comfort
    if (willAffect > MAX_BULK) {
      return res.status(400).json({
        message: `Too many records (${willAffect}). Please narrow your filters.`,
      });
    }

    // ---- perform update ----
    const now = new Date();
    const update = {
      assignedFrontOfficerId: toFO._id,
      assignedAt: now,
    };

    const result = await ClientByEntry.updateMany(baseFilter, { $set: update });

    return res.json({
      message: "Reassigned",
      modified: result.modifiedCount || 0,
      matched: result.matchedCount ?? willAffect,
    });
  } catch (err) {
    console.error("reassignPendingClients error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
