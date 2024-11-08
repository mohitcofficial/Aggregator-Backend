import { createTransport } from "nodemailer";
import ErrorHandler from "../utils/ErrorHandler.js";
import { google } from "googleapis";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Lead } from "../models/Lead.js";
import { State } from "../models/State.js";
import { City } from "../models/City.js";
import { Location } from "../models/Location.js";

export const sendMail = catchAsyncError(async (req, res, next) => {
  const { subject, text } = req.body;
  if (!subject) return next(new ErrorHandler("Enter subject", 401));
  if (!text) return next(new ErrorHandler("Enter text", 401));
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
  const to = process.env.to;
  const MY_EMAIL = process.env.to;
  const transport = createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: MY_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: ACCESS_TOKEN,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  //EMAIL OPTIONS
  const from = MY_EMAIL;

  await transport.sendMail({
    from,
    to,
    subject,
    html: text,
  });

  const { name, email, phoneNumber, requirement, location } = req.body;

  if (name && email && phoneNumber && requirement && location) {
    try {
      const lead = await Lead.create({
        name,
        email,
        phoneNumber,
        location,
        requirement,
        origin: "Mail",
      });
      res.status(200).json({
        success: true,
        message: `Email Send to ${to}`,
        lead,
      });
    } catch (error) {
      return next(
        new ErrorHandler("Something Went Wrong while sending email", 400)
      );
    }

    res.status(200).json({
      success: true,
      message: `Email Send to ${to}`,
    });
  }
});

export const getStateInfoFromSlug = catchAsyncError(async (req, res, next) => {
  const slug = req.params.stateSlug;

  if (!slug) return next(new ErrorHandler("Please provide slug !", 404));

  const state = await State.findOne({ slug });

  if (!state) return next(new ErrorHandler("No State Found !", 404));

  res.status(200).json({
    success: true,
    message: "State Info Fetched Successfully !",
    state,
  });
});

export const getCityInfoFromSlug = catchAsyncError(async (req, res, next) => {
  const { stateSlug, citySlug } = req.params;

  if (!stateSlug || !citySlug)
    return next(new ErrorHandler("Please provide both slug !", 404));

  const state = await State.findOne({ slug: stateSlug.toLowerCase() });
  if (!state) return next(new ErrorHandler("State Not Found !", 404));

  const city = await City.findOne({
    slug: citySlug.toLowerCase(),
    stateId: state._id,
  }).populate("stateId", "name");
  if (!city) return next(new ErrorHandler("City Not Found !", 404));

  res.status(200).json({
    success: true,
    message: "City Info Fetched Successfully !",
    city,
  });
});

export const getSimilarStates = catchAsyncError(async (req, res, next) => {
  const { stateId } = req.params;

  const similarStates = await State.find({ _id: { $ne: stateId } })
    .sort({
      rating: -1,
    })
    .limit(10);

  res.status(200).json({
    success: true,
    message: "Similar States Fetched Successfully",
    count: similarStates.length,
    similarStates,
  });
});
export const getSimilarCities = catchAsyncError(async (req, res, next) => {
  const { stateId, cityId } = req.params;
  if (!stateId) return next(new ErrorHandler("Please provide State ID !", 404));
  if (!cityId) return next(new ErrorHandler("Please provide City ID !", 404));

  const similarCities = await City.find({ stateId, _id: { $ne: cityId } });

  res.status(200).json({
    success: true,
    message: "Similar Cities Fetched Successfully",
    count: similarCities.length,
    similarCities,
  });
});

export const getSimilarLocations = catchAsyncError(async (req, res, next) => {
  const { cityId, locationId } = req.params;
  if (!cityId) return next(new ErrorHandler("Please provide City ID !", 404));
  if (!locationId)
    return next(new ErrorHandler("Please provide Location ID !", 404));

  const similarLocations = await Location.find({
    cityId,
    _id: { $ne: locationId },
  });

  res.status(200).json({
    success: true,
    message: "Similar Locations Fetched Successfully",
    count: similarLocations.length,
    similarLocations,
  });
});

export const getCitiesWithInState = catchAsyncError(async (req, res, next) => {
  const { stateId } = req.params;

  if (!stateId) return next(new ErrorHandler("Please provide State ID !", 404));

  const cities = await City.find({ stateId });

  res.status(200).json({
    success: true,
    message: "Cities Fetched Successfully",
    count: cities.length,
    cities,
  });
});
export const getLocationsWithInCity = catchAsyncError(
  async (req, res, next) => {
    const { cityId } = req.params;

    if (!cityId) return next(new ErrorHandler("Please provide City ID !", 404));

    const locations = await Location.find({ cityId });

    res.status(200).json({
      success: true,
      message: "Locations Fetched Successfully",
      count: locations.length,
      locations,
    });
  }
);
