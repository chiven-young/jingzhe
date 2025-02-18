<template>
    <div class="add-bar">
        <div class="add-item" @click="addNew('folder')">
            <Icon class="icon" icon="FolderOpenRound" size="24" />
            <div>
                <div class="label">新建文件夹</div>
                <div class="desc">管理你的文档</div>
            </div>
        </div>
        <!-- <div class="add-item" @click="addNew('document')">
            <Icon class="icon" icon="InboxOutlined" size="24" />
            <div>
                <div class="label">新建速记</div>
                <div class="desc">记录生活</div>
            </div>
        </div> -->
        <div class="add-item" @click="addNew('document')">
            <Icon class="icon" icon="DescriptionOutlined" size="24" />
            <div>
                <div class="label">新建图文</div>
                <div class="desc">开始在新文件上书写</div>
            </div>
        </div>
        <div class="add-item" @click="addNew('mindmap')">
            <Icon class="icon" icon="DescriptionOutlined" size="24" />
            <div>
                <div class="label">新建脑图</div>
                <div class="desc">构建你的想法</div>
            </div>
        </div>
        <div class="add-item add-template" @click="bus.emit('showTemplateModal')">
            <div>
                <div class="label">模板</div>
                <div class="desc">浏览并选择模板</div>
            </div>
            <div class="temp-img">
                <img class="img-1" :src="ImgTemplate1" alt="">
                <img class="img-2" :src="ImgTemplate2" alt="">
            </div>
        </div>
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import bus from '@/core/utils/bus';
import ImgTemplate1 from '@/assets/img/img-template-1.png';
import ImgTemplate2 from '@/assets/img/img-template-2.png';

const emit = defineEmits(['select']);
const router = useRouter();

const addNew = (type) => {
    if (type === 'folder') {
        bus.emit('showFolderModal', null);
    } else if (type === 'qnote') {
        bus.emit('addNewQnote');
    } else {
        router.push({
            path: '/edit',
            query: {
                type
            }
        })
    }
    emit('select', type);
}

</script>
<style lang="scss" scoped>
.add-bar {
    .add-item {
        display: flex;
        align-items: center;
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid var(--el-border-color-light);
        background-color: rgba(128,128,128,0.07);
        border-radius: 6px;
        margin-bottom: 8px;
        cursor: pointer;
        .icon {
            margin-right: 8px;
        }
        .label {
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-primary);
        }
        .desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
        }
    }
    .add-item:last-child {
        margin-bottom: 0;
    }
    .add-template {
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        .temp-img {
            position: relative;
            width: 60px;
            height: 36px;
            img {
                width: 40px;
                position: absolute;
            }
            .img-1 {
                rotate: -10deg;
                top: 8px;
                left: 0;
            }
            .img-2 {
                rotate: 10deg;
                top: 0;
                right: 0;
            }
        }
    }
}
</style>