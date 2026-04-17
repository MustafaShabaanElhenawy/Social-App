import { nanoid } from "nanoid";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";
import * as dbservice from "../../DB/dbService.js";
import { PostModel } from "../../DB/Models/post.model.js";
import { roleType } from "../../DB/Models/user.model.js";
import { CommentModel } from "../../DB/Models/comment.model.js";

export const createPost = async (req, res, next) => {
  const { content } = req.body;
  const allImages = [];
  let customId;
  if (req.files.length) {
    customId = nanoid(5);
    for (const file of req.files) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        file.path,
        { folder: `posts/${req.user._id}/post/${customId}` }
      );
      allImages.push({ public_id, secure_url });
    }
  }

  const post = await dbservice.create({
    model: PostModel,
    data: {
      content,
      images: allImages,
      createdBy: req.user._id,
      customId,
    },
  });

  return res.status(201).json({ success: true, results: { post } });
};

export const updatePost = async (req, res, next) => {
  const { content } = req.body;
  const { postId } = req.params;

  const post = await dbservice.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false, createdBy: req.user._id },
  });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const allImages = [];

  if (req.files.length) {
    for (const file of req.files) {
      for (const file of post.images) {
        await cloudinary.uploader.destroy(file.public_id);
      }
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        file.path,
        { folder: `posts/${req.user._id}/post/${post.customId}` }
      );
      allImages.push({ public_id, secure_url });
    }
    post.images = allImages;
  }

  post.content = content ? content : post.content;
  await post.save();

  return res.status(200).json({ success: true, results: { post } });
};

export const softDelete = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbservice.findById({
    model: PostModel,
    id: { _id: postId },
  });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  // archive
  if (
    post.createdBy.toString() === req.user._id.toString() ||
    req.user.role === roleType.Admin
  ) {
    post.isDeleted = true;
    post.deletedBy = req.user._id;
    await post.save();
    return res.status(200).json({ success: true, results: { post } });
  } else {
    return next(new Error("Unauthorized", { cause: 401 }));
  }
};

export const restorePost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbservice.findOneAndUpdate({
    model: PostModel,
    filter: { _id: postId, isDeleted: true, deletedBy: req.user._id },
    data: { isDeleted: false, $unset: { deletedBy: "" } },
    options: { new: true },
  });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  return res.status(200).json({ success: true, results: { post } });
};

export const getSinglePost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbservice.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
    populate: [
      { path: "createdBy", select: "userName image -_id" },
      {
        path: "comments",
        select: "image text createdAt",
        match: { isDeleted: false, parentComment: null },
        populate: [
          { path: "createdBy", select: "userName image -_id" },
          {
            path: "replies",
            populate: [{ path: "replies" }],
          },
        ],
      },
    ],
  });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  return res.status(200).json({ success: true, results: { post } });
};

export const activePosts = async (req, res, next) => {
  let { page } = req.query;

  const results = await PostModel.find({
    isDeleted: false,
  }).paginate(page);

  return res.status(200).json({ success: true, results: { results } });
};

export const getAllFreezedPosts = async (req, res, next) => {
  let posts;

  if (req.user.role === roleType.Admin) {
    posts = await dbservice.find({
      model: PostModel,
      filter: { isDeleted: true },
      populate: [{ path: "createdBy", select: "userName image -_id" }],
    });
  } else if (req.user.role === roleType.User) {
    posts = await dbservice.find({
      model: PostModel,
      filter: { isDeleted: true, createdBy: req.user._id },
      populate: [{ path: "createdBy", select: "userName image -_id" }],
    });
  }
  return res.status(200).json({ success: true, results: { posts } });
};

export const likeAndUnlike = async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await dbservice.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
  });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const isUserLiked = post.likes.find(
    (user) => user.toString() === userId.toString()
  );

  if (!isUserLiked) {
    post.likes.push(userId); // make like
  } else {
    post.likes = post.likes.filter(
      (user) => user.toString() !== userId.toString() // unLike
    );
  }

  await post.save();

  const popoulatedPost = await dbservice.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
    populate: [{ path: "likes", select: "userName image -_id" }],
  });

  return res.status(200).json({ success: true, results: { popoulatedPost } });
};
