<template>
    <div class="editor">
        <div class="markdown-preview" id="markdown-editor"></div>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch, defineExpose } from 'vue';
import Vditor from 'vditor';
import './vditor.css';

const props = defineProps({
    text: String,
    placeholder: {
        type: String,
        default: '请输入内容'
    }
})
const emit = defineEmits(['update:text', 'change', 'ready', 'continue']);

const editorLoading = ref(false);
const vditor = ref(null);
let timer;
let lastCursorPosition;
let hasFired = false;

const initEditor = async () => {
    if (vditor.value) {
        vditor.value.setValue(props.text || '');
        return;
    }
    editorLoading.value = true;
    vditor.value = new Vditor('markdown-editor', {
        cache: {
            enable: false,
        },
        mode: 'wysiwyg',
        toolbar: ['emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|', 'list', 'ordered-list', 'check', '|', 'quote', 'line', 'code', 'inline-code', 'table', '|', 'undo', 'redo', '|', 'preview', 'outline', 'export'],
        toolbarConfig: {
            hide: true
        },
        preview: {
            hljs: {
                style: 'dracula'
            }
        },
        height: '100%',
        placeholder: props.placeholder,
        counter: {
            enable: false
        },
        after: () => {
            emit('ready', vditor.value);
            vditor.value.setValue(props.text || '');
            editorLoading.value = false;
            watch(() => props.text, (value) => {
                if (value !== vditor.value.getValue()) {
                    vditor.value?.setValue(value || '');
                }
            })
            // vditor.value?.focus();
            // console.log('vditor', vditor.value)
        },
        input: (value) => {
            if (value !== props.text) {
                emit('update:text', value);
                emit('change', value);
            }
            handleInput();
        },
        focus: () => {
            console.log('focus');
            listenMouseClick();
            vditor.value.vditor.element.addEventListener('mouseup', listenMouseClick);
            vditor.value.vditor.element.addEventListener('keyup', listenArrowKey);
        },
        blur: () => {
            console.log('blur');
            vditor.value?.vditor?.element?.removeEventListener('mouseup', listenMouseClick);
            vditor.value?.vditor?.element?.removeEventListener('keyup', listenArrowKey);
        }
    });
}
function listenMouseClick() {
    console.log('鼠标点击')
    const isAtEnd = isAtEndOfParagraphOrDocument();
    console.log('光标是否在末尾', isAtEnd);
    if (isAtEnd) {
        const context = getContext();
        emit('continue', context);
    }
}
function listenArrowKey(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        console.log('监听方向键', e.key)
        const isAtEnd = isAtEndOfParagraphOrDocument();
        if (isAtEnd) {
            const context = getContext();
            emit('continue', context);
        }
    }
}
// 获取光标在整个文本中的位置（包含换行符）
function getAccurateCursorPosition() {
    const preElement = vditor.value.vditor.element.querySelector('.vditor-reset');
    if (!preElement) return 0;

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;

    let cursorPosition = 0;
    const stack = [preElement];

    while (stack.length > 0) {
        const node = stack.pop();
        if (node === startContainer) {
            if (node.nodeType === Node.TEXT_NODE) {
                cursorPosition += node.textContent.slice(0, startOffset).length;
            }
            break;
        }
        if (node.nodeType === Node.TEXT_NODE) {
            cursorPosition += node.textContent.length;
        } else {
            const children = Array.from(node.childNodes).reverse();
            stack.push(...children);
        }
    }
    return cursorPosition;
}

// 判断光标是否在段落末尾或文章末尾
function isAtEndOfParagraphOrDocument() {
    const content = vditor.value.getValue();
    const cursorIndex = getAccurateCursorPosition();

    // 处理文章末尾情况
    const trimmedContent = content.trimEnd();
    if (cursorIndex === trimmedContent.length) {
        console.log('光标在文章最末尾');
        return true;
    }

    // 处理段落末尾情况
    if (cursorIndex > 0 && cursorIndex < content.length) {
        const prevChar = content[cursorIndex - 1];
        const nextChar = content[cursorIndex];
        if (!/\s/.test(prevChar) && nextChar === '\n') {
            console.log('光标在段落末尾');
            return true;
        }
    }
    return false;
}

// 获取光标前后文
function getContext() {
    const content = vditor.value.getValue();
    const cursorIndex = getAccurateCursorPosition();
    const beforeCursor = content.slice(0, cursorIndex);
    const afterCursor = content.slice(cursorIndex);
    return {
        before: beforeCursor,
        after: afterCursor,
        index: cursorIndex
    };
}

// 处理光标移动和输入事件
function handleInput() {
    const isAtEnd = isAtEndOfParagraphOrDocument();
    console.log('光标是否在末尾', isAtEnd);
}

function focus() {
    vditor.value?.focus();
}
function blur() {
    vditor.value?.blur();
}

onMounted(() => {
    initEditor();
    console.log('markdown monuted')
})
onUnmounted(() => {
    vditor.value?.destroy();
    vditor.value?.vditor?.element?.removeEventListener('mouseup', listenMouseClick);
    vditor.value?.vditor?.element?.removeEventListener('keyup', listenArrowKey);
})
defineExpose({
    focus,
    blur,
})
</script>