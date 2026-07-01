<template>
  <main class="wallet-wrapper">
    <div class="header-section p-4 flex align-items-center justify-content-between" style="margin-top: 25px;">
      <h2 class="m-0">Le mie Carte</h2>
      <Button icon="pi pi-plus" class="add-btn-main shadow-2" @click="showAddOptions = true" />
    </div>

    <div class="hidden-barcode-generator">
      <div v-for="card in cards" :key="'gen-' + card.date" :id="'barcode-raw-' + card.date">
        <BarcodeGenerator :value="card.code" :width="2" :height="100" />
      </div>
    </div>

    <draggable v-model="cards" item-key="date" class="cards-grid px-3" ghost-class="ghost-card" :delay="500" :delay-on-touch-only="true" animation="250">
      <template #item="{ element, index }">
        <div class="flip-container" :class="{ 'is-flipped': selectedCard?.date === element.date }">
          <div class="flipper">
            
            <div class="loyalty-tile front" :style="{ background: element.color }" @click="toggleFlip(element)">
              <span class="tile-label" :class="{ 'dark-text': isLightColor(element.color) }">
                {{ element.store }}
              </span>
            </div>

            <div class="loyalty-tile back">
              <div class="back-content">
                <div class="back-header">
                  <Button icon="pi pi-refresh" class="nav-icon-btn shadow-1" @click.stop="toggleFlip(null)" />
                  <div class="flex-grow-1"></div>
                  <Button icon="pi pi-ellipsis-v" class="nav-icon-btn shadow-1" @click.stop="activeActionMenu = element.date" />
                </div>

                <div class="back-body">
                  <div class="barcode-main-container">
                    <Image v-if="cardImages[element.date]" :src="cardImages[element.date]" alt="Barcode" preview class="barcode-preview-comp" />
                    <Skeleton v-else width="140px" height="70px" borderRadius="12px" />
                  </div>
                </div>

                <div class="back-footer">
                  <p class="serial-number">{{ formatCode(element.code) }}</p>
                </div>

                <div v-if="activeActionMenu === element.date" class="actions-overlay" @click.stop>
                  <div class="actions-popup shadow-4">
                    <div class="action-item" @click="triggerEdit(element, index)">
                      <i class="pi pi-pencil"></i><span>Modifica</span>
                    </div>
                    <div class="divider"></div>
                    <div class="action-item delete-text" @click="triggerDelete(element)">
                      <i class="pi pi-trash"></i><span>Elimina</span>
                    </div>
                    <Button icon="pi pi-times" class="close-widget-btn" @click="activeActionMenu = null" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </template>
    </draggable>

    <Dialog v-model:visible="showManualForm" :header="getModalHeader" modal class="manual-dialog">
      <div class="flex flex-column gap-4 mt-2">
        <div class="preview-card-full shadow-4" :style="{ background: computedColorPreview }">
           <span :class="{ 'dark-text': isLightColor(computedColorPreview) }">{{ manualData.store || 'Nome Negozio' }}</span>
        </div>

        <span class="p-float-label mt-4">
          <InputText id="store" v-model="manualData.store" class="w-full" />
          <label for="store">Nome Negozio</label>
        </span>
        <span class="p-float-label mt-2">
          <InputText id="code" v-model="manualData.code" class="w-full" :disabled="isFromScan && !isEditing" />
          <label for="code">Codice</label>
        </span>

        <div class="color-picker-section">
          <div class="flex align-items-center justify-content-between mb-3">
            <label class="font-bold text-sm uppercase text-500">Stile Colore</label>
            <InputSwitch v-model="isGradient" />
          </div>
          <div class="picker-container p-3 border-round-xl flex justify-content-center align-items-center gap-4">
            <div class="picker-wrapper">
              <input type="color" v-model="color1" class="native-picker" />
              <div class="picker-preview" :style="{ background: color1 }"></div>
            </div>
            <i v-if="isGradient" class="pi pi-arrow-right text-400"></i>
            <div v-if="isGradient" class="picker-wrapper">
              <input type="color" v-model="color2" class="native-picker" />
              <div class="picker-preview" :style="{ background: color2 }"></div>
            </div>
          </div>
        </div>
        <Button label="Salva nel Wallet" class="w-full p-button-success p-button-lg shadow-2 border-none" @click="handleSave" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showAddOptions" header="Aggiungi" modal position="bottom" class="bottom-sheet">
      <div class="flex flex-column gap-3 p-2">
        <Button label="Scansiona Codice" icon="pi pi-camera" class="p-button-lg w-full border-none shadow-1" @click="handleScanner" />
        <Button label="Inserisci Manualmente" icon="pi pi-pencil" class="p-button-secondary p-button-lg w-full border-none shadow-1" @click="handleManual" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showDeleteConfirm" header="Elimina" modal position="bottom" class="bottom-sheet">
      <div class="p-3 text-center">
        <p>Eliminare <b>{{ itemToDelete?.store }}</b>?</p>
        <Button label="Elimina" icon="pi pi-trash" class="p-button-danger w-full mb-2 border-none" @click="confirmDeletion" />
        <Button label="Annulla" class="p-button-text w-full text-900" @click="showDeleteConfirm = false" />
      </div>
    </Dialog>
  </main>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'; // <--- AGGIUNTO
