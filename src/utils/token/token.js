import jwt from "jsonwebtoken";

export const generateToken = ({ payload, signature, options = {} }) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = ({ token, signature }) => {
  return jwt.verify(token, signature);
};
