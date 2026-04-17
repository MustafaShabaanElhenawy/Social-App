import joi from "joi";
import { generalField } from "../../middleware/validation.middleware.js";

export const shareProfileSchema = joi
  .object({
    profileId: generalField.id.required(),
  })
  .required();

export const updateEmailSchema = joi
  .object({
    email: generalField.email.required(),
  })
  .required();

export const resetEmailSchema = joi
  .object({
    oldCode: generalField.code.required(),
    newCode: generalField.code.required(),
  })
  .required();

export const updatePasswordSchema = joi
  .object({
    oldPassword: generalField.password.required(),
    password: generalField.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalField.confirmPassword.required(),
  })
  .required();

export const updateProfileSchema = joi
  .object({
    userName: generalField.userName,
    DOB: generalField.DOB,
    gender: generalField.gender,
    phone: generalField.phone,
    address: generalField.address,
  })
  .required();
