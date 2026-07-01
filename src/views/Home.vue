<template>
  <main class="app p-3">

    <!-- WRAPPER RESPONSIVE -->
    <div class="home-grid">

      <!-- ============================
           COLONNA SINISTRA (FORM)
      ============================ -->
      <div class="col-left">

        <!-- FORM AGGIUNTA SPESA -->
        <Card class="mb-3">
          <template #title>
            <div class="title-row">
              <h3>Aggiungi Spesa</h3>

              <div class="filter-btn-wrapper">
                <Button
                  icon="pi pi-filter"
                  class="p-button-rounded p-button-text"
                  @click="showFilters = true"
                />

                <span v-if="activeFiltersCount > 0" class="filter-badge">
                  {{ activeFiltersCount }}
                </span>
              </div>
            </div>
          </template>

          <template #content>
            <ExpenseForm @add-expense="addExpense" />
          </template>
        </Card>

      </div>

      <!-- ============================
           COLONNA DESTRA (LISTA + TOTALI)
      ============================ -->
      <div class="col-right">

        <!-- LISTA SPESE -->
        <ExpenseList
          :expenses="filteredExpenses"
          @delete-expense="deleteExpense"
          @edit-expense="updateExpense"
        />

        <!-- TOTALI -->
        <div class="grid">

          <div class="col-12 md:col-6" style="margin-top: 20px;">
            <Card class="total-card">
              <template #title>
                <div class="total-title">Totale Oggi</div>
              </template>

              <template #content>
                <h2 class="total-value">{{ dailyTotal.toFixed(2) }} €</h2>
              </template>
            </Card>
          </div>

          <div class="col-12 md:col-6" style="margin-top: 20px;">
            <Card class="total-card">
              <template #title>
                <div class="total-title">
                  Totale {{ currentMonthLabel }}
                </div>
              </template>

              <template #content>
                <h2 class="total-value">{{ monthlyTotal.toFixed(2) }} €</h2>
              </template>
            </Card>
          </div>

        </div>

      </div>

    </div>

    <!-- ============================
         MODALE FILTRI
    ============================ -->
    <Dialog
      v-model:visible="showFilters"
      header="Ricerca Avanzata"
      :modal="true"
      style="width: 90%; max-width: 450px"
    >

      <div class="grid p-fluid">

        <!-- Ordina -->
        <div class="col-12">
          <label class="block mb-1">Ordina per data</label>
          <Dropdown
            v-model="sortOrder"
            :options="[
              { label: 'Dal più recente', value: 'desc' },
              { label: 'Dal meno recente', value: 'asc' }
            ]"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <!-- Categoria -->
        <div class="col-12">
          <label class="block mb-1">Categoria</label>
          <Dropdown
            v-model="filterCategory"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <!-- Negozio -->
        <div class="col-12">
          <label class="block mb-1">Azienda / Negozio</label>
          <InputText
            v-model="filterStore"
            placeholder="Es. Lidl, Zara..."
            class="w-full"
          />
        </div>

        <!-- Data -->
        <div class="col-12">
          <label class="block mb-1">Data</label>
          <Calendar
            v-model="filterDate"
            :locale="itLocale"
            dateFormat="dd/mm/yy"
            showIcon
            class="w-full"
          />
        </div>

      </div>

      <template #footer>
        <div class="filters-footer">
          <Button
            label="Reset Filtri"
            class="p-button-secondary"
            @click="resetFilters"
          />

          <Button
            label="Applica"
            class="p-button-primary"
            @click="showFilters = false"
          />
        </div>
      </template>

    </Dialog>

  </main>
</template>



<script setup>
import { ref, computed, watch, onMounted } from "vue";
// PrimeVue components
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Calendar from "primevue/calendar";
import ExpenseForm from "../components/ExpenseForm.vue";
import ExpenseList from "../components/ExpenseList.vue";
import moment from "moment";
import "moment/locale/it";
moment.locale("it");




// -----------------------------
// FILTRI
// -----------------------------
const sortOrder = ref("desc");

const filterCategory = ref({ label: "Spesa", value: "Spesa" });
const filterStore = ref("");
const filterDateRaw = ref("");


const filterDate = computed({
  get() {
    return filterDateRaw.value
      ? moment(filterDateRaw.value).toDate()
      : null;
  },
  set(val) {
    filterDateRaw.value = val
      ? moment(val).format("YYYY-MM-DD")
      : "";
  }
});




