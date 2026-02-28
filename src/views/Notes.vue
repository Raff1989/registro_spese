<template>
  <div class="notes-wrapper">

    <h2 class="title">
      Blocco Note
      <Button
        icon="pi pi-clock"
        class="btn-history"
        @click="openHistoryModal"
      />
    </h2>

    <!-- Aggiungi prodotto -->
    <div class="add-row">
      <InputText
        v-model="newNote"
        placeholder="Aggiungi un prodotto..."
        class="input-note"
      />
      <Button label="+" class="btn-add" @click="addNote" />
    </div>

    <!-- Lista prodotti -->
    <div class="notes-list">
      <div v-for="(item, index) in notes" :key="index" class="note-item">

        <Checkbox v-model="item.done" :binary="true" />

        <div class="note-main">
          <span class="note-text" :class="{ done: item.done }">
            {{ item.text }}
          </span>

          <!-- Prezzo attuale / precedente -->
          <div
            class="price-summary"
            v-if="item.currentPrice !== null && item.currentPrice !== undefined"
          >
            <span class="current-price">
              {{ Number(item.currentPrice).toFixed(2) }}€
            </span>

            <span
              v-if="item.previousPrice !== null && item.previousPrice !== undefined"
              class="price-badge"
              :class="{
                up: item.currentPrice > item.previousPrice,
                down: item.currentPrice < item.previousPrice,
                same: item.currentPrice === item.previousPrice
              }"
            >
              <template v-if="item.currentPrice > item.previousPrice">↑</template>
              <template v-else-if="item.currentPrice < item.previousPrice">↓</template>
              <template v-else>=</template>
            </span>
          </div>

          <!-- Inserimento prezzo + supermercato -->
          <div class="price-row">
            <InputText
              v-model="item.price"
              type="text"
              inputmode="decimal"
              placeholder="Prezzo"
              class="price-input"
              @input="onPriceInput(item)"
            />

            <InputText
              v-model="item.store"
              placeholder="Supermercato"
              class="store-input"
              @input="item.confirmed = false"
            />

            <Button
              v-if="!item.confirmed"
              icon="pi pi-check"
              class="btn-confirm"
              @click="confirmPrice(item)"
            />
          </div>
        </div>

        <Button
          icon="pi pi-trash"
          class="btn-delete"
          @click="removeNote(index)"
        />
      </div>
    </div>

    <!-- MODALE STORICO -->
    <Dialog
      v-model:visible="historyVisible"
      modal
      :closable="true"
      :style="{ width: '90%', maxWidth: '400px' }"
    >
      <template #header>
        <div class="history-header">
          <span>Storico prezzi</span>

          <Button
            icon="pi pi-filter"
            class="btn-filter-open"
            @click="toggleFilterPanel"
          />
        </div>
      </template>

      <!-- Pannello filtri -->
      <div v-if="filterPanelVisible" class="filter-panel">
        <InputText
          v-model="filterProduct"
          placeholder="Filtra per prodotto"
          class="filter-input"
        />

        <InputText
          v-model="filterStore"
          placeholder="Filtra per supermercato (opzionale)"
          class="filter-input"
        />

        <div class="filter-buttons">
          <Button
            label="Applica"
            class="btn-filter-apply"
            @click="applyFilters"
          />

          <Button
            label="Reset"
            class="btn-filter-reset"
            @click="resetFilters"
          />
        </div>
      </div>

      <!-- Lista storico -->
      <div v-if="selectedHistory.length === 0">
        Nessun dato disponibile.
      </div>

      <div v-else class="history-list">
        <div v-for="(entry, i) in selectedHistory" :key="i" class="history-item">

          <div class="history-left">
            <div class="history-product">{{ entry.text }}</div>
            <div class="history-store">{{ entry.store }}</div>
          </div>

          <div class="history-right">
            <div
              class="history-current"
              v-if="entry.currentPrice !== null && entry.currentPrice !== undefined"
            >
              Attuale: <strong>{{ Number(entry.currentPrice).toFixed(2) }}€</strong>
            </div>

            <div
              class="history-previous"
              v-if="entry.previousPrice !== null && entry.previousPrice !== undefined"
            >
              Precedente: {{ Number(entry.previousPrice).toFixed(2) }}€
            </div>

            <div class="history-date">
              {{ formatDate(entry.lastUpdate) }}
            </div>
          </div>

          <Button
            icon="pi pi-trash"
            class="btn-history-delete"
            @click="deleteHistoryEntry(entry)"
          />
        </div>
      </div>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";

