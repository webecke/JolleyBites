<script setup lang="ts">

import { doLogout } from '@/services/AuthService'
import router from '@/router'

const logout = async () => {
  doLogout()
  router.push("/")
}
</script>

<template>
  <h1>THIS IS THE DASHBOARD</h1>
  <v-btn @click="logout">Logout of JolleyBites</v-btn>
</template>

<style scoped>

</style>