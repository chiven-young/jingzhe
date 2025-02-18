<template>
    <div class="modal-editor">
        <el-dialog v-model="editDialogVisible" title="编辑" width="800" modal-class="editor-modal" :show-close="false" destroy-on-close>
            <template #header="{ close, titleId }">
                <div class="model-header">
                    <h4 :id="titleId">编辑</h4>
                    <div class="operate">
                        <el-button type="primary" size="small" round @click="saveCell">保存</el-button>
                        <el-dropdown @command="handleCommand">
                            <div class="btn icon text square">
                                <Icon icon="MoreVertRound" size="18" />
                            </div>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <!-- <el-dropdown-item v-if="currentCell?.status > 0" command="open"
                                    :disabled="currentCell?.status === 4">公开</el-dropdown-item> -->
                                    <el-dropdown-item v-if="currentCell?.groupName !== 'CONTENT'"
                                        command="formal">转为正式文档</el-dropdown-item>
                                    <el-dropdown-item v-if="currentCell?.status > 0"
                                        command="delete">移到废纸篓</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <div class="btn icon text square" @click="editDialogVisible = false">
                            <Icon icon="CloseRound" size="18" />
                        </div>
                    </div>
                </div>
            </template>
            <div class="edit-content">
                <Edit v-model:data="currentCell" @close="editDialogVisible = false" />
            </div>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import Edit from './cell-edit.vue';
import Bus from '@/utils/bus';
import zApi from '@/core';
import { ElMessage } from 'element-plus'

const emit = defineEmits(['changeStatus', 'update']);

const editDialogVisible = ref(false);
const currentCell = ref({});

const saveCell = async () => {
    const res = await zApi.cells.updateCell(currentCell.value)
    if (res?.success) {
        ElMessage({
            message: '已保存',
            type: 'success'
        })
        emit('update');
    } else {
        ElMessage({
            message: '保存失败',
            type: 'error'
        })
    }
}
// 修改细胞状态
const changeCellStatus = async (status) => {
    const res = await zApi.cells.updateCell({
        cid: currentCell.value?.cid,
        status: status,
    })
    if (res?.success) {
        ElMessage({
            message: '操作成功',
            type: 'success'
        })
        emit('changeStatus', currentCell.value?.cid, status);
    } else {
        ElMessage({
            message: '操作失败',
            type: 'error'
        })
    }
}
// 修改细胞分组
const changeCellGroup = async (groupName) => {
    const res = await zApi.cells.updateCell({
        cid: currentCell.value?.cid,
        groupName: groupName
    })
    if (res?.success) {
        emit('update');
        ElMessage({
            message: '操作成功',
            type: 'success'
        })
    } else {
        ElMessage({
            message: '操作失败',
            type: 'error'
        })
    }
}

const handleCommand = (command) => {
    if (command === 'formal') {
        changeCellGroup('CONTENT');
        editDialogVisible.value = false;
    } else if (command === 'delete') {
        changeCellStatus(0);
        editDialogVisible.value = false;
    } else if (command === 'restore') {
        changeCellStatus(2);
    } else if (command === 'template') {
        changeCellGroup('TEMPLATE');
    } else if (command === 'open') {
        changeCellStatus(4);
    } else if (command === 'remove') {
        emit('remove', currentCell.value?.cid);
        editDialogVisible.value = false;
    }
}

onMounted(() => {
    Bus.on('editCellByModel', (cell) => {
        currentCell.value = cell;
        editDialogVisible.value = true;
    })
    Bus.on('closeModelEditor', () => {
        editDialogVisible.value = false;
    })
})
</script>
<style lang="scss" scoped>
.model-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px 0 32px;
    .operate {
        display: flex;
        align-items: center;
        .btn {
            margin: 0 8px;
        }
    }
}
:deep(.editor-modal) {
    .el-dialog {
        border-radius: 16px;
        overflow: hidden;
        padding: 0;
    }
    .edit-content {
        padding: 32px;
        box-sizing: border-box;
    }
    .el-dialog__header {
        // display: none;
        padding-bottom: 0;
    }
    // .el-dialog__body {
    //     padding: 16px;
    // }
}
</style>