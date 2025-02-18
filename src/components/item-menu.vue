<template>
    <div class="item-menus">
        <div class="menu-item" @click="clickMenuItem('settings-account')">
            <Icon class="icon" icon="AccountCircleOutlined" size="16" />
            <span class="label">个人中心</span>
            <span class="shortcut-keys"></span>
        </div>
        <div class="menu-item" @click="zApi.config.toggleTheme">
            <template v-if="store.state.workspace?.appearance?.theme === 'light'">
                <Icon class="icon" icon="DarkModeRound" size="16" />
                <span class="label">暗夜主题</span>
            </template>
            <template v-else>
                <Icon class="icon" icon="LightModeOutlined" size="16" />
                <span class="label">明亮主题</span>
            </template>
            <span class="shortcut-keys"></span>
        </div>
        <div class="menu-item" @click="clickMenuItem('settings-workspace')">
            <Icon class="icon" icon="TuneRound" size="16" />
            <span class="label">偏好设置</span>
            <span class="shortcut-keys"></span>
        </div>
        <div class="splitter"></div>
        <template v-if="route.path === '/edit'">
            <div class="menu-item" @click="clickMenuItem('settings-edit')">
                <Icon class="icon" icon="TuneRound" size="16" />
                <span class="label">编辑设置</span>
                <span class="shortcut-keys"></span>
            </div>
            <div class="splitter"></div>
            <div class="menu-item" @click="clickMenuItem('saveAsTemplate')">
                <Icon class="icon" icon="SubtitlesOutlined" size="16" />
                <span class="label">保存为模板</span>
                <span class="shortcut-keys"></span>
            </div>
            <div class="menu-item" @click="clickMenuItem('export')">
                <Icon class="icon" icon="FileDownloadOutlined" size="16" />
                <span class="label">导出/下载</span>
                <span class="shortcut-keys"></span>
            </div>
            <div class="splitter"></div>
        </template>
        <div class="menu-item">
            <span class="icon"></span>
            <span class="label">使用教程</span>
            <span class="shortcut-keys"></span>
        </div>
        <div class="menu-item">
            <span class="icon"></span>
            <span class="label">快捷键列表</span>
            <span class="shortcut-keys"></span>
        </div>
        <div class="menu-item">
            <span class="icon"></span>
            <span class="label">帮助中心</span>
            <span class="shortcut-keys"></span>
        </div>
    </div>
</template>
<script setup>
import bus from '@/core/utils/bus';
import { useRouter, useRoute } from 'vue-router';
import zApi from '@/core';
import store from '@/store';

const route = useRoute();

const clickMenuItem = (item) => {
    if (item ==='settings-edit') {
        bus.emit('openSettings', 'edit');
    } else if (item === 'settings-account') {
        bus.emit('openSettings', 'account');
    } else if (item === 'settings-workspace') {
        bus.emit('openSettings', 'workspace');
    }
}

</script>
<style lang="scss" scoped>
.item-menus {
    padding: 8px 0;
    .menu-item {
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 14px;
        box-sizing: border-box;
        cursor: pointer;
        .icon {
            margin-right: 8px;
            width: 16px;
        }
    }
    .menu-item:hover {
        background-color: var(--el-bg-color-page);
    }
    .splitter {
        width: 100%;
        height: 1px;
        background-color: var(--el-border-color-light);
        margin: 8px 0;
    }
}
</style>