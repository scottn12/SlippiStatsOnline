<template>
  <v-container>
    <v-card class="mx-auto" width="40%">
      <v-card-title>Upload Slippi Games</v-card-title>
      <v-file-input
        @change="checkFileType()"
        v-model="files"
        multiple
        label="File input"
        accept=".zip, .slp"
      ></v-file-input>
      <div v-if="progress" class="text-center">Upload Progress</div>
      <v-row no-gutters justify="center" v-if="progress">
        <v-progress-linear rounded height="20" style="width: 70%; margin-right: 5px;" v-model="progress"></v-progress-linear>
        <span :style="progress != 100 ? '' : 'color:#44A963;'">{{ this.progress }}%</span>
      </v-row>
      <v-card-actions>
        <v-btn
          @click="send"
          :disabled="files.length == 0 || invalidFile"
          large
          color="primary"
        >Upload</v-btn>
      </v-card-actions>
    </v-card>
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
  }),
  methods: {
    checkFileType() {
      this.invalidFile = false;
      this.files.forEach((file) => {
        let ext = file.name.split(".").pop();
        if (ext != "zip" && ext != "slp") {
          this.invalidFile = true;
        }
      });
    },
    send() {
      var data = new FormData();
      this.files.forEach((file) => {
        data.append("files", file);
      });
      API.save(data, this.onProgressUpdate)
        .then((response) => {
          console.log(response.data);
          this.progress = undefined;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    onProgressUpdate(update) {
      let progress = Math.round((update.loaded / update.total) * 100);
      this.progress = progress;
      if (progress == 100) {
        setTimeout(() => {
          this.progress = undefined
        }, 3000);
      }
    },
  },
};
</script>
