<script lang="ts">
import { defineComponent, computed } from 'vue'
import { BUILD_DATE } from '../../buildInfo'
import { formatDate } from '@/utils/formatUtils'

export default defineComponent({
  name: 'AppInfo',
  setup() {
    const formattedBuildDate = computed(() => {
      return formatDate(new Date(BUILD_DATE))
    })

    return {
      formattedBuildDate
    }
  }
})
</script>

<template>
  <div style="width: 100%">
    <p>© 2024 ForestBlue Development</p>
    <p><a href="https://github.com/DallinFromEarth/JolleyBites" target="_blank">View on Github</a>  |  Latest build: <em>{{formattedBuildDate}}</em></p>
    <p><RouterLink to="/privacy">Privacy Notice</RouterLink>  |  <RouterLink to="/terms">Terms of Service</RouterLink></p>
  </div>
</template>

<style scoped>
* {
  text-align: center;
}
</style>