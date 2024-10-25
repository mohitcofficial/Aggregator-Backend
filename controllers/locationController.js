import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { City } from "../models/City.js";
import { Location } from "../models/Location.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const addNewLocation = catchAsyncError(async (req, res, next) => {
  const {
    name,
    cityId,
    metaTitle,
    metaDescription,
    metaKeyword,
    businessRegistrationPrice,
    gstRegistrationPrice,
    mailingAddressPrice,
    address,
    xCoordinate,
    yCoordinate,
  } = req.body;
  const locationImages = req.files;
  console.log("locationImages: ", locationImages);

  if (!name) return next(new ErrorHandler("Location name is mandatory !", 400));
  if (!metaTitle)
    return next(new ErrorHandler("Location metaTitle is mandatory !", 400));
  if (!metaDescription)
    return next(
      new ErrorHandler("Location metaDescription is mandatory !", 400)
    );
  if (!metaKeyword)
    return next(new ErrorHandler("Location metaKeyword is mandatory !", 400));
  if (!cityId) return next(new ErrorHandler("City ID is mandatory !", 400));
  if (!businessRegistrationPrice)
    return next(
      new ErrorHandler("Business Registration Price is mandatory !", 400)
    );
  if (!gstRegistrationPrice)
    return next(new ErrorHandler("GST Registration Price is mandatory !", 400));
  if (!mailingAddressPrice)
    return next(new ErrorHandler("Mailing Address Price is mandatory !", 400));
  if (!address) return next(new ErrorHandler("Address is mandatory !", 400));
  if (!xCoordinate || !yCoordinate)
    return next(new ErrorHandler("Location coordinates are mandatory !", 400));

  if (!locationImages || locationImages.length === 0)
    return next(new ErrorHandler("Provide images for Location", 400));

  const flag = await Location.findOne({ name, cityId });
  const flag2 = await City.findById(cityId);

  if (!flag2)
    return next(new ErrorHandler("No City found with this ID !", 401));

  if (flag)
    return next(
      new ErrorHandler(
        "Location already present in the City with same name !",
        401
      )
    );

  const metaData = { metaTitle, metaDescription, metaKeyword };
  const locationCoordinates = {
    type: "Point",
    coordinates: [xCoordinate, yCoordinate],
  };

  const images = [];

  try {
    for (const file of locationImages) {
      const currImage = await uploadToCloudinary(file);
      images.push(currImage[0]);
    }
  } catch (error) {
    console.log(error.message);
    return next(
      new ErrorHandler("Something went wrong while uploading images", 403)
    );
  }

  const location = await Location.create({
    name,
    cityId,
    businessRegistrationPrice,
    gstRegistrationPrice,
    mailingAddressPrice,
    address,
    images,
    metaData,
    locationCoordinates,
  });

  res.status(201).json({
    message: "Location Added Successfully !",
    location,
  });
});

export const updateLocation = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const {
    name,
    metaTitle,
    metaDescription,
    metaKeyword,
    businessRegistrationPrice,
    gstRegistrationPrice,
    mailingAddressPrice,
    address,
    xCoordinate,
    yCoordinate,
  } = req.body;

  const location = await Location.findById(id);

  if (!location)
    return next(new ErrorHandler("No Location found with this ID !", 401));

  if (name) location.name = name;
  if (metaTitle) location.metaData["metaTitle"] = metaTitle;
  if (metaDescription) location.metaData["metaDescription"] = metaDescription;
  if (metaKeyword) location.metaData["metaKeyword"] = metaKeyword;
  if (address) location.address = address;
  if (businessRegistrationPrice)
    location.businessRegistrationPrice = businessRegistrationPrice;
  if (gstRegistrationPrice)
    location.gstRegistrationPrice = gstRegistrationPrice;
  if (mailingAddressPrice) location.mailingAddressPrice = mailingAddressPrice;
  if (xCoordinate) location.locationCoordinates["coordinates"][0] = xCoordinate;
  if (yCoordinate) location.locationCoordinates["coordinates"][1] = yCoordinate;

  await location.save();

  res.status(201).json({
    message: "Location Updated Successfully !",
    location,
  });
});
export const updateLocationImage = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const { locationId } = req.body;

  const image = req.file;

  if (!image)
    return next(new ErrorHandler("No image provided for upload !", 400));

  const location = await Location.findById(locationId);

  if (!location)
    return next(new ErrorHandler("No Location found with this ID !", 401));

  const imageIndex = location.images.findIndex((img) => {
    return img._id.toString() === id;
  });

  if (imageIndex === -1)
    return next(new ErrorHandler("Image not found in the location!", 404));

  try {
    const newImage = await uploadToCloudinary(image);
    await deleteFromCloudinary(location.images[imageIndex]["public_id"]);
    location.images[imageIndex] = newImage[0];
    await location.save();
  } catch (error) {
    return next(new ErrorHandler("Something Went Wrong !", 401));
  }

  res.status(201).json({
    message: "Location Image Updated Successfully !",
    location,
  });
});

export const getAllLocations = catchAsyncError(async (req, res, next) => {
  const locations = await Location.find({}).populate("cityId", "name");

  res.status(200).json({
    message: "City Fetched Successfully !",
    count: locations.length,
    locations,
  });
});
export const getLocationInfo = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Please provide Location id", 400));

  const location = await Location.findById(id);
  if (!location)
    return next(new ErrorHandler("No Location found with this id", 401));

  res.status(200).json({
    message: "Location Info Fetched Successfully !",
    location,
  });
});
export const deleteLocation = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Please provide Location id", 400));

  const location = await Location.findById(id);
  if (!location)
    return next(new ErrorHandler("No Location found with this id", 401));
  await deleteFromCloudinary(location.images[0].public_id);
  await Location.findOneAndDelete({ _id: id });

  res.status(200).json({
    message: "Location Deleted Successfully !",
    location,
  });
});
export const deleteLocationImage = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const { locationId } = req.body;

  if (!id) return next(new ErrorHandler("Please provide Image id", 400));

  const location = await Location.findById(locationId);
  if (!location)
    return next(new ErrorHandler("No Location found with this id", 401));

  const imageIndex = location.images.findIndex((img) => {
    console.log("img: ", img._id.toString(), " id: ", id);
    return img._id.toString() === id;
  });

  if (imageIndex === -1)
    return next(new ErrorHandler("Image not found in the location!", 404));

  try {
    await deleteFromCloudinary(location.images[imageIndex]["public_id"]);
    location.images.splice(imageIndex, 1);
    await location.save();
  } catch (error) {
    return next(new ErrorHandler("Something Went Wrong !", 401));
  }

  res.status(200).json({
    message: "Location Image Deleted Successfully !",
  });
});
