<template>
    <div class="page-container">
        <div class="header">
            <div class="title">开发者模式</div>
            <div class="operate">
                <el-button size="small" @click="router.push({ path: '/' })">返回首页</el-button>
            </div>
        </div>
        <div v-if="workspace" class="content">
            <div>本地配置版本: {{ workspace?.version || '无' }}</div>
            <div>{{ jingApi.env.isTauri ? '当前环境: Tauri' : '当前环境: 浏览器' }}</div>
            <br />
            <div class="item">
                <div class="label">菜单</div>
                <el-checkbox-group v-model="selectMenus" @change="onMenuChange">
                    <el-checkbox v-for="item in menus" :key="item.name" :label="item.label" :value="item.name" />
                </el-checkbox-group>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import store from '@/store';
import jingApi from '@/core';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const workspace = ref(null);

const menus = [
    {
        name: 'stars',
        label: '星标收藏'
    },
    {
        name: 'tags',
        label: '标签'
    },
    {
        name: 'material',
        label: '素材库'
    },
    {
        name: 'myTemplates',
        label: '我的模板'
    },
    // {
    //     name: 'filesTree',
    //     label: '文档目录'
    // }
]
const selectMenus = ref([]);
const onMenuChange = async (list) => {
    for (const each of menus) {
        if (list.includes(each.name)) {
            workspace.value.menus[each.name] = true;
        } else {
            workspace.value.menus[each.name] = false
        }
    }
    await jingApi.config.setMenus(workspace.value.menus);
    workspace.value = JSON.parse(JSON.stringify(store.state.workspace));
}
const loadMenusConfig = () => {
    selectMenus.value = [];
    for (const each of menus) {
        if (workspace.value.menus[each.name] === true) {
            selectMenus.value.push(each.name);
        }
    }
}

const onConfigChange = async (key,  value) => {
    workspace.value.config[key] = value;
    await jingApi.config.setConfig(workspace.value.config);
    workspace.value = JSON.parse(JSON.stringify(store.state.workspace));
}


onMounted(() => {
    workspace.value = JSON.parse(JSON.stringify(store.state.workspace));
    console.log('workspace', workspace.value)
    loadMenusConfig();
})
</script>
<style lang="scss" scoped>
.page-container {
    height: calc(100% - 8px);
    background-color: var(--el-bg-color-card);
    border-radius: 8px;
    margin: 0 8px 8px 8px;
    overflow: hidden;
    position: relative;
    .header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        box-sizing: border-box;
        border-bottom: 1px solid var(--el-border-color-light);

        .title {
            font-size: 16px;
            font-weight: 800;
        }

        .operate {
            display: flex;
            align-items: center;
        }
    }

    .content {
        padding: 16px;
        box-sizing: border-box;

        .item {
            border: 1px solid var(--el-border-color-light);
            padding: 8px;
            box-sizing: border-box;
            border-radius: 8px;
            margin-bottom: 16px;
            .label {
                font-size: 14px;
            }
        }
    }
}
</style>