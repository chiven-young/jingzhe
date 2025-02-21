<template>
    <div class="header no-select" data-tauri-drag-region>
        <div class="left">
            <actionBar v-if="zApi.env.isTauri" :osType="currentPlatform" />
            <div v-else class="logo no-select">
                <img :src="ImgLogoTp" alt="">
                <span class="name">惊蛰</span>
            </div>
            <div class="header-btn">
                <span class="menu-btn btn square text" @click="zApi.config.toggleSidebar">
                    <Icon icon="ChromeReaderModeOutlined" size="18" />
                </span>
            </div>
            <div class="btn-group draggable-none">
                <span class="btn quaternary square" @click="goBack">
                    <Icon class="icon" icon="ArrowBackIosRound" size="16" />
                </span>
                <span class="btn quaternary square" @click="goForward">
                    <Icon class="icon" icon="ArrowForwardIosRound" size="16" />
                </span>
            </div>
            <!-- <span class="page-title"></span> -->
            <!-- <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">我的文档</el-breadcrumb-item>
                <el-breadcrumb-item><a href="/">文档</a></el-breadcrumb-item>
                <el-breadcrumb-item>块</el-breadcrumb-item>
            </el-breadcrumb> -->
        </div>
        <div class="center">
            
        </div>
        <div class="right">
            <FileOPerations v-if="route.path === '/edit'" />
            <el-popover :visible="state.showAddBar" placement="bottom" :width="240" popper-class="background-blur">
                <template #reference>
                    <span class="btn square text" @click="showAddBar">
                        <Icon icon="AddCircleOutlineRound" size="20" />
                    </span>
                </template>
                <Addbar @select="hiddenAddBar" />
            </el-popover>
            <span v-if="route.path === '/edit'" class="btn square text" @click="zApi.config.toggleEditorPanel">
                <Icon icon="ChromeReaderModeOutlined" size="20" />
            </span>
            <el-popover placement="bottom" trigger="click" :width="200" popper-style="padding: 0" popper-class="background-blur">
                <template #reference>
                    <span class="btn square text">
                        <!-- <Icon icon="MoreHorizRound" size="20" /> -->
                        <div class="avatar" :style="{ backgroundImage: 'url(' + store.state.workspace?.user?.avatar + ')' }">
                            <Icon v-if="!store.state.workspace?.user?.avatar" icon="AccountCircleFilled" size="18" />
                        </div>
                    </span>
                </template>
                <ItemMenu />
            </el-popover>
        </div>
    </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Addbar from '../components/add-bar.vue';
import ItemMenu from '../components/item-menu.vue';
import FileOPerations from '../components/file-operations.vue';
import ImgLogoTp from '@/assets/img/logo.png';
import zApi from '@/core';
import store from '@/store';
import actionBar from '@/components/action-bar.vue';

const router = useRouter();
const route = useRoute();
const currentPlatform = ref('');

const state = reactive({
    showAddBar: false,
})
const showAddBar = () => {
    state.showAddBar = true;
    setTimeout(() => {
        document.addEventListener('click', hiddenAddBar);
    }, 100);
}
const hiddenAddBar = () => {
    state.showAddBar = false;
    document.removeEventListener('click', hiddenAddBar);
}

// 后退方法
function goBack() {
    window.history.back();
}

// 前进方法
function goForward() {
    window.history.forward();
}

const tabs = [
    {
        label: ''
    }
]
const goToPage = (path) => {
    router.push({
        path: path
    })
}

onMounted(async () => {
    zApi.config.setSidebarCollapse(store.state.workspace?.layout?.sidebar?.collapse);
    zApi.config.loadWorkspaceConfig();
})
</script>
<style lang="scss" scoped>
.header {
    padding: 8px 0;
    box-sizing: border-box;
    // background-color: var(--el-bg-color);
    // border-radius: 8px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left {
        display: flex;
        align-items: center;

        .menu-btn {
            margin-right: 6px;
            transform: rotateZ(180deg);
        }

        .page-title {
            font-size: 16px;
            font-weight: 800;
        }

        .el-breadcrumb {
            margin-left: 8px;
        }
    }

    .right {
        display: flex;
        align-items: center;
        .btn {
            margin-left: 4px;
            // padding-left: 8px;
            // padding-right: 8px;
            // border-radius: 6px;
        }
    }
    .header-btn {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    :deep(.btn) {
        padding-left: 8px;
        padding-right: 8px;
        border-radius: 6px;
    }
}
.logo {
    width: 100%;
    display: flex;
    align-items: center;
    margin-right: 14px;
    padding: 4px 0;
    img {
        height: 30px;
        margin-right: 6px;
    }
    .name {
        font-size: 16px;
        font-weight: bold;
        white-space: nowrap;
        width: 100%;
        text-align:justify;
        text-align-last:justify;
        box-sizing: border-box;
        line-height: 1;
    }
}
.avatar {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    border: 1px solid var(--el-border-color);
    background-color: var(--el-bg-color-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 400;
    color: var(--text-color-2);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
</style>