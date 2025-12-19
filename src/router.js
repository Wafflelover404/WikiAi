import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: () => import('./components/LandingPage.vue')
  },
  {
    path: '/landing',
    name: 'LandingPageAlt',
    component: () => import('./components/LandingPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./components/LoginPage.vue')
  },
  {
    path: '/app',
    name: 'AppHome',
    component: () => import('./components/HomePage.vue')
  },
  {
    path: '/app/files',
    name: 'AppFiles',
    component: () => import('./components/FileTabs.vue')
  },
  {
    path: '/app/search',
    name: 'AppSearch',
    component: () => import('./components/SearchPage.vue')
  },
  {
    path: '/app/admin',
    name: 'AppAdmin',
    component: () => import('./components/AdminDashboard.vue')
  },
  {
    path: '/app/plugins',
    name: 'OpenCartPlugins',
    component: () => import('./components/OpenCartPluginsPage.vue')
  },
  {
    path: '/app/catalog-dashboard',
    name: 'CatalogDashboard',
    component: () => import('./components/CatalogDashboard.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
