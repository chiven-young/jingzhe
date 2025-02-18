<template>
    <div class="workspace" @click="openSettings">
        <div class="info">
            <div class="avatar" :style="{ backgroundImage: 'url(' + store.state.workspace?.avatar + ')' }">
                <span v-if="!store.state.workspace?.avatar">{{ store.state.workspace?.name?.charAt(0) }}</span>
            </div>
            <div class="name">
                {{ store.state.workspace?.name || '工作区' }}
            </div>
        </div>
        <Icon icon="KeyboardArrowDownRound" size="16" />
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import store from '@/store';
import bus from '@/utils/bus.js';

const openSettings = () => {
    bus.emit('openSettings', 'workspace');
}
onMounted( async ()=> {

})
</script>
<style lang="scss" scoped>
.workspace {
    padding: 4px;
    box-sizing: border-box;
    // background-color: var(--base-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    .info {
        display: flex;
        align-items: center;
        .avatar {
            height: 30px;
            width: 30px;
            border-radius: 8px;
            border: 1px solid var(--el-border-color);
            margin-right: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-color-2);
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
        }
        .name {
            font-size: 14px;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100px;
        }
    }
}
</style>