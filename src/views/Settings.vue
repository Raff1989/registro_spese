<script setup>
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { getVersion } from '@tauri-apps/api/app';
import { open } from "@tauri-apps/plugin-shell";
import Badge from "primevue/badge";
import { invoke } from "@tauri-apps/api/core";

const author = ref("");

async function loadAuthor() {
  author.value = await invoke("get_author");
}

const darkMode = ref(false);



/* -----------------------------
   🔄 VERSIONE + CHECK MANUALE GITHUB
----------------------------- */
const currentVersion = ref("...");
const latestVersion = ref("");
const updateAvailable = ref(false);
const releaseUrl = ref("");


function compareVersions(v1, v2) {
  const a = v1.split(".").map(Number);
  const b = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x > y) return 1;   // v1 è più grande
    if (x < y) return -1;  // v2 è più grande
  }
  return 0; // uguali
}

async function checkGitHubRelease() {
  try {
    const res = await fetch("https://api.github.com/repos/Raff1989/registro_spese/releases/latest");
    const data = await res.json();

    latestVersion.value = data.tag_name;
    releaseUrl.value = data.html_url; // link alla pagina release

    updateAvailable.value = compareVersions(latestVersion.value, currentVersion.value) > 0;
  } catch (err) {
    console.error("Errore nel recupero release GitHub:", err);
  }
}

function openRelease() {
  open(releaseUrl.value);
}


async function initVersionInfo() {
  currentVersion.value = await getVersion();
  await checkGitHubRelease();
}

/* -----------------------------
   🎨 COLORE PERSONALIZZATO
----------------------------- */
const customColor = ref(localStorage.getItem("customColor") || "#4da3ff");

function applyAccentColor() {
  const root = document.documentElement;
  root.style.setProperty("--accent", customColor.value);
  localStorage.setItem("customColor", customColor.value);
}

/* -----------------------------
   🧠 RILEVA SE SIAMO IN APP NATIVE
----------------------------- */
function isNative() {
  return !!window.Capacitor?.isNativePlatform?.();
}

/* -----------------------------
   💾 BACKUP JSON
----------------------------- */
async function backupData() {
  const backup = {
    expenses: JSON.parse(localStorage.getItem("expenses") || "[]"),
    notes: JSON.parse(localStorage.getItem("notes") || "[]"),
    priceHistory: JSON.parse(localStorage.getItem("priceHistory") || "[]")
  };

  const json = JSON.stringify(backup, null, 2);

  if (!isNative()) {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_spese_${currentVersion.value}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const folder = "registro-spese";
  const fileName = "backup_app.json";

  await Filesystem.mkdir({
    path: folder,
    directory: Directory.Documents,
    recursive: true
  }).catch(() => {});

  await Filesystem.writeFile({
    path: `${folder}/${fileName}`,
    data: json,
    directory: Directory.Documents,
    encoding: "utf8"
  });

  alert("Backup salvato in Documenti / registro-spese");
}

/* -----------------------------
   📥 RIPRISTINO JSON
----------------------------- */
async function restoreData(event) {
  const file = event.files[0];
  if (!file) return;

  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    alert("File non valido.");
    return;
  }

  if (confirm("Ripristinare i dati? I dati attuali verranno sovrascritti.")) {
    if (Array.isArray(parsed)) {
      localStorage.setItem("expenses", JSON.stringify(parsed));
    } else {
      if (parsed.expenses) localStorage.setItem("expenses", JSON.stringify(parsed.expenses));
      if (parsed.notes) localStorage.setItem("notes", JSON.stringify(parsed.notes));
      if (parsed.priceHistory) localStorage.setItem("priceHistory", JSON.stringify(parsed.priceHistory));
    }
    location.reload();
  }
}

/* -----------------------------
   🗑 RESET TOTALE
----------------------------- */
function resetAll() {
  if (confirm("Cancellare TUTTI i dati? L'operazione è irreversibile.")) {
    localStorage.removeItem("expenses");
    localStorage.removeItem("notes");
    localStorage.removeItem("priceHistory");
    alert("Dati cancellati.");
    location.reload();
  }
}

const saved = localStorage.getItem("theme");
if (saved === "dark") document.documentElement.classList.add("dark");


onMounted(() => {
  initVersionInfo();
  applyAccentColor();
  loadAuthor();
});

</script>


