<script setup>
import { onMounted, watch, ref } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  expenses: { type: Array, required: true }
});

const pieCanvas = ref(null);
const barCanvas = ref(null);
const lineCanvas = ref(null);

let pieChart = null;
let barChart = null;
let lineChart = null;

function destroyCharts() {
  [pieChart, barChart, lineChart].forEach(chart => chart?.destroy());
}

const createGradient = (ctx, colorStart, colorEnd) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

function updateCharts() {
  const data = props.expenses;
  destroyCharts();
  if (!data || data.length === 0) return;
  updatePieChart(data);
  updateBarChart(data);
  updateLineChart(data);
}

function updatePieChart(data) {
  const categories = {};
  data.forEach(e => { categories[e.category] = (categories[e.category] || 0) + e.amount; });
  const total = Object.values(categories).reduce((a, b) => a + b, 0);

  pieChart = new Chart(pieCanvas.value, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ["#007aff", "#ff2d55", "#ffcc00", "#34c759", "#5856d6", "#ff9500", "#af52de", "#5ac8fa"],
        borderWidth: 2,
        borderColor: '#ffffff',
        borderRadius: 5
      }]
    },
    options: {
      plugins: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } },
        tooltip: {
          callbacks: {
            label: (i) => `${i.label}: ${i.parsed.toFixed(2)}€ (${((i.parsed * 100) / total).toFixed(1)}%)`
          }
        }
      },
      cutout: '65%'
    }
  });
}

function updateBarChart(data) {
  const ctx = barCanvas.value.getContext('2d');
  const gradient = createGradient(ctx, '#007aff', '#5ac8fa');
  const months = Array(12).fill(0);
  data.forEach(e => { months[new Date(e.date).getMonth()] += e.amount; });

  barChart = new Chart(barCanvas.value, {
    type: "bar",
    data: {
      labels: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
      datasets: [{ data: months, backgroundColor: gradient, borderRadius: 8 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
    }
  });
}

function updateLineChart(data) {
  const ctx = lineCanvas.value.getContext('2d');
  const gradientFill = createGradient(ctx, 'rgba(0, 122, 255, 0.25)', 'rgba(0, 122, 255, 0)');
  const days = {};
  data.forEach(e => { days[e.date] = (days[e.date] || 0) + e.amount; });
  const sortedDates = Object.keys(days).sort();

  lineChart = new Chart(lineCanvas.value, {
    type: "line",
    data: {
      labels: sortedDates.map(d => new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })),
      datasets: [{
        data: sortedDates.map(d => days[d]),
        borderColor: "#007aff",
        borderWidth: 3,
        pointRadius: 3,
        tension: 0.4,
        fill: true,
        backgroundColor: gradientFill
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
    }
  });
}

onMounted(updateCharts);
watch(() => props.expenses, updateCharts, { deep: true });
</script>

<template>
  <div class="charts-grid">
    <div class="settings-group">
      <span class="group-title">Ripartizione Categorie</span>
      <div class="settings-card chart-container">
        <div class="canvas-wrapper">
          <canvas ref="pieCanvas"></canvas>
        </div>
      </div>
    </div>

    <div class="settings-group">
      <span class="group-title">Confronto Mensile</span>
      <div class="settings-card chart-container">
        <div class="canvas-wrapper">
          <canvas ref="barCanvas"></canvas>
        </div>
      </div>
    </div>

    <div class="settings-group full-width">
      <span class="group-title">Andamento Temporale</span>
      <div class="settings-card chart-container">
        <div class="canvas-wrapper">
          <canvas ref="lineCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .charts-grid { grid-template-columns: 1fr 1fr; }
  .full-width { grid-column: span 2; }
}

.settings-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 15px;
  /* Blocchiamo l'altezza per evitare il tremolio della pagina */
  height: 320px; 
  display: flex;
  flex-direction: column;
}

/* Contenitore necessario per Chart.js con maintainAspectRatio: false */
.canvas-wrapper {
  position: relative;
  flex-grow: 1;
  width: 100%;
  height: 100%;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.group-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #8e8e93;
  margin: 12px 0 8px 12px;
}
</style>