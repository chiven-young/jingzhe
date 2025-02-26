<template>
    <div class="settings-content">
        <div class="edit">
            <el-input v-model="workspaceData.name" placeholder="名称" />
            <el-input v-model="workspaceData.description" type="textarea" resize="none" placeholder="描述" />
            <div class="operation">
                <el-button :disabled="!workspaceData.name" type="primary" @click="createWorkspace">新建工作区</el-button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { reactive } from 'vue'
import jingApi from '@/core';

const emit = defineEmits(['close']);

const workspaceData = reactive({
    name: '',
    description: '',
})
const createWorkspace = async () => {
    const res = await jingApi.workspace.createWorkspace(workspaceData);
    if (res?.data?.id) {
        jingApi.workspace.switchWorkspace(res.data.id);
        emit('close');
    }
}
</script>
<style lang="scss" scoped>
.settings-content {
    .edit {
        display: flex;
        flex-direction: column;
        gap: 10px;
        .title {
            font-size: 16px;
            font-weight: bold;
        }
    }
}
</style>