<template>
  <div class="settings-page">
    <div class="mobile-header">
      <h2 style="display: flex;justify-content: center;margin-top: 25px;">Impostazioni</h2>
      <p class="subtitle">Gestisci i tuoi dati e l'applicazione</p>
    </div>

    <div class="settings-group">
      <span class="group-title">Sicurezza e Dati</span>
      
      <div class="settings-card shadow-sm">
        <div class="card-item">
          <div class="item-icon bg-blue"><i class="pi pi-download"></i></div>
          <div class="item-content">
            <span class="item-title">Backup</span>
            <span class="item-desc">Esporta i tuoi dati in formato JSON</span>
          </div>
          <div style="display: flex;justify-content: center; align-items: center;">
            <Button icon="pi pi-download" label="Download" class="p-button-text p-button-secondary action-icon" @click="backupData" />
          </div>
        </div>

        <div class="divider"></div>

        <div class="card-item">
          <div class="item-icon bg-green"><i class="pi pi-cloud-upload"></i></div>
          <div class="item-content">
            <span class="item-title">Ripristina</span>
            <span class="item-desc">Carica un backup precedente</span>
          </div>
          <div class="action-icon-group">
            <!-- <i class="pi pi-upload text-muted mr-1"></i>  -->
            <FileUpload
              mode="basic"
              accept="application/json"
              auto
              customUpload
              @select="restoreData"
              chooseLabel="Upload"
              class="p-button-text p-button-secondary modern-upload-btn"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="settings-group">
      <span class="group-title">Avanzate</span>
      <div class="settings-card shadow-sm">
        <div class="card-item" @click="resetAll">
          <div class="item-icon bg-red"><i class="pi pi-trash"></i></div>
          <div class="item-content">
            <span class="item-title text-red">Cancella tutto</span>
            <span class="item-desc">Rimuovi ogni dato (irreversibile)</span>
          </div>
          <i class="pi pi-chevron-right text-muted action-icon"></i>
        </div>
      </div>
    </div>

    <div class="settings-group">
      <span class="group-title">Informazioni</span>
      <div class="settings-card shadow-sm info-container">
        <div class="info-row">
          <span>Versione</span>
          <span class="value-badge">{{ currentVersion }}</span>
        </div>
        <div class="info-row">
          <span>Sviluppatore</span>
          <span class="value-badge">{{ author }}</span>
        </div>

        <div v-if="updateAvailable" class="update-banner" @click="openRelease">
          <div class="update-info">
            <Badge value="UPDATE" severity="danger" class="pulse-badge" />
            <span>Nuova versione <strong>{{ latestVersion }}</strong> disponibile!</span>
          </div>
          <i class="pi pi-download"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- LAYOUT GENERALE --- */
.settings-page {
  padding: 20px 16px 100px;
  max-width: 800px; /* Larghezza ottimale per desktop */
  margin: 0 auto;
  background: transparent;
}

/* --- HEADER --- */
.mobile-header {
  margin-bottom: 30px;
  text-align: left;
}

.mobile-header h2 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-color, #1c1c1e);
}

.subtitle {
  color: #8e8e93;
  font-size: 1rem;
}

/* --- GRUPPI E CARD --- */
.settings-group {
  margin-bottom: 30px;
}

.group-title {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #8e8e93;
  margin-left: 12px;
  margin-bottom: 10px;
  letter-spacing: 0.8px;
}

.settings-card {
  background: var(--card-bg, #ffffff);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 0;
}

/* --- ELEMENTI DELLA LISTA --- */
.card-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-item:hover {
  background: rgba(0, 0, 0, 0.02); /* Feedback hover per desktop */
}

.card-item:active {
  background: rgba(0, 0, 0, 0.05);
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.bg-blue { background: #007aff; }
.bg-green { background: #34c759; }
.bg-red { background: #ff3b30; }

.item-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1c1c1e;
}

.item-desc {
  font-size: 0.85rem;
  color: #8e8e93;
}

.divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
  margin-left: 78px; /* Allineato dopo l'icona */
}

/* --- SEZIONE INFO --- */
.info-container {
  padding: 10px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 20px;
  font-size: 1rem;
  color: #1c1c1e;
}

.value-badge {
  background: rgba(0, 122, 255, 0.1);
  padding: 4px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #007aff;
}

/* --- UPDATE BANNER --- */
.update-banner {
  margin: 15px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #34c759, #28a745);
  color: white;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.update-banner:hover {
  transform: translateY(-2px);
}

.update-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* --- UTILS & PRIME VUE OVERRIDES --- */
.action-icon {
  background: transparent !important;
  border: none !important;
  color: #64748B !important;
  padding: 0;
  width: auto;
  box-shadow: none;
}

.text-red { color: #ff3b30; }

:deep(.modern-upload-btn .p-button) {
  background: transparent !important;
  border: none !important;
  color: #007aff !important;
  padding: 0;
  width: auto;
  box-shadow: none;
}

.pulse-badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255,255,255,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
}

/* Adattamento per Dark Mode (se attiva a livello root) */
:border-radius-pill {
  border-radius: 50px;
}
</style>