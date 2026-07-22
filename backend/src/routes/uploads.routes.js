import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../cloudinary.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "chat-app",
    resource_type: "auto",
  }),
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  console.log("✅ Uploaded:", req.file);
  console.log("RESOURCE TYPE:", req.file.resource_type);

  res.json({
    fileUrl: req.file.path,
  });
});

export default router;