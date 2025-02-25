<template>
    <div class="context-menu"
        :style="{ top: `${state?.top}px`, left: `${state?.left}px` }">
        <div class="menu-item name disabled">
            <span class="label">{{ state?.node?.name }}</span>
        </div>
        <div class="menu-item separator">
            <span class="line"></span>
        </div>
        <div class="menu-item" @click="handleMenuCommand('edit')">
            <Icon icon="ModeEditOutlineOutlined" size="14" />
            <span class="label">编辑</span>
        </div>
        <div class="menu-item" v-if="!state?.node?.isStar" @click="handleMenuCommand('star')">
            <Icon icon="StarRound" size="16" />
            <span class="label">收藏</span>
        </div>
        <div class="menu-item" v-else @click="handleMenuCommand('unStar')">
            <Icon icon="StarOutlineRound" size="16" />
            <span class="label">取消收藏</span>
        </div>
        <div class="menu-item separator">
            <span class="line"></span>
        </div>
        <div v-if="state?.node?.type !== 'folder'" class="menu-item" @click="handleMenuCommand('clone')">
            <Icon icon="ContentCopyRound" size="14" />
            <span class="label">创建副本</span>
        </div>
        <div v-if="sence === 'library'" class="menu-item" :class="{ 'disabled': clipBoard?.cid === state?.node?.cid }" @click="handleMenuCommand('cut')">
            <Icon icon="ContentCutOutlined" size="14" />
            <span class="label">剪切</span>
        </div>
        <template v-if="state?.node?.type === 'folder' && sence === 'tree'">
            <div class="menu-item" @click="handleMenuCommand('document')">
                <Icon icon="DescriptionOutlined" size="14" />
                <span class="label">新建文档</span>
            </div>
            <!-- <div class="menu-item" @click="handleMenuCommand('mindmap')">
                <Icon icon="MindMapOutlined" size="14" />
                <span class="label">新建思维导图</span>
            </div> -->
            <div class="menu-item" @click="handleMenuCommand('folder')">
                <Icon icon="FolderOutlined" size="14" />
                <span class="label">新建文件夹</span>
            </div>
        </template>
        <div class="menu-item separator">
            <span class="line"></span>
        </div>
        <template v-if="state.node.status === 0">
            <div class="menu-item" @click="handleMenuCommand('restore')">
                <Icon icon="RestoreRound" size="14" />
                <span class="label">恢复</span>
            </div>
            <div class="menu-item" @click="handleMenuCommand('remove')">
                <Icon icon="DeleteOutlined" size="14" />
                <span class="label">彻底删除</span>
            </div>
        </template>
        <div v-else class="menu-item" @click="handleMenuCommand('delete')">
            <Icon icon="DeleteOutlined" size="14" />
            <span class="label">移到废纸篓</span>
        </div>
    </div>
</template>
<script setup>

const props = defineProps({
    state: Object,
    clipBoard: {
        type: Object,
        default: () => ({})
    },
    sence: String,
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
    background-color: var(--bg-translucent-color-3);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid var(--border-color-3);
    border-radius: 8px;
    min-width: 90px;
    box-shadow: var(--box-shadow-3);
    .menu-item {
        padding: 4px 8px;
        color: var(--text-color-2);
        border-radius: 4px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        cursor: pointer;
        &:hover {
            color: var(--text-color-1);
            background-color: var(--bg-hover-color);
        }
        .label {
            font-size: 12px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            text-align: left;
        }
    }
    .menu-item.name {
        color: var(--text-color-4);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100px;
        padding: 1px 8px;
        font-weight: bold;
    }
    .menu-item.separator {
        padding: 0;
        height: 1px;
        background-color: var(--border-color-3);
        margin: 4px 0;
    }
}
</style>