const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  discountType: { 
    type: String, 
    enum: ['PERCENT', 'FIXED'], 
    default: 'PERCENT' 
  },
  discountValue: { 
    type: Number, 
    required: true 
  },
  minOrderAmount: { 
    type: Number, 
    default: 0 
  },
  expirationDate: { 
    type: Date, 
    required: true 
  },
  usageLimit: { 
    type: Number, 
    default: null // null = illimité
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);