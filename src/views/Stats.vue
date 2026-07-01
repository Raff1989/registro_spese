<script setup>
import { ref, computed, onMounted, inject } from "vue";
import StatsCharts from "../components/StatsCharts.vue";
import moment from "moment";
import "moment/locale/it";
moment.locale("it");



const expenses = ref([]);

const filterMonth = ref("");
const filterYear = ref("");
const hasNewStats = inject("hasNewStats");


// Lista anni disponibili
const years = computed(() => {
  const list = expenses.value.map(e => new Date(e.date).getFullYear());
  return [...new Set(list)].sort((a, b) => b - a);
});

// Nome mese
function monthName(m) {
  const names = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  return names[m - 1];
}

function getCategoryIcon(category) {
  const map = {
    "Spesa": "/assets/shopping_cart.svg",
    "Indumenti/Acc.": "/assets/shirt.svg",
    "Carburante": "/assets/gasoline.svg",
    "Bollo": "/assets/bollo.svg",
    "Tagliando": "/assets/engine.svg",
    "RcAuto": "/assets/car.svg",
    "Polizze": "/assets/insurance_policy.svg",
    "Casa": "/assets/house.svg",
    "Parrucchiere/estet.": "/assets/barbershop.svg",
    "CuraPersonale": "/assets/skin_care.svg",
    "Farmacia": "/assets/pharmacy.svg",
    "Svago": "/assets/coffee.svg",
    "Pelosetti": "/assets/paw.svg",
    "Parcheggi/Pedaggi": "/assets/parking.svg",
    "Affitto": "/assets/rent.svg",
    "Mutuo/Fin.": "/assets/mortgage.svg",
    "Lavoro": "/assets/job.svg",
    "Utenze": "/assets/light_bulb.svg",
    "Altro": "/assets/emoticon.svg"
  };

  return map[category] || "/assets/tag.svg";
}



// Filtraggio spese
const filteredExpenses = computed(() => {
  return expenses.value.filter(e => {
    const d = new Date(e.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    const matchMonth =
      filterMonth.value === "" ||
      Number(filterMonth.value) === month;

    const matchYear =
      filterYear.value === "" ||
      Number(filterYear.value) === year;

    return matchMonth && matchYear;
  });
});

// Totale periodo filtrato
const monthlyTotal = computed(() => {
  return filteredExpenses.value.reduce((sum, e) => sum + e.amount, 0);
});

// Titolo dinamico del periodo
const currentPeriodLabel = computed(() => {
  if (filterMonth.value !== "" && filterYear.value !== "") {
    return `${monthName(Number(filterMonth.value))} ${filterYear.value}`;
  }

  if (filterMonth.value !== "") {
    return monthName(Number(filterMonth.value));
  }

  if (filterYear.value !== "") {
    return filterYear.value;
  }

  return "Tutto";
});

// Caricamento spese
onMounted(() => {
  const saved = localStorage.getItem("expenses");
  if (saved) {
    expenses.value = JSON.parse(saved);
  }

});
</script>

<template>
  <div class="stats-page">
    <div class="mobile-header">
      <h2 style="display: flex;justify-content: center;margin-top: 25px;">Statistiche</h2>
      <p class="subtitle">Analizza le tue abitudini di spesa</p>
    </div>

    <div class="settings-group">
      <span class="group-title">Filtra Periodo</span>
      <div class="settings-card shadow-sm filters-container">
        <div class="filter-item">
          <i class="pi pi-calendar"></i>
          <select v-model="filterMonth" class="custom-select">
            <option value="">Tutti i mesi</option>
            <option v-for="m in 12" :key="m" :value="m">{{ monthName(m) }}</option>
          </select>
        </div>
        <div class="divider-h"></div>
        <div class="filter-item">
          <i class="pi pi-map"></i>
          <select v-model="filterYear" class="custom-select">
            <option value="">Tutti gli anni</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="settings-group">
      <span class="group-title">Andamento Grafico</span>
      <div class="settings-card shadow-sm chart-card">
        <StatsCharts :expenses="filteredExpenses" />
      </div>
    </div>

    <div class="settings-group">
      <span class="group-title">Riepilogo Economico</span>
      <div class="settings-card shadow-sm total-display bg-gradient-blue">
        <span class="total-label">Totale {{ currentPeriodLabel }}</span>
        <span class="total-value">{{ monthlyTotal.toFixed(2) }} €</span>
      </div>
    </div>

    <div class="settings-group">
      <span class="group-title">Dettaglio Spese</span>
      <div class="settings-card shadow-sm">
        <div v-if="filteredExpenses.length === 0" class="no-expenses">
          <i class="pi pi-info-circle"></i>
          <p>Nessuna spesa trovata</p>
        </div>

        <div v-for="(e, index) in filteredExpenses" :key="e.id">
          <div class="expense-row">
            <div class="item-icon-wrapper">
               <img :src="getCategoryIcon(e.category)" alt="" class="expense-icon" />
            </div>
            <div class="item-content">
              <span class="item-title">{{ e.name }}</span>
              <span class="item-desc">{{ moment(e.date).format("DD MMMM YYYY") }}</span>
            </div>
            <div class="item-amount">
              {{ e.amount.toFixed(2) }} €
            </div>
          </div>
          <div v-if="index < filteredExpenses.length - 1" class="divider"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-page {
  padding: 20px 16px 100px;
  max-width: 800px;
  margin: 0 auto;
}

/* Header & Titoli */
.mobile-header { margin-bottom: 24px; }
.mobile-header h2 { font-size: 2rem; font-weight: 800; margin: 0; color: #1c1c1e; }
.subtitle { color: #8e8e93; font-size: 0.95rem; }

.settings-group { margin-bottom: 24px; }
.group-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #8e8e93;
  margin-left: 12px;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

/* Card Base */
.settings-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* Filtri Moderni */
.filters-container {
  display: flex;
  flex-direction: column;
}
.filter-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  color: #8e8e93;
}
.custom-select {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #1c1c1e;
  outline: none;
  cursor: pointer;
}
.divider-h { height: 1px; background: rgba(0,0,0,0.05); margin: 0 16px; }

/* Grafico Card */
.chart-card { padding: 20px 10px; }

/* Card Totale Speciale */
.total-display {
  background: linear-gradient(135deg, #007aff, #0056b3);
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  color: white;
}
.total-label { font-size: 0.9rem; opacity: 0.9; font-weight: 500; }
.total-value { font-size: 2.2rem; font-weight: 800; margin-top: 4px; }

/* Lista Spese */
.expense-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 14px;
}
.item-icon-wrapper {
  width: 42px;
  height: 42px;
  background: #f2f2f7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.expense-icon { width: 24px; height: 24px; }
.item-content { flex: 1; display: flex; flex-direction: column; }
.item-title { font-weight: 700; color: #1c1c1e; font-size: 1rem; }
.item-desc { font-size: 0.8rem; color: #8e8e93; text-transform: capitalize; }
.item-amount { font-weight: 800; font-size: 1.1rem; color: #1c1c1e; }

.divider { height: 1px; background: rgba(0,0,0,0.05); margin-left: 72px; }

.no-expenses {
  padding: 40px;
  text-align: center;
  color: #8e8e93;
}
.no-expenses i { font-size: 2rem; margin-bottom: 10px; }

/* Responsive Desktop */
@media (min-width: 768px) {
  .filters-container { flex-direction: row; padding: 10px; }
  .divider-h { width: 1px; height: 30px; margin: auto 10px; }
}
</style>
