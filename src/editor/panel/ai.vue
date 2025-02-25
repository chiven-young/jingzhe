<template>
    <Wrapper name="AI助手" :scene="scene">
        <div class="content">
            <div class="answer">
                <div class="think-box">
                    <div class="box-head">深度思考</div>
                    <div id="think-output"></div>
                </div>
                <div id="content-output" class="markdown-preview"></div>
                <!-- <div id="output" class="markdown-preview"></div> -->
                <!-- <span class="text">{{ generatedText }}</span> -->
            </div>
            <div class="input-box">
                <el-input v-model="inputPrompt" type="textarea" autosize resize="none" placeholder="请尽管问我" @keyup.down="generate" @keyup.enter="generate" @keydown.enter.native="textareaKeydown" />
            </div>
        </div>
    </Wrapper>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import Wrapper from './wrapper.vue';
import AI from '@/AI';
import store from '@/store';

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    scene: String,
})

// 禁用textarea回车
const textareaKeydown = () => {
  let e = window.event || arguments[0];
  // console.log(e,e.keyCode)
  if (e.key == 'Enter' || e.code == 'Enter' || e.keyCode == 13) {
    e.returnValue = false;
    return false;
  }
}
const inputPrompt = ref('写首诗');
const generatedText = ref('');
const generate = async () => {
    generatedText.value = '';

    const messages = [
        { role: 'user', content: inputPrompt.value + '\n。使用Markdown格式返回结果' }
    ];
    AI.renderChat({
        model: store.state.currentAIModel,
        messages: messages,
        thinkOutputId: 'think-output',
        contentOutputId: 'content-output',
    }, (res) => {
        console.log('渲染完毕，完整文本：',res)
    })
}

onMounted(() => {
    
})
</script>
<style lang="scss" scoped>
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    .answer {
        flex-grow: 1;
        overflow-y: auto;
        overflow-x: hidden;
        width: 100%;
        .markdown-preview {
            width: 100%;
        }
        .think-box {
            border: 1px solid var(--border-color-3);
            border-radius: 8px;
            margin-bottom: 8px;
            overflow: hidden;
            .box-head {
                padding: 0 8px;
                box-sizing: border-box;
                color: var(--text-color-2);
                background-color: var(--bg-item-color);
                font-size: 12px;
            }
        }
        #think-output {
            font-size: 12px;
            color: var(--text-color-3);
            padding: 4px 8px;
            box-sizing: border-box;
        }
        .text {
            font-size: 14px;
            line-height: 1.5;
        }
    }
    .input-box {
        width: 100%;
        max-width: 600px;
    }
}
</style>