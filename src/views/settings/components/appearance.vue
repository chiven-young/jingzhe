<template>
    <div class="settings-content">
        <div class="section">
            <div class="section-content">
                <div class="themes">
                    <div v-for="theme in themes" :key="theme.name" @click="jingApi.config.setTheme(theme.value)"
                        class="theme">
                        <div class="preview"
                            :class="[theme.value, { 'active': store.state.workspace?.appearance?.theme === theme.preview }]">

                        </div>
                        <div class="name">{{ theme.name }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="section">
            <div class="section-title">主题颜色</div>
            <div class="section-content">
                <div class="colors">
                    <div v-for="color in primaryColors" :key="color.name"
                        :class="{ 'active': store.state.workspace?.appearance?.primaryColor === color.value }"
                        @click="jingApi.config.setPrimaryColor(color.value)" class="color"
                        :style="{ background: color.value, borderColor: color.value }">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import store from '@/store';
import jingApi from '@/core';

const themes = [
    // {
    //     name: '跟随系统',
    //     value: 'system',
    //     preview: 'system'
    // },
    {
        name: '浅色',
        value: 'light',
        preview: 'light'
    },
    {
        name: '暗色',
        value: 'dark',
        preview: 'dark'
    },
]

const primaryColors = [
    {
        name: 'blue',
        value: '#007aff'
    },
    {
        name: '',
        value: '#4dd0ff'
    },
    {
        name: 'green',
        value: '#4dffdd'
    },
    {
        name: 'yellow',
        value: '#FFC300'
    },
    {
        name: 'purple',
        value: '#bf8bff'
    },
    {
        name: 'pink',
        value: '#ff6ad1'
    },
    {
        name: 'red',
        value: '#FF5F6B'
    },
]
</script>
<style lang="scss" scoped>
.themes {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));

    .theme {
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        .preview {
            border-radius: 8px;
            border: 1px solid var(--border-color-2);
            width: 100%;
            height: 100px;
        }

        .preview.system {
            background-color: var(--bg-app-color);
        }

        .preview.light {
            background-color: #F7F7F7;
        }

        .preview.dark {
            background-color: #191919;
        }

        .name {
            margin-top: 10px;
            font-size: 12px;
        }
    }
}

.colors {
    margin-top: 10px;

    .color {
        border-radius: 50%;
        border: 1px solid var(--border-color-2);
        width: 30px;
        height: 30px;
        display: inline-block;
        margin-right: 12px;
        cursor: pointer;
    }
}
</style>