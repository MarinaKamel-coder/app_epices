export async function lire() {
  const r = await fetch("/epices");
  return r.json();
}

export async function ajouterFormData(fd) {
  const r = await fetch("/epices", { method: "POST", body: fd });
  return r.json();
}

export async function modifierFormData(id, fd) {
  const r = await fetch(`/epices/${id}`, { method: "PUT", body: fd });
  return r.json();
}

// If you want to send JSON for update (no file)
export async function modifier(id, jsonData) {
  const r = await fetch(`/epices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonData)
  });
  return r.json();
}

export async function supprimer(id) {
  const r = await fetch(`/epices/${id}`, { method: "DELETE" });
  return r.json();
}
