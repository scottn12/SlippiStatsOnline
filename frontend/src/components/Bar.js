import { HorizontalBar } from 'vue-chartjs'
import Chart from 'chart.js';

export default {
  extends: HorizontalBar,
  props: {
    chartData: Array,
    tags: Array,
    percentage: Boolean
  },
  data: () => ({
    oldChartData: undefined
  }),
  mounted() {
    this.addPlugin({
      id: 'my-plugin',
      afterDraw: this.plugin
    });
    this.render();
  },
  methods: {
    render() {
      this.oldChartData = this.chartData;
      this.renderChart(
        {
          labels: this.tags,
          datasets: [
            {
              percentage: this.percentage,
              backgroundColor: ['#44A963', '#e33a0b'],
              data: this.chartData
            }
          ]
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              ticks: {
                display: true,
                suggestedMin: 0,
                beginAtZero: true
              }
            }],
            yAxes: [{
              ticks: {
                display: false
              }
            }]
          }
        }
      );
    },
    plugin(chartInstance) {
      var ctx = chartInstance.chart.ctx;

      // render the value of the chart above the bar
      ctx.font = Chart.helpers.fontString(18, 'normal', Chart.defaults.global.defaultFontFamily);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'white';

      chartInstance.data.datasets.forEach(function (dataset) {
        for (var i = 0; i < dataset.data.length; i++) {
          var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
          var scaleMax = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
          var yPos = (scaleMax - model.y) / scaleMax >= 0.93 ? model.y + 20 : model.y + 10;
          let text = dataset.data[i];
          if (dataset.percentage) text += '%';
          ctx.fillText(text, model.x/2, yPos);
        }
      });

    }
  },
  watch: {
    chartData() {
      if (this.chartData.length !== this.oldChartData.length) {
        this.render();
      }
      else {
        for (var i = this.chartData.length; i--;) {
          if (this.chartData[i] !== this.oldChartData[i])
            this.render();
          return;
        }
      }
    }
  }
}