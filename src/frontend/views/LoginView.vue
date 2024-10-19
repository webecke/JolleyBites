<script setup lang="ts">

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { doLogin } from '@/services/AuthService'
import router from '@/router'
import { snackbarStore } from '@/stores/snackbarStore'
import { useAuthStore } from '@/stores/authStore'
import { doErrorHandling } from '@/utils/generalUtils'

const inputEmail = ref<string>("")
const inputPassword = ref<string>("")
const showPassword = ref<boolean>(false)
const formReady = computed(() => { return inputEmail.value.length > 0 && inputPassword.value.length >= 8 })
const loading = ref<boolean>(false)

const handleKeyUp = (event: KeyboardEvent): void => {
  if (event.key === 'Enter') {
    login();
  }
};

onMounted(() => {
  const registerInput = document.getElementById('final-input') as HTMLInputElement | null;
  if (registerInput) {
    registerInput.addEventListener('keyup', handleKeyUp);
  }
});

onUnmounted(() => {
  const registerInput = document.getElementById('final-input') as HTMLInputElement | null;
  if (registerInput) {
    registerInput.removeEventListener('keyup', handleKeyUp);
  }
});

const login = async () => {
  if (!formReady.value || loading.value) { return }

  await doErrorHandling(async () => {
    await doLogin(inputEmail.value, inputPassword.value)
    await router.push("/dashboard")
    snackbarStore.showSuccessMessage(`Logged in ${useAuthStore().currentUser?.name}`)
  }, "logging in")
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
          id="final-input"
          v-model="inputPassword"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          autocomplete="password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
        />

        <v-btn
          text="Login"
          width="100%"
          :color="'green'"
          :disabled="(!formReady) || loading"
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