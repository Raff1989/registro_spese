import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
// TEMA (PrimeVue 3)
import "primevue/resources/themes/lara-light-blue/theme.css";
// CORE
import "primevue/resources/primevue.min.css";
// ICONS
import "primeicons/primeicons.css";
// PRIMEFLEX
import "primeflex/primeflex.css";
import { check } from "@tauri-apps/plugin-updater";



async function checkForUpdates() {
  try {
    const update = await check();

    if (update?.available) {
      const yes = confirm(
        `È disponibile una nuova versione (${update.version}). Vuoi aggiornare ora?`
      );

      if (yes) {
        await update.downloadAndInstall();
        alert("Aggiornamento installato! Riavvia l'app.");
      }
    }
  } catch (err) {
    console.error("Errore durante il controllo aggiornamenti:", err);
  }
}

checkForUpdates();


const app = createApp(App);
app.use(PrimeVue);
app.use(router);
app.mount("#app");
// await updater();

// createApp(App).use(router).mount("#app");
