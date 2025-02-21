<template>
    <div class="context-menu"
        :style="{ top: `${state?.top}px`, left: `${state?.left}px` }">
        <div class="menu-item" @click="handleMenuCommand('edit')">编辑</div>
        <div class="menu-item" v-if="!state?.node?.isStar" @click="handleMenuCommand('star')">收藏</div>
        <div class="menu-item" v-else @click="handleMenuCommand('unStar')">取消收藏</div>
        <template v-if="state?.node?.type === 'folder'">
            <div class="menu-item" @click="handleMenuCommand('document')">新建图文</div>
            <div class="menu-item" @click="handleMenuCommand('mindmap')">新建思维导图</div>
            <div class="menu-item" @click="handleMenuCommand('folder')">新建文件夹</div>
        </template>
        <div class="menu-item" @click="handleMenuCommand('delete')">删除</div>
    </div>
</template>
<script setup>

const props = defineProps({
    state: Object,
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
    border: 1px solid var(--border-color-3);
    border-radius: 8px;
    min-width: 90px;
    box-shadow: var(--box-shadow-3);
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