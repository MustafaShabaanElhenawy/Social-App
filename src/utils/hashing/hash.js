import bcrypt from "bcrypt";

// hash
export const hash = ({ plainText, saltRounds = process.env.SALT }) => {
  return bcrypt.hashSync(plainText, Number(saltRounds));
};

// compare
export const compareHash = ({ plainText, hash }) => {
  return bcrypt.compareSync(plainText, hash);
};
