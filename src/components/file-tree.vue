<template>
    <div class="file-tree">
        <el-tree ref="treeRef" :data="filesTree" :expand-on-click-node="false" draggable node-key="cid" :props="defaultProps"
            highlight-current :default-expanded-keys="expandedKeys" :current-node-key="route.query?.cid" @node-drag-start="handleDragStart"
            @node-drag-enter="handleDragEnter" @node-drag-leave="handleDragLeave" @node-drag-over="handleDragOver"
            @node-drag-end="handleDragEnd" @node-drop="handleDrop" :allow-drop="canDrop" @node-click="clickNode"
            @node-contextmenu="showContextMenu" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse">
            <template #default="{ node, data }">
                <span class="tree-node">
                    <Icon v-if="data.type === 'folder'" class="icon" icon="FolderOpenRound" size="14" />
                    <Icon v-else-if="data.type === 'document'" class="icon" icon="FeedOutlined" size="14" />
                    <Icon v-else-if="data.type === 'mindmap'" class="icon" icon="SchemaOutlined" size="14" />
                    <span class="label">{{ node.label }}</span>
                </span>
            </template>
        </el-tree>
        <div class="context-menu" v-if="contextMenuState.show"
            :style="{ top: `${contextMenuState.top}px`, left: `${contextMenuState.left}px` }">
            <div class="menu-item" @click="handleMenuCommand('edit')">编辑</div>
            <!-- <div class="menu-item" v-if="!contextMenuState.node?.isStar" @click="handleMenuCommand('star')">收藏</div>
            <div class="menu-item" v-else @click="handleMenuCommand('unStar')">取消收藏</div> -->
            <template v-if="contextMenuState.node?.type === 'folder'">
                <div class="menu-item" @click="handleMenuCommand('document')">新建图文</div>
                <div class="menu-item" @click="handleMenuCommand('mindmap')">新建思维导图</div>
                <div class="menu-item" @click="handleMenuCommand('folder')">新建文件夹</div>
            </template>
            <div class="menu-item" @click="handleMenuCommand('delete')">删除</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import zApi from '@/core';
import type Node from 'element-plus/es/components/tree/src/model/node'
import type { DragEvents } from 'element-plus/es/components/tree/src/model/useDragNode'
import type {
    AllowDropType,
    NodeDropType,
} from 'element-plus/es/components/tree/src/tree.type'
import { useRouter, useRoute } from 'vue-router';
import bus from '@/core/utils/bus';
import store from '@/store';

const treeRef: any = ref(null);
const filesTree = ref([]); // 文件树
const getFilesTree = async () => {
    filesTree.value = await getList('0');
    const cid = route.query?.cid;
    if (cid) {
        setTimeout(() => {
            treeRef.value.setCurrentKey(cid, true);
        }, 100);
    }
    // console.log('filesTree', filesTree.value)
}

// 获取文件列表
const getList = async (parentId: string) => {
    let res: any = null;
    let params: any = {
        groupName: 'CONTENT',
        maxStatus: 4,
        minStatus: 1,
        isRoot: 1,
        showCorrelationChildren: 1,
        onlyLocal: true,
        page: 1,
        pageSize: -1,
    }
    if (parentId && parentId !== '0') {
        params.parentIds = [parentId];
        params.isRoot = null;
    }
    try {
        res = await zApi.cells.getCells(params)
    } catch (error) { };
    let list = res?.data?.list || [];
    return list;
}
const updateTreeById = (cid: string) => {

} 

const route = useRoute();
const router = useRouter();
const clickNode = (data: any) => {
    const breadcrumb = findBreadcrumb(filesTree.value, data.cid);
    store.state.breadcrumbs = breadcrumb;
    console.log('clickNode', data, store.state.breadcrumbs)
    if (!data.cid) return
    if (data.type === 'folder') {
        if (route.path !== '/library') {
            const breadcrumbs = store.state.breadcrumbs.map((item: any) => item.cid);
            router.push({
                path: `/library/index/${breadcrumbs.join('/')}`,
            });
        }
    } else {
        router.push({
            path: '/edit',
            query: {
                cid: data.cid
            }
        })
    }
}

