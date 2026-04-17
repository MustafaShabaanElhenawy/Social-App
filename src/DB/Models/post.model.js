import mongoose, { Schema, Types, model } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 5000,
      trim: true,
      required: function () {
        return this.images?.length ? false : true;
      },
    },
    images: [
      {
        public_id: String,
        secure_url: String,
      },
    ],
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
    customId: {
      type: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId", // FK
  localField: "_id", // PK
  // justOne: true,
});

// pagination model
// query   // skip , limit , populate , select
// query.paginate = function () {}

postSchema.query.paginate = async function (page) {
  page = page ? page : 1;

  const limit = 4;
  const skip = limit * (page - 1);

  // , itemPerPage
  // this

  const data = await this.skip(skip).limit(limit);
  const items = await this.model.countDocuments();

  return {
    data,
    totalItems: items,
    currentPage: Number(page),
    totalPages: Math.ceil(items / limit),
    itemPerPage: data.length,
  };
};

export const PostModel = mongoose.model.Post || model("Post", postSchema);
