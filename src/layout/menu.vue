<template>
    <div class="menu no-select">
        <WorkspaceBar />
        <div class="items">
            <!-- <div class="tabs">
                <div v-for="item in menuBarTabs" :key="item?.value" :title="item?.label"
                    :class="{ tab: true, active: activeTab?.value === item?.value }" @click="changeTab(item)">
                    <Icon :icon="item?.icon" size="16" />
                </div>
            </div> -->
            <div v-show="activeTab?.value === 'item'" class="menu-content menu-list">
                <!-- <div :class="{ item: true, active: activeMenuItem === '/library/index' }" @click="changeMenuItem('/library/index')">
                    <Icon v-if="activeMenuItem === '/library/index'" icon="LibraryBooksFilled" size="16" />
                    <Icon v-else icon="LibraryBooksOutlined" size="16" />
                    <div class="name">
                        <span>我的文档</span>
                    </div>
                </div> -->
                <div :class="{ item: true, active: activeMenuItem === '/' }"
                    @click="changeMenuItem('/')">
                    <Icon v-if="activeMenuItem === '/library/index'" icon="AssistantPhotoFilled" size="16" />
                    <Icon v-else icon="AssistantPhotoOutlined" size="16" />
                    <div class="name">
                        <span>开始</span>
                    </div>
                </div>
                <div v-if="menuConfig?.stars" :class="{ item: true, active: activeMenuItem === '/library/star' }"
                    @click="changeMenuItem('/library/star')">
                    <Icon v-if="activeMenuItem === '/library/star'" icon="StarOutlined" size="16" />
                    <Icon v-else icon="StarOutlineRound" size="16" />
                    <div class="name">
                        <span>收藏</span>
                    </div>
                </div>
                <div v-if="menuConfig?.material" :class="{ item: true, active: activeMenuItem === '/library/material' }"
                    @click="changeMenuItem('/library/material')">
                    <Icon v-if="activeMenuItem === '/library/material'" icon="InboxFilled" size="16" />
                    <Icon v-else icon="InboxOutlined" size="16" />
                    <div class="name">
                        <span>素材库</span>
                    </div>
                </div>
                <!-- <div v-if="menuConfig?.tags" :class="{ item: true, active: activeMenuItem === '/library/tags' }" @click="changeMenuItem('/library/tags')">
                    <Icon v-if="activeMenuItem === '/library/tags'" icon="DiscountRound" size="16" />
                    <Icon v-else icon="DiscountOutlined" size="16" />
                    <div class="name">
                        <span>标签</span>
                        <div class="btns" @click="(event) => event.stopPropagation()">
                            <Icon icon="AddRound" size="16" />
                            <Icon icon="ArrowDropDownRound" size="16" @click="state.showTagsTree = !state.showTagsTree" />
                        </div>
                    </div>
                </div> -->
                <div v-if="menuConfig?.myTemplates"
                    :class="{ item: true, active: activeMenuItem === '/library/template' }"
                    @click="changeMenuItem('/library/template')">
                    <Icon v-if="activeMenuItem === '/library/template'" icon="SubtitlesFilled" size="16" />
                    <Icon v-else icon="SubtitlesOutlined" size="16" />
                    <div class="name">
                        <span>我的模板</span>
                    </div>
                </div>
                <!-- <div :class="{ item: true, active: activeMenuItem === '/test' }" @click="changeMenuItem('/test')">
                    <Icon v-if="activeMenuItem === '/dev/0'" icon="AdminPanelSettingsRound" size="16" />
                    <Icon v-else icon="AdminPanelSettingsOutlined" size="16" />
                    <div class="name">
                        <span>Test</span>
                    </div>
                </div> -->
                <div :class="{ item: true, active: activeMenuItem === '/library/index' }"
                    @click="changeMenuItem('/library/index')">
                    <Icon v-if="activeMenuItem === '/library/index'" icon="LayersFilled" size="16" />
                    <Icon v-else icon="LayersOutlined" size="16" />
                    <div class="name">
                        <span>我的文档</span>
                        <div class="btns" @click="(event) => event.stopPropagation()">
                            <Icon icon="AddRound" size="16" @click="bus.emit('showFolderModal', null)" />
                            <Icon icon="ArrowDropDownRound" size="16"
                                @click="state.showFilesTree = !state.showFilesTree" />
                        </div>
                    </div>
                </div>
                <FileTree v-show="state.showFilesTree" />
                <!-- <div v-for="item in itemMenu" :key="item?.value" :title="item?.label"
                    :class="{ item: true, active: activeMenuItem === item?.value }" @click="changeMenuItem(item.value)">
                    <Icon v-if="activeMenuItem === item?.value" :icon="item?.highlightIcon" size="16" />
                    <Icon v-else :icon="item?.icon" size="16" />
                    <span>{{ item?.label }}</span>
                </div> -->
                <!-- <el-collapse v-model="activeCollapseNames" @change="handleCollapseChange">
                    <el-collapse-item v-if="userData?.role === 'ADMIN' || userData?.role === 'SUPER_ADMIN'" title="后台管理"
                        name="1">
                        <div v-for="item in adminMenu" :key="item?.value" :title="item?.label"
                            :class="{ item: true, active: activeMenuItem?.value === item?.value }"
                            @click="changeMenuItem(item)">
                            <Icon v-if="activeMenuItem?.value === item?.value" :icon="item?.highlightIcon" size="16" />
                            <Icon v-else :icon="item?.icon" size="16" />
                            <span>{{ item?.label }}</span>
                        </div>
                    </el-collapse-item>
                </el-collapse> -->
            </div>
        </div>
        <div class="footer">
            <div class="msgs">
                
            </div>
            <div class="menu-content menu-list">
                <div :class="{ item: true, active: activeMenuItem === '/library/deleted' }"
                    @click="changeMenuItem('/library/deleted')">
                    <Icon v-if="activeMenuItem === '/library/deleted'" icon="DeleteRound" size="16" />
                    <Icon v-else icon="DeleteOutlineRound" size="16" />
                    <div class="name">
                        <span>废纸篓</span>
                    </div>
                </div>
                <div :class="{ item: true, active: activeMenuItem === '/dev/0' }" @click="changeMenuItem('/dev/0')">
                    <Icon v-if="activeMenuItem === '/dev/0'" icon="AdminPanelSettingsRound" size="16" />
                    <Icon v-else icon="AdminPanelSettingsOutlined" size="16" />
                    <div class="name">
                        <span>开发者模式</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue';
