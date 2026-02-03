// routes/uploadRoute.js
import express from "express";
import { verifyUser } from "../middleware/auth.js";
import { signR2Upload } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/r2/sign", verifyUser, signR2Upload);

export default router;
