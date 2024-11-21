import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

function createMulterOptions(uploadDirectory: string) {
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDirectory);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}-${file.originalname}`;
        cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Format de fichier non supporté'), false);
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

export const createTemplateDirectory = () => {
  const templateDir = join(process.cwd(), 'src/modules/mail/templates');
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }
  return templateDir;
};
