import cryptoRandomString from "crypto-random-string";
import { sendPasswordResetEmail } from "../helpers/emailVerification.js";
import User from "../models/user.js";

const verifyEmail = async (req, res) => {
  const verificationToken = req.params.verificationToken;

  try {
    const user = await User.findOneAndUpdate(
      { verificationToken },
      { $set: { verified: true }, $unset: { verificationToken: "" } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Invalid or expired verification token",
        code: 400,
      });
    }

    res.status(202).json({
      error: false,
      message: "Email verified successfully",
      code: 202,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const resetToken = cryptoRandomString({
      length: 24,
      type: "url-safe",
    });

    // Set the password reset token
    user.resetToken = resetToken;
    await user.save();

    const resetLink = `${process.env.BASE_URL}reset-password/${resetToken}`;

    // Send the password reset email to the user
    await sendPasswordResetEmail(user.name, user.email, resetLink);

    res.status(202).json({
      error: false,
      message: "Password reset instructions sent to your email",
      code: 202,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: true, message: "Internal server error", code: 500 });
  }
};

const resetPassword = async (req, res) => {
  const resetToken = req.params.resetToken;
  const newPassword = req.body.newPassword;
  console.log(resetToken);

  try {
    const user = await User.findOneAndUpdate(
      { resetToken },
      {
        $set: { passwordHash: bcrypt.hashSync(newPassword, 10) },
        $unset: { resetToken: "" },
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Invalid or expired reset token",
        code: 400,
      });
    }

    res
      .status(200)
      .json({ error: false, message: "Password reset successfull" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

export { verifyEmail, forgotPassword, resetPassword };
