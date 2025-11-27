// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import SalesExecutive from "../models/salesExecutiveModel.js";
// import Company from "../models/companyModel.js";
// import Purchaser from "../models/purchaserModel.js";
// import DigitalMarketer from "../models/digitalMarketerModel.js";
// import SalesManager from "../models/salesManagerModel.js";
// import MarketingManager from "../models/marketingManagerModel.js";
// import CreativeStaff from "../models/creativeStaffModel.js";
// import Entry from "../models/entryModel.js";
// import FrontOfficer from "../models/frontOfficerModel.js";
// import FrontOfficerManager from "../models/frontOfficerManagerModel.js";


// export const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const userModels = [
//       { model: SalesExecutive, role: "salesExecutive" },
//       { model: Company, role: "company" },
//       { model: Purchaser, role: "purchaser" },
//       { model: DigitalMarketer, role: "digitalmarketer"},
//       { model: MarketingManager, role: "marketingmanager"},
//       { model: SalesManager, role: "salesmanager"},
//       { model: CreativeStaff, role:"creativestaff"},
//       { model: Entry, role:"entry"},
//       { model: FrontOfficer, role:"frontofficer"},
//       { model: FrontOfficerManager, role:"frontofficermanager"},



     
//       // add more roles here...
//     ];

//     let user = null;
//     let role = null;

//     // Efficient search: one model at a time, break early
//     for (let entry of userModels) {
//       const found = await entry.model.findOne({ email }).lean(); // lean = faster read-only
//       if (found) {
//         const isMatch = await bcrypt.compare(password, found.password);
//         if (!isMatch) {
//           return res.status(401).json({ message: "Invalid credentials" });
//         }
//         user = found;
//         role = entry.role;
//         break;
//       }
//     }

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { _id: user._id, role: role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res
//       .cookie("token", token, {
//         httpOnly: true,
//         secure: false, // Set to true in production with HTTPS
//         sameSite: "lax",
//          maxAge: 24 * 60 * 60 * 1000, // 1 day
        
//       })
//       .status(200)
//       .json({
//         message: "Login successful",
//         role: role,
//       });

//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const getMe = async (req, res) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ message: "Not authenticated" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     res.status(200).json({ role: decoded.role, userId: decoded._id });
    
    
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// export const logout = async (req, res) => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: false, // Set true in production with HTTPS
//       sameSite: "lax",
//     });
//     res.status(200).json({ message: "Logout successful" });
//   } catch (error) {
//     console.error("Logout error:", error);
//     res.status(500).json({ message: "Server error during logout" });
//   }
// };
// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SalesExecutive from "../models/salesExecutiveModel.js";
import Company from "../models/companyModel.js";
import Purchaser from "../models/purchaserModel.js";
import DigitalMarketer from "../models/digitalMarketerModel.js";
import SalesManager from "../models/salesManagerModel.js";
import MarketingManager from "../models/marketingManagerModel.js";
import CreativeStaff from "../models/creativeStaffModel.js";
import Entry from "../models/entryModel.js";
import FrontOfficer from "../models/frontOfficerModel.js";
import FrontOfficerManager from "../models/frontOfficerManagerModel.js";
import Executive from "../models/executiveModel.js"

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const userModels = [
      { model: SalesExecutive, role: "salesExecutive" },
      { model: Company, role: "company" },
      { model: Purchaser, role: "purchaser" },
      { model: DigitalMarketer, role: "digitalmarketer"},
      { model: MarketingManager, role: "marketingmanager"},
      { model: SalesManager, role: "salesmanager"},
      { model: CreativeStaff, role:"creativestaff"},
      { model: Entry, role:"entry"},
      { model: FrontOfficer, role:"frontofficer"},
      { model: FrontOfficerManager, role:"frontofficermanager"},
      { model: Executive , role:"executive"}
    ];

    let user = null;
    let role = null;

    for (let entry of userModels) {
      // IMPORTANT: need password for compare
      const found = await entry.model.findOne({ email }).select("+password");
      if (found) {
        const isMatch = await bcrypt.compare(password, found.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        if (typeof found.status === "string" && found.status === "Inactive") {
          return res.status(403).json({ message: "You can't login now. Your account is Inactive." });
        }
        user = found;
        role = entry.role;
        break;
      }
    }

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // 🔁 For frontofficer: set active/online & touch telemetry
    let sessionVersion = 0;
    if (role === "frontofficer") {
      const now = new Date();
      const updated = await FrontOfficer.findByIdAndUpdate(
        user._id,
        {
          $set: {
            // status: "Active",
            isOnline: true,
            lastLoginAt: now,
            lastActivityAt: now,
          }
        },
        { new: true }
      ).select("sessionVersion");
      sessionVersion = updated?.sessionVersion ?? 0;
    }

    const token = jwt.sign(
      { _id: user._id, role, sessionVersion },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // true in HTTPS
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Login successful", role });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ role: decoded.role, userId: decoded._id });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const logout = async (req, res) => {
  try {
    // If FO, mark inactive + bump sessionVersion
    try {
      const token = req.cookies.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.role === "frontofficer") {
          await FrontOfficer.findByIdAndUpdate(
            decoded._id,
            { $set: {  isOnline: false }, $inc: { sessionVersion: 1 } }
          );
        }
      }
    } catch {}

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};
// controllers/authController.js (add)
export const getSocketToken = async (req, res) => {
  try {
    const token = jwt.sign(
      { _id: req.userId, role: req.role, sessionVersion: req.sessionVersion },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ socketToken: token });
  } catch {
    res.status(500).json({ message: "Could not issue socket token" });
  }
};
