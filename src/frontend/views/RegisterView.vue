<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { isAcceptablePassword } from '../../shared/acceptablePassword'
import { doRegister } from '@/services/AuthService'
import { snackbarStore } from '@/stores/snackbarStore'
import router from '@/router'
import { doErrorHandling } from '@/utils/generalUtils'

const handleKeyUp = (event: KeyboardEvent): void => {
  if (event.key === 'Enter') {
    register();
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

const loading = ref<boolean>(false)
const inputName = ref<string>("")
const inputEmail = ref<string>("")
const inputPassword = ref<string>("")
const confirmPassword = ref<string>("")
const showPassword = ref<boolean>(false)
const showPasswordQualityError = computed( () => {
  return inputPassword.value.length > 0 && !isAcceptablePassword(inputPassword.value)
})
const showPasswordMatchError = computed(() => {
  return (confirmPassword.value != '') && (inputPassword.value != confirmPassword.value)
})
const formReady = computed(() => {
  return (inputPassword.value == confirmPassword.value) && inputPassword.value && inputName.value && inputEmail.value
})

const register = async () => {
  if (!formReady.value || loading.value) { return }

  await doErrorHandling(async () => {
    await doRegister(inputName.value, inputEmail.value, inputPassword.value)
    await router.push("/dashboard")
    snackbarStore.showSuccessMessage(`Welcome to JolleyBites, ${inputName.value}`)
  }, "registering")
}
</script>

<template>
  <div id="container">
    <v-card title="Register" style="padding: 15px" width="300px">
      <v-form>
        <v-text-field
          label="Name"
          autocomplete="name"
          v-model="inputName"
        />
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
          :error-messages="showPasswordQualityError ? 'Password must be at least 8 characters long, have 1 uppercase, and 1 lowercase letter' : ''"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
        />
        <v-text-field
          id="final-input"
          v-model="confirmPassword"
          label="Confirm Password"
          :type="showPassword ? 'text' : 'password'"
          name="confirm-password"
          autocomplete="new-password"
          :error-messages="showPasswordMatchError ? 'Passwords do not match' : ''"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
        />
        <v-btn
          text="Register"
          width="100%"
          :color="'green'"
          :disabled="(!formReady) || loading"
          @click="register"
        />
        <p>By registering you agree to the
          <RouterLink to="/terms">Terms of Service</RouterLink>
          and the <RouterLink to="/privacy">Privacy Notice</RouterLink></p>
        <hr style="width: 100%"/>
        <p>Already have an account?</p>
        <RouterLink to="/login"><v-btn text="Go to Login" color="grey" width="100%"/></RouterLink>
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