// 根据cid获取当前细胞的面包屑
function findBreadcrumb(data, targetCid) {
  function helper(arr, path) {
    for (const item of arr) {
      const newPath = [...path, { cid: item.cid, name: item.name }];
      if (item.cid === targetCid) {
        return newPath;
      }
      if (item.correlationsChildren && item.correlationsChildren.length > 0) {
        const result = helper(item.correlationsChildren, newPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }
  return helper(data, []);
}
// 监听面包屑变化，更新当前节点
watch(() => store.state.breadcrumbs, (newVal: any) => {
    // console.log('watch', newVal)
    let cid = null;
    if (newVal.length > 0) {
        cid = newVal[newVal.length - 1]?.cid;
    }
    setTimeout(() => {
        treeRef.value.setCurrentKey(cid, true);
    }, 200);
}, { deep: true })

const defaultProps = {
    label: 'name',
    children: 'correlationsChildren',
    disabled: 'disabled',
}
const expandedKeys: any = ref([]);
let lastTree = [];

const handleDragStart = (node: Node, ev: DragEvents) => {
    console.log('drag start', node)
    lastTree = JSON.parse(JSON.stringify(filesTree.value));
}
const handleDragEnter = (
    draggingNode: Node,
    dropNode: Node,
    ev: DragEvents
) => {
    console.log('tree drag enter:', dropNode.label)
}
const handleDragLeave = (
    draggingNode: Node,
    dropNode: Node,
    ev: DragEvents
) => {
    console.log('tree drag leave:', dropNode.label)
}
const handleDragOver = (draggingNode: Node, dropNode: Node, ev: DragEvents) => {
    console.log('tree drag over:', dropNode.label)
}
const handleDragEnd = (
    draggingNode: Node,
    dropNode: Node,
    dropType: NodeDropType,
    ev: DragEvents
) => {
    console.log('tree drag end:', dropNode && dropNode.label, dropType)
}

// 当拖动结束时
const handleDrop = (
    draggingNode: Node,
    dropNode: Node,
    dropType: NodeDropType,
    ev: DragEvents
) => {
    // console.log('tree drop:', draggingNode.data, dropNode.data, dropType)
    if (dropType === 'before' || dropType === 'after') {
        const meRes = findNodeById({
            cid: '0',
            correlationsChildren: lastTree,
        }, draggingNode.data.cid);
        const meParent = meRes?.parent;
        const itRes = findNodeById({
            cid: '0',
            correlationsChildren: lastTree,
        }, dropNode.data.cid);
        const itParent = itRes?.parent;
        // console.log('我的节点', draggingNode.data.name, '目标节点', dropNode.data.name)
        // console.log('我的父级', meParent, '目标父级', itParent)
        if (meParent?.cid === itParent?.cid) return // 同一节点下
        if (itParent?.cid === draggingNode.data.cid) return // 不能拖拽到子节点
        // if (itParent?.type !== 'folder') return // 必须文绑定到文件夹下面
        if (itParent?.cid === '0') {
            // 如果是回到根目录，则接触我之前的关联，回到根目录
            zApi.cells.disconnectCells({
                sourceId: meParent?.cid,
                targetId: draggingNode.data.cid,
            })
            zApi.cells.updateCell({
                cid: draggingNode.data.cid,
                isRoot: 1
            })
            // console.log('回到根目录')
        } else if (itParent?.cid) {
            // 如果不是回到根目录，则移动到目标节点的同级
            zApi.cells.connectCells({
                sourceId: itParent.cid,
                targetId: draggingNode.data.cid,
            })
            // console.log('绑定父级', itParent.name)
            if (meParent?.cid === '0') {
                // 如果我曾经是顶级，则去除跟根标记
                zApi.cells.updateCell({
                    cid: draggingNode.data.cid,
                    isRoot: 0
                })
                // console.log('去除根级标记')
            } else {
                zApi.cells.disconnectCells({
                    sourceId: meParent?.cid,
                    targetId: draggingNode.data.cid,
                })
                // console.log('解除原关系')
            }
        }
        bus.emit('cells-changed', null);
    } else if (dropType === 'inner') {
        if (dropNode.data.type !== 'folder') return
        // 建立新关联
        zApi.cells.connectCells({
            sourceId: dropNode.data.cid,
            targetId: draggingNode.data.cid,
        })
        // console.log('建立新关联', dropNode.data?.name, draggingNode.data?.name)
        // 解除原关联
        const res = findNodeById({
            cid: '0',
            correlationsChildren: lastTree,
        }, draggingNode.data.cid);
        const parent = res?.parent;
        if (parent?.cid) {
            zApi.cells.disconnectCells({
                sourceId: parent.cid,
                targetId: draggingNode.data.cid,
            })
        }
        bus.emit('cells-changed', null);
        // console.log('解除原关联', res, parent)
    }
}
// 判断什么才能成为拖动目标
const canDrop = (draggingNode: Node, dropNode: Node, type: NodeDropType) => {
    if (dropNode.data.type !== 'folder') return false
    return true
}
// 根据id查询节点及其父级
const findNodeById = (obj, id) => {
    if (obj?.cid === id) {
        return {
            parent: null,
            node: obj,
        };
    }
    const correlationsChildren = obj?.correlationsChildren || [];
    if (correlationsChildren.length) {
        for (let i = 0; i < correlationsChildren.length; i++) {
            const res = findNodeById(correlationsChildren[i], id);
            if (res) {
                return {
                    parent: res?.parent || obj,
                    node: res?.node,
                };
            }
        }
    }
    return null;
};

// 节点右键
const contextMenuState: any = reactive({
    show: false,
    top: 0,
    left: 0,
    node: null,
})
const showContextMenu = (event, data, node) => {
    event.preventDefault(); // 禁用浏览器默认右键菜单
    contextMenuState.show = true;
    contextMenuState.top = event.clientY;
    contextMenuState.left = event.clientX;
    contextMenuState.node = data;
    // console.log('右键', event, data, node, contextMenuState)
    // 点击页面其他地方关闭菜单
    document.addEventListener('click', closeContextMenu);
}
// 菜单操作
const handleMenuCommand = async (command) => {
    contextMenuState.show = false; // 隐藏菜单
    document.removeEventListener('click', closeContextMenu); // 移除事件

    if (command === 'edit') {
        if (contextMenuState.node?.type === 'folder') {
            bus.emit('showFolderModal', contextMenuState.node);
        } else {
            router.push({
                path: '/edit',
                query: {
                    cid: contextMenuState.node?.cid
                }
            })
        }
    } else if (command === 'star') {
        const res = await zApi.cells.connectCellAndUser({
            cid: contextMenuState.node?.cid,
            type: 'star'
        })
        if (res?.success) {
            bus.emit('cells-changed', { cid: contextMenuState.node?.cid });
        }
    } else if (command === 'unStar') {
        const res = await zApi.cells.disconnectCellAndUser({
            cid: contextMenuState.node?.cid,
            type: 'star'
        })
        if (res?.success) {
            bus.emit('cells-changed', { cid: contextMenuState.node?.cid });
        }
    } else if (command === 'document' || command === 'mindmap' || command === 'folder') {
        let params = {
            name: '新图文',
            type: command,
            groupName: 'CONTENT',
            isRoot: 0,
            status: 2,
        }
        if (command === 'mindmap') {
            params.name = '新思维导图';
        } else if (command === 'folder') {
            params.name = '新文件夹';
        }
        // 创建新细胞
        const addRes = await zApi.cells.addCell(params);
        const cid = addRes.data;
        router.push({
            path: '/edit',
            query: {
                cid: cid
            }
        })
        // 将新细胞关联到此节点下
        const relaRes = await zApi.cells.connectCells({
            sourceId: contextMenuState.node?.cid,
            targetId: cid,
        })
        // 获取刚创建的新细胞，并push到此节点下
        const newCellRes = await zApi.cells.getCell({
            cid: cid,
        })
        const newCell = newCellRes.data;
        const nodeRes = findNodeById({
            cid: '0',
            correlationsChildren: filesTree.value,
        }, contextMenuState.node?.cid);
        if (nodeRes?.node) {
            nodeRes.node.correlationsChildren.push(newCell);
        }
        // 聚焦此节点
        setTimeout(() => {
            treeRef.value.setCurrentKey(cid);
            bus.emit('cells-changed', { cid: cid, add: true });
        }, 100);
    } else if (command === 'delete') {
        const res = await zApi.cells.deleteCell({
            cid: contextMenuState.node?.cid
        });
        if (res.success) {
            const nodeRes = findNodeById({
                cid: '0',
                correlationsChildren: filesTree.value,
            }, contextMenuState.node?.cid);
            const parent = nodeRes?.parent;
            const index = parent.correlationsChildren.findIndex(item => item.cid === contextMenuState.node?.cid);
            if (index > -1) {
                parent.correlationsChildren.splice(index, 1);
            }
            bus.emit('cells-changed', { cid: contextMenuState.node?.cid, remove: true });
        }
    }
}
// 关闭右键菜单
const closeContextMenu = () => {
    contextMenuState.show = false;
    document.removeEventListener('click', closeContextMenu);
}


// 节点展开
const onNodeExpand = async (data: any) => {
    console.log('展开', data)
    if (!expandedKeys.value.includes(data.cid)) {
        expandedKeys.value.push(data.cid);
    }
    sessionStorage.setItem('fileTreeExpandedKeys', JSON.stringify(expandedKeys.value));
    data.correlationsChildren = await getList(data.cid);
}
// 节点收起
const onNodeCollapse = (data: any) => {
    console.log('收起', data)
    const index = expandedKeys.value.indexOf(data.cid);
    if (index > -1) {
        expandedKeys.value.splice(index, 1);
    }
    sessionStorage.setItem('fileTreeExpandedKeys', JSON.stringify(expandedKeys.value));
}

onMounted(() => {
    expandedKeys.value = JSON.parse(sessionStorage.getItem('fileTreeExpandedKeys') || '[]');
    getFilesTree();
    bus.on('cells-changed', getFilesTree);
    bus.on('workspace-switched', getFilesTree);
})
onUnmounted(() => {
    bus.off('cells-changed', getFilesTree);
    bus.off('workspace-switched', getFilesTree);
})
</script>
<style lang="scss" scoped>
.el-tree {
    background-color: transparent;
}

.tree-node {
    width: 100%;
    height: 24px;
    display: flex;
    align-items: center;
    position: relative;

    .icon {
        margin-right: 2px;
    }

    .more-btn {
        position: absolute;
        top: 0;
        right: 0;
        display: none;
    }

    .btn {
        padding-left: 4px;
        padding-right: 4px;
    }

    .label {
        font-size: 13px;
        width: 159px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.tree-node:hover .more-btn {
    display: inline-flex;
}

.context-menu {
    position: fixed;
    z-index: 9999;
    padding: 4px;
    background-color: var(--el-bg-color-layout);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    min-width: 90px;
    .menu-item {
        padding: 4px 8px;
        font-size: 12px;
        color: var(--el-text-color-regular);
        cursor: pointer;
        &:hover {
            color: var(--el-text-color-primary);
            background-color: var(--el-bg-color-layout);
        }
    }
}
</style>