import mongoose from "mongoose";

const locationSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, "City name is mandatory !"],
  },
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    require: [true, "City ID is mandatory !"],
  },
  businessRegistrationPrice: {
    type: Number,
    require: [true, "Business Registration Price is mandatory !"],
  },
  gstRegistrationPrice: {
    type: Number,
    require: [true, "GST Registration Price is mandatory !"],
  },
  mailingAddressPrice: {
    type: Number,
    require: [true, "Mailing Address Price is mandatory !"],
  },
  Address: {
    type: Number,
    require: [true, "Physical Address is mandatory !"],
  },
  images: [
    {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  ],
  metaData: {
    metaTitle: {
      type: String,
      required: [true, "Meta Title is mandatory !"],
    },
    metaDescription: {
      type: String,
      required: [true, "Meta Description is mandatory !"],
    },
    metaKeyword: {
      type: String,
      required: [true, "Meta Keyword is mandatory !"],
    },
  },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

export const Location = mongoose.model("Location", locationSchema);
