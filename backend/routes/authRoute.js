// import express from "express";
// import { login, getMe, logout } from "../controllers/authController.js";

// const router = express.Router();
// router.post("/login", login);
// router.get("/me", getMe);
// router.post("/logout", logout);



// export default router;
// routes/authRoute.js
import express from "express";
import { login, getMe, logout, getSocketToken } from "../controllers/authController.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();
router.post("/login", login);
router.get("/me", getMe);
router.post("/logout", logout);
router.get("/socket-token", verifyUser, getSocketToken); // 👈

export default router;
