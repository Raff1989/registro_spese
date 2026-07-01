<template>
  <div class="notes-wrapper">
    <h2 class="title">
      Blocco Note
      <Button
        icon="pi pi-clock"
        class="btn-filter-minimal"
        @click="openHistoryModal"
      />
    </h2>
    <Toast />
    <div class="add-row">
      <InputText
        v-model="newNote"
        placeholder="Cosa devi comprare?..."
        class="input-note"
        @keyup.enter="addNote"
      />
      <Button icon="pi pi-plus" class="btn-filter-minimal" @click="addNote" />
    </div>

    <div class="notes-list">
      <div v-for="(item, index) in notes" :key="index" class="note-item">
        
        <div class="note-header">
          <Checkbox v-model="item.done" :binary="true" />
          
          <div class="note-main">
            <span class="note-text" :class="{ done: item.done }">
              {{ item.text }}
            </span>
          </div>

          <Button
            icon="pi pi-trash"
            class="btn-delete-ghost"
            @click="removeNote(index)"
          />
        </div>

        <div class="price-summary" v-if="item.currentPrice !== null && item.currentPrice !== undefined">
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
            <i :class="item.currentPrice > item.previousPrice ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" style="font-size: 0.7rem;"></i>
            {{ item.currentPrice > item.previousPrice ? ' Più caro' : ' Meno caro' }}
          </span>
        </div>
        <div class="qty-summary" v-if="item.currentPrice">
          <small>
            {{ item.quantity }} × {{ Number(item.currentPrice).toFixed(2) }}€ =
            <strong>{{ (item.quantity * item.currentPrice).toFixed(2) }}€</strong>
          </small>
        </div>


        <div class="price-row">
        <InputText
          v-model="item.price"
          inputmode="decimal"
          placeholder="€"
          class="price-input"
          @input="onPriceInput(item)"
        />

        <InputText
          v-model.number="item.quantity"
          inputmode="numeric"
          placeholder="Qtà"
          class="qty-input"
          @input="item.confirmed = false"
        />

        <InputText
          v-model="item.store"
          placeholder="Negozio..."
          class="store-input"
          @input="item.confirmed = false"
        />

        <Button
          v-if="!item.confirmed"
          icon="pi pi-check"
          class="btn-confirm-minimal"
          @click="confirmPrice(item)"
        />
      </div>

      </div>
    </div>

    <div class="total-box" v-if="totalList > 0">
      <small>Totale Stimato</small>
      <strong>{{ totalList.toFixed(2) }} €</strong>
    </div>

<Dialog
  v-model:visible="historyVisible"
  modal
  :draggable="false"
  :style="{ width: '95%', maxWidth: '450px' }"
  class="modern-dialog"
>
  <template #header>
    <div class="history-header">
      <span style="font-weight: 800; font-size: 1.2rem;">Storico Prezzi</span>
      <Button
        icon="pi pi-filter"
        class="btn-filter-minimal"
        :class="{ 'filter-active': filterPanelVisible }"
        @click="toggleFilterPanel"
      />
    </div>
  </template>

  <div v-if="filterPanelVisible" class="filter-section">
    <div class="p-inputgroup mb-2">
      <span class="p-inputgroup-addon"><i class="pi pi-tag"></i></span>
      <InputText v-model="filterProduct" placeholder="Filtra prodotto..." @input="applyFilters" />
    </div>
    <div class="p-inputgroup mb-3">
      <span class="p-inputgroup-addon"><i class="pi pi-shopping-cart"></i></span>
      <InputText v-model="filterStore" placeholder="Filtra negozio..." @input="applyFilters" />
    </div>
    <div class="flex gap-2">
      <Button label="Reset" icon="pi pi-refresh" class="p-button-text p-button-sm" @click="resetFilters" />
      <Button label="Chiudi Filtri" icon="pi pi-check" class="p-button-sm flex-grow-1" @click="toggleFilterPanel" />
    </div>
    <hr class="my-3" style="opacity: 0.1">
  </div>

  <div class="history-container">
    <div v-if="selectedHistory.length === 0" class="empty-state">
      <i class="pi pi-search" style="font-size: 2rem; opacity: 0.3;"></i>
      <p>Nessun prezzo trovato</p>
    </div>

  <div v-for="(entry, idx) in selectedHistory" :key="idx" class="history-card">
      <div class="history-card-main">
        <div class="history-info">
          <span class="history-product">{{ entry.text }}</span>
          <span class="history-store"><img src="/assets/gps.svg" style="width: 20px;height: 20px;" alt="gps"> {{ entry.store }}</span>
        </div>
        <div class="history-pricing">
          <div class="price-comparison" v-if="entry.previousPrice !== null">
            <span class="old-price">{{ Number(entry.previousPrice).toFixed(2) }}€</span>
            <i class="pi pi-arrow-right" style="font-size: 0.7rem; color: #8e8e93;"></i>
          </div>
          
          <span class="history-current">{{ Number(entry.currentPrice).toFixed(2) }}€</span>
          
          <span v-if="entry.previousPrice" class="history-diff" :class="entry.currentPrice > entry.previousPrice ? 'up' : 'down'">
            <i :class="entry.currentPrice > entry.previousPrice ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
          </span>
        </div>
      </div>
      
        <div class="history-footer">
          <small class="history-date">Ultimo aggiornamento: {{ formatDate(entry.lastUpdate) }}</small>
          <Button 
            icon="pi pi-trash" 
            class="p-button-text p-button-danger p-button-sm btn-delete-history" 
            @click="deleteHistoryEntry(entry)"
          />
        </div>
    </div>
  </div>
