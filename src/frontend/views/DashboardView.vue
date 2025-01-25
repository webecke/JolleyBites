<script setup lang="ts">

import { doLogout, initializeApp } from '@/services/AuthService'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { computed, onBeforeMount } from 'vue'
import { snackbarStore } from '@/stores/snackbarStore'

onBeforeMount(async () => {
  await initializeApp()
})

const ingredientCount = computed(() => useDataStore().ingredients.size)
const recipeCount = computed(() => useDataStore().recipes.size)

const logout = async () => {
  doLogout()
  router.push("/")
}

const notReady = () => {
  snackbarStore.showMessage("Oops! Sorry, that's not ready yet! Try back later")
}
</script>

<template>
  <div class="dashboardContainer">
    <v-card
      color="var(--jb--french-gray)"
      class="dashboardBar"
      :title="'Hello, ' + useAuthStore().currentUser?.name">
      <template v-slot:text>
        <v-btn @click="logout">Logout</v-btn>
      </template>
    </v-card>

    <div class="mainDashboard">
      <h1>My Dashboard</h1>
      <div class="gridContainer">
        <div class="gridItem">
          <RouterLink to="/ingredients">
            <div class="headerAndStat">
              <h3>Ingredients</h3>
              <h3>{{ingredientCount}}</h3>
            </div>
            <p>Add ingredients you use in your recipes</p>
          </RouterLink>
        </div>

        <div class="gridItem">
          <RouterLink to="/recipes">
            <div class="headerAndStat">
              <h3>Recipes</h3>
              <h3>{{recipeCount}}</h3>
            </div>
            <p>Calculate how much your recipes cost</p>
          </RouterLink>
        </div>

        <div class="gridItem">
          <RouterLink to="/dashboard" @click="notReady()">
            <div class="headerAndStat">
              <h3>Menus</h3>
              <h3>0</h3>
            </div>
            <p>Combine recipes into menus to calculate costs of full menus</p>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboardContainer {
  display: flex;
  flex-wrap: wrap;
}
.dashboardBar {
  flex: 0 0 30%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
}
.mainDashboard {
  flex: 1;
  margin-left: 15px;
}
@media (max-width: 550px) {
  .dashboardBar, .mainDashboard {
    flex: 0 0 100%;
  }
  .mainDashboard {
    margin-top: 15px;
    margin-left: 0;
  }
}

.gridContainer {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
.gridItem {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  color: var(--jb--eerie-black);
}

.headerAndStat {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: var(--jb--eerie-black);
}

h3 {
  font-weight: bold;
}
</style>
