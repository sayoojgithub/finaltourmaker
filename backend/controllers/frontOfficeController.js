// controllers/frontofficeClients.controller.js
import mongoose from "mongoose";
import FrontOfficer from "../models/frontOfficerModel.js";
import ClientByEntry from "../models/clientByEntryModel.js";
import Destination from "../models/destinationModel.js";
import Client from "../models/clientModel.js";
import Counter from "../models/counterModel.js";
import Company from "../models/companyModel.js";

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// NOTE: We only show clients assigned to this front officer AND not yet created by Front Office (frontOfficeCreatedStatus=false)
export async function listClientsToCreate(req, res) {
  try {
    const frontOfficerId = req.userId;
    if (!frontOfficerId) return res.status(401).json({ message: "Unauthorized" });

    const fo = await FrontOfficer.findById(frontOfficerId).select("_id company");
    if (!fo) return res.status(401).json({ message: "Not authorized (front officer not found)" });

    // paging + filters
    let {
      page = 1,
      limit = 7,
      mobile = "",
      destination = "",
      dateFrom = "",
      dateTo = "",
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);
    const skip = (page - 1) * limit;

    // match
    const match = {
      assignedFrontOfficerId: new mongoose.Types.ObjectId(fo._id),
      frontOfficeCreatedStatus: false,
    };

    if (mobile && typeof mobile === "string" && mobile.trim()) {
      match.mobileNumber = { $regex: "^" + escapeRegex(mobile.trim()), $options: "i" };
    }
    if (destination && typeof destination === "string" && destination.trim()) {
      match["primaryDestinationName.value"] = {
        $regex: "^" + escapeRegex(destination.trim()),
        $options: "i",
      };
    }
    if (dateFrom || dateTo) {
      const createdAt = {};
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00.000Z`);
        if (!Number.isNaN(from.getTime())) createdAt.$gte = from;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T00:00:00.000Z`);
        if (!Number.isNaN(to.getTime())) {
          const nextDay = new Date(to);
          nextDay.setUTCDate(nextDay.getUTCDate() + 1);
          createdAt.$lt = nextDay;
        }
      }
      if (Object.keys(createdAt).length) match.createdAt = createdAt;
    }

    // pipeline: urgent first, then newest; keep FULL docs; add derived fields
    const pipeline = [
      { $match: match },
      {
        $addFields: {
          isUrgent: { $cond: [{ $eq: ["$clientType.value", "Urgent Contact"] }, 1, 0] },
          destination: {
            $ifNull: ["$primaryDestinationName.label", "$primaryDestinationName.value"],
          },
        },
      },
      { $sort: { isUrgent: -1, createdAt: -1 } },
      {
        $facet: {
          rows: [
            { $skip: skip },
            { $limit: limit },
            // no $project here => return FULL document (all fields)
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const [agg] = await ClientByEntry.aggregate(pipeline);
    const docs = agg?.rows || [];
    const total = agg?.totalCount?.[0]?.count || 0;

    // Return docs AS-IS (full fields), already including isUrgent + destination
    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("listClientsToCreate error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function listFrontOfficeDestinations(req, res) {
  try {
    const FrontOfficeId = req.userId;
    if (!FrontOfficeId) return res.status(401).json({ message: "Unauthorized" });

    const fo = await FrontOfficer.findById(FrontOfficeId).select("company");
    if (!fo) return res.status(404).json({ message: "FrontOfficer not found" });

    // Find destinations for this company
    const dests = await Destination.find({
      company: fo.company,
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
 function makePrefix(companyName) {
  const cleaned = (companyName || "").replace(/[^A-Za-z]/g, "").toUpperCase();
  return cleaned.slice(0, 3) || "CMP";
}
export const createClient = async (req,res) => {
  try {
    const frontOfficerId = req.userId;
    if (!frontOfficerId) return res.status(401).json({ message: "Unauthorized" });

    // get company id from front officer
    const fo = await FrontOfficer.findById(frontOfficerId).select("_id company");
    if (!fo) return res.status(401).json({ message: "Not authorized (front officer not found)" });

    const companyId = fo.company;
    const company = await Company.findById(companyId).select("_id companyName");
    if (!company) return res.status(400).json({ message: "Company not found for FO" });
    const {
      // regular payload fields you already send…
      name, mobileNumber, email, whatsappNumber, tourType,
      primaryDestinationName, addonDestinations,
      groupType, numberOfPersons, startDate, endDate, numberOfDays,
      pincode, district, state,
      clientContactOption, clientType, clientCurrentLocation,
      connectedThrough, behavior, gstNumber,
      additionalRequirements, additionalRequirments, // legacy joined string if you send it
      clientByEntryId,

      // +++ new meta coming from prefill +++
      campaignName,          // { kind, refId, label }
      createdAtByEntry,      // ISO string
      entryId,               // ObjectId-ish string
    } = req.body;


    let clientIdToUse;

    const existing = await Client.findOne({ companyId, mobileNumber })
      .select("clientId")
      .sort({ createdAt: 1 })
      .lean();

    if (existing?.clientId) {
      clientIdToUse = existing.clientId;
    } else {
      // B) otherwise generate a new one: PREFIX + sequence
      const prefix = makePrefix(company.companyName);
      const counter = await Counter.findOneAndUpdate(
        { company: companyId },
        { $inc: { clientSequence: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      clientIdToUse = `${prefix}${counter.clientSequence}`;
    }

    const doc = await Client.create({
      clientId: clientIdToUse,
      name,
      mobileNumber,
      email: email ?? null,
      whatsappNumber: whatsappNumber ?? null,
      tourType: tourType ?? null,

      primaryDestinationName,
      addonDestinations: addonDestinations ?? [],

      groupType,
      numberOfPersons,
      startDate,
      endDate,
      numberOfDays,

      pincode,
      district,
      state,

      clientContactOption,
      clientType ,
      clientCurrentLocation,
      connectedThrough,
      behavior,

      gstNumber: gstNumber ?? null,

      additionalRequirements: Array.isArray(additionalRequirements) ? additionalRequirements : [],
      clientByEntryId: clientByEntryId ?? null,

      // +++ persisted prefill meta +++
      campaignName: campaignName ?? null,
      createdAtByEntry,
      entryId: entryId ? entryId : null,

      // +++ company + timestamps from FO context +++
      companyId: fo.company,
      createdAtByFrontoffice: new Date(),
      frontOfficerId,
    });
    if (clientByEntryId) {
    await ClientByEntry.findByIdAndUpdate(clientByEntryId, { frontOfficeCreatedStatus: true });
}
 await FrontOfficer.findByIdAndUpdate(frontOfficerId, {
      $set: { lastClientCreatedAt: new Date(), lastActivityAt: new Date() }
    });


    return res.status(201).json({ message: "Client created", data: doc });
  } catch (err) {
    console.error("createClient error:", err);
    return res.status(500).json({ message: err?.message || "Something went wrong" });
  }
}; 

export async function searchCreatedClients(req, res) {
  try {
    const frontOfficerId = req.userId;
    if (!frontOfficerId) return res.status(401).json({ message: "Unauthorized" });

    const fo = await FrontOfficer.findById(frontOfficerId).select("_id company");
    if (!fo) return res.status(401).json({ message: "Not authorized (front officer not found)" });

    const { query = "" } = req.query;
    if (!query.trim()) return res.json([]);

    const rx = new RegExp("^" + escapeRegex(query.trim()), "i");

    // search by mobileNumber or clientId within the same company
    const docs = await Client.find({
      companyId: fo.company,
      $or: [{ mobileNumber: rx }, { clientId: rx }],
    })
      .select(
        "_id clientId name mobileNumber primaryDestinationName startDate createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Attach a stub status ("nil" as per your ask)
    const out = docs.map((d) => ({
      ...d,
      status: "nil",
    }));

    return res.json(out);
  } catch (err) {
    console.error("searchCreatedClients error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET /frontoffice/client/:id  (for Update screen prefill)
export async function getClientById(req, res) {
  try {
    const frontOfficerId = req.userId;
    if (!frontOfficerId) return res.status(401).json({ message: "Unauthorized" });

    const fo = await FrontOfficer.findById(frontOfficerId).select("_id company");
    if (!fo) return res.status(401).json({ message: "Not authorized (front officer not found)" });

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid client id" });
    }

    const doc = await Client.findOne({
      _id: id,
      companyId: fo.company,
    }).lean();

    if (!doc) return res.status(404).json({ message: "Client not found" });

    return res.json(doc);
  } catch (err) {
    console.error("getClientById error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// PUT /frontoffice/client/:id  (Update only allowed fields)
export async function updateClient(req, res) {
  try {
    const frontOfficerId = req.userId;
    if (!frontOfficerId) return res.status(401).json({ message: "Unauthorized" });

    const fo = await FrontOfficer.findById(frontOfficerId).select("_id company");
    if (!fo) return res.status(401).json({ message: "Not authorized (front officer not found)" });

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid client id" });
    }

    // Whitelist of editable fields (ADDED: whatsappNumber, clientContactOption, clientType, pincode, district, state, gstNumber)
    const {
      email,
      whatsappNumber,
      clientContactOption,      // {value,label}
      clientType,               // {value,label}
      primaryDestinationName,   // {_id, value, label} or null
      groupType,                // {value,label}
      numberOfPersons,
      startDate,
      endDate,
      numberOfDays,
      addonDestinations,        // array of {_id,value,label}
      additionalRequirements,   // array of strings
      pincode,
      district,
      state,
      gstNumber,
      tourType,
    } = req.body;

    // Recompute numberOfDays if dates provided (inclusive)
    let computedNumberOfDays = numberOfDays;
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (!Number.isNaN(s) && !Number.isNaN(e)) {
        const sd = new Date(s); sd.setHours(0,0,0,0);
        const ed = new Date(e); ed.setHours(0,0,0,0);
        const diff = (ed - sd) / (1000 * 60 * 60 * 24);
        computedNumberOfDays = diff >= 0 ? diff + 1 : undefined;
      }
    }

    const update = {
      ...(email !== undefined ? { email } : {}),
      ...(whatsappNumber !== undefined ? { whatsappNumber } : {}),
      ...(clientContactOption !== undefined ? { clientContactOption } : {}),
      ...(clientType !== undefined ? { clientType } : {}),
      ...(tourType !== undefined ? { tourType } : {}),
      ...(primaryDestinationName !== undefined ? { primaryDestinationName } : {}),
      ...(groupType !== undefined ? { groupType } : {}),
      ...(numberOfPersons !== undefined ? { numberOfPersons } : {}),
      ...(startDate !== undefined ? { startDate } : {}),
      ...(endDate !== undefined ? { endDate } : {}),
      ...(computedNumberOfDays !== undefined ? { numberOfDays: computedNumberOfDays } : {}),
      ...(Array.isArray(addonDestinations) ? { addonDestinations } : {}),
      ...(Array.isArray(additionalRequirements) ? { additionalRequirements } : {}),
      ...(pincode !== undefined ? { pincode } : {}),
      ...(district !== undefined ? { district } : {}),
      ...(state !== undefined ? { state } : {}),
      ...(gstNumber !== undefined ? { gstNumber } : {}),
      updatedAt: new Date(),
    };

    const doc = await Client.findOneAndUpdate(
      { _id: id, companyId: fo.company },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Client not found" });

    return res.json({ message: "Client updated", data: doc });
  } catch (err) {
    console.error("updateClient error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

function istTodayISO() {
  // Get now in IST
  const now = new Date();
  const istParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = istParts.find(p => p.type === "year").value;
  const m = istParts.find(p => p.type === "month").value;
  const d = istParts.find(p => p.type === "day").value;
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}

export async function getTodayTaken(req, res) {
  try {
    const frontOfficerId = req.userId;
    if (!frontOfficerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Build IST day window
    const istDateISO = istTodayISO(); // e.g., 2025-10-20
    const startIST = new Date(`${istDateISO}T00:00:00+05:30`);
    const endIST = new Date(startIST.getTime() + 24 * 60 * 60 * 1000);

    const count = await ClientByEntry.countDocuments({
      assignedFrontOfficerId: new mongoose.Types.ObjectId(frontOfficerId),
      createdAt: { $gte: startIST, $lt: endIST },
    });
    return res.json({
      dateISO: istDateISO, // authoritative IST date (YYYY-MM-DD)
      taken: count,
    });
  } catch (err) {
    console.error("getTodayTaken error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}