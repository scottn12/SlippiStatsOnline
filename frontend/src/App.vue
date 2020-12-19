<template>
  <v-app>

    <!-- Theme button -->
    <span class="themeButton">
      <v-btn fab :x-large="!$vuetify.breakpoint.xsOnly" @click="changeTheme" >
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
    </span>

    <!-- Desktop Menu Bar -->
    <v-app-bar 
      v-if="!$vuetify.breakpoint.xsOnly" 
      app 
      color="menuBackground" 
      dark 
      style="z-index: 9999;">
      <v-toolbar-title style="cursor: pointer; font-size: 28px;" @click="$router.push({ path: '/' })">Slippi Stats Online</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn :light="!$vuetify.theme.dark" class="ma-2" @click="$router.push({ path: '/' })">
        <v-icon :light="!$vuetify.theme.dark" left >mdi-cloud-upload</v-icon>Upload Games
      </v-btn>

      <v-btn :light="!$vuetify.theme.dark" class="ma-2" @click="$router.push({ path: '/stats' })">
        <v-icon left :light="!$vuetify.theme.dark">mdi-magnify</v-icon>View Stats
      </v-btn>

      <!-- <v-btn :light="!$vuetify.theme.dark" class="ma-2" target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=NJY276YL5Y4J8&currency_code=USD">
        <v-icon left :light="!$vuetify.theme.dark">mdi-gift-outline</v-icon>Donate
      </v-btn> -->

    </v-app-bar>

    <!-- Mobile Menu Bar-->
    <v-app-bar v-if="$vuetify.breakpoint.xsOnly" app color="menuBackground" dark style="z-index: 9999;">
      <v-toolbar-title style="cursor: pointer;" @click="$router.push({ path: '/' })">Slippi Stats Online</v-toolbar-title>
      
      <v-menu v-if="$vuetify.breakpoint.xsOnly" bottom right offset-x>
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on" style="position: absolute; right: 25px;">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="$router.push({ path: '/' })">
            <v-list-item-avatar style="margin: 0;">
              <v-icon>mdi-cloud-upload</v-icon>
            </v-list-item-avatar>
            <v-list-item-title>Upload Games</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push({ path: '/stats' })">
            <v-list-item-avatar style="margin: 0;"> 
              <v-icon>mdi-magnify</v-icon>
            </v-list-item-avatar>
            <v-list-item-title >View Stats</v-list-item-title>
          </v-list-item>
          <v-list-item target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=NJY276YL5Y4J8&currency_code=USD">
            <v-list-item-avatar style="margin: 0;">
              <v-icon>mdi-gift-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-title>Donate</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <!-- Maintenance message -->
      <v-row v-if="displayMaintenance" no-gutters justify="center" style="margin-top: 25px;">
        <v-alert type="warning" class="text-center" :style="($vuetify.breakpoint.xsOnly ? 'width: 90%;' : 'width: 50%;') + 'margin-bottom: 0;'">
          {{ maintenanceMessage }}
        </v-alert>
      </v-row>
      <router-view></router-view>
    </v-main>

  </v-app>
  
</template>

<script>

import API from './api';

export default {
  name: "App",
  data: () => ({
    displayMaintenance: false,
    maintenanceMessage: undefined,
  }),
  mounted() {

    // Check theme from local storage
    if (window.localStorage.getItem('theme') === 'dark') {
      this.$vuetify.theme.dark = true;
    }

    // Check for maintenance message
    API.checkMaintenance()
    .then((response) => {
      this.displayMaintenance = response.data.display;
      this.maintenanceMessage = response.data.message;
    })
    .catch((err) => {
      console.log(err);
      this.displayMaintenance = true;
      this.maintenanceMessage = 'We are currently experiencing unexpected service outages. Some features may be unavailable currently. Sorry for the inconvenience.';
    });

  },
  methods: {
    changeTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      window.localStorage.setItem('theme', this.$vuetify.theme.dark ? 'dark' : 'light');
    }
  }
};

</script>

<style>
.themeButton {
  position: fixed;
  z-index: 9999;
  right: 10px;
  bottom: 10px;
}

.v-application {
  background-color: var(--v-background-base) !important;
}
</style>
