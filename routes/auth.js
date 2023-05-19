import express from "express";
import {
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.js";

const authRouter = express.Router();

// Verify User
authRouter.route("/verify-email/:verificationToken").get(verifyEmail);
authRouter.route("/request-password-reset").post(forgotPassword);
authRouter.route("/reset-password/:resetToken").post(resetPassword);

export default authRouter;
