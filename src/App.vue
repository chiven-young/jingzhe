<script setup>
import { onBeforeMount, onMounted } from 'vue';

onBeforeMount(() => {
  
})
onMounted( async ()=> {
  if (window.__TAURI__) {
    document.body.classList.add('tauri');
  }
})
</script>

<template>
  <router-view />
</template>

<style scoped></style>
