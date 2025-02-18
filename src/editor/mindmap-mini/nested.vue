<template>
    <draggable
    class="dragArea"
    tag="div"
    :list="children"
    :group="{ name: 'group' }"
    item-key="name"
    :animation="600"
    handle=".content"
    ghostClass="ghost"
    chosenClass="chosen"
    >
        <template #item="{ element, index }">
            <div class="block"
            :class="{ first: index === 0, last: index === children?.length - 1, alone: children?.length === 1, selected: store.state.currentBlockData?.cid === element.cid }"
            :id="'block-'+ element.cid"
            >
                <div class="block-options" :class="{ selected: checkValue }">
                    <!-- <el-button :icon="Menu" size="small" text bg /> -->
                    <!-- <el-checkbox v-model="checkValue" /> -->
                </div>
                <div class="block-content">
                    <div class="content"
                    :class="{ end: !element.children?.length }"
                    :id="'node-' + element.cid"
                    @mousedown="Map.selectNode(element.cid)"
                    >
                        <!-- <span class="type-tag">{{ element.type }}</span> -->
                        <div v-if="editingStatus.cid !== element.cid || editingStatus.key !== 'name'" class="name" v-on:dblclick="enterEdit(element.cid, 'name')">{{ element?.data?.text || '无内容' }}</div>
                        <el-input v-if="editingStatus.cid === element.cid && editingStatus.key === 'name'" class="input-name" ref="inputNameRef" v-model="element.data.text" type="textarea" autosize resize="none" @blur="endEdit" v-on:keydown.enter="enterEvent" @keydown.shift.enter="shiftEnterEvent" />
                        <!-- <el-input class="input-name" v-model="element.content.text" type="textarea" autosize resize="none"/> -->
                        <div class="tags-wrapper">
                            <!-- <tagsView :tags="element?.tags" size="small" @removetag="removeTag" /> -->
                        </div>
                        <div class="after">
                            <div class="btn" @click="Map.addChildNode(element.cid)">
                                <Icon class="icon" icon="AddCircleOutlineOutlined" size="18" />
                            </div>
                        </div>
                    </div>
                    <NestedDraggable :children="element.children" />
                </div>
            </div>
        </template>
    </draggable>
</template>
<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import draggable from "vuedraggable";
import NestedDraggable from './nested.vue';
import { Menu, ArrowDown, PriceTag } from '@element-plus/icons-vue';
// import tagsView from '../tag-selector/tags-view.vue';
import { Map } from './map';
import store from '@/store';
import Bus from "@/core/utils/bus";

const props = defineProps({
    children: {
        type: Array,
        default: () => []
    }
})

const checkValue = ref(false);

const inputNameRef = ref(null);
const editingStatus = reactive({
    cid: null,
    key: null
})
const enterEdit = (cid, key) => {
    editingStatus.cid = cid;
    editingStatus.key = key;
    if( key === 'name') {
        setTimeout(() => {
            if(!inputNameRef.value) return
            // inputNameRef.value.focus();
            inputNameRef.value.select();
        }, 100);
    }
}
const endEdit = () => {
    editingStatus.cid = null;
    editingStatus.key = null;
}
const enterEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if(inputNameRef.value){
        inputNameRef.value.blur();
    }
}
const shiftEnterEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();

}

const removeTag = (val)=> {
    // blockData.tags = val;
}
onMounted(()=> {
    Bus.on('onMapAddNode', function (node) {
        enterEdit(node.cid, 'name');
    })
})
</script>
<style lang="scss" scoped>
.block {
    input {
        border: none;
        box-shadow: none;
    }

    input:focus-visible {
        outline: none;
    }
    .input-name {
        width: fit-content;
        :deep(.el-textarea__inner) {
            padding: 0;
            font-size: 16px;
            font-weight: 800;
            line-height: 1.5;
            color: var(--el-text-color-primary);
            height: fit-content;
            width: auto !important;
            min-width: 60px;
            max-width: 100%;
            // width: 80px;
            box-sizing: border-box;
            box-shadow: none;
            background: transparent;
        }
    }
}
</style>