import { createRouter, createWebHistory } from 'vue-router'
import IngredientsView from '@/views/IngredientsView.vue'
import WelcomeView from '@/views/WelcomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import PrivacyView from '@/views/info/PrivacyView.vue'
import TermsView from '@/views/info/TermsView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import { useAuthStore } from '@/stores/authStore'
import BulkAddIngredientView from '@/views/BulkAddIngredientView.vue'
import { useDataStore } from '@/stores/dataStore'
import { initializeApp } from '@/services/AuthService'
import RecipesListView from '@/views/RecipesListView.vue'
import RecipeView from '@/views/RecipeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'welcome',
      component: WelcomeView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      beforeEnter: mustBeLoggedOut
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: mustBeLoggedOut
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyView
    },
    {
      path: '/terms',
      name: 'terms',
      component: TermsView
    },
    {
      path: '/ingredients/add',
      name: 'ingredientsBulk',
      component: BulkAddIngredientView,
      beforeEnter: mustBeLoggedIn
    },
    {
      path: '/ingredients',
      name: 'ingredients',
      component: IngredientsView,
      beforeEnter: mustBeLoggedIn
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: mustBeLoggedIn
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: RecipesListView,
      beforeEnter: mustBeLoggedIn
    },
    {
      path: '/recipes/:id',
      name: 'recipe',
      component: RecipeView,
      beforeEnter: mustBeLoggedIn
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: NotFoundView
    }
  ]
})

async function mustBeLoggedIn(to: any, from: any, next: any) {
  await useAuthStore().getCurrentUser()

  if (!useAuthStore().isLoggedIn) {
    next('/login')
    return
  }

  const dataStore = useDataStore()
  if (!dataStore.dataIsLoaded) {
    await initializeApp()
  }

  next()
}

async function mustBeLoggedOut(to: any, from: any, next: any) {
  await useAuthStore().getCurrentUser()

  if (useAuthStore().isLoggedIn) {
    const dataStore = useDataStore()
    if (!dataStore.dataIsLoaded) {
      await initializeApp()
    }
    next('/dashboard')
    return
  }

  next()
}

export default router