import draggable from 'vuedraggable';
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputSwitch from "primevue/inputswitch";
import Image from "primevue/image";
import Skeleton from "primevue/skeleton";
import BarcodeGenerator from "../components/BarcodeGenerator.vue";

const cards = ref(JSON.parse(localStorage.getItem("walletCards") || "[]"));
const cardImages = ref({});
const selectedCard = ref(null);
const activeActionMenu = ref(null);
const showAddOptions = ref(false);
const showManualForm = ref(false);
const showDeleteConfirm = ref(false);
const isEditing = ref(false);
const isFromScan = ref(false); // <--- AGGIUNTO
const editingIndex = ref(null);
const itemToDelete = ref(null);

const isGradient = ref(false);
const color1 = ref('#e30613');
const color2 = ref('#0050aa');
const manualData = ref({ store: '', code: '', color: '' });

const getModalHeader = computed(() => {
  if (isEditing.value) return "Modifica";
  return isFromScan.value ? "Conferma Scansione" : "Nuova Carta";
});

const computedColorPreview = computed(() => {
  return isGradient.value ? `linear-gradient(135deg, ${color1.value} 0%, ${color2.value} 100%)` : color1.value;
});

// --- LOGICA SCANNER AGGIUNTA ---
async function handleScanner() {
  showAddOptions.value = false;
  try {
    const status = await BarcodeScanner.requestPermissions();
    if (status.camera !== 'granted') return;

    const { barcodes } = await BarcodeScanner.scan();
    if (barcodes.length > 0) {
      isEditing.value = false;
      isFromScan.value = true;
      manualData.value = { store: '', code: barcodes[0].rawValue, color: '#e30613' };
      isGradient.value = false; color1.value = '#e30613';
      showManualForm.value = true;
    }
  } catch (e) { console.error("Scanner errore:", e); }
}

function handleManual() {
  isEditing.value = false;
  isFromScan.value = false;
  manualData.value = { store: '', code: '', color: '#e30613' };
  isGradient.value = false; color1.value = '#e30613';
  showAddOptions.value = false; showManualForm.value = true;
}

function toggleFlip(card) {
  activeActionMenu.value = null;
  selectedCard.value = (selectedCard.value?.date === card?.date) ? null : card;
}

async function generateBarcodeImage(cardId) {
  await nextTick();
  const raw = document.getElementById('barcode-raw-' + cardId);
  if (!raw) return;
  const el = raw.querySelector('svg') || raw.querySelector('canvas') || raw.querySelector('img');
  if (!el) return;
  if (el.tagName.toLowerCase() === 'svg') {
    cardImages.value[cardId] = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(el))));
  } else {
    cardImages.value[cardId] = el.toDataURL?.('image/png') || el.src;
  }
}

const generateAll = () => cards.value.forEach(c => generateBarcodeImage(c.date));

