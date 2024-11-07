import mongoose from "mongoose";
import { deleteManyFromCloudinary } from "../utils/cloudinary.js";
import { City } from "./City.js";
import { Location } from "./Location.js";

const stateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "State name is mandatory !"],
      unique: true,
    },
    slug: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    bannerImage: [
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
  },
  { timestamps: true }
);

stateSchema.pre("findOneAndDelete", async function (next) {
  const stateId = this.getQuery()._id;
  const publicIdsToDelete = [];

  const cities = await City.find({ stateId });
  for (const city of cities) {
    if (city.bannerImage && city.bannerImage[0]?.public_id) {
      publicIdsToDelete.push(city.bannerImage[0].public_id);
    }

    const locations = await Location.find({ cityId: city._id });

    locations.forEach((location) => {
      if (location.images && location.images.length > 0) {
        location.images.forEach((image) => {
          if (image?.public_id) {
            publicIdsToDelete.push(image.public_id);
          }
        });
      }
    });

    await Location.deleteMany({ cityId: city._id });
  }
  if (publicIdsToDelete.length > 0)
    await deleteManyFromCloudinary(publicIdsToDelete);

  await City.deleteMany({ stateId });

  next();
});

stateSchema.pre("save", function (next) {
  this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  next();
});

export const State = mongoose.model("State", stateSchema);
