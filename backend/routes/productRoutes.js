// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');

const JWT_SECRET = process.env.JWT_SECRET || 'chicken_pickle_secret_key_2026';

const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Admin authorization required' });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access denied' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

// GET /api/products - List all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load products' });
  }
});

// GET /api/products/:slug - Single product by slug or ObjectId
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const query = mongoose.Types.ObjectId.isValid(slug)
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ message: 'Pickle variety not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load product details' });
  }
});

// POST /api/products - Admin: Add new product with variant stock
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      images,
      spiceLevel,
      variants,
      ingredients,
      allergens,
      shelfLife,
      storageInstructions,
      fssaiNumber,
      nutritionalInfo,
    } = req.body;

    const imageList = images?.length ? images : image ? [image] : [];
    if (!name || !description || imageList.length === 0) {
      return res.status(400).json({ message: 'Name, description, and image are required' });
    }

    const finalSlug =
      slug ||
      `${name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')}-${Date.now()}`;

    const formattedVariants = (variants || []).map((v) => ({
      weight: v.weight,
      originalPrice: Number(v.originalPrice) || Number(v.price) + 50,
      price: Number(v.price),
      stock: v.stock !== undefined ? Number(v.stock) : 25,
    }));

    const product = await Product.create({
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      images: imageList,
      spiceLevel: spiceLevel || 'Medium',
      variants: formattedVariants,
      ...(ingredients && { ingredients }),
      ...(allergens && { allergens }),
      ...(shelfLife && { shelfLife }),
      ...(storageInstructions && { storageInstructions }),
      ...(fssaiNumber && { fssaiNumber }),
      ...(nutritionalInfo && { nutritionalInfo }),
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add product' });
  }
});

// PUT /api/products/:id - Admin: Edit product details, prices & stock
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      images,
      spiceLevel,
      variants,
      ingredients,
      shelfLife,
      fssaiNumber,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (spiceLevel) product.spiceLevel = spiceLevel;
    if (images?.length) product.images = images;
    else if (image) product.images = [image];

    if (Array.isArray(variants) && variants.length > 0) {
      product.variants = variants.map((v) => ({
        weight: v.weight,
        originalPrice: Number(v.originalPrice) || Number(v.price) + 50,
        price: Number(v.price),
        stock: v.stock !== undefined ? Math.max(0, Number(v.stock)) : 25,
      }));
    }

    if (ingredients) product.ingredients = ingredients;
    if (shelfLife) product.shelfLife = shelfLife;
    if (fssaiNumber) product.fssaiNumber = fssaiNumber;

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Admin: Delete product
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;