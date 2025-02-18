<template>
    <div class="action-bar no-select" :class="[osType]">
        <span class="action-bar_btn close" @click="handleCloseWin"></span>

        <span v-if="state.minimized" class="action-bar_btn minimize"></span>
        <span v-else class="action-bar_btn minimize" @click="minimize"></span>

        <span v-if="state.maximized" class="action-bar_btn maximize" @click="unmaximize"></span>
        <span v-else class="action-bar_btn maximize" @click="maximize"></span>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import zApi from '@/core';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { getCurrentWindow } from '@tauri-apps/api/window';

const props = defineProps({
    osType: String
})
const state = reactive({
    maximized: false,
    minimizable: false,
    minimized: false,
    resizable: false
})
const getWindowState = async () => {
    state.maximized = await getCurrentWindow().isMaximized();
    state.minimizable = await getCurrentWindow().isMinimizable();
    state.minimized = await getCurrentWindow().isMinimized();
    state.resizable = await getCurrentWindow().isResizable();
}
const minimize = async () => {
  await getCurrentWindow().minimize();
  getWindowState();
};
const maximize = async () => {
  await getCurrentWindow().maximize();
  getWindowState();
};
const unmaximize = async () => {
  await getCurrentWindow().unmaximize();
  getWindowState();
};
const close = async () => {
  await getCurrentWindow().close();
  getWindowState();
}
/** 处理关闭窗口事件 */
const handleCloseWin = async () => {
    // 如果有未保存的数据，要先提醒
    // await nextTick(() => {
    //     appWindow.hide()
    // })
    close()
}

onMounted(() => {
  getWindowState();
})
</script>
<style lang="scss" scoped>
.action-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 4px 8px;
    box-sizing: border-box;
    &_btn {
        display: inline-block;
        width: 13px;
        height: 13px;
        border: 1px solid rgba(0,0,0,0.2);
        border-radius: 50%;
        box-sizing: border-box;
        cursor: pointer;
    }
    .close {
        background-color: #FF5F57;
    }
    .minimize {
        background-color: #FEBC2E;
    }
    .maximize {
        background-color: #28C840;
    }
}
</style>