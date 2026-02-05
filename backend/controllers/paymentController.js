import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Client from "../models/clientModel.js";
import ClientPayment from "../models/ClientPayment.js";
import { sendPaymentOtpEmail } from "../utils/sendPaymentOtpEmail.js";

/* -----------------------------------------
  Helpers
----------------------------------------- */
function asClean(v) {
  return String(v ?? "").trim();
}

function normalizeEmail(v) {
  return asClean(v).toLowerCase();
}

function normalizeMobile(v) {
  return asClean(v).replace(/\D/g, "");
}

// YYYY-MM-DD -> Date at 00:00 local
function parseYmdToDate(ymd) {
  const s = asClean(ymd);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  const ad = new Date(a); ad.setHours(0,0,0,0);
  const bd = new Date(b); bd.setHours(0,0,0,0);
  return ad.getTime() === bd.getTime();
}

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
function normalizeOrderId(v) {
  const s = asClean(v);
  if (!s) return "";
  // handle "id,id" or "id, id"
  return s.split(",")[0].trim();
}


/**
 * paymentToken design (no login):
 * - HMAC signed, short-lived (10 min)
 * - includes: clientObjectId + mobile + email + exp
 */
function signPaymentToken(payload) {
  const secret = mustEnv("PAYMENT_TOKEN_SECRET");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyPaymentToken(token) {
  const secret = mustEnv("PAYMENT_TOKEN_SECRET");
  const t = asClean(token);
  const [bodyB64, sig] = t.split(".");
  if (!bodyB64 || !sig) return null;

  const expected = crypto.createHmac("sha256", secret).update(bodyB64).digest("base64url");
  if (expected !== sig) return null;

  const json = JSON.parse(Buffer.from(bodyB64, "base64url").toString("utf8"));
  if (!json?.exp || Date.now() > Number(json.exp)) return null;
  return json;
}

/* -----------------------------------------
  HDFC SmartGateway API client (Basic Auth)
  - API Key as username, password is blank
----------------------------------------- */
function hdfcAxios() {
  const baseURL = mustEnv("HDFC_BASE_URL");
  const apiKey = mustEnv("HDFC_API_KEY");

  return axios.create({
    baseURL,
    timeout: 20000,
    auth: { username: apiKey, password: "" },
    headers: { "Content-Type": "application/json" },
  });
}



function maskEmail(email) {
  const s = asClean(email);
  const [u, d] = s.split("@");
  if (!u || !d) return "****";
  return `${u.slice(0, 2)}***@${d}`;
}

function genOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sha256Hex(s) {
  return crypto.createHash("sha256").update(String(s)).digest("hex");
}
function daysBetweenInclusive(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  const e = new Date(end);   e.setHours(0, 0, 0, 0);
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0; // inclusive
}
export async function findClientByPaymentCode(req, res) {
  try {
    const paymentCode = asClean(req.body?.paymentCode).toUpperCase();
    if (!paymentCode || paymentCode.length < 6) {
      return res.status(400).json({ message: "Invalid paymentCode" });
    }

    const client = await Client.findOne({ paymentCode })
      .select("_id clientId name mobileNumber email groupType numberOfPersons tourStartDate tourEndDate numberOfDays pincode district state confirmedTourType confirmedTour")
      .lean();

    if (!client) {
      return res.status(404).json({ message: "No client found for this payment code" });
    }

    const exp = Date.now() + 10 * 60 * 1000;

    const paymentToken = signPaymentToken({
      clientObjectId: String(client._id),
      paymentCode,
      exp,
      otpVerified: false,
    });

    return res.json({
      client: {
        clientObjectId: String(client._id),
        clientId: client.clientId || "",
        name: client.name || "",
        mobileNumber: client.mobileNumber || "",
        email: client.email || "",
        emailMasked: maskEmail(client.email || ""),
        confirmedTourType: client.confirmedTourType || "",
        confirmedTourName: client.confirmedTour?.tourName || "",
        groupType: client.groupType || null,
        numberOfPersons: Number(client.numberOfPersons || 0),
        startDate: client.tourStartDate || null,
        endDate: client.tourEndDate || null,
        numberOfDays: daysBetweenInclusive(client.tourStartDate, client.tourEndDate),
        pincode: client.pincode || "",
        district: client.district || "",
        state: client.state || "",
      },
      paymentToken,
    });
  } catch (err) {
    console.error("findClientByPaymentCode error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function sendPaymentOtp(req, res) {
  try {
    const token = asClean(req.body?.paymentToken);
    const decoded = verifyPaymentToken(token);
    if (!decoded) return res.status(401).json({ message: "Invalid/expired paymentToken" });

    const clientObjectId = asClean(decoded.clientObjectId);
    if (!mongoose.isValidObjectId(clientObjectId)) {
      return res.status(400).json({ message: "Invalid clientObjectId" });
    }

    const client = await Client.findById(clientObjectId)
      .select("_id email paymentOtpLastSentAt")
      .lean();

    if (!client) return res.status(404).json({ message: "Client not found" });

    const email = asClean(client.email);
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Client email not available" });
    }

    // cooldown (45 sec)
    if (client.paymentOtpLastSentAt) {
      const ms = Date.now() - new Date(client.paymentOtpLastSentAt).getTime();
      if (ms < 45 * 1000) {
        return res.status(429).json({ message: "Please wait before requesting OTP again" });
      }
    }

    const otp = genOtp6();
    const otpHash = sha256Hex(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Client.updateOne(
      { _id: client._id },
      {
        $set: {
          paymentOtpHash: otpHash,
          paymentOtpExpiresAt: expiresAt,
          paymentOtpVerifiedAt: null,
          paymentOtpLastSentAt: new Date(),
        },
      }
    );

    await sendPaymentOtpEmail(email, otp);

    return res.json({ message: "OTP sent", emailMasked: maskEmail(email) });
  } catch (err) {
    console.error("sendPaymentOtp error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function verifyPaymentOtp(req, res) {
  try {
    const token = asClean(req.body?.paymentToken);
    const otp = asClean(req.body?.otp);

    const decoded = verifyPaymentToken(token);
    if (!decoded) return res.status(401).json({ message: "Invalid/expired paymentToken" });

    const clientObjectId = asClean(decoded.clientObjectId);
    if (!mongoose.isValidObjectId(clientObjectId)) {
      return res.status(400).json({ message: "Invalid clientObjectId" });
    }
    if (!otp || otp.length < 4) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const client = await Client.findById(clientObjectId)
      .select("_id paymentOtpHash paymentOtpExpiresAt email totalAmountToBePaid totalAmountPaid balance")
      .lean();

    if (!client) return res.status(404).json({ message: "Client not found" });

    const expAt = client.paymentOtpExpiresAt ? new Date(client.paymentOtpExpiresAt) : null;
    if (!client.paymentOtpHash || !expAt || Date.now() > expAt.getTime()) {
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    const ok = sha256Hex(otp) === asClean(client.paymentOtpHash);
    if (!ok) return res.status(400).json({ message: "Invalid OTP" });

    await Client.updateOne(
      { _id: client._id },
      {
        $set: { paymentOtpVerifiedAt: new Date() },
        $unset: { paymentOtpHash: "", paymentOtpExpiresAt: "" },
      }
    );

    // issue VERIFIED token (longer)
    const exp = Date.now() + 30 * 60 * 1000;
    const verifiedToken = signPaymentToken({
      clientObjectId: String(client._id),
      paymentCode: decoded.paymentCode,
      exp,
      otpVerified: true,
    });

    return res.json({
      message: "OTP verified",
      verifiedToken,
      amounts: {
        totalAmountToBePaid: Math.round(Number(client.totalAmountToBePaid || 0)),
        totalAmountPaid: Math.round(Number(client.totalAmountPaid || 0)),
        balance: Math.max(0, Math.round(Number(client.balance || 0))),
      },
    });
  } catch (err) {
    console.error("verifyPaymentOtp error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


/* -----------------------------------------
  1) FIND CLIENTS (public)
  POST /api/v1/payments/public/find-clients
----------------------------------------- */
export async function findClientsForPayment(req, res) {
  try {
    const mobileNumber = normalizeMobile(req.body?.mobileNumber);
    const email = normalizeEmail(req.body?.email);
    const tourStartDate = parseYmdToDate(req.body?.tourStartDate);

    if (!mobileNumber || mobileNumber.length < 10) {
      return res.status(400).json({ message: "Invalid mobileNumber" });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (!tourStartDate) {
      return res.status(400).json({ message: "Invalid tourStartDate (YYYY-MM-DD)" });
    }

    // Your definition of “confirmed”: the executive flow sets totalAmountToBePaid/balance
    // We ensure tourStartDate matches and totalAmountToBePaid > 0
    const candidates = await Client.find({
      mobileNumber,
      email,
      tourStartDate: { $exists: true },
      totalAmountToBePaid: { $gt: 0 },
    })
      .select("_id clientId name tourStartDate totalAmountToBePaid totalAmountPaid balance confirmedTourType confirmedTour")
      .sort({ tourStartDate: -1, createdAt: -1 })
      .lean();

    // Exact date match (same day) to avoid timezone mismatches
    const matched = (candidates || []).filter((c) => sameDay(c.tourStartDate, tourStartDate));

    if (!matched.length) {
      return res.status(404).json({ message: "No confirmed client found for given details" });
    }

    // issue per-client paymentToken (10 min)
    const exp = Date.now() + 10 * 60 * 1000;

    const result = matched.map((c) => ({
      clientObjectId: String(c._id),
      clientId: c.clientId || "",
      name: c.name || "",
      tourStartDate: c.tourStartDate,
      confirmedTourType: c.confirmedTourType || "",
      confirmedTourName: c.confirmedTour?.tourName || "",
      totalAmountToBePaid: Math.round(Number(c.totalAmountToBePaid || 0)),
      totalAmountPaid: Math.round(Number(c.totalAmountPaid || 0)),
      balance: Math.max(0, Math.round(Number(c.balance || 0))),
      paymentToken: signPaymentToken({
        clientObjectId: String(c._id),
        mobileNumber,
        email,
        exp,
      }),
    }));

    return res.json({ matches: result });
  } catch (err) {
    console.error("findClientsForPayment error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/* -----------------------------------------
  2) CREATE SESSION (public)
  POST /api/v1/payments/public/hdfc/create-session

  Creates:
   - one ClientPayment ledger row (CREATED)
   - calls SmartGateway Session API -> gets payment_link
----------------------------------------- */
export async function createHdfcSession(req, res) {
  try {
    const token = asClean(req.body?.paymentToken);
    console.log(token,"token1")
    const decoded = verifyPaymentToken(token);
    console.log(decoded,"decoded2")
    if (!decoded) return res.status(401).json({ message: "Invalid/expired paymentToken" });

    const clientObjectId = asClean(req.body?.clientObjectId);
    console.log(clientObjectId,"clientObjectId3")
    const amountRupees = Math.round(Number(req.body?.amountRupees || 0));
    console.log(amountRupees,"amountRupees4")
    if (!mongoose.isValidObjectId(clientObjectId)) {
      return res.status(400).json({ message: "Invalid clientObjectId" });
    }
    if (String(decoded.clientObjectId) !== String(clientObjectId)) {
      return res.status(403).json({ message: "Token does not match client" });
    }
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      return res.status(400).json({ message: "Invalid amountRupees" });
    }

    const client = await Client.findById(clientObjectId)
      .select("_id clientId name mobileNumber email tourStartDate totalAmountToBePaid totalAmountPaid balance")
      .lean();
      console.log(client,"client5")

    if (!client) return res.status(404).json({ message: "Client not found" });

    const balance = Math.max(0, Math.round(Number(client.balance || 0)));
    if (balance <= 0) return res.status(400).json({ message: "No balance to pay" });
    if (amountRupees > balance) return res.status(400).json({ message: `Amount exceeds balance (${balance})` });

    // Generate unique orderId (safe for retries)
    const orderId = `TM_${client.clientId || "CLIENT"}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    console.log(orderId,"orderId6")
    // Build return_url (HDFC redirects browser here after payment)
    const backendBase = mustEnv("APP_PUBLIC_BACKEND_URL");
    console.log(backendBase,"backendBase7")
    const frontendBase = mustEnv("APP_PUBLIC_FRONTEND_URL");
    console.log(frontendBase,"frontendBase8")
    const returnUrl = `${backendBase}/api/v1/payments/hdfc/return?order_id=${encodeURIComponent(orderId)}&cb=${encodeURIComponent(frontendBase + "/pay")}`;
    console.log(returnUrl,"returnUrl9")

    // Create ledger first
    const ledger = await ClientPayment.create({
      clientObjectId: client._id,
      clientIdText: client.clientId || "",
      mobileNumber: client.mobileNumber || "",
      email: client.email || "",
      tourStartDate: client.tourStartDate || null,
      amountRupees,
      orderId,
      status: "CREATED",
    });
    console.log(ledger,"ledger10")

    // Call Session API
    // NOTE: Exact fields can vary by merchant config, but core idea is consistent:
    // - merchant_id
    // - order_id
    // - amount
    // - currency
    // - customer details
    // - return_url
    const hdfc = hdfcAxios();
    console.log(hdfc,"hdfc11")
    const merchantId = mustEnv("HDFC_MERCHANT_ID");
    console.log(merchantId,"merchantId12")
    const paymentPageClientId = mustEnv("HDFC_PAYMENT_PAGE_CLIENT_ID");
    console.log(paymentPageClientId,"paymentPageClientId13")

    const sessionPayload = {
      merchant_id: merchantId,
      payment_page_client_id: paymentPageClientId,
      order_id: orderId,
      amount: amountRupees,
      currency: "INR",
      customer_email: client.email || decoded.email,
      customer_phone: client.mobileNumber || decoded.mobileNumber,
      return_url: returnUrl,
      // optional metadata
      udf1: String(client._id),
      udf2: client.clientId || "",
    };
    console.log(sessionPayload,"sessionPayload14")
    const sgRes = await hdfc.post("/session", sessionPayload);
    console.log(sgRes,"sgRes15")
    // Commonly returned keys include payment_link/session_id (names may differ)
   const data = sgRes?.data || {};
   console.log(data,"data16")

const paymentLink =
  data?.payment_links?.web ||
  data?.payment_link ||
  data?.paymentLink ||
  data?.redirect_url ||
  data?.redirectUrl ||
  data?.url ||
  "";
console.log(paymentLink,"paymentLink17")
const sessionId =
  data?.id ||
  data?.session_id ||
  data?.sessionId ||
  "";
console.log(sessionId,"sessionId18")

    if (!paymentLink) {
      await ClientPayment.updateOne(
        { _id: ledger._id },
        {
          $set: {
            status: "FAILED",
            failureReason: "NO_PAYMENT_LINK_FROM_GATEWAY",
            rawStatusResponse: sgRes?.data || {},
          },
        }
      );
      return res.status(502).json({ message: "Gateway did not return payment link" });
    }
console.log(ledger,"ledger19")
    await ClientPayment.updateOne(
      { _id: ledger._id },
      { $set: { paymentLink, sessionId, status: "REDIRECTED" } }
    );
console.log(ledger,"ledger20")
    // Return to frontend: redirect to paymentLink
    return res.json({
      orderId,
      paymentLink,
    });
  } catch (err) {
    console.error("createHdfcSession error:", err?.response?.data || err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/* -----------------------------------------
  3) RETURN URL HANDLER (public)
  GET /api/v1/payments/hdfc/return

  - Verify signature if enabled (recommended) :contentReference[oaicite:5]{index=5}
  - MUST call Order Status API to confirm final status :contentReference[oaicite:6]{index=6}
  - Credit client balance only once (idempotent)
----------------------------------------- */
export async function handleHdfcReturn(req, res) {
  // const orderId = asClean(req.query?.order_id || req.query?.orderId);
  // const callbackUrl = asClean(req.query?.cb); // we pass /pay here
  // const allParams = { ...req.query };
  
const allParams = req.method === "POST" ? { ...req.body } : { ...req.query };
console.log(allParams,"allParams21")
const orderId = normalizeOrderId(allParams.order_id || allParams.orderId);
console.log(orderId,"orderId22")
const callbackUrl = asClean(allParams.cb);
console.log(callbackUrl,"callbackUrl23")
  try {
    if (!orderId) {
      return res.redirect(callbackUrl || "/");
    }

    // load ledger
    const payDoc = await ClientPayment.findOne({ orderId });
    console.log(payDoc,"payDoc24")
    if (!payDoc) {
      return res.redirect(callbackUrl || "/");
    }

    // Signature verification (if you enabled "Use signed response")
    // HDFC docs: HMAC-SHA256 with Response Key, percent encoding rules, etc. :contentReference[oaicite:7]{index=7}
    // Implementation varies by parameter rules; below is a safe minimal approach:
    // - remove signature fields
    // - build sorted query string
    // - HMAC SHA256 with response key
    // If your dashboard uses exact Juspay encoding rules, we can tighten this further.
    let signatureValid = null;
    console.log(signatureValid,"signatureValid25")
    const responseKey = process.env.HDFC_RESPONSE_KEY;
    console.log(responseKey,"responseKey26")
    const signature = asClean(allParams.signature);
    console.log(signature,"signature27")
    const signatureAlgorithm = asClean(allParams.signature_algorithm);
    console.log(signatureAlgorithm,"signatureAlgorithm28")

    if (responseKey && signature) {
      // remove signature fields
      const copy = { ...allParams };
      delete copy.signature;
      delete copy.signature_algorithm;

      const keys = Object.keys(copy).sort(); // basic sort
      console.log(keys,"keys29")
      const base = keys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(asClean(copy[k]))}`).join("&");
      console.log(base,"base30")
      const computed = crypto.createHmac("sha256", responseKey).update(base).digest("base64");
      console.log(computed,"computed31")
      // Some setups require percent-decoding signature once before compare (docs mention this). :contentReference[oaicite:8]{index=8}
      const sigDecoded = decodeURIComponent(signature);
      console.log(sigDecoded,"sigDecoded32")
      signatureValid = (computed === signature) || (computed === sigDecoded);
      console.log(signatureValid,"signatureValid33")
      await ClientPayment.updateOne(
        { _id: payDoc._id },
        { $set: { returnSignatureValid: signatureValid, rawReturnParams: allParams } }
      );
    } else {
      await ClientPayment.updateOne(
        { _id: payDoc._id },
        { $set: { rawReturnParams: allParams } }
      );
    }

    // Order Status API call (mandatory for final decision) :contentReference[oaicite:9]{index=9}
    const hdfc = hdfcAxios();
    console.log(hdfc,"hdfc34")
    const statusRes = await hdfc.get(`/orders/${encodeURIComponent(orderId)}`);
    console.log(statusRes,"statusRes35")
    const statusData = statusRes?.data || {};
    console.log(statusData,"statusData36")
    const gatewayStatus = asClean(statusData.status || statusData.order_status || statusData.txn_status);
    console.log(gatewayStatus,"gatewayStatus37")
    await ClientPayment.updateOne(
      { _id: payDoc._id },
      { $set: { lastGatewayStatus: gatewayStatus, rawStatusResponse: statusData } }
    );

    // Interpret statuses:
    // Common “success-like”: CHARGED / SUCCESS / CAPTURED
    // Common “failed-like”: FAILED / FAILURE
    // Pending: PENDING / AUTHORIZING / CREATED
    const isSuccess = ["CHARGED", "SUCCESS", "CAPTURED"].includes(gatewayStatus.toUpperCase());
    const isFailed = ["FAILED", "FAILURE"].includes(gatewayStatus.toUpperCase());

    if (isFailed) {
      await ClientPayment.updateOne(
        { _id: payDoc._id },
        { $set: { status: "FAILED", failureReason: asClean(statusData.error_message || "PAYMENT_FAILED") } }
      );
      return res.redirect(`${callbackUrl || "/"}?orderId=${encodeURIComponent(orderId)}&status=FAILED`);
    }

    if (!isSuccess) {
      await ClientPayment.updateOne({ _id: payDoc._id }, { $set: { status: "PENDING" } });
      return res.redirect(`${callbackUrl || "/"}?orderId=${encodeURIComponent(orderId)}&status=PENDING`);
    }

    // // SUCCESS: credit idempotently + atomically
    // const session = await mongoose.startSession();
    // try {
    //   await session.withTransaction(async () => {
    //     const claimed = await ClientPayment.findOneAndUpdate(
    //       { _id: payDoc._id, credited: false },
    //       { $set: { status: "SUCCESS", credited: true, creditedAt: new Date() } },
    //       { new: true, session }
    //     );

    //     if (!claimed) return; // already credited (idempotent)

    //     const client = await Client.findById(payDoc.clientObjectId)
    //       .select("_id totalAmountToBePaid totalAmountPaid balance")
    //       .session(session);

    //     if (!client) {
    //       await ClientPayment.updateOne(
    //         { _id: payDoc._id },
    //         { $set: { creditedAmountRupees: 0 } },
    //         { session }
    //       );
    //       return;
    //     }

    //     const totalToPay = Math.round(Number(client.totalAmountToBePaid || 0));
    //     const paid = Math.round(Number(client.totalAmountPaid || 0));
    //     const balance = Math.max(0, Math.round(Number(client.balance || 0)));

    //     const intended = Math.round(Number(payDoc.amountRupees || 0));
    //     const creditable = Math.max(0, Math.min(intended, balance));

    //     const newPaid = Math.min(totalToPay, paid + creditable);
    //     const newBalance = Math.max(0, totalToPay - newPaid);

    //     if (creditable > 0) {
    //       await Client.updateOne(
    //         { _id: client._id },
    //         { $set: { totalAmountPaid: newPaid, balance: newBalance } },
    //         { session }
    //       );
    //     }

    //     await ClientPayment.updateOne(
    //       { _id: payDoc._id },
    //       { $set: { creditedAmountRupees: creditable } },
    //       { session }
    //     );
    //   });
    // } finally {
    //   session.endSession();
    // }
    // SUCCESS: credit idempotently (no transaction needed for standalone Mongo)
const claimed = await ClientPayment.findOneAndUpdate(
  { _id: payDoc._id, credited: false },
  { $set: { status: "SUCCESS", credited: true, creditedAt: new Date() } },
  { new: true }
);

if (!claimed) {
  return res.redirect(`${callbackUrl || "/"}?orderId=${encodeURIComponent(orderId)}&status=SUCCESS`);
}

const client = await Client.findById(payDoc.clientObjectId)
  .select("_id totalAmountToBePaid totalAmountPaid balance");

if (!client) {
  await ClientPayment.updateOne({ _id: payDoc._id }, { $set: { creditedAmountRupees: 0 } });
  return res.redirect(`${callbackUrl || "/"}?orderId=${encodeURIComponent(orderId)}&status=SUCCESS`);
}

const totalToPay = Math.round(Number(client.totalAmountToBePaid || 0));
const paid = Math.round(Number(client.totalAmountPaid || 0));
const balance = Math.max(0, Math.round(Number(client.balance || 0)));

const intended = Math.round(Number(payDoc.amountRupees || 0));
const creditable = Math.max(0, Math.min(intended, balance));

const newPaid = Math.min(totalToPay, paid + creditable);
const newBalance = Math.max(0, totalToPay - newPaid);

if (creditable > 0) {
  await Client.updateOne(
    { _id: client._id },
    { $set: { totalAmountPaid: newPaid, balance: newBalance } }
  );
}

await ClientPayment.updateOne(
  { _id: payDoc._id },
  { $set: { creditedAmountRupees: creditable } }
);

    return res.redirect(`${callbackUrl || "/"}?orderId=${encodeURIComponent(orderId)}&status=SUCCESS`);
  } catch (err) {
    console.error("handleHdfcReturn error:", err?.response?.data || err);
    // Even if return_url fails, payment might be successful.
    // UI can poll /status/:orderId
    return res.redirect(`${callbackUrl || "/"}?orderId=${encodeURIComponent(orderId)}&status=UNKNOWN`);
  }
}

/* -----------------------------------------
  4) PUBLIC POLL STATUS (for UI)
  GET /api/v1/payments/public/status/:orderId
----------------------------------------- */
export async function getPaymentStatusPublic(req, res) {
  try {
    const orderId = asClean(req.params.orderId);
    if (!orderId) return res.status(400).json({ message: "Missing orderId" });

    const payDoc = await ClientPayment.findOne({ orderId })
      .select("orderId status credited creditedAmountRupees lastGatewayStatus createdAt updatedAt")
      .lean();

    if (!payDoc) return res.status(404).json({ message: "Order not found" });

    return res.json({ payment: payDoc });
  } catch (err) {
    console.error("getPaymentStatusPublic error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/* -----------------------------------------
  5) PAYMENT HISTORY (public but token-protected)
  GET /api/v1/payments/public/client/:clientObjectId/history?paymentToken=...
----------------------------------------- */
export async function listClientPaymentsPublic(req, res) {
  try {
    const clientObjectId = asClean(req.params.clientObjectId);
    const token = asClean(req.query.paymentToken);

    const decoded = verifyPaymentToken(token);
    if (!decoded) return res.status(401).json({ message: "Invalid/expired paymentToken" });
    if (String(decoded.clientObjectId) !== String(clientObjectId)) {
      return res.status(403).json({ message: "Token does not match client" });
    }

    const rows = await ClientPayment.find({ clientObjectId })
      .select("orderId amountRupees status credited creditedAmountRupees failureReason createdAt")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.json({ history: rows });
  } catch (err) {
    console.error("listClientPaymentsPublic error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
