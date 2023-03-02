import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
// import { verifyJwt } from "../helpers/jwt.js";
const userRouter = express.Router();

// Get Users
userRouter.route("/").get(async (req, res) => {
  const userList = await User.find({}).select("-passwordHash -__v");

  if (!userList)
    res.status(500).json({ success: false, message: "Cannot fetch users" });
  res.json({ success: true, userList });
});

// Get Single Users
userRouter.route("/:id").get(async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash -__v");

  if (!user)
    res.status(500).json({ success: false, message: "Cannot fetch user" });
  res.json({ success: true, user });
});

// Create new User
userRouter.route("/signup").post(async (req, res) => {
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
  });

  await user
    .save()
    .then((newUser) => {
      if (!newUser)
        res.status(404).json({
          error: true,
          message: "The user couldn't be created",
        });
      res.status(201).json({
        error: false,
        newUser,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.status(400).json({
          error: true,
          message: "User already exist. Use a different email",
        });
      }
      res.status(500).json({
        error: true,
        data: err,
        success: false,
      });
    });
});

// Authenticate User
userRouter.route("/login").post(async (req, res) => {
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
});

userRouter.route("/").post(async (req, res) => {
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
  });

  await user
    .save()
    .then((newUser) => {
      if (!newUser)
        res.status(404).json({
          error: true,
          message: "The user couldn't be created",
        });
      res.status(201).json({
        error: false,
        newUser,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.status(400).json({
          error: true,
          message: "User already exist. Use a different email",
        });
      }
      res.status(500).json({
        error: true,
        data: err,
        success: false,
      });
    });
});

// Get total number of users
userRouter.route("/get/count").get(async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) res.status(500).json({ success: false });
  res.status(200).json({ success: true, userCount });
});

// Delete User
userRouter.route("/:id").delete(async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "User is deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found!" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: true, data: err, success: false });
    });
});

export default userRouter;
