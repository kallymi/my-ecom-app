const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const Order = require('../../models/orderModel');
const Category = require('../../models/categoryModel');
const uploadToCloudinary = require("../../config/multerCloudinary");

/**
 * @desc    Liste des produits (ADMIN)
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
const getAdminProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  /* ===================== SEARCH ===================== */
  const keyword = req.query.keyword
    ? {
        name: { $regex: req.query.keyword, $options: "i" }
      }
    : {};

  /* ===================== STATUS FILTER ===================== */
  const status = req.query.status || "active";

  const statusFilter = {
    active: { isDeleted: false },
    deleted: { isDeleted: true },
    all: {}
  };

  const filter = {
    ...keyword,
    ...(statusFilter[status] || statusFilter.active)
  };

  /* ===================== QUERY ===================== */
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    success: true,
    products,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / pageSize),
      limit: pageSize
    }
  });
});




// @desc    Obtenir un produit par ID (admin)
// @route   GET /api/admin/products/:id
// @access  Private/Admin
const getProductByIdAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name");

  if (!product) {
    res.status(404);
    throw new Error("Produit non trouvé");
  }

  res.json({ success: true, product });
});



// @desc    Créer un produit
// @route   POST /api/admin/products
// @access  Private/Admin
/**
 * @desc    Créer un produit (ADMIN)
 * @route   POST /api/admin/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    category,
    stock,
    promotion,
    returnDelay,
    isActive,
  } = req.body;

  /* ===================== VALIDATION ===================== */
  if (!name || !price || !category) {
    res.status(400);
    throw new Error("Nom, prix et catégorie sont obligatoires");
  }

  if (!req.files?.mainImage?.[0]) {
    res.status(400);
    throw new Error("Une image principale est obligatoire");
  }

  /* ===================== IMAGES ===================== */
  const images = [];

  // Image principale
  const main = req.files.mainImage[0];
  images.push({
    url: main.path,        // Cloudinary secure_url
    public_id: main.filename,
    isMain: true,
    alt: name,
  });

  // Galerie
  if (req.files.galleryImages?.length) {
    for (const file of req.files.galleryImages) {
      images.push({
        url: file.path,
        public_id: file.filename,
        isMain: false,
        alt: name,
      });
    }
  }

  /* ===================== PROMOTION ===================== */
  let parsedPromotion = { isActive: false };

  if (promotion) {
    try {
      parsedPromotion =
        typeof promotion === "string" ? JSON.parse(promotion) : promotion;
    } catch {
      parsedPromotion = { isActive: false };
    }
  }

  /* ===================== CREATION ===================== */
  const product = await Product.create({
    name: name.trim(),
    price: Number(price),
    description,
    category,
    stock: Number(stock) || 0,
    images,
    isActive: isActive !== undefined ? isActive : true,
    promotion: parsedPromotion,
    returnDelay: Number(returnDelay) || 7,
  });

  const populated = await Product.findById(product._id).populate(
    "category",
    "name"
  );

  res.status(201).json({
    success: true,
    product: populated,
  });
});

// @desc    Supprimer définitivement un produit (Vider la corbeille)
// @route   DELETE /api/admin/products/:id/permanent
// @access  Private/Admin
const permanentDeleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  // Nettoyage Cloudinary
  for (const img of product.images) {
    if (img.public_id) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.error("Erreur suppression Cloudinary:", err);
      }
    }
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Produit et images supprimés définitivement"
  });
});


// @desc    Liste simple des produits supprimés
// @route   GET /api/admin/products/trash
// @access  Private/Admin
const getAdminTrash = asyncHandler(async (req, res) => {
  const products = await Product.find({ isDeleted: true })
    .populate("category", "name")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    products
  });
});

