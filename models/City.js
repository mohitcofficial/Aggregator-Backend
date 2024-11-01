import mongoose from "mongoose";
import { deleteManyFromCloudinary } from "../utils/cloudinary.js";
import { Location } from "./Location.js";

const citySchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "City name is mandatory !"],
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      require: [true, "State ID is mandatory !"],
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
  { timeStamps: true }
);

citySchema.pre("findOneAndDelete", async function (next) {
  const cityId = this.getQuery()._id;
  const publicIdsToDelete = [];

  const locations = await Location.find({ cityId });

  locations.forEach((location) => {
    if (location.images && location.images.length > 0) {
      location.images.forEach((image) => {
        if (image?.public_id) {
          publicIdsToDelete.push(image.public_id);
        }
      });
    }
  });

  await Location.deleteMany({ cityId });

  if (publicIdsToDelete.length > 0)
    await deleteManyFromCloudinary(publicIdsToDelete);

  next();
});

export const City = mongoose.model("City", citySchema);
