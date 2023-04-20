import express from "express";
import {
  addOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  getTotalNumberOfOrders,
  getTotalNumberOfSales,
  getUserOrder,
  updateOrder,
} from "../controllers/orders.js";

const orderRouter = express.Router();

// Get All Orders
orderRouter.route("/").get(getAllOrders);

// get Order by Id
orderRouter.route("/:id").get(getOrder);

// Create new Order
orderRouter.route("/").post(addOrder);

// Update Order
orderRouter.route("/:id").put(updateOrder);

// Delete Order
orderRouter.route("/:id").delete(deleteOrder);

// Get Total sales
orderRouter.route("/get/totalsales").get(getTotalNumberOfSales);

// Get total number of orders
orderRouter.route("/get/count").get(getTotalNumberOfOrders);

// Get User Orders
orderRouter.route("/get/user-order/:userid").get(getUserOrder);

export default orderRouter;
