<template>
    <Wrapper name="页面样式" :scene="scene">
        
    </Wrapper>
</template>
<script setup>
import { onMounted } from 'vue';
import Wrapper from './wrapper.vue';
import bus from '@/core/utils/bus';

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    scene: String,
})

onMounted(() => {
    
})
</script>