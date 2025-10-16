import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import SalesExecutive from "../models/salesExecutiveModel.js";
import Company from "../models/companyModel.js";
import { sendStandardEmail } from "../utils/sendStandardEmail.js";


export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Admin login successful" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getSalesExecutives = async (req, res) => {
  try {
     const adminExists = await Admin.findById(req.userId);
    if (!adminExists) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const [executives, totalCount] = await Promise.all([
      SalesExecutive.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      SalesExecutive.countDocuments()
    ]);

    res.status(200).json({
      executives,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales executives", error: err.message });
  }
};

export const registerSalesExecutive = async (req, res) => {
  console.log(req.userId,"adminId")
  const { name, email, phoneNumber, password } = req.body;

  try {
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await SalesExecutive.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Sales executive already exists" });
    }

    const adminExists = await Admin.findById(req.userId);
    if (!adminExists) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newExecutive = new SalesExecutive({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      createdBy: req.adminId,
    });

    await newExecutive.save();

    res.status(201).json({ message: "Sales Executive registered successfully" });
  } catch (err) {
    console.error("Error registering sales executive:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const assignTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end, target } = req.body;

    if (!start || !end || !target) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exec = await SalesExecutive.findById(id);
    if (!exec) {
      return res.status(404).json({ message: "Sales Executive not found" });
    }

    const targetObj = {
      start: new Date(start),
      end: new Date(end),
      target: Number(target)
    };

    exec.targets.push(targetObj);
    await exec.save();

    res.status(200).json({ message: "Target assigned successfully", updatedExecutive: exec });
  } catch (err) {
    console.error("Assign target error:", err);
    res.status(500).json({ message: "Failed to assign target" });
  }
};



export const getRegisteredCompaniesForAdmin = async (req, res) => {
  try {
    const adminExists = await Admin.findById(req.userId);
    if (!adminExists) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 7;
    const skip = (page - 1) * limit;

    const totalCompanies = await Company.countDocuments();
    const totalPages = Math.ceil(totalCompanies / limit);

    const companies = await Company.find()
      .select("companyName email contactNumber city state verificationStatus salesExecutive")
      .populate("salesExecutive", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      companies,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching registered companies (Admin):", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const approveCompany = async (req, res) => {
  try {
    const adminExists = await Admin.findById(req.userId);
    if (!adminExists) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    const plainPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    company.verificationStatus = true;
   company.password = hashedPassword;
    await company.save();
    // await sendStandardEmail(company.email, company.companyName, plainPassword);
     try {
      await sendStandardEmail(company.email, company.companyName, plainPassword);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);

      // Optional: rollback changes (not required but good for integrity)
      company.verificationStatus = false;
      company.password = null;
      await company.save();

      return res.status(500).json({ message: "Email sending failed. Approval rolled back." });
    }

    res.status(200).json({ message: "Company verified successfully" });
  } catch (err) {
    console.error("Error approving company:", err);
    res.status(500).json({ message: "Server error" });
  }
};