<template>
    <div class="settings-content">
        <div class="user-info">
            <div class="avatar">
                <div class="img" :style="{ backgroundImage: 'url(' + store.state.workspace?.user?.avatar + ')' }"></div>
            </div>
            <div class="info">
                <div class="name">{{ store.state.workspace?.user?.name }}</div>
                <div class="desc">
                    <div class="text-s" v-html="store.state.workspace?.user?.description"></div>
                </div>
                <div class="info-item text-s">
                    <Icon icon="MailOutlineRound" size="14" />
                    {{ store.state.workspace?.user?.email || '-' }}
                </div>
                <div class="info-item text-s">
                    <Icon icon="PhoneAndroidRound" size="14" />
                    {{ store.state.workspace?.user?.phone || '-' }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import store from '@/store';
import zApi from '@/core';
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus';

onMounted( async ()=> {
    
})
</script>
<style lang="scss" scoped>
.settings-content {
    .user-info {
        margin-bottom: 20px;
        .avatar {
            margin-bottom: 12px;
            .img {
                height: 60px;
                width: 60px;
                border-radius: 12px;
                background-color: var(--el-color-info-light-9);
                border: 1px solid var(--el-border-color);
                box-sizing: border-box;
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
            }
        }
        .info {
            .name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 4px;
            }
            .info-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }
    }
    .text-s {
        font-size: 12px;
        color: var(--el-text-color-secondary);
    }
    .section {
        padding: 8px 0;
        border-top: 1px solid var(--el-border-color);
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
        .el-button {
            width: fit-content;
        }
    }
}
</style>