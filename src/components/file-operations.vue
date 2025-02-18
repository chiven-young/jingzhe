<template>
    <div class="file-operations">
        <div class="save-status">{{ store.state.itemSaveStatus === 'saving' ? '正在保存...' : store.state.itemSaveStatus === 'saved' ? '已保存' : '有改动未保存' }}</div>
        <span class="btn square text" @click="saveItem">
            <Icon icon="SaveOutlined" size="20" />
        </span>
        <!-- <span class="btn square text" @click="shareItem">
            <Icon icon="ShareOutlined" size="20" />
        </span> -->
        <span class="btn square text" @click="bus.emit('previewItem')">
            <Icon icon="RemoveRedEyeOutlined" size="20" />
        </span>
    </div>
</template>
<script setup>
import bus from '@/core/utils/bus';
import store from '@/store';
import { debounce } from '@/core/utils/tools';

const _saveItem = () => {
    bus.emit('saveItem')
}
const saveItem = debounce(_saveItem, 300);

const shareItem = () => {
    bus.emit('share-item-start')
}
</script>
<style lang="scss" scoped>
.file-operations {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    .save-status {
        display: inline;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        width: 100px;
        text-align: right;
    }
    .btns-type {
        border-radius: 6px;
        overflow: hidden;
        margin: 0 8px;
        border: 1px solid var(--el-border-color-lighter);
        .btn-arrow {
            padding-left: 4px;
            padding-right: 4px;
        }
    }
}
</style>