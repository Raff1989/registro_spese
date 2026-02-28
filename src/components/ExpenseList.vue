<template>
  <section v-if="expenses.length">
    <Card class="mb-3">
      <template #title>Spese registrate</template>

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
                <span class="amount">{{ exp.amount.toFixed(2) }} €</span>
              </div>

              <div class="bottom">
                <div class="category">
                  <img
                    :src="iconForCategory(exp.category)"
                    width="20"
                    class="cat-icon"
                  />
                  <span>{{ exp.category }}</span>
                </div>

                <span class="date">{{ formatDate(exp.date) }}</span>
              </div>
            </div>

            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-info mr-2"
              @click="openEdit(exp)"
            />

            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="remove(exp.id)"
            />
          </li>
        </ul>
      </template>
    </Card>
  </section>

  <section v-else>
    <Card>
      <template #content>
        <p>Nessuna spesa registrata.</p>
      </template>
    </Card>
  </section>

  <!-- MODAL DI MODIFICA -->
  <Dialog
    v-model:visible="editingDialog"
    header="Modifica Spesa"
    :modal="true"
    :closable="false"
    style="width: 90%; max-width: 400px"
  >
    <div class="p-fluid">

      <label>Nome</label>
      <InputText v-model="editing.name" class="mb-3" />

      <label>Categoria</label>
      <CategorySelect v-model="editingCategory" class="mb-3" />

      <label>Importo</label>
      <InputNumber
        v-model="editing.amount"
        mode="currency"
        currency="EUR"
        locale="it-IT"
        class="mb-3"
      />

      <label>Data</label>
      <Calendar
        v-model="editingDate"
        dateFormat="dd/mm/yy"
        :locale="itLocale"
        showIcon
        class="mb-3"
      />

      <div class="flex justify-content-between mt-3">
        <Button label="Annulla" class="p-button-secondary" @click="closeEdit" />
        <Button label="Salva" class="p-button-primary" @click="saveEdit" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
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

const props = defineProps({
  expenses: Array
});

const emit = defineEmits(["delete-expense", "edit-expense"]);

const editingDialog = ref(false);
const editing = ref(null);
const editingCategory = ref(null);
const editingDate = ref("");


// Locale italiano per Calendar
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

// Icone categoria
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

  // editingCategory.value = {
  //   label: exp.category,
  //   value: exp.category,
  //   icon: iconForCategory(exp.category)
  // };

  editingCategory.value = exp.category;


  editingDate.value = moment(exp.date, "YYYY-MM-DD").toDate();
  editingDialog.value = true;
}




function saveEdit() {
  editing.value.category = editingCategory.value.value;
  editing.value.date = moment(editingDate.value).format("YYYY-MM-DD");

  emit("edit-expense", editing.value);
  editingDialog.value = false;
}

function closeEdit() {
  editingDialog.value = false;
}

function remove(id) {
  emit("delete-expense", id);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("it-IT");
}
</script>

<style scoped>
.expense-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.expense-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info {
  flex: 1;
}

.top {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.bottom {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
}

.category {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-icon {
  opacity: 0.8;
}
</style>
