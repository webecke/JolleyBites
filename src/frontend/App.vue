<script setup lang="ts">
import { RouterView } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'
import '@mdi/font/css/materialdesignicons.css'
import AppInfo from '@/components/AppInfo.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'
import { doLogout } from '@/services/AuthService'
import { useDataStore } from '@/stores/dataStore'

onMounted(async() => {
  await useAuthStore().getAuthToken()
  await useAuthStore().getCurrentUser()
  await useDataStore().initializeDataStore()
})
const login = () => {
  router.push("/login")
}

const logout = async () => {
  doLogout()
  router.push("/")
}

const nameOfUser = () => {
  return useAuthStore().getNameOfCurrentUser()
}

const clickBranding = () => {
  if (useAuthStore().isLoggedIn) {
    router.push("/dashboard")
  } else {
    router.push("/")
  }
}
</script>

<template>
  <GlobalSnackbar ref="snackbarRef"/> <!-- this allows anywhere in the app to trigger the snackbar popups -->

  <header>
    <div @click="clickBranding" style="cursor: pointer">
      <div id="branding">
        <h1>JolleyBites</h1>
        <p class="tagline">Recipe Cost Calculator </p>
        <font-awesome-icon :icon="['fas', 'utensils']" />
      </div>
    </div>
    <div id="login">
      <v-btn color="var(--jb--lilac-dark)" icon v-if="useAuthStore().isLoggedIn" id="userNameCard">
        <font-awesome-icon style="color: white" :icon="['fas', 'user']" />
        <v-menu activator="parent">
          <v-list>
            <v-list-item @click="router.push('/dashboard')">Hello, {{nameOfUser()}}</v-list-item>
            <v-list-item @click="logout">Logout <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" /></v-list-item>
          </v-list>
        </v-menu>
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
