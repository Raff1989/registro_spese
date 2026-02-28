<script setup>
import { ref, computed, onMounted } from "vue";
import StatsCharts from "../components/StatsCharts.vue";
import moment from "moment";
import "moment/locale/it";
moment.locale("it");


const expenses = ref([]);

const filterMonth = ref("");
const filterYear = ref("");

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
    <h2 class="flex justify-content-center">Statistiche</h2>

    <!-- FILTRI -->
    <div class="filters-row">
      <div class="filter-block">
        <label>Mese</label>
        <select v-model="filterMonth">
          <option value="">Tutti</option>
          <option value="1">Gennaio</option>
          <option value="2">Febbraio</option>
          <option value="3">Marzo</option>
          <option value="4">Aprile</option>
          <option value="5">Maggio</option>
          <option value="6">Giugno</option>
          <option value="7">Luglio</option>
          <option value="8">Agosto</option>
          <option value="9">Settembre</option>
          <option value="10">Ottobre</option>
          <option value="11">Novembre</option>
          <option value="12">Dicembre</option>
        </select>
      </div>

      <div class="filter-block">
        <label>Anno</label>
        <select v-model="filterYear">
          <option value="">Tutti</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <!-- GRAFICI -->
    <StatsCharts :expenses="filteredExpenses" />

    <!-- CARD TOTALE -->
    <div class="total-card">
      <h3 class="total-title">
        Totale {{ currentPeriodLabel }}
      </h3>

      <p class="total-amount">{{ monthlyTotal.toFixed(2) }} €</p>
    </div>

    <!-- LISTA SPESE -->
    <div class="expenses-list">
      <h3>Spese del periodo</h3>

      <div
          v-for="e in filteredExpenses"
          :key="e.id"
          class="expense-item"
      >
          <img
            :src="getCategoryIcon(e.category)"
            alt=""
            class="expense-icon"
          />

          <div class="expense-info">
            <strong>{{ e.name }}</strong>
            <div class="date">{{ moment(e.date).locale("it").format("DD/MM/YYYY") }}</div>
          </div>

          <div class="amount">{{ e.amount.toFixed(2) }} €</div>
      </div>

      <div v-if="filteredExpenses.length === 0" class="no-expenses">
        Nessuna spesa trovata
      </div>

    </div>
  </div>
</template>

<style scoped>
.stats-page {
  padding: 20px;
  padding-bottom: 100px;
}

.filters-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-block {
  flex: 1;
}

.total-card {
  background: var(--card);
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  text-align: center;
  height: 120px; /* identica alla Home */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.total-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.total-amount {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0;
}

.expenses-list {
  margin-top: 20px;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--input-border);
}

.date {
  font-size: 0.8rem;
  opacity: 0.7;
}

.expense-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--input-border);
  gap: 12px;
}

.expense-icon {
  width: 28px;
  height: 28px;
  opacity: 0.9;
}

.expense-info {
  flex: 1;
}

.amount {
  font-weight: bold;
}

.no-expenses {
  text-align: center;
  padding: 20px;
  opacity: 0.7;
}



</style>
