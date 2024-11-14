import mongoose from "mongoose";
import validator from "validator";

const leadSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is mandatory!"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long!"],
      maxlength: [50, "Name cannot exceed 50 characters!"],
    },
    email: {
      type: String,
      required: [true, "Email is mandatory!"],
      validate: [validator.isEmail, "Please provide a valid email address!"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is mandatory!"],
      validate: {
        validator: (value) => validator.isLength(value, { min: 10, max: 15 }),
        message: "Phone number must be between 10 and 15 digits!",
      },
    },
    location: {
      type: String,
      required: [true, "Location is mandatory!"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters long!"],
      maxlength: [100, "Location cannot exceed 100 characters!"],
    },
    requirement: {
      type: String,
      required: [true, "Requirement is mandatory!"],
      trim: true,
      maxlength: [500, "Requirement cannot exceed 500 characters!"],
    },
    status: {
      type: String,
      enum: ["Unseen", "Contacted", "Converted", "Not Interested"],
      default: "Unseen",
    },
    origin: {
      type: String,
      enum: ["Mail", "Phone", "Whatsapp", "Others"],
      default: "Mail",
    },
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model("Lead", leadSchema);
