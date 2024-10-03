<script setup lang="ts">

import { computed, ref } from 'vue'
import { doLogin } from '@/services/AuthService'
import router from '@/router'
import { snackbarStore } from '@/stores/snackbarStore'
import { useAuthStore } from '@/stores/authStore'

const inputEmail = ref<string>("")
const inputPassword = ref<string>("")
const showPassword = ref<boolean>(false)
const formReady = computed(() => { return inputEmail.value.length > 0 && inputPassword.value.length >= 8 })

const login = async () => {
  try {
    await doLogin(inputEmail.value, inputPassword.value)
    await router.push("/dashboard")
    snackbarStore.showMessage(`Logged in ${useAuthStore().currentUser?.name}`, {color:"green", timeout: 5000})
  } catch (error) {
    if (error instanceof Error) {
      snackbarStore.showMessage(error.message, {color:"red", timeout: 10000})
      return
    } else {
      snackbarStore.showMessage("Something went horribly wrong")
      return
    }
  }
}
</script>

<template>
  <div id="container">
    <v-card title="Login To JolleyBites" style="padding: 15px" width="300px">
      <v-form>
        <v-text-field
          label="Email"
          autocomplete="email"
          type="email"
          v-model="inputEmail"
        />
        <v-text-field
          v-model="inputPassword"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          name="new-password"
          autocomplete="new-password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
        />

        <v-btn
          text="Login"
          width="100%"
          :color="'green'"
          :disabled="!formReady"
          @click="login"
        />

        <hr style="width: 100%"/>

        <p>New to JolleyBites?</p>
        <RouterLink to="/register"><v-btn text="Make a new account" color="grey" width="100%"/></RouterLink>
      </v-form>
    </v-card>
  </div>
</template>

<style scoped>
#container {
  display: flex;
  align-content: center;
  justify-content: center;
}
</style>