<template>
    <div class="settings-content">
        <div class="item flex">
            <div class="label">使用顶部工具栏</div>
            <el-switch v-model="store.state.workspace.editor.showTopToolBar" @change="zApi.config.setShowTopToolBar"></el-switch>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import store from '@/store';
import zApi from '@/core';

onMounted( async ()=> {
    console.log('config', store.state.workspace)
})
</script>
<style lang="scss" scoped>
.settings-content {
    .item {
        margin-bottom: 20px;
        .avatar {
            margin-bottom: 8px;
            .img {
                height: 60px;
                width: 60px;
                border-radius: 8px;
                background-color: var(--el-color-info-light-9);
                border: 1px solid var(--el-border-color);
                box-sizing: border-box;
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
            }
        }
        .label {
            margin-bottom: 4px;
            font-size: 14px;
        }
        .el-input {
            margin-bottom: 8px;
        }
    }
    .item.flex {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid var(--el-border-color-lighter);
        padding: 8px;
        box-sizing: border-box;
        border-radius: 6px;
    }
}
</style>