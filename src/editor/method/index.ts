import Bus from '@/utils/bus';
import store from "@/store";
import { v4 as uuidv4 } from "uuid";

const envVar = import.meta.env.VITE_ENV_VAR;

export class Editor {
    static changeItemType = (item: any) => {
        
    }
    // 选中Block, index是该block在content中的索引
    static selectBlock = (id) => {
        
    };
    // 取消选中Block
    static unselectBlock = () => {
        
    };
    // 清除所选块内容
    static clearSelectedBlock = (id) => {
        
    };

    // 将项目数据从一维结构转向树状结构
    static toMap = (data) => {
        if (!data?.cid) return null;
        let map: any = JSON.parse(JSON.stringify(data));
        const children = buildTree(map?.data?.blocks, map.cid);
        map.children = children;
        console.log("doing...", map.children, map?.data?.blocks);
        setTimeout(() => {
            console.log("done", children, map.children);
        }, 1000);
        return map;
    };
    // 将项目数据从树状结构转成一维结构
    static toFlat = (data) => {
        if (!data?.cid) return null;
        let da = JSON.parse(JSON.stringify(data));
        let flat = flatten(da);
        data.dataStructure = flat;
        return data;
    };

    // 切换文档类型
    static switchType = (type) => {
        
    };
}

// 数据升维（从一维变成树状结构）
export const buildTree = (data, rootId) => {
    if (!data || !rootId) return [];
    const map = new Map();
    const roots: any = [];

    for (const node of data) {
        node.children = [];
        map.set(node.cid, node);
        if (node?.parent === rootId) {
            roots.push(node);
        } else {
            const parent = map.get(node?.parent);
            if (parent) parent.children.push(node);
        }
    }
    return roots;
};

// 数据降维（从树状结构折叠为一维流）
export const flatten = (data) => {
    if (!data) return [];
    const result: any = [];
    const stack = [...data.children];
    while (stack.length) {
        const node = stack.pop();
        result.push(node);
        if (node.children) {
            stack.push(...node.children);
        }
    }
    return result;
};