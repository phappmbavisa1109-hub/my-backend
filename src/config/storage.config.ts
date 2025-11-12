import { memoryStorage } from 'multer';
import { extname } from 'path';

export const storageConfig = {
  // Use memory storage for Cloudflare Workers (no filesystem access)
  storage: memoryStorage(),
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