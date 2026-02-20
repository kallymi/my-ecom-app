const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    votes: {
      type: Number,
      default: 0
    },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  images: [{
    url: String,
    public_id: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatorNotes: String
}, {
  timestamps: true
});

// Index composite pour s'assurer qu'un utilisateur ne peut review qu'une fois par produit
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Index pour les recherches
reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// Middleware pour mettre à jour la note moyenne du produit
reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');

  const stats = await this.constructor.aggregate([
    { $match: { product: this.product, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      averageRating: Number(stats[0].avgRating.toFixed(1)),
      numReviews: stats[0].count
    });
  } else {
    await Product.findByIdAndUpdate(this.product, {
      averageRating: 0,
      numReviews: 0
    });
  }
});

// Méthode pour voter comme utile
reviewSchema.methods.markHelpful = async function(userId) {
  if (!this.helpful.voters.includes(userId)) {
    this.helpful.votes += 1;
    this.helpful.voters.push(userId);
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('Review', reviewSchema);