const activeFiltersCount = computed(() => {
  let count = 0;

  if (filterCategory.value.value !== "Spesa") count++;
  if (filterMonth.value.value !== "") count++;
  if (filterYear.value.value !== "") count++;
  if (filterStore.value.trim() !== "") count++;
  if (filterDateRaw.value !== "") count++;

  return count;
});

const filterMonth = ref({ label: "Tutti", value: "" });
const filterYear = ref({ label: "Tutti", value: "" });

const showFilters = ref(false);

const itLocale = {
  firstDayOfWeek: 1,
  dayNames: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
  dayNamesMin: ["D", "L", "M", "M", "G", "V", "S"],
  monthNames: [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ],
  monthNamesShort: [
    "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
    "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
  ],
  today: "Oggi",
  clear: "Pulisci"
};


// -----------------------------
// OPZIONI DROPDOWN
// -----------------------------
const categoryOptions = [
  { label: "Spesa", value: "Spesa" },
  { label: "Indumenti/Acc.", value: "Indumenti/Acc." },
  { label: "Carburante", value: "Carburante" },
  { label: "Bollo/Revisione", value: "Bollo" },
  { label: "Tagliando/Manuten.", value: "Tagliando" },
  { label: "RcAuto", value: "RcAuto" },
  { label: "Polizze", value: "Polizze" },
  { label: "Casa", value: "Casa" },
  { label: "Parrucchiere/estet.", value: "Parrucchiere/estet." },
  { label: "Cura Personale", value: "CuraPersonale" },
  { label: "Farmacia", value: "Farmacia" },
  { label: "Svago", value: "Svago" },
  { label: "Pelosetti", value: "Pelosetti" },
  { label: "Parcheggi/Pedaggi", value: "Parcheggi/Pedaggi" },
  { label: "Affitto", value: "Affitto" },
  { label: "Mutuo/Fin.", value: "Mutuo/Fin." },
  { label: "Lavoro", value: "Lavoro" },
  { label: "Utenze", value: "Utenze" },
  { label: "Altro", value: "Altro" },
];

const monthOptions = [
  { label: "Gennaio", value: "1" },
  { label: "Febbraio", value: "2" },
  { label: "Marzo", value: "3" },
  { label: "Aprile", value: "4" },
  { label: "Maggio", value: "5" },
  { label: "Giugno", value: "6" },
  { label: "Luglio", value: "7" },
  { label: "Agosto", value: "8" },
  { label: "Settembre", value: "9" },
  { label: "Ottobre", value: "10" },
  { label: "Novembre", value: "11" },
  { label: "Dicembre", value: "12" }
];


// -----------------------------
// TEMA
// -----------------------------
const theme = ref("auto");

function applyTheme() {
  const root = document.documentElement;
  if (theme.value === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme.value);
  }
}

onMounted(() => {
  const saved = localStorage.getItem("theme");
  if (saved) theme.value = saved;
  applyTheme();
});

watch(theme, (val) => {
  localStorage.setItem("theme", val);
  applyTheme();
});

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
}


// // -----------------------------
// // SPESE
// // -----------------------------
// const expenses = ref([]);

// onMounted(() => {
//   const saved = localStorage.getItem("expenses");
//   if (saved) expenses.value = JSON.parse(saved);
// });

// watch(
//   expenses,
//   (newVal) => {
//     localStorage.setItem("expenses", JSON.stringify(newVal));
//   },
//   { deep: true }
// );

// function addExpense(expense) {
//   expenses.value.push(expense);
// }

// function updateExpense(updated) {
//   expenses.value = expenses.value.map((e) =>
//     e.id === updated.id ? updated : e
//   );
// }

// function deleteExpense(id) {
//   expenses.value = expenses.value.filter((e) => e.id !== id);
// }

// -----------------------------
// SPESE
// -----------------------------
const expenses = ref([]);


onMounted(() => {
  const saved = localStorage.getItem("expenses");
  if (saved) expenses.value = JSON.parse(saved);

  checkMonthReset();
});


