import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  getCompanyProfile,
  sendOtpToEmail,
  updateCompanyProfile,
  createBankDetails,
  getBankDetailsByCompany,
  updateBankDetails,
  getCompanyTerms,
  updateCompanyTerms,
  createBranch,
  getBranches,
  updateBranch,
  createFranchisee,
  getFranchisees,
  updateFranchisee,
  createAgent,
  getAgents,
  updateAgent,
  listBranches,
  listFranchisees,
  listEmployees,
  createEmployee,
  updateEmployee,
  listCompanyBranches,
  listCompanyFranchisees,
  getAssignedPincodes,
  assignPincodes,
  removePincodes,
  listExecutivesForPercentage,
  updateExecutivePercentage
} from "../controllers/companyController.js";

const router = express.Router();
router.get("/profile", verifyUser, getCompanyProfile);
router.put("/profileUpdate", verifyUser, updateCompanyProfile);
router.post("/addBankDetails", verifyUser, createBankDetails);
router.get("/getBankDetails", verifyUser, getBankDetailsByCompany);
router.put("/updateBankDetails/:id", verifyUser, updateBankDetails);
router.get("/terms", verifyUser, getCompanyTerms);
router.put("/terms", verifyUser, updateCompanyTerms);
router.post("/createBranch", verifyUser, createBranch);
router.get("/listBranch", verifyUser, getBranches);
router.put('/updateBranch/:id', verifyUser, updateBranch);
router.post("/createFranchisee", verifyUser, createFranchisee);
router.get("/listFranchisee", verifyUser, getFranchisees);
router.put('/updateFranchisee/:id', verifyUser, updateFranchisee);
router.post("/createAgent", verifyUser, createAgent)
router.get("/listAgent", verifyUser, getAgents)
router.put("/updateAgent/:id", verifyUser, updateAgent)
router.get('/listBranchInEmployeeCreate', verifyUser, listBranches);
router.get('/listFranchiseeInEmployeeCreate', verifyUser, listFranchisees);
router.get('/listEmployee', verifyUser, listEmployees);
router.post('/createEmployee', verifyUser, createEmployee);
router.put('/updateEmployee/:id', verifyUser, updateEmployee);

router.post("/sendOtp", sendOtpToEmail);
//pincode management//
router.get("/branches", verifyUser, listCompanyBranches);
router.get("/franchisees", verifyUser, listCompanyFranchisees);

router.get("/:type/:id", verifyUser, getAssignedPincodes); // type = branch|franchisee
router.post("/:type/:id/assign", verifyUser, assignPincodes);
router.post("/:type/:id/remove", verifyUser, removePincodes);
//percentage management of executives//
// ✅ List (pagination + filters)
router.get("/executives", verifyUser, listExecutivesForPercentage);

// ✅ Update incentives
router.put("/executives/:id/incentives", verifyUser, updateExecutivePercentage);

export default router;
