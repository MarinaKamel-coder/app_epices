

import * as requetes from "../requetes/requetes_epices.js";

const listeEpices = document.getElementById("listeEpices");
const formEpice = document.getElementById("formEpice");
const modal = new bootstrap.Modal(document.getElementById("modalEpice"));
const toastEl = document.getElementById("toast");
const toast = new bootstrap.Toast(toastEl);

let epices = [];

// ==========================
// Sécurité texte
// ==========================
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

// ==========================
// Charger données
// ==========================
async function charger() {
  try {
    const res = await requetes.lire();
    if (res.statut) {
      epices = res.donnees;
      afficher(epices);
    } else {
      console.error("Erreur API:", res);
    }
  } catch (err) {
    console.error("Erreur réseau:", err);
  }
}
charger();

// ==========================
// Afficher liste d'épices
// ==========================
function afficher(data) {
  listeEpices.innerHTML = ""; 

  data.forEach(e => {
    const stock = Number(e.stock) || 0;

    const col = document.createElement("div");
    col.className = "col-md-4";

    col.innerHTML = `
      <div class="card card-epice h-100 shadow-sm position-relative overflow-hidden">
        <div class="position-relative">
          <img src="${escapeHtml(e.image)}" class="card-img-top" style="height:220px;object-fit:cover;">

          <!-- Bandeau haut -->
          <div class="overlay-top d-flex justify-content-between align-items-center px-2">
            <span class="badge badge-prix fw-bold">${escapeHtml(e.prix)} $ CAD</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-light btn-action btn-modifier" title="Modifier">
                <i class="bi bi-pencil-square text-primary"></i>
              </button>
              <button class="btn btn-sm btn-light btn-action btn-supprimer" title="Supprimer">
                <i class="bi bi-trash text-danger"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="card-body">
          <h5 class="fw-bold">${escapeHtml(e.nom)}</h5>
          <p class="text-muted">${escapeHtml(e.description)}</p>
        </div>

        <!-- Bandeau bas : stock -->
        <div class="overlay-bottom text-center py-2">
          <span class="badge ${
            stock === 0
              ? "bg-danger"
              : stock <= 5
              ? "bg-warning text-dark fw-bold"
              : "bg-success"
          }">
            <i class="bi ${
              stock === 0
                ? "bi-exclamation-triangle-fill"
                : stock <= 5
                ? "bi-exclamation-circle-fill"
                : "bi-box-seam"
            } me-1"></i>
            ${
              stock === 0
                ? "Rupture de stock"
                : stock <= 5
                ? "Stock faible : " + stock
                : "Stock : " + stock
            }
          </span>
        </div>
      </div>
    `;

    // Ajouter les événements des boutons
    col.querySelector(".btn-modifier").addEventListener("click", () => modifier(e.id));
    col.querySelector(".btn-supprimer").addEventListener("click", () => supprimer(e.id));

    listeEpices.appendChild(col);
  });

  // Remonter en haut
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================
// Ajouter / Modifier
// ==========================
formEpice.onsubmit = async (evt) => {
  evt.preventDefault();
  const id = document.getElementById("epiceId").value;
  const fileInput = document.getElementById("image");
  const formData = new FormData();

  // Champs texte
  ["nom","type","origine","prix","vendeur","stock","description"].forEach(name => {
    const el = document.getElementById(name);
    if (el && el.value !== undefined) formData.append(name, el.value);
  });

  // fichier image
  if (fileInput && fileInput.files.length > 0) {
    formData.append("image", fileInput.files[0]);
  }

  try {
    let res;
    if (id) {
      // modification
      if (!fileInput || fileInput.files.length === 0) {
        const obj = {};
        ["nom","type","origine","prix","vendeur","stock","description"].forEach(name => {
          obj[name] = document.getElementById(name).value;
        });
        res = await requetes.modifier(id, obj);
      } else {
        res = await requetes.modifierFormData(id, formData);
      }
    } else {
      // ajout
      res = await requetes.ajouterFormData(formData);
    }

    if (res.statut) {
      toastEl.textContent = res.msg;
      toast.show();
      modal.hide();
      setTimeout(() => charger(), 200);
    } else {
      toastEl.textContent = res.msg || "Erreur";
      toast.show();
    }
  } catch (err) {
    toastEl.textContent = "Erreur réseau ou serveur";
    toast.show();
    console.error(err);
  }
};

// ==========================
// Modifier / Supprimer
// ==========================
window.modifier = (id) => {
  const e = epices.find(x => String(x.id) === String(id));
  if (!e) return;
  formEpice.reset();
  document.getElementById("epiceId").value = e.id;
  ["nom","type","origine","prix","vendeur","stock","description"].forEach(name => {
    document.getElementById(name).value = e[name] || "";
  });
  modal.show();
};

window.supprimer = async (id) => {
  try {
    const res = await requetes.supprimer(id);
    if (res.statut) {
      toastEl.textContent = res.msg;
      toast.show();
      charger();
    } else {
      toastEl.textContent = res.msg || "Erreur suppression";
      toast.show();
    }
  } catch (err) {
    toastEl.textContent = "Erreur réseau ou serveur";
    toast.show();
    console.error(err);
  }
};

// ==========================
// Bouton Ajouter
// ==========================
document.getElementById("btnAjouter").onclick = () => {
  formEpice.reset();
  document.getElementById("epiceId").value = "";
  modal.show();
};

// ==========================
// Recherche + Filtre + Tri
// ==========================
function appliquerFiltresTri() {
  // clone le tableau pour ne pas modifier l'original
  let resultat = epices.map(e => ({ ...e, stock: Number(e.stock) || 0 }));

  // ----------------------
  // Recherche texte
  // ----------------------
  const texte = (document.getElementById("recherche").value || "").toLowerCase();
  if (texte) {
    resultat = resultat.filter(e =>
      (e.nom || "").toLowerCase().includes(texte) ||
      (e.origine || "").toLowerCase().includes(texte) ||
      (e.type || "").toLowerCase().includes(texte) ||
      (e.vendeur || "").toLowerCase().includes(texte)
    );
  }

  // ----------------------
  // Filtre
  // ----------------------
  const filtre = document.getElementById("filtre").value;
  if (filtre === "dispo") {
    resultat = resultat.filter(e => e.stock > 0);
  } else if (filtre === "rupture") {
    resultat = resultat.filter(e => e.stock === 0);
  } else if (filtre && filtre !== "all-origines" && filtre !== "all-types") {
    resultat = resultat.filter(e => e.origine === filtre || e.type === filtre);
  }

  // ----------------------
  // Tri
  // ----------------------
  const tri = document.getElementById("tri").value;
  if (tri === "nom-asc") resultat.sort((a, b) => a.nom.localeCompare(b.nom));
  else if (tri === "nom-desc") resultat.sort((a, b) => b.nom.localeCompare(a.nom));
  else if (tri === "prix-asc") resultat.sort((a, b) => Number(a.prix) - Number(b.prix));
  else if (tri === "prix-desc") resultat.sort((a, b) => Number(b.prix) - Number(a.prix));
  else if (tri === "stock-asc") {
    resultat.sort((a, b) => {
      if (a.stock === 0 && b.stock > 0) return -1;  
      if (a.stock > 0 && b.stock === 0) return 1;   
      return a.stock - b.stock;                      
    });
  } else if (tri === "stock-desc") {
    resultat.sort((a, b) => {
      if (a.stock === 0 && b.stock > 0) return 1;   
      if (a.stock > 0 && b.stock === 0) return -1;  
      return b.stock - a.stock;                      
    });
  }


  // ----------------------
  // Affichage
  // ----------------------
  afficher(resultat);
}
document.getElementById("recherche").oninput = appliquerFiltresTri;
document.getElementById("filtre").onchange = appliquerFiltresTri;
document.getElementById("tri").onchange = appliquerFiltresTri;

// ==========================
// Mode clair / sombre
// ==========================
const body = document.body;
const btnMode = document.getElementById("btnMode");



btnMode.onclick = () => {
  body.classList.toggle("dark-mode");
  if (body.classList.contains("dark-mode")) {
    btnMode.textContent = "☀️";
    btnMode.classList.remove("btn-dark");
    btnMode.classList.add("btn-light");
  } else {
    btnMode.textContent = "🌙";
    btnMode.classList.remove("btn-light");
    btnMode.classList.add("btn-dark");
  }
  localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
};
