<template>
    <div class="share-dialog">
        <el-dialog
            v-model="showDialog"
            title="分享"
            width="400"
            modal-class="share-modal"
            destroy-on-close
        >
            <div class="wrapper">
                <div class="url">{{ shareUrl }}</div>
                <el-button type="primary" @click="copyText(shareUrl)">复制链接</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import bus from '@/core/utils/bus';
import { copyText } from '@/core/utils/tools';

const baseStaticUrl = import.meta.env.VITE_STATIC_BASE_URL;

const showDialog = ref(false);
const itemData = ref({});

const shareUrl = computed(() => {
    let url = `${baseStaticUrl}/apps/rainwater/#/post?cid=${itemData.value?.cid}`;
    return url
})
onMounted(()=> {
    bus.on('share-item-start', function (data) {
        showDialog.value = true;
        itemData.value = data;
    })
})
</script>
<style lang="scss" scoped>
:deep(.share-modal) {
    .el-dialog {
        border-radius: 8px;
        overflow: hidden;
    }
    // .el-dialog__header {
    //     display: none;
    // }
    // .el-dialog__body {
    //     padding: 0;
    // }
}
</style>