import './assets/main.scss'

import { createApp } from 'vue'
import { VueFire } from 'vuefire'
import App from './App.vue'
import firebaseApp from './firebase/init.ts'

const app = createApp(App)
app.use(VueFire, {
  firebaseApp,
  modules: [],
})

app.mount('#app')
