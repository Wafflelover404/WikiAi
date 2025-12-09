import { createRouter, createWebHistory } from 'vue-router'

const Empty = { template: '<div></div>' }

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: Empty
  },
  {
    path: '/login',
    name: 'Login',
    component: Empty
  },
  {
    path: '/app',
    name: 'AppHome',
    component: Empty
  },
  {
    path: '/app/files',
    name: 'AppFiles',
    component: Empty
  },
  {
    path: '/app/search',
    name: 'AppSearch',
    component: Empty
  },
  {
    path: '/app/admin',
    name: 'AppAdmin',
    component: Empty
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
