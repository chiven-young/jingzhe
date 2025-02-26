<template>
    <div v-if="store.state.loadingWorkspace" class="loading-container">
        <div class="loading-box">
            加载中...
        </div>
    </div>
    <div v-else class="app-container">
        <div class="header-container" data-tauri-drag-region>
            <Header></Header>
        </div>
        <div class="content-container" id="main-container">
            <div class="menu-wrapper">
                <Menu :menuConfig="store.state.workspace?.menus" />
            </div>
            <div class="main-wrapper">
                <router-view></router-view>
            </div>
        </div>
        <Settings />
        <FolderEdit />
        <Template />
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import Header from './header.vue';
import Menu from './menu.vue';
import Settings from '@/views/settings/index.vue';
import FolderEdit from '@/components/folder-edit.vue';
import Template from '@/views/library/template.vue';
import store from '@/store';
import bus from '@/core/utils/bus';
import zApi from '@/core';

onBeforeMount(() => {
    bus.on('workspace-switched', (workspace) => {
        zApi.config.loadWorkspaceConfig();
    })
})
</script>
<style lang="scss" scoped>
.app-container {
    height: 100vh;
    width: 100vw;
    // background-color: var(--el-bg-color-page);
    // background: linear-gradient(97.54deg, #F6F6F6 3.56%, #EFEEF5 49.86%, #F6F6F6 96.15%);
    display: flex;
    flex-direction: column;

    .header-container {
        height: 50px;
        padding: 8px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        -webkit-app-region: drag;
        // background-color: var(--el-bg-color);
    }

    .content-container {
        display: flex;
        flex-direction: row;
        overflow: hidden;
        width: 100vw;
        flex-grow: 1;
        overflow: hidden;
        .menu-wrapper {
            // padding: 0 8px 8px 8px;
            box-sizing: border-box;
            white-space: nowrap;
            height: 100%;
            transition: width 0.3s ease;
            overflow: hidden;
        }

        .main-wrapper {
            flex-grow: 1;
            position: relative;
            // padding: 8px;
            box-sizing: border-box;
            // background-color: var(--el-bg-color);
            overflow: hidden;
            height: 100%;
            max-width: 100%;
        }
    }
    .content-container.collapse {
        .menu-wrapper {
            width: 0;
        }
    }
    .content-container.expand {
        .menu-wrapper {
            width: 200px;
        }
        .main-wrapper {
            max-width: calc(100% - 200px);
            transition: max-width 0.3s ease;
        }
    }
}
.loading-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--el-bg-color-page);
    .loading-box {
        font-size: 14px;
    }
}
</style>