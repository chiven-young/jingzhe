<template>
    <div class="operations-bar">
        <div class="btns">
            <el-popover placement="right" :width="260" trigger="click" popper-class="popper-container">
                <template #reference>
                    <div class="btn square quaternary" title="插入">
                        <Icon class="icon" icon="AddRound" size="20" />
                    </div>
                </template>
                <Insert scene="opbar" />
            </el-popover>
            <el-popover placement="right" :width="260" trigger="click" popper-class="popper-container">
                <template #reference>
                    <div class="btn square quaternary" title="样式">
                        <Icon class="icon" icon="FontDownloadOutlined" size="20" />
                    </div>
                </template>
                <StyleVue v-if="data" :type="type" scene="opbar" />
            </el-popover>
            <el-popover placement="right" :width="260" trigger="click" popper-class="popper-container">
                <template #reference>
                    <div class="btn square quaternary" title="页面样式">
                        <Icon class="icon" icon="StyleOutlined" size="20" />
                    </div>
                </template>
                <PageStyle v-if="data" :type="type" scene="opbar" />
            </el-popover>
            <el-popover placement="right" :width="260" trigger="click" popper-class="popper-container">
                <template #reference>
                    <div class="btn square quaternary" title="页面信息">
                        <Icon class="icon" icon="InfoOutlined" size="20" />
                    </div>
                </template>
                <PageInfo v-if="data" :type="type" :data="data" scene="opbar" />
            </el-popover>
            <!-- <el-popover placement="right" :width="260" trigger="click" popper-class="popper-container">
                <template #reference>
                    <div class="btn square quaternary" title="动作">
                        <Icon class="icon" icon="KeyboardCommandKeyRound" size="20" />
                    </div>
                </template>
                <Actions :type="type" scene="opbar" />
            </el-popover> -->
        </div>
    </div>
</template>
<script setup>
import Insert from '../panel/insert.vue';
import StyleVue from '../panel/style.vue';
import PageStyle from '../panel/page-style.vue';
import PageInfo from '../panel/page-info.vue';
import Actions from '../panel/actions.vue';

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    data: Object,
})

</script>
<style lang="scss" scoped>
.operations-bar {
    width: 40px;
    background-color: var(--el-bg-color-layout);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    padding: 4px;
    box-sizing: border-box;
    text-align: center;
    .btns {
        .btn {
            width: 32px;
            height: 42px;
            border-radius: 5px;
            margin-bottom: 2px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            .icon {
                font-size: 18px;
                color: var(--el-text-color-regular);
            }
        }
        .btn:hover {
            background-color: var(--el-color-primary-light-9);
        }
        .btn:last-child {
            margin-bottom: 0;
        }
    }
}
</style>