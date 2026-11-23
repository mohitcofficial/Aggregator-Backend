import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    profileImage: {
      public_id: String,
      url: String,
    },

    role: {
      type: String,
      enum: ["admin", "accounts", "operation", "sales", "super_admin"],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    target: {
      type: Number,
      default: 0,
    },

    incentive: {
      isEnabled: {
        type: Boolean,
        default: true,
      },
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
      rate: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model("User", userSchema);
