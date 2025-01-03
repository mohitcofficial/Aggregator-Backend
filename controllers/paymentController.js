import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Location } from "../models/Location.js";
import { Payment } from "../models/Payment.js";
import { razorpayInstance } from "../server.js";
import crypto from "crypto";
import { createTransport } from "nodemailer";
import { google } from "googleapis";

const tenureDiscount = {
  1: 0,
  2: 5,
  3: 10,
};

const calculateDiscountedPrice = (price, tenure) => {
  return +(
    tenure * price -
    tenure * price * (tenureDiscount[tenure] / 100)
  ).toFixed(2);
};

export const checkout = catchAsyncError(async (req, res) => {
  const {
    locationId,
    name,
    email,
    phone,
    tenure: tenureStr,
    plan: planStr,
  } = req.body;
  const tenure = parseFloat(tenureStr);
  const plan = parseFloat(planStr);

  if (tenure > 3 || tenure < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid tenure. Please select between 1 to 3 years.",
    });
  }
  const location = await Location.findById(locationId);
  if (!location) {
    return res
      .status(404)
      .json({ success: false, message: "Location not found." });
  }

  let discountedPrice = 0;
  let planName = "";

  if (plan === 0 && location.gstRegistrationPrice) {
    planName = "GST Registration";
    discountedPrice = calculateDiscountedPrice(
      location.gstRegistrationPrice,
      tenure
    );
  } else if (plan === 1 && location.businessRegistrationPrice) {
    planName = "Busniess Registration";
    discountedPrice = calculateDiscountedPrice(
      location.businessRegistrationPrice,
      tenure
    );
  } else if (plan === 2 && location.mailingAddressPrice) {
    planName = "Mailing Address";
    discountedPrice = calculateDiscountedPrice(
      location.mailingAddressPrice,
      tenure
    );
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid plan or pricing data.",
    });
  }

  const finalPrice = +(discountedPrice + 0.18 * discountedPrice).toFixed(2);

  const options = {
    amount: Math.round(finalPrice) * 100,
    currency: "INR",
    notes: {
      userName: name,
      userEmail: email,
      userPhone: phone,
      amount: Math.round(finalPrice),
      location: location?.name,
      plan: planName,
      tenure,
    },
  };

  const order = await razorpayInstance.orders.create(options);
  res.status(200).json({ success: true, order });
});

export const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");
  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const paymentDetails = await razorpayInstance.orders.fetch(
      razorpay_order_id
    );

    const { notes } = paymentDetails;
    const { userName, userEmail, userPhone, amount, location, plan, tenure } =
      notes;

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      username: userName,
      email: userEmail,
      phone: userPhone,
    });

    await sendPaymentEmail(
      userEmail,
      "Payment Successfull Confirmation",
      `
      <h2>Payment Successful for ${userName}</h2>
      <h3>Name: </h3> <p>${userName}</p>
      <h3>Email: </h3> <p>${userEmail}</p>
      <h3>Phone No: </h3> <p>${userPhone}</p>
      <h3>Amount: </h3> <p>INR ${amount}</p>
      <h3>Location: </h3> <p>${location}</p>
      <h3>Plan: </h3> <p>${plan}</p>
      <h3>Tenure: </h3> <p>${tenure}</p>
      <h3>Transaction ID: </h3> <p>${razorpay_payment_id}</p>
      <br>
      Thank you for your payment!
      <br>
      Have a great day!
      `
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
};

export const getRazorpayKey = async (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_API_KEY,
  });
};

export const sendPaymentEmail = async (userEmail, subject, text) => {
  if (!subject) return;
  if (!text) return;
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
  const MY_EMAIL = process.env.to;
  const ADDITIONAL_EMAIL = process.env.ADDITIONAL_EMAIL;
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

  const from = MY_EMAIL;

  await transport.sendMail({
    from,
    to: [MY_EMAIL, userEmail],
    subject: `${subject} - ${new Date().getTime()}`,
    html: text,
  });
};
