<template>
    <div class="doc-editor-wrapper">
        <div class="editor-head">
            <el-input v-model="cellData.name" class="input-title" type="textarea" autosize placeholder="请输入标题"
                @update:model-value="onTitleChange" @keyup.down="focusEditor"
                @keyup.enter="focusEditor" @keydown.enter.native="textareaKeydown" />
            <div class="info">
                <span class="time">{{ moment(cellData?.createTime).format('YYYY/MM/DD HH:mm') }}</span>
            </div>
        </div>
        <Markdown ref="mdRef" class="markdown-editor" v-model:text="cellData.data.text" @change="onCellUpdate" />
    </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue';
import Markdown from '../markdown/index.vue';
import moment from 'moment';

const props = defineProps({
    data: {
        type: Object,
        default: () => ({}),
    }
})
const emit = defineEmits(['update:data', 'change']);
const mdRef = ref(null);

const cellData = ref(props.data);
const cellCover = ref('');
const setCover = (cover) => {
    cellData.value.cover.unshift({
        image: cover,
        thumbnail: cover,
    });
    emit('update:data', cellData.value);
    emit('change', cellData.value);
}
const onTitleChange = (val) => {
    emit('update:data', cellData.value);
    emit('change', cellData.value);
}
const onCellUpdate = (data) => {
    console.log('cell update');
    emit('update:data', cellData.value);
    emit('change', cellData.value);
}

// 禁用textarea回车
const textareaKeydown = () => {
  let e = window.event || arguments[0];
  // console.log(e,e.keyCode)
  if (e.key == 'Enter' || e.code == 'Enter' || e.keyCode == 13) {
    e.returnValue = false;
    return false;
  }
}
// 聚焦到文本编辑器
const focusEditor = () => {
  if (mdRef.value) {
    mdRef.value.focus();
  }
}

watch(() => props.data, (val) => {
    cellData.value = val;
})
onMounted(() => {
    cellData.value = props.data;
})
</script>
<style lang="scss" scoped>
.doc-editor-wrapper {
    height: 100%;
    min-height: calc(100vh - 64px);
    max-width: 690px;
    margin: 0 auto;
    padding: 26px 0;
    display: flex;
    flex-direction: column;

    .editor-head {
        padding: 0 18px;

        input {
          border: none;
          box-shadow: none;
        }

        input:focus-visible {
          outline: none;
        }

        .el-input,
        .el-textarea {
          box-sizing: border-box;
          resize: none;
        }

        :deep(.el-textarea__inner) {
          resize: none;
          scrollbar-width: 0;

          ::-webkit-scrollbar {
            width: 0;
            height: 0;
          }
        }

        .input-title {
          font-size: 32px;
          color: var(--el-text-color-primary);
          font-weight: 800;
          margin-left: -10px;
          margin-right: -10px;

          :deep(.el-textarea__inner) {
            font-weight: 800;
            color: var(--el-text-color-primary);
            height: fit-content;
            box-sizing: border-box;
            box-shadow: none;
            background: transparent;
          }

          :deep(.el-textarea__inner:focus) {
            box-shadow: none;
          }
        }

        .input-desc {
          // font-size: 14px;
          margin-bottom: 8px;
          margin-left: -10px;
          margin-right: -10px;

          :deep(.el-textarea__inner) {
            // font-family: cursive;
            // width: fit-content;
            box-shadow: none;
            background: transparent;
          }
        }
    }

    .cover {
        width: 100%;
        padding-bottom: 60%;
        display: block;
        background-color: var(--bg-section-color);
        border: 1px solid var(--border-color-3);
        box-sizing: border-box;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        margin-bottom: 16px;
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
                object-fit: cover;
                border: none;
            }

            .cover-html {
                height: 100%;
                width: 100%;
            }
        }

        .cover-wrapper:hover img {
            -webkit-transform: scale(1.1);
            transform: scale(1.1);
        }

        .operation {
            position: absolute;
            bottom: 16px;
            right: 16px;
            z-index: 10;
            background-color: rgba(0, 0, 0, .8);
            padding: 2px;
            box-sizing: border-box;
            border-radius: 6px;
            visibility: hidden;

            .btn {
                color: var(--text-color-3);
            }

            .btn:hover {
                color: #fff;
            }
        }
    }

    .cover:hover .operation {
        visibility: visible;
    }

    .info {
        font-size: 12px;
        font-weight: 500;
        color: var(--el-text-color-secondary);
        display: flex;
        gap: 6px;
        border-bottom: 1px solid var(--el-border-color);
        padding-bottom: 6px;
    }

    .markdown-editor {
        flex-grow: 1;
        margin-left: -16px;
        margin-right: -16px;
        margin-top: 8px;
    }
}
</style>