import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Admin } from "../models/Admin.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import bcrypt from "bcrypt";
import { sendJWTToken } from "../utils/sendJWTToken.js";

export const createAdmin = catchAsyncError(async (req, res, next) => {
  const { username, email, password, securityKey } = req.body;
  if (!username) return next(new ErrorHandler("Please provide username", 400));
  if (!email) return next(new ErrorHandler("Please provide email", 400));
  if (!password) return next(new ErrorHandler("Please provide password", 400));
  if (!securityKey)
    return next(new ErrorHandler("Please provide security key", 400));

  if (securityKey !== "Bsmr@1986")
    return next(new ErrorHandler("Please provide security key", 401));

  const flag = await Admin.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (flag)
    return next(
      new ErrorHandler(
        "Admin already present with this username or email!",
        401
      )
    );

  const admin = await Admin.create({ username, email, password, securityKey });

  res.status(201).json({
    success: true,
    admin,
  });
});

export const adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) return next(new ErrorHandler("Please provide email", 400));
  if (!password) return next(new ErrorHandler("Please provide password", 400));

  const admin = await Admin.findOne({ email });

  if (!admin) return next(new ErrorHandler("Invalid email or password", 401));

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) return next(new ErrorHandler("Invalid email or password", 401));

  sendJWTToken(res, admin, `Welcome Back ${admin.username}`, 200);
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new ErrorHandler("Not Logged In !", 401));

  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("authToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
      // domain: ".coworktown.com",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
