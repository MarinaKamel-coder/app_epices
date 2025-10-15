import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import * as services_epices from "./app/src/modules/services_epices.js";

const __fichier = fileURLToPath(import.meta.url);
const __dossier = path.dirname(__fichier);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dossier, "app/publique")));

// ======================
// Configuration de multer
// ======================
const dossierImages = path.resolve(__dossier, "app/publique/images/epices");
const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dossierImages),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage: stockage });

/* ======================
   ROUTES CRUD
   ====================== */

// --- GET toutes les épices ---
app.get("/epices", async (req, res) => {
  try {
    const data = await services_epices.getAll();
    res.json({ statut: true, donnees: data });
  } catch (err) {
    res.status(500).json({ statut: false, msg: err.message, donnees: [] });
  }
});

// --- POST ajouter une épice ---
app.post("/epices", upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };

    if (req.file) {
      
      body.image = "/images/epices/" + req.file.filename;
    } else if (req.body.imageUrl) {
      body.image = req.body.imageUrl.trim();
    }

    const created = await services_epices.create(body);
    res.json({
      statut: true,
      msg: "Épice ajoutée avec succès.",
      donnees: created,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ statut: false, msg: err.message });
  }
});

// --- PUT modifier une épice ---
app.put("/epices/:id", upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };

    if (req.file) {
      body.image = "/images/epices/" + req.file.filename;
    } else if (req.body.imageUrl) {
      body.image = req.body.imageUrl.trim();
    }

    const updated = await services_epices.update(req.params.id, body);
    res.json({
      statut: true,
      msg: "Épice modifiée avec succès.",
      donnees: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ statut: false, msg: err.message });
  }
});

// --- DELETE supprimer une épice ---
app.delete("/epices/:id", async (req, res) => {
  try {
    const removed = await services_epices.remove(req.params.id);
    res.json({
      statut: true,
      msg: "Épice supprimée avec succès.",
      donnees: removed,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ statut: false, msg: err.message });
  }
});

/* ======================
   GESTION DES ERREURS
   ====================== */

app.use((req, res) => {
  res.status(404).json({ statut: false, msg: "Route introuvable", donnees: [] });
});

app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err);
  res.status(500).json({ statut: false, msg: "Erreur serveur interne" });
});

app.listen(3000, () =>
  console.log("🚀 Serveur démarré sur http://localhost:3000")
);

