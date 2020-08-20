<template>
  <v-app>
    
    <!-- Desktop -->
    <v-app-bar v-if="!$vuetify.breakpoint.xsOnly" app color="primary" dark style="z-index: 9999;">
      <v-toolbar-title style="cursor: pointer; font-size: 28px;" @click="$router.push({ path: '/' })">Slippi Stats Online</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn light class="ma-2" @click="$router.push({ path: '/' })">
        <v-icon left dark>mdi-cloud-upload</v-icon>Upload Games
      </v-btn>

      <v-btn light class="ma-2" @click="$router.push({ path: '/stats' })">
        <v-icon left dark>mdi-magnify</v-icon>View Stats
      </v-btn>

    </v-app-bar>

    <!-- Mobile -->
    <v-app-bar v-if="$vuetify.breakpoint.xsOnly" app color="primary" dark style="z-index: 9999;">
      <v-toolbar-title style="cursor: pointer;" @click="$router.push({ path: '/' })">Slippi Stats Online</v-toolbar-title>
      
      <v-menu v-if="$vuetify.breakpoint.xsOnly" bottom right offset-x>
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on" style="position: absolute; right: 25px;">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-avatar style="margin: 0;">
              <v-icon>mdi-cloud-upload</v-icon>
            </v-list-item-avatar>
            <v-list-item-title @click="$router.push({ path: '/' })">Upload Games</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar style="margin: 0;">
              <v-icon>mdi-magnify</v-icon>
            </v-list-item-avatar>
            <v-list-item-title @click="$router.push({ path: '/stats' })">View Stats</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
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
    maintenanceMessage: undefined
  }),
  mounted() {
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

  }
};

</script>
