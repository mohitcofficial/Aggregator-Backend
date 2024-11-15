import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middleware/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

config({
  path: "./config/config.env",
});

const app = express();
const limiter = rateLimit({
  windowMs: 10 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  message: "Too many request, please try again later",
});

app.use(limiter);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://admin.coworktown.com",
      "https://coworktown.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

import user from "./routes/userRoutes.js";
import admin from "./routes/adminRoutes.js";
import state from "./routes/stateRoutes.js";
import city from "./routes/cityRoutes.js";
import location from "./routes/locationRoutes.js";
import lead from "./routes/leadRoutes.js";

app.use("/api/v1", admin);
app.use("/api/v1", state);
app.use("/api/v1", city);
app.use("/api/v1", location);
app.use("/api/v1", lead);
app.use("/api/v1/client", user);

app.use(ErrorMiddleware);
export default app;
