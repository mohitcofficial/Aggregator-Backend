import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { State } from "../models/State.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const addNewState = catchAsyncError(async (req, res, next) => {
  const { name, metaTitle, metaDescription, metaKeyword, rating } = req.body;
  const stateBanner = req.file;

  if (!name) return next(new ErrorHandler("State name is mandatory !", 400));
  if (!metaTitle)
    return next(new ErrorHandler("State metaTitle is mandatory !", 400));
  if (!metaDescription)
    return next(new ErrorHandler("State metaDescription is mandatory !", 400));
  if (!metaKeyword)
    return next(new ErrorHandler("State metaKeyword is mandatory !", 400));
  if (!stateBanner)
    return next(new ErrorHandler("State banner is mandatory !", 400));

  const flag = await State.findOne({ name });
  const metaData = { metaTitle, metaDescription, metaKeyword };

  if (flag)
    return next(
      new ErrorHandler("State already present with this name !", 401)
    );

  const stateRating = rating ? parseFloat(rating) : 0;
  const bannerImage = await uploadToCloudinary(stateBanner);

  const state = await State.create({
    name,
    metaData,
    bannerImage,
    rating: stateRating,
  });

  res.status(201).json({
    message: "State Added Successfully !",
    state,
  });
});

export const updateState = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const { name, metaTitle, metaDescription, metaKeyword, rating } = req.body;

  const stateBanner = req.file;

  const state = await State.findById(id);

  if (!state)
    return next(new ErrorHandler("No State found with this ID !", 401));

  if (name) state.name = name;

  if (metaTitle) {
    state.metaData["metaTitle"] = metaTitle;
  }
  if (metaDescription) {
    state.metaData["metaDescription"] = metaDescription;
  }
  if (metaKeyword) {
    state.metaData["metaKeyword"] = metaKeyword;
  }
  if (rating) state.rating = parseFloat(rating);

  if (stateBanner) {
    const bannerImage = await uploadToCloudinary(stateBanner);
    const oldPublicId = state.bannerImage[0].public_id;
    await deleteFromCloudinary(oldPublicId);
    state.bannerImage = bannerImage;
  }

  await state.save();

  res.status(201).json({
    message: "State Updated Successfully !",
    state,
  });
});

export const getAllStates = catchAsyncError(async (req, res, next) => {
  const states = await State.find({}).sort({ name: 1 });

  res.status(200).json({
    message: "States Fetched Successfully !",
    count: states.length,
    states,
  });
});
export const getStateInfo = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Please provide State id", 400));

  const state = await State.findById(id);
  if (!state) return next(new ErrorHandler("No State found with this id", 401));

  res.status(200).json({
    message: "State Info Fetched Successfully !",
    state,
  });
});
export const deleteState = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Please provide State id", 400));

  const state = await State.findById(id);
  if (!state) return next(new ErrorHandler("No State found with this id", 401));
  await deleteFromCloudinary(state.bannerImage[0].public_id);
  await State.findOneAndDelete({ _id: id });

  res.status(200).json({
    message: "State Deleted Successfully !",
    state,
  });
});
