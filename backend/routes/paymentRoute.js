import express from "express";
import rateLimit from "express-rate-limit";
import {
  findClientByPaymentCode,
  sendPaymentOtp,
  verifyPaymentOtp,
  findClientsForPayment,
  createHdfcSession,
  handleHdfcReturn,
  getPaymentStatusPublic,
  listClientPaymentsPublic,
} from "../controllers/paymentController.js";

const router = express.Router();

// Basic rate limit (public endpoints)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

// 1) Find matching clients (mobile+email+tourStartDate)
router.post("/public/find-clients", limiter, findClientsForPayment);
router.post("/public/find-by-code", limiter, findClientByPaymentCode);
router.post("/public/send-otp", limiter, sendPaymentOtp);
router.post("/public/verify-otp", limiter, verifyPaymentOtp);

// 2) Create session/payment link (requires paymentToken)
router.post("/public/hdfc/create-session", limiter, createHdfcSession);

// 3) Return URL target (HDFC redirects browser here)
// NOTE: This is a GET because many gateways return query params
router.get("/hdfc/return", handleHdfcReturn);
router.post("/hdfc/return", handleHdfcReturn);
// 4) Public polling (optional, nice UI)
router.get("/public/status/:orderId", limiter, getPaymentStatusPublic);

// 5) Payment history for selected client (requires paymentToken)
router.get("/public/client/:clientObjectId/history", limiter, listClientPaymentsPublic);

export default router;