// @desc    Mettre à jour un produit (ADMIN)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product || product.isDeleted) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  /* ===================== CHAMPS DE BASE ===================== */
  product.name = req.body.name ?? product.name;
  product.price = req.body.price ?? product.price;
  product.description = req.body.description ?? product.description;
  product.category = req.body.category ?? product.category;
  product.stock = req.body.stock ?? product.stock;
  product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;

  /* ===================== PROMOTION ===================== */
  if (req.body.promotion) {
    const promo = typeof req.body.promotion === 'string' 
      ? JSON.parse(req.body.promotion) 
      : req.body.promotion;
      
    product.promotion = {
      isActive: promo.isActive,
      type: promo.type,
      value: promo.value,
      startDate: promo.startDate ? new Date(promo.startDate) : null,
      endDate: promo.endDate ? new Date(promo.endDate) : null
    };
  }

  /* ===================== GESTION DES IMAGES ===================== */
  // On récupère la liste des images que l'admin a décidé de GARDER
  // Le frontend doit envoyer un tableau JSON des images à conserver
  let keptImages = [];
  if (req.body.existingImages) {
    keptImages = JSON.parse(req.body.existingImages);
  } else {
    // Si rien n'est envoyé, on garde tout par sécurité ou on vide tout selon ton choix
    keptImages = product.images; 
  }

  // LOGIQUE DE SUPPRESSION CLOUDINARY : 
  // On compare les images en base avec celles envoyées par le frontend
  const imagesToDelete = product.images.filter(
    (oldImg) => !keptImages.find((k) => k.public_id === oldImg.public_id)
  );

  for (const img of imagesToDelete) {
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }

  // On repart de la base des images conservées
  let updatedImages = [...keptImages];

  /* --- NOUVELLE IMAGE PRINCIPALE --- */
  if (req.files?.mainImage?.[0]) {
    // Si on télécharge une nouvelle main image, on rétrograde l'ancienne
    updatedImages = updatedImages.map(img => ({ ...img, isMain: false }));

    const main = req.files.mainImage[0];
    updatedImages.unshift({
      url: main.path,
      public_id: main.filename,
      isMain: true,
      alt: product.name,
    });
  }

  /* --- NOUVELLES IMAGES GALERIE --- */
  if (req.files?.galleryImages?.length) {
    for (const file of req.files.galleryImages) {
      updatedImages.push({
        url: file.path,
        public_id: file.filename,
        isMain: false,
        alt: product.name,
      });
    }
  }

  // Sécurité : s'assurer qu'il y a toujours au moins une image "isMain"
  if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
    updatedImages[0].isMain = true;
  }

  product.images = updatedImages;

  /* ===================== SAUVEGARDE ===================== */
  await product.save();
  await product.populate("category", "name");

  res.json({
    success: true,
    product,
  });
});


// @desc    Obtenir toutes les commandes
// @route   DELETE /api/admin/product
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  product.isDeleted = true;
  await product.save();

  res.json({
    success: true,
    message: "Produit supprimé définitivement",
  });
});


// @desc    Obtenir toutes les commandes
// @route   Restore /api/admin/product
// @access  Private/Admin

const restoreProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  if (!product.isDeleted) {
    res.status(400);
    throw new Error("Le produit n’est pas supprimé");
  }

  product.isDeleted = false;

  await product.save();
  await product.populate("category", "name");

  res.status(200).json({
    success: true,
    product
  });
});

// @desc    Ajouter une promotion à un produit
// @route   POST /api/admin/products/:id/promotion
// @access  Private/Admin
const addPromotionToProduct = asyncHandler(async (req, res) => {
  const { type, value, startDate, endDate } = req.body;

  if (!type || value <= 0) {
    res.status(400);
    throw new Error("Promotion invalide");
  }

  const product = await Product.findById(req.params.id);

  if (!product || product.isDeleted) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  product.promotion = {
    isActive: true,
    type,
    value,
    startDate: startDate || null,
    endDate: endDate || null
  };

  await product.save();

  res.status(200).json({
    success: true,
    promotion: product.promotion,
    finalPrice: product.finalPrice
  });
});


// @desc    Supprimer une promotion
// @route   DELETE /api/admin/products/:id/promotion
// @access  Private/Admin
const removePromotionFromProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product || product.isDeleted) {
    return res.status(404).json({
      success: false,
      message: "Produit introuvable"
    });
  }

  product.promotion = null;
  await product.save();

  res.json({
    success: true,
    message: "Promotion supprimée"
  });
};

// @desc    Mettre à jour une promotion
// @route   PUT /api/admin/products/:id/promotion
// @access  Private/Admin
const updatePromotionOnProduct = asyncHandler(async (req, res) => {
  const { type, value, startDate, endDate, isActive } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product || product.isDeleted) {
    return res.status(404).json({
      success: false,
      message: "Produit introuvable"
    });
  }

  if (!product.promotion) {
    return res.status(400).json({
      success: false,
      message: "Aucune promotion à mettre à jour"
    });
  }

  // Mise à jour seulement des champs envoyés
  product.promotion.type = type ?? product.promotion.type;
  product.promotion.value = value ?? product.promotion.value;
  product.promotion.startDate = startDate ?? product.promotion.startDate;
  product.promotion.endDate = endDate ?? product.promotion.endDate;
  product.promotion.isActive = isActive !== undefined ? isActive : product.promotion.isActive;

  await product.save();

  res.json({
    success: true,
    message: "Promotion mise à jour",
    promotion: product.promotion
  });
});



module.exports = {
    getAdminProducts,
    getAdminTrash,
    getProductByIdAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    permanentDeleteProduct,
    addPromotionToProduct,
    removePromotionFromProduct,
    updatePromotionOnProduct
}