import { Router } from 'express';
import { Includeable } from 'sequelize';
import { CatalogCategory, CatalogProduct, CatalogOrder, CatalogProductVariation } from '../models';

const router = Router();

const productIncludes: Includeable[] = [
  { model: CatalogCategory, as: 'category' },
  {
    model: CatalogProductVariation,
    as: 'variations',
    order: [['sortOrder', 'ASC']],
  },
];

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await CatalogCategory.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.get('/products', async (req, res, next) => {
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
});

router.get('/products/:id', async (req, res, next) => {
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
});

router.post('/orders', async (req, res, next) => {
  try {
    const { items, ...orderData } = req.body;
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );
    const order = await CatalogOrder.create({ ...orderData, items, total });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

export default router;
