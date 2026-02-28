<template>
  <div class="custom-select">
    <div class="selected" @click="open = !open">
      <img :src="selected.icon" width="22" />
      <span>{{ selected.label }}</span>
      <span class="arrow">▼</span>
    </div>

    <div v-if="open" class="options">
      <div
        v-for="opt in options"
        :key="opt.value"
        class="option"
        @click="select(opt)"
      >
        <img :src="opt.icon" width="22" />
        <span>{{ opt.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const options = [
  { value: "Spesa", label: "Spesa", icon: "/assets/shopping_cart.svg" },
  { value: "Indumenti/Acc.", label: "Indumenti/Acc.", icon: "/assets/shirt.svg" },
  { value: "Carburante", label: "Carburante", icon: "/assets/gasoline.svg" },
  { value: "Bollo", label: "Bollo/Revisione", icon: "/assets/bollo.svg" },
  { value: "Tagliando", label: "Tagliando/Manuten.", icon: "/assets/engine.svg" },
  { value: "RcAuto", label: "RcAuto", icon: "/assets/car.svg" },
  { value: "Polizze", label: "Polizze", icon: "/assets/insurance_policy.svg" },
  { value: "Casa", label: "Casa", icon: "/assets/house.svg" },
  { value: "Parrucchiere/estet.", label: "Parrucchiere", icon: "/assets/barbershop.svg" },
  { value: "CuraPersonale", label: "Cura Personale", icon: "/assets/skin_care.svg" },
  { value: "Farmacia", label: "Farmacia", icon: "/assets/pharmacy.svg" },
  { value: "Svago", label: "Svago", icon: "/assets/coffee.svg" },
  { value: "Pelosetti", label: "Pelosetti", icon: "/assets/paw.svg" },
  { value: "Parcheggi/Pedaggi", label: "Parcheggi/Pedaggi", icon: "/assets/parking.svg" },
  { value: "Affitto", label: "Affitto", icon: "/assets/rent.svg" },
  { value: "Mutuo/Fin.", label: "Mutuo/Fin.", icon: "/assets/mortgage.svg" },
  { value: "Lavoro", label: "Lavoro", icon: "/assets/job.svg" },
  { value: "Utenze", label: "Utenze", icon: "/assets/light_bulb.svg" },
  { value: "Altro", label: "Altro", icon: "/assets/emoticon.svg" }
];

defineExpose({ options });


const open = ref(false);
const selected = ref(options[0]);

// sincronizza modelValue → selected
// watch(() => props.modelValue, (val) => {
//   if (val) selected.value = val;
// });

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return;

    // Se modelValue è una stringa (categoria salvata), trova l’oggetto corretto
    if (typeof val === "string") {
      const found = options.find(o => o.value === val);
      if (found) selected.value = found;
    }

    // Se è già un oggetto (creazione), usalo direttamente
    else if (typeof val === "object") {
      selected.value = val;
    }
  },
  { immediate: true }
);


function select(opt) {
  selected.value = opt;
  emit("update:modelValue", opt); // emettiamo l’oggetto completo
  open.value = false;
}
</script>

<style scoped>
.custom-select {
  width: 100%;
  position: relative;
}

.selected {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.arrow {
  margin-left: auto;
  opacity: 0.6;
}

.options {
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 4px;
  z-index: 9999;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
}

.option:hover {
  background: #f0f0f0;
}
</style>
