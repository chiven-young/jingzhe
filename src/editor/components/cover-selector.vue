<template>
    <div class="cover-selector">
        <el-popover
            placement="bottom"
            :width="500"
            trigger="click"
        >
            <template #reference>
                <slot></slot>
            </template>
            <div class="cover-selector-content">
                <!-- <el-radio-group v-if="type !== 'video'" class="cover-options" v-model="coverStyle" @change="onCoverStyleChange">
                    <el-radio label="2">单图</el-radio>
                    <el-radio label="3">三图</el-radio>
                </el-radio-group> -->
                <el-tabs v-model="tabsActiveName" class="tabs" @tab-change="onTabChange">
                    <el-tab-pane label="图片链接" name="online">
                        <el-input
                        v-model="coverUrl"
                        placeholder="https://"
                        class="input-with-select"
                        clearable
                        >
                            <template #append>
                                <el-button @click="submitImgByUrl">添加</el-button>
                            </template>
                        </el-input>
                    </el-tab-pane>
                    <el-tab-pane label="上传图片" name="upload">
                        <!-- <Upload :list="covers" fileType="image" cloud @uploaded="onUploaded" /> -->
                    </el-tab-pane>
                    <el-tab-pane label="从素材库添加" name="library">
                        <el-skeleton v-if="state.tptLoading" class="skeleton" :rows="5" animated />
                        <div v-else-if="state.tptImgs.length" class="list">
                            <div v-for="(item, index) in state.tptImgs" :key="index" class="img" @click="setCover(item?.data?.image)">
                                <img :src="item?.data?.image" />
                            </div>
                        </div>
                        <el-empty v-else :image="emptyReports" description="暂无图片" />
                        <div class="pagination">
                        <el-pagination v-model:current-page="paramsImages.page" v-model:page-size="paramsImages.pageSize"
                                small background layout="prev, pager, next" :total="state.tptImgsTotal" class="mt-4"
                                @current-change="getImagesFromLibrary" />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="Unsplash" name="unsplash">
                        <el-skeleton v-if="state.unsplashLoading" class="skeleton" :rows="5" animated />
                        <div v-else-if="state.unsplashImgs.length" class="list">
                            <div v-for="(item, index) in state.unsplashImgs" :key="index" class="img" @click="setCover(item?.urls?.regular)">
                                <img :src="item?.urls?.thumb" />
                            </div>
                        </div>
                        <el-empty v-else :image="emptyReports" description="暂无图片" />
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-popover>
    </div>
</template>
<script lang="ts" setup>
import { ref, computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, InfoFilled } from '@element-plus/icons-vue';
// import Upload from '@/components/upload.vue';
import emptyReports from '@/assets/images/empty-reports.png';
import { isItaipingDomain } from '@/utils/tools';
import zApi from '@/core';
import { getUnsplashList } from '@/core/modules/unsplash';

const coverList: any = ref([]); // 所有封面地址

const props = defineProps({
    list: { // 封面列表
        type: Array as () => { image: string }[],
        required: true,
        default: () => []
    },
    coverStyle: String,
    type: {
        type: String,
        default: 'article' // article, video
    }
})
const emit = defineEmits(['change', 'update:list', 'update:coverStyle']);
const state = reactive({
    tptImgs: [],
    tptImgsTotal: 0,
    tptLoading: false,
    unsplashImgs: [],
    unsplashTotal: 0,
    unsplashLoading: false,
})


const tabsActiveName = ref('upload');

// 封面列表
const covers = computed(()=> {
    coverList.value = props?.list || [];
    let newList: any = [];
    for(const each of coverList.value){
        let item: any = each || {};
        item.url = each?.fileUrl;
        if (item.url) {
            newList.push(item);
        }
    }
    if(newList.length > 3){
        newList.length = 3;
    }
    return newList
})
// 当封面样式更新
const onCoverStyleChange = (val)=> {
    emit('update:coverStyle', val)
}

const coverUrl: any = ref('');
const submitImgByUrl = ()=> {
    if(!coverUrl.value){
        ElMessage.warning('请输入有效图片链接地址')
        return
    }
    setCover(coverUrl.value);
}

