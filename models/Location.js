import mongoose from "mongoose";

const locationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "City name is mandatory !"],
    },
    slug: {
      type: String,
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
    address: {
      type: String,
      require: [true, "Physical Address is mandatory !"],
    },
    images: [
      {
        public_id: {
          type: String,
          required: [true, "Public id off image is mandatory !"],
        },
        url: {
          type: String,
          required: [true, "Public url off image is mandatory !"],
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
    locationCoordinates: {
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
  },
  { timestamps: true }
);

locationSchema.pre("save", function (next) {
  this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  next();
});

export const Location = mongoose.model("Location", locationSchema);
