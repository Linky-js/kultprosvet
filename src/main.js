import { createApp } from 'vue'

import router from './router/router'
import '../src/assets/css/style.css';
import App from './App.vue'
// import $ from 'jquery'
import store from "@/store";
import VCalendar from 'v-calendar';
createApp(App).use(store).use(router).use(VCalendar).mount('#app')

