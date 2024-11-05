import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

function createMulterOptions(uploadDirectory: string) {
  // Vérifie si le dossier d'upload existe, sinon le crée
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDirectory);
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname); // Utiliser le nom de fichier d'origine
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|svg|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Unsupported file format'), false);
      }
    },
  };
}

// Utilisation pour les différents types d'uploads
export const multerOptionsHabitats = createMulterOptions(
  join(process.cwd(), 'uploads/habitats'),
);
export const multerOptionsAnimals = createMulterOptions(
  join(process.cwd(), 'uploads/animals'),
);
export const multerOptionsServices = createMulterOptions(
  join(process.cwd(), 'uploads/services'),
);