</Dialog>
  </div>
</template>
 
<script setup>
import { ref, watch, computed } from "vue";
import { useToast } from "primevue/usetoast"; 
import Toast from "primevue/toast";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";

/* ============================
    CARICAMENTO E MIGRAZIONE
============================ */
const toast = useToast();
const notes = ref(JSON.parse(localStorage.getItem("notes") || "[]"));
const priceHistory = ref(JSON.parse(localStorage.getItem("priceHistory") || "[]"));
const newNote = ref("");

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
    LOGICA CORE (Inalterata)
============================ */
const totalList = computed(() => {
  return notes.value.reduce((sum, item) => {
    const price = Number(String(item.currentPrice ?? item.price).replace(",", "."));
    const qty = item.quantity || 1;
    return !isNaN(price) ? sum + price * qty : sum;
  }, 0);
});


watch(notes, val => { localStorage.setItem("notes", JSON.stringify(val)); }, { deep: true });
watch(priceHistory, val => { localStorage.setItem("priceHistory", JSON.stringify(val)); }, { deep: true });

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
    history: [],
    quantity: 1   // 👈 NUOVO
  });
  newNote.value = "";
}

function onPriceInput(item) { item.confirmed = false; }

function confirmPrice(item) {
  const newPrice = Number(String(item.price).replace(",", "."));
  if (isNaN(newPrice) || item.price === "") return;

  const store = item.store || "Generico";
  
  // Cerchiamo se esiste già questo prodotto in questo negozio nello storico
  const existingIndex = priceHistory.value.findIndex(h => 
    h.text.toLowerCase() === item.text.toLowerCase() && 
    h.store.toLowerCase() === store.toLowerCase()
  );

  if (existingIndex !== -1) {
    // SE ESISTE:
    // 1. Il prezzo che era "attuale" diventa "precedente"
    priceHistory.value[existingIndex].previousPrice = priceHistory.value[existingIndex].currentPrice;
    // 2. Il nuovo prezzo diventa quello "attuale"
    priceHistory.value[existingIndex].currentPrice = newPrice;
    priceHistory.value[existingIndex].lastUpdate = new Date().toISOString();
    
    // Aggiorniamo l'item nella lista della spesa per il feedback visivo immediato
    item.previousPrice = priceHistory.value[existingIndex].previousPrice;
  } else {
    // SE È NUOVO:
    priceHistory.value.push({
      text: item.text,
      store: store,
      previousPrice: null, // Nessun prezzo precedente ancora
      currentPrice: newPrice,
      lastUpdate: new Date().toISOString()
    });
    item.previousPrice = null;
  }

  item.currentPrice = newPrice;
  item.total = newPrice * (item.quantity || 1); // 👈 NUOVO
  item.confirmed = true;

  // Sincronizziamo il LocalStorage
  localStorage.setItem("priceHistory", JSON.stringify(priceHistory.value));
  
  // Aggiorniamo la vista della modale
  applyFilters();

  toast.add({
    severity: "success",
    summary: "Storico Aggiornato",
    detail: `${item.text} salvato a ${newPrice.toFixed(2)}€`,
    life: 2000
  });
}
/* ============================
    MODALE E FILTRI
============================ */
const historyVisible = ref(false);
const selectedHistory = ref([]);
const filterPanelVisible = ref(false);
const filterProduct = ref("");
const filterStore = ref("");

function openHistoryModal() {
  filterPanelVisible.value = false;
  filterProduct.value = "";
  filterStore.value = "";
  selectedHistory.value = [...priceHistory.value].sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
  historyVisible.value = true;
}

function toggleFilterPanel() { filterPanelVisible.value = !filterPanelVisible.value; }

