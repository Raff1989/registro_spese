<script setup>
import { onMounted, watch, ref } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  }
});

// Canvas refs
const pieCanvas = ref(null);
const barCanvas = ref(null);
const lineCanvas = ref(null);

// Chart instances
let pieChart = null;
let barChart = null;
let lineChart = null;

// -----------------------------
// DISTRUGGE TUTTI I GRAFICI
// -----------------------------
function destroyCharts() {
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();
}

// -----------------------------
// AGGIORNA TUTTI I GRAFICI
// -----------------------------
function updateCharts() {
  const data = props.expenses;

  destroyCharts();

  if (!data || data.length === 0) return;

  updatePieChart(data);
  updateBarChart(data);
  updateLineChart(data);
}

// -----------------------------
// 1️⃣ GRAFICO A TORTA (CATEGORIE)
// -----------------------------
function updatePieChart(data) {
  const categories = {};

  data.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });

  pieChart = new Chart(pieCanvas.value, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            "#4da3ff", "#ff6384", "#ffcd56", "#4bc0c0",
            "#9966ff", "#ff9f40", "#66cc66", "#cc6666"
          ]
        }
      ]
    }
  });
}

// -----------------------------
// 2️⃣ GRAFICO A BARRE (TOTALE PER MESE)
// -----------------------------
function updateBarChart(data) {
  const months = Array(12).fill(0);

  data.forEach(e => {
    const d = new Date(e.date);
    months[d.getMonth()] += e.amount;
  });

  barChart = new Chart(barCanvas.value, {
    type: "bar",
    data: {
      labels: [
        "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
        "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
      ],
      datasets: [
        {
          label: "Spese mensili",
          data: months,
          backgroundColor: "#4da3ff"
        }
      ]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// -----------------------------
// FORMATO DATA ITALIANA
// -----------------------------
function formatItalianDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// -----------------------------
// 3️⃣ GRAFICO LINEARE (ANDAMENTO GIORNALIERO)
// -----------------------------
function updateLineChart(data) {
  const days = {};

  data.forEach(e => {
    days[e.date] = (days[e.date] || 0) + e.amount;
  });

  const sortedDates = Object.keys(days).sort();

  lineChart = new Chart(lineCanvas.value, {
    type: "line",
    data: {
      labels: sortedDates.map(d => formatItalianDate(d)),
      datasets: [
        {
          label: "Andamento giornaliero",
          data: sortedDates.map(d => days[d]),
          borderColor: "#ff6384",
          backgroundColor: "rgba(255,99,132,0.2)",
          tension: 0.3,
          fill: true
        }
      ]
    }
  });
}

// -----------------------------
// WATCH + MOUNT
// -----------------------------
onMounted(updateCharts);
watch(() => props.expenses, updateCharts, { deep: true });
</script>
<!-- 
<template>
  <div class="charts-container">
    <h3>Distribuzione per categoria</h3>
    <canvas ref="pieCanvas"></canvas>

    <h3>Spese per mese</h3>
    <canvas ref="barCanvas"></canvas>

    <h3>Andamento giornaliero</h3>
    <canvas ref="lineCanvas"></canvas>
  </div>
</template> -->

<!-- <template>
  <div class="charts-container">

  
    <div class="charts-row">
      <div class="chart-box">
        <h3>Distribuzione per categoria</h3>
        <canvas ref="pieCanvas"></canvas>
      </div>

      <div class="chart-box">
        <h3>Spese per mese</h3>
        <canvas ref="barCanvas"></canvas>
      </div>
    </div>
    <div class="charts-row">
      <div class="chart-box">
        <h3>Andamento giornaliero</h3>
        <canvas ref="lineCanvas"></canvas>
      </div>
    </div>


  </div>
</template>


<style scoped>
.charts-container {
  margin-top: 20px;
}

canvas {
  margin-bottom: 30px;
  width: 100%;
}

 @media (min-width: 768px) {
  .chart-container {
    max-width: 350px !important;
    margin: 0 auto;
  }
}


@media (min-width: 1024px) {
  .chart-container {
    max-width: 400px !important;
  }
}

 .charts-row {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-box {
  width: 100%;
}

@media (min-width: 768px) {
  .charts-row {
    flex-direction: row;
  }

  .chart-box {
    flex: 1;
    max-width: 50%;
  }
}

@media (min-width: 1024px) {
  .chart-box {
    max-width: 45%;
  }
}

</style> -->

<template>
  <div class="charts-layout">

    <!-- SINISTRA: TORTA -->
    <div class="charts-left">
      <h3>Distribuzione per categoria</h3>
      <div class="chart-box">
        <canvas ref="pieCanvas"></canvas>
      </div>
    </div>

    <!-- DESTRA: DUE RIGHE (BAR + LINE) -->
    <div class="charts-right">
      <div class="chart-block">
        <h3>Spese per mese</h3>
        <div class="chart-box">
          <canvas ref="barCanvas"></canvas>
        </div>
      </div>

      <div class="chart-block">
        <h3>Andamento giornaliero</h3>
        <div class="chart-box">
          <canvas ref="lineCanvas"></canvas>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.charts-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

/* blocchi base */
.charts-left,
.charts-right {
  width: 100%;
}

.chart-box {
  width: 100%;
}

canvas {
  width: 100%;
  margin-bottom: 20px;
}

/* Tablet / Desktop: layout a due colonne */
@media (min-width: 768px) {
  .charts-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .charts-left {
    flex: 1;
    max-width: 45%;
  }

  .charts-right {
    flex: 1;
    max-width: 55%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .chart-block {
    width: 100%;
  }
}
</style>

