import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
export const fileValidation = {
  image: ["image/png", "image/jpeg"],
  files: ["application/pdf", "application/msword"],
  video: ["video/mp4"],
  audio: ["audio/mpeg"],
};

export const upload = (fileType, folder) => {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.resolve(".", `${folder}/${req.user._id}`);
      if (fs.existsSync(folderPath)) return cb(null, folderPath);
      fs.mkdirSync(folderPath, { recursive: true });
      const folderName = `${folder}/${req.user._id}`;
      cb(null, folderName);
    },

    filename: (req, file, cb) => {
      cb(null, nanoid() + "____" + file.originalname);
    },
  });
  // magic numbers
  const fileFilter = (req, file, cb) => {
    if (!fileType.includes(file.mimetype))
      return cb(
        new Error(`Only ${JSON.stringify(fileType)}  files are allowed`),
        false
      );
    return cb(null, true);
  };

  const multerUpload = multer({ storage, fileFilter });

  return multerUpload;
};