function applyFilters() {
  selectedHistory.value = priceHistory.value
    .filter(entry => {
      const matchProduct = filterProduct.value.trim() === "" || entry.text.toLowerCase().includes(filterProduct.value.toLowerCase());
      const matchStore = filterStore.value.trim() === "" || entry.store.toLowerCase().includes(filterStore.value.toLowerCase());
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

function deleteHistoryEntry(entry) {
  // Rimuovi dallo storico principale
  priceHistory.value = priceHistory.value.filter(h => 
    !(h.text === entry.text && h.store === entry.store)
  );
  applyFilters(); 
}

function removeNote(index) { notes.value.splice(index, 1); }

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
</script>

<style scoped>
/* --- BASE --- */
.notes-wrapper {
  padding: 16px;
  max-width: 500px;
  margin: 0 auto;
  min-height: 100vh;
  /* background: #f8f9fa; */
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  margin-bottom: 25px;
  color: #1c1c1e;
}

/* --- AGGIUNGI RIGA --- */
.add-row {
  display: flex;
  align-items: center;
  background: white;
  padding: 6px 6px 6px 20px;
  border-radius: 40px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 25px;
}
.input-note { flex: 1; border: none !important; box-shadow: none !important; }
.btn-add { width: 42px !important; height: 42px !important; border-radius: 50% !important; background: #007aff !important; border: none !important; }

/* --- CARDS NOTE --- */
.note-item {
  background: white;
  border-radius: 24px;
  padding: 18px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #f1f1f1;
}

.note-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.note-main { flex: 1; }
.note-text { font-weight: 700; font-size: 1.1rem; color: #1c1c1e; }
.note-text.done { text-decoration: line-through; color: #8e8e93; opacity: 0.6; }

/* Riepilogo prezzi: rimosso margin-left 32px per allineare a sinistra */
.price-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-left: 2px;
}

.current-price { font-weight: 800; color: #1c1c1e; font-size: 1.05rem; }

.price-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 700;
}
.price-badge.up { background: #fee2e2; color: #ef4444; }
.price-badge.down { background: #dcfce7; color: #22c55e; }
.price-badge.same { background: #f3f4f6; color: #6b7280; }

/* Riga Input: allineata a sinistra */
.price-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.price-input { width: 80px !important; }
.store-input { flex: 1 !important; }
.price-input, .store-input {
  background: #f2f2f7 !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 10px 12px !important;
  font-size: 0.9rem;
  min-width: 130px;
  max-width: 200px;
}


/* Pulsante conferma: Senza background, icona verde */
.btn-confirm-minimal {
  background: transparent !important;
  border: none !important;
  color: #22c55e !important;
  font-size: 1.2rem !important;
  padding: 0 5px !important;
  box-shadow: none !important;
}

.btn-delete-ghost {
  background: transparent !important;
  border: none !important;
  color: #ff3b30 !important;
  padding: 0 !important;
}

/* --- TOTAL & DIALOG (Invariati per stile) --- */
.total-box {
  margin-top: 25px; background: #007aff; color: white; padding: 20px;
  border-radius: 24px; text-align: center; box-shadow: 0 10px 20px rgba(0, 122, 255, 0.2);
}
.total-box small { display: block; font-size: 0.8rem; opacity: 0.8; }
.total-box strong { font-size: 1.5rem; }

:deep(.modern-dialog) { border-radius: 28px !important; }
.history-header { display: flex; justify-content: space-between; width: 100%; align-items: center; }
.btn-filter-minimal { background: transparent !important; border: none !important; color: #007aff !important; }

/* --- STILI DIALOG STORICO --- */
.history-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 4px;
}

.history-card {
  background: #f8f9fa;
  border-radius: 18px;
  padding: 14px;
  border: 1px solid #eee;
}

.history-card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-info {
  display: flex;
  flex-direction: column;
}

.history-product {
  font-weight: 700;
  font-size: 1rem;
  color: #1c1c1e;
}

.history-store {
  font-size: 0.8rem;
  color: #8e8e93;
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
}

.history-pricing {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-current {
  font-weight: 800;
  font-size: 0.85rem;
  color: #22c55e;
}

.history-diff {
  font-size: 0.7rem;
  padding: 2px 4px;
  border-radius: 4px;
}
.history-diff.up { color: #ef4444; }
.history-diff.down { color: #22c55e; }

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-top: 8px;
}

.history-date {
  color: #aeaeb2;
  font-size: 0.75rem;
}

.btn-delete-history {
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #8e8e93;
}

.filter-active {
  background: #e1f0ff !important;
  border-radius: 50%;
}

.price-comparison {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: 5px;
}

.old-price {
  font-size: 0.85rem;
  color: #8e8e93;
  text-decoration: line-through;
  opacity: 0.8;
  color: #ef4444;
}

.history-pricing {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 5px 10px;
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.history-diff.up { background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 6px; margin-left: 5px; }
.history-diff.down { background: #dcfce7; color: #22c55e; padding: 2px 6px; border-radius: 6px; margin-left: 5px; }

.qty-input {
  width: 60px !important;
  background: #f2f2f7 !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 10px 12px !important;
  font-size: 0.9rem;
  text-align: center;
}
.qty-summary {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #1c1c1e;
  opacity: 0.8;
}
 
</style>