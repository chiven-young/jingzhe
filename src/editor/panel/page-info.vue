<template>
    <Wrapper name="页面信息" :scene="scene">
        <el-collapse v-model="activeNames">
            <el-collapse-item title="标签" name="3">
                <div class="item">
                    <div class="label">内容标签</div>
                    <div class="value">-</div>
                </div>
            </el-collapse-item>
            <el-collapse-item title="统计" name="4">
                <div class="item">
                    <div class="label">创建时间</div>
                    <div class="value">{{ data?.createTime ? moment(data.createTime).format('YYYY/MM/DD HH:mm') : '-' }}</div>
                </div>
                <div class="item">
                    <div class="label">最后更新</div>
                    <div class="value">{{ data?.updateTime ? moment(data.updateTime).format('YYYY/MM/DD HH:mm') : '-' }}</div>
                </div>
            </el-collapse-item>
            <el-collapse-item title="code" name="5">
                <pre>
                    <code>{{ data }}</code>
                </pre>
            </el-collapse-item>
        </el-collapse>
    </Wrapper>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import Wrapper from './wrapper.vue';
import moment from 'moment';

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    data: Object,
    workspace: Object,
    scene: String,
})
const emit = defineEmits(['update'])

const activeNames = ref(['1', '2', '3', '4']);
const itemData = ref(props.data);


onMounted(() => {
    
})
</script>
<style lang="scss" scoped>

</style>