function checkMonthReset() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const last = localStorage.getItem("last-month");
  const lastYear = localStorage.getItem("last-year");

  // Primo avvio → salva mese corrente
  if (!last || !lastYear) {
    localStorage.setItem("last-month", currentMonth);
    localStorage.setItem("last-year", currentYear);
    return;
  }

  // 🔥 Se il mese è cambiato → resetta SOLO la vista della Home
  if (Number(last) !== currentMonth || Number(lastYear) !== currentYear) {
    // Aggiorna mese salvato
    localStorage.setItem("last-month", currentMonth);
    localStorage.setItem("last-year", currentYear);

    // NON cancelliamo expenses (serve allo Storico)
    // Ma la Home mostrerà solo quelle del mese corrente
  }
}

watch(
  expenses,
  (newVal) => {
    localStorage.setItem("expenses", JSON.stringify(newVal));
  },
  { deep: true }
);

function addExpense(expense) {
  expenses.value.push(expense);
}

function updateExpense(updated) {
  expenses.value = expenses.value.map((e) =>
    e.id === updated.id ? updated : e
  );
}

function deleteExpense(id) {
  expenses.value = expenses.value.filter((e) => e.id !== id);
}





// -----------------------------
// ANNI DISPONIBILI
// -----------------------------
const years = computed(() => {
  const list = expenses.value.map((e) => new Date(e.date).getFullYear());
  return [...new Set(list)].sort((a, b) => b - a);
});


// -----------------------------
// FILTRI AVANZATI
// -----------------------------
// const filteredExpenses = computed(() => {
//   let list = expenses.value.filter((e) => {
//     const d = new Date(e.date);
//     const year = d.getFullYear();
//     const month = d.getMonth() + 1;

//     const matchCategory =
//     filterCategory.value.value === "Spesa" ||
//     e.category.trim().toLowerCase() === filterCategory.value.toLowerCase();


//     const matchStore =
//       filterStore.value.trim() === "" ||
//       e.name.toLowerCase().includes(filterStore.value.toLowerCase());

//     const matchDate =
//       filterDateRaw.value === "" ||
//       e.date === filterDateRaw.value;


//     const matchMonth =
//       filterMonth.value.value === "" ||
//       Number(filterMonth.value.value) === month;

//     const matchYear =
//       filterYear.value.value === "" ||
//       Number(filterYear.value.value) === year;

//     return matchCategory && matchStore && matchDate && matchMonth && matchYear;
//   });

//   list.sort((a, b) => {
//     const da = new Date(a.date);
//     const db = new Date(b.date);
//     return sortOrder.value === "desc" ? db - da : da - db;
//   });

//   return list;
// });

const filteredExpenses = computed(() => {
  let list = currentMonthExpenses.value.filter((e) => {
    const d = new Date(e.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    const matchCategory =
      filterCategory.value.value === "Spesa" ||
      e.category.trim().toLowerCase() === filterCategory.value.toLowerCase();

    const matchStore =
      filterStore.value.trim() === "" ||
      e.name.toLowerCase().includes(filterStore.value.toLowerCase());

    const matchDate =
      filterDateRaw.value === "" ||
      e.date === filterDateRaw.value;

    const matchMonth =
      filterMonth.value.value === "" ||
      Number(filterMonth.value.value) === month;

    const matchYear =
      filterYear.value.value === "" ||
      Number(filterYear.value.value) === year;

    return matchCategory && matchStore && matchDate && matchMonth && matchYear;
  });

  list.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return sortOrder.value === "desc" ? db - da : da - db;
  });

  return list;
});

const currentMonthExpenses = computed(() => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return expenses.value.filter((e) => {
    const d = new Date(e.date);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    return m === month && y === year;
  });
});

// -----------------------------
// RESET FILTRI
// -----------------------------
function resetFilters() {
  sortOrder.value = "desc";
  filterCategory.value = { label: "Spesa", value: "Spesa" };
  filterMonth.value = { label: "Tutti", value: "" };
  filterYear.value = { label: "Tutti", value: "" };
  filterStore.value = "";
  // filterDate.value = "";
  filterDateRaw.value = "";

}


// -----------------------------
// TOTALI
// -----------------------------
const dailyTotal = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return expenses.value
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);
});

const monthlyTotal = computed(() => {
  return filteredExpenses.value.reduce((sum, e) => sum + e.amount, 0);
});

const currentMonthLabel = computed(() => {
  // Se i filtri sono attivi → usa i filtri
  if (filterMonth.value.value !== "" && filterYear.value.value !== "") {
    return `${filterMonth.value.label} ${filterYear.value.value}`;
  }

  // Se non ci sono spese → fallback
  if (expenses.value.length === 0) {
    return "Mese Corrente";
  }

  // Prendi la spesa più recente
  const last = expenses.value
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const d = new Date(last.date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  return `${monthNames[month - 1]} ${year}`;
});

</script>

<style>

.filters-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 12px;
  padding-top: 10px;
}


