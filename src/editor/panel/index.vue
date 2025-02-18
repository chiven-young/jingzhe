<template>
    <div class="panel no-select">
        <div class="tabs">
            <div v-for="(tab, index) in tabs" :key="index" class="tab"
                :class="{ active: activeTab.value === tab.value }" @click="changeTab(tab)">
                <Icon class="icon" :icon="tab.icon" size="18" />
            </div>
        </div>
        <div v-if="data" class="content">
            <Insert v-if="activeTab?.value === 'insert'" :type="type" scene="panel" />
            <Style v-else-if="activeTab?.value === 'style'" :type="type" :data="data" scene="panel"></Style>
            <pageStyle v-else-if="activeTab?.value === 'pageStyle'" :type="type" :data="data" scene="panel"></pageStyle>
            <pageInfo v-else-if="activeTab?.value === 'info'" :type="type" :data="data" :workspace="store.state.workspace" scene="panel"></pageInfo>
            <AI v-else-if="activeTab?.value === 'ai'" :type="type" :data="data" scene="panel"></AI>
            <action v-else-if="activeTab?.value === 'action'" :type="type" scene="panel"></action>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import Insert from './insert.vue';
import Style from './style.vue';
import pageStyle from './page-style.vue';
import pageInfo from './page-info.vue';
import action from './actions.vue';
import AI from './ai.vue';
import store from '@/store';

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    data: Object,
})

const tabs = [
    {
        label: 'insert',
        value: 'insert',
        icon: 'AddRound'
    },
    {
        label: 'style',
        value: 'style',
        icon: 'ColorLensOutlined'
    },
    // {
    //     label: 'pageStyle',
    //     value: 'pageStyle',
    //     icon: 'StyleOutlined'
    // },
    {
        label: 'info',
        value: 'info',
        icon: 'InfoOutlined'
    },
    {
        label: 'ai',
        value: 'ai',
        icon: 'AssistantOutlined'
    },
    // {
    //     label: 'action',
    //     value: 'action',
    //     icon: 'KeyboardCommandKeyRound'
    // }
]
const activeTab = ref(tabs[3]);
const changeTab = (tab) => {
    activeTab.value = tab;
}

</script>

<style lang="scss" scoped>
.panel {
    height: 100%;
    width: 260px;
    display: flex;
    flex-direction: column;
    position: relative;

    .tabs {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;

        .tab {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            box-sizing: border-box;
            color: var(--el-text-color-regular);
            border-bottom: 1px solid var(--el-border-color-light);
            cursor: pointer;

            &:hover {
                background-color: var(--el-bg-color-page);
            }

            &.active {
                color: var(--el-text-color-primary);
                border-bottom: 2px solid var(--el-text-color-primary);
            }
        }
    }

    .content {
        flex-grow: 1;
        overflow-y: scroll;
        padding: 16px;
    }
}
</style>