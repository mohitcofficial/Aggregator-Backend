import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import bcrypt from "bcrypt";
import { sendJWTToken } from "../utils/sendJWTToken.js";
import mongoose from "mongoose";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";

export const createAdmin = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, password, securityKey } = req.body;

  if (!name) return next(new ErrorHandler("Please provide name", 400));
  if (!email) return next(new ErrorHandler("Please provide email", 400));
  if (!phone) return next(new ErrorHandler("Please provide phone", 400));
  if (!password) return next(new ErrorHandler("Please provide password", 400));

  if (!securityKey)
    return next(new ErrorHandler("Security key required for admin", 400));
  if (securityKey !== process.env.SECURITY_KEY)
    return next(new ErrorHandler("Invalid security key", 401));

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }
  const role = "admin";
  const isSuperAdmin = true;
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    isSuperAdmin,
  });

  res.status(201).json({
    success: true,
    message: `Super Admin created successfully`,
    user,
  });
});

export const createUser = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    securityKey,
    target,
    commissionRate,
  } = req.body;

  if (!name) return next(new ErrorHandler("Please provide name", 400));
  if (!email) return next(new ErrorHandler("Please provide email", 400));
  if (!phone) return next(new ErrorHandler("Please provide phone", 400));
  if (!password) return next(new ErrorHandler("Please provide password", 400));
  if (!role) return next(new ErrorHandler("Please provide role", 400));

  const allowedRoles = ["admin", "sales", "operations"];

  if (!allowedRoles.includes(role)) {
    return next(new ErrorHandler("Invalid role", 400));
  }

  if (role === "admin") {
    if (!securityKey)
      return next(new ErrorHandler("Security key required for admin", 400));
    if (securityKey !== process.env.SECURITY_KEY)
      return next(new ErrorHandler("Invalid security key", 401));
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    createdBy: req.user._id,
    commissionRate: commissionRate ?? 0,
    target: target ?? 0,
  });

  if (req.file) {
    profileImage = await uploadToCloudinary(req.file);
    user.profileImage = profileImage;
  }

  res.status(201).json({
    success: true,
    message: `${role} created successfully`,
    user,
  });
});

export const updateUserProfile = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    password,
    role,
    target,
    commissionRate,
    isActive,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ErrorHandler("Invalid User ID", 400));

  const userToUpdate = await User.findById(id).select("+password");

  if (!userToUpdate) return next(new ErrorHandler("User not found", 404));

  const isSelf = req.user._id.toString() === id;
  const isAdmin = req.user.role === "admin";
  const isSuperAdmin = req.user.role === "super_admin";

  if (!isSelf && !isAdmin && !isSuperAdmin)
    return next(new ErrorHandler("Access denied", 403));

  if (name) userToUpdate.name = name;
  if (email) userToUpdate.email = email;
  if (phone) userToUpdate.phone = phone;
  if (role) userToUpdate.role = role;
  if (target !== undefined) updateData.target = target;
  if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
  if (typeof isActive === "boolean") updateData.isActive = isActive;

  if (req.file) {
    const profileImage = await uploadToCloudinary(req.file);
    const oldPublicId = userToUpdate.profileImage[0]?.public_id;
    if (oldPublicId) await deleteFromCloudinary(oldPublicId);
    userToUpdate.profileImage = profileImage;
  }

  if (password) {
    if (isSelf && !isAdmin && !isSuperAdmin)
      return next(
        new ErrorHandler("You are not allowed to change your password", 403),
      );

    if (isAdmin && userToUpdate.role === "admin")
      return next(
        new ErrorHandler("Admin cannot change another admin's password", 403),
      );

    if (userToUpdate.role === "admin" && !isSuperAdmin)
      return next(
        new ErrorHandler("Only super admin can change admin password", 403),
      );

    userToUpdate.password = password;
  }

  await userToUpdate.save();

  res.status(200).json({
    success: true,
    message: req.file
      ? "Profile updated successfully & Image Updated"
      : "Profile updated successfully",
    user: userToUpdate,
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new ErrorHandler("Please provide ID", 400));

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user._id.toString() === req.user._id.toString()) {
    return next(new ErrorHandler("You cannot delete your own account", 400));
  }

  if (user.role === "admin" && !req.user.isSuperAdmin) {
    return next(new ErrorHandler("You cannot delete another admin", 403));
  }

  await User.findByIdAndDelete(id);

  res.status(201).json({
    success: true,
    message: "User Deleted Successfully !",
    user,
  });
});

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const { role } = req.query;

  const allowedRoles = ["admin", "sales", "operations", "super_admin"];

  let query = {};

  if (role) {
    if (!allowedRoles.includes(role))
      return next(new ErrorHandler("Invalid role", 400));

    query.role = role;
  }

  const users = await User.find(query).select("-password");

  res.status(200).json({
    success: true,
    count: users.length,
    message: "Users Fetched Successfully!",
    users,
  });
});

export const getAllAdmins = catchAsyncError(async (req, res, next) => {
  const admins = await User.find({ role: "admin" });

  res.status(201).json({
    success: true,
    count: admins.length,
    message: "Admin Fetched Successfully !",
    admins,
  });
});

export const adminLogin = catchAsyncError(async (req, res, next) => {
  console.log("here1");
  const { email, password } = req.body;
  if (!email) return next(new ErrorHandler("Please provide email", 400));
  if (!password) return next(new ErrorHandler("Please provide password", 400));
  console.log("here2");
  const admin = await User.findOne({ email }).select("+password");
  console.log("here3");
  if (!admin) return next(new ErrorHandler("Invalid email or password", 401));
  if (admin.role !== "admin" && admin.role !== "super_admin")
    return next(new ErrorHandler("Invalid email or password", 401));
  console.log("here4");
  const isMatch = await bcrypt.compare(password, admin.password);

  console.log("here5");
  if (!isMatch) return next(new ErrorHandler("Invalid email or password", 401));
  console.log("here6");

  if (!admin.isActive)
    return next(
      new ErrorHandler("Your account is deactive. Contact Super Admin", 401),
    );
  console.log("here7");

  sendJWTToken(res, admin, `Welcome Back ${admin.name}`, 200);
  console.log("here8");
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new ErrorHandler("Not Logged In !", 401));

  res.status(200).json({
    success: true,
    user,
  });
});

export const getUserInfo = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("Please provide ID !", 401));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Not Logged In !", 401));

  res.status(200).json({
    success: true,
    user,
  });
});

export const deactivateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ErrorHandler("User ID is required", 400));

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user._id.toString() === req.user._id.toString()) {
    return next(
      new ErrorHandler("You cannot deactivate your own account", 400),
    );
  }

  if (user.role === "admin" && !req.user.isSuperAdmin) {
    return next(new ErrorHandler("You cannot deactivate another admin", 403));
  }

  user.isActive = false;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
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
      // domain: ".virtualxcel.in",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
