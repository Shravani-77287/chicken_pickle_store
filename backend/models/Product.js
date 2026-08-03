// models/Product.js
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  weight: { type: String, required: true }, // e.g., "250g", "500g", "1kg"
  price: { type: Number, required: true },  // Price in INR (e.g., 350)
  stock: { type: Number, required: true, default: 0 } // Inventory count
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g., "Boneless Chicken Pickle"
    slug: { type: String, required: true, unique: true }, // e.g., "boneless-chicken-pickle" for clean URLs
    description: { type: String, required: true },
    ingredients: [{ type: String }],
    spiceLevel: { 
      type: String, 
      enum: ['Mild', 'Medium', 'Extra Hot'], 
      default: 'Medium' 
    },
    variants: [variantSchema],
    images: [{ type: String, required: true }], // Cloudinary URLs
    isBestSeller: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);