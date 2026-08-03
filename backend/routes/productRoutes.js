// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET /api/products - Fetch all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// POST /api/products - Add a new pickle (Admin Only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, slug, description, image, spiceLevel, variants } = req.body;

    if (!name || !description || !variants || variants.length === 0) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '') +
        '-' +
        Date.now();

    const imageUrl =
      image && image.trim() !== ''
        ? image
        : 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600';

    const product = new Product({
      name,
      slug: finalSlug,
      description,
      images: [imageUrl],
      spiceLevel: spiceLevel || 'Medium',
      variants, // Each variant object contains: { weight, originalPrice, price }
      category: 'Non-Veg Pickle',
      countInStock: 50,
      rating: 5,
      numReviews: 1,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message || 'Failed to create product' });
  }
});

// DELETE /api/products/:id - Delete a pickle (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;