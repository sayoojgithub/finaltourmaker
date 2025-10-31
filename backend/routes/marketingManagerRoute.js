import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  listMarketingAdRequests,
  listCompanyCreativeStaff,
  getMarketingAdRequest,
  approveMarketingAdRequest,
  rejectMarketingAdRequest,
  listCompanyDigitalMarketers,
  listMarketingLeadRequests,
  getMarketingLeadRequest,
  approveMarketingLeadRequest,
  rejectMarketingLeadRequest,
  listMarketingDailyTaskRequests,
  getMarketingDailyTaskRequest,
  approveMarketingDailyTaskRequest,
  rejectMarketingDailyTaskRequest,
  listMarketingUploadRequests,
  getMarketingUploadRequest,
  approveMarketingUploadRequest,
  rejectMarketingUploadRequest,
  listAdCategories,
  getAdCategory,
  createAdCategory,
  updateAdCategory,
  deleteAdCategory,
  addAdField,
  updateAdField,
  deleteAdField,
  reorderAdFields,
  listAdCategoriesLeadSide,
  getAdCategoryLeadSide,
  listCompanyCreativeAdRequests,
  getCompanyCreativeAdRequest,
  approveCompanyCreativeAdRequest,
  rejectCompanyCreativeAdRequest,
  listCompanyCreativeLeadRequests,
  getCompanyCreativeLeadRequest,
  approveCompanyCreativeLeadRequest,
  rejectCompanyCreativeLeadRequest,
  listCompanyCreativeUploadRequests,
  getCompanyCreativeUploadRequest,
  approveCompanyCreativeUploadRequest,
  rejectCompanyCreativeUploadRequest,
  listCompanyDmAdRequests,
  listCompanyDmLeadRequests,
  listCompanyDmUploadRequests,
  mmGetCountries,
  mmGetStates,
  mmGetDestinations,
  createAdAssignment,
  mmLeadAssignCountries,
  mmLeadAssignStates,
  mmLeadAssignDestinations,
  mmLeadAssignTours,
  createLeadAssignment,
  createUploadAssignment,
  listCompanyCreativeAdAssignments,
  getCompanyCreativeAdAssignment,
  approveCompanyCreativeAdAssignment,
  rejectCompanyCreativeAdAssignment,
  listCompanyCreativeAssignedLeads,
  getCompanyCreativeAssignedLead,
  approveCompanyCreativeAssignedLead,
  rejectCompanyCreativeAssignedLead,
  listCompanyCreativeUploadAssignments,
  getCompanyCreativeUploadAssignment,
  approveCompanyCreativeUploadAssignment,
  rejectCompanyCreativeUploadAssignment,
  listCompanyDmAdTasks,
  listCompanyDmLeadTasks,
  listCompanyDmUploadAssignments,

  

} from "../controllers/marketingManagerController.js";

const router = express.Router();
router.get("/ad-requests", verifyUser, listMarketingAdRequests);
router.get("/ad-requests/:id", verifyUser, getMarketingAdRequest);
router.post("/ad-requests/:id/approve", verifyUser, approveMarketingAdRequest);
router.post("/ad-requests/:id/reject", verifyUser, rejectMarketingAdRequest);

// helper: populate the <Select> with DMs for this company
router.get("/digital-marketers", verifyUser, listCompanyDigitalMarketers);
router.get("/creative-staff", verifyUser, listCompanyCreativeStaff);
router.get("/lead-requests", verifyUser, listMarketingLeadRequests);
router.get("/lead-requests/:id", verifyUser, getMarketingLeadRequest);

// Decisions
router.post(
  "/lead-requests/:id/approve",
  verifyUser,
  approveMarketingLeadRequest
);
router.post(
  "/lead-requests/:id/reject",
  verifyUser,
  rejectMarketingLeadRequest
);
router.get("/ad-categories-leadside", verifyUser, listAdCategoriesLeadSide);
router.get("/ad-categories-leadside/:id", verifyUser, getAdCategoryLeadSide);
router.get("/daily-task-requests", verifyUser, listMarketingDailyTaskRequests);
router.get("/daily-task-requests/:id", verifyUser, getMarketingDailyTaskRequest);
router.post("/daily-task-requests/:id/approve", verifyUser, approveMarketingDailyTaskRequest);
router.post("/daily-task-requests/:id/reject", verifyUser, rejectMarketingDailyTaskRequest);
router.get("/upload-requests", verifyUser, listMarketingUploadRequests);
router.get("/upload-requests/:id", verifyUser, getMarketingUploadRequest);
router.post("/upload-requests/:id/approve", verifyUser, approveMarketingUploadRequest);
router.post("/upload-requests/:id/reject", verifyUser, rejectMarketingUploadRequest);

// Categories
router.get("/ad-categories", verifyUser, listAdCategories);
router.get("/ad-categories/:id", verifyUser, getAdCategory);
router.post("/ad-categories", verifyUser, createAdCategory);
router.patch("/ad-categories/:id", verifyUser, updateAdCategory);
router.delete("/ad-categories/:id", verifyUser, deleteAdCategory);

