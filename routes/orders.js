import express from "express";
import Order from "../models/order.js";
import OrderItem from "../models/order-item.js";

const orderRouter = express.Router();

// Get All Orders
orderRouter.route("/").get(async (req, res) => {
  const orderList = await Order.find({})
    .populate("user", "name email")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 });

  if (!orderList)
    res
      .status(500)
      .json({ success: false, message: "Cannot fetch order list" });
  res.send({ success: true, orderList });
});

// get Order by Id
orderRouter.route("/:id").get(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 });

  if (!order)
    res.status(500).json({ success: false, message: "Cannot fetch order" });
  res.send({ success: true, order });
});

// Create new User
orderRouter.route("/").post(async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderitem) => {
      let newOrderItem = new OrderItem({
        quantity: orderitem.quantity,
        product: orderitem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    (
      await orderItemsIds
    ).map(async (orderItemsId) => {
      const orderItem = await OrderItem.findById(orderItemsId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((prev, next) => prev + next, 0);

  const order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  await order
    .save()
    .then((newOrder) => {
      if (!newOrder)
        res.status(404).json({
          error: true,
          message: "The order couldn't be created",
        });
      res.status(201).json({
        error: false,
        newOrder,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: true,
        data: err,
        success: false,
      });
    });
});

// Update Order
orderRouter.route("/:id").put(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );

  if (!order)
    res.status(500).json({
      success: false,
      message: "The order with the given ID was not found",
    });
  res
    .status(200)
    .json({ success: true, order: order, message: "Order Updated" });
});

// Delete Order
orderRouter.route("/:id").delete(async (req, res) => {
  const getOrderItems = await Order.findById(req.params.id);

  getOrderItems.orderItems.map(async (orderitem) => {
    await OrderItem.findByIdAndDelete(orderitem);
  });

  await Order.findByIdAndDelete(req.params.id)
    .then((order) => {
      if (order) {
        return res
          .status(200)
          .json({ success: true, message: "Order is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Order not found!" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: true, data: err, success: false });
    });
});

// Get Total sales
orderRouter.route("/get/totalsales").get(async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
  // console.log(totalSales);
  if (!totalSales)
    res
      .status(400)
      .json({ success: false, message: "Cannot generate Total Sales" });
  res.send({ success: true, totalSales: totalSales.pop().totalSales });
});

// Get total number of orders
orderRouter.route("/get/count").get(async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) res.status(500).json({ success: false });
  res.status(200).json({ success: true, orderCount });
});

// Get User Orders
orderRouter.route("/get/user-order/:userid").get(async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList)
    res
      .status(500)
      .json({ success: false, message: "Cannot fetch order list" });
  res.send({ success: true, orderList: userOrderList });
});

export default orderRouter;
