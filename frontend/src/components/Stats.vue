<template>
  <v-container>
    <v-row justify="center" no-gutters>
      <div
        :style="panelOpening ? 'transition: width .3s; width: 100%;' : 'transition: width .3s; width: 50%; transition-delay: .3s;'"
        justify="center"
      >
        <v-expansion-panels v-model="panel" popout hover>
          <v-expansion-panel @click="panelClick()">
            <v-expansion-panel-header>
              <template v-slot:default>
                <v-row no-gutters justify="center" class="title font-weight-regular">Search</v-row>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-form ref="form" v-model="valid">
                <v-row dense justify="space-around">
                  <v-col cols="4">
                    <v-row no-gutters justify="center">
                      <v-text-field
                        dense
                        outlined
                        v-model="code"
                        :rules="codeRules"
                        label="Your Connect Code"
                        required
                      ></v-text-field>
                    </v-row>
                    <v-row no-gutters justify="center">
                      <v-autocomplete
                        multiple
                        outlined
                        v-model="characters"
                        :items="characterList"
                        label="Characters"
                      >
                        <template v-slot:selection="selection">
                          <v-chip v-bind="selection.attrs" @click="removeCharacter(selection.item)">
                            <span
                              v-if="selection.item == 'Sheik / Zelda'"
                              style="display: inherit;"
                            >
                              <v-img
                                :src="require(`../assets/stock_icons/Sheik.png`)"
                                :alt="selection.item"
                                max-width="20"
                                style="margin-right: 5px;"
                              ></v-img>
                              <v-img
                                :src="require(`../assets/stock_icons/Zelda.png`)"
                                :alt="selection.item"
                                max-width="20"
                                :style="characters.length > 1 ? '' : 'margin-right: 5px;'"
                              ></v-img>
                            </span>
                            <v-img
                              v-if="selection.item != 'Sheik / Zelda'"
                              :src="require(`../assets/stock_icons/${selection.item}.png`)"
                              :alt="selection.item"
                              max-width="20"
                              :style="characters.length > 1 ? '' : 'margin-right: 5px;'"
                            ></v-img>
                            <span v-if="characters.length < 2">{{ selection.item }}</span>
                          </v-chip>
                        </template>
                        <template v-slot:item="character">
                          <span v-if="character.item == 'Sheik / Zelda'" style="display: inherit;">
                            <v-img
                              :src="require(`../assets/stock_icons/Sheik.png`)"
                              :alt="character.item"
                              max-width="20"
                              style="margin-right: 5px;"
                            ></v-img>
                            <v-img
                              :src="require(`../assets/stock_icons/Zelda.png`)"
                              :alt="character.item"
                              max-width="20"
                              style="margin-right: 5px;"
                            ></v-img>
                          </span>
                          <v-img
                            v-if="character.item != 'Sheik / Zelda'"
                            :src="require(`../assets/stock_icons/${character.item}.png`)"
                            :alt="character.item"
                            max-width="20"
                            style="margin-right: 5px;"
                          ></v-img>
                          {{ character.item }}
                        </template>
                      </v-autocomplete>
                    </v-row>
                    <v-row no-gutters justify="center">
                      <v-autocomplete
                        multiple
                        outlined
                        v-model="stages"
                        :items="stageList"
                        label="Stages"
                      >
                        <template v-slot:selection="{item, index, attrs}">
                          <v-chip v-bind="attrs" @click="removeStage(item)">{{ item }}</v-chip>
                        </template>
                        <template v-slot:item="selection">{{ selection.item }}</template>
                      </v-autocomplete>
                    </v-row>
                    <v-row no-gutters justify="center">
                      <v-checkbox
                        v-model="excludeLRAStart"
                        label="Exclude all games ending with L+R+A+Start"
                      ></v-checkbox>
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-icon
                            v-bind="attrs"
                            v-on="on"
                            style="margin-bottom: 2px; margin-left: 5px;"
                          >mdi-information</v-icon>
                        </template>
                        <span>
                          Note: All games quit out within 30 seconds are starting are automatically excluded.
                          <br />This option will exclude
                          <strong>ALL</strong> games quit out before ending regardless of length.
                        </span>
                      </v-tooltip>
                    </v-row>
                  </v-col>

                  <v-col cols="4">
                    <v-row no-gutters justify="center">
                      <v-text-field
                        dense
                        outlined
                        v-model="opponentCode"
                        :rules="opponentCodeRules"
                        label="Opponent's Connect Code"
                      ></v-text-field>
                    </v-row>
                    <v-row no-gutters justify="center">
                      <v-row no-gutters justify="center">
                        <v-autocomplete
                          multiple
                          outlined
                          v-model="opponentCharacters"
                          :items="characterList"
                          label="Opponent's Characters"
                        >
                          <template v-slot:selection="selection">
                            <v-chip
                              v-bind="selection.attrs"
                              @click="removeOpponentCharacter(selection.item)"
                            >
                              <span
                                v-if="selection.item == 'Sheik / Zelda'"
                                style="display: inherit;"
                              >
                                <v-img
                                  :src="require(`../assets/stock_icons/Sheik.png`)"
                                  :alt="selection.item"
                                  max-width="20"
                                  style="margin-right: 5px;"
                                ></v-img>
                                <v-img
                                  :src="require(`../assets/stock_icons/Zelda.png`)"
                                  :alt="selection.item"
                                  max-width="20"
                                  :style="opponentCharacters.length > 1 ? '' : 'margin-right: 5'"
                                ></v-img>
                              </span>
                              <v-img
                                v-if="selection.item != 'Sheik / Zelda'"
                                :src="require(`../assets/stock_icons/${selection.item}.png`)"
                                :alt="selection.item"
                                max-width="20"
                                :style="opponentCharacters.length > 1 ? '' : 'margin-right: 5px;'"
                              ></v-img>
                              <span v-if="opponentCharacters.length < 2">{{ selection.item }}</span>
                            </v-chip>
                          </template>
                          <template v-slot:item="character">
                            <span
                              v-if="character.item == 'Sheik / Zelda'"
                              style="display: inherit;"
                            >
                              <v-img
                                :src="require(`../assets/stock_icons/Sheik.png`)"
                                :alt="character.item"
                                max-width="20"
                                style="margin-right: 5px;"
                              ></v-img>
                              <v-img
                                :src="require(`../assets/stock_icons/Zelda.png`)"
                                :alt="character.item"
                                max-width="20"
                                style="margin-right: 5px;"
                              ></v-img>
                            </span>
                            <v-img
                              v-if="character.item != 'Sheik / Zelda'"
                              :src="require(`../assets/stock_icons/${character.item}.png`)"
                              :alt="character.item"
                              max-width="20"
                              style="margin-right: 5px;"
                            ></v-img>
                            {{ character.item }}
                          </template>
                        </v-autocomplete>
                      </v-row>
                    </v-row>
                    <v-row no-gutters justify="center">
                      <v-col>
                        <v-row no-gutters justify="center">
                          <v-checkbox
                            style="margin: 0;"
                            v-model="searchAllTime"
                            label="Search games from all time"
                          ></v-checkbox>
                          <v-tooltip bottom>
                            <template v-slot:activator="{on, attrs}">
                              <v-icon
                                v-bind="attrs"
                                v-on="on"
                                style="margin-bottom: 18px; margin-left: 5px;"
                              >mdi-information</v-icon>
                            </template>
                            <span>
                              Leave checked to serach games matching the criteria regardless of date.
                              <br>
                              Uncheck to pick a date range. Selecting one date will search from that date to present, two dates will search between those dates.
                            </span>
                          </v-tooltip>
                        </v-row>
                        <v-row v-if="!searchAllTime" no-gutters justify="center">
                          <v-date-picker
                            @click:date="onDateChange"
                            :show-current="false"
                            :allowed-dates="allowedDates"
                            v-model="dates"
                            multiple
                            color="primary"
                            no-title
                            elevation="3"
                          ></v-date-picker>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                <v-row dense justify="center">
                  <v-btn style="margin-right: 15px;" color="normal" @click="reset()">Reset</v-btn>
                  <v-btn :disabled="!valid" color="success" @click="getStats()">Search</v-btn>
                </v-row>
              </v-form>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-row>
    <br />
    <v-row v-if="stats && stats.numGames == 0" justify="center" no-gutters>
      <v-col cols="5">
        <v-alert type="error" class="text-center">
          No games found with search criteria.
          <router-link to="/">Click here</router-link> to upload more slippi files.
        </v-alert>
      </v-col>
    </v-row>
    <div v-if="stats && stats.numGames > 0">
      <v-row no-gutters justify="center">
        <v-col cols="3" justify="center">
          <v-alert type="success" class="text-center">
            {{ stats.numGames}} games found
            <span v-if="stats.timeouts > 0">
              ({{ stats.timeouts }} timeout
              <span v-if="stats.timeouts > 1">s</span>)
            </span>!
          </v-alert>
        </v-col>
      </v-row>
      <v-row no-gutters justify="space-around">
        <v-card class="mx-auto" max-width="40%">
          <v-card-title
            class="justify-center"
          >{{ stats.player.playerData.tag ? stats.player.playerData.tag : stats.player.playerData.code }}'s Stats</v-card-title>
          <v-card-title class="font-weight-regular">Summary</v-card-title>
          <v-card-text class="text--primary">
            {{ stats.player.overall.wins }}
            <span style="color: #4caf50;">W</span>
            - {{ stats.numGames - stats.player.overall.wins }}
            <span
              style="color: red;"
            >L</span>
            ({{ Math.round(stats.player.overall.wins / stats.numGames * 100) }}%)
            {{ }}
          </v-card-text>
        </v-card>
        <v-card class="mx-auto" max-width="40%">
          <v-card-title
            class="justify-center"
          >{{ stats && submittedOpponentCode ? (stats.opponent.playerData[submittedOpponentCode] ? stats.opponent.playerData[submittedOpponentCode] : submittedOpponentCode) : 'Opponent' }}'s Stats</v-card-title>
          <v-card-text>{{stats.opponent.average}}</v-card-text>
        </v-card>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import API from "../api";

