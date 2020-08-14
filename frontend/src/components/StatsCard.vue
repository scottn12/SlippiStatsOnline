<template>
  <v-container>
    <v-card class="mx-auto" width="70%">
      <v-card-title class="justify-center sectionTitle">Summary</v-card-title>
      <v-card-text class="text--primary">
        <!-- Win / Loss -->
        <v-row no-gutters justify="space-around">
          <v-col cols="3">
            <div class="text-center fill-height gameInfo">
              <div>
                <span style="font-size: 28px; color: #44A963">{{ stats.numGames }}</span> games
              </div>
              <div v-if="!timeInMinutes">
                <span style="font-size: 24px;" >{{ timePlayed }}</span> hour<span v-if="timePlayed != 1">s</span> played
              </div>
              <div v-if="timeInMinutes">
                <span style="font-size: 24px;" >{{ timePlayed }}</span> minute<span v-if="timePlayed != 1">s</span> played
              </div>
              <div>
                <span
                  style="font-size: 24px;"
                >{{stats.player.overall.lraStarts + stats.opponent.overall.lraStarts}}</span> L+R+A+Starts
              </div>
              <div>
                <span style="font-size: 24px;">{{stats.timeouts}}</span> timeouts
              </div>
            </div>
          </v-col>
          <v-col cols="3">
            <v-row no-gutters justify="center">
              <div class="chartTitle">Win Rate</div>
              <DoughnutChart
                :width="400"
                :height="150"
                :chartData="[stats.numGames - stats.player.overall.wins, stats.player.overall.wins]"
                :labels="['Losses', 'Wins']"
                :colors="['#e33a0b', '#44A963']"
                :percentage="Math.round(stats.player.overall.wins / stats.numGames * 100)"
              />
              <div class="doughnutFooter">
                {{ stats.player.overall.wins }}<span style="color: #44A963">W</span>
                - {{ stats.numGames - stats.player.overall.wins }}<span style="color: #e33a0b">L</span>
              </div>
            </v-row>
          </v-col>
          <v-col cols="3">
            <div class="chartTitle">Neutral Win Rate</div>
            <v-row no-gutters justify="center">
              <DoughnutChart
                :width="400"
                :height="150"
                :chartData="[100 - stats.player.average.neutralWinRatio*100, stats.player.average.neutralWinRatio * 100]"
                :labels="['Losses', 'Wins']"
                :colors="['#e33a0b', '#44A963']"
                :percentage="stats.player.average.neutralWinRatio * 100"
              />
              <div class="doughnutFooter" style="opacity: 0;">
                {{ stats.player.overall.wins }}
                <span style="color: #44A963">W</span>
                - {{ stats.numGames - stats.player.overall.wins }}
                <span
                  style="color: #e33a0b"
                >L</span>
              </div>
            </v-row>
          </v-col>
        </v-row>
        <br />
        <v-card-title class="justify-center sectionTitle">Efficiency</v-card-title>
        <v-row no-gutters justify="space-around">
          <v-col cols="3">
            <div class="chartTitle">
              Average KO Percent
              <v-tooltip right>
                <template v-slot:activator="{on, attrs}">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    style="margin-bottom: 3px;"
                  >mdi-information</v-icon>
                </template>
                <span>
                  Lower is better
                </span>
              </v-tooltip>
            </div>
            <div class="barLegend">
              <v-chip
                small
                color="#44A963"
                text-color="white"
                style="margin-right: 5px;"
              >{{ playerTag }}</v-chip>
              <v-chip small color="#e33a0b" text-color="white">{{ opponentTag }}</v-chip>
            </div>
            <BarChart
              :height="200"
              :chartData="[stats.player.average.killPercent, stats.opponent.average.killPercent]"
              :tags="[playerTag, opponentTag]"
              :percentage="false"
            />
          </v-col>
          <v-col cols="3">
            <div class="chartTitle">
              Openings Per KO
              <v-tooltip right>
                <template v-slot:activator="{on, attrs}">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    style="margin-bottom: 3px;"
                  >mdi-information</v-icon>
                </template>
                <span>
                  Lower is better
                </span>
              </v-tooltip>
            </div>
            <div class="barLegend">
              <v-chip
                small
                color="#44A963"
                text-color="white"
                style="margin-right: 5px;"
              >{{ playerTag }}</v-chip>
              <v-chip small color="#e33a0b" text-color="white">{{ opponentTag }}</v-chip>
            </div>
            <BarChart
              :height="200"
              :chartData="[stats.player.average.openingsPerKill, stats.opponent.average.openingsPerKill]"
              :tags="[playerTag, opponentTag]"
              :percentage="false"
            />
          </v-col>
          <v-col cols="3">
            <div class="chartTitle">
              Conversion Rate
              <v-tooltip right>
                <template v-slot:activator="{on, attrs}">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    style="margin-bottom: 3px;"
                  >mdi-information</v-icon>
                </template>
                <span>
                  Higher is better
                </span>
              </v-tooltip>
            </div>
            <div class="barLegend">
              <v-chip
                small
                color="#44A963"
                text-color="white"
                style="margin-right: 5px;"
                :percentage="false"
              >{{ playerTag }}</v-chip>
              <v-chip small color="#e33a0b" text-color="white">{{ opponentTag }}</v-chip>
            </div>
            <BarChart
              :height="200"
              :chartData="[Math.round(stats.player.average.conversionRatio*100), Math.round(stats.opponent.average.conversionRatio*100)]"
              :tags="[playerTag, opponentTag]"
              :percentage="true"
            />
          </v-col>
        </v-row>
        <br>
        <v-card-title class="justify-center sectionTitle">Miscellaneous</v-card-title>
        <v-row no-gutters justify="space-around" align="center">
          <v-col cols="3">
            <v-row no-gutters justify="center">
              <div class="chartTitle">Counter Hits</div>
              <DoughnutChart
                :width="400"
                :height="150"
                :chartData="[stats.opponent.overall.counterHits, stats.player.overall.counterHits]"
                :labels="[opponentTag, playerTag]"
                :colors="['#e33a0b', '#44A963']"
                :percentage="Math.round(stats.player.average.beneficialCounterHitRatio * 100)"
              />
              <div class="doughnutFooter">
                {{ stats.player.overall.counterHits }} - {{ stats.player.overall.negativeCounterHits }}
              </div>
            </v-row>
          </v-col>
          <v-col cols="3">
            <div class="chartTitle">
              Actions Per Minute
              <v-tooltip right>
                <template v-slot:activator="{on, attrs}">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    style="margin-bottom: 3px;"
                  >mdi-information</v-icon>
                </template>
                <span>
                  Higher is better
                </span>
              </v-tooltip>
            </div>
            <div class="barLegend">
              <v-chip
                small
                color="#44A963"
                text-color="white"
                style="margin-right: 5px;"
              >{{ playerTag }}</v-chip>
              <v-chip small color="#e33a0b" text-color="white">{{ opponentTag }}</v-chip>
            </div>
            <BarChart
              :height="200"
              :chartData="[stats.player.average.apm, stats.opponent.average.apm]"
              :tags="[playerTag, opponentTag]"
              :percentage="false"
            />
          </v-col>
          <v-col cols="3">
            <v-row no-gutters justify="center">
              <div class="chartTitle">Beneficial Trades</div>
              <DoughnutChart
                :width="400"
                :height="150"
                :chartData="[stats.player.overall.negativeTrades, stats.player.overall.beneficialTrades]"
                :labels="[opponentTag, playerTag]"
                :colors="['#e33a0b', '#44A963']"
                :percentage="Math.round(stats.player.average.beneficialTradeRatio * 100)"
              />
              <div class="doughnutFooter">
                {{ stats.player.overall.beneficialTrades }} - {{ stats.player.overall.negativeTrades }}
              </div>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters justify="space-around" style="margin-top: 20px;">
          <v-col cols="3">
            <div class="chartTitle">
              4 Stocks
              <v-tooltip right v-if="stats.player.overall.lraStarts + stats.opponent.overall.lraStarts > 0">
                <template v-slot:activator="{on, attrs}">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    style="margin-bottom: 3px;"
                  >mdi-information</v-icon>
                </template>
                <span>
                  Note: This may include games that ended in a L+R+A+Start.
                  <br>
                  Choose the "Exclude all games ending with L+R+A+Start" option to get a more accurate representation.
                </span>
              </v-tooltip>
            </div>
            <div class="barLegend">
              <v-chip
                small
                color="#44A963"
                text-color="white"
                style="margin-right: 5px;"
              >{{ playerTag }}</v-chip>
              <v-chip small color="#e33a0b" text-color="white">{{ opponentTag }}</v-chip>
            </div>
            <BarChart
              :height="200"
              :chartData="[stats.player.overall.fourStocks, stats.opponent.overall.fourStocks]"
              :tags="[playerTag, opponentTag]"
              :percentage="false"
            />
          </v-col>
          <v-col cols="3">
            <div class="chartTitle">
              Average Stocks Taken
            </div>
            <div class="barLegend">
              <v-chip
                small
                color="#44A963"
                text-color="white"
                style="margin-right: 5px;"
              >{{ playerTag }}</v-chip>
              <v-chip small color="#e33a0b" text-color="white">{{ opponentTag }}</v-chip>
            </div>
            <BarChart
              :height="200"
              :chartData="[stats.player.average.stocksTaken, stats.opponent.average.stocksTaken]"
              :tags="[playerTag, opponentTag]"
              :percentage="false"
            />
          </v-col>
          <v-col cols="3">
            <div class="chartTitle">
              Average Stock Differential
              <v-tooltip right>
                <template v-slot:activator="{on, attrs}">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    style="margin-bottom: 3px;"
                  >mdi-information</v-icon>
                </template>
                <span>
                  Average number of stocks remaining in a won match
                </span>
              </v-tooltip>
            </div>
            <div class="barLegend">
              <v-chip
                small
                color="#44A963"
                text-color="white"
                style="margin-right: 5px;"
                :percentage="false"
              >{{ playerTag }}</v-chip>
              <v-chip small color="#e33a0b" text-color="white">{{ opponentTag }}</v-chip>
            </div>
            <BarChart
              :height="200"
              :chartData="[stats.player.average.stockDifferential, stats.opponent.average.stockDifferential]"
              :tags="[playerTag, opponentTag]"
              :percentage="false"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import DoughnutChart from "./DoughnutChart";
import BarChart from "./Bar";

export default {
  name: "StatsCard",
  components: {
    DoughnutChart,
    BarChart,
  },
  props: {
    stats: Object,
    playerTag: String,
    opponentTag: String,
  },
  computed: {
    timePlayed() {
      let frames = this.stats.totalNumFrames;
      let hours = Math.round(frames / 60 / 60 / 60);
      if (hours == 0) {
        let minutes = Math.round(frames / 60 / 60);
        if (minutes == 0) {
          return 1;
        }
        return minutes;
      }
      return hours;
    },
    timeInMinutes() {
      let frames = this.stats.totalNumFrames;
      return Math.round(frames / 60 / 60/ 60) == 0;
    }
  },
};
</script>

<style>
.chartTitle {
  text-align: center;
  font-size: 20px;
  margin-bottom: 5px;
}
.doughnutFooter {
  font-size: 18px;
  margin-top: 3px;
}
.gameInfo {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 10%;
  padding-top: 10px;
}
.sectionTitle {
  font-size: 28px;
}
.barLegend {
  text-align: center;
  margin-bottom: 5px;
}
</style>