.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.title-center {
  font-size: 1.2rem;
  font-weight: 600;
}

.filter-btn-wrapper {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff5252;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 50%;
  font-weight: bold;
  line-height: 1;
}


body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f5f5f5;
}

.app {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
}

.totals {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.total-card {
  height: 120px; /* stessa altezza per entrambe */
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.total-title {
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
}

.total-value {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0;
}




.filters {
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-block {
  margin-bottom: 12px;
}

.filter-block label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: #444;
}

.filter-block input,
.filter-block select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.filter-toggle {
  width: 100%;
  padding: 12px;
  background: #4da3ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 12px;
}

.filters-dropdown {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.filter-block {
  margin-bottom: 14px;
}

.filter-block label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: #444;
}

.filter-block input,
.filter-block select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.close-filters {
  width: 100%;
  padding: 10px;
  background: #ddd;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.stats-button {
  position: fixed;
  bottom: 15px;
  right: 15px;
  background: var(--card);
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  font-size: 1rem;
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





/* 🌙 Tema Scuro Automatico */
@media (prefers-color-scheme: dark) {

  body {
    background: #121212;
    color: #e5e5e5;
  }

  .app {
    background: #121212;
  }

  .card,
  .filters-dropdown,
  .total-card {
    background: #1e1e1e;
    color: #e5e5e5;
    box-shadow: 0 2px 6px rgba(0,0,0,0.6);
  }

  input,
  select {
    background: #2a2a2a;
    color: #e5e5e5;
    border: 1px solid #444;
  }

  .filter-toggle {
    background: #3b82f6;
  }

  .delete-btn {
    background: #ff5c5c;
  }

  .edit-btn {
    background: #3b82f6;
  }

  .modal-content {
    background: #1e1e1e;
    color: #e5e5e5;
  }

  .cancel {
    background: #444;
    color: white;
  }
}

/* Animazione fluida */
:root, [data-theme="dark"], [data-theme="light"] {
  transition: background-color 0.35s ease, color 0.35s ease;
}

/* Tema chiaro (default) */
:root {
  --bg: #f5f5f5;
  --card: #ffffff;
  --text: #222;
  --input-bg: #fff;
  --input-border: #ccc;
}
* {
  transition: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease;
}

/* Tema scuro manuale */
[data-theme="dark"] {
  --bg: #121212;
  --card: #1e1e1e;
  --text: #e5e5e5;
  --input-bg: #2a2a2a;
  --input-border: #444;
}

/* Tema chiaro manuale */
[data-theme="light"] {
  --bg: #f5f5f5;
  --card: #ffffff;
  --text: #222;
  --input-bg: #fff;
  --input-border: #ccc;
}

/* Tema automatico (segue il sistema) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --bg: #121212;
    --card: #1e1e1e;
    --text: #e5e5e5;
    --input-bg: #2a2a2a;
    --input-border: #444;
  }
}

/* Applica le variabili */
body {
  background: var(--bg);
  color: var(--text);
}

.card,
.filters-dropdown,
.total-card,
.modal-content {
  background: var(--card);
  color: var(--text);
}

input,
select {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text);
}

/* Pulsante tema */
.theme-toggle {
  position: fixed;
  top: 12px;
  right: 12px;
  background: var(--card);
  border: 1px solid var(--input-border);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 9999;
}

/* ============================
   🖥 LAYOUT DESKTOP (≥ 1024px)
============================ */
@media (min-width: 1024px) {

  /* Wrapper principale a due colonne */
  .home-grid {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 50% - 50% */
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px 0;
  }

  /* Colonna sinistra (form) */
  .col-left {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Colonna destra (lista + totali) */
  .col-right {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* La card Aggiungi Spesa non deve allungarsi */
  .col-left > .p-card {
    height: fit-content;
  }

  /* La lista spese occupa lo spazio verticale */
  .col-right {
    min-height: 100%;
  }

  /* La tua app non deve essere limitata a 480px su desktop */
  .app {
    max-width: 100%;
    padding: 20px 40px;
  }

  /* Totali più larghi e armonizzati */
  .total-card {
    height: 150px;
  }
}

</style>
