<template>
    <div class="library-body no-select" @contextmenu.prevent="showMoreContextMenu">
        <!-- <div v-if="paramsCells.groupName === 'CONTENT' && libraryParams?.page !== 'deleted'" class="tabs">
            <div :class="{ tab: true, active: !paramsCells.type }" @click="changeType('')">
                <span class="label">全部</span>
            </div>
            <div v-for="item in fileTypeOptions" :key="item?.value" :class="{ tab: true, active: paramsCells.type === item?.value }" v-show="item?.enable" @click="changeType(item.value)">
                <span class="label">{{ item?.label }}</span>
            </div>
        </div> -->
        <div class="filter"></div>
        <div v-if="cellsList.length" class="item-list" :class="[ showType ]">
            <Item v-for="(item, index) in cellsList" :key="index" class="item" :data="item" :showType="showType" v-model:isStar="item.isStar" :isCut="store.state.clipBoard?.cid === item?.cid" @toggleStar="toggleStar" @changeStatus="changeCellStatus" @remove="removeCell" @saveAsTemplate="saveAsTemplate" @connect="onConnectCells" @action="onCellAction" @showContextMenu="showContextMenu" />
            <!-- <div v-if="libraryParams?.page !== 'deleted'" class="new-btn" @click="router.push({ path: '/edit' })">
                <div class="blank">
                    <Icon class="icon" icon="AddRound" size="28" />
                </div>
            </div> -->
        </div>
        <div v-else class="skeleton item-list" :class="[showType]">
            <div v-for="i in pageData.skeletonCount" :key="i" class="item"></div>
            <div class="empty">
                <div class="text">这是空的</div>
            </div>
        </div>
        <!-- <div class="pagination">
            <el-pagination v-model:current-page="paramsCells.page" v-model:page-size="paramsCells.pageSize" small
                background layout="prev, slot, next" :total="pageData.cellsTotal" @current-change="refreshList">
                <div class="pager">{{ `${paramsCells.page} / ${Math.ceil(pageData.cellsTotal / paramsCells.pageSize)}`
                }}
                </div>
            </el-pagination>
            <el-input v-model="pageData.jumperPage" controls-position="right" size="small" />
            <el-button size="small" @click="refreshList(pageData.jumperPage)">跳转</el-button>
        </div> -->
        <contextMenu v-if="contextMenuState.show" :state="contextMenuState" :clipBoard="store.state.clipBoard" sence="library" @command="handleMenuCommand" />
        <moreMenu v-if="moreContextMenuState.show" :state="moreContextMenuState" :clipBoard="store.state.clipBoard" @command="handleMoreMenuCommand" />
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import Item from './item.vue';
import { fileTypeOptions } from '@/config/options';
import { ElMessage } from 'element-plus'
import store from '@/store';
import jingApi from '@/core';
import bus from '@/core/utils/bus';
import contextMenu from './item-context-menu.vue';
import moreMenu from './library-context-menu.vue';
import { useRouter, useRoute } from "vue-router";

const props = defineProps({
    showType: String, // 显示类型：网格、列表
    size: String, // 细胞大小
    breakpoints: Object,
    libraryParams: Object,
})

// 本地细胞状态（传入minStatus、maxStatus以范围查询）
// 0：已删除
// 1：草稿
// 2：私密
// 3：域内
// 4：公开

const router = useRouter();
const route = useRoute();
const pageData = reactive({
    loadingStatistics: false,
    loadingCells: false,
    cellsTotal: 0,
    jumperPage: 1,
    skeletonCount: 40,
})

