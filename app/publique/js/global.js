import * as requetes from "../requetes/requetes_epices.js";

const listeEpices = document.getElementById("listeEpices");
const formEpice = document.getElementById("formEpice");
const modal = new bootstrap.Modal(document.getElementById("modalEpice"));
const toastEl = document.getElementById("toast");
const toast = new bootstrap.Toast(toastEl);

let epices = [];

// Charger données
async function charger() {
  const res = await requetes.lire();
  if (res.statut) {
    epices = res.donnees;
    afficher(epices);
  } else {
    console.error("Erreur API:", res);
  }
}
charger();

// Afficher liste d'épices
function afficher(data) {
  listeEpices.innerHTML = "";
  data.forEach(e => {
    const src = e.image || "/images/epices/default.jpg";
    listeEpices.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${src}" class="card-img-top" style="height:200px;object-fit:cover;" onerror="this.src='/images/epices/default.jpg'">
          <div class="card-body">
            <h5>${escapeHtml(e.nom)}</h5>
            <p>${escapeHtml(e.description || "")}</p>
            <p><b>${Number(e.prix).toFixed(2)} $ CAD</b> - Stock: ${e.stock}</p>
            <button class="btn btn-sm btn-primary me-2" onclick="modifier(${e.id})">Modifier</button>
            <button class="btn btn-sm btn-danger" onclick="supprimer(${e.id})">Supprimer</button>
          </div>
        </div>
      </div>`;
  });

  // 👉 Remonter en haut après chaque affichage
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Sécurité texte
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

// Ajouter/Modifier
formEpice.onsubmit = async (evt) => {
  evt.preventDefault();
  const id = document.getElementById("epiceId").value;
  const fileInput = document.getElementById("image");
  const formData = new FormData();

  // champs texte
  ["nom","type","origine","prix","vendeur","stock","description"].forEach(name => {
    const el = document.getElementById(name);
    if (el && el.value !== undefined) formData.append(name, el.value);
  });

  // fichier image
  if (fileInput && fileInput.files.length > 0) {
    formData.append("image", fileInput.files[0]);
  }

  let res;
  if (id) {
    // modification (JSON simple si pas de fichier)
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
    // ajout toujours via FormData
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
};

// Boutons globaux
window.modifier = (id) => {
  const e = epices.find(x => String(x.id) === String(id));
  if (!e) return;
  formEpice.reset();
  document.getElementById("epiceId").value = e.id;
  document.getElementById("nom").value = e.nom || "";
  document.getElementById("type").value = e.type || "";
  document.getElementById("origine").value = e.origine || "";
  document.getElementById("prix").value = e.prix || "";
  document.getElementById("vendeur").value = e.vendeur || "";
  document.getElementById("stock").value = e.stock || "";
  document.getElementById("description").value = e.description || "";
  modal.show();
};

window.supprimer = async (id) => {
  const res = await requetes.supprimer(id);
  if (res.statut) {
    toastEl.textContent = res.msg;
    toast.show();
    charger();
  } else {
    toastEl.textContent = res.msg || "Erreur suppression";
    toast.show();
  }
};

// Bouton Ajouter
document.getElementById("btnAjouter").onclick = () => {
  formEpice.reset();
  document.getElementById("epiceId").value = "";
  modal.show();
};

// ==========================
// Recherche + Filtre + Tri
// ==========================
function appliquerFiltresTri() {
  let resultat = [...epices];

  // Recherche texte
  const texte = document.getElementById("recherche").value.toLowerCase();
  if (texte) {
    resultat = resultat.filter(e =>
      e.nom.toLowerCase().includes(texte) ||
      e.origine.toLowerCase().includes(texte) ||
      e.type.toLowerCase().includes(texte) ||
      e.vendeur.toLowerCase().includes(texte)
    );
  }

  // Filtre
  const filtre = document.getElementById("filtre").value;
  if (filtre === "dispo") {
    resultat = resultat.filter(e => e.stock > 0);
  } else if (filtre === "rupture") {
    resultat = resultat.filter(e => e.stock === 0);
  } else if (filtre && filtre !== "all-origines" && filtre !== "all-types") {
    resultat = resultat.filter(e => e.origine === filtre || e.type === filtre);
  }

  // Tri
  const tri = document.getElementById("tri").value;
  if (tri === "nom-asc") {
    resultat.sort((a, b) => a.nom.localeCompare(b.nom));
  } else if (tri === "nom-desc") {
    resultat.sort((a, b) => b.nom.localeCompare(a.nom));
  } else if (tri === "prix-asc") {
    resultat.sort((a, b) => a.prix - b.prix);
  } else if (tri === "prix-desc") {
    resultat.sort((a, b) => b.prix - a.prix);
  } else if (tri === "stock-asc") {
    resultat.sort((a, b) => a.stock - b.stock);
  } else if (tri === "stock-desc") {
    resultat.sort((a, b) => b.stock - a.stock);
  }

  afficher(resultat);
}

// Brancher événements
document.getElementById("recherche").oninput = appliquerFiltresTri;
document.getElementById("filtre").onchange = appliquerFiltresTri;
document.getElementById("tri").onchange = appliquerFiltresTri;

// ==========================
// Mode clair/sombre
// ==========================
const body = document.body;
const btnMode = document.getElementById("btnMode");

btnMode.onclick = () => {
  body.classList.toggle("dark-mode");

  // Changer l'icône selon le mode
  if (body.classList.contains("dark-mode")) {
    btnMode.textContent = "☀️"; // Soleil = mode clair dispo
    btnMode.classList.remove("btn-dark");
    btnMode.classList.add("btn-light");
  } else {
    btnMode.textContent = "🌙"; // Lune = mode sombre dispo
    btnMode.classList.remove("btn-light");
    btnMode.classList.add("btn-dark");
  }
};