import * as dbserivce from "../../DB/dbService.js";
import { PostModel } from "../../DB/Models/post.model.js";
import { CommentModel } from "../../DB/Models/comment.model.js";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";
import { roleType } from "../../DB/Models/user.model.js";

export const createComment = async (req, res, next) => {
  const { text } = req.body;
  const { postId } = req.params;

  const post = await dbserivce.findById({
    model: PostModel,
    id: postId,
  });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  // upload image if exist
  let image;
  if (req.file) {
    // upload cloundinary
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `posts/${post.createdBy}/posts/${post.customId}/comments` }
    );
    image = { public_id, secure_url };
  }

  // create comment
  const comment = await dbserivce.create({
    model: CommentModel,
    data: {
      text,
      createdBy: req.user._id,
      postId: post._id,
      image,
    },
  });

  return res.status(201).json({ success: true, data: { comment } });
};

export const updateComment = async (req, res, next) => {
  const { text } = req.body;
  const { commentId } = req.params;

  const comment = await dbserivce.findById({
    model: CommentModel,
    id: commentId,
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const post = await dbserivce.findOne({
    model: PostModel,
    id: { _id: comment.postId, isDeleted: false },
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  if (comment.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Unauthorized", { cause: 401 }));

  // upload image if exist
  let image;
  if (req.file) {
    // upload cloundinary
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `posts/${post.createdBy}/posts/${post.customId}/comments` }
    );
    image = { public_id, secure_url };

    // delete image
    if (comment.image) {
      await cloudinary.uploader.destroy(comment.image.public_id);
    }
    comment.image = image;
  }

  comment.text = text ? text : comment.text;
  await comment.save();

  return res.status(200).json({ success: true, data: { comment } });
};

export const softDelete = async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await dbserivce.findById({
    model: CommentModel,
    id: commentId,
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const post = await dbserivce.findOne({
    model: PostModel,
    id: { _id: comment.postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  // user who created the comment
  const commetOwner = comment.createdBy.toString() === req.user._id.toString();

  // user who created the post
  const postOwner = post.createdBy.toString() === req.user._id.toString();

  // admin
  const admin = req.user.role === roleType.Admin;

  if (!(commetOwner || postOwner || admin))
    return next(new Error("Unauthorized", { cause: 401 }));

  comment.isDeleted = true;
  comment.deletedBy = req.user._id;
  await comment.save();

  return res.status(200).json({ success: true, data: { comment } });
};

export const getAllComments = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbserivce.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  const comment = await dbserivce.find({
    model: CommentModel,
    filter: { postId, isDeleted: false, parentComment: { $exists: false } },
    populate: [{ path: "replies" }],
  });

  return res.status(200).json({ success: true, data: { comment } });
};

export const likeAndUnlike = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await dbserivce.findOne({
    model: CommentModel,
    filter: { _id: commentId, isDeleted: false },
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const isUserLiked = comment.likes.find(
    (user) => user.toString() === userId.toString()
  );

  if (!isUserLiked) {
    comment.likes.push(userId); // make like
  } else {
    comment.likes = comment.likes.filter(
      (user) => user.toString() !== userId.toString() // unLike
    );
  }

  await comment.save();

  return res.status(200).json({ success: true, results: { comment } });
};

export const addReply = async (req, res, next) => {
  const { commentId, postId } = req.params;

  // parent comment
  const comment = await dbserivce.findOne({
    model: CommentModel,
    filter: { _id: commentId, isDeleted: false },
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const post = await dbserivce.findOne({
    model: PostModel,
    filter: { _id: postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  let image;
  if (req.file) {
    // upload cloundinary
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `posts/${post.createdBy}/posts/${post.customId}/comments/${comment._id}`,
      }
    );
    image = { public_id, secure_url };
  }

  // create replys
  const reply = await dbserivce.create({
    model: CommentModel,
    data: {
      ...req.body,
      createdBy: req.user._id,
      postId: post._id,
      image,
      parentComment: comment._id,
    },
  });

  return res.status(201).json({ success: true, results: { reply } });
};

// delete parent comment
export const hardDeleteComment = async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await dbserivce.findById({
    model: CommentModel,
    id: commentId,
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const post = await dbserivce.findById({
    model: PostModel,
    id: comment.postId,
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  // owner comment
  const commentOwner = comment.createdBy.toString() === req.user._id.toString();
  // admin
  const admin = req.user.role === roleType.Admin;
  // owner post
  const postOwner = post.createdBy.toString() === req.user._id.toString();

  if (!(commentOwner || admin || postOwner))
    return next(new Error("Unauthorized", { cause: 401 }));

  // delete all nested replies
  await comment.deleteOne();

  return res.status(201).json({ success: true, message: "comment deleted" });
};