export default {
  name: "Stats",
  props: {
    source: String,
  },
  data: () => ({
    characterList: [
      "Bowser",
      "Captain Falcon",
      "Donkey Kong",
      "Dr. Mario",
      "Falco",
      "Fox",
      "Ganondorf",
      "Ice Climbers",
      "Jigglypuff",
      "Kirby",
      "Link",
      "Luigi",
      "Mario",
      "Marth",
      "Mewtwo",
      "Mr. Game & Watch",
      "Ness",
      "Peach",
      "Pichu",
      "Pikachu",
      "Roy",
      "Samus",
      "Sheik / Zelda",
      "Yoshi",
      "Young Link",
    ],
    stageList: [
      "Battlefield",
      "Dreamland",
      "Final Destination",
      "Fountain of Dreams",
      "Pokemon Stadium",
      "Yoshi's Story",
    ],
    panel: 0,
    panelOpening: true,
    valid: false,
    code: undefined,
    characters: [],
    stages: [],
    opponentCode: undefined,
    opponentCharacters: [],
    excludeLRAStart: false,
    stats: undefined,
    submittedOpponentCode: undefined,
    searchAllTime: true,
    dates: [],
    allowedDates: (val) => new Date(new Date(val).toLocaleDateString()) < new Date(new Date().toLocaleDateString()),
    codeRules: [
      (v) => !!v || v != "" || "Player code is required",
      (v) =>
        /^[a-zA-Z]{2,4}#?\d{3}$/.test(v) ||
        "Player code must be in format: ABCD#123 or ABCD123",
    ],
    opponentCodeRules: [
      (v) =>
        !v ||
        /^$|^[a-zA-Z]{2,4}#?\d{3}$/.test(v) ||
        "Player code must be in format: ABCD#123 or ABCD123",
    ],
  }),
  mounted: function () {
    let code = this.$route.params.code;
    if (code) {
      let codeFirstDigit = code.indexOf(code.match(/\d/));
      if (codeFirstDigit == -1) {
        this.code = code;
      } else {
        this.code =
          code.substring(0, codeFirstDigit).toLocaleUpperCase() +
          "#" +
          code.substring(codeFirstDigit);
      }
      this.$refs.form.validate();
    }
  },
  methods: {
    getStats() {
      let code = this.code.replace("#", ""); // Remove # for api request
      let data = {};
      if (this.code.indexOf("#") == -1) {
        // Add # for display if not provided
        let codeFirstDigit = code.indexOf(this.code.match(/\d/));
        if (codeFirstDigit != -1) {
          this.code =
            this.code.substring(0, codeFirstDigit).toLocaleUpperCase() +
            "#" +
            this.code.substring(codeFirstDigit);
        }
      }
      if (this.opponentCode) {
        data.opponentCode = this.opponentCode.replace("#", "");
        if (this.opponentCode.indexOf("#") == -1) {
          // Add # for display if not provided
          let codeFirstDigit = this.opponentCode.indexOf(
            this.opponentCode.match(/\d/)
          );
          if (codeFirstDigit != -1) {
            this.opponentCode =
              this.opponentCode
                .substring(0, codeFirstDigit)
                .toLocaleUpperCase() +
              "#" +
              this.opponentCode.substring(codeFirstDigit);
          }
        }
      }
      this.submittedOpponentCode = this.opponentCode;
      if (this.excludeLRAStart) data.excludeLRAStart = true;
      if (this.stages.length > 0)
        data.stages = this.stages.map((str) => str.replace(/\s/g, ""));
      if (this.characters.length > 0) {
        let characters = this.characters;
        let index = characters.indexOf("Sheik / Zelda");
        if (index != -1) this.characters.splice(index, 1);
        characters.push("Sheik", "Zelda");
        data.characters = characters.map((str) => str.replace(/\s/g, ""));
      }
      if (this.opponentCharacters.length > 0) {
        let characters = this.opponentCharacters;
        let index = characters.indexOf("Sheik / Zelda");
        if (index != -1) {
          this.characters.splice(index, 1);
          characters.push("Sheik", "Zelda");
        }
        data.opponentCharacters = characters.map((str) =>
          str.replace(/\s/g, "")
        );
      }
      if (this.dates.length > 0 && !this.searchAllTime) {
        data.dates = this.dates;
      }

      API.getStats(code, data)
        .then((response) => {
          console.log(response.data);
          this.stats = response.data;
          // Close panel if results are found
          if (this.stats.numGames > 0) {
            this.panelOpening = false;
            this.panel = undefined;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    reset() {
      let code = this.$route.params.code;
      if (!code) {
        this.code = "";
      } else {
        let codeFirstDigit = code.indexOf(code.match(/\d/));
        if (codeFirstDigit == -1) {
          this.code = code;
        } else {
          this.code =
            code.substring(0, codeFirstDigit).toLocaleUpperCase() +
            "#" +
            code.substring(codeFirstDigit);
        }
      }
      this.characters = [];
      this.stages = [];
      this.opponentCode = undefined;
      this.opponentCharacters = [];
      this.excludeLRAStart = false;
      this.stats = undefined;
      this.submittedOpponentCode = undefined;
      this.searchAllTime = true;
      this.dates = [];
    },
    panelClick() {
      if (this.panel == 0) {
        this.panelOpening = false;
      } else {
        this.panel = 0;
        this.panelOpening = true;
        setTimeout(() => {
          this.panel = 0;
        }, 300);
      }
    },
    removeCharacter(item) {
      let index = this.characters.indexOf(item);
      if (index != -1) this.characters.splice(index, 1);
    },
    removeOpponentCharacter(item) {
      let index = this.opponentCharacters.indexOf(item);
      if (index != -1) this.opponentCharacters.splice(index, 1);
    },
    removeStage(item) {
      let index = this.stages.indexOf(item);
      if (index != -1) this.stages.splice(index, 1);
    },
    onDateChange() {
      if (this.dates.length > 2) {
        this.dates.splice(0, 1);
        this.dates = this.dates.sort();
      }
    }
  },
};
</script>

<style>
.checkbox {
  border: 1px 1px black;
}
</style>
