// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configura tu cuenta de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración del almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "evidencias", // Cloudinary crea automáticamente esta carpeta
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// Configura multer para usar Cloudinary
const upload = multer({ storage });

// ✅ Exporta los tres para usarlos donde quieras
export { cloudinary, storage, upload };
