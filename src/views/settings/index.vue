<template>
    <div class="settings">
        <el-dialog
            v-model="showDialog"
            title="设置"
            width="800"
            modal-class="settings-modal"
            destroy-on-close
        >
            <div class="wrapper">
                <div class="menu">
                    <div class="menu-content">
                        <div v-for="(group, index) in settingsMenu" :key="index" class="group">
                            <div class="group-label">{{ group?.label }}</div>
                            <div class="group-list">
                                <div v-for="item in group?.children" :key="item?.value" class="menu-item" :class="{ active: activeMenu?.value === item?.value }" @click="clickMenu(item)">
                                    <Icon class="menu-item-icon" :icon="item?.icon" size="16" />
                                    <span class="menu-item-label">{{ item?.label }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="footer">
                        <el-button v-if="store.state.workspace?.user?.uid" @click="zApi.user.logout">退出登录</el-button>
                    </div>
                </div>
                <div class="content">
                    <div class="header">{{ activeMenu?.label }}</div>
                    <div class="content-wrapper">
                        <Account v-if="activeMenu?.value === 'account'" />
                        <Workspace v-else-if="activeMenu?.value === 'workspace'" @close="closeDialog" />
                        <Edit v-else-if="activeMenu?.value === 'edit'" />
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus.js';
import store from '@/store';
import zApi from '@/core';
import Account from './components/account.vue';
import Workspace from './components/workspace.vue';
import Edit from './components/edit.vue';

const showDialog = ref(false);
const activeMenu = ref(null);
const clickMenu = (item) => {
    activeMenu.value = item;
}

const closeDialog = () => {
    showDialog.value = false;
}
onMounted(()=> {
    bus.on('openSettings', function (val) {
        showDialog.value = true;
        for(const each of settingsMenu){
            const menu = each.children.find(item => item.value === val);
            if(menu){
                activeMenu.value = menu;
                break;
            }
        }
    })
})
const settingsMenu = [
    {
        label: '账号与工作区',
        children: [
            {
                label: '我的账号',
                value: 'account',
                icon: 'AccountCircleOutlined'
            },
            {
                label: '工作区',
                value: 'workspace',
                icon: 'SpaceDashboardOutlined'
            }
        ]
    },
    {
        label: '常规设置',
        children: [
            {
                label: '编辑设置',
                value: 'edit',
                icon: 'TuneRound'
            },
            {
                label: '外观',
                value: 'appearance',
                icon: 'HiveOutlined'
            },
            {
                label: '语言',
                value: 'language',
                icon: 'LanguageRound'
            },
            {
                label: '高级设置',
                value: 'advance',
                icon: 'DisplaySettingsRound'
            },
            {
                label: '关于',
                value: 'about',
                icon: 'InfoOutlined'
            },
        ]
    }
]
</script>
<style lang="scss" scoped>
:deep(.settings-modal) {
    .el-dialog {
        border-radius: 8px;
        overflow: hidden;
        padding: 0;
    }
    .el-dialog__header {
        display: none;
    }
    .el-dialog__body {
        padding: 0;
    }
}
.wrapper {
    display: grid;
    grid-template-columns: 140px auto;
    height: 600px;
    overflow: hidden;
    .menu {
        background-color: var(--el-fill-color-light);
        padding: 16px 8px;
        box-sizing: border-box;
        position: relative;
        display: flex;
        flex-direction: column;
        .menu-content {
            flex-grow: 1;
            overflow-y: scroll;
            overflow-x: hidden;
            .group {
                margin-bottom: 8px;
                .group-label {
                    font-size: 12px;
                    padding: 4px;
                    box-sizing: border-box;
                }
                .group-list {
                    .menu-item {
                        display: flex;
                        align-items: center;
                        padding: 2px 6px;
                        box-sizing: border-box;
                        cursor: pointer;
                        border-radius: 4px;
                        .menu-item-icon {
                            margin-right: 6px;
                        }
                        .menu-item-label {
                            font-size: 14px;
                            font-weight: 400;
                        }
                    }
                    .menu-item:hover {
                        background-color: var(--el-menu-hover-bg-color);
                    }
                    .menu-item.active {
                        color: var(--el-menu-text-color);
                        background-color: var(--el-fill-color);
                        .menu-item-label {
                            font-weight: 800;
                        }
                    }
                }
            }
        }
        .footer {
            padding: 8px 8px 0 8px;
            box-sizing: border-box;
            .btn-item {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 6px;
                box-sizing: border-box;
                border: 1px solid var(--el-border-color);
                border-radius: 4px;
                background-color: var(--el-bg-color-card);
                margin-bottom: 6px;
                .label {
                    font-size: 12px;
                }
            }
            .el-button {
                width: 100%;
            }
        }
    }
    .content {
        background-color: var(--el-bg-color-card);
        .header {
            height: 40px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            box-sizing: border-box;
            font-size: 16px;
            font-weight: 800;
            border-bottom: 1px solid var(--el-border-color-lighter);
        }
        .content-wrapper {
            height: calc(100% - 40px);
            overflow-x: hidden;
            overflow-y: scroll;
            padding: 16px;
            box-sizing: border-box;
        }
    }
}
</style>