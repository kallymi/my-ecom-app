// server.js
require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const { Server } = require("socket.io");
const session = require("express-session");



// --------------------------
// ROUTES
// --------------------------
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const startRevenueTask = require("./jobs/revenueJob");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------
// MIDDLEWARES GLOBAUX (L'ORDRE EST CRITIQUE)
// --------------------------

// 1. CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.CLIENT_URL,
        process.env.ADMIN_URL,
        "https://cheel-shop.com",
        "https://www.cheel-shop.com",
        "https://myadmin.cheel-shop.com"
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Indispensable pour que le serveur accepte le cookie
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"] // "Authorization" retiré pour forcer l'usage du cookie
  })
);

// 2. Cookie Parser (Déchiffre les cookies AVANT tout traitement de route)
app.use(cookieParser());

// 3. Helmet & Sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.set("trust proxy", 1);

// --------------------------
// SERVEUR HTTP + SOCKET.IO
// --------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL, // URL de ton site client sur Dokploy
      process.env.ADMIN_URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

// 4. Body Parsers (Lecture des requêtes)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// --------------------------
// LOGIQUE TEMPS RÉEL
// --------------------------
let connectedUsers = new Set();
io.on("connection", (socket) => {
  connectedUsers.add(socket.id);
  console.log(`🔌 Client connecté: ${socket.id} (Total: ${connectedUsers.size})`);
  io.emit("user_count_update", connectedUsers.size);

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    io.emit("user_count_update", connectedUsers.size);
  });
});

// --------------------------
// INJECTION SOCKET.IO
// --------------------------
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --------------------------
// FICHIERS STATIQUES
// --------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------
// CONNEXION MONGODB
// --------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté !");
    // startRevenueTask();
  })
  .catch((err) => {
    console.error("❌ Erreur MongoDB:", err.message);
    process.exit(1);
  });

// --------------------------
// LIMITATION DE DÉBIT (AUTH SEULEMENT)
// --------------------------
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // 50 tentatives
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Trop de tentatives. Réessayez plus tard."
  }
});

// --------------------------
// ROUTES API
// --------------------------
// app.use("/api/auth/login", authLimiter);
// app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authLimiter, authRoutes);
// app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

// --------------------------
// 404 HANDLER
// --------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// --------------------------
// LANCEMENT SERVEUR
// --------------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 Accessible sur le réseau à : http://votre-ip-locale:${PORT}`);
});