<template>
    <Wrapper name="插入" desc="将项目拖入到文档中" :scene="scene">
        <el-collapse v-model="activeNames">
            <el-collapse-item title="建议" name="1">
                <div class="block-list">
                    <div class="block-item" v-for="item in 10" :key="item" draggable="true" @dragstart="onBlockDragetStart($event, item)">{{ item }}</div>
                </div>
            </el-collapse-item>
            <el-collapse-item title="分隔符" name="2">
                
            </el-collapse-item>
            <el-collapse-item title="媒体" name="3">
                
            </el-collapse-item>
            <el-collapse-item title="文本样式" name="4">
                
            </el-collapse-item>
        </el-collapse>
    </Wrapper>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import Wrapper from './wrapper.vue';

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    scene: String
})

const activeNames = ref(['1', '2', '3', '4']);

const onBlockDragetStart = (event, item) => {
    event.dataTransfer.setData('text/plain', item + '222');
    console.log('dragstart');
}
</script>
<style lang="scss" scoped>
.block-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 4px;
    .block-item {
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
}
</style>