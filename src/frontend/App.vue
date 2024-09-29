<script setup lang="ts">
import { RouterView } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'

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
    <p>Built by <a href="https://webecke.dev" target="_blank">Dallin Webecke</a></p>
    <p>Check it out on <a href="https://github.com/DallinFromEarth/JolleyBites" target="_blank">GitHub</a></p>
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
</style>
