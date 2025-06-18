<template>
    <div class="context-menu"
        :style="{ top: `${state?.top}px`, left: `${state?.left}px` }">
        <template v-if="state?.node?.type === 'folder'">
            <div class="menu-item" @click="handleMenuCommand('rename')">重命名</div>
        </template>
        <div class="menu-item" @click="handleMenuCommand('folder')">新建文件夹</div>
        <div class="menu-item" @click="handleMenuCommand('document')">新建图文</div>
        <div v-if="clipBoard" class="menu-item" @click="handleMenuCommand('paste')">粘贴</div>
    </div>
</template>
<script setup>

const props = defineProps({
    state: Object,
    clipBoard: {
        type: Object,
        default: () => ({})
    }
})
const emit = defineEmits(['command']);

const handleMenuCommand = (command) => {
    emit('command', command);
}
</script>
<style lang="scss" scoped>
.context-menu {
    position: fixed;
    z-index: 9999;
    padding: 4px;
    background-color: var(--el-bg-color-layout);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    min-width: 90px;
    .menu-item {
        padding: 4px 8px;
        font-size: 12px;
        color: var(--el-text-color-regular);
        cursor: pointer;
        &:hover {
            color: var(--el-text-color-primary);
            background-color: var(--el-bg-color-layout);
        }
    }
}
</style>