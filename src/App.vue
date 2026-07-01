<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <div>

    <!-- 🔥 SE SIAMO SU /loading MOSTRA SOLO IL LOADING -->
    <router-view v-if="route.meta.hideFooter" />

    <!-- 🔥 ALTRIMENTI MOSTRA TUTTA L'APP -->
    <div v-else class="app-container">

      <!-- SIDEBAR DESKTOP -->
      <nav class="sidebar-desktop">
        <router-link
          to="/home"
          class="sidebar-item"
          :class="{ active: route?.path === '/home' }"
        >
          <img src="/assets/home.svg" class="sidebar-icon" alt="Home" />
          <span>Home</span>
        </router-link>

        <router-link
          to="/stats"
          class="sidebar-item"
          :class="{ active: route?.path === '/stats' }"
        >
          <span class="emoji">📊</span>
          <span>Statistiche</span>
        </router-link>

        <router-link
          to="/notes"
          class="sidebar-item"
          :class="{ active: route?.name === 'notes' }"
        >
          <img src="/assets/notepad.svg" class="sidebar-icon" alt="Note" />
          <span>Note</span>
        </router-link>

        <router-link
          to="/wallet"
          class="sidebar-item"
          :class="{ active: route?.path === '/wallet' }"
        >
          <span class="emoji">💳</span>
          <span>Wallet</span>
        </router-link>

        <router-link
          to="/settings"
          class="sidebar-item"
          :class="{ active: route?.path === '/settings' }"
        >
          <span class="emoji">⚙️</span>
          <span>Impostazioni</span>
        </router-link>
      </nav>

      <!-- CONTENUTO PAGINA -->
      <router-view />

      <!-- NAVBAR MOBILE -->
      <nav class="bottom-bar" style="margin-bottom: 35px;">
        <router-link
          to="/home"
          class="footer-item"
          :class="{ active: route?.path === '/home' }"
        >
          <img src="/assets/home.svg" class="footer-icon" alt="Home" />
          <!-- <small>Home</small> -->
        </router-link>

        <router-link
          to="/stats"
          class="tab"
          :class="{ active: route?.path === '/stats' }"
        >
          <img src="/assets/stat.svg" class="footer-icon" style="width: 22px;height: 22px;position: relative;object-fit: contain;left: 30%;" alt="stat" />
          <!-- <small>Statistiche</small> -->
        </router-link>

        <router-link
          to="/notes"
          class="footer-item"
          :class="{ active: route?.name === 'notes' }"
        >
          <img src="/assets/notepad.svg" class="footer-icon" alt="Note" />
          <!-- <span>Note</span> -->
        </router-link>

         <router-link
          to="/wallet"
          class="footer-item"
          :class="{ active: route?.path === '/wallet' }"
        >
          <img src="/assets/wallet.svg" class="footer-icon" alt="Wallet" />
          <!-- <span>Wallet</span> -->
        </router-link>

        <router-link
          to="/settings"
          class="tab"
          :class="{ active: route?.path === '/settings' }"
        >
          <img src="/assets/setting.svg" class="footer-icon" style="width: 22px;height: 22px;position: relative;object-fit: contain;left: 35%;" alt="setting" />
          <!-- <img src="/assets/setting.svg" class="footer-icon" alt="setting" /> -->
          <!-- <small>Impostazioni</small> -->
        </router-link>
      </nav>

    </div>
  </div>
</template>

<style>
/* -------------------------
   CONFIGURAZIONE GENERALE
-------------------------- */
.app-container {
  /* Spazio generoso sul fondo per non coprire il contenuto */
  padding-bottom: 130px; 
  min-height: 100vh;
}
/* Blocco definitivo per nascondere la scrollbar ovunque */
html, body {
  scrollbar-width: none;       /* Firefox */
  -ms-overflow-style: none;    /* IE/Edge */
  overflow-x: hidden;          /* Evita scroll orizzontali accidentali */
}

html::-webkit-scrollbar, 
body::-webkit-scrollbar,
.app-container::-webkit-scrollbar {
  display: none !important;    /* Chrome, Safari, Opera */
  width: 0 !important;
  height: 0 !important;
}

/* Applica lo scroll fluido senza barra alla tua classe specifica */
.app-container {
  -webkit-overflow-scrolling: touch; /* Rende lo scroll morbido su iOS */
  scrollbar-width: none;
  overflow-y: auto;
}
/* -------------------------
   NAVBAR MOBILE (ULTRA-CLEAN PILL)
-------------------------- */
.bottom-bar {
  position: fixed;
  
  /* DISTACCO DAI BORDI: Aumentiamo i margini per l'effetto pillola */
  bottom: 0px; 
  left: 20px;
  right: 20px;
  
  /* DIMENSIONI: Altezza contenuta e larghezza automatica con i margini sopra */
  height: 65px;
  max-width: 350px; /* Impedisce alla barra di diventare troppo larga */
  margin: 0 auto;  
  
  /* FORMA: Arrotondamento completo (Pillola) */
  border-radius: 50px; 
  
  /* EFFETTO GLASS: Bianco ultra-trasparente */
  background: rgba(255, 255, 255, 0.25) !important; /* Molto trasparente */
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  
  /* BORDO E OMBRA: Sottili per definire la forma senza pesare */
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  
  /* LAYOUT */
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 10000;
  overflow: hidden;
  padding: 0 10px;
}

/* -------------------------
   ICONE (FIX DIMENSIONI)
-------------------------- */
.footer-item, .bottom-bar .tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: transparent !important;
  border: none !important;
  transition: all 0.3s ease;
}

.footer-icon {
  /* Dimensioni bloccate per evitare l'effetto "gigante" */
  width: 25px !important;
  height: 25px !important;
  object-fit: contain !important;
  position: static !important;
  margin: 0 !important;
  /* Icone leggermente più tenui di default */
  /* opacity: 0.7; */
  filter: grayscale(0.2); 
}

/* Feedback per l'icona attiva */
.footer-item.active .footer-icon, 
.bottom-bar .tab.active .footer-icon {
  opacity: 1;
  filter: grayscale(0);
  transform: scale(1.15); /* Leggero ingrandimento */
}

/* Nasconde definitivamente i testi se rimasti */
.footer-item small, 
.footer-item span, 
.bottom-bar .tab small {
  display: none !important;
}

/* -------------------------
   SIDEBAR DESKTOP
-------------------------- */
.sidebar-desktop {
  display: none;
}

/* Sidebar Desktop – Icone più piccole e coerenti */
.sidebar-desktop .sidebar-icon,
.sidebar-desktop .emoji {
  width: 22px !important;
  height: 22px !important;
  font-size: 22px !important;
  object-fit: contain;
}

/* Testo più compatto */
.sidebar-desktop .sidebar-item span {
  font-size: 0.95rem;
  font-weight: 600;
}


@media (min-width: 1024px) {
  .sidebar-desktop {
    display: flex;
    flex-direction: column;
    width: 260px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    background: #ffffff;
    border-right: 1px solid #eee;
    padding: 40px 20px;
    gap: 15px;
    z-index: 9999;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border-radius: 15px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
  }

  .sidebar-item.active {
    background: #007aff;
    color: white !important;
  }

  .sidebar-item.active img {
    filter: brightness(0) invert(1);
  }

  .app-container {
    padding-left: 280px;
    padding-bottom: 0;
  }

  .bottom-bar {
    display: none !important;
  }
}

/* FIX CAMERA */
body.camera-active .bottom-bar {
  display: none;
}

</style>