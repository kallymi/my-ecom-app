const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// Créer une nouvelle catégorie
exports.createCategory = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Le nom de la catégorie est obligatoire' });
    }

    const newCategory = new Category(req.body);
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: newCategory
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Obtenir toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtenir une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
  }
};

// Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });

    res.status(200).json({ success: true, message: 'Catégorie mise à jour avec succès', data: updatedCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });

    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${productCount} produit(s) associé(s) à cette catégorie`
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtenir l'arborescence des catégories
exports.getCategoryTree = async (req, res) => {
  try {
    const categoryTree = await Category.getCategoryTree();
    res.status(200).json({ success: true, data: categoryTree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtenir le nombre de produits par catégorie
exports.getCategoryProductCounts = async (req, res) => {
  try {
    const productCounts = await Category.getProductCounts();
    res.status(200).json({ success: true, data: productCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