const cellsList = ref([]);
const paramsCells = reactive({
    groupName: 'CONTENT',
    cid: '',
    uid: '',
    keywords: '',
    maxStatus: 4,
    minStatus: 2,
    type: '',
    parentIds: [],
    relationshipType: '',
    isRoot: 1,
    encrypted: '',
    startTime: '',
    endTime: '',
    showUsers: 0,
    page: 1,
    pageSize: -1,
})
const getCellsList = async () => {
    if (pageData.loadingCells) return;
    pageData.loadingCells = true;
    let res = {};
    try {
        res = await jingApi.cells.getCells(paramsCells);
    } catch (e) { }
    const list = res?.data?.list || [];
    pageData.cellsTotal = res?.data?.total || 0;
    cellsList.value = list;
    // cellsList.value = [];
    // for (const each of list) {
    //     let item = cellDataFormat(each);
    //     cellsList.value.push(item);
    // }
    pageData.loadingCells = false;
    console.log('get list', paramsCells, list);
}
// 当面包屑变化时请求当前目录下的细胞列表
const onBreadcrumbsChange = () => {
    if (store.state.breadcrumbs.length > 0) {
        paramsCells.isRoot = 0;
        const last = store.state.breadcrumbs[store.state.breadcrumbs.length - 1];
        paramsCells.parentIds = [last.cid];
    } else {
        paramsCells.isRoot = 1;
        paramsCells.parentIds = [];
    }
    if (props.libraryParams?.page === 'deleted') {
        paramsCells.isRoot = null;
    }
    paramsCells.page = 1;
    getCellsList();
}
const changeType = (val)=> {
    paramsCells.type = val;
    if (val) {
        paramsCells.isRoot = null;
    } else {
        paramsCells.isRoot = 1;
    }
    paramsCells.page = 1;
    onBreadcrumbsChange();
}
const getLibraryData = ()=> {
    paramsCells.groupName = 'CONTENT';
    paramsCells.keywords = '';
    paramsCells.minStatus = 1;
    paramsCells.maxStatus = 4;
    paramsCells.type = '';
    paramsCells.isRoot = 1;
    paramsCells.parentIds = [];
    paramsCells.relationshipType = '';
    paramsCells.page = 1;
    if (props.libraryParams?.page == 'deleted') {
        paramsCells.groupName = '';
        paramsCells.minStatus = 0;
        paramsCells.maxStatus = 0;
        paramsCells.isRoot = null;
    } else if (props.libraryParams?.page == 'index') {
        paramsCells.minStatus = 2;
    } else if (props.libraryParams?.page == 'star') {
        paramsCells.groupName = '';
        paramsCells.relationshipType = 'star';
        paramsCells.isRoot = null;
        paramsCells.minStatus = 2;
    } if (props.libraryParams?.page == 'template') {
        paramsCells.groupName = 'TEMPLATE';
    } else if (props.libraryParams?.page == 'material') {
        paramsCells.groupName = 'MATERIAL';
    } else if (props.libraryParams?.page == 'tags') {
        paramsCells.groupName = 'MANAGE';
    } else {
        paramsCells.parentIds = [];
        paramsCells.isRoot = null;
    }
    onBreadcrumbsChange();
}

// 刷新
const refreshList = (page) => {
    if (page) {
        paramsCells.page = Number(page);
    }
    onBreadcrumbsChange();
}

// 修改细胞状态
const changeCellStatus = async (cid, status) => {
    const res = await jingApi.cells.updateCell({
        cid: cid,
        status: status,
    })
    if (res?.success) {
        ElMessage({
            message: '操作成功',
            type: 'success'
        })
        bus.emit('cells-changed', { cid: cid, status: status });
    } else {
        ElMessage({
            message: '操作失败',
            type: 'error'
        })
    }
}
// 切换收藏状态
const toggleStar = async (cid) => {
    const cell = cellsList.value.find(item => item.cid == cid);
    if (cell?.isStar) {
        const res = await jingApi.cells.disconnectCellAndUser({
            cid: cid,
            type: 'star'
        })
        if (!res?.data) {
            ElMessage({
                message: '操作失败',
                type: 'error'
            })
        } else {
            getCellsList();
        }
    } else {
        const res = await jingApi.cells.connectCellAndUser({
            cid: cid,
            type: 'star'
        })
        if (!res?.data) {
            ElMessage({
                message: '操作失败',
                type: 'error'
            })
        } else {
            getCellsList();
        }
    }
}
// 删除细胞
const removeCell = async (cid) => {
    const res = await jingApi.cells.deleteCell({
        cid: cid
    });
    if (res?.success) {
        ElMessage({
            message: '删除成功',
            type: 'success'
        })
        getCellsList();
        bus.emit('cells-changed', { cid: cid, remove: true });
    } else {
        ElMessage({
            message: '删除失败',
            type: 'error'
        })
    }
}
// 保存为模板
const saveAsTemplate = async (data) => {
    const params = {
        ...data,
        cid: null,
        groupName: 'TEMPLATE',
        status: 1
    }
    const res = await jingApi.cells.addCell(params);
    if (res?.success) {
        ElMessage({
            message: '保存成功',
            type: 'success'
        })
    } else {
        ElMessage({
            message: '保存失败',
            type: 'error'
        })
    }
}
const onConnectCells = async (data) => {
    const params = JSON.parse(data);
    const res = await jingApi.cells.connectCells(params);
    if (res?.success) {
        ElMessage({
            message: '操作成功',
            type: 'success'
        })
        getCellsList();
        bus.emit('cells-changed', { cid: params?.sourceId });
    } else {
        ElMessage({
            message: '操作失败',
            type: 'error'
        })
    }
}