/* ============================
   CARICAMENTO DATI
============================ */
const notes = ref(JSON.parse(localStorage.getItem("notes") || "[]"));
const priceHistory = ref(JSON.parse(localStorage.getItem("priceHistory") || "[]"));
const newNote = ref("");

/* ============================
   MIGRAZIONE DATI
============================ */
function migrateData() {
  notes.value = notes.value.map(n => ({
    text: n.text ?? "",
    done: n.done ?? false,
    price: n.price ?? "",
    store: n.store ?? "",
    previousPrice: n.previousPrice ?? null,
    currentPrice: n.currentPrice ?? null,
    confirmed: n.confirmed ?? false,
    history: Array.isArray(n.history) ? n.history : []
  }));

  priceHistory.value = priceHistory.value.map(h => ({
    text: h.text ?? "",
    store: h.store ?? "",
    previousPrice: h.previousPrice ?? null,
    currentPrice: h.currentPrice ?? h.price ?? null,
    lastUpdate: h.lastUpdate ?? h.date ?? new Date().toISOString()
  }));
}

migrateData();

/* ============================
   SALVATAGGIO AUTOMATICO
============================ */
watch(notes, val => {
  localStorage.setItem("notes", JSON.stringify(val));
}, { deep: true });

watch(priceHistory, val => {
  localStorage.setItem("priceHistory", JSON.stringify(val));
}, { deep: true });

/* ============================
   AGGIUNTA PRODOTTO
============================ */
function addNote() {
  if (!newNote.value.trim()) return;

  notes.value.push({
    text: newNote.value,
    done: false,
    price: "",
    store: "",
    previousPrice: null,
    currentPrice: null,
    confirmed: false,
    history: []
  });

  newNote.value = "";
}

/* ============================
   INPUT PREZZO
============================ */
function onPriceInput(item) {
  item.confirmed = false;
}

/* ============================
   CONFERMA PREZZO
============================ */
function confirmPrice(item) {
  const newPrice = Number(String(item.price).replace(",", "."));

  if (isNaN(newPrice)) {
    alert("Inserisci un prezzo valido.");
    return;
  }

  const store = item.store || "";

  const existing = priceHistory.value.find(
    h => h.text === item.text && h.store === store
  );

  if (!existing) {
    priceHistory.value.push({
      text: item.text,
      store: store,
      previousPrice: null,
      currentPrice: newPrice,
      lastUpdate: new Date().toISOString()
    });
  } else {
    existing.previousPrice = existing.currentPrice;
    existing.currentPrice = newPrice;
    existing.lastUpdate = new Date().toISOString();
  }

  item.previousPrice = existing ? existing.previousPrice : null;
  item.currentPrice = newPrice;

  item.confirmed = true;
}

/* ============================
   MODALE STORICO
============================ */
const historyVisible = ref(false);
const selectedHistory = ref([]);

