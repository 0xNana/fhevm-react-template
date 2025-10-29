import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { WagmiPlugin } from '@wagmi/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createConfig, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import App from './App.vue'
import './style.css'

// Routes
import CounterDemo from './views/CounterDemo.vue'
import BankDemo from './views/BankDemo.vue'
import VotingDemo from './views/VotingDemo.vue'

const routes = [
  { path: '/', redirect: '/counter' },
  { path: '/counter', component: CounterDemo, name: 'Counter' },
  { path: '/bank', component: BankDemo, name: 'Bank' },
  { path: '/voting', component: VotingDemo, name: 'Voting' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Wagmi Configuration
const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(VueQueryPlugin)
app.use(WagmiPlugin, { config })
app.mount('#app')
