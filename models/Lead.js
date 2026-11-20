import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    lastEditedAt: {
      type: Date,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    service: {
      type: String,
      enum: [
        "gst_registration",
        "business_registration",
        "mailing_address",
        "collaboration",
        "coworking",
      ],
    },

    location: String,
    budget: String,

    source: {
      type: String,
      enum: ["mail", "call", "whatsapp", "meta", "referral"],
      default: "mail",
    },

    status: {
      type: String,
      enum: ["new", "interested", "not_interested", "unreachable", "converted"],
      default: "new",
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    profit: {
      type: Number,
      default: 0,
    },
    convertedAt: Date,

    remark: {
      type: String,
      trim: true,
    },
    followUps: [followUpSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

leadSchema.index({ assignedTo: 1, createdAt: -1 });

export const Lead = mongoose.model("Lead", leadSchema);
