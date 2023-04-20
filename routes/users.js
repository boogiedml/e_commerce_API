import express from "express";
import {
  getAllUsers,
  getUser,
  addUser,
  authenticateUser,
  getTotalNumberOfUsers,
  deleteUser,
  updateUser,
  // emailVerification,
} from "../controllers/users.js";

const userRouter = express.Router();

// Get All Users
userRouter.route("/").get(getAllUsers);

// Get Single Users
userRouter.route("/:id").get(getUser);

// Create new User
userRouter.route("/signup").post(addUser);

// Authenticate User
userRouter.route("/login").post(authenticateUser);

// Update User
userRouter.route("/:id").put(updateUser);

// Get total number of users
userRouter.route("/get/count").get(getTotalNumberOfUsers);

// Delete User
userRouter.route("/:id").delete(deleteUser);

// Verify User
// userRouter.route("/verify/:id").delete(emailVerification);

export default userRouter;
