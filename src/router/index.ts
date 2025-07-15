import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('../views/home.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/chat',
        component: () => import('../views/chat.vue'),
        meta: { requiresAuth: true }
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

function isAuthenticated() {
  // 这里实现你的登录状态检查逻辑
  // 例如检查 localStorage 或 Vuex 中的 token
  return localStorage.getItem('token') !== null
}

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查目标路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录（假设有一个方法可以检查登录状态）
    if (!isAuthenticated()) {
      // 未登录则重定向到登录页面
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 登录成功后可以跳转回目标页面
      })
    } else {
      next() // 已登录则继续
    }
  } else {
    next() // 不需要认证的路由直接放行
  }
})

export default router