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
const csrfRoutes = require("./routes/csrfRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------
// TRUST PROXY (OBLIGATOIRE EN PROD)
// --------------------------
app.set("trust proxy", 1);

// --------------------------
// HELMET (SECURITE + OAUTH)
// --------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// --------------------------
// CORS CONFIG (ROBUSTE)
// --------------------------
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  "https://cheel-shop.com",
  "https://www.cheel-shop.com",
  "https://admin.cheel-shop.com",
].filter(Boolean));


app.use(
  cors({
    origin: (origin, callback) => {
      // Autorise les requêtes sans origine (comme les apps mobiles ou Postman)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      // Vérifie si l'origine est dans ton Set
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      } else {
        // Log précis pour savoir quelle URL est bloquée exactement
        console.warn("⚠️ CORS bloqué pour l'origine:", origin);
        return callback(new Error("Non autorisé par CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-csrf-token"],
  })
);

// Headers complémentaires (évite bugs CDN + cookies)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Vary", "Origin");
  next();
});

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, x-csrf-token"
  );
  next();
});

// --------------------------
// COOKIE PARSER
// --------------------------
app.use(cookieParser());

// --------------------------
// BODY PARSER
// --------------------------
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// --------------------------
// SERVEUR HTTP + SOCKET.IO
// --------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: Array.from(allowedOrigins),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

// --------------------------
// SOCKET LOGIC
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

// Injection io dans req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --------------------------
// STATIC FILES
// --------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------
// MONGODB CONNECTION
// --------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté !");
    // startRevenueTask();
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// --------------------------
// RATE LIMIT (AUTH)
// --------------------------
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Trop de tentatives. Réessayez plus tard.",
  },
});

// --------------------------
// ROUTES API
// --------------------------
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", csrfRoutes);
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
// START SERVER
// --------------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});