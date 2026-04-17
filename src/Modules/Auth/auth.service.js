import {
  providersTypes,
  roleType,
  UserModel,
} from "../../DB/Models/user.model.js";
import { emailEmitter } from "../../utils/email/email.event.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";
import { generateToken, verifyToken } from "../../utils/token/token.js";
import { OAuth2Client } from "google-auth-library";
import * as dbService from "../../DB/dbService.js";
import { decodedToken } from "../../middleware/auth.middleware.js";
import { tokenTypes } from "../../middleware/auth.middleware.js";
export const register = async (req, res, next) => {
  const { userName, email, password } = req.body;
  if (await dbService.findOne({ model: UserModel, filter: { email } }))
    return next(new Error("User already exist", { cause: 400 }));

  const user = await dbService.create({
    model: UserModel,
    data: {
      userName,
      email,
      password,
    },
  });

  emailEmitter.emit("sendEmail", email, userName);

  return res
    .status(201)
    .json({ success: true, message: "User Created successfully!", data: user });
};

// service (email , code)

export const confirmEmail = async (req, res, next) => {
  const { email, code } = req.body;

  const user = await dbService.findOne({ model: UserModel, filter: { email } });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user.confirmEmail == true)
    return next(new Error("User already confirmed", { cause: 400 }));

  // compare hash
  if (!compareHash({ plainText: code, hash: user.confirmEmailOTP }))
    return next(new Error("Invalid code", { cause: 400 }));

  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data: { confirmEmail: true, $unset: { confirmEmailOTP: 0 } },
  });

  return res.status(200).json({
    success: true,
    message: "Email confirmed successfully!",
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // check if user exist
  const user = await dbService.findOne({ model: UserModel, filter: { email } });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (!user.confirmEmail)
    return next(new Error("User not confirmed", { cause: 400 }));

  if (!compareHash({ plainText: password, hash: user.password }))
    return next(new Error("Invalid password", { cause: 400 }));

  // generate token
  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleType.User
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
  });
  // 1h

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleType.User
        ? process.env.USER_REFRESH_TOKEN
        : process.env.ADMIN_REFRESH_TOKEN,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE },
  });
  // 7d

  return res.status(200).json({
    success: true,
    tokens: {
      access_token,
      refresh_token,
    },
  });
};

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;

  const user = await decodedToken({
    authorization,
    tokenType: tokenTypes.refresh,
    next,
  });

  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleType.User
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleType.User
        ? process.env.USER_REFRESH_TOKEN
        : process.env.ADMIN_REFRESH_TOKEN,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE },
  });

  return res.status(200).json({
    success: true,
    tokens: {
      access_token,
      refresh_token,
    },
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await dbService.findOne({
    model: UserModel,
    filter: { email, isDeleted: false },
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  // send email code
  emailEmitter.emit("forgetPassword", email, user.userName);

  return res.status(200).json({
    success: true,
    message: "Email sent successfully!",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;

  const user = await dbService.findOne({
    model: UserModel,
    filter: { email, isDeleted: false },
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (!compareHash({ plainText: code, hash: user.forgetPasswordOTP }))
    return next(new Error("Invalid code", { cause: 400 }));

  const hashPassword = hash({ plainText: password });

  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data: { password: hashPassword, $unset: { forgetPasswordOTP: 0 } },
  });

  return res.status(200).json({
    success: true,
    message: "password changed successfully!",
  });
};

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  const { email_verified, email, name, picture } = await verify();

  if (!email_verified)
    return next(new Error("Email Not Verfied", { cause: 400 }));

  let user = await dbService.findOne({ model: UserModel, filter: { email } });

  // user exists
  if (user?.providersType == providersTypes.System)
    return next(new Error("In-valid Login Method", { cause: 400 }));

  if (!user) {
    user = await dbService.create({
      model: UserModel,
      data: {
        userName: name,
        email,
        image: picture,
        confirmEmail: email_verified,
      },
    });
  }

  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleType.User
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
  });
  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleType.User
        ? process.env.USER_REFRESH_TOKEN
        : process.env.ADMIN_REFRESH_TOKEN,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE },
  });

  return res.status(200).json({
    success: true,
    tokens: {
      access_token,
      refresh_token,
    },
  });
};

//
