import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import { checkRingCentralToken } from "@/plugins/ringCentral"


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // redirect main page to dashboard
    {
      path: '/',
      redirect: to => {
        return { name: 'dashboards-analytics', query: to.query }
      },
    },
    ...setupLayouts(routes),
  ],
})

router.afterEach((to, from) => {
  $header=>set('Content-Type','application/x-www-form-urlencoded, application/json')
  checkRingCentralToken()
})

export default router

export class route {
}
