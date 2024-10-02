<script setup lang="ts">

</script>

<template>
  <div id="container">
    <v-card title="Login To JolleyBites" style="padding: 15px" width="300px">
      <v-form>
        <v-text-field label="Email"/>
        <v-text-field label="Password"/>
        <v-btn text="Login" color="green" width="100%"/>
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