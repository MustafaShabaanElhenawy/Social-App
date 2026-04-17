import joi from "joi";
import { Types } from "mongoose";
import { genderType } from "../DB/Models/user.model.js";

export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message("Invalid id");
};

export const generalField = {
  userName: joi.string().min(3).max(30).trim(),
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
  password: joi.string().pattern(
    // Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.
    new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
  ),
  confirmPassword: joi.string().valid(joi.ref("password")),
  code: joi.string().pattern(new RegExp(/^[0-9]{6}$/)),
  id: joi.string().custom(isValidObjectId),
  DOB: joi.date().less("now"),
  gender: joi.string().valid(...Object.values(genderType)),
  address: joi.string(),
  phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  fileObject: {
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    size: joi.number().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
  },
};

export const validation = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query }; // req.file || req.files
    if (req.file || req.files?.length) {
      data.file = req.file || req.files;
    }
    const results = schema.validate(data, { abortEarly: false });
    if (results.error) {
      const messageError = results.error.details.map((obj) => obj.message);
      return res.status(400).json({ success: false, message: messageError });
    }
    return next();
  };
};
