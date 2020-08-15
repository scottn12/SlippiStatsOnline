<template>
  <v-app>
    
    <!-- Desktop -->
    <v-app-bar v-if="!$vuetify.breakpoint.xsOnly" app color="primary" dark style="z-index: 9999;">
      <v-toolbar-title style="cursor: pointer; font-size: 28px;" @click="$router.push({ path: '/' })">Slippi Stats</v-toolbar-title>
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
      <v-toolbar-title style="cursor: pointer;" @click="$router.push({ path: '/' })">Slippi Stats</v-toolbar-title>
      
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
      <router-view></router-view>
    </v-main>

  </v-app>
  
</template>

<script>

export default {
  name: "App",
};
</script>
