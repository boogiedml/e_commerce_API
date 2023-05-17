import express from "express";
import { verifyEmail } from "../controllers/auth.js";

const authRouter = express.Router();

// Verify User
authRouter.route("/verify-email").get(verifyEmail);

export default authRouter;