// 细胞动作
const onCellAction = async (cell, action) => {
    if (action === 'open') {
        store.state.breadcrumbs.push({
            name: cell.name,
            cid: cell.cid,
        })
        const breadcrumbs = store.state.breadcrumbs.map(item => item.cid);
        router.push({
            path: `/library/${route.params.page || 'index'}/${breadcrumbs.join('/')}`,
        });
    } else if (action === 'edit') {
        if (cell?.type === 'folder') {
            bus.emit('showFolderModal', cell);
        } else {
            router.push({
                path: '/edit',
                query: {
                    cid: cell?.cid,
                    type: cell?.type,
                }
            })
        }
    }
}


// 节点右键
const contextMenuState = reactive({
    show: false,
    top: 0,
    left: 0,
    node: null,
})
const showContextMenu = (event, data) => {
    event.stopPropagation(); 
    closeMoreContextMenu();
    if (!data?.cid) return
    event.preventDefault(); // 禁用浏览器默认右键菜单
    contextMenuState.show = true;
    contextMenuState.top = event.clientY;
    contextMenuState.left = event.clientX;
    contextMenuState.node = data;
    // console.log('右键', event, data, node, contextMenuState)
    // 点击页面其他地方关闭菜单
    document.addEventListener('click', closeContextMenu);
}
// 关闭右键菜单
const closeContextMenu = () => {
    contextMenuState.show = false;
    document.removeEventListener('click', closeContextMenu);
}
const handleMenuCommand = (command) => {
    console.log('command', command)
    if (command === 'open' || command === 'edit') {
        onCellAction(contextMenuState.node, command);
    } else if (command === 'star' || command === 'unStar') {
        toggleStar(contextMenuState.node?.cid);
    } else if (command === 'delete') {
        changeCellStatus(contextMenuState.node?.cid, 0);
    } else if (command === 'restore') {
        changeCellStatus(contextMenuState.node?.cid, 2);
    } else if (command === 'remove') {
        removeCell(contextMenuState.node?.cid);
    } else if (command === 'template') {
        saveAsTemplate(contextMenuState.node);
    } else if (command === 'cut') {
        store.state.clipBoard = contextMenuState.node;
        const list = JSON.parse(JSON.stringify(store.state.breadcrumbs));
        let parentId = null;
        if (list.length > 0) {
            parentId = list[list.length - 1].cid;
        }
        store.state.clipBoard.parentId = parentId;
    } else if (command === 'clone') {
        
    }
}
// 库右键
const moreContextMenuState = reactive({
    show: false,
    top: 0,
    left: 0,
    folder: null,
})
const showMoreContextMenu = (event) => {
    event.preventDefault(); // 禁用浏览器默认右键菜单
    closeContextMenu();
    moreContextMenuState.show = true;
    moreContextMenuState.top = event.clientY;
    moreContextMenuState.left = event.clientX;
    moreContextMenuState.folder = JSON.parse(JSON.stringify(store.state.breadcrumbs));
    // console.log('右键', event, moreContextMenuState)
    // 点击页面其他地方关闭菜单
    document.addEventListener('click', closeMoreContextMenu);
}
const closeMoreContextMenu = () => {
    moreContextMenuState.show = false;
    document.removeEventListener('click', closeMoreContextMenu);
}
const handleMoreMenuCommand = async (command) => {
    console.log(command)
    if (command === 'paste') {
        console.log('粘贴', store.state.clipBoard, store.state.breadcrumbs);
        if (!store.state.clipBoard?.cid) return;
        let thisFolderId = null;
        if (store.state.breadcrumbs.length > 0) {
            thisFolderId = store.state.breadcrumbs[store.state.breadcrumbs.length - 1]?.cid;
        }
        if (thisFolderId === store.state.clipBoard.parentId) {
            store.state.clipBoard = null;
            return
        }
        const res = await jingApi.cells.moveCell(store.state.clipBoard?.cid, store.state.clipBoard?.parentId, thisFolderId);
        if (res?.success) {
            getCellsList();
            bus.emit('cells-changed', { cid: store.state.clipBoard?.parentId });
            bus.emit('cells-changed', { cid: thisFolderId });
            store.state.clipBoard = null;
        } else {
            ElMessage({
                message: '操作失败',
                type: 'error'
            })
        }
    } else if (command === 'folder') {
        bus.emit('showFolderModal', null);
    } else if (command === 'document') {
        router.push({
            path: '/edit',
            query: {
                type: 'document'
            }
        })
    }
}