// 将图片设为封面
const setCover = (url)=> {
    let img = {
        fileType: '1',
        filePurposes: '2',
        fileUrl: url,
        image: url,
    }
    coverList.value.unshift(img);
    if(coverList.value.length > 3){
        coverList.value.length = 3;
    }
    emit('change', coverList.value);
    emit('update:list', coverList.value);
}
// 选择图片作为主封面
const setMainCover = (index)=> {
    const img: any = coverList.value[index] || {};
    coverList.value.splice(index, 1);
    coverList.value.unshift(img);
    emit('change', coverList.value);
}
// 删除封面图
const removeImg = (index)=> {
    console.log(index,coverList.value)
    coverList.value.splice(index, 1);
    console.log(index,coverList.value)
    emit('change', coverList.value);
}

// 当上传成功
const onUploaded = (file)=> {
    console.log('封面上传成功',file);
    const url = file;
    setCover(url);
}

const paramsImages = reactive({
    type: 'image',
    status: 'material',
    page: 1,
    pageSize: 8
})
const getImagesFromLibrary = async ()=> {
    state.tptLoading = true;
    let res:any = {};
    try {
        res = await zApi.cells.getCells(paramsImages);
    } catch (e) { }
    state.tptImgsTotal = res?.data?.total || 0;
    const list = res?.data?.list || [];
    state.tptImgs = list;
    state.tptLoading = false;
}

const getUnsplashImgs = async ()=> {
    state.unsplashLoading = true;
    let res:any = {};
    try {
        res = await getUnsplashList();
    } catch (e) { }
    state.unsplashImgs = res || [];
    state.unsplashLoading = false;
}

const onTabChange = (tab)=> {
    console.log(tab)
    if(tab === 'library'){
        getImagesFromLibrary();
    } else if (tab === 'unsplash'){
        getUnsplashImgs();
    }
}

defineExpose({
    setCover,
})

</script>

<style lang="scss" scoped>
.cover-selector-content {
    .preview {
        overflow: hidden;
        margin-bottom: 12px;
        padding: 4px;
        border: 1px solid var(--el-border-color);
        .img {
            height: 300px;
            width: 100%;
            background-position: center center;
            background-repeat: no-repeat;
            background-size: contain;
        }
    }
    .cover-list {
        margin: 12px 0;
        border: 1px solid var(--el-border-color);
        min-height: 60px;
        display: grid;
        grid-template-columns: 80% 10% 10%;
        justify-content: space-between;
        .cover-item {
            height: 360px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 4px;
            position: relative;
            border: 1px solid var(--el-border-color);
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            background-color: var(--el-color-info-light-8);
            .mask {
                display: none;
                color: #FFFFFF;
                background-color: #00000060;
                height: 100%;
                width: 100%;
                align-items: center;
                justify-content: center;
                .operate {
                    align-items: center;
                    justify-content: center;
                    .xicon {
                        color: #FFFFFF;
                    }
                    .xicon:hover {
                        color: var(--el-color-primary);
                    }
                }
            }
        }
        .cover-item:hover {
            .mask {
                display: flex;
            }
        }
    }
    .cover-list.style3 {
        grid-template-columns: 33% 33% 33%;
    }
    .cover-list.video {
        grid-template-columns: 100%;
        .cover-item {
            display: none;
        }
        .cover-item:first-child {
            display: inline-flex;
        }
        .cover-item:hover {
            .mask {
                display: none;
            }
        }
    }
    .desc {
        font-size: 12px;
        opacity: 0.6;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
    }
    .tabs {
        .list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            grid-column-gap: 8px;
            grid-template-rows: repeat(auto-fill, minmax(60px, 1fr));
            grid-row-gap: 8px;
            margin-bottom: 16px;
            .img {
                border-radius: 4px;
                border: 1px solid var(--el-border-color-lighter);
                overflow: hidden;
                position: relative;
                height: 90px;
                cursor: pointer;
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
        }
        .pagination {
            display: flex;
            justify-content: flex-end;
            padding-top: 16px;
        }
    }
}
</style>