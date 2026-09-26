import { Request, Response, NextFunction } from 'express';
import { Includeable } from 'sequelize';
import { CatalogProduct, CatalogCategory, CatalogProductVariation } from '../models';
import { deleteImage } from '../utils/cloudinary';

const productIncludes: Includeable[] = [
  { model: CatalogCategory, as: 'category' },
  {
    model: CatalogProductVariation,
    as: 'variations',
    order: [['sortOrder', 'ASC']],
  },
];

interface VariationInput {
  label?: string;
  price?: number | string;
  inStock?: boolean;
  sortOrder?: number;
}

const buildVariations = (productId: string, variations: VariationInput[] | undefined) =>
  (variations ?? []).map((v, i) => ({
    productId,
    label: String(v.label ?? '').trim(),
    price: v.price,
    inStock: v.inStock ?? true,
    sortOrder: v.sortOrder ?? i,
  }));

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.query;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId as string;

    const products = await CatalogProduct.findAll({
      where,
      include: productIncludes,
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
      include: productIncludes,
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
    const { variations, ...productData } = req.body;
    const product = await CatalogProduct.create(productData);
    const productId = (product as any).id;
    if (Array.isArray(variations) && variations.length > 0) {
      await CatalogProductVariation.bulkCreate(buildVariations(productId, variations));
    }
    const result = await CatalogProduct.findByPk(productId, { include: productIncludes });
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
    const { variations, ...productData } = req.body;
    if (productData.imageUrl && productData.imageUrl !== (product as any).imageUrl && (product as any).imageUrl) {
      await deleteImage((product as any).imageUrl);
    }
    await product.update(productData);
    const productId = (product as any).id;
    if (Array.isArray(variations)) {
      await CatalogProductVariation.destroy({ where: { productId } });
      if (variations.length > 0) {
        await CatalogProductVariation.bulkCreate(buildVariations(productId, variations));
      }
    }
    const result = await CatalogProduct.findByPk(productId, { include: productIncludes });
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
    await CatalogProductVariation.destroy({ where: { productId: (product as any).id } });
    if ((product as any).imageUrl) await deleteImage((product as any).imageUrl);
    await product.destroy();
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};

const normalizeName = (name: string): string =>
  name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

interface BatchItem {
  sku?: string;
  name?: string;
  price?: number | string;
  categoryName?: string;
  inStock?: boolean;
}

export const batchUpsert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items: BatchItem[] = req.body.items ?? [];

    const categories = await CatalogCategory.findAll();
    const categoryByNorm = new Map<string, { id: string }>();
    for (const c of categories) {
      categoryByNorm.set(normalizeName((c as any).name), { id: (c as any).id });
    }

    let created = 0;
    let updated = 0;
    let unchanged = 0;
    const errors: { index: number; sku: string; message: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const sku = String(item.sku ?? '').trim();
      try {
        const existing = await CatalogProduct.findOne({ where: { sku } });
        if (existing) {
          const nextPrice = Number(item.price);
          if (Number((existing as any).price) === nextPrice) {
            unchanged += 1;
          } else {
            await existing.update({ price: nextPrice });
            updated += 1;
          }
        } else {
          const categoryName = String(item.categoryName ?? '').trim() || 'Sin categoría';
          let category = categoryByNorm.get(normalizeName(categoryName));
          if (!category) {
            const createdCategory = await CatalogCategory.create({ name: categoryName });
            category = { id: (createdCategory as any).id };
            categoryByNorm.set(normalizeName(categoryName), category);
          }
          await CatalogProduct.create({
            sku,
            name: String(item.name ?? '').trim(),
            price: Number(item.price),
            categoryId: category.id,
            inStock: item.inStock ?? true,
          });
          created += 1;
        }
      } catch (error: any) {
        errors.push({ index: i, sku, message: error?.message ?? 'Failed to import row.' });
      }
    }

    res.json({ success: true, data: { created, updated, unchanged, errors } });
  } catch (error) {
    next(error);
  }
};
