import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }
    const u = user as any;
    const valid = await bcrypt.compare(password, u.password);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }
    const token = jwt.sign(
      { id: u.id, email: u.email, role: u.role },
      process.env.JWT_SECRET!,
      { expiresIn: 604800 },
    );
    res.json({
      success: true,
      data: {
        token,
        user: { id: u.id, name: u.name, email: u.email, avatar: u.avatar, role: u.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      res.status(400).json({ success: false, message: 'Email already registered.' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || 'staff' }) as any;
    res.status(201).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const me = (req: Request, res: Response): void => {
  const u = req.user as any;
  res.json({
    success: true,
    data: { id: u.id, name: u.name, email: u.email, avatar: u.avatar, role: u.role },
  });
};
