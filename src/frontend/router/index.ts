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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('@/views/AboutView.vue')
    // },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: NotFoundView
    }
  ]
})

async function mustBeLoggedIn() {
  await useAuthStore().getCurrentUser()
  if (!useAuthStore().isLoggedIn) {
    router.push('/login')
  }
}

async function mustBeLoggedOut() {
  await useAuthStore().getCurrentUser()
  if (useAuthStore().isLoggedIn) {
    router.push('/dashboard')
  }
}

export default router
