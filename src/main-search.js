import { createApp } from 'vue'
import App from './App.vue'

// mount App and request the Search view initially
createApp(App, { initialView: 'search' }).mount('#app')
