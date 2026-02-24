// server.js
require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const http = require("http");
const helmet = require("helmet"); // Sécurité des headers
const rateLimit = require("express-rate-limit"); // Anti-brute force
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const { Server } = require("socket.io");

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

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------
// CONFIGURATION SÉCURITÉ (HELMET & RATE LIMIT)
// --------------------------

// 1. Helmet : Protège contre les vulnérabilités HTTP courantes
// On configure crossOriginResourcePolicy pour permettre l'affichage des images /uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Trust Proxy : Indispensable si tu es derrière un proxy (Render, Heroku, Nginx)
app.set('trust proxy', 1);

// 3. Rate Limiter : Limite les tentatives sur l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Autorise 10 requêtes (plus souple pour tes tests)
  message: { message: "Trop de tentatives, réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

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
      "http://172.16.29.19:3000",
      "http://172.16.29.19:5173",
      "http://172.16.29.19:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

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
// MIDDLEWARES GLOBAUX
// --------------------------
app.use(express.json({ limit: '10kb' })); // Protection contre les payloads trop lourds
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://172.16.29.19:3000",
      "http://172.16.29.19:5173",
      "http://172.16.29.19:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------
// CONNEXION MONGODB
// --------------------------
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connecté !"))
.catch((err) => {
  console.error("❌ Erreur MongoDB:", err.message);
  process.exit(1);
});

// Injection Socket.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --------------------------
// ROUTES API
// --------------------------

// On applique le limiteur uniquement sur l'auth pour protéger le serveur
app.use("/api/auth", authLimiter, authRoutes); 

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dev", require("./routes/devRoutes"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// --------------------------
// LANCEMENT SERVEUR
// --------------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});