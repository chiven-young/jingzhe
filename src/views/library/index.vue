<template>
    <div class="page-container">
        <div class="head no-select">
            <div class="breadcrumb">
                <span class="title" @click="onSelectBreadcrumb(null)">{{ pageTitle }}</span>
                <span v-for="(item, index) in store.state.breadcrumbs" :key="index" class="breadcrumb-item" @click="onSelectBreadcrumb(item)">{{ item.name }}</span>
            </div>
            <div class="operate btn-group">
                <span class="btn square quaternary" v-for="item in showTypeOptions" :key="item.value"
                    :class="{ btn: true, active: showType === item.value }" size="small" text :title="item.label"
                    @click="changeShowType(item.value)">
                    <Icon :icon="item.icon" size="16" />
                </span>
            </div>
        </div>
        <libraryBody class="library" :showType="showType" :cellType="libraryParams.type" :libraryParams="libraryParams" :breakpoints="breakpoints" />
    </div>
</template>
<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import libraryBody from './main.vue';
import { useRoute, useRouter } from 'vue-router';
import { itemMenu } from '@/config/options';
import store from '@/store';
import zApi from '@/core';

const route = useRoute();
const router = useRouter();

const showType = ref('grid');
const changeShowType = (val) => {
    showType.value = val;
}
const showTypeOptions = [
    {
        label: '网格',
        value: 'grid',
        icon: 'GridViewOutlined'
    },
    {
        label: '列表',
        value: 'list',
        icon: 'FormatListBulletedRound'
    },
]
const breakpoints = {
  768: {
    rowPerView: 3,
  },
  600: {
    rowPerView: 2,
  },
  372: {
    rowPerView: 1,
  },
}
const pageTitle = ref('我的文档');
// 当选择了一个面包屑，则只保留此及之前的面包屑
const onSelectBreadcrumb = (item) => {
    if (!item) {
        store.state.breadcrumbs = [];
    }
    const index = store.state.breadcrumbs.findIndex(i => i.cid === item.cid);
    store.state.breadcrumbs = store.state.breadcrumbs.slice(0, index + 1);
    const breadcrumbs = store.state.breadcrumbs.map(item => item.cid);
    router.push({
        path: `/library/${route.params.page}/${breadcrumbs.join('/')}`,
    });
}

const libraryParams = reactive({
    page: '',
    breadcrumbs: [],
})

const getLibraryParams = async () => {
    libraryParams.page = route.params.page;
    const cids = route.params.breadcrumbs || [];
    if (cids.length) {
        const res = await zApi.cells.getCells({ cids: cids });
        const list = res.data.list;
        let breadcrumbs = [];
        for (const each of cids) {
            const item = list.find(i => i.cid === each);
            if (item) {
                breadcrumbs.push(item);
            }
        }
        libraryParams.breadcrumbs = breadcrumbs;
        store.state.breadcrumbs = breadcrumbs;
    } else {
        libraryParams.breadcrumbs = [];
        store.state.breadcrumbs = [];
    }
}
// 监听路由，每次修改路由都重新获取一次数据(因为进入page页后，可能会根据id获取子细胞数据，此时路由id会改变，可借此更新数据)
watch(() => router.currentRoute.value, (newValue, oldValue) => {
    getLibraryParams();
    const menu = itemMenu.find(item => item.value.includes(route.params.page));
    if (menu) {
        pageTitle.value = menu?.label;
    }
}, { immediate: true })

onMounted(() => {
    getLibraryParams();
})
</script>
<style lang="scss" scoped>
.page-container {
    padding: 16px 10px 0 10px;
    box-sizing: border-box;
    height: 100%;

    .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding: 0 20px;

        .title {
            font-size: 20px;
            font-weight: 800;
            cursor: pointer;
        }
        .breadcrumb {
            display: flex;
            align-items: center;
            font-size: 20px;
            .breadcrumb-item {
                margin-left: 10px;
                color: var(--el-text-color-secondary);
                cursor: pointer;
            }
            .breadcrumb-item:hover {
                color: var(--el-text-color-primary);
            }
            .breadcrumb-item::before {
                content: '/';
                margin-right: 10px;
            }
        }
    }
    .operate {
        .btn {
            color: var(--el-text-color-secondary);
        }
        .btn.active {
            color: var(--el-text-color-primary);
        }
    }
    .library {
        height: calc(100% - 46px);
    }
}</style>