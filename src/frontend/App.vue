<script setup lang="ts">
import { RouterView } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'
import '@mdi/font/css/materialdesignicons.css'
import AppInfo from '@/components/AppInfo.vue'

const login = () => {
  alert('Login coming soon. Sheesh, be patient.')
}
</script>

<template>
  <GlobalSnackbar ref="snackbarRef"/> <!-- this allows anywhere in the app to trigger the snackbar popups -->

  <header>
    <RouterLink to="/">
      <div id="branding">
        <h1>JolleyBites</h1>
        <p class="tagline">Recipe Cost Calculator </p>
        <font-awesome-icon :icon="['fas', 'utensils']" />
      </div>
    </RouterLink>
    <div id="login">
      <v-btn variant="outlined" @click="login">
        Login
        <font-awesome-icon :icon="['fas', 'right-to-bracket']" />
      </v-btn>
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer>
    <hr/>
    <div id="footer-content">
      <v-card style="width: 275px; border-radius: 20px; display: flex; align-content: center;" color="#112C34">
        <img style="margin: 10px;" src="/src/frontend/assets/ForestBlue.svg" alt="ForestBlue, Simply Branching Out"/>
      </v-card>
      <AppInfo style="width: max-content; margin: 0 0 0 20px"/>
    </div>
  </footer>
</template>

<style scoped>
#branding {
  display: flex;
}

#branding {
  display: flex;
  align-items: center;
}
#branding p {
  margin-left: 10px;
}
#login {
  height: 100%;
  margin: auto 0;
}
#footer-content {
  display: flex;
  flex-direction: row;
  width: 75%;
  justify-content: center;
}
footer {
  margin-bottom: 70px;
  margin-top: 50px
}
</style>
