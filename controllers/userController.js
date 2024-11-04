import { createTransport } from "nodemailer";
import ErrorHandler from "../utils/ErrorHandler.js";
import { google } from "googleapis";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Lead } from "../models/Lead.js";

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

// export const sendMail = catchAsyncError(async (req, res, next) => {
//   const { to, subject, text } = req.body;

//   if (!to) return next(new ErrorHandler("Enter to", 401));
//   if (!subject) return next(new ErrorHandler("Enter subject", 401));
//   if (!text) return next(new ErrorHandler("Enter text", 401));
//   const transporter = createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: true,
//     auth: {
//       user: "sales@virtualxcel.in",
//       pass: "Sales@virtualxcel",
//     },
//     debug: true,
//   });

//   await transporter.sendMail({
//     from: "sales@virtualxcel.in",
//     to: "sales@virtualxcel.in",
//     subject,
//     html: text,
//   });
//   await transporter.sendMail({
//     from: "sales@virtualxcel.in",
//     to: "coworktown99@gmail.com",
//     subject,
//     html: text,
//   });

//   res.status(200).json({
//     success: true,
//     message: `Email Send to ${to}`,
//   });
// });
