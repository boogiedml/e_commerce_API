import express from "express";
import * as dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import connectDB from "./db/connect.js";
import productsRouter from "./routes/products.js";
import categoryRouter from "./routes/categories.js";
import userRouter from "./routes/users.js";
import orderRouter from "./routes/orders.js";
import verifyJwt from "./helpers/jwt.js";
import errorHandler from "./helpers/error-handler.js";

dotenv.config();
const __dirname = path.dirname(import.meta.url);

const app = express();
const apiRoute = "/api/v1";

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use(verifyJwt);
app.use(errorHandler);

// Routes
app.use(`${apiRoute}/products`, productsRouter);
app.use(`${apiRoute}/categories`, categoryRouter);
app.use(`${apiRoute}/users`, userRouter);
app.use(`${apiRoute}/orders`, orderRouter);

connectDB(process.env.CONNECTON_STRING);

app.listen(1001, () => {
  console.log("Connection Started");
});
