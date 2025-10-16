import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  listCreativeAdRequests,
  getCreativeAdRequest,
  toggleCreativeStatus,
  saveCreativeFilenames,
  sendCreativeWorkForApproval,
  listCreativeLeadRequests,
  getCreativeLeadRequest,
  toggleLeadToggled,
  saveLeadFilenames,
  sendLeadWorkForApproval,
  listCreativeUploadRequests,
  getCreativeUploadRequest,
  toggleUploadToggled,
  saveUploadFilenames,
  sendUploadWorkForApproval,
  listCreativeAdAssignments,
  getCreativeAdAssignment,
  toggleCreativeAdAssignment,
  saveCreativeAdAssignmentFilenames,
  sendCreativeAdAssignmentForApproval,
  listCreativeLeadAssignments,
  getCreativeLeadAssignment,
  toggleLeadAssignment,
  saveLeadAssignmentFilenames,
  sendLeadAssignmentForApproval,
  listCreativeUploadAssignments,
  getCreativeUploadAssignment,
  toggleUploadAssignment,
  saveUploadAssignmentFilenames,
  sendUploadAssignmentForApproval
} from "../controllers/creativeStaffController.js";

const router = express.Router();
//addrequest//
router.get("/ad-requests", verifyUser, listCreativeAdRequests);
router.get("/ad-requests/:id", verifyUser, getCreativeAdRequest);
router.post("/ad-requests/:id/toggle", verifyUser, toggleCreativeStatus);
router.post("/ad-requests/:id/filenames", verifyUser, saveCreativeFilenames);
router.post("/ad-requests/:id/send-for-approval", verifyUser, sendCreativeWorkForApproval)
//leadrequest//
router.get("/lead-requests", verifyUser, listCreativeLeadRequests);
router.get("/lead-requests/:id", verifyUser, getCreativeLeadRequest);
router.post("/lead-requests/:id/toggle", verifyUser, toggleLeadToggled);
router.post("/lead-requests/:id/filenames", verifyUser, saveLeadFilenames);
router.post("/lead-requests/:id/send-for-approval", verifyUser, sendLeadWorkForApproval);
//uploadrequest//
router.get("/upload-requests", verifyUser, listCreativeUploadRequests);
router.get("/upload-requests/:id", verifyUser, getCreativeUploadRequest);
router.post("/upload-requests/:id/toggle", verifyUser, toggleUploadToggled);
router.post("/upload-requests/:id/filenames", verifyUser, saveUploadFilenames);
router.post("/upload-requests/:id/send-for-approval", verifyUser, sendUploadWorkForApproval);
//adassignment//
router.get("/ad-assignments", verifyUser, listCreativeAdAssignments);
router.get("/ad-assignments/:id", verifyUser, getCreativeAdAssignment);
router.post("/ad-assignments/:id/toggle", verifyUser, toggleCreativeAdAssignment);
router.post("/ad-assignments/:id/filenames", verifyUser, saveCreativeAdAssignmentFilenames);
router.post("/ad-assignments/:id/send-for-approval", verifyUser, sendCreativeAdAssignmentForApproval);
//leadassignments//
router.get("/lead-assignments", verifyUser, listCreativeLeadAssignments);
router.get("/lead-assignments/:id", verifyUser, getCreativeLeadAssignment);
router.post("/lead-assignments/:id/toggle", verifyUser, toggleLeadAssignment);
router.post("/lead-assignments/:id/filenames", verifyUser, saveLeadAssignmentFilenames);
router.post("/lead-assignments/:id/send-for-approval", verifyUser, sendLeadAssignmentForApproval)
//uploadassignment//
router.get("/upload-assignments", verifyUser, listCreativeUploadAssignments);
router.get("/upload-assignments/:id", verifyUser, getCreativeUploadAssignment);
router.post("/upload-assignments/:id/toggle", verifyUser, toggleUploadAssignment);
router.post("/upload-assignments/:id/filenames", verifyUser, saveUploadAssignmentFilenames);
router.post("/upload-assignments/:id/send-for-approval", verifyUser, sendUploadAssignmentForApproval);

export default router;
