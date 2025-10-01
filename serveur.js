import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import * as services from "./app/serveur/services.js";

const PORT = process.env.PORT || 3000;
const __fichier = fileURLToPath(import.meta.url);
const __dossier = path.dirname(__fichier);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ----------------------
// Fichiers statiques
// ----------------------
app.use(express.static(path.join(__dossier, "app/publique")));
app.use("/images/epices", express.static(path.join(__dossier, "app/publique/images/epices")));

// ----------------------
// Multer pour upload images
// ----------------------
const stockage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dossier, "app/publique/images/epices")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage: stockage });

// ----------------------
// Routes API
// ----------------------
app.get("/epices", async (req, res) => {
  try {
    const data = await services.getAll();
    res.json({ statut: true, donnees: data });
  } catch (err) {
    res.status(500).json({ statut: false, msg: err.message, donnees: [] });
  }
});

app.post("/epices", upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.image = "/images/epices/" + req.file.filename;
    const created = await services.create(body);
    res.json({ statut: true, msg: "Épice ajoutée avec succès.", donnees: created });
  } catch (err) {
    res.status(500).json({ statut: false, msg: err.message });
  }
});

app.put("/epices/:id", upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.image = "/images/epices/" + req.file.filename;
    const updated = await services.update(req.params.id, body);
    res.json({ statut: true, msg: "Épice modifiée avec succès.", donnees: updated });
  } catch (err) {
    res.status(400).json({ statut: false, msg: err.message });
  }
});

app.delete("/epices/:id", async (req, res) => {
  try {
    const removed = await services.remove(req.params.id);
    res.json({ statut: true, msg: "Épice supprimée avec succès.", donnees: removed });
  } catch (err) {
    res.status(400).json({ statut: false, msg: err.message });
  }
});

// ----------------------
// SPA support : rediriger tout ce qui n'est pas /epices vers index.html
// ----------------------
app.get("*", (req, res) => {
  // Ignore les routes API
  if (req.path.startsWith("/epices")) return res.status(404).json({ statut: false, msg: "Route introuvable", donnees: [] });
  res.sendFile(path.join(__dossier, "app/publique/index.html"));
});

// ----------------------
// Gestion des erreurs
// ----------------------
app.use((err, req, res, next) => {
  console.error("Serveur erreur:", err);
  res.status(500).json({ statut: false, msg: "Erreur serveur", donnees: [] });
});

// ----------------------
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
