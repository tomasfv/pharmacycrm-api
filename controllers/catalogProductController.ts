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
  sku?: string | null;
  price?: number | string;
  inStock?: boolean;
  sortOrder?: number;
}

const buildVariations = (productId: string, variations: VariationInput[] | undefined) =>
  (variations ?? []).map((v, i) => ({
    productId,
    label: String(v.label ?? '').trim(),
    sku: v.sku ? String(v.sku).trim() : null,
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

interface BatchVariationItem {
  sku?: string;
  label?: string;
  price?: number | string;
  inStock?: boolean;
}

interface BatchItem {
  sku?: string;
  name?: string;
  price?: number | string;
  categoryName?: string;
  inStock?: boolean;
  variations?: BatchVariationItem[];
}

export const batchUpsert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items: BatchItem[] = req.body.items ?? [];

    const categories = await CatalogCategory.findAll();
    const categoryByNorm = new Map<string, { id: string }>();
    for (const c of categories) {
      categoryByNorm.set(normalizeName((c as any).name), { id: (c as any).id });
    }
    const resolveCategory = async (rawName: string): Promise<{ id: string }> => {
      const categoryName = String(rawName ?? '').trim() || 'Sin categoría';
      const key = normalizeName(categoryName);
      const cached = categoryByNorm.get(key);
      if (cached) return cached;
      const createdCategory = await CatalogCategory.create({ name: categoryName });
      const entry = { id: (createdCategory as any).id };
      categoryByNorm.set(key, entry);
      return entry;
    };

    const allVariations = await CatalogProductVariation.findAll({
      attributes: ['id', 'sku', 'price', 'productId'],
    });
    const variationBySku = new Map<string, any>();
    const variationCountByProduct = new Map<string, number>();
    for (const v of allVariations) {
      const vsku = (v as any).sku ? String((v as any).sku).trim() : '';
      if (vsku) variationBySku.set(vsku, v);
      const pid = String((v as any).productId);
      variationCountByProduct.set(pid, (variationCountByProduct.get(pid) ?? 0) + 1);
    }

    let productByNorm: Map<string, any> | null = null;
    const getProductByNorm = async (): Promise<Map<string, any>> => {
      if (!productByNorm) {
        productByNorm = new Map<string, any>();
        const allProducts = await CatalogProduct.findAll({ attributes: ['id', 'name'] });
        for (const p of allProducts) {
          productByNorm.set(normalizeName((p as any).name), p);
        }
      }
      return productByNorm;
    };

    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let variationsCreated = 0;
    let variationsUpdated = 0;
    const errors: { index: number; sku: string; message: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const sku = String(item.sku ?? '').trim();
      const nextPrice = Number(item.price);
      const isGroup = Array.isArray(item.variations) && item.variations.length > 0;
      try {
        if (isGroup) {
          const parentName = String(item.name ?? '').trim();
          const nameMap = await getProductByNorm();
          const parentKey = normalizeName(parentName);
          let parent = nameMap.get(parentKey) ?? null;
          if (!parent) {
            const category = await resolveCategory(String(item.categoryName ?? '').trim());
            parent = await CatalogProduct.create({
              name: parentName,
              price: Number.isFinite(nextPrice) ? nextPrice : 0,
              categoryId: category.id,
              inStock: true,
              sku: null,
            });
            nameMap.set(parentKey, parent);
            created += 1;
          } else {
            unchanged += 1;
          }
          const parentId = String((parent as any).id);
          const members = item.variations ?? [];
          for (let j = 0; j < members.length; j++) {
            const v = members[j];
            const vsku = String(v.sku ?? '').trim();
            if (!vsku) {
              errors.push({ index: i, sku: '', message: 'Variation SKU is required.' });
              continue;
            }
            try {
              const existingVariation = variationBySku.get(vsku);
              if (existingVariation) {
                const memberPrice = Number(v.price);
                const priceChanged = Number((existingVariation as any).price) !== memberPrice;
                const reParent = String((existingVariation as any).productId) !== parentId;
                if (priceChanged || reParent) {
                  await existingVariation.update({
                    ...(priceChanged ? { price: memberPrice } : {}),
                    ...(reParent ? { productId: parentId } : {}),
                  });
                  variationsUpdated += 1;
                } else {
                  unchanged += 1;
                }
                continue;
              }
              const memberProduct = await CatalogProduct.findOne({ where: { sku: vsku } });
              if (memberProduct) {
                if (String((memberProduct as any).id) === parentId) {
                  unchanged += 1;
                  continue;
                }
                const memberProductId = String((memberProduct as any).id);
                const ownVariations = variationCountByProduct.get(memberProductId) ?? 0;
                if (ownVariations > 0) {
                  errors.push({
                    index: i,
                    sku: vsku,
                    message: 'The existing product has its own variations; edit or delete them before associating.',
                  });
                  continue;
                }
                if ((memberProduct as any).imageUrl) await deleteImage((memberProduct as any).imageUrl);
                await memberProduct.destroy();
              }
              const newVariation = await CatalogProductVariation.create({
                productId: parentId,
                label: String(v.label ?? '').trim(),
                sku: vsku,
                price: Number(v.price),
                inStock: v.inStock ?? true,
                sortOrder: j,
              });
              variationBySku.set(vsku, newVariation);
              variationCountByProduct.set(parentId, (variationCountByProduct.get(parentId) ?? 0) + 1);
              variationsCreated += 1;
            } catch (error: any) {
              errors.push({ index: i, sku: vsku, message: error?.message ?? 'Failed to import variation.' });
            }
          }
          continue;
        }

        if (!sku) {
          errors.push({ index: i, sku, message: 'SKU is required.' });
          continue;
        }
        const existingProduct = await CatalogProduct.findOne({ where: { sku } });
        if (existingProduct) {
          if (Number((existingProduct as any).price) === nextPrice) {
            unchanged += 1;
          } else {
            await existingProduct.update({ price: nextPrice });
            updated += 1;
          }
          continue;
        }
        const existingVariation = variationBySku.get(sku);
        if (existingVariation) {
          if (Number((existingVariation as any).price) === nextPrice) {
            unchanged += 1;
          } else {
            await existingVariation.update({ price: nextPrice });
            variationsUpdated += 1;
          }
          continue;
        }
        const category = await resolveCategory(String(item.categoryName ?? '').trim());
        await CatalogProduct.create({
          sku,
          name: String(item.name ?? '').trim(),
          price: nextPrice,
          categoryId: category.id,
          inStock: item.inStock ?? true,
        });
        created += 1;
      } catch (error: any) {
        errors.push({ index: i, sku, message: error?.message ?? 'Failed to import row.' });
      }
    }

    res.json({
      success: true,
      data: { created, updated, unchanged, variationsCreated, variationsUpdated, errors },
    });
  } catch (error) {
    next(error);
  }
};
