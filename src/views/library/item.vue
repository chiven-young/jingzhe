<template>
    <div class="cell-item" :class="[ showType, { 'hover': isHover } ]" :data-id="data?.cid" ref="cellItemRef">
        <div class="z-card wrapper" draggable="true" @dragstart="onDragStart">
            <div v-if="data.type === 'folder'" class="info">
                <div class="preview-cover" @click="goToPage(data)">
                    <div class="preview-content">
                        <Icon class="icon" icon="FolderOpenRound" size="26" />
                        <div class="title">{{ data?.name || '未命名' }}</div>
                    </div>
                </div>
            </div>
            <div v-else class="info" @click="goToPage(data)">
                <div v-if="data?.cover?.length || showType === 'list'" class="cover">
                    <div class="cover-wrapper">
                        <span v-if="data?.encrypted">已加密</span>
                        <img v-if="data?.cover[0]?.thumbnail || data?.cover[0]?.image" :src="data?.cover[0]?.thumbnail || data?.cover[0]?.image" draggable="false" />
                    </div>
                </div>
                <div class="base">
                    <div class="title">
                        <span class="text" @click="goToPage(data)">
                            <Icon class="star" v-if="isStar" icon="StarRound" size="24" color="#FAE24C" />
                            {{ data?.name || '未命名' }}
                        </span>
                    </div>
                    <div class="desc">{{ data?.description }}</div>
                </div>
                <div class="extra-info">
                    <Icon v-if="data.source !== 'TPT'" class="icon" icon="CloudOffRound" size="14" />
                    <span v-if="data?.updateTime" class="date">更新于{{ moment(data.updateTime).format("MM月DD日 HH:mm") }}</span>
                    <span v-else-if="data?.createTime" class="date">创建于{{ moment(data.createTime).format("MM月DD日 HH:mm") }}</span>
                </div>
            </div>
            <el-dropdown class="options-btn" @command="handleCommand">
                <div class="btn square quaternary">
                    <Icon icon="MoreVertRound" size="18" />
                </div>
                <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-if="data.status > 0" command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item v-if="data.groupName !== 'TEMPLATE' && data.type !== 'folder' && data.status > 0" command="star">{{ isStar ? '取消收藏' : '收藏' }}</el-dropdown-item>
                    <el-dropdown-item v-if="data.groupName !== 'TEMPLATE' && data.status > 0 && data.type !== 'folder'" command="template">保存为模板</el-dropdown-item>
                    <el-dropdown-item v-if="data.groupName !== 'TEMPLATE' && data.status > 0 && data.type !== 'folder'" command="open" :disabled="data.status === 4">发布</el-dropdown-item>
                    <el-dropdown-item v-if="data.status === 4" command="copyOpenLink">复制发布链接</el-dropdown-item>
                    <el-dropdown-item v-if="data.status === 0" command="restore">恢复</el-dropdown-item>
                    <template v-else>
                        <!-- <el-dropdown-item v-if="data.type === 'folder'" command="deleteAndReleaseChildren">删除并释放内部文件</el-dropdown-item>
                        <el-dropdown-item v-if="data.type === 'folder'" command="deleteAndDeleteChildren">删除并删除内部文件</el-dropdown-item> -->
                        <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </template>
                    <el-dropdown-item v-if="data.status === 0" command="remove">彻底删除</el-dropdown-item>
                </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import moment from 'moment';
import { copyText } from '@/core/utils/tools';

const baseStaticUrl = import.meta.env.VITE_STATIC_BASE_URL;

const props = defineProps({
    data: Object, // 细胞数据
    isStar: Boolean, // 是否已被收藏
    showType: String, // 显示类型（卡片、网格）
})
const emit = defineEmits(['changeStatus', 'update:isStar', 'toggleStar', 'saveAsTemplate', 'action', 'connect']);

const cellItemRef = ref(null);
const isHover = ref(false);

