import { diskStorage } from 'multer';
import { extname } from 'path';

export const storageConfig = {
  storage: diskStorage({
    destination: './uploads/videos',
    filename: (req, file, callback) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.includes('video')) {
      return callback(new Error('Only video files are allowed!'), false);
    }
    callback(null, true);
  },
};