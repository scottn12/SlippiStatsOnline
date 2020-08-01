<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-text-field v-model="player"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-file-input v-model="files" multiple label="File input"></v-file-input>
      </v-col>
      <v-col cols="12">
        <v-btn @click="send" :disabled="files.length == 0" large color="primary">Send</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    source: String,
  },
  data: () => ({
    player: 'SCOT#864',
    files: [],
  }),
  methods: {
    send() {
      var data = new FormData();
      data.append('file', this.files[0]);
      // use api file later
      fetch('http://localhost:3000/slippi/save', {
        method: 'POST',
        headers: {
          'Player': this.player, 
          'Access-Control-Allow-Origin': '*'
        },
        body: data
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
