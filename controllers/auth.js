import User from "../models/user.js";

const verifyEmail = async (req, res) => {
  const verificationToken = req.query.token;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Update the user's email verification status
    user.verified = true;
    delete user.verificationToken; // Remove verification token field
    await user.save();

    res
      .status(200)
      .json({ error: false, message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

export { verifyEmail };
