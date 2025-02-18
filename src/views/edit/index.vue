<template>
    <div class="editor-wrapper" :class="{ 'collapsePanel': store.state.workspace?.editor?.panel?.collapse }">
        <div class="editor">
            <div v-if="loadingGetData">
                Loading...
            </div>
            <Doc v-else-if="fileShowType === 'document'" v-model:data="itemData" @change="onItemUpdate" />
            <div v-else class="test">
                <pre>
                    <code>{{ itemData }}</code>
                </pre>
            </div>
        </div>
        <div class="panel">
            <Panel :type="fileShowType" :data="itemData" />
        </div>
        <OperationsBar v-if="store.state.workspace?.editor?.panel?.collapse" class="bar operations-bar"
            :type="fileShowType" :data="itemData" />
    </div>
</template>
<script setup>
import { ref, onMounted, reactive, onBeforeUnmount, onBeforeMount, watch } from 'vue';
import bus from '@/utils/bus';
import zApi from '@/core';
import store from '@/store';
import { cellDataFormat } from '@/core/utils/format';
import { useRouter, useRoute } from 'vue-router';
import OperationsBar from '@/editor/bar/operations.vue';
import Panel from '@/editor/panel/index.vue';
import Doc from '@/editor/document/index.vue';
import { ElMessage } from 'element-plus';
import { debounce } from '@/utils/tools';

const router = useRouter();
const route = useRoute();

const itemData = ref(null); // 项目数据
const fileShowType = ref(route.query.type || 'document');

// 获取项目数据
const loadingGetData = ref(false);
const paramsGet = reactive({
    cid: route.query?.cid,
    source: route.query?.source,
})
const getItemData = async () => {
    loadingGetData.value = true;
    let res = null;
    if (route.query.cid) {
        paramsGet.cid = route.query.cid;
        res = await zApi.cells.getCell(paramsGet);
        itemData.value = cellDataFormat(res?.data);
    } else {
        res = cellDataFormat({});
        itemData.value = res;
    }
    loadingGetData.value = false;
    // console.log('获取项目数据', JSON.parse(JSON.stringify(itemData.value)));
    onShowTypeChange(route.query?.type || itemData.value?.type);
    bus.emit('itemDataChanged', itemData.value);
}

// 保存数据
const loadingSave = ref(false);
const saveItem = async () => {
    if (loadingSave.value) return
    if (!itemData.value) return
    store.state.itemSaveStatus = 'saving';
    let res = null;
    loadingSave.value = true;
    try {
        if (!route.query.cid || route.query.cid === 'new') {
            // 如果是新项目
            res = await zApi.cells.addCell(itemData.value);
            if (res?.data) {
                itemData.value.cid = res.data;
                changeQuery(itemData.value.cid, itemData.value?.type);
            }
            if (store.state.breadcrumbs?.length > 0) {
                const sourceId = store.state.breadcrumbs[store.state.breadcrumbs.length - 1]?.cid;
                zApi.cells.connectCells({
                    sourceId,
                    targetId: itemData.value.cid,
                })
            }
        } else {
            // 如果是更新
            // console.log('准备更新数据', itemData.value)
            res = await zApi.cells.updateCell(itemData.value);
        }
        store.state.itemSaveStatus = 'saved';
    } catch (e) {}
    loadingSave.value = false;
    // console.log('保存数据', res)
    if (res.success) {
        bus.emit('cells-changed', { cid: itemData.value.cid, name: itemData.value.name, type: itemData.value.type });
    } else {
        ElMessage({
            message: '保存失败',
            type: 'error'
        })
    }
}
const save = debounce(saveItem, 1000);

// 更新路由参数
const changeQuery = (cid, type) => {
    let routeData = {
        path: '/edit',
        query: {}
    }
    routeData.query = JSON.parse(JSON.stringify(route.query));
    if (cid) {
        routeData.query.cid = cid;
    }
    routeData.query.type = type || 'document';
    router.replace(routeData);
}
// 当显示类型变化
const onShowTypeChange = (type) => {
    fileShowType.value = type;
    if (itemData.value?.cid) {
        itemData.value.type = type;
    }
    changeQuery(null, type);
}

let isFirstLoad = true;
// 当项目数据更新
const onItemUpdate = (val) => {
    itemData.value = val;
    if (!isFirstLoad) {
        store.state.itemSaveStatus = 'unsaved';
        save();
    } else {
        isFirstLoad = false;
    }
}

// 监听路由，每次修改路由都重新获取一次数据
watch(() => router.currentRoute.value.query?.cid, (newValue, oldValue) => {
    // console.log('route change======',router.currentRoute.value.query)
    // 如果是切换或离开此页，则先保存之前的数据，然后再获取新数据

    // 获取新数据
    getItemData();
}, { immediate: true })

onBeforeMount(() => {
    fileShowType.value = route.query.type || 'document';
})
onMounted(() => {
    store.state.itemSaveStatus = 'saved';
    bus.on('saveItem', function () {
        saveItem();
    })
    bus.on('previewItem', () => {

    })
})
onBeforeUnmount(() => {
    itemData.value = null;
    bus.off('saveItem');
    bus.off('changeShowType');
    bus.off('previewItem');
})

</script>
<style lang="scss" scoped>
.editor-wrapper {
    height: calc(100% - 8px);
    background-color: var(--el-bg-color-card);
    border-radius: 8px;
    margin: 0 8px 8px 8px;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: row;

    .editor {
        flex-grow: 1;
        max-width: calc(100% - 260px);
        transition: max-width 0.3s ease;
        overflow: auto;
    }

    .panel {
        width: 260px;
        height: 100%;
        transition: width 0.3s ease;
        border-left: 0.6px solid var(--el-border-color-lighter);
        position: relative;
        background-color: var(--el-bg-color-card);
        box-sizing: border-box;
    }

    .operations-bar {
        position: absolute;
        right: 8px;
        top: 24px;
        // top: 50%;
        // transform: translateY(-50%);
        opacity: 0.6;
        z-index: 999;
    }

    .operations-bar:hover {
        opacity: 1;
        box-shadow: var(--el-box-shadow-light);
    }

    .test {
        height: 100%;
        overflow: auto;
    }
}

.editor-wrapper.collapsePanel {
    .editor {
        max-width: 100%;
    }

    .panel {
        width: 0;
        border-left: none;
    }
}
</style>