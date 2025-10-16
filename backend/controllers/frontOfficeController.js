// controllers/frontofficeClients.controller.js
import mongoose from "mongoose";
import FrontOfficer from "../models/frontOfficerModel.js";
import ClientByEntry from "../models/clientByEntryModel.js";
import Destination from "../models/destinationModel.js";

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