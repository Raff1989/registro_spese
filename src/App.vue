<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <div class="app-container">

    <!-- Contenuto della pagina -->
    <router-view />

    <!-- FOOTER visibile solo se la rotta NON ha hideFooter -->
    <nav
      v-if="!route.meta.hideFooter"
      class="bottom-bar"
    >
      <router-link
        to="/home"
        class="footer-item"
        :class="{ active: route?.path === '/home' }"
      >
        <!-- <span>📄</span> -->
        <img src="/assets/home.svg" class="footer-icon" alt="Home" />
        <small>Home</small>
      </router-link>

      <router-link
        to="/stats"
        class="tab"
        :class="{ active: route?.path === '/stats' }"
      >
        <span>📊</span>
        <small>Statistiche</small>
      </router-link>

      <router-link
        to="/notes"
        class="footer-item"
        :class="{ active: $route.name === 'notes' }"
      >
        <img src="/assets/notepad.svg" class="footer-icon" alt="Note" />
        <span>Note</span>
      </router-link>



      <router-link
        to="/settings"
        class="tab"
        :class="{ active: route?.path === '/settings' }"
      >
        <span>⚙️</span>
        <small>Impostazioni</small>
      </router-link>
    </nav>

  </div>
</template>

<style>
.app-container {
  padding-bottom: 80px; /* spazio per la bottom bar */
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: var(--card);
  border-top: 1px solid var(--input-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 9999;
}

.bottom-bar .tab {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  color: var(--text);
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.85rem;
}

.bottom-bar .tab span {
  font-size: 1.3rem;
}

.bottom-bar .tab.active {
  color: #4da3ff;
  font-weight: bold;
}

.footer-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  color: #777;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  align-items: center;
  font-size: 12px;
}

.footer-item img.footer-icon {
  width: 22px;
  height: 22px;
  margin-bottom: 4px;
  object-fit: contain;
}

.footer-item.active {
  color: var(--primary-color);
}

/* .footer-item.active img.footer-icon {
  filter: brightness(0) saturate(100%) invert(36%) sepia(94%) saturate(2000%) hue-rotate(210deg) brightness(95%) contrast(90%);
} */
/* 👆 questo colora l’SVG come il testo (se serve) */


/* 
@media (min-width: 900px) {
  .layout-wide {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 20px;
  }
}  */

</style>
