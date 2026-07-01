<template>
  <div class="barcode-container">
    <canvas ref="barcodeCanvas"></canvas>
    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import bwipjs from 'bwip-js';

const props = defineProps({
  value: { type: String, required: true },
  format: { type: String, default: 'ean13' } // ean13, code128, qr
});

const barcodeCanvas = ref(null);
const error = ref(null);

const generateBarcode = () => {
  if (!props.value) return;
  
  error.value = null;
  try {
    // In BarcodeGenerator.vue
    bwipjs.toCanvas(barcodeCanvas.value, {
    bcid: props.format,
    text: props.value,
    scale: 4,          // Aumentato da 3 a 4 per massima leggibilità
    height: 20,         // Leggermente più alto
    includetext: true,
    textxalign: 'center',
    });
  } catch (e) {
    error.value = "Formato non valido per questo codice";
    console.error(e);
  }
};

onMounted(generateBarcode);
watch(() => props.value, generateBarcode);
</script>

<style scoped>
.barcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  background: white;
  padding: 10px;
  border-radius: 8px;
}
canvas {
  max-width: 100%;
  height: auto !important;
}
.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 5px;
}
</style>