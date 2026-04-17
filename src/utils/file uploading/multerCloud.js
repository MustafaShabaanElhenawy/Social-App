import multer, { diskStorage } from "multer";

export const uploadCloud = () => {
  const storage = diskStorage({});

  const multerUpload = multer({ storage });

  return multerUpload;
};

// Maxsize  2mb
