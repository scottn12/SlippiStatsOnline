<template>
  <v-container>
    <v-flex row wrap class="justify-space-around" style="margin-top: 15px;">
      <div style="width: 50%;">
        <v-card class="mx-auto justify-center">
          <v-card-title class="header">About</v-card-title>
          <v-card-text>
            <p>This website is designed to provide a way to analyze a large number of <a href="https://slippi.gg/" target="_blank">Slippi Online</a> games at once.</p>
            <p>In addition to providing a clean interface to view and compare stats, this application can also filter the dataset using parameters such as opponent, characters played, stages played on, and more.</p>
            <p><a href="https://github.com/scottn12/ScottStats" target="_blank">Source Code</a></p>
          </v-card-text>
          <v-card-title class="header" style="padding-top: 0;">How To Use</v-card-title>
          <v-card-text>
            <ol>
              <li>Locate your Slippi Online replay files. By default these are stored in the <code style="background-color: lightgray; color: black;">C:\Users\[username]\Documents\Slippi</code> directory.</li>
              <li>It is recommended you "zip" your files, since this will compress them and shorten the upload time greatly. To do so, right click the folder which contains the files and under the "Send to" option, click Compressed (zipped) folder as shown below.
                <v-img class="img" :src="require('../assets/send_to_zip.png')"></v-img>
              </li>
              <li>Click on the "File Input" button under Upload Slippi Games on the right. Select one or more .zip or .slp files and click on the upload button.</li>
              <li>At this point, your files will begin to upload. Please remain on the page until the upload is complete.</li>
              <li>After the upload completes, additional proccessing will take place to gather the stats from each game. This may take several minutes depending on the number of files uploaded. It is still reccomended (although not necessary) to remain on this page to see the results of the upload in case there were any files which could not be parsed.</li>
              <li>Once all processing is complete, you can now view your stats. Click on the "View Stats" button in the top right of this page to be navigated to the stats page.</li>
              <li>On the stats page, you must enter at least your own connect code. This is the code you give to others when using direct play on Slippi Online. Additonally, many other options are available to filter with. </li>
            </ol>
          </v-card-text>
        </v-card>
      </div>

      <div style="width: 40%;">
        <v-hover :value="waiting">
          <template v-solt:default>
            <v-card class="mx-auto justify-center">
              <v-card-title class="justify-center">Upload Slippi Games</v-card-title>
              <v-card-actions style="width: 90%; margin: 0 auto;" class="justify-center">
                <v-file-input
                  @change="checkFileType()"
                  v-model="files"
                  multiple
                  label="File Input"
                  accept=".zip, .slp"
                  show-size
                  counter
                  :error-messages="fileError"
                  prepend-icon="mdi-cloud-upload"
                  :disabled="progress != undefined || waiting"
                ></v-file-input>
              </v-card-actions>
              <v-card-actions class="justify-center">
                <v-btn
                  color="primary"
                  @click="send"
                  :disabled="files.length == 0 || invalidFile || progress != undefined || waiting"
                  large
                  style="margin-bottom: 10px;"
                >Upload</v-btn>
              </v-card-actions>
              <v-row
                no-gutters
                justify="center"
                v-if="progress"
                style="padding-bottom: 15px; padding-top: 5px;"
              >
                <v-progress-linear
                  rounded
                  height="20"
                  style="width: 70%; margin-right: 5px;"
                  v-model="progress"
                ></v-progress-linear>
                <span :style="progress != 100 ? '' : 'color:#44A963;'">{{ progress }}%</span>
              </v-row>

              <v-fade-transition>
                <v-overlay
                  v-if="waiting"
                  absolute
                  class="justify-center"
                  color="#DCDCDC"
                  :opacity=".8"
                >
                  <v-row no-gutters justify="center">
                    <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                  </v-row>
                  <div class="waitingText">
                    Your files are currently being processed. This may take a few minutes.
                    <br />Keep this page open to see the results of your upload.
                  </div>
                </v-overlay>
              </v-fade-transition>
            </v-card>
          </template>
        </v-hover>
        <v-card v-if="results" class="mx-auto justify-center" style="margin-top: 25px;">
          <v-card-title class="justify-center">Upload Results</v-card-title>
          <div v-if="results == 'error'" style="margin-left: 15%; margin-right: 15%; padding-bottom: 10px;">
            <v-alert  type="error" class="text-center" color="#e33a0b">
              Unknown error occurred. Please try again later.
            </v-alert>
          </div>
          <div v-if="results != 'error'" style="margin-left: 5%; margin-right: 5%; padding-bottom: 15px;">
            <div>
              <span style="font-size: 28px; color: #44A963">{{ results.success }}</span> games uploaded succesfully
            </div>
            <div>
              <span style="font-size: 28px; color: #e33a0b">{{ results.badFiles.length }}</span> games failed to upload
              <v-btn v-if="results.badFiles.length > 0" small outlined light @click="viewDetails = !viewDetails" style="margin-bottom: 5px; margin-left: 5px;">
                Details
                <v-icon v-if="!viewDetails" dark right>mdi-chevron-right</v-icon>
                <v-icon v-if="viewDetails" dark right>mdi-chevron-down</v-icon>
              </v-btn>
            </div>
            <div v-if="viewDetails" style="margin-top: 5px; margin-left: 5%; margin-right: 5%; font-size: 16px;">
              <div v-for="(file, index) in badFiles" :key="index">
                {{ index }} ({{ badFiles[index].length }})
                <v-btn icon v-if="openReasons.indexOf(index) == -1" @click="openReasons.push(index)">
                  <v-icon dark>mdi-chevron-right</v-icon>
                </v-btn>
                <v-btn icon v-if="openReasons.indexOf(index) != -1" @click="openReasons.splice(openReasons.indexOf(index), 1)">
                  <v-icon dark>mdi-chevron-down</v-icon>
                </v-btn>
                <ul v-if="openReasons.indexOf(index) != -1" style="font-size: 14px; margin-left: 5%; margin-rigth: 5%;">
                  <li v-for="(file, i) in badFiles[index]" :key="i"> 
                    {{ file }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </v-flex>
  </v-container>
</template>

<script>
import API from "../api";

export default {
  name: "Home",
  props: {
    source: String,
  },
  data: () => ({
    files: [],
    invalidFile: false,
    progress: undefined,
    waiting: false,
    hover: false,
    fileError: undefined,
    results: undefined,
    viewDetails: false,
    badFiles: {},
    openReasons: []
  }),
  methods: {
    checkFileType() {
      this.invalidFile = false;
      this.fileError = undefined;
      this.files.forEach((file) => {
        let ext = file.name.split(".").pop();
        if (ext != "zip" && ext != "slp") {
          this.invalidFile = true;
          this.fileError = "File type must be .zip or .slp";
        }
      });
    },
    send() {
      this.progress = 0;
      this.results = undefined;
      this.badFiles = {};
      this.openReasons = [];
      var data = new FormData();
      this.files.forEach((file) => {
        data.append("files", file);
      });
      this.files = [];
      API.save(data, this.onProgressUpdate)
        .then((response) => {
          console.log(response.data);
          this.progress = undefined;
          this.waiting = false;
          this.results = response.data;
          this.results.badFiles.forEach((file) => {
            console.log(file);
            if (!file) {
              file.reason = 'Unknown';
              file.file = 'Unknown';
            }
            if (file.reason in this.badFiles) {
              this.badFiles[file.reason].push(file.file);
            }
            else {
              this.badFiles[file.reason] = [file.file];
            }
          });
        })
        .catch((err) => {
          console.log(err);
          this.results = 'error';
          this.progress = undefined;
          this.waiting = false;
        });
    },
    onProgressUpdate(update) {
      let progress = Math.round((update.loaded / update.total) * 100);
      this.progress = progress;
      if (progress == 100) {
        this.progress = undefined;
        this.waiting = true;
      }
    },
  },
};
</script>

<style>
.waitingText {
  margin-top: 10px;
  color: #44a963;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.header {
  font-size: 28px;
}

.img {
  margin: 0 auto; 
  margin-top: 10px;
  width: 70%;
  margin-bottom: 5px;
}
</style>
