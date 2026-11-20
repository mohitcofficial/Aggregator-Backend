import bcrypt from "bcrypt";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendJWTToken } from "../utils/sendJWTToken.js";

export const salesLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) return next(new ErrorHandler("Please provide email", 400));
  if (!password) return next(new ErrorHandler("Please provide password", 400));

  const sales = await User.findOne({ email }).select("+password");

  if (!sales) return next(new ErrorHandler("Invalid email or password", 401));
  if (sales.role !== "sales")
    return next(new ErrorHandler("Invalid email or password", 401));

  if (!sales.isActive)
    return next(
      new ErrorHandler("Your account is deactivated. Contact sales.", 403),
    );

  const isMatch = await bcrypt.compare(password, sales.password);

  if (!isMatch) return next(new ErrorHandler("Invalid email or password", 401));

  sendJWTToken(res, sales, `Welcome Back ${sales.name}`, 200);
});
