const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    /* ======================
       VÉRIFICATION EMAIL / OTP
    ====================== */
    isVerified: {
      type: Boolean,
      default: false
    },

    otp: {
      type: String,
      select: false
    },

    otpExpiresAt: {
      type: Date
    },

    /* ======================
       INFOS UTILISATEUR
    ====================== */
    phone: {
      type: String
    },

    neighborhood: {
      type: String
    },

    avatar: {
      type: String,
      default: '/uploads/avatars/default.png'
    },

    /* ======================
       RÔLES & STATUT
       🔁 customer → user
    ====================== */
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/* ======================
   HASH PASSWORD
====================== */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ======================
   COMPARE PASSWORD
====================== */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ======================
   EXPORT SAFE
====================== */
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
