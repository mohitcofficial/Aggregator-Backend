import { createTransport } from "nodemailer";
import ErrorHandler from "../utils/ErrorHandler.js";
import { google } from "googleapis";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Lead } from "../models/Lead.js";
import { State } from "../models/State.js";
import { City } from "../models/City.js";
import { Location } from "../models/Location.js";
import { sendEmailToVision } from "../utils/sendEmail.js";

export const sendMail = catchAsyncError(async (req, res, next) => {
  const { subject, text } = req.body;
  if (!subject) return next(new ErrorHandler("Enter subject", 401));
  if (!text) return next(new ErrorHandler("Enter text", 401));
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  const to = process.env.to;
  const MY_EMAIL = process.env.to;
  //EMAIL OPTIONS
  const from = MY_EMAIL;
  const { name, email, phoneNumber } = req.body;
  let { location, requirement } = req.body;
  if (!location || location.length == 0) location = "Not Mentioned";
  if (!requirement || location.length == 0) requirement = "Not Mentioned";

  let ACCESS_TOKEN;
  try {
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    ACCESS_TOKEN = await oAuth2Client.getAccessToken();
  } catch (error) {
    // console.error("Google OAuth failed:", error.message);
    ACCESS_TOKEN = null;
  }

  try {
    const lead = await Lead.create({
      name,
      email,
      phoneNumber,
      location,
      requirement,
      origin: "Mail",
    });

    if (ACCESS_TOKEN) {
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

      transport.sendMail({
        from,
        to: [to, process.env.ADDITIONAL_EMAIL],
        subject: `${subject} - ${new Date().getTime()}`,
        html: text,
      });
      res.status(200).json({
        success: true,
        message: `Email Send to ${to}`,
        lead,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Email could not be sent, but lead has been stored.",
        lead,
      });
    }
  } catch (error) {
    // console.error("Error storing lead or sending email:", error.message)
    return next(new ErrorHandler("Something went wrong", 400));
  }
});

export const sendMail2 = catchAsyncError(async (req, res, next) => {
  const { subject, text } = req.body;
  if (!subject) return next(new ErrorHandler("Enter subject", 401));
  if (!text) return next(new ErrorHandler("Enter text", 401));
  const to = process.env.user;
  let { location, requirement } = req.body;
  if (!location || location.length == 0) location = "Not Mentioned";
  if (!requirement || location.length == 0) requirement = "Not Mentioned";

  const updatedSubject = `${subject} - ${new Date().getTime()}`;

  sendEmailToVision(to, updatedSubject, text);
  res.status(200).json({
    success: true,
    message: `Email Send to ${to}`,
  });
});

export const sendOnboardingEmail = catchAsyncError(async (req, res, next) => {
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

  transport.sendMail({
    from,
    to: [to, process.env.ADDITIONAL_EMAIL],
    subject: `${subject} - ${new Date().getTime()}`,
    html: text,
  });

  res.status(200).json({
    success: true,
    message: `Email Send to ${to}`,
  });
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
export const getLocationInfoFromSlug = catchAsyncError(
  async (req, res, next) => {
    const { stateSlug, citySlug, locationSlug } = req.params;

    if (!stateSlug || !citySlug || !locationSlug)
      return next(new ErrorHandler("Please provide both slug !", 404));

    const state = await State.findOne({ slug: stateSlug.toLowerCase() });
    if (!state) return next(new ErrorHandler("State Not Found !", 404));

    const city = await City.findOne({
      slug: citySlug.toLowerCase(),
      stateId: state._id,
    }).populate("stateId", "name");
    if (!city) return next(new ErrorHandler("City Not Found !", 404));

    const location = await Location.findOne({
      slug: locationSlug.toLowerCase(),
      cityId: city._id,
    }).populate("cityId", "name");
    if (!location) return next(new ErrorHandler("Location Not Found !", 404));

    res.status(200).json({
      success: true,
      message: "Location Info Fetched Successfully !",
      location,
    });
  }
);

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

  const similarCities = await City.find({
    stateId,
    _id: { $ne: cityId },
  }).populate("stateId", "name");

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
  }).populate("cityId", "name");

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

  const cities = await City.find({ stateId }).sort({
    rating: -1,
  });

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

    const locations = await Location.find({ cityId }).sort({
      rating: -1,
    });

    res.status(200).json({
      success: true,
      message: "Locations Fetched Successfully",
      count: locations.length,
      locations,
    });
  }
);

export const getTrendingCities = catchAsyncError(async (req, res, next) => {
  const cities = await City.find({})
    .populate("stateId", "name slug")
    .sort({ rating: -1 })
    .limit(10);

  res.status(200).json({
    message: "Trending Cities Fetched Successfully !",
    count: cities.length,
    cities,
  });
});
export const getTrendingStates = catchAsyncError(async (req, res, next) => {
  const states = await State.find({}).sort({ rating: -1 }).limit(10);

  res.status(200).json({
    message: "Trending States Fetched Successfully !",
    count: states.length,
    states,
  });
});
