import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";
import * as postService from "./post.service.js";
import * as postValidation from "./post.validation.js";
import commentRouter from "../Comment/comment.controller.js";

const router = Router();

// /post/:postId/comment

router.use("/:postId/comment", commentRouter);

router.post(
  "/create",
  authentication(),
  allowTo(["User"]),
  uploadCloud().array("images", 5), // parsing files  // req.file || req.files
  validation(postValidation.createPostSchema),
  asyncHandler(postService.createPost)
);

router.patch(
  "/update/:postId",
  authentication(),
  allowTo(["User"]),
  uploadCloud().array("images", 5), // parsing files  // req.file || req.files
  validation(postValidation.updatePostSchema),
  asyncHandler(postService.updatePost)
);

router.patch(
  "/softDelete/:postId",
  authentication(),
  allowTo(["User", "Admin"]),
  validation(postValidation.softDeleteSchema),
  asyncHandler(postService.softDelete)
);

router.patch(
  "/restorePost/:postId",
  authentication(),
  allowTo(["User", "Admin"]),
  validation(postValidation.restorePostSchema),
  asyncHandler(postService.restorePost)
);

router.get(
  "/getSinglePost/:postId",
  authentication(),
  allowTo(["User", "Admin"]),
  validation(postValidation.getSinglePostSchema),
  asyncHandler(postService.getSinglePost)
);

router.get(
  "/activePost",
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(postService.activePosts)
);

router.get(
  "/getAllFreezedPosts",
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(postService.getAllFreezedPosts)
);

router.patch(
  "/like_unlike/:postId",
  authentication(),
  allowTo(["User"]),
  validation(postValidation.likeAndUnlikeSchema),
  asyncHandler(postService.likeAndUnlike)
);

export default router;
