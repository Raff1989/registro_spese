<template>
  <Toast />
  <section class="card p-3">

    <form @submit.prevent="submitForm" class="p-fluid">
      <div class="label-row">
        <img src="/assets/negozio.svg" width="20" />
        <label>Azienda / Negozio</label>
      </div>
      <div class="field mb-3">
        <InputText v-model="name" placeholder="Es. Supermercato" class="w-full input" required />
      </div>

      <div class="label-row">
        <img src="/assets/lista.svg" width="20" />
        <label>Categoria</label>
      </div>
      <div class="field mb-3">
        <CategorySelect v-model="category" />
      </div>

      <div class="label-row">
        <img src="/assets/money.svg" width="20" />
        <label>Importo</label>
      </div>
      <div class="field mb-3">
        <InputText
          v-model="amount"
          inputmode="decimal"
          placeholder="0,00"
          class="w-full input"
          @focus="onAmountFocus"
          @blur="onAmountBlur"
          required
        />
      </div>

      <div class="label-row">
        <img src="/assets/calendar.svg" width="20" />
        <label>Data</label>
      </div>
      <div class="field mb-3">
        <Calendar
          v-model="displayDate"
          dateFormat="dd/mm/yy"
          showIcon
          showButtonBar
          class="w-full custom-radius"
          required
        />
      </div>

      <Button label="Conferma" raised rounded class="w-full mt-2" type="submit" />
    </form>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast"; 
import Toast from "primevue/toast";
import CategorySelect from "./CategorySelect.vue";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import moment from "moment";
import "moment/locale/it";

moment.locale("it");

const toast = useToast();
const emit = defineEmits(["add-expense"]);

const name = ref("");
const amount = ref("");
const date = ref("");

function onAmountFocus() {
  if (amount.value === "0" || amount.value === "0.00" || amount.value === "0,00") {
    amount.value = "";
  }
}

function onAmountBlur() {
  if (!amount.value || amount.value.trim() === "") {
    amount.value = "";
    return;
  }

  // Normalizza virgola → punto
  let val = amount.value.replace(",", ".");

  // Converte in numero
  const num = Number(val);

  if (isNaN(num)) {
    amount.value = "";
    return;
  }

  // Formatta con 2 decimali
  amount.value = num.toFixed(2).replace(".", ",");
}

function onAmountInput() {
  // Qui puoi aggiungere logica se serve
}


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
  // VALIDAZIONE PER TOAST
  if (!name.value) {
    // Verifica che questo venga eseguito con un console.log
    console.log("Tentativo di mostrare toast errore"); 
    toast.add({ 
      severity: 'error', 
      summary: 'Errore', 
      detail: 'Compila i campi richiesti', 
      life: 3000 
    });
    return;
  }

  const expense = {
    id: Date.now(),
    name: name.value,
    category: category.value.value, // ← SALVI SOLO LA STRINGA
    amount: parseFloat(amount.value.replace(",", ".")),
    date: date.value
  };

  emit("add-expense", expense);

  // NOTIFICA SUCCESSO
  toast.add({
    severity: "success",
    summary: "Successo",
    detail: "Aggiunto con successo",
    life: 3000
  });

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

function clearOnFocus() {
  if (amount.value === 0) {
    amount.value = null; // svuota completamente il campo
  }
}

function restoreIfEmpty() {
  if (amount.value === null || amount.value === "") {
    amount.value = 0; // ripristina 0,00 se l’utente non ha scritto nulla
  }
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
  background: white;
  padding: 6px 6px 6px 20px;
  border-radius: 40px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 25px;
}

.card {
  background: var(--card);
  border-radius: 10px;
  padding: 16px;
}
.input {
  border-radius: 25px;
  border: none;
}

/* :global(.p-calendar.custom-radius .p-inputtext) {
    border-radius: 25px;
} */

/* Arrotonda il lato sinistro dell'input */
:global(.p-calendar.custom-radius .p-inputtext) {
    border-top-left-radius: 25px;
    border-bottom-left-radius: 25px;
    border-right: none;
    border: none;
}

/* Arrotonda il lato destro del pulsante icona */
:global(.custom-radius .p-datepicker-trigger) {
    border-top-right-radius: 25px;
    border-bottom-right-radius: 25px;
    background-color: transparent;
    border-left: none;
    border-color: gray;
    opacity: 0.5;
    color: blue;
    border: none;
}

</style>
