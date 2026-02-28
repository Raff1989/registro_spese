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
import { updater } from "@tauri-apps/plugin-updater";




const app = createApp(App);
app.use(PrimeVue);
app.use(router);
app.mount("#app");
await updater();

// createApp(App).use(router).mount("#app");
