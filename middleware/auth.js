import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import { User } from "../models/User.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  console.log("Cookies:", req.cookies);
  console.log("Cookie Header:", req.headers.cookie);
  const { authToken } = req.cookies;

  if (!authToken) return next(new ErrorHandler("Not logged in!", 401));
  console.log("here 1");

  const decoded = jwt.verify(authToken, "oinfiosdfnodsifisnfosifsnodfsino");
  console.log("here 2");

  let user = await User.findById(decoded._id);
  console.log("here 3");

  if (!user) return next(new ErrorHandler("Not Logged In !", 401));
  console.log("here 4");

  req.user = user;
  console.log("here 5");

  next();
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler("Access denied", 403));
    }
    next();
  };
};
