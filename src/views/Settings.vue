<script setup>
import { ref } from "vue";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
// import { WebView } from "@capacitor-community/webview";
import { Capacitor } from "@capacitor/core";



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

  // 🌐 WEB – download classico
  if (!isNative()) {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_app.json";
    a.click();

    URL.revokeObjectURL(url);
    return;
  }

  // 📱 ANDROID – salvataggio in cartella dedicata
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

  alert("Backup salvato in Documenti / registro-spese / backup_app.json");
}

/* -----------------------------
   📥 RIPRISTINO JSON (OK)
----------------------------- */

async function restoreData(event) {
  const file = event.files[0];

  if (!file) {
    alert("Nessun file selezionato.");
    return;
  }

  const text = await file.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    alert("Il file selezionato non è un backup valido.");
    return;
  }

  // Conferma
  const conferma = confirm("Vuoi ripristinare i dati dal backup?");
  if (!conferma) return;

  // Compatibilità con vecchi backup (solo expenses)
  if (Array.isArray(parsed)) {
    localStorage.setItem("expenses", JSON.stringify(parsed));
    alert("Backup ripristinato (solo spese).");
    location.reload();
    return;
  }

  // Ripristino completo
  if (parsed.expenses) {
    localStorage.setItem("expenses", JSON.stringify(parsed.expenses));
  }

  if (parsed.notes) {
    localStorage.setItem("notes", JSON.stringify(parsed.notes));
  }

  if (parsed.priceHistory) {
    localStorage.setItem("priceHistory", JSON.stringify(parsed.priceHistory));
  }

  alert("Backup ripristinato correttamente!");
  location.reload();
}

/* -----------------------------
   🗑 RESET TOTALE (OK)
----------------------------- */
function resetAll() {
  if (confirm("Sei sicuro di voler cancellare TUTTI i dati dell'app?")) {

    // Cancella spese (Home)
    localStorage.removeItem("expenses");

    // Cancella Note
    localStorage.removeItem("notes");

    // Cancella storico prezzi Note
    localStorage.removeItem("priceHistory");

    alert("Tutti i dati sono stati cancellati. Riavvia l'app.");
  }
}


// Applica il colore personalizzato all'avvio
applyAccentColor();
</script>



<template>
  <div class="settings-page">
    <h2 class="flex justify-content-center">Impostazioni</h2>

    <!-- 💾 Backup -->
    <div class="settings-card">
      <h3 style="max-width: 248px;margin-left: 10px;">Backup</h3>
      <Button label="Scarica backup JSON" icon="pi pi-download" class="w-full" @click="backupData" />
    </div>

    <!-- 📥 Ripristino -->
    <div class="settings-card">
      <h3 style="max-width: 248px;margin-left: 10px;">Ripristina backup</h3>
      <FileUpload
        mode="basic"
        accept="application/json"
        chooseLabel="Seleziona file"
        class="w-full modern-upload"
        style="max-width: 248px;margin-left: 10px;"
        @select="restoreData"
      />

    </div>

    <!-- 🗑 Reset -->
    <div class="settings-card">
      <h3 style="max-width: 248px;margin-left: 10px;">Reset totale</h3>
      <Button label="Cancella tutte le spese" class="w-full p-button-danger" @click="resetAll" />
    </div>

    <!-- ℹ️ Info app -->
    <div class="settings-card">
      <h3 style="max-width: 248px;margin-left: 10px;">Info App</h3>

      <p style="max-width: 248px;margin-left: 10px;"><strong>Versione:</strong> 1.0.0</p>
      <p style="max-width: 248px;margin-left: 10px;"><strong>Autore:</strong> Raffaele</p>

      <!-- <ul class="changelog">
        <li>✔ Aggiunta pagina Statistiche</li>
        <li>✔ Bottom bar stile app mobile</li>
        <li>✔ Backup / Restore</li>
        <li>✔ Esportazione CSV / Excel</li>
        <li>✔ Import CSV</li>
        <li>✔ Colori personalizzati</li>
      </ul> -->
    </div>
  </div>
</template>


<style scoped>
.settings-card button,
.settings-card .p-button {
  max-width: 248px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
}


.settings-card button:hover,
.settings-card .p-button:hover {
  opacity: 0.85;
}

/* .settings-card input[type="file"] {
  margin-top: 10px;
  padding: 8px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  width: 100%;
} */

.color-input {
  width: 100%;
  height: 45px;
  border-radius: 8px;
  border: 1px solid var(--input-border);
  padding: 0;
  margin-top: 6px;
}

.changelog {
  margin-top: 10px;
  padding-left: 18px;
}

/* Modern file upload button */
.modern-upload .p-button {
    max-width: 248px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
}

.modern-upload .p-button:hover {
  opacity: 0.85;
}




</style>
