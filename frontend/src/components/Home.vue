<template>
  <v-container>
    <v-flex
      :row="!$vuetify.breakpoint.xsOnly"
      wrap
      class="justify-space-around"
      style="margin-top: 15px"
    >
      <div :style="!$vuetify.breakpoint.xsOnly ? 'width: 50%;' : ''">
        <v-card class="mx-auto justify-center">
          <v-card-title class="header">
            About
            <v-chip style="position: absolute; right: 16px" v-if="totalGames">
              {{ numToStr(totalGames) }} games uploaded!
            </v-chip>
          </v-card-title>
          <v-card-text>
            <p>
              This website is designed to provide a way to analyze a large
              number of
              <a href="https://slippi.gg/" target="_blank">Slippi Online</a>
              games at once.
            </p>
            <p>
              In addition to providing a clean interface to view and compare
              stats, this application can also filter the dataset using
              parameters such as opponent, characters played, stages played on,
              and more.
            </p>
            <p>
              If you would like to support this website, please consider
              <a
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=NJY276YL5Y4J8&currency_code=USD"
                target="_blank"
                >donating</a
              >
              to help cover the cost of operation.
            </p>
            <p style="margin: 0">
              <a
                href="https://github.com/scottn12/SlippiStatsOnline"
                target="_blank"
                >Source Code</a
              >
            </p>
          </v-card-text>
          <v-card-title class="header" style="padding-top: 0"
            >How To Use</v-card-title
          >
          <v-card-text>
            <ol>
              <li>
                Locate your Slippi Online replay files. By default these are
                stored in the
                <code style="background-color: var(--v-pathBackground-base); color: black"
                  >C:\Users\[username]\Documents\Slippi</code
                >
                directory.
              </li>
              <li>
                It is recommended you "zip" your files, since this will compress
                them and shorten the upload time greatly. To do so, right click
                the folder which contains the files and under the "Send to"
                option, click Compressed (zipped) folder as shown below.
                <v-img
                  class="img"
                  :src="require('../assets/send_to_zip.png')"
                ></v-img>
              </li>
              <li>
                Click on the "File Input" button under Upload Slippi Games on
                the right. Select one or more .zip or .slp files and click on
                the upload button.
              </li>
              <li>
                At this point, your files will begin to upload. Please remain on
                the page until the upload is complete.
              </li>
              <li>
                After the upload completes, additional proccessing will take
                place to gather the stats from each game. This may take several
                minutes depending on the number of files uploaded. It is still
                recommended (although not necessary) to remain on this page to
                see the results of the upload in case there were any files which
                could not be parsed.
              </li>
              <li>
                Once all processing is complete, you can now view your stats.
                Click on the "View Stats" button in the top right of this page
                to be navigated to the stats page.
              </li>
              <li>
                On the stats page, you must enter at least your own connect
                code. This is the code you give to others when using direct play
                on Slippi Online. Additonally, many other options are available
                to filter with.
              </li>
            </ol>
          </v-card-text>
          <v-card-title class="header" style="padding-top: 0"
            >Contact</v-card-title
          >
          <v-card-text>
            <p>
              If you run into any issues or would like to provide feedback, feel
              free to contact me on Discord (<strong>skaht#6034</strong>).
            </p>
            <p>
              Alternatively, you can email me at
              <a href="mailto: scott.norton12@gmail.com"
                >scott.norton12@gmail.com</a
              >.
            </p>
          </v-card-text>
        </v-card>
      </div>

      <div
        :style="
          !$vuetify.breakpoint.xsOnly ? 'width: 40%;' : 'margin-top: 25px;'
        "
      >
        <v-hover :value="waiting">
          <template v-solt:default>
            <v-card class="mx-auto justify-center">
              <v-card-title class="justify-center"
                >Upload Slippi Games</v-card-title
              >
              <v-card-actions
                style="width: 90%; margin: 0 auto"
                class="justify-center"
              >
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
                  :disabled="
                    files.length == 0 ||
                    invalidFile ||
                    progress != undefined ||
                    waiting
                  "
                  large
                  style="margin-bottom: 10px"
                  >Upload</v-btn
                >
              </v-card-actions>
              <div v-if="progress != undefined">
                <v-row
                  no-gutters
                  justify="center"
                  style="padding-bottom: 5px; padding-top: 5px"
                >
                  <v-progress-linear
                    rounded
                    height="20"
                    style="width: 70%; margin-right: 5px"
                    :value="progress"
                  ></v-progress-linear>
                  <span style="color: var(--v-primary-base)"
                    >{{ progress }}%</span
                  >
                </v-row>
                <v-row
                  no-gutters
                  justify="center"
                  style="color: var(--v-primary-base); padding-bottom: 15px"
                >
                  Please do not leave this page until the upload has completed!
                </v-row>
              </div>
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
                  <div class="waitingText">
                    Your files are currently being processed. This may take a
                    while.
                    <br />Keep this page open to see the results of your upload.
                  </div>
                </v-overlay>
              </v-fade-transition>
            </v-card>
          </template>
        </v-hover>
        <v-card
          v-if="results"
          class="mx-auto justify-center"
          style="margin-top: 25px"
        >
          <v-card-title class="justify-center">Upload Results</v-card-title>
          <div
            v-if="results == 'tooLarge'"
            style="margin-left: 15%; margin-right: 15%; padding-bottom: 10px"
          >
            <v-alert type="error" class="text-center" color="error">
              Upload limit reached (10GB). Try "zipping" your files to reduce
              the size, or uploading in smaller batches.
            </v-alert>
          </div>
          <div
            v-if="results == 'error'"
            style="margin-left: 15%; margin-right: 15%; padding-bottom: 10px"
          >
            <v-alert type="error" class="text-center" color="error">
              {{
                errorMessage
                  ? errorMessage
                  : "Unknown error occurred. Please try again later."
              }}
            </v-alert>
          </div>
          <div
            v-if="results != 'error' && results != 'tooLarge'"
            style="margin-left: 5%; margin-right: 5%; padding-bottom: 15px"
          >
            <div>
              <span style="font-size: 28px; color: var(--v-primary-base)">{{
                results.success
              }}</span>
              games uploaded succesfully
            </div>
            <div>
              <span style="font-size: 28px; color: var(--v-error-base)">{{
                results.badFiles.length
              }}</span>
              games failed to upload
              <v-btn
                v-if="results.badFiles.length > 0"
                small
                outlined
                :light="!$vuetify.theme.dark"
                @click="viewDetails = !viewDetails"
                style="margin-bottom: 5px; margin-left: 5px"
              >
                Details
                <v-icon v-if="!viewDetails" :light="!$vuetify.theme.dark" right
                  >mdi-chevron-right</v-icon
                >
                <v-icon v-if="viewDetails" :light="!$vuetify.theme.dark" right
                  >mdi-chevron-down</v-icon
                >
              </v-btn>
            </div>
            <div
              v-if="viewDetails"
              style="
                margin-top: 5px;
                margin-left: 5%;
                margin-right: 5%;
                font-size: 16px;
              "
            >
              <div v-for="(file, index) in badFiles" :key="index">
                {{ index }} ({{ badFiles[index].length }})
                <v-btn
                  icon
                  v-if="openReasons.indexOf(index) == -1"
                  @click="openReasons.push(index)"
                >
                  <v-icon dark>mdi-chevron-right</v-icon>
                </v-btn>
                <v-btn
                  icon
                  v-if="openReasons.indexOf(index) != -1"
                  @click="openReasons.splice(openReasons.indexOf(index), 1)"
                >
                  <v-icon dark>mdi-chevron-down</v-icon>
                </v-btn>
                <ul
                  v-if="openReasons.indexOf(index) != -1"
                  style="font-size: 14px; margin-left: 5%; margin-rigth: 5%"
                >
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
    tooLarge: false,
    badFiles: {},
    openReasons: [],
    errorMessage: undefined,
    totalGames: undefined,
    slpUpload: undefined,
  }),
  mounted() {
    API.getTotalGameCount()
      .then((response) => {
        this.totalGames = response.data.count;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    checkFileType() {
      this.invalidFile = false;
      this.fileError = undefined;
      this.slpUpload = true;
      this.files.forEach((file) => {
        let ext = file.name.split(".").pop();
        if (ext != "zip" && ext != "slp") {
          this.invalidFile = true;
          this.fileError = "File type must be .zip or .slp";
        }
        else if (ext === 'zip') {
          this.slpUpload = false;  // Not exclusively a .slp upload
        }
      });
    },
    send() {
      this.errorMessage = undefined;
      this.tooLarge = false;
      this.progress = 0;
      this.results = undefined;
      this.badFiles = {};
      this.openReasons = [];
      var totalUploadSize = 0;
      var data = new FormData();
      this.files.forEach((file) => {
        totalUploadSize += file.size;
        data.append("files", file);
      });
      if (totalUploadSize >= 10737418240) {
        // 10 GB
        console.log(totalUploadSize);
        this.results = "tooLarge";
        this.progress = undefined;
        this.waiting = false;
        return;
      }
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
              file.reason = "Unknown";
              file.file = "Unknown";
            }
            else if (this.slpUpload) {  
              file.file = file.file.substring(file.file.indexOf('_') + 1);  // Remove timestamp from start of file name if not exclusively a .slp uplaod
            }
            if (file.reason in this.badFiles) {
              this.badFiles[file.reason].push(file.file);
            } else {
              this.badFiles[file.reason] = [file.file];
            }
          });
        })
        .catch((err) => {
          console.log(err.response);
          this.results = "error";
          this.progress = undefined;
          this.waiting = false;
          if (err.response.data.message) {
            this.errorMessage = err.response.data.message;
          }
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
    numToStr(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
  },
};
</script>

<style scoped>
.waitingText {
  margin-top: 10px;
  color: var(--v-primary-base);
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
