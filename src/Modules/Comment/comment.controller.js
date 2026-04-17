import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";
import * as commentService from "./comment.service.js";
import * as commentValidation from "./comment.validation.js";

const router = Router({ mergeParams: true });

// create comment
router.post(
  "/",
  authentication(),
  allowTo(["User"]),
  uploadCloud().single("image"),
  validation(commentValidation.createCommentSchema),
  asyncHandler(commentService.createComment)
);
// path
router.patch(
  "/:commentId",
  authentication(),
  allowTo(["User"]),
  uploadCloud().single("image"),
  validation(commentValidation.updateCommentSchema),
  asyncHandler(commentService.updateComment)
);

router.patch(
  "/softDelete/:commentId",
  authentication(),
  allowTo(["User"]),
  validation(commentValidation.softDeleteCommentSchema),
  asyncHandler(commentService.softDelete)
);

// /post/:postId/comment

router.get(
  "/",
  authentication(),
  allowTo(["User", "Admin"]),
  validation(commentValidation.getAllCommentsSchema),
  asyncHandler(commentService.getAllComments)
);

// like/unlike
router.patch(
  "/like_unlike/:commentId",
  authentication(),
  allowTo(["User"]),
  validation(commentValidation.likeUnlikeCommentSchema),
  asyncHandler(commentService.likeAndUnlike)
);

// post >>>> comment >>>> reply

// /post/:postId/comment/:commentId

router.post(
  "/:commentId",
  authentication(),
  allowTo(["User"]),
  uploadCloud().single("image"),
  validation(commentValidation.addReplySchema),
  asyncHandler(commentService.addReply)
);

// delete comment
router.delete(
  "/:commentId",
  authentication(),
  allowTo(["User", "Admin"]),
  validation(commentValidation.hardDeletedComment),
  asyncHandler(commentService.hardDeleteComment)
);

export default router;
