import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('../views/home.vue')
    },
    {
        path: '/chat',
        component: () => import('../views/chat.vue')
    },
    {
        path: '/login',
        component: () => import('../views/login.vue')
    },
    {
        path: '/register',
        component: () => import('../views/register.vue')
    },
    {
        path: '/about',
        component: () => import('../views/about.vue')
    },
    {
        path: '/404',
        component: () => import('../views/notFound.vue')
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: '/404'
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router