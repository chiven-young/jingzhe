<template>
    <div class="folder-edit">
        <el-dialog
            v-model="showDialog"
            :title="!paramsFolder.cid ? '新建文件夹' : '编辑文件夹'"
            width="300"
            modal-class="folder-modal"
            destroy-on-close
        >
            <div class="wrapper">
                <el-input v-model="paramsFolder.name" placeholder="请输入文件夹名称"></el-input>
                <el-button type="primary" @click="submit">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus.js';
import zApi from '@/core';
import store from '@/store';

const showDialog = ref(false);

const paramsFolder = ref({
    name: '',
    groupName: 'CONTENT',
    type: 'folder',
    cid: '',
    isRoot: 1,
})

const submit = async () => {
    let res = null;
    if (!paramsFolder.value.cid) {
        res = await zApi.cells.addCell(paramsFolder.value);
        if (res.success && res.data) {
            paramsFolder.value.cid = res.data;
        }
        if (store.state.breadcrumbs?.length > 0) {
            const sourceId = store.state.breadcrumbs[store.state.breadcrumbs.length - 1]?.cid;
            zApi.cells.connectCells({
                sourceId,
                targetId: paramsFolder.value.cid,
            })
        }
    } else {
        res = await zApi.cells.updateCell(paramsFolder.value);
    }
    if (res.success) {
        showDialog.value = false;
        bus.emit('cells-changed', { cid: paramsFolder.value.cid, name: paramsFolder.value.name });
    }
}
onMounted(()=> {
    bus.on('showFolderModal', function (val) {
        if (val?.cid) {
            paramsFolder.value = val;
        } else {
            paramsFolder.value = {
                name: '',
                groupName: 'CONTENT',
                type: 'folder',
                cid: '',
                isRoot: 1,
            }
        }
        showDialog.value = true;
    })
})
</script>
<style lang="scss" scoped>
:deep(.folder-modal) {
    .el-dialog {
        border-radius: 8px;
        overflow: hidden;
        background-color: var(--el-bg-color-card);
        // padding: 0;
    }
    .el-dialog__header {
        // display: none;
        font-size: 14px;
        font-weight: bold;
    }
    // .el-dialog__body {
    //     padding: 0;
    // }
}
.wrapper {
    height: 100%;
    background-color: var(--el-bg-color-card);
    display: flex;
    flex-direction: column;
    gap: 10px;
    .el-button {
        width: 100%;
    }
}
</style>