function openHistoryModal() {
  filterPanelVisible.value = false;
  filterProduct.value = "";
  filterStore.value = "";

  selectedHistory.value = [...priceHistory.value]
    .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

  historyVisible.value = true;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ============================
   FILTRI STORICO
============================ */
const filterPanelVisible = ref(false);
const filterProduct = ref("");
const filterStore = ref("");

function toggleFilterPanel() {
  filterPanelVisible.value = !filterPanelVisible.value;
}

function applyFilters() {
  selectedHistory.value = priceHistory.value
    .filter(entry => {
      const matchProduct =
        filterProduct.value.trim() === "" ||
        entry.text.toLowerCase().includes(filterProduct.value.toLowerCase());

      const matchStore =
        filterStore.value.trim() === "" ||
        entry.store.toLowerCase().includes(filterStore.value.toLowerCase());

      return matchProduct && matchStore;
    })
    .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

  filterPanelVisible.value = false;
}

function resetFilters() {
  filterProduct.value = "";
  filterStore.value = "";
  applyFilters();
}

/* ============================
   DELETE SINGOLA STORICO
============================ */
function deleteHistoryEntry(entry) {
  priceHistory.value = priceHistory.value.filter(h =>
    !(h.text === entry.text && h.store === entry.store)
  );

  applyFilters();
}

/* ============================
   RIMOZIONE PRODOTTO
============================ */
function removeNote(index) {
  notes.value.splice(index, 1);
}
</script>




<style scoped>
.notes-wrapper {
  padding: 16px;
  max-width: 500px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
  background: #ffffff;
}

/* Titolo + bottone storico */
.title {
  font-size: 1.4rem;
  margin-bottom: 16px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.btn-history {
  width: 32px;
  height: 32px;
  padding: 0;
}

/* ============================
   MODALE STORICO
============================ */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  padding: 12px;
  border-radius: 8px;
  background: #f2f2f2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}


.history-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-product {
  font-weight: bold;
  font-size: 1rem;
}

.history-store {
  font-size: 0.9rem;
  color: #555;
}

.history-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-current {
  font-size: 0.95rem;
  color: #28a745;
  font-weight: bold;
}

.history-previous {
  font-size: 0.85rem;
  color: #d9534f;
}

.history-date {
  font-size: 0.75rem;
  color: #777;
}

.history-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 1.1rem;
  font-weight: bold;
}

.btn-history-delete {
  width: 28px;
  height: 28px;
  padding: 0;
  color: #d9534f;
  margin-left: 8px;
}


.btn-filter-open {
  width: 32px;
  height: 32px;
  padding: 0;
}

.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f7f7f7;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.filter-input {
  width: 100%;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.btn-filter-apply {
  flex: 1;
  background: #007bff;
  color: white;
}

.btn-filter-reset {
  flex: 1;
  background: #6c757d;
  color: white;
}


.filter-input {
  width: 100%;
}

.btn-filter,
.btn-reset {
  width: 100%;
  padding: 6px;
  font-size: 0.9rem;
}

.btn-filter {
  background: #007bff;
  color: white;
}

.btn-reset {
  background: #6c757d;
  color: white;
}


/* ============================
   LISTA NOTE
============================ */
.add-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.input-note {
  flex: 1;
  width: 100%;
}

.btn-add {
  width: 48px;
  height: 48px;
  padding: 0;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #f7f7f7;
}

.note-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.note-text {
  font-size: 1rem;
  padding-left: 4px;
}

.note-text.done {
  text-decoration: line-through;
  opacity: 0.6;
}

/* Prezzo attuale / precedente */
.price-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
}

.current-price {
  font-weight: bold;
}

.price-badge {
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
}

.price-badge.up {
  color: #d9534f;
  background: #f8d7da;
}

.price-badge.down {
  color: #28a745;
  background: #d4edda;
}

.price-badge.same {
  color: #6c757d;
  background: #e2e3e5;
}

/* Inserimento prezzo */
.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 90px;
}

.store-input {
  width: 100%;
}

/* Pulsante conferma ✔ */
.btn-confirm {
  width: 45px;
  height: 32px;
  padding: 0;
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

}

/* Pulsante fotocamera */
.btn-scan {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Pulsante delete */
.btn-delete {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9534f;
    background-color: transparent;
  border: none;
}

.scan-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}

.loader-box {
  background: #fff;
  padding: 18px 26px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.loader-text {
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

.scan-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99998;
  pointer-events: none;
}

.scan-box {
  position: absolute;
  top: 30%;
  left: 50%;
  width: 70%;
  height: 120px;
  transform: translateX(-50%);
  border: 3px solid #00ff88;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0,255,150,0.6);
  pointer-events: none;
}

.btn-cancel-scan {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  pointer-events: auto;
  background: #ff4444;
  color: white;
  border-radius: 8px;
  padding: 10px 20px;
}



/* Mobile */
@media (max-width: 480px) {
  .btn-add {
    width: 42px;
    height: 42px;
  }

  .btn-delete {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9534f;
  background-color: transparent;
  border: none;
  }

  .btn-confirm {
  width: 45px;
  height: 32px;
  padding: 0;
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

}
}
</style>


