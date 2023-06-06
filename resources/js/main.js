/* eslint-disable import/order */
import '@/@iconify/icons-bundle'
import App from '@/App.vue'
import ability from '@/plugins/casl/ability'
import layoutsPlugin from '@/plugins/layouts'
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import router from '@/router'
import { abilitiesPlugin } from '@casl/vue'
import '@core-scss/template/index.scss'
import '@styles/styles.scss'
import { createPinia } from 'pinia'
import { createApp, markRaw } from 'vue'
import axios from 'axios'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

loadFonts()


// Create vue app
const app = createApp(App)


// Use plugins
app.use(vuetify)
app.use(createPinia())
app.use(router)
app.use(layoutsPlugin)
app.use(abilitiesPlugin, ability, {
  useGlobalProperties: true,
})
app.use(Toast)
app.use(VueSweetalert2, {
  title: 'Are you Sure?',
  showCancelButton: true,
  confirmButtonText: 'Yes',
  denyButtonText: 'No',
})


// Mount vue app
app.mount('#app')

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null

  config.headers["Authorization"] = `Bearer ${token}`

  return config
})

createPinia().use(({ store }) => {
  store.router = markRaw(router)
})


