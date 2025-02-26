<template>
    <div class="settings-content">
        <div class="section">
            <div class="section-content">
                <div class="app-info">
                    <div class="logo">
                        <img src="@/assets/img/logo.png" />
                    </div>
                    <div class="info">
                        <div class="app-name">惊蛰</div>
                        <div class="app-version">Version 1.0.0</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import store from '@/store';

onMounted( async ()=> {
    console.log('config', store.state.workspace)
})
</script>
<style lang="scss" scoped>
.settings-content {
    .app-info {
        display: flex;
        align-items: center;
        gap: 10px;

        .logo {
            width: 80px;
            height: 80px;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .info {
            .app-name {
                font-size: 16px;
                font-weight: bold;
                color: var(--text-color-2);
            }

            .app-version {
                font-size: 12px;
                color: var(--text-color-3);
            }
        }
    }
}
</style>