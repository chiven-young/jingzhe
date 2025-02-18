<template>
    <Wrapper name="AI助手" :scene="scene">
        
    </Wrapper>
</template>
<script setup>
import { onMounted } from 'vue';
import Wrapper from './wrapper.vue';

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