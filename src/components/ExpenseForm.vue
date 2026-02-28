<template>
  <section class="card p-3">

    <form @submit.prevent="submitForm" class="p-fluid">

      <!-- Azienda / Negozio -->
      <div class="field mb-3">
        <div class="label-row">
          <img src="/assets/negozio.svg" width="20" />
          <label>Azienda / Negozio</label>
        </div>
        <InputText
          v-model="name"
          placeholder="Es. Supermercato"
          class="w-full"
          required
        />
      </div>

      <!-- Categoria (CategorySelect personalizzato) -->
      <div class="field mb-3">
        <div class="label-row">
          <img src="/assets/lista.svg" width="20" />
          <label>Categoria</label>
        </div>
        <CategorySelect v-model="category" />
      </div>

      <!-- Importo -->
      <div class="field mb-3">
        <div class="label-row">
          <img src="/assets/money.svg" width="20" />
          <label>Importo</label>
        </div>
        <InputNumber
          v-model="amount"
          mode="currency"
          currency="EUR"
          locale="it-IT"
          class="w-full"
          required
        />
      </div>

      <!-- Data -->
      <div class="field mb-3">
        <div class="label-row">
          <img src="/assets/calendar.svg" width="20" />
          <label>Data</label>
        </div>
        <Calendar
          v-model="displayDate"
          :locale="itLocale"
          dateFormat="dd/mm/yy"
          showIcon
          class="w-full"
        />
      </div>

      <Button label="Conferma" class="w-full mt-2" type="submit" />
    </form>

  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import CategorySelect from "./CategorySelect.vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import moment from "moment";
import "moment/locale/it";

moment.locale("it");

const emit = defineEmits(["add-expense"]);

const name = ref("");
const amount = ref("");
const date = ref("");

// Categoria come OGGETTO (necessario per CategorySelect)
const category = ref({
  label: "Spesa",
  value: "Spesa",
  icon: "/assets/shopping_cart.svg"
});

// Locale italiano per Calendar PrimeVue 3
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

// Computed per mostrare la data in italiano e salvarla in ISO
const displayDate = computed({
  get() {
    return date.value ? moment(date.value).format("DD/MM/YYYY") : "";
  },
  set(val) {
    date.value = moment(val, "DD/MM/YYYY").format("YYYY-MM-DD");
  }
});

function submitForm() {
  const expense = {
    id: Date.now(),
    name: name.value,
    category: category.value.value, // ← SALVI SOLO LA STRINGA
    amount: parseFloat(amount.value),
    date: date.value
  };

  emit("add-expense", expense);

  // Reset campi
  name.value = "";
  amount.value = "";
  date.value = "";
  category.value = {
    label: "Spesa",
    value: "Spesa",
    icon: "/assets/shopping_cart.svg"
  };
}
</script>

<style scoped>
.label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.field {
  display: flex;
  flex-direction: column;
}

.card {
  background: var(--card);
  border-radius: 10px;
  padding: 16px;
}
</style>
