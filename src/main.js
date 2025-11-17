import { createApp } from 'vue'
import App from './App.vue'

// mount with explicit initialView for the home page
createApp(App, { initialView: 'home' }).mount('#app')
