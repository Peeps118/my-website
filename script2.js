

    const categories = ['SOLIDS', 'LIQUIDS', 'ADMIN'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const thisYear = new Date().getFullYear();
    let selectedYear = thisYear;

    const yearSelect = document.getElementById('yearSelect');
    const inputGroups = document.getElementById('inputGroups');
    const totalsDisplay = document.getElementById('totalsDisplay');
    const form = document.getElementById('consumptionForm');

    for (let y = 2025; y <= 2035; y++) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      if (y === thisYear) option.selected = true;
      yearSelect.appendChild(option);
    }


const getStorageKey = (year, category) => `water_consumption_${year}_${category}`;

    function getCategoryData(year, category) {
      return JSON.parse(localStorage.getItem(getStorageKey(year, category))) || Array(12).fill(0);
    }

    function saveCategoryData(year, category, data) {
      localStorage.setItem(getStorageKey(year, category), JSON.stringify(data));
    }

function renderInputs() {
  inputGroups.innerHTML = '';
  categories.forEach(category => {
    const wrapper = document.createElement('div');
    wrapper.className = 'category';

    const title = document.createElement('h3');
    title.textContent = category;
    wrapper.appendChild(title);

    // Container for month-input pairs
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.flexWrap = 'wrap';
    row.style.gap = '10px';

    const data = getCategoryData(selectedYear, category);

    monthNames.forEach((month, i) => {
      const pair = document.createElement('div');
      pair.style.display = 'flex';
      pair.style.flexDirection = 'column';
      pair.style.alignItems = 'center';

      const label = document.createElement('span');
      label.textContent = month;

      const input = document.createElement('input');
      input.type = 'number';
      input.min = 0;
      input.name = `${category}_${i}`;
      input.value = data[i];
      input.style.width = '60px';

      pair.appendChild(label);
      pair.appendChild(input);
      row.appendChild(pair);
    });

    wrapper.appendChild(row);
    inputGroups.appendChild(wrapper);
  });
}
    function updateTotalsDisplay(totals) {
      totalsDisplay.innerHTML = `
        Total SOLIDS: ${totals.SOLIDS} |
        Total LIQUIDS: ${totals.LIQUIDS} |
        Total ADMIN: ${totals.ADMIN}
      `;
    }

    // Create charts
    const solidsChart = new Chart(document.getElementById('solidsChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [{
          label: 'SOLIDS',
          data: [],
          backgroundColor: '#4bc0c0'
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    const liquidsChart = new Chart(document.getElementById('liquidsChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [{
          label: 'LIQUIDS',
          data: [],
          backgroundColor: '#ffcd56'
        }]
      },

      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    const adminChart = new Chart(document.getElementById('adminChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [{
          label: 'ADMIN',
          data: [],
          backgroundColor: '#ff6384'
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    const lineChart = new Chart(document.getElementById('lineChart').getContext('2d'), {
      type: 'line',
      data: {
        labels: monthNames,
        datasets: [{
          label: 'Grand Total per Month',
          data: [],
          borderColor: '#36a2eb',
          backgroundColor: '#36a2eb33',
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

const pieChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
  type: 'pie',
  data: {
    labels: categories,
    datasets: [{
      data: [],
      backgroundColor: ['#ff6384', '#4bc0c0' , '#ffcd56']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 5
        }
      }
    }
  }
});


const yearlyLineChart = new Chart(document.getElementById('yearlyLineChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: Array.from({ length: 11 }, (_, i) => 2025 + i),
    datasets: [{
      label: 'Grand Total per Year',
      data: [],
      borderColor: '#8e5ea2',
      backgroundColor: '#8e5ea233',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});




    function updateCharts() {
      let yearlyTotals = {};
      let monthlyTotals = Array(12).fill(0);

      const solidsData = getCategoryData(selectedYear, 'SOLIDS');
      const liquidsData = getCategoryData(selectedYear, 'LIQUIDS');
      const adminData = getCategoryData(selectedYear, 'ADMIN');

      solidsChart.data.datasets[0].data = solidsData;
      liquidsChart.data.datasets[0].data = liquidsData;
      adminChart.data.datasets[0].data = adminData;

      solidsChart.update();
      liquidsChart.update();
      adminChart.update();

      for (let i = 0; i < 12; i++) {
        monthlyTotals[i] = solidsData[i] + liquidsData[i] + adminData[i];
      }

      yearlyTotals.SOLIDS = solidsData.reduce((a, b) => a + b, 0);
      yearlyTotals.LIQUIDS = liquidsData.reduce((a, b) => a + b, 0);
      yearlyTotals.ADMIN = adminData.reduce((a, b) => a + b, 0);

      lineChart.data.datasets[0].data = monthlyTotals;
      lineChart.update();

      pieChart.data.datasets[0].data = [
        yearlyTotals.SOLIDS,
        yearlyTotals.LIQUIDS,
        yearlyTotals.ADMIN
      ];
      pieChart.update();

      updateTotalsDisplay(yearlyTotals);
    }

    yearSelect.addEventListener('change', () => {
      selectedYear = parseInt(yearSelect.value);
      renderInputs();
      updateCharts();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      categories.forEach(cat => {
        const inputs = Array.from(document.querySelectorAll(`input[name^="${cat}_"]`));
        const values = inputs.map(input => parseFloat(input.value) || 0);
        saveCategoryData(selectedYear, cat, values);
      });
      updateCharts();
    });

    renderInputs();
    updateCharts();

// Update yearly line chart (grand total per year)
const years = Array.from({ length: 11 }, (_, i) => 2025 + i);
yearlyLineChart.data.labels = years;
yearlyLineChart.data.datasets[0].data = years.map(y => {
  return categories.reduce((sum, cat) => {
    const data = getCategoryData(y, cat);
    return sum + data.reduce((a, b) => a + b, 0);
  }, 0);
});
yearlyLineChart.update();

function toggleForm() {
  const form = document.getElementById('formSection');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}


