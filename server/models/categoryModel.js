const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la catégorie est obligatoire'],
      unique: true,
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    description: {
      type: String,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      url: String,
      public_id: String,
      alt: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour optimiser les recherches
categorySchema.index({ parent: 1 });
categorySchema.index({ featured: 1, displayOrder: 1 });

// Middleware pour générer le slug avant sauvegarde
categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
});


// Virtual pour les sous-catégories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Virtual pour les produits de cette catégorie
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
});

// Méthode pour obtenir l'arborescence complète
categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ active: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  const buildTree = (parentId = null) =>
    categories
      .filter((cat) =>
        (parentId === null && !cat.parent) ||
        (cat.parent && cat.parent.toString() === parentId.toString())
      )
      .map((cat) => ({
        ...cat,
        subcategories: buildTree(cat._id),
      }));

  return buildTree();
};

// Méthode pour compter les produits par catégorie
categorySchema.statics.getProductCounts = async function () {
  const Product = mongoose.model('Product');
  const categories = await this.find({ active: true });

  const counts = await Promise.all(
    categories.map(async (category) => {
      const count = await Product.countDocuments({
        category: category._id,
        active: true,
      });
      return {
        category: category.name,
        count,
      };
    })
  );

  return counts;
};

module.exports = mongoose.model('Category', categorySchema);
