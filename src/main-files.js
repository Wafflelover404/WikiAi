import { createApp } from 'vue'
import App from './App.vue'

// mount App and request the Files view initially
createApp(App, { initialView: 'files' }).mount('#app')
