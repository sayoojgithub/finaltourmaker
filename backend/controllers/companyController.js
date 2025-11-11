import Company from "../models/companyModel.js";
import BankDetails from "../models/companyBankDetailsModel.js";
import Branch from "../models/companyBranchModel.js";
import Franchisee from "../models/companyFranchiseeModel.js";
import Agent from "../models/companyAgentModel.js";
import FrontOfficer from "../models/frontOfficerModel.js";
import Executive from "../models/executiveModel.js";
import Purchaser from "../models/purchaserModel.js";
import DigitalMarketer from "../models/digitalMarketerModel.js";
import SalesManager from "../models/salesManagerModel.js";
import MarketingManager from "../models/marketingManagerModel.js";
import CreativeStaff from "../models/creativeStaffModel.js";
import Entry from "../models/entryModel.js";
import FrontOfficerManager from "../models/frontOfficerManagerModel.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

   try {
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER, // full gmail address
    pass: process.env.EMAIL_PASS, // 16-char app password
  },
});
 


    const mailOptions = {
      from: `"Tourmaker OTP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Tourmaker Email Verification OTP",
      html: `
    <div style="background-color: #f4f4f7; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="background-color: #6D5DF5; padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Verify Your Email</h1>
        </div>
        <div style="padding: 30px; color: #333;">
          <p style="font-size: 16px;">Hi there 👋,</p>
          <p style="font-size: 16px;">To complete your email verification for <strong>Tourmaker</strong>, please use the following one-time password (OTP):</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #f1f1fc; padding: 16px 32px; font-size: 32px; color: #6D5DF5; font-weight: bold; letter-spacing: 6px; border-radius: 8px; border: 2px dashed #6D5DF5;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #555;">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
          <p style="font-size: 14px; color: #888; margin-top: 30px;">If you didn’t request this OTP, you can safely ignore this email.</p>
        </div>
        <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #aaa;">
          &copy; ${new Date().getFullYear()} Tourmaker. All rights reserved.
        </div>
      </div>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ otp }); // Send OTP in response (to store in localStorage client-side)
  } catch (error) {
    console.error("Failed to send OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};
export const getCompanyProfile = async (req, res) => {
  try {
    if (req.role !== "company") {
      return res
        .status(403)
        .json({ message: "Access denied: Not a company user" });
    }

    const company = await Company.findById(req.userId).select("-password");
    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json(company);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateCompanyProfile = async (req, res) => {
  try {
    if (req.role !== "company") {
      return res
        .status(403)
        .json({ message: "Only company users can update this profile." });
    }

    const { userId } = req;

    const updateFields = {
      companyName: req.body.companyName,
      ownerName: req.body.ownerName,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      additionalNumber: req.body.additionalNumber,
      gstin: req.body.gstin,
      buildingName: req.body.buildingName,
      roadAreaStreet: req.body.roadAreaStreet,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      pincode: req.body.pincode,
      logo: req.body.logo,
    };

    const updatedCompany = await Company.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(updatedCompany);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};
export const createBankDetails = async (req, res) => {
  try {
    const {
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      branch,
      qrCodeUrl,
      status,
    } = req.body;
    const newBank = new BankDetails({
      company: req.userId,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      branch,
      qrCodeUrl,
      status,
    });

    await newBank.save();
    res
      .status(201)
      .json({ message: "Bank details added successfully", bank: newBank });
  } catch (err) {
    res.status(500).json({ error: "Server Error", details: err.message });
  }
};

export const getBankDetailsByCompany = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;

    const [banks, total] = await Promise.all([
      BankDetails.find({ company: req.userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      BankDetails.countDocuments({ company: req.userId }),
    ]);

    res
      .status(200)
      .json({ banks, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch bank details", details: err.message });
  }
};
export const updateBankDetails = async (req, res) => {
  try {
    const bank = await BankDetails.findOneAndUpdate(
      { _id: req.params.id, company: req.userId },
      {
        bankName: req.body.bankName,
        accountHolderName: req.body.accountHolderName,
        accountNumber: req.body.accountNumber,
        ifscCode: req.body.ifscCode,
        branch: req.body.branch,
        qrCodeUrl: req.body.qrCodeUrl,
        status: req.body.status,
      },
      { new: true }
    );

    if (!bank) {
      return res.status(404).json({ error: "Bank not found" });
    }

    res.status(200).json({ message: "Bank updated", bank });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update bank details",
      details: err.message,
    });
  }
};

export const getCompanyTerms = async (req, res) => {
  try {
    const company = await Company.findById(req.userId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(
      company.terms || {
        itineraryTerms: "",
        invoiceTerms: "",
        voucherTerms: "",
      }
    );
  } catch (err) {
    console.error("Error fetching company terms:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCompanyTerms = async (req, res) => {
  const { itineraryTerms, invoiceTerms, voucherTerms } = req.body;

  try {
    const company = await Company.findById(req.userId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.terms = {
      itineraryTerms,
      invoiceTerms,
      voucherTerms,
    };

    await company.save();

    res
      .status(200)
      .json({ message: "Terms & Conditions updated successfully" });
  } catch (err) {
    console.error("Error updating company terms:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createBranch = async (req, res) => {
  try {
    const {
      branchName,
      buildingName,
      contactNumber,
      roadAreaStreet,
      email,
      otp,
      city,
      state,
      country,
      pincode,
      gstin,
      status,
    } = req.body;

    // Hash the OTP before saving as password
    const hashedPassword = await bcrypt.hash(otp, 10);

    const newBranch = new Branch({
      branchName,
      buildingName,
      contactNumber,
      roadAreaStreet,
      email,
      password: hashedPassword, // Store hashed OTP here
      city,
      state,
      country,
      pincode,
      gstin,
      status,
      company: req.userId, // From verifyUser middleware
    });

    await newBranch.save();

    res.status(201).json({
      message: "Branch created successfully",
      branch: newBranch,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to create branch",
    });
  }
};

export const getBranches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      company: req.userId,
      branchName: { $regex: search, $options: "i" }, // case-insensitive search
    };

    const totalBranches = await Branch.countDocuments(query);
    const branches = await Branch.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      branches,
      totalPages: Math.ceil(totalBranches / limit),
      currentPage: page,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to fetch branches" });
  }
};

export const updateBranch = async (req, res) => {
  const branchId = req.params.id;
  const companyId = req.userId; // From verifyUser middleware

  const {
    branchName,
    buildingName,
    contactNumber,
    roadAreaStreet,
    email,
    city,
    state,
    country,
    pincode,
    gstin,
    status,
  } = req.body;

  try {
    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Update fields
    branch.branchName = branchName || branch.branchName;
    branch.buildingName = buildingName || branch.buildingName;
    branch.contactNumber = contactNumber || branch.contactNumber;
    branch.roadAreaStreet = roadAreaStreet || branch.roadAreaStreet;
    branch.email = email || branch.email;
    branch.city = city || branch.city;
    branch.state = state || branch.state;
    branch.country = country || branch.country;
    branch.pincode = pincode || branch.pincode;
    branch.gstin = gstin?.trim() === "" ? undefined : gstin;
    branch.status = status || branch.status;

    await branch.save();
    res.status(200).json({ message: "Branch updated successfully" });
  } catch (err) {
    console.error("Update branch failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createFranchisee = async (req, res) => {
  try {
    const {
      franchiseeName,
      buildingName,
      contactNumber,
      roadAreaStreet,
      email,
      otp,
      city,
      state,
      country,
      pincode,
      gstin,
      status,
    } = req.body;

    // Hash the OTP before saving as password
    const hashedPassword = await bcrypt.hash(otp, 10);

    const newFranchisee = new Franchisee({
      franchiseeName,
      buildingName,
      contactNumber,
      roadAreaStreet,
      email,
      password: hashedPassword, // Store hashed OTP here
      city,
      state,
      country,
      pincode,
      gstin,
      status,
      company: req.userId,
    });

    await newFranchisee.save();
    res.status(201).json({
      message: "Franchisee created successfully",
      franchisee: newFranchisee,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to create franchisee" });
  }
};

export const getFranchisees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      company: req.userId,
      franchiseeName: { $regex: search, $options: "i" }, // case-insensitive search
    };

    const totalFranchisees = await Franchisee.countDocuments(query);
    const franchisees = await Franchisee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      franchisees,
      totalPages: Math.ceil(totalFranchisees / limit),
      currentPage: page,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to fetch franchisees" });
  }
};

export const updateFranchisee = async (req, res) => {
  const franchiseeId = req.params.id;
  const companyId = req.userId; // From verifyUser middleware

  const {
    franchiseeName,
    buildingName,
    contactNumber,
    roadAreaStreet,
    email,
    city,
    state,
    country,
    pincode,
    gstin,
    status,
  } = req.body;

  try {
    const franchisee = await Franchisee.findById(franchiseeId);

    if (!franchisee) {
      return res.status(404).json({ message: "Franchisee not found" });
    }

    // Update fields
    franchisee.franchiseeName = franchiseeName || franchisee.franchiseeName;
    franchisee.buildingName = buildingName || franchisee.buildingName;
    franchisee.contactNumber = contactNumber || franchisee.contactNumber;
    franchisee.roadAreaStreet = roadAreaStreet || franchisee.roadAreaStreet;
    franchisee.email = email || franchisee.email;
    franchisee.city = city || franchisee.city;
    franchisee.state = state || franchisee.state;
    franchisee.country = country || franchisee.country;
    franchisee.pincode = pincode || franchisee.pincode;
    franchisee.gstin = gstin?.trim() === "" ? undefined : gstin;
    franchisee.status = status || franchisee.status;

    await franchisee.save();
    res.status(200).json({ message: "Franchisee updated successfully" });
  } catch (err) {
    console.error("Update branch failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createAgent = async (req, res) => {
  try {
    const {
      agentName,
      buildingName,
      contactNumber,
      roadAreaStreet,
      email,
      otp,
      city,
      state,
      country,
      pincode,
      gstin,
      status,
    } = req.body;
    // Hash the OTP before saving as password
    const hashedPassword = await bcrypt.hash(otp, 10);

    const newAgent = new Agent({
      agentName,
      buildingName,
      contactNumber,
      roadAreaStreet,
      email,
      password: hashedPassword, // Store hashed OTP here
      otp,
      city,
      state,
      country,
      pincode,
      gstin,
      status,
      company: req.userId,
    });

    await newAgent.save();
    res
      .status(201)
      .json({ message: "Agent created successfully", agent: newAgent });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to create Agent" });
  }
};

export const getAgents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      company: req.userId,
      agentName: { $regex: search, $options: "i" }, // case-insensitive search
    };

    const totalAgents = await Agent.countDocuments(query);
    const agents = await Agent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      agents,
      totalPages: Math.ceil(totalAgents / limit),
      currentPage: page,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to fetch agencies" });
  }
};

export const updateAgent = async (req, res) => {
  const agentId = req.params.id;
  const companyId = req.userId; // From verifyUser middleware

  const {
    agentName,
    buildingName,
    contactNumber,
    roadAreaStreet,
    email,
    city,
    state,
    country,
    pincode,
    gstin,
    status,
  } = req.body;

  try {
    const agent = await Agent.findById(agentId);

    if (!agent) {
      return res.status(404).json({ message: "agent not found" });
    }

    // Update fields
    agent.agentName = agentName || agent.agentName;
    agent.buildingName = buildingName || agent.buildingName;
    agent.contactNumber = contactNumber || agent.contactNumber;
    agent.roadAreaStreet = roadAreaStreet || agent.roadAreaStreet;
    agent.email = email || agent.email;
    agent.city = city || agent.city;
    agent.state = state || agent.state;
    agent.country = country || agent.country;
    agent.pincode = pincode || agent.pincode;
    agent.gstin = gstin?.trim() === "" ? undefined : gstin;
    agent.status = status || agent.status;

    await agent.save();
    res.status(200).json({ message: "agent updated successfully" });
  } catch (err) {
    console.error("Update agent failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listBranches = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const branches = await Branch.find({
      company: req.userId,
      branchName: { $regex: search, $options: "i" },
    }).select("_id branchName");
    res.json({ branches });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch branches" });
  }
};

// ✅ Fetch Franchisees (name and _id)
export const listFranchisees = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const franchisees = await Franchisee.find({
      company: req.userId,
      franchiseeName: { $regex: search, $options: "i" },
    }).select("_id franchiseeName");
    res.json({ franchisees });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch franchisees" });
  }
};

// ✅ Fetch Employees
// export const listEmployees = async (req, res) => {
//   try {
//     const [frontOfficers, executives] = await Promise.all([
//       FrontOfficer.find({ company: req.userId }),
//       Executive.find({ company: req.userId })
//     ]);
//     const employees = [...frontOfficers, ...executives];
//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch employees' });
//   }
// };
export const listEmployees = async (req, res) => {
  try {
    const [
      frontOfficers,
      executives,
      purchasers,
      digitalMarketers,
      marketingManagers,
      salesManagers,
      creativeStaffs,
      entry,
      frontOfficerManagers,
    ] = await Promise.all([
      FrontOfficer.find({ company: req.userId })
        .populate({ path: "branch", select: "branchName" }) // Use 'branchName'
        .populate({ path: "franchisee", select: "franchiseeName" }), // Use 'franchiseeName'

      Executive.find({ company: req.userId })
        .populate({ path: "branch", select: "branchName" })
        .populate({ path: "franchisee", select: "franchiseeName" }),

      Purchaser.find({ company: req.userId }),
      DigitalMarketer.find({ company: req.userId }),
      MarketingManager.find({ company: req.userId }),
      SalesManager.find({ company: req.userId })
        .populate({ path: "branch", select: "branchName" })
        .populate({ path: "franchisee", select: "franchiseeName" }),
      CreativeStaff.find({ company: req.userId }),
      Entry.find({company: req.userId }),
      FrontOfficerManager.find({company: req.userId}),
    ]);

    const employees = [
      ...frontOfficers,
      ...executives,
      ...purchasers,
      ...digitalMarketers,
      ...marketingManagers,
      ...salesManagers,
      ...creativeStaffs,
      ...entry,
      ...frontOfficerManagers,
    ];
    res.json(employees);
  } catch (err) {
    console.error("Failed to fetch employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// ✅ Create Employee
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      contactNumber,
      email,
      password,
      department,
      type,
      branch,
      franchisee,
      status,
      profileImage,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const baseData = {
      name,
      contactNumber,
      email,
      password: hashedPassword,
      department,
      type,
      company: req.userId,
      status,
      branch: branch || null,
      franchisee: franchisee || null,
      profileImage: profileImage || "",
    };

    let newEmployee;

    if (department === "frontofficer") {
      newEmployee = await new FrontOfficer(baseData).save();
    } else if (department === "executive") {
      newEmployee = await new Executive(baseData).save();
    } else if (department === "purchaser") {
      baseData.type = "Company"; // enforce company type for purchaser
      newEmployee = await new Purchaser(baseData).save();
    } else if (department === "digitalmarketer") {
      baseData.type = "Company";
      newEmployee = await new DigitalMarketer(baseData).save();
    } else if (department === "marketingmanager") {
      baseData.type = "Company";
      newEmployee = await new MarketingManager(baseData).save();
    } else if (department === "salesmanager") {
      newEmployee = await new SalesManager(baseData).save();
    } else if (department === "creativestaff") {
      baseData.type = "Company";
      newEmployee = await new CreativeStaff(baseData).save();
    } else if (department === "entry") {
      baseData.type = "Company";
      newEmployee = await new Entry(baseData).save();
    } else if (department ==="frontofficermanager"){
      baseData.type = "Company";
      newEmployee = await new FrontOfficerManager(baseData).save();
    }else {
      // fallback for future departments (optional)
      newEmployee = await new Employee(baseData).save();
    }

    res
      .status(201)
      .json({ message: "Employee created", employee: newEmployee });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const {
      name,
      contactNumber,
      email,
      password,
      department,
      type,
      branch,
      franchisee,
      status,
    } = req.body;

    const { id } = req.params;

    const updateData = {
      name,
      contactNumber,
      email,
      password, // consider hashing
      department,
      type,
      status,
      branch: branch || null,
      franchisee: franchisee || null,
    };

    let updatedEmployee;

    if (department === "frontofficer") {
      updatedEmployee = await FrontOfficer.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } else {
      updatedEmployee = await Executive.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    }

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee updated", employee: updatedEmployee });
  } catch (err) {
    console.error("Update employee failed:", err);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

//pincode management//
function toInt(v, d) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
}



export async function listCompanyBranches(req, res) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const page = toInt(req.query.page, 1);
    const limit = Math.min(toInt(req.query.limit, 2), 100);
    const search = (req.query.search || "").toString().trim();

    const query = {
      company: req.userId, // if your "company" is different from "userId", adjust here
    };
    if (search) {
      query.branchName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }

    const [items, total] = await Promise.all([
      Branch.find(query)
        .select("branchName contactNumber email status assignedPincodes")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Branch.countDocuments(query),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to list branches" });
  }
}

export async function listCompanyFranchisees(req, res) {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const page = toInt(req.query.page, 1);
    const limit = Math.min(toInt(req.query.limit, 2), 100);
    const search = (req.query.search || "").toString().trim();

    const query = {
      company: req.userId,
    };
    if (search) {
      query.franchiseeName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }

    const [items, total] = await Promise.all([
      Franchisee.find(query)
        .select("franchiseeName contactNumber email status assignedPincodes")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Franchisee.countDocuments(query),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to list franchisees" });
  }
}

// export async function getAssignedPincodes(req, res) {
//   try {
//     const { type, id } = req.params;
//     //if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
//     let doc = null;
//     if (type === "branch") {
//       doc = await Branch.findOne({ _id: id, company: req.userId })
//         .select("branchName assignedPincodes status");
//     } else if (type === "franchisee") {
//       doc = await Franchisee.findOne({ _id: id, company: req.userId })
//         .select("franchiseeName assignedPincodes status");
//     } else {
//       return res.status(400).json({ message: "type must be branch or franchisee" });
//     }
//     if (!doc) return res.status(404).json({ message: "Not found" });
//     res.json({
//       name: type === "branch" ? doc.branchName : doc.franchiseeName,
//       status: doc.status,
//       assignedPincodes: doc.assignedPincodes || [],
//     });
//   } catch (e) {
//     res.status(500).json({ message: "Failed to fetch pincodes" });
//   }
// }

// export async function assignPincodes(req, res) {
//   try {
//     const { type, id } = req.params;
//     //if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
//     const pincodes = normalizePincodes(req.body.pincodes);
//     if (!pincodes.length) return res.status(400).json({ message: "No valid pincodes to assign" });

//     let doc = null;
//     if (type === "branch") {
//       doc = await Branch.findOneAndUpdate(
//         { _id: id, company: req.userId },
//         { $addToSet: { assignedPincodes: { $each: pincodes } } },
//         { new: true, projection: "branchName assignedPincodes" }
//       );
//     } else if (type === "franchisee") {
//       doc = await Franchisee.findOneAndUpdate(
//         { _id: id, company: req.userId },
//         { $addToSet: { assignedPincodes: { $each: pincodes } } },
//         { new: true, projection: "franchiseeName assignedPincodes" }
//       );
//     } else {
//       return res.status(400).json({ message: "type must be branch or franchisee" });
//     }
//     if (!doc) return res.status(404).json({ message: "Not found" });

//     res.json({ assignedPincodes: doc.assignedPincodes || [] });
//   } catch (e) {
//     res.status(500).json({ message: "Failed to assign pincodes" });
//   }
// }

// export async function removePincodes(req, res) {
//   try {
//     const { type, id } = req.params;
//     //if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
//     const pincodes = normalizePincodes(req.body.pincodes);
//     if (!pincodes.length) return res.status(400).json({ message: "No valid pincodes to remove" });

//     let doc = null;
//     if (type === "branch") {
//       doc = await Branch.findOneAndUpdate(
//         { _id: id, company: req.userId },
//         { $pull: { assignedPincodes: { $in: pincodes } } },
//         { new: true, projection: "branchName assignedPincodes" }
//       );
//     } else if (type === "franchisee") {
//       doc = await Franchisee.findOneAndUpdate(
//         { _id: id, company: req.userId },
//         { $pull: { assignedPincodes: { $in: pincodes } } },
//         { new: true, projection: "franchiseeName assignedPincodes" }
//       );
//     } else {
//       return res.status(400).json({ message: "type must be branch or franchisee" });
//     }
//     if (!doc) return res.status(404).json({ message: "Not found" });

//     res.json({ assignedPincodes: doc.assignedPincodes || [] });
//   } catch (e) {
//     res.status(500).json({ message: "Failed to remove pincodes" });
//   }
// }
const isObjId = (v) => mongoose.isValidObjectId(v);

// Accept "673001, 673002" or ["673001", "673002"], return unique 6-digit only
function normalizePincodesSix(input) {
  const parts = Array.isArray(input)
    ? input
    : String(input || "").split(/[,\s]+/);
  const uniq = Array.from(
    new Set(parts.map(s => String(s || "").trim()).filter(Boolean))
  );
  return uniq.filter(p => /^\d{6}$/.test(p));
}

// Look for conflicts in BOTH collections for this company
async function findConflicts(companyId, pincodes, exclude) {
  const filter = { company: companyId, assignedPincodes: { $in: pincodes } };

  const [branches, franchisees] = await Promise.all([
    Branch.find(filter, "branchName assignedPincodes"),
    Franchisee.find(filter, "franchiseeName assignedPincodes"),
  ]);

  const out = [];
  for (const d of branches) {
    if (!(exclude?.type === "branch" && String(d._id) === String(exclude?.id))) {
      d.assignedPincodes
        .filter(p => pincodes.includes(p))
        .forEach(p => out.push({ pincode: p, type: "branch", name: d.branchName, id: d._id }));
    }
  }
  for (const d of franchisees) {
    if (!(exclude?.type === "franchisee" && String(d._id) === String(exclude?.id))) {
      d.assignedPincodes
        .filter(p => pincodes.includes(p))
        .forEach(p => out.push({ pincode: p, type: "franchisee", name: d.franchiseeName, id: d._id }));
    }
  }
  return out;
}

export async function getAssignedPincodes(req, res) {
  try {
    const { type, id } = req.params;
    if (!["branch","franchisee"].includes(type)) {
      return res.status(400).json({ message: "type must be branch or franchisee" });
    }
    if (!isObjId(id)) return res.status(400).json({ message: "Invalid id" });

    const companyId = req.companyId || req.user?.companyId || req.userId;
    if (!isObjId(companyId)) return res.status(401).json({ message: "Company context missing" });

    const Model = type === "branch" ? Branch : Franchisee;
    const doc = await Model.findOne({ _id: id, company: companyId })
      .select(type === "branch" ? "branchName assignedPincodes status" : "franchiseeName assignedPincodes status");

    if (!doc) return res.status(404).json({ message: "Not found" });

    res.json({
      name: type === "branch" ? doc.branchName : doc.franchiseeName,
      status: doc.status,
      assignedPincodes: doc.assignedPincodes || [],
    });
  } catch (e) {
    console.error("getAssignedPincodes error:", e);
    res.status(500).json({ message: "Failed to fetch pincodes" });
  }
}

export async function assignPincodes(req, res) {
  try {
    const { type, id } = req.params;
    if (!["branch","franchisee"].includes(type)) {
      return res.status(400).json({ message: "type must be branch or franchisee" });
    }
    if (!isObjId(id)) return res.status(400).json({ message: "Invalid id" });

    const companyId = req.companyId || req.user?.companyId || req.userId;
    if (!isObjId(companyId)) return res.status(401).json({ message: "Company context missing" });

    const pins = normalizePincodesSix(req.body.pincodes);
    if (!pins.length) {
      return res.status(400).json({ message: "Enter at least one 6-digit pincode" });
    }

    // Simple + efficient uniqueness check across both collections
    const conflicts = await findConflicts(companyId, pins, { type, id });
    if (conflicts.length) {
      return res.status(409).json({
        message: "Pincode(s) already assigned within company",
        conflicts, // [{pincode, type, name, id}]
      });
    }

    const Model = type === "branch" ? Branch : Franchisee;
    const updated = await Model.findOneAndUpdate(
      { _id: id, company: companyId },
      { $addToSet: { assignedPincodes: { $each: pins } } },
      { new: true, projection: "assignedPincodes" }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });

    return res.json({ assignedPincodes: updated.assignedPincodes || [] });
  } catch (e) {
    console.error("assignPincodes error:", e);
    return res.status(500).json({ message: "Failed to assign pincodes" });
  }
}

export async function removePincodes(req, res) {
  try {
    const { type, id } = req.params;
    if (!["branch","franchisee"].includes(type)) {
      return res.status(400).json({ message: "type must be branch or franchisee" });
    }
    if (!isObjId(id)) return res.status(400).json({ message: "Invalid id" });

    const companyId = req.companyId || req.user?.companyId || req.userId;
    if (!isObjId(companyId)) return res.status(401).json({ message: "Company context missing" });

    const pins = normalizePincodesSix(req.body.pincodes);
    if (!pins.length) return res.status(400).json({ message: "Enter valid 6-digit pincodes" });

    const Model = type === "branch" ? Branch : Franchisee;
    const updated = await Model.findOneAndUpdate(
      { _id: id, company: companyId },
      { $pull: { assignedPincodes: { $in: pins } } },
      { new: true, projection: "assignedPincodes" }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });

    return res.json({ assignedPincodes: updated.assignedPincodes || [] });
  } catch (e) {
    console.error("removePincodes error:", e);
    return res.status(500).json({ message: "Failed to remove pincodes" });
  }
}