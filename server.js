const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/carta", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "carta.html"));
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
