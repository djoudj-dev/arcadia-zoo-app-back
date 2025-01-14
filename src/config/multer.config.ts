import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

const UPLOAD_BASE_PATH = '/app/uploads'; // Chemin absolu dans le conteneur

function createMulterOptions(uploadDirectory: string) {
  const absolutePath = join(UPLOAD_BASE_PATH, uploadDirectory);

  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, absolutePath);
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
export const multerOptionsHabitats = createMulterOptions('habitats');
export const multerOptionsAnimals = createMulterOptions('animals');
export const multerOptionsServices = createMulterOptions('services');

export const createTemplateDirectory = () => {
  const templateDir = join(process.cwd(), 'src/modules/mail/templates');
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }
  return templateDir;
};
