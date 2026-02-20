const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const Category = require("../../models/categoryModel");
const cloudinary = require("../../utils/cloudinary");

/**
 * @desc    Obtenir toutes les catégories
 * @route   GET /api/admin/categories
 * @access  Admin
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate("parent", "name")
    .sort({ displayOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    categories,
  });
});

/**
 * @desc    Créer une catégorie
 * @route   POST /api/admin/categories
 * @access  Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, featured } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Le nom de la catégorie est obligatoire");
  }

  const exists = await Category.findOne({ name: name.trim() });
  if (exists) {
    res.status(400);
    throw new Error("Une catégorie avec ce nom existe déjà");
  }

  let imageData;

  if (req.file) {
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "ecommerce/categories",
      resource_type: "image",
    });

    imageData = {
      url: upload.secure_url,
      public_id: upload.public_id,
      alt: name.trim(),
    };

    // 🔥 suppression du fichier local
    fs.unlinkSync(req.file.path);
  }

  const category = await Category.create({
    name: name.trim(),
    description,
    parent: parent && parent !== "null" && parent !== "" ? parent : null,
    featured: featured === true || featured === "true",
    image: imageData,
  });

  res.status(201).json({
    success: true,
    category,
  });
});

/**
 * @desc    Modifier une catégorie
 * @route   PUT /api/admin/categories/:id
 * @access  Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, featured, active } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Catégorie non trouvée");
  }

  if (name && name.trim()) category.name = name.trim();
  if (description !== undefined) category.description = description;

  category.parent =
    parent && parent !== "null" && parent !== "" ? parent : null;

  if (featured !== undefined) {
    category.featured = featured === true || featured === "true";
  }

  if (active !== undefined) {
    category.active = active === true || active === "true";
  }

  if (req.file) {
    // 🔥 supprimer l’ancienne image Cloudinary
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "ecommerce/categories",
      resource_type: "image",
    });

    category.image = {
      url: upload.secure_url,
      public_id: upload.public_id,
      alt: category.name,
    };

    // 🔥 suppression fichier local
    fs.unlinkSync(req.file.path);
  }

  const updatedCategory = await category.save();

  res.status(200).json({
    success: true,
    category: updatedCategory,
  });
});

/**
 * @desc    Supprimer une catégorie
 * @route   DELETE /api/admin/categories/:id
 * @access  Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Catégorie non trouvée");
  }

  const hasSub = await Category.findOne({ parent: category._id });
  if (hasSub) {
    res.status(400);
    throw new Error(
      "Impossible de supprimer : cette catégorie contient des sous-catégories"
    );
  }

  // 🔥 suppression image Cloudinary
  if (category.image?.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Catégorie supprimée avec succès",
  });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
