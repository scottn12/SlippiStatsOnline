<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Slippi Stats</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn color="secondary" class="ma-2 white--text" @click="$router.push({ path: '/' })">
        <v-icon left dark>mdi-cloud-upload</v-icon>Upload Games
      </v-btn>

      <v-btn color="secondary" class="ma-2 white--text" @click="$router.push({ path: '/stats' })">
        <v-icon left dark>mdi-magnify</v-icon>View Stats
      </v-btn>

    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

  </v-app>
  
</template>

<script>

export default {
  name: "App",
};
</script>
