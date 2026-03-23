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
      unique: true,
      lowercase: true,
      trim: true,
      index: true // ⚡ Accélère les recherches au login
    },

    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: [6, "Le mot de passe doit faire au moins 6 caractères"],
      select: false // 🛡️ Ne jamais retourner le password par défaut
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    otp: {
      type: String,
      select: false // 🛡️ Cache l'OTP des résultats de requêtes classiques
    },

    otpExpiresAt: {
      type: Date
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

    lastActive: {
      type: Date,
      default: Date.now
    },
    
    passwordChangedAt: Date
  },
  { 
    timestamps: true // Crée automatiquement createdAt et updatedAt
  }
);

/* ==========================================================
   MIDDLEWARES (HOOKS)
========================================================== */

// Hachage du mot de passe avant sauvegarde
userSchema.pre('save', async function () {
  // 1. Si le mot de passe n'est pas modifié, on sort directement
  // Pas besoin de next(), le 'return' suffit car la fonction est async
  if (!this.isModified('password')) return;

  // 2. Hachage avec un coût (salt) de 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // 3. Mise à jour de la date de modification
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; 
  }
  
});

/* ==========================================================
   MÉTHODES DE MODÈLE
========================================================== */

// Comparaison sécurisée des mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  // 'this.password' est accessible car on l'aura 'select' manuellement dans le controller
  return await bcrypt.compare(candidatePassword, this.password);
};

/* ==========================================================
   EXPORT
========================================================== */
module.exports = mongoose.models.User || mongoose.model('User', userSchema);