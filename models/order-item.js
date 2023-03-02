import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
});

OrderItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

OrderItemSchema.set("toJSON", {
  virtuals: true,
});

const OrderItem = mongoose.model("OrderItem", OrderItemSchema);

export default OrderItem;
