import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middleware/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
  path: "./config/config.env",
});

const app = express();

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

import user from "./routes/userRoutes.js";
import admin from "./routes/adminRoutes.js";
import state from "./routes/stateRoutes.js";
import city from "./routes/cityRoutes.js";
import location from "./routes/locationRoutes.js";

app.use("/api/v1", user);
app.use("/api/v1", admin);
app.use("/api/v1", state);
app.use("/api/v1", city);
app.use("/api/v1", location);

app.use(ErrorMiddleware);
export default app;
