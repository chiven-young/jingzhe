import { createApp, createVNode } from 'vue'
import App from './App.vue'
import router from "./router";
import ElementPlus from "element-plus";
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './style/main.scss';
import './style/dark.scss';
import './style/markdown.scss';
import * as Icons from '@vicons/material';
import store from "./store";
import i18n from './i18n'
import zApi from './core';

const app = createApp(App);
app.use(router);
app.use(store);
app.use(ElementPlus);
app.use(i18n);
app.mount("#app");

// 创建Icon组件
const Icon = (props: { icon: string, size: string, color: string }) => {
    const { icon, size, color } = props;
    const IconComponent = Icons[icon as keyof typeof Icons];
    const iconStyle = {
        fontSize: size ? (size.endsWith('px') ? size : `${size}px`) : '16px',
        width: size ? (size.endsWith('px') ? size : `${size}px`) : '16px',
        height: size ? (size.endsWith('px') ? size : `${size}px`) : '16px',
        color: color
    };
    return createVNode(IconComponent, { style: iconStyle });
}
// 注册Icon组件
app.component('Icon', Icon)

import { appConfig } from './config/index';
zApi.workspace.init(appConfig);