<template>
    <div :class="['panel-wrapper', scene, { 'full': full }]">
        <div class="panel-head">
            <div class="title">{{ name }}</div>
            <div v-if="desc" class="desc">{{ desc }}</div>
        </div>
        <div class="panel-content">
            <slot></slot>
        </div>
    </div>
</template>
<script setup>

const props = defineProps({
    name: {
        type: String,
        default: ''
    },
    desc: String,
    scene: String,
    full: Boolean,
})
</script>
<style lang="scss" scoped>
.panel-wrapper {
    height: 100%;
    .panel-head {
        margin-bottom: 8px;
        .title {
            font-size: 16px;
            font-weight: 800;
            color: var(--el-text-color-primary);
        }
        .desc {
            font-size: 12px;
            font-weight: 500;
            color: var(--el-text-color-secondary);
            margin-top: 4px;
        }
    }
    .panel-content {
        :deep(.item) {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 4px;
            min-height: 40px;

            &:last-child {
                margin-bottom: 0;
            }

            .label {
                font-size: 13px;
                font-weight: 500;
                color: var(--el-text-color-secondary);
                white-space: nowrap;
            }

            .value {
                font-size: 13px;
                font-weight: 500;
                color: var(--el-text-color-primary);
                width: 120px;
                text-align: right;
            }
        }
        :deep(.el-collapse) {
            .el-collapse-item__wrap, .el-collapse-item__header {
                background-color: transparent;
            }
        }
    }
}
.panel-wrapper.opbar {
    max-height: calc(100vh - 70px);
    overflow-x: hidden;
    overflow-y: auto;
}
.panel-wrapper.opbar::-webkit-scrollbar {
    display: none;
}
.panel-wrapper.full {
    display: flex;
    flex-direction: column;
    .panel-content {
        flex-grow: 1;
        overflow: hidden;
    }
}
</style>