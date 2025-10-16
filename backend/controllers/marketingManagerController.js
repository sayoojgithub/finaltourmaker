import AdRequest from "../models/adRequestModel.js";
import LeadRequest from "../models/leadRequestModel.js";
import UploadRequest from "../models/uploadRequestModel.js";
import DailyTaskRequest from "../models/dailyTaskRequestModel.js";
import SalesManager from "../models/salesManagerModel.js";
import MarketingManager from "../models/marketingManagerModel.js";
import DigitalMarketer from "../models/digitalMarketerModel.js";
import CreativeStaff from "../models/creativeStaffModel.js";
import AdCategory, {FIELD_TYPES} from "../models/adCategoryModel.js";
import Destination from "../models/destinationModel.js";
import mongoose from "mongoose";
import Country from "../models/countryModel.js";
import State from "../models/stateModel.js";
import AdAssignment from "../models/adAssignmentModel.js";
import GroupTour from "../models/groupTourModel.js";
import FixedTour from "../models/fixedTourModel.js";
import LeadAssignment from "../models/LeadAssignmentModel.js";
import UploadAssignment from "../models/uploadAssignmentModel.js";

export async function listCompanyDigitalMarketers(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const dms = await DigitalMarketer.find({
      company: mm.company,
      status: { $regex: /^active$/i }, // matches "Active" or "active"
    })
      .select("_id name email")
      .lean();

    const docs = dms.map((d) => ({ value: d._id.toString(), label: d.name || d.email }));
    return res.json(docs);
  } catch (e) {
    console.error("listCompanyDigitalMarketers error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function listCompanyCreativeStaff(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const css = await CreativeStaff.find({
      company: mm.company,
      status: { $regex: /^active$/i }, // "Active"/"active"
    })
      .select("_id name email")
      .lean();

    const docs = css.map((c) => ({ value: c._id.toString(), label: c.name || c.email }));
    return res.json(docs);
  } catch (e) {
    console.error("listCompanyCreativeStaff error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function listMarketingAdRequests(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 7,
      destinationId,
      task,
      date,
      status,
      destinationText,
      salesManagerText,
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    const filter = { company: mm.company };
    if (destinationId) filter.destination = destinationId;
    if (task) filter.task = task;
    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0,0,0,0);
        const end = new Date(d);   end.setHours(23,59,59,999);
        filter.date = { $gte: start, $lte: end };
      }
    }

    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    if (salesManagerText && salesManagerText.trim()) {
      const regex = new RegExp(salesManagerText.trim(), "i");
      const sms = await SalesManager.find({
        company: mm.company,
        $or: [{ name: regex }, { email: regex }],
      }).select("_id").lean();
      if (!sms.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.salesManager = { $in: sms.map((s) => s._id) };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      AdRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({
          path: "salesManager",
          select: "name email type branch franchisee",
          populate: [
            { path: "branch", select: "branchName" },
            { path: "franchisee", select: "franchiseeName" },
          ],
        })
        .populate({ path: "assignedCreativeStaff", select: "name email" }) // NEW
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdRequest.countDocuments(filter),
    ]);

    const docs = items.map((it) => {
      const sm = it.salesManager || {};
      const unitType = sm.type || "Company";
      const unitName =
        unitType === "Branch"
          ? sm.branch?.branchName || ""
          : unitType === "Franchisee"
          ? sm.franchisee?.franchiseeName || ""
          : "Company";
      return {
        _id: it._id,
        destinationName: it.destination?.name || "",
        task: it.task,
        date: it.date,
        approvedDate: it.approvedDate || null,
        quantity: it.quantity,
        approvedQuantity: it.approvedQuantity ?? null,
        requestedDate: it.requestedDate,
        requestedTime: it.requestedTime,
        status: it.status,
        salesManagerName: sm.name || sm.email || "",
        salesManagerUnitType: unitType,
        salesManagerUnitName: unitName,

        // NEW (exposed for potential use in table or details):
        campaignName: it.campaignName || "",
        assignedCreativeStaffName: it.assignedCreativeStaff?.name || it.assignedCreativeStaff?.email || "",
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
    console.error("listMarketingAdRequests error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}



export async function getMarketingAdRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;

    const doc = await AdRequest.findOne({ _id: id, company: mm.company })
      .populate({ path: "country", select: "name" })
      .populate({ path: "state", select: "name" })
      .populate({ path: "destination", select: "name" })
      .populate({
        path: "salesManager",
        select: "name email type branch franchisee",
        populate: [
          { path: "branch", select: "branchName" },
          { path: "franchisee", select: "franchiseeName" },
        ],
      })
      .populate({ path: "assignedDigitalMarketer", select: "name email" })
      .populate({ path: "assignedCreativeStaff", select: "name email" }) // NEW
      .lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });

    const sm = doc.salesManager || {};
    const unitType = sm.type || "Company";
    const unitName =
      unitType === "Branch"
        ? sm.branch?.branchName || ""
        : unitType === "Franchisee"
        ? sm.franchisee?.franchiseeName || ""
        : "Company";

    return res.json({
      _id: doc._id,
      countryId: doc.country?._id?.toString() || null,
      countryName: doc.country?.name || "",
      stateId: doc.state?._id?.toString() || null,
      stateName: doc.state?.name || "",
      destinationId: doc.destination?._id?.toString() || null,
      destinationName: doc.destination?.name || "",
      task: doc.task,
      date: doc.date,
      quantity: doc.quantity,
      approvedDate: doc.approvedDate,
      approvedQuantity: doc.approvedQuantity,
      details: doc.details || "",
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      status: doc.status,
      salesManagerName: sm.name || sm.email || "",
      salesManagerUnitType: unitType,
      salesManagerUnitName: unitName,
      assignedDigitalMarketerId: doc.assignedDigitalMarketer?._id?.toString() || null,
      assignedDigitalMarketerName:
        doc.assignedDigitalMarketer?.name || doc.assignedDigitalMarketer?.email || "",
      // NEW:
      assignedCreativeStaffId: doc.assignedCreativeStaff?._id?.toString() || null, // NEW
      assignedCreativeStaffName:
        doc.assignedCreativeStaff?.name || doc.assignedCreativeStaff?.email || "", // NEW
      campaignName: doc.campaignName || "", // NEW
      messageForDigitalMarketer: doc.messageForDigitalMarketer || "", // NEW
      messageForCreativeStaff: doc.messageForCreativeStaff || "", // NEW

      rejectionReason: doc.rejectionReason || "",
      updationReason: doc.updationReason || "", // NEW
      decisionBy: doc.decisionBy,
      decidedAt: doc.decidedAt,
    });
  } catch (err) {
    console.error("getMarketingAdRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}



export async function approveMarketingAdRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;

    // NEW fields accepted in body:
    const {
      digitalMarketerId,
      creativeStaffId,            // NEW
      date: overrideDate,
      quantity: overrideQuantity,
      campaignName,               // NEW
      messageForDigitalMarketer,  // NEW
      messageForCreativeStaff,    // NEW
      updationReason,
    } = req.body || {};

    if (!digitalMarketerId) {
      return res.status(400).json({ message: "Select a digital marketer" });
    }
    if (!mongoose.isValidObjectId(digitalMarketerId)) {
      return res.status(400).json({ message: "Invalid digital marketer id" });
    }

    const dm = await DigitalMarketer.findOne({ _id: digitalMarketerId, company: mm.company })
      .select("_id");
    if (!dm) return res.status(400).json({ message: "Digital marketer not found in your company" });

    // Validate creative staff if provided
    let csIdToSet = null;
    if (creativeStaffId) {
      if (!mongoose.isValidObjectId(creativeStaffId)) {
        return res.status(400).json({ message: "Invalid creative staff id" });
      }
      const cs = await CreativeStaff.findOne({ _id: creativeStaffId, company: mm.company })
        .select("_id");
      if (!cs) return res.status(400).json({ message: "Creative staff not found in your company" });
      csIdToSet = cs._id;
    }

    const update = {
      status: "approved",
      assignedDigitalMarketer: dm._id,
      assignedCreativeStaff: csIdToSet, // NEW
      decisionBy: mm._id,
      decidedAt: new Date(),
      rejectionReason: "",
      // NEW: meta and messages
      campaignName: (campaignName || "").trim(),
      messageForDigitalMarketer: (messageForDigitalMarketer || "").trim(),
      messageForCreativeStaff: (messageForCreativeStaff || "").trim(),
      // Clear updationReason on approval (optional, but tidy):
       updationReason: (updationReason || "").trim(),
    };

    if (overrideDate) {
      const d = new Date(overrideDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid override date" });
      update.approvedDate = d;
    } else {
      update.approvedDate = null;
    }

    if (overrideQuantity !== undefined && overrideQuantity !== null) {
      const q = Number(overrideQuantity);
      if (!Number.isFinite(q) || q < 1) return res.status(400).json({ message: "Invalid override quantity" });
      update.approvedQuantity = q;
    } else {
      update.approvedQuantity = null;
    }

    const doc = await AdRequest.findOneAndUpdate(
      { _id: id, company: mm.company },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json({ message: "Approved", id: doc._id });
  } catch (err) {
    console.error("approveMarketingAdRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}



export async function rejectMarketingAdRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const { reason, updationReason } = req.body || {}; // UPDATED

    const doc = await AdRequest.findOneAndUpdate(
      { _id: id, company: mm.company },
      {
        $set: {
          status: "rejected",
          assignedDigitalMarketer: null,
          assignedCreativeStaff: null, // NEW
          approvedDate: null,
          approvedQuantity: null,
          rejectionReason: (reason || "").trim(),
          updationReason: (updationReason || "").trim(), // NEW
          decisionBy: mm._id,
          decidedAt: new Date(),
          // keep campaign name/messages as history, or optionally clear them
        },
      },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json({ message: "Rejected", id: doc._id });
  } catch (err) {
    console.error("rejectMarketingAdRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function listAdCategoriesLeadSide(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const cats = await AdCategory.find({ company: mm.company, isActive: true })
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    const options = cats.map(c => ({ value: c._id.toString(), label: c.name }));
    return res.json(options);
  } catch (err) {
    console.error("listAdCategories error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAdCategoryLeadSide(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;

    const cat = await AdCategory.findOne({ _id: id, company: mm.company, isActive: true }).lean();
    if (!cat) return res.status(404).json({ message: "Category not found" });

    (cat.fields || []).sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.json({
      _id: cat._id,
      name: cat.name,
      description: cat.description || "",
      fields: (cat.fields || []).map(f => ({
        _id: f._id,
        key: f.key,
        label: f.label,
        type: f.type,
        required: !!f.required,
        order: f.order || 0,
        config: f.config || {}
      }))
    });
  } catch (err) {
    console.error("getAdCategory error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}



const ALLOWED_FREQ = new Set(["daily", "weekly", "monthly"]);
const isOID = (s) => mongoose.isValidObjectId(String(s));

function normalizeDateYMD(val) {
  // Accept "YYYY-MM-DD" or any Date-parsable string; store as "YYYY-MM-DD"
  if (!val) return "";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isValidURL(s) {
  try { new URL(String(s)); return true; } catch { return false; }
}

// Validate adData per category field definitions
function validateAdDataForCategory(cat, adDataRaw) {
  const errors = [];
  const normalized = {};
  const data = adDataRaw && typeof adDataRaw === "object" ? adDataRaw : {};
  const fields = [...(cat.fields || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  for (const f of fields) {
    const key = f.key;
    const val = data[key];
    const cfg = f.config || {};

    const missing =
      val === undefined ||
      val === null ||
      (typeof val === "string" && val.trim() === "") ||
      (Array.isArray(val) && val.length === 0);

    if (f.required && missing) {
      errors.push(`Field "${f.label}" is required`);
      continue;
    }
    if (missing) continue;

    switch (f.type) {
      case "text":
      case "textarea":
        normalized[key] = String(val);
        break;

      case "number": {
        const n = Number(val);
        if (!Number.isFinite(n)) { errors.push(`"${f.label}" must be a number`); break; }
        if (cfg.min !== undefined && n < Number(cfg.min)) errors.push(`"${f.label}" must be ≥ ${cfg.min}`);
        if (cfg.max !== undefined && n > Number(cfg.max)) errors.push(`"${f.label}" must be ≤ ${cfg.max}`);
        normalized[key] = n;
        break;
      }

      case "date": {
        const ymd = normalizeDateYMD(val);
        if (!ymd) errors.push(`"${f.label}" must be a valid date`);
        else normalized[key] = ymd; // store YYYY-MM-DD
        break;
      }

      case "checkbox": {
        normalized[key] = !!val;
        break;
      }

      case "url": {
        const s = String(val);
        if (!isValidURL(s)) errors.push(`"${f.label}" must be a valid URL`);
        else normalized[key] = s;
        break;
      }

      case "select": {
        const s = String(val);
        const opts = Array.isArray(cfg.options) ? cfg.options : [];
        const ok = new Set(opts.map(o => String(o.value)));
        if (!ok.has(s)) errors.push(`Invalid value for "${f.label}"`);
        else normalized[key] = s;
        break;
      }

      case "multiselect": {
        const arr = Array.isArray(val) ? val : [val];
        const opts = Array.isArray(cfg.options) ? cfg.options : [];
        const ok = new Set(opts.map(o => String(o.value)));
        const bad = arr.filter(v => !ok.has(String(v)));
        if (bad.length) errors.push(`Invalid value(s) for "${f.label}"`);
        else normalized[key] = Array.from(new Set(arr.map(v => String(v))));
        break;
      }

      case "destinations": {
        if (cfg.multiple) {
          const arr = Array.isArray(val) ? val : [val];
          const bad = arr.filter(v => !isOID(v));
          if (bad.length) errors.push(`Invalid destination id(s) for "${f.label}"`);
          else normalized[key] = Array.from(new Set(arr.map(String)));
        } else {
          if (!isOID(val)) errors.push(`Invalid destination id for "${f.label}"`);
          else normalized[key] = String(val);
        }
        break;
      }

      default:
        errors.push(`Unsupported field type for "${f.label}"`);
    }
  }

  if (errors.length) {
    const err = new Error(errors[0]);
    err.status = 400;
    throw err;
  }
  return normalized;
}

export async function listMarketingLeadRequests(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let { page = 1, limit = 7, frequency, status, salesManagerText, startDate, endDate } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    const filter = { company: mm.company };
    if (frequency) filter.frequency = frequency;
    if (status) filter.status = status;

    const dayStart = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const dayEnd   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
    if (startDate || endDate) {
      const startBound = startDate ? dayStart(startDate) : null;
      const endBound   = endDate   ? dayEnd(endDate)     : null;
      const and = [];
      if (endBound) and.push({ startDate: { $lte: endBound } });
      if (startBound) and.push({ endDate:   { $gte: startBound } });
      if (and.length) filter.$and = and;
    }

    if (salesManagerText && salesManagerText.trim()) {
      const rx = new RegExp(salesManagerText.trim(), "i");
      const sms = await SalesManager.find({ company: mm.company, $or: [{ name: rx }, { email: rx }] })
        .select("_id").lean();
      if (!sms.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.salesManager = { $in: sms.map(s => s._id) };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LeadRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({
          path: "salesManager",
          select: "name email type branch franchisee",
          populate: [{ path: "branch", select: "branchName" }, { path: "franchisee", select: "franchiseeName" }],
        })
        .populate({ path: "adCategory", select: "name" })
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadRequest.countDocuments(filter),
    ]);

    const docs = items.map(it => {
      const sm = it.salesManager || {};
      const unitType = sm.type || "Company";
      const unitName =
        unitType === "Branch" ? (sm.branch?.branchName || "") :
        unitType === "Franchisee" ? (sm.franchisee?.franchiseeName || "") :
        "Company";
      return {
        _id: it._id,
        destinationName: it.destination?.name || "",
        tourRef: it.tourRef || "",
        startDate: it.startDate,
        endDate: it.endDate,
        approvedStartDate: it.approvedStartDate || null,
        approvedEndDate: it.approvedEndDate || null,
        quantity: it.quantity,
        approvedQuantity: it.approvedQuantity ?? null,
        frequency: it.frequency,
        approvedFrequency: it.approvedFrequency ?? null,
        requestedDate: it.requestedDate,
        requestedTime: it.requestedTime,
        status: it.status,
        salesManagerName: sm.name || sm.email || "",
        salesManagerUnitType: unitType,
        salesManagerUnitName: unitName,
        campaignName: it.campaignName || "",
        adCategoryName: it.adCategory?.name || ""
      };
    });

    return res.json({ docs, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    console.error("listMarketingLeadRequests error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMarketingLeadRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;

    const doc = await LeadRequest.findOne({ _id: id, company: mm.company })
      .populate({ path: "country", select: "name" })
      .populate({ path: "state", select: "name" })
      .populate({ path: "destination", select: "name" })
      .populate({
        path: "salesManager",
        select: "name email type branch franchisee",
        populate: [{ path: "branch", select: "branchName" }, { path: "franchisee", select: "franchiseeName" }],
      })
      .populate({ path: "assignedDigitalMarketer", select: "name email" })
      .populate({ path: "assignedCreativeStaff", select: "name email" })
      .populate({ path: "adCategory", select: "name" })
      .lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });

    const sm = doc.salesManager || {};
    const unitType = sm.type || "Company";
    const unitName =
      unitType === "Branch" ? (sm.branch?.branchName || "") :
      unitType === "Franchisee" ? (sm.franchisee?.franchiseeName || "") :
      "Company";

    return res.json({
      _id: doc._id,
      countryId: doc.country?._id?.toString() || null,
      countryName: doc.country?.name || "",
      stateId: doc.state?._id?.toString() || null,
      stateName: doc.state?.name || "",
      destinationId: doc.destination?._id?.toString() || null,
      destinationName: doc.destination?.name || "",
      tourRef: doc.tourRef || "",
      startDate: doc.startDate,
      endDate: doc.endDate,
      quantity: doc.quantity,
      frequency: doc.frequency,

      approvedStartDate: doc.approvedStartDate,
      approvedEndDate: doc.approvedEndDate,
      approvedQuantity: doc.approvedQuantity,
      approvedFrequency: doc.approvedFrequency,

      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      status: doc.status,

      salesManagerName: sm.name || sm.email || "",
      salesManagerUnitType: unitType,
      salesManagerUnitName: unitName,

      assignedDigitalMarketerId: doc.assignedDigitalMarketer?._id?.toString() || null,
      assignedDigitalMarketerName: doc.assignedDigitalMarketer?.name || doc.assignedDigitalMarketer?.email || "",
      assignedCreativeStaffId: doc.assignedCreativeStaff?._id?.toString() || null,
      assignedCreativeStaffName: doc.assignedCreativeStaff?.name || doc.assignedCreativeStaff?.email || "",

      campaignName: doc.campaignName || "",
      messageForDigitalMarketer: doc.messageForDigitalMarketer || "",
      messageForCreativeStaff: doc.messageForCreativeStaff || "",
      updationReason: doc.updationReason || "",

      // NEW
      adCategoryId: doc.adCategory?._id?.toString() || null,
      adCategoryName: doc.adCategory?.name || "",
      adData: doc.adData || {},
      adCategorySnapshot: doc.adCategorySnapshot || null,

      rejectionReason: doc.rejectionReason || "",
      decisionBy: doc.decisionBy,
      decidedAt: doc.decidedAt,
    });
  } catch (err) {
    console.error("getMarketingLeadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function approveMarketingLeadRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const {
      digitalMarketerId,
      creativeStaffId,
      startDate: overrideStartDate,
      endDate: overrideEndDate,
      quantity: overrideQuantity,
      frequency: overrideFrequency,
      campaignName,
      messageForDigitalMarketer,
      messageForCreativeStaff,
      updationReason,

      // NEW
      adCategoryId,
      adData
    } = req.body || {};

    // DM required
    if (!digitalMarketerId) return res.status(400).json({ message: "Select a digital marketer" });
    if (!mongoose.isValidObjectId(digitalMarketerId))
      return res.status(400).json({ message: "Invalid digital marketer id" });

    const dm = await DigitalMarketer.findOne({ _id: digitalMarketerId, company: mm.company }).select("_id");
    if (!dm) return res.status(400).json({ message: "Digital marketer not found in your company" });

    // Optional CS
    let csIdToSet = null;
    if (creativeStaffId) {
      if (!mongoose.isValidObjectId(creativeStaffId))
        return res.status(400).json({ message: "Invalid creative staff id" });
      const cs = await CreativeStaff.findOne({ _id: creativeStaffId, company: mm.company }).select("_id");
      if (!cs) return res.status(400).json({ message: "Creative staff not found in your company" });
      csIdToSet = cs._id;
    }

    // Require ad category + validate adData
    if (!adCategoryId || !mongoose.isValidObjectId(adCategoryId))
      return res.status(400).json({ message: "Select a valid ad category" });

    const cat = await AdCategory.findOne({ _id: adCategoryId, company: mm.company, isActive: true }).lean();
    if (!cat) return res.status(400).json({ message: "Ad category not found in your company" });

    let normalizedAdData = {};
    try {
      normalizedAdData = validateAdDataForCategory(cat, adData);
    } catch (e) {
      return res.status(e?.status || 400).json({ message: e?.message || "Invalid ad data" });
    }

    // Build update
    const update = {
      status: "approved",
      assignedDigitalMarketer: dm._id,
      assignedCreativeStaff: csIdToSet,
      decisionBy: mm._id,
      decidedAt: new Date(),
      rejectionReason: "",
      campaignName: (campaignName || "").trim(),
      messageForDigitalMarketer: (messageForDigitalMarketer || "").trim(),
      messageForCreativeStaff: (messageForCreativeStaff || "").trim(),
      updationReason: (updationReason || "").trim(),

      adCategory: cat._id,
      adData: normalizedAdData,
      adCategorySnapshot: {
        _id: cat._id,
        name: cat.name,
        description: cat.description || "",
        fields: (cat.fields || []).map(f => ({
          key: f.key, label: f.label, type: f.type,
          required: !!f.required, order: f.order || 0, config: f.config || {}
        }))
      }
    };

    // Overrides
    if (overrideStartDate) {
      const s = new Date(overrideStartDate);
      if (Number.isNaN(s.getTime())) return res.status(400).json({ message: "Invalid override start date" });
      update.approvedStartDate = s;
    } else update.approvedStartDate = null;

    if (overrideEndDate) {
      const e = new Date(overrideEndDate);
      if (Number.isNaN(e.getTime())) return res.status(400).json({ message: "Invalid override end date" });
      update.approvedEndDate = e;
    } else update.approvedEndDate = null;

    if (overrideStartDate && overrideEndDate) {
      if (new Date(overrideEndDate) < new Date(overrideStartDate))
        return res.status(400).json({ message: "Override end date cannot be earlier than start date" });
    }

    if (overrideQuantity !== undefined && overrideQuantity !== null) {
      const q = Number(overrideQuantity);
      if (!Number.isFinite(q) || q < 1) return res.status(400).json({ message: "Invalid override quantity" });
      update.approvedQuantity = q;
    } else update.approvedQuantity = null;

    if (overrideFrequency !== undefined && overrideFrequency !== null) {
      const f = String(overrideFrequency).toLowerCase();
      if (!ALLOWED_FREQ.has(f)) return res.status(400).json({ message: "Invalid override frequency" });
      update.approvedFrequency = f;
    } else update.approvedFrequency = null;

    const doc = await LeadRequest.findOneAndUpdate(
      { _id: id, company: mm.company },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json({ message: "Approved", id: doc._id });
  } catch (err) {
    console.error("approveMarketingLeadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function rejectMarketingLeadRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const { reason, updationReason } = req.body || {};

    const doc = await LeadRequest.findOneAndUpdate(
      { _id: id, company: mm.company },
      {
        $set: {
          status: "rejected",
          assignedDigitalMarketer: null,
          assignedCreativeStaff: null,
          approvedStartDate: null,
          approvedEndDate: null,
          approvedQuantity: null,
          approvedFrequency: null,
          rejectionReason: (reason || "").trim(),
          updationReason: (updationReason || "").trim(),
          decisionBy: mm._id,
          decidedAt: new Date(),

          // NEW: clear ad category payload on reject
          adCategory: null,
          adData: {},
          adCategorySnapshot: null
        },
      },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json({ message: "Rejected", id: doc._id });
  } catch (err) {
    console.error("rejectMarketingLeadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /marketingManager/daily-task-requests
export async function listMarketingDailyTaskRequests(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 7,
      task,
      status,
      date,               // filter by any date in 'dates' array
      salesManagerText,   // name/email contains
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    const filter = { company: mm.company };
    if (task) filter.task = task;
    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0,0,0,0);
        const end = new Date(d);   end.setHours(23,59,59,999);
        filter.dates = { $elemMatch: { $gte: start, $lte: end } };
      }
    }

    // Sales Manager fuzzy (same company)
    if (salesManagerText && salesManagerText.trim()) {
      const rx = new RegExp(escapeRegex(salesManagerText.trim()), "i");
      const sms = await SalesManager.find({
        company: mm.company,
        $or: [{ name: rx }, { email: rx }],
      }).select("_id").lean();

      if (!sms.length)
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });

      filter.salesManager = { $in: sms.map((s) => s._id) };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DailyTaskRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({
          path: "salesManager",
          select: "name email type branch franchisee",
          populate: [
            { path: "branch", select: "branchName" },
            { path: "franchisee", select: "franchiseeName" },
          ],
        })
        .populate({ path: "assignedCreativeStaff", select: "name email" }) // NEW
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DailyTaskRequest.countDocuments(filter),
    ]);

    const docs = items.map((it) => {
      const sm = it.salesManager || {};
      const unitType = sm.type || "Company";
      const unitName =
        unitType === "Branch"
          ? sm.branch?.branchName || ""
          : unitType === "Franchisee"
          ? sm.franchisee?.franchiseeName || ""
          : "Company";

      return {
        _id: it._id,
        destinationName: it.destination?.name || "",
        task: it.task || "",
        dates: it.dates || [],
        quantity: it.quantity,
        requestedDate: it.requestedDate,
        requestedTime: it.requestedTime,
        status: it.status,

        // MM overrides
        approvedDates: it.approvedDates || [],
        approvedQuantity: it.approvedQuantity ?? null,

        // NEW
        campaignName: it.campaignName || "",
        assignedCreativeStaffName:
          it.assignedCreativeStaff?.name || it.assignedCreativeStaff?.email || "",

        salesManagerName: sm.name || sm.email || "",
        salesManagerUnitType: unitType,
        salesManagerUnitName: unitName,
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
    console.error("listMarketingDailyTaskRequests error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /marketingManager/daily-task-requests/:id
export async function getMarketingDailyTaskRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;

    const doc = await DailyTaskRequest.findOne({ _id: id, company: mm.company })
      .populate({ path: "country", select: "name" })
      .populate({ path: "state", select: "name" })
      .populate({ path: "destination", select: "name" })
      .populate({
        path: "salesManager",
        select: "name email type branch franchisee",
        populate: [
          { path: "branch", select: "branchName" },
          { path: "franchisee", select: "franchiseeName" },
        ],
      })
      .populate({ path: "assignedDigitalMarketer", select: "name email" })
      .populate({ path: "assignedCreativeStaff", select: "name email" }) // NEW
      .lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });

    const sm = doc.salesManager || {};
    const unitType = sm.type || "Company";
    const unitName =
      unitType === "Branch"
        ? sm.branch?.branchName || ""
        : unitType === "Franchisee"
        ? sm.franchisee?.franchiseeName || ""
        : "Company";

    return res.json({
      _id: doc._id,
      countryId: doc.country?._id?.toString() || null,
      countryName: doc.country?.name || "",
      stateId: doc.state?._id?.toString() || null,
      stateName: doc.state?.name || "",
      destinationId: doc.destination?._id?.toString() || null,
      destinationName: doc.destination?.name || "",

      task: doc.task,
      dates: (doc.dates || []).map((d) => d?.toISOString?.() || d),
      quantity: doc.quantity,
      details: doc.details || "",

      // MM override fields
      approvedDates: (doc.approvedDates || []).map((d) => d?.toISOString?.() || d),
      approvedQuantity: doc.approvedQuantity,

      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      status: doc.status,

      salesManagerName: sm.name || sm.email || "",
      salesManagerUnitType: unitType,
      salesManagerUnitName: unitName,

      assignedDigitalMarketerId: doc.assignedDigitalMarketer?._id?.toString() || null,
      assignedDigitalMarketerName:
        doc.assignedDigitalMarketer?.name || doc.assignedDigitalMarketer?.email || "",

      // NEW
      assignedCreativeStaffId: doc.assignedCreativeStaff?._id?.toString() || null,
      assignedCreativeStaffName:
        doc.assignedCreativeStaff?.name || doc.assignedCreativeStaff?.email || "",
      campaignName: doc.campaignName || "",
      messageForDigitalMarketer: doc.messageForDigitalMarketer || "",
      messageForCreativeStaff: doc.messageForCreativeStaff || "",
      updationReason: doc.updationReason || "",

      rejectionReason: doc.rejectionReason || "",
      decisionBy: doc.decisionBy,
      decidedAt: doc.decidedAt,
    });
  } catch (err) {
    console.error("getMarketingDailyTaskRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/daily-task-requests/:id/approve
export async function approveMarketingDailyTaskRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const {
      digitalMarketerId,
      creativeStaffId,                // NEW
      dates: approvedDatesInput,      // array of 'YYYY-MM-DD' strings (optional)
      quantity: approvedQuantityInput,// number (optional)
      campaignName,                   // NEW
      messageForDigitalMarketer,      // NEW
      messageForCreativeStaff,        // NEW
      updationReason,
    } = req.body || {};

    if (!digitalMarketerId) {
      return res.status(400).json({ message: "Select a digital marketer" });
    }
    if (!mongoose.isValidObjectId(digitalMarketerId)) {
      return res.status(400).json({ message: "Invalid digital marketer id" });
    }

    const dm = await DigitalMarketer.findOne({ _id: digitalMarketerId, company: mm.company })
      .select("_id");
    if (!dm) return res.status(400).json({ message: "Digital marketer not found in your company" });

    // Validate creative staff (optional)
    let csIdToSet = null;
    if (creativeStaffId) {
      if (!mongoose.isValidObjectId(creativeStaffId)) {
        return res.status(400).json({ message: "Invalid creative staff id" });
      }
      const cs = await CreativeStaff.findOne({
        _id: creativeStaffId,
        company: mm.company,
      }).select("_id");
      if (!cs) return res.status(400).json({ message: "Creative staff not found in your company" });
      csIdToSet = cs._id;
    }

    // Normalize approved dates (optional)
    let approvedDates = [];
    if (Array.isArray(approvedDatesInput) && approvedDatesInput.length) {
      const set = new Set();
      for (const s of approvedDatesInput) {
        const day = String(s || "").slice(0, 10);
        if (!day) continue;
        const d = new Date(day);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ message: `Invalid approved date: ${s}` });
        }
        set.add(d.toISOString());
      }
      approvedDates = Array.from(set).map((iso) => new Date(iso));
    }

    // Normalize approved quantity (optional)
    let approvedQuantity = null;
    if (approvedQuantityInput !== undefined && approvedQuantityInput !== null) {
      const q = Number(approvedQuantityInput);
      if (!Number.isFinite(q) || q < 1) {
        return res.status(400).json({ message: "Invalid override quantity" });
      }
      approvedQuantity = q;
    }

    const update = {
      status: "approved",
      assignedDigitalMarketer: dm._id,
      assignedCreativeStaff: csIdToSet, // NEW
      decisionBy: mm._id,
      decidedAt: new Date(),
      rejectionReason: "",
      approvedDates,                   // can be empty [] if not provided
      approvedQuantity,                // can be null if not provided

      // NEW meta/messages
      campaignName: (campaignName || "").trim(),
      messageForDigitalMarketer: (messageForDigitalMarketer || "").trim(),
      messageForCreativeStaff: (messageForCreativeStaff || "").trim(),
      updationReason: (updationReason || "").trim(), 
    };

    const doc = await DailyTaskRequest.findOneAndUpdate(
      { _id: id, company: mm.company },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json({ message: "Approved", id: doc._id });
  } catch (err) {
    console.error("approveMarketingDailyTaskRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/daily-task-requests/:id/reject
export async function rejectMarketingDailyTaskRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const { reason, updationReason } = req.body || {};

    const doc = await DailyTaskRequest.findOneAndUpdate(
      { _id: id, company: mm.company },
      {
        $set: {
          status: "rejected",
          assignedDigitalMarketer: null,
          assignedCreativeStaff: null,          // NEW
          approvedDates: [],
          approvedQuantity: null,
          rejectionReason: (reason || "").trim(),
          updationReason: (updationReason || "").trim(), // NEW
          decisionBy: mm._id,
          decidedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json({ message: "Rejected", id: doc._id });
  } catch (err) {
    console.error("rejectMarketingDailyTaskRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listMarketingUploadRequests(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 7,
      category,
      status,
      publishingDate,
      salesManagerText,
      filename,
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);
    const skip = (page - 1) * limit;

    const filter = { company: mm.company };
    if (category) filter.category = category;
    if (status) filter.status = status;

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

    if (filename && filename.trim()) {
      filter.filename = { $regex: escapeRegex(filename.trim()), $options: "i" };
    }

    // Sales Manager by name/email (regex → IDs)
    if (salesManagerText && salesManagerText.trim()) {
      const regex = new RegExp(salesManagerText.trim(), "i");
      const sms = await SalesManager.find({
        company: mm.company,
        $or: [{ name: regex }, { email: regex }],
      })
        .select("_id")
        .lean();
      if (!sms.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.salesManager = { $in: sms.map((s) => s._id) };
    }

    const [items, total] = await Promise.all([
      UploadRequest.find(filter)
        .populate({
          path: "salesManager",
          select: "name email type branch franchisee",
          populate: [
            { path: "branch", select: "branchName" },
            { path: "franchisee", select: "franchiseeName" },
          ],
        })
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UploadRequest.countDocuments(filter),
    ]);

    const docs = items.map((it) => {
      const sm = it.salesManager || {};
      const unitType = sm.type || "Company";
      const unitName =
        unitType === "Branch"
          ? sm.branch?.branchName || ""
          : unitType === "Franchisee"
          ? sm.franchisee?.franchiseeName || ""
          : "Company";
      return {
        _id: it._id,
        category: it.category,
        filename: it.filename,
        publishingDate: it.publishingDate || null,
        approvedPublishingDate: it.approvedPublishingDate || null,
        requestedDate: it.requestedDate,
        requestedTime: it.requestedTime,
        status: it.status,
        salesManagerName: sm.name || sm.email || "",
        salesManagerUnitType: unitType,
        salesManagerUnitName: unitName,
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
    console.error("listMarketingUploadRequests error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /marketingManager/upload-requests/:id
export async function getMarketingUploadRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const doc = await UploadRequest.findOne({ _id: id, company: mm.company })
      .populate({
        path: "salesManager",
        select: "name email type branch franchisee",
        populate: [
          { path: "branch", select: "branchName" },
          { path: "franchisee", select: "franchiseeName" },
        ],
      })
      .populate({ path: "assignedDigitalMarketer", select: "name email" })
      .lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });

    const sm = doc.salesManager || {};
    const unitType = sm.type || "Company";
    const unitName =
      unitType === "Branch"
        ? sm.branch?.branchName || ""
        : unitType === "Franchisee"
        ? sm.franchisee?.franchiseeName || ""
        : "Company";

    return res.json({
      _id: doc._id,
      category: doc.category,
      filename: doc.filename,
      publishingDate: doc.publishingDate,
      approvedPublishingDate: doc.approvedPublishingDate,
      requestedDate: doc.requestedDate,
      requestedTime: doc.requestedTime,
      status: doc.status,
      salesManagerName: sm.name || sm.email || "",
      salesManagerUnitType: unitType,
      salesManagerUnitName: unitName,
      assignedDigitalMarketerId: doc.assignedDigitalMarketer?._id?.toString() || null,
      assignedDigitalMarketerName:
        doc.assignedDigitalMarketer?.name || doc.assignedDigitalMarketer?.email || "",
      assignedCreativeStaffId: doc.assignedCreativeStaff?._id?.toString() || null,
      assignedCreativeStaffName:
        doc.assignedCreativeStaff?.name || doc.assignedCreativeStaff?.email || "",
      messageForDigitalMarketer: doc.messageForDigitalMarketer || "",
      messageForCreativeStaff: doc.messageForCreativeStaff || "",
      updationReason: doc.updationReason || "",
      rejectionReason: doc.rejectionReason || "",
      decisionBy: doc.decisionBy,
      decidedAt: doc.decidedAt,
    });
  } catch (err) {
    console.error("getMarketingUploadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// POST /marketingManager/upload-requests/:id/approve
export async function approveMarketingUploadRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const {
      digitalMarketerId,
      creativeStaffId,
      publishingDate: overridePublishingDate,
      messageForDigitalMarketer,
      messageForCreativeStaff,
      updationReason,
    } = req.body || {};

    // --- Validation
    if (!digitalMarketerId) return res.status(400).json({ message: "Select a digital marketer" });
    if (!messageForDigitalMarketer?.trim())
      return res.status(400).json({ message: "Message for digital marketer is required" });

    if (creativeStaffId && !messageForCreativeStaff?.trim()) {
      return res
        .status(400)
        .json({ message: "Message for creative staff is required if staff is selected" });
    }

    if (overridePublishingDate && !updationReason?.trim()) {
      return res
        .status(400)
        .json({ message: "Updation reason is required when override publishing date is set" });
    }

    if (!mongoose.isValidObjectId(digitalMarketerId)) {
      return res.status(400).json({ message: "Invalid digital marketer id" });
    }
    const dm = await DigitalMarketer.findOne({ _id: digitalMarketerId, company: mm.company }).select("_id");
    if (!dm) return res.status(400).json({ message: "Digital marketer not found in your company" });

    let csIdToSet = null;
    if (creativeStaffId) {
      if (!mongoose.isValidObjectId(creativeStaffId)) {
        return res.status(400).json({ message: "Invalid creative staff id" });
      }
      const cs = await CreativeStaff.findOne({ _id: creativeStaffId, company: mm.company }).select("_id");
      if (!cs) return res.status(400).json({ message: "Creative staff not found in your company" });
      csIdToSet = cs._id;
    }

    // --- Build update
    const update = {
      status: "approved",
      assignedDigitalMarketer: dm._id,
      assignedCreativeStaff: csIdToSet,
      decisionBy: mm._id,
      decidedAt: new Date(),
      rejectionReason: "",
      messageForDigitalMarketer: messageForDigitalMarketer?.trim(),
      messageForCreativeStaff: messageForCreativeStaff?.trim(),
      updationReason: updationReason?.trim(),
    };

    if (overridePublishingDate) {
      const d = new Date(overridePublishingDate);
      if (Number.isNaN(d.getTime()))
        return res.status(400).json({ message: "Invalid override publishing date" });
      update.approvedPublishingDate = d;
    } else {
      update.approvedPublishingDate = null;
    }

    const doc = await UploadRequest.findOneAndUpdate(
      { _id: id, company: mm.company },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json({ message: "Approved", id: doc._id });
  } catch (err) {
    console.error("approveMarketingUploadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/upload-requests/:id/reject
export async function rejectMarketingUploadRequest(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const { reason, updationReason } = req.body || {};

    const doc = await UploadRequest.findOneAndUpdate(
      { _id: id, company: mm.company },
      {
        $set: {
          status: "rejected",
          assignedDigitalMarketer: null,
          assignedCreativeStaff: null,
          approvedPublishingDate: null,
          rejectionReason: (reason || "").trim(),
          updationReason: (updationReason || "").trim(),
          decisionBy: mm._id,
          decidedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json({ message: "Rejected", id: doc._id });
  } catch (err) {
    console.error("rejectMarketingUploadRequest error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


const slugify = (s = "") =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Ensure no duplicate field key within category
function assertUniqueFieldKey(category, key, ignoreFieldId = null) {
  const dup = (category.fields || []).find(
    (f) => f.key === key && String(f._id) !== String(ignoreFieldId || "")
  );
  if (dup) {
    const err = new Error(`Field key "${key}" already exists in this category`);
    err.status = 400;
    throw err;
  }
}

// ============== Category CRUD ==============
export async function listAdCategories(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const cats = await AdCategory.find({ company: mm.company })
      .sort({ name: 1 })
      .lean();

    // sort fields by order on the way out
    const docs = (cats || []).map((c) => ({
      ...c,
      fields: [...(c.fields || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    }));

    return res.json(docs);
  } catch (err) {
    console.error("listAdCategories error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAdCategory(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const cat = await AdCategory.findOne({ _id: id, company: mm.company }).lean();
    if (!cat) return res.status(404).json({ message: "Category not found" });

    cat.fields = [...(cat.fields || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    return res.json(cat);
  } catch (err) {
    console.error("getAdCategory error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createAdCategory(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { name, description = "", isActive = true } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const doc = await AdCategory.create({
      company: mm.company,
      name: String(name).trim(),
      description: String(description || "").trim(),
      isActive: Boolean(isActive),
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("createAdCategory error:", err);
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Category name already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateAdCategory(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const { name, description, isActive } = req.body || {};

    const payload = {};
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ message: "Name is required" });
      payload.name = String(name).trim();
    }
    if (description !== undefined) payload.description = String(description || "").trim();
    if (isActive !== undefined) payload.isActive = Boolean(isActive);

    const doc = await AdCategory.findOneAndUpdate(
      { _id: id, company: mm.company },
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Category not found" });
    return res.json(doc);
  } catch (err) {
    console.error("updateAdCategory error:", err);
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Category name already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteAdCategory(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const doc = await AdCategory.findOneAndDelete({ _id: id, company: mm.company }).lean();
    if (!doc) return res.status(404).json({ message: "Category not found" });

    return res.json({ message: "Deleted", id: doc._id });
  } catch (err) {
    console.error("deleteAdCategory error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ============== Fields CRUD (within a category) ==============
export async function addAdField(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params; // category id
    const {
      key,
      label,
      type,
      required = false,
      config = {},
    } = req.body || {};

    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: "Field label is required" });
    }
    if (!type || !FIELD_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid field type" });
    }

    const cat = await AdCategory.findOne({ _id: id, company: mm.company });
    if (!cat) return res.status(404).json({ message: "Category not found" });

    const finalKey = slugify(key || label);
    if (!finalKey) return res.status(400).json({ message: "Field key is required" });
    assertUniqueFieldKey(cat, finalKey);

    const nextOrder =
      (cat.fields?.length ? Math.max(...cat.fields.map((f) => f.order || 0)) : 0) + 1;

    // basic configuration pruning per type
    const fieldConfig = {
      placeholder: config.placeholder || "",
      helpText: config.helpText || "",
    };

    if (type === "select" || type === "multiselect") {
      fieldConfig.options = Array.isArray(config.options)
        ? config.options
            .map((o) => ({
              label: String(o?.label || "").trim(),
              value: slugify(o?.value || o?.label || ""),
            }))
            .filter((o) => o.label && o.value)
        : [];
    }

    if (type === "destinations") {
      fieldConfig.multiple = !!config.multiple;
    }

    if (type === "number") {
      if (config.min !== undefined) fieldConfig.min = Number(config.min);
      if (config.max !== undefined) fieldConfig.max = Number(config.max);
    }

    if (config.defaultValue !== undefined) {
      fieldConfig.defaultValue = config.defaultValue;
    }

    cat.fields.push({
      key: finalKey,
      label: String(label).trim(),
      type,
      required: !!required,
      order: nextOrder,
      config: fieldConfig,
    });

    await cat.save();
    const out = cat.toObject();
    out.fields.sort((a, b) => (a.order || 0) - (b.order || 0));
    return res.status(201).json(out);
  } catch (err) {
    console.error("addAdField error:", err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
  }
}

export async function updateAdField(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id, fieldId } = req.params;
    const { key, label, type, required, config } = req.body || {};

    const cat = await AdCategory.findOne({ _id: id, company: mm.company });
    if (!cat) return res.status(404).json({ message: "Category not found" });

    const field = cat.fields.id(fieldId);
    if (!field) return res.status(404).json({ message: "Field not found" });

    if (key !== undefined) {
      const finalKey = slugify(key);
      if (!finalKey) return res.status(400).json({ message: "Field key is required" });
      assertUniqueFieldKey(cat, finalKey, fieldId);
      field.key = finalKey;
    }
    if (label !== undefined) {
      if (!String(label).trim()) return res.status(400).json({ message: "Label is required" });
      field.label = String(label).trim();
    }
    if (type !== undefined) {
      if (!FIELD_TYPES.includes(type)) {
        return res.status(400).json({ message: "Invalid field type" });
      }
      field.type = type;
      // clear config when type changes
      field.config = {};
    }
    if (required !== undefined) field.required = !!required;

    if (config !== undefined) {
      const next = {
        placeholder: config.placeholder || "",
        helpText: config.helpText || "",
      };
      if (field.type === "select" || field.type === "multiselect") {
        next.options = Array.isArray(config.options)
          ? config.options
              .map((o) => ({
                label: String(o?.label || "").trim(),
                value: slugify(o?.value || o?.label || ""),
              }))
              .filter((o) => o.label && o.value)
          : [];
      }
      if (field.type === "destinations") {
        next.multiple = !!config.multiple;
      }
      if (field.type === "number") {
        if (config.min !== undefined) next.min = Number(config.min);
        if (config.max !== undefined) next.max = Number(config.max);
      }
      if (config.defaultValue !== undefined) next.defaultValue = config.defaultValue;

      field.config = next;
    }

    await cat.save();
    const out = cat.toObject();
    out.fields.sort((a, b) => (a.order || 0) - (b.order || 0));
    return res.json(out);
  } catch (err) {
    console.error("updateAdField error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

export async function deleteAdField(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id, fieldId } = req.params;
    const cat = await AdCategory.findOne({ _id: id, company: mm.company });
    if (!cat) return res.status(404).json({ message: "Category not found" });

    const field = cat.fields.id(fieldId);
    if (!field) return res.status(404).json({ message: "Field not found" });

    field.deleteOne();
    await cat.save();

    return res.json({ message: "Field deleted", id: fieldId });
  } catch (err) {
    console.error("deleteAdField error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function reorderAdFields(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { id } = req.params;
    const { order } = req.body || {}; // array of fieldIds in desired order

    if (!Array.isArray(order) || !order.length) {
      return res.status(400).json({ message: "Order array is required" });
    }

    const cat = await AdCategory.findOne({ _id: id, company: mm.company });
    if (!cat) return res.status(404).json({ message: "Category not found" });

    const idSet = new Set(cat.fields.map((f) => String(f._id)));
    for (const fid of order) {
      if (!idSet.has(String(fid))) {
        return res.status(400).json({ message: `Unknown field id in order: ${fid}` });
      }
    }

    // Assign order index based on provided array
    const idxById = new Map(order.map((fid, i) => [String(fid), i + 1]));
    cat.fields.forEach((f) => {
      f.order = idxById.has(String(f._id)) ? idxById.get(String(f._id)) : f.order;
    });

    await cat.save();
    const out = cat.toObject();
    out.fields.sort((a, b) => (a.order || 0) - (b.order || 0));
    return res.json(out);
  } catch (err) {
    console.error("reorderAdFields error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

//adrequestmanagement after creative staff done it //
const isValidId = (id) => mongoose.isValidObjectId(id);

export async function listCompanyCreativeAdRequests(req, res) {
  try {
    // Get manager & its company
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      task,
      deadlineDate,       // yyyy-mm-dd (matches approvedDate OR date)
      rescheduledDate,    // yyyy-mm-dd
      status,             // creativeStatus: pending|waiting|approved|rejected
      creativeStaffText,  // filter by CS name/email
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // ONLY items that are formally approved by marketing manager
    const filter = {
      company: mm.company,
      status: "approved",
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

    // Creative status (now includes approved & rejected)
    if (["pending", "waiting", "approved", "rejected"].includes(status)) {
      filter.creativeStatus = status;
    }

    // Filter by Creative Staff name/email (text)
    let csIdSet = null;
    if (creativeStaffText && creativeStaffText.trim()) {
      const regex = new RegExp(creativeStaffText.trim(), "i");
      const staff = await CreativeStaff.find({
        $or: [{ name: regex }, { email: regex }],
        company: mm.company,
      }).select("_id").lean();
      if (!staff.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      csIdSet = new Set(staff.map((s) => String(s._id)));
      filter.assignedCreativeStaff = { $in: [...csIdSet] };
    }

    const [items, total] = await Promise.all([
      AdRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({ path: "assignedCreativeStaff", select: "name email" })
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
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
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
    console.error("listCompanyCreativeAdRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCompanyCreativeAdRequest(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdRequest.findOne({
      _id: id,
      company: mm.company,
      status: "approved",
    })
      .populate({ path: "destination", select: "name" })
      .populate({ path: "assignedCreativeStaff", select: "name email" })
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
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
      resheduledatewithreason: r.resheduledatewithreason || [],
    });
  } catch (e) {
    console.error("getCompanyCreativeAdRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function approveCompanyCreativeAdRequest(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdRequest.findOne({
      _id: id,
      company: mm.company,
      status: "approved",
    });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "approved";
    r.creativeRejectionReason = "";
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to approved" });
  } catch (e) {
    console.error("approveCompanyCreativeAdRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function rejectCompanyCreativeAdRequest(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdRequest.findOne({
      _id: id,
      company: mm.company,
      status: "approved",
    });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "rejected";
    r.creativeRejectionReason = String(reason).trim();
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to rejected" });
  } catch (e) {
    console.error("rejectCompanyCreativeAdRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//leadrequestmanagement after assigning to creative staff//
export async function listCompanyCreativeLeadRequests(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      frequency,       // daily|weekly|monthly
      dateWithin,      // yyyy-mm-dd lies within approved window OR original window
      status,          // creativeStatus: pending|waiting|approved|rejected
      creativeStaffText,
    } = req.query;

    page  = Math.max(1, parseInt(page, 10)  || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Only items formally approved by Marketing Manager
    const filter = { company: mm.company, status: "approved" };

    if (destinationId && isValidId(destinationId)) filter.destination = destinationId;

    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    if (frequency && ["daily", "weekly", "monthly"].includes(frequency)) {
      // approvedFrequency if present, else original frequency
      filter.$or = [
        { approvedFrequency: frequency },
        { $and: [{ approvedFrequency: null }, { frequency }] },
      ];
    }

    if (dateWithin) {
      const d = new Date(dateWithin);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0,0,0,0);
        const end   = new Date(d); end.setHours(23,59,59,999);
        // Date lies in [approvedStart..approvedEnd] OR (no approved window -> [start..end])
        filter.$or = [
          { $and: [
              { approvedStartDate: { $ne: null } },
              { approvedEndDate:   { $ne: null } },
              { approvedStartDate: { $lte: end } },
              { approvedEndDate:   { $gte: start } },
          ]},
          { $and: [
              { approvedStartDate: null },
              { approvedEndDate:   null },
              { startDate: { $lte: end } },
              { endDate:   { $gte: start } },
          ]},
        ];
      }
    }

    const allowed = new Set(["pending", "waiting", "approved", "rejected"]);
    if (allowed.has(String(status || "").toLowerCase())) {
      filter.creativeStatus = String(status).toLowerCase();
    }

    if (creativeStaffText && creativeStaffText.trim()) {
      const regex = new RegExp(creativeStaffText.trim(), "i");
      const staff = await CreativeStaff.find({
        $or: [{ name: regex }, { email: regex }],
        company: mm.company,
      }).select("_id").lean();
      if (!staff.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.assignedCreativeStaff = { $in: staff.map((s) => s._id) };
    }

    const [items, total] = await Promise.all([
      LeadRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({ path: "assignedCreativeStaff", select: "name email" })
        .sort({ decidedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadRequest.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef,
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.frequency,
      approvedFrequency: r.approvedFrequency ?? null,
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
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
    console.error("listCompanyCreativeLeadRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /marketingManager/creative-lead-requests/:id
export async function getCompanyCreativeLeadRequest(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadRequest.findOne({
      _id: id,
      company: mm.company,
      status: "approved",
    })
      .populate({ path: "destination", select: "name" })
      .populate({ path: "assignedCreativeStaff", select: "name email" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef,
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.frequency,
      approvedFrequency: r.approvedFrequency ?? null,
      details: r.details || "", // if you store extra notes
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
    });
  } catch (e) {
    console.error("getCompanyCreativeLeadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/creative-lead-requests/:id/approve
export async function approveCompanyCreativeLeadRequest(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadRequest.findOne({ _id: id, company: mm.company, status: "approved" });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "approved";
    r.creativeRejectionReason = "";
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to approved" });
  } catch (e) {
    console.error("approveCompanyCreativeLeadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/creative-lead-requests/:id/reject
export async function rejectCompanyCreativeLeadRequest(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadRequest.findOne({ _id: id, company: mm.company, status: "approved" });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "rejected";
    r.creativeRejectionReason = String(reason).trim();
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to rejected" });
  } catch (e) {
    console.error("rejectCompanyCreativeLeadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
//uploadrequest management after assigning to creative staff//
export async function listCompanyCreativeUploadRequests(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      categoryText,
      filenameText,
      publishingDate,      // yyyy-mm-dd (approvedPublishingDate || publishingDate)
      status,              // creativeStatus: pending|waiting|approved|rejected
      creativeStaffText,   // name/email contains
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: mm.company,
      status: "approved", // only MM-approved requests are visible here
    };

    if (categoryText && categoryText.trim()) {
      filter.category = new RegExp(categoryText.trim(), "i");
    }

    if (filenameText && filenameText.trim()) {
      filter.filename = new RegExp(filenameText.trim(), "i");
    }

    // Publishing date (approvedPublishingDate || publishingDate)
    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end   = new Date(d); end.setHours(23, 59, 59, 999);
        filter.$or = [
          ...(filter.$or || []),
          { approvedPublishingDate: { $gte: start, $lte: end } },
          { $and: [{ approvedPublishingDate: null }, { publishingDate: { $gte: start, $lte: end } }] },
        ];
      }
    }

    if (["pending", "waiting", "approved", "rejected"].includes(status)) {
      filter.creativeStatus = status;
    }

    if (creativeStaffText && creativeStaffText.trim()) {
      const rx = new RegExp(creativeStaffText.trim(), "i");
      const staff = await CreativeStaff.find({
        company: mm.company,
        $or: [{ name: rx }, { email: rx }],
      }).select("_id").lean();
      if (!staff.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.assignedCreativeStaff = { $in: staff.map((s) => s._id) };
    }

    const [items, total] = await Promise.all([
      UploadRequest.find(filter)
        .populate({ path: "assignedCreativeStaff", select: "name email" })
        .sort({ decidedAt: -1 })
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
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
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
    console.error("listCompanyCreativeUploadRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /marketingManager/creative-upload-requests/:id
export async function getCompanyCreativeUploadRequest(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await UploadRequest.findOne({
      _id: id,
      company: mm.company,
      status: "approved",
    })
      .populate({ path: "assignedCreativeStaff", select: "name email" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      approvedPublishingDate: r.approvedPublishingDate || null,
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
    });
  } catch (e) {
    console.error("getCompanyCreativeUploadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/creative-upload-requests/:id/approve
export async function approveCompanyCreativeUploadRequest(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await UploadRequest.findOne({
      _id: id,
      company: mm.company,
      status: "approved",
    });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "approved";
    r.creativeRejectionReason = "";
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to approved" });
  } catch (e) {
    console.error("approveCompanyCreativeUploadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/creative-upload-requests/:id/reject
export async function rejectCompanyCreativeUploadRequest(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await UploadRequest.findOne({
      _id: id,
      company: mm.company,
      status: "approved",
    });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "rejected";
    r.creativeRejectionReason = String(reason).trim();
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to rejected" });
  } catch (e) {
    console.error("rejectCompanyCreativeUploadRequest error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function listCompanyDmAdRequests(req, res) {
  try {
    // Scope by the logged-in Digital Marketer's company
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationText,
      task,
      publishingDate, // yyyy-mm-dd
      posted,         // "true" | "false"
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const skip = (page - 1) * limit;

    // Core condition: same company, and MM has approved the request
    const filter = {
      company: mm.company,
      status: "approved",
    };

    // Destination text -> fuzzy match by Destination.name
    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    // Task enum
    if (task) filter.task = task;

    // Publishing Date (match approvedDate || date)
    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.$or = [
          { approvedDate: { $gte: start, $lte: end } },
          { $and: [{ approvedDate: null }, { date: { $gte: start, $lte: end } }] },
        ];
      }
    }

    // Posted filter using dmPostStatus
    if (posted === "true") filter.dmPostStatus = true;
    if (posted === "false") filter.dmPostStatus = { $ne: true }; // false or null

    const [items, total] = await Promise.all([
      AdRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({ path: "assignedDigitalMarketer", select: "name email" })
        .sort({ approvedDate: -1, date: -1, createdAt: -1 })
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
      digitalMarketerName: r.assignedDigitalMarketer?.name || "",
      digitalMarketerEmail: r.assignedDigitalMarketer?.email || "",
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
    console.error("listCompanyDmAdRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listCompanyDmLeadRequests(req, res) {
  try {
    // Scope by the logged-in Marketing Manager's company
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationText,
      tourText,     // fuzzy match tourRef
      frequency,    // daily|weekly|monthly
      startDate,    // yyyy-mm-dd (approvedStartDate || startDate)
      posted,       // "true" | "false"
    } = req.query;

    page  = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const skip = (page - 1) * limit;

    // Core condition: same company, and request is approved by MM
    const filter = {
      company: mm.company,
      status: "approved",
    };

    // Destination text -> fuzzy match by Destination.name
    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    // Tour text fuzzy on tourRef (display string)
    if (tourText && tourText.trim()) {
      const regex = new RegExp(tourText.trim(), "i");
      filter.tourRef = regex;
    }

    // Frequency
    if (["daily", "weekly", "monthly"].includes(frequency)) {
      // Match either approvedFrequency or fallback frequency
      filter.$or ??= [];
      filter.$or.push(
        { approvedFrequency: frequency },
        { $and: [{ approvedFrequency: null }, { frequency }] }
      );
    }

    // Start date (approvedStartDate || startDate) – single-day window
    if (startDate) {
      const d = new Date(startDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end   = new Date(d); end.setHours(23, 59, 59, 999);
        filter.$or ??= [];
        filter.$or.push(
          { approvedStartDate: { $gte: start, $lte: end } },
          { $and: [{ approvedStartDate: null }, { startDate: { $gte: start, $lte: end } }] }
        );
      }
    }

    // Posted filter using dmPostStatus
    if (posted === "true") filter.dmPostStatus = true;
    if (posted === "false") filter.dmPostStatus = { $ne: true }; // false or null

    const [items, total] = await Promise.all([
      LeadRequest.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({ path: "assignedDigitalMarketer", select: "name email" })
        .sort({ approvedStartDate: -1, startDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadRequest.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef || "",
      startDate: r.startDate,
      endDate: r.endDate,
      approvedStartDate: r.approvedStartDate || null,
      approvedEndDate: r.approvedEndDate || null,
      quantity: r.quantity,
      approvedQuantity: r.approvedQuantity ?? null,
      frequency: r.frequency,
      approvedFrequency: r.approvedFrequency || null,
      digitalMarketerName: r.assignedDigitalMarketer?.name || "",
      digitalMarketerEmail: r.assignedDigitalMarketer?.email || "",
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
    console.error("listCompanyDmLeadRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listCompanyDmUploadRequests(req, res) {
  try {
    // Scope to the logged-in Marketing Manager's company
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      filenameText,   // fuzzy match on filename
      categoryText,   // fuzzy match on category
      publishingDate, // yyyy-mm-dd (approvedPublishingDate || publishingDate)
      posted,         // "true" | "false" via dmPostStatus
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const skip = (page - 1) * limit;

    // Core condition: same company and approved by MM
    const filter = {
      company: mm.company,
      status: "approved",
    };

    if (filenameText && filenameText.trim()) {
      const regex = new RegExp(filenameText.trim(), "i");
      filter.filename = regex;
    }

    if (categoryText && categoryText.trim()) {
      const regex = new RegExp(categoryText.trim(), "i");
      filter.category = regex;
    }

    // Publishing date (approvedPublishingDate || publishingDate)
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

    // Posted filter
    if (posted === "true") filter.dmPostStatus = true;
    if (posted === "false") filter.dmPostStatus = { $ne: true }; // false or null

    const [items, total] = await Promise.all([
      UploadRequest.find(filter)
        .populate({ path: "assignedDigitalMarketer", select: "name email" })
        .sort({ approvedPublishingDate: -1, publishingDate: -1, createdAt: -1 })
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
      digitalMarketerName: r.assignedDigitalMarketer?.name || "",
      digitalMarketerEmail: r.assignedDigitalMarketer?.email || "",
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
    console.error("listCompanyDmUploadRequests error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function listCompanyDmAdTasks(req, res) {
  try {
    // Scope by the logged-in Marketing Manager's company
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationText,
      task,
      publishingDate, // yyyy-mm-dd
      posted,         // "true" | "false"
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const skip = (page - 1) * limit;

    // Core condition: same company (AdAssignment is already an assignment so no status filter)
    const filter = {
      company: mm.company,
    };

    // Destination text -> fuzzy match by Destination.name
    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    // Task enum
    if (task) filter.task = task;

    // Publishing Date (match AdAssignment.date)
    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      }
    }

    // Posted filter using dmPostStatus
    if (posted === "true") filter.dmPostStatus = true;
    if (posted === "false") filter.dmPostStatus = { $ne: true }; // false or null

    const [items, total] = await Promise.all([
      AdAssignment.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({ path: "assignedDigitalMarketer", select: "name email" })
        .sort({ date: -1, createdAt: -1 })
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
      quantity: r.quantity,
      // no approvedQuantity concept on AdAssignment, so we return quantity only (frontend uses r.approvedQuantity ?? r.quantity)
      approvedQuantity: null,
      digitalMarketerName: r.assignedDigitalMarketer?.name || "",
      digitalMarketerEmail: r.assignedDigitalMarketer?.email || "",
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
    console.error("listCompanyDmAdTasks error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function listCompanyDmLeadTasks(req, res) {
  try {
    // Scope by the logged-in Marketing Manager's company
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationText,
      campaignText, // fuzzy match campaignName
      frequency,    // daily|weekly|monthly
      startDate,    // yyyy-mm-dd (match LeadAssignment.startDate)
      posted,       // "true" | "false"
    } = req.query;

    page  = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const skip = (page - 1) * limit;

    // Core condition: same company
    const andClauses = [{ company: mm.company }];

    // Destination text -> fuzzy match by Destination.name
    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      andClauses.push({ destination: { $in: dests.map((d) => d._id) } });
    }

    // Campaign text fuzzy on campaignName
    if (campaignText && campaignText.trim()) {
      const regex = new RegExp(campaignText.trim(), "i");
      andClauses.push({ campaignName: regex });
    }

    // Frequency
    if (["daily", "weekly", "monthly"].includes(frequency)) {
      andClauses.push({ frequency });
    }

    // Start date – single-day window on startDate
    if (startDate) {
      const d = new Date(startDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end   = new Date(d); end.setHours(23, 59, 59, 999);
        andClauses.push({ startDate: { $gte: start, $lte: end } });
      }
    }

    // Posted filter using dmPostStatus
    if (posted === "true") {
      andClauses.push({ dmPostStatus: true });
    } else if (posted === "false") {
      andClauses.push({ dmPostStatus: { $ne: true } }); // false or null
    }

    const filter = andClauses.length > 1 ? { $and: andClauses } : andClauses[0];

    const [items, total] = await Promise.all([
      LeadAssignment.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({ path: "assignedDigitalMarketer", select: "name email" })
        .sort({ startDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadAssignment.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      campaignName: r.campaignName || "",
      startDate: r.startDate,
      endDate: r.endDate,
      quantity: r.quantity,
      frequency: r.frequency,
      digitalMarketerName: r.assignedDigitalMarketer?.name || "",
      digitalMarketerEmail: r.assignedDigitalMarketer?.email || "",
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
    console.error("listCompanyDmLeadTasks error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function listCompanyDmUploadAssignments(req, res) {
  try {
    // Ensure requester is a marketing manager and get his company
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let { page = 1, limit = 10, filenameText, categoryText, publishingDate, posted } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const skip = (page - 1) * limit;

    const filter = {
      company: mm.company,
    };

    // helper to escape regex special chars (treat user input as literal)
    const escapeRegExp = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (filenameText && filenameText.trim()) {
      filter.filename = new RegExp(escapeRegExp(filenameText.trim()), "i");
    }

    if (categoryText && categoryText.trim()) {
      filter.category = new RegExp(escapeRegExp(categoryText.trim()), "i");
    }

    // Publishing date filter (matches publishingDate within that calendar day)
    if (publishingDate) {
      // Build explicit start/end to avoid timezone surprises
      // Interpret publishingDate as yyyy-mm-dd
      const start = new Date(`${publishingDate}T00:00:00.000`);
      const end = new Date(`${publishingDate}T23:59:59.999`);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        filter.publishingDate = { $gte: start, $lte: end };
      }
    }

    // Posted filter
    if (posted === "true") filter.dmPostStatus = true;
    if (posted === "false") filter.dmPostStatus = { $ne: true }; // false or null

    // Project only necessary fields to reduce payload
    const projection = "category filename publishingDate assignedDigitalMarketer messageForDigitalMarketer creativeStatus dmPostStatus dmPostedAt createdAt";

    const [items, total] = await Promise.all([
      UploadAssignment.find(filter)
        .select(projection)
        .populate({ path: "assignedDigitalMarketer", select: "name email" })
        .sort({ publishingDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UploadAssignment.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate || null,
      digitalMarketerName: r.assignedDigitalMarketer?.name || "",
      digitalMarketerEmail: r.assignedDigitalMarketer?.email || "",
      messageForDigitalMarketer: r.messageForDigitalMarketer || "",
      creativeStatus: r.creativeStatus || "pending",
      dmPostStatus: !!r.dmPostStatus,
      dmPostedAt: r.dmPostedAt || null,
      createdAt: r.createdAt || null,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("listCompanyDmUploadAssignments error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function mmGetCountries(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const docs = await Country.find({ company: mm.company }).select("_id name").sort({ name: 1 });
    return res.json(docs);
  } catch (e) {
    console.error("mmGetCountries error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function mmGetStates(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { countryId } = req.params;
    const docs = await State.find({ company: mm.company, country: countryId })
      .select("_id name")
      .sort({ name: 1 });
    return res.json(docs);
  } catch (e) {
    console.error("mmGetStates error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function mmGetDestinations(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { countryId, stateId } = req.params;
    const docs = await Destination.find({
      company: mm.company,
      country: countryId,
      state: stateId,
      activeStatus: true,
    })
      .select("_id name")
      .sort({ name: 1 });
    return res.json(docs);
  } catch (e) {
    console.error("mmGetDestinations error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function createAdAssignment(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const {
      countryId,
      stateId,
      destinationId,
      task,
      date, // yyyy-mm-dd
      quantity,
      details,
      digitalMarketerId,
      messageForDigitalMarketer,
      creativeStaffId,
      messageForCreativeStaff,
    } = req.body || {};

    // basic validation
    if (!countryId || !stateId || !destinationId)
      return res.status(400).json({ message: "Country, state and destination are required" });

    if (!task || !["Poster", "Reel", "Video", "Review", "Staff Performance"].includes(task))
      return res.status(400).json({ message: "Invalid task" });

    if (!date || Number.isNaN(new Date(date).getTime()))
      return res.status(400).json({ message: "Invalid publishing date" });

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1)
      return res.status(400).json({ message: "Quantity must be a positive whole number" });

    if (!digitalMarketerId || !mongoose.isValidObjectId(digitalMarketerId))
      return res.status(400).json({ message: "Select a valid digital marketer" });
    if (!messageForDigitalMarketer || !messageForDigitalMarketer.trim())
      return res.status(400).json({ message: "Message for digital marketer is required" });

    if (!creativeStaffId || !mongoose.isValidObjectId(creativeStaffId))
      return res.status(400).json({ message: "Select a valid creative staff" });
    if (!messageForCreativeStaff || !messageForCreativeStaff.trim())
      return res.status(400).json({ message: "Message for creative staff is required" });

    // verify belongs to company
    const [dm, cs, dest] = await Promise.all([
      DigitalMarketer.findOne({ _id: digitalMarketerId, company: mm.company }).select("_id"),
      CreativeStaff.findOne({ _id: creativeStaffId, company: mm.company }).select("_id"),
      Destination.findOne({
        _id: destinationId,
        company: mm.company,
        country: countryId,
        state: stateId,
        activeStatus: true,
      }).select("_id"),
    ]);
    if (!dm) return res.status(400).json({ message: "Digital marketer not found in your company" });
    if (!cs) return res.status(400).json({ message: "Creative staff not found in your company" });
    if (!dest) return res.status(400).json({ message: "Destination not found for your company" });

    // Normalize to IST midnight
    const publishingDate = new Date(`${date}T00:00:00+05:30`);

    const doc = await AdAssignment.create({
      company: mm.company,
      marketingManager: mm._id,
      country: countryId,
      state: stateId,
      destination: destinationId,
      task,
      date: publishingDate,
      quantity: Number(quantity),
      details: (details || "").trim(),
      assignedDigitalMarketer: dm._id,
      messageForDigitalMarketer: messageForDigitalMarketer.trim(),
      assignedCreativeStaff: cs._id,
      messageForCreativeStaff: messageForCreativeStaff.trim(),
      creativeStatus: "pending",
    });

    return res.status(201).json({ message: "Assigned", id: doc._id });
  } catch (e) {
    console.error("createAdAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ---------- helpers ----------
const parseTourValue = (val) => {
  // val is like "group:<id>" or "fixed:<id>"
  if (!val || typeof val !== "string") return null;
  const [kind, id] = val.split(":");
  if (!["group", "fixed"].includes(kind) || !mongoose.isValidObjectId(id)) return null;
  return { model: kind === "group" ? "GroupTour" : "FixedTour", id };
};

// ---------- cascading lists ----------
export async function mmLeadAssignCountries(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const countries = await Country.find({ company: mm.company }).select("_id name").sort({ name: 1 });
    return res.json(countries);
  } catch (e) {
    console.error("mmLeadAssignCountries error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function mmLeadAssignStates(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { countryId } = req.params;
    const states = await State.find({ company: mm.company, country: countryId })
      .select("_id name")
      .sort({ name: 1 });
    return res.json(states);
  } catch (e) {
    console.error("mmLeadAssignStates error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function mmLeadAssignDestinations(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const { countryId, stateId } = req.params;
    const destinations = await Destination.find({
      company: mm.company,
      country: countryId,
      state: stateId,
      activeStatus: true,
    })
      .select("_id name")
      .sort({ name: 1 });

    return res.json(destinations);
  } catch (e) {
    console.error("mmLeadAssignDestinations error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function mmLeadAssignTours(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

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

    const matchBase = { company: mm.company, destination: destinationId, ...like };

    const [groupTours, fixedTours] = await Promise.all([
      GroupTour.find(matchBase).select("_id tourName startDate totalDays totalNights updatedAt").lean(),
      FixedTour.find(matchBase).select("_id tourName validFrom validTill updatedAt").lean(),
    ]);

    const options = [
      ...groupTours.map((t) => ({
        value: `group:${t._id}`,
        label: `${t.tourName || "(Untitled)"}`,
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
        label: `${t.tourName || "(Untitled)"}`,
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
  } catch (e) {
    console.error("mmLeadAssignTours error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ---------- Create Lead Assignment ----------
export async function createLeadAssignment(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const {
      countryId,
      stateId,
      destinationId,
      selectedTour, // "group:<id>" | "fixed:<id>"
      tourName,     // human name
      startDate,
      endDate,
      quantity,
      frequency,
      details,

      campaignName,

      digitalMarketerId,
      messageForDigitalMarketer,
      creativeStaffId,
      messageForCreativeStaff,

      adCategoryId,
      adData,
    } = req.body || {};

    // basic validations
    if (!countryId || !stateId || !destinationId) {
      return res.status(400).json({ message: "Country, state and destination are required" });
    }
    const parsed = parseTourValue(selectedTour);
    if (!parsed) return res.status(400).json({ message: "Invalid tour selection" });
    if (!startDate || !endDate) return res.status(400).json({ message: "Start and end date are required" });
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }
    if (ed < sd) return res.status(400).json({ message: "End date cannot be earlier than start date" });

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) return res.status(400).json({ message: "Invalid quantity" });

    if (!["daily", "weekly", "monthly"].includes(String(frequency))) {
      return res.status(400).json({ message: "Invalid frequency" });
    }

    if (!digitalMarketerId) return res.status(400).json({ message: "Select a digital marketer" });
    if (!messageForDigitalMarketer || !String(messageForDigitalMarketer).trim()) {
      return res.status(400).json({ message: "Message for digital marketer is required" });
    }

    if (creativeStaffId && !String(messageForCreativeStaff || "").trim()) {
      return res.status(400).json({ message: "Message for creative staff is required when staff is selected" });
    }

    if (!adCategoryId) return res.status(400).json({ message: "Select an ad category" });

    // existence checks scoped to company
    const [dm, cs, adCat] = await Promise.all([
      DigitalMarketer.findOne({ _id: digitalMarketerId, company: mm.company }).select("_id"),
      creativeStaffId ? CreativeStaff.findOne({ _id: creativeStaffId, company: mm.company }).select("_id") : null,
      AdCategory.findOne({ _id: adCategoryId, company: mm.company }).lean(),
    ]);
    if (!dm) return res.status(400).json({ message: "Digital marketer not found in your company" });
    if (creativeStaffId && !cs) return res.status(400).json({ message: "Creative staff not found in your company" });
    if (!adCat) return res.status(400).json({ message: "Ad category not found" });

    // (Optional) lightweight validation against adCat.fields
    // Ensure required keys present:
    if (Array.isArray(adCat.fields)) {
      for (const f of adCat.fields) {
        if (f.required) {
          const v = adData?.[f.key];
          const missing =
            v === undefined ||
            v === null ||
            (typeof v === "string" && !v.trim()) ||
            (Array.isArray(v) && v.length === 0);
          if (missing) {
            return res.status(400).json({ message: `"${f.label}" is required` });
          }
        }
      }
    }

    // tour existence (optional but good)
    if (parsed.model === "GroupTour") {
      const exists = await GroupTour.exists({ _id: parsed.id, company: mm.company, destination: destinationId });
      if (!exists) return res.status(400).json({ message: "Selected group tour not found for this destination" });
    } else {
      const exists = await FixedTour.exists({ _id: parsed.id, company: mm.company, destination: destinationId });
      if (!exists) return res.status(400).json({ message: "Selected fixed tour not found for this destination" });
    }

    // Create
    const doc = await LeadAssignment.create({
      company: mm.company,
      marketingManager: mm._id,

      country: countryId,
      state: stateId,
      destination: destinationId,

      tourRef: tourName || "",
      selectedTourModel: parsed.model,
      selectedTourId: parsed.id,

      startDate: sd,
      endDate: ed,
      quantity: qty,
      frequency,
      details: details?.trim() || "",

      campaignName: campaignName || (tourName || ""),

      adCategory: adCat._id,
      adData: adData || {},
      adCategorySnapshot: adCat, // freeze category structure at assignment time

      assignedDigitalMarketer: dm._id,
      messageForDigitalMarketer: String(messageForDigitalMarketer).trim(),

      assignedCreativeStaff: cs ? cs._id : null,
      messageForCreativeStaff: cs ? String(messageForCreativeStaff || "").trim() : "",
      creativeStatus: "pending",
    });

    return res.status(201).json({ message: "Lead task assigned", id: doc._id });
  } catch (e) {
    console.error("createLeadAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createUploadAssignment(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const {
      category,
      filename,
      publishingDate, // "YYYY-MM-DD"
      digitalMarketerId,
      messageForDigitalMarketer,
      creativeStaffId,           // optional
      messageForCreativeStaff,   // required if creativeStaffId is provided
    } = req.body || {};

    // Basic validations
    if (!category || !String(category).trim())
      return res.status(400).json({ message: "Category is required" });
    if (!filename || !String(filename).trim())
      return res.status(400).json({ message: "Filename is required" });

    if (!publishingDate) return res.status(400).json({ message: "Publishing date is required" });
    const pub = new Date(publishingDate);
    if (Number.isNaN(pub.getTime()))
      return res.status(400).json({ message: "Invalid publishing date" });

    if (!digitalMarketerId) return res.status(400).json({ message: "Select a digital marketer" });
    if (!mongoose.isValidObjectId(digitalMarketerId))
      return res.status(400).json({ message: "Invalid digital marketer id" });

    if (!messageForDigitalMarketer || !String(messageForDigitalMarketer).trim())
      return res.status(400).json({ message: "Message for digital marketer is required" });

    let csIdToSet = null;
    if (creativeStaffId) {
      if (!mongoose.isValidObjectId(creativeStaffId))
        return res.status(400).json({ message: "Invalid creative staff id" });
      if (!messageForCreativeStaff || !String(messageForCreativeStaff).trim())
        return res.status(400).json({ message: "Message for creative staff is required when staff is selected" });
      csIdToSet = creativeStaffId;
    }

    // Company scoping
    const [dmDoc, csDoc] = await Promise.all([
      DigitalMarketer.findOne({ _id: digitalMarketerId, company: mm.company }).select("_id"),
      csIdToSet ? CreativeStaff.findOne({ _id: csIdToSet, company: mm.company }).select("_id") : null,
    ]);

    if (!dmDoc) return res.status(400).json({ message: "Digital marketer not found in your company" });
    if (csIdToSet && !csDoc)
      return res.status(400).json({ message: "Creative staff not found in your company" });

    const doc = await UploadAssignment.create({
      company: mm.company,
      marketingManager: mm._id,

      category: String(category).trim(),
      filename: String(filename).trim(),
      publishingDate: pub,

      assignedDigitalMarketer: dmDoc._id,
      messageForDigitalMarketer: String(messageForDigitalMarketer).trim(),

      assignedCreativeStaff: csDoc ? csDoc._id : null,
      messageForCreativeStaff: csDoc ? String(messageForCreativeStaff).trim() : "",

      creativeStatus: "pending",
    });

    return res.status(201).json({ message: "Upload task assigned", id: doc._id });
  } catch (err) {
    console.error("createUploadAssignment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listCompanyCreativeAdAssignments(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      task,
      deadlineDate,     // yyyy-mm-dd
      status,           // creativeStatus
      creativeStaffText // text match name/email
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: mm.company,
    };

    if (destinationId && isValidId(destinationId)) {
      filter.destination = destinationId;
    }

    if (destinationText && destinationText.trim()) {
      const regex = new RegExp(destinationText.trim(), "i");
      const dests = await Destination.find({ name: regex }).select("_id").lean();
      if (!dests.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.destination = { $in: dests.map((d) => d._id) };
    }

    if (task) filter.task = task;

    if (deadlineDate) {
      const d = new Date(deadlineDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d);   end.setHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      }
    }

    if (["pending", "waiting", "approved", "rejected"].includes(status)) {
      filter.creativeStatus = status;
    }

    // Filter by Creative Staff name/email (text)
    if (creativeStaffText && creativeStaffText.trim()) {
      const regex = new RegExp(creativeStaffText.trim(), "i");
      const staff = await CreativeStaff.find({
        $or: [{ name: regex }, { email: regex }],
        company: mm.company,
      }).select("_id").lean();
      if (!staff.length) return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      filter.assignedCreativeStaff = { $in: staff.map((s) => s._id) };
    }

    const [items, total] = await Promise.all([
      AdAssignment.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({ path: "assignedCreativeStaff", select: "name email" })
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
      quantity: r.quantity,
      creativeStatus: r.creativeStatus || "pending",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
      // optional parity:
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
    console.error("listCompanyCreativeAdAssignments error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /marketingManager/creative-ad-assignments/:id
export async function getCompanyCreativeAdAssignment(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdAssignment.findOne({
      _id: id,
      company: mm.company,
    })
      .populate({ path: "destination", select: "name" })
      .populate({ path: "assignedCreativeStaff", select: "name email" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      task: r.task,
      date: r.date,
      quantity: r.quantity,
      details: r.details || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
      resheduledatewithreason: r.resheduledatewithreason || [],
    });
  } catch (e) {
    console.error("getCompanyCreativeAdAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/creative-ad-assignments/:id/approve
export async function approveCompanyCreativeAdAssignment(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdAssignment.findOne({ _id: id, company: mm.company });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "approved";
    r.creativeRejectionReason = "";
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to approved" });
  } catch (e) {
    console.error("approveCompanyCreativeAdAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /marketingManager/creative-ad-assignments/:id/reject
export async function rejectCompanyCreativeAdAssignment(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await AdAssignment.findOne({ _id: id, company: mm.company });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "rejected";
    r.creativeRejectionReason = String(reason).trim();
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to rejected" });
  } catch (e) {
    console.error("rejectCompanyCreativeAdAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listCompanyCreativeAssignedLeads(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      destinationId,
      destinationText,
      frequency,
      dateWithin,
      status,
      creativeStaffText,
    } = req.query;

    page  = Math.max(1, parseInt(page, 10)  || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = { company: mm.company };

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

    if (frequency && ["daily", "weekly", "monthly"].includes(frequency)) {
      filter.frequency = frequency;
    }

    if (dateWithin) {
      const d = new Date(dateWithin);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0,0,0,0);
        const end   = new Date(d); end.setHours(23,59,59,999);
        // Assigned window overlap
        filter.$and = [
          { startDate: { $lte: end } },
          { endDate:   { $gte: start } },
        ];
      }
    }

    const allowed = new Set(["pending", "waiting", "approved", "rejected"]);
    if (allowed.has(String(status || "").toLowerCase())) {
      filter.creativeStatus = String(status).toLowerCase();
    }

    if (creativeStaffText && creativeStaffText.trim()) {
      const regex = new RegExp(creativeStaffText.trim(), "i");
      const staff = await CreativeStaff.find({
        $or: [{ name: regex }, { email: regex }],
        company: mm.company,
      }).select("_id").lean();

      if (!staff.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.assignedCreativeStaff = { $in: staff.map((s) => s._id) };
    }

    const [items, total] = await Promise.all([
      LeadAssignment.find(filter)
        .populate({ path: "destination", select: "name" })
        .populate({ path: "assignedCreativeStaff", select: "name email" })
        .sort({ creativeDecidedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeadAssignment.countDocuments(filter),
    ]);

    const docs = items.map((r) => ({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef,
      startDate: r.startDate,
      endDate: r.endDate,
      quantity: r.quantity,
      frequency: r.frequency,
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
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
    console.error("listCompanyCreativeAssignedLeads error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /marketingManager/creative-assigned-leads/:id
 */
export async function getCompanyCreativeAssignedLead(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadAssignment.findOne({ _id: id, company: mm.company })
      .populate({ path: "destination", select: "name" })
      .populate({ path: "assignedCreativeStaff", select: "name email" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      destinationName: r.destination?.name || "—",
      tourRef: r.tourRef,
      startDate: r.startDate,
      endDate: r.endDate,
      quantity: r.quantity,
      frequency: r.frequency,
      details: r.details || "",
      campaignName: r.campaignName || "",
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
    });
  } catch (e) {
    console.error("getCompanyCreativeAssignedLead error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /marketingManager/creative-assigned-leads/:id/approve
 */
export async function approveCompanyCreativeAssignedLead(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadAssignment.findOne({ _id: id, company: mm.company });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "approved";
    r.creativeRejectionReason = "";
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to approved" });
  } catch (e) {
    console.error("approveCompanyCreativeAssignedLead error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /marketingManager/creative-assigned-leads/:id/reject
 * body: { reason: string }
 */
export async function rejectCompanyCreativeAssignedLead(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await LeadAssignment.findOne({ _id: id, company: mm.company });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "rejected";
    r.creativeRejectionReason = String(reason).trim();
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to rejected" });
  } catch (e) {
    console.error("rejectCompanyCreativeAssignedLead error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listCompanyCreativeUploadAssignments(req, res) {
  try {
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    let {
      page = 1,
      limit = 10,
      categoryText,
      filenameText,
      publishingDate,
      status,
      creativeStaffText,
    } = req.query;

    page  = Math.max(1, parseInt(page, 10)  || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Company scoped; UploadAssignment does not have parent "status: approved" gate
    const filter = { company: mm.company };

    if (categoryText && categoryText.trim()) {
      filter.category = new RegExp(categoryText.trim(), "i");
    }

    if (filenameText && filenameText.trim()) {
      filter.filename = new RegExp(filenameText.trim(), "i");
    }

    if (publishingDate) {
      const d = new Date(publishingDate);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d); start.setHours(0,0,0,0);
        const end   = new Date(d); end.setHours(23,59,59,999);
        filter.publishingDate = { $gte: start, $lte: end };
      }
    }

    const allowed = new Set(["pending", "waiting", "approved", "rejected"]);
    if (allowed.has(String(status || "").toLowerCase())) {
      filter.creativeStatus = String(status).toLowerCase();
    }

    if (creativeStaffText && creativeStaffText.trim()) {
      const rx = new RegExp(creativeStaffText.trim(), "i");
      const staff = await CreativeStaff.find({
        company: mm.company,
        $or: [{ name: rx }, { email: rx }],
      }).select("_id").lean();
      if (!staff.length) {
        return res.json({ docs: [], page, limit, total: 0, totalPages: 1 });
      }
      filter.assignedCreativeStaff = { $in: staff.map((s) => s._id) };
    }

    const [items, total] = await Promise.all([
      UploadAssignment.find(filter)
        .populate({ path: "assignedCreativeStaff", select: "name email" })
        .sort({ creativeDecidedAt: -1, createdAt: -1 })
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
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
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
    console.error("listCompanyCreativeUploadAssignments error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /marketingManager/creative-upload-assignments/:id
 */
export async function getCompanyCreativeUploadAssignment(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await UploadAssignment.findOne({
      _id: id,
      company: mm.company,
    })
      .populate({ path: "assignedCreativeStaff", select: "name email" })
      .lean();

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json({
      _id: r._id,
      category: r.category,
      filename: r.filename,
      publishingDate: r.publishingDate,
      messageForCreativeStaff: r.messageForCreativeStaff || "",
      creativeStatus: r.creativeStatus || "pending",
      creativeRejectionReason: r.creativeRejectionReason || "",
      creativeStaffName: r.assignedCreativeStaff?.name || "—",
      creativeStaffEmail: r.assignedCreativeStaff?.email || "",
      fileNames: r.fileNames || [],
    });
  } catch (e) {
    console.error("getCompanyCreativeUploadAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /marketingManager/creative-upload-assignments/:id/approve
 */
export async function approveCompanyCreativeUploadAssignment(req, res) {
  try {
    const { id } = req.params;
    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await UploadAssignment.findOne({ _id: id, company: mm.company });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "approved";
    r.creativeRejectionReason = "";
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to approved" });
  } catch (e) {
    console.error("approveCompanyCreativeUploadAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /marketingManager/creative-upload-assignments/:id/reject
 * body: { reason: string }
 */
export async function rejectCompanyCreativeUploadAssignment(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const mm = await MarketingManager.findById(req.userId).select("_id company");
    if (!mm) return res.status(401).json({ message: "You are not authorised" });

    const r = await UploadAssignment.findOne({ _id: id, company: mm.company });
    if (!r) return res.status(404).json({ message: "Not found" });

    r.creativeStatus = "rejected";
    r.creativeRejectionReason = String(reason).trim();
    r.creativeDecisionBy = mm._id;
    r.creativeDecidedAt = new Date();

    await r.save();
    return res.json({ message: "Creative status set to rejected" });
  } catch (e) {
    console.error("rejectCompanyCreativeUploadAssignment error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