function triggerEdit(card, index) {
  isEditing.value = true; editingIndex.value = index; isFromScan.value = false;
  manualData.value = { ...card };
  if (card.color.includes('gradient')) {
    isGradient.value = true;
    const colors = card.color.match(/#[a-fA-F0-9]{6}/g);
    if (colors) { color1.value = colors[0]; color2.value = colors[1] || colors[0]; }
  } else {
    isGradient.value = false; color1.value = card.color;
  }
  activeActionMenu.value = null; selectedCard.value = null; showManualForm.value = true;
}

function handleSave() {
  const finalStyle = computedColorPreview.value;
  if (isEditing.value) cards.value[editingIndex.value] = { ...manualData.value, color: finalStyle };
  else cards.value.unshift({ ...manualData.value, color: finalStyle, date: Date.now() });
  showManualForm.value = false;
}

function triggerDelete(card) {
  itemToDelete.value = card; activeActionMenu.value = null; showDeleteConfirm.value = true;
}

function confirmDeletion() {
  cards.value = cards.value.filter(c => c.date !== itemToDelete.value.date);
  showDeleteConfirm.value = false; selectedCard.value = null;
}

function formatCode(c) { return c ? c.replace(/(\d{4})/g, '$1 ').trim() : ''; }

function isLightColor(c) {
  if (!c) return false;
  const hex = c.includes('gradient') ? color1.value : c;
  const r = parseInt(hex.substring(1,3),16), g = parseInt(hex.substring(3,5),16), b = parseInt(hex.substring(5,7),16);
  return (r*299 + g*587 + b*114)/1000 > 185;
}

watch(cards, () => {
  localStorage.setItem("walletCards", JSON.stringify(cards.value));
  generateAll();
}, { deep: true });

onMounted(generateAll);
</script>

<style scoped>
/* [I tuoi stili precedenti rimangono invariati] */
:deep(.p-button).nav-icon-btn, 
:deep(.p-button).add-btn-main,
:deep(.p-button).close-widget-btn {
  border: none !important;
  outline: none !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08) !important;
  background: white !important;
  color: #555 !important;
  border-radius: 50% !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  transition: all 0.2s ease;
}

:deep(.p-button).nav-icon-btn:active, 
:deep(.p-button).add-btn-main:active {
  transform: scale(0.92);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
}

.add-btn-main { color: #333 !important; font-size: 1.2rem; }
.cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px 12px; perspective: 1200px; }
.flip-container { aspect-ratio: 1.6 / 1; perspective: 1200px; }
.flipper { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
.flip-container.is-flipped .flipper { transform: rotateY(180deg); }
.loyalty-tile { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 20px; box-shadow: 0 8px 18px -6px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); }
.front { z-index: 2; transform: rotateY(0deg); display: flex; align-items: center; justify-content: center; }
.tile-label { font-weight: 900; text-transform: uppercase; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2); text-align: center; font-size: 0.95rem; padding: 0 10px; }
.tile-label.dark-text { color: #333; text-shadow: none; }
.back { background: #ffffff; transform: rotateY(180deg); }
.back-content { display: flex; flex-direction: column; height: 100%; width: 100%; padding: 10px; box-sizing: border-box; position: relative; }
.back-header { display: flex; align-items: center; height: 40px; z-index: 5; }
.back-body { flex-grow: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.barcode-main-container { width: 100%; max-width: 90%; display: flex; justify-content: center; }
:deep(.barcode-preview-comp img) { max-width: 100%; height: auto; border-radius: 8px; display: block; }
.back-footer { height: 25px; display: flex; align-items: center; justify-content: center; }
.serial-number { font-family: 'Courier New', monospace; font-size: 0.75rem; font-weight: bold; color: #777; margin: 0; letter-spacing: 0.5px; }
:global(.p-image-mask) { background: rgba(255, 255, 255, 0.82) !important; backdrop-filter: blur(14px) !important; }
.picker-container { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 16px; }
.picker-wrapper { position: relative; width: 44px; height: 44px; }
.native-picker { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2; }
.picker-preview { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 1; }
.actions-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); display: flex; align-items: flex-end; z-index: 20; border-radius: 20px; }
.actions-popup { background: white; width: 100%; border-radius: 20px 20px 0 0; padding: 12px; border-top: 1px solid #eee; }
.action-item { display: flex; align-items: center; gap: 12px; padding: 14px; font-weight: 800; color: #444; font-size: 0.9rem; }
.delete-text { color: #d63031; }
.divider { height: 1px; background: #f2f2f2; margin: 0 10px; }
.close-widget-btn { position: absolute !important; top: 6px !important; right: 6px !important; width: 28px !important; height: 28px !important; box-shadow: none !important; background: #f5f5f5 !important; }
.hidden-barcode-generator { position: absolute; left: -9999px; visibility: hidden; }
:deep(.bottom-sheet.p-dialog) { width: 100% !important; border-radius: 24px 24px 0 0; border: none; }
.preview-card-full { height: 125px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; letter-spacing: 1px; }
</style>