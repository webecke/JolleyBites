<script setup lang="ts">
import { snackbarStore } from '@/stores/snackbarStore'

const { state, hideMessage } = snackbarStore
</script>

<template>
  <v-snackbar
    v-model="state.show"
    :timeout="state.timeout"
    :color="state.color"
    :multi-line="state.multiLine"
    :vertical="state.vertical"
  >
    {{ state.message }}
    <template v-slot:actions>
      <v-btn color="white" @click="hideMessage">
        Dismiss
      </v-btn>
    </template>
  </v-snackbar>
</template>