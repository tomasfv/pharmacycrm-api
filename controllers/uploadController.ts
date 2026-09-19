import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

export async function uploadImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen.' });
      return;
    }

    const folder = (req.query.folder as string) || 'pharmacycrm/uploads';

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        },
      );
      stream.end(req.file!.buffer);
    });

    res.json({ success: true, data: { url: result.secure_url } });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Error al subir la imagen.' });
  }
}