watch(() => props.libraryParams, (newValue, oldValue) => {
    console.log('library change======', props.libraryParams?.page)
    paramsCells.parentIds = [];
    if (props.libraryParams?.page) {
        getLibraryData();
    }
}, { deep: true })

const addNew = () => {
    if (props.libraryParams?.page == 'tags') {
        //
    } else {
        //
    }
}

onMounted( async () => {
    bus.on('cells-changed', getLibraryData);
    bus.on('workspace-switched', getLibraryData);
    paramsCells.uid = store.state.workspace?.user?.uid || '';
    // getLibraryData();
})
onUnmounted(() => {
    bus.off('cells-changed', getLibraryData);
    bus.off('workspace-switched', getLibraryData);
})
</script>
<style lang="scss" scoped>
.library-body {
    height: 100%;
    display: flex;
    flex-direction: column;
    .tabs {
        padding: 0 20px 8px 20px;
        .tab {
            display: inline-flex;
            align-items: center;
            margin-right: 8px;
            padding: 2px 16px;
            border-radius: 6px;
            cursor: pointer;
            .label {
                font-size: 14px;
                font-weight: 400;
                color: var(--el-text-color-regular);
            }
        }
        .tab.active {
            background-color: var(--el-color-info-light-8);
            .label {
                color: var(--el-text-color-primary);
                font-weight: 700;
            }
        }
    }
    .pagination {
        padding: 4px 8px;
        box-sizing: border-box;
        width: fit-content;
        margin: 0 0 0 auto;
        display: flex;
        align-items: center;
    }
    .item-list {
        flex-grow: 1;
        padding: 8px 20px 16px 20px;
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-y: scroll;
        .new-btn {
            position: relative;
            .blank {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding-bottom: 75%;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                cursor: pointer;
                border: 1px solid var(--el-border-color);
                .icon {
                    opacity: 0.4;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
    }
    .item-list.grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        // grid-auto-rows: 224px;
        grid-auto-rows: min-content;
        grid-column-gap: 16px;
        grid-row-gap: 16px;
        .item {
            // height: 224px;
            height: 100%;
            min-height: 160px;
        }
    }
    .item-list.list {
        width: 100%;
        .new-btn {
            display: none;
        }
    }
    .skeleton {
        overflow: hidden;
        position: relative;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
        mask-size: 100% 100%;
        mask-repeat: no-repeat;
        -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
        -webkit-mask-size: 100% 100%;
        -webkit-mask-repeat: no-repeat;

        .item {
            background-color: var(--bg-content-color);
            min-height: 160px;
        }

        .empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            .text {
                font-size: 13px;
                color: var(--text-color-2);
            }
        }
    }
}
</style>