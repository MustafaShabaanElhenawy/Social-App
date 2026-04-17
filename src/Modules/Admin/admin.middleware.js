import { roleType, UserModel } from "../../DB/Models/user.model.js";
import * as dbservice from "../../DB/dbService.js";
export const changeRoleMiddleware = async (req, resizeBy, next) => {
  const allRoles = Object.values(roleType);

  const userReq = req.user;
  const targetUser = await dbservice.findById({
    model: UserModel,
    id: { _id: req.body.userId },
  });

  // check role
  const userReqRole = userReq.role; // admin
  const targetUserRole = targetUser.role; // user

  const userReqIndex = allRoles.indexOf(userReqRole);
  const targetUserIndex = allRoles.indexOf(targetUserRole);

  const canModify = userReqIndex < targetUserIndex; // true

  if (!canModify) return next(new Error("Unauthorized", { cause: 401 }));

  return next();
};
