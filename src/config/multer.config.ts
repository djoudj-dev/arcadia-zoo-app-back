import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

const uploadDirectory = join(process.cwd(), 'uploads/habitats');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

export const multerOptions = {
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
