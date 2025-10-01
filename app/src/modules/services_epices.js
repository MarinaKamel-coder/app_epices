import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __fichier = fileURLToPath(import.meta.url);
const __dossier = path.dirname(__fichier);

const DATA_PATH = path.join(__dossier, "../../donnees/epices.json");

async function readFile() {
  const txt = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(txt);
}
async function writeFile(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}
function nextId(list) {
  const ids = list.map(e => Number(e.id)).filter(n => !isNaN(n));
  return ids.length ? String(Math.max(...ids) + 1) : "1";
}

export async function getAll() {
  return await readFile();
}
export async function create(epice) {
  const list = await readFile();
  const id = nextId(list);
  const newItem = { ...epice, id };
  list.push(newItem);
  await writeFile(list);
  return newItem;
}
export async function update(id, epice) {
  const list = await readFile();
  const idx = list.findIndex(e => String(e.id) === String(id));
  if (idx === -1) throw new Error("Épice introuvable");
  list[idx] = { ...list[idx], ...epice, id: String(id) };
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
