import mongoose from "mongoose";
import { deleteManyFromCloudinary } from "../utils/cloudinary.js";
import { City } from "./City.js";

const stateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "State name is mandatory !"],
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
  console.log("ran");
  const stateId = this.getQuery()._id;
  console.log(this.getQuery());
  const publicIdsToDelete = [];

  const cities = await City.find({ stateId });

  console.log("cities count: ", cities.length);
  for (const city of cities) {
    if (city.bannerImage && city.bannerImage[0]?.public_id) {
      publicIdsToDelete.push(city.bannerImage[0].public_id);
    }

    const locations = await Location.find({ cityId: city._id });
    console.log("locations count: ", locations.length);

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
  console.log(publicIdsToDelete);
  if (publicIdsToDelete.length > 0)
    await deleteManyFromCloudinary(publicIdsToDelete);

  await City.deleteMany({ stateId });

  next();
});

export const State = mongoose.model("State", stateSchema);
