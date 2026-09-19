import { Router } from 'express';
import { auth } from '../middleware/auth';
import upload from '../middleware/upload';
import { uploadImage } from '../controllers/uploadController';

const router = Router();

router.post('/image', auth, upload.single('image'), uploadImage);

export default router;
