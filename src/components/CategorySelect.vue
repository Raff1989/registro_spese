<template>
  <Dropdown
    v-model="selected"
    :options="options"
    optionLabel="label"
    placeholder="Seleziona una categoria"
    class="custom-category-dropdown" 
    @change="onSelect"
  >
    <template #value="slotProps">
      <div v-if="slotProps.value" class="flex items-center gap-2">
        <img :src="slotProps.value.icon" width="22" />
        <span>{{ slotProps.value.label }}</span>
      </div>
      <span v-else>{{ slotProps.placeholder }}</span>
    </template>

    <template #option="slotProps">
      <div class="flex items-center gap-2">
        <img :src="slotProps.option.icon" width="22" />
        <span>{{ slotProps.option.label }}</span>
      </div>
    </template>

    <template #dropdownicon="{ isOpen }">
      <span class="arrow-icon" :class="{ 'is-open': isOpen }">▼</span>
    </template>
  </Dropdown>
</template>

<script setup>
import { ref, watch } from "vue";
import Dropdown from 'primevue/dropdown';

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

const selected = ref(null);

// Sincronizzazione ingresso
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
        selected.value = options[0];
        return;
    }
    if (typeof val === "string") {
      selected.value = options.find(o => o.value === val) || options[0];
    } else {
      selected.value = val;
    }
  },
  { immediate: true }
);

function onSelect(event) {
  emit("update:modelValue", event.value);
}
</script>

<style scoped>
/* 1. Forza l'altezza e il contenitore principale */
.custom-category-dropdown {
    width: 100%;
    height: 45px;
    display: flex;
    align-items: center;
    border: none;
}

/* 2. USA GLOBAL per colpire le classi interne di PrimeVue */
:global(.p-dropdown.custom-category-dropdown) {
    border-radius: 25px !important;

    border: none;
}

/* 3. Arrotonda l'area dell'etichetta interna */
:global(.custom-category-dropdown .p-dropdown-label) {
    display: flex;
    align-items: center;
    padding-left: 15px;
    border-radius: 25px;
    border: none;
}

/* 4. STONDA IL PANNELLO (quello che non si stondava) */
/* Questa classe è spesso fuori dallo scope del componente */
:global(.p-dropdown-panel) {
    border-radius: 15px !important;
    overflow: hidden !important;
    margin-top: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    border: 1px solid #e0e0e0 !important;
    border: none;
}

/* 5. Arrotonda anche gli elementi interni della lista (hover effect) */
:global(.p-dropdown-items-wrapper) {
    border-radius: 15px !important;
    border: none;
}

/* Stili per la tua freccia personalizzata */
.arrow-icon {
    font-size: 0.8rem;
    transition: transform 0.3s ease;
    opacity: 0.6;
    margin-right: 15px;
}

.arrow-icon.is-open {
    transform: rotate(180deg);
}

.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 10px; }
</style>