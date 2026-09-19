import { Request, Response, NextFunction } from 'express';
import { CatalogProduct, CatalogCategory } from '../models';
import { deleteImage } from '../utils/cloudinary';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.query;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId as string;

    const products = await CatalogProduct.findAll({
      where,
      include: [{ model: CatalogCategory, as: 'category' }],
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await CatalogProduct.findByPk(req.params.id as string, {
      include: [{ model: CatalogCategory, as: 'category' }],
    });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await CatalogProduct.create(req.body);
    const result = await CatalogProduct.findByPk((product as any).id, {
      include: [{ model: CatalogCategory, as: 'category' }],
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await CatalogProduct.findByPk(req.params.id as string);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }
    if (req.body.imageUrl && req.body.imageUrl !== (product as any).imageUrl && (product as any).imageUrl) {
      await deleteImage((product as any).imageUrl);
    }
    await product.update(req.body);
    const result = await CatalogProduct.findByPk(req.params.id as string, {
      include: [{ model: CatalogCategory, as: 'category' }],
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await CatalogProduct.findByPk(req.params.id as string);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }
    if ((product as any).imageUrl) await deleteImage((product as any).imageUrl);
    await product.destroy();
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};
