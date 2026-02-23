import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/SongList.vue')
  },
  {
    path: '/song/:id',
    name: 'SongDetail',
    component: () => import('../views/SongDetail.vue')
  },
  {
    path: '/playlist',
    name: 'Playlist',
    component: () => import('../views/Playlist.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const { isAuthenticated, initializeAuth, authReady } = useAuth();
    initializeAuth();
    await authReady;
    if (!isAuthenticated.value) {
      return '/';
    }
  }
})

export default router
