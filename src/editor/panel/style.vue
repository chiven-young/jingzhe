<template>
    <Wrapper name="样式" :scene="scene">
        <div class="content">
            style
        </div>
    </Wrapper>
</template>
<script setup>
import Wrapper from './wrapper.vue';

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    scene: String,
})
</script>