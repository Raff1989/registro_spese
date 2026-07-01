<template>
  <section v-if="expenses.length">
    <Card class="mb-4 custom-card">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-list text-primary"></i>
          <span>Spese registrate</span>
        </div>
      </template>

      <template #content>
        <ul class="expense-list">
          <li
            v-for="exp in expenses"
            :key="exp.id"
            class="expense-item"
          >
            <div class="info">
              <div class="top">
                <span class="name">{{ exp.name }}</span>
                <span class="amount text-primary">{{ exp?.amount ? Number(exp.amount).toFixed(2) : "0.00" }}€</span>
              </div>

              <div class="bottom">
                <div class="category">
                  <img
                    :src="iconForCategory(exp.category)"
                    width="18"
                    class="cat-icon"
                  />
                  <span>{{ exp.category }}</span>
                </div>
                <span class="date"><i class="pi pi-calendar mr-1"></i>{{ formatDate(exp.date) }}</span>
              </div>
            </div>

            <div class="actions">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-text p-button-info"
                @click="openEdit(exp)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text p-button-danger"
                @click="remove(exp.id)"
              />
            </div>
          </li>
        </ul>
      </template>
    </Card>
  </section>

  <section v-else>
    <Card class="custom-card">
      <template #content>
        <div class="text-center py-4 text-500">
          <i class="pi pi-filter-slash mb-2" style="font-size: 2rem"></i>
          <p>Nessuna spesa registrata.</p>
        </div>
      </template>
    </Card>
  </section>

  <Dialog
    v-model:visible="editingDialog"
    header="Modifica Spesa"
    :modal="true"
    :closable="false"
    class="custom-dialog"
    style="width: 90%; max-width: 450px"
  >
    <div class="p-fluid rounded-form">
      <label class="font-bold block mb-2 mt-2">Nome</label>
      <div class="field mb-4">
        <InputText v-model="editing.name" placeholder="Es. Carburante" />
      </div>

      <label class="font-bold block mb-2">Categoria</label>
      <div class="field mb-4">
        <CategorySelect v-model="editingCategory" />
      </div>

      <label class="font-bold block mb-2">Importo</label>
      <div class="field mb-4">
        <InputNumber
          v-model="editing.amount"
          mode="currency"
          currency="EUR"
          locale="it-IT"
        />
      </div>

      <label class="font-bold block mb-2">Data</label>
      <div class="field mb-4">
        <Calendar
          v-model="editingDate"
          dateFormat="dd/mm/yy"
          :locale="itLocale"
          showIcon
          iconDisplay="input"
        />
      </div>

      <div class="flex justify-content-end gap-2 mt-4">
        <Button label="Annulla" icon="pi pi-times" class="p-button-text p-button-secondary rounded-btn" @click="closeEdit" />
        <Button label="Salva" icon="pi pi-check" class="p-button-primary rounded-btn px-4" @click="saveEdit" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
/* ... Logica invariata come da tua richiesta ... */
import { ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";
import CategorySelect from "./CategorySelect.vue";
import moment from "moment";
import "moment/locale/it";
moment.locale("it");

const props = defineProps({ expenses: Array });
const emit = defineEmits(["delete-expense", "edit-expense"]);
const editingDialog = ref(false);
const editing = ref(null);
const editingCategory = ref(null);
const editingDate = ref("");

const itLocale = {
  firstDayOfWeek: 1,
  dayNames: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
  dayNamesMin: ["D", "L", "M", "M", "G", "V", "S"],
  monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
  monthNamesShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
  today: "Oggi",
  clear: "Pulisci"
};

function iconForCategory(cat) {
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
  return map[cat] || "/assets/shopping_cart.svg";
}

function openEdit(exp) {
  editing.value = { ...exp };
  editingCategory.value = exp.category;
  editingDate.value = moment(exp.date, "YYYY-MM-DD").toDate();
  editingDialog.value = true;
}

function saveEdit() {
  // Nota: ho aggiunto un controllo di sicurezza se editingCategory è un oggetto o stringa
  editing.value.category = editingCategory.value?.value || editingCategory.value;
  editing.value.date = moment(editingDate.value).format("YYYY-MM-DD");
  emit("edit-expense", editing.value);
  editingDialog.value = false;
}

function closeEdit() { editingDialog.value = false; }
function remove(id) { emit("delete-expense", id); }
function formatDate(d) { return new Date(d).toLocaleDateString("it-IT"); }
</script>

<style scoped>
/* Card and List Styling */
.custom-card {
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}

.expense-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.expense-item {
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}

.expense-item:last-child {
  border-bottom: none;
}

.info {
  flex: 1;
}

.top {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.bottom {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #888;
}

.category {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

/* Global Border Radius Fixes for PrimeVue Components */
:deep(.p-inputtext), 
:deep(.p-dropdown), 
:deep(.p-calendar .p-inputtext),
:deep(.p-inputnumber-input) {
  border-radius: 25px !important;
  padding-left: 1.2rem;
  border: none;
}

:deep(.p-button.rounded-btn) {
  border-radius: 25px !important;
}

:deep(.p-dialog) {
  border-radius: 20px !important;
  overflow: hidden;
}

:deep(.p-dialog-header) {
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.cat-icon {
  filter: grayscale(20%);
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
</style>