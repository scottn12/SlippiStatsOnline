<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        Upload Files
        <v-file-input v-model="files" multiple label="File input"></v-file-input>
      </v-col>
      <v-col cols="12">
        <v-btn @click="send" :disabled="files.length == 0" large color="primary">Upload</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import API from '../api';

export default {
  name: "Home",
  props: {
    source: String,
  },
  data: () => ({
    files: [],
  }),
  methods: {
    send() {
      var data = new FormData();
      data.append('file', this.files[0]);
      API.save(data)
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
    },
  },
};
</script>
