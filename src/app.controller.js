import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import postRouter from "./Modules/Post/post.controller.js";
import commentRouter from "./Modules/Comment/comment.controller.js";
import adminRouter from "./Modules/Admin/admin.controller.js";
import morgan from "morgan";
import connectDB from "./DB/connection.js";
import {
  globalErrorHandler,
  notFoundHabdler,
} from "./utils/error handling/asyncHandler.js";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
// 5 request per 1 min
const limtter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  // limit: 2,
  limit: 2,
  // message: "Blocked By Rate Limit",
  // statusCode: 400, // 429
  // handler: (req, res, next, options) => {
  //   return next(new Error(options.message, { cause: options.statusCode }));
  // },

  //legacyHeaders: true,
  // standardHeaders: true, // boolean | string  "draft-6" | "draft-7" | "draft-8"

  // keyGenerator: (req, res) => {
  //   return req.ip;
  // },
  // rate limit 2

  // skip: (req, res) => {
  //   return !["::1", "129.165.0.50"].includes("::1");
  // },

  // store: // redis

  skipSuccessfulRequests: false, // false
  skipFailedRequests: true,
});

const bootstarp = async (app, express) => {
  await connectDB();

  app.use(morgan("dev"));
  app.use(express.json());
  app.use(limtter);
  // app.use(helmet());

  app.get("/", (req, res) => res.json("Hello World!"));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/admin", adminRouter);

  app.all("*", notFoundHabdler);

  app.use(globalErrorHandler);
};

export default bootstarp;

// MVC
