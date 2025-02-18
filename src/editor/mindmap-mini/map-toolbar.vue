<template>
    <div class="toolbar">
        <!-- <el-button size="small" @click="Map.goCenterView()">节点结构</el-button>
        <el-button size="small" @click="Map.goCenterView()">标签结构</el-button> -->
        <el-button size="small" @click="Map.goCenterView()">回到视图中心</el-button>
        <!-- <el-select v-model="selectTagId" multiple filterable placeholder="添加标签" size="small" @change="onSelectTag" @focus="getSelectedTags()" @blur="selectTagId = []">
            <el-option
            v-for="item in tagsList"
            :key="item.tid"
            :label="item.tagName"
            :value="item.tid"
            />
        </el-select> -->
        <!-- <el-button size="small" @click="Map.goCenterView()">以标签重绘</el-button> -->
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { Map} from './map';

const selectTagId = ref([]);
const selectedTags = ref([]);
const getSelectedTags = () => {
    selectedTags.value = Map.getNodeTags();
    selectTagId.value = [];
    for(const each of selectedTags.value){
        selectTagId.value.push(each.tid);
    }
}
const onSelectTag = (val) => {
    selectedTags.value = Map.getNodeTags();
    console.log('change',val, 'selected', selectTagId.value);
    for(const each of val){
        const tindex = selectedTags.value.findIndex(item => item.tid === each);
        if(tindex >= 0){
            // Map.removeTag(each);
        } else {
            const tag = tagsList.value.find(item => item.tid === each);
            Map.addTag(tag);
        }
        selectedTags.value = Map.getNodeTags();
    }
    for(const each of selectedTags.value){
        const index = val.findIndex(item => item === each.tid);
        if(index < 0){
            Map.removeTag(each.tid);
        }
    }
}
const tagsList = ref([
    {
        tid: 1,
        tagName: '标签1',
        color: '#90e0ef',
    },
    {
        tid: 2,
        tagName: '标签2',
        color: '#e9edc9',
    },
    {
        tid: 3,
        tagName: '标签3',
        color: '#e3d5ca',
    },
])

</script>