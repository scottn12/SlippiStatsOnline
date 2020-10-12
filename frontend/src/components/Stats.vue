<template>
  <v-container>
    <v-row justify="center" no-gutters>
      <div
        :style="
          panelOpening
            ? 'transition: width .3s; width: 100%;'
            : 'transition: width .3s; width: 50%; transition-delay: .3s;'
        "
        justify="center"
      >
        <v-expansion-panels v-model="panel" popout hover>
          <v-expansion-panel @click="panelClick()">
            <v-expansion-panel-header>
              <template v-slot:default>
                <v-row
                  no-gutters
                  justify="center"
                  class="title font-weight-regular"
                  >Search</v-row
                >
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row no-gutters justify="center">
                <v-switch
                  style="margin-top: 0; margin-bottom: 15px"
                  color="#44A963"
                  hide-details
                  label="Global Search"
                  v-model="isGlobal"
                  @change="reset()"
                >
                </v-switch>
                <v-tooltip
                  :right="!$vuetify.breakpoint.xsOnly"
                  :bottom="$vuetify.breakpoint.xsOnly"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      v-on="on"
                      style="margin-bottom: 12px; margin-left: 5px"
                      >mdi-information</v-icon
                    >
                  </template>
                  <span>
                    Global searches will use <strong>ALL</strong> games
                    uploaded.
                    <br />
                    Note: Mirror matches (dittos) will always be excluded from
                    global search results.
                  </span>
                </v-tooltip>
              </v-row>
              <v-form ref="form" v-model="valid">
                <!-- Row 1 -->
                <v-flex
                  v-if="!isGlobal"
                  :row="!$vuetify.breakpoint.xsOnly"
                  wrap
                  class="justify-space-around"
                >
                  <v-col sm="1" md="4">
                    <v-text-field
                      dense
                      outlined
                      v-model="code"
                      :rules="codeRules"
                      label="Your Connect Code"
                      required
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col sm="1" md="4">
                    <v-text-field
                      dense
                      outlined
                      v-model="opponentCode"
                      :rules="opponentCodeRules"
                      label="Opponent's Connect Code"
                      hide-details
                    ></v-text-field>
                  </v-col>
                </v-flex>
                <!-- Row 2 -->
                <v-flex
                  :row="!$vuetify.breakpoint.xsOnly"
                  wrap
                  class="justify-space-around"
                >
                  <v-col sm="1" md="4">
                    <v-autocomplete
                      :multiple="!isGlobal"
                      outlined
                      v-model="characters"
                      :items="characterList"
                      :label="isGlobal ? 'Character' : 'Your Characters'"
                      :required="isGlobal"
                      :rules="isGlobal ? characterRules : undefined"
                      hide-details
                    >
                      <template v-slot:selection="selection">
                        <v-chip
                          v-bind="selection.attrs"
                          @click="removeCharacter(selection.item)"
                        >
                          <span
                            v-if="selection.item == 'Sheik / Zelda'"
                            style="display: inherit"
                          >
                            <v-img
                              :src="require(`../assets/stock_icons/Sheik.png`)"
                              :alt="selection.item"
                              max-width="20"
                              style="margin-right: 5px"
                            ></v-img>
                            <v-img
                              :src="require(`../assets/stock_icons/Zelda.png`)"
                              :alt="selection.item"
                              max-width="20"
                              :style="
                                characters.length > 1
                                  ? ''
                                  : 'margin-right: 5px;'
                              "
                            ></v-img>
                          </span>
                          <v-img
                            v-if="selection.item != 'Sheik / Zelda'"
                            :src="
                              require(`../assets/stock_icons/${selection.item}.png`)
                            "
                            :alt="selection.item"
                            max-width="20"
                            :style="
                              characters.length > 1 ? '' : 'margin-right: 5px;'
                            "
                          ></v-img>
                          <span v-if="characters.length < 2">{{
                            selection.item
                          }}</span>
                        </v-chip>
                      </template>
                      <template v-slot:item="character">
                        <span
                          v-if="character.item == 'Sheik / Zelda'"
                          style="display: inherit"
                        >
                          <v-img
                            :src="require(`../assets/stock_icons/Sheik.png`)"
                            :alt="character.item"
                            max-width="20"
                            style="margin-right: 5px"
                          ></v-img>
                          <v-img
                            :src="require(`../assets/stock_icons/Zelda.png`)"
                            :alt="character.item"
                            max-width="20"
                            style="margin-right: 5px"
                          ></v-img>
                        </span>
                        <v-img
                          v-if="character.item != 'Sheik / Zelda'"
                          :src="
                            require(`../assets/stock_icons/${character.item}.png`)
                          "
                          :alt="character.item"
                          max-width="20"
                          style="margin-right: 5px"
                        ></v-img>
                        {{ character.item }}
                      </template>
                    </v-autocomplete>
                  </v-col>
                  <v-col sm="1" md="4">
                    <v-autocomplete
                      :multiple="!isGlobal"
                      outlined
                      v-model="opponentCharacters"
                      :items="characterList"
                      :label="
                        isGlobal
                          ? 'Opponent\'s Character'
                          : 'Opponent\'s Characters'
                      "
                      hide-details
                    >
                      <template v-slot:selection="selection">
                        <v-chip
                          v-bind="selection.attrs"
                          @click="removeOpponentCharacter(selection.item)"
                        >
                          <span
                            v-if="selection.item == 'Sheik / Zelda'"
                            style="display: inherit"
                          >
                            <v-img
                              :src="require(`../assets/stock_icons/Sheik.png`)"
                              :alt="selection.item"
                              max-width="20"
                              style="margin-right: 5px"
                            ></v-img>
                            <v-img
                              :src="require(`../assets/stock_icons/Zelda.png`)"
                              :alt="selection.item"
                              max-width="20"
                              :style="
                                opponentCharacters.length > 1
                                  ? ''
                                  : 'margin-right: 5'
                              "
                            ></v-img>
                          </span>
                          <v-img
                            v-if="selection.item != 'Sheik / Zelda'"
                            :src="
                              require(`../assets/stock_icons/${selection.item}.png`)
                            "
                            :alt="selection.item"
                            max-width="20"
                            :style="
                              opponentCharacters.length > 1
                                ? ''
                                : 'margin-right: 5px;'
                            "
                          ></v-img>
                          <span v-if="opponentCharacters.length < 2">{{
                            selection.item
                          }}</span>
                        </v-chip>
                      </template>
                      <template v-slot:item="character">
                        <span
                          v-if="character.item == 'Sheik / Zelda'"
                          style="display: inherit"
                        >
                          <v-img
                            :src="require(`../assets/stock_icons/Sheik.png`)"
                            :alt="character.item"
                            max-width="20"
                            style="margin-right: 5px"
                          ></v-img>
                          <v-img
                            :src="require(`../assets/stock_icons/Zelda.png`)"
                            :alt="character.item"
                            max-width="20"
                            style="margin-right: 5px"
                          ></v-img>
                        </span>
                        <v-img
                          v-if="character.item != 'Sheik / Zelda'"
                          :src="
                            require(`../assets/stock_icons/${character.item}.png`)
                          "
                          :alt="character.item"
                          max-width="20"
                          style="margin-right: 5px"
                        ></v-img>
                        {{ character.item }}
                      </template>
                    </v-autocomplete>
                  </v-col>
                </v-flex>

                <!-- Row 3 -->
                <v-flex
                  :row="!$vuetify.breakpoint.xsOnly"
                  wrap
                  class="justify-space-around"
                >
                  <v-col sm="1" md="4">
                    <v-autocomplete
                      multiple
                      outlined
                      v-model="stages"
                      :items="stageList"
                      label="Stages"
                      hide-details
                    >
                      <template v-slot:selection="{ item, attrs }">
                        <v-chip v-bind="attrs" @click="removeStage(item)">{{
                          item
                        }}</v-chip>
                      </template>
                      <template v-slot:item="selection">{{
                        selection.item
                      }}</template>
                    </v-autocomplete>
                  </v-col>
                  <v-col sm="1" md="4">
                    <div style="text-align: center; margin-top: 15px">
                      <v-checkbox
                        style="margin: 0; display: inline-block"
                        v-model="searchAllTime"
                        label="Search games from all time"
                        hide-details
                      ></v-checkbox>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            v-bind="attrs"
                            v-on="on"
                            style="margin-bottom: 8px; margin-left: 5px"
                            >mdi-information</v-icon
                          >
                        </template>
                        <span>
                          Leave checked to serach games matching the criteria
                          regardless of date.
                          <br />Uncheck to pick a date range. Selecting one date
                          will search from that date to present, two dates will
                          search between those dates.
                        </span>
                      </v-tooltip>
                    </div>
                  </v-col>
                  <!-- Calander here on mobile -->
                  <v-col
                    sm="1"
                    md="4"
                    v-if="$vuetify.breakpoint.xsOnly && !searchAllTime"
                  >
                    <div style="text-align: center">
                      <v-date-picker
                        v-if="!searchAllTime"
                        @click:date="onDateChange"
                        :show-current="false"
                        :allowed-dates="allowedDates"
                        v-model="dates"
                        multiple
                        color="primary"
                        no-title
                        elevation="3"
                      ></v-date-picker>
                    </div>
                  </v-col>
                </v-flex>
                <!-- Row 4 -->
                <v-flex
                  :row="!$vuetify.breakpoint.xsOnly"
                  wrap
                  class="justify-space-around"
                >
                  <v-col sm="1" md="4">
                    <div style="text-align: center">
                      <v-checkbox
                        v-model="excludeLRAStart"
                        label="Exclude all games ending with L+R+A+Start"
                        style="max-width: 80%; display: inline-block"
                      ></v-checkbox>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            v-bind="attrs"
                            v-on="on"
                            style="margin-bottom: 12px; margin-left: 5px"
                            >mdi-information</v-icon
                          >
                        </template>
                        <span>
                          This option will exclude
                          <strong>ALL</strong> games quit out before ending
                          regardless of length.
                          <br />
                          Note: All games quit out within 30 seconds of starting
                          are automatically excluded.
                        </span>
                      </v-tooltip>
                    </div>
                  </v-col>
                  <!-- Calander here on desktop -->
                  <v-col sm="1" md="4" v-if="!$vuetify.breakpoint.xsOnly">
                    <div style="text-align: center">
                      <v-date-picker
                        v-if="!searchAllTime"
                        @click:date="onDateChange"
                        :show-current="false"
                        :allowed-dates="allowedDates"
                        v-model="dates"
                        multiple
                        color="primary"
                        no-title
                        elevation="3"
                      ></v-date-picker>
                    </div>
                  </v-col>
                </v-flex>
                <!-- Row 5 (Buttons) -->
                <v-row no-gutters justify="center">
                  <v-btn
                    style="margin-right: 15px"
                    color="normal"
                    @click="reset()"
                    >Reset</v-btn
                  >
                  <v-btn :disabled="!valid" color="success" @click="getStats()"
                    >Search</v-btn
                  >
                </v-row>
              </v-form>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <!-- Waiting animation -->
          <v-fade-transition>
            <v-overlay
              v-if="waiting"
              absolute
              class="justify-center"
              color="loadingOverlay"
              :opacity="0.8"
            >
              <v-row no-gutters justify="center">
                <v-progress-circular
                  :size="70"
                  :width="7"
                  color="primary"
                  indeterminate
                ></v-progress-circular>
              </v-row>
            </v-overlay>
          </v-fade-transition>
        </v-expansion-panels>
      </div>
    </v-row>
    <br />
    <!-- Results messages -->
    <v-row justify="center" no-gutters>
      <!-- No games -->
      <v-col :cols="!$vuetify.breakpoint.xsOnly ? '3' : '10'">
        <v-alert
          v-if="stats && stats.numGames == 0"
          type="error"
          class="text-center"
          color="error"
        >
          No games found with search criteria.
          <router-link style="color: white" to="/">Click here</router-link> to
          upload more slippi files.
        </v-alert>
        <!-- Error -->
        <v-alert v-if="error" type="error" class="text-center" color="error">
          {{ errorMessage }}
        </v-alert>
        <!-- Sucess -->
        <v-alert
          v-if="stats && stats.numGames > 0"
          type="success"
          class="text-center"
          color="primary"
        >
          {{ numToStr(stats.numGames) }} games found!
        </v-alert>
      </v-col>
    </v-row>

    <!-- Show if success -->
    <div v-if="stats && stats.numGames > 0">
      <!-- Share button -->
      <v-row no-gutters justify="center">
        <v-tooltip right v-model="showShareToolTip">
          <template v-slot:activator="{}">
            <v-btn outlined color="primary" @click="share()">Share</v-btn>
          </template>
          <span> URL copied to clipboard! </span>
        </v-tooltip>
      </v-row>
      <!-- Stats Card -->
      <v-row no-gutters justify="center">
        <StatsCard
          :stats="stats"
          :playerTag="playerTag"
          :opponentTag="opponentTag"
        />
      </v-row>
    </div>
  </v-container>
