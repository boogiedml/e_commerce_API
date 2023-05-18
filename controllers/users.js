import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../helpers/emailVerification.js";
import User from "../models/user.js";
import cryptoRandomString from "crypto-random-string";

const getAllUsers = async (req, res) => {
  const userList = await User.find({}).select(
    "-passwordHash -__v -verificationToken"
  );

  if (!userList)
    res.status(500).json({ success: false, message: "Cannot fetch users" });
  res.json({ success: true, userList });
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash -__v");

  if (!user)
    res.status(404).json({ success: false, message: "User not found!" });
  res.json({ success: true, user });
};

const addUser = async (req, res) => {
  const verificationToken = cryptoRandomString({
    length: 24,
    type: "url-safe",
  });

  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      apartment: req.body.apartment,
      street: req.body.street,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
      verificationToken: verificationToken,
    });

    const newUser = await user.save();

    const verificationLink = `${process.env.BASE_URL}verify-email/${verificationToken}`;

    await sendVerificationEmail(newUser.name, newUser.email, verificationLink);

    res.status(201).json({
      error: false,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        isAdmin: newUser.isAdmin,
        apartment: newUser.apartment,
        street: newUser.street,
        zip: newUser.zip,
        city: newUser.city,
        country: newUser.country,
      },
      message: "Account Created, Proceed to verify your email",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: true,
        message: "User already exists. Please use a different email address.",
      });
    }
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

const authenticateUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    res.status(400).json({
      error: true,
      message: "User not found!",
    });

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      error: true,
      data: {
        email: user.email,
        userId: user.id,
        isAdmin: user.isAdmin,
        token: token,
      },
      message: "User Authenticated",
    });
  } else {
    res.status(400).json({
      error: true,
      message: "Password is invalid!",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        apartment: req.body.apartment,
        street: req.body.street,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "The User with the given ID was not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTotalNumberOfUsers = async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) res.status(500).json({ success: false });
  res.status(200).json({ success: true, userCount });
};

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res.status(204).send();
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found!" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: true, data: err, success: false });
    });
};

export {
  getAllUsers,
  getUser,
  addUser,
  authenticateUser,
  updateUser,
  getTotalNumberOfUsers,
  deleteUser,
};
