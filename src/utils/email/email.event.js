import { EventEmitter } from "events";
import { customAlphabet } from "nanoid";
import { hash } from "../hashing/hash.js";
import { UserModel } from "../../DB/Models/user.model.js";
import { sendEmails, subject } from "./sendEmail.js";
import { template } from "./generateHTML.js";
import * as dbService from "../../DB/dbService.js";
export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async (email, userName, id) => {
  await sendCode({
    data: { email, userName, id },
    subjectType: subject.register,
  });
});
emailEmitter.on("forgetPassword", async (email, userName, id) => {
  await sendCode({
    data: { email, userName, id },
    subjectType: subject.resetPassword,
  });
});
emailEmitter.on("updateEmail", async (email, userName, id) => {
  await sendCode({
    data: { email, userName, id },
    subjectType: subject.updateEmail,
  });
});

export const sendCode = async ({
  data = {},
  subjectType = subject.register,
}) => {
  const { email, userName, id } = data;
  // otp code
  const otp = customAlphabet("0123456789", 6)();
  const hashOTP = hash({ plainText: otp });
  let updateDate = {};
  switch (subjectType) {
    case subject.register:
      updateDate = { confirmEmailOTP: hashOTP };
      break;
    case subject.resetPassword:
      updateDate = { forgetPasswordOTP: hashOTP };
      break;
    case subject.updateEmail:
      updateDate = { tempEmailOtp: hashOTP };
      break;
    default:
      break;
  }

  await dbService.updateOne({
    model: UserModel,
    filter: { _id: id },
    data: updateDate,
  });
  const isSent = await sendEmails({
    to: email,
    subject: subjectType,
    html: template(otp, userName, subjectType),
  });
};
