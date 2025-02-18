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
const emit = defineEmits(['update:text', 'change', 'ready']);

const editorLoading = ref(false);
const vditor = ref(null);
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
        },
        input: (value) => {
            if (value !== props.text) {
                emit('update:text', value);
                emit('change', value);
            }
        }
    });
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
})
defineExpose({
    focus,
    blur,
})
</script>