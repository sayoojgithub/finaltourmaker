import SalesExecutive from "../models/salesExecutiveModel.js";
import Company from "../models/companyModel.js"


export const getSalesProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Get sales executive info with targets
    const salesExec = await SalesExecutive.findById(userId).select("name email phoneNumber targets");
    if (!salesExec) {
      return res.status(404).json({ message: "Sales executive not found" });
    }

    const targets = salesExec.targets || [];
    const latestTarget = targets.length ? targets[targets.length - 1] : null;

    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    };

    // 2. Count overall companies
    const [total, verified, unverified] = await Promise.all([
      Company.countDocuments({ salesExecutive: userId }),
      Company.countDocuments({ salesExecutive: userId, verificationStatus: true }),
      Company.countDocuments({ salesExecutive: userId, verificationStatus: false }),
    ]);

    // 3. New Registrations Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const newRegistrationsToday = await Company.countDocuments({
      salesExecutive: userId,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // 4. Target period stats
    let totalRegistrations = 0;
    let verifiedRegistrations = 0;
    let pendingVerification = 0;
    let pendingTarget = null;

   if (latestTarget) {
  const start = new Date(latestTarget.start);
  let end = new Date(latestTarget.end);

  // If start and end are the same day, include full day by adding +1 day to end
  if (start.toDateString() === end.toDateString()) {
    end.setDate(end.getDate() + 1);
  } else {
    // If end is already inclusive, shift it by 1 day to cover entire end day
    end.setDate(end.getDate() + 1);
  }

  totalRegistrations = await Company.countDocuments({
    salesExecutive: userId,
    createdAt: { $gte: start, $lt: end },  // use $lt to avoid overlap
  });

  verifiedRegistrations = await Company.countDocuments({
    salesExecutive: userId,
    verificationStatus: true,
    createdAt: { $gte: start, $lt: end },
  });

  pendingVerification = totalRegistrations - verifiedRegistrations;
  pendingTarget = latestTarget.target - verifiedRegistrations;
}


    // 5. Send response
    res.status(200).json({
      name: salesExec.name,
      email: salesExec.email,
      phoneNumber: salesExec.phoneNumber,
      latestTarget: latestTarget
        ? {
            start: formatDate(latestTarget.start),
            end: formatDate(latestTarget.end),
            target: latestTarget.target,
          }
        : null,
      companyStats: {
        total,
        verified,
        notVerified: unverified,
        newRegistrationsToday,
      },
      targetPerformance: latestTarget
        ? {
            totalRegistrations,
            verifiedRegistrations,
            pendingVerification,
            pendingTarget,
          }
        : null,
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      ownerName,
      email,
      contactNumber,
      additionalNumber,
      buildingName,
      roadAreaStreet,
      city,
      state,
      country,
      pincode,
    } = req.body;

    const userId = req.userId;
    const role = req.role;

    // ✅ Check if role is salesExecutive
    if (role !== "salesExecutive") {
      return res.status(403).json({ message: "Access denied. Only Sales Executives can register a company." });
    }

    // ✅ Check if userId exists in SalesExecutive model
    const salesExec = await SalesExecutive.findById(userId);
    if (!salesExec) {
      return res.status(404).json({ message: "Sales Executive not found." });
    }

    // ✅ Check for duplicate company email
    const existing = await Company.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Company already exists with this email." });
    }

    // ✅ Create new company
    const company = new Company({
      companyName,
      ownerName,
      email,
      contactNumber,
      additionalNumber,
      buildingName,
      roadAreaStreet,
      city,
      state,
      country,
      pincode,
      salesExecutive: userId,
    });

    await company.save();

    res.status(201).json({
      message: "Company registered successfully",
      company,
    });
  } catch (error) {
    console.error("Error registering company:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getRegisteredCompanies = async (req, res) => {
  try {
    const salesExecutiveId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const searchRegex = new RegExp(search, "i");

    const query = {
      salesExecutive: salesExecutiveId,
      companyName: { $regex: searchRegex }
    };

    const totalCompanies = await Company.countDocuments(query);
    const totalPages = Math.ceil(totalCompanies / limit);

    const companies = await Company.find(query)
      .select("companyName email contactNumber city state verificationStatus")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      companies,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching registered companies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};