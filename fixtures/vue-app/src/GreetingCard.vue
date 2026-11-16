<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ who: string }>()
const count = ref(0)
const greeting = computed(() => `Hello, ${props.who}`)
</script>

<template>
  <section>
    <h1>{{ greeting }}</h1>
    <button type="button" @click="count++">Clicked {{ count }} times</button>
  </section>
</template>
