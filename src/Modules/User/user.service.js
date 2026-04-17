import { hash } from "../../utils/hashing/hash.js";
import * as dbService from "../../DB/dbService.js";
import {
  defaultProfilePicture,
  publicId,
  secureUrl,
  UserModel,
} from "../../DB/Models/user.model.js";
import { emailEmitter } from "../../utils/email/email.event.js";
import { compareHash } from "../../utils/hashing/hash.js";
import path from "path";
import fs from "fs";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";
export const getProfile = async (req, res, next) => {
  const user = await dbService.findOne({
    model: UserModel,
    filter: { _id: req.user._id },
    populate: [
      { path: "viewers.userId", select: "userName email , image -_id" },
    ],
  });

  return res.status(200).json({ success: true, data: user });
};

export const shareProfile = async (req, res, next) => {
  const { profileId } = req.params;
  let user = undefined;
  // enter my profile
  if (profileId === req.user._id.toString()) {
    user = req.user;
  } else {
    user = await dbService.findOneAndUpdate({
      model: UserModel,
      filter: { _id: profileId, isDeleted: false },
      data: {
        $push: {
          viewers: {
            userId: req.user._id,
            time: Date.now(),
          },
        },
      },
    });
  }

  return user
    ? res.status(200).json({ success: true, data: user })
    : next(new Error("User not found", { cause: 404 }));
};

export const updateEmail = async (req, res, next) => {
  const { email } = req.body;

  if (await dbService.findOne({ model: UserModel, filter: { email } }))
    return next(new Error("Email already exist", { cause: 400 }));

  await dbService.updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    data: { tempEmail: email },
  });

  // send opt code oldEmail , newEmail
  emailEmitter.emit("updateEmail", email, req.user.userName, req.user._id);
  emailEmitter.emit(
    "sendEmail",
    req.user.email,
    req.user.userName,
    req.user._id
  );

  return res
    .status(200)
    .json({ success: true, message: "Email Sent Successfully" });
};

export const resetEmail = async (req, res, next) => {
  const { oldCode, newCode } = req.body;

  if (
    !compareHash({ plainText: oldCode, hash: req.user.confirmEmailOTP }) ||
    !compareHash({ plainText: newCode, hash: req.user.tempEmailOtp })
  )
    return next(new Error("Invalid code", { cause: 400 }));

  await dbService.updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    data: {
      email: req.user.tempEmail,
      changedCredentialsTime: Date.now(),
      $unset: {
        tempEmail: "",
        tempEmailOtp: "",
        confirmEmailOTP: "",
      },
    },
  });

  return res
    .status(200)
    .json({ success: true, message: "Email Reseted Successfully" });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, password } = req.body;

  if (!compareHash({ plainText: oldPassword, hash: req.user.password }))
    return next(new Error("Invalid password", { cause: 400 }));

  const user = await dbService.updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    data: {
      password: hash({ plainText: password }),
      changedCredentialsTime: Date.now(),
    },
  });

  return res
    .status(200)
    .json({ success: true, message: "Password Updated Successfully" });
};

export const updateProfile = async (req, res, next) => {
  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: { _id: req.user._id },
    data: req.body,
    options: { new: true, runValidators: true },
  });

  return res
    .status(200)
    .json({ success: true, message: "Profile Updated Successfully", user });
};

export const uploadProfilePicture = async (req, res, next) => {
  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: { _id: req.user._id },
    data: { image: req.file.path },
    options: { new: true },
  });

  return res.status(200).json({ success: true, data: { user } });
};

export const uploadCoverImages = async (req, res, next) => {
  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: { _id: req.user._id },
    data: { coverImages: req.files.map((obj) => obj.path) },
    options: { new: true },
  });

  return res.status(200).json({ success: true, data: { user } });
};

export const deleteprofilePicture = async (req, res, next) => {
  const user = await dbService.findById({
    model: UserModel,
    id: { _id: req.user._id },
  });
  const imagePath = path.resolve(".", user.image);
  fs.unlinkSync(imagePath);
  user.image = defaultProfilePicture;
  await user.save();
  return res.status(200).json({ success: true, data: { user } });
};

export const upladOnCloud = async (req, res, next) => {
  const user = await dbService.findById({
    model: UserModel,
    id: { _id: req.user._id },
  });

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `users/${user._id}/profileImages` }
  );

  user.image = { public_id, secure_url };
  await user.save();

  return res.status(200).json({ success: true, data: { user } });
};

export const deleteFileOnCloud = async (req, res, next) => {
  const user = await dbService.findById({
    model: UserModel,
    id: { _id: req.user._id },
  });

  const results = await cloudinary.uploader.destroy(user.image.public_id);

  if (results.result === "ok") {
    user.image = {
      public_id: publicId,
      secure_url: secureUrl,
    };
  }

  return res.status(200).json({ success: true, data: { user } });
};
