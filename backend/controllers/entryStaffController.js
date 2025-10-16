import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Entry from "../models/entryModel.js";
import Destination from "../models/destinationModel.js";
import FixedTour from "../models/fixedTourModel.js";
import GroupTour from "../models/groupTourModel.js";
import ClientByEntry from "../models/clientByEntryModel.js";
import Company from "../models/companyModel.js";
import FrontOfficer from "../models/frontOfficerModel.js";
import RoundRobinCounter from "../models/roundRobinCounter.js";


export async function listEntryDestinations(req, res) {
  try {
    const entryId = req.userId;
    if (!entryId) return res.status(401).json({ message: "Unauthorized" });

    const entry = await Entry.findById(entryId).select("company");
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Find destinations for this company
    const dests = await Destination.find({
      company: entry.company,
      activeStatus: true,
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
export async function listEntryCampaigns(req, res) {
  try {
    const entryId = req.userId;
    if (!entryId) return res.status(401).json({ message: "Unauthorized" });

    const entry = await Entry.findById(entryId).select("company");
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const { destinationId } = req.query;
    if (!destinationId || !mongoose.isValidObjectId(destinationId)) {
      return res.status(400).json({ message: "Valid destinationId is required" });
    }

    const [fixed, group] = await Promise.all([
      FixedTour.find({ company: entry.company, destination: destinationId })
        .select("_id tourName")
        .sort({ tourName: 1 })
        .lean(),
      GroupTour.find({ company: entry.company, destination: destinationId })
        .select("_id tourName")
        .sort({ tourName: 1 })
        .lean(),
    ]);

    // unified options list
    const options = [
      ...fixed.map((t) => ({
        kind: "FixedTour",
        refId: t._id,
        label: t.tourName,
        value: `fixed:${t._id.toString()}`,
      })),
      ...group.map((t) => ({
        kind: "GroupTour",
        refId: t._id,
        label: t.tourName,
        value: `group:${t._id.toString()}`,
      })),
    ];

    return res.json(options);
  } catch (err) {
    console.error("listEntryCampaigns error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
// export async function createClientByEntry(req, res) {
//   try {
//     const entryId = req.userId;
//     if (!entryId) return res.status(401).json({ message: "Unauthorized" });

//     const entry = await Entry.findById(entryId).select("_id company");
//     if (!entry) return res.status(404).json({ message: "Entry not found" });

//     const {
//       name,
//       mobileNumber,
//       primaryDestinationName, // {_id, value, label}
//       connectedThrough,       // {value,label} required
//       clientType,             // {value,label} optional
//       campaignName,           // {kind, refId, label} optional
//     } = req.body || {};

//     // basic validations
//     if (!mobileNumber || !/^\d{10,15}$/.test(String(mobileNumber).trim())) {
//       return res.status(400).json({ message: "Valid mobileNumber (10–15 digits) is required" });
//     }
//     if (
//       !primaryDestinationName ||
//       !primaryDestinationName._id ||
//       !primaryDestinationName.value ||
//       !primaryDestinationName.label
//     ) {
//       return res
//         .status(400)
//         .json({ message: "primaryDestinationName {_id, value, label} is required" });
//     }
//     if (!connectedThrough || !connectedThrough.value || !connectedThrough.label) {
//       return res
//         .status(400)
//         .json({ message: "connectedThrough { value, label } is required" });
//     }

//     const primarySubdoc = {
//       _id:
//         typeof primaryDestinationName._id === "string"
//           ? new mongoose.Types.ObjectId(primaryDestinationName._id)
//           : primaryDestinationName._id,
//       value: primaryDestinationName.value,
//       label: primaryDestinationName.label,
//     };

//     let campaignSubdoc;
//     if (campaignName && (campaignName.refId || campaignName.label)) {
//       campaignSubdoc = {
//         kind: campaignName.kind,
//         refId: campaignName.refId && mongoose.isValidObjectId(campaignName.refId)
//           ? new mongoose.Types.ObjectId(campaignName.refId)
//           : undefined,
//         label: campaignName.label || undefined,
//       };
//     }

//     const doc = await ClientByEntry.create({
//       name: name?.trim() || "",
//       mobileNumber: String(mobileNumber).trim(),
//       primaryDestinationName: primarySubdoc,
//       campaignName: campaignSubdoc,
//       connectedThrough: {
//         value: connectedThrough.value,
//         label: connectedThrough.label,
//       },
//       clientType:
//         clientType && clientType.value && clientType.label
//           ? { value: clientType.value, label: clientType.label }
//           : undefined,
//       entryId: entry._id,
//       companyId: entry.company,
//     });

//     return res.status(201).json({ message: "Client created", client: doc });
//   } catch (err) {
//     console.error("createClientByEntry error:", err);

//     // duplicate guard
//     if (err?.code === 11000) {
//       return res
//         .status(409)
//         .json({ message: "Client with this mobile already exists for your company" });
//     }
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// }
function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Atomically get a round-robin ticket (0-based) for a company
async function getRoundRobinTicket(companyId) {
  const updated = await RoundRobinCounter.findOneAndUpdate(
    { companyId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  return Math.max(0, (updated.seq || 1) - 1);
}

export async function createClientByEntry(req, res) {
  try {
    const entryId = req.userId;
    if (!entryId) return res.status(401).json({ message: "Unauthorized" });

    const entry = await Entry.findById(entryId).select("_id company");
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const {
      name,
      mobileNumber,
      primaryDestinationName, // {_id, value, label}
      connectedThrough,       // {value,label} required
      clientType,             // {value,label} optional
      campaignName,           // {kind, refId, label} optional
    } = req.body || {};

    // 1) Check Active Front Officers FIRST.
    //    If none, DO NOT create the client; return a clear, actionable message.
    const activeFOs = await FrontOfficer.find({
      company: entry.company,
      status: "Active",
    })
      .select("_id")
      .sort({ _id: 1 }) // deterministic order
      .lean();

    if (activeFOs.length === 0) {
      // 409 Conflict makes sense: current org state prevents creating this resource
      return res.status(409).json({
        message: "No active front officer found — inform Marketing Manager.",
        code: "NO_ACTIVE_FRONTOFFICER",
      });
    }

    // 2) Build subdocs after we know we can proceed
    const primarySubdoc = {
      _id:
        typeof primaryDestinationName._id === "string"
          ? new mongoose.Types.ObjectId(primaryDestinationName._id)
          : primaryDestinationName._id,
      value: primaryDestinationName.value,
      label: primaryDestinationName.label,
    };

    let campaignSubdoc;
    if (campaignName && (campaignName.refId || campaignName.label)) {
      campaignSubdoc = {
        kind: campaignName.kind,
        refId:
          campaignName.refId && mongoose.isValidObjectId(campaignName.refId)
            ? new mongoose.Types.ObjectId(campaignName.refId)
            : undefined,
        label: campaignName.label || undefined,
      };
    }

    // 3) Concurrency-safe round-robin selection using atomic counter
    const ticket = await getRoundRobinTicket(entry.company);
    const idx = ticket % activeFOs.length;
    const assignedFO = activeFOs[idx]._id;

    // 4) Create the client with the selected officer
    const doc = await ClientByEntry.create({
      name: name?.trim() || "",
      mobileNumber: String(mobileNumber).trim(),
      primaryDestinationName: primarySubdoc,
      campaignName: campaignSubdoc,
      connectedThrough: {
        value: connectedThrough.value,
        label: connectedThrough.label,
      },
      clientType:
        clientType && clientType.value && clientType.label
          ? { value: clientType.value, label: clientType.label }
          : undefined,
      entryId: entry._id,
      companyId: entry.company,
      assignedFrontOfficerId: assignedFO,
      assignedAt: new Date(),
    });

    return res.status(201).json({
      message: "Client created & assigned to a front officer",
      client: doc,
    });
  } catch (err) {
    console.error("createClientByEntry error:", err);

    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ message: "Client with this mobile already exists for your company" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function listClientsByEntry(req, res) {
  try {
    const entryId = req.userId;
    if (!entryId) return res.status(401).json({ message: "Unauthorized" });

    const entry = await Entry.findById(entryId).select("_id");
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    let {
      page = 1,
      limit = 7,
      name = "",
      mobile = "",
      destination = "",
      dateFrom = "",
      dateTo = ""
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 7);

    const filter = { entryId: entry._id };

    // Optional name regex (not indexed; convenience)
    if (name && typeof name === "string") {
      filter.name = { $regex: escapeRegex(name.trim()), $options: "i" };
    }

    // Mobile: prefix regex -> can utilize index better with ^ (case-insensitive just in case)
    if (mobile && typeof mobile === "string") {
      filter.mobileNumber = { $regex: "^" + escapeRegex(mobile.trim()), $options: "i" };
    }

    // Destination: prefix on primaryDestinationName.value (indexed)
    if (destination && typeof destination === "string") {
      filter["primaryDestinationName.value"] = {
        $regex: "^" + escapeRegex(destination.trim()),
        $options: "i",
      };
    }

    // CreatedAt date range (inclusive from, inclusive-to by using < nextDay)
    if (dateFrom || dateTo) {
      const createdAt = {};
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00.000Z`);
        if (!Number.isNaN(from.getTime())) createdAt.$gte = from;
      }
      if (dateTo) {
        const toStart = new Date(`${dateTo}T00:00:00.000Z`);
        if (!Number.isNaN(toStart.getTime())) {
          const nextDay = new Date(toStart);
          nextDay.setUTCDate(nextDay.getUTCDate() + 1);
          createdAt.$lt = nextDay;
        }
      }
      if (Object.keys(createdAt).length) filter.createdAt = createdAt;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ClientByEntry.find(filter)
        .select("_id name mobileNumber primaryDestinationName createdAt frontOfficeCreatedStatus")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ClientByEntry.countDocuments(filter),
    ]);

    const docs = items.map((it) => ({
      _id: it._id,
      name: it.name || "",
      mobileNumber: it.mobileNumber || "",
      destination: it.primaryDestinationName?.label || it.primaryDestinationName?.value || "",
      createdAt: it.createdAt,
      frontOfficeCreatedStatus: !!it.frontOfficeCreatedStatus,
    }));

    return res.json({
      docs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("listClientsByEntry error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


const fmtDate = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});
const fmtTime = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});
const fmtDateTime = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

export const downloadClientsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const userId = req.userId; // ✅ from verifyUser middleware

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const start = new Date(`${startDate}T00:00:00+05:30`);
    const end = new Date(`${endDate}T23:59:59.999+05:30`);

    const officer = await Entry.findById(userId).lean();
    if (!officer) {
      return res.status(404).json({ message: "Entry (officer) not found" });
    }

    // ✅ Fetch company using companyId from Entry
    const company =
      officer.company &&
      (await Company.findById(officer.company).lean().catch(() => null));

    const clients = await ClientByEntry.find({
      entryId: new mongoose.Types.ObjectId(userId),
      createdAtByEntry: { $gte: start, $lte: end },
    })
      .sort({ createdAtByEntry: 1 })
      .lean();

    if (!clients.length) {
      return res
        .status(404)
        .json({ message: "No clients found in the selected range" });
    }

    // -------------------- PDF Setup --------------------
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      bufferPages: true,
    });

    const filename = `clients_${startDate}_${endDate}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    doc.pipe(res);

    const LEFT = 40;
    const PAGE_W = doc.page.width;
    const RIGHT = PAGE_W - LEFT;
    const TABLE_W = RIGHT - LEFT;
    const COLS_PCT = [0.06, 0.22, 0.24, 0.14, 0.12, 0.12, 0.1];
    const COL_W = COLS_PCT.map((p) => Math.floor(p * TABLE_W));
    const HEADERS = [
      "No",
      "Name",
      "Destination",
      "Mobile",
      "Date",
      "Time",
      "FO Status",
    ];
    const ROW_H = 18;
    const LINE_HEIGHT = 14;

    const drawHeader = () => {
      const s = fmtDate.format(new Date(start));
      const e = fmtDate.format(new Date(end));
      const generatedAt = fmtDateTime.format(new Date());


      doc.font("Helvetica-Bold").fontSize(16).text(
        `ENTRY: ${officer.name?.toUpperCase() || "N/A"}`,
        { align: "center" }
      );

      doc.font("Helvetica").fontSize(12).text(
        `Company: ${company?.companyName || "N/A"}`,
        { align: "center" }
      );

      doc.moveDown(0.5);
      doc.font("Helvetica").fontSize(11).fillColor("black");
      doc.text(`Date Range: ${s} to ${e}`, { align: "center" });
      doc.text(`Generated At: ${generatedAt}`, { align: "center" });
      doc.moveDown(0.6);
    };

    const drawTableHeader = (y) => {
      doc.font("Helvetica-Bold").fontSize(10);
      let x = LEFT;
      HEADERS.forEach((h, i) => {
        doc.text(h, x + 3, y + 3, {
          width: COL_W[i],
          align: "left",
        });
        doc.rect(x, y, COL_W[i], ROW_H).stroke();
        x += COL_W[i];
      });
      return y + ROW_H;
    };

    const drawRow = (y, index, c) => {
      doc.font("Helvetica").fontSize(10).fillColor("black");
      const created = c.createdAtByEntry ? new Date(c.createdAtByEntry) : null;
      const createdDate = created ? fmtDate.format(created) : "-";
      const createdTime = created ? fmtTime.format(created) : "-";
      const status = c.frontOfficeCreatedStatus ? "Created" : "Pending";

      const values = [
        index + 1,
        c.name || "-",
        c.primaryDestinationName?.label ||
          c.primaryDestinationName?.value ||
          "-",
        c.mobileNumber || "-",
        createdDate,
        createdTime,
        status,
      ];

      let rowHeight = ROW_H;
      let x = LEFT;

      // 🔹 Dynamic height based on wrapped text
      const colHeights = values.map((v, i) => {
        const text = String(v);
        const height = doc.heightOfString(text, {
          width: COL_W[i] - 6,
          align: "left",
        });
        return Math.max(ROW_H, height + 6);
      });
      rowHeight = Math.max(...colHeights);

      // 🔹 Page break if row exceeds bottom
      if (y + rowHeight > doc.page.height - 80) {
        doc.addPage();
        drawHeader();
        y = drawTableHeader(doc.y);
      }

      // 🔹 Draw each cell
      values.forEach((v, i) => {
        if (i === 6 && v === "Pending") doc.fillColor("red");
        else doc.fillColor("black");

        doc.text(String(v), x + 3, y + 3, {
          width: COL_W[i] - 6,
          align: "left",
        });

        doc.rect(x, y, COL_W[i], rowHeight).stroke();
        x += COL_W[i];
      });

      doc.fillColor("black");
      return y + rowHeight;
    };

    // -------------------- Generate PDF --------------------
    drawHeader();
    let y = drawTableHeader(doc.y);

    for (let i = 0; i < clients.length; i++) {
      y = drawRow(y, i, clients[i]);
    }

    doc.end();
  } catch (err) {
    console.error("downloadClientsReport error:", err);
    res
      .status(500)
      .json({ message: "An error occurred while generating the PDF" });
  }
};
