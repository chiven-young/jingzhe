<template>
    <div class="page-container">
        <div class="page-header">
            <div class="page-title">测试页面</div>
        </div>
        <div class="page-content">
            <div class="section">
                <div class="section-head">
                    <div class="section-title">工作区 [ {{ workspaceData?.id }} ]</div>
                </div>
                <div class="section-body">
                    <div class="edit">
                        <el-input v-model="workspaceData.name" placeholder="请输入工作区名称"></el-input>
                        <el-input v-model="workspaceData.description" type="textarea" placeholder="请输入工作区描述"></el-input>
                        <el-button @click="createWorkspace">创建工作区</el-button>
                        <el-button @click="updateWorkspace">更新工作区</el-button>
                        <el-button @click="zApi.workspace.importWorkspace">导入工作区</el-button>
                    </div>
                    <div class="card-list">
                        <el-card v-for="(item, index) in workspaceList" :key="index" class="card-item" shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span class="color-mark" :style="{ background: item?.color }"></span>
                                    <span>{{ item?.name }}</span>
                                </div>
                            </template>
                            <div class="card-content">
                                <div class="text-s">{{ item?.id }}</div>
                                <div>{{ item?.description }}</div>
                            </div>
                            <template #footer>
                                <el-button :disabled="workspaceData?.id === item?.id" @click="loadWorkspace(item)">使用</el-button>
                                <el-button @click="zApi.workspace.exportWorkspace(item?.id)">导出</el-button>
                                <el-button @click="deleteWorkspace(item.id)">删除</el-button>
                            </template>
                        </el-card>
                    </div>
                </div>
            </div>
            <div class="section">
                <div class="section-head">
                    <div class="section-title">细胞数据 [ {{ state.cellTotal }} ]</div>
                </div>
                <div class="section-body">
                    <div class="edit">
                        <el-input v-model="cellData.name" placeholder="请输入细胞名称"></el-input>
                        <el-input v-model="cellData.description" type="textarea" placeholder="请输入描述"></el-input>
                        <el-button @click="addCell">创建细胞</el-button>
                        <el-button @click="updateCell">更新细胞</el-button>
                    </div>
                    <div class="card-list">
                        <el-card v-for="(item, index) in cellList" :key="index" class="card-item" shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span>{{ item?.name }}</span>
                                </div>
                            </template>
                            <div class="card-content">
                                <div class="text-s">{{ item?.id }}</div>
                                <div>{{ item?.description }}</div>
                            </div>
                            <template #footer>
                                <el-button @click="editCell(item)">编辑</el-button>
                                <el-button @click="deleteCell(item.id)">删除</el-button>
                            </template>
                        </el-card>
                    </div>
                </div>
            </div>
            <div class="section">
                <div class="section-head">
                    <div class="section-title">测试</div>
                </div>
                <div class="section-body">
                    <!-- <pre><code>{{ state.fetchRes3 }}</code></pre> -->
                    <pre><code>{{ state.fetchRes4 }}</code></pre>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import zApi from '@/core';
import requests from "@/utils/requests";
import axios from 'axios';
import { fetch } from '@tauri-apps/plugin-http';
import Cookies from 'js-cookie'
const token = Cookies.get("TPTTOKEN");

const state = reactive({
    workspaceTotal: 0,
    currentWorkspace: null,
    cellTotal: 0,
    fetchRes1: null,
    fetchRes2: null,
    fetchRes3: null,
    fetchRes4: null,
    fetchRes5: null,
    fetchRes6: null,
    fetchRes7: null,
    fetchRes8: null,
    fetchRes9: null,
    fetchRes10: null,
})

