import path from "path";
import { promises as fs } from "fs";
import multer from "multer";

const normalizePath = (filePath) => filePath.replaceAll("\\", "/");

const imageFileFilter = (request, file, callback) => {
  if (!file.mimetype?.startsWith("image/")) {
    return callback(new Error("Only image files are allowed"), false);
  }

  callback(null, true);
};

const createFileName = (file) => {
  const extension = path.extname(file.originalname);
  const name = path.basename(file.originalname, extension).replace(/\s+/g, "-");
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  return `${name}-${uniqueName}${extension}`;
};

export const createImageUploader = (uploadPath, fieldName = "image") => {
  const storage = multer.diskStorage({
    destination: async (request, file, callback) => {
      try {
        await fs.mkdir(uploadPath, { recursive: true });
        callback(null, uploadPath);
      } catch (error) {
        callback(error);
      }
    },
    filename: (request, file, callback) => {
      callback(null, createFileName(file));
    },
  });

  const upload = multer({
    storage,
    fileFilter: imageFileFilter,
  });

  if (Array.isArray(fieldName)) {
    const fields = fieldName.map((name) => ({
      name,
      maxCount: 1,
    }));

    return (request, response, next) => {
      upload.fields(fields)(request, response, (error) => {
        if (error) {
          return next(error);
        }

        request.file = Object.values(request.files || {})[0]?.[0];
        next();
      });
    };
  }

  return upload.single(fieldName);
};

export const getUploadedImage = (file) => {
  if (!file) {
    return false;
  }

  return {
    path: normalizePath(file.path),
    name: file.filename,
  };
};
