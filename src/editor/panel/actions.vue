<template>
    <Wrapper name="动作" :scene="scene">
        <el-button>保存为模板</el-button>
        <el-button>创建副本</el-button>
        <el-button>导出/下载</el-button>
        <el-button type="danger" plain>删除</el-button>
    </Wrapper>
</template>
<script setup>
import Wrapper from './wrapper.vue';

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    scene: String,
})
</script>
<style lang="scss" scoped>
.el-button {
    margin: 4px 0;
    width: 100%;
}
</style>