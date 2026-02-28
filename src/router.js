import { createRouter, createWebHashHistory } from "vue-router";

import Home from "./views/Home.vue";
import Stats from "./views/Stats.vue";
import Settings from "./views/Settings.vue";
import Loading from "./views/Loading.vue";
import Notes from "./views/Notes.vue";

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: () => {
        const firstTime = sessionStorage.getItem("firstLaunch");
        // const firstTime = localStorage.getItem("firstLaunch");


        if (!firstTime) {
          sessionStorage.setItem("firstLaunch", "done");
          // localStorage.setItem("firstLaunch", "done");
          return "/loading"; // 👈 mostra loader SOLO quando l'app viene aperta da zero
        }

        return "/home"; // 👈 navigazione normale
      }
    },


    { path: "/loading", name: "loading", component: Loading, meta: { hideFooter: true } },
    { path: "/home", name: "home", component: Home },
    { path: "/stats", name: "stats", component: Stats },
    { path: "/notes", name: "notes", component: Notes },
    { path: "/settings", name: "settings", component: Settings }
  ]
});
