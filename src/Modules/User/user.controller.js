import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as userService from "./user.service.js";
import * as userValidation from "./user.validation.js";
import {
  upload,
  fileValidation,
} from "../../utils/file uploading/multerUpload.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";

const router = Router();

router.get(
  "/profile",
  authentication(),
  allowTo(["User"]),
  asyncHandler(userService.getProfile)
);

router.get(
  "/profile/:profileId",
  validation(userValidation.shareProfileSchema),
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(userService.shareProfile)
);

router.patch(
  "/profile/email",
  validation(userValidation.updateEmailSchema),
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(userService.updateEmail)
);

router.patch(
  "/profile/reset_email",
  validation(userValidation.resetEmailSchema),
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(userService.resetEmail)
);

router.patch(
  "/updatePassword",
  validation(userValidation.updatePasswordSchema),
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(userService.updatePassword)
);

router.patch(
  "/profile",
  validation(userValidation.updateProfileSchema),
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(userService.updateProfile)
);

router.post(
  "/profilePicture",
  authentication(),
  upload(fileValidation.image, "Uploads/user").single("image"),
  asyncHandler(userService.uploadProfilePicture)
);

router.post(
  "/uploadOnCloud",
  authentication(),
  uploadCloud().single("image"),
  asyncHandler(userService.upladOnCloud)
);

router.post(
  "/coverImages",
  authentication(),
  upload().array("images"),
  asyncHandler(userService.uploadCoverImages)
);

router.delete(
  "/deleteProfileImage",
  authentication(),
  upload(fileValidation.image, "Uploads/user").single("image"),
  asyncHandler(userService.deleteprofilePicture)
);

router.delete(
  "/deleteProfileImageOnCloud",
  authentication(),
  asyncHandler(userService.deleteFileOnCloud)
);

export default router;
