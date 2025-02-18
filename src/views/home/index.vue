<template>
    <div class="page-container">
        <div class="head no-select">
            <div class="title">首页</div>
            <div class="operate btn-group">
                
            </div>
        </div>
        <libraryBody class="library" showType="grid" :libraryParams="libraryParams" />
    </div>
</template>
<script setup>
import { onMounted, reactive } from 'vue';
import libraryBody from '../library/main.vue';

const libraryParams = reactive({
    page: '',
    breadcrumbs: [],
})
onMounted(() => {
    libraryParams.page = 'home';
})
</script>

<style lang="scss" scoped>
.page-container {
    padding: 16px 10px 0 10px;
    box-sizing: border-box;
    height: 100%;

    .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding: 0 20px;

        .title {
            font-size: 20px;
            font-weight: 800;
        }
    }
    .operate {
        .btn {
            color: var(--el-text-color-secondary);
        }
        .btn.active {
            color: var(--el-text-color-primary);
        }
    }
    .library {
        height: calc(100% - 46px);
    }
}</style>