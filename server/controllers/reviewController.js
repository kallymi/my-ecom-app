const Review = require('../models/reviewModel');
const Order = require('../models/orderModel'); // Pour vérifier l'achat

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user._id; // Supposant que tu as un middleware d'auth

    // 1. Vérifier si l'utilisateur a déjà acheté ce produit
    const hasOrdered = await Order.findOne({
      user: userId,
      'orderItems.product': productId,
      status: 'delivered' // On ne peut noter que si c'est livré
    });

    // 2. Créer l'avis
    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      title,
      comment,
      verifiedPurchase: !!hasOrdered,
      status: 'approved' // On peut le mettre en 'pending' si tu veux modérer
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Vous avez déjà donné votre avis sur ce produit." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId, 
      status: 'approved' 
    }).populate('user', 'name'); // Récupère juste le nom de l'utilisateur

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};