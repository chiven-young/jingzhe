<template>
    <div class="cell-editor">
        <!-- <div class="operate">
            <el-button type="primary" size="small" @click="saveCell">保存</el-button>
        </div> -->
        <div class="time">
            <span v-if="cellData?.createTime" class="text">创建于：{{ moment(cellData.createTime).format("YYYY/MM/DD HH:mm") }}</span>&nbsp;
            <span v-if="cellData?.createTime" class="text">更新于：{{ moment(cellData.createTime).format("YYYY/MM/DD HH:mm") }}</span>
        </div>
        <div v-if="cellData?.cid" class="content">
            <div class="covers">
                <div v-for="(item, index) in cellData?.cover || []" :key="index" class="cover">
                    <img :src="item?.image" />
                    <span class="close btn" @click="removeCover(index)">
                        <Icon icon="CloseRound" size="16" />
                    </span>
                </div>
            </div>
            <div class="item">
                <div class="label">添加封面</div>
                <el-input v-model="coverImgUrl" placeholder="图片url">
                    <template #append>
                        <el-button :disabled="!coverImgUrl" @click="addCover">添加</el-button>
                    </template>
                </el-input>
            </div>
            <div class="item">
                <div class="label">标题</div>
                <el-input v-model="cellData.name" placeholder="标题" @change="updateData" />
            </div>
            <div class="item">
                <div class="label">内容</div>
                <el-input v-model="cellData.data.text" type="textarea" :autosize="{ minRows: 6 }" placeholder="内容" @change="updateData" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { cellDataFormat } from '@/core/utils/format';
import moment from 'moment'

const props = defineProps({
    data: Object,
    useFor: String, // 用途，new新建，edit编辑
    type: String, // 类型，qnote速记，tag标签，content内容细胞
})
const emit = defineEmits(['update:data', 'close'])

const cellData = ref({
    cid: '',
    name: '',
    status: 0,
    data: {
        text: ''
    },
    cover: [],
})
const updateData = (val) => {
    emit('update:data', cellData.value);
}

const coverImgUrl = ref('');
const addCover = () => {
    if(!coverImgUrl.value){
        return
    }
    cellData.value.cover.push({
        image: coverImgUrl.value,
        thumbnail: coverImgUrl.value,
    })
    emit('update:data', cellData.value);
}
const removeCover = (index) => {
    cellData.value.cover.splice(index, 1);
    emit('update:data', cellData.value);
}

onMounted(()=> {
    console.log('edit data', props.data)
    cellData.value = cellDataFormat(props.data);
})
onBeforeUnmount(()=> {
    // saveCell();
})
</script>
<style lang="scss" scoped>
.cell-editor {
    .operate {
        margin-bottom: 16px;
    }
    .time {
        font-size: 12px;
        color: var(--el-text-color-regular);
        padding: 8px 0;
    }
    .content {
        .covers {
            width: 100%;
            .cover {
                width: 100%;
                max-height: 300px;
                overflow: hidden;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    cursor: pointer;
                    padding: 4px;
                    box-sizing: border-box;
                    background-color: var(--el-bg-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }
        .item {
            margin-bottom: 8px;
            .label {
                font-size: 12px;
            }
        }
    }
}
</style>