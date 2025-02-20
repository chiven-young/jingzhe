<script setup>
import { onBeforeMount, onMounted } from 'vue';

onBeforeMount(() => {
  
})
onMounted( async ()=> {
  if (window.__TAURI__) {
    document.body.classList.add('tauri');
  }
  // 监听 contextmenu 事件
  document.addEventListener('contextmenu', function (event) {
    event.preventDefault(); // 阻止默认行为
  });
})
</script>

<template>
  <router-view />
</template>

<style scoped></style>
