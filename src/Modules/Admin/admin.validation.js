import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";
import { roleType } from "../../DB/Models/user.model.js";

export const changeRoleSchema = joi
  .object({
    userId: joi.custom(isValidObjectId).required(),
    role: joi
      .string()
      .valid(...Object.values(roleType))
      .required(),
  })
  .required();
