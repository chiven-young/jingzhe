<template>
    <div class="editor-container">
        <EditorView :data="data" />
        <Toolbar class="toolbar" />
    </div>
</template>
<script setup>
import Toolbar from './map-toolbar.vue';
import EditorView from './editor.vue';

const props = defineProps({
    data: Object,
})
const emit = defineEmits(['update']);

</script>
<style lang="scss" scoped>
.editor-container {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>