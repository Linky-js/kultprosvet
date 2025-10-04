 
  <script>
  import { Chart, registerables } from 'chart.js';
  
  Chart.register(...registerables);
  
  export default {
    props: ['salaryData'],
    mounted() {
      this.renderChart();
    },
    methods: {
      renderChart() {
        const ctx = document.getElementById('salaryChart').getContext('2d');
  
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        const labels = this.salaryData.map(item => item.employer);
        const salaryValues = this.salaryData.map(item => item.salary);
  
        const maxSalary = Math.max(...salaryValues);
        const yMax = Math.ceil(maxSalary / 10000) * 10000; 
  
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: 'Salary over time',
              data: salaryValues,
              borderColor: 'black',
              borderWidth: 2,
              backgroundColor: 'rgba(0, 123, 255, 0.1)', 
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: yMax, 
              },
              x: {
                ticks: {
                  color: function(context) {
                    return context.index === currentMonth ? 'blue' : 'black';
                  }
                }
              }
            }
          }
        });
      }
    }
  }
  </script>
  <template>
    <div>
      <canvas id="salaryChart"></canvas>
    </div>
  </template>
  