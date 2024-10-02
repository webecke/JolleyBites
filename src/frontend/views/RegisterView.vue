<script setup lang="ts">

</script>

<template>
  <div id="container">
    <v-card title="Register" style="padding: 15px" width="300px">
      <v-form>
        <v-text-field label="Name"/>
        <v-text-field label="Email"/>
        <v-text-field label="Password"/>
        <v-text-field label="Confirm Password"/>
        <v-btn text="Register" color="green" width="100%"/>
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