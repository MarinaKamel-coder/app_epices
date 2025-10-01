import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __fichier = fileURLToPath(import.meta.url);
const __dossier = path.dirname(__fichier);
const dataFile = path.join(__dossier, "../donnees/epices.json");

async function readFile() {
  try {
    const txt = await fs.readFile(dataFile, "utf8");
    return JSON.parse(txt);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}
async function writeFile(data) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}
function nextId(list) {
  const ids = list.map(i => Number(i.id)).filter(n => !isNaN(n));
  return ids.length ? Math.max(...ids) + 1 : 1;
}

export async function getAll() {
  return await readFile();
}

export async function create(epice) {
  const list = await readFile();
  const id = nextId(list);
  // Normalize fields and image
  const item = {
    id,
    nom: epice.nom || "",
    type: epice.type || "",
    origine: epice.origine || "",
    prix: epice.prix !== undefined ? parseFloat(epice.prix) : 0,
    vendeur: epice.vendeur || "",
    stock: epice.stock !== undefined ? parseInt(epice.stock) : 0,
    description: epice.description || "",
    image: epice.image || epice.imageUrl || "/images/epices/default.jpg"
  };
  list.push(item);
  await writeFile(list);
  return item;
}

export async function update(id, epice) {
  const list = await readFile();
  const idx = list.findIndex(e => String(e.id) === String(id));
  if (idx === -1) throw new Error("Épice introuvable");
  list[idx] = {
    ...list[idx],
    nom: epice.nom ?? list[idx].nom,
    type: epice.type ?? list[idx].type,
    origine: epice.origine ?? list[idx].origine,
    prix: epice.prix !== undefined ? parseFloat(epice.prix) : list[idx].prix,
    vendeur: epice.vendeur ?? list[idx].vendeur,
    stock: epice.stock !== undefined ? parseInt(epice.stock) : list[idx].stock,
    description: epice.description ?? list[idx].description,
    image: epice.image || epice.imageUrl || list[idx].image || "/images/epices/default.jpg"
  };
  await writeFile(list);
  return list[idx];
}

export async function remove(id) {
  const list = await readFile();
  const idx = list.findIndex(e => String(e.id) === String(id));
  if (idx === -1) throw new Error("Épice introuvable");
  const removed = list.splice(idx, 1)[0];
  await writeFile(list);
  return removed;
}
