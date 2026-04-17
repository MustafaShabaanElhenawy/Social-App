import mongoose, { Schema, Types, model } from "mongoose";
import { hash } from "../../utils/hashing/hash.js";

export const genderType = {
  male: "male",
  female: "female",
};
export const roleType = {
  superSuperAdmin: "superSuperAdmin",
  superAdmin: "superAdmin",
  Admin: "Admin",
  User: "User",
};

export const providersTypes = {
  Google: "Google",
  System: "System",
};

export const defaultProfilePicture = "Uploads/defaultProfileImage.jpg";

export const secureUrl =
  "https://res.cloudinary.com/daezne9v3/image/upload/v1737837513/asdasuiewghs__defaultProfilePicture_pjggmy.jpg";

export const publicId = "asdasuiewghs__defaultProfilePicture_pjggmy";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      minLength: [3, "userName must be at least 3 characters"],
      maxLength: [30, "userName must be at most 20 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    phone: String,
    address: String,
    DOB: Date,
    image: {
      public_id: {
        type: String,
        default: publicId,
      },
      secure_url: {
        type: String,
        default: secureUrl,
      },
    },
    coverImages: [
      {
        public_id: String,
        secure_url: String,
      },
    ],
    // image: {
    //   type: String,
    //   default: defaultProfilePicture,
    // },
    // coverImages: [String],
    gender: {
      type: String,
      enum: Object.values(genderType),
      default: genderType.male,
    },
    role: {
      type: String,
      enum: Object.values(roleType),
      default: roleType.User,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    providersType: {
      type: String,
      enum: Object.values(providersTypes),
      default: providersTypes.System,
    },
    changedCredentialsTime: Date,
    confirmEmailOTP: String,
    forgetPasswordOTP: String,
    // embedded document
    viewers: [
      {
        userId: { type: Types.ObjectId, ref: "User" },
        time: Date,
      },
    ],
    address: [
      {
        city: String,
        postelCode: String,
        country: String,
      },
    ],
    tempEmail: String,
    tempEmailOtp: String,
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  // hash password
  if (this.isModified("password"))
    this.password = hash({ plainText: this.password });
  return next();
});

export const UserModel = mongoose.model.User || model("User", userSchema);
