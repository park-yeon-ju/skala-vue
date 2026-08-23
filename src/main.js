import './assets/main.css'

// Element Plus — 다크 테마 CSS 변수를 함께 불러오고 html에 dark 클래스를 고정한다.
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import ko from 'element-plus/es/locale/lang/ko'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 이 서비스는 밤하늘 컨셉의 단일 테마라 다크 모드로 고정한다.
document.documentElement.classList.add('dark')

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: ko })

app.mount('#app')
