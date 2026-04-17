import mongoose, { Schema, Types, model } from "mongoose";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";

const commentSchema = new Schema(
  {
    text: {
      type: String,
      minLength: 2,
      maxLength: 5000,
      trim: true,
      required: function () {
        return this.image?.length ? false : true;
      },
    },
    image: {
      public_id: String,
      secure_url: String,
    },
    postId: {
      type: Types.ObjectId,
      ref: "Post",
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    parentComment: {
      type: Types.ObjectId,
      ref: "Comment",
    },
    // replies: [{ type: Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

commentSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc, next) {
    if (doc.image.secure_url) {
      await cloudinary.uploader.destroy(doc.image.public_id);
    }
    const replies = await this.constructor.find({ parentComment: doc._id }); // []
    if (replies.length > 0) {
      for (const reply of replies) {
        await reply.deleteOne();
      }
    }
    return next();
  }
);

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

export const CommentModel =
  mongoose.model.Comment || model("Comment", commentSchema);
