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
        <div v-if="zApi.env.isTauri" class="section">
            <div class="label">服务号后管token</div>
            <el-input v-model="serviceToken" type="textarea" show-word-limit placeholder="eyJ0eXAiO..." />
            <el-button type="primary" @click="setServiceToken">保存</el-button>
        </div>
        <div v-else class="section">
            <el-button @click="goToLogin">跳转登录</el-button>
            <div class="text-s">[ ! ] 请点击按钮跳转登录后，返回此页面并刷新。</div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import store from '@/store';
import zApi from '@/core';
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus';

const staticBaseUrl = import.meta.env.VITE_STATIC_BASE_URL;
const goToLogin = () => {
    window.open(`${staticBaseUrl}/static/platform/#/login`, '_blank');
}

const serviceToken = ref('');
const setServiceToken = () => {
    if(zApi.env.isTauri) {
        localStorage.setItem('serviceToken', serviceToken.value);
    } else {
        Cookies.set('TPTTOKEN', serviceToken.value, { path: '/', secure: false, sameSite: 'Lax' });
    }
    zApi.user.getUserData();
    ElMessage.success('保存成功');
}
onMounted( async ()=> {
    serviceToken.value = localStorage.getItem('serviceToken');
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