// Fields within a category
router.post("/ad-categories/:id/fields", verifyUser, addAdField);
router.patch("/ad-categories/:id/fields/:fieldId", verifyUser, updateAdField);
router.delete("/ad-categories/:id/fields/:fieldId", verifyUser, deleteAdField);
router.patch("/ad-categories/:id/fields-reorder", verifyUser, reorderAdFields);

//adrequestmanagementaftercreativestaffassignement//
router.get("/creative-ad-requests", verifyUser, listCompanyCreativeAdRequests);
router.get("/creative-ad-requests/:id", verifyUser, getCompanyCreativeAdRequest);
router.post("/creative-ad-requests/:id/approve", verifyUser, approveCompanyCreativeAdRequest);
router.post("/creative-ad-requests/:id/reject", verifyUser, rejectCompanyCreativeAdRequest);
//leadrequestmanagementaftercreativestaffassignement//
router.get( "/creative-lead-requests",            verifyUser, listCompanyCreativeLeadRequests);
router.get( "/creative-lead-requests/:id",        verifyUser, getCompanyCreativeLeadRequest);
router.post("/creative-lead-requests/:id/approve",verifyUser, approveCompanyCreativeLeadRequest);
router.post("/creative-lead-requests/:id/reject", verifyUser, rejectCompanyCreativeLeadRequest);
//uploadrequestmanagementaftercreativestaffassignment//
router.get("/creative-upload-requests", verifyUser, listCompanyCreativeUploadRequests);
router.get("/creative-upload-requests/:id", verifyUser, getCompanyCreativeUploadRequest);
router.post("/creative-upload-requests/:id/approve", verifyUser, approveCompanyCreativeUploadRequest);
router.post("/creative-upload-requests/:id/reject", verifyUser, rejectCompanyCreativeUploadRequest);
//adrequestanalysisofdigitalmarketer//
router.get("/dm-ad-requests", verifyUser, listCompanyDmAdRequests);
//leadrequestanalysisofdigitalmarketer//
router.get("/dm-lead-requests", verifyUser, listCompanyDmLeadRequests);
//uploadrequestanalysisofdigitalmarketer//
router.get("/dm-upload-requests", verifyUser, listCompanyDmUploadRequests);
//adtask analysis of digital marketer//
router.get("/dm-ad-tasks", verifyUser, listCompanyDmAdTasks);
//lead task analysis of digital marketer//
router.get("/dm-lead-tasks", verifyUser, listCompanyDmLeadTasks);
//upload task analysis of digital marketer//
router.get("/dm-upload-assignments", verifyUser, listCompanyDmUploadAssignments);

//assign own ad task//
router.get("/countries", verifyUser, mmGetCountries);
router.get("/states/:countryId", verifyUser, mmGetStates);
router.get("/destinations/:countryId/:stateId", verifyUser, mmGetDestinations);
router.post("/ad-assignments", verifyUser, createAdAssignment);
//assign own lead task//
router.get("/lead-assign/countries", verifyUser, mmLeadAssignCountries);
router.get("/lead-assign/states/:countryId", verifyUser, mmLeadAssignStates);
router.get("/lead-assign/destinations/:countryId/:stateId", verifyUser, mmLeadAssignDestinations);
router.get("/lead-assign/tours", verifyUser, mmLeadAssignTours);
router.post("/lead-assignments", verifyUser, createLeadAssignment);
//assign own upload task//
router.post("/upload-assignments", verifyUser, createUploadAssignment);
//adassignedmanagement after creative staff done that//
router.get("/creative-ad-assignments", verifyUser, listCompanyCreativeAdAssignments);
router.get("/creative-ad-assignments/:id", verifyUser, getCompanyCreativeAdAssignment);
router.post("/creative-ad-assignments/:id/approve", verifyUser, approveCompanyCreativeAdAssignment);
router.post("/creative-ad-assignments/:id/reject", verifyUser, rejectCompanyCreativeAdAssignment);
//leadassignemnt management after creative staff done that//
router.get( "/creative-assigned-leads",             verifyUser, listCompanyCreativeAssignedLeads);
router.get( "/creative-assigned-leads/:id",         verifyUser, getCompanyCreativeAssignedLead);
router.post("/creative-assigned-leads/:id/approve", verifyUser, approveCompanyCreativeAssignedLead);
router.post("/creative-assigned-leads/:id/reject",  verifyUser, rejectCompanyCreativeAssignedLead);
//upload assignment task management after creative staff done that//
router.get( "/creative-upload-assignments",             verifyUser, listCompanyCreativeUploadAssignments);
router.get( "/creative-upload-assignments/:id",         verifyUser, getCompanyCreativeUploadAssignment);
router.post("/creative-upload-assignments/:id/approve", verifyUser, approveCompanyCreativeUploadAssignment);
router.post("/creative-upload-assignments/:id/reject",  verifyUser, rejectCompanyCreativeUploadAssignment);
//adtask analysis of digital markters//


export default router;