</template>

<script>
import API from "../api";
import StatsCard from "./StatsCard";

export default {
  name: "Stats",
  components: {
    StatsCard,
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
    characterListLower: [
      "bowser",
      "captainfalcon",
      "donkeykong",
      "dr.mario",
      "falco",
      "fox",
      "ganondorf",
      "iceclimbers",
      "jigglypuff",
      "kirby",
      "link",
      "luigi",
      "mario",
      "marth",
      "mewtwo",
      "mr.game&watch",
      "ness",
      "peach",
      "pichu",
      "pikachu",
      "roy",
      "samus",
      "sheik/zelda",
      "yoshi",
      "younglink",
    ],
    stageListLower: [
      "battlefield",
      "dreamland",
      "finaldestination",
      "fountainofdreams",
      "pokemonstadium",
      "yoshi'sstory",
    ],
    panel: 0,
    panelOpening: true,
    isGlobal: false,
    valid: false,
    code: undefined,
    characters: [],
    stages: [],
    opponentCode: undefined,
    opponentCharacters: [],
    excludeLRAStart: true,
    stats: undefined,
    submittedOpponentCode: undefined,
    searchAllTime: true,
    dates: [],
    showShareToolTip: false,
    error: false,
    waiting: false,
    errorMessage: undefined,
    playerTag: undefined,
    opponentTag: undefined,
    allowedDates: (val) =>
      new Date(new Date(val).toLocaleDateString()) <
      new Date(new Date().toLocaleDateString()),
    codeRules: [
      (v) => !!v || v != "" || "Player code is required",
      (v) =>
        !v ||
        v.length <= 8 ||
        "Player code cannot be greater than 8 characters",
      (v) =>
        /^[a-zA-Z\d]{1,6}#\d{1,6}$/.test(v) ||
        "Player code must be in format: ABCD#123",
    ],
    opponentCodeRules: [
      (v) =>
        !v ||
        v.length <= 8 ||
        "Opponent code cannot be greater than 8 characters",
      (v) =>
        !v ||
        /^[a-zA-Z\d]{1,6}#\d{1,6}$/.test(v) ||
        "Opponent code must be in format: ABCD#123",
    ],
    characterRules: [
      (v) =>
        !!v ||
        (v != "" && v != [] && v != undefined) ||
        "Character is required",
    ],
  }),
  mounted: function () {
    let code = this.$route.params.code;
    if (code) {
      if (code === "global") {
        this.isGlobal = true;
      } else {
        this.code = code.replace("-", "#");
        this.$refs.form.validate();
      }
    }

    if (!this.isGlobal) {
      let opponentCode = this.$route.query.opponentCode;
      if (opponentCode) {
        this.opponentCode = opponentCode.replace("-", "#");
        this.$refs.form.validate();
      }
      let characters = this.$route.query.characters;
      if (characters) {
        if (!Array.isArray(characters)) {
          characters = [characters];
        }
        characters.forEach((character) => {
          if (
            character.toLocaleLowerCase() == "sheik" ||
            character.toLocaleLowerCase() == "zelda"
          ) {
            if (this.characters.indexOf("Sheik / Zelda") == -1) {
              this.characters.push("Sheik / Zelda");
            }
          } else {
            let i = this.characterListLower.indexOf(
              character.toLocaleLowerCase()
            );
            if (
              i != -1 &&
              this.characters.indexOf(this.characterList[i]) == -1
            ) {
              this.characters.push(this.characterList[i]);
            }
          }
        });
      }

      let opponentCharacters = this.$route.query.opponentCharacters;
      if (opponentCharacters) {
        if (!Array.isArray(opponentCharacters)) {
          opponentCharacters = [opponentCharacters];
        }
        opponentCharacters.forEach((character) => {
          if (
            character.toLocaleLowerCase() == "sheik" ||
            character.toLocaleLowerCase() == "zelda"
          ) {
            if (this.opponentCharacters.indexOf("Sheik / Zelda") == -1) {
              this.opponentCharacters.push("Sheik / Zelda");
            }
          } else {
            let i = this.characterListLower.indexOf(
              character.toLocaleLowerCase()
            );
            if (
              i != -1 &&
              this.opponentCharacters.indexOf(this.characterList[i]) == -1
            ) {
              this.opponentCharacters.push(this.characterList[i]);
            }
          }
        });
      }
    } else {
      let character = this.$route.query.characters;
      if (
        character.toLocaleLowerCase() == "sheik" ||
        character.toLocaleLowerCase() == "zelda"
      ) {
        this.characters = "Sheik / Zelda";
      } else {
        let i = this.characterListLower.indexOf(character.toLocaleLowerCase());
        if (i != -1) {
          this.characters = this.characterList[i];
        }
      }

      let opponentCharacter = this.$route.query.opponentCharacters;
      if (opponentCharacter) {
        if (
          opponentCharacter.toLocaleLowerCase() == "sheik" ||
          opponentCharacter.toLocaleLowerCase() == "zelda"
        ) {
          this.opponentCharacter = "Sheik / Zelda";
        } else {
          let i = this.characterListLower.indexOf(
            opponentCharacter.toLocaleLowerCase()
          );
          if (i != -1) {
            this.opponentCharacters = this.characterList[i];
          }
        }
      }
    }

    let stages = this.$route.query.stages;
    if (stages) {
      if (!Array.isArray(stages)) {
        stages = [stages];
      }
      stages.forEach((stage) => {
        let i = this.stageListLower.indexOf(stage.toLocaleLowerCase());
        if (i != -1 && this.stages.indexOf(this.stageList[i]) == -1) {
          this.stages.push(this.stageList[i]);
        }
      });
    }

    let dates = this.$route.query.dates;
    if (dates) {
      if (!Array.isArray(dates)) {
        dates = [dates];
      }
      dates.forEach((date) => {
        try {
          Date.parse(date);
        } catch (e) {
          return;
        }
        if (this.dates.indexOf(date) == -1) {
          this.searchAllTime = false;
          this.dates.push(date);
        }
      });
    }

    let excludeLRAStart = this.$route.query.excludeLRAStart;
    if (excludeLRAStart) {
      this.excludeLRAStart = true;
    }

    // Try to execute search right away
    if (this.isGlobal && this.characters && this.characters !== "") {
      this.getStats();
    }
    if (!this.isGlobal && code) {
      this.getStats();
    }
  },
  methods: {
    getStats() {
      this.errorMessage = undefined;
      this.waiting = true;
      this.error = false;
      let data = {};
      let code;

      if (!this.isGlobal) {
        if (this.code) {
          code = this.code.replace("#", "-"); // Replace # for api request
        }
        if (this.opponentCode) {
          this.submittedOpponentCode = this.opponentCode;
          data.opponentCode = this.opponentCode.replace("#", "-");
        }
        if (this.characters.length > 0) {
          let characters = this.characters.slice();
          let index = characters.indexOf("Sheik / Zelda");
          if (index != -1) {
            characters.splice(index, 1);
            characters.push("Sheik");
            characters.push("Zelda");
          }
          data.characters = characters.map((str) => str.replace(/\s/g, ""));
        }
        if (this.opponentCharacters.length > 0) {
          let opponentCharacters = this.opponentCharacters.slice();
          let index = opponentCharacters.indexOf("Sheik / Zelda");
          if (index != -1) {
            opponentCharacters.splice(index, 1);
            opponentCharacters.push("Sheik");
            opponentCharacters.push("Zelda");
          }
          data.opponentCharacters = opponentCharacters.map((str) =>
            str.replace(/\s/g, "")
          );
        }
      } else {
        if (this.characters && this.characters != "") {
          let character = this.characters;
          if (character == "Sheik / Zelda") {
            character = "Sheik"; // Backend will handle
          }
          data.characters = character.replace(/\s/g, "");
        }
        if (this.opponentCharacters && this.opponentCharacters != "") {
          let opponentCharacter = this.opponentCharacters;
          if (opponentCharacter == "Sheik / Zelda") {
            opponentCharacter = "Sheik"; // Backend will handle
          }
          data.opponentCharacters = opponentCharacter.replace(/\s/g, "");
        }
      }

      if (this.excludeLRAStart) data.excludeLRAStart = true;

      if (this.stages.length > 0)
        data.stages = this.stages.map((str) => str.replace(/\s/g, ""));

      if (this.dates.length > 0 && !this.searchAllTime) {
        data.dates = this.dates;
      }

      API.getStats(code, data)
        .then((response) => {
          console.log(response);
          console.log(response.data);
          this.stats = response.data;
          // Close panel if results are found
          if (this.stats.numGames > 0) {
            this.panelOpening = false;
            this.panel = undefined;
            // Get tags
            if (this.isGlobal) {
              this.playerTag = this.characters;
              this.opponentTag =
                this.opponentCharacters &&
                this.opponentCharacters != "" &&
                this.opponentCharacters != []
                  ? this.opponentCharacters
                  : "Opponent";
            } else {
              this.playerTag = this.stats.player.playerData.tag
                ? this.stats.player.playerData.tag
                : this.stats.player.playerData.code;
              if (this.submittedOpponentCode) {
                this.opponentTag = this.stats.opponent.playerData[
                  this.submittedOpponentCode
                ]
                  ? this.stats.opponent.playerData[this.submittedOpponentCode]
                  : this.submittedOpponentCode;
              } else {
                this.opponentTag = "Opponent";
              }
            }
            this.$router
              .replace({
                path: "/stats/" + (code ? code : "global"),
                query: data,
              })
              .catch(() => {});
          }
          this.waiting = false;
        })
        .catch((err) => {
          console.log(err, err.response);
          this.error = true;
          this.waiting = false;
          this.errorMessage = err.response.data.message
            ? err.response.data.message
            : "Unknown error occured. Please try again later.";
        });
    },
    reset() {
      let code = this.$route.params.code;
      if (!code) {
        this.code = "";
      } else if (code !== "global") {
        this.code = code.replace("-", "#");
      }
      if (this.isGlobal) {
        this.characters = undefined;
        this.opponentCharacters = undefined;
      } else {
        this.characters = [];
        this.opponentCharacters = [];
      }
      this.stages = [];
      this.opponentCode = undefined;
      this.excludeLRAStart = true;
      this.stats = undefined;
      this.submittedOpponentCode = undefined;
      this.searchAllTime = true;
      this.dates = [];
      this.$refs.form.resetValidation();
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
      if (this.isGlobal) {
        this.characters = undefined;
      } else {
        let index = this.characters.indexOf(item);
        if (index != -1) this.characters.splice(index, 1);
      }
    },
    removeOpponentCharacter(item) {
      if (this.isGlobal) {
        this.opponentCharacters = undefined;
      } else {
        let index = this.opponentCharacters.indexOf(item);
        if (index != -1) this.opponentCharacters.splice(index, 1);
      }
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
    },
    share() {
      let url = window.location.origin + this.$route.fullPath;
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.showShareToolTip = true;
      setTimeout(() => {
        this.showShareToolTip = false;
      }, 2000);
    },
    numToStr(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
  },
};
</script>

<style>
.checkbox {
  border: 1px 1px black;
}

.flex {
  margin: 0;
}

/* Stop icon from taking up space and uncentering search */
/* .v-expansion-panel-header__icon {
  position: absolute;
  right: 24px;
  top: 24px;
} */

/* Stop icon from taking up space and uncentering search */
/* .v-alert__icon {
  position: absolute !important;
} */
</style>
