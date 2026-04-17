import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
const router = Router();

router.post(
  "/register",
  validation(authValidation.registerSchema),
  asyncHandler(authService.register)
);

router.patch(
  "/confirmEmail",
  validation(authValidation.confirmEmailSchema),
  asyncHandler(authService.confirmEmail)
);

router.post(
  "/login",
  validation(authValidation.loginSchema),
  asyncHandler(authService.login)
);

router.post("/loginWithGmail", asyncHandler(authService.loginWithGmail));

router.get("/refresh_token", asyncHandler(authService.refreshToken));

// forget password
router.patch(
  "/forget_password",
  validation(authValidation.forgetPasswordSchema),
  asyncHandler(authService.forgetPassword)
);

// reset password
router.patch(
  "/reset_password",
  validation(authValidation.resetPasswordSchema),
  asyncHandler(authService.resetPassword)
);

export default router;
