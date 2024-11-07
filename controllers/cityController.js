import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { City } from "../models/City.js";
import { State } from "../models/State.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const addNewCity = catchAsyncError(async (req, res, next) => {
  const { name, stateId, metaTitle, metaDescription, metaKeyword } = req.body;
  const cityBanner = req.file;
  const businessRegistrationPrice = parseFloat(
    req.body.businessRegistrationPrice
  );
  const gstRegistrationPrice = parseFloat(req.body.gstRegistrationPrice);
  const mailingAddressPrice = parseFloat(req.body.mailingAddressPrice);
  const rating = parseFloat(req.body.rating);

  if (!name) return next(new ErrorHandler("City name is mandatory !", 400));
  if (!metaTitle)
    return next(new ErrorHandler("City metaTitle is mandatory !", 400));
  if (!metaDescription)
    return next(new ErrorHandler("City metaDescription is mandatory !", 400));
  if (!metaKeyword)
    return next(new ErrorHandler("City metaKeyword is mandatory !", 400));
  if (!cityBanner)
    return next(new ErrorHandler("City banner is mandatory !", 400));
  if (!stateId)
    return next(new ErrorHandler("City State ID is mandatory !", 400));
  if (!businessRegistrationPrice)
    return next(
      new ErrorHandler("City Business Regisration Price is mandatory !", 400)
    );
  if (!gstRegistrationPrice)
    return next(new ErrorHandler("GST Registration Price is mandatory !", 400));
  if (!mailingAddressPrice)
    return next(new ErrorHandler("Mailing Address Price is mandatory !", 400));

  const flag = await City.findOne({ name, stateId });
  const flag2 = await State.findById(stateId);

  if (!flag2)
    return next(new ErrorHandler("No State found with this ID !", 401));

  if (flag)
    return next(
      new ErrorHandler(
        "City already present in the State with same name !",
        401
      )
    );

  const metaData = { metaTitle, metaDescription, metaKeyword };
  const bannerImage = await uploadToCloudinary(cityBanner);
  const cityRating = rating ? parseFloat(rating) : 0;

  const city = await City.create({
    name,
    metaData,
    stateId,
    bannerImage,
    businessRegistrationPrice: businessRegistrationPrice || 11999,
    gstRegistrationPrice: gstRegistrationPrice || 11999,
    mailingAddressPrice: mailingAddressPrice || 9999,
    rating: cityRating,
  });

  res.status(201).json({
    message: "City Added Successfully !",
    city,
  });
});

export const updateCity = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const { name, metaTitle, metaDescription, metaKeyword, stateId } = req.body;

  const businessRegistrationPrice = parseFloat(
    req.body.businessRegistrationPrice
  );
  const gstRegistrationPrice = parseFloat(req.body.gstRegistrationPrice);
  const mailingAddressPrice = parseFloat(req.body.mailingAddressPrice);
  const rating = parseFloat(req.body.rating);
  const cityBanner = req.file;

  const city = await City.findById(id);

  if (!city) return next(new ErrorHandler("No City found with this ID !", 401));

  if (name) city.name = name;

  if (metaTitle) {
    city.metaData["metaTitle"] = metaTitle;
  }
  if (metaDescription) {
    city.metaData["metaDescription"] = metaDescription;
  }
  if (metaKeyword) {
    city.metaData["metaKeyword"] = metaKeyword;
  }

  if (businessRegistrationPrice) {
    if (typeof businessRegistrationPrice !== "number")
      return next(
        new ErrorHandler("Business Registration Price must be a number!", 401)
      );
    city.businessRegistrationPrice = businessRegistrationPrice;
  }
  if (gstRegistrationPrice) {
    if (typeof gstRegistrationPrice !== "number")
      return next(
        new ErrorHandler("GST Registration Price must be a number!", 401)
      );
    city.gstRegistrationPrice = gstRegistrationPrice;
  }
  if (mailingAddressPrice) {
    if (typeof mailingAddressPrice !== "number")
      return next(
        new ErrorHandler("Mailing Address Price must be a number!", 401)
      );
    city.mailingAddressPrice = mailingAddressPrice;
  }

  if (rating) {
    if (typeof rating !== "number")
      return next(new ErrorHandler("Rating must be a number!", 401));
    city.rating = parseFloat(rating);
  }

  if (stateId) city.stateId = stateId;

  if (cityBanner) {
    const bannerImage = await uploadToCloudinary(cityBanner);
    const oldPublicId = city.bannerImage[0].public_id;
    await deleteFromCloudinary(oldPublicId);
    city.bannerImage = bannerImage;
  }

  await city.save();

  res.status(201).json({
    message: "City Updated Successfully !",
    city,
  });
});

export const getAllCity = catchAsyncError(async (req, res, next) => {
  const cities = await City.find({}).populate("stateId", "name");
  // const cities = await City.find({}).populate([{ path: 'stateId', select: 'name' }, { path: 'chiefMis', select:  }}])

  res.status(200).json({
    message: "City Fetched Successfully !",
    count: cities.length,
    cities,
  });
});

export const getCityInfo = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Please provide City id", 400));

  const city = await City.findById(id).populate("stateId", "name");
  if (!city) return next(new ErrorHandler("No City found with this id", 401));

  res.status(200).json({
    message: "City Info Fetched Successfully !",
    city,
  });
});
export const deleteCity = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Please provide City id", 400));

  const city = await City.findById(id);
  if (!city) return next(new ErrorHandler("No City found with this id", 401));
  await deleteFromCloudinary(city.bannerImage[0].public_id);
  await City.findOneAndDelete({ _id: id });

  res.status(200).json({
    message: "city Deleted Successfully !",
    city,
  });
});
