import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  listApprovedAdRequestsInDigitalMarketerSide,
  getApprovedAdRequestInDigitalMarketerSide,
  markAdRequestPosted,
  listApprovedLeadRequestsInDigitalMarketerSide,
  getApprovedLeadRequestInDigitalMarketerSide,
  markLeadRequestPosted,
  listApprovedUploadRequestsInDigitalMarketerSide,
  getApprovedUploadRequestInDigitalMarketerSide,
  markUploadRequestPosted,
  listDigitalMarketerAssignedAdTasks,
  getDigitalMarketerAssignedAdTask,
  markAssignedAdTaskPosted,
  listDigitalMarketerAssignedLeadTasks,
  getDigitalMarketerAssignedLeadTask,
  markAssignedLeadTaskPosted,
  listAssignedUploadTasksForDM,
  getAssignedUploadTaskForDM,
  markUploadAssignmentPosted
} from "../controllers/digitalMarketerController.js";

const router = express.Router();
//adrequest management //
router.get(
  "/approved-ad-requests",
  verifyUser,
  listApprovedAdRequestsInDigitalMarketerSide
);
router.get(
  "/approved-ad-requests/:id",
  verifyUser,
  getApprovedAdRequestInDigitalMarketerSide
);
router.post(
  "/approved-ad-requests/:id/mark-posted",
  verifyUser,
  markAdRequestPosted
);
// lead request management//
router.get(
  "/lead-requests",
  verifyUser,
  listApprovedLeadRequestsInDigitalMarketerSide
);
router.get(
  "/lead-requests/:id",
  verifyUser,
  getApprovedLeadRequestInDigitalMarketerSide
);
router.post(
  "/lead-requests/:id/mark-posted",
  verifyUser,
  markLeadRequestPosted
);
router.get("/upload-requests", verifyUser,listApprovedUploadRequestsInDigitalMarketerSide );
router.get("/upload-requests/:id", verifyUser,getApprovedUploadRequestInDigitalMarketerSide );
router.post("/upload-requests/:id/mark-posted", verifyUser,markUploadRequestPosted );
//assigned ad task management//
router.get( "/assigned-ad-tasks",           verifyUser, listDigitalMarketerAssignedAdTasks);
router.get( "/assigned-ad-tasks/:id",       verifyUser, getDigitalMarketerAssignedAdTask);
router.post("/assigned-ad-tasks/:id/mark-posted", verifyUser, markAssignedAdTaskPosted);
//assigned lead task management//

router.get( "/assigned-lead-tasks",                 verifyUser, listDigitalMarketerAssignedLeadTasks);
router.get( "/assigned-lead-tasks/:id",             verifyUser, getDigitalMarketerAssignedLeadTask);
router.post("/assigned-lead-tasks/:id/mark-posted", verifyUser, markAssignedLeadTaskPosted);
//assigned upload task management//
router.get("/upload-assignments", verifyUser, listAssignedUploadTasksForDM);
router.get("/upload-assignments/:id", verifyUser, getAssignedUploadTaskForDM);
router.post("/upload-assignments/:id/mark-posted", verifyUser, markUploadAssignmentPosted);

export default router;
