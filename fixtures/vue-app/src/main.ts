import { createApp } from 'vue'
import GreetingCard from './GreetingCard.vue'

createApp(GreetingCard, { who: 'world' }).mount('#app')
