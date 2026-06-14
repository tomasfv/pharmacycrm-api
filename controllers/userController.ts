import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id as string, { attributes: { exclude: ['password'] } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      res.status(400).json({ success: false, message: 'Email already registered.' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff',
    }) as any;
    res.status(201).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id as string);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    const { name, email, role, avatar, password } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await (user as any).update(updateData);
    const updated = await User.findByPk(req.params.id as string, { attributes: { exclude: ['password'] } });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user as any;
    if (currentUser.id === (req.params.id as string)) {
      res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
      return;
    }
    const user = await User.findByPk(req.params.id as string);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    await user.destroy();
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};
