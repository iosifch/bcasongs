import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/SongList.vue')
  },
  {
    path: '/song/:id',
    name: 'SongDetail',
    component: () => import('../views/SongDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
