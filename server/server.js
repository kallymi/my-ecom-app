// server.js
require("dotenv").config(); // Charger .env en premier

const dns = require("dns");

// Forcer des DNS qui supportent SRV (MongoDB Atlas)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const http = require("http");
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
const reviewRoutes = require("./routes/reviewRoutes")

// --------------------------
// APP & PORT
// --------------------------
const app = express();
const PORT = process.env.PORT || 5000;

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
  console.log(`🔌 Nouveau client connecté: ${socket.id} (Total: ${connectedUsers.size})`);
  io.emit("user_count_update", connectedUsers.size);

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    console.log(`❌ Client déconnecté (Restant: ${connectedUsers.size})`);
    io.emit("user_count_update", connectedUsers.size);
  });
});

// --------------------------
// MIDDLEWARES GLOBAUX
// --------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------
// CONNEXION MONGODB
// --------------------------

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log("✅ MongoDB connecté avec succès !");
})
.catch((err) => {
  console.error("❌ Erreur MongoDB:", err.message);
  process.exit(1);
});

// --------------------------
// INJECTION SOCKET.IO DANS LES REQUÊTES
// --------------------------
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --------------------------
// ROUTES API
// --------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

//temporaire
app.use("/api/dev", require("./routes/devRoutes"));
//temporaire

// --------------------------
// ERROR HANDLING (optionnel)
// --------------------------
app.use((req, res, next) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// --------------------------
// LANCEMENT SERVEUR
// --------------------------
server.listen(PORT, () => {
  console.log(`🚀 Serveur temps réel démarré sur le port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
