import { UserModel } from "../../DB/Models/user.model.js";
import { PostModel } from "../../DB/Models/post.model.js";
import * as dbservice from "../../DB/dbService.js";
export const getUsersAndPosts = async (req, res, next) => {
  // get all users
  //   const users = await UserModel.find({}); // 5s

  //   // get all posts
  //   const posts = await PostModel.find({}); // 3s

  // 8s

  const results = await Promise.all([UserModel.find({}), PostModel.find({})]);

  return res.status(200).json({ success: true, results });
};

export const changeRole = async (req, res, next) => {
  // change role
  const { userId, role } = req.body;

  const user = await dbservice.findOneAndUpdate({
    model: UserModel,
    filter: { _id: userId },
    data: { role },
    options: { new: true },
  });

  return res.status(200).json({ success: true, user });
};
