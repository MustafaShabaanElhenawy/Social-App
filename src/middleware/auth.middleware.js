import { asyncHandler } from "../utils/error handling/asyncHandler.js";
import { verifyToken } from "../utils/token/token.js";
import * as dbService from "../DB/dbService.js";
import { UserModel } from "../DB/Models/user.model.js";

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};

export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypes.access,
  next = {},
}) => {
  // User , Admin token
  const [bearer, token] = authorization.split(" ") || [];

  if (!bearer || !token)
    return next(new Error("Invalid token", { cause: 400 }));

  let ACCESS_SIGNATURE = undefined;
  let REFRESH_SIGNATURE = undefined;

  switch (bearer) {
    case "User":
      REFRESH_SIGNATURE = process.env.USER_REFRESH_TOKEN;
      ACCESS_SIGNATURE = process.env.USER_ACCESS_TOKEN;
      break;
    case "Admin":
      REFRESH_SIGNATURE = process.env.ADMIN_REFRESH_TOKEN;
      ACCESS_SIGNATURE = process.env.ADMIN_ACCESS_TOKEN;
      break;
    default:
      break;
  }

  const decoded = verifyToken({
    token,
    signature:
      tokenType === tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE,
  });

  const user = await dbService.findOne({
    model: UserModel,
    filter: { _id: decoded.id, isDeleted: false },
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user.changedCredentialsTime?.getTime() >= decoded.iat * 1000)
    return next(new Error("In-valid token", { cause: 400 }));

  return user;
};

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    req.user = await decodedToken({
      authorization,
      tokenType: tokenTypes.access,
      next,
    });
    return next();
  });
};

export const allowTo = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new Error("Unauthorized", { cause: 401 }));
    return next();
  });
};
