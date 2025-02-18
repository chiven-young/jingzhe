<template>
    <div class="cover-preview">
        <div class="cover-body" :class="[ 'theme-' + (coverStyle || '2'), type]" :style="{
            borderWidth: border ? '1px' : 0,
        }">
            <div class="title">{{ title || '标题' }}</div>
            <div class="desc">{{ desc }}</div>
            <div class="cover" v-if="type === 'video'" :style="{ backgroundImage: 'url(' + (cover?.length >= 2 ? cover[1]?.fileUrl : defaultImg) + ')' }">
                <img class="icon" :src="IconVideoPlay" />
            </div>
            <div class="cover" v-else>
                <div class="img" :style="{ backgroundImage: 'url(' + (cover?.length ? cover[0]?.fileUrl : defaultImg) + ')'}"></div>
                <div class="img" :style="{ backgroundImage: 'url(' + (cover?.length > 1 ? cover[1]?.fileUrl : defaultImg) + ')'}"></div>
                <div class="img" :style="{ backgroundImage: 'url(' + (cover?.length > 2 ? cover[2]?.fileUrl : defaultImg) + ')'}"></div>
            </div>
            <div class="view">{{ statistics?.viewCount || 0 }}阅读</div>
            <div class="publishtime">{{ statistics?.publishTime ? moment(statistics?.publishTime).format('YYYY-MM-DD') : (config?.publishTime ? moment(config?.publishTime).format('YYYY-MM-DD') : '未知时间') }}</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import moment from 'moment';
import IconVideoPlay from '@/assets/images/icon-play-mask.png';
import defaultImg from '@/assets/images/img-default.svg';

const props = defineProps({
    type: String,
    cover: { // 封面列表
        type: Array as () => { fileUrl: string; url: string }[],
        required: true,
        default: () => []
    },
    coverStyle: String,
    title: String,
    desc: String,
    statistics: Object,
    config: Object,
    block: Object,
    border: Boolean
})
</script>

<style lang="scss" scoped>
.cover-preview {
    .cover-body {
        width: 100%;
        border: 1px solid rgba(128, 128, 128, 0.1);
        border-radius: 4px;
        box-sizing: border-box;
        position: relative;
        min-height: 84px;

        .title,
        .desc,
        .cover,
        .view,
        .publishtime {
            position: absolute;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .cover {
            overflow: hidden;
            background-position: center center;
            background-repeat: no-repeat;
            background-size: cover;
            cursor: pointer;
            position: absolute;
            display: flex;
            justify-content: space-between;
            .img {
                width: 0;
                height: 100%;
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
                background-color: var(--el-color-info-light-8);
            }
            .img:nth-child(1){
                width: 100%;
            }
            .icon {
                width: 50px;
                height: 50px;
                position: absolute;
                left: calc(50% - 25px);
                top: calc(50% - 25px);
            }
        }
    }
}

.cover-body.default, .cover-body.theme-2 {
    display: flex;
    display: -webkit-flex;
    justify-content: space-between;
    height: 84px;

    .cover {
        height: 60px;
        width: 90px;
        right: 12px;
        top: 12px;
        border-radius: 4px;
    }

    .title {
        font-size: 16px;
        font-weight: 500;
        top: 10px;
        left: 12px;
        width: calc(100% - 120px);
    }

    .desc {
        font-size: 12px;
        opacity: 0.7;
        top: 32px;
        left: 12px;
        width: 127px;
    }

    .view {
        font-size: 12px;
        opacity: 0.7;
        bottom: 0;
        left: 12px;
        line-height: 30px;
    }

    .publishtime {
        font-size: 12px;
        opacity: 0.7;
        bottom: 0;
        right: 110px;
        line-height: 30px;
        text-align: right;
    }
}
.cover-body.theme-3 {
    height: 140px;
    .title {
        top: 8px;
        left: 12px;
        font-size: 16px;
    }
    .desc {
        display: none;
    }
    .cover {
        height: 60px;
        top: 42px;
        left: 12px;
        right: 12px;
        display: flex;
        justify-content: space-between;
        .img {
            width: 32% !important;
            height: 100%;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            background-color: var(--el-color-info-light-8);
        }
    }
    .view {
        left: 12px;
        bottom: 5px;
        font-size: 12px;
        opacity: 0.7;
    }
    .publishtime {
        right: 12px;
        bottom: 5px;
        font-size: 12px;
        opacity: 0.7;
    }
}
.cover-body.video {
    height: 234px;
    .cover {
        height: 160px;
        left: 12px;
        right: 12px;
        bottom: 30px;
        video {
            width: fit-content;
            height: 100%;
        }
    }
    .title {
        top: 6px;
        left: 12px;
        font-size: 16px;
    }
    .desc {
        display: none;
    }
    .view {
        left: 12px;
        bottom: 0;
        font-size: 12px;
        opacity: 0.7;
    }
    .publishtime {
        right: 12px;
        bottom: 0;
        font-size: 12px;
        opacity: 0.7;
    }
}
</style>