const handleCommand = (command) => {
    if (command === 'edit') {
        emit('action', props.data, 'edit');
    } else if (command === 'star') {
        emit('toggleStar', props.data?.cid);
        if (props.isStar) {
            emit('update:isStar', false)
        } else {
            emit('update:isStar', true)
        }
    } else if (command === 'delete') {
        emit('changeStatus', props.data?.cid, 0)
    } else if (command === 'restore') {
        emit('changeStatus', props.data?.cid, 2)
    } else if (command === 'template') {
        emit('saveAsTemplate', props.data)
    } else if (command === 'open') {
        emit('changeStatus', props.data?.cid, 4)
    } else if (command === 'copyOpenLink') {
        let url = `${baseStaticUrl}/apps/rainwater/#/post?cid=${props.data?.cid}`;
        copyText(url);
    } else if (command === 'remove') {
        emit('remove', props.data?.cid)
    }
}
const goToPage = (cell)=> {
    if(cell.status === 0) return
    if (cell.type === 'folder') {
        emit('action', cell, 'open');
    } else {
        emit('action', cell, 'edit');
    }
}

const onDragStart = (event) => {
    event.dataTransfer.setData('text/plain', props.data?.cid);
    console.log('drag start', props.data?.cid);
}
const listenDrop = async () => {
    cellItemRef.value.addEventListener('dragover', (event) => {
        event.preventDefault();
        isHover.value = true;
    })
    cellItemRef.value.addEventListener('dragleave', (event) => {
        event.preventDefault();
        isHover.value = false;
    })
    cellItemRef.value.addEventListener('drop', (event) => {
        event.preventDefault();
        isHover.value = false;
        const data = event.dataTransfer.getData("text/plain");
        console.log('drop from', data, 'to', props.data?.cid);
        if (data === props.data?.cid) return
        emit('connect', JSON.stringify({
            targetId: data,
            sourceId: props.data?.cid
        }));
    })
}

onMounted( async () => {
    if (props.data.type === 'folder') {
        listenDrop();
    }
})
</script>
<style lang="scss" scoped>
.cell-item {

    .wrapper {
        overflow: hidden;
        position: relative;
        height: 100%;
        .options-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
            visibility: hidden;
        }

        .info {
            width: 100%;
            height: 100%;
            min-height: 60px;
            display: flex;
            flex-direction: column;
            .cover {
                width: 100%;
                padding-bottom: 75%;
                display: block;
                border-radius: 4px;
                overflow: hidden;
                position: relative;
                background-color: var(--el-bg-color-page);
                cursor: pointer;

                .cover-wrapper {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;

                    img {
                        height: 100%;
                        width: 100%;
                        -webkit-transition: all .5s;
                        transition: all .5s;
                    }
                }

                .cover-wrapper:hover img {
                    -webkit-transform: scale(1.1);
                    transform: scale(1.1);
                }
            }
        }
        .base {
            padding: 3px 2px;
            box-sizing: border-box;
            width: 100%;
            color: var(--el-text-color-primary);
            flex-grow: 1;
            .title {
                font-size: 16px;
                font-weight: 700;
                display: flex;
                align-items: center;
                padding-right: 30px;
                box-sizing: border-box;
                .text {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .star {
                    vertical-align: text-bottom;
                }
            }
            .desc {
                font-size: 12px;
            }
        }
        .extra-info {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
            line-height: 1;
            span, .icon {
                margin-right: 4px;
                vertical-align: middle;
            }
        }
        .preview-cover {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            .preview-content {
                text-align: center;
                color: var(--el-text-color-primary);
                .title {
                    font-size: 16px;
                    font-weight: 700;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
    .wrapper:hover {
        .options-btn {
            visibility: visible;
        }
    }
}
.cell-item.list {
    margin-bottom: 8px;
    .wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .info {
            display: grid;
            grid-template-columns: 100px 1fr;
            grid-template-rows: 24px 1fr;
            gap: 10px;
            width: 100%;
            .cover {
                grid-row: 1 / 3;
                grid-column: 1 / 2;
                display: inline-block;
                width: 100px;
                padding-bottom: 75%;
                display: block;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                cursor: pointer;
            }
            .base {
                grid-row: 1 / 2;
                grid-column: 2 / 3;
            }
            .extra-info {
                grid-row: 2 / 3;
                grid-column: 2 / 3;
            }
        }
    }
}
.cell-item.hover {
    .wrapper {
        outline: 2px solid var(--el-color-primary);
    }
}
</style>