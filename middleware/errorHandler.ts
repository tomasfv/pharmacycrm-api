import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  errors?: string[];
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages: string[] = [];
    if ((err as any).errors?.length) {
      messages.push(...(err as any).errors.map((e: any) => e.message).filter(Boolean));
    }
    if ((err as any).parent?.detail) {
      messages.push((err as any).parent.detail);
    }
    if (messages.length === 0) messages.push(err.message);
    res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    return;
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({ success: false, message: 'Referenced record not found.' });
    return;
  }

  const status = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error.';
  res.status(status).json({ success: false, message });
};
