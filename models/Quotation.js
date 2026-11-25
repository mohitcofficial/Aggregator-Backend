import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema(
  {
    stateId: String,
    stateName: { type: String, required: true },

    cityId: String,
    cityName: { type: String, required: true },

    locationId: String,
    locationName: String,

    service: {
      type: String,
      required: true,
    },

    planName: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 12,
    },

    durationUnit: {
      type: String,
      enum: ["months", "years"],
      default: "months",
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountType: {
      type: String,
      enum: ["amount", "percentage"],
      default: "amount",
    },

    taxRate: {
      type: Number,
      default: 18,
      min: 0,
    },

    taxableAmount: Number,
    taxAmount: Number,
    total: Number,
  },
  { _id: true },
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      unique: true,
      index: true,
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    items: {
      type: [quotationItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one location is required",
      },
    },

    subtotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    taxMode: {
      type: String,
      enum: ["exclusive", "inclusive", "none"],
      default: "exclusive",
    },

    notes: String,
    terms: String,

    validUntil: Date,

    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired", "cancelled"],
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Quotation ||
  mongoose.model("Quotation", quotationSchema);
