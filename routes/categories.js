import express from "express";
import {
  getAllCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.js";

const categoryRouter = express.Router();

// get all categories
categoryRouter.route("/").get(getAllCategories);

// get category
categoryRouter.route("/:id").get(getCategory);

// Add Category
categoryRouter.route("/").post(addCategory);

// Update Category
categoryRouter.route("/:id").put(updateCategory);

// Delete Category
categoryRouter.route("/:id").delete(deleteCategory);

export default categoryRouter;