import { menuBarTabs, itemMenu } from '@/config/options';
import WorkspaceBar from '../components/workspace-bar.vue';
import FileTree from '@/views/library/file-tree.vue';
import { useRouter, useRoute } from 'vue-router';
import zApi from '@/core';
import store from '@/store';
import bus from '@/core/utils/bus';

const props = defineProps({
    menuConfig: Object,
})

const state = reactive({
    showFilesTree: true,
    showTagsTree: false,
})

const activeTab = ref(menuBarTabs[0]);
const changeTab = (val) => {
    activeTab.value = val;
}

const router = useRouter();
const activeMenuItem = ref(itemMenu[0]);
const changeMenuItem = (val) => {
    store.state.breadcrumbs = [];
    activeMenuItem.value = val;
    router.push({
        path: val
    })
}

const addItem = (type) => {
    if (type === 'file') {
        router.push({
            path: '/edit'
        })
    }
}

const userData = ref({});

const activeCollapseNames = ref(['1']);
const handleCollapseChange = (val) => {
    sessionStorage.setItem('zhiz_active_collapse_names', JSON.stringify(val));
}
const restoreCollapseNames = () => {
    let val = ['1'];
    try {
        val = JSON.parse(sessionStorage.getItem('zhiz_active_collapse_names'));
    } catch (e) {
        console.log(e);
    }
    if (val) {
        activeCollapseNames.value = val;
    }
}

onMounted(async () => {
    // 获取当前路由
    const route = useRoute();
    // 获取当前路由的菜单项
    activeMenuItem.value = route.path;
    // restoreCollapseNames();
})

</script>
<style lang="scss" scoped>
.menu {
    padding: 8px;
    box-sizing: border-box;
    // border-radius: 8px;
    height: 100%;
    overflow: auto;
    position: relative;
    width: 200px;
    display: flex;
    flex-direction: column;

    .items {
        flex-grow: 1;
        overflow-x: overflow;
        overflow-y: scroll;

        .tabs {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: var(--el-bg-color-page);
            padding: 1px;
            border-radius: 5px;
            box-sizing: border-box;

            .tab {
                color: var(--el-text-color-secondary);
                cursor: pointer;
                padding: 4px 0;
                width: -webkit-fill-available;
                margin: 1px;
                border-radius: 4px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .tab.active {
                background-color: var(--el-bg-color);
                color: var(--el-text-color-primary);
            }
        }

        .group-label {
            font-size: 16px;
            font-weight: 800;
            color: var(--el-text-color-regular);
            margin: 16px 0 8px 0;
            padding-top: 8px;
            border-top: 1px solid var(--el-border-color-lighter);
        }
    }

    .menu-list {
        .item {
            display: flex;
            align-items: center;
            padding: 3px 8px;
            margin: 2px 0;
            box-sizing: border-box;
            border-radius: 4px;
            color: var(--el-text-color-regular);
            cursor: pointer;

            .name {
                margin-left: 6px;
                display: flex;
                flex: 1 1 0%;
                -webkit-box-align: center;
                align-items: center;
                justify-content: space-between;

                span {
                    font-size: 13px;
                    font-weight: 400;
                }

                .btns {
                    display: flex;
                    align-items: center;
                }
            }
        }

        .item.active {
            color: var(--el-text-color-primary);
            background-color: var(--el-bg-color);

            span {
                font-weight: 600;
            }
        }

        .item:hover {
            background-color: var(--el-bg-color);
        }
    }

    .footer {
        width: 100%;

        .msgs {
            padding: 4px 4px 4px 8px;
            border-bottom: 1px solid var(--el-border-color);
            .msg {
                display: flex;
                align-items: center;
                cursor: pointer;

                .icon {
                    margin-right: 4px;
                }

                .text {
                    font-size: 13px;
                    color: var(--el-text-color-regular);
                }
            }
        }
    }
}

// .menu:hover {
//     box-shadow: var(--el-box-shadow-lighter);
// }</style>