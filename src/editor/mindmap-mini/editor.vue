<template>
    <div id="map" class="map-container mindmap" @click="Map.unSelectNode">
        <div class="graph-wrapper">
            <div class="title root-node block frist alone" :class="{ selected: store.state.currentBlockData?.cid === data?.cid }"
                :id="'block-' + data?.cid">
                <div class="block-content">
                    <div class="content" :class="{ end: !data?.children?.length }" :id="'node-' + data?.cid"
                        @mousedown="Map.selectNode(data?.cid)">
                        <div v-if="!editTitle" class="name" v-on:dblclick="enterEdit()">{{ data?.name || '未命名' }}</div>
                        <el-input v-else class="input-name" ref="inputNameRef" v-model="data.name" type="textarea" autosize resize="none" @blur="endEdit" v-on:keydown.enter="enterEvent" />
                        <!-- <div v-if="data?.tags?.length" class="tags">
                                <span v-for="tag in data.tags" :key="tag?.tid" class="tag">{{ tag?.tagName || '未命名' }}</span>
                            </div> -->
                        <div class="after">
                            <div class="btn" @click="Map.addChildNode(data?.cid)">
                                <Icon class="icon" icon="AddCircleOutlineOutlined" size="18" />
                                <span class="label">新建节点</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NestedDraggable :children="store.state.currentMapData?.children" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import NestedDraggable from "./nested.vue";
import { Map, addDragable } from './map';
import { Editor } from '../method';
import store from '@/store';
import Bus from "@/utils/bus";

const props = defineProps({
    data: Object
})
const itemData = ref(null);

const editTitle = ref(false);
const inputNameRef = ref(null);
const enterEdit = () => {
    editTitle.value = true;
    setTimeout(() => {
        if(!inputNameRef.value) return
        // inputNameRef.value.focus();
        inputNameRef.value.select();
    }, 100);
}
const endEdit = () => {
    editTitle.value = false;
}
const enterEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if(inputNameRef.value){
        inputNameRef.value.blur();
    }
}

let timer = null;
// 监听思维导图数据变化，实时保存
watch(() => store.state.currentMapData, (newValue, oldValue) => {
    // 在数据变化时清除之前的定时器
    clearTimeout(timer);
    // 设置新的定时器，确保最多每秒一次触发保存操作
    timer = setTimeout(() => {
        itemData.value = store.state.currentMapData;
        console.log("已保存数据到本地", store.state.currentMapData);
    }, 1000);
}, { immediate: true, deep: true })

onMounted(() => {
    if (props.data) {
        store.state.currentMapData = props.data;
        // let res = Editor.toMap(props.data);
        // if (res) store.state.currentMapData = res;
    }
    let container = document.getElementById("map");
    addDragable(container);
    Map.goCenterView();
    Map.autoSwitchViewType('on');
    // 禁用浏览器默认按键事件
    window.addEventListener("keydown", Map.keyEvent);
    // 当项目数据获取成功时
    Bus.on('itemDataChanged', (data) => {
        itemData.value = data;
        store.state.currentMapData = data;
        // let res = Editor.toMap(data);
        // if (res) store.state.currentMapData = res;
        console.log('项目数据:', itemData.value, 'map数据:', store.state.currentMapData)
    });
})
onBeforeUnmount(() => {
    window.removeEventListener('keydown', Map.keyEvent);
})
</script>
<style lang="scss">
@import './map.scss';
.map-container {
    .title.root-node {
        .input-name {
            .el-textarea__inner {
                padding: 0;
                font-size: 20px;
                font-weight: 800;
                color: var(--el-text-color-primary);
                height: fit-content;
                width: fit-content;
                box-sizing: border-box;
                box-shadow: none;
                background: transparent;
                line-height: initial;
            }
        }
    }
}
</style>