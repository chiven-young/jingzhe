<template>
    <div class="template">
        <el-dialog
            v-model="showDialog"
            title="模板"
            width="600"
            modal-class="template-modal"
        >
            <div class="wrapper">
                <div class="item" v-for="item in list" :key="item.id">{{ item }}</div>
            </div>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import bus from '@/core/utils/bus';
import zApi from '@/core';

const showDialog = ref(false);

const list = ref([]);
const getList = async () => {
    const res = await zApi.cells.getCells({
        groupName: 'TEMPLATE',
        minStatus: 1,
        maxStatus: 4,
        isRoot: null,
    });
    list.value = res.data?.list || [];
}

onMounted(()=> {
    getList();
    bus.on('showTemplateModal', function () {
        showDialog.value = true;
    })
})
</script>
<style lang="scss" scoped>
:deep(.template-modal) {
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