import nodemailer from "nodemailer";
export const sendEmails = async ({ to, subject, html }) => {
  // sender
  const trasporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL, // gmail email
      pass: process.env.PASS, // app password
    },
  });
  // recivier

  const info = await trasporter.sendMail({
    from: `"Social Media Application" <${process.env.EMAIL}>`,
    to, // single email
    subject,
    html,
  });
  return info.rejected.length == 0 ? true : false;
};

export const subject = {
  register: "Activate Account",
  resetPassword: "Reset Password",
  updateEmail: "Update Email",
};
