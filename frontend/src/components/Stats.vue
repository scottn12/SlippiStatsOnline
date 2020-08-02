<template>
  <v-container>
    <v-row justify="center" no-gutters>
    <div :style="panelOpening ? 'transition: width .3s; width: 100%;' : 'transition: width .3s; width: 30%; transition-delay: .3s;'" justify="center">
      <v-expansion-panels v-model="panel" popout>
        <v-expansion-panel @click="panelClick()">
          <v-expansion-panel-header>
            <template v-slot:default>
              <v-row no-gutters justify="center" class="title font-weight-regular">
                Search
              </v-row>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-form ref="form" v-model="valid">
              <v-row dense justify="space-around">
                <v-col cols="3">
                  <v-text-field dense outlined v-model="code" :rules="codeRules" label="Your Connect Code" required></v-text-field>
                </v-col>
                
                <v-col cols="3">
                  <v-text-field dense outlined v-model="opponentCode" :rules="opponentCodeRules" label="Opponent's Connect Code"></v-text-field>
                </v-col>
              </v-row>
              
              <v-row dense justify="space-around">
                <v-col cols="3">
                  <v-select
                    multiple
                    dense 
                    outlined
                    v-model="characters"
                    :items="characterList"
                    label="Character"
                  >
                    <template v-slot:selection="selection">
                      <v-img :src="require(`../assets/stock_icons/${selection.item}.png`)" :alt="selection.item" max-width="20" style="margin-right: 5px;"></v-img>
                      <span v-if="characters.length < 2">{{ selection.item }}</span>
                    </template>
                    <template v-slot:item="character">
                      <v-img :src="require(`../assets/stock_icons/${character.item}.png`)" :alt="character.item" max-width="20" style="margin-right: 5px;"></v-img>{{ character.item }}
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="3">
                  <v-select
                    multiple
                    dense 
                    outlined
                    v-model="opponentCharacters"
                    :items="characterList"
                    label="Opponent's Character"
                  >
                    <template v-slot:selection="selection">
                      <v-img :src="require(`../assets/stock_icons/${selection.item}.png`)" :alt="selection.item" max-width="20" style="margin-right: 5px;"></v-img>
                      <span v-if="opponentCharacters.length < 2">{{ selection.item }}</span>
                    </template>
                    <template v-slot:item="character">
                      <v-img :src="require(`../assets/stock_icons/${character.item}.png`)" :alt="character.item" max-width="20" style="margin-right: 5px;"></v-img>{{ character.item }}
                    </template>
                  </v-select>
                </v-col>
              </v-row>
              <v-row dense justify="space-around">
                <v-col cols="3">
                  <v-select
                    multiple
                    dense 
                    outlined
                    v-model="stages"
                    :items="stageList"
                    label="Stage"
                  >
                    <template v-slot:selection="{item, index}">
                      {{ item }}<span v-if="index != stages.length - 1">,&ensp;</span>
                    </template>
                    <template v-slot:item="selection">
                      {{ selection.item }}
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="3">
                  <v-checkbox
                    style="margin-top: 4px;"
                    v-model="excludeLRAStart"
                    class="checkbox"
                  >
                    <template v-slot:label>
                      <span style="margin-right: 3px;">Exclude all games ending with L+R+A+Start</span>
                      <v-tooltip bottom>
                        <template v-slot:activator="{on, attrs}">
                          <v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon>
                        </template>
                        <span>
                          Note: All games quit out within 30 seconds are starting are automatically excluded.<br>
                          This option will exclude <strong>ALL</strong> games quit out before ending regardless of length.
                        </span>
                      </v-tooltip>
                    </template>
                  </v-checkbox>
                      
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
    <br>
    <v-row  v-if="stats && stats.numGames == 0" justify="center">
      <v-alert type="error" width="50%">
        No games found with search criteria.
      </v-alert>
    </v-row>
    <v-row v-if="stats && stats.numGames > 0" no-gutters justify="space-around">
      <v-card class="mx-auto" max-width="40%">
        <v-card-title class="justify-center">{{ stats.player.playerData.tag ? stats.player.playerData.tag : stats.player.playerData.code }}'s Stats</v-card-title>
        <v-card-text>
          {{stats.player.average}}
        </v-card-text>
      </v-card>
      <v-card class="mx-auto" max-width="40%">
        <v-card-title class="justify-center">{{ stats && opponentCode ? (stats.opponent.playerData[opponentCode] ? stats.opponent.playerData[opponentCode] : opponentCode) : 'Opponent' }}'s Stats</v-card-title>
        <v-card-text>
          {{stats.opponent.average}}
        </v-card-text>
      </v-card>
    </v-row>
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
    characterList: ["Bowser", "Captain Falcon", "Donkey Kong", "Dr. Mario", "Falco", "Fox", "Ganondorf", "Ice Climbers", "Jigglypuff", "Kirby", "Link", "Luigi", "Mario", "Marth", "Mewtwo", "Mr. Game & Watch", "Ness", "Peach", "Pichu", "Pikachu", "Roy", "Samus", "Sheik", "Yoshi", "Young Link", "Zelda"],
    stageList: ['Battlefield', 'Dreamland', 'Final Destination', 'Fountain of Dreams', 'Pokemon Stadium', "Yoshi's Story"],
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
    codeRules: [
      (v) => !!v || v != '' || "Player code is required",
      (v) => /^[a-zA-Z]{2,4}#?\d{3}$/.test(v) || "Player code must be in format: ABCD#123 or ABCD123",
    ],
    opponentCodeRules: [
      (v) => !v || /^$|^[a-zA-Z]{2,4}#?\d{3}$/.test(v) || "Player code must be in format: ABCD#123 or ABCD123",
    ],
  }),
  mounted: function () {
    let code = this.$route.params.code;
    if (code) {
      let codeFirstDigit = code.indexOf(code.match(/\d/));
      if (codeFirstDigit == -1) {
        this.code = code;
      }
      else {
        this.code = code.substring(0, codeFirstDigit).toLocaleUpperCase() + "#" + code.substring(codeFirstDigit);
      }
      this.$refs.form.validate();
    }
  },
  methods: {
    getStats() {
      let code = this.code.replace("#", "");  // Remove # for api request
      let data = {};
      if (this.code.indexOf('#') == -1) {  // Add # for display if not provided
        let codeFirstDigit = code.indexOf(this.code.match(/\d/));
        if (codeFirstDigit != -1) {
          this.code = this.code.substring(0, codeFirstDigit).toLocaleUpperCase() + "#" + this.code.substring(codeFirstDigit);
        }
      }
      if (this.opponentCode) {
        data.opponentCode = this.opponentCode.replace('#', '');
          if (this.opponentCode.indexOf('#') == -1) {  // Add # for display if not provided
          let codeFirstDigit = this.opponentCode.indexOf(this.opponentCode.match(/\d/));
          if (codeFirstDigit != -1) {
            this.opponentCode = this.opponentCode.substring(0, codeFirstDigit).toLocaleUpperCase() + "#" + this.opponentCode.substring(codeFirstDigit);
          }
        }
      }
      if (this.excludeLRAStart) data.excludeLRAStart = true;
      if (this.characters.length > 0) data.characters = this.characters.map(str => str.replace(/\s/g, ''));
      if (this.opponentCharacters.length > 0) data.opponentCharacters = this.opponentCharacters.map(str => str.replace(/\s/g, ''));
      if (this.stages.length > 0) data.stages = this.stages.map(str => str.replace(/\s/g, ''));

      API.getStats(code, data)
        .then((response) => {
          console.log(response.data);
          this.stats = response.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    reset() {
      let code = this.$route.params.code;
      if (!code) {
        return '';
      }
      let codeFirstDigit = code.indexOf(code.match(/\d/));
      if (codeFirstDigit == -1) {
        this.code = code;
      }
      else {
        this.code = code.substring(0, codeFirstDigit).toLocaleUpperCase() + "#" + code.substring(codeFirstDigit);
      }
      this.characters = [];
      this.stages= [];
      this.opponentCode = undefined;
      this.opponentCharacters = [];
      this.excludeLRAStart = false;
      this.stats = undefined;
    },
    panelClick() {
      if (this.panel == 0) {
        this.panelOpening = false;
      }
      else {
        this.panel = 0;
        this.panelOpening = true;
        setTimeout(() => {
          this.panel = 0;
        }, 300);
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
