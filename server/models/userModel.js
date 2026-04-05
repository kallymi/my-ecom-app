const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"]
      // Note: unique: true est géré par l'index personnalisé en bas
    },
    password: {
      type: String,
      minlength: [6, "Le mot de passe doit faire au moins 6 caractères"],
      select: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String,
      select: true 
    },
    otpExpiresAt: Date,
    otpVerified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    neighborhood: {
      type: String,
      trim: true,
      default: ""
    },
    avatar: {
      type: String,
      default: '/uploads/avatars/default.png'
    },
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
    deletedAt: Date,
    lastActive: {
      type: Date,
      default: Date.now
    },
    passwordChangedAt: Date,
    refreshTokens: {
      type: [String],
      select: false,
      default: []
    }
  },
  { timestamps: true }
);

/* ===========================
   INDEX (Sécurité & Performance)
=========================== */
// On crée un index unique sur l'email, mais uniquement pour ceux non supprimés
userSchema.index(
  { email: 1 }, 
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

/* ===========================
   MIDDLEWARES (Version Full Async)
=========================== */

// 1. Hash password - Approche Moderne sans next()
userSchema.pre('save', async function () {
  // Si le mot de passe n'est pas modifié, on quitte
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Mise à jour de la date de changement (sauf si c'est une création)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

// 2. Exclure les supprimés - Approche Query sans next()
userSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

/* ===========================
   MÉTHODES
=========================== */

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);