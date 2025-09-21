import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as multerS3 from 'multer-s3';
import { join } from 'path';
import { S3Config } from './s3.config';

const UPLOAD_BASE_PATH = join(process.cwd(), 'uploads'); // Utilisation du répertoire du projet
const S3_BUCKET = process.env.S3_BUCKET || 'savedatabase';
const USE_S3 = process.env.USE_S3 === 'true';

function createMulterOptions(uploadDirectory: string) {
  // Configuration S3 si activée
  if (USE_S3) {
    try {
      const s3Client = S3Config.getInstance();

      return {
        storage: multerS3({
          s3: s3Client,
          bucket: S3_BUCKET,
          key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const originalName = file.originalname
              .toLowerCase()
              .split(' ')
              .join('-');
            const fileName = uniqueSuffix + '-' + originalName;
            cb(null, `${uploadDirectory}/${fileName}`);
          },
          contentType: multerS3.AUTO_CONTENT_TYPE,
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
            cb(null, true);
          } else {
            cb(new Error('Format de fichier non supporté'), false);
          }
        },
      };
    } catch (error) {
      console.warn('Erreur configuration S3, utilisation du stockage local:', error);
      // Fallback vers le stockage local
    }
  }

  // Configuration locale (fallback)
  const absolutePath = join(UPLOAD_BASE_PATH, uploadDirectory);

  // Assurer que le répertoire existe
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: absolutePath,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const originalName = file.originalname
          .toLowerCase()
          .split(' ')
          .join('-');
        cb(null, uniqueSuffix + '-' + originalName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
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
