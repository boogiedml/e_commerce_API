import mongoose from "mongoose";

const connectDB = (url) => {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(url)
    .then(() => {
      console.log("Database Connection is ready.......");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default connectDB;
