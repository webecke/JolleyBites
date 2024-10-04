<script setup lang="ts">
import { RouterView } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'
import '@mdi/font/css/materialdesignicons.css'
import AppInfo from '@/components/AppInfo.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'
import { snackbarStore } from '@/stores/snackbarStore'

onMounted(() => {
  useAuthStore().getAuthToken()
})
const login = () => {
  router.push("/login")
}

const accountButton = async () => {
  console.log(await useAuthStore().getCurrentUser())
  snackbarStore.showMessage("We haven't made this button do anything yet. We're glad you're here!")
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
      <v-btn v-if="useAuthStore().isLoggedIn" id="userNameCard" @click="accountButton">
        <font-awesome-icon :icon="['fas', 'user']" />
        {{useAuthStore().currentNameOfUser}}
      </v-btn>

      <v-btn v-else variant="outlined" @click="login">
        Login
        <font-awesome-icon :icon="['fas', 'right-to-bracket']" />
      </v-btn>
    </div>
  </header>

  <main style="padding: 15px">
    <RouterView />
  </main>

  <footer>
    <hr/>
    <div id="footer-content">
      <a class="noGlowLink" href="https://webecke.dev/forestblue" target="_blank">
        <v-card style="width: 275px; padding: 13px; border-radius: 20px; display: flex; align-content: center;" color="#0c1321">
          <img style="width: 100%; height: 100%; object-fit: contain; margin: auto;" src="/src/frontend/assets/ForestBlue.svg" alt="ForestBlue, Simply Branching Out"/>
        </v-card>
      </a>
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
