const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    /* =========================
       INFORMATIONS DE BASE
    ========================= */
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
    },

    password: {
      type: String,
      minlength: [6, "Le mot de passe doit faire au moins 6 caractères"],
      select: false
    },

    /* =========================
       AUTH PROVIDERS
    ========================= */
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local"
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    facebookId: {
      type: String,
      unique: true,
      sparse: true
    },

    /* =========================
       VERIFICATION & OTP
    ========================= */
    isVerified: {
      type: Boolean,
      default: false
    },

    otp: {
      type: String,
      select: false
    },

    otpExpiresAt: Date,

    /* =========================
       INFORMATIONS UTILISATEUR
    ========================= */
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

    /* =========================
       ETAT DU COMPTE
    ========================= */
    isBlocked: {
      type: Boolean,
      default: false
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: Date,

    /* =========================
       ACTIVITE & SECURITE
    ========================= */
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
   INDEX (Performance & Sécurité)
=========================== */

// Un seul compte par email (sauf supprimé)
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

/* ===========================
   MIDDLEWARES
=========================== */

// Hash du mot de passe
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

// Exclure automatiquement les comptes supprimés
userSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

/* ===========================
   MÉTHODES
=========================== */

// Comparaison mot de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si le mot de passe a changé après le token
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Mettre à jour l'activité utilisateur
userSchema.methods.updateLastActive = async function () {
  this.lastActive = new Date();
  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);