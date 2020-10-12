import { Doughnut } from 'vue-chartjs'
import theme from '../plugins/theme';

export default {
  extends: Doughnut,
  props: {
    chartData: Array,
    labels: Array,
    colors: Array,
    percentage: Number,
  },
  data: () => ({
    oldChartData: undefined
  }),
  computed: {
    colorsUsingTheme: function () {
      return this.colors.map(v => {
        return theme.themes.light[v]
      });
    }
  },
  mounted() {
    this.addPlugin({
      id: 'my-plugin',
      beforeDraw: this.plugin
    });
    this.render();
  },
  methods: {
    render() {
      this.oldChartData = this.chartData;
      this.renderChart(
        {
          labels: this.labels,
          datasets: [
            {
              backgroundColor: this.colorsUsingTheme,
              data: this.chartData,
              borderColor: 'transparent',
            }
          ]
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          layout: {
            margin: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }
          },
        }
      );

    },
    plugin(chart) {
      var width = chart.chart.width;
      var height = chart.chart.height;
      var ctx = chart.chart.ctx;

      ctx.restore();
      var fontSize = (height / 114).toFixed(2);
      ctx.font = fontSize + "em sans-serif";
      ctx.fillStyle = this.percentage < 50 ? '#e33a0b' : '#44A963';
      ctx.textBaseline = "middle";

      var text = Math.round(this.percentage) + '%';
      var textX = Math.round((width - ctx.measureText(text).width) / 2 + 4);
      var textY = height / 2 ;

      ctx.fillText(text, textX, textY);
      ctx.save();


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