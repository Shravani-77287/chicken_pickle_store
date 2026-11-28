// backend/models/Product.js
const mongoose = require('mongoose');

const getDefaultDates = () => {
  const now = new Date();
  const mfg = now.toISOString().slice(0, 10);
  const expDate = new Date(now);
  expDate.setMonth(expDate.getMonth() + 4);
  const exp = expDate.toISOString().slice(0, 10);
  return { mfg, exp };
};

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'Chicken Pickles' },
    images: [{ type: String, required: true }],
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Spicy', 'Extra Fiery'],
      default: 'Medium',
    },
    variants: [
      {
        weight: { type: String, required: true },
        originalPrice: { type: Number, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, default: 25 },
      },
    ],
    // Batch & Expiry Traceability (FSSAI Mandatory)
    batchCode: {
      type: String,
      default: () => `BATCH-${new Date().toISOString().slice(0, 7).replace('-', '')}-A`,
      trim: true,
    },
    mfgDate: {
      type: String,
      default: () => getDefaultDates().mfg,
    },
    expiryDate: {
      type: String,
      default: () => getDefaultDates().exp,
    },
    // Indian FSSAI & Food Labelling Disclosures
    isNonVeg: { type: Boolean, default: true },
    ingredients: {
      type: String,
      default:
        'Fresh Boneless Chicken, Cold-Pressed Groundnut Oil, Guntur Red Chilli Powder, Garlic, Ginger, Turmeric, Fenugreek, Mustard Seeds, Curry Leaves, Lemon Juice, Iodized Salt.',
    },
    allergens: {
      type: String,
      default: 'Contains Mustard & Groundnut Oil. Processed in a kitchen that handles sesame and nuts.',
    },
    shelfLife: {
      type: String,
      default: '4 Months from Date of Manufacture (Refrigerate after opening)',
    },
    storageInstructions: {
      type: String,
      default: 'Store in a cool, dry place. Always use a clean, dry spoon. Keep oil layer above pickle pieces.',
    },
    fssaiNumber: {
      type: String,
      default: '23626000000000 (Applied / Registered Home Kitchen)',
    },
    nutritionalInfo: {
      type: String,
      default: 'Per 100g (Approx): Energy 340 kcal | Protein 18g | Total Fat 26g | Carbohydrates 8g | Sodium 920mg',
    },
    rating: { type: Number, default: 4.8 },
    numReviews: { type: Number, default: 12 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);