const workspaceList = ref([]);
const getWorkspaceList = async () => {
    const res = await zApi.workspace.getWorkspaceList();
    workspaceList.value = res?.data?.list || [];
    state.workspaceTotal = res?.data?.total || 0;
};
const workspaceData = reactive({
    id: null,
    name: '',
    description: '',
})
const getCurrentWorkspace = async () => {
    const res = zApi.workspace.currentWorkspace;
    state.currentWorkspace = res;
    console.log('current workspace:', res);
    if (res) {
        workspaceData.id = res.id;
        workspaceData.name = res.name || '';
        workspaceData.description = res.description || '';
    }
}
const createWorkspace = async () => {
    workspaceData.id = null;
    const res = await zApi.workspace.createWorkspace(workspaceData);
    console.log(res);
    getWorkspaceList();
}
const updateWorkspace = async () => {
    const res = await zApi.workspace.updateWorkspace(workspaceData);
    console.log(res);
    getWorkspaceList();
}
const loadWorkspace = async (item) => {
    const res = await zApi.workspace.switchWorkspace(item.id);
    zApi.config.loadWorkspaceConfig();
    console.log(res);
    workspaceData.id = item.id;
    workspaceData.name = item.name;
    workspaceData.description = item.description;
}
const deleteWorkspace = async () => {
    const res = await zApi.workspace.deleteWorkspace(workspaceData.id);
    console.log(res);
    await getWorkspaceList();
    getCurrentWorkspace();
}

const cellData = reactive({
    cid: null,
    name: '',
    description: '',
})
const addCell = async () => {
    const res = await zApi.cells.addCell(cellData);
    console.log(res);
    getCellList();
}
const editCell = (item) => {
    cellData.cid = item?.cid;
    cellData.name = item?.name;
    cellData.description = item?.description;
}
const cellList = ref([]);
const paramsGetCells = reactive({
    page: 1,
    pageSize: -1,
    showDetail: 1,
})
const getCellList = async () => {
    const res = await zApi.cells.getCells(paramsGetCells);
    cellList.value = res?.data?.list || [];
    state.cellTotal = res?.data?.total || 0;
    console.log('get cells:', res);
}
const updateCell = async () => {
    const res = await zApi.cells.updateCell(cellData);
    getCellList();
}
const deleteCell = async (cid) => {
    const res = await zApi.cells.deleteCell({
        cid: cid,
    });
    getCellList();
}


onMounted( async () => {
    await getWorkspaceList();
    getCurrentWorkspace();
    // getCellList();

    if (zApi.env.isTauri) {
        // state.fetchRes3 = await requests.get(`https://weibo.com/ajax/side/hotSearch`);

        // state.fetchRes1 = await requests.get(`${import.meta.env.VITE_API_BASE_URL}/informationms/manager/mgrArticleInfo/getList?pageNo=1&pageSize=10`)
        // console.log('test========', state.fetchRes1)

        // state.fetchRes4 = await requests.get('http://localhost:6060/informationms/manager/mgrArticleInfo/getList?pageNo=1&pageSize=10')
        // console.log('test========', state.fetchRes4)

        state.fetchRes4 = await requests.post('http://localhost:6060/frontenddynamicms/elastic/config/get', {
            "codes": [
                "mallLandingPage"
            ]
        })
        console.log('test========', state.fetchRes4)

        // state.fetchRes5 = await axios.get('http://localhost:6060/informationms/course/anonymous/courseList?pageNo=1&pageSize=10')
    }
})
</script>
<style lang="scss" scoped>
.page-container {
    padding: 20px;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    .page-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .page-title {
            font-size: 20px;
            font-weight: bold;
            margin-right: 20px;
        }
    }
    .page-content {
        .section {
            padding: 16px;
            border: 1px solid var(--el-border-color);
            border-radius: 8px;
            margin-bottom: 20px;
            .section-head {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                .section-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-right: 10px;
                }
            }
            .section-body {
                .section-item {
                    margin-bottom: 10px;
                }
            }
        }
    }
    .card-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin: 20px 0;
        .card-item {
            .color-mark {
                height: 16px;
                width: 6px;
                display: inline-block;
                margin-right: 8px;
                vertical-align: middle;
            }
        }
    }
}
</style>