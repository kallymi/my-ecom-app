// productController.js
const Product = require('../models/productModel');
const { calculateFinalPrice } = require('../utils/promotion');

// Base filter commun à toutes les requêtes
const BASE_FILTER = { isDeleted: false, isActive: true };

// -------------------- GET ALL PRODUCTS --------------------
const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { ...BASE_FILTER };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.inStock === 'true') filter.inStock = true;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 }
    };
    const sort = sortMap[req.query.sort] || { createdAt: -1 };

    let products = await Product.find(filter)
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("name price images category inStock promotion createdAt");

    // Calcul du prix final pour chaque produit
    products = products.map(product => {
      const { finalPrice, discount, hasPromotion, promotion } = calculateFinalPrice(product.price, product.promotion);
      return {
        ...product.toObject(),
        finalPrice,
        discount,
        hasPromotion,
        promotion: hasPromotion ? promotion : null
      };
    });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des produits"
    });
  }
};

// -------------------- GET PRODUCT BY ID --------------------
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false })
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    const { finalPrice, discount, hasPromotion, promotion } = calculateFinalPrice(product.price, product.promotion);

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        finalPrice,
        discount,
        hasPromotion,
        promotion: hasPromotion ? promotion : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération du produit" });
  }
};

// -------------------- GET PRODUCTS BY CATEGORY --------------------
const getProductsByCategory = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let products = await Product.find({ ...BASE_FILTER, category: req.params.category })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name price images category inStock promotion createdAt");

    products = products.map(product => {
      const { finalPrice, discount, hasPromotion, promotion } = calculateFinalPrice(product.price, product.promotion);
      return {
        ...product.toObject(),
        finalPrice,
        discount,
        hasPromotion,
        promotion: hasPromotion ? promotion : null
      };
    });

    const total = await Product.countDocuments({ ...BASE_FILTER, category: req.params.category });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur récupération catégorie" });
  }
};

// -------------------- SEARCH PRODUCTS --------------------
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Terme de recherche requis" });
    }

    let products = await Product.find({
      ...BASE_FILTER,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ]
    })
      .limit(12)
      .select("name price images inStock promotion");

    products = products.map(product => {
      const { finalPrice, discount, hasPromotion, promotion } = calculateFinalPrice(product.price, product.promotion);
      return {
        ...product.toObject(),
        finalPrice,
        discount,
        hasPromotion,
        promotion: hasPromotion ? promotion : null
      };
    });

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur recherche" });
  }
};

// -------------------- FEATURED PRODUCTS --------------------
const getFeaturedProducts = async (req, res) => {
  try {
    let products = await Product.find({ ...BASE_FILTER, featured: true })
      .limit(8)
      .select("name price images promotion");

    products = products.map(product => {
      const { finalPrice, discount, hasPromotion, promotion } = calculateFinalPrice(product.price, product.promotion);
      return {
        ...product.toObject(),
        finalPrice,
        discount,
        hasPromotion,
        promotion: hasPromotion ? promotion : null
      };
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// -------------------- NEW ARRIVALS --------------------
const getNewArrivals = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    let products = await Product.find({ ...BASE_FILTER, createdAt: { $gte: since } })
      .limit(8)
      .select("name price images promotion");

    products = products.map(product => {
      const { finalPrice, discount, hasPromotion, promotion } = calculateFinalPrice(product.price, product.promotion);
      return {
        ...product.toObject(),
        finalPrice,
        discount,
        hasPromotion,
        promotion: hasPromotion ? promotion : null
      };
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals
};
