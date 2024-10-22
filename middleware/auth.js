import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { authToken } = req.cookies;

  if (!authToken) return next(new ErrorHandler("Not logged in!", 401));

  const decoded = jwt.verify(authToken, "oinfiosdfnodsifisnfosifsnodfsino");

  req.user = await Admin.findById(decoded._id);

  next();
});
