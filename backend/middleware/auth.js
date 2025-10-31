// import jwt from "jsonwebtoken";

// export const verifyUser = (req, res, next) => {
//   console.log(req.cookies)
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ message: "Access denied. No token provided." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

//     req.userId = decoded._id;
//     req.role = decoded.role;
//     console.log(req.userId,req.role)
//     next();
//   } catch (err) {
//     return res.status(400).json({ message: "Invalid token." });
//   }
// };
// middleware/auth.js
import jwt from "jsonwebtoken";
import FrontOfficer from "../models/frontOfficerModel.js";

export const verifyUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded._id;
    req.role = decoded.role;
    req.sessionVersion = decoded.sessionVersion ?? 0;

    // Enforce sessionVersion for frontofficers
    if (req.role === "frontofficer") {
      const fo = await FrontOfficer.findById(req.userId).select("sessionVersion");
      if (!fo) return res.status(401).json({ message: "Invalid token." });
      if ((fo.sessionVersion ?? 0) !== req.sessionVersion) {
        return res.status(401).json({ message: "Session expired. Please login again." });
      }
      // touch activity
      await FrontOfficer.findByIdAndUpdate(req.userId, { $set: { lastActivityAt: new Date() } });
    }

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};
