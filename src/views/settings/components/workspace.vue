<template>
    <div class="settings-content">
        <div class="card-list">
            <div v-for="(item, index) in workspaceList" :key="index" class="card-item" :class="{ active: store.state.workspace?.id === item?.id }" :style="{
                borderColor: store.state.workspace?.id === item?.id ? item?.color : 'var(--el-border-color)',
                backgroundColor: store.state.workspace?.id === item?.id ? (item?.color + '10') : 'var(--el-bg-color-card)'
            }">
                <div class="name">{{ item?.name }}</div>
                <div class="desc">{{ item?.description }}</div>
                <!-- <div class="id">ID: {{ item?.id }}</div> -->
                <div class="operation">
                    <el-button size="small" round :disabled="store.state.workspace?.id === item?.id" @click="loadWorkspace(item)">{{ store.state.workspace?.id === item?.id ? '使用中' : '使用' }}</el-button>
                    <el-button size="small" round @click="toEdit(item)">编辑</el-button>
                    <el-button size="small" round @click="jingApi.workspace.exportWorkspace(item?.id)">导出</el-button>
                    <el-button size="small" round plain type="danger" @click="deleteWorkspace(item.id)">删除</el-button>
                </div>
            </div>
            <!-- <div class="card-item add" @click="jingApi.workspace.importWorkspace">
                <div class="content">
                    <Icon icon="ArrowCircleDownRound" size="24" />
                    <div class="label">导入工作区</div>
                </div>
            </div> -->
        </div>
        <div v-if="editMode" class="edit">
            <div class="title">编辑工作区</div>
            <el-input v-model="workspaceData.name" placeholder="名称" />
            <el-input v-model="workspaceData.description" type="textarea" resize="none" placeholder="描述" />
            <div class="operation">
                <el-button type="primary" @click="updateWorkspace">更新</el-button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue'
import store from '@/store';
import jingApi from '@/core';
import bus from '@/core/utils/bus';

const emit = defineEmits(['close']);

const workspaceList = ref([]);
const getWorkspaceList = async () => {
    const res = await jingApi.workspace.getWorkspaceList();
    workspaceList.value = res?.data?.list || [];
};

const editMode = ref(false);
const workspaceData = reactive({
    id: null,
    name: '',
    description: '',
})
const toEdit = (item) => {
    editMode.value = true;
    workspaceData.id = item.id;
    workspaceData.name = item.name;
    workspaceData.description = item.description;
}
const resetData = () => {
    editMode.value = false;
    workspaceData.id = null;
    workspaceData.name = '';
    workspaceData.description = '';
}
const updateWorkspace = async () => {
    const res = await jingApi.workspace.updateWorkspace(workspaceData, false);
    // console.log(res);
    getWorkspaceList();
}
const loadWorkspace = async (item) => {
    const res = await jingApi.workspace.switchWorkspace(item.id);
    jingApi.config.loadWorkspaceConfig();
    bus.emit('cells-changed', null);
    resetData();
    emit('close');
    // console.log(res);
}
const deleteWorkspace = async (id) => {
    const res = await jingApi.workspace.deleteWorkspace(id);
    console.log(res);
    await getWorkspaceList();
}

onMounted( async ()=> {
    getWorkspaceList();
    bus.on('workspace-switched', (workspace) => {
        getWorkspaceList();
    })
})
</script>
<style lang="scss" scoped>
.settings-content {
    .card-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 10px;
        .card-item {
            padding: 8px;
            border-width: 1px;
            border-style: solid;
            border-radius: 8px;
            box-sizing: border-box;
            .name {
                font-size: 16px;
                font-weight: bold;
            }
            .desc {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                height: 30px;
            }
            .id {
                font-size: 12px;
                font-weight: bold;
                color: var(--el-text-color-secondary);
            }
            .operation {
                display: flex;
                gap: 6px;
                margin-top: 8px;
                .el-button {
                    margin: 0;
                }
            }
        }
        .card-item.add {
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid var(--el-border-color);
            cursor: pointer;
            .content {
                text-align: center;
                .label {
                    font-size: 16px;
                }
            }
        }
    }
    .edit {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 16px;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--el-border-color);
        .title {
            font-size: 16px;
            font-weight: bold;
        }
    }
}
</style>