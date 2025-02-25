<template>
    <div class="cell-item" :class="[ showType, data.type, { 'hover': isHover, 'is-cut': isCut } ]" :data-id="data?.cid" ref="cellItemRef">
        <div v-if="data.type === 'folder'" class="folder-head"></div>
        <div class="wrapper" draggable="true" @dragstart="onDragStart" @contextmenu.prevent="showContextMenu">
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
                    <div class="title" :class="{ 'is-star': isStar }">
                        <span class="text" @click="goToPage(data)">
                            {{ data?.name || '未命名' }}
                        </span>
                    </div>
                    <!-- <div class="desc">{{ data?.description }}</div> -->
                    <div class="content">
                    <div class="content-preview markdown-preview" v-html="descText"></div>
                    </div>
                </div>
                <div class="extra-info">
                    <span v-if="data?.updateTime" class="date">更新于{{ moment(data.updateTime).format("MM月DD日 HH:mm") }}</span>
                    <span v-else-if="data?.createTime" class="date">创建于{{ moment(data.createTime).format("MM月DD日 HH:mm") }}</span>
                </div>
            </div>
            <Icon class="star" v-if="isStar" icon="StarRound" size="20" color="#FAE24C" />
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import moment from 'moment';
import marked from '@/utils/markdown';
import { copyText } from '@/core/utils/tools';

const baseStaticUrl = import.meta.env.VITE_STATIC_BASE_URL;

const props = defineProps({
    data: Object, // 细胞数据
    isStar: Boolean, // 是否已被收藏
    showType: String, // 显示类型（卡片、网格）
    isCut: Boolean,
})
const emit = defineEmits(['changeStatus', 'update:isStar', 'toggleStar', 'saveAsTemplate', 'action', 'connect', 'showContextMenu']);

const descText = computed(() => {
    const value = props.data?.description ?? ''
    return marked(value)
})

const cellItemRef = ref(null);
const isHover = ref(false);

const showContextMenu = (event) => {
    emit('showContextMenu', event, props.data);
}

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
        let url = `${baseStaticUrl}/apps/jingzhe/#/post?cid=${props.data?.cid}`;
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
    position: relative;

    .wrapper {
        overflow: hidden;
        position: relative;
        height: 100%;
        background-color: var(--bg-content-color);
        border: 1px solid var(--border-color-3);
        padding: 8px;
        border-radius: 8px;
        box-sizing: border-box;
        word-wrap: break-word;
        word-break: break-all;
        .star {
            position: absolute;
            top: 10px;
            right: 8px;
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
            height: 30px;
            overflow: hidden;
            .title {
                font-size: 14px;
                font-weight: 700;
                line-height: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                width: 100%;
                .text {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            .title.is-star {
                padding-right: 20px;
            }
            .desc {
                font-size: 12px;
            }
            .content {
                border-top: 1px solid var(--border-color-3);
                padding-top: 6px;
                margin-top: 6px;
            }
            .content-preview {
                zoom: 0.4;
                overflow: hidden;
                position: relative;
                mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
                mask-size: 100% 100%;
                mask-repeat: no-repeat;
                -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
                -webkit-mask-size: 100% 100%;
                -webkit-mask-repeat: no-repeat;
            }
        }
        .extra-info {
            font-size: 12px;
            color: var(--text-color-4);
            background-color: var(--bg-content-color);
            padding-top: 4px;
            line-height: 1;
            z-index: 9;
            span, .icon {
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
                    font-size: 14px;
                    font-weight: 700;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
    .wrapper:hover {
        box-shadow: var(--box-shadow-3);
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
.cell-item.selected {
    .wrapper {
        outline: 2px solid var(--el-color-primary);
    }
}
.cell-item.is-cut {
    opacity: 0.5;
}
.cell-item.folder {
    .folder-head {
        position: absolute;
        top: 0;
        left: 0;
        width: 50%;
        height: 50px;
        background-color: var(--bg-content-color);
        border: 1px solid var(--border-color-3);
        border-radius: 8px;
        clip-path: polygon(0 0%, 60% 0%, 100% 100%, 0 100%);
    }
    .wrapper {
        margin-top: 16px;
        height: calc(100% - 16px);
        box-shadow: 0 -6px 8px 0 rgba(6, 10, 38, .04);
    }
}
</style>