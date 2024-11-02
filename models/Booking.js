import mongoose from "mongoose";
import validator from "validator";

const bookingSchema = mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: [true, "Booking ID is mandatory!"],
    },
    type: {
      type: String,
      enum: [
        "GST Registration",
        "Business Registration",
        "Mailing Address",
        "Dedicated Desk",
      ],
      default: "GST Registration",
    },
    clientName: {
      type: String,
      required: [true, "Client name is mandatory!"],
      minlength: [2, "Name must be at least 2 characters long!"],
      maxlength: [50, "Name cannot exceed 50 characters!"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is mandatory!"],
      validate: {
        validator: (value) => validator.isLength(value, { min: 10, max: 15 }),
        message: "Phone number must be between 10 and 15 digits!",
      },
    },
    companyName: {
      type: String,
      required: [true, "Client name is mandatory!"],
      minlength: [5, "Name must be at least 5 characters long!"],
      maxlength: [100, "Name cannot exceed 100 characters!"],
    },
    email: {
      type: String,
      required: [true, "Email is mandatory!"],
      validate: [validator.isEmail, "Please provide a valid email address!"],
    },
    coordinatorPhone: {
      type: String,
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is mandatory!"],
      minlength: [2, "Vendor name must be at least 2 characters long!"],
      maxlength: [50, "Vendor name cannot exceed 50 characters!"],
    },
    location: {
      type: String,
      required: [true, "Location name is mandatory!"],
      minlength: [2, "Location must be at least 2 characters long!"],
      maxlength: [50, "Location cannot exceed 50 characters!"],
    },
    state: {
      type: String,
      required: [true, "State name is mandatory!"],
      minlength: [2, "State must be at least 2 characters long!"],
      maxlength: [20, "State cannot exceed 20 characters!"],
    },
    timePeriod: {
      type: Number,
      required: [true, "Time period is mandatory!"],
    },
    assignedTo: {
      type: String,
      required: [true, "Assigned person name is mandatory!"],
      minlength: [2, "Location must be at least 2 characters long!"],
      maxlength: [50, "Location cannot exceed 50 characters!"],
      default: "Mayank Chandra",
    },
    bookingAmount: {
      type: Number,
      required: [true, "Booking amount is mandatory!"],
    },
    vendorAmount: {
      type: Number,
      required: [true, "Booking amount is mandatory!"],
    },
    profit: {
      type: Number,
      required: [true, "Profit is mandatory!"],
    },
    paymentMode: {
      type: String,
      enum: ["UPI", "RazorPay", "Bank Transfer", "Others"],
      default: "UPI",
    },
    transactionId: {
      type: String,
      minlength: [2, "Location must be at least 2 characters long!"],
      maxlength: [50, "Location cannot exceed 50 characters!"],
    },
    bookingDate: {
      type: Date,
      required: [true, "Booking date is mandatory!"],
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
